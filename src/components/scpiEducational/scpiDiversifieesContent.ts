import type { ScpiEducationalPageConfig } from './shared'

export const scpiDiversifieesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-diversifiees',
  badge: 'SCPI diversifiées',
  h1: 'SCPI diversifiées : mutualisation réelle ou étiquette marketing ?',
  heroSubtitle:
    'Les SCPI diversifiées peuvent réduire la dépendance à un secteur unique, mais il faut vérifier la réelle diversification et ne pas se contenter du mot "diversifiée". La pondération réelle des secteurs, la répartition géographique, le nombre d\'actifs et la transparence de la société de gestion sont essentiels.',
  seoTitle: 'SCPI diversifiées : secteurs, risques, rendement et analyse',
  seoDescription:
    'Analyse complète des SCPI diversifiées : bureaux, commerces, santé, logistique, résidentiel, diversification sectorielle réelle, rendement, risques, cas pratiques et comparaison avec une allocation multi-SCPI.',
  shortAnswerTitle: 'Que sont les SCPI diversifiées et sont-elles vraiment diversifiées ?',
  shortAnswer:
    'Les SCPI diversifiées investissent dans plusieurs secteurs immobiliers (bureaux, commerces, santé, logistique, résidentiel) pour mutualiser les risques. Elles peuvent être une porte d\'entrée intéressante pour un premier investissement. Cependant, il faut vérifier la répartition réelle des actifs : certaines SCPI dites diversifiées restent très concentrées sur un secteur dominant (ex : bureaux à 65 %). La diversification réelle doit être vérifiée dans le rapport annuel : répartition sectorielle, géographique, nombre d\'actifs et de locataires.',
  keyMessage:
    'Une SCPI diversifiée n\'est pas automatiquement bien diversifiée. Il faut vérifier la répartition réelle des actifs, des locataires, des secteurs et des pays.',
  definitionParagraphs: [
    'Une SCPI diversifiée est une SCPI qui investit dans plusieurs secteurs immobiliers : bureaux, commerces, santé, logistique, résidentiel, locaux d\'activité. L\'objectif est de réduire la dépendance à un seul secteur.',
    'La diversification sectorielle permet de lisser les performances : si un secteur est en difficulté, les autres peuvent compenser. C\'est le principe de base de la gestion de risque.',
    'Toutes les SCPI diversifiées ne se valent pas. Certaines affichent une répartition équilibrée entre 4 ou 5 secteurs. D\'autres ont un secteur très majoritaire (bureaux à 60-70 %) avec une dispersion sur des secteurs minoritaires. Le terme "diversifié" n\'est pas réglementé.',
    'La diversification géographique est également importante : une SCPI diversifiée peut investir en France et en Europe pour réduire la dépendance à un seul marché immobilier.',
    'Les SCPI diversifiées sont souvent recommandées pour un premier investissement car elles offrent une exposition large. Mais cette simplicité apparente ne doit pas dispenser d\'une analyse détaillée de la répartition réelle.',
    'La comparaison avec une allocation multi-SCPI est utile : une SCPI diversifiée offre une diversification en interne, tandis qu\'une allocation multi-SCPI permet de choisir des SCPI spécialisées pour construire sa propre diversification.',
  ],
  tableTitle: 'Forme de diversification / Atout potentiel / Vigilance / Comment vérifier',
  tableRows: [
    {
      level: 'Diversification sectorielle',
      advantage: 'Réduit la dépendance à un seul secteur. Lissage des performances dans le temps.',
      vigilance: 'Vérifier la répartition réelle. Certaines SCPI diversifiées restent concentrées sur un secteur dominant (> 50 %).',
    },
    {
      level: 'Diversification géographique',
      advantage: 'Exposition France et Europe. Réduction du risque pays et du risque réglementaire.',
      vigilance: 'Analyser la répartition par pays. Une SCPI "France seulement" est moins diversifiée géographiquement.',
    },
    {
      level: 'Mutualisation du risque',
      advantage: 'Les risques sont répartis entre plusieurs types d\'actifs, de locataires et de zones.',
      vigilance: 'La mutualisation dilue la performance des meilleurs secteurs. Une SCPI spécialisée peut surperformer temporairement.',
    },
    {
      level: 'Nombre d\'actifs et de locataires',
      advantage: 'Plus le nombre est élevé, plus la mutualisation est effective.',
      vigilance: 'Vérifier le nombre réel d\'actifs et de locataires. Une SCPI avec peu d\'actifs n\'est pas vraiment diversifiée.',
    },
    {
      level: 'Lisibilité',
      advantage: 'Une SCPI diversifiée peut être plus simple à comprendre pour un premier investissement.',
      vigilance: 'Plus la diversification est large, plus l\'analyse fine de chaque actif est complexe. Transparence nécessaire.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Chaque SCPI diversifiée doit être analysée individuellement pour vérifier la réalité de sa diversification.',
  criteriaTitle: 'Points de vigilance sur les SCPI diversifiées',
  criteriaCards: [
    { title: 'Répartition sectorielle réelle', text: 'Vérifier les pondérations réelles par secteur. Une SCPI avec 60 % de bureaux est-elle vraiment diversifiée ?' },
    { title: 'Répartition géographique', text: 'Part France vs Europe. La diversification entre pays est-elle suffisante ?' },
    { title: 'Nombre d\'actifs', text: 'Plus le nombre d\'actifs est élevé, plus la mutualisation est effective.' },
    { title: 'Nombre de locataires', text: 'Une diversification locative est aussi importante que la diversification sectorielle.' },
    { title: 'Stratégie de gestion', text: 'La société de gestion a-t-elle une vraie stratégie multi-sectorielle ou une simple juxtaposition d\'actifs ?' },
    { title: 'TOF global vs TOF par secteur', text: 'Le TOF global peut masquer des disparités entre secteurs. Demander la ventilation par secteur.' },
    { title: 'Comparaison allocation multi-SCPI', text: 'Une SCPI diversifiée seule peut-elle remplacer une allocation construite avec plusieurs SCPI spécialisées ?' },
  ],
  commonErrors: [
    'Croire qu\'une SCPI diversifiée est automatiquement moins risquée.',
    'Ne pas vérifier la répartition sectorielle réelle dans le rapport annuel.',
    'Confondre diversification affichée (marketing) et diversification réelle.',
    'Investir dans une SCPI diversifiée sans analyser la composition détaillée.',
    'Penser qu\'une SCPI diversifiée unique remplace une allocation multi-SCPI personnalisée.',
    'Ignorer le nombre d\'actifs : une petite SCPI diversifiée n\'est pas vraiment diversifiée.',
  ],
  practicalCases: [
    {
      title: 'SCPI diversifiée récente — diversification encore limitée',
      text: 'Une SCPI diversifiée récente de 150 M€ avec 15 actifs. Malgré l\'étiquette "diversifiée", le nombre d\'actifs est encore faible et la diversification réelle est limitée. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'SCPI diversifiée fortement exposée aux bureaux',
      text: 'Une SCPI diversifiée de 800 M€ affiche 65 % de bureaux, 15 % de commerces, 10 % de santé, 10 % de logistique. La diversification sectorielle est limitée par la prépondérance des bureaux. Simulation pédagogique : vérifier la répartition réelle.',
    },
    {
      title: 'SCPI diversifiée européenne — bonne diversification',
      text: 'Une SCPI de 2 Mds€ avec une répartition équilibrée : bureaux 30 %, santé 25 %, logistique 20 %, commerces 15 %, résidentiel 10 %. 500 actifs, 300 locataires, 6 pays européens. Simulation pédagogique : la diversification est réelle et équilibrée.',
    },
    {
      title: 'Allocation multi-SCPI face à une seule SCPI diversifiée',
      text: 'Comparaison : investir 100 000 € dans une seule SCPI diversifiée ou répartir entre 3 SCPI spécialisées (santé, logistique, diversifiée). L\'allocation multi-SCPI peut offrir une diversification plus maîtrisée. Simulation pédagogique : chaque approche a des avantages.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse les SCPI diversifiées en vérifiant la réalité de leur diversification : répartition sectorielle, géographique, nombre d\'actifs et de locataires.',
    'La méthode MaximusSCPI ne se fie pas à l\'intitulé "diversifié". Elle vérifie les chiffres publiés par la société de gestion dans le rapport annuel.',
    'La comparaison avec une allocation multi-SCPI est proposée dans les contenus pédagogiques.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un conseiller peut approfondir l\'analyse.',
  ],
  conclusionParagraphs: [
    'Les SCPI diversifiées offrent un principe de mutualisation pertinent, mais la réalité de la diversification doit être vérifiée secteur par secteur. Toutes les SCPI diversifiées ne se valent pas.',
    'Sources et points à vérifier : DIC, note d\'information, rapport annuel, répartition sectorielle et géographique détaillée, nombre d\'actifs et de locataires.',
    'Utilisez le comparateur MaximusSCPI pour analyser les SCPI diversifiées, puis validez avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce qu\'une SCPI diversifiée ?',
      answer: 'Une SCPI qui investit dans plusieurs secteurs immobiliers (bureaux, commerces, santé, logistique, résidentiel) pour mutualiser les risques.',
    },
    {
      question: 'Une SCPI diversifiée est-elle moins risquée ?',
      answer: 'La diversification réduit la dépendance à un secteur, mais elle ne supprime pas le risque. La qualité et la réalité de la diversification doivent être vérifiées.',
    },
    {
      question: 'Quels secteurs une SCPI diversifiée peut-elle détenir ?',
      answer: 'Bureaux, commerces, santé, logistique, résidentiel, locaux d\'activité, parfois hôtellerie ou éducation.',
    },
    {
      question: 'Comment vérifier la diversification réelle ?',
      answer: 'Consulter la répartition sectorielle détaillée, géographique, le nombre d\'actifs et de locataires dans le rapport annuel.',
    },
    {
      question: 'Une SCPI diversifiée peut-elle être trop concentrée ?',
      answer: 'Oui, si un secteur représente plus de 50-60 % du patrimoine. Vérifier la pondération réelle dans les documents.',
    },
    {
      question: 'Quelle différence entre SCPI diversifiée et allocation multi-SCPI ?',
      answer: 'Une allocation multi-SCPI permet de choisir des SCPI spécialisées pour construire sa propre diversification. Une SCPI diversifiée mutualise en interne.',
    },
    {
      question: 'Faut-il privilégier les SCPI diversifiées pour débuter ?',
      answer: 'Elles peuvent être une bonne porte d\'entrée, mais une allocation construite avec plusieurs SCPI peut offrir une diversification mieux maîtrisée.',
    },
    {
      question: 'Quel est le risque de dilution d\'une SCPI diversifiée ?',
      answer: 'La diversification dilue la performance des meilleurs secteurs. En période de boom sectoriel, une SCPI spécialisée peut surperformer.',
    },
    {
      question: 'Comment MaximusSCPI analyse la diversification ?',
      answer: 'Le comparateur et les contenus pédagogiques aident à vérifier la diversification réelle. L\'approche est pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer la diversification réelle des SCPI',
}
