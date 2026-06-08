import type { ScpiEducationalPageConfig } from './shared'

export const tauxEffectifScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-taux-effectif/',
  badge: 'Fiscalité SCPI',
  h1: 'Taux effectif SCPI : comprendre la fiscalité des revenus étrangers',
  heroSubtitle:
    'Le taux effectif est un mécanisme fiscal spécifique à certains revenus étrangers de SCPI. Il diffère du crédit d\'impôt et peut avoir un impact sur l\'imposition globale du foyer.',
  seoTitle: 'Taux effectif SCPI : fiscalité étrangère et rendement net',
  seoDescription:
    'Comprenez le taux effectif appliqué à certains revenus étrangers de SCPI : principe, fiscalité européenne, rendement net, déclaration et points de vigilance.',
  shortAnswerTitle: 'Qu\'est-ce que le taux effectif pour les SCPI ?',
  shortAnswer:
    'Le taux effectif est un mécanisme prévu par certaines conventions fiscales : les revenus étrangers de SCPI ne sont pas imposés en France, mais ils sont pris en compte pour déterminer le taux d\'imposition applicable aux autres revenus du foyer. Cela peut augmenter l\'impôt sur les autres revenus, même si les revenus étrangers eux-mêmes échappent à l\'IR.',
  keyMessage:
    'Le taux effectif est un mécanisme fiscal à comprendre pour lire correctement les revenus étrangers de SCPI et leur impact sur l\'impôt global.',
  definitionParagraphs: [
    'Le taux effectif est un mécanisme de calcul de l\'impôt prévu par certaines conventions fiscales. Il s\'applique à certains revenus de source étrangère qui, selon la convention, ne sont pas imposables en France.',
    'Concrètement, le revenu étranger est ajouté aux autres revenus du foyer pour déterminer le taux d\'imposition moyen applicable à l\'ensemble des revenus. Ce taux est ensuite appliqué aux seuls revenus imposables en France (hors revenus étrangers exonérés).',
    'L\'effet du taux effectif dépend du montant des revenus étrangers et de leur poids relatif dans le revenu total du foyer. Plus les revenus étrangers sont élevés, plus le taux effectif peut augmenter, et plus l\'impôt sur les autres revenus peut être impacté.',
    'Le taux effectif ne doit pas être confondu avec le crédit d\'impôt. Le crédit d\'impôt impute l\'impôt étranger sur l\'impôt français. Le taux effectif exonère le revenu étranger d\'IR en France mais augmente le taux applicable aux autres revenus.',
    'Toutes les conventions fiscales ne prévoient pas un taux effectif. Certaines privilégient le crédit d\'impôt. La distinction dépend du pays d\'origine des revenus et des stipulations de la convention.',
    'La société de gestion transmet une fiche fiscale indiquant, pour chaque pays, si le mécanisme applicable est le crédit d\'impôt ou le taux effectif. Cette information est nécessaire pour la déclaration.',
  ],
  tableTitle: 'Comparaison entre taux effectif et crédit d\'impôt',
  tableRows: [
    {
      level: 'Taux effectif',
      advantage: 'Le revenu étranger n\'est pas imposé en France.',
      vigilance: 'Le taux applicable aux autres revenus peut augmenter. Impact indirect à ne pas négliger.',
    },
    {
      level: 'Crédit d\'impôt',
      advantage: 'L\'impôt étranger est imputé sur l\'IR français.',
      vigilance: 'Plafonné à l\'impôt français. Excédent non remboursable.',
    },
    {
      level: 'Revenus français',
      advantage: 'Imposition au barème standard selon la TMI.',
      vigilance: 'Aucun mécanisme particulier. IR + PS applicables.',
    },
    {
      level: 'Revenus étrangers',
      advantage: 'Exonération d\'IR ou crédit d\'impôt selon convention.',
      vigilance: 'Traitement variable selon le pays. Déclaration spécifique.',
    },
    {
      level: 'Progressivité',
      advantage: 'Le taux effectif tient compte de la progressivité de l\'IR.',
      vigilance: 'L\'impact dépend du montant des revenus étrangers et de la composition du foyer.',
    },
    {
      level: 'Déclaration',
      advantage: 'La fiche fiscale de la société de gestion guide la déclaration.',
      vigilance: 'À vérifier selon les formulaires en vigueur. Les modalités peuvent évoluer.',
    },
  ],
  tableNote:
    'Le mécanisme applicable (taux effectif ou crédit d\'impôt) dépend de la convention fiscale avec chaque pays.',
  criteriaTitle: 'Critères à croiser avec le taux effectif',
  criteriaCards: [
    { title: 'Convention fiscale', text: 'Le taux effectif est prévu par la convention fiscale applicable. À vérifier selon le pays.' },
    { title: 'Montant des revenus étrangers', text: 'Plus les revenus étrangers sont élevés, plus l\'impact sur le taux effectif peut être significatif.' },
    { title: 'Autres revenus', text: 'Le taux effectif impacte l\'imposition des autres revenus du foyer. À analyser globalement.' },
    { title: 'TMI', text: 'L\'impact du taux effectif dépend de la TMI et de la composition des revenus.' },
    { title: 'Comparaison avec crédit d\'impôt', text: 'Selon les cas, le taux effectif ou le crédit d\'impôt peut être plus favorable. À analyser.' },
  ],
  commonErrors: [
    'Confondre taux effectif et crédit d\'impôt.',
    'Croire que le taux effectif est automatiquement favorable (il peut augmenter l\'impôt sur les autres revenus).',
    'Oublier que le taux effectif impacte l\'imposition globale du foyer, pas seulement celle des revenus étrangers.',
    'Négliger la déclaration spécifique des revenus étrangers.',
    'Penser que toutes les conventions fiscales prévoient le même mécanisme.',
  ],
  practicalCases: [
    {
      title: 'Taux effectif sur revenus étrangers',
      text: 'Revenus imposables France : 80 000 €. Revenus étrangers exonérés : 20 000 €. Taux effectif calculé sur 100 000 € = 25 %. Impôt dû : 25 % × 80 000 € = 20 000 € (au lieu de 18 000 € sans taux effectif).',
    },
    {
      title: 'Crédit d\'impôt vs taux effectif',
      text: 'Pour une SCPI investie en Allemagne (crédit d\'impôt), le revenu est imposé en France avec déduction de l\'impôt allemand. Pour une SCPI investie aux Pays-Bas (taux effectif), le revenu n\'est pas imposé mais augmente le taux.',
    },
    {
      title: 'Impact limité du taux effectif',
      text: 'Si les revenus étrangers sont faibles par rapport au revenu total, l\'impact du taux effectif sur l\'impôt global peut être marginal. L\'analyse au cas par cas est nécessaire.',
    },
  ],
  methodParagraphs: [
    'Identifier les pays d\'investissement et les conventions fiscales.',
    'Déterminer si le mécanisme applicable est le crédit d\'impôt ou le taux effectif.',
    'Calculer l\'impact du taux effectif sur l\'impôt global.',
    'Comparer avec le mécanisme de crédit d\'impôt.',
    'Intégrer l\'impact dans l\'estimation du rendement net.',
  ],
  conclusionParagraphs: [
    'Le taux effectif est un mécanisme fiscal complexe mais important pour les SCPI investies dans certains pays européens. Il peut avoir un impact sur l\'imposition globale du foyer.',
    'La fiche fiscale de la société de gestion est essentielle pour déterminer le mécanisme applicable. En cas de doute, un professionnel peut aider à l\'analyse.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le taux effectif ?',
      answer: 'Le taux effectif est un mécanisme où certains revenus étrangers ne sont pas imposés en France mais sont pris en compte pour calculer le taux d\'imposition applicable aux autres revenus.',
    },
    {
      question: 'Comment s\'applique-t-il aux SCPI ?',
      answer: 'Pour les SCPI investies dans des pays dont la convention prévoit un taux effectif, les revenus étrangers sont ajoutés au revenu global pour calculer le taux d\'imposition, mais ne sont pas eux-mêmes imposés.',
    },
    {
      question: 'Quelle différence avec le crédit d\'impôt ?',
      answer: 'Le crédit d\'impôt impute l\'impôt étranger sur l\'IR français. Le taux effectif exonère le revenu étranger d\'IR mais augmente le taux applicable aux autres revenus.',
    },
    {
      question: 'Est-ce fiscalement avantageux ?',
      answer: 'Cela dépend de la situation. Le taux effectif peut être favorable si l\'augmentation du taux est faible par rapport à l\'impôt qui serait dû sans exonération.',
    },
    {
      question: 'Est-ce valable pour toutes les SCPI européennes ?',
      answer: 'Non, cela dépend des pays et des conventions fiscales applicables. Certains pays prévoient un crédit d\'impôt, d\'autres un taux effectif.',
    },
    {
      question: 'Quel impact sur le rendement net ?',
      answer: 'Le taux effectif améliore le rendement brut des SCPI concernées (pas d\'IR direct), mais peut augmenter l\'impôt sur les autres revenus. L\'impact net dépend de la situation.',
    },
    {
      question: 'Comment déclarer ces revenus ?',
      answer: 'La société de gestion transmet une fiche fiscale indiquant le mécanisme applicable. La déclaration suit des règles spécifiques. À vérifier selon les formulaires en vigueur.',
    },
    {
      question: 'Comment MaximusSCPI l\'intègre dans l\'analyse ?',
      answer: 'MaximusSCPI distingue crédit d\'impôt et taux effectif dans l\'analyse du rendement net des SCPI européennes, selon les conventions applicables.',
    },
  ],
}
