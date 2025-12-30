export interface LandingPageContent {
  slug: string;
  type: 'sector' | 'geography' | 'scpi';
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  introduction: string;
  advantages: string[];
  targetProfile: string;
  statistics?: {
    label: string;
    value: string;
  }[];
  urlFilter: {
    sector?: string;
    geo?: string;
    scpi?: string;
  };
  scpiName?: string;
  rating?: number;
  isRecommended?: boolean;
}

export const sectorPages: LandingPageContent[] = [
  {
    slug: 'scpi-bureaux',
    type: 'sector',
    title: 'SCPI Bureaux 2025 : Investissement Immobilier Tertiaire | MaximusSCPI',
    metaDescription: 'Investissez dans les SCPI bureaux avec MaximusSCPI. Rendements stables de 4-6%, diversification géographique optimale. Analyse complète et conseil expert gratuit.',
    h1: 'SCPI Bureaux : Investir dans l\'Immobilier Tertiaire',
    subtitle: 'Des rendements stables grâce aux baux commerciaux longs',
    introduction: 'Les SCPI spécialisées dans les bureaux investissent dans des immeubles de bureaux situés principalement dans les grandes métropoles européennes. Ce secteur offre une stabilité des revenus grâce à des baux de longue durée (souvent 3-6-9 ans) et des locataires professionnels de qualité.',
    advantages: [
      'Baux commerciaux de longue durée (3-6-9 ans)',
      'Locataires professionnels solvables (grandes entreprises)',
      'Emplacements premium dans les centres d\'affaires',
      'Indexation des loyers sur l\'inflation',
      'Diversification entre plusieurs villes et pays',
      'Adaptation aux nouveaux modes de travail (flex office, coworking)'
    ],
    targetProfile: 'Investisseurs recherchant des revenus réguliers et une exposition aux grandes métropoles européennes, avec un horizon de placement moyen à long terme.',
    statistics: [
      { label: 'Rendement moyen', value: '4-5%' },
      { label: 'Taux d\'occupation', value: '92-96%' },
      { label: 'Durée moyenne des baux', value: '6 ans' }
    ],
    urlFilter: { sector: 'bureaux' }
  },
  {
    slug: 'scpi-commerces',
    type: 'sector',
    title: 'SCPI Commerces 2025 : Murs de Magasins & Centres Commerciaux | MaximusSCPI',
    metaDescription: 'SCPI commerces : investissez dans les murs de magasins, centres commerciaux et retail parks. Rendements attractifs de 5-7%. Diversification enseigne et géographie.',
    h1: 'SCPI Commerces : Investir dans les Murs de Magasins',
    subtitle: 'Des rendements attractifs portés par le commerce de proximité',
    introduction: 'Les SCPI commerces investissent dans les murs de magasins (alimentaire, équipement de la personne, services), les centres commerciaux et les retail parks. Ce secteur bénéficie de la résilience du commerce de proximité et de l\'évolution vers un modèle omnicanal.',
    advantages: [
      'Rendements historiquement élevés (5-7%)',
      'Baux commerciaux avec clauses d\'indexation',
      'Diversification entre commerce alimentaire et non-alimentaire',
      'Résistance du commerce de proximité',
      'Opportunités dans les retail parks en périphérie',
      'Adaptation au modèle omnicanal (click & collect)'
    ],
    targetProfile: 'Investisseurs recherchant des rendements plus élevés et acceptant une exposition au secteur commercial en transformation, avec une préférence pour le commerce de proximité.',
    statistics: [
      { label: 'Rendement moyen', value: '5-7%' },
      { label: 'Part commerce alimentaire', value: '40-60%' },
      { label: 'Durée moyenne des baux', value: '9 ans' }
    ],
    urlFilter: { sector: 'commerces' }
  },
  {
    slug: 'scpi-sante',
    type: 'sector',
    title: 'SCPI Santé 2025 : EHPAD, Cliniques & Résidences Médicalisées | MaximusSCPI',
    metaDescription: 'Investissez dans les SCPI santé : EHPAD, cliniques, résidences médicalisées. Secteur défensif et résilient. Rendements stables 4-5%. Demande structurelle forte.',
    h1: 'SCPI Santé : Investir dans l\'Immobilier Médical',
    subtitle: 'Un secteur défensif porté par le vieillissement de la population',
    introduction: 'Les SCPI santé se concentrent sur les établissements de santé (EHPAD, cliniques, centres médicaux, résidences pour seniors). Ce secteur bénéficie d\'une demande structurelle croissante liée au vieillissement de la population et offre une grande stabilité.',
    advantages: [
      'Secteur résilient et défensif (indépendant des cycles économiques)',
      'Demande structurelle forte (vieillissement démographique)',
      'Baux très longs (12-15 ans en moyenne)',
      'Locataires institutionnels solides (groupes de santé)',
      'Revenus sécurisés et prévisibles',
      'Faible vacance locative (besoin constant)'
    ],
    targetProfile: 'Investisseurs prudents recherchant la stabilité et la sécurité, avec un horizon de placement long terme et une sensibilité aux enjeux sociétaux.',
    statistics: [
      { label: 'Rendement moyen', value: '4-5%' },
      { label: 'Durée moyenne des baux', value: '12-15 ans' },
      { label: 'Taux d\'occupation', value: '97-99%' }
    ],
    urlFilter: { sector: 'sante' }
  },
  {
    slug: 'scpi-logistique',
    type: 'sector',
    title: 'SCPI Logistique 2025 : Entrepôts & Plateformes E-commerce | MaximusSCPI',
    metaDescription: 'SCPI logistique : investissez dans les entrepôts et plateformes e-commerce. Secteur en forte croissance. Rendements 4-6%. Bénéficiez du boom du e-commerce.',
    h1: 'SCPI Logistique : L\'Avenir du E-commerce',
    subtitle: 'Profitez de la croissance explosive du commerce en ligne',
    introduction: 'Les SCPI logistique investissent dans les entrepôts modernes, plateformes de distribution et centres de tri. Ce secteur connaît une croissance exceptionnelle portée par l\'essor du e-commerce et la nécessité de livraisons rapides.',
    advantages: [
      'Croissance structurelle du e-commerce (+15% par an)',
      'Demande forte pour les entrepôts dernière génération',
      'Locataires de qualité (Amazon, DHL, Geodis, Carrefour)',
      'Baux longs avec indexation attractive',
      'Emplacements stratégiques (axes autoroutiers, proximité urbaine)',
      'Faible obsolescence pour les actifs modernes'
    ],
    targetProfile: 'Investisseurs dynamiques souhaitant profiter de la croissance du e-commerce, avec une appétence pour les secteurs en transformation et un horizon moyen terme.',
    statistics: [
      { label: 'Rendement moyen', value: '4-6%' },
      { label: 'Croissance e-commerce', value: '+15%/an' },
      { label: 'Durée moyenne des baux', value: '6-9 ans' }
    ],
    urlFilter: { sector: 'logistique' }
  },
  {
    slug: 'scpi-residentiel',
    type: 'sector',
    title: 'SCPI Résidentiel 2025 : Investissement Locatif Immobilier | MaximusSCPI',
    metaDescription: 'SCPI résidentiel : investissez dans l\'immobilier d\'habitation. Marché stable, demande locative constante. Rendements 3-4%. Diversification patrimoniale.',
    h1: 'SCPI Résidentiel : Investir dans l\'Immobilier d\'Habitation',
    subtitle: 'La stabilité du marché locatif résidentiel',
    introduction: 'Les SCPI résidentielles investissent dans des logements destinés à la location (appartements, maisons). Ce secteur offre une forte stabilité grâce à une demande locative constante et structurelle, particulièrement dans les zones tendues.',
    advantages: [
      'Demande locative stable et prévisible',
      'Marché liquide et profond',
      'Besoin fondamental (se loger)',
      'Fiscalité avantageuse (déductions possibles)',
      'Rotation locative plus fréquente = adaptation aux loyers de marché',
      'Diversification géographique entre plusieurs villes'
    ],
    targetProfile: 'Investisseurs recherchant la sécurité et la stabilité, souhaitant se diversifier sur le marché résidentiel sans les contraintes de la gestion locative directe.',
    statistics: [
      { label: 'Rendement moyen', value: '3-4%' },
      { label: 'Taux d\'occupation', value: '95-98%' },
      { label: 'Durée moyenne des baux', value: '3 ans' }
    ],
    urlFilter: { sector: 'residentiel' }
  },
  {
    slug: 'scpi-hotellerie',
    type: 'sector',
    title: 'SCPI Hôtellerie 2025 : Investissement Hôtelier & Tourisme | MaximusSCPI',
    metaDescription: 'SCPI hôtellerie : investissez dans les murs d\'hôtels et résidences de tourisme. Rendements attractifs 4-6%. Exposition au secteur touristique en croissance.',
    h1: 'SCPI Hôtellerie : Investir dans le Secteur Touristique',
    subtitle: 'Des opportunités dans l\'hôtellerie et le tourisme d\'affaires',
    introduction: 'Les SCPI hôtelières investissent dans les murs d\'hôtels (chaînes, boutique-hôtels) et résidences de tourisme. Ce secteur bénéficie de la reprise du tourisme et de la demande en hébergement professionnel.',
    advantages: [
      'Reprise forte du tourisme post-Covid',
      'Baux longs avec loyers indexés',
      'Diversification entre tourisme loisir et affaires',
      'Locataires professionnels (chaînes hôtelières)',
      'Emplacements stratégiques (centres-villes, aéroports)',
      'Potentiel de revalorisation des actifs'
    ],
    targetProfile: 'Investisseurs acceptant un profil de risque modéré et souhaitant s\'exposer au secteur touristique en reprise, avec un horizon moyen à long terme.',
    statistics: [
      { label: 'Rendement moyen', value: '4-6%' },
      { label: 'Durée moyenne des baux', value: '12 ans' },
      { label: 'Croissance tourisme', value: '+8%/an' }
    ],
    urlFilter: { sector: 'hotellerie' }
  },
  {
    slug: 'scpi-mixte',
    type: 'sector',
    title: 'SCPI Diversifiées 2025 : Multi-Secteurs & Multi-Géographie | MaximusSCPI',
    metaDescription: 'SCPI diversifiées tous secteurs : bureaux, commerces, santé, logistique, hôtellerie. Optimisez le couple rendement/risque. Diversification maximale.',
    h1: 'SCPI Diversifiées : La Diversification Maximale',
    subtitle: 'Réduisez les risques avec une allocation multi-sectorielle',
    introduction: 'Les SCPI diversifiées investissent dans plusieurs secteurs immobiliers simultanément (bureaux, commerces, santé, logistique, hôtellerie). Cette approche permet d\'optimiser le couple rendement/risque en mutualisant les performances sectorielles.',
    advantages: [
      'Diversification sectorielle optimale',
      'Réduction du risque de concentration',
      'Adaptation dynamique aux cycles de marché',
      'Équilibre entre stabilité et performance',
      'Opportunisme selon les secteurs porteurs',
      'Gestion professionnelle et active'
    ],
    targetProfile: 'Investisseurs recherchant une exposition équilibrée à l\'immobilier d\'entreprise, avec une gestion du risque par la diversification et un horizon moyen à long terme.',
    statistics: [
      { label: 'Rendement moyen', value: '4-5%' },
      { label: 'Nombre de secteurs', value: '4-6' },
      { label: 'Taux d\'occupation moyen', value: '94-96%' }
    ],
    urlFilter: { sector: 'diversifie' }
  }
];

