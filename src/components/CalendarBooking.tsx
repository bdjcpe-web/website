'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Slot = { id: string; startTime: string; endTime: string; status: 'LIBRE' | 'OCCUPE'; overridable?: boolean };

export default function CalendarBooking() {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotToBook, setSelectedSlotToBook] = useState<Slot | null>(null);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [rulesRead, setRulesRead] = useState(false);

  // Generate the next 14 days (excluding weekends for brevity, or include them but gray them out)
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlotsForDate = async (date: Date) => {
    setLoading(true);
    try {
      // Pour l'instant, on simule les créneaux par défaut selon le cahier des charges
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, 4 = Jeudi
      let defaultSlots: Slot[] = [];

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Tous les jours de la semaine : Midi (12h15-13h30)
        defaultSlots.push({ id: `midi-${date.getTime()}`, startTime: '12:15', endTime: '13:30', status: 'LIBRE' });

        // Jeudi : Aprem (13h30-16h00)
        if (dayOfWeek === 4) {
          defaultSlots.push({ id: `aprem1-${date.getTime()}`, startTime: '13:30', endTime: '16:00', status: 'LIBRE' });
        }
      }

      const response = await fetch(`/api/bookings?date=${date.toISOString()}`);

      if (response.ok) {
        const bookedItems = await response.json();
        const mergedSlots = defaultSlots.map(slot => {
          const booked = bookedItems.find((b: any) => b.startTime === slot.startTime);
          if (!booked) return slot;
          // Members see non-member slots as overridable (still LIBRE)
          if (booked.overridable) return { ...slot, status: 'LIBRE' as const, overridable: true };
          return { ...slot, status: 'OCCUPE' as const };
        });
        setSlots(mergedSlots);
      } else {
        setSlots(defaultSlots);
      }

      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleBookClick = (slot: Slot) => {
    if (!session) return alert("Tu dois être connecté");
    if (!selectedDate) return;
    setSelectedSlotToBook(slot);
    setRulesAccepted(false);
    setRulesRead(false);
  };

  const handleConfirmBooking = async () => {
    if (!session || !selectedDate || !selectedSlotToBook) return;
    if (!rulesAccepted) return alert("Tu dois accepter le règlement.");

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          startTime: selectedSlotToBook.startTime,
          endTime: selectedSlotToBook.endTime,
          agreedToRules: rulesAccepted
        })
      });

      if (res.ok) {
        alert("Réservation confirmée avec succès !");
        fetchSlotsForDate(selectedDate); // Raffraichit les slots en OCCUPE
        setSelectedSlotToBook(null); // Ferme la modal

        // Générer le lien "Ajouter à Google Agenda"
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

  if (status === 'loading') return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement sécurisé...</div>;

  if (status === 'unauthenticated') {
    return (
      <div style={{ padding: '3rem 2.5rem', background: '#ffffff', border: '2px solid var(--c-bordeaux)', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(109,12,36,0.15)' }}>
        <i className="ph-fill ph-shield-warning" style={{ fontSize: '4rem', color: 'var(--c-bordeaux)', marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', color: '#111827' }}>Connexion Requise</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          La réservation de ce local est exclusivement réservée aux étudiants CPE Lyon membres du BDJ.
        </p>
        <Link href="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 40px', background: 'var(--c-bordeaux)', color: '#ffffff', fontWeight: 700, borderRadius: '12px', fontSize: '1.05rem', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(109,12,36,0.3)' }}>
          <i className="ph-fill ph-lock-open" /> Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '0.5rem' }}>Sélectionne une date</h2>
        <p style={{ color: '#6b7280' }}>Choisis un jour dans les 2 prochaines semaines pour voir les disponibilités.</p>
        <p style={{ color: '#6b7280', fontWeight: 700 }}>Tu ne peux réserver qu'un seul créneau par semaine.</p>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {days.map((date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSelected = selectedDate?.getTime() === date.getTime();

          return (
            <button
              key={date.getTime()}
              onClick={() => !isWeekend && setSelectedDate(date)}
              disabled={isWeekend}
              className={!isWeekend && !isSelected ? 'day-btn' : ''}
              style={{
                flexShrink: 0,
                width: '80px',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                border: isSelected ? '2px solid var(--c-bordeaux)' : '1px solid #f3f4f6',
                background: isSelected ? '#fff1f2' : isWeekend ? '#f9fafb' : '#ffffff',
                color: isWeekend ? '#9ca3af' : '#111827',
                cursor: isWeekend ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 4px 12px rgba(109,12,36,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                opacity: isWeekend ? 0.6 : 1
              }}
            >
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isSelected ? 'var(--c-bordeaux)' : '#6b7280' }}>
                {dayNames[date.getDay()]}
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
                {date.getDate()}
              </span>
              <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--c-bordeaux)' : '#9ca3af' }}>
                {monthNames[date.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Si tu souhaites annuler ta réservation, tu peux le faire depuis la page <Link style={{ color: 'var(--c-bordeaux)' }} href="/profil">Profil</Link>.</p>

      <style>{`
        .day-btn:hover {
          background: #fff1f2 !important;
          border-color: rgba(109,12,36,0.25) !important;
          color: var(--c-bordeaux) !important;
        }
        .day-btn:hover span {
          color: var(--c-bordeaux) !important;
        }
      `}</style>

      {/* Slots List */}
      {selectedDate && (
        <div style={{ marginTop: '3rem', padding: '2rem', background: '#f9fafb', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
            <i className="ph-fill ph-clock" style={{ color: 'var(--c-bordeaux)' }} />
            Créneaux du {dayNames[selectedDate.getDay()]} {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
          </h3>

          {loading ? (
            <p style={{ color: '#6b7280' }}>Recherche des disponibilités...</p>
          ) : slots.length === 0 ? (
            <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
              Aucun créneau d'ouverture prévu ce jour-là.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {slots.map(slot => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#111827' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '1px' }}>{slot.startTime} <span style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: 400 }}>→</span> {slot.endTime}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px', background: slot.status === 'LIBRE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: slot.status === 'LIBRE' ? '#16a34a' : '#dc2626', border: `1px solid ${slot.status === 'LIBRE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: slot.status === 'LIBRE' ? '#16a34a' : '#dc2626' }}></span>
                      {slot.status}
                    </span>
                    {slot.overridable && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', background: 'rgba(109,12,36,0.08)', color: 'var(--c-bordeaux)', border: '1px solid rgba(109,12,36,0.2)' }}>
                        ★ prioritaire membre
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBookClick(slot)}
                    disabled={slot.status === 'OCCUPE'}
                    style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 700, background: slot.status === 'LIBRE' ? 'var(--c-bordeaux)' : '#f3f4f6', color: slot.status === 'LIBRE' ? '#ffffff' : '#9ca3af', border: 'none', cursor: slot.status === 'LIBRE' ? 'pointer' : 'not-allowed', transition: 'all 0.2s', opacity: slot.status === 'OCCUPE' ? 0.7 : 1, boxShadow: slot.status === 'LIBRE' ? '0 4px 12px rgba(109,12,36,0.2)' : 'none' }}
                  >
                    {slot.status === 'LIBRE' ? (slot.overridable ? 'Réserver (priorité)' : 'Réserver') : 'Indisponible'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL REGLEMENT */}
      {selectedSlotToBook && selectedDate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '24px', maxWidth: '600px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <i className="ph-fill ph-warning-circle" style={{ fontSize: '2rem', color: 'var(--c-bordeaux)' }} />
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', fontFamily: 'var(--font-heading)' }}>Règlement du Local BDJ</h3>
            </div>

            <p style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.5rem', color: '#374151', padding: '12px 16px', background: '#f3f4f6', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              Créneau : <span style={{ color: 'var(--c-bordeaux)', fontWeight: 800 }}>{dayNames[selectedDate.getDay()]} {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} de {selectedSlotToBook.startTime} à {selectedSlotToBook.endTime}</span>
            </p>

            <div
              id="rules-scroll"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setRulesRead(true);
              }}
              style={{ background: '#fff1f2', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(109,12,36,0.1)', fontSize: '0.95rem', color: '#111827', maxHeight: '260px', overflowY: 'auto', marginBottom: rulesRead ? '1rem' : '0.5rem', lineHeight: 1.7 }}
            >
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px', margin: 0 }}>
                <li><strong>Responsabilité totale :</strong> Tu es <strong style={{ color: 'var(--c-bordeaux)' }}>l'unique responsable</strong> du matériel (consoles, jeux, mobilier, etc.) pendant toute la durée de ton créneau. <strong style={{ color: 'var(--c-bordeaux)' }}>Toute dégradation sera à ta charge.</strong></li>
                <li><strong>Propreté exigée :</strong> Le local doit être rendu dans un <strong style={{ color: 'var(--c-bordeaux)' }}>état irréprochable</strong> : déchets jetés, tables essuyées, micro-ondes vide et propre, etc...<strong style={{ color: 'var(--c-bordeaux)' }}>Du matériel de nettoyage est à votre disposition dans le local.</strong></li>
                <li><strong>Vérification obligatoire avant départ :</strong> Votre groupe <strong style={{ color: 'var(--c-bordeaux)' }}>ne peut pas quitter le local sans la présence d'un membre du bureau du BDJ</strong> qui effectuera un avis de passage. Attendez qu'un membre du bureau vienne vérifier l'état du local avant de partir. Il n'est <strong style={{ color: 'var(--c-bordeaux)' }}>pas possible de partir seul(e)</strong> ou sans cette vérification.</li>
                <li><strong>Fermeture sécurisée :</strong> La porte doit être verrouillée par le membre du bureau du BDJ une fois la vérification effectuée. <strong style={{ color: 'var(--c-bordeaux)' }}>Tout départ sans vérification préalable sera considéré comme une faute grave.</strong></li>
                <li><strong>Sanctions :</strong> En cas de dégradation, vol ou non-respect du règlement constaté, <strong style={{ color: 'var(--c-bordeaux)' }}>ton accès sera définitivement révoqué et la commission de discipline de CPE Lyon pourra être saisie.</strong></li>
              </ul>
              <br />
              <p style={{ textAlign: 'center', fontWeight: 700 }}> <i className="ph ph-smiley" /> Amusez vous bien !</p>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(109,12,36,0.7)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ph ph-arrow-down" /> Fais défiler jusqu'en bas pour continuer
            </p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: rulesRead ? 'pointer' : 'default', marginBottom: '2rem', padding: '1rem', border: '2px solid', borderColor: rulesAccepted ? 'var(--c-bordeaux)' : rulesRead ? '#e5e7eb' : '#f3f4f6', borderRadius: '12px', transition: 'all 0.2s', background: rulesAccepted ? 'rgba(109,12,36,0.02)' : 'transparent', opacity: rulesRead ? 1 : 0.5 }}>
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={e => rulesRead && setRulesAccepted(e.target.checked)}
                disabled={!rulesRead}
                style={{ width: '24px', height: '24px', marginTop: '2px', cursor: rulesRead ? 'pointer' : 'not-allowed', accentColor: 'var(--c-bordeaux)' }}
              />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', lineHeight: 1.4, userSelect: 'none' }}>
                Je m'engage à respecter ce règlement et certifie accepter l'entière responsabilité du local sur mon créneau.
              </span>
            </label>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => setSelectedSlotToBook(null)}
                style={{ padding: '14px 24px', borderRadius: '12px', fontWeight: 700, background: '#f3f4f6', color: '#4b5563', border: 'none', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s' }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfirmBooking()}
                disabled={!rulesAccepted}
                style={{ padding: '14px 32px', borderRadius: '12px', fontWeight: 800, background: rulesAccepted ? 'var(--c-bordeaux)' : '#d1d5db', color: '#ffffff', border: 'none', cursor: rulesAccepted ? 'pointer' : 'not-allowed', transition: 'all 0.2s', fontSize: '1.05rem', boxShadow: rulesAccepted ? '0 8px 20px rgba(109,12,36,0.3)' : 'none', transform: rulesAccepted ? 'translateY(-2px)' : 'none' }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
