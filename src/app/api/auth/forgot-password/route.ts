/**
 * @file src/app/api/auth/forgot-password/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Server Component
 * @description API Route pour la gestion de la réinitialisation du mot de passe.
 * @requires
 * - 'next/server' : Pour la gestion des réponses HTTP.
 * - '@prisma/client' : Client Prisma pour l'accès à la base de données.
 * - 'crypto' : Pour la génération de tokens sécurisés.
 */

// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail, buildBdjEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email requis.' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return NextResponse.json({ message: 'Demande prise en compte.' }, { status: 200 });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 2 * 3600000); // Valide 2 heures

        await prisma.user.update({
            where: { email: user.email },
            data: { resetToken, resetTokenExpiry },
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        /* ── Utilisation de la fonction d'envoi d'email ── */
        const emailContent = `
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour ton compte.</p>
            <p>Pas de panique, clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. <strong>Ce lien est valide pendant 1 heure.</strong></p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="background-color: #6d0c24; color: #fff; text-decoration: none; padding: 15px 30px; font-weight: bold; border-radius: 8px; font-size: 16px; display: inline-block;">Réinitialiser mon mot de passe</a>
            </div>
            <p style="font-size: 13px; color: #9ca3af; text-align: center;">Si tu n'as rien demandé, ignore simplement cet e-mail.</p>
    `;

        const finalHtml = buildBdjEmail(`Trou de mémoire ${user.firstName} ? 🔑`, emailContent);
        await sendEmail(user.email, "🔑 BDJ CPE - Réinitialisation de mot de passe", finalHtml);

        return NextResponse.json({ message: 'Demande prise en compte.' }, { status: 200 });

    } catch (error) {
        console.error('Erreur forgot-password:', error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}