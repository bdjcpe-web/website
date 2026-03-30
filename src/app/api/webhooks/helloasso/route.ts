/**
 * @file src/app/api/webhooks/helloasso/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 29/03/2026
 * @architecture Server Component
 * @description Webhook pour HelloAsso gérant les adhésions et les tickets d'événements.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // On cible uniquement les paiements validés
        if (body.eventType === 'Order') {
            const data = body.data;
            const items = data?.items || [];
            const metadata = data?.metadata;

            // LA BILLETTERIE (Si on trouve nos métadonnées secrètes)
            if (metadata && metadata.eventSlug && metadata.userId) {
                const existingTicket = await prisma.ticket.findFirst({
                    where: {
                        userId: metadata.userId,
                        eventSlug: metadata.eventSlug,
                    }
                });

                if (!existingTicket) {
                    await prisma.ticket.create({
                        data: {
                            userId: metadata.userId,
                            eventSlug: metadata.eventSlug,
                            amount: data.amount.total,
                            paymentStatus: 'PAID',
                        }
                    });
                    console.log(`✅ Nouveau ticket généré : ${metadata.userId} -> ${metadata.eventSlug}`);
                }
            }

            // LA COTISATION MEMBRE
            const formSlug = data?.formSlug;
            if (formSlug === process.env.HELLOASSO_CAMPAIGN_SLUG) {
                const hasMembership = items.some((item: any) => item.tierType === 'Membership');

                if (hasMembership) {
                    const membershipItem = items.find((item: any) => item.tierType === 'Membership');
                    const customFields = membershipItem?.customFields || [];
                    const cpeEmailField = customFields.find((field: any) =>
                        field.name.toLowerCase().includes('email cpe')
                    );

                    const finalEmail = cpeEmailField?.answer?.toLowerCase()?.trim()
                        || data?.payer?.email?.toLowerCase();

                    if (finalEmail) {
                        await prisma.user.updateMany({
                            where: { email: finalEmail },
                            data: { isMember: true }
                        });
                        console.log(`👑 Nouveau membre activé : ${finalEmail}`);
                    }
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Erreur Webhook HelloAsso:', error);
        return NextResponse.json({ received: true }, { status: 200 });
    }
}