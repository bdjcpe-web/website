'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const LOL_ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support', 'Sub'];
const RL_ROLES = ['Mechy', 'Défenseur', 'Capitaine', 'Sub'];
const LOL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger', 'Unranked'];
const RL_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Supersonic Legend', 'Unranked'];
const DIVISIONS = ['I', 'II', 'III', 'IV'];
const NO_DIVISION_TIERS = ['Master', 'Grandmaster', 'Challenger', 'Unranked', 'Supersonic Legend'];

type SearchResult = { id: string; firstName: string; lastName: string; filiere: string | null; currentYear: number | null };

export default function AddPlayerPanel({ gameSlug, gameColor, isRL }: { gameSlug: string; gameColor: string; isRL: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    gameId: '',
    profileLink: '',
    role: '',
    isSub: false,
    rankTier: '',
    rankDivision: '',
  });

  const tiers = isRL ? RL_TIERS : LOL_TIERS;
  const roles = isRL ? RL_ROLES : LOL_ROLES;
  const needsDivision = form.rankTier && !NO_DIVISION_TIERS.includes(form.rankTier);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } catch { setResults([]); }
    setSearching(false);
  }, []);

  const selectUser = (u: SearchResult) => {
    setSelected(u);
    setResults([]);
    setQuery('');
  };

  const submit = async () => {
    if (!form.role) { setError('Le rôle est obligatoire.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/esport/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug,
          userId: selected?.id,
          playerName: selected ? `${selected.lastName} ${selected.firstName}${selected.currentYear && selected.filiere ? ` (${selected.currentYear}${selected.filiere})` : ''}` : '—',
          ...form,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setOpen(false);
      setSelected(null);
      setForm({ gameId: '', profileLink: '', role: '', isSub: false, rankTier: '', rankDivision: '' });
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Erreur');
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    fontSize: '0.85rem', outline: 'none', color: '#fff',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' as const, color: '#111', background: '#fff' };
  const labelStyle = { fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px' };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '12px',
          background: `${gameColor}20`, border: `1px solid ${gameColor}50`,
          color: gameColor, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <i className="ph ph-user-plus" /> Ajouter un joueur
      </button>
    );
  }

  return (
    <div style={{
      background: 'rgba(10,10,10,0.95)', border: `1px solid ${gameColor}40`,
      borderRadius: '20px', padding: '28px', maxWidth: '520px', margin: '0 auto',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>
          <i className="ph ph-user-plus" style={{ color: gameColor, marginRight: '8px' }} />
          Ajouter un joueur
        </h3>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      {/* STEP 1 — Search user */}
      {!selected ? (
        <div>
          <label style={labelStyle}>Rechercher un compte</label>
          <input
            type="text"
            placeholder="Ex: Dupont, Marie..."
            value={query}
            onChange={e => search(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          {searching && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '8px' }}>Recherche...</p>}
          {results.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {results.map(u => (
                <button
                  key={u.id}
                  onClick={() => selectUser(u)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${gameColor}30`, borderRadius: '10px',
                    cursor: 'pointer', color: '#fff', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</span>
                  {(u.filiere || u.currentYear) && (
                    <span style={{ fontSize: '0.72rem', color: gameColor, fontWeight: 700 }}>
                      {u.currentYear && `${u.currentYear}A`} {u.filiere}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && !searching && results.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '8px' }}>Aucun compte trouvé.</p>
          )}
        </div>
      ) : (
        /* STEP 2 — Fill game info */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selected user */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: `${gameColor}15`, borderRadius: '10px', border: `1px solid ${gameColor}40` }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{selected.firstName} {selected.lastName}</p>
              {(selected.filiere || selected.currentYear) && (
                <p style={{ margin: 0, fontSize: '0.7rem', color: gameColor }}>{selected.currentYear}A {selected.filiere}</p>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Changer</button>
          </div>

          {/* Role + Sub row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Rôle *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={selectStyle}>
                <option value="">-- Choisir --</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 700, paddingBottom: '10px' }}>
              <input type="checkbox" checked={form.isSub} onChange={e => setForm(f => ({ ...f, isSub: e.target.checked }))}
                style={{ width: '16px', height: '16px', accentColor: gameColor }} />
              Remplaçant
            </label>
          </div>

          {/* In-game ID */}
          <div>
            <label style={labelStyle}>ID In-Game</label>
            <input type="text" placeholder={isRL ? 'Ex: PlayerName' : 'Ex: Pseudo#EUW'} value={form.gameId}
              onChange={e => setForm(f => ({ ...f, gameId: e.target.value }))} style={inputStyle} />
          </div>

          {/* Profile URL */}
          <div>
            <label style={labelStyle}>URL Profil</label>
            <input type="url" placeholder={isRL ? 'tracker.gg/...' : 'op.gg/...'} value={form.profileLink}
              onChange={e => setForm(f => ({ ...f, profileLink: e.target.value }))} style={inputStyle} />
          </div>

          {/* Rank */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Rang</label>
              <select value={form.rankTier} onChange={e => setForm(f => ({ ...f, rankTier: e.target.value, rankDivision: '' }))} style={selectStyle}>
                <option value="">-- Aucun --</option>
                {tiers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {needsDivision && (
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Division</label>
                <select value={form.rankDivision} onChange={e => setForm(f => ({ ...f, rankDivision: e.target.value }))} style={selectStyle}>
                  <option value="">--</option>
                  {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <p style={{ color: '#e63946', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: '12px', borderRadius: '12px', background: gameColor, color: '#000',
              fontWeight: 900, fontSize: '0.9rem', border: 'none', cursor: 'pointer',
              opacity: submitting ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {submitting ? 'Ajout en cours...' : '✓ Ajouter au roster'}
          </button>
        </div>
      )}
    </div>
  );
}
