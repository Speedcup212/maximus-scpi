import type { ScpiEducationalPageConfig } from './shared'

export const creditImpotScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-credit-impot/',
  badge: 'Fiscalité SCPI',
  h1: 'Crédit d\'impôt SCPI : comprendre les revenus immobiliers étrangers',
  heroSubtitle:
    'Le crédit d\'impôt est l\'un des mécanismes utilisés par certaines conventions fiscales pour éviter la double imposition des revenus immobiliers étrangers. Son calcul varie selon les pays et ne correspond pas toujours à l\'impôt effectivement payé à l\'étranger.',
  seoTitle: 'Crédit d\'impôt SCPI : convention, calcul, revenus étrangers et déclaration',
  seoDescription:
    'Crédit d\'impôt SCPI : différence entre impôt étranger et impôt français, conventions fiscales, taux effectif, déclaration et rendement net.',
  shortAnswerTitle: 'Qu\'est-ce que le crédit d\'impôt pour revenus étrangers de SCPI ?',
  shortAnswer:
    'Lorsqu\'un revenu immobilier étranger est imposable dans le pays où se trouve l\'immeuble et pris en compte en France, la convention fiscale organise l\'élimination de la double imposition. Elle peut prévoir un crédit d\'impôt égal à l\'impôt étranger, un crédit égal à l\'impôt français correspondant au revenu, ou un autre mécanisme. Il est donc faux d\'appliquer une seule formule à toutes les SCPI européennes.',
  keyMessage:
    'Le mot « crédit d\'impôt » ne suffit pas : il faut identifier le crédit prévu par la convention concernée et sa méthode de calcul.',
  definitionParagraphs: [
    'Les conventions fiscales conclues par la France répartissent le droit d\'imposer et précisent comment la double imposition est neutralisée. Les modalités diffèrent d\'un pays à l\'autre.',
    'Dans certains cas, le crédit d\'impôt est égal au montant de l\'impôt effectivement acquitté à l\'étranger, dans la limite prévue par la convention. Dans d\'autres, il est égal à l\'impôt français correspondant au revenu étranger, indépendamment du montant exact payé à l\'étranger.',
    'Il faut donc éviter la formule « impôt étranger déduit de l\'impôt français » lorsqu\'elle n\'est pas confirmée par le texte applicable.',
    'Le crédit d\'impôt se distingue d\'une réduction d\'impôt : il organise ici l\'élimination de la double imposition d\'un revenu international ; il ne constitue pas un avantage commercial propre à la SCPI.',
    'Certaines conventions utilisent un mécanisme de taux effectif ou une méthode équivalente plutôt qu\'un crédit d\'impôt calculé de la même façon. Le revenu étranger peut alors influencer le taux appliqué aux autres revenus français.',
    'La société de gestion fournit une fiche fiscale annuelle avec la ventilation des revenus et les éléments nécessaires à la déclaration. Ce document doit être rapproché des instructions fiscales et, si nécessaire, de la convention ou du BOFiP.',
    'Le crédit d\'impôt n\'est qu\'un élément du rendement net. Le taux d\'imposition local, les prélèvements sociaux éventuels, les frais, le change et la performance immobilière doivent également être intégrés.',
  ],
  tableTitle: 'Principaux mécanismes à distinguer',
  tableRows: [
    {
      level: 'Crédit égal à l\'impôt étranger',
      advantage: 'Neutralise tout ou partie de la double imposition lorsque la convention le prévoit.',
      vigilance: 'Montant plafonné et éventuelle non-restitution à vérifier dans la convention.',
    },
    {
      level: 'Crédit égal à l\'impôt français',
      advantage: 'Peut neutraliser l\'impôt français correspondant au revenu étranger selon certaines conventions.',
      vigilance: 'Le montant ne correspond pas nécessairement à l\'impôt réellement acquitté à l\'étranger.',
    },
    {
      level: 'Taux effectif',
      advantage: 'Le revenu peut être exonéré en France tout en étant retenu pour déterminer le taux applicable aux autres revenus.',
      vigilance: 'L\'impact se calcule sur le revenu global du foyer, pas isolément sur la SCPI.',
    },
    {
      level: 'Fiche fiscale',
      advantage: 'Fournit les montants par pays et facilite les reports déclaratifs.',
      vigilance: 'Elle doit être utilisée avec les règles de déclaration de l\'année concernée.',
    },
  ],
  tableNote:
    'La convention applicable et les instructions fiscales de l\'année priment sur toute règle générale ou exemple ancien.',
  criteriaTitle: 'Critères à croiser avec le crédit d\'impôt',
  criteriaCards: [
    { title: 'Pays', text: 'Identifier l\'État d\'origine du revenu et la convention applicable.' },
    { title: 'Méthode de calcul', text: 'Vérifier si le crédit est égal à l\'impôt étranger, à l\'impôt français ou relève d\'un autre mécanisme.' },
    { title: 'Fiche fiscale', text: 'Utiliser les montants fournis par la société de gestion comme base opérationnelle de déclaration.' },
    { title: 'TMI et taux moyen', text: 'Le résultat français peut dépendre du taux global du foyer ; une TMI élevée ne garantit pas une utilisation « optimale » du crédit.' },
    { title: 'Prélèvements sociaux', text: 'Leur traitement doit être vérifié séparément et ne découle pas automatiquement du crédit d\'impôt.' },
    { title: 'Rendement net', text: 'Comparer le net après fiscalité, frais, change et risque immobilier plutôt qu\'un avantage fiscal isolé.' },
  ],
  commonErrors: [
    'Présenter le crédit d\'impôt comme toujours égal à l\'impôt payé à l\'étranger.',
    'Présenter le crédit d\'impôt comme une réduction fiscale propre à la SCPI.',
    'Attribuer une méthode de crédit d\'impôt à un pays sans vérifier la convention en vigueur.',
    'Supposer qu\'un excédent est toujours remboursable ou toujours perdu sans lire le texte applicable.',
    'Calculer le rendement net européen uniquement à partir de la TMI et d\'un crédit d\'impôt moyen.',
    'Oublier les règles déclaratives et la fiche fiscale annuelle.',
  ],
  practicalCases: [
    {
      title: 'Crédit égal à l\'impôt français',
      text: 'Une convention prévoit un crédit calculé par référence à l\'impôt français correspondant au revenu étranger. Le montant du crédit n\'est donc pas obtenu en recopiant l\'impôt payé dans le pays source.',
    },
    {
      title: 'Crédit égal à l\'impôt étranger',
      text: 'Une autre convention peut retenir l\'impôt effectivement acquitté à l\'étranger dans certaines limites. Le mécanisme doit être lu dans le texte applicable avant toute simulation.',
    },
    {
      title: 'Taux effectif',
      text: 'Le revenu étranger peut être exonéré d\'IR français mais augmenter le taux appliqué aux autres revenus. La simulation doit donc être faite au niveau du foyer complet.',
    },
    {
      title: 'SCPI multi-pays',
      text: 'Une même SCPI peut distribuer des revenus relevant de plusieurs conventions. La fiche fiscale ventile les montants pays par pays ; il ne faut pas appliquer un crédit moyen unique à toute la distribution.',
    },
  ],
  methodParagraphs: [
    'Identifier les pays d\'origine des revenus à partir de la fiche fiscale annuelle.',
    'Lire le mécanisme d\'élimination de la double imposition prévu par chaque convention significative.',
    'Vérifier la formule de crédit d\'impôt et ses plafonds éventuels.',
    'Contrôler séparément le traitement des prélèvements sociaux.',
    'Reporter les montants dans la déclaration selon les instructions de l\'année.',
    'Calculer le net fiscal au niveau du foyer et non à partir d\'un exemple isolé.',
    'Comparer ensuite les SCPI sur leurs risques et leur performance, pas seulement sur le crédit d\'impôt.',
  ],
  conclusionParagraphs: [
    'Le crédit d\'impôt est un mécanisme de convention fiscale, pas une caractéristique uniforme des SCPI européennes.',
    'Sa méthode de calcul doit être vérifiée pays par pays et peut différer fortement d\'un État à l\'autre.',
    'La fiche fiscale annuelle de la société de gestion et les textes officiels sont les seules bases suffisamment robustes pour une simulation ou une déclaration.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le crédit d\'impôt en SCPI ?',
      answer: 'C\'est un mécanisme conventionnel destiné à éviter la double imposition de certains revenus étrangers. Son calcul dépend du pays concerné.',
    },
    {
      question: 'Est-il toujours égal à l\'impôt payé à l\'étranger ?',
      answer: 'Non. Certaines conventions prévoient un crédit égal à l\'impôt français correspondant au revenu étranger.',
    },
    {
      question: 'Est-ce une réduction d\'impôt ?',
      answer: 'Non. Dans ce contexte, il s\'agit d\'un mécanisme d\'élimination de la double imposition et non d\'un avantage fiscal autonome.',
    },
    {
      question: 'S\'applique-t-il à toutes les SCPI européennes ?',
      answer: 'Non de manière identique. Il faut analyser les conventions fiscales correspondant aux pays dans lesquels la SCPI génère des revenus.',
    },
    {
      question: 'Que faire en présence de plusieurs pays ?',
      answer: 'Ventiler les revenus selon la fiche fiscale annuelle et appliquer la méthode prévue par chaque convention.',
    },
    {
      question: 'Où trouver les informations nécessaires ?',
      answer: 'Dans la fiche fiscale annuelle de la société de gestion, les instructions de déclaration, le BOFiP et les conventions fiscales applicables.',
    },
    {
      question: 'Comment MaximusSCPI analyse ce mécanisme ?',
      answer: 'MaximusSCPI distingue les différents types de crédits d\'impôt et évite toute hypothèse uniforme sur les revenus européens avant de calculer un rendement net.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI par exposition géographique',
}
