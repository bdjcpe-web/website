/**
 * @file src/app/api/bookings/route.ts
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Server Component
 * @description API Route pour la gestion des réservations.
 * @requires
 * - 'next/server' : Pour la gestion des réponses HTTP.
 * - '@prisma/client' : Client Prisma pour l'accès à la base de données.
 * - 'next-auth' : Pour la gestion de la session utilisateur.
 * - 'nodemailer' : Pour l'envoi d'emails.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, buildBdjEmail } from '@/lib/mail';

const prisma = new PrismaClient();

// Fonction utilitaire déplacée en haut
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) {
    date.setHours(-24 * (day - 1));
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

// ── 1. UTILISATION DU NOUVEAU SYSTÈME DE MAIL (MULTI-CAS) ──
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
    // Cas 1 : Un membre a pris la place d'un non-membre
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
    // Cas 2 : Annulation par le Bureau des Jeux (Admin)
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
    ? `Ta réservation du Local a été reprise par un membre (${dateFormatted})`
    : `Annulation de ta réservation du Local (${dateFormatted})`;

  await sendEmail(toEmail, subject, finalHtml);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  if (!dateStr) return NextResponse.json([], { status: 400 });

  const session = await getServerSession(authOptions);
  // @ts-ignore
  const isMember = session?.user?.isMember === true;

  try {
    const dateQuery = new Date(dateStr);
    dateQuery.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: dateQuery,
          lt: new Date(dateQuery.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
        user: { select: { isMember: true } }
      }
    });

    // ── 2. MISE À JOUR DE LA LOGIQUE D'AFFICHAGE FRONTEND ──
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = bookings.map(b => ({
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      // overridable = Le demandeur est membre + Le propriétaire n'est pas membre + C'est à moins de 7 jours !
      overridable: isMember && !b.user.isMember && (dateQuery >= oneWeekFromNow),
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { date, startTime, endTime, agreedToRules } = await req.json();

    if (!agreedToRules) {
      return NextResponse.json({ error: "Tu dois obligatoirement accepter le règlement pour réserver le local." }, { status: 400 });
    }

    const reqDate = new Date(date);
    reqDate.setHours(0, 0, 0, 0);

    // @ts-ignore
    const userId = session.user.id as string;
    // @ts-ignore
    const callerIsMember = session.user.isMember === true;

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: { gte: reqDate, lt: new Date(reqDate.getTime() + 24 * 60 * 60 * 1000) },
        startTime
      },
      include: { user: { select: { id: true, email: true, firstName: true, isMember: true } } }
    });

    if (existingBooking) {
      if (existingBooking.userId === userId) {
        return NextResponse.json({ error: "Tu as déjà réservé ce créneau." }, { status: 400 });
      }

      if (existingBooking.user.isMember) {
        return NextResponse.json({ error: "Ce créneau est réservé par un membre — il ne peut pas être repris." }, { status: 400 });
      }

      if (!callerIsMember) {
        return NextResponse.json({ error: "Ce créneau vient juste d'être pris par quelqu'un d'autre." }, { status: 400 });
      }

      // ── 3. VÉRIFICATION BACKEND DES 7 JOURS POUR L'ÉVICTION ──
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (reqDate > oneWeekFromNow) {
        return NextResponse.json({ error: "Tu ne peux évincer un non-membre que si la réservation a lieu dans les 7 prochains jours." }, { status: 400 });
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
      return NextResponse.json({ error: "Tu as déjà une réservation en attente ou en cours. Une seule à la fois !" }, { status: 400 });
    }

    // Règle 2: Pas + de 1 / semaine
    const monday = getMonday(reqDate);
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    sunday.setHours(23, 59, 59, 999);

    const sameWeekBooking = await prisma.booking.findFirst({
      where: { userId, date: { gte: monday, lte: sunday } }
    });

    if (sameWeekBooking) {
      return NextResponse.json({ error: "Pour assurer la rotation des joueurs, tu ne peux pas réserver plus d'une fois par semaine." }, { status: 400 });
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