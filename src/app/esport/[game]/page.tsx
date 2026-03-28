/**
 * @file src/app/esport/[game]/page.tsx
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Page de présentation d'un roster esport
 * @requires data/esport.ts
 * @requires components/PlayerCard.tsx
 * @requires components/Admin/PlayerForm/AddPlayerForm.tsx
 * @requires lib/auth.ts
 * @requires lib/prisma.ts
 */

import { esportGames, RankTier } from '@/data/esport';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AddPlayerPanel from '@/components/Admin/PlayerForm/AddPlayerForm';
import PlayerCard from '@/components/PlayerCard';
import styles from './Game.module.css';

export async function generateStaticParams() {
  return esportGames.map((g) => ({ game: g.slug }));
}

export default async function JeuPage(props: { params: Promise<{ game: string }> }) {
  const params = await props.params;
  const game = esportGames.find((g) => g.slug === params.game);
  if (!game) notFound();

  const isRL = game.slug === 'rocket-league';

  // ── FETCH DATABASE ──
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
    dbId: p.id,
  }));

  const allPlayers = [...game.players, ...dbPlayers];
  const mainRoster = allPlayers.filter((p) => !p.isSub);
  const subs = allPlayers.filter((p) => p.isSub);

  // On extrait dynamiquement le nom de domaine pour le footer de la carte
  // Ex: "https://www.op.gg/..." -> "op.gg"
  const getTrackerName = (url?: string) => {
    if (!url) return 'le site';
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return 'le site'; }
  };
  const trackerName = getTrackerName(game.trackerBase);

  // ── AUTH & ADMIN ──
  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isAdmin = !!session?.user?.email && adminEmails.includes(session.user.email);

  const bgFile = `bg-${game.shortName.toLowerCase()}.jpg`;

  return (
    <div
      className={styles.pageContainer}
      style={{ '--game-color': game.color } as React.CSSProperties}
    >

      {/* ── BACKGROUNDS ── */}
      <div
        className={styles.bgImage}
        style={{ backgroundImage: `url(/games/${bgFile})` }}
        aria-hidden="true"
      />
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className={styles.headerSection}>
        <div className={`container ${styles.contentWrapper}`}>

          <Link href="/esport" className={styles.backBtn}>
            <i className="ph ph-arrow-left" aria-hidden="true" /> BDJ Esport
          </Link>

          <div className={styles.headerContent}>
            <img src={game.logoUrl} alt={`Logo ${game.name}`} className={styles.gameLogo} />
            <div className={styles.headerText}>
              <p className={styles.headerSub}>Roster Officiel — 2025/2026</p>
              <h1 className={styles.headerTitle}>{game.name}</h1>
              <div className={styles.headerDivider} aria-hidden="true" />
            </div>
          </div>

        </div>
      </header>

      {/* ── MAIN ROSTER ── */}
      <section className={styles.rosterSection}>
        <div className={`container ${styles.contentWrapper}`}>
          <div className={styles.rosterGrid}>
            {mainRoster.map((player) => (
              <PlayerCard
                key={player.name}
                player={player}
                gameSlug={game.slug}
                trackerName={trackerName}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSTITUTES ── */}
      {subs.length > 0 && (
        <section className={styles.rosterSection}>
          <div className={`container ${styles.contentWrapper}`}>
            <p className={styles.subsTitle}>Remplaçants</p>
            <div className={styles.rosterGrid}>
              {subs.map((player) => (
                <PlayerCard
                  key={player.name}
                  player={player}
                  gameSlug={game.slug}
                  trackerName={trackerName}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RECRUITMENT WIDGET ── */}
      {game.recruiting && (
        <section className={styles.recruitmentSection}>
          <div className={`container ${styles.contentWrapper}`}>
            <div className={styles.recruitBanner}>

              <div className={styles.recruitLeft}>
                <div className={styles.recruitDot} aria-hidden="true" />
                <div>
                  <p className={styles.recruitSub}>Recrutement ouvert</p>
                  <h3 className={styles.recruitTitle}>Tu veux représenter les couleurs du BDJ ?</h3>
                  <p className={styles.recruitDesc}>Rejoins notre équipe {game.name} — recrutement sur discord !</p>
                </div>
              </div>

              <a href="https://discord.gg/dK3rNUujHS" target="_blank" rel="noopener noreferrer" className={styles.recruitBtn}>
                <i className="ph ph-discord-logo" style={{ fontSize: '1.2rem' }} aria-hidden="true" />
                Rejoindre le Discord
              </a>

            </div>
          </div>
        </section>
      )}

      {/* ── ADMIN: Add Player ── */}
      {isAdmin && (
        <section className={`container ${styles.contentWrapper}`} style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.adminDivider} aria-hidden="true" />
          <AddPlayerPanel gameSlug={game.slug} gameColor={game.color} isRL={isRL} />
        </section>
      )}

    </div>
  );
}