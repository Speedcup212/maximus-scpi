import type { ScpiEducationalPageConfig } from './shared'

export const scpiRevenusComplementairesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-complementaires',
  badge: 'Stratégie patrimoniale',
  h1: "SCPI et revenus complémentaires : ce qu'il faut vérifier",
  heroSubtitle:
    "Les SCPI distribuent des revenus potentiels, mais leur montant n'est pas garanti. La fréquence de distribution, le rendement net de fiscalité, la liquidité, le délai de jouissance et la diversification sont des critères à analyser.",
  seoTitle: 'SCPI revenus complémentaires : rendement, fiscalité, risques et liquidité',
  seoDescription:
    "Comprenez les SCPI pour générer des revenus complémentaires : rendement potentiel, fiscalité, prélèvements sociaux, liquidité, risques, régularité et points de vigilance.",
  shortAnswerTitle: "Pourquoi des SCPI pour des revenus complémentaires ?",
  shortAnswer:
    "Les SCPI distribuent une partie des loyers perçus sur leur patrimoine immobilier aux associés, généralement de manière trimestrielle ou semestrielle. Elles offrent un potentiel de revenus réguliers sans les contraintes de gestion locative directe (recherche de locataires, travaux, impayés). Le montant distribué n'est pas garanti : il dépend de la qualité locative du patrimoine, du taux d'occupation, du niveau des charges et des arbitrages de la société de gestion. Le rendement net perçu par l'investisseur intègre les frais de gestion de la SCPI (10-12 % des loyers) et la fiscalité (impôt sur le revenu selon la TMI et prélèvements sociaux à 17,2 %). La régularité des distributions, la liquidité des parts et le délai de jouissance sont des critères à analyser avant de souscrire.",
  keyMessage:
    "Les SCPI peuvent générer des revenus complémentaires, mais ces revenus ne sont pas garantis et doivent être analysés nets de fiscalité.",
  definitionParagraphs: [
    "Les SCPI distribuent des revenus provenant des loyers perçus sur leur patrimoine immobilier. Après déduction des frais de gestion (généralement 10 % à 12 % des loyers bruts), le solde est distribué aux associés sous forme de dividendes, appelés parfois coupons. La fréquence de distribution varie : trimestrielle, semestrielle ou annuelle selon la SCPI.",
    "Le rendement affiché d'une SCPI (TDVM — Taux de Distribution sur Valeur de Marché) est le rapport entre le dividende brut versé au titre d'une année et le prix de souscription. Ce taux est brut : il n'intègre ni les frais de souscription (8-12 % à l'entrée), ni la fiscalité propre à l'investisseur. Le rendement net après fiscalité peut être significativement inférieur au TDVM.",
    "Les frais de souscription (8 % à 12 % du montant investi) sont prélevés immédiatement lors de l'achat des parts. Ils ne sont pas récupérés à la revente. Pour un investissement de 10 000 € avec 10 % de frais, seuls 9 000 € sont effectivement investis en parts, le reste couvre les frais d'entrée de la SCPI.",
    "Le délai de jouissance est la période entre la souscription et le premier versement de loyers. Il peut aller de quelques jours à plusieurs mois selon les SCPI. Ce délai réduit le rendement effectif de la première année et doit être pris en compte dans la simulation des revenus attendus.",
    "La liquidité des parts est un critère déterminant pour un investisseur recherchant des revenus complémentaires : en cas de besoin, la revente des parts peut prendre 2 à 12 mois selon les SCPI et les conditions du marché secondaire. L'investisseur doit disposer d'une épargne de précaution suffisante pour ne pas être contraint de vendre dans l'urgence.",
    "La régularité des distributions peut être évaluée à travers plusieurs indicateurs : le taux d'occupation financier (TOF), le report à nouveau (réserve de distribution), la capitalisation de la SCPI, et la diversification de son patrimoine. Un TOF élevé (> 95 %) et un report à nouveau positif sont des signaux de régularité potentielle.",
    "La fiscalité des revenus SCPI est celle des revenus fonciers : les distributions sont imposées au barème progressif de l'impôt sur le revenu (selon la TMI du foyer), aux prélèvements sociaux (17,2 %), et éventuellement à la contribution exceptionnelle sur les hauts revenus (3 % ou 4 %) pour les foyers les plus aisés. Certains revenus de source étrangère peuvent bénéficier d'un crédit d'impôt.",
  ],
  tableTitle: 'Critère / Impact sur les revenus / Vigilance',
  tableRows: [
    {
      level: 'Rendement affiché (TDVM)',
      advantage:
        'Le TDVM donne une indication du rendement brut avant fiscalité et frais de souscription. Plus il est élevé, plus le potentiel de revenus bruts est important.',
      vigilance:
        "Le TDVM ne tient pas compte de la fiscalité ni des frais de souscription. Un TDVM élevé peut cacher des risques (secteur volatil, TOF bas, endettement élevé). Le rendement passé ne préjuge pas du rendement futur.",
    },
    {
      level: 'Fréquence de distribution',
      advantage:
        'Une distribution trimestrielle offre des revenus réguliers, adaptée à un besoin de trésorerie récurrent. Certaines SCPI distribuent mensuellement.',
      vigilance:
        "La fréquence n'augmente pas le montant total distribué. Une distribution plus fréquente peut réduire le lissage des revenus. Vérifier que le montant distribué ne provient pas du report à nouveau (distribution partielle du capital).",
    },
    {
      level: 'Fiscalité et prélèvements sociaux',
      advantage:
        "La fiscalité s'applique uniquement sur les revenus perçus. Un investisseur en TMI 11 % conserve une part plus importante des loyers qu'un investisseur en TMI 41 %.",
      vigilance:
        "Les prélèvements sociaux (17,2 %) s'appliquent quels que soient la TMI et l'âge. La fiscalité totale (TMI + PS) peut réduire le rendement net de 30 % à 60 % selon la TMI.",
    },
    {
      level: "Délai de jouissance",
      advantage:
        'Un délai de jouissance court (quelques jours) permet de percevoir les premiers loyers rapidement après la souscription.',
      vigilance:
        "Un délai de jouissance long (3-6 mois) retarde le premier versement et réduit le rendement effectif la première année. Le délai est précisé dans le DIC ou la note d'information.",
    },
    {
      level: 'Liquidité',
      advantage:
        "La possibilité de revendre ses parts à tout moment offre une flexibilité en cas de besoin de trésorerie. Pas de pénalité de sortie.",
      vigilance:
        "Le délai de cession peut atteindre 2 à 12 mois. En période de tension, la revente peut être difficile ou se faire à décote. L'investisseur doit conserver une épargne de précaution suffisante.",
    },
  ],
  tableNote:
    "Ce tableau est une synthèse pédagogique. Les impacts réels dépendent de la SCPI sélectionnée, des conditions de marché et de la situation fiscale de l'investisseur.",
  criteriaTitle: "Critères à analyser pour des revenus complémentaires en SCPI",
  criteriaCards: [
    { title: 'Rendement net de fiscalité', text: "Le rendement net après impôt est le seul indicateur pertinent pour évaluer le revenu réellement perçu. Simuler selon sa TMI et les prélèvements sociaux. Un TDVM de 5 % peut donner un rendement net de 2,5 % à 3,5 % selon la fiscalité." },
    { title: 'TOF (taux d\'occupation financier)', text: "Un TOF élevé (> 95 %) est un indicateur de régularité des distributions. Un TOF en baisse sur plusieurs trimestres peut signaler une dégradation locative et un risque de baisse des revenus." },
    { title: 'Report à nouveau', text: "Le report à nouveau est une réserve constituée par la SCPI pour lisser les distributions en cas de baisse temporaire des loyers. Un report à nouveau positif est un signal de stabilité." },
    { title: 'Frais de gestion', text: "Les frais de gestion (10-12 % des loyers) réduisent directement le montant distribué. Comparer entre SCPI : des frais plus élevés réduisent le rendement net perçu." },
    { title: 'Capitalisation', text: "Une capitalisation élevée (> 1 Md€) offre une meilleure diversification et une résilience potentielle. Les petites SCPI peuvent être plus volatiles dans leurs distributions." },
    { title: 'Fréquence de distribution', text: "Choisir une fréquence adaptée à son besoin de trésorerie : trimestrielle pour des revenus réguliers, semestrielle ou annuelle si le lissage n'est pas une contrainte. La fréquence n'impacte pas le montant total annuel." },
    { title: 'Délai de jouissance', text: "Un délai de jouissance court est préférable pour percevoir rapidement des revenus. Comparer les délais entre SCPI avant de souscrire, surtout si les revenus sont attendus à court terme." },
    { title: 'Diversification sectorielle', text: "Une SCPI diversifiée (bureaux, commerces, logistique, santé) est généralement plus résiliente qu'une SCPI mono-secteur. La diversification réduit le risque de baisse brutale des distributions." },
  ],
  commonErrors: [
    "Confondre TDVM (rendement brut) et revenu net après fiscalité et frais de souscription.",
    'Oublier que les prélèvements sociaux (17,2 %) s\'appliquent systématiquement en sus de l\'impôt sur le revenu, quel que soit l\'âge.',
    "Ne pas vérifier le délai de jouissance avant de souscrire, ce qui retarde le premier versement.",
    "Croire que la fréquence de distribution élevée signifie un meilleur rendement.",
    "Choisir une SCPI uniquement sur le TDVM sans analyser le TOF, le report à nouveau et la qualité du patrimoine.",
    "Sous-estimer l'impact des frais de souscription (8-12 %) sur le rendement effectif la première année.",
    "Ne pas vérifier la liquidité des parts, ce qui peut bloquer l'accès au capital en cas de besoin urgent.",
    "Investir sans épargne de précaution, ce qui peut obliger à vendre des parts dans l'urgence à un prix défavorable.",
  ],
  practicalCases: [
    {
      title: "Retraité cherchant un complément de revenu mensuel",
      text: "Hypothèses théoriques : souscription de 60 000 € de parts de SCPI au comptant. Rendement brut TDVM : 4,5 % (2 700 €/an). Frais de gestion : 12 % (324 €). Revenus nets avant impôt : 2 376 €/an (198 €/mois). TMI 11 % + PS 17,2 % = 28,2 %. Impôt : 670 €. Revenu net perçu : 1 706 €/an, soit 142 €/mois. Distribution trimestrielle : environ 43 € par trimestre après impôt. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Actif fortement imposé cherchant un rendement net optimisé",
      text: "Hypothèses théoriques : investisseur en TMI 41 %, souscription de 100 000 € de SCPI. Rendement brut : 5 % (5 000 €/an). Frais de gestion : 12 % (600 €). Revenus nets avant impôt : 4 400 €/an (367 €/mois). TMI 41 % + PS 17,2 % = 58,2 %. Impôt : 2 561 €. Revenu net perçu : 1 839 €/an, soit 153 €/mois. L'investisseur conserve moins de 37 % des loyers bruts après fiscalité. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur avec besoin de revenus mensuels réguliers",
      text: "Hypothèses théoriques : souscription de 80 000 € répartis sur 2 SCPI à distribution trimestrielle décalée pour lisser les revenus sur l'année. Rendement brut moyen : 4,8 % (3 840 €/an). Frais de gestion : 12 % (461 €). Revenus nets avant impôt : 3 379 €/an (282 €/mois). TMI 30 % + PS 17,2 % = 47,2 %. Impôt : 1 595 €. Revenu net perçu : 1 784 €/an, soit 149 €/mois. Le choix de 2 SCPI permet de répartir les dates de versement pour un revenu plus régulier. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur avec horizon court (3-5 ans)",
      text: "Hypothèses théoriques : souscription de 30 000 € de SCPI avec un objectif de revenus complémentaires sur 3 à 5 ans. Rendement brut : 5,5 % (1 650 €/an). Frais de gestion : 12 % (198 €). Revenus nets avant impôt : 1 452 €/an (121 €/mois). TMI 30 % : impôt de 685 €. Revenu net perçu : 767 €/an, soit 64 €/mois. À l'horizon de 4 ans, l'investisseur prévoit de revendre ses parts. Le risque de moins-value à la revente et les frais de souscription non amortis (10 % = 3 000 € sur 4 ans, soit 750 €/an) réduisent le rendement effectif global. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
  ],
  methodParagraphs: [
    "MaximusSCPI compare les SCPI selon leurs indicateurs clés. Pour un objectif de revenus complémentaires, l'analyse doit porter sur le rendement net après fiscalité, la régularité des distributions, la liquidité et le délai de jouissance.",
    "La première étape consiste à estimer le montant de revenu complémentaire souhaité et à déterminer le capital nécessaire en fonction du rendement net après fiscalité. Cette estimation est indicative et ne constitue pas un engagement de distribution.",
    "La deuxième étape sélectionne les SCPI dans le comparateur selon des critères de régularité : TOF > 95 %, report à nouveau positif, capitalisation suffisante, diversification sectorielle.",
    "La troisième étape vérifie la liquidité des SCPI sélectionnées et le délai de jouissance. Ces deux critères impactent la disponibilité effective des revenus et du capital.",
    "La quatrième étape simule le rendement net après fiscalité selon la TMI de l'investisseur. Cette simulation permet d'estimer le revenu réellement perçu par rapport au TDVM brut affiché.",
    "MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler un objectif de revenus complémentaires en SCPI selon votre TMI, votre horizon et votre situation patrimoniale.",
  ],
  conclusionParagraphs: [
    "Les SCPI peuvent contribuer à générer des revenus complémentaires, mais ces revenus ne sont pas garantis et dépendent de la qualité locative de la SCPI, de sa gestion, du contexte économique et de la fiscalité de l'investisseur. Le rendement net après impôt est le seul indicateur pertinent pour évaluer le revenu réellement perçu.",
    "Sources à consulter : DIC des SCPI, bulletins trimestriels, rapports annuels, historique de distribution sur plusieurs années, avis d'imposition pour simuler l'impact fiscal.",
    "Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir selon vos critères de régularité et de rendement, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI et à vos objectifs de revenus.",
  ],
  faqItems: [
    {
      question: "Quel rendement net peut-on espérer avec des SCPI ?",
      answer: "Le rendement net après fiscalité dépend du TDVM brut, des frais de gestion, de la TMI de l'investisseur et des prélèvements sociaux. À titre indicatif, un TDVM de 5 % peut donner un rendement net de 2 % à 3,5 % selon la fiscalité. Le rendement passé ne préjuge pas du rendement futur.",
    },
    {
      question: "Les revenus SCPI sont-ils garantis ?",
      answer: "Non. Les distributions dépendent des loyers perçus par la SCPI, qui peuvent varier en fonction du taux d'occupation, du niveau des loyers, des charges et des arbitrages de la société de gestion. Il n'existe aucune garantie de distribution.",
    },
    {
      question: "À quelle fréquence les revenus sont-ils versés ?",
      answer: "La fréquence de distribution varie selon les SCPI : trimestrielle, semestrielle ou annuelle. Certaines SCPI proposent des distributions mensuelles. La fréquence est précisée dans la note d'information ou le DIC.",
    },
    {
      question: "Quels sont les frais qui réduisent les revenus perçus ?",
      answer: "Les frais de gestion (10-12 % des loyers bruts) sont prélevés avant distribution. Les frais de souscription (8-12 %) réduisent le capital investi net. La fiscalité (TMI + PS) s'applique sur les revenus distribués.",
    },
    {
      question: "Quel est l'impact du délai de jouissance ?",
      answer: "Le délai de jouissance retarde le premier versement des loyers après la souscription. Plus le délai est long, plus le rendement effectif de la première année est réduit. Ce délai est à vérifier avant de souscrire.",
    },
    {
      question: "Peut-on vivre uniquement des revenus de ses SCPI ?",
      answer: "Cela dépend du capital investi et du rendement net après fiscalité. Pour un revenu significatif, un capital conséquent est nécessaire. À titre indicatif, pour percevoir 1 000 € nets par mois, un capital de 400 000 € à 500 000 € peut être nécessaire selon la fiscalité et le rendement.",
    },
    {
      question: "Comment analyser la régularité des distributions ?",
      answer: "Vérifier le TOF (taux d'occupation financier), le report à nouveau (réserve de distribution), l'historique des distributions sur 5 à 10 ans, la capitalisation de la SCPI et la diversification de son patrimoine.",
    },
    {
      question: "Quelle fiscalité pour les revenus SCPI ?",
      answer: "Les revenus SCPI sont imposés dans la catégorie des revenus fonciers : au barème progressif de l'IR (selon la TMI), aux prélèvements sociaux (17,2 %), et éventuellement à la contribution exceptionnelle sur les hauts revenus.",
    },
    {
      question: "Faut-il déclarer les revenus SCPI chaque année ?",
      answer: "Oui, les revenus perçus doivent être déclarés chaque année dans la déclaration de revenus fonciers (cerfa 2044). La SCPI transmet un relevé fiscal individuels (RFI) chaque année.",
    },
    {
      question: "Peut-on investir en SCPI pour des revenus complémentaires avec un petit budget ?",
      answer: "Oui, certaines SCPI permettent de souscrire à partir de 1 000 € ou 5 000 €. L'impact des frais de souscription est proportionnel, quel que soit le montant investi.",
    },
    {
      question: 'Comment MaximusSCPI aide à évaluer les revenus SCPI ?',
      answer: "Le comparateur MaximusSCPI présente les indicateurs clés des SCPI (TDVM, TOF, capitalisation, endettement). Cette analyse préalable est une piste à approfondir pour évaluer le potentiel de revenus selon votre situation.",
    },
  ],
  comparateurCtaLabel: "Évaluer les revenus SCPI nets de fiscalité",
}
