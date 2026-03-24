'use client';
import { useState } from 'react';
import { cancelBookingAndNotify } from '../api/admin/cancel-reservation/actions';

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelClick = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Un email de notification sera immédiatement envoyé à l'étudiant.")) {
      return;
    }

    setIsCancelling(true);
    const res = await cancelBookingAndNotify(bookingId);

    if (res.error) {
      alert(`Erreur : ${res.error}`);
    } else {
      alert("La réservation a été annulée et l'étudiant a été notifié par email.");
    }

    setIsCancelling(false);
  };

  return (
    <button
      onClick={handleCancelClick}
      disabled={isCancelling}
      style={{
        padding: '6px 12px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: isCancelling ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: isCancelling ? 0.5 : 1
      }}
      onMouseOver={(e) => { if (!isCancelling) { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; } }}
      onMouseOut={(e) => { if (!isCancelling) { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#dc2626'; } }}
    >
      {isCancelling ? 'Annulation...' : 'Annuler'}
    </button>
  );
}
