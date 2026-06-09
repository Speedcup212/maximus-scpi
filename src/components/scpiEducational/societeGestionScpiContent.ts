import type { ScpiEducationalPageConfig } from './shared'

export const societeGestionScpiConfig: ScpiEducationalPageConfig = {
  path: '/societe-gestion-scpi',
  badge: 'Acteurs SCPI',
  h1: 'Société de gestion SCPI : rôle, agrément et responsabilités',
  heroSubtitle:
    'Une SCPI ne s\'analyse pas seulement par son rendement. Elle s\'analyse aussi par la qualité, la transparence et la discipline de sa société de gestion. La société de gestion est responsable de la sélection des actifs, de la gestion locative, de la politique de distribution, de la fixation du prix de part et de la communication réglementaire.',
  seoTitle: 'Société de gestion SCPI : rôle, agrément, gestion et critères d\'analyse',
  seoDescription:
    'Comprenez le rôle d\'une société de gestion de SCPI : sélection des actifs, gestion locative, politique de distribution, documents réglementaires, agrément AMF, transparence et points de vigilance.',
  shortAnswerTitle: 'Quel est le rôle d\'une société de gestion de SCPI ?',
  shortAnswer:
    'La société de gestion est l\'entité qui gère la SCPI au quotidien. Elle est responsable de la sélection et de l\'acquisition des actifs immobiliers, de la gestion locative (recherche de locataires, suivi des baux, travaux), de la politique de distribution (montant et fréquence des revenus versés aux associés), de la fixation du prix de part, de la communication réglementaire (DIC, note d\'information, rapport annuel, bulletin trimestriel), du respect des règles d\'investissement et de la relation avec les associés. Elle est soumise à un agrément de l\'AMF. La qualité de la société de gestion est un facteur clé de la performance et de la pérennité de la SCPI.',
  keyMessage:
    'Une SCPI ne s\'analyse pas seulement par son rendement. Elle s\'analyse aussi par la qualité, la transparence et la discipline de sa société de gestion.',
  definitionParagraphs: [
    'La société de gestion est une entité agréée par l\'Autorité des Marchés Financiers (AMF) qui gère la SCPI pour le compte des associés. Elle agit dans le cadre d\'un agrément délivré selon la réglementation en vigueur.',
    'La société de gestion sélectionne les actifs immobiliers, négocie les acquisitions, suit les expertises périodiques et décide des arbitrages (cessions d\'actifs). Sa compétence en matière d\'investissement immobilier est déterminante.',
    'La gestion locative peut être assurée en interne par la société de gestion ou déléguée à des prestataires spécialisés (property managers). La qualité du suivi locatif impacte le TOF et la régularité des loyers.',
    'La politique de distribution est fixée par la société de gestion : elle décide du montant distribué aux associés, de la fréquence et de l\'utilisation éventuelle du report à nouveau pour lisser les versements.',
    'La société de gestion fixe le prix de souscription et peut l\'ajuster en fonction de l\'évolution de la valeur de reconstitution, des expertises et des conditions de marché.',
    'La communication réglementaire est une obligation : DIC (Document d\'Information Clé), note d\'information, rapport annuel, bulletin trimestriel. La transparence et la régularité de cette communication sont des indicateurs de la qualité de gestion.',
  ],
  tableTitle: 'Responsabilité / Ce que cela implique / Point de vigilance',
  tableRows: [
    {
      level: 'Agrément AMF',
      advantage: 'Garantit que la société respecte un cadre réglementaire et des obligations de transparence.',
      vigilance: 'L\'agrément ne garantit pas la performance. Vérifier l\'historique et la réputation de la société.',
    },
    {
      level: 'Sélection des actifs',
      advantage: 'Détermine la qualité du patrimoine et le potentiel de rendement à long terme.',
      vigilance: 'Analyser la stratégie d\'investissement : secteurs, zones géographiques, type d\'actifs.',
    },
    {
      level: 'Gestion locative',
      advantage: 'Impacte le TOF, la régularité des loyers et la valeur du patrimoine.',
      vigilance: 'Vérifier si la gestion est internalisée ou déléguée. Un prestataire externe peut réduire le contrôle.',
    },
    {
      level: 'Politique de distribution',
      advantage: 'Détermine le montant et la régularité des revenus perçus par les associés.',
      vigilance: 'Une distribution trop élevée peut être non soutenable si le TOF baisse ou si le RAN est consommé.',
    },
    {
      level: 'Fixation du prix de part',
      advantage: 'Doit refléter la valeur réelle du patrimoine et les expertises.',
      vigilance: 'Un prix de part non ajusté malgré une baisse des expertises peut signaler un manque de réactivité.',
    },
    {
      level: 'Communication réglementaire',
      advantage: 'Permet aux associés de suivre la performance et les risques.',
      vigilance: 'Une communication insuffisante ou retardée peut être un signal de vigilance sur la qualité de gestion.',
    },
  ],
  tableNote:
    'Ces repères permettent d\'évaluer la qualité d\'une société de gestion. La transparence et la régularité de la communication sont des indicateurs importants.',
  criteriaTitle: 'Critères d\'évaluation d\'une société de gestion SCPI',
  criteriaCards: [
    { title: 'Ancienneté et expérience', text: 'Une société établie depuis plusieurs cycles immobiliers a démontré sa capacité à gérer différentes conjonctures.' },
    { title: 'Encours sous gestion', text: 'Un encours élevé peut indiquer une reconnaissance du marché, sans être un gage absolu de qualité.' },
    { title: 'Équipe et compétences', text: 'Analyser la stabilité de l\'équipe de gestion, l\'expertise immobilière et financière.' },
    { title: 'Transparence', text: 'La qualité et la régularité de la communication (rapports, bulletins, site) sont des indicateurs de sérieux.' },
    { title: 'Stratégie d\'investissement', text: 'La cohérence de la stratégie avec le marché et la capacité d\'adaptation sont des éléments clés.' },
    { title: 'Performance historique', text: 'Analyser la régularité des distributions, l\'évolution du prix de part et la gestion des risques.' },
  ],
  commonErrors: [
    'Choisir une SCPI sans analyser la qualité de sa société de gestion.',
    'Confondre ancienneté et qualité de gestion.',
    'Ignorer la communication réglementaire de la société de gestion.',
    'Ne pas vérifier l\'agrément AMF.',
    'Confondre société de gestion et distributeur de parts.',
    'Se fier uniquement au nom de la société sans analyser les indicateurs de la SCPI.',
  ],
  practicalCases: [
    {
      title: 'Société de gestion historique — transparence reconnue',
      text: 'Une société de gestion établie depuis 25 ans, avec 5 Mds€ d\'encours, publie des rapports trimestriels détaillés. Sa SCPI historique affiche un TOF stable et une régularité de distribution. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'Société récente en forte collecte',
      text: 'Une société de gestion créée depuis 4 ans lève 500 M€ en 2 ans. La forte collecte est flatteuse mais l\'équipe n\'a pas encore traversé de cycle immobilier baissier. Simulation pédagogique : l\'ancienneté et l\'expérience cyclique comptent.',
    },
    {
      title: 'Société spécialisée par secteur',
      text: 'Une société de gestion spécialisée en santé depuis 15 ans avec une équipe dédiée d\'experts du secteur médico-social. Sa connaissance du marché est un atout. Simulation pédagogique : la spécialisation sectorielle peut être un avantage.',
    },
    {
      title: 'Changement de stratégie ou de prix de part',
      text: 'Une société de gestion annonce un changement de stratégie (passage du bureaux à la logistique) et ajuste son prix de part à la baisse après des expertises défavorables. Simulation pédagogique : la réactivité et la transparence sont des qualités.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse la société de gestion comme un élément clé de l\'analyse d\'une SCPI : transparence, historique, stratégie, communication.',
    'La méthode MaximusSCPI ne se limite pas aux indicateurs financiers. La qualité de la société de gestion est intégrée dans l\'analyse.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse de la société de gestion.',
  ],
  conclusionParagraphs: [
    'La qualité de la société de gestion est un facteur clé de la performance et de la pérennité d\'une SCPI. Son ancienneté, sa transparence, sa stratégie et sa communication doivent être analysées avec attention.',
    'Sources et points à vérifier : site AMF, site de la société de gestion, rapports annuels, bulletins trimestriels, DIC, note d\'information.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les SCPI, puis validez votre analyse avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une société de gestion de SCPI ?',
      answer: 'C\'est l\'entité agréée par l\'AMF qui gère la SCPI : sélection des actifs, gestion locative, distribution, communication réglementaire.',
    },
    {
      question: 'Quel est son rôle principal ?',
      answer: 'Acquérir et gérer le patrimoine immobilier, fixer le prix de part, définir la politique de distribution et informer les associés.',
    },
    {
      question: 'Comment choisir une société de gestion ?',
      answer: 'Analyser son ancienneté, son encours, son équipe, sa transparence, sa stratégie d\'investissement et sa performance historique.',
    },
    {
      question: 'Une société de gestion peut-elle changer ?',
      answer: 'Oui, un changement de société de gestion est possible dans certaines conditions, mais c\'est un événement rare qui peut impacter la stratégie.',
    },
    {
      question: 'Quelle différence entre société de gestion et distributeur ?',
      answer: 'La société de gestion gère les actifs. Le distributeur commercialise les parts. Ce sont des rôles distincts.',
    },
    {
      question: 'Comment vérifier l\'agrément AMF ?',
      answer: 'Consulter le site de l\'AMF ou le registre ORIAS pour vérifier l\'agrément et les éventuelles sanctions.',
    },
    {
      question: 'Les frais de gestion sont-ils fixés par la société de gestion ?',
      answer: 'Oui, ils sont définis dans la note d\'information. Ils varient généralement de 10 à 12 % HT des loyers encaissés.',
    },
    {
      question: 'Comment la société de gestion est-elle rémunérée ?',
      answer: 'Principalement par les frais de gestion prélevés sur les loyers et par des commissions de souscription.',
    },
    {
      question: 'Une société de gestion peut-elle être remplacée ?',
      answer: 'Oui, par décision de l\'assemblée générale des associés, mais c\'est une procédure complexe et rare.',
    },
    {
      question: 'Comment MaximusSCPI évalue les sociétés de gestion ?',
      answer: 'À travers l\'analyse des indicateurs de leurs SCPI et la qualité de leur communication. L\'approche est pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Analyser une SCPI en intégrant la société de gestion',
}
