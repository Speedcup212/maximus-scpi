import type { ScpiEducationalPageConfig } from './shared'

export const endettementScpiConfig: ScpiEducationalPageConfig = {
  path: '/endettement-scpi',
  badge: 'Critère de risque',
  h1: 'Endettement SCPI : comment analyser le niveau de dette avant d\'investir',
  heroSubtitle:
    'L\'endettement peut être un levier de croissance pour une SCPI, mais aussi un facteur de risque en période de hausse des taux. Comprendre le niveau, le coût, la maturité et la nature (fixe ou variable) de la dette est essentiel avant toute souscription. L\'endettement doit être croisé avec le TOF, la qualité des actifs et le contexte de taux.',
  seoTitle: 'Endettement SCPI : définition, seuils, risques et analyse',
  seoDescription:
    'Analyse complète de l\'endettement des SCPI : définition, seuils (faible, modéré, élevé), coût de la dette, maturité, taux fixe vs variable, effet de levier, risques, exemples chiffrés, cas pratiques et méthode d\'analyse MaximusSCPI.',
  shortAnswerTitle: 'Pourquoi analyser l\'endettement d\'une SCPI ?',
  shortAnswer:
    'Une SCPI peut s\'endetter pour financer des acquisitions, accélérer la croissance de son patrimoine ou optimiser sa structure financière. L\'endettement n\'est ni intrinsèquement positif ni négatif : tout dépend de son niveau, de son coût, de ses échéances et de la qualité des actifs financés. En période de taux élevés, une dette importante peut peser sur les revenus distribuables et sur la valorisation du patrimoine. Un endettement faible protège des chocs de taux mais peut limiter la vitesse de croissance. L\'analyse de l\'endettement doit toujours être croisée avec le TOF et le rendement.',
  keyMessage:
    'L\'endettement d\'une SCPI n\'est ni bon ni mauvais en soi. Il dépend de son niveau, de son coût, de sa maturité, de sa nature (fixe ou variable) et de la qualité des actifs financés.',
  definitionParagraphs: [
    'L\'endettement d\'une SCPI correspond aux emprunts contractés par la société pour financer l\'acquisition ou la rénovation d\'actifs immobiliers. Contrairement à un crédit immobilier personnel, la dette est portée par la SCPI elle-même et impacte l\'ensemble des associés.',
    'Le ratio d\'endettement est généralement exprimé en pourcentage de la valeur du patrimoine ou de la capitalisation. Il est publié dans les bulletins trimestriels et rapports annuels des sociétés de gestion, aux côtés du coût moyen de la dette et de son échéancier.',
    'La dette peut être à taux fixe ou variable. Un emprunt à taux variable expose la SCPI aux variations des taux directeurs : en période de hausse, le coût du crédit augmente et peut réduire les revenus distribuables. Un emprunt à taux fixe offre une visibilité plus grande mais peut avoir été contracté à un niveau élevé.',
    'La maturité de la dette est un critère souvent sous-estimé. Des emprunts concentrés sur les prochaines années créent un risque de refinancement : la SCPI devra renégocier ses conditions dans un contexte de marché potentiellement moins favorable. Une dette bien lissée dans le temps réduit ce risque.',
    'L\'endettement peut amplifier les performances en période favorable : si les loyers progressent plus vite que le coût de la dette, l\'effet de levier profite aux associés. À l\'inverse, en cas de baisse des loyers ou de vacance, la charge de la dette pèse davantage sur les revenus.',
    'Certaines SCPI affichent un endettement nul ou très faible par choix stratégique. Cela réduit le risque financier mais peut limiter la vitesse de croissance du patrimoine si la société de gestion privilégie les acquisitions cash financées par la collecte.',
    'La capacité de remboursement de la SCPI dépend de la régularité de ses revenus locatifs et de son TOF. Une SCPI endettée avec un TOF faible présente un risque plus élevé car elle dispose de moins de marges pour couvrir sa dette.',
  ],
  tableTitle: 'Comment interpréter le niveau d\'endettement ?',
  tableRows: [
    {
      level: '0 % à 10 %',
      advantage:
        'Endettement faible. Risque financier limité, visibilité accrue sur les revenus distribuables. Pas de sensibilité aux taux.',
      vigilance:
        'Croissance patrimoniale potentiellement plus lente si la collecte ne suffit pas à financer les acquisitions. Rendement parfois modéré.',
    },
    {
      level: '10 % à 25 %',
      advantage:
        'Endettement modéré. Levier financier maîtrisé, souvent compatible avec une stratégie de croissance équilibrée.',
      vigilance:
        'Surveiller le coût de la dette et la qualité des actifs financés par emprunt. Vérifier la part de dette à taux variable.',
    },
    {
      level: '25 % à 35 %',
      advantage:
        'Endettement significatif. Capacité d\'accélération des acquisitions si le contexte de taux est favorable et les actifs de qualité.',
      vigilance:
        'Sensibilité accrue aux hausses de taux et aux baisses de loyers. Analyser la maturité, la répartition fixe/variable et le TOF.',
    },
    {
      level: 'Plus de 35 %',
      advantage:
        'Levier maximal. Potentiel de croissance rapide du patrimoine en période très favorable.',
      vigilance:
        'Vigilance renforcée. Risque de compression des distributions, de cession d\'actifs sous pression ou de baisse de valorisation en cas de tension sur les taux.',
    },
  ],
  tableNote:
    'Ces seuils sont des repères indicatifs. Le contexte de taux, la qualité des actifs financés, la politique de couverture et la stratégie de la société de gestion modifient la lecture du ratio d\'endettement.',
  criteriaTitle: 'Critères à croiser avec l\'endettement',
  criteriaCards: [
    { title: 'Coût moyen de la dette', text: 'Un taux d\'emprunt élevé réduit directement les revenus distribuables, surtout si les loyers stagnent ou baissent.' },
    { title: 'Maturité de la dette', text: 'Des échéances concentrées créent un risque de refinancement à des conditions potentiellement moins favorables.' },
    { title: 'Taux fixe ou variable', text: 'La part de dette variable détermine la sensibilité de la SCPI aux variations des taux directeurs. Plus elle est élevée, plus le risque de taux est fort.' },
    { title: 'TOF', text: 'Un TOF faible combiné à un endettement élevé aggrave le risque : moins de loyers pour couvrir la dette et ses intérêts.' },
    { title: 'Rendement', text: 'Un rendement élevé peut masquer une pression sur la dette si les distributions ne sont pas soutenables sur la durée.' },
    { title: 'Capitalisation', text: 'Une grande SCPI peut absorber une dette plus importante qu\'une structure de petite taille, grâce à une meilleure mutualisation.' },
    { title: 'Collecte nette', text: 'Une collecte nette positive peut aider à désendetter ou à financer de nouvelles acquisitions sans recourir à l\'emprunt.' },
    { title: 'Liquidité', text: 'Une SCPI très endettée peut être contrainte de céder des actifs en cas de tension sur le refinancement ou de baisse des loyers.' },
    { title: 'Décote / surcote', text: 'Le marché peut sanctionner une SCPI perçue comme trop endettée par une décote persistante sur le prix de part.' },
    { title: 'Stratégie d\'acquisition', text: 'Des acquisitions cohérentes et rentables justifient un endettement modéré ; des achats opportunistes ou mal sélectionnés non.' },
  ],
  commonErrors: [
    'Écarter toute SCPI endettée sans analyser le coût et la maturité de la dette.',
    'Considérer qu\'un endettement faible garantit un bon rendement futur.',
    'Ignorer la part de dette à taux variable en période de hausse des taux.',
    'Ne pas croiser endettement et TOF : une dette élevée avec des vacances locatives est particulièrement risquée.',
    'Comparer des ratios d\'endettement sans tenir compte des méthodes de calcul différentes entre sociétés de gestion.',
    'Oublier que l\'endettement peut augmenter rapidement après une vague d\'acquisitions non encore intégrées dans les ratios.',
    'Négliger l\'impact de la dette sur la valorisation en cas de baisse des marchés immobiliers.',
  ],
  practicalCases: [
    {
      title: 'SCPI faiblement endettée — croissance limitée',
      text: 'Avec un endettement de 5 %, une SCPI mature affiche un TOF stable et des distributions régulières, mais sa capitalisation progresse lentement. La prudence financière limite le risque, mais la dynamique patrimoniale reste modeste. Simulation pédagogique : profil défensif, pas de promesse de performance.',
    },
    {
      title: 'SCPI dynamique — endettement modéré maîtrisé',
      text: 'Un ratio de 22 % finance l\'acquisition d\'actifs logistiques en zone d\'activité dynamique. Le TOF reste supérieur à 95 % et le coût moyen de la dette est inférieur au rendement locatif des nouveaux actifs. Simulation pédagogique : l\'effet de levier semble documenté, à vérifier dans le rapport annuel.',
    },
    {
      title: 'SCPI avec dette à refinancer',
      text: 'À 38 % d\'endettement avec 60 % de dette à taux variable, une SCPI subit la hausse des taux depuis 18 mois. Les distributions ont légèrement baissé et la décote s\'est creusée. Simulation pédagogique : la dette amplifie les difficultés en période défavorable et le risque de refinancement est réel.',
    },
    {
      title: 'SCPI faiblement endettée avec forte collecte',
      text: 'Une SCPI à 3 % d\'endettement connaît une collecte record de 200 M€ par an. Sans recours à l\'emprunt, elle investit dans des actifs de qualité grâce à sa collecte. Simulation pédagogique : la croissance sans dette est possible quand la collecte est dynamique et la stratégie d\'acquisition rigoureuse.',
    },
    {
      title: 'SCPI en croissance rapide — endettement qui augmente',
      text: 'Une SCPI est passée de 12 % à 28 % d\'endettement en deux ans suite à des acquisitions massives. Si les actifs achetés sont de qualité et le TOF maintenu, l\'endettement peut rester maîtrisé. Simulation pédagogique : suivre l\'évolution de l\'endettement est aussi important que son niveau absolu.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre l\'endettement dans le comparateur pour permettre une lecture croisée avec le TOF, le rendement, la capitalisation et la décote ou surcote. L\'objectif est d\'identifier les SCPI dont le profil de risque financier mérite une attention particulière.',
    'La première étape consiste à situer le ratio dans les fourchettes indicatives, puis à vérifier le coût moyen de la dette et la répartition fixe/variable dans les documents réglementaires.',
    'La deuxième étape analyse la cohérence entre endettement et stratégie d\'acquisition : la dette finance-t-elle des actifs de qualité ou compense-t-elle une collecte insuffisante ?',
    'La troisième étape croise l\'endettement avec le TOF et la décote. Une SCPI endettée avec un TOF en baisse et une décote qui se creuse constitue un signal de vigilance à approfondir avec un conseiller.',
    'Enfin, l\'analyse doit intégrer le contexte macro-économique : niveau des taux, politique monétaire, cycle immobilier. Un endettement acceptable dans un contexte de taux bas peut devenir problématique en période de hausse des taux.',
  ],
  conclusionParagraphs: [
    'L\'endettement est un critère de risque financier incontournable dans l\'analyse d\'une SCPI. Son niveau doit être lu avec le coût de la dette, sa maturité, la part de taux variable, le contexte de taux et la qualité locative du patrimoine.',
    'Sources et points à vérifier : bulletins trimestriels et rapports annuels des sociétés de gestion, notes d\'information. Vérifier le coût moyen de la dette, la répartition fixe/variable et l\'échéancier.',
    'Le comparateur MaximusSCPI vous aide à structurer cette pré-orientation. Pour une analyse adaptée à votre horizon et à votre tolérance au risque, un échange avec un conseiller permet d\'approfondir les arbitrages patrimoniaux.',
  ],
  faqItems: [
    {
      question: 'Une SCPI peut-elle s\'endetter ?',
      answer: 'Oui. Les SCPI peuvent contracter des emprunts pour financer l\'acquisition ou la rénovation d\'actifs immobiliers. La dette est portée par la société et impacte l\'ensemble des associés.',
    },
    {
      question: 'Quel niveau d\'endettement est acceptable ?',
      answer: 'Il n\'existe pas de seuil universel. Un endettement de 10 % à 25 % est fréquent et peut être cohérent avec une stratégie de croissance équilibrée. Au-delà de 35 %, la vigilance est renforcée.',
    },
    {
      question: 'L\'endettement augmente-t-il le rendement ?',
      answer: 'Il peut le faire en période favorable (effet de levier). Mais en cas de baisse des loyers ou de hausse des taux, l\'endettement peut réduire les distributions. Le rendement passé ne garantit pas le rendement futur.',
    },
    {
      question: 'Quels sont les risques d\'une SCPI trop endettée ?',
      answer: 'Compression des revenus distribuables, risque de refinancement, cession d\'actifs sous pression, décote sur le marché secondaire et baisse de la valeur de reconstitution.',
    },
    {
      question: 'Comment la hausse des taux impacte-t-elle les SCPI ?',
      answer: 'Les SCPI avec une part importante de dette variable voient leur coût de financement augmenter. Les SCPI fortement endettées peuvent voir leur valorisation patrimoniale ajustée à la baisse.',
    },
    {
      question: 'Où trouver le niveau d\'endettement ?',
      answer: 'Dans les bulletins trimestriels, rapports annuels et notes d\'information des sociétés de gestion. Le comparateur MaximusSCPI centralise cet indicateur.',
    },
    {
      question: 'Pourquoi croiser endettement et TOF ?',
      answer: 'Le TOF mesure la capacité à générer des loyers ; l\'endettement mesure la charge financière. Une SCPI endettée avec un TOF faible a moins de revenus pour couvrir sa dette.',
    },
    {
      question: 'Qu\'est-ce que la maturité de la dette ?',
      answer: 'C\'est l\'échéancier des remboursements. Une dette concentrée sur les prochaines années crée un risque de refinancement. Une dette bien lissée dans le temps réduit ce risque.',
    },
    {
      question: 'Taux fixe ou variable : quelle différence ?',
      answer: 'Le taux fixe offre une visibilité sur le coût de la dette. Le taux variable expose aux variations des taux directeurs. Une SCPI avec une forte part de dette variable est plus sensible aux hausses de taux.',
    },
    {
      question: 'Comment MaximusSCPI analyse l\'endettement ?',
      answer: 'L\'endettement est affiché dans le comparateur et croisé visuellement avec le TOF, le rendement, la capitalisation et la décote, dans une logique pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer l\'endettement avec le rendement',
}
