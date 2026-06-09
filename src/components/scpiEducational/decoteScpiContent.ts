import type { ScpiEducationalPageConfig } from './shared'

export const decoteScpiConfig: ScpiEducationalPageConfig = {
  path: '/decote-valeur-reconstitution-scpi',
  badge: 'Indicateur patrimonial',
  h1: 'Décote et surcote SCPI : comprendre l\'écart avec la valeur de reconstitution',
  heroSubtitle:
    'L\'écart entre le prix de souscription et la valeur de reconstitution est un indicateur patrimonial central. Il aide à comprendre si l\'investisseur achète le patrimoine à un prix cohérent, en décote ou en surcote — sans constituer un signal suffisant à lui seul. Il doit être croisé avec le TOF, la qualité patrimoniale et l\'endettement.',
  seoTitle: 'Décote SCPI, valeur de reconstitution et surcote : analyse pédagogique complète',
  seoDescription:
    'Analyse complète de la décote et surcote des SCPI : définition de la valeur de reconstitution, différence avec la valeur de réalisation, seuils d\'interprétation, exemples chiffrés, cas pratiques (décote avec TOF faible, surcote justifiée), critères à croiser et méthode MaximusSCPI.',
  shortAnswerTitle: 'Pourquoi comparer le prix de souscription à la valeur de reconstitution ?',
  shortAnswer:
    'La valeur de reconstitution estime le coût de reconstruction du patrimoine de la SCPI à un instant donné. L\'écart avec le prix de souscription — décote ou surcote — indique si l\'investisseur entre dans le capital à un prix inférieur ou supérieur à cette référence patrimoniale. Une décote peut sembler attractive mais coïncider avec un TOF faible ou un patrimoine en difficulté. Une surcote peut être acceptable si la qualité locative, la stratégie et la dynamique de collecte le justifient. Cet indicateur ne doit jamais être analysé seul.',
  keyMessage:
    'Une décote n\'est pas une bonne affaire automatique. Une surcote n\'est pas forcément un signal négatif, mais elle doit être justifiée par la qualité du patrimoine et le contexte.',
  definitionParagraphs: [
    'Le prix de souscription est le prix auquel un investisseur acquiert une part de SCPI lors d\'une souscription primaire ou, selon les cas, sur le marché secondaire. Il intègre les frais de souscription et reflète la politique tarifaire de la société de gestion à un instant donné.',
    'La valeur de reconstitution (VR) estime le montant théorique nécessaire pour reconstituer le patrimoine immobilier de la SCPI : acquisition des actifs, frais annexes, travaux éventuels. Elle est calculée par l\'expert ou la société de gestion selon une méthodologie définie dans les documents réglementaires.',
    'La décote correspond à une situation où le prix de souscription est inférieur à la valeur de reconstitution. L\'investisseur achète théoriquement le patrimoine « en dessous » de sa valeur de reconstruction. La surcote est l\'inverse : le prix de souscription dépasse la valeur de reconstitution.',
    'La valeur de réalisation, lorsqu\'elle est communiquée, correspond à une estimation du prix de vente du patrimoine en cas de liquidation. Elle diffère de la valeur de reconstitution et ne doit pas être confondue avec elle. Les trois notions — prix de souscription, valeur de reconstitution, valeur de réalisation — participent à la lecture patrimoniale mais n\'ont pas la même finalité.',
    'L\'écart en pourcentage se calcule de manière classique : (prix de souscription − valeur de reconstitution) / valeur de reconstitution. Un écart négatif signale une décote, un écart positif une surcote. Ces données sont publiées trimestriellement dans les bulletins des sociétés de gestion.',
    'Une décote importante peut traduire une méfiance du marché, des difficultés locatives passées ou une stratégie de collecte agressive. Elle peut aussi refléter une opportunité si le patrimoine est solide et si la baisse de prix est temporaire. L\'analyse contextuelle est indispensable.',
    'Une surcote persistante peut refléter la confiance du marché dans la qualité du patrimoine, une collecte dynamique ou une politique de revalorisation régulière du prix de part. Elle réduit cependant la marge de sécurité à l\'entrée et à la revente.',
    'Le lien avec les expertises immobilières est important : la valeur de reconstitution dépend des évaluations des experts immobiliers. En période de baisse des marchés immobiliers, la VR peut être révisée à la baisse, ce qui réduit ou annule une décote apparente.',
  ],
  tableTitle: 'Comment interpréter l\'écart prix / valeur de reconstitution ?',
  tableRows: [
    {
      level: 'Décote > 5 %',
      advantage:
        'Point d\'attention potentiellement favorable : l\'investisseur entre peut-être sous la valeur patrimoniale de référence.',
      vigilance:
        'Vérifier les causes : TOF faible, patrimoine vieillissant, secteur en tension ou simple correction de marché. Une décote sans analyse peut être un piège.',
    },
    {
      level: 'Écart entre −5 % et +5 %',
      advantage:
        'Zone généralement cohérente : le prix de souscription est proche de la valeur de reconstitution.',
      vigilance:
        'La cohérence tarifaire ne garantit ni le rendement futur ni la qualité locative. Croiser impérativement avec TOF, rendement et endettement.',
    },
    {
      level: 'Surcote > 5 %',
      advantage:
        'Peut refléter une confiance du marché dans la qualité du patrimoine ou une collecte dynamique bien gérée.',
      vigilance:
        'Vigilance sur le prix d\'entrée : l\'investisseur paie une prime qui réduit la marge de sécurité à la revente. Vérifier que la qualité du patrimoine justifie la surcote.',
    },
    {
      level: 'Surcote proche ou supérieure à 10 %',
      advantage:
        'Peut être acceptable si le patrimoine est très qualitatif, le TOF élevé et la stratégie documentée.',
      vigilance:
        'Analyse renforcée nécessaire. Justifier la prime par des éléments patrimoniaux vérifiables (qualité des baux, localisation, diversification), pas par le seul rendement passé.',
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
    { title: 'Collecte nette', text: 'Une collecte nette positive soutient parfois une surcote ; une collecte négative peut expliquer une décote persistante.' },
    { title: 'Secteur immobilier', text: 'Un secteur en tension (bureaux secondaires, commerces fragiles) peut entraîner une décote durable sur le marché.' },
    { title: 'Localisation géographique', text: 'La qualité micro-économique des zones d\'implantation influence la soutenabilité de la valeur de reconstitution.' },
    { title: 'Frais de souscription', text: 'Des frais élevés aggravent une surcote : l\'investisseur paie d\'abord des frais, puis une prime sur le patrimoine.' },
    { title: 'Revalorisation du prix de part', text: 'Une politique de hausse régulière du prix de souscription peut maintenir une surcote si la VR progresse moins vite.' },
    { title: 'Cycle de marché', text: 'En période de baisse des marchés immobiliers, la VR peut être révisée à la baisse, modifiant mécaniquement l\'écart apparent.' },
  ],
  commonErrors: [
    'Acheter une SCPI uniquement parce qu\'elle est en décote, sans analyser les causes de la décote.',
    'Écarter systématiquement toute SCPI en surcote sans analyser la qualité du patrimoine.',
    'Confondre valeur de reconstitution et valeur de réalisation (estimation de liquidation).',
    'Ignorer l\'évolution de la décote ou surcote sur plusieurs trimestres (tendance plus informative qu\'un point).',
    'Ne pas intégrer les frais de souscription dans le calcul du prix d\'entrée réel.',
    'Comparer des décotes entre SCPI de secteurs ou de zones géographiques différents sans contexte.',
    'Croire qu\'une décote garantit une marge de sécurité à la revente (la décote peut se creuser).',
  ],
  practicalCases: [
    {
      title: 'SCPI en décote marquée — TOF faible',
      text: 'Une SCPI affiche une décote de 8 % mais son TOF est passé sous 88 % depuis deux exercices. La décote reflète probablement une méfiance du marché liée à des vacances locatives et une baisse de l\'attractivité du patrimoine. Simulation pédagogique : l\'écart tarifaire ne suffit pas à conclure à une opportunité sans analyse des causes et de la stratégie de redressement.',
    },
    {
      title: 'SCPI en surcote — patrimoine qualitatif',
      text: 'Avec une surcote de 6 %, une SCPI logistique affiche un TOF supérieur à 97 %, une diversification géographique en Europe et une collecte nette positive. La prime peut se justifier par la qualité des actifs. Simulation pédagogique : l\'investisseur doit accepter un prix d\'entrée élevé qui limite la marge de sécurité, même si le patrimoine est qualitatif.',
    },
    {
      title: 'SCPI proche de la VR — rendement stable',
      text: 'Le prix de souscription est à −2 % de la valeur de reconstitution, le TOF est stable autour de 94 % et les distributions sont régulières depuis cinq ans. La situation paraît cohérente. Simulation pédagogique : la cohérence tarifaire est un bon point de départ, mais le rendement historique reste une donnée passée à croiser avec la fiscalité nette.',
    },
    {
      title: 'SCPI avec baisse de VR',
      text: 'La valeur de reconstitution d\'une SCPI a baissé de 5 % sur un an suite à la révision des expertises immobilières. L\'écart apparent est passé d\'une décote de 3 % à 0 %, masquant la baisse réelle du patrimoine. Simulation pédagogique : suivre l\'évolution de la VR est essentiel car elle modifie la lecture de l\'écart.',
    },
    {
      title: 'SCPI en surcote avec endettement élevé',
      text: 'Une SCPI affiche 8 % de surcote et 30 % d\'endettement. En cas de baisse des loyers ou de hausse des taux, le double effet surcote + dette peut amplifier le risque. Simulation pédagogique : la surcote et l\'endettement doivent être analysés conjointement.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI affiche la décote ou surcote sur valeur de reconstitution dans le comparateur, aux côtés du TOF, du rendement, de la capitalisation et de l\'endettement. L\'objectif est de donner une lecture patrimoniale rapide, sans remplacer l\'analyse des documents réglementaires.',
    'La première étape consiste à situer la SCPI dans une des fourchettes indicatives : décote significative, zone cohérente ou surcote marquée. Cette classification est un point de départ, pas une conclusion.',
    'La deuxième étape vérifie la cohérence avec le TOF et l\'évolution de l\'écart sur plusieurs trimestres. Une décote qui se creuse peut signaler une dégradation locative ; une surcote stable peut refléter une confiance durable du marché.',
    'La troisième étape croise l\'écart tarifaire avec la qualité du patrimoine, le secteur, la localisation et l\'endettement. MaximusSCPI facilite cette pré-orientation en centralisant les indicateurs ; l\'approfondissement patrimonial relève d\'un échange personnalisé avec un conseiller.',
    'Enfin, l\'investisseur doit intégrer sa fiscalité, son horizon et son besoin de revenus. Une décote n\'est pas une fin en soi : elle doit être cohérente avec l\'objectif patrimonial global.',
  ],
  conclusionParagraphs: [
    'La décote et la surcote sont des indicateurs patrimoniaux précieux pour comprendre le prix d\'entrée dans une SCPI. Ils ne doivent jamais être isolés du TOF, du rendement, de la capitalisation, de l\'endettement et de la qualité du patrimoine.',
    'Sources et points à vérifier : bulletins trimestriels et rapports annuels des sociétés de gestion, rapports d\'expertise immobilière, fiches ASPIM. Le comparateur MaximusSCPI permet de visualiser l\'écart prix / VR pour chaque SCPI suivie.',
    'Utilisez le comparateur MaximusSCPI pour structurer votre première lecture, puis approfondissez avec les bulletins trimestriels.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que la valeur de reconstitution d\'une SCPI ?',
      answer: 'La valeur de reconstitution estime le coût théorique de reconstruction du patrimoine immobilier de la SCPI à un instant donné. Elle sert de référence patrimoniale pour comparer le prix de souscription et évaluer si l\'investisseur entre en décote ou en surcote.',
    },
    {
      question: 'Comment calculer une décote ou surcote SCPI ?',
      answer: 'La formule usuelle est : (prix de souscription − valeur de reconstitution) / valeur de reconstitution × 100. Un résultat négatif indique une décote, un résultat positif une surcote.',
    },
    {
      question: 'Une SCPI en décote est-elle toujours intéressante ?',
      answer: 'Non. Une décote peut refléter des difficultés locatives, un secteur en crise ou une méfiance du marché. Elle doit être analysée avec le TOF, l\'évolution et la qualité du patrimoine.',
    },
    {
      question: 'Faut-il éviter une SCPI en surcote ?',
      answer: 'Pas systématiquement. Une surcote modérée peut être cohérente si le patrimoine est qualitatif et le TOF élevé. Une surcote importante sans justification réduit la marge de sécurité.',
    },
    {
      question: 'Pourquoi la valeur de reconstitution est-elle importante ?',
      answer: 'Elle offre un repère patrimonial indépendant du marketing commercial. Elle aide à comprendre si l\'on paie le patrimoine à un prix cohérent ou avec une prime.',
    },
    {
      question: 'Quelle différence entre valeur de réalisation et valeur de reconstitution ?',
      answer: 'La valeur de reconstitution estime le coût de reconstruction. La valeur de réalisation estime le prix de vente en cas de liquidation, généralement inférieur car intégrant les conditions de marché.',
    },
    {
      question: 'Où trouver ces données ?',
      answer: 'Dans les bulletins trimestriels et rapports annuels des sociétés de gestion, sur le site ASPIM, et dans le comparateur MaximusSCPI.',
    },
    {
      question: 'La VR peut-elle baisser ?',
      answer: 'Oui, en période de baisse des marchés immobiliers ou après révision des expertises. Une baisse de VR modifie mécaniquement l\'écart apparent avec le prix de souscription.',
    },
    {
      question: 'Quel est le lien avec le cycle de marché et les taux ?',
      answer: 'La hausse des taux peut entraîner une baisse des valeurs immobilières, donc une baisse de la VR. Les SCPI avec une forte surcote sont plus exposées à ce risque.',
    },
    {
      question: 'Comment MaximusSCPI utilise la décote ou surcote ?',
      answer: 'Le comparateur affiche l\'écart prix / VR pour chaque SCPI, croisé avec le TOF, le rendement, la capitalisation et l\'endettement, dans une logique pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Analyser la décote ou surcote avant d\'investir',
}
