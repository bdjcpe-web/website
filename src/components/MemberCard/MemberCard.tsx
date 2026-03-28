'use client';
import { useEffect, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import styles from './MemberCard.module.css';

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

  useEffect(() => {
    fetchToken();
  }, []);

  const year = new Date(memberSince).getFullYear();
  const qrValue = token ? `${VERIFY_BASE}?token=${token}` : '';

  return (
    <div className={styles.card}>
      {/* Subtle shimmer accent */}
      <div className={styles.shimmer} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoBox} aria-hidden="true">
          <img src="/bdj_logo.png" alt="BDJ" className={styles.logoImage} />
        </div>
        <div>
          <p className={styles.headerTitle}>Bureau des Jeux <br />· CPE Lyon</p>
          <p className={styles.headerSubtitle}>Carte de membre</p>
        </div>
        <div className={styles.statusBadge}>
          <div className={styles.statusDot} aria-hidden="true" />
          <span className={styles.statusText}>ACTIF</span>
        </div>
      </header>

      {/* Name + class */}
      <section className={styles.infoBox}>
        <h2 className={styles.userName}>
          {firstName} <span className={styles.userLastName}>{lastName.toUpperCase()}</span>
        </h2>
        <p className={styles.userDetails}>
          {filiere ?? 'CPE Lyon'}{registeredYear ? ` · Promo ${registeredYear}` : ''}
        </p>
        <p className={styles.memberSince}>
          Membre depuis {year}
        </p>
      </section>

      {/* QR code */}
      <div className={styles.qrWrapper}>
        {loading ? (
          <div className={styles.qrPlaceholder}>Chargement...</div>
        ) : token ? (
          <QRCode
            value={qrValue}
            ecLevel="M"
            size={300}
            bgColor="transparent"
            fgColor="#ffffff"
            qrStyle="dots"
            eyeRadius={12}
            logoImage="/bdj_logo.png"
            logoPadding={10}
            logoPaddingStyle="circle"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        ) : (
          <div className={`${styles.qrPlaceholder} ${styles.qrError}`}>Erreur QR</div>
        )}
      </div>

      {/* Explanations */}
      <footer>
        <p className={styles.instructionText}>
          Présentez ce QR code à nos partenaires pour bénéficier de vos réductions exclusives.
        </p>

        <div className={styles.warningBox}>
          <p className={styles.warningText}>
            ⚠ Usage unique — ce QR est invalidé après chaque scan. Ne le partagez pas.
          </p>
        </div>

        <button
          onClick={() => { setRefreshing(true); fetchToken(); }}
          disabled={refreshing}
          className={styles.refreshBtn}
        >
          {refreshing ? 'Actualisation...' : '↻ Actualiser'}
        </button>
      </footer>

    </div>
  );
}