import type { ScpiEducationalPageConfig } from './shared'

export const rendementNetScpiConfig: ScpiEducationalPageConfig = {
  path: '/rendement-net-scpi',
  badge: 'Rendement & fiscalité — Page pilier',
  h1: 'Rendement net SCPI : comprendre le rendement réel après fiscalité et frais',
  heroSubtitle:
    'Le taux de distribution affiché attire l\'attention, mais il ne reflète pas le rendement réellement perçu par l\'investisseur. Entre fiscalité, frais, mode de détention et délai de jouissance, le rendement net fiscal est l\'indicateur le plus pertinent pour comparer sérieusement. Cette page pilier détaille chaque couche qui sépare le rendement brut du rendement réellement conservé.',
  seoTitle: 'Rendement net SCPI : brut, net fiscal, frais, fiscalité et comparaison par mode de détention',
  seoDescription:
    'Guide pilier sur le rendement net des SCPI : différence rendement brut et net, impact TMI, prélèvements sociaux, frais de souscription, délai de jouissance, SCPI européennes, assurance-vie, démembrement, SCI à l\'IS, crédit. Tableau comparatif et exemples chiffrés.',
  shortAnswerTitle: 'Pourquoi raisonner en rendement net plutôt qu\'en rendement brut ?',
  shortAnswer:
    'Le taux de distribution (TDVM) mesure le revenu distribué par rapport au prix de la part : c\'est une donnée historique brute, avant fiscalité et frais d\'entrée. Le rendement net fiscal intègre la tranche marginale d\'imposition, les prélèvements sociaux, les frais de souscription et de gestion, ainsi que le mode de détention (direct, assurance-vie, démembrement, crédit, SCI à l\'IS). Deux SCPI avec le même TDVM peuvent produire des rendements nets très différents selon la situation de l\'investisseur. Le rendement net est la seule mesure utile pour comparer des options patrimoniales.',
  keyMessage:
    'Le rendement utile n\'est pas le rendement affiché. C\'est le rendement net après frais, fiscalité, délai de jouissance et cohérence patrimoniale.',
  definitionParagraphs: [
    'Le rendement brut d\'une SCPI correspond généralement au taux de distribution sur valeur de marché (TDVM) : revenus distribués divisés par le prix de la part. Ce chiffre est publié dans les bulletins trimestriels et constitue la référence la plus visible pour les investisseurs. Il reste une donnée historique qui ne préjuge pas des distributions futures.',
    'Le rendement net de fiscalité est ce que l\'investisseur conserve après impôt sur le revenu et prélèvements sociaux. Pour une SCPI française détenue en direct, les revenus sont imposés à la TMI majorée des prélèvements sociaux. Une TMI à 30 % peut ainsi réduire significativement le rendement perçu.',
    'Les frais de souscription — souvent compris entre 8 % et 12 % — impactent le rendement net dès la première année. Un TDVM de 5 % avec 10 % de frais d\'entrée ne produit pas le même rendement net qu\'un TDVM de 4,5 % avec 0 % de frais. Le délai de jouissance (généralement un trimestre) retarde également la perception des premiers revenus.',
    'Les SCPI européennes bénéficient d\'un régime fiscal spécifique : les revenus étrangers sont imposés au taux effectif du pays source, avec un crédit d\'impôt en France. Selon la TMI et les pays d\'investissement, le rendement net peut être supérieur à celui d\'une SCPI française équivalente en rendement brut.',
    'L\'assurance-vie modifie la donne : fiscalité allégée après huit ans, frais de gestion du contrat en sus des frais de la SCPI, et parfois accès à des parts institutionnelles. Le rendement net dépend du contrat, de l\'ancienneté et de la fiscalité applicable aux rachats.',
    'Le démembrement — nue-propriété ou usufruit — peut neutraliser temporairement les revenus (nue-propriété) ou les concentrer (usufruit). La nue-propriété vise la plus-value à terme plutôt que le rendement courant ; l\'usufruit génère les revenus sans détenir le capital à long terme.',
    'La détention à crédit ajoute la dimension du coût de l\'emprunt et de l\'effet de levier fiscal (intérêts déductibles sous conditions). Le rendement net peut être amplifié ou dégradé selon le différentiel entre coût du crédit et rendement locatif de la SCPI.',
    'La SCI à l\'IS permet de capitaliser les revenus à l\'IS (taux réduit jusqu\'à un seuil) et d\'amortir comptablement les parts. La distribution aux associés est ensuite imposée (flat tax ou barème). Le rendement net dépend du taux d\'IS, de la politique de distribution et de la fiscalité des associés.',
    'Le rendement brut est un point de départ. Pour le transformer en rendement net utile, il faut soustraire : les frais de souscription (amortis sur la durée), les frais de gestion annuels, l\'impôt sur le revenu (selon TMI), les prélèvements sociaux, et intégrer le délai de jouissance et le mode de détention.',
  ],
  tableTitle: 'Mode de détention / Rendement à regarder / Fiscalité ou frais à surveiller / Vigilance',
  tableRows: [
    {
      level: 'Direct France',
      advantage:
        'Rendement à regarder : TDVM − frais de souscription − IR (TMI) − PS.',
      vigilance:
        'Fiscalité lourde aux TMI élevées. Frais d\'entrée 8-12 %. Délai de jouissance. Impact IFI.',
    },
    {
      level: 'Direct Europe',
      advantage:
        'Rendement à regarder : TDVM − frais − IR après crédit d\'impôt − PS (parfois réduits).',
      vigilance:
        'Crédit d\'impôt variable selon pays. PS réduits ou non selon convention. Déclarations complexes.',
    },
    {
      level: 'Assurance-vie',
      advantage:
        'Rendement à regarder : TDVM − frais SCPI − frais AV. Fiscalité uniquement au rachat.',
      vigilance:
        'Frais AV en sus (0,5 % à 1 %/an). Pas de déduction des intérêts d\'emprunt. Choix limité de SCPI.',
    },
    {
      level: 'Démembrement (nue-propriété)',
      advantage:
        'Pas de revenus courants. Rendement = décote + potentiel de plus-value à terme.',
      vigilance:
        'Aucun revenu pendant le démembrement. Horizon long. Décote à analyser. Liquidité limitée.',
    },
    {
      level: 'SCI à l\'IS',
      advantage:
        'Rendement à regarder : résultat après IS et amortissement. Fiscalité différée si capitalisation.',
      vigilance:
        'Double imposition IS + IR sur distribution. Frais comptables 2 000-5 000 €/an. Complexité.',
    },
    {
      level: 'Crédit',
      advantage:
        'Rendement à regarder : TDVM − frais − intérêts + économie d\'IR (déduction des intérêts).',
      vigilance:
        'Risque de taux. Cash-flow à vérifier. Endettement personnel à intégrer.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. La fiscalité effective dépend de la situation personnelle de chaque investisseur.',
  criteriaTitle: 'Critères à croiser avec le rendement net',
  criteriaCards: [
    { title: 'TOF', text: 'Un rendement élevé avec un TOF faible peut signaler une distribution non soutenable sur la durée. Vérifier la qualité locative.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence la régularité des distributions et la capacité d\'absorption des chocs locatifs.' },
    { title: 'Endettement', text: 'Une dette coûteuse peut compresser les distributions futures même si le TDVM passé était élevé.' },
    { title: 'Frais', text: 'Frais de souscription (8-12 %) et frais de gestion annuels : à intégrer dans tout calcul de rendement net réaliste.' },
    { title: 'Décote / surcote', text: 'Acheter en décote améliore mécaniquement le rendement net futur ; une surcote le dégrade.' },
    { title: 'Régularité des distributions', text: 'Un TDVM stable sur 5 ans vaut mieux qu\'un pic ponctuel suivi d\'une baisse. Analyser la soutenabilité.' },
    { title: 'Fiscalité du foyer', text: 'TMI, PFU, prélèvements sociaux, crédit d\'impôt étranger : le rendement net varie fortement d\'un foyer à l\'autre.' },
    { title: 'Horizon d\'investissement', text: 'Court terme : frais d\'entrée et délai de jouissance pèsent davantage. Long terme : la fiscalité cumulée et la capitalisation dominent.' },
    { title: 'Mode de détention', text: 'Direct, AV, nue-propriété, SCI : chaque enveloppe produit un rendement net différent pour un même TDVM brut.' },
    { title: 'Délai de jouissance', text: 'Le décalage entre souscription et perception des premiers revenus réduit le rendement effectif la première année.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement sur son taux de distribution affiché sans analyser la fiscalité ni les frais.',
    'Oublier les frais de souscription dans le calcul du rendement net (ils réduisent le capital investi productif).',
    'Ignorer la fiscalité personnelle (TMI, prélèvements sociaux) dans la comparaison entre SCPI.',
    'Comparer un TDVM brut français avec un rendement net de SCPI européenne sans harmoniser les bases.',
    'Sous-estimer le délai de jouissance la première année (perte de plusieurs mois de revenus).',
    'Croire que le démembrement améliore toujours le rendement : la nue-propriété génère zéro revenu courant.',
    'Oublier que l\'assurance-vie ajoute des frais qui réduisent le rendement net par rapport au direct.',
    'Comparer des rendements de SCPI sans intégrer l\'impact de l\'endettement sur la soutenabilité des distributions.',
  ],
  practicalCases: [
    {
      title: 'Exemple chiffré — Investissement 100 000 €, TDVM 5 %',
      text: 'Investissement théorique : 100 000 €. TDVM : 5 %. Revenus bruts annuels : 5 000 €. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'TMI 11 % — Direct France',
      text: 'Revenus bruts : 5 000 €. Frais d\'entrée 10 % = 10 000 € (amortis sur 10 ans = 1 000 €/an). IR (11 %) = 550 €. PS = 875 €. Net après fiscalité et frais : 5 000 − 550 − 875 − 1 000 = 2 575 €. Rendement net estimé la première année : ~2,6 % (vs 5 % brut). Sur 10 ans, l\'amortissement des frais s\'estompe : ~3,6 %.',
    },
    {
      title: 'TMI 30 % — Direct France',
      text: 'Même base. IR (30 %) = 1 500 €. PS = 875 €. Frais amortis = 1 000 €. Net : 5 000 − 1 500 − 875 − 1 000 = 1 625 €. Rendement net estimé première année : ~1,6 %. Sur 10 ans : ~2,6 %. L\'écart avec le brut est significatif.',
    },
    {
      title: 'TMI 41 % — Direct France',
      text: 'Même base. IR (41 %) = 2 050 €. PS = 875 €. Frais = 1 000 €. Net : 5 000 − 2 050 − 875 − 1 000 = 1 075 €. Rendement net estimé première année : ~1,1 %. Sur 10 ans : ~2,1 %. Les alternatives (Europe, AV, nue-propriété) deviennent des pistes à approfondir.',
    },
    {
      title: 'SCPI européenne — TMI 30 %',
      text: 'Investissement 100 000 €. TDVM 4,5 %. Revenus bruts : 4 500 €. Crédit d\'impôt étranger : 600 €. IR après crédit : 1 200 − 600 = 600 €. PS réduits : 400 €. Frais : 1 000 €. Net : 4 500 − 600 − 400 − 1 000 = 2 500 €. Rendement net estimé : ~2,5 % (contre ~1,6 % pour une SCPI française au même TDVM).',
    },
    {
      title: 'Assurance-vie — Capitalisation sans fiscalité immédiate',
      text: 'Investissement 100 000 € via AV. TDVM 5 %. Les 5 000 € sont capitalisés sans IR ni PS annuels. Frais AV : 0,6 %/an = 600 €. Net capitalisé : 4 400 €/an. Au bout de 10 ans, valeur estimée ~144 000 € (hors frais d\'entrée AV et SCPI). Fiscalité uniquement en cas de rachat. Simulation pédagogique indicative.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI affiche le taux de distribution dans le comparateur comme point de départ, en rappelant qu\'il s\'agit d\'une donnée historique brute. L\'objectif est d\'encourager une lecture en rendement net fiscal, croisée avec le TOF, les frais et le mode de détention.',
    'La première étape consiste à identifier le TDVM et les frais de souscription et de gestion. Ces éléments sont visibles dans le comparateur et dans les documents réglementaires de chaque SCPI.',
    'La deuxième étape intègre la fiscalité personnelle : TMI, prélèvements sociaux, éventuelle fiscalité étrangère pour les SCPI européennes. MaximusSCPI propose des simulateurs complémentaires pour approfondir cette dimension.',
    'La troisième étape compare les modes de détention : direct, assurance-vie, démembrement ou crédit. Chaque enveloppe produit un rendement net différent pour un même TDVM brut.',
    'La quatrième étape intègre l\'horizon : sur 5 ans, les frais d\'entrée pèsent lourd ; sur 15 ans, la fiscalité cumulée et l\'effet de capitalisation dominent.',
    'La pré-orientation MaximusSCPI ne constitue pas une recommandation personnalisée. Un entretien avec le Cabinet Eric Bellaiche permet de simuler le rendement net selon votre situation fiscale réelle.',
  ],
  conclusionParagraphs: [
    'Le rendement brut est un point de départ, pas une conclusion. Pour comparer sérieusement les SCPI, intégrez la fiscalité, les frais, le mode de détention, le délai de jouissance et la soutenabilité du TOF. Le rendement net fiscal est l\'indicateur le plus pertinent pour une pré-orientation patrimoniale structurée.',
    'Sources et points à vérifier : bulletins trimestriels des sociétés de gestion, DIC, notes d\'information, rapports annuels, site ASPIM. Pour les simulateurs de rendement net, consulter les outils MaximusSCPI.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI, votre horizon et vos objectifs de revenus.',
  ],
  faqItems: [
    {
      question: 'Quelle différence entre rendement brut et rendement net SCPI ?',
      answer: 'Le rendement brut (TDVM) mesure les distributions par rapport au prix de la part, avant fiscalité et frais. Le rendement net intègre l\'impôt sur le revenu, les prélèvements sociaux, les frais de souscription et de gestion, ainsi que le mode de détention.',
    },
    {
      question: 'Comment calculer le rendement net d\'une SCPI ?',
      answer: 'Partez du TDVM brut, déduisez les frais de gestion annuels, appliquez votre TMI et les prélèvements sociaux, et intégrez l\'amortissement des frais de souscription sur votre horizon. Simulation pédagogique : un conseiller peut réaliser ce calcul de manière personnalisée.',
    },
    {
      question: 'La fiscalité peut-elle fortement réduire le rendement ?',
      answer: 'Oui. Un investisseur en TMI 41 % ou 45 % peut voir plus de la moitié de ses revenus SCPI français absorbés par l\'impôt et les prélèvements sociaux.',
    },
    {
      question: 'Pourquoi les SCPI européennes peuvent améliorer le rendement net ?',
      answer: 'Les revenus des SCPI européennes bénéficient d\'un crédit d\'impôt et parfois de prélèvements sociaux réduits. Selon les pays et la TMI, le rendement net peut être supérieur à celui d\'une SCPI française de TDVM équivalent.',
    },
    {
      question: 'Le démembrement améliore-t-il le rendement ?',
      answer: 'Pas systématiquement. La nue-propriété ne génère aucun revenu courant : le rendement se joue à terme sur la plus-value. L\'usufruit perçoit les revenus mais ne détient pas le capital à long terme.',
    },
    {
      question: 'Faut-il choisir la SCPI au meilleur taux de distribution ?',
      answer: 'Non. Le TDVM le plus élevé peut coïncider avec un TOF faible, une surcote importante, des frais élevés ou une fiscalité défavorable. La comparaison doit intégrer le rendement net.',
    },
    {
      question: 'Quel est l\'impact des frais d\'entrée sur le rendement ?',
      answer: 'Des frais de souscription de 10 % réduisent mécaniquement le capital investi productif. Sur un horizon court (5 ans), l\'impact est significatif (plusieurs points de rendement net en moins).',
    },
    {
      question: 'Qu\'est-ce que le délai de jouissance et quel est son impact ?',
      answer: 'Le délai de jouissance est le décalage entre la souscription et la perception des premiers revenus, généralement un trimestre. Il réduit le rendement effectif la première année.',
    },
    {
      question: 'Comment le mode de détention modifie-t-il le rendement net ?',
      answer: 'En direct : fiscalité immédiate complète. En AV : capitalisation sans fiscalité annuelle. En nue-propriété : pas de revenus. En SCI à l\'IS : capitalisation à l\'IS. Chaque enveloppe a son propre profil rendement/fiscalité.',
    },
    {
      question: 'Une SCI à l\'IS peut-elle améliorer le rendement net ?',
      answer: 'Potentiellement pour les TMI élevées et les objectifs de capitalisation long terme. L\'IS peut être plus favorable que l\'IR, et l\'amortissement réduit le résultat imposable. Attention aux frais et à la double imposition en cas de distribution.',
    },
    {
      question: 'Les simulateurs MaximusSCPI sont-ils fiables ?',
      answer: 'Les simulateurs MaximusSCPI sont des outils pédagogiques d\'aide à la réflexion. Ils ne constituent pas un conseil personnalisé. Les résultats sont indicatifs et ne préjugent pas des performances futures.',
    },
    {
      question: 'Comment MaximusSCPI compare le rendement des SCPI ?',
      answer: 'Le comparateur affiche le TDVM, les frais, le TOF, la capitalisation et l\'endettement. Des simulateurs complémentaires permettent d\'approfondir le rendement net fiscal. L\'ensemble constitue une pré-orientation pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur rendement brut',
}
