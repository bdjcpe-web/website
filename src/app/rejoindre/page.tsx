import Link from 'next/link';

export const metadata = {
  title: 'Nous Rejoindre - BDJ',
  description: 'Rejoins le Bureau des Jeux sur nos différents réseaux sociaux.',
};

const networks = [
  {
    name: 'Instagram',
    desc: 'Toutes les actus et photos de nos événements.',
    icon: 'ph ph-instagram-logo',
    color: '#E1306C',
    link: 'https://www.instagram.com/bdj_cpe/',
  },
  {
    name: 'Discord',
    desc: 'Le cœur de la communauté gaming : chill, pôle esport et serveur minecraft.',
    icon: 'ph ph-discord-logo',
    color: '#5865F2',
    link: 'https://discord.gg/dK3rNUujHS',
  },
  {
    name: 'WhatsApp',
    desc: 'Le groupe officiel pour les annonces et inscriptions aux événements.',
    icon: 'ph ph-whatsapp-logo',
    color: '#25D366',
    link: 'https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C',
  },
  {
    name: 'Twitch',
    desc: 'Suis les matchs de nos équipes esport et événements spéciaux en direct.',
    icon: 'ph ph-twitch-logo',
    color: '#9146FF',
    link: 'https://www.twitch.tv/bdjcpe',
  },
  {
    name: 'Email',
    desc: 'Pour nous contacter directement (partenariats, questions diverses).',
    icon: 'ph ph-envelope-simple',
    color: '#ea4335',
    link: 'mailto:bdj.cpe@gmail.com',
  }
];

export default function RejoindrePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '160px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* ── BACKGROUND ACCENTS ── */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '600px', height: '600px', background: 'var(--c-bordeaux)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }} />

      <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 className="section-title">Nous Rejoindre</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--c-grey-medium)', maxWidth: '600px', margin: '20px auto 0', fontWeight: 500 }}>
            Suis nous sur nos réseaux pour ne rien rater de nos événements !
          </p>
          <div style={{ width: '80px', height: '4px', background: 'var(--c-bordeaux)', margin: '40px auto 0', borderRadius: '2px' }} />
        </div>

        {/* ── LINKS GRID — Row 1: Insta | WhatsApp | Row 2: Discord | Twitch | Row 3: Email ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Row 1 */}
          {[networks[0], networks[2]].map((net) => (
            <a key={net.name} href={net.link} target="_blank" className="social-card" style={{ '--brand-color': net.color } as any}>
              <div className="social-icon-wrapper" style={{ background: net.color }}>
                <i className={`${net.icon} social-icon`} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{net.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)', margin: 0, lineHeight: 1.5 }}>{net.desc}</p>
              </div>
            </a>
          ))}

          {/* Row 2 */}
          {[networks[1], networks[3]].map((net) => (
            <a key={net.name} href={net.link} target="_blank" className="social-card" style={{ '--brand-color': net.color } as any}>
              <div className="social-icon-wrapper" style={{ background: net.color }}>
                <i className={`${net.icon} social-icon`} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{net.name}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)', margin: 0, lineHeight: 1.5 }}>{net.desc}</p>
              </div>
            </a>
          ))}

          {/* Row 3 — Email centered */}
          <a href={networks[4].link} className="social-card" style={{ '--brand-color': networks[4].color, gridColumn: '1 / -1' } as any}>
            <div className="social-icon-wrapper" style={{ background: networks[4].color }}>
              <i className={`${networks[4].icon} social-icon`} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{networks[4].name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)', margin: 0, lineHeight: 1.5 }}>{networks[4].desc}</p>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        .social-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: #fff;
          border: 1.5px solid var(--brand-color);
          border-radius: 24px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }
        .social-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px color-mix(in srgb, var(--brand-color) 20%, transparent);
        }
        .social-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s;
        }
        .social-card:hover .social-icon-wrapper {
          transform: scale(1.08);
        }
        .social-icon {
          font-size: 2rem;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
