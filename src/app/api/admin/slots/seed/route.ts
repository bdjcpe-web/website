/**
 * @file src/app/api/admin/slots/seed/route.ts
 * @description Seed les créneaux par défaut (à appeler une seule fois après migration)
 * 
 * ⚠️ Attention: Ne sera appelée qu'une fois manuellement, pas d'automatisation
 * Appel: POST /api/admin/slots/seed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DEFAULT_ACTIVE_SLOTS } from '@/lib/constants';

/**
 * POST /api/admin/slots/seed
 * Insère les créneaux par défault si la table est vide
 * 
 * 🔐 Admin seulement
 */
export async function POST(req: NextRequest) {
  try {
    // 🔐 Vérification admin
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 📊 Vérifie si des créneaux existent déjà
    const existingCount = await prisma.availableSlot.count();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `${existingCount} créneaux existent déjà. Seed non exécuté.`,
        skipped: true
      });
    }

    // ✨ Crée les créneaux par défaut
    const created = await prisma.availableSlot.createMany({
      data: DEFAULT_ACTIVE_SLOTS as any
    });

    return NextResponse.json({
      message: `${created.count} créneaux seédés avec succès`,
      count: created.count
    });
  } catch (error) {
    console.error('❌ Erreur POST /api/admin/slots/seed:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
