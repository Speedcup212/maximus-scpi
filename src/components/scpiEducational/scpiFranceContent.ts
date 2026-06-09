import type { ScpiEducationalPageConfig } from './shared'

export const scpiFranceConfig: ScpiEducationalPageConfig = {
  path: '/scpi-france',
  badge: 'Analyse SCPI',
  h1: 'SCPI France : fiscalité, rendement et points de vigilance',
  heroSubtitle:
    "Les SCPI investies principalement en France présentent des caractéristiques spécifiques : fiscalité des revenus fonciers français, prélèvements sociaux à 17,2 %, impact direct de la TMI. Leur rendement net doit être analysé en tenant compte de ces éléments.",
  seoTitle: 'SCPI France : fiscalité, rendement, risques et critères d\'analyse',
  seoDescription:
    "Comprenez les SCPI investies principalement en France : revenus fonciers, fiscalité, prélèvements sociaux, rendement net, secteurs, risques et critères à comparer.",
  shortAnswerTitle: "Qu'est-ce qu'une SCPI France ?",
  shortAnswer:
    "Une SCPI France est une société de placement investie majoritairement en immobilier d'entreprise situé en France. Ses revenus sont qualifiés de revenus fonciers, soumis à l'impôt sur le revenu selon la TMI de l'investisseur et aux prélèvements sociaux (17,2 %). Le rendement brut affiché (TDVM) peut sembler attractif, mais le rendement net après fiscalité dépend fortement de la situation personnelle. Contrairement aux SCPI européennes, les revenus français n'ouvrent pas droit à un crédit d'impôt et sont intégralement imposés en France.",
  keyMessage:
    "Une SCPI France peut être pertinente, mais son rendement doit être analysé net de fiscalité, de prélèvements sociaux, de frais et de risques immobiliers.",
  definitionParagraphs: [
    "Une SCPI France est une SCPI dont le patrimoine immobilier est principalement composé d'actifs situés en France métropolitaine. La part des investissements à l'étranger est généralement inférieure à 10 % du patrimoine total.",
    "Les revenus distribués par une SCPI France sont qualifiés de revenus fonciers. Ils sont soumis au barème progressif de l'impôt sur le revenu (IR) selon la tranche marginale d'imposition (TMI) de l'investisseur, et aux prélèvements sociaux au taux de 17,2 % (CSG, CRDS).",
    "Le rendement brut d'une SCPI France (TDVM) se situe généralement entre 4,5 % et 6,5 % selon les secteurs et la qualité du patrimoine. Après déduction des frais de souscription (8-12 % à l'entrée), des frais de gestion (10-12 % des loyers) et de la fiscalité, le rendement net peut être significativement inférieur.",
    "Les SCPI France investissent dans plusieurs secteurs : bureaux (environ 40-50 % du marché), commerces (15-20 %), santé (10-15 %), logistique (10-15 %) et résidentiel (5-10 %). La diversification sectorielle est un critère d'analyse important.",
    "La fiscalité des SCPI France est un critère déterminant pour les investisseurs fortement imposés. Un investisseur TMI 41 % subit une imposition globale (IR + PS) d'environ 58,2 % sur ses revenus fonciers, ce qui réduit fortement le rendement net perçu.",
    "Pour les investisseurs à TMI élevée, des stratégies d'optimisation existent : détention en assurance-vie (imposition allégée après 8 ans, abattement annuel), démembrement temporaire (absence de revenus imposables pendant la phase de nue-propriété), ou combinaison avec des SCPI européennes (crédit d'impôt, PS réduits).",
    "Les SCPI France sont disponibles en direct, en assurance-vie, en PER ou en SCI. Chaque enveloppe modifie la fiscalité applicable et la liquidité des parts. Le choix de l'enveloppe est aussi important que le choix de la SCPI elle-même.",
  ],
  tableTitle: "Critère / Lecture pour une SCPI France / Vigilance",
  tableRows: [
    {
      level: 'Rendement brut (TDVM)',
      advantage: 'Indicateur de référence pour comparer les SCPI entre elles.',
      vigilance: 'Le TDVM est brut de fiscalité et de frais de souscription. Le rendement net dépend de la TMI et de l\'enveloppe.',
    },
    {
      level: 'Fiscalité des revenus',
      advantage: "Revenus fonciers imposés au barème IR + PS 17,2 %. Simplicité de déclaration (case 4DC ou 4BE du formulaire 2044).",
      vigilance: "L'imposition globale (IR + PS) peut atteindre 58,2 % pour un TMI 45 %. L'absence de crédit d'impôt limite les possibilités d'optimisation.",
    },
    {
      level: 'Diversification sectorielle',
      advantage: 'Exposition à plusieurs secteurs (bureaux, commerces, santé, logistique).',
      vigilance: 'Certains secteurs (bureaux en région, commerces secondaires) peuvent subir des tensions locatives.',
    },
    {
      level: 'Liquidité',
      advantage: 'Marché secondaire organisé. Délai de revente variable selon les SCPI.',
      vigilance: "Le délai peut atteindre 6 à 12 mois en période de tension. La revente peut se faire avec une décote si le marché secondaire est déséquilibré.",
    },
    {
      level: 'Frais de souscription',
      advantage: "Frais prélevés à l'entrée, généralement 8 à 12 %.",
      vigilance: "Ces frais s'ajoutent au prix de part et réduisent le rendement effectif la première année. L'horizon de détention doit être suffisamment long pour les amortir.",
    },
  ],
  tableNote:
    'Ces critères sont indicatifs. L\'analyse doit être adaptée à la situation personnelle de l\'investisseur.',
  criteriaTitle: 'Critères à croiser pour une SCPI France',
  criteriaCards: [
    { title: 'TMI de l\'investisseur', text: "Plus la TMI est élevée, plus le rendement net après impôt est réduit. L'impact fiscal peut diviser le rendement brut par 2 pour un TMI 45 %." },
    { title: 'Secteurs d\'investissement', text: "Les secteurs français n'ont pas tous la même résilience. Bureaux prime, santé et logistique sont généralement plus stables que les commerces secondaires." },
    { title: 'Taux d\'occupation financier (TOF)', text: "Un TOF élevé (> 90 %) indique une bonne occupation du patrimoine. Un TOF en baisse peut signaler des difficultés locatives sectorielles ou géographiques." },
    { title: 'Capitalisation de la SCPI', text: "Une capitalisation élevée (> 1 Md€) offre une meilleure diversification et une résilience potentielle. Les petites SCPI peuvent être plus volatiles." },
    { title: 'Enveloppe de détention', text: "Direct, assurance-vie, démembrement ou PER : chaque enveloppe modifie la fiscalité, la liquidité et les frais. Le choix de l'enveloppe est déterminant." },
    { title: 'Comparaison avec SCPI européennes', text: "Les SCPI européennes offrent un crédit d'impôt et des prélèvements sociaux parfois réduits (0 % dans certains pays). La comparaison France vs Europe est un critère d'allocation." },
    { title: 'Endettement de la SCPI', text: "Un endettement modéré (< 30 %) peut être un levier de croissance. Un endettement élevé (> 40 %) expose à un risque de baisse des distributions en cas de hausse des taux." },
  ],
  commonErrors: [
    "Se focaliser uniquement sur le TDVM brut sans calculer le rendement net après fiscalité et frais.",
    "Investir en direct sans comparer l'impact de l'assurance-vie sur la fiscalité des revenus.",
    "Confondre SCPI France et SCPI européennes : la fiscalité, les prélèvements sociaux et le crédit d'impôt diffèrent fondamentalement.",
    "Oublier l'impact des prélèvements sociaux (17,2 %) sur le rendement net perçu.",
    "Investir sans vérifier le TOF, la capitalisation et l'endettement de la SCPI.",
    "Négliger le délai de liquidité : en cas de besoin urgent, la revente peut prendre plusieurs mois.",
    "Investir sans horizon suffisant pour amortir les frais de souscription (8-12 %).",
  ],
  practicalCases: [
    {
      title: 'Investisseur TMI 11 %',
      text: "Hypothèses théoriques : souscription de 50 000 € de parts de SCPI France. TDVM brut : 5,5 % (2 750 €/an). Frais de gestion : 12 % (330 €). Revenus nets avant impôt : 2 420 €/an. TMI 11 % + PS 17,2 % = 28,2 % d'imposition : 682 € d'impôt. Revenu net perçu : 1 738 €/an, soit un rendement net de 3,48 %. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Investisseur TMI 30 %',
      text: "Hypothèses théoriques : souscription de 100 000 € de parts de SCPI France. TDVM brut : 5,5 % (5 500 €/an). Frais de gestion : 12 % (660 €). Revenus nets avant impôt : 4 840 €/an. TMI 30 % + PS 17,2 % = 47,2 % d'imposition : 2 284 € d'impôt. Revenu net perçu : 2 556 €/an, soit un rendement net de 2,56 %. Comparaison : la même SCPI en assurance-vie (flat tax 30 %) donnerait un rendement net de 3,85 %. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Investisseur TMI 41 % comparant France et Europe',
      text: "Hypothèses théoriques : souscription de 100 000 € en SCPI France vs SCPI européennes. TDVM identique : 5,5 %. SCPI France : TMI 41 % + PS 17,2 % = 58,2 % d'imposition → rendement net 2,12 %. SCPI européennes : TMI 41 % + crédit d'impôt (réduction du taux effectif) → rendement net estimé entre 3 et 4 % selon le pays. La différence justifie une allocation combinée. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: 'Investisseur recherchant des revenus immédiats',
      text: "Hypothèses théoriques : souscription de 80 000 € de SCPI France en direct. Objectif : percevoir des revenus trimestriels. TDVM : 5,5 % = 4 400 €/an. Après frais de gestion (12 %) = 3 872 €. Après fiscalité TMI 30 % = 2 044 €/an, soit 170 €/mois. À comparer avec un investissement en assurance-vie (même rendement brut, fiscalité allégée à la sortie). Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
  ],
  methodParagraphs: [
    "La méthode MaximusSCPI pour analyser une SCPI France repose sur plusieurs étapes : vérifier le TDVM brut et le comparer au rendement net après fiscalité selon la TMI, analyser la diversification sectorielle et géographique, vérifier le TOF et son évolution sur 3 ans, examiner l'endettement et la capitalisation, comparer l'impact des différentes enveloppes (direct, assurance-vie, démembrement).",
    "Nous recommandons de ne pas se limiter à une seule SCPI France. Une allocation diversifiée peut combiner plusieurs SCPI de secteurs différents, et éventuellement intégrer des SCPI européennes pour optimiser la fiscalité globale.",
    "Avant toute souscription, il est conseillé de consulter les documents réglementaires (DIC, note d'information, rapport annuel) et de vérifier la cohérence de l'investissement avec sa situation personnelle, sa fiscalité et son horizon.",
  ],
  conclusionParagraphs: [
    "Les SCPI France offrent une exposition à l'immobilier d'entreprise français avec une fiscalité simple mais potentiellement lourde pour les TMI élevées. Le rendement net après fiscalité, frais et prélèvements sociaux peut être significativement inférieur au TDVM brut.",
    "La comparaison avec les SCPI européennes est incontournable pour évaluer la pertinence d'une allocation France vs Europe. L'assurance-vie, le démembrement et la détention en direct sont des options à analyser selon la situation personnelle.",
    "Sources à consulter : DIC et note d'information des SCPI France, rapports annuels, bulletins trimestriels, site impots.gouv.fr, BOFiP pour la fiscalité des revenus fonciers, données ASPIM.",
  ],
  faqItems: [
    {
      question: "Qu'est-ce qu'une SCPI France ?",
      answer: "Une SCPI dont le patrimoine immobilier est investi principalement (généralement plus de 90 %) en France métropolitaine. Ses revenus sont des revenus fonciers soumis à l'IR et aux prélèvements sociaux.",
    },
    {
      question: "Quelle est la fiscalité des SCPI France ?",
      answer: "Les revenus sont imposés au barème progressif de l'IR (selon la TMI) + prélèvements sociaux à 17,2 %. L'imposition globale varie de 28,2 % (TMI 11 %) à 62,2 % (TMI 45 %).",
    },
    {
      question: "Quel est le rendement net d'une SCPI France après impôt ?",
      answer: "Pour un TDVM brut de 5,5 %, le rendement net après fiscalité peut varier de 3,5 % (TMI 11 %) à 2,1 % (TMI 45 %), hors frais de souscription non amortis.",
    },
    {
      question: "Quelle différence avec une SCPI européenne ?",
      answer: "Les SCPI européennes investissent dans plusieurs pays de l'UE. Leurs revenus peuvent bénéficier d'un crédit d'impôt et de prélèvements sociaux réduits, ce qui améliore le rendement net pour les TMI élevées.",
    },
    {
      question: "Faut-il privilégier l'assurance-vie pour une SCPI France ?",
      answer: "L'assurance-vie peut réduire l'imposition des revenus (flat tax à 30 % ou imposition après abattement après 8 ans). Elle offre aussi une meilleure liquidité (arbitrage possible). En revanche, les frais UC et le choix limité de SCPI sont des inconvénients.",
    },
    {
      question: "Quels sont les secteurs des SCPI France ?",
      answer: "Bureaux (40-50 %), commerces (15-20 %), santé (10-15 %), logistique (10-15 %), résidentiel (5-10 %). La répartition sectorielle varie selon les SCPI.",
    },
    {
      question: "Quel est l'impact du TOF sur le rendement ?",
      answer: "Un TOF inférieur à 85 % signifie que plus de 15 % du patrimoine ne génère pas de loyers, ce qui réduit mécaniquement les distributions. Le TOF doit être analysé sur plusieurs années.",
    },
    {
      question: "Peut-on déduire les intérêts d'emprunt ?",
      answer: "Oui, si la SCPI est détenue en direct. Les intérêts d'emprunt sont déductibles des revenus fonciers, ce qui réduit l'imposition. En assurance-vie, cette déduction n'est pas possible.",
    },
    {
      question: "Les SCPI France sont-elles imposées à l'IFI ?",
      answer: "Oui, les parts de SCPI France détenues en direct sont incluses dans l'assiette de l'IFI (Impôt sur la Fortune Immobilière). En assurance-vie, elles sont exonérées d'IFI.",
    },
    {
      question: "Comment déclarer les revenus d'une SCPI France ?",
      answer: "Les revenus sont à déclarer dans la catégorie des revenus fonciers (formulaire 2044 ou 2044 spécial). La société de gestion fournit chaque année un relevé fiscal détaillant les montants à déclarer.",
    },
  ],
  comparateurCtaLabel: 'Comparer SCPI françaises et européennes selon votre fiscalité',
}
