import { activites } from '@/data/activites';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return activites.map((a) => ({ slug: a.slug }));
}

export default async function ActivitePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const activite = activites.find((a) => a.slug === params.slug);
  if (!activite) notFound();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--c-white)' }}>
      
      {/* ── HIGH-FIDELITY HERO ── */}
      <div style={{ 
        position: 'relative', 
        paddingTop: '160px', 
        paddingBottom: '80px', 
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: `url("${activite.image}") center/cover no-repeat`,
          filter: 'brightness(0.4)',
          zIndex: 1
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent, rgba(0,0,0,0.4))', zIndex: 2 }} />

        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>
          <Link href="/#activities" className="btn" style={{ color: '#fff', marginBottom: '2rem', padding: '8px 20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
            <i className="ph ph-arrow-left" style={{ marginRight: '8px' }} /> Retour aux activités
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <i className={`ph ${activite.icon}`} style={{
              fontSize: '4rem',
              color: activite.color,
              filter: `drop-shadow(0 0 12px ${activite.color}99)`
            }} />
            <div>
              <h1 className="title-hero" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#fff', margin: 0 }}>{activite.title.toUpperCase()}</h1>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: activite.color, letterSpacing: '0.05em', marginTop: '6px' }}>{activite.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tapered theme divider ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-1px' }}>
        <div style={{
          height: '2px',
          width: '75%',
          background: `linear-gradient(to right, transparent, ${activite.color}, transparent)`,
          borderRadius: '2px'
        }} />
      </div>

      {/* ── CONTENT ── */}
      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Main Column — Présentation + Détails */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2rem', color: 'var(--c-bordeaux)', marginBottom: '1.5rem' }}>Présentation</h2>
              <p style={{ color: 'var(--c-grey-medium)', fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 400 }}>{activite.description}</p>
            </div>

            <div style={{ padding: '2.5rem', background: '#f9f9f9', borderRadius: '32px', border: `2px solid ${activite.color}99`, boxShadow: `0 12px 40px ${activite.color}80` }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--c-bordeaux)', marginBottom: '1.5rem' }}>Détails du Pôle</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activite.details.map((detail, i) => {
                  const isMembre = detail.startsWith('[MEMBRE]');
                  const text = isMembre ? detail.replace('[MEMBRE]', '').trim() : detail;
                  return (
                    <li key={i} style={{ display: 'flex', gap: '12px', color: 'var(--c-grey-dark)', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5, alignItems: 'flex-start' }}>
                      <i className={`ph ${isMembre ? 'ph-crown' : 'ph-check-circle'}`} style={{ color: isMembre ? 'var(--c-gold)' : activite.color, marginTop: '3px', fontSize: '1.2rem', flexShrink: 0 }} />
                      <span>
                        {isMembre && (
                          <Link href="/cotisation" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(200,155,60,0.1)', border: '1px solid rgba(200,155,60,0.35)', borderRadius: '6px', padding: '1px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#8a6a00', marginRight: '8px', textDecoration: 'none', letterSpacing: '0.05em' }}>
                            <i className="ph-fill ph-crown" style={{ fontSize: '0.75rem' }} /> MEMBRES
                          </Link>
                        )}
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Sidebar — Envie de rejoindre */}
          {(() => {
            const isDiscord = activite.slug === 'gaming' || activite.slug === 'esport';
            const bgColor = isDiscord ? '#c0cbff' : '#b7f0c8'; /* Pastel Discord blue / Pastel WhatsApp green */
            const link = isDiscord
              ? 'https://discord.gg/dK3rNUujHS'
              : 'https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C';
            const icon = isDiscord ? 'ph-discord-logo' : 'ph-whatsapp-logo';
            const label = isDiscord ? 'Rejoindre le Discord' : 'Rejoindre sur WhatsApp';
            const btnBg = isDiscord ? '#5865F2' : '#25D366';
            return (
              <div style={{ padding: '2.5rem', background: bgColor, borderRadius: '32px', textAlign: 'center', position: 'sticky', top: '110px' }}>
                <i className={`ph ${icon}`} style={{ fontSize: '3rem', color: isDiscord ? '#5865F2' : '#25D366', marginBottom: '1rem', display: 'block' }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem', color: '#111' }}>Envie de rejoindre ?</h3>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem', color: '#111' }}>Toutes nos activités sont ouvertes aux membres de l'école.</p>
                <a href={link} target="_blank" rel="noopener noreferrer" className="btn" style={{ width: '100%', background: btnBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <i className={`ph ${icon}`} /> {label}
                </a>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
