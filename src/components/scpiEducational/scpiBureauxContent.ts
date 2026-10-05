import type { ScpiEducationalPageConfig } from './shared'

export const scpiBureauxConfig: ScpiEducationalPageConfig = {
  path: '/scpi-bureaux',
  badge: 'Secteur bureaux',
  h1: 'SCPI bureaux : analyser les actifs, la vacance et la trajectoire',
  heroSubtitle:
    'Le marché des bureaux est très hétérogène. Centralité, qualité technique, performance environnementale, locataires, baux et profondeur du marché local comptent davantage qu’une étiquette « bureaux » prise isolément.',
  seoTitle: 'SCPI bureaux : risques, TOF, valorisation, liquidité et analyse',
  seoDescription:
    'Analyse des SCPI bureaux : localisation, TOF, baux, vacance, valeurs, travaux, dette, liquidité, télétravail et critères de vigilance.',
  shortAnswerTitle: 'Comment analyser une SCPI de bureaux ?',
  shortAnswer:
    'Il faut partir du patrimoine réel : localisation immeuble par immeuble, qualité des actifs, locataires, baux, vacance, besoins de travaux, valeurs d’expertise, dette et liquidité. Les bureaux centraux et adaptés aux usages peuvent suivre une trajectoire très différente d’actifs secondaires ou obsolètes. Le diagnostic doit donc être fait SCPI par SCPI et sur plusieurs périodes.',
  keyMessage:
    'Le bon diagnostic n’est pas « bureaux = bon » ou « bureaux = mauvais ». Il faut identifier quels actifs, où, loués à qui, à quel coût de remise à niveau et avec quelle liquidité.',
  definitionParagraphs: [
    'Les SCPI bureaux investissent dans des immeubles tertiaires utilisés par des entreprises, administrations ou opérateurs de services. Leur exposition peut être très différente selon les villes, les sous-marchés et la qualité des immeubles.',
    'Le développement du travail hybride a modifié les besoins de surfaces de certaines entreprises. Son impact n’est pas uniforme : il dépend de la localisation, de l’accessibilité, de la flexibilité des plateaux, des services proposés et du bassin d’emploi.',
    'Les actifs bien situés, performants sur le plan énergétique et adaptés aux usages peuvent conserver une meilleure profondeur locative. Les actifs secondaires peuvent nécessiter davantage de travaux, de franchises ou de repositionnement.',
    'La hausse des taux depuis 2022 a également pesé sur les valeurs immobilières. Pour une SCPI bureaux, il faut donc suivre simultanément les expertises, le prix de part, les arbitrages et les besoins de financement.',
    'Le TOF doit être lu avec ses causes : vacance temporaire, travaux, départ d’un gros locataire, franchises ou difficulté structurelle de relocation. Un niveau ponctuel ne suffit pas.',
    'La stratégie de la société de gestion est déterminante : cessions, rénovations, transformations d’usage, diversification et discipline d’acquisition peuvent modifier la trajectoire du portefeuille.',
  ],
  tableTitle: 'Type d’exposition / lecture utile / vigilance',
  tableRows: [
    {
      level: 'Bureaux centraux et liquides',
      advantage: 'Peuvent bénéficier d’une demande locative plus profonde et d’une meilleure accessibilité.',
      vigilance: 'Prix d’acquisition parfois élevé et rendement initial potentiellement plus faible. Vérifier la soutenabilité des loyers.',
    },
    {
      level: 'Bureaux périphériques',
      advantage: 'Coût d’acquisition potentiellement inférieur et surfaces plus grandes.',
      vigilance: 'Vacance, accessibilité, concurrence de l’offre et besoins de repositionnement à analyser localement.',
    },
    {
      level: 'Actifs à rénover ou transformer',
      advantage: 'Peuvent créer de la valeur si le projet est techniquement et économiquement maîtrisé.',
      vigilance: 'Capex, délais, autorisations, vacance pendant travaux et risque de dépassement de budget.',
    },
    {
      level: 'Bureaux hors de France',
      advantage: 'Diversification géographique et exposition à d’autres cycles immobiliers.',
      vigilance: 'Fiscalité à traiter pays par pays, plus risque réglementaire, économique et éventuellement de change.',
    },
    {
      level: 'Locataires publics ou grands groupes',
      advantage: 'Peuvent apporter de la visibilité lorsque les baux et la solvabilité sont solides.',
      vigilance: 'La qualité apparente du locataire ne dispense pas d’analyser la durée ferme, les clauses de sortie et le niveau de loyer.',
    },
  ],
  tableNote:
    'Ces repères sont méthodologiques. La qualité d’une SCPI bureaux dépend de ses actifs, de leur prix, de leur financement et de leur trajectoire réelle.',
  criteriaTitle: 'Critères à croiser pour une SCPI bureaux',
  criteriaCards: [
    { title: 'Localisation', text: 'Centralité, transports, bassin d’emploi, profondeur locative et offre concurrente.' },
    { title: 'Qualité technique', text: 'Performance énergétique, flexibilité, services, état du bâti et capex à venir.' },
    { title: 'TOF et vacance', text: 'Suivre le niveau mais surtout les causes, la durée de vacance et les franchises.' },
    { title: 'Baux et locataires', text: 'Analyser concentration, échéances, durée ferme, solvabilité et niveau de loyer.' },
    { title: 'Valeurs', text: 'Comparer prix de part, valeur de réalisation, valeur de reconstitution et évolution des expertises.' },
    { title: 'Dette', text: 'Contrôler coût, maturités, refinancement et sensibilité aux taux.' },
    { title: 'Liquidité', text: 'Regarder collecte, retraits, parts en attente et capacité réelle de sortie.' },
  ],
  commonErrors: [
    'Traiter toutes les SCPI bureaux comme un seul marché homogène.',
    'Utiliser le TOF sans analyser les baux, franchises et causes de vacance.',
    'Supposer qu’un locataire connu rend automatiquement l’actif peu risqué.',
    'Négliger les travaux nécessaires pour maintenir la compétitivité des immeubles.',
    'Confondre baisse du prix de part et opportunité d’achat sans vérifier les valeurs et la liquidité.',
    'Généraliser une fiscalité européenne à tous les pays.',
  ],
  practicalCases: [
    {
      title: 'Patrimoine central avec baux visibles',
      text: 'Une SCPI peut afficher une meilleure résilience si ses immeubles sont bien situés, adaptés aux usages et loués avec des baux offrant de la visibilité. Il faut toutefois vérifier les loyers de marché, les échéances et les valeurs d’expertise.',
    },
    {
      title: 'Vacance en hausse',
      text: 'Une baisse durable du TOF doit conduire à identifier les immeubles concernés, la durée de vacance, les travaux requis et la profondeur de la demande locale avant de conclure à un problème structurel.',
    },
    {
      title: 'Prix de part en baisse',
      text: 'Une baisse peut rapprocher le prix des nouvelles valeurs immobilières, mais elle n’est pas à elle seule un signal d’achat. La trajectoire des expertises, des loyers, des retraits et de la dette doit être analysée simultanément.',
    },
    {
      title: 'Programme de rénovation',
      text: 'Un repositionnement peut améliorer la qualité d’un actif mais augmente temporairement les capex et peut réduire les loyers encaissés pendant les travaux. Le plan de financement doit être vérifié.',
    },
  ],
  methodParagraphs: [
    'Cartographier le patrimoine par ville, sous-marché, type d’actif et poids dans la valeur totale.',
    'Suivre TOF, vacance, franchises, baux et concentration locative sur plusieurs périodes.',
    'Comparer le prix de part aux valeurs d’expertise et suivre les révisions successives.',
    'Analyser les capex, la dette, les arbitrages et la capacité de financement du gestionnaire.',
    'Contrôler la liquidité à partir de la collecte, des retraits et des parts en attente.',
    'Comparer ensuite les SCPI bureaux entre elles sur des données de même période et de même définition.',
  ],
  conclusionParagraphs: [
    'Les SCPI bureaux peuvent présenter des profils très différents. Le secteur ne doit jamais remplacer l’analyse du patrimoine réel.',
    'La combinaison localisation, qualité des actifs, baux, valeurs, dette et liquidité détermine la robustesse du véhicule.',
    'La Trajectoire MaximusSCPI permet de suivre ces indicateurs dans le temps plutôt que de se limiter à une photographie annuelle.',
  ],
  faqItems: [
    {
      question: 'Le télétravail condamne-t-il les bureaux ?',
      answer: 'Non. Il modifie la demande de certaines entreprises et accentue la différence entre actifs adaptés et actifs secondaires. L’impact dépend fortement du marché local et de la qualité de l’immeuble.',
    },
    {
      question: 'Quel indicateur regarder en priorité ?',
      answer: 'Aucun indicateur ne suffit seul. TOF, baux, valeurs, capex, dette, localisation et liquidité doivent être croisés.',
    },
    {
      question: 'Un TOF élevé suffit-il à rassurer ?',
      answer: 'Non. Il faut vérifier les franchises, les échéances de baux, la concentration locative et les loyers de marché.',
    },
    {
      question: 'Une baisse de prix de part crée-t-elle une opportunité ?',
      answer: 'Pas automatiquement. Il faut comprendre la cause de la baisse et vérifier les valeurs d’expertise, la liquidité et les perspectives locatives.',
    },
    {
      question: 'Comment traiter les bureaux européens ?',
      answer: 'Ils apportent une diversification géographique, mais les marchés immobiliers et la fiscalité doivent être analysés pays par pays.',
    },
    {
      question: 'Comment MaximusSCPI analyse les SCPI bureaux ?',
      answer: 'En croisant les chiffres clés, la Trajectoire, les valeurs, la liquidité et les signaux de marché à partir de sources datées.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI bureaux sur leurs fondamentaux',
}
