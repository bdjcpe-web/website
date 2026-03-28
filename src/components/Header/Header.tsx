/**
 * @file src/components/Header/Header.tsx
 * @author Loann Cordel - President du BDJ
 * @date 27/03/2026
 * @description Header du site web
 * @depedencies : 
 * - Link from 'next/link'
 * - useState, useEffect from 'react'
 * - useSession, signOut from 'next-auth/react'
 * - usePathname from 'next/navigation'
 * - styles from './Header.module.css'
 */

'use client';   // Directive pour indiquer que ce composant est un composant client

// Importations
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <header className="navbar">
      <div className={styles.headerContainer}>

        {/* ── GAUCHE : Logo + Navigation PC ── */}
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logoWrapper}>
            <img src="/bdj_logo.png" alt="BDJ Logo" className={styles.logoImg} />
          </Link>

          <nav className={`${styles.desktopOnly} ${styles.navLinks}`}>
            {/* 'btn btn-esport btn-sm' sont globales */}
            <Link href="/esport" className="btn btn-esport btn-sm">ESPORT</Link>
            {/* 'nav-link' est globale */}
            <Link href="/#events" className="nav-link">Événements</Link>
            <Link href="/#activities" className="nav-link">Activités</Link>
            <Link href="/#partenaires" className="nav-link">Partenaires</Link>
          </nav>
        </div>

        {/* ── DROITE : Actions ── */}
        <div className={styles.headerRight}>

          <div className={`${styles.desktopOnly} ${styles.headerActionsDesktop}`}>
            <Link href="/rejoindre" className="btn btn-premium">Nous rejoindre</Link>
            <Link href="/le-local" className="btn btn-gold">Réserver le local</Link>
          </div>

          <Link href="/cotisation" className={styles.crownCta} title="Devenir membre">
            <i className="ph-fill ph-crown" />
            <span className={styles.desktopOnly}>
              {!session?.user?.isMember ? 'Avantages Membre' : 'Devenir Membre'}
            </span>
          </Link>

          <div
            className={styles.profileWrapper}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className={`${styles.profileIcon} ${status === 'authenticated' ? styles.auth : ''}`}>
              <i className={status === 'authenticated' ? 'ph ph-user' : 'ph ph-user-circle'} />
            </div>

            {profileOpen && (
              <div className={styles.profileDropdown}>
                {status === 'authenticated' && session.user && (
                  <div className={styles.dropdownHeader}>
                    <p className={styles.userName}>{session.user.name}</p>
                    <p className={styles.userEmail}>{session.user.email}</p>
                  </div>
                )}

                <div className={styles.dropdownMenu}>
                  {status !== 'authenticated' ? (
                    <>
                      <Link href="/login" className={styles.navDropdownItem}>Se connecter</Link>
                      <Link href="/cotisation" className={`${styles.navDropdownItem} ${styles.goldText}`}>Devenir Membre</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/profil" className={styles.navDropdownItem}>Mon Profil</Link>
                      <Link href="/cotisation" className={`${styles.navDropdownItem} ${styles.goldText}`}>Devenir Membre</Link>
                      <Link href="/le-local" className={styles.navDropdownItem}>Le Local</Link>
                      <div className={styles.divider} />
                      <button onClick={() => signOut()} className={`${styles.navDropdownItem} ${styles.logoutBtn}`}>Déconnexion</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className={`${styles.mobileOnly} ${styles.hamburgerBtn}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <i className="ph ph-dots-three-vertical" />
          </button>

        </div>
      </div>

      {/* ── LE TIROIR LATÉRAL (MOBILE DRAWER) ── */}
      <div className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.drawerOverlay} onClick={() => setMobileMenuOpen(false)} />

        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <img src="/bdj_logo.png" alt="BDJ" className={styles.drawerLogo} />
            <button className={styles.closeBtn} onClick={() => setMobileMenuOpen(false)}>
              <i className="ph ph-x" />
            </button>
          </div>

          <nav className={styles.drawerNav}>
            <Link href="/esport" className={`${styles.drawerLink} ${styles.neonText}`}>ESPORT</Link>
            <Link href="/#events" className={styles.drawerLink}>Événements</Link>
            <Link href="/#activities" className={styles.drawerLink}>Activités</Link>
            <Link href="/#partenaires" className={styles.drawerLink}>Partenaires</Link>

            <div className={styles.divider} style={{ margin: '2rem 0' }} />

            <Link href="/rejoindre" className="btn btn-premium">Nous rejoindre</Link>
            <Link href="/le-local" className="btn btn-gold">Réserver le local</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}