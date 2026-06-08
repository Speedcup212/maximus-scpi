import type { ScpiEducationalPageConfig } from './shared'

export const demembrementScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-demembrement',
  badge: 'Mode d’investissement',
  h1: 'SCPI en démembrement : comprendre la nue-propriété avant d\'investir',
  heroSubtitle:
    'Le démembrement de SCPI consiste à séparer temporairement la nue-propriété de l\'usufruit. L\'investisseur en nue-propriété acquiert les parts à un prix décoté mais ne perçoit pas de revenus pendant la durée du démembrement. C\'est une piste à approfondir pour les investisseurs sans besoin immédiat de revenus, préparant leur retraite ou la transmission de leur patrimoine.',
  seoTitle: 'SCPI en démembrement : fiscalité, décote, durée et stratégie patrimoniale',
  seoDescription:
    'Comprenez le démembrement de SCPI : nue-propriété, usufruit, décote, fiscalité, durée, absence de revenus temporaires et critères à analyser avant d\'investir.',
  shortAnswerTitle: 'Pourquoi envisager le démembrement de SCPI ?',
  shortAnswer:
    'Le démembrement permet d\'acquérir des parts de SCPI à un prix inférieur à la pleine propriété, grâce à une décote qui compense l\'absence temporaire de revenus. À l\'issue de la période — généralement 5 à 15 ans selon les clés de démembrement — l\'investisseur récupère la pleine propriété sans coût supplémentaire. L\'intérêt est double : limiter la fiscalité sur les revenus pendant la durée du démembrement (aucun revenu perçu) et bénéficier d\'un prix d\'entrée réduit. En contrepartie, la liquidité est limitée et l\'horizon d\'investissement doit être compatible avec la durée choisie.',
  keyMessage:
    'Le démembrement n\'améliore pas magiquement la qualité d\'une SCPI. Il modifie le calendrier des revenus, la fiscalité et le prix d\'entrée.',
  definitionParagraphs: [
    'Le démembrement de SCPI est une opération qui sépare la propriété d\'une part en deux composantes : la nue-propriété (le capital) et l\'usufruit (le droit de percevoir les revenus et d\'utiliser le bien). Pendant la durée du démembrement, l\'usufruitier perçoit les loyers et l\'associé en nue-propriété ne reçoit aucun revenu.',
    'À l\'issue de la période fixée — généralement 5, 7, 8, 10 ou 15 ans selon les clés de démembrement proposées par la société de gestion — la nue-propriété et l\'usufruit se reconstituent automatiquement. L\'associé récupère alors la pleine propriété de ses parts et perçoit l\'intégralité des revenus futurs.',
    'Le prix d\'acquisition d\'une part en nue-propriété est inférieur au prix de souscription en pleine propriété. La décote — souvent comprise entre 10 % et 35 % selon la durée et les conditions de marché — reflète la valeur des revenus non perçus pendant la période. Elle n\'est ni un rachat ni une réduction sur la qualité du patrimoine sous-jacent.',
    'Le démembrement ne supprime pas la fiscalité : il la déplace dans le temps. Pendant la période, l\'associé en nue-propriété n\'a pas de revenus à déclarer (hors éventuels boni de démembrement selon les montages). À la reconstitution, les distributions sont imposées dans les conditions de droit commun, selon la TMI et le régime fiscal de la SCPI.',
    'La liquidité de la nue-propriété est plus limitée que celle de la pleine propriété. La revente pendant la période peut être possible sur le marché secondaire, mais l\'associé doit trouver un acquéreur acceptant la nue-propriété pour la durée restante. Cette contrainte renforce la nécessité d\'un horizon compatible.',
    'La qualité de la SCPI sous-jacente reste déterminante. Le démembrement est une enveloppe : il ne transforme pas une SCPI fragile en bon investissement. Le TOF, la capitalisation, l\'endettement, la décote ou surcote, les frais et la régularité des distributions doivent être analysés comme pour un investissement en pleine propriété.',
  ],
  tableTitle: 'Quel intérêt du démembrement selon le profil investisseur ?',
  tableRows: [
    {
      level: 'TMI 30 % ou plus',
      advantage:
        'Économie fiscale pendant la durée : aucun revenu à déclarer, le rendement est capitalisé dans la valeur de la part.',
      vigilance:
        'L\'économie d\'impôt ne compense pas une mauvaise sélection de SCPI. Analyser TOF, endettement et gestionnaire.',
    },
    {
      level: 'Sans besoin immédiat de revenus',
      advantage:
        'Profil adapté : le démembrement évite de payer de l\'impôt sur des revenus non perçus.',
      vigilance:
        'S\'assurer que la durée de démembrement est compatible avec les besoins futurs de revenus.',
    },
    {
      level: 'Préparation de la retraite',
      advantage:
        'Reconstitution de la pleine propriété à l\'approche de la retraite : les revenus arrivent quand le besoin devient présent.',
      vigilance:
        'Anticiper la fiscalité des revenus à la reconstitution selon la TMI prévisible.',
    },
    {
      level: 'Transmission patrimoniale',
      advantage:
        'Décote d\'acquisition et absence de revenus peuvent réduire l\'assiette successorale.',
      vigilance:
        'La transmission des parts en nue-propriété relève du droit commun. Consulter un notaire.',
    },
    {
      level: 'Horizon court (< 5 ans)',
      advantage:
        'Généralement peu adapté : la décote ne compense pas suffisamment l\'absence de revenus sur une période courte.',
      vigilance:
        'Privilégier la pleine propriété pour un horizon court.',
    },
  ],
  tableNote:
    'Ces profils sont des repères pédagogiques indicatifs. L\'analyse de la SCPI sous-jacente et la compatibilité avec l\'horizon priment sur l\'optimisation fiscale.',
  criteriaTitle: 'Critères à croiser avec le démembrement',
  criteriaCards: [
    { title: 'Qualité de la SCPI sous-jacente', text: 'Le démembrement est une enveloppe : TOF, capitalisation, endettement, décote/surcote et rendement doivent être analysés comme en pleine propriété.' },
    { title: 'Durée du démembrement', text: 'Plus la durée est longue, plus la décote est élevée, mais plus l\'absence de revenus est longue. Vérifier la cohérence avec l\'horizon personnel.' },
    { title: 'Décote proposée', text: 'Comparer la décote avec les clés de démembrement du marché. Une décote anormalement élevée peut cacher une moins-value potentielle à la reconstitution.' },
    { title: 'Frais', text: 'Frais de souscription et de gestion identiques à la pleine propriété. Vérifier les frais de rachat anticipé ou de sortie avant terme.' },
    { title: 'Rendement de la SCPI', text: 'Le rendement futur à la reconstitution dépend des performances de la SCPI. Analyser la régularité des distributions passées.' },
    { title: 'Liquidité', text: 'La revente en nue-propriété pendant la période peut être plus complexe qu\'en pleine propriété. Anticiper cette contrainte.' },
    { title: 'Fiscalité', text: 'Pas de revenus pendant la durée, mais la fiscalité s\'applique à la reconstitution. Simuler l\'impact selon la TMI future.' },
    { title: 'Société de gestion', text: 'La solidité du gestionnaire et sa transparence sur les conditions de démembrement sont des critères de crédibilité.' },
  ],
  commonErrors: [
    'Considérer que le démembrement est un investissement sans risque fiscal.',
    'Choisir une SCPI uniquement parce qu\'elle est disponible en démembrement sans analyser sa qualité intrinsèque.',
    'Ignorer l\'absence totale de revenus pendant la durée du démembrement.',
    'Sous-estimer la contrainte de liquidité de la nue-propriété.',
    'Croire que la décote compense automatiquement le risque immobilier.',
    'Ne pas vérifier la durée minimale de conservation et les conditions de sortie.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — démembrement 10 ans, TMI 30 %, décote 25 %',
      text: 'Un investisseur en TMI 30 % acquiert en nue-propriété pour 10 ans avec une décote de 25 %. Pas de revenus perçus pendant la période, et pas de fiscalité sur des revenus inexistants. À la reconstitution, la pleine propriété est récupérée sans frais. Simulation pédagogique : la qualité de la SCPI sous-jacente reste le critère déterminant.',
    },
    {
      title: 'SCPI B — démembrement 7 ans, besoin futur de revenus',
      text: 'Un investisseur sans besoin immédiat de revenus place en nue-propriété 7 ans, anticipant une retraite à cet horizon. Les revenus commenceront à la reconstitution. La décote de 18 % compense l\'absence de distributions. L\'analyse doit porter sur la régularité des distributions passées.',
    },
    {
      title: 'SCPI C — démembrement 5 ans, décote insuffisante',
      text: 'Sur une courte durée, la décote proposée (12 %) peut être insuffisante pour compenser le risque et l\'absence de revenus. L\'investisseur doit comparer avec une acquisition en pleine propriété sur le même horizon. Simulation pédagogique : le démembrement court n\'est pas toujours pertinent.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse le démembrement comme un mode d\'investissement parmi d\'autres, sans le présenter comme supérieur. La pré-orientation intègre la durée, la décote, la qualité de la SCPI sous-jacente et l\'horizon de l\'investisseur.',
    'La première étape consiste à vérifier la compatibilité de l\'horizon : pas de besoin de revenus pendant toute la durée du démembrement.',
    'La deuxième étape analyse la SCPI sous-jacente comme si l\'acquisition était en pleine propriété : TOF, capitalisation, endettement, décote/surcote, rendement et frais.',
    'La troisième étape compare la décote proposée avec les clés de marché et vérifie la crédibilité du gestionnaire.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de valider la cohérence du démembrement avec la situation patrimoniale et fiscale réelle.',
  ],
  conclusionParagraphs: [
    'Le démembrement de SCPI est un outil patrimonial intéressant pour les profils sans besoin immédiat de revenus, mais il ne dispense pas d\'une analyse rigoureuse de la SCPI sous-jacente. La durée, la décote, la qualité du patrimoine et la fiscalité future sont les critères à croiser.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI disponibles en démembrement, puis validez votre pré-orientation avec un conseiller pour une simulation adaptée à votre horizon et à votre situation.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le démembrement de SCPI ?',
      answer: 'Le démembrement est une opération qui sépare temporairement la nue-propriété (le capital) de l\'usufruit (les revenus). L\'investisseur en nue-propriété acquiert des parts à un prix décoté, ne perçoit pas de revenus pendant la période, puis récupère la pleine propriété à l\'issue du terme.',
    },
    {
      question: 'Quelle différence entre nue-propriété et usufruit ?',
      answer: 'Le nu-propriétaire détient le capital mais ne perçoit pas les revenus pendant la période de démembrement. L\'usufruitier perçoit les loyers et peut utiliser le bien. À la reconstitution, le nu-propriétaire récupère la pleine propriété et perçoit l\'intégralité des revenus futurs.',
    },
    {
      question: 'Pourquoi acheter des SCPI en nue-propriété ?',
      answer: 'Pour bénéficier d\'un prix d\'acquisition décoté (10 % à 35 % selon la durée), ne pas déclarer de revenus pendant la période, et récupérer la pleine propriété à terme sans coût supplémentaire. L\'intérêt est patrimonial et fiscal, pas un rendement immédiat.',
    },
    {
      question: 'Quelle durée choisir ?',
      answer: 'La durée dépend de l\'horieur d\'investissement et de l\'absence de besoin de revenus. Les durées courantes sont 5, 7, 8, 10 ou 15 ans. Plus la durée est longue, plus la décote est élevée, mais plus l\'absence de revenus est longue.',
    },
    {
      question: 'Le démembrement supprime-t-il la fiscalité ?',
      answer: 'Il la déplace dans le temps. Aucun revenu à déclarer pendant la période, ce qui évite l\'impôt sur les distributions. À la reconstitution, les revenus sont imposés selon la TMI et le régime fiscal de la SCPI. L\'économie d\'impôt n\'est pas une exonération définitive.',
    },
    {
      question: 'Peut-on revendre une nue-propriété de SCPI ?',
      answer: 'Oui, sur le marché secondaire, mais la liquidité est plus limitée qu\'en pleine propriété. L\'acquéreur doit accepter la nue-propriété pour la durée restante, ce qui peut restreindre le pool d\'acheteurs potentiels.',
    },
    {
      question: 'Quels risques faut-il analyser ?',
      answer: 'Les mêmes qu\'en pleine propriété : baisse du TOF, endettement, décote, frais, et qualité du gestionnaire. Le démembrement n\'élimine pas les risques immobiliers ni financiers.',
    },
    {
      question: 'Comment MaximusSCPI analyse le démembrement ?',
      answer: 'Le démembrement est présenté comme une piste à approfondir, pas comme une recommandation. MaximusSCPI compare les indicateurs des SCPI disponibles en démembrement et encourage une analyse personnalisée avec un conseiller.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI disponibles en démembrement',
}
