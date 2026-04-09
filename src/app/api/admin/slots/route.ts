/**
 * @file src/app/api/admin/slots/route.ts
 * @description API pour administrer les créneaux disponibles
 * 
 * Endpoints:
 * - GET /api/admin/slots - Récupère tous les créneaux (actifs et inactifs)
 * - PATCH /api/admin/slots - Active/Désactive un créneau
 * - POST /api/admin/slots - Ajoute un nouveau créneau ou réactive un inactif
 * 
 * 🔐 Sécurité: Nécessite une session admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ALL_POSSIBLE_SLOTS, DEFAULT_ACTIVE_SLOTS } from '@/lib/constants';

/**
 * GET /api/admin/slots
 * Retourne tous les créneaux (actifs et inactifs, groupés par jour)
 */
export async function GET(req: NextRequest) {
  try {
    // 🔐 Vérification admin
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 📅 Récupère tous les créneaux groupés par jour
    const slots = await prisma.availableSlot.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    // 🏗️ Groupe par jour
    const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const slotsByDay = slots.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = {
          dayName: dayNames[slot.dayOfWeek],
          slots: []
        };
      }
      acc[slot.dayOfWeek].slots.push(slot);
      return acc;
    }, {} as Record<number, { dayName: string; slots: any[] }>);

    return NextResponse.json(slotsByDay);
  } catch (error) {
    console.error('❌ Erreur GET /api/admin/slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/slots
 * Active ou désactive un créneau existant
 * 
 * @body {
 *   slotId: string;        // ID du créneau
 *   isActive: boolean;     // Nouvel état
 * }
 */
export async function PATCH(req: NextRequest) {
  try {
    // 🔐 Vérification admin
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { slotId, isActive } = await req.json();

    if (!slotId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres manquants: slotId, isActive' },
        { status: 400 }
      );
    }

    // 📝 Mise à jour du créneau
    const updatedSlot = await prisma.availableSlot.update({
      where: { id: slotId },
      data: { isActive }
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error('❌ Erreur PATCH /api/admin/slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/admin/slots
 * Ajoute un nouveau créneau ou réactive un inactif
 * 
 * @body {
 *   dayOfWeek: number;     // 1-5 (Lun-Ven)
 *   startTime: string;     // "08:00"
 *   endTime: string;       // "10:00"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 🔐 Vérification admin
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { dayOfWeek, startTime, endTime } = await req.json();

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Paramètres manquants: dayOfWeek, startTime, endTime' },
        { status: 400 }
      );
    }

    // ✅ Validation du créneau possible
    const isPossibleSlot = ALL_POSSIBLE_SLOTS.some(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );
    if (!isPossibleSlot) {
      return NextResponse.json(
        { 
          error: 'Créneau non valide. Les créneaux possibles sont: ' + 
                 ALL_POSSIBLE_SLOTS.map(s => `${s.startTime}-${s.endTime}`).join(', ')
        },
        { status: 400 }
      );
    }

    // 🔍 Cherche d'abord si le créneau existe (peut-être inactif)
    const existingSlot = await prisma.availableSlot.findUnique({
      where: {
        dayOfWeek_startTime_endTime: { dayOfWeek, startTime, endTime }
      }
    });

    let slot;
    if (existingSlot) {
      // 🔄 Réactive un créneau inactif
      slot = await prisma.availableSlot.update({
        where: { id: existingSlot.id },
        data: { isActive: true }
      });
    } else {
      // ✨ Crée un nouveau créneau
      slot = await prisma.availableSlot.create({
        data: { dayOfWeek, startTime, endTime, isActive: true }
      });
    }

    return NextResponse.json(slot);
  } catch (error) {
    console.error('❌ Erreur POST /api/admin/slots:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
