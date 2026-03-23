export type Partenaire = {
  slug: string;
  name: string;
  logoUrl: string;
  website: string;
  partnerSince: string;
  tagline: string;
  description: string;
  aides: { title: string; detail: string }[];
};

export const partenaires: Partenaire[] = [
  {
    slug: 'sopra-steria',
    name: 'Sopra Steria',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Sopra_Steria_logo.svg',
    website: 'https://www.soprasteria.com',
    partnerSince: 'Mars 2026',
    tagline: 'Premier partenaire officiel du Bureau des Jeux de CPE Lyon.',
    description:
      'Sopra Steria est un leader européen de la transformation numérique qui compte plus de 50 000 employés. Leur engagement envers le BDJ CPE Lyon reflète leur soutien à la vie étudiante et à l\'innovation dans les campus d\'ingénieurs.',
    aides: [
      {
        title: 'Financement des maillots Esport',
        detail:
          'Sopra Steria a financé l\'intégralité des maillots officiels de nos équipes compétitives pour les saisons 2025-2026.',
      },
      {
        title: 'Participations aux LAN parties',
        detail:
          'Grâce à leur soutien financier, nos équipes LoL et Rocket League ont pu se déplacer et participer à des LAN parties inter-écoles.',
      },
    ],
  },
];
