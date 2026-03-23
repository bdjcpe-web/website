import { esportGames } from '@/data/esport';
import Link from 'next/link';

export default function EsportPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', overflowX: 'hidden', position: 'relative' }}>

      {/* subtle red glow radial gradient only */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 77, 0.05) 0%, transparent 80%)',
        zIndex: 1
      }} />

      {/* Content wrapper with relative positioning */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── HIGH-FIDELITY CAROUSEL SECTION ── */}
        <div style={{ textAlign: 'center', padding: '60px 0 0', position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,26,60,0.7)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>BDJ Esport</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 950, color: '#fff', margin: 0, lineHeight: 1.1 }}>
            Découvre nos <span style={{ color: '#ff1a3c' }}>Rosters</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem', marginTop: '12px', marginBottom: '40px' }}>
            Clique sur un jeu pour voir le roster complet
          </p>
        </div>
        <div style={{
          borderTop: '2px solid rgba(255, 26, 60, 0.3)',
          borderBottom: '2px solid rgba(255, 26, 60, 0.3)',
          backgroundColor: '#000',
          padding: '20px 0'
        }}>
          <div style={{
            width: '85%',
            margin: '0 auto',
            height: '58vh',
            display: 'flex',
            gap: '10px',
            transform: 'skewX(-10deg)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 26, 60, 0.2)'
          }}>
            {esportGames.map((game, index) => {
              const bgFile = game.slug === 'league-of-legends' ? 'bg-lol.jpg'
                : game.slug === 'rocket-league' ? 'bg-rl.jpg'
                  : `bg-${game.shortName.toLowerCase()}.jpg`;

              return (
                <Link
                  key={game.slug}
                  href={`/esport/${game.slug}`}
                  className="esport-panel"
                  style={{
                    flex: 1,
                    position: 'relative',
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    overflow: 'hidden',
                    textDecoration: 'none'
                  }}
                >
                  {/* Background Layer */}
                  <div style={{ position: 'absolute', inset: '-20%', transform: 'skewX(10deg)' }}>
                    <div className="game-bg" style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(/games/${bgFile})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'grayscale(0.5) brightness(0.65)',
                      transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                    }} />
                    <div className="game-overlay" style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(to top, #000 0%, transparent 100%)`,
                      opacity: 0.8,
                      transition: 'opacity 0.4s'
                    }} />
                  </div>

                  {/* Content Layer */}
                  <div style={{
                    position: 'relative', zIndex: 10, height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                    padding: '30px 20px', transform: 'skewX(10deg) translateX(-15px)',
                    textAlign: 'center'
                  }}>
                    <img src={game.logoUrl} alt={game.name} style={{
                      height: '100px', width: 'auto', objectFit: 'contain',
                      filter: `drop-shadow(0 0 20px ${game.color}40)`,
                      marginBottom: '20px',
                      transition: 'transform 0.4s'
                    }} className="game-logo" />

                    {/* Game info — always visible */}
                    <div className="game-info" style={{ transition: 'all 0.4s' }}>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 950, color: '#fff', textTransform: 'uppercase', margin: 0 }}>
                        {game.name}
                      </h2>
                      <p style={{ color: game.color, fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '8px' }}>
                        {game.recruiting ? 'RECRUTEMENT OUVERT' : 'ÉQUIPE COMPLÈTE'}
                      </p>
                    </div>
                  </div>

                  {/* Neon Border on hover */}
                  <div className="neon-border" style={{
                    position: 'absolute', inset: 0, border: `2px solid ${game.color}`,
                    opacity: 0, transition: 'opacity 0.3s', zIndex: 5, pointerEvents: 'none',
                    boxShadow: `inset 0 0 30px ${game.color}40, 0 0 30px ${game.color}40`
                  }} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── INFO & TWITCH SECTION ── */}
        <div className="container section-padding" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <div>
            <h1 className="neon-text-red" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
              BDJ ESPORT
            </h1>
            <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600, marginBottom: '30px', opacity: 0.9 }}>
              Affrontes les meilleures écoles de France sous nos couleurs dans les ligues et LAN nationales.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['Compétitions inter-écoles', 'Accompagnement et session coaching', 'Diffusion de tous les matchs sur notre chaîne Twitch officielle', 'LANs et déplacements nationaux'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                  <i className="ph-fill ph-check-circle" style={{ color: '#ff1a3c', fontSize: '1.5rem' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-20px', background: 'var(--c-bordeaux)', filter: 'blur(60px)', opacity: 0.1 }} />
            <div style={{ background: '#0a0a0a', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '16px 24px', background: '#9146FF', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                <div className="pulse" style={{ width: '8px', height: '8px', background: '#ff4b4b', borderRadius: '50%' }} />
                LIVE TWITCH
              </div>
              <iframe
                src="https://player.twitch.tv/?channel=bdjcpe&parent=localhost&autoplay=false"
                style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* ── LEAGUES TIMELINE ── */}
        {(() => {
          // Academic year: Sept → July (11 months)
          const MONTHS = ['Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'];
          // Each month = 1 column unit. Col index 0 = Sept.
          // startMonth 0 = Sept, 1 = Oct, … 4 = Jan, 5 = Fév, 6 = Mar, 7 = Avr, 8 = Mai, 9 = Jun, 10 = Jul
          const leagues = [
            {
              name: 'PORO Ligue',
              game: 'League of Legends',
              color: '#ffdf9a',
              start: 5, // Février
              end: 8,   // Mai
              url: 'https://ligueporo.fr',
            },
            {
              name: 'RBRS',
              game: 'Rocket League',
              color: '#1a9ef6',
              start: 1, // Octobre
              end: 3,   // Décembre
              url: 'https://rbrs.rocketbaguette.com/',
            },
            {
              name: 'RBRS',
              game: 'Rocket League',
              color: '#1a9ef6',
              start: 7, // Avril
              end: 9,  // Juin
              url: 'https://rbrs.rocketbaguette.com/',
            },
          ];

          const totalCols = MONTHS.length;

          return (
            <div style={{ borderTop: '2px solid rgba(255, 26, 60, 0.3)' }}>
              <div className="container" style={{ paddingTop: '60px' }}>
                <div style={{ marginBottom: '36px' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,26,60,0.7)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>Calendrier compétitif</p>
                  <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 950, color: '#fff', margin: 0, lineHeight: 1.1 }}>
                    Ligues <span style={{ color: '#ff1a3c' }}>Universitaires</span>
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginTop: '10px' }}>Saison académique 2025–2026</p>
                </div>

                {/* Timeline grid */}
                <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
                  <div style={{ minWidth: '700px' }}>

                    {/* Month headers */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `160px repeat(${totalCols}, 1fr)`,
                      marginBottom: '8px',
                      gap: 0,
                    }}>
                      <div /> {/* game label column */}
                      {MONTHS.map((m, i) => (
                        <div key={i} style={{
                          textAlign: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: 'rgba(255,255,255,0.35)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          paddingBottom: '8px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>{m}</div>
                      ))}
                    </div>

                    {/* League rows — group by game */}
                    {[
                      { game: 'League of Legends', color: '#C89B3C' },
                      { game: 'Rocket League', color: '#356bffff' },
                      { game: 'Valorant', color: '#FF4656' },
                      { game: 'Counter Strike 2', color: '#ffce46ff' },
                    ].map(({ game, color }) => {
                      const gameLeagues = leagues.filter(l => l.game === game);
                      return (
                        <div key={game} style={{
                          display: 'grid',
                          gridTemplateColumns: `160px repeat(${totalCols}, 1fr)`,
                          marginBottom: '12px',
                          gap: 0,
                          alignItems: 'center',
                        }}>
                          {/* Game label */}
                          <div style={{ paddingRight: '16px' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{game}</p>
                          </div>

                          {/* Month cells + league blocks */}
                          {Array.from({ length: totalCols }).map((_, colIdx) => {
                            // Check if any league starts here
                            const league = gameLeagues.find(l => l.start === colIdx);
                            const coveredByLeague = gameLeagues.some(l => colIdx > l.start && colIdx <= l.end);

                            if (league) {
                              const span = league.end - league.start + 1;
                              return (
                                <div key={colIdx} style={{ gridColumn: `span ${span}`, padding: '4px 6px', position: 'relative', zIndex: 1 }}>
                                  <a
                                    href={league.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="league-block"
                                    style={{
                                      background: `${league.color}22`,
                                      border: `1.5px solid ${league.color}70`,
                                      boxShadow: `0 0 16px ${league.color}15`,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: league.color, flexShrink: 0, boxShadow: `0 0 6px ${league.color}` }} />
                                    <div>
                                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{league.name}</p>
                                      <p style={{ margin: 0, fontSize: '0.6rem', color: `${league.color}cc`, fontWeight: 600 }}>
                                        {MONTHS[league.start]} → {MONTHS[league.end]}
                                      </p>
                                    </div>
                                  </a>
                                </div>
                              );
                            }

                            if (coveredByLeague) return null; // consumed by span

                            return (
                              <div key={colIdx} style={{ padding: '4px 6px' }}>
                                <div style={{ height: '42px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '20px', fontStyle: 'italic' }}>
                  D'autres ligues à venir — si tu connais une compétition universitaire non listée, contacte-nous !
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── JERSEY SECTION ── */}
        <div style={{ borderTop: '2px solid rgba(255, 26, 60, 0.3)', borderBottom: '2px solid rgba(255, 26, 60, 0.3)', background: 'rgba(80,30,120,0.18)', padding: '0' }}>
          <div className="container" style={{ padding: '60px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Left: jersey with subtle gold glow */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/partenaires/maillot.png"
                alt="Maillot BDJ Esport"
                style={{ height: '420px', objectFit: 'contain', position: 'relative', filter: 'brightness(0.75)' }}
              />
            </div>
            {/* Right: info */}
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--c-gold)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>Tenue officielle</p>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 950, color: '#fff', margin: '0 0 20px 0', lineHeight: 1.1 }}>Le Maillot BDJ Esport</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '36px' }}>
                Porté lors de toutes nos compétitions inter-écoles, notre maillot représente les couleurs du BDJ face aux meilleures équipes de France.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: 'ph-paint-brush', label: 'Design', value: 'Spized' },
                  { icon: 'ph-handshake', label: 'Sponsor principal', value: 'Sopra Steria' },
                  { icon: 'ph-graduation-cap', label: 'École', value: 'CPE Lyon' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(200,155,60,0.12)', border: '1px solid rgba(200,155,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ph ${icon}`} style={{ fontSize: '1.1rem', color: 'var(--c-gold)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .esport-panel:hover .game-bg {
          filter: grayscale(0) brightness(1) !important;
          transform: scale(1.08);
        }
        .esport-panel:hover .game-info {
          /* always visible — no change needed */
        }
        .esport-panel:hover .neon-border {
          opacity: 1 !important;
        }
        .esport-panel:hover .game-logo {
          transform: scale(1.1) translateY(-10px);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse { animation: pulse 2s infinite; }
        .league-block {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.2s, filter 0.2s;
        }
        .league-block:hover {
          transform: translateY(-3px) scale(1.02);
          filter: brightness(1.15);
        }
      `}</style>
      </div>
    </div>
  );
}
