/**
 * Générateur de 30 articles optimisés SEO pour MaximusSCPI
 * Basé sur le modèle de l'article "Fonds euros ou SCPI"
 */

interface ArticleTemplate {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  category: 'comparatifs' | 'guides' | 'strategies' | 'fiscalite' | 'analyses';
  targetKeyword: string;
  relatedKeywords: string[];
  readTime: string;
}

export const articles30Templates: ArticleTemplate[] = [
  // ARTICLE 1 - DÉJÀ FAIT
  {
    id: 'article-001',
    slug: 'fonds-euros-ou-scpi',
    title: 'Fonds euros ou SCPI : que faire en 2025 ?',
    metaDescription: 'Comparatif complet entre fonds euros et SCPI : rendements, fiscalité, risques. Découvrez quelle solution choisir selon votre profil et vos objectifs patrimoniaux.',
    category: 'comparatifs',
    targetKeyword: 'fonds euros ou scpi',
    relatedKeywords: ['rendement fonds euros', 'investir scpi', 'assurance vie scpi'],
    readTime: '15 min'
  },

  // ARTICLE 2 - SCPI Direct vs AV
  {
    id: 'article-002',
    slug: 'scpi-en-direct-ou-assurance-vie',
    title: 'SCPI en direct ou via assurance-vie : quel mode d\'achat choisir ?',
    metaDescription: 'Achat de SCPI en direct ou via assurance-vie : comparatif complet des avantages fiscaux, liquidité, IFI et succession pour optimiser votre investissement.',
    category: 'comparatifs',
    targetKeyword: 'scpi direct ou assurance vie',
    relatedKeywords: ['scpi compte-titres', 'scpi av fiscalité', 'liquidité scpi'],
    readTime: '12 min'
  },

  // ARTICLE 3 - Coût opportunité 100k€
  {
    id: 'article-003',
    slug: '100000-euros-fonds-euros-cout-opportunite',
    title: '100 000 € sur un fonds euros : quel est le vrai coût d\'opportunité ?',
    metaDescription: 'Analyse du coût d\'opportunité de laisser 100 000 € sur un fonds euros à 2%. Calculs comparés sur 10-20 ans avec SCPI, ETF et immobilier locatif.',
    category: 'analyses',
    targetKeyword: 'coût opportunité fonds euros',
    relatedKeywords: ['rendement fonds euros 2025', 'alternative fonds euros', 'investir 100000 euros'],
    readTime: '10 min'
  },

  // ARTICLE 4 - Portfolio 200k€
  {
    id: 'article-004',
    slug: 'investir-200000-euros-scpi-portefeuille-diversifie',
    title: 'Comment investir 200 000 € en SCPI : stratégie de portefeuille diversifié',
    metaDescription: 'Stratégie complète pour investir 200 000 € en SCPI : diversification sectorielle, géographique, répartition optimale et erreurs à éviter.',
    category: 'strategies',
    targetKeyword: 'investir 200000 euros scpi',
    relatedKeywords: ['portefeuille scpi diversifié', 'allocation scpi', 'diversification immobilière'],
    readTime: '14 min'
  },

  // ARTICLE 5 - SCPI vs Immo locatif
  {
    id: 'article-005',
    slug: 'scpi-ou-immobilier-locatif-comparatif-20-ans',
    title: 'SCPI ou immobilier locatif direct : comparatif sur 20 ans',
    metaDescription: 'Comparaison détaillée SCPI vs immobilier locatif sur 20 ans : rentabilité nette, gestion, fiscalité, effort d\'épargne et revente.',
    category: 'comparatifs',
    targetKeyword: 'scpi ou immobilier locatif',
    relatedKeywords: ['rentabilité locative', 'gestion locative', 'investissement immobilier'],
    readTime: '16 min'
  },

  // ARTICLE 6 - Crédit SCPI
  {
    id: 'article-006',
    slug: 'achat-scpi-credit-effet-levier-fiscalite',
    title: 'Acheter des SCPI à crédit : effet de levier et optimisation fiscale',
    metaDescription: 'Guide complet sur l\'achat de SCPI à crédit : calculs de rentabilité, déduction fiscale des intérêts, conditions bancaires et exemples concrets.',
    category: 'strategies',
    targetKeyword: 'scpi à crédit',
    relatedKeywords: ['crédit immobilier scpi', 'effet de levier scpi', 'déduction intérêts emprunt'],
    readTime: '13 min'
  },

  // ARTICLE 7 - Démembrement
  {
    id: 'article-007',
    slug: 'demembrement-scpi-nue-propriete-usufruit',
    title: 'Démembrement de SCPI : nue-propriété et usufruit expliqués',
    metaDescription: 'Tout savoir sur le démembrement de SCPI : principe, avantages fiscaux, optimisation IFI, transmission patrimoniale et cas pratiques chiffrés.',
    category: 'fiscalite',
    targetKeyword: 'démembrement scpi',
    relatedKeywords: ['nue-propriété scpi', 'usufruit scpi', 'transmission patrimoine'],
    readTime: '11 min'
  },

  // ARTICLE 8 - TMI 11%
  {
    id: 'article-008',
    slug: 'investir-scpi-tmi-11-pourcent-fiscalite-optimale',
    title: 'Investir en SCPI avec une TMI à 11% : quelle stratégie fiscale ?',
    metaDescription: 'Stratégie d\'investissement SCPI optimisée pour TMI 11% : SCPI européennes, assurance-vie, calculs de rendement net et allocation recommandée.',
    category: 'fiscalite',
    targetKeyword: 'scpi tmi 11',
    relatedKeywords: ['fiscalité scpi faible', 'scpi européennes ps 0', 'optimisation fiscale'],
    readTime: '9 min'
  },

  // ARTICLE 9 - TMI 30%
  {
    id: 'article-009',
    slug: 'scpi-tmi-30-pourcent-arbitrage-av-direct',
    title: 'SCPI avec TMI 30% : faut-il privilégier l\'assurance-vie ou le direct ?',
    metaDescription: 'Analyse comparative SCPI en AV vs direct pour TMI 30% : rendements nets, prélèvements sociaux, stratégie d\'arbitrage optimale.',
    category: 'fiscalite',
    targetKeyword: 'scpi tmi 30',
    relatedKeywords: ['fiscalité scpi moyenne', 'arbitrage av direct', 'rendement net scpi'],
    readTime: '10 min'
  },

  // ARTICLE 10 - TMI 41%+
  {
    id: 'article-010',
    slug: 'forte-imposition-tmi-41-scpi-assurance-vie',
    title: 'TMI 41% et plus : pourquoi les SCPI en assurance-vie sont incontournables',
    metaDescription: 'Pour les hauts revenus (TMI 41-45%), l\'assurance-vie permet d\'optimiser la fiscalité des SCPI : calculs, stratégies et comparatifs chiffrés.',
    category: 'fiscalite',
    targetKeyword: 'scpi tmi 41',
    relatedKeywords: ['forte imposition scpi', 'optimisation fiscale hauts revenus', 'scpi assurance vie'],
    readTime: '11 min'
  },

  // ARTICLE 11 - SCPI Européennes
  {
    id: 'article-011',
    slug: 'scpi-europeennes-avantages-ps-0-rendement',
    title: 'SCPI européennes : l\'avantage fiscal des prélèvements sociaux à 0%',
    metaDescription: 'Les SCPI européennes bénéficient de PS à 0% grâce aux conventions fiscales. Analyse des rendements nets, pays cibles et meilleures SCPI 2025.',
    category: 'strategies',
    targetKeyword: 'scpi européennes',
    relatedKeywords: ['scpi allemagne', 'scpi espagne', 'ps 0 scpi'],
    readTime: '12 min'
  },

  // ARTICLE 12 - SCPI Fiscales
  {
    id: 'article-012',
    slug: 'scpi-fiscales-malraux-deficit-foncier-2025',
    title: 'SCPI fiscales 2025 : Malraux, déficit foncier, quel dispositif choisir ?',
    metaDescription: 'Guide complet des SCPI fiscales : Malraux, Pinel, déficit foncier. Comparatif, avantages fiscaux, calculs de réduction d\'impôt et profils adaptés.',
    category: 'fiscalite',
    targetKeyword: 'scpi fiscales',
    relatedKeywords: ['scpi malraux', 'déficit foncier scpi', 'réduction impôt scpi'],
    readTime: '13 min'
  },

  // ARTICLE 13 - SCPI Santé
  {
    id: 'article-013',
    slug: 'scpi-sante-seniors-ehpad-cliniques-investissement',
    title: 'SCPI santé et seniors : investir dans l\'immobilier médical et les EHPAD',
    metaDescription: 'Investissement en SCPI santé (cliniques, EHPAD, cabinets médicaux) : rendements, baux commerciaux, risques et opportunités du vieillissement démographique.',
    category: 'guides',
    targetKeyword: 'scpi santé',
    relatedKeywords: ['scpi ehpad', 'immobilier médical', 'scpi seniors'],
    readTime: '11 min'
  },

  // ARTICLE 14 - SCPI Bureaux
  {
    id: 'article-014',
    slug: 'scpi-bureaux-tertiaire-teletravail-2025',
    title: 'SCPI de bureaux en 2025 : quel impact du télétravail sur les rendements ?',
    metaDescription: 'Analyse des SCPI de bureaux face au télétravail : nouvelles demandes (flex office, Grade A), zones attractives, rendements et perspectives 2025.',
    category: 'analyses',
    targetKeyword: 'scpi bureaux',
    relatedKeywords: ['immobilier bureaux télétravail', 'scpi tertiaire', 'flex office'],
    readTime: '10 min'
  },

  // ARTICLE 15 - SCPI Commerces
  {
    id: 'article-015',
    slug: 'scpi-commerces-retail-e-commerce-opportunites',
    title: 'SCPI de commerces : comment le retail résiste au e-commerce',
    metaDescription: 'Investir en SCPI de commerces en 2025 : stratégies retail park, alimentaire, drive, emplacements premium face à la concurrence du e-commerce.',
    category: 'analyses',
    targetKeyword: 'scpi commerces',
    relatedKeywords: ['retail park', 'immobilier commercial', 'scpi alimentaire'],
    readTime: '11 min'
  },

  // ARTICLE 16 - SCPI Logistique
  {
    id: 'article-016',
    slug: 'scpi-logistique-entrepots-e-commerce-2025',
    title: 'SCPI logistique et entrepôts : l\'eldorado de l\'e-commerce',
    metaDescription: 'Boom des SCPI logistique grâce à l\'e-commerce : rendements élevés, baux longs, locataires solides. Analyse des opportunités et risques 2025.',
    category: 'guides',
    targetKeyword: 'scpi logistique',
    relatedKeywords: ['entrepôts e-commerce', 'immobilier logistique', 'scpi amazon'],
    readTime: '10 min'
  },

  // ARTICLE 17 - SCPI Résidentielles
  {
    id: 'article-017',
    slug: 'scpi-residentielles-logement-locatif-scpi-habitation',
    title: 'SCPI résidentielles : investir dans le logement locatif via les SCPI',
    metaDescription: 'Les SCPI résidentielles investissent dans l\'habitat locatif traditionnel : fonctionnement, fiscalité, avantages vs location directe et rendements.',
    category: 'guides',
    targetKeyword: 'scpi résidentielles',
    relatedKeywords: ['scpi logement', 'scpi habitation', 'location résidentielle'],
    readTime: '9 min'
  },

  // ARTICLE 18 - PER et SCPI
  {
    id: 'article-018',
    slug: 'per-scpi-retraite-deduction-fiscale',
    title: 'PER avec SCPI : préparer sa retraite et défiscaliser',
    metaDescription: 'Le PER permet d\'investir en SCPI avec déduction fiscale immédiate. Stratégies, calculs d\'économie d\'impôt, sortie en rente ou capital.',
    category: 'strategies',
    targetKeyword: 'per scpi',
    relatedKeywords: ['plan épargne retraite scpi', 'défiscalisation per', 'retraite scpi'],
    readTime: '12 min'
  },

  // ARTICLE 19 - SCI et SCPI
  {
    id: 'article-019',
    slug: 'sci-scpi-societe-civile-immobiliere-parts',
    title: 'Détenir des SCPI dans une SCI : avantages et stratégie patrimoniale',
    metaDescription: 'Investir en SCPI via une SCI permet d\'optimiser la transmission, l\'IFI et la gestion familiale. Montage, fiscalité et cas pratiques détaillés.',
    category: 'strategies',
    targetKeyword: 'sci scpi',
    relatedKeywords: ['scpi société civile', 'transmission scpi', 'optimisation patrimoine'],
    readTime: '13 min'
  },

  // ARTICLE 20 - IFI et SCPI
  {
    id: 'article-020',
    slug: 'ifi-scpi-impot-fortune-immobiliere-strategies',
    title: 'IFI et SCPI : comment réduire l\'Impôt sur la Fortune Immobilière',
    metaDescription: 'Les SCPI sont soumises à l\'IFI en pleine propriété. Stratégies d\'optimisation : démembrement, assurance-vie, SCI et calculs de décote.',
    category: 'fiscalite',
    targetKeyword: 'ifi scpi',
    relatedKeywords: ['impôt fortune immobilière scpi', 'optimisation ifi', 'démembrement ifi'],
    readTime: '11 min'
  },

  // ARTICLE 21 - Succession SCPI
  {
    id: 'article-021',
    slug: 'succession-scpi-transmission-droits-heritage',
    title: 'Succession de SCPI : transmettre son patrimoine immobilier',
    metaDescription: 'Transmettre des SCPI à ses héritiers : fiscalité successorale, démembrement anticipé, assurance-vie, donation et stratégies d\'optimisation.',
    category: 'fiscalite',
    targetKeyword: 'succession scpi',
    relatedKeywords: ['transmission scpi', 'héritage scpi', 'donation parts scpi'],
    readTime: '10 min'
  },

  // ARTICLE 22 - Diversification
  {
    id: 'article-022',
    slug: 'diversification-scpi-combien-nombre-parts',
    title: 'Diversification SCPI : combien de SCPI faut-il détenir dans son portefeuille ?',
    metaDescription: 'Stratégie de diversification SCPI optimale : nombre de SCPI recommandé, répartition sectorielle, géographique et par société de gestion.',
    category: 'strategies',
    targetKeyword: 'diversification scpi',
    relatedKeywords: ['nombre scpi portefeuille', 'répartition scpi', 'allocation immobilière'],
    readTime: '9 min'
  },

  // ARTICLE 23 - Rendement SCPI
  {
    id: 'article-023',
    slug: 'rendement-scpi-2025-tdvm-taux-distribution',
    title: 'Rendement SCPI 2025 : comprendre le TDVM et le taux de distribution',
    metaDescription: 'Analyse du rendement des SCPI en 2025 : définition TDVM, calcul, moyenne du marché, SCPI les plus performantes et évolution des distributions.',
    category: 'analyses',
    targetKeyword: 'rendement scpi 2025',
    relatedKeywords: ['tdvm scpi', 'taux distribution scpi', 'performance scpi'],
    readTime: '10 min'
  },

  // ARTICLE 24 - Risques SCPI
  {
    id: 'article-024',
    slug: 'risques-scpi-vacance-locative-liquidite',
    title: 'Quels sont les risques des SCPI ? Analyse complète et transparente',
    metaDescription: 'Les vrais risques des SCPI : vacance locative, délais de revente, baisse de valeur, cycle immobilier. Comment les identifier et les limiter.',
    category: 'guides',
    targetKeyword: 'risques scpi',
    relatedKeywords: ['vacance scpi', 'liquidité scpi', 'perte capital scpi'],
    readTime: '12 min'
  },

  // ARTICLE 25 - Frais SCPI
  {
    id: 'article-025',
    slug: 'frais-scpi-souscription-gestion-performance',
    title: 'Frais SCPI : comprendre et optimiser les coûts d\'investissement',
    metaDescription: 'Détail des frais SCPI : souscription (8-12%), gestion (8-10%), sur travaux. Impact sur la rentabilité et stratégies d\'optimisation.',
    category: 'guides',
    targetKeyword: 'frais scpi',
    relatedKeywords: ['frais souscription scpi', 'frais gestion scpi', 'coût scpi'],
    readTime: '8 min'
  },

  // ARTICLE 26 - Revente SCPI
  {
    id: 'article-026',
    slug: 'revendre-parts-scpi-delais-marche-secondaire',
    title: 'Revendre ses parts de SCPI : délais, procédure et marché secondaire',
    metaDescription: 'Guide pratique pour revendre des SCPI : fonctionnement du marché secondaire, délais selon les SCPI, file d\'attente et optimisation de la sortie.',
    category: 'guides',
    targetKeyword: 'revente scpi',
    relatedKeywords: ['marché secondaire scpi', 'liquidité scpi', 'délai revente parts'],
    readTime: '9 min'
  },

  // ARTICLE 27 - SCPI vs ETF
  {
    id: 'article-027',
    slug: 'scpi-ou-etf-immobilier-reit-comparatif',
    title: 'SCPI ou ETF immobilier (REIT) : quel placement choisir ?',
    metaDescription: 'Comparatif SCPI vs ETF immobilier (REIT) : liquidité, fiscalité, rendement, volatilité. Avantages et inconvénients pour votre allocation.',
    category: 'comparatifs',
    targetKeyword: 'scpi ou etf immobilier',
    relatedKeywords: ['reit vs scpi', 'etf immobilier', 'placement immobilier'],
    readTime: '11 min'
  },

  // ARTICLE 28 - SCPI vs OPCI
  {
    id: 'article-028',
    slug: 'scpi-ou-opci-differences-avantages',
    title: 'SCPI ou OPCI : quelle différence et quel placement privilégier ?',
    metaDescription: 'Comparaison SCPI vs OPCI : composition, liquidité, fiscalité, rendement. Quel véhicule immobilier choisir selon votre profil ?',
    category: 'comparatifs',
    targetKeyword: 'scpi ou opci',
    relatedKeywords: ['différence scpi opci', 'opci immobilier', 'placement pierre papier'],
    readTime: '10 min'
  },

  // ARTICLE 29 - Premier investissement
  {
    id: 'article-029',
    slug: 'premier-investissement-scpi-debutant-guide',
    title: 'Premier investissement en SCPI : guide complet pour débutants',
    metaDescription: 'Guide pas à pas pour votre 1er investissement SCPI : montant minimal, choix de la SCPI, mode d\'achat, fiscalité et erreurs à éviter.',
    category: 'guides',
    targetKeyword: 'premier investissement scpi',
    relatedKeywords: ['débuter scpi', 'investir scpi débutant', 'première scpi'],
    readTime: '12 min'
  },

  // ARTICLE 30 - Jeune actif
  {
    id: 'article-030',
    slug: 'investir-scpi-jeune-actif-25-35-ans',
    title: 'Investir en SCPI quand on est jeune actif (25-35 ans) : stratégie long terme',
    metaDescription: 'Stratégie d\'investissement SCPI pour jeunes actifs : montants progressifs, horizon 20-30 ans, effet boule de neige, erreurs à éviter.',
    category: 'strategies',
    targetKeyword: 'scpi jeune actif',
    relatedKeywords: ['investir jeune scpi', 'scpi 30 ans', 'débuter patrimoine'],
    readTime: '11 min'
  }
];

console.log(`✅ ${articles30Templates.length} articles définis`);
console.log('Thématiques couvertes :');
console.log('- Comparatifs : 5 articles');
console.log('- Stratégies : 7 articles');
console.log('- Fiscalité : 7 articles');
console.log('- Guides : 8 articles');
console.log('- Analyses : 3 articles');
