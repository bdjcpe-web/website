/**
 * @file src/components/EventCard/EventCard.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 24/03/2026
 * @architecture Client/Server Component
 * @description Carte affichant les détails d'un événement (date, titre, horaires).
 * + un bouton pour rejoindre le discord ou whatsapp.
 * Gère dynamiquement ses couleurs selon le thème de l'événement.
 * @dependencies
 * - './EventCard.module.css' : Styles isolés et responsive.
 */

// styles imports
import styles from './EventCard.module.css';

// components imports
import SocialButton from '../Socials/SocialButton';

// Interface définissant les données attendu par le composant EventCard
export interface EventData {
    day: string | number;
    month: string;
    title: string;
    time?: string;
    desc?: string;
    color: string;
}

// Interface définissant les propriétés du composant EventCard
interface EventCardProps {
    event: EventData;
}

// Composant EventCard
export default function EventCard({ event }: EventCardProps) {
    // Isolation de la logique conditionnelle : Est-ce un event orienté gaming ?
    const isDiscord = event.color === 'var(--c-esport)' || event.color === 'var(--c-gaming)';

    // Passage de la couleur JS dans une variable CSS personnalisée
    const dynamicStyles = {
        '--theme-color': event.color,
        borderColor: 'var(--theme-color)',
        boxShadow: `0 8px 30px ${event.color}30` // Le "30" ajoute de la transparence à la couleur hexadécimale
    } as React.CSSProperties;

    return (
        <div className={styles.card} style={dynamicStyles}>

            {/* --- BLOC DATE --- */}
            <div className={styles.dateBox} style={{ backgroundColor: 'var(--theme-color)' }}>
                <span className={styles.day}>{event.day}</span>
                <span className={styles.month}>{event.month}</span>
            </div>

            {/*--- DECORATIVE LINE ---*/}
            <div className={styles.line} style={{ backgroundColor: 'var(--theme-color)' }} />

            {/* --- BLOC INFOS --- */}
            <div className={styles.content}>
                <h3 className={styles.title}>{event.title}</h3>
                <div className={styles.details}>
                    {event.time && (
                        <span>
                            <i className="ph ph-clock" style={{ color: 'var(--theme-color)', marginRight: '4px' }} />
                            {event.time}
                        </span>
                    )}
                    {event.desc && (
                        <span className={styles.desc} style={{ color: 'var(--theme-color)' }}>
                            {event.desc}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}