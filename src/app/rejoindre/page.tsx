/**
 * @file page.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Page Rejoindre avec les réseaux sociaux
 */

import { reseaux } from '@/data/reseaux';
import styles from './Rejoindre.module.css';

export const metadata = {
  title: 'Nous Rejoindre - BDJ',
  description: 'Rejoins le Bureau des Jeux sur nos différents réseaux sociaux.',
};

export default function RejoindrePage() {
  return (
    <div className={styles.pageContainer}>

      {/* ── BACKGROUND ACCENTS ── */}
      <div className={styles.accentTop} aria-hidden="true" />
      <div className={styles.accentBottom} aria-hidden="true" />

      <div className={`container animate-fade-in ${styles.contentWrapper}`}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <h1 className="section-title">Nous Rejoindre</h1>
          <p className={styles.subtitle}>
            Suis nous sur nos réseaux pour ne rien rater de nos événements !
          </p>
          <div className={styles.divider} aria-hidden="true" />
        </header>

        {/* ── LINKS LIST/GRID ── */}
        <main className={styles.cardsContainer}>
          {reseaux.map((net) => (
            <a
              key={net.name}
              href={net.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardItem}
              /* Injection propre de la variable CSS dynamique */
              style={{ '--brand-color': net.color } as React.CSSProperties}
            >
              <div className={styles.iconWrapper}>
                <i className={`${net.icon} ${styles.icon}`} aria-hidden="true" />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{net.name}</h2>
                <p className={styles.cardDesc}>{net.desc}</p>
              </div>
            </a>
          ))}
        </main>
      </div>
    </div>
  );
}