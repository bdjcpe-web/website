'use client';
import { useState } from 'react';

export default function SyncMembersButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/sync-members', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        // Refresh page to show updated membership statuses
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur synchronisation');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Erreur réseau');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
      <button
        onClick={handleSync}
        disabled={status === 'loading'}
        className="btn-pill btn-gold"
        style={{ padding: '12px 24px', fontSize: '0.9rem' }}
      >
        <i className={`ph ${status === 'loading' ? 'ph-spinner animate-spin' : 'ph-arrows-clockwise'}`} style={{ marginRight: '8px' }} />
        {status === 'loading' ? 'Synchronisation...' : 'Synchroniser les membres'}
      </button>
      {message && (
        <p style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: status === 'error' ? '#ff1a3c' : 'var(--c-gold)',
          margin: 0
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
