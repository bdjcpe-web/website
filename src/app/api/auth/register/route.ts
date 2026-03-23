import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, filiere, registeredYear } = await req.json();

    if (!email || !password || !firstName || !lastName || !filiere || !registeredYear) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith('@cpe.fr')) {
      return NextResponse.json({ error: 'Adresse email non autorisée (@cpe.fr requis).' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'Un compte validé existe déjà avec cette adresse email.' }, { status: 409 });
      } else {
        const ageMs = Date.now() - existingUser.createdAt.getTime();
        if (ageMs > 5 * 60 * 1000) {
          // Plus de 5 min : on supprime la tentative erronée/expirée pour le laisser réessayer
          await prisma.user.delete({ where: { email } });
        } else {
          // Moins de 5 min : on bloque le spam
          return NextResponse.json({ error: "Un e-mail de validation a déjà été envoyé. Attends 5 minutes pour recommencer si tu ne l'as pas reçu." }, { status: 429 });
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Check if this email is already in the Google Sheets member list
    let isMember = false;
    const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;
    if (sheetUrl && sheetUrl.startsWith('http')) {
      try {
        const sheetRes = await fetch(sheetUrl, { cache: 'no-store' });
        if (sheetRes.ok) {
          const csvText = await sheetRes.text();
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const memberEmails = Array.from(csvText.matchAll(emailRegex)).map(m => m[0].toLowerCase());
          if (memberEmails.includes(email.toLowerCase())) {
            isMember = true;
          }
        }
      } catch (e) {
        console.warn('[Membership Check] Impossible de contacter Google Sheets:', e);
      }
    }

    // @ts-ignore – filiere and registeredYear are in the schema; client regenerates on next build
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        verificationToken,
        isMember,
        filiere,
        registeredYear: parseInt(registeredYear),
      },
    });

    const activationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verify?token=${verificationToken}`;

    // Configurations Nodemailer pour envoi de vrai mail
    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER, // Exemple: bdj.cpe@gmail.com
        pass: process.env.SMTP_PASSWORD // Mot de passe d'application Google
      }
    });

    // Code HTML de l'email automatique (Design BDJ CPE)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
        <div style="background-color: #6d0c24; padding: 20px; text-align: center;">
          <h1 style="color: #e1b82f; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">BDJ CPE Lyon</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="margin-top: 0;">Bienvenue au Bureau des Jeux, ${firstName} ! 🎮</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #e5e7eb;">
            Ton compte a bien été créé.<br><br>
            Afin de vérifier que tu es bien un(e) étudiant(e) de l'école et pour débloquer l'accès à tes réservations pour le local, merci de confirmer ton adresse e-mail en cliquant sur le bouton ci-dessous :
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${activationLink}" style="background-color: #e1b82f; color: #111; text-decoration: none; padding: 15px 30px; font-weight: bold; border-radius: 8px; font-size: 16px; display: inline-block;">Activer mon compte</a>
          </div>
          <p style="font-size: 13px; color: #9ca3af; text-align: center;">
            Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.
          </p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        await transporter.sendMail({
          from: '"Bureau des Jeux CPE" <' + process.env.SMTP_USER + '>',
          to: email,
          subject: "🎮 BDJ CPE - Active ton compte étudiant",
          html: emailHtml,
        });
        console.log(`[Email Envoyé] Mail d'activation envoyé avec succès à ${email}`);
      } else {
        console.warn(`[Avertissement] Les variables d'environnement SMTP_USER et SMTP_PASSWORD ne sont pas définies !`);
        console.log(`[Fallback Dev] Lien d'activation: ${activationLink}`);
      }
    } catch (mailError) {
      console.error("Erreur lors de l'envoi de l'e-mail :", mailError);
      // On ne bloque pas l'inscription si l'email rate, mais on prévient (dans un vrai cas on l'indiquerait)
    }

    return NextResponse.json({ message: "Compte créé avec succès ! Un lien d'activation vient d'être envoyé sur ton mail CPE." });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
  }
}
