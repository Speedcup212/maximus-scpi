/**
 * Configuration complète des 30 articles éducation SCPI
 * Correspond aux composants réels dans /src/components/articles/
 */

export interface ArticleTemplate {
  id: number;
  slug: string;
  title: string;
  mainKeyword: string;
  searchIntent: string;
  targetAudience: string;
  category: 'comparatifs' | 'fiscalite' | 'strategies' | 'marche' | 'guides' | 'analyse';
  wordCountTarget: number;
  featured?: boolean;
  metaDescription: string;
  keywords: string[];
}

export const articleTemplates: ArticleTemplate[] = [
  // Articles Piliers Comparatifs
  {
    id: 1,
    slug: 'fonds-euros-ou-scpi',
    title: 'Fonds euros ou SCPI : que faire en 2025 ?',
    mainKeyword: 'fonds euros ou SCPI',
    searchIntent: 'comparer fonds euros et SCPI pour décider où placer son épargne',
    targetAudience: 'particuliers TMI 11–30 %, au moins 50 000 € sur assurance-vie',
    category: 'comparatifs',
    wordCountTarget: 3500,
    featured: true,
    metaDescription: 'Comparatif détaillé 2025 entre fonds euros (2%) et SCPI (5-6,5%). Rendements, fiscalité, risques et stratégies selon votre profil TMI.',
    keywords: ['fonds euros ou SCPI', 'assurance-vie', 'rendement 2025', 'fiscalité', 'TMI', 'arbitrage']
  },
  {
    id: 2,
    slug: 'scpi-en-direct-ou-assurance-vie',
    title: 'SCPI en direct ou en assurance-vie : quelles différences ?',
    mainKeyword: 'SCPI en direct ou assurance vie',
    searchIntent: 'comprendre les différences pratiques et fiscales',
    targetAudience: 'épargnants équipés en assurance-vie',
    category: 'comparatifs',
    wordCountTarget: 3000,
    featured: true,
    metaDescription: 'SCPI en direct vs assurance-vie : comparatif complet fiscalité, frais, transmission, liquidité. Tableaux chiffrés selon TMI.',
    keywords: ['SCPI direct', 'SCPI assurance-vie', 'fiscalité', 'flat tax', 'transmission']
  },
  {
    id: 3,
    slug: '100000-euros-fonds-euros-cout-opportunite',
    title: '100 000 € sur un fonds euros : quel est le vrai coût d\'opportunité ?',
    mainKeyword: '100 000 euros fonds euros',
    searchIntent: 'mesurer le coût d\'opportunité de rester en fonds euros',
    targetAudience: 'épargnants avec 100 000 €+ sur fonds euros',
    category: 'comparatifs',
    wordCountTarget: 2800,
    metaDescription: '100 000€ sur fonds euros à 2% vs SCPI 5% sur 15 ans : +63 000€ de différence. Calculs détaillés avec inflation.',
    keywords: ['100 000 euros', 'fonds euros', 'coût opportunité', 'SCPI', 'inflation']
  },
  {
    id: 4,
    slug: 'investir-200000-euros-scpi-portefeuille-diversifie',
    title: 'Comment investir 200 000 € en SCPI : stratégie de portefeuille diversifié',
    mainKeyword: 'investir 200 000 euros SCPI',
    searchIntent: 'construire une stratégie avec un gros ticket',
    targetAudience: 'couples TMI 30–41 %, patrimoine financier significatif',
    category: 'comparatifs',
    wordCountTarget: 2800,
    metaDescription: '200 000€ en SCPI : portefeuille diversifié 5-6 SCPI, revenus 10 000€/an, fiscalité couple, horizon 15 ans.',
    keywords: ['investir 200 000 euros', 'portefeuille SCPI', 'diversification', 'couple TMI']
  },
  {
    id: 5,
    slug: 'scpi-ou-immobilier-locatif-comparatif-20-ans',
    title: 'SCPI ou immobilier locatif direct : comparatif sur 20 ans',
    mainKeyword: 'SCPI ou immobilier locatif',
    searchIntent: 'comparer SCPI à la location nue/meublée',
    targetAudience: 'investisseurs attirés par l\'immobilier',
    category: 'comparatifs',
    wordCountTarget: 2800,
    metaDescription: 'SCPI vs immobilier locatif sur 20 ans : rentabilité nette, gestion, vacance, travaux, fiscalité. Simulation 150 000€.',
    keywords: ['SCPI vs immobilier locatif', 'location nue', 'rentabilité nette', 'gestion']
  },

  // Stratégies
  {
    id: 6,
    slug: 'achat-scpi-credit-effet-levier-fiscalite',
    title: 'Acheter des SCPI à crédit : effet de levier et optimisation fiscale',
    mainKeyword: 'SCPI à crédit',
    searchIntent: 'savoir si l\'effet de levier sur SCPI est intéressant',
    targetAudience: 'TMI 30–41 %, revenus stables, capacité d\'emprunt',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'SCPI à crédit en 2025 : analyse effet de levier avec taux 3-4%. Calculs cash-flow, déductibilité intérêts.',
    keywords: ['SCPI à crédit', 'effet de levier', 'taux crédit', 'cash-flow', 'TMI 30%']
  },
  {
    id: 7,
    slug: 'demembrement-scpi-nue-propriete-usufruit',
    title: 'Démembrement de SCPI : nue-propriété et usufruit expliqués',
    mainKeyword: 'démembrement SCPI',
    searchIntent: 'comprendre l\'intérêt du démembrement de SCPI',
    targetAudience: '40–60 ans avec capacité d\'épargne long terme',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'Démembrement SCPI : achat nue-propriété, économie fiscale, reconstitution usufruit. Stratégie 10-15 ans chiffrée.',
    keywords: ['démembrement SCPI', 'nue-propriété', 'usufruit', 'retraite', 'décote']
  },
  {
    id: 18,
    slug: 'per-scpi-retraite-deduction-fiscale',
    title: 'PER avec SCPI : préparer sa retraite et défiscaliser',
    mainKeyword: 'PER SCPI',
    searchIntent: 'optimiser PER avec SCPI',
    targetAudience: 'actifs TMI 30-41% préparant retraite',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'PER et SCPI : déduction fiscale + revenus locatifs. Stratégie optimale pour TMI 30-41%, simulation 15-20 ans.',
    keywords: ['PER SCPI', 'déduction fiscale', 'retraite', 'TMI 41%', 'défiscalisation']
  },
  {
    id: 19,
    slug: 'sci-scpi-societe-civile-immobiliere-parts',
    title: 'Détenir des SCPI dans une SCI : avantages et stratégie patrimoniale',
    mainKeyword: 'SCI SCPI',
    searchIntent: 'investir en SCPI via SCI',
    targetAudience: 'patrimoine familial, optimisation succession',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'SCPI dans une SCI : transmission facilitée, gestion familiale, optimisation fiscale. Stratégies patrimoniales avancées.',
    keywords: ['SCI SCPI', 'transmission', 'famille', 'optimisation', 'démembrement']
  },
  {
    id: 22,
    slug: 'diversification-scpi-combien-nombre-parts',
    title: 'Diversification SCPI : combien de SCPI faut-il détenir ?',
    mainKeyword: 'diversification SCPI',
    searchIntent: 'nombre optimal de SCPI dans un portefeuille',
    targetAudience: 'investisseurs voulant diversifier',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'Diversification SCPI : 4-6 SCPI minimum pour limiter les risques. Stratégie allocation secteurs, zones géographiques.',
    keywords: ['diversification SCPI', 'nombre SCPI', 'allocation', 'risques', 'secteurs']
  },
  {
    id: 29,
    slug: 'premier-investissement-scpi-debutant-guide',
    title: 'Premier investissement en SCPI : guide complet pour débutants',
    mainKeyword: 'premier investissement SCPI',
    searchIntent: 'débuter en SCPI sans erreur',
    targetAudience: 'débutants, primo-investisseurs',
    category: 'strategies',
    wordCountTarget: 2800,
    metaDescription: 'Premier investissement SCPI : guide étape par étape, choix SCPI, montant minimum, enveloppe fiscale. Débutants.',
    keywords: ['premier investissement', 'SCPI débutant', 'guide', 'étapes', 'montant minimum']
  },
  {
    id: 30,
    slug: 'investir-scpi-jeune-actif-25-35-ans',
    title: 'Investir en SCPI quand on est jeune actif (25-35 ans)',
    mainKeyword: 'SCPI jeune actif',
    searchIntent: 'investir en SCPI jeune',
    targetAudience: '25-35 ans, début carrière',
    category: 'strategies',
    wordCountTarget: 2600,
    metaDescription: 'SCPI pour jeunes actifs 25-35 ans : horizon long terme, revenus complémentaires, stratégie progressive. Guide débutant.',
    keywords: ['SCPI jeune', '25-35 ans', 'actif', 'long terme', 'revenus passifs']
  },

  // Fiscalité
  {
    id: 8,
    slug: 'investir-scpi-tmi-11-pourcent-fiscalite-optimale',
    title: 'Investir en SCPI avec une TMI à 11% : quelle stratégie fiscale ?',
    mainKeyword: 'SCPI TMI 11',
    searchIntent: 'optimiser SCPI avec faible TMI',
    targetAudience: 'TMI 11%, jeunes actifs',
    category: 'fiscalite',
    wordCountTarget: 2500,
    metaDescription: 'SCPI avec TMI 11% : rendement net 5,3%, privilégier SCPI européennes PS 0%. Stratégie fiscale optimale.',
    keywords: ['SCPI TMI 11%', 'rendement net', 'fiscalité faible', 'SCPI européennes']
  },
  {
    id: 9,
    slug: 'scpi-tmi-30-pourcent-arbitrage-av-direct',
    title: 'SCPI avec TMI 30% : faut-il privilégier l\'assurance-vie ou le direct ?',
    mainKeyword: 'SCPI TMI 30',
    searchIntent: 'optimiser enveloppe avec TMI moyenne',
    targetAudience: 'TMI 30%, classe moyenne supérieure',
    category: 'fiscalite',
    wordCountTarget: 2500,
    metaDescription: 'SCPI TMI 30% : arbitrage direct vs AV. Rendement net 4,3% AV vs 3,9% direct. Stratégie optimale selon horizon.',
    keywords: ['SCPI TMI 30%', 'assurance-vie', 'direct', 'arbitrage', 'rendement net']
  },
  {
    id: 10,
    slug: 'forte-imposition-tmi-41-scpi-assurance-vie',
    title: 'TMI 41% et plus : pourquoi les SCPI en assurance-vie sont incontournables',
    mainKeyword: 'SCPI TMI 41',
    searchIntent: 'optimiser SCPI forte imposition',
    targetAudience: 'TMI 41-45%, hauts revenus',
    category: 'fiscalite',
    wordCountTarget: 2500,
    metaDescription: 'SCPI TMI 41%+ : assurance-vie obligatoire. Rendement net 4,1% vs 2,6% direct. Optimisation fiscale maximale.',
    keywords: ['SCPI TMI 41%', 'haute imposition', 'assurance-vie', 'optimisation fiscale']
  },
  {
    id: 12,
    slug: 'scpi-fiscales-malraux-deficit-foncier-2025',
    title: 'SCPI fiscales 2025 : Malraux, déficit foncier, quel dispositif choisir ?',
    mainKeyword: 'SCPI fiscales',
    searchIntent: 'défiscaliser avec SCPI',
    targetAudience: 'TMI 41-45%, recherche défiscalisation',
    category: 'fiscalite',
    wordCountTarget: 2500,
    metaDescription: 'SCPI fiscales 2025 : Malraux, Pinel, déficit foncier. Réductions d\'impôt, rentabilité nette, risques. Comparatif complet.',
    keywords: ['SCPI fiscales', 'Malraux', 'Pinel', 'déficit foncier', 'défiscalisation']
  },
  {
    id: 20,
    slug: 'ifi-scpi-impot-fortune-immobiliere-strategies',
    title: 'IFI et SCPI : comment réduire l\'Impôt sur la Fortune Immobilière',
    mainKeyword: 'IFI SCPI',
    searchIntent: 'impact SCPI sur IFI',
    targetAudience: 'patrimoine immobilier > 1,3M€',
    category: 'fiscalite',
    wordCountTarget: 2400,
    metaDescription: 'SCPI et IFI : intégration patrimoine taxable, stratégies pour limiter l\'impact. SCPI en AV exonérées IFI.',
    keywords: ['IFI SCPI', 'impôt fortune immobilière', 'exonération', 'assurance-vie IFI']
  },
  {
    id: 21,
    slug: 'succession-scpi-transmission-droits-heritage',
    title: 'Succession de SCPI : transmettre son patrimoine immobilier',
    mainKeyword: 'succession SCPI',
    searchIntent: 'optimiser transmission SCPI',
    targetAudience: '50-70 ans avec héritiers',
    category: 'fiscalite',
    wordCountTarget: 2400,
    metaDescription: 'Transmission SCPI : direct vs assurance-vie (abattement 152 500€). Démembrement pour anticiper. Stratégies succession.',
    keywords: ['succession SCPI', 'transmission', 'assurance-vie', 'abattement', 'démembrement']
  },

  // Guides
  {
    id: 11,
    slug: 'scpi-europeennes-avantages-ps-0-rendement',
    title: 'SCPI européennes : l\'avantage fiscal des prélèvements sociaux à 0%',
    mainKeyword: 'SCPI européennes',
    searchIntent: 'comprendre l\'intérêt fiscal des SCPI Europe',
    targetAudience: 'TMI 30–41 % cherchant à optimiser',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI européennes : rendement 6-6,5%, PS 0%, diversification Allemagne/Pays-Bas. Optimisation fiscale TMI 30-41%.',
    keywords: ['SCPI européennes', 'PS 0%', 'Allemagne', 'Pays-Bas', 'rendement 6,5%']
  },
  {
    id: 13,
    slug: 'scpi-sante-seniors-ehpad-cliniques-investissement',
    title: 'SCPI santé et seniors : investir dans l\'immobilier médical et les EHPAD',
    mainKeyword: 'SCPI santé',
    searchIntent: 'investir secteur santé via SCPI',
    targetAudience: 'investisseurs thématiques',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI santé 2025 : EHPAD, cliniques, cabinets médicaux. Rendement 5-6%, secteur résilient, vieillissement population.',
    keywords: ['SCPI santé', 'EHPAD', 'immobilier médical', 'vieillissement', 'résilience']
  },
  {
    id: 14,
    slug: 'scpi-bureaux-tertiaire-teletravail-2025',
    title: 'SCPI de bureaux en 2025 : quel impact du télétravail ?',
    mainKeyword: 'SCPI bureaux',
    searchIntent: 'impact télétravail sur bureaux',
    targetAudience: 'investisseurs analysant secteur tertiaire',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI bureaux 2025 : impact télétravail, immeubles prime vs secondaire, Paris vs régions. Analyse secteur tertiaire.',
    keywords: ['SCPI bureaux', 'télétravail', 'immobilier tertiaire', 'Paris', 'prime']
  },
  {
    id: 15,
    slug: 'scpi-commerces-retail-e-commerce-opportunites',
    title: 'SCPI de commerces : comment le retail résiste au e-commerce',
    mainKeyword: 'SCPI commerces',
    searchIntent: 'viabilité commerces face e-commerce',
    targetAudience: 'investisseurs analysant retail',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI commerces 2025 : retail de proximité résilient, galeries alimentaires, murs boutiques. Stratégies anti e-commerce.',
    keywords: ['SCPI commerces', 'retail', 'e-commerce', 'pieds immeuble', 'alimentaire']
  },
  {
    id: 16,
    slug: 'scpi-logistique-entrepots-e-commerce-2025',
    title: 'SCPI logistique et entrepôts : l\'eldorado de l\'e-commerce',
    mainKeyword: 'SCPI logistique',
    searchIntent: 'opportunités logistique e-commerce',
    targetAudience: 'investisseurs thématiques e-commerce',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI logistique 2025 : entrepôts e-commerce, baux longues durées, rendement 6-7%. Secteur croissance forte.',
    keywords: ['SCPI logistique', 'entrepôts', 'e-commerce', 'baux longues', 'croissance']
  },
  {
    id: 17,
    slug: 'scpi-residentielles-logement-locatif-scpi-habitation',
    title: 'SCPI résidentielles : investir dans le logement locatif via les SCPI',
    mainKeyword: 'SCPI résidentielles',
    searchIntent: 'SCPI logement habitation',
    targetAudience: 'investisseurs résidentiel',
    category: 'guides',
    wordCountTarget: 2500,
    metaDescription: 'SCPI résidentielles 2025 : logement locatif, résilience, rendement 4-5%, crise logement. Alternative immobilier direct.',
    keywords: ['SCPI résidentielles', 'logement', 'locatif', 'habitation', 'résilience']
  },
  {
    id: 24,
    slug: 'risques-scpi-vacance-locative-liquidite',
    title: 'Quels sont les risques des SCPI ? Analyse complète et transparente',
    mainKeyword: 'risques SCPI',
    searchIntent: 'comprendre les vrais risques',
    targetAudience: 'prospects hésitants',
    category: 'guides',
    wordCountTarget: 2400,
    metaDescription: 'Risques SCPI : baisse prix part, vacance locative, liquidité, crise immobilière. Historique 2008-2012, stratégies limitation.',
    keywords: ['risques SCPI', 'vacance', 'liquidité', 'baisse', 'crise immobilière']
  },
  {
    id: 25,
    slug: 'frais-scpi-souscription-gestion-performance',
    title: 'Frais SCPI : comprendre et optimiser les coûts d\'investissement',
    mainKeyword: 'frais SCPI',
    searchIntent: 'coûts cachés SCPI',
    targetAudience: 'investisseurs analysant rentabilité nette',
    category: 'guides',
    wordCountTarget: 2400,
    metaDescription: 'Frais SCPI 2025 : souscription 8-12%, gestion 10-12% HT, impact rendement net. Optimisation via AV, comparaison sociétés.',
    keywords: ['frais SCPI', 'souscription', 'gestion', 'TTC', 'rendement net']
  },
  {
    id: 26,
    slug: 'revendre-parts-scpi-delais-marche-secondaire',
    title: 'Revendre ses parts de SCPI : délais, procédure et marché secondaire',
    mainKeyword: 'revendre SCPI',
    searchIntent: 'liquidité et sortie SCPI',
    targetAudience: 'investisseurs déjà équipés',
    category: 'guides',
    wordCountTarget: 2400,
    metaDescription: 'Revente SCPI : délais 2-6 mois marché secondaire, décote possible. SCPI en AV : arbitrage instantané. Guide liquidité.',
    keywords: ['revendre SCPI', 'marché secondaire', 'liquidité', 'délais', 'décote']
  },

  // Analyses
  {
    id: 23,
    slug: 'rendement-scpi-2025-tdvm-taux-distribution',
    title: 'Rendement SCPI 2025 : comprendre le TDVM et le taux de distribution',
    mainKeyword: 'rendement SCPI 2025',
    searchIntent: 'comprendre les indicateurs de performance',
    targetAudience: 'investisseurs analysant rendements',
    category: 'analyse',
    wordCountTarget: 2500,
    metaDescription: 'Rendement SCPI 2025 : TDVM 4-6,5%, taux distribution sur VR. Calculs, comparaisons, top 10 SCPI rendement 2025.',
    keywords: ['rendement SCPI', 'TDVM', 'taux distribution', '2025', 'performance']
  },
  {
    id: 27,
    slug: 'scpi-ou-etf-immobilier-reit-comparatif',
    title: 'SCPI ou ETF immobilier (REIT) : quel placement choisir ?',
    mainKeyword: 'SCPI ou ETF immobilier',
    searchIntent: 'comparer immobilier papier français vs mondial',
    targetAudience: 'investisseurs diversifiés',
    category: 'analyse',
    wordCountTarget: 2500,
    metaDescription: 'SCPI vs ETF REIT : volatilité, dividendes, fiscalité, diversification. Stratégie complémentaire 50/50 pour optimiser.',
    keywords: ['SCPI vs ETF', 'REIT', 'immobilier', 'volatilité', 'dividendes']
  },
  {
    id: 28,
    slug: 'scpi-ou-opci-differences-avantages',
    title: 'SCPI ou OPCI : quelle différence et quel placement privilégier ?',
    mainKeyword: 'SCPI ou OPCI',
    searchIntent: 'différence SCPI vs OPCI',
    targetAudience: 'investisseurs comparant véhicules',
    category: 'analyse',
    wordCountTarget: 2500,
    metaDescription: 'SCPI vs OPCI : liquidité, composition, fiscalité, performance. Avantages/inconvénients, quel placement choisir selon profil.',
    keywords: ['SCPI vs OPCI', 'différence', 'liquidité', 'fiscalité', 'performance']
  }
];

export function getTemplateById(id: number): ArticleTemplate | undefined {
  return articleTemplates.find(t => t.id === id);
}

export function getTemplateBySlug(slug: string): ArticleTemplate | undefined {
  return articleTemplates.find(t => t.slug === slug);
}

export function getTemplatesByCategory(category: string): ArticleTemplate[] {
  return articleTemplates.filter(t => t.category === category);
}

export function getFeaturedTemplates(): ArticleTemplate[] {
  return articleTemplates.filter(t => t.featured);
}
