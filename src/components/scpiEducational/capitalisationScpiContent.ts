import type { ScpiEducationalPageConfig } from './shared'

export const capitalisationScpiConfig: ScpiEducationalPageConfig = {
  path: '/capitalisation-scpi',
  badge: 'Critère patrimonial',
  h1: 'Capitalisation SCPI : comprendre la taille d\'une SCPI avant d\'investir',
  heroSubtitle:
    'La capitalisation mesure la taille financière d\'une SCPI. C\'est un repère utile pour évaluer sa maturité, sa diversification potentielle et sa capacité d\'absorption des chocs, mais une grosse capitalisation n\'est pas automatiquement synonyme de qualité.',
  seoTitle: 'Capitalisation SCPI : définition, seuils et analyse avant d\'investir',
  seoDescription:
    'Comprenez la capitalisation d\'une SCPI, ses seuils, ses limites et les critères à croiser : TOF, rendement, endettement, décote, frais et diversification.',
  shortAnswerTitle: 'À quoi sert la capitalisation d\'une SCPI ?',
  shortAnswer:
    'La capitalisation indique la taille globale d\'une SCPI, généralement exprimée en millions ou milliards d\'euros. Elle aide à situer la SCPI dans le paysage du marché, à apprécier sa capacité de diversification et à comprendre sa dynamique de collecte. Elle ne suffit pas à juger la qualité du patrimoine : une SCPI très capitalisée peut afficher un rendement modeste, un TOF en baisse ou une surcote importante. À l\'inverse, une petite capitalisation peut offrir un potentiel de croissance tout en concentrant davantage le risque sur un nombre limité d\'actifs.',
  keyMessage:
    'La capitalisation mesure la taille d\'une SCPI, pas sa qualité intrinsèque.',
  definitionParagraphs: [
    'La capitalisation d\'une SCPI correspond à la valeur totale du patrimoine immobilier détenu par la société, augmentée des liquidités et diminuée des dettes selon la méthode de calcul retenue par la société de gestion. En pratique, les investisseurs la retrouvent dans les documents réglementaires : note d\'information, bulletin trimestriel, rapport annuel ou fiches ASPIM.',
    'Cet indicateur ne doit pas être confondu avec le nombre de parts en circulation multiplié par le prix de souscription, même si les deux notions sont liées. La capitalisation patrimoniale reflète la taille réelle du véhicule d\'investissement et son poids sur le marché des SCPI françaises.',
    'Une SCPI de petite taille — typiquement en dessous de 100 M€ — peut être en phase de lancement ou de croissance accélérée. Elle dispose parfois d\'une stratégie claire et d\'une collecte dynamique, mais son patrimoine peut rester concentré sur un nombre restreint d\'immeubles ou de locataires. Le risque de concentration est alors plus élevé qu\'au sein d\'une structure plus mature.',
    'Entre 100 M€ et 500 M€, on observe souvent des SCPI en développement qui commencent à diversifier leurs actifs tout en conservant une certaine agilité. La lecture de la capitalisation doit alors être complétée par le nombre réel d\'actifs, le nombre de locataires, la répartition géographique et sectorielle, ainsi que l\'évolution de la collecte nette.',
    'Au-delà de 500 M€, la mutualisation des risques locatifs tend à s\'améliorer : vacance sur un actif, départ d\'un locataire ou travaux sur un immeuble pèsent proportionnellement moins sur l\'ensemble du patrimoine. Cependant, une grande taille peut aussi s\'accompagner d\'une inertie dans les arbitrages, d\'une liquidité secondaire plus limitée sur le marché de revente, ou d\'un rendement plus modéré lié à une politique de gestion prudente.',
    'La capitalisation évolue dans le temps sous l\'effet des acquisitions, des cessions, de la collecte nette, des réévaluations patrimoniales et parfois de la variation de l\'endettement. Suivre cette évolution sur plusieurs exercices permet de distinguer une SCPI en croissance structurée d\'une SCPI dont la taille stagne malgré une collecte soutenue.',
  ],
  tableTitle: 'Comment interpréter la capitalisation d\'une SCPI ?',
  tableRows: [
    {
      level: 'Moins de 100 M€',
      advantage:
        'Potentiel de croissance, agilité dans les arbitrages, parfois décote intéressante sur des véhicules en structuration.',
      vigilance:
        'Risque de concentration élevé : peu d\'actifs, peu de locataires, sensibilité accrue à un événement locatif unique.',
    },
    {
      level: '100 M€ à 500 M€',
      advantage:
        'Taille intermédiaire souvent compatible avec une diversification en cours et une stratégie lisible.',
      vigilance:
        'Analyser la diversification réelle : la capitalisation peut croître sans élargir significativement le nombre d\'actifs.',
    },
    {
      level: '500 M€ à 1 Md€',
      advantage:
        'Mutualisation généralement plus forte, visibilité accrue sur le marché, accès à des actifs de plus grande taille.',
      vigilance:
        'Rendement parfois plus modéré, liquidité secondaire à vérifier, inertie possible dans les repositionnements.',
    },
    {
      level: 'Plus de 1 Md€',
      advantage:
        'Diversification patrimoniale large, capacité d\'absorption des chocs locatifs, solidité apparente du véhicule.',
      vigilance:
        'Grande taille ne signifie pas absence de risque : surveiller TOF, endettement, surcote et régularité des distributions.',
    },
  ],
  tableNote:
    'Ces seuils sont des repères indicatifs basés sur les pratiques du marché français. Ils ne constituent pas une grille de notation. La capitalisation doit être croisée avec le nombre d\'actifs, le TOF, l\'endettement, la collecte nette, les frais et la décote ou surcote sur valeur de reconstitution.',
  criteriaTitle: 'Critères à croiser avec la capitalisation',
  criteriaCards: [
    { title: 'TOF', text: 'Une grande capitalisation avec un TOF faible peut signaler des difficultés locatives sur une partie significative du patrimoine.' },
    { title: 'Rendement', text: 'Le taux de distribution est une donnée historique. Une SCPI très capitalisée peut distribuer moins qu\'une structure plus petite à stratégie équivalente.' },
    { title: 'Endettement', text: 'La dette peut accélérer la croissance de la capitalisation mais amplifie le risque en période de hausse des taux.' },
    { title: 'Collecte nette', text: 'Une collecte soutenue peut gonfler la capitalisation sans améliorer immédiatement la diversification si les fonds restent en trésorerie.' },
    { title: 'Report à nouveau', text: 'Un report à nouveau élevé peut renforcer le patrimoine et soutenir la croissance de la capitalisation sur la durée.' },
    { title: 'Nombre d\'actifs', text: 'Deux SCPI de capitalisation similaire peuvent avoir des profils de risque très différents selon le nombre d\'immeubles détenus.' },
    { title: 'Nombre de locataires', text: 'La dépendance à un locataire majeur reste un risque même dans une SCPI de grande taille.' },
    { title: 'Zone géographique', text: 'Une capitalisation importante concentrée sur une seule zone géographique conserve un risque territorial élevé.' },
    { title: 'Secteur immobilier', text: 'Bureaux, commerces, logistique ou santé : la capitalisation doit être lue selon le cycle du secteur dominant.' },
    { title: 'Frais', text: 'Les frais de gestion pèsent sur le rendement net, quelle que soit la taille de la SCPI.' },
    { title: 'Décote / surcote', text: 'Une grande capitalisation n\'empêche pas une surcote sur valeur de reconstitution qui réduit la marge de sécurité à l\'entrée.' },
  ],
  commonErrors: [
    'Considérer qu\'une SCPI de grande capitalisation est automatiquement plus sûre.',
    'Ignorer le nombre réel d\'actifs et de locataires derrière un chiffre de capitalisation élevé.',
    'Comparer deux SCPI uniquement sur leur taille sans regarder le secteur ni la zone géographique.',
    'Confondre collecte record et qualité patrimoniale : une collecte forte ne garantit pas un bon TOF.',
    'Négliger l\'évolution de la capitalisation sur plusieurs exercices.',
    'Oublier de croiser capitalisation et endettement dans un contexte de taux élevés.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — petite capitalisation, forte croissance, concentration élevée',
      text: 'Une SCPI récente affiche 80 M€ de capitalisation avec seulement quatre actifs et deux locataires représentant 45 % des loyers. La collecte est dynamique et le rendement affiché attire l\'attention, mais la concentration patrimoniale impose une vigilance renforcée. Simulation pédagogique : les critères à approfondir seraient le TOF, l\'échéancier des baux et la politique d\'acquisition future.',
    },
    {
      title: 'SCPI B — très capitalisée, rendement modéré',
      text: 'Une SCPI mature dépasse 1,2 Md€ de capitalisation, affiche un TOF supérieur à 96 % et une décote légère. Son taux de distribution reste cependant en retrait par rapport à des SCPI plus petites du même secteur. La taille apporte une mutualisation solide, mais le rendement historique ne constitue pas une promesse pour l\'avenir.',
    },
    {
      title: 'SCPI C — capitalisation intermédiaire, bonne diversification sectorielle',
      text: 'Avec environ 350 M€ de capitalisation, une SCPI combine bureaux, logistique et commerces sur plusieurs zones en France. Le nombre d\'actifs dépasse 25 et aucun locataire ne représente plus de 8 % des loyers. La taille intermédiaire semble cohérente avec une diversification réelle — à confirmer dans les documents réglementaires.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre la capitalisation comme un critère de lecture parmi d\'autres, jamais comme un filtre unique de sélection. Le comparateur permet de visualiser la taille de chaque SCPI aux côtés du TOF, du rendement, de l\'endettement, de la décote ou surcote et des frais, afin de construire une pré-orientation structurée.',
    'La démarche recommandée consiste d\'abord à situer la SCPI dans une fourchette de capitalisation, puis à vérifier si cette taille se traduit par une diversification patrimoniale réelle : nombre d\'actifs, répartition géographique, exposition sectorielle et concentration locative.',
    'L\'étape suivante consiste à analyser la dynamique : la capitalisation progresse-t-elle grâce à des acquisitions cohérentes ou principalement grâce à la collecte ? La collecte nette positive utilisée pour acheter des actifs de qualité diffère d\'une collecte qui gonfle la trésorerie sans stratégie d\'investissement claire.',
    'MaximusSCPI encourage ensuite le croisement systématique avec le TOF et l\'endettement. Une SCPI qui grossit rapidement en s\'endettant fortement mérite une lecture attentive du coût de la dette, de ses échéances et de la qualité des actifs financés.',
    'Enfin, la pré-orientation doit intégrer la fiscalité, l\'horizon d\'investissement et le besoin de revenus de l\'investisseur. La capitalisation aide à comprendre le véhicule ; elle ne remplace pas un entretien patrimonial personnalisé avec un conseiller en investissements financiers.',
  ],
  conclusionParagraphs: [
    'La capitalisation est un indicateur de taille, pas de qualité. Elle permet de situer une SCPI, d\'anticiper sa capacité de diversification et de comprendre sa place sur le marché, mais elle doit toujours être lue avec le TOF, le rendement, l\'endettement, les frais et la décote ou surcote sur valeur de reconstitution.',
    'Avant toute souscription, prenez le temps de consulter les documents réglementaires, d\'analyser l\'évolution de la capitalisation sur plusieurs exercices et de croiser les critères dans une logique patrimoniale globale. Le comparateur MaximusSCPI vous aide à structurer cette première lecture ; un échange avec le Cabinet Eric Bellaiche permet de l\'approfondir selon votre situation.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que la capitalisation d\'une SCPI ?',
      answer: 'La capitalisation représente la taille financière du patrimoine détenu par la SCPI. Elle reflète l\'ensemble des actifs immobiliers, des liquidités et des éléments patrimoniaux selon la méthode de calcul de la société de gestion. C\'est un indicateur de dimensionnement, utile pour comparer des véhicules entre eux et comprendre leur maturité sur le marché.',
    },
    {
      question: 'Quelle est une bonne capitalisation pour une SCPI ?',
      answer: 'Il n\'existe pas de capitalisation idéale universelle. Tout dépend de la stratégie de la SCPI, du secteur visé, de l\'horizon d\'investissement et du profil de risque acceptable. Une fourchette de 100 M€ à 500 M€ peut convenir à une SCPI en développement, tandis qu\'une structure de plus de 500 M€ offre généralement une mutualisation plus large. L\'essentiel est de vérifier que la taille se traduit par une diversification réelle.',
    },
    {
      question: 'Une grosse SCPI est-elle plus sûre ?',
      answer: 'Pas automatiquement. Une grande capitalisation peut réduire l\'impact d\'un sinistre locatif isolé, mais elle n\'élimine pas les risques de baisse des loyers, de vacance sectorielle, d\'endettement excessif ou de surcote sur valeur de reconstitution. Des SCPI très capitalisées ont connu des périodes de baisse de TOF ou de distribution dans le passé.',
    },
    {
      question: 'Une petite SCPI est-elle plus risquée ?',
      answer: 'En général, une petite capitalisation s\'accompagne d\'un risque de concentration plus élevé : moins d\'actifs, moins de locataires, plus de sensibilité à un événement unique. Cela ne signifie pas que la SCPI doit être écartée : certaines structures en lancement affichent une stratégie claire et une collecte dynamique. L\'analyse doit être nuancée et documentée.',
    },
    {
      question: 'Pourquoi croiser capitalisation et TOF ?',
      answer: 'Le TOF mesure la qualité locative du patrimoine, tandis que la capitalisation mesure sa taille. Une SCPI très capitalisée avec un TOF faible peut cacher des difficultés locatives sur une partie significative de ses actifs. À l\'inverse, une petite SCPI avec un TOF élevé peut sembler attractive mais rester concentrée sur peu d\'immeubles.',
    },
    {
      question: 'La capitalisation influence-t-elle la liquidité ?',
      answer: 'Indirectement, oui. Les SCPI les plus capitalisées et les plus connues disposent parfois d\'un marché secondaire plus actif, sans que cela garantisse une revente rapide au prix souhaité. La liquidité des SCPI reste structurellement limitée : la revente de parts n\'est ni immédiate ni garantie au prix de souscription.',
    },
    {
      question: 'Où trouver la capitalisation d\'une SCPI ?',
      answer: 'La capitalisation est publiée dans les documents réglementaires de la société de gestion : note d\'information, bulletin trimestriel, rapport annuel. Elle est également disponible sur le site ASPIM et, pour une pré-lecture, dans le comparateur MaximusSCPI qui centralise les indicateurs clés des SCPI suivies.',
    },
    {
      question: 'Comment MaximusSCPI utilise la capitalisation ?',
      answer: 'MaximusSCPI affiche la capitalisation dans le comparateur aux côtés du TOF, du rendement, de l\'endettement, de la décote ou surcote et des frais. L\'objectif est de faciliter une pré-orientation pédagogique structurée, sans constituer une recommandation personnalisée. L\'investisseur peut filtrer et comparer les SCPI selon plusieurs critères avant d\'approfondir avec un conseiller.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur capitalisation',
}
