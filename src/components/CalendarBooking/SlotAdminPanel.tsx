/**
 * @file src/components/CalendarBooking/SlotAdminPanel.tsx
 * @description Panel admin pour gérer les créneaux (ajouter/supprimer)
 * 
 * Affiché uniquement aux admins. Permet de :
 * - Voir les créneaux actifs par jour
 * - Ajouter un créneau disponible (global ou pour une date spécifique)
 * - Désactiver un créneau
 */

'use client';

import { useState, useEffect } from 'react';
import { Wrench, Calendar, Plus, X, XCircle } from 'phosphor-react';
import styles from './SlotAdminPanel.module.css';
import { ALL_POSSIBLE_SLOTS } from '@/lib/constants';

interface SlotData {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AdminPanelProps {
  isAdmin: boolean;
  selectedDate?: Date | null;
}

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function SlotAdminPanel({ isAdmin, selectedDate }: AdminPanelProps) {
  const [slots, setSlots] = useState<Record<number, SlotData[]>>({});
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(selectedDate?.getDay() || 1);
  const [selectedSlotTime, setSelectedSlotTime] = useState<{ startTime: string; endTime: string } | null>(null);
  const [error, setError] = useState('');

  // 📊 Charge les créneaux depuis l'API admin
  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/slots');
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      setError('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSlots();
    }
  }, [isAdmin]);

  // Sync selectedDay avec selectedDate
  useEffect(() => {
    if (selectedDate) {
      setSelectedDay(selectedDate.getDay());
    }
  }, [selectedDate]);

  // ➕ Ajoute un nouveau créneau
  const handleAddSlot = async () => {
    if (!selectedSlotTime) return;

    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          startTime: selectedSlotTime.startTime,
          endTime: selectedSlotTime.endTime
        })
      });

      if (!res.ok) throw new Error('Erreur création');
      
      setShowAddModal(false);
      setSelectedSlotTime(null);
      setError('');
      await loadSlots();
    } catch (err) {
      setError('Erreur lors de l\'ajout du créneau');
    }
  };

  // ✖️ Désactive un créneau
  const handleRemoveSlot = async (slotId: string) => {
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, isActive: false })
      });

      if (!res.ok) throw new Error('Erreur suppression');
      await loadSlots();
    } catch (err) {
      setError('Erreur lors de la suppression du créneau');
    }
  };

  // 🚫 Annule la sélection de date et ferme le modal
  const handleCancelDateSelection = () => {
    // Logic for canceling - parent component should handle this
    setShowAddModal(false);
    setSelectedSlotTime(null);
  };

  if (!isAdmin) return null;

  const daySlots = Object.entries(slots)
    .map(([day, dayData]: [string, any]) => ({
      day: parseInt(day),
      dayName: dayData?.dayName || DAY_NAMES[parseInt(day)],
      slots: Array.isArray(dayData?.slots) ? dayData.slots.filter(s => s.isActive) : []
    }))
    .filter(d => d.day >= 1 && d.day <= 5);

  return (
    <div className={styles.adminPanel}>
      <h2 className={styles.adminTitle}><Wrench size={24} /> Admin - Gestion des créneaux</h2>
      
      {error && <p className={styles.errorMessage}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Chargement des créneaux...</p>
      ) : (
        <>
          {/* SECTION: Créneaux par défaut */}
          <div className={styles.slotsSection}>
            <h3 className={styles.sectionTitle}><Calendar size={20} /> Créneaux disponibles</h3>
            <div className={styles.daysGrid}>
              {daySlots.map(({ day, dayName, slots: daySlotsArray }) => (
                <div key={day} className={styles.dayCard}>
                  <div className={styles.dayCardTitle}>{dayName}</div>
                  {daySlotsArray.length > 0 ? (
                    <ul className={styles.slotsList}>
                      {daySlotsArray.map(slot => (
                        <li key={slot.id} className={styles.slotItem}>
                          <span className={styles.slotTime}>{slot.startTime}-{slot.endTime}</span>
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className={styles.removeBtn}
                            title="Supprimer ce créneau"
                          >
                            <XCircle size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>Aucun créneau</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: Ajouter un créneau */}
          <div className={styles.addSlotSection}>
            <h3 className={styles.sectionSubtitle}>
              {selectedDate ? <><Plus size={20} /> Ajouter un créneau pour {DAY_NAMES[selectedDate.getDay()]} {selectedDate.getDate()}/{selectedDate.getMonth() + 1}</> : <><Plus size={20} /> Ajouter un créneau</>}
            </h3>
            
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setShowAddModal(true)}
                className={styles.addBtn}
              >
                <Plus size={20} /> Ajouter un créneau global
              </button>

              {selectedDate && (
                <>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.addDateBtn}
                  >
                    <Plus size={20} /> Ajouter pour cette date
                  </button>
                  <button
                    onClick={handleCancelDateSelection}
                    className={styles.cancelBtn}
                  >
                    <X size={20} /> Annuler
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MODAL: Ajouter un créneau */}
          <div className={`${styles.modal} ${showAddModal ? styles.open : ''}`}>
            <div className={styles.modalContent}>
              <h4 className={styles.modalTitle}>
                {selectedDate ? <><Calendar size={20} /> Ajouter un créneau pour {DAY_NAMES[selectedDate.getDay()]}</> : <><Calendar size={20} /> Ajouter un créneau</>}
              </h4>

              {/* Sélection du jour */}
              {!selectedDate && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Jour</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className={styles.formSelect}
                  >
                    {[1, 2, 3, 4, 5].map(d => (
                      <option key={d} value={d}>{DAY_NAMES[d]}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sélection du créneau */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Créneau horaire</label>
                <select
                  onChange={(e) => {
                    const slot = ALL_POSSIBLE_SLOTS[parseInt(e.target.value)];
                    setSelectedSlotTime(slot ? { startTime: slot.startTime, endTime: slot.endTime } : null);
                  }}
                  className={styles.formSelect}
                >
                  <option value="">-- Sélectionner un créneau --</option>
                  {ALL_POSSIBLE_SLOTS.map((slot, idx) => (
                    <option key={idx} value={idx}>
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>

              {/* Boutons */}
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={styles.closeBtn}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSlot}
                  disabled={!selectedSlotTime}
                  className={styles.confirmBtn}
                  style={{ opacity: selectedSlotTime ? 1 : 0.5, cursor: selectedSlotTime ? 'pointer' : 'not-allowed' }}
                >
                  <Plus size={20} /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
