import type { ScpiEducationalPageConfig } from './shared'

export const scpiInternationalesDiversificationContent: ScpiEducationalPageConfig = {
  path: '/scpi-internationales-diversification',
  badge: 'Secteurs immobiliers SCPI',
  h1: 'SCPI internationales : diversification ou effet marketing ?',
  heroSubtitle:
    'Les SCPI dites « internationales » investissent hors de France, parfois hors d\'Europe. La distinction entre SCPI européennes et internationales est importante : les premières investissent dans l\'UE/EEE, les secondes peuvent aller au-delà. La diversification internationale apporte des opportunités mais aussi des risques spécifiques (change, fiscalité, stabilité juridique). Cette page aide à distinguer les vraies diversifications des arguments marketing.',
  seoTitle: 'SCPI internationales : diversification réelle ou effet marketing ?',
  seoDescription:
    'Analyse des SCPI internationales : distinction avec les SCPI européennes, zones géographiques, risque de change, fiscalité étrangère, stabilité juridique, diversification réelle vs marketing, points de vigilance.',
  shortAnswerTitle: 'Qu\'est-ce qu\'une SCPI internationale ?',
  shortAnswer:
    'Une SCPI internationale investit dans des actifs immobiliers situés hors de France. On distingue les SCPI européennes (investissement dans l\'Union Européenne ou l\'EEE) et les SCPI internationales (investissement hors Europe, voire hors UE). La diversification internationale peut réduire le risque lié à un seul marché immobilier, mais elle ajoute des risques spécifiques : risque de change, fiscalité étrangère, stabilité juridique et politique, complexité de gestion. Certaines SCPI utilisent le terme « international » de manière marketing alors qu\'elles sont principalement européennes.',
  keyMessage:
    'La diversification internationale est un argument sérieux, mais elle doit être vérifiée : répartition réelle des actifs, risque de change, fiscalité, stabilité juridique. Ne pas confondre « européen » et « international ».',
  definitionParagraphs: [
    'Les SCPI européennes investissent dans des actifs situés dans l\'Union Européenne ou l\'Espace Économique Européen. Elles bénéficient d\'un cadre juridique et fiscal harmonisé, de marchés immobiliers matures et d\'une stabilité politique relative.',
    'Les SCPI internationales investissent hors d\'Europe (Amérique du Nord, Asie, Moyen-Orient, etc.). Elles offrent une diversification géographique plus large mais avec des risques supplémentaires : risque de change, fiscalité non harmonisée, cadre juridique différent, stabilité politique variable.',
    'La diversification internationale réelle se mesure par le nombre de pays, la répartition des actifs, et l\'exposition réelle hors zone euro. Une SCPI qui investit 5 % de son actif hors Europe et se présente comme « internationale » utilise davantage un argument marketing qu\'une réelle diversification.',
    'Le risque de change est un facteur important pour les SCPI internationales. Les revenus perçus dans une devise étrangère peuvent varier avec le taux de change, ce qui ajoute une volatilité supplémentaire au rendement.',
    'La fiscalité des revenus étrangers varie selon les pays. Certains pays appliquent une retenue à la source, d\'autres non. Les conventions fiscales peuvent éviter la double imposition, mais la complexité déclarative est accrue.',
  ],
  tableTitle: 'Type d\'exposition / Opportunité / Risque / À vérifier',
  tableRows: [
    {
      level: 'SCPI européenne (UE/EEE)',
      advantage: 'Marchés immobiliers matures, cadre juridique stable, fiscalité harmonisée ou conventionnée.',
      vigilance: 'Rendements parfois plus faibles sur les marchés matures. Concurrence élevée sur les actifs premium.',
    },
    {
      level: 'SCPI internationale (hors Europe)',
      advantage: 'Diversification maximale. Accès à des marchés à forte croissance. Potentiel de rendement plus élevé.',
      vigilance: 'Risque de change. Fiscalité étrangère. Stabilité juridique et politique à vérifier. Complexité de gestion.',
    },
    {
      level: 'SCPI « internationale » à dominante européenne',
      advantage: 'Argument marketing : la SCPI se présente comme internationale mais investit principalement en Europe.',
      vigilance: 'Vérifier la répartition réelle des actifs. Si l\'exposition hors Europe est marginale, la diversification est limitée.',
    },
    {
      level: 'SCPI multi-zones (Europe + international)',
      advantage: 'Diversification géographique large. Mutualisation des risques entre zones.',
      vigilance: 'Complexité de gestion accrue. Suivi des performances par zone. Transparence nécessaire.',
    },
  ],
  tableNote:
    'Ces repères sont des simulations indicatives. Aucune promesse de rendement ou de performance.',
  criteriaTitle: 'Points à vérifier avant d\'investir dans une SCPI internationale',
  criteriaCards: [
    { title: 'Répartition réelle', text: 'Vérifier la part exacte des actifs hors France et hors Europe dans le rapport annuel.' },
    { title: 'Risque de change', text: 'Si la SCPI investit dans des pays hors zone euro, le risque de change peut impacter le rendement.' },
    { title: 'Fiscalité étrangère', text: 'Les revenus étrangers peuvent subir une retenue à la source. Vérifier les conventions fiscales.' },
    { title: 'Stabilité juridique', text: 'Le cadre juridique et la protection des investisseurs varient selon les pays.' },
    { title: 'Qualité des actifs', text: 'Analyser la qualité des immeubles, des locataires et des marchés immobiliers locaux.' },
    { title: 'Liquidité', text: 'La liquidité des parts peut être impactée par la complexité de la gestion internationale.' },
    { title: 'Transparence', text: 'La société de gestion doit fournir une information claire sur la répartition géographique et les risques.' },
  ],
  commonErrors: [
    'Confondre SCPI européenne et SCPI internationale.',
    'Investir dans une SCPI « internationale » sans vérifier la répartition réelle des actifs.',
    'Sous-estimer le risque de change dans les SCPI investies hors zone euro.',
    'Ignorer la fiscalité étrangère et les contraintes déclaratives.',
    'Investir dans une SCPI internationale sans analyser la stabilité juridique des pays cibles.',
    'Croire que « internationale » signifie automatiquement mieux diversifié.',
  ],
  practicalCases: [
    {
      title: 'SCPI européenne vs internationale',
      text: 'Deux SCPI : l\'une investit en Europe (5 pays UE), l\'autre investit en Europe + Amérique du Nord (10 % de l\'actif). Simulation pédagogique : la SCPI européenne offre une diversification homogène avec un cadre fiscal maîtrisé. La SCPI « internationale » apporte une diversification supplémentaire marginale (10 %) avec un risque de change et une complexité fiscale supplémentaire. Simulation non contractuelle.',
    },
    {
      title: 'SCPI « internationale » à vérifier',
      text: 'Une SCPI se présente comme internationale mais 95 % de ses actifs sont en France et 5 % dans un seul pays européen. Simulation pédagogique : la diversification internationale réelle est très limitée. Le terme « international » relève davantage du marketing. Vérifier les chiffres dans le rapport annuel. Simulation non contractuelle.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI fournit des repères pédagogiques sur les secteurs immobiliers des SCPI.',
    'La diversification internationale doit être vérifiée dans les documents réglementaires (rapport annuel, DIC).',
    'Consulter le comparateur MaximusSCPI pour visualiser les indicateurs clés des SCPI.',
  ],
  conclusionParagraphs: [
    'Les SCPI internationales offrent une diversification géographique potentiellement intéressante, mais il est essentiel de vérifier la répartition réelle des actifs, les risques de change et la fiscalité applicable. Le terme « international » n\'est pas un gage de qualité ou de diversification.',
    'Sources et points à vérifier : rapport annuel, DIC, répartition géographique détaillée, conventions fiscales.',
    'Utilisez le comparateur MaximusSCPI pour comparer les SCPI, puis validez votre projet avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Quelle est la différence entre SCPI européenne et internationale ?',
      answer: 'Les SCPI européennes investissent dans l\'UE/EEE, les SCPI internationales peuvent investir hors d\'Europe. La distinction est importante pour l\'analyse des risques.',
    },
    {
      question: 'Les SCPI internationales sont-elles plus risquées ?',
      answer: 'Elles présentent des risques supplémentaires : risque de change, fiscalité étrangère, stabilité juridique. La diversification peut réduire certains risques mais en ajoute d\'autres.',
    },
    {
      question: 'Comment vérifier la répartition internationale d\'une SCPI ?',
      answer: 'Consulter le rapport annuel et le DIC. La répartition géographique détaillée y est généralement présentée.',
    },
    {
      question: 'Le terme « international » est-il réglementé ?',
      answer: 'Non, il n\'est pas réglementé. Une SCPI peut se présenter comme internationale avec une exposition très limitée hors de France.',
    },
    {
      question: 'Faut-il investir dans une SCPI internationale ?',
      answer: 'Cela dépend de votre objectif de diversification, de votre tolérance au risque et de votre capacité à analyser les risques spécifiques. À discuter avec un conseiller.',
    },
  ],
}
