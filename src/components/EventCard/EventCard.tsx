import React from 'react';
import styles from './EventCard.module.css';

export interface EventData {
    id?: string;
    day: string | number;
    month: string;
    title: string;
    time?: string;
    desc?: string;
    color: string;
    isPast?: boolean; // Ajout de la propriété pour l'état visuel
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    // Injection propre de la variable CSS personnalisée
    const cardStyles = {
        '--theme-color': event.color,
    } as React.CSSProperties;

    return (
        <article
            className={styles.card}
            style={cardStyles}
            data-past={event.isPast}
        >
            <div className={styles.dateBox}>
                <span className={styles.day}>{event.day}</span>
                <span className={styles.month}>{event.month}</span>
            </div>

            <div className={styles.line} aria-hidden="true" />

            <div className={styles.content}>
                <h3 className={styles.title}>{event.title}</h3>

                <div className={styles.details}>
                    {event.time && (
                        <span className={styles.metaItem}>
                            <i className={`ph ph-clock ${styles.iconColor}`} aria-hidden="true" />
                            {event.time}
                        </span>
                    )}
                    {event.desc && (
                        <span className={styles.desc}>
                            {event.desc}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}