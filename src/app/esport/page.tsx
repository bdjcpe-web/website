/**
 * @file src/app/esport/page.tsx
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Page esport avec présentation des équipes, des ligues
 * du maillot et widget twitch
 * @requires data/esport.ts
 */


import { esportGames, MONTHS, LEAGUES, JERSEY_FEATURES, TWITCH_FEATURES } from '@/data/esport';
import { reseaux } from '@/data/reseaux';
import Link from 'next/link';
import styles from './Esport.module.css';

export default function EsportPage() {
  const totalCols = MONTHS.length;

  return (
    <div className={styles.pageWrapper}>

      {/* ── BACKGROUND GLOW ── */}
      <div className={styles.redGlow} aria-hidden="true" />

      <div className={styles.contentWrapper}>

        {/* ── CAROUSEL SECTION ── */}
        <section className={styles.carouselSection}>
          <header className={styles.Header}>
            <p className={styles.carouselSub}>BDJ Esport</p>
            <h2 className={styles.carouselTitle}>
              Découvre nos <span className={styles.highlight}>Rosters</span>
            </h2>
            <p className={styles.carouselDesc}>
              Clique sur un jeu pour voir le roster complet
            </p>
          </header>

          <div className={styles.carouselTrack}>
            {esportGames.map((game) => {
              const bgFile = `bg-${game.shortName.toLowerCase()}.jpg`;

              return (
                <Link
                  key={game.slug}
                  href={`/esport/${game.slug}`}
                  className={styles.gamePanel}
                >
                  {/* Background Layer */}
                  <div className={styles.bgWrapper} aria-hidden="true">
                    <div
                      className={styles.gameBg}
                      style={{ backgroundImage: `url(/games/${bgFile})` }}
                    />
                    <div className={styles.gameOverlay} />
                  </div>

                  {/* Content Layer */}
                  <div className={styles.gameContent}>
                    <img
                      src={game.logoUrl}
                      alt={`Logo ${game.name}`}
                      className={styles.gameLogo}
                      style={{ filter: `drop-shadow(0 0 20px ${game.color}40)` }}
                    />

                    <div className={styles.gameInfo}>
                      <h2 className={styles.gameName}>{game.name}</h2>
                      <p className={styles.gameStatus} style={{ color: game.color }}>
                        {game.recruiting ? 'RECRUTEMENT OUVERT' : 'ÉQUIPE COMPLÈTE'}
                      </p>
                    </div>
                  </div>

                  {/* Neon Border */}
                  <div
                    className={styles.neonBorder}
                    style={{
                      border: `2px solid ${game.color}`,
                      boxShadow: `inset 0 0 30px ${game.color}40, 0 0 30px ${game.color}40`
                    }}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── INFO & TWITCH SECTION ── */}
        <section className={styles.infoWrapper}>
          <div className={`container ${styles.twitchGrid}`}>

            {/* Partie Gauche : Textes harmonisés */}
            <div className={styles.infoContent}>
              <header className={styles.Header}>
                <p className={styles.carouselSub}>Suis l'actualité</p>
                <h2 className={styles.carouselTitle}>
                  BDJ <span className={styles.highlight}>Esport</span>
                </h2>
                <p className={styles.carouselDesc}>
                  Affronte les meilleures écoles de France sous nos couleurs dans les ligues et LANs nationales.
                </p>
              </header>

              <ul className={styles.twitchList}>
                {TWITCH_FEATURES.map((item, i) => (
                  <li key={i} className={styles.twitchListItem}>
                    <i className={`ph-fill ph-check-circle ${styles.twitchCheck}`} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Partie Droite : Lecteur Twitch */}
            <div className={styles.twitchVideoWrapper}>
              <div className={styles.twitchGlow} aria-hidden="true" />
              <div className={styles.twitchPlayer}>
                <div className={styles.liveHeader}>
                  <div className={styles.pulseDot} aria-hidden="true" />
                  LIVE TWITCH
                </div>

                {(() => {
                  // On extrait le nom de la chaîne depuis l'URL (ex: "https://twitch.tv/bdjcpe" -> "bdjcpe")
                  const twitchUrl = reseaux.find(r => r.name === 'Twitch')?.link;
                  const channelName = twitchUrl?.split('/').pop();

                  return (
                    <iframe
                      //parent=bdjcpe.fr donc non disponible en test sur localhost
                      src={`https://player.twitch.tv/?channel=${channelName}&parent=bdjcpe.fr&autoplay=true`}
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                      allowFullScreen
                      title="Stream Twitch BDJ"
                    />
                  );
                })()}
              </div>
            </div>

          </div>
        </section>

        {/* ── LEAGUES TIMELINE ── */}
        <section className={styles.leaguesWrapper}>
          <div className="container">

            <header className={styles.Header}>
              <p className={styles.carouselSub}>Calendrier compétitif</p>
              <h2 className={styles.carouselTitle}>
                Ligues <span className={styles.highlight}>Universitaires</span>
              </h2>
              <p className={styles.carouselDesc}>Saison académique 2025–2026</p>
            </header>

            <div className={styles.timelineScroll}>
              <div className={styles.timelineMin}>

                {/* En-têtes des mois */}
                <div className={styles.timelineHeaderRow}>
                  <div /> {/* Colonne vide pour le nom du jeu */}
                  {MONTHS.map((m, i) => (
                    <div key={i} className={styles.monthHeader}>
                      {m}
                    </div>
                  ))}
                </div>

                {/* Lignes des ligues générées via la source de vérité (esportGames) */}
                {esportGames.map((game) => {
                  // On récupère les ligues de ce jeu (Assurez-vous que l.game === game.name)
                  const gameLeagues = LEAGUES.filter(l => l.game === game.name);

                  // Optionnel : Si un jeu n'a aucune ligue, on peut le masquer en retournant null
                  // if (gameLeagues.length === 0) return null;

                  return (
                    <div key={game.slug} className={styles.timelineRow}>

                      {/* Titre du jeu (Nom PC vs Acronyme Mobile) */}
                      <div className={styles.gameLabelWrapper}>
                        <p className={styles.gameLabelText} style={{ color: game.color }}>
                          <span className={styles.desktopName}>{game.name}</span>
                          <span className={styles.mobileName}>{game.shortName}</span>
                        </p>
                      </div>

                      {/* Cellules du calendrier */}
                      {Array.from({ length: totalCols }).map((_, colIdx) => {
                        const league = gameLeagues.find(l => l.start === colIdx);
                        const coveredByLeague = gameLeagues.some(l => colIdx > l.start && colIdx <= l.end);

                        if (league) {
                          const span = league.end - league.start + 1;
                          return (
                            <div key={colIdx} className={styles.leagueCell} style={{ gridColumn: `span ${span}` }}>
                              <a
                                href={league.url} target="_blank" rel="noopener noreferrer"
                                className={styles.leagueBlock}
                                style={{
                                  // Utilisation de color-mix pour des transparences impeccables !
                                  background: `color-mix(in srgb, ${game.color} 15%, transparent)`,
                                  border: `1.5px solid color-mix(in srgb, ${game.color} 70%, transparent)`,
                                  boxShadow: `0 0 16px color-mix(in srgb, ${game.color} 15%, transparent)`
                                }}
                              >
                                <div
                                  className={styles.leagueDot}
                                  style={{ background: game.color, boxShadow: `0 0 6px ${game.color}` }}
                                  aria-hidden="true"
                                />
                                <div>
                                  <p className={styles.leagueName}>{league.name}</p>
                                  <p className={styles.leagueDates} style={{ color: `color-mix(in srgb, ${game.color} 80%, white)` }}>
                                    {MONTHS[league.start]} → {MONTHS[league.end]}
                                  </p>
                                </div>
                              </a>
                            </div>
                          );
                        }

                        if (coveredByLeague) return null;

                        return (
                          <div key={colIdx} className={styles.emptyCell}>
                            <div className={styles.emptyBlock} aria-hidden="true" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={styles.leagueDesc}>
              D'autres ligues à venir — si tu connais une compétition universitaire non listée, contacte-nous !
            </p>
          </div>
        </section>

        {/* ── JERSEY SECTION ── */}
        <section className={styles.jerseySection}>
          <div className={`container ${styles.jerseyLayout}`}>

            {/* L'en-tête (Titre + Description) */}
            <header className={styles.jerseyHeader}>
              <p className={`${styles.carouselSub} ${styles.jerseySub}`}>
                Tenue officielle
              </p>
              <h2 className={`${styles.carouselTitle} ${styles.jerseyTitle}`}>
                Le <span className={styles.highlight}>Maillot</span> Esport
              </h2>
              <p className={styles.jerseyDesc}>
                Porté lors de toutes nos compétitions inter-écoles, notre maillot représente les couleurs du BDJ face aux meilleures équipes de France.
              </p>
            </header>

            {/* Le visuel du maillot */}
            <div className={styles.jerseyVisual}>
              <img
                src="/partenaires/maillot.png"
                alt="Maillot BDJ Esport"
                className={styles.jerseyImage}
              />
            </div>

            {/* Les puces informatives */}
            <div className={styles.jerseyFeatures}>
              {JERSEY_FEATURES.map(({ icon, label, value }) => (
                <div key={label} className={styles.featureItem}>
                  <div className={styles.featureIconBox}>
                    <i className={`ph ${icon} ${styles.featureIcon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className={styles.featureLabel}>{label}</p>
                    <p className={styles.featureValue}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}