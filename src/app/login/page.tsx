'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'error', message: string }>({ type: 'idle', message: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Connexion en cours...' });

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setStatus({ type: 'error', message: result.error });
    } else {
      router.push('/le-local');
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 20px 60px', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>

      {/* ── BACKGROUND DECORATION ── */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '600px', height: '600px', background: 'var(--c-bordeaux)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }} />

      {/* ── LOGIN CARD ── */}
      <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        <div style={{ background: '#fff', borderRadius: '40px', padding: '50px', border: '1.5px solid var(--c-bordeaux)', boxShadow: '0 30px 60px rgba(0,0,0,0.10)' }}>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--c-bordeaux)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 10px 30px rgba(109, 12, 36, 0.2)' }}>
              <i className="ph ph-user" style={{ fontSize: '2.5rem', color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', margin: 0, fontFamily: 'var(--font-heading)' }}>ACCÈS MEMBRE</h1>
            <p style={{ color: 'var(--c-grey-medium)', fontSize: '0.95rem', marginTop: '10px' }}>Utilise ton email @cpe.fr pour te connecter.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <i className="ph ph-envelope-simple" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem' }} />
              <input
                type="email" required placeholder="prenom.nom@cpe.fr" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }}
                className="input-focus"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <i className="ph ph-lock" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem' }} />
              <input
                type="password" required placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }}
                className="input-focus"
              />
            </div>

            {status.type === 'error' && (
              <p style={{ color: '#ff1a3c', fontSize: '0.85rem', fontWeight: 600, margin: '5px 0' }}>{status.message}</p>
            )}

            <button type="submit" disabled={status.type === 'loading'} className="btn btn-premium" style={{ marginTop: '10px', width: '100%' }}>
              {status.type === 'loading' ? 'Connexion...' : 'SE CONNECTER'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-grey-medium)' }}>
              Pas encore inscrit ? <Link href="/register" className="nav-link" style={{ fontSize: '0.9rem', marginLeft: '5px' }}>Créer un compte</Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/" className="nav-link" style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)' }}>
            <i className="ph ph-arrow-left" style={{ marginRight: '8px' }} /> Retour au site
          </Link>
        </div>
      </div>

      <style>{`
        .input-focus:focus {
          background: #fff !important;
          border-color: var(--c-bordeaux) !important;
          box-shadow: 0 0 0 4px rgba(109, 12, 36, 0.05);
        }
      `}</style>
    </div>
  );
}
