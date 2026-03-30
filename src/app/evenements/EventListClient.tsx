/**
 * @file EventListClient.tsx
 * @author Loann CORDEL
 * @date 29/03/2026
 * @description Affichage et filtrage dynamique des événements
 */

"use client";

import React, { useState } from 'react';
import styles from './Evenements.module.css';
import EventCard from '@/components/EventCard/EventCard';
import { activites } from '@/data/activites'; // 👈 On importe ta source de vérité !

export default function EventListClient({ events }: { events: any[] }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showPast, setShowPast] = useState<boolean>(false);

  // 1. GÉNÉRATION DYNAMIQUE DES FILTRES
  // On se base sur tes activités pour créer les filtres
  const dynamicFilters = activites.map(act => ({
    id: act.color,
    label: act.title,
    color: act.color
  }));

  // On s'assure que l'esport est présent (au cas où il ne soit pas encore dans activites)
  if (!dynamicFilters.some(f => f.id === '#e63946' || f.id === 'var(--c-esport)')) {
    dynamicFilters.push({ id: '#e63946', label: 'E-Sport', color: '#e63946' });
  }

  // 2. LOGIQUE DE FILTRAGE
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
              <i className={`ph ph-faders ${styles.filterIcon}`} aria-hidden="true" /> Filtres
            </h2>
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className={styles.clearBtn}>
                Tout effacer
              </button>
            )}
          </div>

          <div className={styles.filterGrid}>
            {dynamicFilters.map(f => {
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

          <hr className={styles.filterDivider} />

          <label className={styles.checkboxLabel} data-active={showPast}>
            <input
              type="checkbox"
              checked={showPast}
              onChange={e => setShowPast(e.target.checked)}
              className={styles.checkboxInput}
            />
            Voir les événements passés
          </label>
        </div>
      </aside>

      {/* ── SECTION 2 : LISTE DES ÉVÉNEMENTS ── */}
      <main className={styles.eventsSection}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev: any) => (
            <EventCard key={ev.id} event={ev} />
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className={`ph ph-calendar-blank ${styles.emptyIcon}`} aria-hidden="true" />
            <p className={styles.emptyText}>Aucun événement ne correspond à ces critères.</p>
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
            className={styles.calendarIframe}
            title="Calendrier BDJ"
          />
        </div>
      </aside>

    </div>
  );
}