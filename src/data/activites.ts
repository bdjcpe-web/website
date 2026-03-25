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
  },
  {
    slug: 'jdr',
    title: 'Jeux & JDR',
    tagline: 'Jeux de sociétés, aventures épiques et soirées inoubliables',
    description: 'Le pôle Jeux de Rôle et Jeux de Société du BDJ anime la vie étudiante autour de parties endiablées. Que tu sois un vétéran des tables de D&D ou un néophyte curieux, tu trouveras ta communauté ici.',
    details: [
      'Collection de +50 jeux de société (Catan, Codenames, Terraforming Mars...)',
      '[MEMBRE] Campagnes de Donjons & Dragons (5e édition)',
      '[MEMBRE] Initiation à l\'Appel de Cthulhu',
      'Soirées jeux chaque semaine',
      'Tournois saisonniers avec lots',
    ],
    icon: 'ph-dice-five',
    color: 'var(--c-jdr)',
    bgClass: 'bg-jdr',
    image: '/activities/jdr.jpg',
  },
  {
    slug: 'poker',
    title: 'Poker',
    tagline: 'Soirées amicales et tournois mensuels avec lots à gagner',
    description: 'Le pôle Poker du BDJ organise des parties amicales régulières et des tournois officiels avec des récompenses. Un excellent exercice de psychologie et de calcul de probabilités... ou juste un bon moment entre amis.',
    details: [
      'Tapis professionnelles et jetons de qualité dans le Local',
      'Tournois mensuels avec prix (cadeaux, cartes cadeaux)',
      '[MEMBRE] Parties libres accessibles à tous les membres',
      'Initiation pour les débutants',
    ],
    icon: 'ph-spade',
    color: 'var(--c-poker)',
    bgClass: 'bg-poker',
    image: '/activities/poker.jpg',
  },
  {
    slug: 'sorties',
    title: 'Sorties',
    tagline: 'On te sort de ta chambre pour des soirées bowling, billard, etc.',
    description: 'Le pôle Sorties te sort de ta chambre ! Escape games, bars de jeux, laser game, concerts, salles d\'arcade... L\'objectif est simple : créer des souvenirs mémorables en groupe hors du campus.',
    details: [
      'Sortie mensuelle (escape game, bar jeux, karting...)',
      '[MEMBRE] Tarifs négociés en groupe — réductions membres',
      'Programme annoncé à l\'avance via le calendrier',
      'Détails sur le Whatsapp officiel du BDJ',
      'Ouvert à tous, membres et non-membres',
    ],
    icon: 'ph-bowling-ball',
    color: 'var(--c-sorties)',
    bgClass: 'bg-sorties',
    image: '/activities/billiard.jpg',
  },
  {
    slug: 'gaming',
    title: 'Gaming',
    tagline: 'Des tournois & soirées gaming, un serveur MC et un Club FIFA',
    description: 'Le pôle Gaming organise des soirées jeux vidéo conviviales (Smash Bros, Mario Kart, Party Games, etc.). Si la survie te tente, notre serveur Minecraft multijoueur est accessible sans interruption aux membres de l\'association pour des aventures épiques. Aussi, rejoins le terrain avec le Club Pro FIFA pour des matchs et soirées de folies.',
    details: [
      'Gros tournois canapé : Smash Bros, Mario Kart...',
      'Setups avec consoles Switch de l\'asso',
      '[MEMBRE] Accès membre privé au Serveur Survie Minecraft Java',
      'Club Pro FIFA ouvert à tous',
      'Événements multijoueurs (Among Us, Gartic Phone, ...)',
      'Fun, cris et mauvaise foi garantis'
    ],
    icon: 'ph-game-controller',
    color: 'var(--c-gaming)',
    bgClass: 'bg-gaming',
    image: '/activities/gaming.avif',
  },
];
