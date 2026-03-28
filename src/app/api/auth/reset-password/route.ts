/**
 * @file src/app/api/auth/reset-password/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Server Component
 * @description API Route pour la gestion de la réinitialisation du mot de passe.
 * @requires
 * - 'next/server' : Pour la gestion des réponses HTTP.
 * - '@prisma/client' : Client Prisma pour l'accès à la base de données.
 * - 'bcryptjs' : Pour le hachage des mots de passe.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        console.log("1. Token reçu du frontend :", token);
        console.log("2. Date actuelle (serveur) :", new Date());

        if (!token || !password) {
            return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères.' }, { status: 400 });
        }

        // Chercher l'utilisateur qui a ce token exact
        const user = await prisma.user.findUnique({
            where: { resetToken: token },
        });

        // Vérifications de sécurité
        if (!user) {
            return NextResponse.json({ error: 'Jeton invalide.' }, { status: 400 });
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return NextResponse.json({ error: 'Le lien a expiré. Refais une demande.' }, { status: 400 });
        }

        // Hashage du nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Mise à jour de l'utilisateur ET suppression du jeton pour qu'il ne soit plus utilisable
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ message: 'Mot de passe mis à jour avec succès.' }, { status: 200 });

    } catch (error) {
        console.error('Erreur reset-password:', error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}