import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

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

    // For members: a slot booked only by a non-member is still "overridable"
    const result = bookings.map(b => ({
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      // overridable = slot is taken by a non-member AND the caller is a member
      overridable: isMember && !b.user.isMember,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Helper pour trouver le Lundi
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) {
    date.setHours(-24 * (day - 1));
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

async function sendEvictionEmail(toEmail: string, firstName: string, dateFormatted: string, startTime: string, endTime: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    }
  });

  await transporter.sendMail({
    from: `"Bureau des Jeux CPE" <${process.env.SMTP_USER}>`,
    to: toEmail,
    replyTo: process.env.SMTP_USER,
    subject: `Ta réservation du Local a été reprise par un membre (${dateFormatted})`,
    html: `
      <div style="font-family: sans-serif; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #6D0C24; margin-top: 0;">Réservation annulée</h2>
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
        <a href="https://www.bdj-cpe.fr/cotisation"
           style="display: inline-block; margin-top: 8px; padding: 12px 28px; background: #6D0C24; color: #fff; font-weight: 700; border-radius: 10px; text-decoration: none;">
          Découvrir les avantages de la cotisation →
        </a>
        <p style="margin-top: 24px;">Ludiquement,<br><strong>L'équipe du Bureau des Jeux</strong></p>
      </div>
    `
  });
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

    // Check if slot already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: { gte: reqDate, lt: new Date(reqDate.getTime() + 24 * 60 * 60 * 1000) },
        startTime
      },
      include: { user: { select: { id: true, email: true, firstName: true, isMember: true } } }
    });

    if (existingBooking) {
      // Case 1: booked by the same user
      if (existingBooking.userId === userId) {
        return NextResponse.json({ error: "Tu as déjà réservé ce créneau." }, { status: 400 });
      }

      // Case 2: booked by a member → no override possible
      if (existingBooking.user.isMember) {
        return NextResponse.json({ error: "Ce créneau est réservé par un membre — il ne peut pas être repris." }, { status: 400 });
      }

      // Case 3: booked by a non-member but caller is not a member → slot is taken
      if (!callerIsMember) {
        return NextResponse.json({ error: "Ce créneau vient juste d'être pris par quelqu'un d'autre." }, { status: 400 });
      }

      // Case 4: caller IS a member, existing booking is a non-member → OVERRIDE
      const dateFormatted = reqDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      // Delete the non-member booking
      await prisma.booking.delete({ where: { id: existingBooking.id } });

      // Send eviction email (fire and forget — don't block the response)
      sendEvictionEmail(existingBooking.user.email, existingBooking.user.firstName, dateFormatted, startTime, endTime)
        .catch(err => console.error('Eviction email failed:', err));
    }

    // Règle 1: Pas + de 1 réservation future active
    const activeBookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5
    });

    const now = new Date();
    const hasActive = activeBookings.some(b => {
      const endDateTime = new Date(b.date);
      const [hours, mins] = b.endTime.split(':');
      endDateTime.setHours(parseInt(hours), parseInt(mins), 0);
      return endDateTime > now;
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
