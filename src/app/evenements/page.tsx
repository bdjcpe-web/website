import Link from 'next/link';
import { getAllParsedEvents } from '@/lib/calendar';
import EventListClient from './EventListClient';

export default async function EvenementsPage() {
  const allEvents = await getAllParsedEvents();

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '5rem', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ color: 'var(--text-primary)' }}>
        <Link href="/" style={{ color: 'var(--c-bordeaux)', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 'bold' }}>
          <i className="ph ph-arrow-left" /> Retour à l'accueil
        </Link>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Agenda</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Tous les événements du Bureau des Jeux, directement depuis notre Google Calendar.</p>
        </div>

        <EventListClient events={allEvents} />

        <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#374151', marginTop: '3rem' }}>
          Le calendrier est géré via Google Calendar —{' '}
          <a href="https://calendar.google.com" target="_blank" style={{ textDecoration: 'underline', color: '#6b7280' }}>Voir en plein écran</a>
        </p>
      </div>
    </div>
  );
}
