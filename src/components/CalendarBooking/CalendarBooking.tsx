/**
 * @file @components/CalendarBooking/CalendarBooking.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Component pour la réservation du local
 */

'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './CalendarBooking.module.css';

type Slot = { id: string; startTime: string; endTime: string; status: 'LIBRE' | 'OCCUPE'; overridable?: boolean };

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function CalendarBooking() {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotToBook, setSelectedSlotToBook] = useState<Slot | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rulesItemsChecked, setRulesItemsChecked] = useState<boolean[]>([false, false, false, false, false]);

  const RULES_COUNT = 5;
  const allRulesChecked = rulesItemsChecked.every(checked => checked);

  const toggleRuleItem = (index: number) => {
    const newChecked = [...rulesItemsChecked];
    newChecked[index] = !newChecked[index];
    setRulesItemsChecked(newChecked);
  };

  // Génération des 14 prochains jours
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (selectedDate && status === 'authenticated') {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, status]);

  const fetchSlotsForDate = async (date: Date) => {
    setLoading(true);
    try {
      const dayOfWeek = date.getDay();
      let defaultSlots: Slot[] = [];

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        defaultSlots.push({ id: `midi-${date.getTime()}`, startTime: '12:15', endTime: '13:30', status: 'LIBRE' });
        if (dayOfWeek === 4) {
          defaultSlots.push({ id: `aprem1-${date.getTime()}`, startTime: '13:30', endTime: '16:00', status: 'LIBRE' });
        }
      }

      const response = await fetch(`/api/bookings?date=${date.toISOString().split('T')[0]}`);

      if (response.ok) {
        const bookedItems = await response.json();
        const mergedSlots = defaultSlots.map(slot => {
          const booked = bookedItems.find((b: any) => b.startTime === slot.startTime);
          if (!booked) return slot;
          if (booked.overridable) return { ...slot, status: 'LIBRE' as const, overridable: true };
          return { ...slot, status: 'OCCUPE' as const };
        });
        setSlots(mergedSlots);
      } else {
        setSlots(defaultSlots);
      }
    } catch (e) {
      console.error(e);
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
      // Convert date to YYYY-MM-DD format (local date, not UTC)
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
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
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
                    </div>

                    <button
                      onClick={() => handleBookClick(slot)}
                      disabled={!isLibre}
                      className={`${styles.bookBtn} ${isLibre ? styles.libre : styles.occupe}`}
                    >
                      {isLibre ? (slot.overridable ? 'Réserver (priorité)' : 'Réserver') : 'Indisponible'}
                    </button>
                  </article>
                );
              })}
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
                    <strong>Vérification obligatoire avant départ :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>Votre groupe <strong className={styles.ruleHighlight}>ne peut pas quitter le local sans la présence d'un membre du bureau du BDJ</strong> qui effectuera un avis de passage.</p>
                </li>
                <li onClick={() => toggleRuleItem(3)} style={{ cursor: 'pointer' }}>
                  <div className={styles.ruleItemTop}>
                    <span className={styles.ruleCheckbox} data-checked={rulesItemsChecked[3]}>
                      {rulesItemsChecked[3] && '✓'}
                    </span>
                    <strong>Fermeture sécurisée :</strong>
                  </div>
                  <p className={styles.ruleItemDesc}>La porte doit être verrouillée par le membre du bureau du BDJ. <strong className={styles.ruleHighlight}>Tout départ sans vérification préalable sera considéré comme une faute grave.</strong></p>
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
    </div>
  );
}