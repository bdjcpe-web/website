/**
 * @file @data/esport.ts
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Données pour toutes les pages esport
 */

// ── CONSTANTES POUR LES FORMULAIRES (ADMIN) ──
export const LOL_ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support', 'Sub'];
export const RL_ROLES = ['Gardien', 'Scorer', 'Tactician', 'Sub'];

export const LOL_TIERS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger', 'Unranked'];
export const RL_TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'GC', 'SSL', 'Unranked'];

export const DIVISIONS = ['I', 'II', 'III', 'IV'];
export const NO_DIVISION_TIERS = ['Master', 'Grandmaster', 'Challenger', 'Unranked', 'SSL'];

export type RankTier =
  | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond'
  | 'Master' | 'Grandmaster' | 'Challenger'
  | 'Champion' | 'GC' | 'SSL'
  | 'Unranked';

export const RANK_COLORS: Record<string, string> = {
  Iron: '#8a8a8a',
  Bronze: '#b87d4b',
  Silver: '#9fb4c7',
  Gold: '#f0b429',
  Platinum: '#22c4a0',
  Emerald: '#1a9e60',
  Diamond: '#6ab4f5',
  Master: '#b44fe8',
  Grandmaster: '#e84f4f',
  Challenger: '#f4c842',
  Champion: '#a855f7',
  GC: '#ef4444',
  SSL: '#ffffff',
  Unranked: '#4b5563',
};

export const LOL_RANK_ICONS: Record<string, string> = {
  Iron: '/ranks/lol/iron.webp',
  Bronze: '/ranks/lol/bronze.webp',
  Silver: '/ranks/lol/silver.webp',
  Gold: '/ranks/lol/gold.webp',
  Platinum: '/ranks/lol/platinum.webp',
  Emerald: '/ranks/lol/emerald.webp',
  Diamond: '/ranks/lol/diamond.png',
  Master: '/ranks/lol/master.webp',
  Grandmaster: '/ranks/lol/grandmaster.webp',
  Challenger: '/ranks/lol/challenger.webp',
  Unranked: '',
};

export const RL_RANK_ICONS: Record<string, string> = {
  'Champion I': '/ranks/rl/champion1.webp',
  'Champion II': '/ranks/rl/champion2.webp',
  'Champion III': '/ranks/rl/champion3.webp',
  'GC I': '/ranks/rl/gc1.png',
  'GC II': '/ranks/rl/gc2.webp',
  'GC III': '/ranks/rl/gc3.png',
  'SSL': '/ranks/rl/ssl.webp',
  Unranked: '',
};

export const GAME_RANK_ICONS: Record<string, Record<string, string>> = {
  'league-of-legends': LOL_RANK_ICONS,
  'rocket-league': RL_RANK_ICONS,
  'valorant': {},
  'cs2': {},
};

export const LOL_ROLE_ICON_FILES: Record<string, string> = {
  Top: '/roles/top.png',
  Jungle: '/roles/Jgl.png',
  Mid: '/roles/mid.png',
  ADC: '/roles/adc.png',
  Support: '/roles/sup.png',
  Sub: '/roles/sub-lol.png',
};

export const RL_ROLE_ICON_FILES: Record<string, string> = {
  Scorer: '/roles/scorer.png',
  Gardien: '/roles/goalie.png',
  Tactician: '/roles/tactician.png',
  Sub: '/roles/sub-rl.png',
};

export const GAME_ROLE_ICONS: Record<string, Record<string, string>> = {
  'league-of-legends': LOL_ROLE_ICON_FILES,
  'rocket-league': RL_ROLE_ICON_FILES,
  'valorant': {},
  'cs2': {},
};

export type Player = {
  name: string;
  role: string;
  isSub?: boolean;
  profileLink?: string;
  Id?: string;
  dbId?: string;
  rank?: {
    tier: RankTier;
    division?: 'I' | 'II' | 'III' | 'IV';
    lp?: number;
  };
};

export type EsportGame = {
  slug: string;
  name: string;
  shortName: string;
  color: string;
  logoUrl: string;
  trackerBase?: string;
  players: Player[];
  recruiting?: boolean;
};

