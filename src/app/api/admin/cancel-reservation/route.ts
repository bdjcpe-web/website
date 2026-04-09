/**
 * @file src/app/api/admin/cancel-reservation/route.ts
 * @description Route HTTP pour annuler une réservation (admin)
 * Wraps la server action existante cancelBookingAndNotify
 *
 * POST /api/admin/cancel-reservation
 * @body { bookingId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { cancelBookingAndNotify } from './actions';

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId manquant' }, { status: 400 });
    }

    const result = await cancelBookingAndNotify(bookingId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ POST /api/admin/cancel-reservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
