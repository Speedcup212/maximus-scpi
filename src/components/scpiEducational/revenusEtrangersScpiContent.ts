import type { ScpiEducationalPageConfig } from './shared'

export const revenusEtrangersScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-etrangers/',
  badge: 'Fiscalité SCPI',
  h1: 'Revenus étrangers de SCPI : comprendre la fiscalité européenne',
  heroSubtitle:
    'Les SCPI investies en Europe génèrent des revenus immobiliers de source étrangère. Leur traitement fiscal dépend du pays d\'origine et des conventions fiscales. Cette page explique les grandes logiques sans donner de mode d\'emploi déclaratif individualisé.',
  seoTitle: 'Revenus étrangers SCPI : fiscalité, crédit d\'impôt et taux effectif',
  seoDescription:
    'Comprenez la fiscalité des revenus étrangers de SCPI : pays d\'investissement, conventions fiscales, crédit d\'impôt, taux effectif, rendement net et déclaration.',
  shortAnswerTitle: 'Pourquoi les revenus étrangers changent-ils l\'analyse fiscale ?',
  shortAnswer:
    'Les SCPI investies dans des pays européens (Allemagne, Pays-Bas, Espagne, Italie, etc.) perçoivent des loyers de source étrangère. Selon les conventions fiscales en vigueur, ces revenus peuvent bénéficier d\'un crédit d\'impôt ou d\'un taux effectif, ce qui peut améliorer le rendement net fiscal par rapport à une SCPI française. L\'analyse doit tenir compte de chaque pays et de sa convention.',
  keyMessage:
    'Les revenus étrangers de SCPI peuvent améliorer la lecture fiscale, mais leur traitement dépend du pays, de la convention fiscale et de la situation de l\'investisseur.',
  definitionParagraphs: [
    'Un revenu immobilier de source étrangère est un revenu provenant d\'un bien situé hors de France. Les SCPI européennes génèrent ce type de revenus lorsqu\'elles investissent dans des actifs immobiliers situés dans d\'autres pays de l\'Union européenne.',
    'Pour éviter la double imposition, la France a signé des conventions fiscales avec la plupart des pays européens. Ces conventions prévoient généralement que les revenus immobiliers étrangers sont imposables dans le pays d\'origine ET en France, avec un crédit d\'impôt égal à l\'impôt payé à l\'étranger.',
    'Le crédit d\'impôt vient s\'imputer sur l\'impôt français dû au titre des mêmes revenus. Il ne peut pas excéder l\'impôt français correspondant. Si le crédit d\'impôt est supérieur à l\'impôt dû, l\'excédent n\'est généralement pas remboursé.',
    'Le taux effectif est un mécanisme différent : certains revenus étrangers sont pris en compte pour déterminer le taux d\'imposition global du foyer, sans être eux-mêmes imposés en France. Cela peut augmenter le taux applicable aux autres revenus.',
    'Dans certains cas, les revenus étrangers de SCPI peuvent échapper partiellement ou totalement aux prélèvements sociaux français, selon la convention fiscale applicable et le pays d\'origine.',
    'La société de gestion transmet généralement une fiche fiscale annuelle indiquant la répartition par pays des revenus et les montants de crédit d\'impôt ou de taux effectif applicables.',
  ],
  tableTitle: 'Mécanismes fiscaux des revenus étrangers',
  tableRows: [
    {
      level: 'Crédit d\'impôt',
      advantage: 'Évite la double imposition. S\'impute sur l\'IR français. Montant basé sur l\'impôt payé à l\'étranger.',
      vigilance: 'Ne rembourse pas l\'excédent. Déclaration spécifique nécessaire. Plafonné à l\'impôt français correspondant.',
    },
    {
      level: 'Taux effectif',
      advantage: 'Le revenu étranger n\'est pas imposé en France mais augmente le taux applicable aux autres revenus. Mécanisme favorable selon les cas.',
      vigilance: 'Peut augmenter l\'impôt sur les autres revenus. À calculer selon la situation. Ne s\'applique pas à tous les pays.',
    },
    {
      level: 'Prélèvements sociaux',
      advantage: 'Dans certains cas, les revenus étrangers peuvent être exonérés de PS ou soumis à un taux réduit.',
      vigilance: 'Selon la convention fiscale et le pays. À vérifier au cas par cas.',
    },
    {
      level: 'Déclaration',
      advantage: 'La société de gestion fournit une fiche fiscale. Déclaration intégrée à la déclaration de revenus.',
      vigilance: 'À vérifier selon les formulaires en vigueur. Une erreur de case peut avoir des conséquences.',
    },
    {
      level: 'Rendement net',
      advantage: 'Le crédit d\'impôt peut améliorer le rendement net fiscal par rapport à une SCPI française.',
      vigilance: 'L\'écart dépend de la convention, du pays et de la TMI. À analyser au cas par cas.',
    },
    {
      level: 'Diversification',
      advantage: 'Répartition du risque immobilier sur plusieurs pays. Accès à des marchés locatifs différents.',
      vigilance: 'Risque pays, risque de change, différences de droit immobilier et fiscal.',
    },
  ],
  tableNote:
    'Les mécanismes présentés dépendent des conventions fiscales en vigueur et de la situation individuelle. Ils peuvent évoluer.',
  criteriaTitle: 'Critères à croiser avec les revenus étrangers',
  criteriaCards: [
    { title: 'Pays d\'investissement', text: 'Chaque pays a sa propre convention fiscale avec la France. Le crédit d\'impôt et le traitement des PS varient selon les pays.' },
    { title: 'Crédit d\'impôt', text: 'À vérifier : montant, plafonnement, conditions d\'application. La société de gestion transmet les informations nécessaires.' },
    { title: 'Taux effectif', text: 'À comprendre selon la convention fiscale applicable. Peut impacter l\'imposition des autres revenus.' },
    { title: 'Prélèvements sociaux', text: 'Selon les cas, les revenus étrangers peuvent être exonérés de PS ou soumis à un taux réduit.' },
    { title: 'Documentation fiscale', text: 'La fiche fiscale annuelle de la société de gestion est le document de référence. À conserver pour la déclaration.' },
    { title: 'Rendement net estimé', text: 'Comparer le rendement net après fiscalité entre SCPI françaises et étrangères selon sa propre TMI.' },
  ],
  commonErrors: [
    'Croire que toutes les SCPI européennes ont la même fiscalité : chaque pays est différent.',
    'Confondre crédit d\'impôt et réduction d\'impôt : le crédit d\'impôt est un remboursement d\'impôt déjà payé à l\'étranger.',
    'Oublier la déclaration spécifique des revenus étrangers.',
    'Penser que les prélèvements sociaux sont toujours supprimés sur les revenus étrangers.',
    'Négliger le risque de change ou de différence de droit immobilier selon les pays.',
  ],
  practicalCases: [
    {
      title: 'SCPI allemande avec crédit d\'impôt',
      text: 'Un investisseur perçoit 4 000 € de revenus d\'une SCPI allemande. L\'Allemagne prélève un impôt à la source. La convention fiscale prévoit un crédit d\'impôt égal à cet impôt, imputable sur l\'IR français. Le rendement net peut être amélioré.',
    },
    {
      title: 'SCPI néerlandaise avec taux effectif',
      text: 'Un investisseur perçoit 3 000 € de revenus d\'une SCPI néerlandaise. Selon la convention, ces revenus sont exonérés d\'IR en France mais augmentent le taux effectif. L\'impact dépend de la TMI et des autres revenus.',
    },
    {
      title: 'SCPI multi-pays avec fiches fiscales',
      text: 'Un investisseur détient une SCPI diversifiée investie en France, Allemagne et Espagne. Il reçoit une fiche fiscale unique détaillant les revenus par pays. Chaque pays a son propre traitement fiscal.',
    },
  ],
  methodParagraphs: [
    'Identifier les pays d\'investissement de la SCPI.',
    'Vérifier les conventions fiscales applicables.',
    'Analyser la fiche fiscale de la société de gestion.',
    'Calculer l\'impact du crédit d\'impôt ou du taux effectif.',
    'Comparer le rendement net avec une SCPI française.',
    'Ne pas négliger les risques spécifiques (change, droit local).',
  ],
  conclusionParagraphs: [
    'Les revenus étrangers de SCPI peuvent offrir un traitement fiscal plus favorable, mais leur analyse est plus complexe. Chaque pays a ses propres règles et conventions.',
    'La fiche fiscale de la société de gestion est le document de référence. En cas de doute, il est recommandé de consulter un professionnel.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'un revenu étranger de SCPI ?',
      answer: 'Ce sont les loyers perçus par une SCPI sur des actifs immobiliers situés hors de France. Ces revenus sont généralement imposables dans le pays d\'origine ET en France, avec un mécanisme pour éviter la double imposition.',
    },
    {
      question: 'Comment sont imposés les revenus étrangers ?',
      answer: 'Selon la convention fiscale applicable : crédit d\'impôt (impôt étranger imputable sur l\'IR français) ou taux effectif (revenu non imposé en France mais influant sur le taux global).',
    },
    {
      question: 'Qu\'est-ce que le crédit d\'impôt ?',
      answer: 'Le crédit d\'impôt permet d\'imputer l\'impôt payé à l\'étranger sur l\'impôt français dû au titre des mêmes revenus. Il évite la double imposition mais ne rembourse pas l\'excédent éventuel.',
    },
    {
      question: 'Qu\'est-ce que le taux effectif ?',
      answer: 'Le taux effectif est un mécanisme où le revenu étranger n\'est pas imposé en France mais est pris en compte pour calculer le taux d\'imposition applicable aux autres revenus. Cela peut augmenter l\'impôt sur les autres revenus.',
    },
    {
      question: 'Les prélèvements sociaux s\'appliquent-ils toujours ?',
      answer: 'Pas nécessairement. Selon les conventions fiscales, certains revenus étrangers peuvent être exonérés de prélèvements sociaux ou soumis à un taux réduit. À vérifier au cas par cas.',
    },
    {
      question: 'Les SCPI européennes sont-elles fiscalement meilleures ?',
      answer: 'Elles peuvent améliorer le rendement net fiscal dans certaines situations, mais ce n\'est pas automatique. Tout dépend de la convention fiscale, du pays, de la TMI et des autres revenus.',
    },
    {
      question: 'Comment déclarer les revenus étrangers ?',
      answer: 'Les revenus étrangers font l\'objet d\'une déclaration spécifique. La société de gestion transmet une fiche fiscale annuelle détaillée. Les modalités exactes doivent être confirmées au moment de la déclaration.',
    },
    {
      question: 'Comment MaximusSCPI analyse les revenus étrangers ?',
      answer: 'MaximusSCPI analyse les revenus étrangers à travers leur origine géographique, les conventions fiscales, le crédit d\'impôt, le taux effectif et l\'impact sur le rendement net. L\'approche est pédagogique.',
    },
  ],
}
