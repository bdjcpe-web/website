export type Activite = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  icon: string;
  color: string;
  bgClass: string;
  image: string;
  keywords: string[];
  hidden?: boolean;
};

export const activites: Activite[] = [
  {
    slug: 'local',
    title: 'Le Local',
    tagline: 'Canapé, consoles, jeux, micro-ondes...\nL\'endroit parfait pour kiffer avec tes potes !',
    description: 'Le local du BDJ est l\'endroit parfait pour se détendre et s\'amuser entre amis. Que tu sois un joueur aguerri ou un débutant, tu trouveras de quoi t\'occuper.',
    details: [],
    icon: 'ph-armchair',
    color: 'var(--c-local)',
    bgClass: 'bg-local',
    image: '/activities/local.jpg',
    keywords: ['local', 'permanence', 'canapé', 'chill'],
  },
  {
    slug: 'jdr',
    title: 'Jeux & JDR',
    tagline: 'Jeux de sociétés, aventures épiques et soirées inoubliables',
    description: 'Le pôle Jeux de Rôle et Jeux de Société du BDJ anime la vie étudiante autour de parties endiablées. Que tu sois un vétéran des tables de D&D ou un néophyte curieux, tu trouveras ta communauté ici.',
    details: [
      'Collection de +20 jeux de société (Catan, Seven Wonders, Courtisans, etc.)',
      '[MEMBRE] Emprunt des jeux pour tes soirées/weekends',
      '[MEMBRE] Campagnes JDR annuelles au local (choisis par les MJ)',
      'Soirées Loup Garou (boissons et pizzas disponibles)',
    ],
    icon: 'ph-dice-five',
    color: 'var(--c-jdr)',
    bgClass: 'bg-jdr',
    image: '/activities/jdr.jpg',
    keywords: ['jdr', 'société', 'loup garou', 'plateau', 'jeux', 'loups'],
  },
  {
    slug: 'poker',
    title: 'Poker',
    tagline: 'Soirées amicales et tournois mensuels avec lots à gagner',
    description: 'Le pôle Poker du BDJ organise des parties amicales régulières et des tournois officiels avec des récompenses. Un excellent exercice de psychologie et de calcul de probabilités... ou juste un bon moment entre amis.',
    details: [
      'Tapis professionnelles et jetons de qualité dans le Local',
      'Initiation pour les débutants',
      'Tournois mensuels avec prix (cadeaux, cartes cadeaux)',
      '[MEMBRE] Soirées exclusive entre habitués au local',
    ],
    icon: 'ph-spade',
    color: 'var(--c-poker)',
    bgClass: 'bg-poker',
    image: '/activities/poker.jpg',
    keywords: ['poker', 'cartes', 'tournoi poker', 'jetons'],
  },
  {
    slug: 'sorties',
    title: 'Sorties',
    tagline: 'On te sort de ta chambre pour des soirées bowling, billard, etc.',
    description: 'Le pôle Sorties te sort de ta chambre ! Escape games, bars de jeux, laser game, concerts, salles d\'arcade... L\'objectif est simple : créer des souvenirs mémorables en groupe hors du campus.',
    details: [
      'Sortie mensuelle (escape game, bar jeux, bowling...)',
      'Tournois avec lots à gagner',
      'Découvre de nouveaux lieu sympa avec tes potes et détruit la concurrence',
      '[MEMBRE] Tarifs négociés en groupe — réductions membres',
    ],
    icon: 'ph-bowling-ball',
    color: 'var(--c-sorties)',
    bgClass: 'bg-sorties',
    image: '/activities/billiard.jpg',
    keywords: ['sortie', 'bowling', 'billard', 'laser game', 'escape', 'extérieur'],
  },
  {
    slug: 'gaming',
    title: 'Gaming',
    tagline: 'Des tournois & soirées gaming, un serveur MC et un Club FIFA',
    description: 'Le pôle Gaming organise des soirées jeux vidéo conviviales (Smash Bros, Mario Kart, Party Games, etc.). Si la survie te tente, notre serveur Minecraft multijoueur est accessible sans interruption aux membres de l\'association pour des aventures épiques. Aussi, rejoins le terrain avec le Club Pro FIFA pour des matchs et soirées de folies.',
    details: [
      'Gros tournois canapé : Smash Bros & Mario Kart sur la switch du local',
      '[MEMBRE] Accès membre privé au Serveur Survie Minecraft Java',
      'Club Pro FIFA ouvert à tous pour montrer tes skills',
      'Événements multijoueurs (Among Us, Gartic Phone, ...)',
    ],
    icon: 'ph-game-controller',
    color: 'var(--c-gaming)',
    bgClass: 'bg-gaming',
    image: '/activities/gaming.avif',
    keywords: ['gaming', 'mario kart', 'smash', 'ssbu', 'minecraft', 'switch', 'console', 'fifa'],
  },
  {
    slug: 'esport',
    title: 'E-Sport',
    tagline: 'Esport, tournois, matchs, ligues, compétitions',
    description: 'Le pôle E-Sport du BDJ se positionne compétitivement sur les jeux les plus populaires. Inscris-toi pour représenter le BDJ lors des compétitions étudiantes ou viens juste nous soutenir !',
    details: [
      'Tournois réguliers sur les jeux les plus populaires',
      'Compétitions amicales et conviviales',
      'Lots à gagner pour les meilleurs joueurs',
      '[MEMBRE] Accès exclusif aux ligues et tournois privés',
    ],
    icon: 'ph-trophy',
    color: 'var(--c-esport)',
    bgClass: 'bg-esport',
    image: '/activities/esport.avif',
    keywords: ['esport', 'tournoi', 'match', 'ligue', 'compétition', 'compétitif', 'lol', 'league of legends', 'valo', 'valorant', 'rl', 'rocket league', 'cs2'],
    hidden: true,
  },
];