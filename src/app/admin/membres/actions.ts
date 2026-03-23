'use server';

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function syncMembersFromGoogleSheet() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: 'Non autorisé.' };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return { error: 'Accès refusé. Réservé aux administrateurs.' };
  }

  const sheetUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (!sheetUrl || !sheetUrl.startsWith('http')) {
    return { error: 'Lien Google Sheets manquant ou invalide dans la configuration (.env).' };
  }

  try {
    // 1. Fetch the remote CSV text
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) {
      return { error: `Impossible de contacter Google Sheets (Erreur ${response.status}). Le lien est-il bien public ?` };
    }
    const csvText = await response.text();

    // 2. Extract all emails using a broad Regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = Array.from(csvText.matchAll(emailRegex));
    
    if (matches.length === 0) {
      return { error: 'Aucune adresse email valide détectée dans le document.' };
    }

    const uniqueEmails = [...new Set(matches.map(m => m[0].toLowerCase()))];

    // 3. Reset all members to false first to ensure perfect sync (removing old ones)
    await prisma.user.updateMany({
      data: { isMember: false }
    });

    // 4. Batch update all users matching the emails to isMember = true
    const updatedResult = await prisma.user.updateMany({
      where: { 
        email: { in: uniqueEmails } 
      },
      data: { isMember: true }
    });

    revalidatePath('/admin/membres');
    
    return { 
      success: true, 
      count: updatedResult.count,
      scannedEmails: uniqueEmails.length
    };

  } catch (error) {
    console.error('Erreur Sync CSV:', error);
    return { error: 'Une erreur serveur interne est survenue lors de la synchronisation.' };
  }
}
