import type { ScpiEducationalPageConfig } from './shared'

export const creditImpotScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-credit-impot/',
  badge: 'Fiscalité SCPI',
  h1: 'Crédit d\'impôt SCPI : comprendre le mécanisme des revenus étrangers',
  heroSubtitle:
    'Le crédit d\'impôt est un mécanisme fiscal qui évite la double imposition des revenus étrangers de SCPI. Son application dépend du pays d\'origine, des conventions fiscales et de la situation de l\'investisseur.',
  seoTitle: 'Crédit d\'impôt SCPI : fiscalité des SCPI européennes expliquée',
  seoDescription:
    'Comprenez le crédit d\'impôt applicable à certains revenus étrangers de SCPI : principe, limites, conventions fiscales, rendement net et points de vigilance.',
  shortAnswerTitle: 'Qu\'est-ce que le crédit d\'impôt en SCPI ?',
  shortAnswer:
    'Le crédit d\'impôt évite qu\'un même revenu immobilier étranger soit imposé deux fois : dans le pays d\'origine (où est situé l\'immeuble) et en France. L\'impôt déjà payé à l\'étranger vient en déduction de l\'impôt français dû. Le crédit d\'impôt n\'est pas une réduction d\'impôt, mais un mécanisme de neutralisation de la double imposition.',
  keyMessage:
    'Le crédit d\'impôt peut améliorer la fiscalité de certains revenus étrangers de SCPI, mais son application dépend des pays et des conventions fiscales.',
  definitionParagraphs: [
    'Le crédit d\'impôt pour revenus étrangers est un mécanisme prévu par la plupart des conventions fiscales signées par la France. Il permet à un résident fiscal français de déduire de son impôt français l\'impôt déjà acquitté à l\'étranger sur des revenus immobiliers de source étrangère.',
    'Pour les SCPI, le crédit d\'impôt s\'applique aux revenus perçus par la SCPI dans les pays où elle détient des actifs immobiliers. La société de gestion communique chaque année une fiche fiscale indiquant, pour chaque pays, le montant des revenus et le montant du crédit d\'impôt correspondant.',
    'Le crédit d\'impôt est plafonné : il ne peut pas excéder le montant de l\'impôt français dû au titre des mêmes revenus. Si le crédit d\'impôt est supérieur à l\'impôt dû, l\'excédent n\'est généralement pas remboursé.',
    'Il ne faut pas confondre crédit d\'impôt et réduction d\'impôt. Le crédit d\'impôt correspond à un impôt déjà payé à l\'étranger : il neutralise la double imposition. La réduction d\'impôt est un avantage fiscal spécifique (ex. : investissement Malraux, Denormandie).',
    'Le montant du crédit d\'impôt dépend du taux d\'imposition effectif appliqué par le pays d\'origine et des stipulations de la convention fiscale. Il n\'est pas nécessairement égal à l\'impôt réellement payé.',
    'Certains pays ne permettent pas un crédit d\'impôt mais appliquent un mécanisme de taux effectif. Dans ce cas, le revenu étranger n\'est pas imposé en France mais est pris en compte pour déterminer le taux d\'imposition global.',
  ],
  tableTitle: 'Mécanisme du crédit d\'impôt pour les SCPI',
  tableRows: [
    {
      level: 'Double imposition',
      advantage: 'Le même revenu est imposable dans le pays d\'origine et en France.',
      vigilance: 'Sans mécanisme correcteur, l\'investisseur serait imposé deux fois.',
    },
    {
      level: 'Crédit d\'impôt',
      advantage: 'L\'impôt payé à l\'étranger s\'impute sur l\'IR français. Évite la double imposition.',
      vigilance: 'Plafonné à l\'impôt français correspondant. Excédent non remboursable.',
    },
    {
      level: 'Convention fiscale',
      advantage: 'Définit les modalités d\'imposition et le crédit d\'impôt applicables.',
      vigilance: 'Chaque pays a sa propre convention avec la France. À vérifier.',
    },
    {
      level: 'Déclaration',
      advantage: 'La société de gestion fournit les informations nécessaires.',
      vigilance: 'Déclaration spécifique à effectuer. À vérifier selon les formulaires en vigueur.',
    },
    {
      level: 'Rendement net',
      advantage: 'Le crédit d\'impôt peut améliorer le rendement net fiscal.',
      vigilance: 'L\'écart dépend du pays, de la convention et de la TMI.',
    },
    {
      level: 'Pays d\'origine',
      advantage: 'Certains pays ont des taux d\'imposition faibles, d\'autres plus élevés.',
      vigilance: 'Le crédit d\'impôt peut être inférieur à l\'impôt français si le taux étranger est faible.',
    },
  ],
  tableNote:
    'Les modalités précises du crédit d\'impôt dépendent de la convention fiscale applicable et de la situation individuelle.',
  criteriaTitle: 'Critères à croiser avec le crédit d\'impôt',
  criteriaCards: [
    { title: 'Pays d\'investissement', text: 'Chaque pays a sa propre convention. Le crédit d\'impôt varie selon le pays.' },
    { title: 'Convention fiscale', text: 'La convention détermine l\'existence et le calcul du crédit d\'impôt.' },
    { title: 'Fiche fiscale', text: 'Document fourni par la société de gestion. Indique les montants par pays.' },
    { title: 'Rendement net', text: 'Le crédit d\'impôt peut améliorer le rendement net. À comparer avec une SCPI française.' },
    { title: 'TMI', text: 'La TMI détermine l\'impôt français de référence. Le crédit d\'impôt est plafonné à cet impôt.' },
  ],
  commonErrors: [
    'Confondre crédit d\'impôt et réduction d\'impôt.',
    'Croire que le crédit d\'impôt s\'applique à toutes les SCPI européennes (cela dépend de la convention).',
    'Penser que le crédit d\'impôt rembourse l\'excédent si l\'impôt étranger est supérieur à l\'impôt français.',
    'Oublier de déclarer les revenus étrangers et le crédit d\'impôt correspondant.',
    'Négliger la fiche fiscale de la société de gestion.',
  ],
  practicalCases: [
    {
      title: 'Crédit d\'impôt Allemagne',
      text: 'Un investisseur perçoit 4 000 € de revenus d\'une SCPI allemande. L\'Allemagne prélève 600 € d\'impôt à la source. Crédit d\'impôt égal à 600 €. L\'impôt français sur ces revenus est de 1 200 € (TMI 30 %). Le crédit d\'impôt réduit l\'IR dû à 600 €.',
    },
    {
      title: 'Crédit d\'impôt partiel',
      text: 'Même situation mais l\'impôt allemand n\'est que de 300 €. Crédit d\'impôt : 300 €. IR français dû : 1 200 € − 300 € = 900 €.',
    },
    {
      title: 'Taux effectif sans crédit d\'impôt',
      text: 'Une SCPI investit aux Pays-Bas où la convention prévoit un taux effectif. Les revenus ne sont pas imposés en France mais augmentent le taux d\'imposition global. L\'impact dépend des autres revenus.',
    },
  ],
  methodParagraphs: [
    'Vérifier les pays d\'investissement de la SCPI.',
    'Consulter la fiche fiscale de la société de gestion.',
    'Identifier le mécanisme applicable : crédit d\'impôt ou taux effectif.',
    'Calculer l\'impôt français avant et après crédit d\'impôt.',
    'Estimer le rendement net après prise en compte du crédit d\'impôt.',
    'Comparer avec une SCPI française pour évaluer l\'écart.',
  ],
  conclusionParagraphs: [
    'Le crédit d\'impôt est un mécanisme important pour les SCPI européennes. Il peut améliorer le rendement net fiscal, mais son application dépend des pays et des conventions.',
    'La fiche fiscale de la société de gestion est le document de référence. Les modalités exactes doivent être vérifiées au moment de la déclaration.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le crédit d\'impôt en SCPI ?',
      answer: 'C\'est un mécanisme qui permet d\'imputer l\'impôt payé à l\'étranger sur l\'impôt français dû au titre des mêmes revenus. Il évite la double imposition des revenus immobiliers étrangers.',
    },
    {
      question: 'Pourquoi existe-t-il ?',
      answer: 'Pour éviter qu\'un même revenu soit imposé deux fois : dans le pays d\'origine (où se trouve l\'immeuble) et en France (où réside l\'investisseur).',
    },
    {
      question: 'Est-ce une réduction d\'impôt ?',
      answer: 'Non. Le crédit d\'impôt correspond à un impôt déjà payé à l\'étranger. Il neutralise la double imposition alors qu\'une réduction d\'impôt est un avantage fiscal distinct.',
    },
    {
      question: 'S\'applique-t-il à toutes les SCPI européennes ?',
      answer: 'Non, cela dépend des pays et des conventions fiscales. Certaines conventions prévoient un mécanisme de taux effectif plutôt qu\'un crédit d\'impôt.',
    },
    {
      question: 'Comment le crédit d\'impôt impacte-t-il le rendement net ?',
      answer: 'En réduisant l\'impôt français dû, le crédit d\'impôt améliore le rendement net fiscal par rapport à une SCPI française de rendement équivalent.',
    },
    {
      question: 'Où trouver les informations nécessaires ?',
      answer: 'La société de gestion transmet chaque année une fiche fiscale indiquant, par pays, le montant des revenus et le crédit d\'impôt correspondant.',
    },
    {
      question: 'Faut-il privilégier les SCPI avec revenus étrangers ?',
      answer: 'Les SCPI européennes peuvent améliorer le rendement net dans certaines situations, mais ce n\'est pas automatique. L\'analyse doit intégrer la convention, le pays, les risques et les objectifs.',
    },
    {
      question: 'Comment MaximusSCPI analyse ce mécanisme ?',
      answer: 'MaximusSCPI intègre le crédit d\'impôt et le taux effectif dans l\'analyse du rendement net des SCPI européennes, selon les informations disponibles et les conventions applicables.',
    },
  ],
}
