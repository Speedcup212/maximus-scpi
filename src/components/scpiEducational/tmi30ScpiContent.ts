import type { ScpiEducationalPageConfig } from './shared'

export const tmi30ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-30',
  badge: 'Fiscalité & stratégie',
  h1: 'SCPI avec TMI 30 % : fiscalité, Europe et démembrement',
  heroSubtitle:
    'À TMI 30 %, la fiscalité devient un critère central dans l\'analyse SCPI. Le rendement brut ne suffit plus : le rendement net après impôt et prélèvements sociaux doit être comparé selon les options : SCPI françaises, européennes, démembrement, assurance-vie, crédit ou SCI à l\'IS. Le taux marginal total peut atteindre environ 47,2 %, ce qui transforme profondément la lecture du rendement.',
  seoTitle: 'SCPI TMI 30 % : rendement net, Europe, démembrement, AV et crédit',
  seoDescription:
    'Analyse complète des SCPI avec une TMI à 30 % : fiscalité des revenus fonciers (IR 30 % + PS), SCPI européennes (crédit d\'impôt), démembrement, assurance-vie, crédit, SCI à l\'IS. Tableau comparatif des solutions, exemples chiffrés et cas pratiques.',
  shortAnswerTitle: 'Pourquoi la TMI 30 % change-t-elle l\'analyse ?',
  shortAnswer:
    'À TMI 30 %, un investisseur en SCPI française en direct supporte un taux marginal total d\'environ 47,2 % (30 % + prélèvements sociaux au taux en vigueur). Le rendement net après impôt peut être significativement inférieur au TDVM brut : un TDVM de 5 % peut se traduire par un rendement net d\'environ 2,6 % avant frais. C\'est pourquoi les alternatives — SCPI européennes (crédit d\'impôt), démembrement temporaire (neutralisation des revenus), assurance-vie (capitalisation différée), crédit (déduction des intérêts) ou SCI à l\'IS (capitalisation société) — doivent être analysées en rendement net fiscal, pas en rendement brut.',
  keyMessage:
    'À TMI 30 %, le rendement affiché doit être retraité de la fiscalité pour éviter une mauvaise lecture. Le rendement net fiscal est le seul indicateur pertinent pour comparer les options.',
  definitionParagraphs: [
    'La TMI à 30 % concerne les foyers dont les revenus imposables se situent entre environ 28 000 € et 75 000 € par part fiscale (seuils 2026 indicatifs, susceptibles d\'être revalorisés). Pour un couple sans enfant, cela correspond à des revenus nets imposables compris entre environ 56 000 € et 150 000 €.',
    'Pour une SCPI française en direct, les revenus fonciers sont ajoutés au revenu global et imposés à la TMI (30 %) majorée des prélèvements sociaux (taux en vigueur). Le taux marginal total atteint environ 47,2 %. Un TDVM de 5 % peut ainsi se traduire par un rendement net d\'environ 2,6 % avant frais de souscription.',
    'À ce niveau de TMI, les SCPI européennes prennent tout leur sens : les revenus étrangers sont imposés au taux effectif du pays source (souvent 15 % à 25 %), avec un crédit d\'impôt en France. Le différentiel fiscal par rapport aux SCPI françaises peut améliorer le rendement net de manière significative, d\'autant plus selon la convention fiscale applicable.',
    'Le démembrement temporaire (nue-propriété) peut être particulièrement pertinent à TMI 30 % : aucun revenu à déclarer pendant la durée du démembrement, ce qui évite l\'imposition au taux marginal de 47,2 %. L\'économie fiscale peut justifier l\'absence temporaire de revenus si l\'horizon est compatible.',
    'L\'assurance-vie reste une option structurante : capitalisation sans imposition immédiate, abattement après 8 ans, fiscalité allégée sur les rachats. À TMI 30 %, l\'écart entre le rendement net en direct et en assurance-vie peut justifier le choix du contrat, sous réserve d\'analyser les frais UC.',
    'Le crédit peut être intéressant si les intérêts d\'emprunt sont déductibles des revenus fonciers (sous conditions). L\'effet de levier combiné à la déductibilité peut améliorer le rendement net pour un investisseur en TMI 30 %, car la déduction d\'intérêts est valorisée à la TMI marginale.',
    'La SCI à l\'IS peut être évoquée avec prudence pour les TMI 30 %. L\'IS peut être plus favorable que l\'IR sur les bénéfices capitalisés, mais la complexité et les frais de structure (comptabilité, juridique) doivent être justifiés par le volume et l\'objectif patrimonial.',
    'Si l\'investisseur est également assujetti à l\'IFI, les parts de SCPI détenues en direct sont généralement imposables. L\'assurance-vie et la nue-propriété peuvent avoir un traitement différent. À vérifier selon la situation.',
  ],
  tableTitle: 'Solution / Intérêt potentiel à TMI 30 % / Complexité / Risque principal',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage:
        'Simplicité, choix large, transparence des flux. Fiscalité connue.',
      vigilance:
        'Rendement net fortement réduit (~47,2 % de prélèvement). Peu d\'optimisation possible. À comparer avec les alternatives.',
    },
    {
      level: 'SCPI européennes',
      advantage:
        'Crédit d\'impôt étranger. Taux effectif souvent 15-25 %. Rendement net amélioré. Diversification géographique.',
      vigilance:
        'Complexité fiscale moyenne. Analyse pays par pays nécessaire. Déclarations spécifiques. Risque de change.',
    },
    {
      level: 'Nue-propriété',
      advantage:
        'Aucun revenu imposable. Économie d\'impôt significative. Décote à l\'entrée. Capitalisation sans fiscalité.',
      vigilance:
        'Absence de revenus totale. Horizon long. Liquidité limitée pendant la période.',
    },
    {
      level: 'Assurance-vie',
      advantage:
        'Capitalisation sans impôt immédiat. Abattement après 8 ans. Fiscalité allégée aux rachats. Transmission.',
      vigilance:
        'Frais UC. Choix limité de SCPI. Fiscalité aux rachats. Taux de reversement variable.',
    },
    {
      level: 'Crédit',
      advantage:
        'Effet de levier. Intérêts déductibles valorisés à 30 %. Amélioration potentielle du rendement net.',
      vigilance:
        'Risque de taux. Cash-flow à vérifier. Endettement personnel. Garanties.',
    },
    {
      level: 'SCI à l\'IS',
      advantage:
        'Imposition à l\'IS (taux potentiellement < 30 %). Capitalisation possible. Amortissement comptable.',
      vigilance:
        'Complexité élevée. Frais de comptabilité. Double imposition IS + IR. Volume suffisant nécessaire.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La situation personnelle (horizon, besoin de revenus, objectifs, capacité d\'emprunt) prime sur l\'optimisation fiscale seule.',
  criteriaTitle: 'Critères à croiser avec une TMI à 30 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'Comparer le rendement net après impôt de chaque option : direct, européennes, nue-propriété, assurance-vie, crédit. C\'est le seul indicateur pertinent.' },
    { title: 'TOF', text: 'Un TOF faible peut réduire les distributions et amplifier l\'impact négatif de la fiscalité sur le rendement net.' },
    { title: 'Capitalisation', text: 'La taille et la diversification de la SCPI influencent la régularité des distributions et la résilience du véhicule.' },
    { title: 'Endettement', text: 'Une SCPI endettée peut distribuer moins en période de taux élevés, réduisant le rendement net après impôt.' },
    { title: 'Frais', text: 'Les frais de souscription et de gestion pèsent sur le rendement net. En direct, la fiscalité immédiate amplifie leur impact.' },
    { title: 'SCPI européennes', text: 'À TMI 30 %, l\'écart fiscal avec les SCPI françaises peut être déterminant. Le crédit d\'impôt améliore le rendement net.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus la capitalisation en AV ou le démembrement peuvent compenser la fiscalité immédiate du direct.' },
    { title: 'IFI', text: 'Vérifier l\'impact IFI des parts de SCPI selon le mode de détention. Direct généralement imposable, AV généralement non.' },
    { title: 'Besoin de revenus', text: 'Avec besoin, le direct ou l\'AV avec rachats sont à privilégier. Sans besoin, nue-propriété ou capitalisation AV sont des pistes.' },
  ],
  commonErrors: [
    'Comparer des SCPI uniquement sur leur TDVM brut sans retraiter la fiscalité personnelle.',
    'Écarter les SCPI européennes par méconnaissance de leur fiscalité nette et du crédit d\'impôt.',
    'Choisir le démembrement uniquement pour l\'économie d\'impôt sans vérifier la compatibilité avec l\'horizon et le besoin de revenus.',
    'Ignorer les frais UC de l\'assurance-vie qui peuvent réduire significativement l\'avantage fiscal attendu.',
    'Sous-estimer l\'impact des prélèvements sociaux (taux en vigueur) dans le calcul du rendement net.',
    'Ne pas analyser le TOF, la capitalisation et l\'endettement avant de choisir une stratégie.',
    'Opter pour une SCI à l\'IS sans vérifier que le volume investi justifie la complexité et les frais.',
  ],
  practicalCases: [
    {
      title: 'Exemple chiffré — 10 000 € de revenus fonciers, TMI 30 %',
      text: 'Revenus fonciers bruts théoriques : 10 000 €. IR à 30 % = 3 000 €. Prélèvements sociaux (taux en vigueur) : environ 1 720 €. Total prélevé : environ 4 720 €. Net perçu : environ 5 280 €. Soit 52,8 % du brut. Simulation pédagogique simplifiée, hors frais de souscription, hors fiscalité complète, hors variation du prix des parts, sans garantie de rendement et sous réserve de la situation personnelle.',
    },
    {
      title: 'SCPI française en direct — TMI 30 %, TDVM 5 %',
      text: 'Un investisseur en TMI 30 % détient une SCPI française en direct. Après impôt (30 % + PS) et frais de souscription amortis, le rendement net est d\'environ 2,5 % à 2,8 %. Le TDVM brut de 5 % ne reflète pas le rendement réellement conservé. Simulation pédagogique : comparer avec le net en AV ou en SCPI européenne.',
    },
    {
      title: 'SCPI européenne — TMI 30 %, crédit d\'impôt',
      text: 'Une SCPI européenne investie en Allemagne et aux Pays-Bas affiche un TDVM de 4,5 %. Après crédit d\'impôt étranger et PS réduits, le rendement net peut être proche de ce que produirait une SCPI française à 6 % en TDVM brut. Simulation pédagogique : le différentiel fiscal justifie l\'analyse approfondie.',
    },
    {
      title: 'Nue-propriété — TMI 30 %, 10 ans',
      text: 'Un investisseur en TMI 30 % acquiert en nue-propriété pour 10 ans. Il ne perçoit pas de revenus mais économise l\'impôt à 47,2 % sur les distributions qu\'il n\'aurait pas perçues en pleine propriété. La décote de 25 % compense l\'absence de revenus. Simulation pédagogique : l\'économie fiscale est significative à cette TMI.',
    },
    {
      title: 'Assurance-vie — TMI 30 %, horizon 10 ans',
      text: 'Un investisseur en TMI 30 % place 100 000 € en SCPI via AV avec 0,75 % de frais UC. Rendement brut SCPI : 5 %. Net après frais UC et SCPI : ~3,7 % capitalisé sans impôt. Après 10 ans, rachat avec abattement. Comparé au direct (~2,6 %), l\'écart peut justifier le choix de l\'AV.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse chaque projet SCPI en comparant les options selon la TMI réelle de l\'investisseur, avec un focus sur le rendement net fiscal plutôt que sur le TDVM brut.',
    'La première étape consiste à calculer le rendement net en direct, puis à le comparer avec les alternatives : SCPI européennes, nue-propriété, assurance-vie, crédit, SCI à l\'IS.',
    'La deuxième étape intègre les frais et l\'horizon : plus l\'horizon est long, plus la capitalisation en assurance-vie ou en nue-propriété peut compenser la fiscalité immédiate du direct.',
    'La troisième étape vérifie la compatibilité avec le besoin de revenus et l\'objectif patrimonial : transmission, retraite, revenus complémentaires.',
    'Le comparateur MaximusSCPI et les simulateurs aident à visualiser les écarts de rendement net entre les options, sans constituer une recommandation personnalisée.',
  ],
  conclusionParagraphs: [
    'À TMI 30 %, l\'analyse SCPI ne peut pas se limiter au TDVM brut. Le rendement net après impôt, les SCPI européennes, le démembrement, l\'assurance-vie et le crédit sont des pistes à approfondir selon la situation personnelle.',
    'Sources et points à vérifier : barème de l\'IR en vigueur, taux des prélèvements sociaux, conventions fiscales des pays concernés, DIC et notes d\'information des SCPI.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI, puis validez votre pré-orientation avec le Cabinet Eric Bellaiche pour une simulation adaptée à votre TMI réelle et à votre horizon.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles fiscalement pénalisées à TMI 30 % ?',
      answer: 'Le taux marginal total d\'environ 47,2 % réduit significativement le rendement net par rapport au TDVM brut. Cela ne rend pas les SCPI inintéressantes, mais oblige à comparer les options en rendement net.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'À TMI 30 %, les SCPI européennes peuvent améliorer le rendement net grâce au crédit d\'impôt et à un taux effectif souvent plus faible (15-25 % selon les pays). L\'analyse doit être faite pays par pays.',
    },
    {
      question: 'Le démembrement est-il pertinent à TMI 30 % ?',
      answer: 'Oui, pour les investisseurs sans besoin immédiat de revenus. L\'économie d\'impôt (47,2 % non prélevés) et la décote à l\'entrée peuvent compenser l\'absence de distributions sur la période.',
    },
    {
      question: 'Assurance-vie ou SCPI en direct ?',
      answer: 'L\'assurance-vie capitalise sans impôt immédiat et offre un abattement après 8 ans. À TMI 30 %, l\'écart de rendement net entre direct et AV peut justifier le contrat, sous réserve des frais UC.',
    },
    {
      question: 'Comment calculer le rendement net fiscal ?',
      answer: 'Partez du TDVM brut, appliquez la TMI (30 %) et les prélèvements sociaux, déduisez les frais amortis. Pour les SCPI européennes, intégrez le crédit d\'impôt. Un conseiller peut réaliser cette simulation.',
    },
    {
      question: 'Les intérêts d\'emprunt sont-ils déductibles ?',
      answer: 'Sous conditions, les intérêts d\'emprunt pour acquérir des parts de SCPI peuvent être déductibles des revenus fonciers. La déduction est valorisée à la TMI (30 %), ce qui renforce l\'effet de levier.',
    },
    {
      question: 'La SCI à l\'IS est-elle pertinente à TMI 30 % ?',
      answer: 'Potentiellement, mais la complexité et les frais doivent être justifiés par un volume suffisant. À TMI 30 %, l\'écart entre IS et IR est moins marqué qu\'à TMI 41 % ou 45 %.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Les parts de SCPI en direct sont généralement imposables à l\'IFI. En assurance-vie ou en nue-propriété, le traitement peut différer. À vérifier selon la situation et la réglementation en vigueur.',
    },
    {
      question: 'Quels risques analyser à TMI 30 % ?',
      answer: 'Les mêmes qu\'à toute TMI : TOF, endettement, capitalisation, décote/surcote, frais. L\'impact de la fiscalité amplifie l\'importance du choix de la SCPI.',
    },
    {
      question: 'Comment MaximusSCPI compare les solutions avec TMI 30 % ?',
      answer: 'Le comparateur affiche les indicateurs clés. Les contenus pédagogiques aident à comparer le rendement net selon les options. Un échange avec le Cabinet Eric Bellaiche permet une analyse personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les scénarios SCPI avec une TMI à 30 %',
}
