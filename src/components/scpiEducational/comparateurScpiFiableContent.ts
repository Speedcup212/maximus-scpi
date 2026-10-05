import type { ScpiEducationalPageConfig } from './shared'

export const comparateurScpiFiableConfig: ScpiEducationalPageConfig = {
  path: '/comparateur-scpi-fiable/',
  badge: 'Comparateur SCPI',
  h1: 'Comparateur SCPI fiable : quels critères vérifier ?',
  heroSubtitle:
    "Un comparateur SCPI est fiable s'il explique ses critères, date ses données, montre ses sources et évite les reclassements automatiques basés sur le seul rendement ou la seule TMI. La comparaison doit rester vérifiable et révisable.",
  seoTitle: 'Comparateur SCPI fiable : données, critères, sources et biais à éviter',
  seoDescription:
    "Comment évaluer un comparateur SCPI : fraîcheur des données, sources, rendement, TOF, valeurs, dette, liquidité, fiscalité et transparence du classement.",
  shortAnswerTitle: 'Comment reconnaître un comparateur SCPI fiable ?',
  shortAnswer:
    "Il doit publier les données utilisées, leur date de mise à jour, les sources, les critères de classement et les limites de l'analyse. Il ne doit pas privilégier automatiquement une géographie selon la TMI ni transformer un rendement brut en recommandation. Les écarts de données, les valeurs manquantes et les hypothèses fiscales doivent être visibles.",
  keyMessage:
    "Un comparateur crédible permet de comprendre pourquoi une SCPI apparaît devant une autre et de vérifier les données qui soutiennent cette lecture.",
  definitionParagraphs: [
    "La fiabilité commence par la fraîcheur : taux de distribution, TOF, prix de part, valeurs, dette et liquidité doivent être rattachés à une période et à une source.",
    "Les critères doivent être explicites. Un score opaque qui mélange rendement, fiscalité et risque sans expliquer les pondérations peut masquer des biais importants.",
    "La fiscalité doit être séparée de la qualité intrinsèque de la SCPI. Une TMI ne doit pas modifier automatiquement l'ordre des véhicules avant d'avoir calculé les flux réellement applicables.",
    "Les données manquantes doivent rester visibles comme telles. Remplacer une absence de donnée par une estimation non signalée crée une fausse précision.",
    "La liquidité doit faire partie de la comparaison : retraits, parts en attente, collecte et mécanisme de marché secondaire peuvent devenir plus importants que quelques dixièmes de rendement.",
    "La trajectoire historique apporte une profondeur supplémentaire. Une SCPI dont le TOF, les valeurs et la liquidité se détériorent mérite une lecture différente d'une SCPI présentant les mêmes chiffres ponctuels mais une trajectoire stable.",
    "Enfin, un comparateur fiable distingue information, analyse et conseil personnalisé. Une pré-orientation n'est pas une recommandation individuelle.",
  ],
  tableTitle: 'Point de contrôle / comparateur fiable / signal d’alerte',
  tableRows: [
    { level: 'Sources', advantage: 'Bulletins, rapports, documents officiels identifiés.', vigilance: 'Chiffres sans provenance ou source générique.' },
    { level: 'Fraîcheur', advantage: 'Date ou trimestre visible.', vigilance: 'Mélange de données de périodes différentes.' },
    { level: 'Méthode', advantage: 'Critères et pondérations expliqués.', vigilance: 'Score opaque ou classement impossible à reproduire.' },
    { level: 'Fiscalité', advantage: 'Calcul séparé selon flux et mode de détention.', vigilance: 'TMI utilisée comme filtre géographique automatique.' },
    { level: 'Liquidité', advantage: 'Retraits et parts en attente intégrés.', vigilance: 'Comparaison uniquement rendement/TOF.' },
    { level: 'Historique', advantage: 'Trajectoires et ruptures visibles.', vigilance: 'Photo ponctuelle sans évolution.' },
  ],
  tableNote:
    "La qualité d'un comparateur se mesure autant à ce qu'il refuse de simplifier qu'aux données qu'il affiche.",
  criteriaTitle: 'Critères d’un comparateur robuste',
  criteriaCards: [
    { title: 'Sources', text: 'Chaque donnée sensible doit pouvoir être rattachée à un document ou une source identifiée.' },
    { title: 'Fraîcheur', text: 'Afficher la période de référence et éviter les mélanges temporels.' },
    { title: 'Données manquantes', text: 'Les signaler explicitement et ne pas inventer une valeur de remplacement.' },
    { title: 'Méthode', text: 'Expliquer les critères, le sens des scores et les éventuelles pondérations.' },
    { title: 'Fiscalité', text: 'Distinguer qualité de la SCPI et rendement net propre au dossier.' },
    { title: 'Liquidité', text: 'Afficher les signaux de retrait et de marché secondaire lorsque disponibles.' },
    { title: 'Trajectoire', text: 'Suivre l’évolution des indicateurs dans le temps.' },
    { title: 'Conflits d’intérêts', text: 'Rendre lisible le modèle économique et la rémunération éventuelle.' },
  ],
  commonErrors: [
    "Prendre un classement automatique pour une recommandation personnalisée.",
    "Utiliser la TMI pour reclasser toutes les SCPI européennes devant les françaises.",
    "Comparer des données de périodes différentes.",
    "Masquer les valeurs manquantes avec des estimations non signalées.",
    "Ignorer la liquidité et les retraits.",
    "Ne pas expliquer la méthode de score.",
    "Afficher des sources sans indiquer la date de mise à jour.",
  ],
  practicalCases: [
    { title: 'Comparateur par rendement', text: "Deux SCPI sont classées uniquement sur leur taux de distribution. La comparaison est incomplète tant que prix de part, valeurs, dette, TOF et liquidité ne sont pas ajoutés." },
    { title: 'Comparateur par TMI', text: "Un investisseur à TMI 41 % ne doit pas voir toutes les SCPI françaises rétrogradées par principe. Le net fiscal est calculé séparément après l'analyse du support." },
    { title: 'Donnée ancienne', text: "Un TOF de l'année précédente ne doit pas être mélangé avec un prix de part actuel sans signalement." },
    { title: 'Signal de liquidité', text: "Une SCPI bien classée sur rendement peut être rétrogradée dans l'analyse qualitative si les parts en attente augmentent fortement." },
  ],
  methodParagraphs: [
    "Contrôler l'origine et la date de chaque donnée clé.",
    "Vérifier que la méthode de comparaison est documentée et reproductible.",
    "Séparer score intrinsèque de la SCPI et fiscalité propre au dossier.",
    "Intégrer les données de liquidité et les ruptures de trajectoire.",
    "Afficher les hypothèses et les incertitudes au lieu de masquer les données absentes.",
    "Réévaluer les résultats après chaque bulletin significatif.",
  ],
  conclusionParagraphs: [
    "Un comparateur fiable n'est pas celui qui donne une réponse immédiate, mais celui qui rend la décision vérifiable.",
    "La transparence des sources, de la fraîcheur et de la méthode constitue une partie du produit, pas un détail éditorial.",
    "MaximusSCPI doit donc conserver une séparation nette entre données, analyse, fiscalité du dossier et recommandation personnalisée.",
  ],
  faqItems: [
    { question: 'Un comparateur SCPI peut-il être totalement objectif ?', answer: "Il peut réduire les biais en rendant sa méthode, ses sources et ses limites explicites. Un classement reste toujours dépendant des critères retenus." },
    { question: 'La TMI doit-elle modifier le classement ?', answer: "Elle peut modifier le rendement net du dossier, mais ne doit pas reclasser automatiquement la qualité intrinsèque des SCPI." },
    { question: 'Que faire si une donnée manque ?', answer: "La signaler comme manquante et éviter de la remplacer par une estimation non sourcée." },
    { question: 'Pourquoi la trajectoire est-elle importante ?', answer: "Parce qu'elle permet de distinguer un chiffre ponctuel d'une tendance structurelle." },
    { question: 'Que doit afficher MaximusSCPI ?', answer: "Sources, fraîcheur, chiffres clés, Radar, Trajectoire, Signaux du marché et limites des données." },
  ],
  comparateurCtaLabel: 'Voir le comparateur SCPI et ses sources',
}
