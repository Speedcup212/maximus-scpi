import type { ScpiEducationalPageConfig } from './shared'

export const rendementNetScpiConfig: ScpiEducationalPageConfig = {
  path: '/rendement-net-scpi',
  badge: 'Rendement & fiscalité',
  h1: 'Rendement net SCPI : comprendre le rendement réel après fiscalité et frais',
  heroSubtitle:
    'Le taux de distribution affiché attire l\'attention, mais il ne reflète pas le rendement réellement perçu par l\'investisseur. Entre fiscalité, frais, mode de détention et délai de jouissance, le rendement net fiscal est l\'indicateur le plus pertinent pour comparer sérieusement.',
  seoTitle: 'Rendement net SCPI : brut, net fiscal, frais et analyse avant d\'investir',
  seoDescription:
    'Comprenez la différence entre rendement brut et rendement net d\'une SCPI, l\'impact de la fiscalité, des frais, des SCPI européennes et du démembrement.',
  shortAnswerTitle: 'Pourquoi raisonner en rendement net plutôt qu\'en rendement brut ?',
  shortAnswer:
    'Le taux de distribution (TDVM) mesure le revenu distribué par rapport au prix de la part : c\'est une donnée historique brute, avant fiscalité et frais d\'entrée. Le rendement net fiscal intègre la tranche marginale d\'imposition, les prélèvements sociaux, les frais de souscription et de gestion, ainsi que le mode de détention (direct, assurance-vie, démembrement, crédit). Deux SCPI avec le même TDVM peuvent produire des rendements nets très différents selon la situation de l\'investisseur.',
  keyMessage:
    'Le rendement affiché attire l\'attention. Le rendement net fiscal permet de comparer plus sérieusement.',
  definitionParagraphs: [
    'Le rendement brut d\'une SCPI correspond généralement au taux de distribution sur valeur de marché (TDVM) : revenus distribués divisés par le prix de la part. Ce chiffre est publié dans les bulletins trimestriels et constitue la référence la plus visible pour les investisseurs. Il reste une donnée historique qui ne préjuge pas des distributions futures.',
    'Le rendement net de fiscalité est ce que l\'investisseur conserve après impôt sur le revenu et prélèvements sociaux. Pour une SCPI française détenue en direct, les revenus sont imposés à la TMI majorée de 17,2 % de prélèvements sociaux (sous réserve des règles en vigueur). Une TMI à 30 % peut ainsi réduire significativement le rendement perçu.',
    'Les frais de souscription — souvent compris entre 8 % et 12 % — impactent le rendement net dès la première année. Un TDVM de 5 % avec 10 % de frais d\'entrée ne produit pas le même rendement net qu\'un TDVM de 4,5 % avec 0 % de frais. Le délai de jouissance (généralement un trimestre) retarde également la perception des premiers revenus.',
    'Les SCPI européennes bénéficient d\'un régime fiscal spécifique : les revenus étrangers sont en principe imposés au taux effectif du pays source, avec un crédit d\'impôt en France. Selon la TMI et les pays d\'investissement, le rendement net peut être supérieur à celui d\'une SCPI française équivalente en rendement brut.',
    'L\'assurance-vie modifie la donne : fiscalité allégée après huit ans, frais de gestion du contrat en sus des frais de la SCPI, et parfois accès à des parts institutionnelles. Le rendement net dépend du contrat, de l\'ancienneté et de la fiscalité applicable aux rachats.',
    'Le démembrement — nue-propriété ou usufruit — peut neutraliser temporairement les revenus (nue-propriété) ou les concentrer (usufruit). La nue-propriété vise la plus-value à terme plutôt que le rendement courant ; l\'usufruit génère les revenus sans détenir le capital à long terme. Chaque mode de détention produit un profil rendement/risque distinct.',
    'La détention à crédit ajoute la dimension du coût de l\'emprunt et de l\'effet de levier fiscal (intérêts déductibles sous conditions). Le rendement net peut être amplifié ou dégradé selon le différentiel entre coût du crédit et rendement locatif de la SCPI.',
  ],
  tableTitle: 'Comment le mode de détention influence le rendement net ?',
  tableRows: [
    {
      level: 'SCPI en direct (France)',
      advantage:
        'Simplicité de détention, transparence des flux, accès direct aux documents réglementaires.',
      vigilance:
        'Fiscalité à la TMI + 17,2 % de prélèvements sociaux. Un TDVM élevé peut devenir modeste après impôt.',
    },
    {
      level: 'SCPI européennes',
      advantage:
        'Fiscalité des revenus étrangers potentiellement plus favorable selon pays et TMI. Diversification géographique.',
      vigilance:
        'Complexité fiscale, déclarations spécifiques, risques pays et de change. Analyse pays par pays nécessaire.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage:
        'Fiscalité allégée après 8 ans, cadre patrimonial structuré, pas de gestion locative directe.',
      vigilance:
        'Frais du contrat en sus, choix limité de SCPI selon assureur, fiscalité des rachats à anticiper.',
    },
    {
      level: 'SCPI en nue-propriété',
      advantage:
        'Décote à l\'acquisition, potentiel de plus-value à terme, pas de fiscalité sur revenus courants.',
      vigilance:
        'Aucun revenu pendant la durée du démembrement. Horizon long obligatoire. Liquidité limitée.',
    },
    {
      level: 'SCPI à crédit',
      advantage:
        'Effet de levier, intérêts potentiellement déductibles, accès à un patrimoine plus important.',
      vigilance:
        'Risque de taux, obligation de remboursement indépendamment des distributions, endettement personnel.',
    },
  ],
  tableNote:
    'Ce tableau est une synthèse pédagogique. La fiscalité effective dépend de la situation personnelle de chaque investisseur. Il convient de consulter un conseiller en investissements financiers pour une simulation adaptée.',
  criteriaTitle: 'Critères à croiser avec le rendement net',
  criteriaCards: [
    { title: 'TOF', text: 'Un rendement élevé avec un TOF faible peut signaler une distribution non soutenable sur la durée.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI influence la régularité des distributions et la capacité d\'absorption des chocs.' },
    { title: 'Endettement', text: 'Une dette coûteuse peut compresser les distributions futures même si le TDVM passé était élevé.' },
    { title: 'Frais', text: 'Frais de souscription et de gestion : à intégrer dans tout calcul de rendement net réaliste.' },
    { title: 'Décote / surcote', text: 'Acheter en décote améliore mécaniquement le rendement net futur ; une surcote le dégrade.' },
    { title: 'Régularité des distributions', text: 'Un TDVM stable sur 5 ans vaut mieux qu\'un pic ponctuel suivi d\'une baisse.' },
    { title: 'Fiscalité du foyer', text: 'TMI, PFU, options fiscales : le rendement net varie fortement d\'un foyer à l\'autre.' },
    { title: 'Horizon', text: 'Court terme : frais d\'entrée et délai de jouissance pèsent davantage. Long terme : la fiscalité cumulée domine.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement sur son taux de distribution affiché.',
    'Oublier les frais de souscription dans le calcul du rendement net.',
    'Ignorer la fiscalité personnelle (TMI, prélèvements sociaux).',
    'Comparer un TDVM brut français avec un rendement net de SCPI européenne sans harmoniser les bases.',
    'Sous-estimer le délai de jouissance la première année.',
    'Croire que le démembrement améliore toujours le rendement : la nue-propriété génère zéro revenu courant.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — TDVM 5,5 %, TMI 30 %, détention directe',
      text: 'Un investisseur en TMI 30 % détient une SCPI française avec un TDVM de 5,5 % et 10 % de frais de souscription. Après impôt (30 % + 17,2 % de prélèvements sociaux) et frais, le rendement net fiscal de la première année est nettement inférieur au chiffre affiché. Simulation pédagogique : le TDVM brut ne reflète pas le rendement perçu.',
    },
    {
      title: 'SCPI B — européenne, TMI 11 %, rendement brut modeste',
      text: 'Une SCPI européenne affiche un TDVM de 4,2 % mais bénéficie d\'une fiscalité des revenus étrangers plus favorable pour un investisseur en TMI 11 %. Le rendement net peut se rapprocher — voire dépasser — celui d\'une SCPI française à TDVM plus élevé. L\'intérêt n\'est pas uniquement fiscal : la diversification géographique compte aussi.',
    },
    {
      title: 'SCPI C — nue-propriété, pas de revenus courants',
      text: 'Un investisseur achète en nue-propriété avec une décote de 35 % sur 15 ans. Aucun revenu n\'est perçu pendant la durée du démembrement. Le « rendement » se joue à terme sur la reconstitution de la pleine propriété. Simulation pédagogique : inadapté pour un besoin de revenus immédiats.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI affiche le taux de distribution dans le comparateur comme point de départ, en rappelant qu\'il s\'agit d\'une donnée historique brute. L\'objectif est d\'encourager une lecture en rendement net fiscal, croisée avec le TOF, les frais et le mode de détention.',
    'La première étape consiste à identifier le TDVM et les frais de souscription et de gestion. Ces éléments sont visibles dans le comparateur et dans les documents réglementaires de chaque SCPI.',
    'La deuxième étape intègre la fiscalité personnelle : TMI, prélèvements sociaux, éventuelle fiscalité étrangère pour les SCPI européennes. MaximusSCPI propose des simulateurs complémentaires pour approfondir cette dimension.',
    'La troisième étape compare les modes de détention : direct, assurance-vie, démembrement ou crédit. Chaque enveloppe produit un rendement net différent pour un même TDVM brut.',
    'La pré-orientation MaximusSCPI ne constitue pas une recommandation personnalisée. Un entretien avec le Cabinet Eric Bellaiche permet de simuler le rendement net selon votre situation fiscale réelle.',
  ],
  conclusionParagraphs: [
    'Le rendement brut est un point de départ, pas une conclusion. Pour comparer sérieusement les SCPI, intégrez la fiscalité, les frais, le mode de détention et la soutenabilité du TOF. Le rendement net fiscal est l\'indicateur le plus pertinent pour une pré-orientation patrimoniale structurée.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI, votre horizon et vos objectifs de revenus.',
  ],
  faqItems: [
    {
      question: 'Quelle différence entre rendement brut et rendement net SCPI ?',
      answer: 'Le rendement brut (TDVM) mesure les distributions par rapport au prix de la part, avant fiscalité et frais. Le rendement net intègre l\'impôt sur le revenu, les prélèvements sociaux, les frais de souscription et de gestion, ainsi que le mode de détention. C\'est le rendement net qui reflète ce que l\'investisseur perçoit réellement.',
    },
    {
      question: 'Comment calculer le rendement net d\'une SCPI ?',
      answer: 'Partez du TDVM brut, déduisez les frais de gestion annuels, appliquez votre TMI et les prélèvements sociaux sur les revenus distribués, et intégrez l\'amortissement des frais de souscription sur votre horizon. Pour les SCPI européennes, intégrez la fiscalité étrangère et le crédit d\'impôt. Un conseiller peut réaliser cette simulation de manière personnalisée.',
    },
    {
      question: 'La fiscalité peut-elle réduire fortement le rendement ?',
      answer: 'Oui. Un investisseur en TMI 41 % ou 45 % peut voir plus de la moitié de ses revenus SCPI français absorbés par l\'impôt et les prélèvements sociaux. C\'est pourquoi le rendement brut ne suffit pas à comparer les options patrimoniales.',
    },
    {
      question: 'Pourquoi les SCPI européennes peuvent améliorer le rendement net ?',
      answer: 'Les revenus des SCPI européennes sont en principe imposés au taux effectif du pays source, avec un crédit d\'impôt en France. Selon les pays et la TMI, le rendement net peut être supérieur à celui d\'une SCPI française de TDVM équivalent. L\'analyse doit être faite pays par pays.',
    },
    {
      question: 'Le démembrement améliore-t-il le rendement ?',
      answer: 'Pas systématiquement. La nue-propriété ne génère aucun revenu courant : le rendement se joue à terme sur la plus-value. L\'usufruit perçoit les revenus mais ne détient pas le capital. Le démembrement modifie le profil rendement/risque, il ne l\'améliore pas mécaniquement.',
    },
    {
      question: 'Faut-il choisir la SCPI au meilleur taux de distribution ?',
      answer: 'Non. Le TDVM le plus élevé peut coïncider avec un TOF faible, une surcote importante, des frais élevés ou une fiscalité défavorable. La comparaison doit intégrer le rendement net, la qualité locative et la cohérence patrimoniale globale.',
    },
    {
      question: 'Quel est l\'impact des frais d\'entrée ?',
      answer: 'Des frais de souscription de 10 % réduisent mécaniquement le capital investi productif de revenus. Sur un horizon court, l\'impact est significatif. Sur un horizon long (10-15 ans), l\'impact s\'amortit mais reste non négligeable dans le calcul du rendement net.',
    },
    {
      question: 'Comment MaximusSCPI compare le rendement des SCPI ?',
      answer: 'Le comparateur affiche le TDVM, les frais, le TOF, la capitalisation et l\'endettement pour chaque SCPI. Des simulateurs complémentaires permettent d\'approfondir le rendement net fiscal. L\'ensemble constitue une pré-orientation pédagogique, pas une recommandation personnalisée automatisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur rendement',
}
