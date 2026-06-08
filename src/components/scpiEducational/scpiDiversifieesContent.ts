import type { ScpiEducationalPageConfig } from './shared'

export const scpiDiversifieesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-diversifiees',
  badge: 'SCPI diversifiées',
  h1: 'SCPI diversifiées : mutualisation ou manque de lisibilité ?',
  heroSubtitle:
    'Les SCPI diversifiées peuvent réduire la dépendance à un secteur unique, mais il faut vérifier la réelle diversification et ne pas se contenter du mot \"diversifiée\". La pondération réelle des secteurs, la répartition géographique et la stratégie de gestion sont essentielles.',
  seoTitle: 'SCPI diversifiées : secteurs, risques, rendement et analyse',
  seoDescription:
    'Comprenez les SCPI diversifiées : bureaux, commerces, santé, logistique, résidentiel, diversification sectorielle, rendement, risques et critères à analyser.',
  shortAnswerTitle: 'Que sont les SCPI diversifiées ?',
  shortAnswer:
    'Les SCPI diversifiées investissent dans plusieurs secteurs immobiliers (bureaux, commerces, santé, logistique, résidentiel, etc.) pour mutualiser les risques. Elles peuvent être une porte d\'entrée intéressante pour un premier investissement. Cependant, il faut vérifier la répartition réelle des actifs : certaines SCPI dites diversifiées restent très concentrées sur un secteur dominant.',
  keyMessage:
    'Une SCPI diversifiée n\'est pas automatiquement mieux diversifiée. Il faut vérifier la répartition réelle des actifs, des locataires, des pays et des secteurs.',
  definitionParagraphs: [
    'Une SCPI diversifiée est une SCPI qui investit dans plusieurs secteurs immobiliers : bureaux, commerces, santé, logistique, résidentiel, locaux d\'activité. L\'objectif est de réduire la dépendance à un seul secteur.',
    'La diversification sectorielle permet de lisser les performances : si un secteur est en difficulté, les autres peuvent compenser. C\'est le principe de base de la gestion de risque.',
    'Toutes les SCPI diversifiées ne se valent pas. Certaines affichent une répartition équilibrée entre 4 ou 5 secteurs. D\'autres ont un secteur très majoritaire (bureaux à 60-70 %) et une dispersion sur des secteurs minoritaires.',
    'La diversification géographique est également importante : une SCPI diversifiée peut investir en France et en Europe pour réduire la dépendance à un seul marché.',
    'Les SCPI diversifiées sont souvent recommandées pour un premier investissement car elles offrent une exposition large. Mais cette simplicité apparente ne doit pas dispenser d\'une analyse détaillée.',
    'La lisibilité est un enjeu : plus une SCPI est diversifiée, plus il est complexe d\'analyser finement chaque secteur et chaque actif. La transparence de la société de gestion est essentielle.',
  ],
  tableTitle: 'SCPI diversifiées : avantages et vigilance',
  tableRows: [
    {
      level: 'Diversification sectorielle',
      advantage:
        'Réduit la dépendance à un seul secteur. Lissage des performances.',
      vigilance:
        'Vérifier la répartition réelle. Certaines SCPI diversifiées restent concentrées sur un secteur dominant.',
    },
    {
      level: 'Diversification géographique',
      advantage:
        'Exposition France et Europe. Réduction du risque pays.',
      vigilance:
        'Analyser la répartition par pays et la stratégie de développement.',
    },
    {
      level: 'Mutualisation',
      advantage:
        'Les risques sont répartis entre plusieurs types d\'actifs.',
      vigilance:
        'La mutualisation dilue la performance des meilleurs secteurs.',
    },
    {
      level: 'Lisibilité',
      advantage:
        'Une SCPI diversifiée peut être plus simple à comprendre qu\'une SCPI spécialisée.',
      vigilance:
        'Plus la diversification est large, plus l\'analyse fine est complexe.',
    },
    {
      level: 'Performance',
      advantage:
        'Performance potentiellement plus régulière dans le temps.',
      vigilance:
        'Peut sous-performer les meilleures SCPI spécialisées en période de boom sectoriel.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Chaque SCPI diversifiée doit être analysée individuellement pour vérifier la réalité de sa diversification.',
  criteriaTitle: 'Points de vigilance sur les SCPI diversifiées',
  criteriaCards: [
    { title: 'Répartition sectorielle', text: 'Vérifier les pondérations réelles par secteur. Une SCPI avec 60 % de bureaux est-elle vraiment diversifiée ?' },
    { title: 'Répartition géographique', text: 'Part France vs Europe. Diversification suffisante entre les pays.' },
    { title: 'Nombre d\'actifs', text: 'Plus le nombre d\'actifs est élevé, plus la mutualisation est effective.' },
    { title: 'Nombre de locataires', text: 'Une diversification locative est aussi importante que la diversification sectorielle.' },
    { title: 'Stratégie de gestion', text: 'La société de gestion a-t-elle une vraie stratégie multi-sectorielle ou une simple juxtaposition ?' },
    { title: 'TOF global', text: 'Le TOF global peut masquer des disparités entre secteurs. Demander la ventilation.' },
  ],
  commonErrors: [
    'Croire qu\'une SCPI diversifiée est automatiquement moins risquée.',
    'Ne pas vérifier la répartition sectorielle réelle.',
    'Confondre diversification affichée et diversification réelle.',
    'Investir dans une SCPI diversifiée sans analyser chaque secteur.',
    'Penser qu\'une SCPI diversifiée remplace une allocation multi-SCPI.',
  ],
  practicalCases: [
    {
      title: 'SCPI diversifiée A — répartition équilibrée',
      text: 'Une SCPI diversifiée de 2 Mds€ avec une répartition : bureaux 35 %, santé 25 %, logistique 20 %, commerces 15 %, résidentiel 5 %. 500 actifs, 300 locataires. TOF global à 94 %. Simulation pédagogique : la diversification est réelle et équilibrée.',
    },
    {
      title: 'SCPI diversifiée B — bureaux dominant',
      text: 'Une SCPI diversifiée de 800 M€ avec 65 % de bureaux, 15 % de commerces, 10 % de santé, 10 % de logistique. La diversification sectorielle est limitée. Simulation pédagogique : vérifier la répartition réelle.',
    },
    {
      title: 'SCPI diversifiée C — récente, peu d\'actifs',
      text: 'Une SCPI diversifiée récente de 150 M€ avec 15 actifs. La diversification est encore limitée par le nombre d\'actifs. Simulation pédagogique : la diversification réelle dépend de la maturité de la SCPI.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI diversifiées en vérifiant la réalité de leur diversification : répartition sectorielle, géographique, nombre d\'actifs et de locataires.',
    'La méthode MaximusSCPI ne se fie pas à l\'intitulé \"diversifié\". Elle vérifie les chiffres publiés par la société de gestion.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse.',
  ],
  conclusionParagraphs: [
    'Les SCPI diversifiées offrent un principe de mutualisation pertinent, mais la réalité de la diversification doit être vérifiée secteur par secteur. Toutes les SCPI diversifiées ne se valent pas.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI diversifiées, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI diversifiée ?',
      answer: 'Une SCPI qui investit dans plusieurs secteurs immobiliers (bureaux, commerces, santé, logistique, etc.) pour mutualiser les risques.',
    },
    {
      question: 'Est-ce moins risqué ?',
      answer: 'La diversification réduit la dépendance à un secteur, mais elle ne supprime pas le risque. La qualité de la diversification doit être vérifiée.',
    },
    {
      question: 'Quels secteurs peut-elle détenir ?',
      answer: 'Bureaux, commerces, santé, logistique, résidentiel, locaux d\'activité, parfois hôtellerie ou éducation.',
    },
    {
      question: 'Comment vérifier la diversification ?',
      answer: 'Consulter la répartition sectorielle, géographique, le nombre d\'actifs et de locataires dans le rapport annuel.',
    },
    {
      question: 'Une SCPI diversifiée peut-elle être trop concentrée ?',
      answer: 'Oui, si un secteur représente plus de 50-60 % du patrimoine. Vérifier la pondération réelle.',
    },
    {
      question: 'Quelle différence avec une allocation multi-SCPI ?',
      answer: 'Une allocation multi-SCPI permet de choisir des SCPI spécialisées pour construire sa propre diversification. Une SCPI diversifiée mutualise en interne.',
    },
    {
      question: 'Faut-il privilégier les SCPI diversifiées ?',
      answer: 'Elles peuvent être une bonne porte d\'entrée, mais une allocation sur mesure avec plusieurs SCPI spécialisées peut offrir une diversification plus maîtrisée.',
    },
    {
      question: 'Comment MaximusSCPI analyse la diversification ?',
      answer: 'Le comparateur et les contenus pédagogiques aident à vérifier la diversification réelle. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avec le comparateur MaximusSCPI',
}
