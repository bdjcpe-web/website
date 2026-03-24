import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());

        if (!session || !session.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
            return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
        }

        const body = await req.json();
        const email = body.email?.toLowerCase().trim();

        if (!email || !email.includes('@cpe.fr')) {
            return NextResponse.json({ error: 'Adresse email CPE invalide.' }, { status: 400 });
        }

        // 1. On cherche si l'étudiant a déjà un compte
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            // Il a un compte ! On le passe membre direct.
            if (existingUser.isMember) {
                return NextResponse.json({ message: 'Cet utilisateur a déjà un compte et est déjà membre.' });
            }

            await prisma.user.update({
                where: { email },
                data: { isMember: true }
            });
            return NextResponse.json({ message: 'Compte existant mis à jour ! Il est maintenant membre.' });
        }

        // 2. Il n'a pas de compte : on le met dans la salle d'attente
        await prisma.pendingMember.upsert({
            where: { email },
            update: {}, // S'il y est déjà, on ne fait rien
            create: { email }
        });

        return NextResponse.json({ message: 'Email ajouté à la liste d\'attente. Il sera membre à sa première connexion.' });

    } catch (error) {
        console.error('Erreur add-member:', error);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}