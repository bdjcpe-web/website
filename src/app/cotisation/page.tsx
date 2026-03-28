import Link from 'next/link';
import { benefits } from '@/data/benefits';
import styles from './Cotisation.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Cotisation — BDJ CPE Lyon',
  description: 'Découvre tous les avantages de la cotisation BDJ et rejoins la communauté gaming de CPE Lyon.',
};

export default async function CotisationPage() {
  // ── LOGIQUE MÉTIER SERVEUR ──
  const session = await getServerSession(authOptions);
  let isMember = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isMember: true }
    });
    isMember = user?.isMember || false;
  }

  return (
    <div className={styles.pageContainer}>

      {/* ── BACKGROUND ACCENTS ── */}
      <div className={styles.bgAccent1} aria-hidden="true" />
      <div className={styles.bgAccent2} aria-hidden="true" />

      <div className={`container animate-fade-in ${styles.contentWrapper}`}>

        {/* ── HERO ── */}
        <header className={styles.header}>
          <p className={styles.subTitle}>Adhésion 2026–2027</p>
          <h1 className="section-title">Deviens Membre BDJ</h1>
          <p className={styles.desc}>
            Pour 10€, soutiens ton bureau des jeux et débloque l'accès à tous les avantages exclusifs de la communauté.
          </p>
          <div className={styles.divider} aria-hidden="true" />
        </header>

        {/* ── MAIN LAYOUT ── */}
        <main className={styles.mainLayout}>

          {/* LEFT: Grille des avantages */}
          <section className={styles.benefitsSection}>
            {benefits.map((b) => (
              <article
                key={b.title}
                className={styles.card}
                style={{ '--theme-color': b.color } as React.CSSProperties}
              >
                <div className={styles.cardIconBox} aria-hidden="true">
                  <i className={`ph-fill ${b.icon} ${styles.cardIcon}`} />
                </div>

                <h3 className={styles.cardTitle}>{b.title}</h3>
                <p className={styles.cardDesc}>{b.desc}</p>
              </article>
            ))}
          </section>

          {/* RIGHT: Bandeau CTA Dynamique */}
          <aside className={styles.ctaBanner}>
            {isMember ? (
              // ── VUE : UTILISATEUR DÉJÀ MEMBRE ──
              <div className={styles.thankYouBox}>
                <i className="ph-fill ph-crown" style={{ fontSize: '4rem', color: 'var(--c-gold)', marginBottom: '1rem' }} aria-hidden="true" />
                <h2 className={styles.ctaTitle}>Merci d'être membre !</h2>
                <p className={styles.ctaText} style={{ marginBottom: 0 }}>
                  Tu profites actuellement de tous les avantages de la cotisation pour l'année universitaire en cours.
                </p>
              </div>
            ) : (
              // ── VUE : VISITEUR / NON-MEMBRE ──
              <>
                <h2 className={styles.ctaTitle}>Prêt à rejoindre l'aventure ?</h2>
                <p className={styles.ctaText}>
                  La cotisation est valable pour toute l'année universitaire.<br />
                  Paiement sécurisé via HelloAsso.
                </p>

                <div className={styles.pricingBox}>
                  <p className={styles.pricingLabel}>Cotisation annuelle</p>
                  <p className={styles.pricingAmount}>10€</p>

                  <iframe
                    id="haWidgetButton"
                    src="https://www.helloasso.com/associations/bureau-des-jeux-cpe-lyon/adhesions/adhesion-bdj-cpe-lyon-26-27/widget-bouton"
                    className={styles.haWidget}
                    title="Bouton de paiement HelloAsso"
                  />

                  <p className={styles.pricingMethods}>CB · Apple/Google Pay · PayPal</p>
                </div>
              </>
            )}
          </aside>

        </main>

      </div>
    </div>
  );
}