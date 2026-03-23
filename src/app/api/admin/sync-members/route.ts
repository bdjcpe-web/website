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

    const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;
    if (!sheetUrl || !sheetUrl.startsWith('http')) {
      return NextResponse.json({ error: 'URL Google Sheets non configurée.' }, { status: 500 });
    }

    const res = await fetch(sheetUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer le fichier Google Sheets.' }, { status: 500 });
    }

    const csvText = await res.text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const memberEmails = Array.from(csvText.matchAll(emailRegex)).map(m => m[0].toLowerCase());

    if (memberEmails.length === 0) {
      return NextResponse.json({ message: 'Aucun email trouvé dans le fichier.' });
    }

    // Update all users whose email is in the list AND not already a member
    const updateResult = await prisma.user.updateMany({
      where: {
        email: { in: memberEmails },
        isMember: false
      },
      data: {
        isMember: true
      }
    });

    return NextResponse.json({ 
      message: `Synchronisation terminée. ${updateResult.count} nouveaux membres détectés.`,
      foundTotal: memberEmails.length,
      updatedCount: updateResult.count
    });

  } catch (error) {
    console.error('Member sync error:', error);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation.' }, { status: 500 });
  }
}
