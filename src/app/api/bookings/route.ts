/**
 * @file src/app/api/bookings/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @description API Route pour la gestion des réservations du local BDJ
 * 
 * Responsabilités :
 * - GET /api/bookings?date=YYYY-MM-DD : Récupère les créneaux pour une date
 * - POST /api/bookings : Crée une nouvelle réservation avec validations métier
 * 
 * Points clés :
 * - Les dates sont gérées au format local (YYYY-MM-DD) pour éviter les décalages UTC
 * - Vérifications : 1 réserv active max, 1 par semaine, éviction 7 jours pour membres
 * - Notifications email automatiques en cas d'éviction ou annulation admin
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, buildBdjEmail } from '@/lib/mail';
import prisma from '@/lib/prisma';
import { getMonday, parseDateLocal, getNextDayStart, getSundayEnd } from '@/lib/date';
import {
  EVICTION_DAYS_WINDOW,
  MAX_ACTIVE_BOOKINGS,
  MAX_BOOKINGS_PER_WEEK,
  MESSAGES,
  EMAIL_CONFIG,
} from '@/lib/constants';

/**
 * Envoie un email de notification pour une réservation annulée ou reprise
 * 
 * @param toEmail - Email du destinataire
 * @param firstName - Prénom de l'utilisateur
 * @param dateFormatted - Date formatée (pour l'email)
 * @param startTime - Heure de début "HH:MM"
 * @param endTime - Heure de fin "HH:MM"
 * @param type - 'override' = repris par un membre, 'admin' = annulé par admin
 * @param customMessage - Message personnalisé (optionnel, pour les annulations admin)
 */
async function sendCancellationEmail(
  toEmail: string,
  firstName: string,
  dateFormatted: string,
  startTime: string,
  endTime: string,
  type: 'override' | 'admin',
  customMessage?: string
) {
  let emailContent = '';

  if (type === 'override') {
    // 📧 Cas 1 : Un membre a pris la place d'un non-membre
    emailContent = `
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>
        Ta réservation du Local BDJ pour le créneau du <strong>${dateFormatted}</strong> 
        de <strong>${startTime}</strong> à <strong>${endTime}</strong> a été reprise par un membre cotisant du BDJ.
      </p>
      <div style="background: #fff1f2; border-left: 4px solid #6D0C24; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #941131;">
          💡 En tant que <strong>membre cotisant</strong>, tu bénéficies d'une priorité de réservation et tu ne peux pas être évincé de cette façon. La cotisation annuelle n'est que de <strong>10€</strong> !
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.bdjcpe.fr/cotisation" 
           style="display: inline-block; padding: 12px 28px; background: #6D0C24; color: #fff; font-weight: 700; border-radius: 10px; text-decoration: none;">
          Découvrir les avantages de la cotisation →
        </a>
      </div>
    `;
  } else {
    // 📧 Cas 2 : Annulation par le Bureau des Jeux (Admin)
    emailContent = `
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>
        Nous sommes désolés de t'informer que ta réservation du Local BDJ pour le créneau du <strong>${dateFormatted}</strong> 
        de <strong>${startTime}</strong> à <strong>${endTime}</strong> a dû être annulée par le Bureau des Jeux.
      </p>
      <div style="background: rgba(255, 255, 255, 0.05); border-left: 4px solid #e1b82f; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #e5e7eb;">
          <strong>Motif :</strong> ${customMessage || "Fermeture exceptionnelle du local, événement du bureau ou maintenance."}
        </p>
      </div>
      <p>N'hésite pas à réserver un autre créneau très vite !</p>
    `;
  }

  emailContent += `<p style="margin-top: 24px;">Ludiquement,<br><strong>L'équipe du Bureau des Jeux</strong></p>`;

  const finalHtml = buildBdjEmail("Réservation annulée 🚨", emailContent);
  const subject = type === 'override'
    ? EMAIL_CONFIG.SUBJECT_OVERRIDE(dateFormatted)
    : EMAIL_CONFIG.SUBJECT_CANCELLATION(dateFormatted);

  await sendEmail(toEmail, subject, finalHtml);
}

