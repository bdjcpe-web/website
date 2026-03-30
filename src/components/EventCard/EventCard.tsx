/**
 * @file src/components/EventCard/EventCard.tsx
 * @author Loann Cordel
 * @date 29/03/2026
 * @description Carte d'événement pour afficher les détails d'un événement HelloAsso
 * @architecture Client Component
 * @requires @/lib/helloasso
 */

import React from 'react';
import Link from 'next/link';
import styles from './EventCard.module.css';

export interface EventData {
    id?: string;
    day: string | number;
    month: string;
    title: string;
    time?: string;
    location?: string;
    desc?: string;
    color: string;
    helloAssoSlug?: string | null;
    isPast?: boolean;
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    const cardStyles = {
        '--theme-color': event.color,
    } as React.CSSProperties;

    const cleanDesc = event.desc?.replace(/\[MAX:\\d+\]/gi, '').trim();

    const cardContent = (
        <article className={styles.card} style={cardStyles} data-past={event.isPast}>
            {/* Badge "Billetterie" pour les événements HelloAsso */}
            {event.helloAssoSlug && !event.isPast && (
                <div className={styles.corner}>
                    <i className={`ph ph-arrow-up-right ${styles.arrowIcon}`} aria-hidden="true" />
                </div>
            )}

            <div className={styles.dateBox}>
                <span className={styles.day}>{event.day}</span>
                <span className={styles.month}>{event.month}</span>
            </div>

            <div className={styles.line} aria-hidden="true" />

            <div className={styles.content}>
                <h3 className={styles.title}>{event.title}</h3>

                <div className={styles.details}>
                    <div className={styles.metaGroup}>
                        {event.time && (
                            <span className={styles.metaItem}>
                                <i className={`ph ph-clock ${styles.iconColor}`} aria-hidden="true" />
                                {event.time}
                            </span>
                        )}
                        {event.location && (
                            <span className={styles.metaItem}>
                                <i className={`ph ph-map-pin ${styles.iconColor}`} aria-hidden="true" />
                                {event.location}
                            </span>
                        )}
                    </div>

                    {event.desc && (
                        <span className={styles.desc}>
                            {cleanDesc}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
    // S'il y a un lien HelloAsso, on rend la carte cliquable !
    if (event.helloAssoSlug && !event.isPast) {
        return (
            <Link href={`/events/${event.helloAssoSlug}`} style={{ textDecoration: 'none' }}>
                {cardContent}
            </Link>
        );
    }

    // Sinon, c'est juste une carte d'information normale
    return cardContent;
}