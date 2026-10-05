import type { ScpiEducationalPageConfig } from './shared'

export const scpiRevenusComplementairesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-complementaires/',
  badge: 'Objectif patrimonial',
  h1: 'SCPI pour revenus complémentaires : montant, régularité et risques',
  heroSubtitle:
    "Les SCPI peuvent contribuer à générer des revenus complémentaires, mais ni leur montant ni leur régularité ne sont garantis. Une estimation sérieuse doit intégrer le taux de distribution réellement constaté, le délai de jouissance, la fiscalité, les frais, la liquidité et la trajectoire de la SCPI.",
  seoTitle: 'SCPI revenus complémentaires : calcul, fiscalité, délai et risques',
  seoDescription:
    "Guide SCPI pour revenus complémentaires : montant à investir, distributions, délai de jouissance, fiscalité, liquidité, diversification et scénarios de revenu prudents.",
  shortAnswerTitle: 'Les SCPI sont-elles adaptées à un objectif de revenus complémentaires ?',
  shortAnswer:
    "Elles peuvent l'être, mais il faut distinguer revenu cible et revenu réellement distribuable. Le taux de distribution varie, le prix des parts peut baisser, la distribution peut être réduite et la revente peut prendre du temps. Le bon raisonnement consiste à définir un besoin net, simuler plusieurs scénarios de distribution et de fiscalité, puis vérifier que l'investisseur peut supporter une baisse temporaire du revenu sans devoir vendre dans de mauvaises conditions.",
  keyMessage:
    "Un revenu SCPI n'est pas une rente garantie. La robustesse du plan dépend davantage du scénario défavorable et de la liquidité que du rendement affiché au moment de la souscription.",
  definitionParagraphs: [
    "Une SCPI distribue généralement une partie du résultat issu de ses actifs immobiliers. Ces distributions peuvent varier d'un trimestre à l'autre et d'une année à l'autre selon l'occupation, les loyers, les charges, les travaux, les cessions et la politique de distribution.",
    "Le taux de distribution historique ne doit pas être extrapolé comme un coupon garanti. Pour construire un objectif de revenu, il est préférable de retenir plusieurs hypothèses : basse, centrale et haute, puis d'actualiser la simulation à chaque bulletin trimestriel.",
    "Le délai de jouissance crée un décalage entre la souscription et le début des distributions. Il faut donc financer séparément la période sans revenu et ne pas intégrer des distributions avant leur date probable d'effet.",
    "La fiscalité dépend de la nature des revenus, des pays d'investissement et du mode de détention. Une TMI ne suffit pas à déterminer le revenu net : base imposable, conventions fiscales, prélèvements sociaux et enveloppe doivent être analysés séparément.",
    "La diversification entre plusieurs SCPI peut réduire certains risques de concentration mais ne garantit pas la stabilité du revenu. Si plusieurs véhicules sont exposés aux mêmes secteurs ou aux mêmes cycles, la diversification peut être seulement apparente.",
    "La liquidité est un point critique pour un investisseur qui dépend des distributions. Une baisse de revenu ne doit pas forcer une revente immédiate, car les délais de retrait peuvent s'allonger et le prix de part peut avoir baissé.",
    "Pour un objectif de revenus réguliers, le matelas de sécurité disponible hors SCPI est aussi important que le rendement de la SCPI. L'investisseur doit pouvoir absorber une baisse ou un décalage de distribution sans tension de trésorerie.",
  ],
  tableTitle: 'Élément / utilité / vigilance',
  tableRows: [
    {
      level: 'Revenu cible',
      advantage: 'Permet de définir un besoin mensuel ou annuel clair.',
      vigilance: 'Ne pas convertir automatiquement le besoin en capital avec un rendement unique et garanti.',
    },
    {
      level: 'Taux de distribution',
      advantage: 'Donne un point de départ pour estimer les distributions.',
      vigilance: 'Variable dans le temps ; doit être stressé dans un scénario défavorable.',
    },
    {
      level: 'Délai de jouissance',
      advantage: 'Connu à la souscription et intégrable dans le calendrier.',
      vigilance: "Crée une période sans revenu qu'il faut financer séparément.",
    },
    {
      level: 'Fiscalité',
      advantage: 'Peut être simulée selon le dossier et le mode de détention.',
      vigilance: 'Pas de formule universelle par TMI, surtout pour les revenus étrangers ou les enveloppes.',
    },
    {
      level: 'Liquidité',
      advantage: 'Peut être suivie via retraits, collecte et marché secondaire.',
      vigilance: 'La sortie n\'est jamais garantie à une date ni à un prix donné.',
    },
    {
      level: 'Diversification',
      advantage: 'Répartit les risques entre gestionnaires, secteurs et zones.',
      vigilance: 'Vérifier les expositions réelles et éviter les doublons de risque.',
    },
  ],
  tableNote:
    "Le revenu cible doit être considéré comme une hypothèse de planification, pas comme un engagement de la SCPI.",
  criteriaTitle: 'Critères à croiser pour un objectif de revenus',
  criteriaCards: [
    { title: 'Besoin net annuel', text: "Définir le montant réellement nécessaire après fiscalité et conserver une marge de sécurité." },
    { title: 'Scénario défavorable', text: "Tester une baisse de distribution, un retard de jouissance et une liquidité plus faible." },
    { title: 'TOF et baux', text: "Suivre occupation, locataires, franchises, échéances et renouvellements plutôt qu'un seul TOF ponctuel." },
    { title: 'Liquidité', text: "Contrôler parts en attente, retraits et collecte avant de compter sur une sortie rapide." },
    { title: 'Fiscalité réelle', text: "Ventiler les flux par nature et par pays et appliquer les règles du mode de détention." },
    { title: 'Matelas de sécurité', text: "Prévoir une réserve hors SCPI pour ne pas dépendre d'une distribution trimestrielle." },
    { title: 'Diversification', text: "Croiser gestionnaires, secteurs, géographies et maturités des patrimoines." },
  ],
  commonErrors: [
    "Promettre un revenu mensuel à partir d'un taux de distribution historique.",
    "Convertir un rendement annuel en mensualité garantie.",
    "Oublier le délai de jouissance dans les premières années.",
    "Appliquer TMI + prélèvements sociaux à tous les revenus sans distinguer les flux.",
    "Construire le plan de revenu sans scénario de baisse de distribution.",
    "Compter sur une revente rapide en cas de baisse de revenu.",
    "Diversifier seulement par nom de SCPI sans regarder les mêmes secteurs et locataires sous-jacents.",
  ],
  practicalCases: [
    {
      title: 'Objectif 500 € nets par mois',
      text: "Le besoin annuel est d'abord fixé à 6 000 € nets. Au lieu de diviser ce montant par un rendement supposé constant, la simulation calcule plusieurs niveaux de distribution et de fiscalité, ajoute le délai de jouissance et vérifie la capacité à supporter une baisse temporaire du revenu.",
    },
    {
      title: 'Baisse de distribution de 15 %',
      text: "Le scénario défavorable réduit les distributions de 15 % pendant une période donnée. Si le budget du foyer devient immédiatement déficitaire, le portefeuille est trop dépendant des SCPI pour cet objectif de revenu.",
    },
    {
      title: 'Revenus issus de plusieurs SCPI',
      text: "Répartir sur plusieurs SCPI peut lisser les dates de versement, mais cela ne transforme pas une distribution trimestrielle en revenu contractuel mensuel. Le besoin de trésorerie doit être géré séparément.",
    },
    {
      title: 'SCPI avec liquidité dégradée',
      text: "Une distribution encore correcte peut coexister avec une hausse des parts en attente de retrait. Le revenu seul ne suffit donc pas pour juger la sécurité du plan patrimonial.",
    },
  ],
  methodParagraphs: [
    "Définir le besoin annuel net et la part de ce besoin qui peut raisonnablement dépendre d'actifs non garantis.",
    "Sélectionner plusieurs scénarios de distribution au lieu d'un rendement unique.",
    "Intégrer le délai de jouissance et les frais d'entrée dans le calendrier de trésorerie.",
    "Calculer la fiscalité selon les flux réellement distribués et le mode de détention.",
    "Vérifier TOF, baux, dette, valeurs, liquidité et trajectoire de chaque SCPI.",
    "Conserver un matelas de sécurité hors SCPI pour absorber une baisse ou un retard de distribution.",
    "Réviser le plan à chaque changement significatif détecté dans les bulletins ou la Trajectoire MaximusSCPI.",
  ],
  conclusionParagraphs: [
    "Les SCPI peuvent contribuer à un complément de revenus, mais leur distribution n'est ni garantie ni parfaitement régulière.",
    "La bonne allocation est celle qui reste viable dans un scénario défavorable sans imposer une vente précipitée.",
    "Le rendement affiché doit toujours être subordonné à la qualité du patrimoine, la liquidité et la fiscalité réelle du dossier.",
  ],
  faqItems: [
    {
      question: 'Peut-on viser un revenu mensuel avec des SCPI ?',
      answer: "On peut viser un niveau annuel de distributions, mais les SCPI ne garantissent pas un revenu mensuel fixe. Les versements sont souvent trimestriels et variables.",
    },
    {
      question: 'Quel capital faut-il investir ?',
      answer: "Il dépend du besoin net, du rendement futur réellement obtenu, de la fiscalité, du délai de jouissance et du scénario de sécurité. Une division simple par un taux de rendement n'est pas suffisante.",
    },
    {
      question: 'Le rendement est-il garanti ?',
      answer: "Non. Les distributions et le capital peuvent évoluer à la baisse.",
    },
    {
      question: 'Faut-il plusieurs SCPI ?',
      answer: "La diversification peut réduire certains risques, à condition que les patrimoines, secteurs, zones et gestionnaires soient réellement différents.",
    },
    {
      question: 'Comment intégrer la fiscalité ?',
      answer: "En ventilant les flux par nature et par pays et en appliquant les règles correspondant au mode de détention et au foyer fiscal.",
    },
    {
      question: 'Pourquoi la liquidité compte-t-elle pour un objectif de revenu ?',
      answer: "Parce qu'une baisse des distributions ne doit pas forcer une vente rapide alors que les retraits peuvent être ralentis et le prix de part diminué.",
    },
    {
      question: 'Comment MaximusSCPI suit-il cet objectif ?',
      answer: "Le suivi combine distribution, TOF, valeurs, dette, liquidité, trajectoire et signaux de marché afin d'identifier les ruptures avant qu'elles ne dégradent durablement le plan de revenu.",
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI pour un objectif de revenus',
}
