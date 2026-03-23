'use client';
import { useState } from 'react';
import { syncMembersFromGoogleSheet } from './actions';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean, count?: number, scannedEmails?: number, error?: string } | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    const res = await syncMembersFromGoogleSheet();
    setResult(res);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <button 
        onClick={handleSync} 
        disabled={loading}
        style={{ padding: '16px 32px', background: 'var(--c-bordeaux)', color: '#fff', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 30px rgba(109,12,36,0.3)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Synchronisation en cours...' : 'Lancer la Synchronisation'}
      </button>

      {result?.error && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600 }}>
          <i className="ph-fill ph-warning-circle" /> {result.error}
        </div>
      )}

      {result?.success && (
        <div style={{ padding: '16px 24px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
            <i className="ph-fill ph-check-circle" style={{ fontSize: '1.4rem' }} /> Synchronisation réussie !
          </div>
          <p style={{ margin: 0, color: '#15803d', fontWeight: 500, lineHeight: 1.5 }}>
            Le robot d'exploration a intercepté <strong>{result.scannedEmails}</strong> e-mails valides dans le document, et a accordé le privilège de membre VIP à <strong>{result.count}</strong> comptes BDJ existants.
          </p>
        </div>
      )}
    </div>
  );
}
