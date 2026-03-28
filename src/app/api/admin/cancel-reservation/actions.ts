/**
 * @file src/app/api/admin/cancel-reservation/actions.ts
 * @author Loann Cordel
 * @date 27/03/2026
 * @description Action serveur pour annuler une réservation et notifier l'utilisateur
 */

'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, buildBdjEmail } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

export async function cancelBookingAndNotify(bookingId: string) {
  const session = await getServerSession(authOptions);

  // @ts-ignore (Assure-toi que session.user.id existe bien dans ton authOptions)
  const currentUserId = session?.user?.id as string;
  const currentUserEmail = session?.user?.email?.toLowerCase() || '';

  if (!currentUserId || !currentUserEmail) {
    return { error: 'Non autorisé.' };
  }

  // 1. Définir si l'utilisateur actuel est un Admin
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  const isAdmin = adminEmails.includes(currentUserEmail);

  try {
    // 2. Récupérer la réservation AVANT de la supprimer (pour savoir à qui elle appartient)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return { error: 'Réservation introuvable ou déjà annulée.' };
    }

    // 3. VÉRIFICATION DES DROITS (Sécurité)
    // Si ce n'est ni un admin, ni le propriétaire de la réservation -> On bloque
    if (!isAdmin && booking.userId !== currentUserId) {
      return { error: 'Tu ne peux annuler que tes propres réservations.' };
    }

    // 4. Suppression de la réservation
    await prisma.booking.delete({
      where: { id: bookingId }
    });

    // 5. ENVOI DU MAIL (Seulement si c'est un Admin)
    if (isAdmin) {
      const dateFormatted = booking.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      const emailContent = `
        <p>Bonjour <strong>${booking.user.firstName}</strong>,</p>
        <p>Nous t'informons que ta réservation du Local BDJ pour le créneau du <strong>${dateFormatted}</strong> de <strong>${booking.startTime}</strong> à <strong>${booking.endTime}</strong> a été annulée par un administrateur.</p>
        
        <div style="background: rgba(255, 255, 255, 0.05); border-left: 4px solid #6D0C24; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #e5e7eb;">Si tu souhaites obtenir des explications concernant cette annulation, tu peux répondre directement à cet email pour contacter l'équipe.</p>
        </div>
        
        <p style="margin-top: 24px;">Ludiquement,<br><strong>L'équipe du Bureau des Jeux</strong></p>
      `;

      const finalHtml = buildBdjEmail("Annulation de réservation 🚨", emailContent);

      // Le .catch permet de ne pas bloquer l'UI si le mail plante
      sendEmail(
        booking.user.email,
        `Annulation de ta réservation du Local (le ${dateFormatted})`,
        finalHtml
      ).catch(err => console.error('Erreur envoi mail annulation admin:', err));
    }

    // 6. Rafraîchissement automatique de la page
    revalidatePath('/le-local');

    return { success: true };

  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    return { error: 'Une erreur serveur interne est survenue.' };
  }
}