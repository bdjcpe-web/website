import { esportGames, RANK_COLORS, LOL_RANK_ICONS, RL_RANK_ICONS, RankTier } from '@/data/esport';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AddPlayerPanel from '@/components/AddPlayerPanel';

export async function generateStaticParams() {
  return esportGames.map((g) => ({ jeu: g.slug }));
}

const ROLE_ICON_FILES: Record<string, string> = {
  Top: '/roles/top.png',
  Jungle: '/roles/Jgl.png',
  Mid: '/roles/mid.png',
  ADC: '/roles/adc.png',
  Support: '/roles/sup.png',
  Sub: '/roles/sub-lol.png',
};

export default async function JeuPage(props: { params: Promise<{ jeu: string }> }) {
  const params = await props.params;
  const game = esportGames.find((g) => g.slug === params.jeu);
  if (!game) notFound();

  const isRL = game.slug === 'rocket-league';

  // Fetch DB players and merge with static
  const dbTeam = await prisma.esportTeam.findUnique({
    where: { game: game.slug },
    include: { players: true },
  });
  const dbPlayers = (dbTeam?.players ?? []).map((p: any) => ({
    name: p.name,
    role: p.role,
    isSub: p.isSub,
    gameId: p.gameId,
    profileLink: p.profileLink,
    Id: p.gameId || undefined,
    rank: p.rankTier ? { tier: p.rankTier as RankTier, division: p.rankDivision || undefined } : undefined,
    dbId: p.id, // for delete button later
  }));

  // Merge: static first, then DB (DB players are always "new" additions)
  const allPlayers = [...game.players, ...dbPlayers];
  const mainRoster = allPlayers.filter((p) => !p.isSub);
  const subs = allPlayers.filter((p) => p.isSub);

  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isAdmin = !!session?.user?.email && adminEmails.includes(session.user.email);

  const bgFile = game.slug === 'league-of-legends' ? 'bg-lol.jpg'
    : game.slug === 'rocket-league' ? 'bg-rl.jpg'
      : `bg-${game.shortName.toLowerCase()}.jpg`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', position: 'relative', overflow: 'hidden' }}>

      {/* ── BACKGROUND ── */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(/games/${bgFile})`, backgroundSize: 'cover', backgroundPosition: 'center 20%', opacity: 0.15, filter: 'grayscale(0.5)' }} />
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(circle at 50% 0%, ${game.color}15 0%, transparent 70%)` }} />

      {/* ── HEADER ── */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '140px', paddingBottom: '60px' }}>
        <div className="container">
          <Link href="/esport" className="btn" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <i className="ph ph-arrow-left" /> BDJ Esport
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <img src={game.logoUrl} alt={game.name} style={{ height: '80px', filter: `drop-shadow(0 0 20px ${game.color}60)` }} />
            <div>
              <p style={{ color: game.color, fontWeight: 800, letterSpacing: '0.3em', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Roster Officiel — 2025/2026</p>
              <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 950, color: '#fff', margin: 0, lineHeight: 1 }}>{game.name.toUpperCase()}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ROSTER ── */}
      <div className="container" style={{ position: 'relative', zIndex: 10, paddingBottom: '60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {mainRoster.map((player) => {
            const rankColor = player.rank ? (RANK_COLORS[player.rank.tier] ?? '#4b5563') : '#4b5563';
            const rankEmblem = player.rank
              ? isRL
                ? RL_RANK_ICONS[`${player.rank.tier}${player.rank.division ? ' ' + player.rank.division : ''}`]
                : LOL_RANK_ICONS[player.rank.tier]
              : undefined;
            const roleImg = ROLE_ICON_FILES[player.role];

            return (
              <a key={player.name} href={player.profileLink || '#'} target="_blank" className="player-card-high" style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: game.color, boxShadow: `0 0 12px ${game.color}` }} />
                <div style={{ padding: '12px 16px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {roleImg
                      ? <img src={roleImg} alt={player.role} style={{ height: '100%', filter: `drop-shadow(0 0 8px ${game.color}60)` }} />
                      : <i className="ph ph-shield" style={{ fontSize: '2rem', color: game.color }} />}
                  </div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: game.color, letterSpacing: '0.15em', margin: 0 }}>{player.role.toUpperCase()}</p>
                </div>
                <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${game.color}50, transparent)`, margin: '0 16px' }} />
                <div style={{ padding: '14px 16px 16px', textAlign: 'center' }}>
                  {player.Id && <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.1 }}>{player.Id.split('#')[0]}</h3>}
                  <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{player.name}</p>
                </div>
                <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {rankEmblem && <img src={rankEmblem} style={{ height: '44px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} alt="rank" />}
                  {player.rank && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '3px 10px', borderRadius: '100px', background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                      {player.rank.tier.toUpperCase()} {player.rank.division || ''}
                    </span>
                  )}
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', padding: '0 12px 12px', margin: 0, letterSpacing: '0.05em' }}>
                  Voir le profil sur {isRL ? 'tracker.gg' : 'op.gg'} →
                </p>
                <style>{`
                  .player-card-high {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    min-height: 380px;
                  }
                  .player-card-high:hover {
                    transform: translateY(-10px) scale(1.02);
                    background: rgba(255,255,255,0.07);
                    border-color: ${game.color}60;
                    box-shadow: 0 20px 50px ${game.color}25;
                  }
                  .sub-card {
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid ${game.color}30;
                    border-radius: 18px;
                    overflow: hidden;
                    text-decoration: none;
                    position: relative;
                    transition: all 0.25s ease;
                  }
                  .sub-card:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: ${game.color}60;
                    box-shadow: 0 8px 30px ${game.color}20;
                  }
                `}</style>
              </a>
            );
          })}
        </div>

        {/* ── SUBSTITUTES ── */}
        {subs.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
              Remplaçants
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {subs.map((player) => {
                const rankColor = player.rank ? (RANK_COLORS[player.rank.tier] ?? '#4b5563') : '#4b5563';
                const rankEmblem = player.rank
                  ? isRL
                    ? RL_RANK_ICONS[`${player.rank.tier}${player.rank.division ? ' ' + player.rank.division : ''}`]
                    : LOL_RANK_ICONS[player.rank.tier]
                  : undefined;
                const roleImg = ROLE_ICON_FILES[player.role];

                return (
                  <a key={player.name} href={player.profileLink || '#'} target="_blank" className="player-card-high" style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: game.color, boxShadow: `0 0 12px ${game.color}` }} />
                    <div style={{ padding: '12px 16px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {roleImg
                          ? <img src={roleImg} alt={player.role} style={{ height: '100%', filter: `drop-shadow(0 0 8px ${game.color}60)` }} />
                          : <i className="ph ph-shield" style={{ fontSize: '2rem', color: game.color }} />}
                      </div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, color: game.color, letterSpacing: '0.15em', margin: 0 }}>{player.role.toUpperCase()}</p>
                    </div>
                    <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${game.color}50, transparent)`, margin: '0 16px' }} />
                    <div style={{ padding: '14px 16px 16px', textAlign: 'center' }}>
                      {player.Id && <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.1 }}>{player.Id.split('#')[0]}</h3>}
                      <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{player.name}</p>
                    </div>
                    <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {rankEmblem && <img src={rankEmblem} style={{ height: '44px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} alt="rank" />}
                      {player.rank && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '3px 10px', borderRadius: '100px', background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}40` }}>
                          {player.rank.tier.toUpperCase()} {player.rank.division || ''}
                        </span>
                      )}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', padding: '0 12px 12px', margin: 0, letterSpacing: '0.05em' }}>
                      Voir le profil sur {isRL ? 'tracker.gg' : 'op.gg'} →
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── RECRUITMENT WIDGET ── */}
      {game.recruiting && (
        <div className="container" style={{ position: 'relative', zIndex: 10, paddingBottom: '80px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${game.color}18 0%, ${game.color}08 100%)`,
            border: `1.5px solid ${game.color}80`,
            borderRadius: '24px', padding: '40px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '32px', flexWrap: 'wrap', boxShadow: `0 0 60px ${game.color}20`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: game.color, boxShadow: `0 0 12px ${game.color}`, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: game.color, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Recrutement ouvert</p>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '0 0 8px 0' }}>Tu veux représenter les couleurs du BDJ ?</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
                  Rejoins notre équipe {game.name} — recrutement sur discord !
                </p>
              </div>
            </div>
            <a href="https://discord.gg/dK3rNUujHS" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', background: '#5865F2', color: '#fff', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(88,101,242,0.4)' }}>
              <i className="ph ph-discord-logo" style={{ fontSize: '1.2rem' }} />
              Rejoindre le Discord
            </a>
          </div>
        </div>
      )}

      {/* ── ADMIN: Add Player ── */}
      {isAdmin && (
        <div className="container" style={{ position: 'relative', zIndex: 10, paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', height: '1px', background: `linear-gradient(to right, transparent, ${game.color}30, transparent)` }} />
          <AddPlayerPanel gameSlug={game.slug} gameColor={game.color} isRL={isRL} />
        </div>
      )}

    </div>
  );
}
