import type { ScpiEducationalPageConfig } from './shared'

export const assuranceVieScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-assurance-vie',
  badge: 'Enveloppe d\'investissement',
  h1: 'SCPI en assurance-vie : avantages, limites et frais à analyser',
  heroSubtitle:
    'Loger des SCPI dans un contrat d\'assurance-vie peut présenter un intérêt fiscal et administratif, mais l\'investisseur doit analyser les frais du contrat, la part du rendement reversée, le choix limité de SCPI disponibles et les conditions de liquidité propres à l\'assurance-vie.',
  seoTitle: 'SCPI en assurance-vie : fiscalité, frais, rendement et limites',
  seoDescription:
    'Comprenez l\'intérêt des SCPI en assurance-vie : fiscalité, liquidité, frais du contrat, choix limité, rendement reversé et critères à comparer avant d\'investir.',
  shortAnswerTitle: 'Pourquoi des SCPI en assurance-vie ?',
  shortAnswer:
    'L\'assurance-vie permet de détenir des SCPI sous forme d\'unités de compte (UC) dans un cadre fiscal et successoral spécifique. Les revenus sont capitalisés dans le contrat et imposés uniquement lors des rachats, selon la fiscalité propre à l\'assurance-vie. En contrepartie, l\'investisseur ne détient pas directement les parts, paie des frais de gestion UC en plus des frais de la SCPI, et subit un choix de SCPI limité par l\'assureur.',
  keyMessage:
    'L\'assurance-vie peut améliorer le cadre fiscal, mais elle ne transforme pas une mauvaise SCPI en bon investissement.',
  definitionParagraphs: [
    'L\'assurance-vie est un contrat d\'épargne qui permet d\'investir sur des supports en euros et en unités de compte (UC). Les SCPI peuvent être proposées comme UC : l\'assureur achète des parts pour le compte du contractant, qui reste propriétaire des actifs dans le cadre juridique du contrat.',
    'La fiscalité de l\'assurance-vie est spécifique : les revenus des SCPI sont capitalisés dans le contrat sans imposition immédiate. L\'impôt sur les plus-values et les revenus s\'applique uniquement lors des rachats, avec un abattement fiscal renforcé après 8 ans de détention (4 600 € par an pour une personne seule, 9 200 € pour un couple).',
    'L\'assureur prélève des frais de gestion sur les UC, généralement entre 0,5 % et 1 % par an, en sus des frais de gestion de la SCPI elle-même (10 % à 12 % des loyers perçus). Ces frais cumulés réduisent le rendement net reversé à l\'investisseur.',
    'Le rendement des SCPI n\'est pas intégralement reversé dans l\'assurance-vie : l\'assureur conserve une partie des loyers pour constituer des provisions ou couvrir des frais. Le taux de reversement — parfois appelé « rendement du fonds » — diffère du TDVM brut de la SCPI.',
    'Le choix de SCPI dans un contrat d\'assurance-vie est limité par l\'assureur. L\'investisseur ne peut sélectionner que les SCPI référencées dans son contrat, ce qui réduit les possibilités de diversification par rapport à un investissement en direct.',
    'La liquidité dépend du contrat : l\'arbitrage vers le fonds euros ou le rachat total/partiel est généralement possible sous quelques jours, contrairement au marché secondaire des SCPI en direct. Cette liquidité apparente ne garantit pas la valeur de rachat, qui fluctue selon le prix de souscription de la SCPI.',
    'L\'intérêt successoral de l\'assurance-vie est connu : les capitaux transmis bénéficient d\'un abattement de 152 500 € par bénéficiaire (sous conditions), ce qui peut être un critère de choix pour les investisseurs orientés transmission.',
  ],
  tableTitle: 'SCPI en direct vs assurance-vie vs démembrement',
  tableRows: [
    {
      level: 'Fiscalité',
      advantage:
        'Direct : imposition des revenus à la TMI + PS. Assurance-vie : capitalisation sans impôt, fiscalité aux rachats. Démembrement : pas de revenus.',
      vigilance:
        'Comparer le rendement net selon la TMI et le mode de détention.',
    },
    {
      level: 'Frais',
      advantage:
        'Direct : souscription + gestion SCPI. Assurance-vie : souscription SCPI + gestion UC + gestion contrat. Démembrement : souscription + gestion.',
      vigilance:
        'Les frais UC de l\'assurance-vie s\'ajoutent à ceux de la SCPI.',
    },
    {
      level: 'Choix de SCPI',
      advantage:
        'Direct : large choix. Assurance-vie : limité aux SCPI référencées. Démembrement : selon offres disponibles.',
      vigilance:
        'Vérifier la liste des UC avant de souscrire un contrat.',
    },
    {
      level: 'Liquidité',
      advantage:
        'Direct : marché secondaire (délais 2-6 mois). Assurance-vie : arbitrage ou rachat sous quelques jours. Démembrement : limité.',
      vigilance:
        'La liquidité du contrat ne garantit pas la valeur de rachat.',
    },
    {
      level: 'Revenus',
      advantage:
        'Direct : distributions trimestrielles imposables. Assurance-vie : capitalisation, rachat possible. Démembrement : aucun pendant la période.',
      vigilance:
        'Adapter le mode au besoin de revenus immédiat ou différé.',
    },
    {
      level: 'Horizon recommandé',
      advantage:
        'Direct : 8-10 ans minimum. Assurance-vie : 8 ans minimum (avantage fiscal). Démembrement : 5-15 ans.',
      vigilance:
        'Chaque mode a un horizon cohérent différent.',
    },
    {
      level: 'Transmission',
      advantage:
        'Direct : droits de succession. Assurance-vie : abattement 152 500 €/bénéficiaire. Démembrement : droits selon valeur nue-propriété.',
      vigilance:
        'La transmission est un critère à part entière dans le choix du mode.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. La fiscalité et les frais réels dépendent du contrat d\'assurance-vie, de la SCPI et de la situation personnelle.',
  criteriaTitle: 'Critères à croiser pour les SCPI en assurance-vie',
  criteriaCards: [
    { title: 'Frais du contrat UC', text: 'Des frais de gestion UC élevés (1 % ou plus) réduisent significativement le rendement net reversé sur la durée.' },
    { title: 'Taux de reversement', text: 'Vérifier quel pourcentage des loyers est effectivement reversé par l\'assureur. Le TDVM brut et le rendement du contrat diffèrent.' },
    { title: 'Choix de SCPI', text: 'Un contrat pauvre en SCPI limite la diversification. Comparer la liste des UC avant de choisir le contrat.' },
    { title: 'Fiscalité du rachat', text: 'La fiscalité s\'applique à la sortie. Selon la TMI et l\'ancienneté, l\'impôt peut varier fortement.' },
    { title: 'TOF de la SCPI', text: 'Même en assurance-vie, la qualité locative de la SCPI sous-jacente reste déterminante pour la régularité des distributions.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence sa capacité à maintenir des distributions régulières, y compris dans l\'assurance-vie.' },
    { title: 'Endettement', text: 'Une SCPI endettée dans un contrat d\'assurance-vie conserve le même risque de taux qu\'en direct.' },
    { title: 'Horizon', text: 'L\'avantage fiscal de l\'assurance-vie (abattement après 8 ans) incite à un horizon long pour optimiser le rendement net.' },
  ],
  commonErrors: [
    'Croire que l\'assurance-vie améliore le rendement de la SCPI.',
    'Ignorer les frais de gestion UC qui s\'ajoutent aux frais de la SCPI.',
    'Ne pas vérifier le taux de reversement des loyers par l\'assureur.',
    'Choisir un contrat uniquement sur la réputation sans vérifier la liste des SCPI disponibles.',
    'Oublier que la liquidité du contrat ne garantit pas la valeur de rachat.',
    'Confondre avantage fiscal de l\'assurance-vie et qualité de la SCPI sous-jacente.',
  ],
  practicalCases: [
    {
      title: 'SCPI en assurance-vie — TMI 30 %, contrat 8 ans',
      text: 'Un investisseur en TMI 30 % place une SCPI dans une assurance-vie avec 0,75 % de frais UC. Le TDVM brut de la SCPI est de 5 %, mais le rendement net après frais du contrat et fiscalité du rachat peut être plus favorable qu\'en direct, surtout après 8 ans. Simulation pédagogique : comparer le rendement net selon les deux modes.',
    },
    {
      title: 'SCPI en assurance-vie — choix limité, frais élevés',
      text: 'Un contrat d\'assurance-vie propose 4 SCPI avec des frais UC à 1 %. Les SCPI disponibles affichent un TDVM inférieur à celui des SCPI accessibles en direct. L\'investisseur doit arbitrer entre l\'avantage fiscal du contrat et le rendement potentiellement plus élevé en direct.',
    },
    {
      title: 'SCPI en assurance-vie — transmission et abattement',
      text: 'Un investisseur de 65 ans place des SCPI dans son assurance-vie pour préparer la transmission. L\'abattement de 152 500 € par bénéficiaire peut réduire les droits de succession. L\'analyse de la SCPI sous-jacente reste essentielle malgré l\'objectif successoral.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI compare les SCPI en direct, en assurance-vie et en démembrement dans son comparateur et ses contenus pédagogiques. L\'objectif est d\'éclairer les différences de fiscalité, de frais et de liquidité sans recommander un mode plutôt qu\'un autre.',
    'La première étape consiste à évaluer le rendement net selon le mode de détention : en direct, les revenus sont imposés chaque année ; en assurance-vie, ils sont capitalisés avec une fiscalité différée.',
    'La deuxième étape intègre les frais UC de l\'assurance-vie, qui s\'ajoutent aux frais de la SCPI. Un contrat à frais élevés peut neutraliser l\'avantage fiscal.',
    'La troisième étape vérifie la liste des SCPI disponibles et leur qualité intrinsèque via les indicateurs du comparateur.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler le rendement net et l\'impact fiscal selon votre TMI, votre contrat et votre horizon.',
  ],
  conclusionParagraphs: [
    'L\'assurance-vie est un cadre intéressant pour détenir des SCPI, à condition d\'analyser les frais UC, le taux de reversement, le choix limité de SCPI et la fiscalité des rachats. L\'avantage fiscal ne doit pas occulter la qualité de la SCPI sous-jacente.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, comparez les contrats d\'assurance-vie disponibles, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI et à votre horizon.',
  ],
  faqItems: [
    {
      question: 'Peut-on acheter des SCPI en assurance-vie ?',
      answer: 'Oui, sous forme d\'unités de compte (UC). L\'assureur achète les parts pour le compte du contractant, qui ne détient pas directement les parts mais les droits liés au contrat.',
    },
    {
      question: 'Est-ce fiscalement plus intéressant ?',
      answer: 'Cela dépend de la TMI, de l\'ancienneté du contrat et des frais UC. L\'assurance-vie permet une capitalisation sans imposition immédiate et un abattement après 8 ans. Il faut comparer le rendement net avec celui d\'un investissement en direct.',
    },
    {
      question: 'Quels frais faut-il regarder ?',
      answer: 'Frais de gestion UC (0,5 % à 1 % par an), frais du contrat (versement, arbitrage, rachat), et frais de souscription de la SCPI elle-même. Les frais cumulés peuvent réduire le rendement reversé.',
    },
    {
      question: 'Le rendement est-il reversé à 100 % ?',
      answer: 'Non. L\'assureur prélève des frais de gestion UC sur les loyers perçus. Le taux de reversement varie selon les contrats et les SCPI. Le rendement du contrat diffère du TDVM brut de la SCPI.',
    },
    {
      question: 'La liquidité est-elle garantie ?',
      answer: 'L\'arbitrage ou le rachat est généralement possible sous quelques jours, mais la valeur de rachat dépend du prix de souscription de la SCPI au moment de la sortie. La liquidité du contrat ne garantit pas la valeur de rachat.',
    },
    {
      question: 'Quelle différence avec les SCPI en direct ?',
      answer: 'En direct, l\'investisseur détient les parts, perçoit les revenus imposables chaque année et peut choisir librement ses SCPI. En assurance-vie, les revenus sont capitalisés, la fiscalité est différée, mais les frais UC s\'ajoutent et le choix est limité.',
    },
    {
      question: 'Quelle différence avec le démembrement ?',
      answer: 'Le démembrement supprime les revenus temporairement mais permet un prix d\'entrée décoté. L\'assurance-vie capitalise les revenus sans décote, avec une fiscalité différée et des frais récurrents.',
    },
    {
      question: 'Comment MaximusSCPI compare les SCPI en assurance-vie ?',
      answer: 'Le comparateur et les contenus pédagogiques présentent les SCPI avec leurs indicateurs clés. L\'analyse du mode de détention (direct, assurance-vie, démembrement) est proposée comme une piste à approfondir selon la situation de l\'investisseur.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI',
}
