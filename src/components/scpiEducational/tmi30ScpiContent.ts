import type { ScpiEducationalPageConfig } from './shared'

export const tmi30ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-30',
  badge: 'Fiscalité & stratégie',
  h1: 'SCPI avec TMI 30 % : fiscalité, Europe et démembrement',
  heroSubtitle:
    'À TMI 30 %, la fiscalité devient un critère central dans l\'analyse SCPI. Le rendement brut ne suffit plus : le rendement net après impôt et prélèvements sociaux doit être comparé selon les options : SCPI françaises, européennes, démembrement, assurance-vie ou crédit.',
  seoTitle: 'SCPI TMI 30 % : rendement net, fiscalité et stratégies à analyser',
  seoDescription:
    'Comprenez les critères d\'analyse des SCPI avec une TMI à 30 % : fiscalité des revenus fonciers, SCPI européennes, démembrement, assurance-vie et rendement net.',
  shortAnswerTitle: 'Pourquoi la TMI 30 % change-t-elle l\'analyse ?',
  shortAnswer:
    'À TMI 30 %, un investisseur en SCPI française en direct supporte un taux marginal total d\'environ 47,2 % (30 % + 17,2 % de prélèvements sociaux). Le rendement net après impôt peut être significativement inférieur au TDVM brut. C\'est pourquoi les alternatives — SCPI européennes, démembrement temporaire, assurance-vie, crédit — doivent être analysées en rendement net fiscal, pas en rendement brut.',
  keyMessage:
    'À TMI 30 %, le rendement affiché doit être retraité de la fiscalité pour éviter une mauvaise lecture.',
  definitionParagraphs: [
    'La TMI à 30 % concerne les foyers dont les revenus imposables se situent entre environ 28 000 € et 75 000 € par part fiscale (seuils 2026 indicatifs). Pour un couple sans enfant, cela correspond à des revenus nets imposables compris entre environ 56 000 € et 150 000 €.',
    'Pour une SCPI française en direct, les revenus fonciers sont ajoutés au revenu global et imposés à la TMI majorée des prélèvements sociaux de 17,2 %. Le taux marginal total atteint environ 47,2 %. Un TDVM de 5 % peut ainsi se traduire par un rendement net d\'environ 2,6 % avant frais.',
    'À ce niveau de TMI, les SCPI européennes prennent tout leur sens : les revenus étrangers sont imposés au taux effectif du pays source (souvent 15 % à 25 %), avec un crédit d\'impôt en France. Le différentiel fiscal par rapport aux SCPI françaises peut améliorer le rendement net de manière significative.',
    'Le démembrement temporaire (nue-propriété) peut être pertinent à TMI 30 % : aucun revenu à déclarer pendant la durée du démembrement, ce qui évite l\'imposition à 47,2 %. L\'économie fiscale peut justifier l\'absence temporaire de revenus si l\'horizon est compatible.',
    'L\'assurance-vie reste une option structurante : capitalisation sans imposition immédiate, abattement après 8 ans, fiscalité allégée sur les rachats. À TMI 30 %, l\'écart entre le rendement net en direct et en assurance-vie peut justifier le choix du contrat.',
    'Le crédit peut être intéressant si les intérêts d\'emprunt sont déductibles des revenus fonciers (sous conditions). L\'effet de levier combiné à la déductibilité peut améliorer le rendement net pour un investisseur en TMI 30 %, mais le risque de taux doit être évalué.',
  ],
  tableTitle: 'Quel intérêt des stratégies avec TMI 30 % ?',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage:
        'Simplicité, choix large, transparence des flux.',
      vigilance:
        'Taux marginal ∼47,2 % : le rendement net peut être réduit de près de moitié par rapport au TDVM brut.',
    },
    {
      level: 'SCPI européennes',
      advantage:
        'Fiscalité nette potentiellement plus favorable (taux effectif 15-25 %), diversification géographique.',
      vigilance:
        'Complexité fiscale, analyse pays par pays, risque de change.',
    },
    {
      level: 'SCPI en nue-propriété',
      advantage:
        'Aucun revenu imposable pendant la durée, décote à l\'entrée, économie d\'impôt significative.',
      vigilance:
        'Absence de revenus temporaire, liquidité limitée, horizon long obligatoire.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage:
        'Capitalisation sans impôt immédiat, fiscalité allégée après 8 ans, transmission.',
      vigilance:
        'Frais UC, choix limité de SCPI, fiscalité aux rachats.',
    },
    {
      level: 'SCPI à crédit',
      advantage:
        'Effet de levier, intérêts potentiellement déductibles, optimisation du rendement net.',
      vigilance:
        'Risque de taux, coût du crédit, engagement de remboursement.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La situation personnelle (horizon, besoin de revenus, objectifs, capacité d\'emprunt) prime sur l\'optimisation fiscale seule.',
  criteriaTitle: 'Critères à croiser avec une TMI à 30 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'Comparer le rendement net après impôt de chaque option : direct, européennes, nue-propriété, assurance-vie, crédit.' },
    { title: 'TOF', text: 'Un TOF faible peut réduire les distributions et amplifier l\'impact de la fiscalité sur le rendement net.' },
    { title: 'Capitalisation', text: 'La taille et la diversification de la SCPI influencent la régularité des distributions et la résilience.' },
    { title: 'Endettement', text: 'Une SCPI endettée peut distribuer moins en période de taux élevés, ce qui réduit le rendement net après impôt.' },
    { title: 'Frais', text: 'Les frais de souscription et de gestion pèsent sur le rendement net, surtout en direct où la fiscalité est immédiate.' },
    { title: 'SCPI européennes', text: 'À TMI 30 %, l\'écart fiscal avec les SCPI françaises peut être déterminant dans le choix du mode d\'investissement.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus la capitalisation en assurance-vie ou le démembrement peuvent compenser la fiscalité immédiate.' },
  ],
  commonErrors: [
    'Comparer des SCPI uniquement sur leur TDVM brut sans retraiter la fiscalité.',
    'Écarter les SCPI européennes par méconnaissance de leur fiscalité nette.',
    'Choisir le démembrement uniquement pour l\'économie d\'impôt sans vérifier la compatibilité avec l\'horizon.',
    'Ignorer les frais UC de l\'assurance-vie qui réduisent l\'avantage fiscal.',
    'Sous-estimer l\'impact des prélèvements sociaux (17,2 %) dans le calcul du rendement net.',
    'Ne pas analyser le TOF, la capitalisation et l\'endettement avant de choisir une stratégie.',
  ],
  practicalCases: [
    {
      title: 'SCPI française en direct — TMI 30 %, TDVM 5 %',
      text: 'Un investisseur en TMI 30 % détient une SCPI française en direct. Après impôt (30 % + 17,2 %) et frais de souscription, le rendement net est d\'environ 2,5 % à 2,8 %. Le TDVM brut de 5 % ne reflète pas le rendement réellement perçu.',
    },
    {
      title: 'SCPI européenne — TMI 30 %, TDVM 4,5 %',
      text: 'Une SCPI européenne investie en Allemagne et aux Pays-Bas affiche un TDVM de 4,5 %. Après crédit d\'impôt étranger, le rendement net peut être proche de ce que produirait une SCPI française à 6 % en TDVM brut. Simulation pédagogique : le différentiel fiscal justifie l\'analyse.',
    },
    {
      title: 'SCPI en nue-propriété — TMI 30 %, 10 ans',
      text: 'Un investisseur en TMI 30 % acquiert en nue-propriété pour 10 ans. Il ne perçoit pas de revenus mais économise l\'impôt à 47,2 % sur les distributions qu\'il n\'aurait pas perçues en pleine propriété. La décote de 25 % compense l\'absence de revenus.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse chaque projet SCPI en comparant les options selon la TMI réelle de l\'investisseur, avec un focus sur le rendement net fiscal plutôt que sur le TDVM brut.',
    'La première étape consiste à calculer le rendement net en direct, puis à le comparer avec les alternatives : SCPI européennes, nue-propriété, assurance-vie, crédit.',
    'La deuxième étape intègre les frais et l\'horizon : plus l\'horizon est long, plus la capitalisation en assurance-vie ou en nue-propriété peut compenser la fiscalité immédiate.',
    'Le comparateur MaximusSCPI et les simulateurs aident à visualiser les écarts de rendement net entre les options, sans constituer une recommandation personnalisée.',
  ],
  conclusionParagraphs: [
    'À TMI 30 %, l\'analyse SCPI ne peut pas se limiter au TDVM brut. Le rendement net après impôt, les SCPI européennes, le démembrement, l\'assurance-vie et le crédit sont des pistes à approfondir selon la situation personnelle.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI, puis validez votre pré-orientation avec le Cabinet Eric Bellaiche pour une simulation adaptée à votre TMI réelle et à votre horizon.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles fiscalement pénalisées à TMI 30 % ?',
      answer: 'Le taux marginal total d\'environ 47,2 % réduit significativement le rendement net par rapport au TDVM brut. Cela ne rend pas les SCPI inintéressantes, mais oblige à comparer les options en rendement net plutôt qu\'en rendement brut.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'À TMI 30 %, les SCPI européennes peuvent améliorer le rendement net grâce à un taux effectif d\'imposition souvent plus faible (15 % à 25 % selon les pays). L\'analyse doit être faite pays par pays.',
    },
    {
      question: 'Le démembrement est-il pertinent à TMI 30 % ?',
      answer: 'Oui, pour les investisseurs sans besoin immédiat de revenus. L\'économie d\'impôt (pas de revenus imposables pendant la période) et la décote à l\'entrée peuvent compenser l\'absence de distributions. L\'horizon doit être compatible.',
    },
    {
      question: 'Assurance-vie ou SCPI en direct ?',
      answer: 'L\'assurance-vie capitalise sans impôt immédiat et offre un abattement après 8 ans. À TMI 30 %, l\'écart de rendement net entre direct et assurance-vie peut justifier le contrat, sous réserve d\'analyser les frais UC.',
    },
    {
      question: 'Comment calculer le rendement net fiscal ?',
      answer: 'Partez du TDVM brut, appliquez la TMI (30 %) et les prélèvements sociaux (17,2 %), déduisez les frais amortis sur l\'horizon. Pour les SCPI européennes, intégrez le crédit d\'impôt. Un conseiller peut réaliser cette simulation.',
    },
    {
      question: 'Les intérêts d\'emprunt sont-ils déductibles ?',
      answer: 'Sous conditions, les intérêts d\'emprunt contracté pour acquérir des parts de SCPI peuvent être déductibles des revenus fonciers. L\'avantage fiscal dépend du montage et de la situation personnelle.',
    },
    {
      question: 'Quels risques analyser ?',
      answer: 'Les mêmes qu\'à toute TMI : TOF, endettement, capitalisation, décote/surcote, frais. À TMI 30 %, l\'impact de la fiscalité sur le rendement net amplifie l\'importance du choix de la SCPI.',
    },
    {
      question: 'Comment MaximusSCPI compare les solutions avec TMI 30 % ?',
      answer: 'Le comparateur affiche les indicateurs clés. Les contenus pédagogiques aident à comparer le rendement net selon les options. Un échange avec le Cabinet Eric Bellaiche permet une analyse personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI',
}
