/**
 * @file src/components/CalendarBooking/CalendarBooking.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Composant client pour la réservation du local BDJ
 * 
 * Workflow utilisateur :
 * 1. Sélectionne une date (14 jours à l'avance max)
 * 2. Visualise les créneaux (libres ou occupés)
 * 3. Clique pour réserver → Modal de règlement
 * 4. Coche les 5 lignes de règlement
 * 5. Accepte l'engagement → Réserve
 * 6. Option pour ajouter au Google Agenda
 * 
 * 🔐 Sécurité : Le server valide les règles métier (ne pas faire confiance au client)
 * 🔧 Admin : boutons annuler (réservations) et ajouter créneau ponctuel par date
 */

'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './CalendarBooking.module.css';
import SlotAdminPanel from './SlotAdminPanel';
import { ALL_POSSIBLE_SLOTS } from '@/lib/constants';

/**
 * Type pour représenter un créneau de réservation
 */
type Slot = { 
  id: string; 
  startTime: string; 
  endTime: string; 
  status: 'LIBRE' | 'OCCUPE'; 
  overridable?: boolean;
  bookingId?: string;   // présent si OCCUPE (admin only)
  userName?: string;    // nom du réservant (admin only)
};

// 📅 Locales pour l'affichage des dates
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function CalendarBooking() {
  const { data: session, status } = useSession();

  // 🔐 Admin check côté client (pour afficher les boutons — la vraie sécurité est côté server)
  const isAdmin = !!(
    session?.user?.email &&
    (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim())
      .includes(session.user.email)
  );

  // 📍 État de la sélection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 🎯 État des créneaux et réservation
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotToBook, setSelectedSlotToBook] = useState<Slot | null>(null);
  
  // ✅ État du règlement (chaque ligne à cocher)
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rulesItemsChecked, setRulesItemsChecked] = useState<boolean[]>([false, false, false, false, false]);

  // 🔧 Admin — Ajout créneau ponctuel
  const [showAddOverrideModal, setShowAddOverrideModal] = useState(false);
  const [overrideSlotTime, setOverrideSlotTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  // 🔧 Admin — Annulation d'une réservation depuis le calendrier
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const RULES_COUNT = 5;
  const allRulesChecked = rulesItemsChecked.every(checked => checked);

  /**
   * Toggle checkbox pour une ligne du règlement
   */
  const toggleRuleItem = (index: number) => {
    const newChecked = [...rulesItemsChecked];
    newChecked[index] = !newChecked[index];
    setRulesItemsChecked(newChecked);
  };

  /**
   * Génère les 14 prochains jours (calendrier)
   */
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  /**
   * Effect : Charge les créneaux quand la date ou le statut change
   */
  useEffect(() => {
    if (selectedDate && status === 'authenticated') {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, status]);

  const fetchSlotsForDate = async (date: Date) => {
    setLoading(true);
    try {
      const dayOfWeek = date.getDay();
      
      // Format YYYY-MM-DD (local)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // 📊 Créneaux globaux du jour + ponctuels de la date (fusion côté API)
      const slotsResponse = await fetch(
        `/api/bookings/slots?dayOfWeek=${dayOfWeek}&date=${dateStr}`
      );
      
      if (!slotsResponse.ok) {
        setSlots([]);
        return;
      }

      const availableSlots = await slotsResponse.json() as Array<{ id: string; startTime: string; endTime: string }>;
      
      const defaultSlots: Slot[] = availableSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'LIBRE'
      }));

      // 📅 Récupère les réservations existantes (avec IDs pour admin)
      const bookingResponse = await fetch(`/api/bookings?date=${dateStr}`);

      if (!bookingResponse.ok) {
        setSlots(defaultSlots);
        return;
      }

      // 🔀 Merge : marque les créneaux réservés comme OCCUPE + injecte bookingId si admin
      const bookedItems = await bookingResponse.json();
      const mergedSlots = defaultSlots.map(slot => {
        const booked = bookedItems.find((b: any) => b.startTime === slot.startTime && b.endTime === slot.endTime);
        if (!booked) return slot;
        if (booked.overridable) return { ...slot, status: 'LIBRE' as const, overridable: true };
        return {
          ...slot,
          status: 'OCCUPE' as const,
          bookingId: booked.id,       // undefined si non-admin (server ne l'envoie pas)
          userName: booked.userName,   // undefined si non-admin
        };
      });
      
      setSlots(mergedSlots);
    } catch (e) {
      console.error('❌ Erreur lors du chargement des créneaux:', e);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (slot: Slot) => {
    if (!session) return alert("Tu dois être connecté");
    if (!selectedDate) return;
    setSelectedSlotToBook(slot);
    setRulesAccepted(false);
    setRulesItemsChecked([false, false, false, false, false]);
  };

  const handleConfirmBooking = async () => {
    if (!session || !selectedDate || !selectedSlotToBook) return;
    if (!rulesAccepted) return alert("Tu dois accepter le règlement.");

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          startTime: selectedSlotToBook.startTime,
          endTime: selectedSlotToBook.endTime,
          agreedToRules: rulesAccepted
        })
      });

      if (res.ok) {
        alert("Réservation confirmée avec succès !");
        fetchSlotsForDate(selectedDate);
        setSelectedSlotToBook(null);

        if (confirm("Génial ! Veux-tu ajouter ce créneau directement à ton Google Agenda ?")) {
          const startStr = selectedSlotToBook.startTime.replace(':', '');
          const endStr = selectedSlotToBook.endTime.replace(':', '');
          const title = encodeURIComponent("Reservation Local BDJ");
          const details = encodeURIComponent("Réservation foyer étudiant BDJ.");
          const location = encodeURIComponent("Salle D016, Bâtiment D, CPE Lyon");
          const dates = `${year}${month}${day}T${startStr}00/${year}${month}${day}T${endStr}00`;
          window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`, '_blank');
        }
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.error}`);
      }
    } catch (e) {
      alert("Impossible de joindre le serveur");
    }
  };

  /**
   * Admin — Annule une réservation depuis la vue calendrier
   */
  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!confirm("Annuler cette réservation ? Un email sera envoyé à l'utilisateur.")) return;
    setCancellingId(bookingId);
    try {
      // On réutilise la server action via un fetch vers l'API existante
      const res = await fetch('/api/admin/cancel-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        if (selectedDate) fetchSlotsForDate(selectedDate);
      } else {
        const err = await res.json();
        alert(`Erreur : ${err.error}`);
      }
    } catch (e) {
      alert("Impossible de joindre le serveur");
    } finally {
      setCancellingId(null);
    }
  };

  /**
   * Admin — Ajoute un créneau ponctuel pour la date sélectionnée
   */
  const handleAdminAddOverrideSlot = async () => {
    if (!overrideSlotTime || !selectedDate) return;
    setOverrideLoading(true);
    setOverrideError('');

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    try {
      const res = await fetch('/api/admin/date-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          startTime: overrideSlotTime.startTime,
          endTime: overrideSlotTime.endTime,
        }),
      });

      if (res.ok) {
        setShowAddOverrideModal(false);
        setOverrideSlotTime(null);
        fetchSlotsForDate(selectedDate);
      } else {
        const err = await res.json();
        setOverrideError(err.error || 'Erreur inconnue');
      }
    } catch (e) {
      setOverrideError("Impossible de joindre le serveur");
    } finally {
      setOverrideLoading(false);
    }
  };

  if (status === 'loading') return <div className={styles.loadingState}>Chargement sécurisé...</div>;

  return (
    <div className={styles.bookingWrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Choisis une date</h2>
        <p className={styles.subtitle}>Choisis un jour dans les 2 prochaines semaines pour voir les disponibilités.</p>
        <p className={styles.warningText}>Tu ne peux réserver qu'un seul créneau par semaine.</p>
      </header>

      {/* Calendar Grid */}
      <nav className={styles.calendarScroll} aria-label="Sélecteur de date">
        {days.map((date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSelected = selectedDate?.getTime() === date.getTime();

          return (
            <button
              key={date.getTime()}
              onClick={() => !isWeekend && setSelectedDate(date)}
              disabled={isWeekend}
              className={`${styles.dayBtn} ${isSelected ? styles.selected : ''}`}
              aria-pressed={isSelected}
            >
              <span className={styles.dayName}>{DAY_NAMES[date.getDay()]}</span>
              <span className={styles.dayNumber}>{date.getDate()}</span>
              <span className={styles.dayMonth}>{MONTH_NAMES[date.getMonth()]}</span>
            </button>
          );
        })}
      </nav>

      <p className={styles.cancelNote}>
        Si tu souhaites annuler ta réservation, tu peux le faire depuis la page <Link className={styles.modalSlotHighlight} href="/profil">Profil</Link>.
      </p>

      {/* Slots List & Auth Blocker */}
      {selectedDate && (
        <section className={styles.slotsWrapper}>
          <h3 className={styles.slotsTitle}>
            <i className={`ph-fill ph-clock ${styles.modalSlotHighlight}`} aria-hidden="true" />
            Créneaux du {DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}
          </h3>

          {status === 'unauthenticated' ? (
            <div className={styles.unauthWidget}>
              <i className={`ph-fill ph-shield-warning ${styles.unauthIcon}`} aria-hidden="true" />
              <h4 className={styles.unauthTitle}>Connexion Requise</h4>
              <p className={styles.unauthText}>
                Tu dois être connecté pour voir les disponibilités et réserver le local.
              </p>
              <Link href="/login" className={styles.loginBtn}>
                <i className="ph-fill ph-lock-open" aria-hidden="true" /> Se connecter
              </Link>
            </div>
          ) : loading ? (
            <p className={styles.loadingState}>Recherche des disponibilités...</p>
          ) : slots.length === 0 ? (
            <div className={styles.emptySlots}>
              Aucun créneau d'ouverture prévu ce jour-là.
              {isAdmin && (
                <button
                  className={styles.adminAddOverrideBtn}
                  onClick={() => setShowAddOverrideModal(true)}
                >
                  <i className="ph-fill ph-plus-circle" /> Ajouter un créneau pour cette date
                </button>
              )}
            </div>
          ) : (
            <div>
              {slots.map(slot => {
                const isLibre = slot.status === 'LIBRE';
                return (
                  <article key={slot.id} className={styles.slotCard}>
                    <div className={styles.slotInfo}>
                      <div className={styles.slotTime}>
                        {slot.startTime} <span>→</span> {slot.endTime}
                      </div>

                      <span className={`${styles.statusBadge} ${isLibre ? styles.statusLibre : styles.statusOccupe}`}>
                        {slot.status}
                      </span>

                      {slot.overridable && (
                        <span className={styles.priorityBadge}>
                          ★ prioritaire membre
                        </span>
                      )}

                      {/* 🔧 Admin : nom du réservant */}
                      {isAdmin && !isLibre && slot.userName && (
                        <span className={styles.adminUserBadge}>
                          <i className="ph-fill ph-user" /> {slot.userName}
                        </span>
                      )}
                    </div>

                    <div className={styles.slotActions}>
                      <button
                        onClick={() => handleBookClick(slot)}
                        disabled={!isLibre}
                        className={`${styles.bookBtn} ${isLibre ? styles.libre : styles.occupe}`}
                      >
                        {isLibre ? (slot.overridable ? 'Réserver (priorité)' : 'Réserver') : 'Indisponible'}
                      </button>

                      {/* 🔧 Admin : bouton annuler la réservation */}
                      {isAdmin && !isLibre && slot.bookingId && (
                        <button
                          onClick={() => handleAdminCancelBooking(slot.bookingId!)}
                          disabled={cancellingId === slot.bookingId}
                          className={styles.adminCancelBtn}
                          title="Annuler cette réservation (admin)"
                        >
                          {cancellingId === slot.bookingId ? (
                            <i className="ph ph-spinner" />
                          ) : (
                            <i className="ph-fill ph-x-circle" />
                          )}
                          Annuler
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* 🔧 Admin : bouton ajouter créneau ponctuel pour cette date */}
              {isAdmin && (
                <button
                  className={styles.adminAddOverrideBtn}
                  onClick={() => setShowAddOverrideModal(true)}
                >
                  <i className="ph-fill ph-plus-circle" /> Ajouter un créneau pour cette date
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* MODAL RÈGLEMENT */}
      {selectedSlotToBook && selectedDate && (
        <dialog open className={styles.modalOverlay} aria-labelledby="modal-title">
          <div className={styles.modalContent}>

            <header className={styles.modalHeader}>
              <i className={`ph-fill ph-warning-circle ${styles.modalWarningIcon}`} aria-hidden="true" />
              <h3 id="modal-title" className={styles.modalTitle}>Règlement du Local BDJ</h3>
            </header>

            <p className={styles.modalSlotInfo}>
              Créneau : <span className={styles.modalSlotHighlight}>{DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} de {selectedSlotToBook.startTime} à {selectedSlotToBook.endTime}</span>
            </p>

            <div className={styles.rulesScrollArea}>
              <ul className={styles.rulesList}>
                <li onClick={() => toggleRuleItem(0)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[0]}>
                      {rulesItemsChecked[0] && '✓'}
                    </span>
                    <strong>Responsabilité totale :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>Tu es <strong className={styles.ruleHighlight}>l'unique responsable</strong> du matériel (consoles, jeux, mobilier, etc.) pendant toute la durée de ton créneau. <strong className={styles.ruleHighlight}>Toute dégradation sera à ta charge.</strong></p>
                </li>
                <li onClick={() => toggleRuleItem(1)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[1]}>
                      {rulesItemsChecked[1] && '✓'}
                    </span>
                    <strong>Propreté exigée :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>Le local doit être rendu dans un <strong className={styles.ruleHighlight}>état irréprochable</strong>. Du matériel de nettoyage est à votre disposition dans le local.</p>
                </li>
                <li onClick={() => toggleRuleItem(2)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[2]}>
                      {rulesItemsChecked[2] && '✓'}
                    </span>
                    <strong>Vérification obligatoire :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>Votre groupe <strong className={styles.ruleHighlight}>ne peut pas quitter le local sans la présence d'un membre du bureau du BDJ</strong> qui effectuera un avis de passage et fermera la porte.</p>
                </li>
                <li onClick={() => toggleRuleItem(3)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[3]}>
                      {rulesItemsChecked[3] && '✓'}
                    </span>
                    <strong>Caution :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>Ta <strong className={styles.ruleHighlight}>carte étudiante</strong> sera prise en caution au début de ton créneau et te sera rendue à la fin après vérification du local.</p>
                </li>
                <li onClick={() => toggleRuleItem(4)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[4]}>
                      {rulesItemsChecked[4] && '✓'}
                    </span>
                    <strong>Sanctions :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>En cas de dégradation ou non-respect du règlement, <strong className={styles.ruleHighlight}>ton accès sera définitivement révoqué et la commission de discipline de CPE Lyon pourra être saisie.</strong></p>
                </li>
              </ul>
            </div>

            <label
              className={styles.checkboxLabel}
              data-accepted={rulesAccepted}
            >
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={e => allRulesChecked && setRulesAccepted(e.target.checked)}
                disabled={!allRulesChecked}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>
                Je m'engage à respecter ce règlement et certifie accepter l'entière responsabilité du local sur mon créneau.
              </span>
            </label>

            <footer className={styles.modalActions}>
              <button onClick={() => setSelectedSlotToBook(null)} className={styles.cancelBtn}>
                Annuler
              </button>
              <button
                onClick={() => handleConfirmBooking()}
                disabled={!rulesAccepted}
                className={styles.confirmBtn}
              >
                Confirmer
              </button>
            </footer>
          </div>
        </dialog>
      )}

      {/* 🔧 ADMIN MODAL — Ajouter un créneau ponctuel pour cette date */}
      {isAdmin && showAddOverrideModal && selectedDate && (
        <dialog open className={styles.modalOverlay} aria-labelledby="override-modal-title">
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <i className={`ph-fill ph-calendar-plus ${styles.adminModalIcon}`} aria-hidden="true" />
              <h3 id="override-modal-title" className={styles.modalTitle}>
                Ajouter un créneau ponctuel
              </h3>
            </header>

            <p className={styles.modalSlotInfo}>
              Date : <span className={styles.modalSlotHighlight}>
                {DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}
              </span>
            </p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="override-slot-select">
                Créneau horaire
              </label>
              <select
                id="override-slot-select"
                className={styles.formSelect}
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  const slot = ALL_POSSIBLE_SLOTS[idx];
                  setOverrideSlotTime(slot ? { startTime: slot.startTime, endTime: slot.endTime } : null);
                }}
              >
                <option value="">-- Sélectionner un créneau --</option>
                {ALL_POSSIBLE_SLOTS.map((slot, idx) => (
                  <option key={idx} value={idx}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </div>

            {overrideError && (
              <p className={styles.adminOverrideError}>{overrideError}</p>
            )}

            <footer className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowAddOverrideModal(false);
                  setOverrideSlotTime(null);
                  setOverrideError('');
                }}
                className={styles.cancelBtn}
              >
                Annuler
              </button>
              <button
                onClick={handleAdminAddOverrideSlot}
                disabled={!overrideSlotTime || overrideLoading}
                className={styles.confirmBtn}
                style={{ opacity: overrideSlotTime && !overrideLoading ? 1 : 0.5 }}
              >
                <i className="ph-fill ph-plus" />
                {overrideLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </footer>
          </div>
        </dialog>
      )}

      {/* 🔧 ADMIN PANEL - Gestion des créneaux hebdomadaires globaux */}
      <SlotAdminPanel 
        isAdmin={isAdmin}
        selectedDate={selectedDate}
      />
    </div>
  );
}