/**
 * @file @components/Admin/AddPlayerForm/AddPlayerForm.tsx
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Formulaire d'ajout de joueur
 * @requires useState, useEffect, useRouter
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LOL_ROLES, RL_ROLES,
  LOL_TIERS, RL_TIERS,
  DIVISIONS, NO_DIVISION_TIERS
} from '@/data/esport';
import styles from './AddPlayerForm.module.css';

type SearchResult = { id: string; firstName: string; lastName: string; filiere: string | null; currentYear: number | null };

export default function AddPlayerForm({ gameSlug, gameColor, isRL }: { gameSlug: string; gameColor: string; isRL: boolean }) {
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

  // Déduction dynamique depuis les Datas globales
  const tiers = isRL ? RL_TIERS : LOL_TIERS;
  const roles = isRL ? RL_ROLES : LOL_ROLES;
  const needsDivision = form.rankTier && !NO_DIVISION_TIERS.includes(form.rankTier);

  // Auto-search avec Debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

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

  if (!open) {
    return (
      <button
        className={styles.openBtn}
        onClick={() => setOpen(true)}
        style={{ '--game-color': gameColor } as React.CSSProperties}
      >
        <i className="ph ph-user-plus" aria-hidden="true" /> Ajouter un joueur
      </button>
    );
  }

  return (
    <div className={styles.panelWrapper} style={{ '--game-color': gameColor } as React.CSSProperties}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <i className={`ph ph-user-plus ${styles.titleIcon}`} aria-hidden="true" />
          Ajouter un joueur
        </h3>
        <button onClick={() => setOpen(false)} className={styles.closeBtn} aria-label="Fermer">×</button>
      </header>

      {/* STEP 1 — Search user */}
      {!selected ? (
        <div>
          <label className={styles.label}>Rechercher un compte</label>
          <input
            type="text"
            placeholder="Ex: Dupont, Marie..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.input}
            autoFocus
          />

          {searching && <p className={styles.statusText}>Recherche...</p>}

          {results.length > 0 && (
            <div className={styles.resultsWrapper}>
              {results.map(u => (
                <button key={u.id} onClick={() => selectUser(u)} className={styles.resultBtn}>
                  <span className={styles.resultName}>{u.firstName} {u.lastName}</span>
                  {(u.filiere || u.currentYear) && (
                    <span className={styles.resultDetails}>
                      {u.currentYear && `${u.currentYear}A`} {u.filiere}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className={styles.statusText}>Aucun compte trouvé.</p>
          )}
        </div>
      ) : (
        /* STEP 2 — Fill game info */
        <div className={styles.formWrapper}>

          <div className={styles.selectedUserBox}>
            <div>
              <p className={styles.selectedUserName}>{selected.firstName} {selected.lastName}</p>
              {(selected.filiere || selected.currentYear) && (
                <p className={styles.selectedUserDetails}>{selected.currentYear}A {selected.filiere}</p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className={styles.changeUserBtn}>Changer</button>
          </div>

          <div className={styles.row}>
            <div className={styles.flex1}>
              <label className={styles.label}>Rôle *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={styles.select}>
                <option value="">-- Choisir --</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <label className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                checked={form.isSub}
                onChange={e => setForm(f => ({ ...f, isSub: e.target.checked }))}
                className={styles.checkbox}
              />
              Remplaçant
            </label>
          </div>

          <div>
            <label className={styles.label}>ID In-Game</label>
            <input
              type="text"
              placeholder={isRL ? 'Ex: PlayerName' : 'Ex: Pseudo#EUW'}
              value={form.gameId}
              onChange={e => setForm(f => ({ ...f, gameId: e.target.value }))}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>URL Profil</label>
            <input
              type="url"
              placeholder={isRL ? 'tracker.gg/...' : 'op.gg/...'}
              value={form.profileLink}
              onChange={e => setForm(f => ({ ...f, profileLink: e.target.value }))}
              className={styles.input}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.flex2}>
              <label className={styles.label}>Rang</label>
              <select
                value={form.rankTier}
                onChange={e => setForm(f => ({ ...f, rankTier: e.target.value, rankDivision: '' }))}
                className={styles.select}
              >
                <option value="">-- Aucun --</option>
                {tiers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {needsDivision && (
              <div className={styles.flex1}>
                <label className={styles.label}>Division</label>
                <select
                  value={form.rankDivision}
                  onChange={e => setForm(f => ({ ...f, rankDivision: e.target.value }))}
                  className={styles.select}
                >
                  <option value="">--</option>
                  {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button onClick={submit} disabled={submitting} className={styles.submitBtn}>
            {submitting ? 'Ajout en cours...' : '✓ Ajouter au roster'}
          </button>
        </div>
      )}
    </div>
  );
}