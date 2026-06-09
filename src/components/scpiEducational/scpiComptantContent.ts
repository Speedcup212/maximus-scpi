import type { ScpiEducationalPageConfig } from './shared'

export const scpiComptantConfig: ScpiEducationalPageConfig = {
  path: '/scpi-comptant',
  badge: 'Financement',
  h1: 'SCPI au comptant : avantages, limites et critères à vérifier',
  heroSubtitle:
    "L'achat de parts de SCPI au comptant est simple et sans effet de levier. Mais la fiscalité, la liquidité, l'horizon et le coût d'opportunité doivent être analysés.",
  seoTitle: 'SCPI au comptant : rendement, fiscalité, liquidité et risques',
  seoDescription:
    "Comprenez l'achat de SCPI au comptant : revenus potentiels, fiscalité, liquidité, frais, diversification, rendement net et points de vigilance.",
  shortAnswerTitle: "Pourquoi acheter des SCPI au comptant ?",
  shortAnswer:
    "L'achat de SCPI au comptant consiste à financer la souscription de parts avec des fonds propres, sans recours à un crédit. Cette approche est simple, sans engagement bancaire, sans frais d'intérêt et sans risque de taux. L'investisseur perçoit l'intégralité des revenus distribués, nets des frais de gestion de la SCPI, et ne supporte aucun coût de financement. En contrepartie, l'absence d'effet de levier limite le potentiel de rendement par rapport à un montage à crédit. La fiscalité s'applique immédiatement chaque année sur les revenus perçus, ce qui peut réduire significativement le rendement net pour les investisseurs fortement imposés. L'horizon de détention, la liquidité des parts et le coût d'opportunité du capital immobilisé sont des critères à analyser.",
  keyMessage:
    "L'achat de SCPI au comptant est simple, mais la fiscalité, la liquidité et l'horizon restent déterminants.",
  definitionParagraphs: [
    "L'achat de SCPI au comptant signifie que l'investisseur mobilise ses propres capitaux pour acquérir des parts, sans emprunt bancaire. Cette modalité est la plus courante et la plus accessible, notamment pour des montants modérés ou des premiers investissements.",
    "La simplicité est le premier avantage : pas de dossier de crédit, pas d'assurance emprunteur, pas de frais d'intérêt, pas de risque de taux. L'investisseur devient propriétaire des parts dès la souscription et perçoit les loyers distribués selon le calendrier de la SCPI.",
    "L'absence d'effet de levier signifie que le rendement perçu correspond au rendement net de la SCPI, sans amplification. Si le TDVM brut est de 5 %, après frais de gestion (10-12 % des loyers), le rendement net de frais de gestion est d'environ 4,4 % à 4,5 %. Après impôt (TMI + prélèvements sociaux), le rendement net de fiscalité peut être significativement inférieur.",
    "La fiscalité est un enjeu central de l'achat au comptant : les revenus fonciers perçus sont imposés chaque année au barème progressif de l'impôt sur le revenu (selon la TMI) et aux prélèvements sociaux (17,2 %). Un investisseur en TMI 30 % supporte une fiscalité totale de 47,2 % sur ses revenus SCPI (30 % + 17,2 %), soit près de la moitié des distributions.",
    "La liquidité des SCPI est un point de vigilance essentiel : en cas de besoin de trésorerie, la revente des parts sur le marché secondaire peut prendre 2 à 12 mois selon les SCPI et les conditions de marché. L'investisseur au comptant doit disposer d'une épargne de précaution suffisante pour ne pas être contraint de vendre dans l'urgence.",
    "Les frais de souscription (8 % à 12 % du montant investi) sont prélevés immédiatement et réduisent le capital effectivement investi. Pour une souscription de 10 000 € avec 10 % de frais, seul 9 000 € est investi en parts, ce qui réduit mécaniquement le rendement perçu la première année.",
    "Le coût d'opportunité du capital immobilisé doit être analysé : les fonds investis en SCPI ne sont pas disponibles pour d'autres placements ou projets. L'investisseur doit comparer le rendement net espéré des SCPI avec celui d'autres classes d'actifs (assurance-vie, obligations, immobilier physique) et avec son besoin de liquidité.",
    "L'achat au comptant reste compatible avec la plupart des stratégies : revenus complémentaires, préparation de la retraite, diversification patrimoniale, transmission. Il n'y a pas de contrainte de crédit ni de risque de taux, ce qui simplifie la gestion sur la durée.",
  ],
  tableTitle: 'Avantage / Limite / Point de vigilance',
  tableRows: [
    {
      level: 'Simplicité',
      advantage:
        "Pas de dossier de crédit, pas d'assurance, pas d'intérêt. Souscription rapide une fois le choix de SCPI effectué. Gestion administrative allégée.",
      vigilance:
        "La simplicité ne dispense pas d'une analyse approfondie de la SCPI (TOF, capitalisation, endettement, secteur). Un achat simple peut être un mauvais investissement si la SCPI est mal choisie.",
    },
    {
      level: "Absence d'effet de levier",
      advantage:
        'Pas de risque de taux, pas de contrainte bancaire. Le rendement perçu correspond au rendement réel de la SCPI, sans amplification du risque.',
      vigilance:
        "Le rendement potentiel est limité au rendement net de la SCPI. L'absence d'effet de levier peut être un inconvénient si les taux sont bas et le rendement SCPI élevé.",
    },
    {
      level: 'Liquidité',
      advantage:
        'L\'investisseur est libre de conserver ou de vendre ses parts selon ses besoins, sans contrainte de remboursement de crédit.',
      vigilance:
        'La revente sur le marché secondaire peut prendre 2 à 12 mois. En cas d\'urgence, l\'investisseur peut être contraint de vendre à décote. Une épargne de précaution est nécessaire.',
    },
    {
      level: 'Fiscalité immédiate',
      advantage:
        "La fiscalité est simple : les revenus sont déclarés chaque année dans la catégorie des revenus fonciers. Pas de fiscalité différée ni de régularisation complexe.",
      vigilance:
        "L'imposition annuelle réduit le rendement net perçu, particulièrement pour les TMI élevées. Un investisseur à 41 % + 17,2 % de PS conserve moins de 42 % des loyers bruts après impôt.",
    },
    {
      level: 'Frais de souscription',
      advantage:
        "Les frais sont prélevés une seule fois à l'entrée. Ils sont identiques quelle que soit la modalité de financement (comptant ou crédit).",
      vigilance:
        "Les frais de souscription (8-12 %) réduisent le capital investi net et le rendement effectif la première année. Ils sont à intégrer dans le calcul de rentabilité à l'entrée.",
    },
  ],
  tableNote:
    "Ce tableau est une synthèse pédagogique. Les avantages et limites réels dépendent de la situation personnelle, de la SCPI sélectionnée et des conditions de marché.",
  criteriaTitle: "Critères à vérifier pour un achat de SCPI au comptant",
  criteriaCards: [
    { title: 'Rendement net de frais de gestion', text: 'Le TDVM brut doit être réduit des frais de gestion (10-12 % des loyers). Un rendement brut de 5 % donne un rendement net de frais d\'environ 4,4 %. C\'est le point de départ de l\'analyse.' },
    { title: 'Rendement net de fiscalité', text: 'Après application de la TMI et des prélèvements sociaux, le rendement net perçu peut être significativement inférieur au rendement brut. Simuler selon sa propre situation fiscale.' },
    { title: 'TOF (taux d\'occupation financier)', text: 'Un TOF élevé (> 95 %) indique une bonne gestion locative et une régularité des distributions. C\'est un critère de qualité de la SCPI, indépendant du mode de financement.' },
    { title: 'Capitalisation', text: 'Une capitalisation élevée (> 1 Md€) offre une meilleure diversification et une résilience potentielle. Une petite capitalisation peut être plus volatile mais offrir un rendement plus élevé.' },
    { title: 'Endettement', text: "L'endettement de la SCPI elle-même influence son profil de risque. Un endettement élevé (> 40 %) peut amplifier les variations de distributions en cas de hausse des taux." },
    { title: 'Délai de jouissance', text: "Le délai entre la souscription et le premier versement de loyers peut aller de quelques jours à plusieurs mois. Il réduit le rendement effectif de la première année." },
    { title: 'Horizon de détention', text: 'Une SCPI au comptant se conserve généralement 8 à 15 ans minimum. Lisser les frais de souscription sur une durée longue améliore le rendement annualisé.' },
    { title: 'Frais de souscription', text: 'Comparer les frais entre SCPI (8 % à 12 %). Des frais plus élevés réduisent le capital investi net et le rendement à l\'entrée, surtout pour des montants modestes.' },
  ],
  commonErrors: [
    'Confondre rendement brut TDVM et rendement net de fiscalité perçu.',
    'Ne pas intégrer l\'impact des prélèvements sociaux (17,2 %) sur le rendement net.',
    "Oublier que les frais de souscription réduisent le capital effectivement investi et le rendement la première année.",
    "Choisir une SCPI uniquement sur son rendement affiché sans analyser le TOF, la capitalisation et la qualité du patrimoine.",
    "Sous-estimer le délai de revente des parts en cas de besoin de liquidité (2 à 12 mois).",
    "Investir au comptant sans épargne de précaution suffisante, ce qui peut obliger à vendre dans l'urgence.",
    "Ne pas comparer le rendement net espéré avec celui d'autres placements (assurance-vie, fonds euros, obligations).",
    "Ignorer le coût d'opportunité : des fonds immobilisés en SCPI ne sont pas disponibles pour d'autres projets ou investissements.",
  ],
  practicalCases: [
    {
      title: "Investisseur TMI 30 % — Achat de 50 000 € au comptant",
      text: "Hypothèses théoriques : souscription de 50 000 € de parts de SCPI (frais de souscription 10 % inclus). Rendement brut : 5 % (2 500 €/an). Frais de gestion : 12 % des loyers (300 €). Revenus nets avant impôt : 2 200 €. TMI 30 % + PS 17,2 % = 47,2 %. Impôt : 1 038 €. Revenu net perçu : 1 162 €, soit un rendement net de 2,32 %. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur TMI 11 % — Même investissement",
      text: "Mêmes hypothèses : 50 000 € de SCPI, rendement brut 5 %, frais de gestion 12 %. Revenus nets avant impôt : 2 200 €. TMI 11 % + PS 17,2 % = 28,2 %. Impôt : 620 €. Revenu net perçu : 1 580 €, soit un rendement net de 3,16 %. L'investisseur en TMI 11 % conserve une part plus importante des loyers que l'investisseur en TMI 30 %. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur avec objectif de revenus complémentaires immédiats",
      text: "Hypothèses : souscription de 100 000 € de SCPI au comptant. Rendement brut : 4,5 % (4 500 €/an). Frais de gestion : 12 % (540 €). Revenus nets avant impôt : 3 960 €, soit 330 €/mois. TMI 30 % : impôt de 1 869 €. Revenu net perçu : 2 091 €/an, soit 174 €/mois. L'investisseur perçoit des revenus réguliers mais réduits par la fiscalité. La régularité des distributions dépend de la qualité locative de la SCPI. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
    {
      title: "Investisseur comparant comptant vs crédit",
      text: "Hypothèses : 100 000 € disponibles. Scénario 1 : achat au comptant, rendement net après fiscalité 2,3 % (TMI 30 %). Scénario 2 : achat à crédit de 200 000 € (effet de levier) avec 100 000 € d'apport, rendement net après fiscalité estimé à 3,5 % sur le capital total investi (avant déduction du coût du crédit résiduel). L'écart potentiel de rendement doit être mis en balance avec le risque de taux, la durée du crédit et la contrainte mensuelle. Simulation pédagogique simplifiée, hors frais, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.",
    },
  ],
  methodParagraphs: [
    "MaximusSCPI compare les SCPI selon leurs indicateurs clés. Pour un achat au comptant, l'analyse doit porter sur le rendement net de fiscalité, la qualité locative, la liquidité et l'horizon de détention.",
    "La première étape consiste à sélectionner plusieurs SCPI dans le comparateur et à analyser leur TDVM, leur TOF, leur capitalisation et leur endettement. Ces indicateurs donnent une première lecture de la régularité et du risque.",
    "La deuxième étape consiste à estimer le rendement net de fiscalité en appliquant sa propre TMI et les prélèvements sociaux. Un outil de simulation ou un échange avec un conseiller permet de préciser ce calcul.",
    "La troisième étape vérifie la liquidité de la SCPI : volume d'échanges sur le marché secondaire, délai moyen de cession, existence d'un marché organisé ou non.",
    "La quatrième étape évalue le coût d'opportunité : le rendement net espéré des SCPI est-il supérieur à celui d'autres placements accessibles ? L'argent investi en SCPI est-il disponible pour d'autres projets à court ou moyen terme ?",
    "MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler un achat de SCPI au comptant selon votre situation fiscale, votre horizon et vos objectifs.",
  ],
  conclusionParagraphs: [
    "L'achat de SCPI au comptant est une solution simple et sans contrainte bancaire, adaptée aux investisseurs qui souhaitent percevoir des revenus complémentaires sans effet de levier. La fiscalité immédiate, la liquidité et le coût d'opportunité du capital sont les principaux points d'attention.",
    "Sources à consulter : DIC des SCPI, bulletins trimestriels, rapports annuels, avis d'imposition (pour simuler l'impact fiscal), conditions du marché secondaire.",
    "Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir selon vos critères, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI, votre horizon et votre situation patrimoniale.",
  ],
  faqItems: [
    {
      question: "Qu'est-ce qu'un achat de SCPI au comptant ?",
      answer: "L'achat au comptant consiste à financer la souscription de parts avec ses fonds propres, sans recourir à un crédit. L'investisseur devient propriétaire des parts immédiatement et perçoit l'intégralité des revenus distribués, nets des frais de gestion.",
    },
    {
      question: "Est-ce plus intéressant que d'acheter à crédit ?",
      answer: "Cela dépend de la situation de l'investisseur. L'achat au comptant est plus simple et sans risque de taux, mais sans effet de levier. L'achat à crédit amplifie le rendement potentiel mais ajoute des risques. Le choix dépend de la capacité d'endettement, de la TMI et de l'horizon.",
    },
    {
      question: 'Quel est le rendement net après impôt ?',
      answer: "Le rendement net après impôt dépend du TDVM brut, des frais de gestion, de la TMI de l'investisseur et des prélèvements sociaux (17,2 %). À titre indicatif, un investisseur en TMI 30 % conserve environ 46 % du rendement brut après frais de gestion et fiscalité.",
    },
    {
      question: "Quels frais sont prélevés sur un achat au comptant ?",
      answer: "Les frais de souscription (8 % à 12 % du montant investi) sont prélevés à l'entrée. Les frais de gestion (10 % à 12 % des loyers perçus) sont prélevés chaque année. Il n'y a pas de frais liés au financement (pas d'intérêt ni d'assurance emprunteur).",
    },
    {
      question: "Peut-on investir de petites sommes au comptant ?",
      answer: "Oui, certaines SCPI proposent des souscriptions à partir de quelques milliers d'euros, parfois 1 000 € ou 5 000 € selon les sociétés de gestion. Les frais de souscription étant proportionnels, l'impact relatif est identique quel que soit le montant.",
    },
    {
      question: "Quel est le délai avant de percevoir les premiers loyers ?",
      answer: "Le délai de jouissance varie selon les SCPI : de quelques jours à plusieurs mois après la souscription. Ce délai réduit le rendement effectif de la première année. Il est précisé dans le DIC ou la note d'information.",
    },
    {
      question: "L'achat au comptant est-il adapté à la transmission ?",
      answer: "Oui, les parts de SCPI détenues au comptant peuvent être transmises par donation ou succession. Le démembrement (nue-propriété / usufruit) peut être une stratégie complémentaire pour optimiser la transmission.",
    },
    {
      question: "Faut-il un conseiller pour acheter au comptant ?",
      answer: "Un conseil préalable est recommandé pour analyser la fiscalité selon votre TMI, la cohérence avec votre patrimoine et vos objectifs. L'achat au comptant, bien que simple, nécessite une sélection rigoureuse de la SCPI.",
    },
    {
      question: "Peut-on revendre ses parts à tout moment ?",
      answer: "La revente est possible à tout moment sur le marché secondaire. Le délai de cession est généralement de 2 à 6 mois, parfois plus en période de tension. Il n'y a pas de pénalité de sortie, mais le prix de vente dépend de l'offre et de la demande.",
    },
    {
      question: "Quelle différence avec l'achat en assurance-vie ?",
      answer: "L'achat au comptant permet de détenir directement les parts et de percevoir les loyers imposables chaque année. En assurance-vie, les revenus sont capitalisés et la fiscalité est différée, mais des frais UC s'ajoutent et le choix de SCPI est limité.",
    },
    {
      question: 'Comment MaximusSCPI aide-t-il à choisir une SCPI au comptant ?',
      answer: "Le comparateur MaximusSCPI présente les indicateurs clés des SCPI (rendement, TOF, capitalisation, endettement, frais). Cette analyse est une piste à approfondir pour sélectionner les SCPI à étudier selon votre situation.",
    },
  ],
  comparateurCtaLabel: "Comparer SCPI au comptant, crédit et démembrement",
}
