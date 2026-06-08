import type { ScpiEducationalPageConfig } from './shared'

export const fraisScpiConfig: ScpiEducationalPageConfig = {
  path: '/frais-scpi',
  badge: 'Coûts & transparence',
  h1: 'Frais SCPI : comprendre les coûts avant d\'investir',
  heroSubtitle:
    'Les frais des SCPI sont souvent mal compris. Ils ne doivent pas être analysés isolément, mais en lien avec l\'horizon de détention, le rendement net, la qualité du patrimoine, la liquidité, le mode de détention et la fiscalité.',
  seoTitle: 'Frais SCPI : souscription, gestion, arbitrage et rendement net',
  seoDescription:
    'Comprenez les frais des SCPI : frais de souscription, gestion, cession, assurance-vie, frais indirects et impact sur le rendement net.',
  shortAnswerTitle: 'Pourquoi les frais SCPI sont-ils importants ?',
  shortAnswer:
    'Les frais SCPI impactent directement le rendement net perçu par l\'investisseur. Frais de souscription (8 % à 12 %), frais de gestion (10 % à 12 % des loyers), frais UC en assurance-vie, rétrocessions éventuelles : chaque coût doit être rapporté à la durée de détention, à la qualité de la SCPI et au rendement net attendu. Des frais élevés ne signifient pas automatiquement une mauvaise SCPI, et des frais bas ne garantissent pas un bon investissement.',
  keyMessage:
    'Les frais ne doivent jamais être analysés seuls. Ils doivent être rapportés à la durée de détention, au rendement net et à la qualité réelle de la SCPI.',
  definitionParagraphs: [
    'Les frais de souscription sont prélevés au moment de l\'achat des parts, généralement compris entre 8 % et 12 % du montant investi. Ils rémunèrent la commercialisation et les frais d\'acquisition des actifs. Une partie peut être rétrocédée au distributeur, ce qui constitue un conflit d\'intérêts potentiel à connaître.',
    'Les frais de gestion sont prélevés chaque année par la société de gestion, généralement entre 10 % et 12 % des loyers encaissés. Ils couvrent la gestion locative, la comptabilité, la communication et les frais de structure. Ils s\'appliquent même si le TOF n\'est pas à 100 %.',
    'Les frais de cession ou de retrait peuvent s\'appliquer lors de la revente de parts. Certaines SCPI les intègrent dans le prix de souscription, d\'autres les facturent au vendeur. Le marché secondaire peut également appliquer une décote ou une surcote indépendante des frais.',
    'Dans l\'assurance-vie, les frais de gestion des unités de compte (UC) s\'ajoutent aux frais de la SCPI. Généralement compris entre 0,5 % et 1 % par an, ils réduisent le rendement reversé à l\'investisseur. Un contrat à 1 % de frais UC peut absorber une part significative des loyers sur la durée.',
    'Les rétrocessions de commissions sont des sommes versées par la société de gestion au distributeur (conseiller, plateforme, banque) dans le cadre de la commercialisation des parts. Elles sont incluses dans les frais de souscription mais rarement visibles pour l\'investisseur. La transparence sur ces rétrocessions varie selon les canaux de distribution.',
    'L\'impact des frais sur le rendement net dépend de l\'horizon de détention. Sur un horizon court (moins de 5 ans), les frais de souscription pèsent lourdement. Sur un horizon long (10-15 ans), leur impact s\'amortit. Un investisseur long terme peut tolérer des frais d\'entrée plus élevés si la qualité de la SCPI le justifie.',
    'Des frais de souscription réduits ou nuls existent sur le marché secondaire (achat de parts déjà émises) ou sur certaines SCPI en collecte. Il faut alors vérifier les conditions : décote possible, mais absence de frais ne signifie pas absence de risque.',
  ],
  tableTitle: 'Frais SCPI : quand s\'appliquent-ils ?',
  tableRows: [
    {
      level: 'Frais de souscription',
      advantage:
        'Rémunèrent la commercialisation. S\'amortissent sur la durée de détention.',
      vigilance:
        '8-12 % du montant investi. Impact fort sur horizon court. À comparer selon les SCPI et les canaux.',
    },
    {
      level: 'Frais de gestion',
      advantage:
        'Couvrent la gestion locative et administrative de la SCPI.',
      vigilance:
        '10-12 % des loyers encaissés. S\'appliquent même en cas de vacance partielle.',
    },
    {
      level: 'Frais UC (assurance-vie)',
      advantage:
        'Frais de gestion du contrat sur les unités de compte.',
      vigilance:
        '0,5-1 % par an en sus des frais de la SCPI. Réduisent le rendement reversé.',
    },
    {
      level: 'Frais de cession / retrait',
      advantage:
        'Frais de sortie ou de revente de parts.',
      vigilance:
        'Peuvent varier selon les SCPI. Vérifier les conditions avant la souscription.',
    },
    {
      level: 'Rétrocessions distributeur',
      advantage:
        'Commissions versées au distributeur sur les frais de souscription.',
      vigilance:
        'Généralement incluses dans les frais de souscription. Transparence variable selon les canaux.',
    },
    {
      level: 'Délai de jouissance',
      advantage:
        'Période entre la souscription et le premier versement de revenus.',
      vigilance:
        'Un trimestre de loyers non perçu = frais indirect. À intégrer dans le calcul du rendement net.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. Les frais exacts sont publiés dans les documents réglementaires de chaque SCPI (note d\'information, DIC).',
  criteriaTitle: 'Critères à croiser avec les frais',
  criteriaCards: [
    { title: 'Horizon de détention', text: 'Un horizon long (10+ ans) amortit l\'impact des frais de souscription. Sur horizon court, les frais pèsent fortement sur le rendement net.' },
    { title: 'Rendement net', text: 'Les frais réduisent le rendement net. Comparer le rendement après frais, pas le TDVM brut.' },
    { title: 'TOF', text: 'Des frais de gestion élevés avec un TOF faible amplifient l\'impact sur les distributions nettes perçues.' },
    { title: 'Capitalisation', text: 'Les SCPI très capitalisées ont parfois des frais de gestion plus compétitifs grâce aux économies d\'échelle.' },
    { title: 'Mode de détention', text: 'En assurance-vie, les frais UC s\'ajoutent. En direct, seuls les frais SCPI s\'appliquent.' },
    { title: 'Transparence', text: 'La clarté des documents réglementaires sur les frais est un critère de sérieux du gestionnaire.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement parce que ses frais de souscription sont faibles.',
    'Ignorer les frais de gestion annuels qui s\'appliquent chaque année.',
    'Oublier les frais UC en assurance-vie, qui s\'ajoutent aux frais de la SCPI.',
    'Négliger le délai de jouissance qui retarde la perception des premiers revenus.',
    'Croire que des frais élevés sont toujours injustifiés.',
    'Ne pas lire les documents réglementaires avant de souscrire.',
  ],
  practicalCases: [
    {
      title: 'SCPI A — frais de souscription élevés, horizon long',
      text: 'Une SCPI affiche 12 % de frais de souscription mais un TOF élevé et un TDVM stable sur 10 ans. Sur un horizon de 15 ans, les frais s\'amortissent et le rendement net reste compétitif. L\'analyse de la qualité patrimoniale prime sur le seul niveau de frais.',
    },
    {
      title: 'SCPI B — frais réduits sur le marché secondaire',
      text: 'L\'achat de parts de SCPI sur le marché secondaire peut réduire ou supprimer les frais de souscription. L\'investisseur paie le prix de marché, avec une décote possible. La disponibilité dépend des vendeurs et le choix est limité.',
    },
    {
      title: 'SCPI en assurance-vie — frais UC élevés',
      text: 'Un contrat d\'assurance-vie avec 1 % de frais UC sur une SCPI à 5 % de TDVM réduit le rendement reversé de 20 % par an, avant même la fiscalité. L\'investisseur doit comparer ce rendement net avec le direct.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI présente les frais dans le comparateur comme un critère de lecture, jamais isolément. L\'objectif est d\'encourager une analyse intégrant les frais, le rendement net, la qualité de la SCPI et l\'horizon de détention.',
    'La première étape consiste à identifier l\'ensemble des frais : souscription, gestion, assurance-vie le cas échéant, cession éventuelle.',
    'La deuxième étape rapporte ces frais à l\'horizon de détention. Un investisseur long terme peut accepter des frais d\'entrée plus élevés.',
    'La troisième étape vérifie la transparence des documents réglementaires et les éventuelles rétrocessions.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet d\'analyser l\'impact des frais selon votre horizon et votre mode de détention.',
  ],
  conclusionParagraphs: [
    'Les frais SCPI sont un critère important, mais jamais isolé. Analysez-les avec l\'horizon, le rendement net, le TOF, la capitalisation, l\'endettement et la qualité du patrimoine.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les frais des SCPI, puis approfondissez avec les documents réglementaires et un conseiller pour une analyse adaptée à votre situation.',
  ],
  faqItems: [
    {
      question: 'Quels sont les frais d\'une SCPI ?',
      answer: 'Frais de souscription (8-12 %), frais de gestion annuels (10-12 % des loyers), frais de cession ou de retrait éventuels, et en assurance-vie des frais UC supplémentaires (0,5-1 % par an).',
    },
    {
      question: 'Les frais de souscription sont-ils perdus ?',
      answer: 'Ils ne sont pas remboursés à la revente. Ils s\'amortissent sur la durée de détention : plus l\'horizon est long, moins leur impact relatif est important.',
    },
    {
      question: 'Les SCPI sans frais sont-elles toujours meilleures ?',
      answer: 'Non. Des frais de souscription réduits ou nuls peuvent être compensés par des frais de gestion plus élevés, un TOF plus faible ou un rendement moins régulier. L\'absence de frais n\'est pas un gage de qualité.',
    },
    {
      question: 'Quel est l\'impact des frais sur le rendement ?',
      answer: '10 % de frais de souscription sur un horizon de 10 ans réduisent le rendement annuel d\'environ 1 %. Des frais de gestion à 12 % des loyers réduisent le rendement brut d\'autant.',
    },
    {
      question: 'Quels frais dans une assurance-vie ?',
      answer: 'En sus des frais de la SCPI, l\'assurance-vie applique des frais de gestion UC (0,5 % à 1 % par an), des frais de versement éventuels, et parfois des frais d\'arbitrage.',
    },
    {
      question: 'Que sont les rétrocessions SCPI ?',
      answer: 'Ce sont des commissions versées par la société de gestion au distributeur (conseiller, plateforme). Elles sont incluses dans les frais de souscription et ne sont pas toujours visibles pour l\'investisseur.',
    },
    {
      question: 'Où trouver les frais officiels ?',
      answer: 'Dans la note d\'information, le Document d\'Information Clé (DIC) et le bulletin trimestriel de chaque SCPI. Le comparateur MaximusSCPI centralise ces indicateurs pour une pré-lecture.',
    },
    {
      question: 'Comment MaximusSCPI analyse les frais ?',
      answer: 'Les frais sont affichés dans le comparateur comme un critère de lecture parmi d\'autres. L\'analyse intègre le rendement net, l\'horizon et la qualité de la SCPI. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leurs frais',
}
