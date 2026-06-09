import type { ScpiEducationalPageConfig } from './shared'

export const tofScpiConfig: ScpiEducationalPageConfig = {
  path: '/tof-scpi',
  badge: 'Indicateur SCPI',
  h1: 'TOF SCPI : comprendre le taux d\'occupation financier avant d\'investir',
  heroSubtitle:
    'Le TOF mesure la part des loyers effectivement encaissés par rapport aux loyers qui seraient facturés si tout le patrimoine était loué. C\'est un indicateur clé de la qualité locative d\'une SCPI, mais il ne suffit pas à lui seul. Il doit être analysé avec le rendement, la capitalisation, l\'endettement, la décote ou surcote et la qualité du patrimoine.',
  seoTitle: 'TOF SCPI : définition, seuils, calcul et interprétation pédagogique',
  seoDescription:
    'Analyse complète du taux d\'occupation financier des SCPI : définition, différence avec le taux physique, seuils d\'interprétation, exemples chiffrés, cas pratiques et méthode d\'analyse. Croiser TOF avec rendement, capitalisation, endettement et décote.',
  shortAnswerTitle: 'À quoi sert le TOF d\'une SCPI ?',
  shortAnswer:
    'Le TOF (taux d\'occupation financier) exprime le rapport entre les loyers effectivement encaissés et les loyers théoriques qui seraient perçus si l\'ensemble du patrimoine était loué. Il aide à mesurer la capacité d\'une SCPI à générer des loyers à partir de son patrimoine. Un TOF élevé peut indiquer une bonne occupation locative, mais il ne garantit ni le rendement ni la qualité du patrimoine. Un TOF faible peut signaler une vacance, des travaux ou des difficultés locatives. Le TOF doit impérativement être analysé sur plusieurs exercices et croisé avec la capitalisation, le rendement, l\'endettement, la décote ou surcote sur valeur de reconstitution, les frais, le report à nouveau, le secteur immobilier et la zone géographique.',
  keyMessage:
    'Le TOF mesure l\'occupation locative, pas la qualité d\'une SCPI. Un TOF élevé ne garantit ni le rendement ni la sécurité. Un TOF faible n\'est pas un motif d\'exclusion automatique, mais un signal d\'analyse.',
  definitionParagraphs: [
    'Le taux d\'occupation financier (TOF) exprime le rapport entre les loyers effectivement encaissés et les loyers théoriques qui seraient perçus si l\'ensemble du patrimoine était occupé et générateur de loyers. Il est publié dans les bulletins trimestriels et rapports annuels des sociétés de gestion.',
    'Il ne faut pas le confondre avec le taux d\'occupation physique, qui mesure la surface louée. Le TOF intègre la dimension financière : il tient compte des loyers réellement facturés, des franchises éventuelles et des périodes de vacance. Un immeuble partiellement loué mais avec loyers maintenus partiellement peut afficher un TOF différent du taux d\'occupation physique.',
    'Un TOF de 100 % n\'est pas automatiquement synonyme de bonne SCPI : il peut coïncider avec un rendement faible, une surcote importante ou une concentration sectorielle défavorable. Un TOF de 100 % signifie que tous les loyers théoriques ont été encaissés, mais il ne dit rien sur la pertinence du niveau de loyer ni sur la qualité des locataires.',
    'Un TOF faible peut signaler une vacance locative, des travaux en cours, un repositionnement stratégique ou des difficultés d\'attractivité du patrimoine. L\'évolution sur plusieurs exercices est plus informative qu\'une photographie ponctuelle. Un TOF en baisse sur trois trimestres consécutifs mérite une analyse approfondie.',
    'Le TOF ne doit jamais être lu isolément. Il doit être croisé avec la capitalisation (taille de la SCPI et capacité de diversification), le rendement (taux de distribution et sa soutenabilité), l\'endettement (charge financière et risque de taux), la décote ou surcote (prix d\'entrée par rapport à la valeur patrimoniale), les frais (impact sur le rendement net), le report à nouveau (réserve disponible), le secteur immobilier (bureaux, commerces, logistique, santé) et la zone géographique.',
    'Les sociétés de gestion publient le TOF dans leurs bulletins trimestriels. MaximusSCPI centralise cet indicateur dans son comparateur pour faciliter la lecture croisée avec les autres critères.',
  ],
  tableTitle: 'Comment interpréter le niveau de TOF ?',
  tableRows: [
    {
      level: 'TOF ≥ 95 %',
      advantage:
        'Occupation financière élevée, généralement rassurante sur la capacité à facturer les loyers. Reflète une bonne gestion locative.',
      vigilance:
        'Ne garantit ni le rendement ni la qualité du patrimoine. À croiser avec la surcote éventuelle, le secteur et la diversification.',
    },
    {
      level: 'TOF entre 90 % et 95 %',
      advantage:
        'Niveau généralement solide, compatible avec une SCPI correctement occupée. Quelques vacances ponctuelles peuvent exister.',
      vigilance:
        'Analyser l\'évolution sur plusieurs trimestres. Comprendre les causes des éventuelles vacances ou relocations en cours.',
    },
    {
      level: 'TOF entre 85 % et 90 %',
      advantage:
        'Situation parfois temporaire : travaux, arbitrages, relocation ou repositionnement du patrimoine expliquent la baisse.',
      vigilance:
        'Zone de vigilance. Identifier les causes précises. Vérifier si la baisse est ponctuelle (travaux programmés) ou structurelle (difficulté locative).',
    },
    {
      level: 'TOF < 85 %',
      advantage:
        'Potentiel de redressement si la vacance est temporaire, bien expliquée et accompagnée d\'une stratégie documentée.',
      vigilance:
        'Signal faible. Risque de vacance durable, baisse des revenus, difficulté d\'attractivité du patrimoine ou besoin de cessions.',
    },
  ],
  tableNote:
    'Ces seuils sont des repères indicatifs basés sur les pratiques du marché français. Ils ne constituent pas une grille de notation universelle. Le TOF doit être croisé avec le secteur immobilier, la capitalisation, le rendement, l\'endettement, les frais, la décote ou surcote sur valeur de reconstitution et l\'évolution historique du patrimoine.',
  criteriaTitle: 'Critères à croiser avec le TOF',
  criteriaCards: [
    { title: 'Capitalisation', text: 'La taille de la SCPI influence sa capacité de diversification et sa résilience. Une capitalisation modeste peut concentrer le risque sur peu d\'actifs.' },
    { title: 'Rendement', text: 'Le taux de distribution est une donnée historique. Il doit être analysé avec la fiscalité nette, les frais et la soutenabilité du niveau de distribution.' },
    { title: 'Endettement', text: 'Un endettement élevé peut amplifier les performances mais aussi les risques en période de hausse des taux ou de baisse des loyers.' },
    { title: 'Décote / surcote', text: 'Comparer le prix de souscription à la valeur de reconstitution permet de vérifier si l\'on achète le patrimoine à un prix cohérent.' },
    { title: 'Report à nouveau', text: 'Le report à nouveau reflète la capacité de la SCPI à lisser ses distributions et à renforcer son patrimoine sur la durée.' },
    { title: 'Frais', text: 'Les frais de souscription et de gestion pèsent directement sur le rendement net perçu par l\'investisseur.' },
    { title: 'Zone géographique', text: 'Une exposition concentrée sur une seule zone peut accentuer le risque locatif même avec un TOF élevé.' },
    { title: 'Secteur immobilier', text: 'Bureaux, commerces, logistique ou santé n\'ont pas les mêmes cycles locatifs. Le TOF doit être interprété selon le secteur.' },
    { title: 'Société de gestion', text: 'La qualité de la gestion locative, le suivi des baux et la politique d\'arbitrage influencent l\'évolution du TOF.' },
    { title: 'Collecte', text: 'Une collecte soutenue peut financer des acquisitions qui améliorent ou dégradent le TOF futur selon la qualité des actifs achetés.' },
    { title: 'Liquidité', text: 'Un TOF bas peut accroître la pression sur la liquidité si la SCPI doit céder des actifs pour maintenir ses distributions.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement sur son rendement affiché sans regarder le TOF ni son évolution.',
    'Croire qu\'un TOF élevé garantit le rendement futur ou la sécurité du placement.',
    'Comparer deux TOF sans tenir compte des secteurs immobiliers (bureaux vs logistique vs santé).',
    'Ignorer l\'évolution du TOF sur plusieurs exercices et ne regarder qu\'une seule valeur.',
    'Confondre TOF et taux de distribution : le TOF mesure l\'occupation, le TDVM mesure le revenu distribué.',
    'Écarter une SCPI uniquement parce que son TOF est temporairement bas sans analyser les causes.',
    'Confondre taux d\'occupation financier et taux d\'occupation physique.',
    'Ne pas croiser le TOF avec l\'endettement : un TOF bas avec une dette élevée aggrave le risque.',
  ],
  practicalCases: [
    {
      title: 'SCPI récente — TOF en phase de montée en puissance',
      text: 'Une SCPI lancée depuis 18 mois affiche un TOF de 82 %. Les actifs sont en cours d\'acquisition et certains immeubles sont en relocation. Le TOF bas est lié à la jeunesse du patrimoine, pas à une difficulté locative. Simulation pédagogique : analyser le carnet d\'acquisitions et le plan de développement pour évaluer la trajectoire du TOF.',
    },
    {
      title: 'SCPI en repositionnement — Baisse temporaire du TOF',
      text: 'Une SCPI a cédé plusieurs actifs pour se recentrer sur la logistique. Le TOF est passé de 96 % à 88 % pendant la phase de transition. Si le repositionnement est documenté et les acquisitions futures identifiées, la baisse peut être temporaire. Simulation pédagogique : vérifier que la trésorerie et le report à nouveau permettent de traverser cette phase.',
    },
    {
      title: 'SCPI bureaux — Vacance sur un actif majeur',
      text: 'Une SCPI concentrée sur les bureaux en région parisienne a perdu un locataire représentant 15 % des loyers. Le TOF est passé de 97 % à 83 %. La vacance peut être longue si le marché des bureaux est atone. Simulation pédagogique : le risque de concentration locative aggrave l\'impact d\'un départ sur le TOF et les distributions.',
    },
    {
      title: 'SCPI diversifiée — TOF élevé mais surcote importante',
      text: 'Avec un TOF de 98 %, une SCPI diversifiée logistique/commerce affiche une surcote de 12 % sur valeur de reconstitution. Le TOF rassure sur la qualité locative, mais la surcote interroge sur le prix d\'entrée. Simulation pédagogique : le TOF ne justifie pas une surcote élevée si le patrimoine n\'a pas de caractéristique exceptionnelle.',
    },
    {
      title: 'SCPI logistique — TOF stable dans la durée',
      text: 'Une SCPI logistique européenne maintient un TOF supérieur à 96 % depuis cinq exercices. La stabilité et la régularité de l\'indicateur sont des signaux positifs, mais elles ne garantissent ni le rendement futur ni l\'absence de risque sectoriel. Simulation pédagogique : la régularité du TOF est un élément d\'appréciation, pas une certitude.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI intègre le TOF dans le comparateur aux côtés du rendement, de la capitalisation, de l\'endettement, de la décote ou surcote et des frais. L\'objectif est de faciliter une lecture croisée systématique, sans réduire l\'analyse à un seul indicateur.',
    'La première étape consiste à relever le TOF du dernier exercice et à le comparer avec les trois exercices précédents. Une tendance baissière sur plusieurs années est plus significative qu\'un niveau ponctuel.',
    'La deuxième étape vérifie la cohérence du TOF avec le secteur immobilier : un TOF de 90 % dans les bureaux peut être interprété différemment du même TOF dans la logistique, où la rotation des baux est généralement plus rapide.',
    'La troisième étape croise le TOF avec la capitalisation : un TOF bas sur une petite capitalisation concentre le risque sur moins d\'actifs. Une grande capitalisation peut mieux absorber une baisse temporaire du TOF.',
    'Enfin, MaximusSCPI encourage le croisement systématique du TOF avec l\'endettement, la décote ou surcote et le rendement. Un TOF bas associé à un endettement élevé et une surcote persistante constitue un signal de vigilance renforcée à approfondir avec un conseiller.',
  ],
  conclusionParagraphs: [
    'Le TOF est un indicateur clé de la qualité locative d\'une SCPI, mais il ne suffit jamais à lui seul pour prendre une décision. Il doit être analysé en tendance, croisé avec le rendement, la capitalisation, l\'endettement, la décote ou surcote, les frais et le secteur immobilier.',
    'Les exemples et simulations présentés dans cette page sont des illustrations pédagogiques. Ils ne constituent pas une analyse de SCPI identifiées, ni une recommandation personnalisée au sens de la réglementation MIF2. Avant toute souscription, il convient d\'analyser les documents réglementaires de la SCPI concernée.',
    'Sources et points à vérifier : bulletins trimestriels et rapports annuels des sociétés de gestion, DIC, notes d\'information, site ASPIM. Pour les données consolidées, consulter le comparateur MaximusSCPI.',
  ],
  faqItems: [
    {
      question: 'Qu\'est-ce que le TOF d\'une SCPI ?',
      answer: 'Le TOF (taux d\'occupation financier) mesure la part des loyers effectivement encaissés par rapport aux loyers théoriques si tout le patrimoine était loué. Il est publié par les sociétés de gestion dans leurs bulletins trimestriels.',
    },
    {
      question: 'Quelle différence entre TOF et taux d\'occupation physique ?',
      answer: 'Le TOF mesure la part des loyers encaissés (dimension financière). Le taux d\'occupation physique mesure la surface louée (dimension physique). Les deux indicateurs sont complémentaires mais distincts.',
    },
    {
      question: 'Un TOF élevé garantit-il le rendement ?',
      answer: 'Non. Le TOF mesure l\'occupation locative, pas le montant des distributions. Une SCPI peut avoir un TOF de 100 % et distribuer peu si les loyers sont bas ou si les frais sont élevés. Les revenus SCPI ne sont pas garantis.',
    },
    {
      question: 'Faut-il éviter une SCPI avec un TOF faible ?',
      answer: 'Pas automatiquement. Un TOF faible peut être temporaire (travaux, relocation, repositionnement). Il convient d\'analyser les causes, la tendance sur plusieurs exercices et la stratégie du gestionnaire avant de conclure.',
    },
    {
      question: 'Comment analyser l\'évolution du TOF ?',
      answer: 'Comparer le TOF sur les 3 à 5 derniers exercices. Une tendance baissière régulière est plus préoccupante qu\'une baisse ponctuelle expliquée par un événement identifié (cession, travaux).',
    },
    {
      question: 'Le TOF est-il plus important que le rendement ?',
      answer: 'Les deux indicateurs sont importants et doivent être analysés ensemble. Un rendement élevé avec un TOF faible peut signaler une distribution non soutenable. Un TOF élevé avec un rendement faible peut refléter une gestion prudente mais une performance modeste.',
    },
    {
      question: 'Quel TOF pour une SCPI de bureaux ?',
      answer: 'Le TOF des SCPI de bureaux varie selon la localisation et la qualité des actifs. Un TOF supérieur à 90 % est généralement considéré comme correct pour le secteur. Les SCPI logistiques et santé tendent à afficher des TOF plus élevés.',
    },
    {
      question: 'Le TOF peut-il baisser rapidement ?',
      answer: 'Oui, notamment si un locataire majeur quitte un actif important. Le départ d\'un locataire représentant 20 % des loyers peut faire baisser le TOF de plusieurs points en un trimestre.',
    },
    {
      question: 'Comment MaximusSCPI utilise le TOF ?',
      answer: 'MaximusSCPI intègre le TOF dans le comparateur aux côtés du rendement, de la capitalisation, de l\'endettement et de la décote. L\'objectif est une pré-orientation pédagogique structurée, sans constituer une recommandation personnalisée.',
    },
    {
      question: 'Où trouver le TOF d\'une SCPI ?',
      answer: 'Dans les bulletins trimestriels, rapports annuels et notes d\'information des sociétés de gestion. Le site ASPIM et le comparateur MaximusSCPI centralisent également ces données.',
    },
    {
      question: 'Quels sont les risques d\'un TOF bas ?',
      answer: 'Baisse des revenus distribuables, pression sur le rendement, risque de cession d\'actifs à perte, et dans certains cas, réduction du prix de part. Un TOF bas combiné à un endettement élevé aggrave ces risques.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur TOF',
}
