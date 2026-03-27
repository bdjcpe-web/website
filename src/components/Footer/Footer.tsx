'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer shadow-inner" style={{ position: 'relative', zIndex: 20 }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', alignItems: 'start' }}>

        {/* ── Left: Brand ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img src="/bdj_logo.png" alt="BDJ" style={{ height: '50px' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--c-gold)', letterSpacing: '0.05em' }}>
              BUREAU DES JEUX
            </h3>
          </div>
          <p style={{ color: 'var(--c-grey-medium)', fontSize: '0.9rem' }}>Association étudiante gaming de CPE Lyon.</p>
        </div>

        {/* ── Center: Socials ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h4 style={{ fontWeight: 800, color: 'var(--c-bordeaux)' }}>Nos réseaux</h4>
          <div style={{ display: 'flex', gap: '1em' }}>
            <a href="https://www.instagram.com/bdj_cpe/" target="_blank" className="social-circle">
              <i className="ph ph-instagram-logo" style={{ fontSize: '1.25rem' }}></i>
            </a>
            <a href="https://discord.gg/dK3rNUujHS" target="_blank" className="social-circle">
              <i className="ph ph-discord-logo" style={{ fontSize: '1.25rem' }}></i>
            </a>
            <a href="https://www.twitch.tv/bdjcpe" target="_blank" className="social-circle">
              <i className="ph ph-twitch-logo" style={{ fontSize: '1.25rem' }}></i>
            </a>
            <a href="https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C" target="_blank" className="social-circle">
              <i className="ph ph-whatsapp-logo" style={{ fontSize: '1.25rem' }}></i>
            </a>
          </div>
        </div>

        {/* ── Right: Contacts ── */}
        <div style={{ textAlign: 'right' }}>
          <h4 style={{ fontWeight: 800, color: 'var(--c-bordeaux)', marginBottom: '12px' }}>Contact</h4>
          <p style={{ color: 'var(--c-grey-medium)', marginBottom: '4px' }}>bdj.cpe@gmail.com</p>
          <p style={{ color: 'var(--c-grey-medium)', fontSize: '0.85rem' }}>43 Bd du 11 Novembre 1918,<br />69100 Villeurbanne</p>
        </div>
      </div>

      {/* ── Partners strip ── */}
      <div className="container" style={{ marginTop: '20px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--c-grey-medium)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>Partenaires &amp; soutiens</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <img src="/partenaires/logo-cpe.png" alt="CPE Lyon" style={{ height: '3em', transition: 'opacity 0.2s, filter 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }} />
          <img src="/partenaires/Sopra_Steria_logo.svg" alt="Sopra Steria" style={{ height: '3em', transition: 'opacity 0.2s, filter 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }} />
          <img src="/partenaires/logo-play-in-park.png" alt="Play in Park" style={{ height: '3em', transition: 'opacity 0.2s, filter 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }} />
          <img src="/partenaires/logo-le-monde-en-jeux.png" alt="Le Monde en Jeu" style={{ height: '3em', transition: 'opacity 0.2s, filter 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }}
            onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.filter = 'grayscale(0)'; }} />
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <p style={{ color: 'var(--c-grey-medium)', fontSize: '0.8rem', fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} Bureau des Jeux de CPE Lyon. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
