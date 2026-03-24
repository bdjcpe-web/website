'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* ── Left: Logo + Navigation ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" className="logo">
            <div style={{ width: '50px', height: '50px', minWidth: '50px', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/bdj_logo.png" alt="BDJ" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </Link>

          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <Link href="/esport" className="btn btn-esport" style={{ height: '36px', padding: '0 16px', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              ESPORT
            </Link>
            <a href="/#events" className="nav-link">Événements</a>
            <a href="/#activities" className="nav-link">Activités</a>
            <a href="/#sponsors" className="nav-link">Partenaires</a>
          </nav>
        </div>

        {/* ── Right: Actions ── */}
        <div className="desktop-only" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/rejoindre" className="btn btn-premium" style={{ height: '42px', padding: '0 24px', fontSize: '0.9rem' }}>
            Nous rejoindre
          </Link>
          <Link href="/le-local" className="btn btn-gold" style={{ height: '42px', padding: '0 24px', fontSize: '0.9rem' }}>
            Réserver le local
          </Link>

          {/* ── Crown / Cotisation CTA ── */}
          <Link href="/cotisation" className="crown-cta desktop-only" title="Devenir membre">
            <i className="ph-fill ph-crown" />
            <span> {!session?.user?.isMember ? 'Avantages Membre' : 'Devenir Membre'}</span>
          </Link>

          {/* Profile Dropdown with Hover Persistence Bridge */}
          <div
            style={{ position: 'relative', padding: '10px 0', marginLeft: '10px' }}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <div
              style={{
                width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s',
                background: status === 'authenticated' ? 'var(--c-bordeaux)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <i className={status === 'authenticated' ? 'ph ph-user' : 'ph ph-user-circle'} style={{ fontSize: '1.4rem' }} />
            </div>

            {profileOpen && (
              <div
                style={{ position: 'absolute', top: '40px', right: 0, padding: '20px 0 0', zIndex: 1000 }}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '12px',
                  minWidth: '260px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>

                  {status === 'authenticated' && session.user && (
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                      <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>{session.user.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{session.user.email}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {status !== 'authenticated' ? (
                      <>
                        <Link href="/login" className="nav-dropdown-item">Se connecter</Link>
                        <Link href="/cotisation" className="nav-dropdown-item" style={{ color: 'var(--c-gold)' }}>Devenir Membre</Link>
                      </>
                    ) : (
                      <>
                        <Link href="/profil" className="nav-dropdown-item">Mon Profil</Link>
                        <Link href="/cotisation" className="nav-dropdown-item" style={{ color: 'var(--c-gold)' }}>Devenir Membre</Link>
                        <Link href="/le-local" className="nav-dropdown-item">Le Local</Link>
                        <a href="mailto:bdj.cpe@gmail.com" className="nav-dropdown-item">Nous contacter</a>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                        <button onClick={() => signOut()} className="nav-dropdown-item" style={{ color: '#ef4444', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nav-dropdown-item {
          padding: 12px 16px;
          border-radius: 12px;
          color: #f3f4f6;
          font-weight: 500;
          transition: all 0.2s;
          display: block;
        }
        .nav-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
