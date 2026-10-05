import type { ScpiEducationalPageConfig } from './shared'

export const revenusEtrangersScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-etrangers/',
  badge: 'Fiscalité SCPI',
  h1: 'Revenus étrangers de SCPI : comprendre la fiscalité européenne',
  heroSubtitle:
    'Les revenus immobiliers étrangers distribués par une SCPI sont traités selon les conventions fiscales conclues entre la France et chaque pays concerné. Crédit d\'impôt, taux effectif et prélèvements sociaux ne doivent jamais être généralisés à toute l\'Europe.',
  seoTitle: 'Revenus étrangers SCPI : fiscalité, crédit d\'impôt et conventions',
  seoDescription:
    'Fiscalité des revenus étrangers de SCPI : conventions pays par pays, crédit d\'impôt, taux effectif, prélèvements sociaux, déclaration et rendement net.',
  shortAnswerTitle: 'Pourquoi les revenus étrangers changent-ils l\'analyse fiscale ?',
  shortAnswer:
    'Une SCPI qui détient des immeubles à l\'étranger perçoit des revenus de source étrangère. Leur traitement en France dépend de la convention fiscale applicable à chaque État et de la nature du revenu. Certaines conventions prévoient un crédit d\'impôt, d\'autres une méthode de taux effectif ou un mécanisme voisin. Le montant du crédit d\'impôt n\'est pas nécessairement égal à l\'impôt effectivement payé à l\'étranger. La fiche fiscale annuelle de la société de gestion et les textes officiels sont les références opérationnelles.',
  keyMessage:
    'Les revenus étrangers doivent être ventilés pays par pays. Une formule fiscale unique « Europe » crée un risque d\'erreur.',
  definitionParagraphs: [
    'Un revenu immobilier de source étrangère provient d\'un bien situé hors de France. Une SCPI française peut distribuer de tels revenus lorsqu\'elle détient des actifs immobiliers dans d\'autres pays.',
    'Les conventions fiscales internationales répartissent le droit d\'imposer entre les États et organisent l\'élimination de la double imposition en France. La méthode varie selon le pays et le type de revenu.',
    'Un crédit d\'impôt peut être égal à l\'impôt étranger dans certaines situations, mais d\'autres conventions prévoient un crédit égal à l\'impôt français correspondant au revenu étranger. Il faut donc utiliser le mécanisme exact prévu par la convention et non une règle générique.',
    'Le taux effectif est une autre méthode possible : le revenu étranger peut être exonéré d\'impôt français tout en étant pris en compte pour déterminer le taux applicable aux autres revenus imposables en France. Son impact dépend de la composition du revenu global du foyer.',
    'Le traitement des prélèvements sociaux français doit être vérifié séparément. Il ne faut ni les ajouter automatiquement à tous les revenus étrangers, ni supposer qu\'ils sont toujours supprimés.',
    'La société de gestion transmet une fiche fiscale annuelle détaillant généralement la ventilation géographique et les montants à reporter. Cette documentation doit être rapprochée de la déclaration de revenus et, en cas de doute, des textes BOFiP ou de la convention concernée.',
    'L\'intérêt d\'une SCPI européenne ne se réduit pas à la fiscalité : diversification géographique, qualité des immeubles, baux, devise, dette et liquidité restent déterminants.',
  ],
  tableTitle: 'Mécanismes fiscaux à identifier',
  tableRows: [
    {
      level: 'Crédit d\'impôt égal à l\'impôt étranger',
      advantage: 'Peut neutraliser tout ou partie de la double imposition lorsque la convention le prévoit.',
      vigilance: 'Plafond, montant retenu et éventuelle non-restitution dépendent du texte applicable.',
    },
    {
      level: 'Crédit d\'impôt égal à l\'impôt français',
      advantage: 'Mécanisme fréquent dans certaines conventions pour neutraliser l\'IR français correspondant au revenu étranger.',
      vigilance: 'Le calcul ne correspond pas nécessairement à l\'impôt effectivement payé dans le pays source.',
    },
    {
      level: 'Taux effectif',
      advantage: 'Le revenu étranger peut être exonéré en France tout en servant à calculer le taux applicable aux autres revenus.',
      vigilance: 'L\'impact dépend des autres revenus du foyer et doit être simulé globalement.',
    },
    {
      level: 'Prélèvements sociaux',
      advantage: 'Le traitement peut différer de celui des revenus immobiliers français selon la nature du flux et les règles applicables.',
      vigilance: 'Ne pas appliquer une exonération ou un taux par défaut sans vérification.',
    },
    {
      level: 'Déclaration fiscale',
      advantage: 'La fiche fiscale de la société de gestion facilite la ventilation et les reports.',
      vigilance: 'Les formulaires et cases peuvent différer selon la nature du revenu et le mécanisme conventionnel.',
    },
  ],
  tableNote:
    'La convention fiscale, la fiche fiscale annuelle de la SCPI et les instructions de déclaration en vigueur priment sur toute synthèse générale.',
  criteriaTitle: 'Critères à croiser avec les revenus étrangers',
  criteriaCards: [
    { title: 'Pays d\'investissement', text: 'Identifier la part des revenus provenant de chaque État et la convention correspondante.' },
    { title: 'Méthode conventionnelle', text: 'Crédit d\'impôt égal à l\'impôt étranger, égal à l\'impôt français, taux effectif ou autre mécanisme : vérifier le texte exact.' },
    { title: 'Fiche fiscale', text: 'Utiliser la documentation annuelle de la société de gestion comme base de report, puis contrôler les règles applicables.' },
    { title: 'Prélèvements sociaux', text: 'Vérifier séparément leur application au lieu de supposer un régime européen uniforme.' },
    { title: 'TMI et taux moyen', text: 'Le mécanisme de taux effectif peut modifier l\'imposition des autres revenus ; la TMI seule ne suffit pas.' },
    { title: 'Risque de change', text: 'Hors zone euro, intégrer la devise des loyers et des actifs ainsi que la politique de couverture.' },
    { title: 'Rendement net', text: 'Comparer les SCPI après fiscalité réellement applicable, frais et risque, pas à partir d\'un taux fiscal moyen européen.' },
  ],
  commonErrors: [
    'Considérer que toutes les conventions utilisent le même crédit d\'impôt.',
    'Assimiler le crédit d\'impôt au montant exact de l\'impôt payé à l\'étranger sans lire la convention.',
    'Attribuer un mécanisme fiscal à un pays sur la base d\'un exemple ancien sans vérifier le texte en vigueur.',
    'Supposer que les prélèvements sociaux sont toujours supprimés sur les revenus étrangers.',
    'Appliquer directement la TMI à un revenu relevant d\'un mécanisme de taux effectif.',
    'Choisir une SCPI européenne uniquement pour la fiscalité et négliger le risque immobilier ou de change.',
  ],
  practicalCases: [
    {
      title: 'SCPI investie dans plusieurs pays',
      text: 'La société de gestion ventile les revenus par État. Chaque quote-part est traitée selon la convention concernée avant de calculer le net fiscal global du foyer.',
    },
    {
      title: 'Crédit égal à l\'impôt français',
      text: 'Dans certaines conventions, le crédit d\'impôt est calculé par référence à l\'impôt français correspondant au revenu étranger et non par simple reprise de l\'impôt acquitté à l\'étranger.',
    },
    {
      title: 'Taux effectif',
      text: 'Un revenu étranger exonéré en France peut néanmoins augmenter le taux appliqué aux autres revenus français. L\'impact se calcule sur l\'ensemble du foyer et non isolément sur la SCPI.',
    },
    {
      title: 'Prélèvements sociaux',
      text: 'Avant de chiffrer le rendement net, la simulation vérifie si les prélèvements sociaux français sont dus sur le flux concerné au lieu de les supprimer par principe.',
    },
    {
      title: 'Risque de change',
      text: 'Une fiscalité favorable ne compense pas automatiquement une dépréciation de devise ou une mauvaise performance immobilière. La comparaison reste globale.',
    },
  ],
  methodParagraphs: [
    'Recenser les pays d\'investissement de la SCPI et la part de revenu provenant de chacun.',
    'Récupérer la fiche fiscale annuelle de la société de gestion.',
    'Vérifier la convention fiscale applicable à chaque revenu significatif.',
    'Identifier précisément la méthode d\'élimination de la double imposition.',
    'Contrôler séparément le traitement des prélèvements sociaux.',
    'Intégrer le résultat dans la déclaration globale du foyer et non dans une simulation isolée de la SCPI.',
    'Comparer ensuite le rendement net avec les risques immobiliers, la devise, les frais et la liquidité.',
  ],
  conclusionParagraphs: [
    'La fiscalité des revenus étrangers de SCPI est potentiellement intéressante mais techniquement plus complexe que celle des revenus français.',
    'Le bon réflexe est de raisonner pays par pays à partir de la fiche fiscale et des conventions, sans généralisation.',
    'Une SCPI européenne reste d\'abord un investissement immobilier : qualité des actifs, valeurs, liquidité et gouvernance doivent rester prioritaires.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'un revenu étranger de SCPI ?',
      answer: 'C\'est un revenu provenant d\'un actif immobilier situé hors de France et distribué à l\'associé par la SCPI.',
    },
    {
      question: 'Les revenus étrangers sont-ils imposés deux fois ?',
      answer: 'Les conventions fiscales organisent l\'élimination de la double imposition. Le mécanisme exact dépend du pays et du revenu concerné.',
    },
    {
      question: 'Le crédit d\'impôt est-il toujours égal à l\'impôt payé à l\'étranger ?',
      answer: 'Non. Certaines conventions prévoient un crédit égal à l\'impôt français correspondant au revenu étranger ; d\'autres retiennent une autre méthode.',
    },
    {
      question: 'Qu\'est-ce que le taux effectif ?',
      answer: 'C\'est un mécanisme dans lequel le revenu étranger peut être exonéré d\'IR français mais reste pris en compte pour déterminer le taux applicable aux autres revenus du foyer.',
    },
    {
      question: 'Les prélèvements sociaux s\'appliquent-ils toujours ?',
      answer: 'Il n\'existe pas de réponse unique pour tous les revenus étrangers. Le traitement doit être vérifié pour le flux et la convention concernés.',
    },
    {
      question: 'Les SCPI européennes sont-elles fiscalement meilleures ?',
      answer: 'Pas automatiquement. L\'avantage éventuel dépend du pays, de la convention, du foyer fiscal et des risques du support.',
    },
    {
      question: 'Comment déclarer les revenus étrangers ?',
      answer: 'La fiche fiscale annuelle de la société de gestion sert de base. Les formulaires et reports doivent ensuite être vérifiés selon les instructions fiscales de l\'année.',
    },
    {
      question: 'Comment MaximusSCPI analyse les revenus étrangers ?',
      answer: 'MaximusSCPI ventile les revenus par pays, distingue les mécanismes conventionnels et sépare ce qui est certain de ce qui doit être vérifié avant de calculer un rendement net.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur exposition géographique',
}
