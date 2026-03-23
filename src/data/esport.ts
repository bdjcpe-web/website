// LoL tiers (in order): Iron, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master, Grandmaster, Challenger
// RL tiers: Bronze, Silver, Gold, Platinum, Diamond, Champion, Grand Champion, Supersonic Legend
export type RankTier =
  | 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Emerald' | 'Diamond'
  | 'Master' | 'Grandmaster' | 'Challenger'
  | 'Champion' | 'Grand Champion' | 'Supersonic Legend'
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
  'Grand Champion': '#ef4444',
  'Supersonic Legend': '#ffffff',
  Unranked: '#4b5563',
};

// Paths to rank emblem images in /public/
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
  Challenger: '/ranks/lol/grandmaster.webp', // fallback — add challenger.webp to unlock
  Unranked: '',
};

export const RL_RANK_ICONS: Record<string, string> = {
  // Champions (I=1, II=2, III=3)
  'Champion I': '/ranks/rl/champion1.webp',
  'Champion II': '/ranks/rl/champion2.webp',
  'Champion III': '/ranks/rl/champion3.webp',
  // Grand Champions
  'Grand Champion I': '/ranks/rl/gc1.png',
  'Grand Champion II': '/ranks/rl/gc2.webp',
  'Grand Champion III': '/ranks/rl/gc3.png',
  // Supersonic Legend has no division
  'Supersonic Legend': '/ranks/rl/ssl.webp',
  Unranked: '',
};

export type Player = {
  name: string;
  role: string;
  isSub?: boolean;
  profileLink?: string;
  Id?: string;
  quote?: string;
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
        quote: '"Les baguins s\'en vont, les kills restent."',
        rank: { tier: 'Emerald', division: 'I', lp: 67 },
      },
      {
        name: 'GIRAUD Loric (4ETI)', role: 'Jungle', Id: 'Ewookiz#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/Ewookiz-EUW',
        quote: '"Je gank, donc je suis."',
        rank: { tier: 'Platinum', division: 'III', lp: 30 },
      },
      {
        name: 'DI GIOVANNI Loris (4ETI)', role: 'Mid', Id: 'Darlio#Zeubi',
        profileLink: 'https://www.op.gg/summoners/euw/Darlio-Zeubi',
        quote: '"Mid diff ou rien."',
        rank: { tier: 'Platinum', division: 'I', lp: 16 },
      },
      {
        name: 'MATHELIN Yann (4ETI)', role: 'ADC', Id: 'Matychoco#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/Matychoco-EUW',
        quote: '"Peel me ou perds."',
        rank: { tier: 'Emerald', division: 'III', lp: 64 },
      },
      {
        name: 'LE COZ Tugdual (4ETI)', role: 'Support', Id: 'IleErable#666',
        profileLink: 'https://www.op.gg/summoners/euw/IleErable-666',
        quote: '"Vision is power. Les autres l\'ignorent."',
        rank: { tier: 'Gold', division: 'IV', lp: 72 },
      },
      {
        name: 'VIRY Thomas (4ETI)', role: 'Sub', isSub: true, Id: 'VIT madose#EUW',
        profileLink: 'https://www.op.gg/summoners/euw/VIT%20madose-EUW',
        quote: '"Toujours prêt, jamais titulaire."',
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
        quote: '"Mes shots défient la gravité."',
        rank: { tier: 'Champion', division: 'III', lp: 820 },
      },
      {
        name: 'MERCIER Tom (4ETI)', role: 'Milieu', Id: 'Tomyfr.',
        profileLink: 'https://rocketleague.tracker.network/rocket-league/profile/epic/Tomyfr./overview',
        quote: '"Le terrain, je le vois avant tout le monde."',
        rank: { tier: 'Grand Champion', division: 'I', lp: 340 },
      },
      {
        name: 'LEMOINE Jules (3ETI)', role: 'Défenseur', Id: 'ObbLx',
        profileLink: 'https://rocketleague.tracker.network/rocket-league/profile/epic/ObbLx/overview',
        quote: '"Aucun but ne passe par moi."',
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
