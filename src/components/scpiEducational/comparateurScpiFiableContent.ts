import type { ScpiEducationalPageConfig } from './shared'

export const comparateurScpiFiableConfig: ScpiEducationalPageConfig = {
  path: '/comparateur-scpi-fiable',
  badge: 'Outil d\'analyse',
  h1: 'Comparateur SCPI fiable : quels critères vérifier ?',
  heroSubtitle:
    'Un comparateur SCPI fiable ne doit pas décider à la place de l\'investisseur. Il doit rendre les critères lisibles pour faciliter une analyse structurée : données claires, indicateurs multiples, transparence sur les sources et limites explicites.',
  seoTitle: 'Comparateur SCPI fiable : méthode, données et critères d\'analyse',
  seoDescription:
    'Découvrez comment reconnaître un comparateur SCPI fiable : données, frais, rendement, TOF, capitalisation, décote, endettement, fiscalité, limites et transparence.',
  shortAnswerTitle: 'Qu\'est-ce qu\'un comparateur SCPI fiable ?',
  shortAnswer:
    'Un comparateur SCPI fiable présente plusieurs indicateurs (rendement, TOF, capitalisation, endettement, décote/surcote, frais, liquidité), source ses données (rapports annuels, ASPIM, sociétés de gestion), met à jour régulièrement ses informations, explique ses limites et ne formule pas de recommandation automatisée. Il aide à structurer l\'analyse sans se substituer à un conseil personnalisé.',
  keyMessage:
    'Un comparateur SCPI fiable ne doit pas décider à la place de l\'investisseur. Il doit rendre les critères lisibles pour faciliter une analyse structurée.',
  definitionParagraphs: [
    'Un comparateur SCPI est un outil en ligne qui agrège et présente les indicateurs clés de différentes SCPI pour faciliter leur comparaison. Il peut inclure le rendement, le TOF, la capitalisation, l\'endettement, les frais, la décote ou surcote sur valeur de reconstitution, et d\'autres critères.',
    'Pour être fiable, un comparateur doit sourcer ses données : les indicateurs doivent provenir des documents réglementaires (rapport annuel, bulletin trimestriel, note d\'information, fiche ASPIM). Les données doivent être mises à jour régulièrement.',
    'Un bon comparateur ne se limite pas à un seul indicateur. Il présente plusieurs critères pour permettre une analyse multicritère. Il explique également la signification de chaque indicateur et ses limites.',
    'La transparence est essentielle : l\'outil doit indiquer clairement s\'il est financé par des commissions, des partenariats ou des abonnements. Il doit distinguer les données objectives des interprétations.',
    'Un comparateur fiable ne propose pas de \"meilleure SCPI\" automatique ni de classement unique. Il laisse l\'utilisateur construire sa propre analyse à partir des indicateurs présentés.',
    'Enfin, l\'outil doit rappeler qu\'il ne constitue pas un conseil personnalisé et que toute décision d\'investissement doit être validée par un conseiller certifié.',
  ],
  tableTitle: 'Comparateur SCPI : ce qu\'il doit apporter',
  tableRows: [
    {
      level: 'Données claires',
      advantage:
        'Les indicateurs sont présentés de manière compréhensible, avec des définitions accessibles.',
      vigilance:
        'Méfiance si les indicateurs sont présentés sans explication ou avec des termes techniques non définis.',
    },
    {
      level: 'Indicateurs multiples',
      advantage:
        'Rendement, TOF, capitalisation, endettement, frais, décote/surcote, liquidité sont affichés.',
      vigilance:
        'Un comparateur avec un seul indicateur (rendement) est incomplet et potentiellement trompeur.',
    },
    {
      level: 'Sources transparentes',
      advantage:
        'L\'origine des données est indiquée : rapports annuels, ASPIM, sociétés de gestion.',
      vigilance:
        'Si les sources ne sont pas mentionnées, la fiabilité des données ne peut pas être vérifiée.',
    },
    {
      level: 'Mise à jour régulière',
      advantage:
        'Les données sont actualisées au minimum chaque trimestre ou semestre.',
      vigilance:
        'Des données obsolètes peuvent induire en erreur sur la situation récente de la SCPI.',
    },
    {
      level: 'Limites explicites',
      advantage:
        'L\'outil indique ce qu\'il ne fait pas : pas de recommandation, pas de conseil personnalisé.',
      vigilance:
        'Un comparateur qui recommande des SCPI sans recueil d\'information peut être non conforme MIF2.',
    },
    {
      level: 'Absence de classement unique',
      advantage:
        'Plusieurs critères sont disponibles sans pondération imposée.',
      vigilance:
        'Un classement unique basé sur un seul indicateur est réducteur.',
    },
  ],
  tableNote:
    'Ces critères permettent d\'évaluer la fiabilité d\'un comparateur SCPI. Aucun outil ne remplace un conseil personnalisé.',
  criteriaTitle: 'Points de vigilance sur un comparateur SCPI',
  criteriaCards: [
    { title: 'Données sourcées', text: 'Vérifier si les données proviennent des documents réglementaires ou de sources non vérifiables.' },
    { title: 'Mise à jour', text: 'Une date de mise à jour récente est un gage de sérieux. Se méfier des données anciennes.' },
    { title: 'Indépendance', text: 'Vérifier si le comparateur est financé par des commissions de sociétés de gestion, ce qui peut biaiser la présentation.' },
    { title: 'Nombre de critères', text: 'Plusieurs indicateurs valent mieux qu\'un seul. Un comparateur limité au rendement est insuffisant.' },
    { title: 'Transparence', text: 'L\'outil doit expliquer sa méthodologie, ses sources et ses limites.' },
    { title: 'Conformité', text: 'Un comparateur conforme MIF2 ne recommande pas de SCPI sans recueil d\'information préalable.' },
  ],
  commonErrors: [
    'Croire qu\'un comparateur peut recommander une SCPI à votre place.',
    'Utiliser un comparateur qui n\'affiche que le rendement.',
    'Ignorer la date de mise à jour des données.',
    'Ne pas vérifier si les sources sont fiables.',
    'Confondre comparaison et conseil personnalisé.',
  ],
  practicalCases: [
    {
      title: 'Comparateur A — complet et transparent',
      text: 'Un comparateur affiche 12 indicateurs, sourcés des rapports annuels, mis à jour trimestriellement. Il explique chaque indicateur et précise ses limites. L\'utilisateur peut filtrer selon ses critères. Simulation pédagogique : l\'outil aide à structurer l\'analyse.',
    },
    {
      title: 'Comparateur B — limité au rendement',
      text: 'Un comparateur n\'affiche que le TDVM. Les SCPI en tête de classement sont mises en avant. Aucune information sur le TOF, l\'endettement ou les frais. Simulation pédagogique : ce type d\'outil peut induire en erreur.',
    },
    {
      title: 'Investisseur — utilisation responsable',
      text: 'Un investisseur utilise un comparateur pour identifier 4 SCPI potentielles, puis valide son analyse avec son conseiller. Simulation pédagogique : l\'outil est utilisé comme support, pas comme décision.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI propose un comparateur qui affiche plusieurs indicateurs clés : rendement, TOF, capitalisation, endettement, décote/surcote, frais. Chaque indicateur est présenté avec sa source et sa signification.',
    'Le comparateur MaximusSCPI ne formule pas de recommandation personnalisée. Il est conçu comme un outil d\'aide à l\'analyse, pas comme un décisionnaire.',
    'MaximusSCPI rappelle dans chaque utilisation que la comparaison ne remplace pas un conseil personnalisé conforme MIF2.',
  ],
  conclusionParagraphs: [
    'Un comparateur SCPI fiable est un outil précieux pour structurer l\'analyse, mais il ne remplace pas une démarche patrimoniale complète. La transparence, la pluralité des indicateurs et l\'absence de recommandation automatisée sont les marques d\'un outil sérieux.',
    'Utilisez le comparateur MaximusSCPI comme point de départ de votre analyse, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'À quoi sert un comparateur SCPI ?',
      answer: 'À visualiser et comparer les indicateurs clés de plusieurs SCPI pour faciliter l\'analyse et la pré-orientation.',
    },
    {
      question: 'Quels critères doit afficher un comparateur fiable ?',
      answer: 'Rendement, TOF, capitalisation, endettement, frais, décote/surcote, liquidité. Au moins 5-6 indicateurs pour une analyse pertinente.',
    },
    {
      question: 'Un comparateur peut-il recommander une SCPI ?',
      answer: 'Non. Un comparateur conforme MIF2 ne recommande pas de SCPI sans recueil d\'information patrimoniale préalable.',
    },
    {
      question: 'Pourquoi comparer plusieurs indicateurs ?',
      answer: 'Un seul indicateur, comme le rendement, ne reflète pas la qualité d\'une SCPI. Le croisement des critères évite les biais.',
    },
    {
      question: 'Les données doivent-elles être sourcées ?',
      answer: 'Oui. Les données doivent provenir des documents réglementaires (rapport annuel, bulletin, fiche ASPIM) pour être fiables.',
    },
    {
      question: 'Quelle différence entre comparaison et conseil ?',
      answer: 'La comparaison présente des données objectives. Le conseil personnalisé analyse la situation de l\'investisseur pour formuler une préconisation adaptée.',
    },
    {
      question: 'Comment MaximusSCPI classe les SCPI ?',
      answer: 'Le comparateur affiche plusieurs indicateurs sans classement unique. L\'utilisateur peut filtrer selon ses critères.',
    },
    {
      question: 'Pourquoi valider avec un conseiller ?',
      answer: 'Un conseiller prend en compte la situation patrimoniale, fiscale et les objectifs personnels, ce qu\'un comparateur ne peut pas faire.',
    },
  ],
  comparateurCtaLabel: 'Découvrir le comparateur SCPI MaximusSCPI',
}
