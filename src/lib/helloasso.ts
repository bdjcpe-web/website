/**
 * @file src/lib/helloasso.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Client Component
 * @description Fonctions pour récupérer les données de HelloAsso.
 * @requires
 * - HELLOASSO_CLIENT_ID
 * - HELLOASSO_CLIENT_SECRET
 * - HELLOASSO_ORGANIZATION_SLUG
 */

/**
 * Récupère un token d'accès temporaire auprès d'HelloAsso
 */
async function getAccessToken() {
    const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.HELLOASSO_CLIENT_ID as string,
        client_secret: process.env.HELLOASSO_CLIENT_SECRET as string,
    });

    const res = await fetch('https://api.helloasso.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        cache: 'no-store', // On ne met pas en cache le token pour éviter les bugs d'expiration
    });

    if (!res.ok) {
        throw new Error("Erreur d'authentification HelloAsso");
    }

    const data = await res.json();
    return data.access_token;
}

/**
 * Récupère les détails publics d'une billetterie (campagne) via son slug
 */
export async function getEventDetails(campaignSlug: string) {
    try {
        const token = await getAccessToken();
        const orgSlug = process.env.HELLOASSO_ORGANIZATION_SLUG;

        if (!orgSlug) {
            throw new Error("HELLOASSO_ORGANIZATION_SLUG n'est pas défini");
        }

        // Appel à l'API v5 de HelloAsso pour récupérer la campagne de type "Event"
        const res = await fetch(`https://api.helloasso.com/v5/organizations/${orgSlug}/forms/event/${campaignSlug}/public`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 300 } // Met en cache pendant 5 minutes pour ne pas spammer l'API
        });

        if (!res.ok) {
            console.error(`❌ Erreur HelloAsso: Le serveur a répondu ${res.status}`);
            console.error(`URL tentée : https://api.helloasso.com/v5/organizations/${orgSlug}/forms/event/${campaignSlug}/public`);
            return null;
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Erreur API HelloAsso:", error);
        return null;
    }
}

export async function createCheckoutIntent(
    amountInCents: number,
    itemName: string,
    userEmail: string,
    firstName: string,
    lastName: string,
    userId: string,
    eventSlug: string,
    appUrl: string
) {
    // On récupère le jeton de sécurité (la fonction est déjà dans ton fichier normalement)
    const token = await getAccessToken();
    const orgSlug = process.env.HELLOASSO_ORGANIZATION_SLUG || 'bdj-cpe';

    // On construit le contrat de paiement
    const body = {
        totalAmount: amountInCents,
        initialAmount: amountInCents,
        itemName: itemName,
        backUrl: `${appUrl}/events/${eventSlug}`,
        errorUrl: `${appUrl}/events/${eventSlug}?error=true`,
        returnUrl: `${appUrl}/events/${eventSlug}?success=true`,
        containsDonation: false, // On désactive le pourboire HelloAsso obligatoire
        payer: {
            email: userEmail, // PRÉ-REMPLISSAGE
            firstName: firstName,
            lastName: lastName,
        },
        metadata: {
            // Ces infos secrètes nous seront renvoyées par le Webhook quand le gars aura payé !
            userId: userId,
            eventSlug: eventSlug,
        }
    };

    const res = await fetch(`https://api.helloasso.com/v5/organizations/${orgSlug}/checkout-intents`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        console.error("❌ Erreur Checkout Intent:", await res.text());
        return null;
    }

    const data = await res.json();
    return data.redirectUrl; // HelloAsso nous donne l'URL secrète de paiement
}