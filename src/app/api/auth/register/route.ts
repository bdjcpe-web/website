import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, buildBdjEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, filiere, registeredYear } = await req.json();

    // 1. Validations de base
    if (!email || !password || !firstName || !lastName || !filiere || !registeredYear) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith('@cpe.fr')) {
      return NextResponse.json({ error: 'Adresse email non autorisée (@cpe.fr requis).' }, { status: 403 });
    }

    // 2. Gestion des doublons et du spam (5 min)
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'Un compte validé existe déjà.' }, { status: 409 });
      } else {
        const ageMs = Date.now() - existingUser.createdAt.getTime();
        if (ageMs > 5 * 60 * 1000) {
          await prisma.user.delete({ where: { email: email.toLowerCase() } });
        } else {
          return NextResponse.json({ error: "E-mail déjà envoyé. Attends 5 min." }, { status: 429 });
        }
      }
    }

    // 3. Sécurité & Token
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Vérification automatique de la liste des membres (Google Sheets)
    let isMember = false;
    const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;
    if (sheetUrl?.startsWith('http')) {
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
        console.warn('[Membership Check] Erreur Google Sheets:', e);
      }
    }

    // 5. Création de l'utilisateur
    await prisma.user.create({
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

    // 6. Construction du lien et envoi (Utilisation du Helper)
    // On utilise soit l'URL du site en prod, soit localhost
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const activationLink = `${siteUrl}/api/verify?token=${verificationToken}`;

    const emailContent = `
      <p>Ton compte a bien été créé.<br><br>
      Afin de vérifier que tu es bien un(e) étudiant(e) de l'école et pour débloquer l'accès à tes réservations, merci de confirmer ton adresse e-mail :</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${activationLink}" style="background-color: #e1b82f; color: #111; text-decoration: none; padding: 15px 30px; font-weight: bold; border-radius: 8px; font-size: 16px; display: inline-block;">Activer mon compte</a>
      </div>
      <p style="font-size: 13px; color: #9ca3af; text-align: center;">Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.</p>
    `;

    const finalHtml = buildBdjEmail(`Bienvenue au Bureau des Jeux, ${firstName} ! 🎮`, emailContent);
    await sendEmail(email.toLowerCase(), "🎮 BDJ CPE - Active ton compte étudiant", finalHtml);

    return NextResponse.json({ message: "Compte créé avec succès ! Vérifie tes mails." });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}