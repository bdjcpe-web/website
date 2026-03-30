/**
 * @file src/app/admin/scan/[id]/page.tsx
 * @author Loann Cordel
 * @date 30/03/2026
 * @architecture Server Component
 * @description Page de scan de billet
 * @requires @/lib/auth
 * @requires @/lib/prisma
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import styles from './ScanPage.module.css';

interface ScanPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ScanTicketPage({ params }: ScanPageProps) {
    const resolvedParams = await params;
    const ticketId = resolvedParams.id;

    // 1. SÉCURITÉ : On vérifie qui tient le téléphone !
    const session = await getServerSession(authOptions);

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());

    if (!isAdmin) {
        return (
            <div className={`${styles.pageWrapper} ${styles.bgDenied}`}>
                <i className={`ph ph-lock-key ${styles.icon} ${styles.iconDenied}`} />
                <h1 className={`${styles.title} ${styles.titleDenied}`}>Accès Refusé</h1>
                <p className={styles.helperText}>Seul le staff du BDJ peut scanner les billets.</p>
                <Link href="/login" className={styles.btnPrimary}>
                    Connexion Staff
                </Link>
            </div>
        );
    }

    // 2. RECHERCHE : On cherche le billet dans Prisma
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { user: true }
    });

    // ÉTAT : Billet inconnu ou faux
    if (!ticket) {
        return (
            <div className={`${styles.pageWrapper} ${styles.bgUnknown}`}>
                <i className={`ph ph-warning-octagon ${styles.icon} ${styles.iconUnknown}`} />
                <h1 className={`${styles.title} ${styles.titleUnknown}`}>Billet Inconnu</h1>
                <p className={styles.helperText}>Ce QR Code n'existe pas dans notre base de données. Attention aux faux billets !</p>
            </div>
        );
    }

    // 3. VÉRIFICATION : Est-ce qu'il a déjà été scanné ?
    if (ticket.scanned) {
        return (
            <div className={`${styles.pageWrapper} ${styles.bgWarning}`}>
                <i className={`ph ph-x-circle ${styles.icon} ${styles.iconWarning}`} />
                <h1 className={`${styles.title} ${styles.titleWarning}`}>Déjà Scanné</h1>
                <p className={styles.subtitle}>Attention, ce billet a déjà été utilisé !</p>

                {ticket.scannedAt && (
                    <span className={styles.timestamp}>
                        Scanné le {ticket.scannedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}

                <div className={`${styles.detailsCard} ${styles.detailsCardWarning}`}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Propriétaire</span>
                        <span className={styles.detailValue}>{ticket.user.firstName} {ticket.user.lastName}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Événement</span>
                        <span className={styles.detailValue}>{ticket.eventSlug}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>ID Billet</span>
                        <span className={styles.detailValue}>#{ticket.id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        );
    }

    // 4. VALIDATION : Tout est bon, on invalide le billet en direct !
    await prisma.ticket.update({
        where: { id: ticketId },
        data: {
            scanned: true,
            scannedAt: new Date()
        }
    });

    // ÉTAT : Billet Valide
    return (
        <div className={`${styles.pageWrapper} ${styles.bgSuccess}`}>
            <i className={`ph ph-check-circle ${styles.icon} ${styles.iconSuccess}`} />
            <h1 className={`${styles.title} ${styles.titleSuccess}`}>Validé</h1>
            <p className={styles.subtitle}>Laisse entrer {ticket.user.firstName} !</p>
            <p className={styles.helperText}>Billet enregistré avec succès.</p>

            <div className={`${styles.detailsCard} ${styles.detailsCardSuccess}`}>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Nom Complet</span>
                    <span className={styles.detailValue}>{ticket.user.firstName} {ticket.user.lastName}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Événement</span>
                    <span className={styles.detailValue}>{ticket.eventSlug}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Type de Billet</span>
                    <span className={styles.detailValue}>
                        {ticket.paymentStatus === 'FREE' ? 'Place Gratuite' : 'Place Payée'}
                    </span>
                </div>
            </div>
        </div>
    );
}