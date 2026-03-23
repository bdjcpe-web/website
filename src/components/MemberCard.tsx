'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  firstName: string;
  lastName: string;
  filiere?: string | null;
  registeredYear?: number | null;
  memberSince: string; // ISO date string
};

const VERIFY_BASE = typeof window !== 'undefined' ? `${window.location.origin}/member/verify` : '/member/verify';

export default function MemberCard({ firstName, lastName, filiere, registeredYear, memberSince }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchToken = async () => {
    try {
      const res = await fetch('/api/member/qr');
      if (res.ok) {
        const d = await res.json();
        setToken(d.token);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchToken(); }, []);

  const year = new Date(memberSince).getFullYear();
  const qrValue = token ? `${VERIFY_BASE}?token=${token}` : '';

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #1a0812 0%, #2d0f1e 60%, #1a0a10 100%)',
      borderRadius: '24px',
      padding: '32px',
      border: '1.5px solid rgba(200,155,60,0.3)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      overflow: 'hidden',
      maxWidth: '480px',
      width: '100%',
    }}>
      {/* Subtle shimmer accent */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(200,155,60,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(200,155,60,0.4)' }}>
          <img src="/bdj_logo.png" alt="BDJ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(200,155,60,0.8)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: 0 }}>Bureau des Jeux · CPE Lyon</p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Carte de membre</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(200,155,60,0.12)', border: '1px solid rgba(200,155,60,0.3)', borderRadius: '20px', padding: '4px 10px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c89b3c', boxShadow: '0 0 6px #c89b3c' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#c89b3c' }}>ACTIF</span>
        </div>
      </div>

      {/* Name + class */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          {firstName} <span style={{ color: '#c89b3c' }}>{lastName.toUpperCase()}</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>
          {filiere ?? 'CPE Lyon'}{registeredYear ? ` · Promo ${registeredYear}` : ''}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', marginTop: '4px' }}>
          Membre depuis {year}
        </p>
      </div>

      {/* QR code */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '12px', flexShrink: 0, position: 'relative' }}>
          {loading ? (
            <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>Chargement...</div>
          ) : token ? (
            <QRCodeSVG value={qrValue} size={120} level="H" />
          ) : (
            <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '0.75rem', textAlign: 'center' }}>Erreur QR</div>
          )}
          {/* Small BDJ logo center overlay */}
          {token && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff' }}>
              <img src="/bdj_logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '12px' }}>
            Présentez ce QR code à nos partenaires pour bénéficier de vos réductions exclusives.
          </p>
          <div style={{ background: 'rgba(255, 160, 0, 0.1)', border: '1px solid rgba(255,160,0,0.25)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,160,0,0.9)', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
              ⚠ Usage unique — ce QR est invalidé après chaque scan. Ne le partagez pas.
            </p>
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchToken(); }}
            disabled={refreshing}
            style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600 }}
          >
            {refreshing ? 'Actualisation...' : '↻ Actualiser'}
          </button>
        </div>
      </div>
    </div>
  );
}
