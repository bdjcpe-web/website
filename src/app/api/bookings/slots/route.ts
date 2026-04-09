/**
 * @file src/app/api/bookings/slots/route.ts
 * @description Retourne les créneaux disponibles pour un jour donné
 *
 * GET /api/bookings/slots?dayOfWeek=2&date=2026-04-08
 *
 * Retourne la fusion de :
 * - Créneaux globaux ACTIFS pour ce dayOfWeek (AvailableSlot)
 * - Créneaux ponctuels pour cette date précise (DateOverrideSlot)
 *
 * Les doublons (même startTime+endTime) sont dédupliqués.
 * Le paramètre `date` est optionnel ; sans lui, seuls les créneaux globaux sont retournés.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseDateLocal } from '@/lib/date';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayOfWeekStr = searchParams.get('dayOfWeek');
  const dateStr = searchParams.get('date'); // optionnel : YYYY-MM-DD

  if (!dayOfWeekStr) {
    return NextResponse.json(
      { error: 'Paramètre manquant: dayOfWeek (1-5)' },
      { status: 400 }
    );
  }

  const dayOfWeek = parseInt(dayOfWeekStr);
  if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 5) {
    return NextResponse.json(
      { error: 'dayOfWeek doit être entre 1 et 5 (Lun-Ven)' },
      { status: 400 }
    );
  }

  try {
    // 📅 1. Créneaux globaux ACTIFS pour ce jour de la semaine
    const globalSlots = await prisma.availableSlot.findMany({
      where: { dayOfWeek, isActive: true },
      orderBy: { startTime: 'asc' },
    });

    // 📅 2. Créneaux ponctuels pour la date précise (si fournie)
    let overrideSlots: { id: string; startTime: string; endTime: string }[] = [];
    if (dateStr) {
      const dateObj = parseDateLocal(dateStr);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);

      overrideSlots = await prisma.dateOverrideSlot.findMany({
        where: {
          date: { gte: dateObj, lt: nextDay },
        },
        orderBy: { startTime: 'asc' },
      });
    }

    // 🔀 3. Fusion + déduplification (par startTime+endTime)
    const seen = new Set<string>();
    const merged: { id: string; startTime: string; endTime: string }[] = [];

    for (const s of [...globalSlots, ...overrideSlots]) {
      const key = `${s.startTime}-${s.endTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ id: s.id, startTime: s.startTime, endTime: s.endTime });
      }
    }

    // Tri final par startTime
    merged.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return NextResponse.json(merged);
  } catch (error) {
    console.error('❌ Erreur GET /api/bookings/slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
