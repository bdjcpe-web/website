import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // HelloAsso envoie différents types de notifications. On cible les nouvelles commandes (Order).
        if (body.eventType === 'Order') {
            const formSlug = body.data?.formSlug;
            const items = body.data?.items || [];

            // On vérifie que c'est bien un paiement pour TA campagne de cotisation en cours
            if (formSlug === process.env.HELLOASSO_CAMPAIGN_SLUG) {

                // On vérifie qu'il y a bien une adhésion (Membership) dans le panier
                const hasMembership = items.some((item: any) => item.tierType === 'Membership');

                if (hasMembership) {
                    // On parcourt les infos de l'adhésion pour trouver les champs personnalisés
                    const membershipItem = items.find((item: any) => item.tierType === 'Membership');
                    const customFields = membershipItem?.customFields || [];

                    // On cherche notre question spécifique (on utilise .includes au cas où tu as mis "Votre Email CPE")
                    const cpeEmailField = customFields.find((field: any) =>
                        field.name.toLowerCase().includes('email cpe')
                    );

                    // Si le champ existe, on prend cette réponse, sinon on prend l'email du payeur en plan de secours
                    const finalEmail = cpeEmailField?.answer?.toLowerCase()?.trim()
                        || body.data?.payer?.email?.toLowerCase();

                    if (finalEmail) {
                        // On met à jour la base de données avec la bonne adresse
                        await prisma.user.updateMany({
                            where: { email: finalEmail },
                            data: { isMember: true }
                        });
                        console.log(`Nouveau membre activé en temps réel : ${finalEmail}`);
                    }
                }
            }
        }

        // Il faut TOUJOURS répondre 200 OK à HelloAsso, sinon ils vont réessayer en boucle
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Erreur Webhook HelloAsso:', error);
        // Même en cas d'erreur interne, on dit à HelloAsso qu'on a bien reçu le message
        return NextResponse.json({ received: true }, { status: 200 });
    }
}