/**
 * GET /api/bookings?date=YYYY-MM-DD
 * 
 * Récupère les créneaux (libres/occupés) pour une date donnée
 * Ajoute un flag 'overridable' pour les créneaux occupés par un non-membre reprenables par un membre
 * 
 * @query date - Date au format YYYY-MM-DD (obligatoire)
 * @returns JSON array de créneaux avec status 'LIBRE' | 'OCCUPE' + flag overridable
 * @status 400 si date manquante
 * @status 401 si non authentifié
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  if (!dateStr) return NextResponse.json([], { status: 400 });

  const session = await getServerSession(authOptions);
  // @ts-ignore
  const isMember = session?.user?.isMember === true;

  // 🔐 Vérifie si l'utilisateur est admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isAdmin = !!(session?.user?.email && adminEmails.includes(session.user.email));

  try {
    // 📅 Parse la date en format local (critique pour éviter les décalages UTC)
    const dateQuery = parseDateLocal(dateStr);
    const nextDayStart = getNextDayStart(dateQuery);

    // 🔍 Récupère toutes les réservations pour ce jour
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dateQuery,
          lt: nextDayStart
        }
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        user: { select: { isMember: true, firstName: true, lastName: true } }
      }
    });

    // ── 2. MISE À JOUR DE LA LOGIQUE D'AFFICHAGE FRONTEND ──
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = bookings.map(b => ({
      // 🔐 ID uniquement exposé aux admins (pour permettre l'annulation)
      ...(isAdmin ? { id: b.id, userName: `${b.user.firstName} ${b.user.lastName}` } : {}),
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      // 🎯 overridable = Le demandeur est membre + Le propriétaire n'est pas membre + C'est à moins de 7 jours
      overridable: isMember && !b.user.isMember && (dateQuery >= oneWeekFromNow),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/bookings]', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


/**
 * POST /api/bookings
 * 
 * Crée une nouvelle réservation avec validations métier complexes :
 * 1. ✋ Vérification du règlement accepté
 * 2. 💡 Logique d'éviction : un membre peut évincer un non-membre (< 7 jours)
 * 3. 🚫 Une seule réservation active à la fois
 * 4. 📅 Maximum 1 par semaine par utilisateur
 * 5. 📧 Notifications email automatiques en cas d'éviction
 * 
 * @body date - Format YYYY-MM-DD (LOCAL, pas UTC)
 * @body startTime - Format HH:MM
 * @body endTime - Format HH:MM
 * @body agreedToRules - Boolean, le checkbox d'acceptation
 * 
 * @returns 201 avec la réservation créée
 * @returns 400 si validation échoue (message explicite)
 * @returns 401 si non authentifié
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user?.id) return NextResponse.json({ error: MESSAGES.UNAUTHORIZED }, { status: 401 });

  try {
    const { date, startTime, endTime, agreedToRules } = await req.json();

    // 🔐 Vérification du règlement
    if (!agreedToRules) {
      return NextResponse.json({ error: MESSAGES.RULES_REQUIRED }, { status: 400 });
    }

    // 📅 Parse la date en format local (sans conversion UTC)
    const reqDate = parseDateLocal(date);
    const nextDayStart = getNextDayStart(reqDate);

    // @ts-ignore
    const userId = session.user.id as string;
    // @ts-ignore
    const callerIsMember = session.user.isMember === true;

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: { gte: reqDate, lt: nextDayStart },
        startTime
      },
      include: { user: { select: { id: true, email: true, firstName: true, isMember: true } } }
    });

    // 🎯 Logique d'éviction : un membre peut évincer un non-membre (< 7 jours)
    if (existingBooking) {
      if (existingBooking.userId === userId) {
        return NextResponse.json({ error: MESSAGES.BOOKING_ALREADY_EXISTS }, { status: 400 });
      }

      if (existingBooking.user.isMember) {
        return NextResponse.json({ error: MESSAGES.BOOKING_RESERVED_BY_MEMBER }, { status: 400 });
      }

      if (!callerIsMember) {
        return NextResponse.json({ error: MESSAGES.BOOKING_RESERVED_BY_OTHER }, { status: 400 });
      }

      // ⏱️ Vérification : éviction valide seulement si < 7 jours
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + EVICTION_DAYS_WINDOW * 24 * 60 * 60 * 1000);

      if (reqDate > oneWeekFromNow) {
        return NextResponse.json({ error: MESSAGES.BOOKING_EVICTION_WINDOW_EXCEEDED }, { status: 400 });
      }

      // L'éviction est valide
      const dateFormatted = reqDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      await prisma.booking.delete({ where: { id: existingBooking.id } });

      sendCancellationEmail(existingBooking.user.email, existingBooking.user.firstName, dateFormatted, startTime, endTime, 'override')
        .catch(err => console.error('Eviction email failed:', err));
    }

    // Règle 1: Pas + de 1 réservation future active
    const activeBookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5
    });

    const nowCheck = new Date();
    const hasActive = activeBookings.some(b => {
      const endDateTime = new Date(b.date);
      const [hours, mins] = b.endTime.split(':');
      endDateTime.setHours(parseInt(hours), parseInt(mins), 0);
      return endDateTime > nowCheck;
    });

    if (hasActive) {
      return NextResponse.json({ error: MESSAGES.BOOKING_ACTIVE_LIMIT }, { status: 400 });
    }

    // 📅 Règle 2 : Pas plus d'une réservation par semaine
    const monday = getMonday(reqDate);
    const sunday = getSundayEnd(monday);

    const sameWeekBooking = await prisma.booking.findFirst({
      where: { userId, date: { gte: monday, lte: sunday } }
    });

    if (sameWeekBooking) {
      return NextResponse.json({ error: MESSAGES.BOOKING_WEEKLY_LIMIT }, { status: 400 });
    }

    // Créer la réservation
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        date: reqDate,
        startTime,
        endTime,
        agreedToRules: true,
        rulesAcceptedAt: new Date(),
      }
    });

    return NextResponse.json(newBooking);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la réservation" }, { status: 500 });
  }
}