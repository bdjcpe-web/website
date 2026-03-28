/**
 * @file EventListClient.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description 
 */

"use client";

import React, { useState } from 'react';
import styles from './Evenements.module.css';
import EventCard from '@/components/EventCard/EventCard';

const ESPORT_COLOR = '#e63946';

const FILTERS_CONFIG = [
  { id: 'var(--c-jdr)', label: 'JDR & Société', color: 'var(--c-jdr)' },
  { id: 'var(--c-poker)', label: 'Poker', color: 'var(--c-poker)' },
  { id: ESPORT_COLOR, label: 'Esport', color: ESPORT_COLOR },
  { id: 'var(--c-gaming)', label: 'Gaming / MC', color: 'var(--c-gaming)' },
  { id: 'var(--c-sorties)', label: 'Sorties', color: 'var(--c-sorties)' },
  { id: 'var(--c-local)', label: 'Local', color: 'var(--c-local)' },
];

export default function EventListClient({ events }: { events: any[] }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showPast, setShowPast] = useState<boolean>(false);

  // Filtrage et tri des événements
  const filteredEvents = events
    .filter(ev => {
      if (activeFilters.length > 0 && !activeFilters.includes(ev.color)) return false;
      return showPast ? ev.isPast : !ev.isPast;
    })
    .sort((a, b) => {
      const timeA = new Date(a.dateStr).getTime();
      const timeB = new Date(b.dateStr).getTime();
      return showPast ? timeB - timeA : timeA - timeB;
    });

  const toggleFilter = (id: string) => {
    setActiveFilters(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.mainLayout}>

      {/* ── SECTION 1 : FILTRES ── */}
      <aside className={styles.filtersSection}>
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h2 className={styles.filterTitle}>
              <i className="ph ph-faders" style={{ color: 'var(--c-bordeaux)' }} aria-hidden="true" /> Filtres
            </h2>
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className={styles.clearBtn}>
                Tout effacer
              </button>
            )}
          </div>

          <div className={styles.filterGrid}>
            {FILTERS_CONFIG.map(f => {
              const isActive = activeFilters.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFilter(f.id)}
                  className={styles.filterBtn}
                  data-active={isActive}
                  style={{ '--btn-color': f.color } as React.CSSProperties}
                >
                  {isActive && <i className="ph ph-check-circle" aria-hidden="true" />}
                  {f.label}
                </button>
              );
            })}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '16px 0' }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: showPast ? 'var(--c-bordeaux)' : 'var(--c-grey-medium)', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showPast}
              onChange={e => setShowPast(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--c-bordeaux)' }}
            />
            Voir les événements passés
          </label>
        </div>
      </aside>

      {/* ── SECTION 2 : LISTE DES ÉVÉNEMENTS ── */}
      <main className={styles.eventsSection}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev: any) => (
            /* Utilisation propre du composant isolé */
            <EventCard key={ev.id} event={ev} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9f9f9', borderRadius: '20px', border: '1px dashed rgba(0,0,0,0.1)' }}>
            <i className="ph ph-calendar-blank" style={{ fontSize: '3rem', color: 'var(--c-grey-medium)', display: 'block', margin: '0 auto 1rem' }} aria-hidden="true" />
            <p style={{ color: 'var(--c-grey-medium)', fontSize: '1rem', margin: 0 }}>Aucun événement ne correspond à ces critères.</p>
          </div>
        )}
      </main>

      {/* ── SECTION 3 : CALENDRIER GOOGLE ── */}
      <aside className={styles.calendarSection}>
        <div className={styles.calendarWrapper}>
          <iframe
            src="https://calendar.google.com/calendar/embed?src=bdj.cpe%40gmail.com&ctz=Europe%2FParis&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&mode=MONTH&bgcolor=%23FFFFFF&color=%236D0C24"
            width="100%"
            height="320"
            frameBorder={0}
            scrolling="no"
            style={{ display: 'block' }}
            title="Calendrier BDJ"
          />
        </div>
      </aside>

    </div>
  );
}