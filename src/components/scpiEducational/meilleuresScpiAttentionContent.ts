import type { ScpiEducationalPageConfig } from './shared'

export const meilleuresScpiAttentionConfig: ScpiEducationalPageConfig = {
  path: '/meilleures-scpi-attention/',
  badge: 'Classements & vigilance',
  h1: 'Meilleures SCPI : pourquoi un classement brut peut être trompeur',
  heroSubtitle:
    "Une liste des « meilleures SCPI » fondée uniquement sur le rendement ou la fiscalité peut induire en erreur. La qualité d'une SCPI se juge dans le temps : patrimoine, prix de part, valeurs, TOF, dette, liquidité, gouvernance et cohérence avec le projet.",
  seoTitle: 'Meilleures SCPI : classement, rendement, risques et critères à vérifier',
  seoDescription:
    "Comprendre les limites des classements SCPI : rendement, fiscalité, prix de part, valeurs, TOF, dette, liquidité et trajectoire.",
  shortAnswerTitle: 'Existe-t-il une meilleure SCPI ?',
  shortAnswer:
    "Non au sens universel. Une SCPI peut être adaptée à un projet et inadaptée à un autre. Les classements par rendement ignorent souvent la variation du prix de part, la qualité des actifs, les tensions de retrait et la fiscalité réelle. Un classement utile doit donc montrer les raisons d'une position, les risques et les données datées qui la soutiennent.",
  keyMessage:
    "Le classement utile n'est pas « 1 à 10 ». C'est une hiérarchie explicable, conditionnelle et révisable lorsque les données changent.",
  definitionParagraphs: [
    "Le taux de distribution mesure le revenu distribué mais pas la performance totale. Une SCPI peut afficher un taux élevé après une baisse du prix de part ou grâce à des éléments non récurrents.",
    "Le TOF doit être lu avec les franchises, les impayés, les échéances de baux et la qualité des locataires. Un chiffre élevé n'est pas une garantie.",
    "La valeur de reconstitution et la valeur de réalisation apportent une lecture patrimoniale. Leur trajectoire peut être plus informative qu'une photo ponctuelle du rendement.",
    "La liquidité est souvent absente des classements. Pourtant, des parts en attente de retrait ou une collecte insuffisante peuvent devenir le principal risque pour l'associé.",
    "La fiscalité dépend du mode de détention, des pays et du foyer. Une TMI élevée ne rend pas automatiquement une SCPI européenne meilleure, et une TMI faible ne rend pas automatiquement une SCPI française meilleure.",
    "Le classement doit enfin tenir compte du gestionnaire : discipline d'investissement, transparence, politique de prix, historique de création de valeur et gestion des périodes difficiles.",
  ],
  tableTitle: 'Classement rapide / pourquoi il peut tromper / lecture correcte',
  tableRows: [
    { level: 'Rendement le plus élevé', advantage: 'Repère simple et visible.', vigilance: 'Ajouter prix de part, résultat, valeurs, dette et qualité locative.' },
    { level: 'TOF le plus élevé', advantage: 'Mesure l’occupation financière.', vigilance: 'Ajouter franchises, locataires, baux et tendance.' },
    { level: 'Meilleure fiscalité', advantage: 'Peut améliorer le net dans certains dossiers.', vigilance: 'Calculer pays par pays et selon le mode de détention ; pas de règle par TMI.' },
    { level: 'Plus grosse capitalisation', advantage: 'Peut apporter une diversification importante.', vigilance: 'La taille ne garantit ni performance ni liquidité.' },
    { level: 'Plus forte décote', advantage: 'Peut signaler un prix attractif.', vigilance: 'Vérifier qualité des expertises et risque de baisse supplémentaire.' },
    { level: 'Meilleure collecte', advantage: 'Peut soutenir la liquidité et les acquisitions.', vigilance: 'Une collecte forte peut aussi dégrader la discipline d’investissement.' },
  ],
  tableNote:
    "Un indicateur unique est un filtre, jamais une conclusion.",
  criteriaTitle: 'Ce qu’un classement MaximusSCPI doit montrer',
  criteriaCards: [
    { title: 'Rendement', text: 'Niveau, régularité et caractère récurrent.' },
    { title: 'Prix et valeurs', text: 'Prix de part, réalisation, reconstitution et trajectoire.' },
    { title: 'TOF', text: 'Niveau, tendance et causes de vacance.' },
    { title: 'Dette', text: 'Coût, maturité, refinancement et effet de levier.' },
    { title: 'Liquidité', text: 'Retraits, parts en attente, collecte et marché secondaire.' },
    { title: 'Patrimoine', text: 'Secteurs, pays, locataires, capex et concentrations.' },
    { title: 'Fiscalité', text: 'Net réel du dossier sans automatisme par TMI.' },
    { title: 'Trajectoire', text: 'Évolution sur plusieurs périodes et ruptures structurelles.' },
  ],
  commonErrors: [
    "Acheter la SCPI classée première sur un seul critère.",
    "Comparer des rendements sans tenir compte des baisses de prix de part.",
    "Considérer la fiscalité européenne comme uniformément supérieure.",
    "Ignorer la liquidité dans un classement.",
    "Confondre décote et opportunité certaine.",
    "Ne pas dater les données utilisées dans le classement.",
    "Conserver un classement figé alors que les bulletins ont changé la trajectoire.",
  ],
  practicalCases: [
    { title: 'Rendement 7 %', text: "Une SCPI à 7 % peut être moins bien classée qu'une SCPI à 5,5 % si son prix de part baisse, sa dette augmente et sa liquidité se dégrade." },
    { title: 'SCPI européenne', text: "Une fiscalité potentiellement favorable ne suffit pas si la concentration pays, les valeurs ou la qualité locative sont moins bonnes." },
    { title: 'Décote importante', text: "Une décote peut créer une marge de sécurité, mais elle peut aussi refléter des expertises en baisse ou un marché secondaire fragile." },
    { title: 'Collecte forte', text: "Une collecte importante peut améliorer la liquidité, mais elle oblige le gestionnaire à investir vite. La discipline d'acquisition doit être contrôlée." },
  ],
  methodParagraphs: [
    "Écarter les classements qui ne publient pas leurs critères et leur date de données.",
    "Comparer les SCPI sur plusieurs dimensions et non sur un score opaque unique.",
    "Utiliser les trajectoires pour donner plus de poids aux évolutions qu'aux photos ponctuelles.",
    "Traiter la fiscalité séparément, selon le dossier, sans reclasser automatiquement par TMI.",
    "Actualiser les positions après chaque bulletin significatif ou rupture de marché.",
  ],
  conclusionParagraphs: [
    "Il n'existe pas de meilleure SCPI absolue.",
    "Un classement crédible doit rendre visibles ses hypothèses, ses données, ses vigilances et la trajectoire de chaque véhicule.",
    "MaximusSCPI doit donc fonctionner comme un outil d'analyse évolutif plutôt que comme un palmarès figé.",
  ],
  faqItems: [
    { question: 'Quelle est la meilleure SCPI ?', answer: "Cela dépend du projet, du risque, de l'horizon et des données du moment. Aucun véhicule n'est meilleur pour tous les investisseurs." },
    { question: 'Faut-il choisir le meilleur rendement ?', answer: "Non. Il faut croiser rendement, prix, valeurs, dette, liquidité et qualité locative." },
    { question: 'Une SCPI européenne est-elle meilleure à TMI élevée ?', answer: "Pas automatiquement. La fiscalité doit être calculée selon les flux et les conventions, après analyse du support." },
    { question: 'Pourquoi la liquidité compte-t-elle dans un classement ?', answer: "Parce qu'un rendement élevé perd beaucoup d'intérêt si la sortie devient longue ou incertaine." },
    { question: 'Comment MaximusSCPI classe-t-il ?', answer: "En croisant les fondamentaux, le Radar, la Trajectoire, les Signaux du marché et la fraîcheur des données." },
  ],
  comparateurCtaLabel: 'Comparer les SCPI au-delà du rendement',
}
