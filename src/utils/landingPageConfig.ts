export interface LandingPageConfig {
  id: string;
  title: string;
  metaDescription: string;
  h1: string;
  description: string;
  senderGroupId?: string;
  urlParams: {
    filter?: string;
    sector?: string;
    geo?: string;
    yield?: string;
  };
  keywords: string[];
}

export const landingPages: LandingPageConfig[] = [
  {
    id: 'scpi-bureaux',
    title: 'SCPI Bureaux 2025 : Comparateur & Investissement',
    metaDescription: 'Comparez les meilleures SCPI bureaux. Rendements attractifs, capitalisation sécurisée. Analyse détaillée et conseils d\'expert gratuits.',
    h1: 'Comparateur SCPI Bureaux : Trouvez les Meilleurs Placements 2025',
    description: 'Investissez dans les SCPI spécialisées en bureaux avec des rendements stables et une diversification géographique optimale.',
    urlParams: { sector: 'bureaux' },
    keywords: ['scpi bureaux', 'investissement bureaux', 'immobilier tertiaire']
  },
  {
    id: 'scpi-commerces',
    title: 'SCPI Commerces 2025 : Meilleurs Rendements',
    metaDescription: 'Découvrez les SCPI commerces aux rendements élevés. Investissez dans les murs de magasins et centres commerciaux. Conseil gratuit.',
    h1: 'SCPI Commerces : Investissement Immobilier à Haut Rendement',
    description: 'Les SCPI commerces offrent des rendements attractifs grâce aux baux commerciaux et à la diversification des enseignes.',
    urlParams: { sector: 'commerces' },
    keywords: ['scpi commerces', 'investissement commerce', 'murs de magasins']
  },
  {
    id: 'scpi-sante',
    title: 'SCPI Santé 2025 : Investissement Sécurisé',
    metaDescription: 'SCPI santé : investissement dans les EHPAD, cliniques et résidences médicalisées. Rendement stable et secteur résilient.',
    h1: 'SCPI Santé : Investir dans l\'Immobilier Médical',
    description: 'Le secteur de la santé offre stabilité et pérennité. Investissez dans les EHPAD, cliniques et centres médicaux avec confiance.',
    urlParams: { sector: 'sante' },
    keywords: ['scpi santé', 'investissement ehpad', 'immobilier médical']
  },
  {
    id: 'scpi-isr',
    title: 'SCPI ISR 2025 : Investissement Responsable',
    metaDescription: 'SCPI labellisées ISR : investissement durable et responsable. Performance financière et impact environnemental positif.',
    h1: 'SCPI ISR : Investissez de Manière Responsable',
    description: 'Les SCPI ISR combinent performance financière et respect de l\'environnement. Investissement éthique et rentable.',
    urlParams: { filter: 'isr' },
    keywords: ['scpi isr', 'investissement responsable', 'scpi durable']
  },
  {
    id: 'scpi-haut-rendement',
    title: 'SCPI Haut Rendement 2025 : +6% par an',
    metaDescription: 'Top SCPI à haut rendement : +6% et plus. Comparez les performances, frais et risques. Maximisez vos revenus locatifs.',
    h1: 'SCPI à Haut Rendement : Les Meilleures Performances',
    description: 'Sélection exclusive des SCPI offrant les meilleurs rendements du marché, au-delà de 6% par an.',
    urlParams: { filter: 'high-yield' },
    keywords: ['scpi rendement', 'meilleur rendement scpi', 'scpi 6%']
  },
  {
    id: 'scpi-logistique',
    title: 'SCPI Logistique 2025 : E-commerce & Entrepôts',
    metaDescription: 'Investissez dans les SCPI logistique : entrepôts, plateformes e-commerce. Secteur en forte croissance, rendements attractifs.',
    h1: 'SCPI Logistique : L\'Avenir du E-commerce',
    description: 'Profitez de la croissance du e-commerce avec les SCPI logistique. Entrepôts modernes et plateformes de distribution.',
    urlParams: { sector: 'logistique' },
    keywords: ['scpi logistique', 'investissement entrepôt', 'immobilier logistique']
  },
  {
    id: 'scpi-residentiel',
    title: 'SCPI Résidentiel 2025 : Investissement Locatif',
    metaDescription: 'SCPI résidentiel : investissez dans l\'immobilier d\'habitation. Marché stable, demande locative forte, revenus réguliers.',
    h1: 'SCPI Résidentiel : Immobilier d\'Habitation',
    description: 'L\'immobilier résidentiel offre stabilité et demande constante. Investissez dans des logements avec des rendements réguliers.',
    urlParams: { sector: 'residentiel' },
    keywords: ['scpi résidentiel', 'investissement locatif', 'immobilier habitation']
  },
  {
    id: 'scpi-france',
    title: 'SCPI France 2025 : Investissement Local',
    metaDescription: 'SCPI investies en France : marché domestique, fiscalité maîtrisée. Comparez les meilleures SCPI françaises.',
    h1: 'SCPI France : Investissez sur le Marché Français',
    description: 'Restez sur le marché français avec des SCPI 100% investies en France. Sécurité, proximité et connaissance du marché.',
    urlParams: { filter: 'francaises' },
    keywords: ['scpi france', 'investissement france', 'immobilier français']
  },
  {
    id: 'scpi-diversifiees',
    title: 'SCPI Diversifiées 2025 : Multi-Secteurs pour Réduire les Risques',
    metaDescription: 'SCPI diversifiées tous secteurs : bureaux, commerces, santé, logistique. Réduisez les risques avec la diversification.',
    h1: 'SCPI Diversifiées : Multi-Secteurs pour Limiter les Risques',
    description: 'Les SCPI diversifiées investissent dans plusieurs secteurs pour optimiser le couple rendement/risque.',
    urlParams: { sector: 'diversifie' },
    keywords: ['scpi diversifiée', 'scpi diversifie', 'diversification immobilière']
  }
];

export const getLandingPageByPath = (path: string): LandingPageConfig | null => {
  const cleanPath = path.replace(/^\/|\/$/g, '');
  return landingPages.find(page => page.id === cleanPath) || null;
};

export const generateLandingPageUrl = (config: LandingPageConfig): string => {
  const params = new URLSearchParams(config.urlParams as Record<string, string>);
  return `/?${params.toString()}`;
};
