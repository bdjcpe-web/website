/**
 * @file src/app/le-local/page.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Page du local avec le calendrier de réservation et les équipements
 * @requires '@/components/CalendarBooking/CalendarBooking'
 * @requires '@/data/equipementLocal'
 * @requires '@/app/le-local/Local.module.css'
 */

import Link from 'next/link';
import CalendarBooking from '@/components/CalendarBooking/CalendarBooking';
import { localEquipment } from '@/data/equipementLocal';
import styles from './Local.module.css';

export const metadata = {
  title: 'Le Local - BDJ',
  description: 'Réserve le local du Bureau des Jeux de CPE Lyon.',
};

export default function LocalPage() {
  return (
    <div className={styles.pageContainer}>

      {/* ── HIGH-FIDELITY HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlayColor} aria-hidden="true" />
        <div className={styles.heroOverlayGradient} aria-hidden="true" />

        <div className={`container animate-fade-in ${styles.heroContent}`}>
          <Link href="/" className={styles.backBtn}>
            <i className="ph ph-arrow-left" aria-hidden="true" /> Retour à l'accueil
          </Link>

          <div className={styles.heroTitleWrapper}>
            <i className={`ph-fill ph-armchair ${styles.heroIcon}`} aria-hidden="true" />
            <div>
              <h1 className={styles.heroTitle}>LE LOCAL</h1>
              <p className={styles.heroSubtitle}>BATIMENT D - SALLE D016</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESERVATION CALENDAR ── */}
      <section className={`container ${styles.calendarSection}`}>
        <CalendarBooking />
      </section>

      {/* ── EQUIPMENT ACCORDION ── */}
      <section className={styles.accordionContainer} aria-label="Équipements du local">
        {localEquipment.map((eq) => (
          <article key={eq.title} className={styles.eqPanel}>
            {/* L'image de fond reste en style inline car elle provient de la data dynamique */}
            <div
              className={styles.eqBg}
              style={{ backgroundImage: `url(${eq.bg})` }}
              aria-hidden="true"
            />

            <div className={styles.eqInfo}>
              <i className={`ph ${eq.icon} ${styles.eqIcon}`} aria-hidden="true" />
              <h3 className={styles.eqTitle}>{eq.title}</h3>

              <div className={styles.eqTags}>
                {eq.items.map(item => (
                  <span key={item} className={styles.eqTag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

    </div>
  );
}