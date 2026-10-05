import type { ScpiEducationalPageConfig } from './shared'

export const choisirScpiConfig: ScpiEducationalPageConfig = {
  path: '/choisir-scpi/',
  badge: 'Méthode de sélection',
  h1: 'Comment choisir une SCPI : méthode, critères et erreurs à éviter',
  heroSubtitle:
    "Choisir une SCPI nécessite une lecture multicritère : rendement, occupation, valeurs, dette, liquidité, diversification, gestionnaire et fiscalité réelle du dossier. Aucun indicateur ni aucune TMI ne justifie à lui seul de privilégier ou d'exclure une SCPI.",
  seoTitle: 'Comment choisir une SCPI : critères, risques, liquidité et méthode',
  seoDescription:
    "Méthode pour choisir une SCPI : taux de distribution, TOF, valeurs, dette, liquidité, diversification, frais, fiscalité et trajectoire.",
  shortAnswerTitle: 'Quels critères regarder avant de choisir une SCPI ?',
  shortAnswer:
    "Commencez par la qualité du véhicule : patrimoine, TOF, locataires, baux, valeurs d'expertise, dette, liquidité et historique du prix de part. Ajoutez ensuite la fiscalité correspondant au mode de détention et à la situation du foyer. La fiscalité ne doit pas remplacer l'analyse immobilière : une SCPI européenne n'est pas automatiquement meilleure à TMI élevée, et une SCPI française n'est pas automatiquement préférable à TMI faible.",
  keyMessage:
    "Le bon choix n'est pas la SCPI qui affiche le meilleur rendement, mais celle dont les fondamentaux, la liquidité et le mode de détention restent cohérents avec le projet dans plusieurs scénarios.",
  definitionParagraphs: [
    "Le taux de distribution est un point de départ, pas une note globale. Il doit être lu avec la trajectoire du prix de part, les valeurs de réalisation et de reconstitution et la part éventuelle de distribution non récurrente.",
    "Le TOF renseigne sur l'occupation financière mais doit être complété par la qualité des locataires, les franchises, les impayés, les échéances de baux et les actifs vacants.",
    "L'endettement doit être analysé par son coût, sa maturité et sa capacité de refinancement. Un pourcentage isolé ne suffit pas pour qualifier le risque.",
    "La liquidité doit être étudiée avant la souscription : collecte, retraits, parts en attente, marché secondaire et capacité du gestionnaire à absorber les demandes de sortie.",
    "La diversification se mesure dans les actifs réellement détenus : secteurs, pays, villes, locataires et tailles d'actifs. Plusieurs SCPI peuvent exposer l'investisseur aux mêmes risques sous des noms différents.",
    "La fiscalité se traite ensuite par flux et par mode de détention. Direct France, revenus étrangers, assurance-vie, démembrement ou société ne suivent pas les mêmes règles. La TMI seule ne doit jamais devenir un filtre géographique automatique.",
    "Enfin, la qualité du gestionnaire se juge dans le temps : discipline d'acquisition, transparence, gestion locative, politique de prix de part, communication sur les difficultés et capacité à gérer les cycles immobiliers.",
  ],
  tableTitle: 'Critère / question utile / signal de vigilance',
  tableRows: [
    { level: 'Rendement', advantage: 'Quelle part est réellement récurrente ?', vigilance: 'Rendement élevé sans soutien des fondamentaux ou après baisse du prix de part.' },
    { level: 'TOF et baux', advantage: 'L’occupation est-elle durable ?', vigilance: 'TOF en baisse, franchises élevées, concentration locative.' },
    { level: 'Valeurs', advantage: 'Le prix de part reste-t-il cohérent avec les expertises ?', vigilance: 'Écart important ou baisse répétée des valeurs.' },
    { level: 'Dette', advantage: 'Le levier est-il soutenable ?', vigilance: 'Coût élevé, maturités proches, refinancement difficile.' },
    { level: 'Liquidité', advantage: 'La sortie fonctionne-t-elle normalement ?', vigilance: 'Parts en attente, collecte insuffisante, délais qui s’allongent.' },
    { level: 'Fiscalité', advantage: 'Quel est le net réel du dossier ?', vigilance: 'Classement automatique par TMI ou pays.' },
  ],
  tableNote:
    "Une SCPI solide sur cinq critères mais fragile sur la liquidité ou les valeurs peut nécessiter une allocation réduite ou une abstention.",
  criteriaTitle: 'Les critères MaximusSCPI à croiser',
  criteriaCards: [
    { title: 'Taux de distribution', text: 'À lire avec la trajectoire du prix de part et la qualité du résultat.' },
    { title: 'TOF', text: 'Suivre le niveau et son évolution, puis regarder les causes de vacance.' },
    { title: 'WALB / WALT', text: 'Mesurer la visibilité locative et les échéances de baux.' },
    { title: 'Valeurs', text: 'Comparer prix, réalisation et reconstitution dans le temps.' },
    { title: 'Endettement', text: 'Analyser coût, maturités et refinancement plutôt qu’un seuil arbitraire.' },
    { title: 'Liquidité', text: 'Contrôler retraits, collecte et parts en attente.' },
    { title: 'Diversification', text: 'Regarder les expositions réelles, pas seulement les étiquettes sectorielles.' },
    { title: 'Fiscalité', text: 'Calculer le net selon les flux, le pays et le mode de détention.' },
  ],
  commonErrors: [
    "Choisir uniquement sur le taux de distribution.",
    "Considérer un TOF élevé comme une garantie de qualité.",
    "Utiliser la TMI pour imposer automatiquement une allocation France ou Europe.",
    "Négliger les parts en attente et la liquidité.",
    "Comparer des SCPI sans tenir compte de la trajectoire des valeurs.",
    "Diversifier par nombre de SCPI sans vérifier les risques sous-jacents communs.",
    "Confondre fiscalité favorable et qualité du véhicule.",
  ],
  practicalCases: [
    { title: 'TMI élevée', text: "L'investisseur compare des SCPI françaises et européennes sans exclure aucun univers. La fiscalité est calculée flux par flux après validation des fondamentaux et de la liquidité." },
    { title: 'Rendement élevé', text: "Une SCPI à 7 % n'est pas automatiquement retenue si son prix de part baisse, si les retraits augmentent ou si le TOF se dégrade." },
    { title: 'SCPI très capitalisée', text: "Une grande capitalisation peut apporter de la diversification mais ne protège ni contre une mauvaise allocation d'actifs ni contre un problème de liquidité." },
    { title: 'Diversification', text: "Trois SCPI de bureaux parisiennes ne constituent pas une diversification suffisante, même si les gestionnaires sont différents." },
  ],
  methodParagraphs: [
    "Éliminer d'abord les véhicules présentant des ruptures majeures non expliquées : liquidité, valeurs, gouvernance ou données insuffisantes.",
    "Comparer ensuite rendement, TOF, baux, valeurs, dette et diversification sur plusieurs périodes.",
    "Lire la Trajectoire pour distinguer un accident ponctuel d'une dégradation structurelle.",
    "Calculer le rendement net selon la fiscalité réelle du dossier sans classement automatique par TMI.",
    "Construire l'allocation en tenant compte des corrélations entre secteurs, pays et gestionnaires.",
    "Réévaluer la sélection à chaque publication significative et à chaque rupture détectée par les Signaux du marché.",
  ],
  conclusionParagraphs: [
    "Une bonne sélection SCPI repose sur la cohérence entre fondamentaux, liquidité, prix et projet patrimonial.",
    "La fiscalité est une couche d'analyse, pas un raccourci de sélection.",
    "MaximusSCPI doit donc privilégier une lecture Radar + Trajectoire + Signaux plutôt qu'un classement figé par rendement ou TMI.",
  ],
  faqItems: [
    { question: 'Quel est le critère le plus important ?', answer: "Il n'y en a pas un seul. Le diagnostic vient de la combinaison rendement, occupation, valeurs, dette, liquidité et qualité du patrimoine." },
    { question: 'Faut-il choisir les SCPI européennes avec une TMI élevée ?', answer: "Pas automatiquement. Il faut comparer la fiscalité réelle, les risques et les fondamentaux de chaque SCPI." },
    { question: 'Un TOF supérieur à 90 % suffit-il ?', answer: "Non. Il faut comprendre les locataires, les baux, les franchises et la tendance du TOF." },
    { question: 'Une forte capitalisation est-elle plus sûre ?', answer: "Elle peut améliorer la diversification, mais ne garantit ni la liquidité ni la qualité du patrimoine." },
    { question: 'Comment intégrer la fiscalité ?', answer: "Après l'analyse du support, en calculant le net selon le mode de détention, la nature des revenus et les pays concernés." },
    { question: 'Comment MaximusSCPI aide-t-il au choix ?', answer: "Avec les chiffres clés, le Radar, la Trajectoire, les Signaux du marché et les sources datées." },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avec une méthode multicritère',
}
