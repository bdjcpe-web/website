/**
 * @file @/app/activites/[slug]/page.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Page informations des activités.
 * Contient des infos spéciales membres avec lien vers la page de cotisation.
 */

import { activites } from '@/data/activites';
import { reseaux } from '@/data/reseaux';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './Activite.module.css';

export async function generateStaticParams() {
  return activites.map((a) => ({ slug: a.slug }));
}

export default async function ActivitePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const activite = activites.find((a) => a.slug === params.slug);

  if (!activite) notFound();

  // ── LOGIQUE SIDEBAR (Pré-calculée hors du JSX) ──
  const isDiscord = activite.slug === 'gaming' || activite.slug === 'esport';
  const sidebarConfig = {
    bgColor: isDiscord ? '#c0cbff' : '#b7f0c8',
    iconColor: isDiscord ? '#5865F2' : '#25D366',
    link: isDiscord ? reseaux.find((n) => n.name === 'Discord')?.link : reseaux.find((n) => n.name === 'WhatsApp')?.link,
    iconClass: isDiscord ? 'ph-discord-logo' : 'ph-whatsapp-logo',
    label: isDiscord ? 'Rejoindre le Discord' : 'Rejoindre sur WhatsApp',
  };

  return (
    <div
      className={styles.pageContainer}
      style={{ '--theme-color': activite.color } as React.CSSProperties}
    >

      {/* ── HIGH-FIDELITY HERO ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url("${activite.image}")` }}
          aria-hidden="true"
        />
        <div className={styles.heroGradient} aria-hidden="true" />

        <div className={`container animate-fade-in ${styles.heroContent}`}>
          <Link href="/#activities" className={styles.backBtn}>
            <i className="ph ph-arrow-left" aria-hidden="true" /> Retour aux activités
          </Link>

          <div className={styles.heroTitleWrapper}>
            <i className={`ph-fill ${activite.icon} ${styles.heroIcon}`} aria-hidden="true" />
            <div>
              <h1 className={styles.heroTitle}>{activite.title}</h1>
              <p className={styles.heroTagline}>{activite.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THÈME DIVIDER ── */}
      <div className={styles.dividerWrapper} aria-hidden="true">
        <div className={styles.divider} />
      </div>

      {/* ── CONTENT ── */}
      <main className="container section-padding">
        <div className={styles.contentGrid}>

          {/* 1. Colonne Principale — Présentation + Détails */}
          <div className={styles.mainCol}>
            <section>
              <h2 className={`section-title ${styles.presentationTitle}`}>Présentation</h2>
              <p className={styles.presentationText}>{activite.description}</p>
            </section>

            <section className={styles.detailsBox}>
              <h3 className={styles.detailsTitle}>Détails du Pôle</h3>
              <ul className={styles.detailsList}>
                {activite.details.map((detail, i) => {
                  const isMembre = detail.startsWith('[MEMBRE]');
                  const text = isMembre ? detail.replace('[MEMBRE]', '').trim() : detail;

                  return (
                    <li key={i} className={styles.detailItem}>
                      <i
                        className={`ph-fill ${isMembre ? 'ph-crown' : 'ph-check-circle'} ${styles.detailIcon}`}
                        style={{ color: isMembre ? 'var(--c-gold)' : 'var(--theme-color)' }}
                        aria-hidden="true"
                      />
                      <span>
                        {isMembre && (
                          <Link href="/cotisation" className={styles.memberBadge}>
                            <i className="ph-fill ph-crown" aria-hidden="true" /> MEMBRES
                          </Link>
                        )}
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* 2. Colonne Latérale (Passe automatiquement en dessous sur mobile) */}
          <aside
            className={styles.sidebar}
            style={{ backgroundColor: sidebarConfig.bgColor }}
          >
            <i
              className={`ph ${sidebarConfig.iconClass} ${styles.sidebarIcon}`}
              style={{ color: sidebarConfig.iconColor }}
              aria-hidden="true"
            />
            <h3 className={styles.sidebarTitle}>Envie de rejoindre ?</h3>
            <p className={styles.sidebarText}>Toutes nos activités sont ouvertes aux membres de l'école.</p>

            <a
              href={sidebarConfig.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn ${styles.sidebarBtn}`}
              style={{ backgroundColor: sidebarConfig.iconColor }}
            >
              <i className={`ph ${sidebarConfig.iconClass}`} aria-hidden="true" />
              {sidebarConfig.label}
            </a>
          </aside>

        </div>
      </main>
    </div>
  );
}