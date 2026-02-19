import { generateFAQSchema, generateBreadcrumbSchema, generateSoftwareApplicationSchema } from '../utils/seoOptimizer';

const SITE = 'https://maximusscpi.com';

export const simulatorSeoConfig = {
  'simulateur-revenus-nets': {
    title: 'Simulateur Revenus Nets SCPI 2026 Gratuit | MaximusSCPI',
    description: 'Calculez vos revenus nets après impôts et prélèvements sociaux. Simulateur SCPI gratuit par conseiller ORIAS.',
    canonical: `${SITE}/simulateur-revenus-nets-scpi/`,
    app: { name: 'Simulateur Revenus Nets SCPI', description: 'Calculez les revenus nets de votre investissement SCPI après fiscalité (IR + PS)', url: `${SITE}/simulateur-revenus-nets-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Revenus nets'],
    faq: [
      { question: 'Comment sont imposés les revenus de SCPI ?', answer: 'Les revenus SCPI sont soumis à l\'impôt sur le revenu (barème progressif) et aux prélèvements sociaux (17,2%). En assurance-vie, ils peuvent être fiscalement avantageux après 8 ans.' },
      { question: 'Quel simulateur SCPI choisir ?', answer: 'MaximusSCPI propose 9 simulateurs gratuits : revenus nets, crédit, démembrement, enveloppes fiscales, profil investisseur, impact fiscal et comparateur démembrement.' },
    ],
  },
  'simulateur-credit': {
    title: 'Simulateur Crédit SCPI 2026 | Effet de Levier | MaximusSCPI',
    description: 'Simulez votre investissement SCPI à crédit. Calcul mensualité, cash-flow, effet de levier. Outil gratuit conseiller ORIAS.',
    canonical: `${SITE}/simulateur-credit-scpi/`,
    app: { name: 'Simulateur Crédit SCPI', description: 'Simulez l\'achat de SCPI à crédit avec calcul de l\'effet de levier et déductibilité des intérêts', url: `${SITE}/simulateur-credit-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Crédit SCPI'],
    faq: [
      { question: 'Peut-on acheter des SCPI à crédit ?', answer: 'Oui. Les banques proposent des prêts affectés à l\'achat de parts SCPI. Les intérêts sont déductibles des revenus fonciers.' },
      { question: 'Quel apport pour acheter des SCPI à crédit ?', answer: 'Les banques exigent généralement 20 à 30% d\'apport. Un simulateur vous aide à dimensionner votre projet.' },
    ],
  },
  'simulateur-demembrement': {
    title: 'Simulateur Démembrement SCPI 2026 | Nue Propriété | MaximusSCPI',
    description: 'Calculez le rendement net de votre SCPI en démembrement. Simulateur nue-propriété/usufruit gratuit.',
    canonical: `${SITE}/simulateur-demembrement-scpi/`,
    app: { name: 'Simulateur Démembrement SCPI', description: 'Calculez le rendement de votre investissement en nue-propriété de SCPI selon la durée choisie', url: `${SITE}/simulateur-demembrement-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Démembrement'],
    faq: [
      { question: 'Qu\'est-ce que le démembrement de SCPI ?', answer: 'Le démembrement sépare la nue-propriété (capital) et l\'usufruit (revenus). L\'investisseur en nue-propriété acquiert moins cher et récupère la pleine propriété à l\'échéance.' },
      { question: 'Quelle durée de démembrement choisir ?', answer: 'Les durées courantes sont 10, 15 ou 20 ans. Plus la durée est courte, plus la décote (et donc le rendement annuel) est élevée.' },
    ],
  },
  'simulateur-enveloppes': {
    title: 'Simulateur Enveloppes SCPI 2026 | AV vs Direct | MaximusSCPI',
    description: 'Comparez SCPI en direct vs assurance-vie. Rendement net, fiscalité, horizon 8-15 ans. Simulateur gratuit.',
    canonical: `${SITE}/simulateur-enveloppes-scpi/`,
    app: { name: 'Simulateur Enveloppes SCPI', description: 'Comparez la rentabilité des SCPI en direct et en assurance-vie selon votre TMI et horizon', url: `${SITE}/simulateur-enveloppes-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Enveloppes'],
    faq: [
      { question: 'SCPI en direct ou en assurance-vie ?', answer: 'En direct : fiscalité immédiate (IR + PS) mais capital disponible. En assurance-vie : report d\'impôt, abattement après 8 ans, mais frais de contrat.' },
      { question: 'Quand l\'assurance-vie SCPI devient avantageuse ?', answer: 'Souvent à partir de 8 ans de détention et pour les TMI 30% et plus, grâce à l\'abattement et au report d\'imposition.' },
    ],
  },
  'simulateur-tresorerie-is': {
    title: 'Simulateur Trésorerie IS 2026 | SCPI & Impôt sur Sociétés',
    canonical: `${SITE}/simulateur-tresorerie-is/`,
    app: { name: 'Simulateur Trésorerie IS SCPI', description: 'Simulez la trésorerie d\'une SCPI détenue via une société à l\'IS', url: `${SITE}/simulateur-tresorerie-is/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Trésorerie IS'],
    description: 'Simulez la trésorerie de vos SCPI détenues en société à l\'IS. Cash-flow, impôt, optimisation.',
    faq: [
      { question: 'Pourquoi détenir des SCPI en société à l\'IS ?', answer: 'L\'IS (25%) peut être plus favorable que l\'IR pour les forts patrimoines. Le simulateur aide à projeter la trésorerie.' },
    ],
  },
  'simulateur-impact-fiscal': {
    title: 'Simulateur Impact Fiscal SCPI 2026 | MaximusSCPI',
    description: 'Estimez l\'impact fiscal de votre investissement SCPI. IR, PS, abattements. Simulateur gratuit conseiller ORIAS.',
    canonical: `${SITE}/simulateur-impact-fiscal-scpi/`,
    app: { name: 'Simulateur Impact Fiscal SCPI', description: 'Calculez l\'impact de vos revenus SCPI sur votre impôt sur le revenu et prélèvements sociaux', url: `${SITE}/simulateur-impact-fiscal-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Impact fiscal'],
    faq: [
      { question: 'Quel impact fiscal pour les revenus SCPI ?', answer: 'Les revenus SCPI sont imposables à l\'IR (barème) et aux prélèvements sociaux (17,2%). En assurance-vie, abattement après 8 ans.' },
    ],
  },
  'simulateur-profil-investisseur': {
    title: 'Simulateur Profil Investisseur SCPI 2026 | MaximusSCPI',
    description: 'Déterminez votre profil investisseur pour les SCPI. Questionnaire gratuit, recommandations personnalisées.',
    canonical: `${SITE}/simulateur-profil-investisseur/`,
    app: { name: 'Simulateur Profil Investisseur SCPI', description: 'Questionnaire pour évaluer votre profil et vos objectifs d\'investissement en SCPI', url: `${SITE}/simulateur-profil-investisseur/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Profil investisseur'],
    faq: [
      { question: 'Quel profil investisseur pour les SCPI ?', answer: 'Les SCPI conviennent aux profils équilibrés ou dynamiques, avec un horizon 8-10 ans minimum.' },
    ],
  },
  'comparateur-demembrement': {
    title: 'Comparateur Démembrement SCPI 2026 | Nue Propriété | MaximusSCPI',
    description: 'Comparez les rendements des SCPI en démembrement par durée. Outil gratuit comparateur nue-propriété.',
    canonical: `${SITE}/comparateur-demembrement-scpi/`,
    app: { name: 'Comparateur Démembrement SCPI', description: 'Comparez les rendements annuels des SCPI en démembrement selon la durée (10, 15, 20 ans)', url: `${SITE}/comparateur-demembrement-scpi/` },
    breadcrumb: ['Accueil', 'Simulateurs', 'Comparateur démembrement'],
    faq: [
      { question: 'Comment comparer les SCPI en démembrement ?', answer: 'Le comparateur MaximusSCPI calcule le rendement annualisé pour chaque SCPI selon la durée de démembrement (décote appliquée).' },
      { question: 'Quelle SCPI en nue-propriété ?', answer: 'Les SCPI européennes à fort rendement offrent souvent les meilleurs rendements en démembrement.' },
    ],
  },
  'simulateurs': {
    title: 'Simulateurs SCPI 2026 : Revenus, Crédit, Démembrement | MaximusSCPI',
    description: '9 simulateurs SCPI gratuits : revenus nets, crédit, démembrement, enveloppes, impact fiscal, profil investisseur.',
    canonical: `${SITE}/simulateurs/`,
    breadcrumb: ['Accueil', 'Simulateurs'],
    faq: [
      { question: 'Quels simulateurs SCPI proposer ?', answer: 'MaximusSCPI propose 9 outils : simulateur revenus nets, crédit, démembrement, enveloppes fiscales, trésorerie IS, impact fiscal, profil investisseur, comparateur démembrement.' },
      { question: 'Les simulateurs SCPI sont-ils gratuits ?', answer: 'Oui, tous les simulateurs MaximusSCPI sont gratuits et sans inscription. Conçus par un conseiller certifié ORIAS.' },
    ],
  },
} as const;

export function getSimulatorSchemaData(view: keyof typeof simulatorSeoConfig) {
  const c = simulatorSeoConfig[view];
  if (!c) return undefined;
  const parts: object[] = [];
  const bcUrls = c.breadcrumb.map((_, i) =>
    i === 0 ? `${SITE}/` : i === 1 ? `${SITE}/simulateurs/` : c.canonical
  );
  parts.push(generateBreadcrumbSchema(c.breadcrumb.map((name, i) => ({ name, url: bcUrls[i] || SITE }))));
  if (c.faq?.length) parts.push(generateFAQSchema(c.faq));
  if ('app' in c && c.app) {
    parts.push(generateSoftwareApplicationSchema(c.app));
  }
  return { '@graph': parts };
}
