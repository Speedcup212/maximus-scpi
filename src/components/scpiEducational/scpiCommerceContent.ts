import type { ScpiEducationalPageConfig } from './shared'

export const scpiCommerceConfig: ScpiEducationalPageConfig = {
  path: '/scpi-commerce',
  badge: 'Secteur commerce',
  h1: 'SCPI commerce : emplacement, typologie et qualité locative',
  heroSubtitle:
    'Le secteur commerce n\'est pas homogène : commerces alimentaires de proximité, retail parks, pieds d\'immeubles, centres commerciaux. L\'analyse doit porter sur l\'emplacement, la typologie, les locataires, la durée des baux et le risque de vacance. Une SCPI commerce peut être pertinente si les actifs sont de qualité.',
  seoTitle: 'SCPI commerce : avantages, risques, rendement et analyse',
  seoDescription:
    'Analyse complète des SCPI commerce : murs de magasins, retail parks, commerces alimentaires de proximité, centres commerciaux, emplacement, rendement, vacance, e-commerce, baux, cas pratiques et grille d\'analyse.',
  shortAnswerTitle: 'Les SCPI commerce sont-elles toujours pertinentes ?',
  shortAnswer:
    'Les SCPI commerce ne sont pas un secteur homogène. Les commerces alimentaires de proximité, les pieds d\'immeubles et les retail parks bien situés résistent mieux à la concurrence du e-commerce. Les centres commerciaux non repositionnés et les commerces non essentiels sont plus exposés. L\'analyse doit porter sur l\'emplacement précis, la typologie des commerces (alimentaire vs non alimentaire), la qualité des locataires (enseignes nationales vs indépendants), la durée des baux et l\'évolution de la zone de chalandise.',
  keyMessage:
    'Une SCPI commerce peut être pertinente si les emplacements, les locataires et la stratégie sont solides. Le secteur doit être analysé finement, pas globalement.',
  definitionParagraphs: [
    'Une SCPI commerce investit dans l\'immobilier commercial : murs de magasins, pieds d\'immeubles, retail parks, centres commerciaux, commerces alimentaires, galeries marchandes.',
    'Le secteur commerce a été profondément transformé par le e-commerce. Les commerces de proximité (alimentaire, services du quotidien) résistent mieux que les commerces non essentiels (habillement, équipement).',
    'L\'emplacement est le critère déterminant : un commerce situé dans une zone de flux, avec une bonne visibilité et une accessibilité facile, a plus de chances de rester attractif quelle que soit la conjoncture.',
    'Les baux commerciaux sont généralement longs (6-12 ans) avec des clauses de révision et de renouvellement. La qualité du locataire et sa solidité financière sont essentielles pour la régularité des loyers.',
    'Les retail parks (parcs d\'activités commerciales) ont connu un développement important. Ils offrent des surfaces plus grandes avec des locataires souvent solides (enseignes nationales), mais dépendent de l\'accès automobile.',
    'Le commerce alimentaire de proximité est considéré comme le plus résistant, car la demande est régulière, indépendante des cycles économiques et peu sensible au e-commerce.',
  ],
  tableTitle: 'Type de commerce / Atout potentiel / Vigilance / Indicateurs à croiser',
  tableRows: [
    {
      level: 'Commerce alimentaire de proximité',
      advantage: 'Demande régulière, résistance au e-commerce, baux longs, loyers stables.',
      vigilance: 'Valorisation élevée, rendement potentiellement plus faible. Dépend de l\'attractivité du quartier.',
    },
    {
      level: 'Pieds d\'immeubles (centre-ville)',
      advantage: 'Emplacement central, flux piétonniers, bonne visibilité, potentiel de valorisation.',
      vigilance: 'Dépendant de l\'attractivité de la rue ou du quartier. Risque de vacance si la fréquentation baisse.',
    },
    {
      level: 'Retail parks',
      advantage: 'Locataires solides (enseignes nationales), surfaces adaptées, baux longs.',
      vigilance: 'Dépendance à l\'automobile, concurrence entre parcs, risque de vacance sur les grandes surfaces.',
    },
    {
      level: 'Centres commerciaux',
      advantage: 'Fréquentation potentiellement élevée, mix de commerces.',
      vigilance: 'Exposition au e-commerce, coûts de gestion élevés, besoin d\'adaptation constant, risque de vacance.',
    },
    {
      level: 'Commerces non essentiels (habillement, équipement)',
      advantage: 'Loyers potentiellement plus élevés en période faste.',
      vigilance: 'Forte exposition au e-commerce et aux cycles économiques. Risque de vacance élevé en période difficile.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Chaque actif commercial doit être analysé individuellement.',
  criteriaTitle: 'Critères d\'analyse des SCPI commerce',
  criteriaCards: [
    { title: 'Emplacement', text: 'Flux piétonniers, visibilité, accessibilité (transports, parking), dynamisme commercial de la zone.' },
    { title: 'Typologie', text: 'Alimentaire, services, non alimentaire. Les commerces essentiels résistent mieux aux cycles économiques et au e-commerce.' },
    { title: 'Qualité du locataire', text: 'Solidité financière, enseigne nationale ou locale, diversification des locataires, clauses de révision.' },
    { title: 'Durée des baux', text: 'Baux longs (6-12 ans) avec clauses de révision et de renouvellement. Baux 3/6/9 pour certains commerces.' },
    { title: 'TOF', text: 'Un TOF élevé et stable est rassurant. Analyser l\'évolution sur plusieurs trimestres.' },
    { title: 'Exposition au e-commerce', text: 'Analyser la vulnérabilité du secteur aux achats en ligne. Les commerces de services et alimentaires sont moins exposés.' },
    { title: 'Valorisation', text: 'Comparer le prix de souscription à la VR. Les actifs commerciaux de qualité peuvent justifier une surcote modérée.' },
  ],
  commonErrors: [
    'Considérer que tout le commerce est fragilisé par le e-commerce de manière uniforme.',
    'Ignorer l\'emplacement précis des actifs commerciaux.',
    'Ne pas vérifier la typologie des commerces (alimentaire vs non alimentaire).',
    'Sous-estimer le risque de vacance dans les centres commerciaux non repositionnés.',
    'Investir dans une SCPI commerce sans analyser la qualité des locataires et leur diversification.',
    'Confondre commerce de proximité résilient et commerce non essentiel cyclique.',
  ],
  practicalCases: [
    {
      title: 'Commerce alimentaire de proximité — résilience',
      text: 'Une SCPI commerce de 500 M€ investie dans des commerces alimentaires de proximité et des pieds d\'immeubles. TOF stable à 97 %, locataires solides (enseignes nationales). Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Retail park bien situé — bonne occupation',
      text: 'Une SCPI commerce investie dans des retail parks avec des locataires solides (jardinerie, sport, alimentaire, culture). TOF stable à 94 %. Simulation pédagogique : le retail park bien conçu et diversifié peut offrir un bon équilibre.',
    },
    {
      title: 'Centre commercial en tension',
      text: 'Une SCPI commerce concentrée sur les centres commerciaux régionaux voit son TOF baisser de 94 % à 85 % sous l\'effet du e-commerce et des changements de consommation. Simulation pédagogique : les centres commerciaux non repositionnés sont plus exposés.',
    },
    {
      title: 'Commerce de centre-ville bien placé',
      text: 'Un pied d\'immeuble dans une rue commerçante passante avec un locataire national (banque, enseigne alimentaire). Bail long, loyer régulier. Simulation pédagogique : l\'emplacement et la qualité du locataire sont déterminants.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI commerce selon plusieurs critères : localisation, typologie, qualité des locataires, TOF, endettement.',
    'La méthode MaximusSCPI distingue les sous-secteurs (alimentaire, centres commerciaux, retail parks) pour une analyse fine.',
    'La comparaison avec les autres secteurs permet de vérifier la cohérence de l\'allocation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse.',
  ],
  conclusionParagraphs: [
    'Les SCPI commerce ne sont pas un secteur homogène. Certaines typologies (alimentaire, proximité, retail parks bien situés) résistent bien, d\'autres sont plus exposées. L\'analyse fine du patrimoine est indispensable.',
    'Sources et points à vérifier : DIC, note d\'information, rapport annuel, ventilation par typologie de commerce, qualité des locataires, durée des baux.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI commerce, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI commerce ?',
      answer: 'Une SCPI spécialisée dans l\'immobilier commercial : murs de magasins, pieds d\'immeubles, retail parks, centres commerciaux.',
    },
    {
      question: 'Les commerces sont-ils risqués en 2026 ?',
      answer: 'Cela dépend de la typologie et de l\'emplacement. Les commerces alimentaires de proximité résistent bien. Les centres commerciaux non repositionnés sont plus exposés.',
    },
    {
      question: 'Quel est l\'impact du e-commerce sur les SCPI commerce ?',
      answer: 'Le e-commerce fragilise les commerces non essentiels et les centres commerciaux. Les commerces de proximité et alimentaires sont moins impactés.',
    },
    {
      question: 'Quels commerces sont les plus résistants ?',
      answer: 'L\'alimentaire, les services de proximité, la santé (pharmacies, opticiens), les commerces essentiels du quotidien.',
    },
    {
      question: 'Quelle différence entre retail park et centre commercial ?',
      answer: 'Le retail park est un ensemble de commerces de plein air avec parking, généralement avec des locataires solides. Le centre commercial est un espace fermé avec des coûts de gestion plus élevés.',
    },
    {
      question: 'Comment analyser le rendement d\'une SCPI commerce ?',
      answer: 'Comparer le TDVM net de fiscalité et de frais, en tenant compte de la typologie des commerces, de la durée des baux et du risque de vacance.',
    },
    {
      question: 'Faut-il diversifier avec des SCPI commerce ?',
      answer: 'Oui, le commerce de qualité peut être un complément pertinent dans une allocation multi-secteurs, à condition de sélectionner les actifs avec soin.',
    },
    {
      question: 'Quels sont les signaux de vigilance pour une SCPI commerce ?',
      answer: 'TOF en baisse, locataires fragiles, concentration sur des commerces non essentiels, centres commerciaux sans repositionnement.',
    },
    {
      question: 'Les baux commerciaux sont-ils fiables ?',
      answer: 'Les baux 3/6/9 ou les baux longs (6-12 ans) offrent une visibilité, mais la solidité du locataire est aussi importante que la durée du bail.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI commerce ?',
      answer: 'Le comparateur affiche les indicateurs clés. Les contenus pédagogiques aident à comprendre les spécificités de chaque sous-secteur.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI commerce selon l\'emplacement et la qualité locative',
}
