/**
 * @file src/components/Auth/AuthLayout.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Client Component
 * @description Layout pour les pages d'authentification du site du BDJ CPE Lyon.
 * @requires
 * - '@/components/Auth/AuthLayout.module.css' : Styles isolés du composant.
 * - 'next/link' : Pour la navigation entre les pages.
 */

'use client';
import Link from 'next/link';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    icon: string;
    theme: 'bordeaux' | 'gold';
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
};

export default function AuthLayout({
    children, title, subtitle, icon, theme, footerText, footerLinkText, footerLinkHref
}: AuthLayoutProps) {

    // Variables CSS dynamiques selon le thème choisi
    const cssVars = {
        '--auth-main': theme === 'bordeaux' ? 'var(--c-bordeaux)' : 'var(--c-gold)',
        '--auth-shadow': theme === 'bordeaux' ? 'rgba(109, 12, 36, 0.2)' : 'rgba(225, 184, 47, 0.2)',
        '--auth-focus': theme === 'bordeaux' ? 'rgba(109, 12, 36, 0.05)' : 'rgba(225, 184, 47, 0.05)',
    } as React.CSSProperties;

    return (
        <div className={styles.pageWrapper} style={cssVars}>

            <div className={styles.bgDecor1} aria-hidden="true" />
            <div className={styles.bgDecor2} aria-hidden="true" />

            <div className={`animate-fade-in ${styles.cardContainer}`}>
                <div className={styles.cardInner}>

                    <header className={styles.header}>
                        <div className={styles.iconBox}>
                            <i className={`ph ${icon}`} aria-hidden="true" />
                        </div>
                        <h1 className={styles.title}>{title}</h1>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </header>

                    {/* Formulaire injecté ici */}
                    {children}

                    <footer className={styles.footer}>
                        <p className={styles.footerText}>
                            {footerText}
                            <Link href={footerLinkHref} className={styles.footerLink}>
                                {footerLinkText}
                            </Link>
                        </p>
                    </footer>

                </div>

                <div className={styles.backWrapper}>
                    <Link href="/" className={styles.backLink}>
                        <i className="ph ph-arrow-left" aria-hidden="true" /> Retour au site
                    </Link>
                </div>
            </div>

        </div>
    );
}