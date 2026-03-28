/**
 * @file @components/PlayerCard.tsx
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Carte pour afficher les joueurs d'un roster
 */

import { RANK_COLORS, GAME_RANK_ICONS, GAME_ROLE_ICONS, Player } from '@/data/esport';
import RemovePlayerButton from '@/components/Admin/PlayerForm/RemovePlayerForm';
import styles from '@/app/esport/[game]/Game.module.css';

interface PlayerCardProps {
    player: Player;
    gameSlug: string;
    trackerName: string;
    isAdmin: boolean;
}

export default function PlayerCard({ player, gameSlug, trackerName, isAdmin }: PlayerCardProps) {

    const rankColor = player.rank ? (RANK_COLORS[player.rank.tier] ?? '#4b5563') : '#4b5563';

    // 1. Récupération des icônes spécifiques au jeu
    const gameRankIcons = GAME_RANK_ICONS[gameSlug] || {};
    const gameRoleIcons = GAME_ROLE_ICONS[gameSlug] || {};

    // 2. Résolution intelligente de l'emblème de rang
    let rankEmblem = undefined;
    if (player.rank) {
        const exactKey = `${player.rank.tier} ${player.rank.division || ''}`.trim(); // Ex: "Champion I"
        const tierKey = player.rank.tier; // Ex: "Diamond"

        // S'il trouve "Champion I", il le prend. Sinon il cherche juste "Diamond".
        rankEmblem = gameRankIcons[exactKey] || gameRankIcons[tierKey];
    }

    // 3. Récupération de l'image de rôle
    const roleImg = gameRoleIcons[player.role];

    return (
        <a href={player.profileLink || '#'} target="_blank" rel="noopener noreferrer" className={styles.playerCard}>

            {isAdmin && player.dbId && (
                <RemovePlayerButton playerId={player.dbId} playerName={player.name} />
            )}

            <div className={styles.profileLinkIcon} aria-hidden="true">
                <i className="ph-bold ph-arrow-up-right" />
            </div>

            <div className={styles.cardTopAccent} aria-hidden="true" />

            <div className={styles.cardRoleSection}>
                <div className={styles.cardRoleIconWrapper}>
                    {roleImg ? (
                        <img src={roleImg} alt={`Rôle ${player.role}`} className={styles.cardRoleImg} />
                    ) : (
                        <i className={`ph ph-shield ${styles.cardRoleFallback}`} aria-hidden="true" />
                    )}
                </div>
                <p className={styles.cardRoleText}>{player.role}</p>
            </div>

            <div className={styles.cardDivider} aria-hidden="true" />

            <div className={styles.cardInfoSection}>
                {player.Id && <h3 className={styles.cardPlayerId}>{player.Id.split('#')[0]}</h3>}
                <p className={styles.cardPlayerName}>{player.name}</p>
            </div>

            <div className={styles.cardRankSection}>
                {rankEmblem && <img src={rankEmblem} className={styles.cardRankEmblem} alt={`Rang ${player.rank?.tier}`} />}
                {player.rank && (
                    <span
                        className={styles.cardRankBadge}
                        style={{ background: `color-mix(in srgb, ${rankColor} 20%, transparent)`, color: rankColor, border: `1px solid color-mix(in srgb, ${rankColor} 40%, transparent)` }}
                    >
                        {player.rank.tier} {player.rank.division || ''}
                    </span>
                )}
            </div>

            <p className={styles.cardFooter}>Voir le profil →</p>
        </a>
    );
}