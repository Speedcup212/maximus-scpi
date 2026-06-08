import type { ScpiEducationalPageConfig } from './shared'

export const reportANouveauScpiConfig: ScpiEducationalPageConfig = {
  path: '/report-a-nouveau-scpi',
  badge: 'Réserve & distribution',
  h1: 'Report à nouveau SCPI : réserve utile ou faux confort ?',
  heroSubtitle:
    'Le report à nouveau (RAN) est une réserve comptable constituée par les bénéfices non distribués des exercices précédents. Il peut être utilisé pour lisser les distributions en période moins favorable, mais il ne remplace pas la qualité locative du patrimoine.',
  seoTitle: 'Report à nouveau SCPI : définition, utilité et limites',
  seoDescription:
    'Comprenez le report à nouveau d\'une SCPI : réserve de distribution, capacité d\'amortissement, limites, rendement, TOF et critères à croiser avant d\'investir.',
  shortAnswerTitle: 'Pourquoi le report à nouveau est-il important ?',
  shortAnswer:
    'Le report à nouveau (RAN) représente les bénéfices cumulés non distribués les années précédentes. Il constitue une réserve que la SCPI peut utiliser pour maintenir ou lisser ses distributions lorsque les revenus locatifs sont temporairement insuffisants. Un RAN élevé peut être rassurant sur la capacité de la SCPI à gérer les à-coups, mais il ne doit pas masquer une baisse durable du TOF ou de la qualité du patrimoine.',
  keyMessage:
    'Le report à nouveau peut sécuriser temporairement une distribution, mais il ne remplace pas la qualité locative du patrimoine.',
  definitionParagraphs: [
    'Le report à nouveau (RAN) est un poste comptable qui figure au passif du bilan d\'une SCPI. Il correspond aux résultats des exercices précédents qui n\'ont pas été distribués aux associés ni affectés à d\'autres réserves.',
    'Une SCPI peut utiliser le RAN pour compléter les distributions d\'un exercice si les revenus locatifs sont insuffisants. Cela permet de lisser les versements et d\'éviter des variations brusques pour les associés.',
    'Le RAN est parfois exprimé en montant absolu ou en nombre de mois de distribution (exemple : RAN équivalent à 6 mois de distribution). Cette présentation permet de visualiser la capacité de la SCPI à maintenir son niveau de distribution en cas de baisse temporaire des loyers.',
    'Un RAN élevé n\'est pas toujours un signal positif. Il peut refléter une politique de distribution prudente, mais aussi une difficulté à distribuer faute de revenus locatifs suffisants. Il peut également être le signe d\'une capitalisation excessive ou d\'une absence de stratégie de distribution claire.',
    'Un RAN en baisse persistante est un signal de vigilance : les réserves sont utilisées pour maintenir les distributions, ce qui n\'est pas soutenable indéfiniment si les revenus locatifs ne se redressent pas.',
    'Le RAN doit être analysé avec le TOF, les revenus locatifs réels, le rendement, l\'endettement, les frais et la stratégie de distribution de la société de gestion. Une distribution maintenue artificiellement par le RAN ne reflète pas la santé réelle du patrimoine.',
  ],
  tableTitle: 'Report à nouveau : ce qu\'il faut surveiller',
  tableRows: [
    {
      level: 'RAN élevé',
      advantage:
        'Capacité de lisser les distributions en cas de baisse temporaire des loyers. Politique prudente possible.',
      vigilance:
        'Vérifier la tendance : le RAN se constitue-t-il ou se consume-t-il ? Un RAN élevé peut aussi signaler une sous-distribution.',
    },
    {
      level: 'RAN faible',
      advantage:
        'Politique de distribution plus dynamique. Les revenus sont reversés aux associés.',
      vigilance:
        'Moins de capacité à lisser les chocs. En cas de baisse du TOF, les distributions pourraient baisser.',
    },
    {
      level: 'RAN en baisse',
      advantage:
        'Peut refléter une volonté de maintenir les distributions malgré une baisse temporaire des loyers.',
      vigilance:
        'Si la baisse du RAN est durable, le niveau de distribution n\'est pas soutenable sans redressement des revenus locatifs.',
    },
    {
      level: 'RAN stable et distribution maintenue',
      advantage:
        'Cohérence entre revenus locatifs et distribution. Lecture rassurante.',
      vigilance:
        'Croiser avec le TOF et l\'évolution des loyers pour confirmer la solidité de la tendance.',
    },
    {
      level: 'SCPI récente (< 3 ans)',
      advantage:
        'Peut avoir un RAN limité par construction. Pas d\'historique de lissage.',
      vigilance:
        'Analyser la solidité locative et la stratégie de distribution dès les premières années.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Le RAN doit toujours être analysé en contexte, avec les revenus locatifs réels et les perspectives de la SCPI.',
  criteriaTitle: 'Critères à croiser avec le report à nouveau',
  criteriaCards: [
    { title: 'TOF', text: 'Un TOF élevé et stable génère des revenus locatifs suffisants pour réduire le besoin d\'utiliser le RAN.' },
    { title: 'Rendement (TDVM)', text: 'Un rendement maintenu malgré un RAN en baisse peut signaler une politique de distribution non soutenable.' },
    { title: 'Revenus locatifs', text: 'Analyser l\'évolution des loyers perçus. Si les revenus locatifs baissent mais que les distributions restent stables, le RAN compense.' },
    { title: 'Endettement', text: 'Une SCPI endettée peut avoir moins de flexibilité pour reconstituer son RAN si les revenus baissent.' },
    { title: 'Collecte nette', text: 'Une collecte positive peut aider à reconstituer les réserves si la SCPI le souhaite.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence sa capacité à générer des réserves et à lisser les distributions.' },
  ],
  commonErrors: [
    'Considérer qu\'un RAN élevé est toujours un signe de bonne santé.',
    'Ignorer la tendance du RAN : un RAN qui se dégrade est un signal de vigilance.',
    'Croire que le RAN garantit les distributions futures.',
    'Ne pas croiser le RAN avec le TOF et les revenus locatifs réels.',
    'Confondre RAN et trésorerie disponible.',
    'Oublier que le RAN peut être utilisé pour masquer temporairement une baisse structurelle.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — RAN élevé, TOF en baisse',
      text: 'Une SCPI affiche un RAN équivalent à 8 mois de distribution. Cependant, le TOF est passé de 96 % à 85 % en deux ans. Les distributions sont maintenues grâce au RAN, mais la tendance locative est préoccupante. Simulation pédagogique : le RAN retarde l\'impact, il ne le supprime pas.',
    },
    {
      title: 'SCPI B — RAN faible, patrimoine solide',
      text: 'Une SCPI a un RAN équivalent à 2 mois de distribution et un TOF stable à 97 %. Les distributions sont régulières et soutenues par les revenus locatifs réels. Le faible RAN n\'est pas inquiétant si la qualité locative est maintenue.',
    },
    {
      title: 'SCPI C — RAN en baisse après une acquisition',
      text: 'Une SCPI a utilisé une partie de son RAN pour financer une acquisition stratégique. La baisse du RAN est ponctuelle et documentée. Le TOF reste élevé. Simulation pédagogique : le RAN peut baisser pour des raisons positives, à condition d\'être expliqué.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre le report à nouveau comme un indicateur de lecture de la solidité des distributions, sans le présenter comme une garantie.',
    'La première étape consiste à identifier le RAN dans le rapport annuel ou le bulletin trimestriel. Il est souvent exprimé en montant ou en mois de distribution.',
    'La deuxième étape analyse la tendance : le RAN augmente-t-il, diminue-t-il ou reste-t-il stable sur plusieurs exercices ?',
    'La troisième étape croise le RAN avec le TOF et les revenus locatifs pour vérifier si la politique de distribution est soutenable.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'affiner l\'analyse de la solidité des distributions.',
  ],
  conclusionParagraphs: [
    'Le report à nouveau est un indicateur utile pour évaluer la capacité d\'une SCPI à gérer les à-coups de distribution. Il ne remplace pas l\'analyse du TOF, des revenus locatifs et de la stratégie de gestion.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les indicateurs, puis validez votre analyse avec un conseiller pour une approche personnalisée.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le report à nouveau d\'une SCPI ?',
      answer: 'C\'est le cumul des bénéfices non distribués des exercices précédents. Il constitue une réserve comptable que la SCPI peut utiliser pour lisser ses distributions.',
    },
    {
      question: 'À quoi sert le RAN ?',
      answer: 'Il permet de maintenir ou de compléter les distributions lorsque les revenus locatifs sont temporairement insuffisants. C\'est un outil de lissage, pas une garantie.',
    },
    {
      question: 'Un RAN élevé est-il toujours positif ?',
      answer: 'Pas nécessairement. Il peut refléter une politique prudente, mais aussi une difficulté à distribuer ou une capitalisation excessive. La tendance et le contexte comptent.',
    },
    {
      question: 'Un RAN faible est-il inquiétant ?',
      answer: 'Pas si le TOF est élevé et les revenus locatifs stables. En revanche, un RAN faible avec un TOF en baisse est un signal de vigilance.',
    },
    {
      question: 'Le report à nouveau garantit-il les revenus ?',
      answer: 'Non. Il peut temporairement lisser les distributions, mais il ne remplace pas une dégradation durable du TOF ou des revenus locatifs.',
    },
    {
      question: 'Où trouver le RAN ?',
      answer: 'Dans le rapport annuel, le bulletin trimestriel et parfois la fiche ASPIM de la SCPI. Le comparateur MaximusSCPI le mentionne lorsqu\'il est disponible.',
    },
    {
      question: 'Comment le comparer entre SCPI ?',
      answer: 'Le RAN exprimé en mois de distribution est plus parlant que le montant absolu, car il est rapporté au niveau de distribution de chaque SCPI.',
    },
    {
      question: 'Comment MaximusSCPI utilise le RAN ?',
      answer: 'Le RAN est intégré comme un indicateur de lecture dans les contenus pédagogiques. MaximusSCPI encourage son analyse avec le TOF et les revenus locatifs.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI',
}
