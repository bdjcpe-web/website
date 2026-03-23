'use server';

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function cancelBookingAndNotify(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: 'Non autorisé.' };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return { error: 'Accès refusé. Réservé aux administrateurs.' };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return { error: 'Réservation introuvable.' };
    }

    // 1. Delete booking
    await prisma.booking.delete({
      where: { id: bookingId }
    });

    // 2. Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    });

    const dateFormatted = booking.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    const mailOptions = {
      from: `"Bureau des Jeux CPE" <${process.env.SMTP_USER}>`,
      to: booking.user.email,
      replyTo: process.env.SMTP_USER,
      subject: `Annulation de votre réservation du Local (le ${dateFormatted})`,
      text: `Bonjour ${booking.user.firstName},\n\nNous t'informons que ta réservation du Local BDJ pour le créneau du ${dateFormatted} de ${booking.startTime} à ${booking.endTime} a été annulée par un administrateur.\n\nSi tu souhaites obtenir des explications ou si tu penses qu'il s'agit d'une erreur, n'hésite pas à répondre directement à cet email.\n\nL'équipe du Bureau des Jeux.`,
      html: `
        <div style="font-family: sans-serif; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #6D0C24;">Annulation de réservation</h2>
          <p>Bonjour <strong>${booking.user.firstName}</strong>,</p>
          <p>Nous t'informons que ta réservation du Local BDJ pour le créneau du <strong>${dateFormatted}</strong> de <strong>${booking.startTime}</strong> à <strong>${booking.endTime}</strong> a été annulée par un administrateur.</p>
          <div style="background: #fff1f2; border-left: 4px solid #6D0C24; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #941131;">Si tu souhaites obtenir des explications concernant cette annulation, tu peux répondre directement à cet email pour contacter l'équipe.</p>
          </div>
          <p>Ludiquement,<br><strong>L'équipe du Bureau des Jeux</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    revalidatePath('/le-local');
    return { success: true };

  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    return { error: 'Une erreur serveur interne est survenue.' };
  }
}
