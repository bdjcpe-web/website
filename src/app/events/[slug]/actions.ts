/**
 * @file src/app/events/[slug]/action.ts
 * @author Loann Cordel
 * @date 29/03/2026
 * @architecture Server Action
 * @description Actions pour la page d'événement HelloAsso
 * @requires @/lib/auth
 * @requires @/lib/prisma
 * @requires @/lib/helloasso
 */

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createCheckoutIntent } from '@/lib/helloasso';

export async function generatePaymentLink(formData: FormData) {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId || !userEmail) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { firstName: true, lastName: true }
    });

    const userFirstName = dbUser?.firstName || "Étudiant";
    const userLastName = dbUser?.lastName || "BDJ";

    const eventSlug = formData.get('eventSlug') as string;
    const itemName = formData.get('itemName') as string;
    const amountStr = formData.get('amount') as string;

    const amountInCents = parseInt(amountStr, 10);

    // 1. CORRECTION : On vérifie si c'est "Not a Number" au lieu de juste "faux"
    if (!eventSlug || isNaN(amountInCents)) {
        throw new Error("Informations manquantes pour le paiement.");
    }

    // Si le billet est gratuit, on le crée directement
    if (amountInCents === 0) {
        // On s'assure qu'il ne s'est pas déjà pris un billet gratuit
        const existingTicket = await prisma.ticket.findFirst({
            where: { userId, eventSlug }
        });

        if (!existingTicket) {
            // On génère le billet directement sans passer par la case HelloAsso
            await prisma.ticket.create({
                data: {
                    userId,
                    eventSlug,
                    amount: 0,
                    paymentStatus: 'FREE', // On note que c'était gratuit
                }
            });
        }

        // On l'envoie tout de suite admirer son QR Code !
        redirect('/profil');
    }

    // Si le billet est payant, on génère le lien de paiement HelloAsso
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!appUrl.startsWith('http')) {
        appUrl = `http://${appUrl}`;
    }
    if (appUrl.endsWith('/')) {
        appUrl = appUrl.slice(0, -1);
    }

    const checkoutUrl = await createCheckoutIntent(
        amountInCents,
        itemName,
        userEmail,
        userFirstName,
        userLastName,
        userId,
        eventSlug,
        appUrl
    );

    if (!checkoutUrl) {
        throw new Error("Impossible de générer le lien de paiement HelloAsso.");
    }

    redirect(checkoutUrl);
}