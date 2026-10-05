import type { ScpiEducationalPageConfig } from './shared'

export const allocationScpiConfig: ScpiEducationalPageConfig = {
  path: '/allocation-scpi/',
  badge: 'Construction de portefeuille',
  h1: 'Allocation SCPI : répartir un portefeuille sans biais automatique',
  heroSubtitle:
    "Une allocation SCPI cohérente répartit les risques entre gestionnaires, secteurs, zones géographiques, maturités et niveaux de liquidité. La TMI ne doit pas dicter automatiquement une allocation France ou Europe : la fiscalité intervient après l'analyse des supports et des flux.",
  seoTitle: 'Allocation SCPI : diversification, risques, fiscalité et méthode',
  seoDescription:
    "Méthode d'allocation SCPI : diversification, poids par ligne, secteurs, géographies, liquidité, fiscalité et suivi dans le temps.",
  shortAnswerTitle: 'Comment construire une allocation SCPI ?',
  shortAnswer:
    "Commencez par définir le rôle de chaque ligne : revenu, diversification, exposition sectorielle ou géographique, puis plafonnez les concentrations. La sélection doit reposer sur les fondamentaux et la liquidité. La fiscalité du dossier sert ensuite à comparer les modes de détention et le rendement net, sans imposer automatiquement des SCPI européennes ou françaises selon la TMI.",
  keyMessage:
    "Une allocation robuste ne cherche pas à maximiser un rendement théorique : elle cherche à éviter qu'un seul risque locatif, sectoriel, géographique ou de liquidité mette en difficulté l'ensemble du portefeuille.",
  definitionParagraphs: [
    "Une allocation SCPI est la répartition du capital entre plusieurs véhicules. Son objectif principal est la maîtrise des concentrations, pas l'empilement de produits.",
    "Deux SCPI gérées par des sociétés différentes peuvent être fortement corrélées si elles détiennent les mêmes secteurs, les mêmes zones ou des locataires comparables.",
    "Le poids par ligne doit tenir compte de la taille du portefeuille et de la conviction sur le support. Une ligne ne devient pas plus sûre parce qu'elle affiche un rendement supérieur.",
    "La diversification géographique doit être réelle. France, zone euro et hors zone euro peuvent répondre à des cycles immobiliers et réglementaires différents, mais chaque zone ajoute aussi ses propres risques.",
    "La diversification sectorielle doit être croisée avec les tendances structurelles : bureaux, commerces, santé, logistique, résidentiel ou hôtellerie n'ont pas les mêmes cycles ni les mêmes besoins de capex.",
    "La liquidité doit être répartie elle aussi. Un portefeuille composé uniquement de SCPI présentant déjà des tensions de retrait reste fragile, même s'il est diversifié par secteur.",
    "La fiscalité intervient enfin au niveau du dossier : direct, assurance-vie, démembrement, crédit ou société doivent être comparés selon les flux réels et non selon une règle automatique liée à la seule TMI.",
  ],
  tableTitle: 'Dimension / objectif / vigilance',
  tableRows: [
    { level: 'Poids par ligne', advantage: 'Limiter l’impact d’un problème isolé.', vigilance: 'Éviter une ligne dominante sans justification forte.' },
    { level: 'Gestionnaires', advantage: 'Diversifier les styles de gestion et les réseaux de sourcing.', vigilance: 'Plusieurs véhicules d’un même gestionnaire peuvent partager les mêmes risques.' },
    { level: 'Secteurs', advantage: 'Répartir les cycles immobiliers.', vigilance: 'Ne pas considérer un secteur comme défensif par principe.' },
    { level: 'Géographies', advantage: 'Diversifier les marchés et les cycles.', vigilance: 'Fiscalité, change, droit local et concentration pays à contrôler.' },
    { level: 'Liquidité', advantage: 'Réduire la dépendance à un seul mécanisme de sortie.', vigilance: 'Parts en attente et collecte insuffisante peuvent contaminer le portefeuille.' },
    { level: 'Fiscalité', advantage: 'Comparer le net réel des modes de détention.', vigilance: 'Pas d’allocation automatique par TMI.' },
  ],
  tableNote:
    "Le nombre de SCPI n'est pas une mesure de diversification. Ce sont les risques sous-jacents réellement différents qui comptent.",
  criteriaTitle: 'Critères d’une allocation robuste',
  criteriaCards: [
    { title: 'Concentration', text: 'Mesurer le poids de chaque SCPI, gestionnaire, secteur et pays.' },
    { title: 'Trajectoire', text: 'Éviter d’empiler plusieurs véhicules dont les signaux se dégradent simultanément.' },
    { title: 'Liquidité', text: 'Répartir les risques de retrait et suivre les parts en attente.' },
    { title: 'Dette', text: 'Contrôler le levier global indirect détenu via les SCPI.' },
    { title: 'Valeurs', text: 'Suivre l’évolution des valeurs d’expertise et du prix de part de chaque ligne.' },
    { title: 'Fiscalité', text: 'Comparer les flux et enveloppes après sélection des supports, sans filtre géographique automatique.' },
    { title: 'Horizon', text: 'Adapter le portefeuille à la durée réelle pendant laquelle le capital peut rester immobilisé.' },
  ],
  commonErrors: [
    "Répartir 20 % sur cinq SCPI sans vérifier qu'elles ont des risques différents.",
    "Surpondérer une SCPI parce qu'elle affiche le meilleur rendement récent.",
    "Construire une allocation Europe uniquement parce que la TMI est élevée.",
    "Construire une allocation France uniquement parce que la TMI est faible.",
    "Ignorer la liquidité et les parts en attente.",
    "Sous-estimer l'endettement cumulé des véhicules.",
    "Ne jamais rééquilibrer après une rupture structurelle.",
  ],
  practicalCases: [
    { title: 'Portefeuille concentré', text: "Trois SCPI de bureaux européennes gérées par trois sociétés différentes restent exposées au même cycle. La diversification doit être élargie aux secteurs et aux types d'actifs." },
    { title: 'TMI 30 %', text: "La TMI n'entraîne aucun reclassement automatique. Les SCPI françaises et européennes sont d'abord comparées sur leurs fondamentaux, puis leur net fiscal est simulé selon le dossier." },
    { title: 'Liquidité fragile', text: "Une SCPI attractive mais avec des retraits en forte hausse peut rester dans l'univers d'analyse avec un poids réduit plutôt qu'être automatiquement surpondérée pour son rendement." },
    { title: 'Rééquilibrage', text: "Une baisse durable du TOF, des valeurs ou de la liquidité peut justifier de réduire une ligne même si son rendement courant reste élevé." },
  ],
  methodParagraphs: [
    "Définir l'objectif global : revenus, diversification, capitalisation ou combinaison de plusieurs objectifs.",
    "Écarter ou réduire les véhicules présentant des ruptures majeures non expliquées.",
    "Mesurer les concentrations par ligne, gestionnaire, secteur, pays et type d'actif.",
    "Croiser rendement, TOF, valeurs, dette et liquidité de chaque composante.",
    "Calculer ensuite la fiscalité propre au mode de détention sans modifier artificiellement le classement des supports selon la TMI.",
    "Fixer des poids maximums et rééquilibrer lorsque la Trajectoire ou les Signaux du marché changent.",
  ],
  conclusionParagraphs: [
    "Une allocation SCPI n'est pas un classement de rendements mais une architecture de risques.",
    "La diversification doit être réelle sur les actifs, les secteurs, les zones, les gestionnaires et la liquidité.",
    "La fiscalité optimise éventuellement le mode de détention ; elle ne remplace pas la sélection des supports.",
  ],
  faqItems: [
    { question: 'Combien de SCPI faut-il détenir ?', answer: "Il n'existe pas de nombre optimal universel. Le bon nombre dépend du capital, des risques réellement diversifiés et du suivi possible." },
    { question: 'Faut-il répartir à parts égales ?', answer: "Pas nécessairement. Les poids doivent refléter le risque, la conviction et les concentrations déjà présentes." },
    { question: 'La TMI doit-elle déterminer la géographie ?', answer: "Non. Elle intervient dans le calcul fiscal, mais ne doit pas exclure automatiquement France ou Europe." },
    { question: 'Comment gérer une SCPI qui se dégrade ?', answer: "Réévaluer son poids en croisant trajectoire, liquidité, valeurs et perspectives plutôt que réagir au seul rendement." },
    { question: 'Comment MaximusSCPI aide-t-il à répartir ?', answer: "Le Radar, la Trajectoire et les Signaux permettent de comparer les risques avant de fixer les poids de portefeuille." },
  ],
  comparateurCtaLabel: 'Construire une allocation SCPI diversifiée',
}