export const esportGames: EsportGame[] = [
  {
    slug: 'league-of-legends',
    name: 'League of Legends',
    shortName: 'LoL',
    color: '#C89B3C',
    logoUrl: '/games/LoL-logo.png',
    trackerBase: 'https://www.op.gg/summoners/euw/',
    players: [
      {
        name: 'EL HASSANI Bassim (4ETI)', role: 'Top', Id: 'ELHbss#euw',
        profileLink: 'https://www.op.gg/summoners/euw/ELHbss-euw',
        rank: { tier: 'Emerald', division: 'I', lp: 67 },
      },
      {
        name: 'GIRAUD Loric (4ETI)', role: 'Jungle', Id: 'Ewookiz#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/Ewookiz-EUW',
        rank: { tier: 'Platinum', division: 'III', lp: 30 },
      },
      {
        name: 'DI GIOVANNI Loris (4ETI)', role: 'Mid', Id: 'Darlio#Zeubi',
        profileLink: 'https://www.op.gg/summoners/euw/Darlio-Zeubi',
        rank: { tier: 'Platinum', division: 'I', lp: 16 },
      },
      {
        name: 'MATHELIN Yann (4ETI)', role: 'ADC', Id: 'Matychoco#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/Matychoco-EUW',
        rank: { tier: 'Emerald', division: 'III', lp: 64 },
      },
      {
        name: 'LE COZ Tugdual (4ETI)', role: 'Support', Id: 'IleErable#666',
        profileLink: 'https://www.op.gg/summoners/euw/IleErable-666',
        rank: { tier: 'Gold', division: 'IV', lp: 72 },
      },
      {
        name: 'VIRY Thomas (4ETI)', role: 'Sub', isSub: true, Id: 'VIT madose#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/VIT%20madose-EUW',
        rank: { tier: 'Diamond', division: 'IV', lp: 2 },
      },
    ],
  },
  {
    slug: 'rocket-league',
    name: 'Rocket League',
    shortName: 'RL',
    color: '#5B8EFF',
    logoUrl: '/games/rl-logo.png',
    trackerBase: 'https://rocketleague.tracker.network/rocket-league/profile/epic/',
    players: [
      {
        name: 'GOLAY Tom (4ETI)', role: 'Attaquant', Id: 'Splaash',
        profileLink: 'https://rocketleague.tracker.network/rocket-league/profile/steam/76561198254144018/overview',
        rank: { tier: 'Champion', division: 'III', lp: 820 },
      },
      {
        name: 'MERCIER Tom (4ETI)', role: 'Milieu', Id: 'Tomyfr.',
        profileLink: 'https://rocketleague.tracker.network/rocket-league/profile/epic/Tomyfr./overview',
        rank: { tier: 'GC', division: 'I', lp: 340 },
      },
      {
        name: 'LEMOINE Jules (3ETI)', role: 'Défenseur', Id: 'ObbLx',
        profileLink: 'https://rocketleague.tracker.network/rocket-league/profile/epic/ObbLx/overview',
        rank: { tier: 'Champion', division: 'I', lp: 180 },
      },
    ],
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    shortName: 'VALO',
    color: '#FF4655',
    logoUrl: '/games/valo-logo.png',
    recruiting: true,
    players: [],
  },
  {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    color: '#F0A500',
    logoUrl: '/games/cs2-logo.webp',
    recruiting: true,
    players: [],
  },
];

export const MONTHS = ['Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'];

export const LEAGUES = [
  { name: 'PORO Ligue', game: 'League of Legends', color: '#ffdf9a', start: 5, end: 8, url: 'https://ligueporo.fr' },
  { name: 'RBRS', game: 'Rocket League', color: '#1a9ef6', start: 1, end: 3, url: 'https://rbrs.rocketbaguette.com/' },
  { name: 'RBRS', game: 'Rocket League', color: '#1a9ef6', start: 7, end: 9, url: 'https://rbrs.rocketbaguette.com/' },
];

export const JERSEY_FEATURES = [
  { icon: 'ph-paint-brush', label: 'Design', value: 'Spized' },
  { icon: 'ph-handshake', label: 'Sponsor principal', value: 'Sopra Steria' },
  { icon: 'ph-graduation-cap', label: 'École', value: 'CPE Lyon' },
];

export const TWITCH_FEATURES = [
  'Compétitions inter-écoles',
  'Accompagnement et session coaching',
  'Diffusion de tous les matchs sur notre chaîne Twitch officielle',
  'LANs et déplacements nationaux'
];