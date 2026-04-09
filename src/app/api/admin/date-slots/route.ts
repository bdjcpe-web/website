/**
 * @file src/app/api/admin/date-slots/route.ts
 * @description API admin pour gérer les créneaux ponctuels par date précise
 *
 * Endpoints:
 * - POST /api/admin/date-slots  — Ajoute un créneau ponctuel pour une date
 * - DELETE /api/admin/date-slots — Supprime un créneau ponctuel
 *
 * Ces créneaux coexistent avec les AvailableSlots hebdomadaires.
 * 🔐 Nécessite une session admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ALL_POSSIBLE_SLOTS } from '@/lib/constants';
import { parseDateLocal } from '@/lib/date';

/** Vérifie que la session est admin, retourne null si ok, NextResponse si erreur */
async function requireAdmin(): Promise<{ error: NextResponse } | null> {
  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 403 }) };
  }
  return null;
}

/**
 * POST /api/admin/date-slots
 * Ajoute un créneau ponctuel pour une date précise
 *
 * @body date      - Format YYYY-MM-DD (date locale)
 * @body startTime - Format HH:MM
 * @body endTime   - Format HH:MM
 */
export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr.error;

  try {
    const { date, startTime, endTime } = await req.json();

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Paramètres manquants : date, startTime, endTime' },
        { status: 400 }
      );
    }

    // ✅ Valider que c'est un créneau connu
    const isPossibleSlot = ALL_POSSIBLE_SLOTS.some(
      s => s.startTime === startTime && s.endTime === endTime
    );
    if (!isPossibleSlot) {
      return NextResponse.json(
        { error: `Créneau invalide. Options : ${ALL_POSSIBLE_SLOTS.map(s => `${s.startTime}-${s.endTime}`).join(', ')}` },
        { status: 400 }
      );
    }

    const dateObj = parseDateLocal(date);

    // Upsert : si déjà existant, ne fait rien (idempotent)
    const slot = await prisma.dateOverrideSlot.upsert({
      where: { date_startTime_endTime: { date: dateObj, startTime, endTime } },
      update: {},
      create: { date: dateObj, startTime, endTime },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/admin/date-slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/date-slots
 * Supprime un créneau ponctuel par son ID
 *
 * @body id - ID du DateOverrideSlot à supprimer
 */
export async function DELETE(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr.error;

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Paramètre manquant : id' }, { status: 400 });
    }

    await prisma.dateOverrideSlot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/admin/date-slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
