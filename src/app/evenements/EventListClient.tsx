"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ESPORT_COLOR = '#e63946';

export default function EventListClient({ events }: { events: any[] }) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showPast, setShowPast] = useState<boolean>(false);

  const filters = [
    { id: 'var(--c-jdr)',     label: 'JDR & Société', color: 'var(--c-jdr)' },
    { id: 'var(--c-poker)',   label: 'Poker',          color: 'var(--c-poker)' },
    { id: ESPORT_COLOR,       label: 'Esport',         color: ESPORT_COLOR },
    { id: 'var(--c-gaming)',  label: 'Gaming / MC',    color: 'var(--c-gaming)' },
    { id: 'var(--c-sorties)', label: 'Sorties',         color: 'var(--c-sorties)' },
    { id: 'var(--c-local)',   label: 'Local',           color: 'var(--c-local)' },
  ];

  const filteredEvents = events.filter(ev => {
    if (activeFilters.length > 0 && !activeFilters.includes(ev.color)) return false;
    if (showPast) { if (!ev.isPast) return false; }
    else          { if (ev.isPast)  return false; }
    return true;
  });

  if (showPast) filteredEvents.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
  else          filteredEvents.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <style>{`
        .filter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 9px 6px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      {/* ── 2-COLUMN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', alignItems: 'start' }}>

        {/* ── LEFT COLUMN : Filters + Calendar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>

          {/* Filters */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#000', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <i className="ph ph-faders" style={{ color: 'var(--c-bordeaux)' }} /> Filtres
              </h2>
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} style={{ background: 'none', border: 'none', color: 'var(--c-bordeaux)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>
                  Tout effacer
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {filters.map(f => {
                const isActive = activeFilters.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFilter(f.id)}
                    className="filter-btn"
                    style={{
                      border: `2px solid ${f.color}`,
                      backgroundColor: isActive ? f.color : 'transparent',
                      color: isActive ? '#fff' : f.color,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = f.color;
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = f.color;
                      }
                    }}
                  >
                    {isActive && <i className="ph ph-check-circle" />}
                    {f.label}
                  </button>
                );
              })}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '16px 0' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: showPast ? 'var(--c-bordeaux)' : 'var(--c-grey-medium)', userSelect: 'none' }}>
              <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--c-bordeaux)' }} />
              Voir les événements passés
            </label>
          </div>

          {/* Google Calendar */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=bdj.cpe%40gmail.com&ctz=Europe%2FParis&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&mode=MONTH&bgcolor=%23FFFFFF&color=%236D0C24"
              width="100%"
              height="320"
              frameBorder={0}
              scrolling="no"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN : Event list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev: any) => (
              <div key={ev.id} className="card-event" style={{ borderColor: ev.color, boxShadow: `0 8px 30px ${ev.color}30`, opacity: ev.isPast ? 0.65 : 1 }}>
                {/* Date badge */}
                <div style={{ background: ev.color, borderRadius: '16px', padding: '16px', textAlign: 'center', minWidth: '80px', color: '#000', flexShrink: 0 }}>
                  <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{ev.day}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{ev.month}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#000', marginBottom: '4px' }}>{ev.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem' }}>
                    {ev.time && <span style={{ color: 'var(--c-grey-medium)' }}><i className="ph ph-clock" style={{ color: ev.color }} /> {ev.time}</span>}
                    {ev.desc && <span style={{ color: ev.color, fontWeight: 600, fontSize: '0.85rem' }}>{ev.desc}</span>}
                  </div>
                </div>

                {/* CTA */}
                {(ev.color === ESPORT_COLOR || ev.color === 'var(--c-gaming)') ? (
                  <a href="https://discord.gg/dK3rNUujHS" target="_blank" rel="noopener noreferrer"
                    className="btn" style={{ padding: '10px 18px', fontSize: '0.8rem', background: '#5865F2', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                    <i className="ph ph-discord-logo" /> Discord
                  </a>
                ) : (
                  <a href="https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C" target="_blank" rel="noopener noreferrer"
                    className="btn" style={{ padding: '10px 18px', fontSize: '0.8rem', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                    <i className="ph ph-whatsapp-logo" /> WhatsApp
                  </a>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9f9f9', borderRadius: '20px', border: '1px dashed rgba(0,0,0,0.1)' }}>
              <i className="ph ph-calendar-blank" style={{ fontSize: '3rem', color: 'var(--c-grey-medium)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--c-grey-medium)', fontSize: '1rem' }}>Aucun événement ne correspond à ces critères.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