export const geographyPages: LandingPageContent[] = [
  {
    slug: 'scpi-france',
    type: 'geography',
    title: 'SCPI France 2025 : Investissement Immobilier Français | MaximusSCPI',
    metaDescription: 'SCPI investies en France : marché domestique maîtrisé, fiscalité française, proximité. Rendements 4-6%. Paris, Lyon, Marseille, Bordeaux, Toulouse.',
    h1: 'SCPI France : Investir sur le Marché Français',
    subtitle: 'La sécurité et la proximité du marché domestique',
    introduction: 'Les SCPI françaises investissent exclusivement ou majoritairement en France, dans les grandes métropoles (Paris, Lyon, Marseille, Bordeaux, Toulouse, Nantes, Lille) et villes moyennes dynamiques. Ce positionnement offre une parfaite connaissance du marché et une fiscalité simplifiée.',
    advantages: [
      'Connaissance approfondie du marché français',
      'Fiscalité simplifiée (pas de retenue à la source)',
      'Proximité géographique et culturelle',
      'Stabilité juridique et réglementaire',
      'Dynamisme des métropoles régionales',
      'Accessibilité et transparence des investissements'
    ],
    targetProfile: 'Investisseurs préférant rester sur le marché domestique français, recherchant la simplicité fiscale et la proximité, avec une bonne compréhension du marché local.',
    statistics: [
      { label: 'Rendement moyen', value: '4-6%' },
      { label: 'Part Paris/IDF', value: '40-60%' },
      { label: 'Métropoles régionales', value: '30-40%' }
    ],
    urlFilter: { geo: 'france' }
  },
  {
    slug: 'scpi-europe',
    type: 'geography',
    title: 'SCPI Européennes 2025 : Investissement International | MaximusSCPI',
    metaDescription: 'SCPI européennes : diversification internationale en Allemagne, Espagne, Pays-Bas, Italie, Belgique. Rendements 4-6%. Accès aux marchés immobiliers européens.',
    h1: 'SCPI Européennes : Diversifier à l\'International',
    subtitle: 'Profitez des opportunités des marchés européens',
    introduction: 'Les SCPI européennes investissent dans plusieurs pays d\'Europe : Allemagne, Espagne, Pays-Bas, Italie, Belgique, Portugal. Cette diversification géographique permet de capter les opportunités spécifiques de chaque marché tout en mutualisant les risques.',
    advantages: [
      'Diversification géographique entre 5-10 pays',
      'Accès aux marchés dynamiques (Allemagne, Espagne)',
      'Réduction du risque pays',
      'Opportunités de valorisation différenciées',
      'Exposition aux grandes capitales européennes',
      'Bénéfice des cycles économiques décalés'
    ],
    targetProfile: 'Investisseurs internationaux recherchant une diversification géographique optimale, acceptant une exposition aux devises européennes et souhaitant capter les opportunités paneuropéennes.',
    statistics: [
      { label: 'Rendement moyen', value: '4-6%' },
      { label: 'Nombre de pays', value: '5-10' },
      { label: 'Part zone euro', value: '85-95%' }
    ],
    urlFilter: { geo: 'europe' }
  },
  {
    slug: 'scpi-international',
    type: 'geography',
    title: 'SCPI Internationales 2025 : Diversification Mondiale | MaximusSCPI',
    metaDescription: 'SCPI internationales : investissement mondial hors Europe. USA, Asie, Amérique du Sud. Diversification maximale. Rendements 4-7%. Exposition aux marchés émergents.',
    h1: 'SCPI Internationales : Investir dans le Monde Entier',
    subtitle: 'Une diversification géographique maximale',
    introduction: 'Les SCPI internationales investissent au-delà de l\'Europe, incluant les États-Unis, l\'Asie (Singapour, Japon), et parfois l\'Amérique du Sud. Cette stratégie mondiale permet une diversification maximale et l\'accès aux marchés les plus dynamiques de la planète.',
    advantages: [
      'Diversification géographique mondiale',
      'Accès aux marchés porteurs (USA, Asie)',
      'Réduction maximale du risque géographique',
      'Exposition aux devises fortes (dollar, franc suisse)',
      'Opportunités dans les économies émergentes',
      'Potentiel de plus-values élevé'
    ],
    targetProfile: 'Investisseurs avertis recherchant une diversification internationale maximale, acceptant une exposition aux devises étrangères et au risque géopolitique, avec un horizon long terme.',
    statistics: [
      { label: 'Rendement moyen', value: '4-7%' },
      { label: 'Nombre de zones', value: '3-5' },
      { label: 'Part hors Europe', value: '30-60%' }
    ],
    urlFilter: { geo: 'international' }
  }
];

