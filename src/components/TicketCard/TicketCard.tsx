/**
 * @file src/components/TicketCard/TicketCard.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 29/03/2026
 * @architecture Client Component
 * @description Carte de ticket pour les événements du BDJ dans la page profil
 */

'use client';

import { QRCode } from 'react-qrcode-logo';
import styles from './TicketCard.module.css';

interface TicketCardProps {
    ticket: any;
    event: any; // Données du Google Calendar associées
}

export default function TicketCard({ ticket, event }: TicketCardProps) {
    if (!event) return null;

    const qrValue = typeof window !== 'undefined'
        ? `${window.location.origin}/admin/scan/${ticket.id}`
        : `/admin/scan/${ticket.id}`;

    // On détermine le statut exact du billet pour appliquer le bon thème
    let status = 'valid';
    let statusText = 'BILLET VALIDE';
    let statusIcon = 'ph-check-circle';
    let statusColor = '#18e043ff';

    if (ticket.scanned) {
        status = 'scanned';
        statusText = 'DÉJÀ SCANNÉ';
        statusIcon = 'ph-x-circle';
        statusColor = '#d21818ff';
    } else if (event.isPast) {
        status = 'past';
        statusText = 'ÉVÉNEMENT PASSÉ';
        statusIcon = 'ph-clock-counter-clockwise';
        statusColor = '#888888ff';
    }

    return (
        <article className={styles.card} data-status={status}>

            {/* ── HAUT : Infos de l'événement ── */}
            <div className={styles.ticketInfo}>
                <h3 className={styles.title}>{event.title}</h3>
                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <i className="ph ph-calendar-blank" /> {event.day} {event.month}
                    </span>
                    {event.time && (
                        <span className={styles.metaItem}>
                            <i className="ph ph-clock" /> {event.time}
                        </span>
                    )}
                    {event.location && (
                        <span className={styles.metaItem}>
                            <i className="ph ph-map-pin" /> {event.location}
                        </span>
                    )}
                </div>
            </div>

            {/* ── MILIEU : La découpe du billet (Encoches + Pointillés) ── */}
            <div className={styles.divider}>
                <div className={styles.notchLeft}></div>
                <div className={styles.dashLine}></div>
                <div className={styles.notchRight}></div>
            </div>

            {/* ── BAS : Le gros QR Code et le statut ── */}
            <div className={styles.qrSection}>
                <div className={styles.qrWrapper}>
                    <QRCode
                        value={qrValue}
                        ecLevel="M"
                        size={220} // Très gros pour que l'appareil photo le capte vite
                        bgColor="transparent" // Fond transparent
                        fgColor="#ffffff" // QR Code Blanc pur
                        qrStyle="dots"
                        eyeRadius={10}
                    />
                    {/* Le filtre superposé pour griser/rougir le QR Code s'il est invalide */}
                    {status !== 'valid' && <div className={styles.qrOverlay}></div>}
                </div>

                {/* Le Helper Text tout en bas */}
                <div className={styles.statusFooter}>
                    <i className={`ph ${statusIcon}`} style={{ color: statusColor }} />
                    <span>{statusText}</span>
                </div>
            </div>

        </article>
    );
}