import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());

    if (!session || !session.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
    }

    // 1. Authentification HelloAsso
    const tokenResponse = await fetch('https://api.helloasso.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.HELLOASSO_CLIENT_ID!,
        client_secret: process.env.HELLOASSO_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Impossible de s'authentifier auprès de HelloAsso.");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const orgSlug = process.env.HELLOASSO_ORGANIZATION_SLUG;
    const campaignSlug = process.env.HELLOASSO_CAMPAIGN_SLUG;

    // 2. Récupération des cotisants
    let allEmails: string[] = [];
    let continuationToken = null;
    let hasMore = true;

    while (hasMore) {
      // On cible spécifiquement la campagne de l'année en cours
      let url = `https://api.helloasso.com/v5/organizations/${orgSlug}/forms/Membership/${campaignSlug}/items?states=Processed&pageSize=100`;

      if (continuationToken) {
        url += `&continuationToken=${continuationToken}`;
      }

      const itemsResponse = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!itemsResponse.ok) {
        throw new Error("Erreur lors de la récupération des membres HelloAsso.");
      }

      const itemsData = await itemsResponse.json();

      // 3. LA NOUVELLE LOGIQUE : Recherche du champ personnalisé "Email CPE"
      itemsData.data.forEach((item: any) => {
        const customFields = item.customFields || [];

        // On cherche le champ (la question) contenant "email cpe"
        const cpeEmailField = customFields.find((field: any) =>
          field.name.toLowerCase().includes('email cpe')
        );

        // Ordre de priorité : 
        // 1. La réponse au champ "Email CPE"
        // 2. L'email du bénéficiaire renseigné (au cas où on oublie le champ personnalisé)
        // 3. L'email du payeur (le compte Google/banque, en dernier recours)
        const finalEmail = cpeEmailField?.answer?.toLowerCase()?.trim()
          || item.user?.email?.toLowerCase()?.trim()
          || item.payer?.email?.toLowerCase()?.trim();

        if (finalEmail) {
          allEmails.push(finalEmail);
        }
      });

      // Pagination
      if (itemsData.pagination?.continuationToken) {
        continuationToken = itemsData.pagination.continuationToken;
      } else {
        hasMore = false;
      }
    }

    // On supprime les doublons éventuels
    const uniqueEmails = [...new Set(allEmails)];

    if (uniqueEmails.length === 0) {
      return NextResponse.json({ message: 'Aucun membre trouvé sur HelloAsso.' });
    }

    // 4. Mise à jour de Prisma
    const updateResult = await prisma.user.updateMany({
      where: {
        email: { in: uniqueEmails },
        isMember: false
      },
      data: {
        isMember: true
      }
    });

    return NextResponse.json({
      message: `Synchronisation terminée ! ${updateResult.count} nouveaux membres détectés sur ${uniqueEmails.length} cotisants.`,
      foundTotal: uniqueEmails.length,
      updatedCount: updateResult.count
    });

  } catch (error) {
    console.error('HelloAsso sync error:', error);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation HelloAsso.' }, { status: 500 });
  }
}