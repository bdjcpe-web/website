'use client';
import { useState } from 'react';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<{ valid: boolean; firstName?: string; lastName?: string; filiere?: string; registeredYear?: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (t?: string) => {
    const tok = t ?? token;
    if (!tok) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/member/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tok }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setResult(data);
      } else {
        setError(data.error ?? 'QR invalide ou déjà utilisé');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a10 0%, #2d0f1e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '28px', padding: '48px 40px', maxWidth: '440px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px' }}>
          <img src="/bdj_logo.png" alt="BDJ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, color: '#111', margin: '0 0 6px 0' }}>Vérification Membre BDJ</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '32px' }}>Entrez le token ou scannez le QR code du membre</p>

        {!result ? (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Token QR code..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading || !token}
                style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--c-bordeaux)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: loading || !token ? 0.5 : 1 }}
              >
                {loading ? '...' : 'Vérifier'}
              </button>
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
                <i className="ph ph-x-circle" style={{ marginRight: '8px' }} />{error}
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(22,163,74,0.1)', border: '3px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="ph-fill ph-check-circle" style={{ fontSize: '2.5rem', color: '#16a34a' }} />
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Membre Vérifié ✓</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#111', margin: '0 0 4px 0' }}>
              {result.firstName} {result.lastName?.toUpperCase()}
            </h2>
            {result.filiere && (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '4px' }}>{result.filiere} {result.registeredYear ? `— Promo ${result.registeredYear}` : ''}</p>
            )}
            <div style={{ margin: '20px 0', padding: '12px 20px', background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.25)', borderRadius: '12px' }}>
              <p style={{ color: '#15803d', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>Ce QR code est désormais invalidé — l'adhérent en recevra un nouveau automatiquement.</p>
            </div>
            <button
              onClick={() => { setResult(null); setToken(''); }}
              style={{ padding: '12px 28px', borderRadius: '12px', background: '#111', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}
            >
              Vérifier un autre membre
            </button>
          </div>
        )}

        <p style={{ color: '#d1d5db', fontSize: '0.72rem', marginTop: '24px' }}>
          Réservé aux partenaires BDJ — Bureau des Jeux · CPE Lyon
        </p>
      </div>
    </div>
  );
}
