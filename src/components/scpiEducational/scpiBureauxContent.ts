import type { ScpiEducationalPageConfig } from './shared'

export const scpiBureauxConfig: ScpiEducationalPageConfig = {
  path: '/scpi-bureaux',
  badge: 'Secteur bureaux',
  h1: 'SCPI bureaux : faut-il encore investir ?',
  heroSubtitle:
    'Le secteur bureaux est hétérogène : certains actifs sont sous pression (télétravail, obsolescence), d\'autres restent recherchés selon l\'emplacement, la qualité, la performance environnementale et les locataires.',
  seoTitle: 'SCPI bureaux : risques, rendement, valorisation et analyse',
  seoDescription:
    'Comprenez les SCPI bureaux : télétravail, vacance, baisse des valeurs, rendement, TOF, localisation, qualité des actifs et critères à analyser.',
  shortAnswerTitle: 'Les SCPI bureaux sont-elles encore pertinentes ?',
  shortAnswer:
    'Le secteur bureaux n\'est pas homogène. Les immeubles prime (centralité, qualité, performance environnementale) restent recherchés par les locataires de qualité. En revanche, les actifs périphériques, obsolètes ou mal situés subissent une pression locative et une baisse de valorisation. L\'analyse doit porter sur la localisation, la qualité du patrimoine, le TOF, l\'endettement et la stratégie de la société de gestion.',
  keyMessage:
    'Le sujet n\'est pas de savoir si les bureaux sont bons ou mauvais. Il faut analyser quels bureaux, où, à quel prix, avec quels locataires et quelle stratégie de gestion.',
  definitionParagraphs: [
    'Les SCPI bureaux investissent dans des immeubles de bureaux : sièges sociaux, immeubles de standing, espaces de coworking, bureaux administratifs. C\'est historiquement le secteur le plus représenté dans les SCPI.',
    'Le télétravail a modifié la demande de surfaces de bureaux. Les entreprises privilégient des surfaces mieux situées, plus qualitatives et flexibles, réduisant ainsi la demande pour les actifs secondaires.',
    'Les immeubles prime (centre des grandes villes, performance environnementale, prestations élevées) résistent mieux. Les actifs périphériques ou obsolètes sont sous pression.',
    'La baisse des valeurs d\'expertise dans le secteur bureaux est un phénomène observé depuis 2023-2024, lié à la hausse des taux et au télétravail. Certaines SCPI ont ajusté leur prix de part.',
    'Le TOF des SCPI bureaux doit être surveillé de près : un TOF en baisse durable peut signaler une difficulté à louer ou à relouer les actifs.',
    'Certaines sociétés de gestion ont adapté leur stratégie : repositionnement, diversification vers d\'autres secteurs, cession d\'actifs obsolètes, rénovation.',
  ],
  tableTitle: 'SCPI bureaux : quel type d\'actif pour quel objectif ?',
  tableRows: [
    {
      level: 'Bureaux prime (centraux)',
      advantage:
        'Emplacement de qualité, locataires solides, bonne résilience.',
      vigilance:
        'Valorisation élevée. Rendement potentiellement plus faible. Concurrence sur les meilleurs actifs.',
    },
    {
      level: 'Bureaux périphériques',
      advantage:
        'Prix d\'entrée potentiellement plus attractif.',
      vigilance:
        'Pression locative plus forte. Risque de vacance et de baisse de valorisation plus élevé.',
    },
    {
      level: 'Bureaux à rénover',
      advantage:
        'Potentiel de valorisation après rénovation.',
      vigilance:
        'Coûts de rénovation, délais, incertitude sur le résultat locatif.',
    },
    {
      level: 'Bureaux européens',
      advantage:
        'Diversification géographique et fiscale (PS 0 %).',
      vigilance:
        'Marchés hétérogènes. Analyser la demande locale et la réglementation.',
    },
    {
      level: 'Bureaux avec locataires solides',
      advantage:
        'Baux longs, loyers réguliers, visibilité.',
      vigilance:
        'Vérifier la solidité financière du locataire et sa stratégie immobilière.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. L\'analyse doit porter sur le patrimoine réel de chaque SCPI.',
  criteriaTitle: 'Critères d\'analyse des SCPI bureaux',
  criteriaCards: [
    { title: 'Localisation', text: 'Centralité, accessibilité, bassin d\'emploi, dynamisme économique local.' },
    { title: 'Qualité environnementale', text: 'Normes BBC, RE2020, certifications HQE/BREEAM. Les actifs les moins performants risquent l\'obsolescence.' },
    { title: 'TOF', text: 'Un TOF stable et élevé est rassurant. Analyser l\'évolution sur 3 à 5 exercices.' },
    { title: 'Durée des baux', text: 'Des baux longs (6-9 ans) avec des locataires solides apportent de la visibilité.' },
    { title: 'Valorisation', text: 'Comparer le prix de souscription à la VR. Une surcote élevée est un risque en cas de baisse des valeurs.' },
    { title: 'Stratégie de la société de gestion', text: 'La société a-t-elle adapté sa stratégie face aux évolutions du marché des bureaux ?' },
  ],
  commonErrors: [
    'Considérer que toutes les SCPI bureaux sont identiques.',
    'Ignorer la localisation précise des actifs.',
    'Sous-estimer l\'impact du télétravail sur la demande de surfaces.',
    'Ne pas vérifier le TOF et son évolution récente.',
    'Investir dans des bureaux obsolètes sans potentiel de revalorisation.',
  ],
  practicalCases: [
    {
      title: 'SCPI bureaux A — immeubles prime, TOF stable',
      text: 'Une SCPI bureaux de 1,5 Md€ investie dans des immeubles prime à Paris, Lyon et grandes villes européennes. TOF stable à 95 %. Locataires de qualité (CAC 40, assurances). Simulation pédagogique : la qualité du patrimoine compense les tensions sectorielles.',
    },
    {
      title: 'SCPI bureaux B — périphérique, TOF en baisse',
      text: 'Une SCPI bureaux concentrée en périphérie parisienne. Le TOF passe de 93 % à 78 % en 3 ans. La société de gestion ajuste le prix de part. Simulation pédagogique : la localisation et la qualité des actifs sont déterminantes.',
    },
    {
      title: 'SCPI bureaux C — stratégie de repositionnement',
      text: 'Une SCPI bureaux a cédé ses actifs les moins performants et investi dans des immeubles rénovés certifiés. Le TOF se redresse progressivement. Simulation pédagogique : la stratégie de la société de gestion compte.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI bureaux avec attention : TOF, localisation, qualité environnementale, valorisation, endettement.',
    'La méthode MaximusSCPI ne généralise pas le secteur bureaux. Chaque SCPI est analysée selon son patrimoine réel.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse sectorielle.',
  ],
  conclusionParagraphs: [
    'Les SCPI bureaux ne sont pas un bloc homogène. Certaines offrent une qualité patrimoniale solide, d\'autres subissent les évolutions du marché. L\'analyse doit être fine et patrimoniale.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI bureaux, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Les SCPI bureaux sont-elles risquées ?',
      answer: 'Cela dépend de la qualité du patrimoine, de la localisation, des locataires et de la stratégie de gestion. Le secteur est hétérogène.',
    },
    {
      question: 'Le télétravail menace-t-il les SCPI bureaux ?',
      answer: 'Oui, il modifie la demande. Les immeubles prime résistent mieux. Les actifs périphériques ou obsolètes sont plus exposés.',
    },
    {
      question: 'Faut-il éviter les bureaux ?',
      answer: 'Non, mais il faut sélectionner les SCPI bureaux avec des critères stricts : localisation, qualité environnementale, TOF, locataires.',
    },
    {
      question: 'Quels bureaux restent attractifs ?',
      answer: 'Les immeubles prime centraux, certifiés HQE/BREEAM, loués à des locataires de qualité avec des baux longs.',
    },
    {
      question: 'Comment analyser le TOF d\'une SCPI bureaux ?',
      answer: 'Vérifier le TOF sur 3 à 5 ans. Un TOF en baisse durable peut signaler une difficulté locative structurelle.',
    },
    {
      question: 'Quel rôle joue la localisation ?',
      answer: 'La localisation est le critère le plus important. Les actifs bien situés résistent mieux aux retournements de marché.',
    },
    {
      question: 'Les SCPI bureaux peuvent-elles se redresser ?',
      answer: 'Oui, si la société de gestion adapte sa stratégie : cessions, rénovations, repositionnement, diversification.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI bureaux ?',
      answer: 'Le comparateur affiche les indicateurs clés. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avec le comparateur MaximusSCPI',
}
