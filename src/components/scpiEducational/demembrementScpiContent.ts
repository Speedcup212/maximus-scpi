import type { ScpiEducationalPageConfig } from './shared'

export const demembrementScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-demembrement',
  badge: 'Mode d\'investissement',
  h1: 'SCPI en démembrement : comprendre la nue-propriété avant d\'investir',
  heroSubtitle:
    'Le démembrement de SCPI consiste à séparer temporairement la nue-propriété de l\'usufruit. L\'investisseur en nue-propriété acquiert les parts à un prix décoté mais ne perçoit pas de revenus pendant la durée du démembrement. À l\'issue de la période, la pleine propriété est récupérée automatiquement. C\'est une piste à approfondir pour les investisseurs sans besoin immédiat de revenus, préparant leur retraite ou la transmission de leur patrimoine.',
  seoTitle: 'SCPI démembrement : nue-propriété, durée, décote, fiscalité et transmission',
  seoDescription:
    'Analyse complète du démembrement de SCPI : définition nue-propriété et usufruit, décote, durée, absence de revenus, intérêt fiscal (TMI 30 %, 41 %, 45 %), liquidité, transmission, transmission. Exemple chiffré, tableau durée/décote, cas pratiques par profil.',
  shortAnswerTitle: 'Pourquoi envisager le démembrement de SCPI ?',
  shortAnswer:
    'Le démembrement permet d\'acquérir des parts de SCPI à un prix inférieur à la pleine propriété, grâce à une décote qui compense l\'absence temporaire de revenus. À l\'issue de la période fixée — généralement 5 à 15 ans selon les clés de démembrement — l\'investisseur récupère la pleine propriété sans coût supplémentaire. L\'intérêt est double : limiter la fiscalité sur les revenus pendant la durée du démembrement (aucun revenu perçu, donc aucun impôt à déclarer) et bénéficier d\'un prix d\'entrée réduit. En contrepartie, la liquidité est limitée et l\'horizon d\'investissement doit être compatible avec la durée choisie. La décote n\'est pas un cadeau : elle est la contrepartie mathématique des revenus non perçus.',
  keyMessage:
    'Le démembrement n\'améliore pas magiquement la qualité d\'une SCPI. Il modifie le calendrier des revenus, la fiscalité et le prix d\'entrée. La qualité de la SCPI sous-jacente reste primordiale.',
  definitionParagraphs: [
    'Le démembrement de SCPI est une opération qui sépare la propriété d\'une part en deux composantes : la nue-propriété (le capital) et l\'usufruit (le droit de percevoir les revenus et d\'utiliser le bien). Pendant la durée du démembrement, l\'usufruitier perçoit les loyers et l\'associé en nue-propriété ne reçoit aucun revenu.',
    'À l\'issue de la période fixée — généralement 5, 7, 8, 10 ou 15 ans selon les clés de démembrement proposées par la société de gestion — la nue-propriété et l\'usufruit se reconstituent automatiquement. L\'associé récupère alors la pleine propriété de ses parts et perçoit l\'intégralité des revenus futurs sans coût ni fiscalité supplémentaires.',
    'Le prix d\'acquisition d\'une part en nue-propriété est inférieur au prix de souscription en pleine propriété. La décote — souvent comprise entre 10 % et 35 % selon la durée et les conditions de marché — reflète la valeur actualisée des revenus non perçus pendant la période. Elle n\'est ni une remise ni une réduction sur la qualité du patrimoine sous-jacent.',
    'Le démembrement ne supprime pas la fiscalité : il la déplace dans le temps. Pendant la période, l\'associé en nue-propriété n\'a pas de revenus à déclarer (hors éventuels boni de démembrement selon les montages). À la reconstitution de la pleine propriété, les distributions sont imposées dans les conditions de droit commun, selon la TMI et le régime fiscal de la SCPI à ce moment-là.',
    'La liquidité de la nue-propriété est plus limitée que celle de la pleine propriété. La revente pendant la période est possible sur le marché secondaire, mais l\'associé doit trouver un acquéreur acceptant de détenir la nue-propriété pour la durée restante. Cette contrainte renforce la nécessité d\'un horizon compatible.',
    'La qualité de la SCPI sous-jacente reste déterminante. Le démembrement est une enveloppe : il ne transforme pas une SCPI fragile en bon investissement. Le TOF, la capitalisation, l\'endettement, la décote ou surcote, les frais et la régularité des distributions doivent être analysés comme pour un investissement en pleine propriété.',
    'Pour un investisseur fortement imposé (TMI 41 % ou 45 %), le démembrement peut présenter un intérêt fiscal significatif : l\'absence de revenus évite l\'imposition à un taux marginal élevé. Combiné à une décote à l\'entrée, le mécanisme peut améliorer le rendement net global, sans constituer une solution universelle.',
    'L\'intérêt du démembrement ne se limite pas à la fiscalité. Il peut aussi s\'inscrire dans une stratégie de préparation de retraite (reconstitution de la pleine propriété à l\'âge de la retraite) ou de transmission (réduction potentielle de l\'assiette successorale via la décote d\'acquisition).',
  ],
  tableTitle: 'Durée / Intérêt potentiel / Vigilance',
  tableRows: [
    {
      level: '5 ans',
      advantage:
        'Décote modérée (10-15 %). Période courte d\'absence de revenus. Convient à un horizon intermédiaire sans besoin immédiat de revenus.',
      vigilance:
        'La décote peut être insuffisante pour compenser pleinement l\'absence de revenus et le risque. Comparer avec un investissement en pleine propriété.',
    },
    {
      level: '7-8 ans',
      advantage:
        'Décote de 15 à 25 %. Bon compromis entre durée et décote. Permet de préparer un horizon retraite ou un projet à moyen terme.',
      vigilance:
        'Vérifier que la qualité de la SCPI sous-jacente justifie l\'opération. Analyser la régularité des distributions passées.',
    },
    {
      level: '10 ans',
      advantage:
        'Décote de 20 à 30 %. Durée cohérente avec un objectif de préparation de retraite. Économie d\'impôt significative aux TMI élevées.',
      vigilance:
        'Horizon long : s\'assurer qu\'aucun besoin de revenus ne surviendra avant la reconstitution. La décote compense-t-elle bien l\'absence de revenus ?',
    },
    {
      level: '15 ans',
      advantage:
        'Décote de 25 à 35 %. Intérêt maximal pour la transmission ou la préparation retraite longue. Absence d\'imposition longue durée.',
      vigilance:
        'Horizon très long. Risque accru sur la qualité de la SCPI et la liquidité. L\'évolution de la fiscalité future est incertaine.',
    },
  ],
  tableNote:
    'Les décotes indiquées sont des repères indicatifs. Elles varient selon les SCPI, les conditions de marché et les clés de démembrement proposées par la société de gestion. La décote n\'est pas un indicateur de performance future.',
  criteriaTitle: 'Critères à croiser avec le démembrement',
  criteriaCards: [
    { title: 'Qualité de la SCPI', text: 'Le démembrement est une enveloppe. TOF, capitalisation, endettement, décote/surcote et rendement doivent être analysés comme en pleine propriété.' },
    { title: 'Durée du démembrement', text: 'Plus la durée est longue, plus la décote est élevée, mais plus l\'absence de revenus est longue. Vérifier la cohérence avec l\'horizon personnel.' },
    { title: 'Décote proposée', text: 'Comparer la décote avec les clés de démembrement du marché. Une décote anormalement élevée peut cacher une moins-value potentielle à la reconstitution.' },
    { title: 'Frais', text: 'Frais de souscription et de gestion identiques à la pleine propriété. Vérifier les frais de rachat anticipé ou de sortie avant terme.' },
    { title: 'Rendement de la SCPI', text: 'Le rendement futur à la reconstitution dépend des performances de la SCPI. Analyser la régularité des distributions passées.' },
    { title: 'Liquidité', text: 'La revente en nue-propriété pendant la période peut être plus complexe qu\'en pleine propriété. Anticiper cette contrainte dans la stratégie globale.' },
    { title: 'Fiscalité future', text: 'Pas de revenus pendant la durée, mais la fiscalité s\'applique à la reconstitution. Simuler l\'impact selon la TMI prévisible à l\'horizon de sortie.' },
    { title: 'Société de gestion', text: 'La solidité du gestionnaire et sa transparence sur les conditions de démembrement sont des critères de crédibilité à vérifier.' },
    { title: 'Évolution du prix de part', text: 'Le prix de part peut varier pendant la durée du démembrement. Analyser la politique de revalorisation et le risque de baisse.' },
    { title: 'IFI', text: 'Le traitement IFI de la nue-propriété peut différer de la pleine propriété. À vérifier selon les règles en vigueur.' },
  ],
  commonErrors: [
    'Considérer que le démembrement est un investissement sans risque fiscal.',
    'Choisir une SCPI uniquement parce qu\'elle est disponible en démembrement sans analyser sa qualité intrinsèque.',
    'Ignorer l\'absence totale de revenus pendant toute la durée du démembrement.',
    'Sous-estimer la contrainte de liquidité : la revente en nue-propriété est plus complexe.',
    'Croire que la décote compense automatiquement tous les risques (qualité de la SCPI, baisse du prix de part, vacance locative).',
    'Ne pas vérifier la durée minimale de conservation et les conditions de sortie anticipée.',
    'Opter pour un démembrement court (5 ans) sans vérifier que la décote est suffisante par rapport à l\'absence de revenus.',
    'Oublier que la fiscalité des revenus s\'appliquera à la reconstitution, à un taux qui peut avoir changé.',
  ],
  practicalCases: [
    {
      title: 'Exemple chiffré — Investissement 100 000 € en pleine propriété, clé indicative',
      text: 'Investissement théorique : 100 000 € en pleine propriété. Démembrement 10 ans : décote 25 %, prix d\'entrée en nue-propriété environ 75 000 €. Pendant 10 ans : aucun revenu perçu, donc aucune fiscalité sur les distributions. À la reconstitution : l\'investisseur récupère la pleine propriété des parts. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Investisseur TMI 30 % — 10 ans, préparation retraite',
      text: 'Un investisseur de 50 ans en TMI 30 % acquiert en nue-propriété une SCPI pour 10 ans. Il ne perçoit pas de revenus, ce qui lui évite l\'impôt à 47,2 % (30 % + 17,2 %) sur les distributions qu\'il n\'aurait pas perçues en pleine propriété. À 60 ans, il récupère la pleine propriété et commence à percevoir les revenus au moment où il envisage une baisse d\'activité. Simulation pédagogique : la cohérence avec l\'horizon retraite est le critère clé.',
    },
    {
      title: 'Investisseur TMI 41 % — Optimisation fiscale',
      text: 'Un investisseur en TMI 41 % (taux total ~58,2 % avec PS) place 100 000 € en nue-propriété SCPI sur 10 ans. L\'économie d\'impôt sur les revenus non perçus est significative. En direct, un TDVM de 5 % rapporterait environ 2,1 % net après impôt. Le démembrement neutralise cette fiscalité pendant 10 ans. Simulation pédagogique : piste à approfondir, pas une recommandation.',
    },
    {
      title: 'Investisseur sans besoin de revenus — Horizon 15 ans',
      text: 'Un investisseur de 45 ans n\'a pas besoin de revenus immédiats. Il place 150 000 € en démembrement 15 ans avec décote de 30 %. Son capital de départ investi est d\'environ 105 000 €. Pendant 15 ans, pas de revenus, pas d\'impôt. À 60 ans, il récupère la pleine propriété. Simulation pédagogique : le démembrement aligne le calendrier des revenus sur les besoins futurs.',
    },
    {
      title: 'Investisseur orienté transmission',
      text: 'Un investisseur acquiert des parts de SCPI en nue-propriété pour ses enfants. La décote d\'acquisition (30 %) réduit la valeur des parts transmises, ce qui peut diminuer l\'assiette des droits de succession. À la reconstitution ou au terme du démembrement, les enfants récupèrent la pleine propriété. Simulation pédagogique : consulter un notaire pour valider le montage.',
    },
    {
      title: 'Investisseur avec besoin de revenus immédiats — Démembrement non adapté',
      text: 'Un investisseur de 60 ans a besoin d\'un complément de revenus immédiat. Le démembrement n\'est pas adapté car il ne génère aucun revenu pendant la période. La pleine propriété ou l\'assurance-vie avec rachats programmés sont des pistes plus cohérentes. Simulation pédagogique : adapter le mode de détention aux besoins présents.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse le démembrement comme un mode d\'investissement parmi d\'autres, sans le présenter comme supérieur. La pré-orientation intègre la durée, la décote, la qualité de la SCPI sous-jacente et l\'horizon de l\'investisseur.',
    'La première étape consiste à vérifier la compatibilité de l\'horizon : pas de besoin de revenus pendant toute la durée du démembrement.',
    'La deuxième étape analyse la SCPI sous-jacente comme si l\'acquisition était en pleine propriété : TOF, capitalisation, endettement, décote/surcote, rendement et frais.',
    'La troisième étape compare la décote proposée avec les clés de marché et vérifie la crédibilité du gestionnaire sur le démembrement.',
    'La quatrième étape simule la fiscalité à la reconstitution : la TMI future peut être différente de la TMI actuelle. L\'économie d\'impôt immédiate ne doit pas masquer l\'imposition future.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de valider la cohérence du démembrement avec la situation patrimoniale et fiscale réelle.',
  ],
  conclusionParagraphs: [
    'Le démembrement de SCPI est un outil patrimonial intéressant pour les profils sans besoin immédiat de revenus, mais il ne dispense pas d\'une analyse rigoureuse de la SCPI sous-jacente. La durée, la décote, la qualité du patrimoine et la fiscalité future sont les critères à croiser.',
    'Sources et points à vérifier : note d\'information, bulletin trimestriel et rapport annuel de la SCPI, clés de démembrement communiquées par la société de gestion, DIC. Pour la fiscalité : impots.gouv.fr.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI disponibles en démembrement, puis validez votre pré-orientation avec un conseiller pour une simulation adaptée à votre horizon et à votre situation.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le démembrement de SCPI ?',
      answer: 'Le démembrement est une opération qui sépare temporairement la nue-propriété (le capital) de l\'usufruit (les revenus). L\'investisseur en nue-propriété acquiert des parts à un prix décoté, ne perçoit pas de revenus pendant la période, puis récupère la pleine propriété à l\'issue du terme.',
    },
    {
      question: 'Quelle différence entre nue-propriété et usufruit ?',
      answer: 'Le nu-propriétaire détient le capital mais ne perçoit pas les revenus pendant la période de démembrement. L\'usufruitier perçoit les loyers. À la reconstitution, le nu-propriétaire récupère la pleine propriété.',
    },
    {
      question: 'Pourquoi acheter des SCPI en nue-propriété ?',
      answer: 'Pour bénéficier d\'un prix d\'acquisition décoté (10 % à 35 % selon la durée), ne pas déclarer de revenus pendant la période (économie fiscale), et récupérer la pleine propriété à terme sans coût supplémentaire.',
    },
    {
      question: 'Quelle durée choisir ?',
      answer: 'La durée dépend de l\'horizon : 5, 7, 8, 10 ou 15 ans. Plus la durée est longue, plus la décote est élevée, mais plus l\'absence de revenus est longue. À choisir selon le besoin de revenus futur.',
    },
    {
      question: 'Le démembrement supprime-t-il toute fiscalité ?',
      answer: 'Non, il la déplace dans le temps. Aucun revenu à déclarer pendant la période. À la reconstitution, les distributions sont imposées selon la TMI et le régime fiscal applicables à ce moment.',
    },
    {
      question: 'Peut-on revendre une nue-propriété de SCPI ?',
      answer: 'Oui, sur le marché secondaire, mais la liquidité est plus limitée qu\'en pleine propriété. L\'acquéreur doit accepter la nue-propriété pour la durée restante.',
    },
    {
      question: 'Quels risques faut-il analyser ?',
      answer: 'Les mêmes qu\'en pleine propriété : baisse du TOF, endettement, décote, frais, qualité du gestionnaire. Le démembrement n\'élimine pas les risques immobiliers ni financiers.',
    },
    {
      question: 'Le démembrement est-il intéressant pour un investisseur qui a besoin de revenus ?',
      answer: 'Non, car il ne génère aucun revenu pendant toute la durée. La pleine propriété ou l\'assurance-vie avec rachats programmés sont plus adaptées.',
    },
    {
      question: 'Quel est l\'intérêt du démembrement pour la transmission ?',
      answer: 'La décote d\'acquisition réduit la valeur des parts transmises, ce qui peut diminuer l\'assiette des droits de succession. À valider avec un notaire.',
    },
    {
      question: 'Le démembrement est-il compatible avec l\'IFI ?',
      answer: 'Le traitement peut différer de la pleine propriété. La nue-propriété peut ne pas être imposable à l\'IFI selon la durée et les règles en vigueur. À vérifier.',
    },
    {
      question: 'Comment MaximusSCPI analyse le démembrement ?',
      answer: 'Le démembrement est présenté comme une piste à approfondir, pas comme une recommandation. Les indicateurs des SCPI disponibles en démembrement sont comparés avec les mêmes critères qu\'en pleine propriété.',
    },
  ],
  comparateurCtaLabel: 'Étudier la nue-propriété de SCPI selon votre horizon',
}
