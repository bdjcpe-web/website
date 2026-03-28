/**
 * @file src/components/Footer/Footer.tsx
 * @author Loann CORDEL
 * @date 27/03/2026
 * @description Composant Footer avec les partenaires et les réseaux sociaux
 */

import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} footer shadow-inner`}>
      <div className={`${styles.mainGrid} container`}>

        {/* ── Brand Section ── */}
        <section className={styles.brandWrapper}>
          <div className={styles.brandHeader}>
            <img
              src="/bdj_logo.png"
              alt="BDJ Logo"
              className={styles.logo}
            />
            <h3 className={styles.brandTitle}>BUREAU DES JEUX</h3>
          </div>
          <p className={styles.tagline}>Association étudiante gaming de CPE Lyon.</p>
        </section>

        {/* ── Socials Section ── */}
        <section className={styles.socialsWrapper}>
          <h4 className={styles.sectionTitle}>Nos réseaux</h4>
          <div className={styles.socialsList}>
            <a href="https://www.instagram.com/bdj_cpe/" target="_blank" rel="noopener noreferrer" className="social-circle">
              <i className={`ph ph-instagram-logo ${styles.iconSize}`}></i>
            </a>
            <a href="https://discord.gg/dK3rNUujHS" target="_blank" rel="noopener noreferrer" className="social-circle">
              <i className={`ph ph-discord-logo ${styles.iconSize}`}></i>
            </a>
            <a href="https://www.twitch.tv/bdjcpe" target="_blank" rel="noopener noreferrer" className="social-circle">
              <i className={`ph ph-twitch-logo ${styles.iconSize}`}></i>
            </a>
            <a href="https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C" target="_blank" rel="noopener noreferrer" className="social-circle">
              <i className={`ph ph-whatsapp-logo ${styles.iconSize}`}></i>
            </a>
          </div>
        </section>

        {/* ── Contacts Section ── */}
        <section className={styles.contactWrapper}>
          <h4 className={styles.sectionTitle}>Contact</h4>
          <p className={styles.contactText}>bdj.cpe@gmail.com</p>
          <address className={styles.address}>
            43 Bd du 11 Novembre 1918,<br />
            69100 Villeurbanne
          </address>
        </section>
      </div>

      {/* ── Partners strip ── */}
      <div id="partenaires" className={`${styles.partnersStrip} container`}>
        <p className={styles.partnersTitle}>Partenaires &amp; soutiens</p>
        <div className={styles.partnersList}>
          <img src="/partenaires/logo-cpe.png" alt="CPE Lyon" className={styles.partnerLogo} />
          <img src="/partenaires/Sopra_Steria_logo.svg" alt="Sopra Steria" className={styles.partnerLogo} />
          <img src="/partenaires/logo-play-in-park.png" alt="Play in Park" className={styles.partnerLogo} />
        </div>
      </div>

      <div className={styles.copyright}>
        <p className={styles.copyrightText}>
          &copy; {currentYear} Bureau des Jeux de CPE Lyon. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}