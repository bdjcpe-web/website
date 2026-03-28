/**
 * @file src/components/BentoGrid/BentoGrid.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 25/03/2026
 * @architecture Client Component
 * @description Grille Bento avec la Direction Artistique riche (Images, Hover, Ombres dynamiques).
 */

// external imports
import Link from 'next/link';

// internal imports
import { Activite } from '@/data/activites';

// styles imports
import styles from './BentoGrid.module.css';

// Interface des props
interface BentoGridProps {
    activities: Activite[];
}

// Fonction interne pour déterminer la disposition de la grille
function getBentoLayout(index: number): string {
    switch (index % 5) {
        case 0: return styles.largeSquare;
        default: return styles.smallSquare;
    }
}

export default function BentoGrid({ activities }: BentoGridProps) {
    return (
        <div className={styles.bentoContainer}>
            {activities.map((act, index) => {
                const layoutClass = getBentoLayout(index);

                return (
                    <Link
                        key={act.slug}
                        href={act.slug === 'local' ? '/le-local' : `/activites/${act.slug}`}
                        className={`${styles.bentoCard} ${layoutClass}`}
                        style={{
                            // Couleur pure et une version avec opacité (CC = 80%) pour l'ombre
                            '--theme-color': act.color,
                            '--theme-shadow': `${act.color}CC`
                        } as React.CSSProperties}
                    >
                        {/* Image de fond */}
                        <img
                            src={act.image}
                            alt={act.title}
                            className={styles.bgImage}
                        />

                        {/* Filtre sombre pour lire le texte */}
                        <div className={styles.overlay} />

                        {/* Icône en haut à gauche */}
                        <i className={`ph ${act.icon} ${styles.iconTopLeft}`} />

                        {/* Contenu en bas */}
                        <div className={styles.content}>
                            <h3 className={styles.title}>{act.title.toUpperCase()}</h3>
                            <p className={styles.desc}>{act.tagline}</p>

                            {/* Petite ligne qui s'élargit au survol */}
                            <div className={styles.animatedLine} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}