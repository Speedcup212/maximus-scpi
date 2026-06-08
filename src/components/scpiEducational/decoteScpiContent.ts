import type { ScpiEducationalPageConfig } from './shared'

export const decoteScpiConfig: ScpiEducationalPageConfig = {
  path: '/decote-valeur-reconstitution-scpi',
  badge: 'Indicateur patrimonial',
  h1: 'Décote et surcote SCPI : comprendre l\'écart avec la valeur de reconstitution',
  heroSubtitle:
    'L\'écart entre le prix de souscription et la valeur de reconstitution est un indicateur patrimonial central. Il aide à comprendre si l\'investisseur achète le patrimoine à un prix cohérent, en décote ou en surcote — sans constituer un signal suffisant à lui seul.',
  seoTitle: 'Décote SCPI et valeur de reconstitution : comprendre avant d\'investir',
  seoDescription:
    'Découvrez comment analyser la décote ou surcote d\'une SCPI par rapport à sa valeur de reconstitution, et pourquoi ce critère doit être croisé avec TOF, rendement, capitalisation et endettement.',
  shortAnswerTitle: 'Pourquoi comparer le prix de souscription à la valeur de reconstitution ?',
  shortAnswer:
    'La valeur de reconstitution estime le coût de reconstruction du patrimoine de la SCPI à un instant donné. L\'écart avec le prix de souscription — décote ou surcote — indique si l\'investisseur entre dans le capital à un prix inférieur ou supérieur à cette référence patrimoniale. Une décote peut sembler attractive mais coïncider avec un TOF faible ou un patrimoine en difficulté. Une surcote peut être acceptable si la qualité locative, la stratégie et la dynamique de collecte le justifient.',
  keyMessage:
    'Une décote n\'est pas une bonne affaire automatique. Une surcote n\'est pas forcément un signal négatif, mais elle doit être justifiée.',
  definitionParagraphs: [
    'Le prix de souscription est le prix auquel un investisseur acquiert une part de SCPI lors d\'une souscription primaire ou, selon les cas, sur le marché secondaire. Il intègre les frais de souscription et reflète la politique tarifaire de la société de gestion à un instant donné.',
    'La valeur de reconstitution (VR) estime le montant théorique nécessaire pour reconstituer le patrimoine immobilier de la SCPI : acquisition des actifs, frais annexes, travaux éventuels. Elle est calculée par l\'expert ou la société de gestion selon une méthodologie définie dans les documents réglementaires.',
    'La décote correspond à une situation où le prix de souscription est inférieur à la valeur de reconstitution. L\'investisseur achète théoriquement le patrimoine « en dessous » de sa valeur de reconstruction. La surcote est l\'inverse : le prix de souscription dépasse la valeur de reconstitution.',
    'La valeur de réalisation, lorsqu\'elle est communiquée, correspond à une estimation du prix de vente du patrimoine en cas de liquidation. Elle diffère de la valeur de reconstitution et ne doit pas être confondue avec elle. Les trois notions — prix de souscription, valeur de reconstitution, valeur de réalisation — participent à la lecture patrimoniale mais n\'ont pas la même finalité.',
    'L\'écart en pourcentage se calcule de manière classique : (prix de souscription − valeur de reconstitution) / valeur de reconstitution. Un écart négatif signale une décote, un écart positif une surcote. Ces données sont publiées trimestriellement dans les bulletins des sociétés de gestion.',
    'Une décote importante peut traduire une méfiance du marché, des difficultés locatives passées ou une stratégie de collecte agressive. Elle peut aussi refléter une opportunité si le patrimoine est solide et si la baisse de prix est temporaire. L\'analyse contextuelle est indispensable.',
  ],
  tableTitle: 'Comment interpréter l\'écart prix / valeur de reconstitution ?',
  tableRows: [
    {
      level: 'Décote > 5 %',
      advantage:
        'Point d\'attention potentiellement favorable : l\'investisseur entre peut-être sous la valeur patrimoniale de référence.',
      vigilance:
        'Vérifier les causes : TOF faible, patrimoine vieillissant, secteur en tension ou simple correction de marché ?',
    },
    {
      level: 'Écart entre −5 % et +5 %',
      advantage:
        'Zone généralement cohérente : le prix de souscription est proche de la valeur de reconstitution.',
      vigilance:
        'La cohérence tarifaire ne garantit ni le rendement futur ni la qualité locative. Croiser avec les autres critères.',
    },
    {
      level: 'Surcote > 5 %',
      advantage:
        'Peut refléter une confiance du marché dans la qualité du patrimoine ou une collecte dynamique.',
      vigilance:
        'Vigilance sur le prix d\'entrée : l\'investisseur paie une prime qui réduit la marge de sécurité à la revente.',
    },
    {
      level: 'Surcote proche de 10 %',
      advantage:
        'Peut être acceptable si le patrimoine est très qualitatif, le TOF élevé et la stratégie documentée.',
      vigilance:
        'Analyse renforcée nécessaire : justifier la prime par des éléments patrimoniaux vérifiables, pas par le seul rendement passé.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs et ne constituent pas des règles automatiques d\'achat ou de vente. La décote ou surcote doit être analysée avec le TOF, le rendement, la capitalisation, l\'endettement, la qualité du patrimoine et la politique de revalorisation du prix de part.',
  criteriaTitle: 'Critères à croiser avec la décote ou surcote',
  criteriaCards: [
    { title: 'TOF', text: 'Une décote accompagnée d\'un TOF faible peut signaler des difficultés locatives structurelles plutôt qu\'une opportunité.' },
    { title: 'Rendement', text: 'Un rendement élevé en décote peut attirer l\'attention, mais les revenus passés ne sont pas garantis et peuvent baisser.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence la liquidité secondaire et la capacité d\'absorption des chocs patrimoniaux.' },
    { title: 'Endettement', text: 'Une surcote combinée à un endettement élevé peut amplifier le risque en cas de baisse des loyers ou de hausse des taux.' },
    { title: 'Qualité du patrimoine', text: 'Localisation, état des actifs, qualité des baux et diversification locative : autant d\'éléments qui justifient ou non une surcote.' },
    { title: 'Collecte', text: 'Une collecte nette positive soutient parfois une surcote ; une collecte négative peut expliquer une décote persistante.' },
    { title: 'Secteur', text: 'Un secteur en tension (bureaux secondaires, commerces fragiles) peut entraîner une décote durable sur le marché.' },
    { title: 'Localisation', text: 'La qualité micro-économique des zones d\'implantation influence la soutenabilité de la valeur de reconstitution.' },
    { title: 'Frais de souscription', text: 'Des frais élevés aggravent une surcote : l\'investisseur paie d\'abord des frais, puis une prime sur le patrimoine.' },
    { title: 'Revalorisation du prix de part', text: 'Une politique de hausse régulière du prix de souscription peut maintenir une surcote si la VR progresse moins vite.' },
  ],
  commonErrors: [
    'Acheter une SCPI uniquement parce qu\'elle est en décote.',
    'Écarter systématiquement toute SCPI en surcote sans analyser la qualité du patrimoine.',
    'Confondre valeur de reconstitution et valeur de réalisation.',
    'Ignorer l\'évolution de la décote ou surcote sur plusieurs trimestres.',
    'Ne pas intégrer les frais de souscription dans le calcul du prix d\'entrée réel.',
    'Comparer des décotes entre SCPI de secteurs ou de zones géographiques différents sans contexte.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — décote marquée, TOF faible',
      text: 'Une SCPI affiche une décote de 8 % mais son TOF est passé sous 88 % depuis deux exercices. La décote reflète probablement une méfiance du marché liée à des vacances locatives. Simulation pédagogique : l\'écart tarifaire ne suffit pas à conclure à une opportunité sans analyse des causes.',
    },
    {
      title: 'SCPI B — surcote modérée, patrimoine qualitatif',
      text: 'Avec une surcote de 6 %, une SCPI logistique affiche un TOF supérieur à 97 %, une diversification géographique en Europe et une collecte nette positive. La prime peut se justifier par la qualité des actifs, mais l\'investisseur accepte un prix d\'entrée élevé qui limite la marge de sécurité.',
    },
    {
      title: 'SCPI C — proche de la VR, rendement stable',
      text: 'Le prix de souscription est à −2 % de la valeur de reconstitution, le TOF est stable autour de 94 % et les distributions sont régulières depuis cinq ans. La situation paraît cohérente, mais le rendement historique reste une donnée passée à croiser avec la fiscalité nette.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI affiche la décote ou surcote sur valeur de reconstitution dans le comparateur, aux côtés du TOF, du rendement, de la capitalisation et de l\'endettement. L\'objectif est de donner une lecture patrimoniale rapide, sans remplacer l\'analyse des documents réglementaires.',
    'La première étape consiste à situer la SCPI dans une des fourchettes indicatives : décote significative, zone cohérente ou surcote marquée. Cette classification est un point de départ, pas une conclusion.',
    'La deuxième étape vérifie la cohérence avec le TOF et l\'évolution de l\'écart sur plusieurs trimestres. Une décote qui se creuse peut signaler une dégradation locative ; une surcote stable peut refléter une confiance durable du marché.',
    'La troisième étape croise l\'écart tarifaire avec la qualité du patrimoine, le secteur, la localisation et l\'endettement. MaximusSCPI facilite cette pré-orientation en centralisant les indicateurs ; l\'approfondissement patrimonial relève d\'un échange personnalisé avec un conseiller.',
  ],
  conclusionParagraphs: [
    'La décote et la surcote sont des indicateurs patrimoniaux précieux pour comprendre le prix d\'entrée dans une SCPI. Ils ne doivent jamais être isolés du TOF, du rendement, de la capitalisation, de l\'endettement et de la qualité du patrimoine.',
    'Utilisez le comparateur MaximusSCPI pour structurer votre première lecture, puis approfondissez avec les bulletins trimestriels et, si besoin, un rendez-vous avec le Cabinet Eric Bellaiche pour une analyse adaptée à votre situation fiscale et patrimoniale.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que la valeur de reconstitution d\'une SCPI ?',
      answer: 'La valeur de reconstitution estime le coût théorique de reconstruction du patrimoine immobilier de la SCPI à un instant donné. Elle sert de référence patrimoniale pour comparer le prix de souscription et évaluer si l\'investisseur entre en décote ou en surcote.',
    },
    {
      question: 'Comment calculer une décote ou surcote SCPI ?',
      answer: 'La formule usuelle est : (prix de souscription − valeur de reconstitution) / valeur de reconstitution × 100. Un résultat négatif indique une décote, un résultat positif une surcote. Les sociétés de gestion publient ces données dans leurs bulletins trimestriels.',
    },
    {
      question: 'Une SCPI en décote est-elle toujours intéressante ?',
      answer: 'Non. Une décote peut refléter des difficultés locatives, un secteur en crise ou une méfiance du marché. Elle doit être analysée avec le TOF, l\'évolution de l\'occupation, la qualité du patrimoine et la stratégie du gestionnaire avant toute conclusion.',
    },
    {
      question: 'Faut-il éviter une SCPI en surcote ?',
      answer: 'Pas systématiquement. Une surcote modérée peut être cohérente si le patrimoine est qualitatif, le TOF élevé et la collecte soutenue. En revanche, une surcote importante sans justification patrimoniale réduit la marge de sécurité à l\'entrée et à la revente.',
    },
    {
      question: 'Pourquoi la valeur de reconstitution est-elle importante ?',
      answer: 'Elle offre un repère patrimonial indépendant du marketing commercial. Elle aide l\'investisseur à comprendre s\'il paie le patrimoine à un prix cohérent, au-dessus ou en dessous de sa valeur de reconstruction théorique.',
    },
    {
      question: 'Quelle différence entre valeur de réalisation et valeur de reconstitution ?',
      answer: 'La valeur de reconstitution estime le coût de reconstruction du patrimoine. La valeur de réalisation estime le prix de vente en cas de liquidation. La valeur de réalisation est généralement inférieure à la valeur de reconstitution car elle intègre les conditions de marché et les frais de cession.',
    },
    {
      question: 'Où trouver ces données ?',
      answer: 'Dans les bulletins trimestriels et rapports annuels des sociétés de gestion, sur le site ASPIM, et dans le comparateur MaximusSCPI pour une pré-lecture centralisée des indicateurs clés.',
    },
    {
      question: 'Comment MaximusSCPI utilise la décote ou surcote ?',
      answer: 'Le comparateur affiche l\'écart entre prix de souscription et valeur de reconstitution pour chaque SCPI suivie. Cet indicateur est croisé avec le TOF, le rendement, la capitalisation et l\'endettement dans une logique de pré-orientation pédagogique, sans constituer une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur décote ou surcote',
}
