export interface Article {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  category: 'comparatifs' | 'fiscalite' | 'strategies' | 'marche' | 'guides';
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  featured?: boolean;
  excerpt: string;
}

export const articleCategories = [
  {
    id: 'comparatifs',
    label: 'Comparatifs & Choix',
    icon: '⚖️',
    description: 'Comparez les solutions d\'investissement immobilier'
  },
  {
    id: 'fiscalite',
    label: 'Fiscalité & Optimisation',
    icon: '💰',
    description: 'Optimisez la fiscalité de vos investissements'
  },
  {
    id: 'strategies',
    label: 'Stratégies Patrimoniales',
    icon: '🎯',
    description: 'Construisez votre stratégie d\'investissement'
  },
  {
    id: 'marche',
    label: 'Marché & Tendances',
    icon: '📊',
    description: 'Suivez l\'actualité du marché SCPI'
  },
  {
    id: 'guides',
    label: 'Guides Pratiques',
    icon: '📚',
    description: 'Guides complets pour investir en SCPI'
  }
];

export const articles: Article[] = [
  {
    id: 'fonds-euros-ou-scpi',
    slug: 'fonds-euros-ou-scpi',
    title: 'Fonds euros ou SCPI : que choisir pour votre épargne en 2025 ?',
    metaDescription: 'Comparaison complète entre fonds euros et SCPI : rendements, fiscalité, risques. Guide complet pour optimiser votre assurance-vie en 2025.',
    keywords: ['fonds euros', 'SCPI', 'assurance-vie', 'rendement', 'fiscalité', 'TMI', 'investissement', 'épargne', '2025'],
    category: 'comparatifs',
    publishedAt: '2025-01-20',
    readTime: 12,
    featured: true,
    excerpt: 'Avec des rendements du fonds euros qui stagnent autour de 2 % tandis que l\'inflation reste à 2 %, les SCPI représentent-elles une alternative pertinente ? Comparaison complète des deux solutions.'
  },
  // Prochains articles à créer
  {
    id: 'scpi-assurance-vie-direct',
    slug: 'scpi-assurance-vie-ou-direct',
    title: 'SCPI en assurance-vie ou en direct : quel mode d\'investissement choisir ?',
    metaDescription: 'Comparaison détaillée entre SCPI en assurance-vie et SCPI en direct : fiscalité, frais, transmission, liquidité. Faites le bon choix selon votre profil.',
    keywords: ['SCPI', 'assurance-vie', 'direct', 'fiscalité', 'frais', 'transmission', 'comparaison'],
    category: 'comparatifs',
    publishedAt: '2025-01-21',
    readTime: 10,
    excerpt: 'SCPI en direct ou SCPI en assurance-vie ? Découvrez quelle solution est la plus adaptée à votre situation fiscale et patrimoniale.'
  },
  {
    id: 'scpi-sci-is',
    slug: 'scpi-ou-sci-is',
    title: 'SCPI ou SCI à l\'IS : quelle structure pour investir en immobilier ?',
    metaDescription: 'Comparatif SCPI vs SCI à l\'IS : avantages, inconvénients, fiscalité, gestion. Guide complet pour choisir la meilleure structure d\'investissement.',
    keywords: ['SCPI', 'SCI', 'IS', 'immobilier', 'fiscalité', 'investissement', 'structure'],
    category: 'comparatifs',
    publishedAt: '2025-01-22',
    readTime: 14,
    excerpt: 'SCPI ou SCI à l\'IS ? Analyse comparative des deux structures pour investir en immobilier : frais, gestion, fiscalité, transmission.'
  },
  {
    id: 'scpi-immobilier-locatif',
    slug: 'scpi-ou-immobilier-locatif',
    title: 'SCPI ou immobilier locatif en direct : que choisir en 2025 ?',
    metaDescription: 'Comparaison SCPI vs immobilier locatif direct : rentabilité, gestion, risques, fiscalité. Tous les critères pour faire le bon choix.',
    keywords: ['SCPI', 'immobilier locatif', 'investissement', 'rentabilité', 'gestion', 'fiscalité'],
    category: 'comparatifs',
    publishedAt: '2025-01-23',
    readTime: 13,
    excerpt: 'SCPI ou achat d\'un bien locatif en direct ? Découvrez les avantages et inconvénients de chaque solution pour votre projet immobilier.'
  },
  {
    id: 'scpi-pea-pme',
    slug: 'scpi-ou-pea-pme',
    title: 'SCPI ou PEA-PME : quel placement pour défiscaliser en 2025 ?',
    metaDescription: 'Comparatif SCPI vs PEA-PME : avantages fiscaux, rendements, risques. Guide complet pour optimiser votre fiscalité.',
    keywords: ['SCPI', 'PEA-PME', 'défiscalisation', 'fiscalité', 'rendement', 'placement'],
    category: 'fiscalite',
    publishedAt: '2025-01-24',
    readTime: 11,
    excerpt: 'SCPI ou PEA-PME pour réduire vos impôts ? Analyse comparative des deux enveloppes fiscales et de leurs opportunités.'
  },
  {
    id: 'demembrement-scpi-pleine-propriete',
    slug: 'demembrement-scpi-ou-pleine-propriete',
    title: 'Démembrement de SCPI ou pleine propriété : que choisir selon votre profil ?',
    metaDescription: 'Guide complet sur le démembrement de SCPI : nue-propriété, usufruit, pleine propriété. Comparaison, fiscalité, stratégies.',
    keywords: ['démembrement', 'SCPI', 'nue-propriété', 'usufruit', 'fiscalité', 'transmission'],
    category: 'strategies',
    publishedAt: '2025-01-25',
    readTime: 15,
    excerpt: 'Démembrement ou pleine propriété de SCPI ? Décryptage des 3 modes d\'acquisition et de leurs avantages fiscaux.'
  },
  {
    id: 'scpi-credit-comptant',
    slug: 'scpi-credit-ou-comptant',
    title: 'SCPI à crédit ou au comptant : quelle stratégie est la plus rentable ?',
    metaDescription: 'Analyse SCPI à crédit vs comptant : effet de levier, rentabilité, risques, fiscalité. Calculez votre meilleure option.',
    keywords: ['SCPI', 'crédit', 'comptant', 'effet de levier', 'rentabilité', 'financement'],
    category: 'strategies',
    publishedAt: '2025-01-26',
    readTime: 12,
    excerpt: 'Financer vos SCPI à crédit ou au comptant ? Découvrez comment l\'effet de levier peut booster votre rentabilité.'
  },
  {
    id: 'fiscalite-scpi-tmi-11',
    slug: 'fiscalite-scpi-tmi-11',
    title: 'Fiscalité des SCPI pour TMI 11% : optimisez vos revenus locatifs',
    metaDescription: 'Guide fiscal SCPI pour TMI 11% : calcul de l\'imposition, optimisation, enveloppes fiscales. Maximisez vos revenus nets.',
    keywords: ['SCPI', 'fiscalité', 'TMI 11%', 'imposition', 'revenus fonciers', 'optimisation'],
    category: 'fiscalite',
    publishedAt: '2025-01-27',
    readTime: 10,
    excerpt: 'TMI 11% : découvrez comment optimiser la fiscalité de vos SCPI et maximiser vos revenus locatifs nets.'
  },
  {
    id: 'fiscalite-scpi-tmi-30',
    slug: 'fiscalite-scpi-tmi-30',
    title: 'Fiscalité des SCPI pour TMI 30% : stratégies d\'optimisation fiscale',
    metaDescription: 'Optimisation fiscale SCPI pour TMI 30% : assurance-vie, démembrement, crédit. Réduisez votre imposition efficacement.',
    keywords: ['SCPI', 'fiscalité', 'TMI 30%', 'optimisation', 'assurance-vie', 'démembrement'],
    category: 'fiscalite',
    publishedAt: '2025-01-28',
    readTime: 13,
    excerpt: 'TMI 30% : les meilleures stratégies pour réduire l\'imposition de vos revenus SCPI et améliorer votre rendement net.'
  },
  {
    id: 'fiscalite-scpi-tmi-41',
    slug: 'fiscalite-scpi-tmi-41-45',
    title: 'Fiscalité des SCPI pour TMI 41-45% : guide d\'optimisation avancée',
    metaDescription: 'Guide fiscal SCPI pour hauts revenus (TMI 41-45%) : démembrement, assurance-vie, SCI IS. Optimisez votre fiscalité.',
    keywords: ['SCPI', 'fiscalité', 'TMI 41%', 'TMI 45%', 'hauts revenus', 'optimisation fiscale'],
    category: 'fiscalite',
    publishedAt: '2025-01-29',
    readTime: 14,
    excerpt: 'TMI 41-45% : stratégies d\'optimisation fiscale avancées pour investir en SCPI malgré une forte imposition.'
  },
  {
    id: 'preparer-retraite-scpi',
    slug: 'preparer-retraite-scpi',
    title: 'Préparer sa retraite avec les SCPI : stratégie et montants à investir',
    metaDescription: 'Guide complet pour préparer sa retraite avec les SCPI : montant à investir, stratégie, fiscalité. Générez des revenus complémentaires.',
    keywords: ['SCPI', 'retraite', 'revenus complémentaires', 'stratégie', 'investissement'],
    category: 'strategies',
    publishedAt: '2025-01-30',
    readTime: 16,
    excerpt: 'Comment préparer efficacement votre retraite avec les SCPI ? Montants, stratégies et optimisation fiscale.'
  },
  {
    id: 'revenu-complementaire-scpi',
    slug: 'generer-revenu-complementaire-scpi',
    title: 'Générer un revenu complémentaire avec les SCPI : guide 2025',
    metaDescription: 'Comment générer 500€, 1000€ ou 2000€ de revenus mensuels avec les SCPI ? Calculs, stratégies et optimisation.',
    keywords: ['SCPI', 'revenu complémentaire', 'revenus passifs', 'investissement', 'rentabilité'],
    category: 'strategies',
    publishedAt: '2025-01-31',
    readTime: 11,
    excerpt: 'Découvrez combien investir en SCPI pour générer 500€, 1000€ ou 2000€ de revenus complémentaires mensuels.'
  },
  {
    id: 'diversification-scpi',
    slug: 'diversifier-portefeuille-scpi',
    title: 'Comment diversifier son portefeuille de SCPI : guide pratique',
    metaDescription: 'Guide de diversification SCPI : secteurs, zones géographiques, gestionnaires. Construisez un portefeuille équilibré.',
    keywords: ['SCPI', 'diversification', 'portefeuille', 'secteurs', 'géographie', 'risques'],
    category: 'strategies',
    publishedAt: '2025-02-01',
    readTime: 13,
    excerpt: 'Diversification SCPI : secteurs, zones géographiques, gestionnaires. Tous les critères pour un portefeuille équilibré.'
  },
  {
    id: 'scpi-bureaux-2025',
    slug: 'scpi-bureaux-2025',
    title: 'SCPI de bureaux en 2025 : opportunités et risques du télétravail',
    metaDescription: 'Analyse du marché des SCPI de bureaux en 2025 : impact du télétravail, rendements, meilleures opportunités.',
    keywords: ['SCPI', 'bureaux', 'télétravail', 'marché', 'rendement', '2025'],
    category: 'marche',
    publishedAt: '2025-02-02',
    readTime: 10,
    excerpt: 'SCPI de bureaux en 2025 : le télétravail est-il une menace ou une opportunité ? Analyse du marché et perspectives.'
  },
  {
    id: 'scpi-commerces-2025',
    slug: 'scpi-commerces-2025',
    title: 'SCPI de commerces en 2025 : e-commerce et nouvelles tendances',
    metaDescription: 'État du marché des SCPI de commerces : impact du e-commerce, restructuration, opportunités d\'investissement 2025.',
    keywords: ['SCPI', 'commerces', 'e-commerce', 'retail', 'marché', 'tendances'],
    category: 'marche',
    publishedAt: '2025-02-03',
    readTime: 11,
    excerpt: 'SCPI de commerces face à l\'e-commerce : quelles opportunités d\'investissement en 2025 ?'
  },
  {
    id: 'scpi-sante-2025',
    slug: 'scpi-sante-2025',
    title: 'SCPI santé en 2025 : vieillissement démographique et opportunités',
    metaDescription: 'Analyse des SCPI santé : démographie, rendements, risques. Pourquoi investir dans les EHPAD et cliniques ?',
    keywords: ['SCPI', 'santé', 'EHPAD', 'démographie', 'vieillissement', 'investissement'],
    category: 'marche',
    publishedAt: '2025-02-04',
    readTime: 12,
    excerpt: 'SCPI santé : comment profiter du vieillissement démographique ? Opportunités et précautions.'
  },
  {
    id: 'scpi-logistique-2025',
    slug: 'scpi-logistique-2025',
    title: 'SCPI de logistique en 2025 : l\'essor du e-commerce',
    metaDescription: 'SCPI logistique : pourquoi le secteur explose ? Rendements, acteurs, perspectives 2025.',
    keywords: ['SCPI', 'logistique', 'e-commerce', 'entrepôts', 'rendement', 'croissance'],
    category: 'marche',
    publishedAt: '2025-02-05',
    readTime: 10,
    excerpt: 'SCPI de logistique : le secteur star des SCPI en 2025 ? Analyse des opportunités du e-commerce.'
  },
  {
    id: 'scpi-europeennes-2025',
    slug: 'scpi-europeennes-2025',
    title: 'SCPI européennes en 2025 : faut-il investir hors de France ?',
    metaDescription: 'Guide complet sur les SCPI européennes : rendements, diversification, fiscalité, risques. Opportunités 2025.',
    keywords: ['SCPI', 'européennes', 'Europe', 'Allemagne', 'diversification', 'rendement'],
    category: 'guides',
    publishedAt: '2025-02-06',
    readTime: 14,
    excerpt: 'SCPI européennes : pourquoi diversifier hors de France ? Rendements, pays, opportunités 2025.'
  },
  {
    id: 'erreurs-scpi',
    slug: '10-erreurs-eviter-scpi',
    title: '10 erreurs à éviter quand on investit en SCPI',
    metaDescription: 'Les 10 erreurs les plus fréquentes en SCPI : diversification, frais, fiscalité, horizon. Évitez les pièges classiques.',
    keywords: ['SCPI', 'erreurs', 'pièges', 'conseils', 'investissement', 'débutant'],
    category: 'guides',
    publishedAt: '2025-02-07',
    readTime: 9,
    excerpt: 'Les 10 erreurs classiques à éviter quand on débute en SCPI : frais, diversification, fiscalité...'
  },
  {
    id: 'choisir-scpi-2025',
    slug: 'comment-choisir-scpi-2025',
    title: 'Comment choisir une SCPI en 2025 : les 7 critères essentiels',
    metaDescription: 'Guide complet pour choisir une SCPI : rendement, TOF, capitalisation, secteur, gestionnaire. Tous les critères clés.',
    keywords: ['SCPI', 'choisir', 'critères', 'rendement', 'TOF', 'capitalisation', 'sélection'],
    category: 'guides',
    publishedAt: '2025-02-08',
    readTime: 15,
    excerpt: 'Comment choisir la bonne SCPI ? Les 7 critères essentiels pour faire le bon choix en 2025.'
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug);
}

export function getArticlesByCategory(categoryId: string): Article[] {
  return articles.filter(article => article.category === categoryId);
}

export function getFeaturedArticles(): Article[] {
  return articles.filter(article => article.featured);
}

export function getLatestArticles(limit: number = 5): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getAllArticles(): Article[] {
  return articles;
}