import { scpiLandingPages } from '../data/landingPagesData';

const generateScpiPagesFromLandingData = (): LandingPageContent[] => {
  return Object.values(scpiLandingPages).map((scpi) => ({
    slug: scpi.slug,
    type: 'scpi' as const,
    scpiName: scpi.nom,
    title: `SCPI ${scpi.nom} : ${scpi.rendement} Rendement 2025 ✓ ${scpi.societe_gestion} | Analyse & Avis`,
    metaDescription: `✓ SCPI ${scpi.nom} (${scpi.societe_gestion}) : Rendement ${scpi.rendement} ✓ TOF ${scpi.tof} ✓ Capitalisation ${scpi.capitalisation} ✓ Prix ${scpi.prix_souscription} ✓ Analyse complète & conseils expert gratuits`,
    h1: scpi.h1_question || `SCPI ${scpi.nom} : Analyse & Avis 2025`,
    subtitle: `Rendement ${scpi.rendement} avec ${scpi.societe_gestion}`,
    introduction: scpi.description_longue,
    advantages: scpi.avantages,
    targetProfile: scpi.profil_investisseur,
    statistics: [
      { label: 'Rendement 2024', value: scpi.rendement },
      { label: 'Capitalisation', value: scpi.capitalisation },
      { label: 'TOF', value: scpi.tof },
      { label: 'Prix', value: scpi.prix_souscription },
      { label: 'Décote/Surcote', value: scpi.decote },
      { label: 'Endettement', value: scpi.endettement },
      { label: 'Année création', value: scpi.annee_creation.toString() },
      { label: 'Label ISR', value: scpi.label_isr ? 'Oui' : 'Non' }
    ],
    urlFilter: {
      scpi: scpi.nom
    },
    isRecommended: false
  }));
};

export const scpiPages: LandingPageContent[] = generateScpiPagesFromLandingData();

export const allLandingPages = [...sectorPages, ...geographyPages, ...scpiPages];

export const getLandingPageBySlug = (slug: string): LandingPageContent | undefined => {
  return allLandingPages.find(page => page.slug === slug);
};
