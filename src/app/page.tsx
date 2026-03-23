import Link from 'next/link';
import { getUpcomingEvents } from '@/lib/calendar';
import { activites } from '@/data/activites';

export default async function HomePage() {
  const nextThreeEvents = await getUpcomingEvents(3);

  return (
    <main>

      {/* ── SECTION 1: HERO ── */}
      <section className="animate-fade-in" style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url("/hero.avif") center 30%/cover no-repeat',
          filter: 'brightness(0.4)',
          zIndex: 1
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent, rgba(0,0,0,0.4))', zIndex: 2 }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: '10%' }}>
          <h1 className="title-hero" style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', color: '#fff' }}>
            BUREAU DES JEUX
          </h1>

          {/* Fine straight divider */}
          <div style={{ width: '100px', height: '1.5px', background: '#fff', margin: '30px auto' }} />

          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 40px', fontWeight: 400 }}>
            L'association étudiante pour tous les gamers et passionnés de jeux de CPE Lyon.
          </p>

          <Link href="/cotisation" className="btn btn-gold">
            Devenir membre
          </Link>
        </div>
      </section>

      {/* ── SECTION 2: ÉVÉNEMENTS ── */}
      <section id="events" className="section-padding">
        <div className="container">
          <h2 className="section-title">Événements</h2>
          <p className="section-subtitle">Les prochains rendez-vous à ne pas manquer.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '60px', maxWidth: '900px', margin: '60px auto 0' }}>
            {nextThreeEvents.map((event, idx) => {
              const themeColor = event.color;
              return (
                <div key={idx} className="card-event" style={{ borderColor: themeColor, boxShadow: `0 8px 30px ${themeColor}30` }}>
                  <div style={{ background: themeColor, borderRadius: '16px', padding: '16px', textAlign: 'center', minWidth: '80px', color: '#000' }}>
                    <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{event.day}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{event.month}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#000', marginBottom: '4px' }}>{event.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--c-grey-medium)', fontSize: '0.9rem' }}>
                      {event.time && <span><i className="ph ph-clock" style={{ color: themeColor }} /> {event.time}</span>}
                      {event.desc && <span style={{ color: themeColor, fontWeight: 600, fontSize: '0.85rem' }}>{event.desc}</span>}
                    </div>
                  </div>
                  {event.color === '#e63946' || event.color === 'var(--c-gaming)' ? (
                    <a href="https://discord.gg/dK3rNUujHS" target="_blank" rel="noopener noreferrer"
                      className="btn" style={{ padding: '10px 18px', fontSize: '0.8rem', background: '#5865F2', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <i className="ph ph-discord-logo" /> Discord
                    </a>
                  ) : (
                    <a href="https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C" target="_blank" rel="noopener noreferrer"
                      className="btn" style={{ padding: '10px 18px', fontSize: '0.8rem', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <i className="ph ph-whatsapp-logo" /> WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/evenements" className="btn btn-premium">Voir tout le calendrier</Link>
          </div>
        </div>
      </section>

      {/* ── THIN BORDEAUX DIVIDER ── */}
      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--c-bordeaux), transparent)', margin: '0 10%' }} />

      {/* ── SECTION 3: ACTIVITÉS (Bento Grid) ── */}
      <section id="activities" className="section-padding" style={{ background: '#fcfcfc' }}>
        <div className="container">
          <h2 className="section-title">Nos Activités</h2>
          <p className="section-subtitle">Chaque pôle a sa propre ambiance, choisis le tien.</p>

          <div className="bento-grid" style={{ marginTop: '60px' }}>
            {/* Le Local (Wide & Tall) */}
            <Link href="/le-local" className="bento-item" style={{
              gridColumn: 'span 2', gridRow: 'span 2',
              borderColor: '#e6d5b8', borderWidth: '2.5px',
              '--shadow-color': 'rgba(230, 213, 184, 0.85)'
            } as any}>
              <img src="/activities/local.jpg" alt="Le Local" />
              <div className="bento-overlay" />
              <div className="bento-content">
                <i className="ph ph-armchair bento-icon" style={{ color: '#e6d5b8' }} />
                <h3 className="bento-title">LE LOCAL</h3>
                <p className="bento-desc">Canapé, consoles, jeux, micro-ondes...<br /> l'endroit parfait pour kiffer avec tes potes.</p>
                <div className="bento-line" style={{ background: 'var(--c-local)' }} />
              </div>
            </Link>

            {/* Other Poles */}
            {activites.slice(0, 4).map((act) => {
              // act.color is the real hex — safe to use in CSS var and border
              return (
                <Link key={act.slug} href={`/activites/${act.slug}`} className="bento-item" style={{
                  borderColor: act.color, borderWidth: '2.5px',
                  '--shadow-color': `${act.color}CC`
                } as any}>
                  <img src={act.image || "/activities/local.jpg"} alt={act.title} />
                  <div className="bento-overlay" />
                  <div className="bento-content">
                    <i className={`ph ${act.icon || 'ph-game-controller'} bento-icon`} style={{ color: act.color }} />
                    <h4 className="bento-title">{act.title.toUpperCase()}</h4>
                    <p className="bento-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{act.tagline}</p>
                    <div className="bento-line" style={{ background: act.color }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ESPORT (Full Width Neon) ── */}
      <section className="esport-section" style={{ padding: '120px 0' }}>
        {/* Red neon effect via filter instead of overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url("/activities/esport.jpg") center/cover no-repeat',
          filter: 'brightness(0.45) sepia(1) saturate(4) hue-rotate(190deg)',
          opacity: 0.9,
          zIndex: 1
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <h2 className="neon-text-red" style={{ fontSize: 'clamp(4rem, 15vw, 10rem)', fontWeight: 750, margin: 0 }}>ESPORT</h2>
          <p style={{ fontSize: '1.5rem', color: 'var(--c-white)', opacity: 0.8, marginBottom: '40px' }}>Découvre nos équipes esport et rejoins la compétition auprès de joueurs passionnés.</p>
          <Link href="/esport" className="btn btn-esport" style={{ scale: '1.2' }}>En savoir plus</Link>
        </div>
      </section>
    </main>
  );
}
