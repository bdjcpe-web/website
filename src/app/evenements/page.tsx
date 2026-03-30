/**
 * @file src/evenements/page.tsx
 * @author Loann CORDEL
 * @date 29/03/2026
 * @description Page des événements liée au Google Calendar du BDJ.
 */

import Link from 'next/link';
import { getAllParsedEvents } from '@/lib/calendar';
import EventListClient from './EventListClient';
import styles from './Evenements.module.css';

export const metadata = {
  title: 'Événements - BDJ',
  description: 'Tous les événements du Bureau des Jeux.',
};

export const revalidate = 300; // Cache la page pendant 5 minutes

export default async function EvenementsPage() {
  const allEvents = await getAllParsedEvents();

  return (
    <div className={styles.pageContainer}>
      <div className="container">

        {/* Bouton de retour propre */}
        <Link href="/" className={`nav-link ${styles.backLink}`}>
          <i className="ph ph-arrow-left" aria-hidden="true" /> Retour à l'accueil
        </Link>

        {/* HEADER STANDARDISÉ */}
        <header className={styles.header}>
          <h1 className="section-title">Agenda</h1>
          <p className={styles.subtitle}>
            Tous les événements du Bureau des Jeux, directement depuis notre Google Calendar.
          </p>
          <div className={styles.divider} aria-hidden="true" />
        </header>

        {/* Logique Client Injectée */}
        <EventListClient events={allEvents} />

        {/* Footer info propre */}
        <p className={styles.footerInfo}>
          Le calendrier est géré via Google Calendar —{' '}
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Voir en plein écran
          </a>
        </p>
      </div>
    </div>
  );
}