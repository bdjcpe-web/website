/**
 * @file src/evenements/page.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Page des événements lié au google calandar du BDJ.
 * Intègre un filtre, la liste des cartes d'événements et un widget calendrier.
 */

import Link from 'next/link';
import { getAllParsedEvents } from '@/lib/calendar';
import EventListClient from './EventListClient';
import styles from './Evenements.module.css';

export const metadata = {
  title: 'Événements - BDJ',
  description: 'Tous les événements du Bureau des Jeux.',
};

export default async function EvenementsPage() {
  const allEvents = await getAllParsedEvents();

  return (
    <div className={styles.pageContainer}>
      <div className="container">

        {/* Bouton de retour */}
        <Link href="/" style={{ color: 'var(--c-bordeaux)', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 'bold' }}>
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

        {/* Footer info */}
        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#374151', marginTop: '4rem' }}>
          Le calendrier est géré via Google Calendar —{' '}
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#6b7280' }}>Voir en plein écran</a>
        </p>
      </div>
    </div>
  );
}