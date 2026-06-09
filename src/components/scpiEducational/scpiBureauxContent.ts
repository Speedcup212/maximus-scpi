import type { ScpiEducationalPageConfig } from './shared'

export const scpiBureauxConfig: ScpiEducationalPageConfig = {
  path: '/scpi-bureaux',
  badge: 'Secteur bureaux',
  h1: 'SCPI bureaux : analyse nuancée entre prime et périphérique',
  heroSubtitle:
    'Le secteur bureaux est hétérogène : certains actifs sont sous pression (télétravail, obsolescence, normes énergétiques), d\'autres restent recherchés selon l\'emplacement, la qualité, la performance environnementale et les locataires. Le sujet n\'est pas de savoir si les bureaux sont bons ou mauvais en général.',
  seoTitle: 'SCPI bureaux : risques, rendement, valorisation et analyse',
  seoDescription:
    'Analyse complète des SCPI bureaux : immeubles prime vs périphériques, télétravail, TOF, vacance locative, baisse des prix, localisation, rénovation énergétique, cas pratiques et grille de risque.',
  shortAnswerTitle: 'Les SCPI bureaux sont-elles encore pertinentes ?',
  shortAnswer:
    'Le secteur bureaux n\'est pas homogène. Les immeubles prime (centralité, qualité, performance environnementale, locataires solides) restent recherchés. En revanche, les actifs périphériques, obsolètes ou mal situés subissent une pression locative et une baisse de valorisation. Certaines SCPI bureaux ont ajusté leur prix de part. L\'analyse doit porter sur la localisation précise, la qualité du patrimoine, le TOF, l\'endettement, la stratégie de la société de gestion et la capacité à adapter le patrimoine aux nouvelles attentes des utilisateurs.',
  keyMessage:
    'Le sujet n\'est pas de savoir si les bureaux sont bons ou mauvais. Il faut analyser quels bureaux, où, à quel prix, avec quels locataires et quelle stratégie de gestion.',
  definitionParagraphs: [
    'Les SCPI bureaux investissent dans des immeubles de bureaux : sièges sociaux, immeubles de standing, espaces de coworking, bureaux administratifs. C\'est historiquement le secteur le plus représenté dans les SCPI françaises.',
    'Le télétravail a modifié la demande de surfaces de bureaux. Les entreprises privilégient des surfaces mieux situées, plus qualitatives et flexibles, réduisant ainsi la demande pour les actifs secondaires et périphériques.',
    'Les immeubles prime (centre des grandes villes, performance environnementale, prestations élevées, certifications HQE/BREEAM) résistent mieux. Les actifs périphériques ou obsolètes sont sous pression locative et subissent une baisse de valorisation.',
    'La baisse des valeurs d\'expertise dans le secteur bureaux est un phénomène observé depuis 2023-2024, lié à la hausse des taux et à l\'évolution des modes de travail. Certaines SCPI ont ajusté leur prix de part à la baisse.',
    'Le TOF des SCPI bureaux doit être surveillé de près : un TOF en baisse durable peut signaler une difficulté à louer ou à relouer les actifs dans un marché qui se polarise.',
    'Certaines sociétés de gestion ont adapté leur stratégie : repositionnement d\'actifs, diversification vers d\'autres secteurs, cession d\'actifs obsolètes, rénovation lourde pour atteindre les normes environnementales.',
  ],
  tableTitle: 'Type de bureaux / Atout potentiel / Vigilance / Questions à poser',
  tableRows: [
    {
      level: 'Bureaux prime centraux',
      advantage: 'Emplacement de qualité, locataires solides (CAC 40, assurances), bonne résilience locative.',
      vigilance: 'Valorisation élevée, rendement potentiellement plus faible. Concurrence forte sur les meilleurs actifs.',
    },
    {
      level: 'Bureaux périphériques',
      advantage: 'Prix d\'entrée potentiellement plus attractif, loyers plus bas.',
      vigilance: 'Pression locative forte, risque de vacance élevé, baisse de valorisation, obsolescence.',
    },
    {
      level: 'Bureaux à rénover / repositionner',
      advantage: 'Potentiel de valorisation après rénovation et mise aux normes.',
      vigilance: 'Coûts de rénovation élevés, délais longs, incertitude sur le résultat locatif après travaux.',
    },
    {
      level: 'Bureaux européens',
      advantage: 'Diversification géographique, fiscalité différente (PS 0 % selon conventions).',
      vigilance: 'Marchés hétérogènes selon les pays. Analyser la demande locale et la réglementation.',
    },
    {
      level: 'Bureaux avec locataires publics ou institutionnels',
      advantage: 'Baux longs (9-12 ans), loyers réguliers, très faible risque de défaut.',
      vigilance: 'Valorisation élevée, rendement plus faible, faible flexibilité de repositionnement.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. L\'analyse doit porter sur le patrimoine réel de chaque SCPI bureaux, pas sur le secteur en général.',
  criteriaTitle: 'Critères d\'analyse des SCPI bureaux',
  criteriaCards: [
    { title: 'Localisation', text: 'Centralité, accessibilité, bassin d\'emploi, dynamisme économique local. Le critère le plus important.' },
    { title: 'Qualité environnementale', text: 'Normes BBC, RE2020, certifications HQE/BREEAM. Les actifs les moins performants risquent l\'obsolescence.' },
    { title: 'TOF et évolution', text: 'Un TOF stable et élevé est rassurant. Analyser l\'évolution sur 3 à 5 exercices pour détecter les tendances.' },
    { title: 'Durée des baux', text: 'Des baux longs (6-9 ans) avec des locataires solides apportent de la visibilité sur les loyers.' },
    { title: 'Valorisation', text: 'Comparer le prix de souscription à la VR. Une surcote élevée est un risque en cas de baisse des valeurs.' },
    { title: 'Stratégie de la société de gestion', text: 'La société a-t-elle adapté sa stratégie face aux évolutions du marché ? Cessions, rénovations, diversification ?' },
    { title: 'Liquidité', text: 'Les SCPI bureaux de grande taille ont généralement une meilleure liquidité. Vérifier le type de capital.' },
  ],
  commonErrors: [
    'Considérer que toutes les SCPI bureaux sont identiques et également risquées.',
    'Ignorer la localisation précise des actifs.',
    'Sous-estimer l\'impact du télétravail sur la demande de surfaces de bureaux.',
    'Ne pas vérifier le TOF et son évolution récente sur plusieurs trimestres.',
    'Investir dans des bureaux obsolètes sans potentiel de revalorisation.',
    'Confondre baisse sectorielle et mauvaise qualité d\'une SCPI en particulier.',
  ],
  practicalCases: [
    {
      title: 'Bureaux prime bien loués — résilience',
      text: 'Une SCPI bureaux de 1,5 Md€ investie dans des immeubles prime à Paris, Lyon et grandes villes européennes. TOF stable à 95 %, locataires de qualité (CAC 40, assurances). Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Bureaux périphériques sous pression',
      text: 'Une SCPI bureaux concentrée en périphérie parisienne voit son TOF passer de 93 % à 78 % en 3 ans. La société de gestion ajuste le prix de part à la baisse. Simulation pédagogique : la localisation et la qualité des actifs sont déterminantes.',
    },
    {
      title: 'SCPI bureaux avec décote — opportunité ?',
      text: 'Une SCPI bureaux de qualité (prime, certifiée) voit son prix de part baisser de 10 % en raison du contexte de marché, mais son TOF reste à 94 %. La décote par rapport à la VR atteint 8 %. Simulation pédagogique : une baisse généralisée peut créer des points d\'entrée si les fondamentaux restent solides.',
    },
    {
      title: 'SCPI bureaux en repositionnement',
      text: 'Une SCPI bureaux a cédé ses actifs les moins performants et investi dans des immeubles rénovés certifiés. Le TOF se redresse progressivement après une phase de travaux. Simulation pédagogique : la stratégie de la société de gestion compte.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI bureaux avec une grille fine : TOF, localisation, qualité environnementale, valorisation, endettement.',
    'La méthode MaximusSCPI ne généralise pas le secteur bureaux. Chaque SCPI est analysée selon son patrimoine réel, pas selon la tendance sectorielle.',
    'La comparaison avec les autres secteurs (santé, logistique) permet de vérifier la cohérence de l\'allocation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse.',
  ],
  conclusionParagraphs: [
    'Les SCPI bureaux ne sont pas un bloc homogène. Certaines offrent une qualité patrimoniale solide, d\'autres subissent les évolutions du marché du travail. L\'analyse doit être fine et patrimoniale.',
    'Sources et points à vérifier : DIC, note d\'information, rapport annuel, localisation des actifs, certifications environnementales, TOF par immeuble.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI bureaux, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Les SCPI bureaux sont-elles risquées en 2026 ?',
      answer: 'Cela dépend de la qualité du patrimoine, de la localisation, des locataires et de la stratégie de gestion. Le secteur est très hétérogène.',
    },
    {
      question: 'Le télétravail menace-t-il définitivement les SCPI bureaux ?',
      answer: 'Il modifie la demande. Les immeubles prime centraux résistent. Les actifs périphériques ou obsolètes sont plus exposés.',
    },
    {
      question: 'Faut-il éviter les SCPI bureaux en général ?',
      answer: 'Non, mais il faut sélectionner les SCPI bureaux avec des critères stricts : localisation, qualité environnementale, TOF, locataires, stratégie.',
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
      question: 'Quel rôle joue la localisation dans les bureaux ?',
      answer: 'La localisation est le critère le plus important. Les actifs bien situés résistent mieux aux retournements de marché.',
    },
    {
      question: 'Les SCPI bureaux peuvent-elles se redresser ?',
      answer: 'Oui, si la société de gestion adapte sa stratégie : cessions d\'actifs obsolètes, rénovations, repositionnement, diversification.',
    },
    {
      question: 'Quelle différence entre bureaux parisiens et régionaux ?',
      answer: 'Les bureaux parisiens (notamment QCA) bénéficient d\'une demande plus soutenue. Les bureaux régionaux sont plus exposés à la vacance.',
    },
    {
      question: 'Comment la rénovation énergétique impacte-t-elle les SCPI bureaux ?',
      answer: 'Les immeubles non rénovés risquent l\'obsolescence et la décote. Les SCPI qui investissent dans la rénovation protègent leur patrimoine.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI bureaux ?',
      answer: 'Le comparateur affiche les indicateurs clés. Les contenus pédagogiques aident à comprendre les spécificités du secteur bureaux.',
    },
  ],
  comparateurCtaLabel: 'Évaluer les SCPI bureaux avec une grille de risque complète',
}
