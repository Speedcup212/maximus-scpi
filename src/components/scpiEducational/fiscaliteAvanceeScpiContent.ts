import type { ScpiEducationalPageConfig } from './shared'

export const fiscaliteAvanceeScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-fiscalite/',
  badge: 'Guide pilier — Fiscalité',
  h1: 'Fiscalité SCPI : comprendre l\'imposition avant d\'investir',
  heroSubtitle:
    'La fiscalité d\'une SCPI dépend de la nature des revenus, de leur pays d\'origine, du mode de détention et de la situation du foyer. Le bon indicateur n\'est pas un taux fiscal standard, mais le revenu net réellement conservé dans chaque scénario.',
  seoTitle: 'Fiscalité SCPI : revenus fonciers, Europe, IFI, AV et rendement net',
  seoDescription:
    'Guide fiscalité SCPI : revenus fonciers, prélèvements sociaux, TMI, revenus étrangers, assurance-vie, IFI, démembrement, crédit et SCI à l\'IS.',
  shortAnswerTitle: 'Comment raisonner correctement sur la fiscalité d\'une SCPI ?',
  shortAnswer:
    'Il faut d\'abord identifier la nature des revenus et leur pays d\'origine, puis le mode de détention : direct, assurance-vie, démembrement, crédit ou société. La TMI n\'est qu\'un taux marginal et ne doit pas être appliquée mécaniquement à tous les flux. Les revenus étrangers suivent les conventions fiscales pays par pays, l\'assurance-vie a sa propre fiscalité de rachat et peut rester concernée par l\'IFI, et une SCI à l\'IS ne permet pas d\'amortir des parts de SCPI détenues en pleine propriété.',
  keyMessage:
    'La fiscalité SCPI doit être modélisée flux par flux et pays par pays. Toute formule unique du type « rendement brut × (1 − TMI − PS) » est seulement une approximation et peut être trompeuse.',
  definitionParagraphs: [
    'Les distributions d\'une SCPI française peuvent comprendre plusieurs catégories fiscales. La composante immobilière française relève généralement des revenus fonciers chez un associé personne physique détenant les parts en direct, sous réserve de sa situation et des autres composantes éventuelles.',
    'Les revenus fonciers français sont soumis au barème progressif de l\'impôt sur le revenu et, en principe, aux prélèvements sociaux selon les règles en vigueur. La TMI indique le taux de la dernière tranche, pas le taux moyen du foyer.',
    'Les revenus immobiliers étrangers sont traités selon les conventions fiscales conclues entre la France et les pays concernés. La double imposition peut être neutralisée selon différentes méthodes, notamment crédit d\'impôt ou mécanisme de taux effectif. Il n\'existe pas de fiscalité européenne unique.',
    'La société de gestion fournit chaque année une information fiscale destinée aux associés. Cette fiche fiscale annuelle, rapprochée des textes officiels, est la base opérationnelle de la déclaration des revenus étrangers et des éventuels crédits d\'impôt.',
    'En assurance-vie, les unités de compte investies en SCPI suivent la fiscalité du contrat lors des rachats. Le souscripteur n\'est pas imposé chaque année à l\'IR sur les distributions internes du support, mais les frais, la valorisation, la fiscalité de rachat et l\'IFI éventuel doivent être intégrés.',
    'En nue-propriété, le nu-propriétaire ne reçoit pas les distributions attribuées à l\'usufruitier pendant le démembrement. Il faut distinguer l\'absence de revenu de la période d\'une prétendue économie fiscale garantie et vérifier séparément le traitement IFI selon l\'origine du démembrement.',
    'Une SCI soumise à l\'IS peut détenir des parts de SCPI et capitaliser son résultat après IS. Les parts de SCPI détenues en pleine propriété sont toutefois des titres non amortissables ; il faut intégrer les coûts de structure, la fiscalité d\'une distribution et celle de la sortie.',
    'Le crédit peut rendre certaines charges financières déductibles des revenus fonciers lorsque les conditions sont réunies. La déductibilité ne transforme pas un crédit coûteux en opération rentable : coût total, cash-flow et risque patrimonial restent déterminants.',
    'L\'IFI s\'apprécie à partir de la fraction immobilière taxable. Le direct, l\'assurance-vie, le démembrement et les sociétés obéissent à des règles différentes qui doivent être vérifiées au cas par cas.',
    'La fiscalité de la revente et de la transmission doit être distinguée de la fiscalité des revenus courants. Une stratégie cohérente simule l\'entrée, la détention et la sortie.',
  ],
  tableTitle: 'Mode de détention et principaux points fiscaux',
  tableRows: [
    {
      level: 'SCPI en direct — France',
      advantage: 'Lecture fiscale relativement directe des revenus immobiliers français et déduction possible de certaines charges sous conditions.',
      vigilance: 'IR, prélèvements sociaux, IFI et fiscalité de cession doivent être intégrés séparément.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Diversification et traitement fiscal pouvant différer de la France selon les conventions.',
      vigilance: 'Méthode pays par pays, fiche fiscale annuelle et déclaration plus complexe. Ne pas généraliser le crédit d\'impôt.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage: 'Capitalisation dans le contrat et fiscalité propre aux rachats.',
      vigilance: 'Frais UC, distribution créditée, supports disponibles et IFI potentiel à vérifier.',
    },
    {
      level: 'SCPI en nue-propriété',
      advantage: 'Pas de distributions attribuées au nu-propriétaire pendant le démembrement.',
      vigilance: 'Liquidité réduite, clé à analyser et IFI dépendant de l\'origine du démembrement.',
    },
    {
      level: 'SCPI via SCI à l\'IS',
      advantage: 'Capitalisation possible au niveau de la société après IS.',
      vigilance: 'Pas d\'amortissement des parts en pleine propriété ; coûts, distribution et sortie à modéliser.',
    },
    {
      level: 'SCPI à crédit',
      advantage: 'Effet de levier et certaines charges financières potentiellement déductibles sous conditions.',
      vigilance: 'Coût du crédit, cash-flow, garanties et risque de taux peuvent annuler l\'avantage fiscal.',
    },
  ],
  tableNote:
    'Les règles fiscales évoluent et dépendent du dossier. La fiche fiscale annuelle de la société de gestion, le contrat éventuel et les textes officiels doivent être vérifiés pour l\'année concernée.',
  criteriaTitle: 'Critères à croiser avec la fiscalité',
  criteriaCards: [
    { title: 'TMI et taux moyen', text: 'La TMI mesure la dernière tranche. Le taux moyen et le revenu fiscal global peuvent conduire à un résultat différent d\'un calcul marginal simplifié.' },
    { title: 'Nature des revenus', text: 'Revenus fonciers, financiers, plus-values ou revenus étrangers ne suivent pas nécessairement le même régime.' },
    { title: 'Pays d\'origine', text: 'Les conventions fiscales déterminent la méthode d\'élimination de la double imposition.' },
    { title: 'Mode de détention', text: 'Direct, assurance-vie, démembrement, société ou crédit modifient la chronologie et parfois la nature de l\'imposition.' },
    { title: 'Prélèvements sociaux', text: 'Leur application dépend de la nature et de l\'origine des revenus ; ne pas les appliquer automatiquement à tous les flux.' },
    { title: 'IFI', text: 'Calculer la fraction immobilière taxable selon le mode de détention et les informations officielles disponibles.' },
    { title: 'Frais', text: 'Souscription, gestion, enveloppe, crédit et coûts de structure doivent être intégrés avant de comparer deux scénarios fiscaux.' },
    { title: 'Sortie', text: 'Plus-value, rachat d\'assurance-vie, cession de parts ou liquidation d\'une société peuvent modifier fortement le résultat global.' },
  ],
  commonErrors: [
    'Confondre TMI et taux moyen d\'imposition.',
    'Calculer systématiquement le net avec la formule rendement brut × (1 − TMI − prélèvements sociaux).',
    'Présenter toutes les SCPI européennes comme bénéficiant du même crédit d\'impôt.',
    'Supposer que les prélèvements sociaux ont le même traitement sur tous les revenus étrangers.',
    'Présenter l\'assurance-vie comme automatiquement hors IFI.',
    'Présenter la nue-propriété comme une économie fiscale sans valoriser les distributions abandonnées.',
    'Supposer qu\'une SCI à l\'IS permet d\'amortir des parts de SCPI détenues en pleine propriété.',
    'Analyser la fiscalité des revenus sans modéliser la sortie et les frais.',
  ],
  practicalCases: [
    {
      title: 'Revenus français en direct',
      text: 'Le calcul net distingue revenus fonciers, charges éventuelles, IR, prélèvements sociaux et situation globale du foyer. La TMI sert d\'indicateur marginal mais ne remplace pas le calcul fiscal.',
    },
    {
      title: 'SCPI multi-pays',
      text: 'La fiche fiscale ventile les revenus par État. Chaque ligne est rattachée à la convention concernée avant de calculer l\'imposition française et l\'éventuel crédit d\'impôt.',
    },
    {
      title: 'Assurance-vie',
      text: 'La comparaison intègre les frais du contrat, la part des distributions créditée, la fiscalité du rachat et l\'IFI éventuel au lieu de considérer l\'enveloppe comme simplement exonérée.',
    },
    {
      title: 'Nue-propriété',
      text: 'Le nu-propriétaire ne perçoit pas les distributions de la période. La clé de démembrement est comparée à cette absence de revenus, à la liquidité et à la valeur future des parts.',
    },
    {
      title: 'SCI à l\'IS',
      text: 'La société acquitte l\'IS sur son résultat selon les règles applicables. Les parts de SCPI en pleine propriété ne sont pas amorties ; la comparaison inclut la distribution et la sortie.',
    },
  ],
  methodParagraphs: [
    'Identifier le mode de détention, la nature des revenus et leur pays d\'origine.',
    'Récupérer la fiche fiscale annuelle et les données contractuelles pertinentes.',
    'Calculer séparément les revenus français et étrangers selon les règles applicables.',
    'Distinguer TMI, taux moyen et prélèvements sociaux réellement dus.',
    'Intégrer les frais, les charges déductibles éventuelles, l\'IFI et la liquidité.',
    'Simuler la fiscalité de sortie : cession, rachat, distribution ou liquidation selon le véhicule.',
    'Comparer les scénarios sur le même horizon et avec des hypothèses de performance cohérentes.',
    'Faire vérifier les points complexes ou internationaux par le professionnel qui suit la déclaration ou la structure.',
  ],
  conclusionParagraphs: [
    'La fiscalité SCPI n\'est pas une formule unique. Elle résulte de la combinaison du foyer fiscal, de la nature des revenus, des pays et du mode de détention.',
    'Un avantage fiscal apparent peut disparaître après les frais, l\'IFI, la fiscalité de sortie ou une hypothèse erronée sur les revenus étrangers.',
    'MaximusSCPI doit donc privilégier des simulations conditionnelles et sourcées plutôt que des recommandations automatiques par TMI.',
  ],
  faqItems: [
    {
      question: 'Comment sont fiscalisés les revenus de SCPI ?',
      answer: 'Cela dépend de la nature des revenus, de leur pays d\'origine et du mode de détention. Les revenus fonciers français en direct suivent généralement le barème progressif et les prélèvements sociaux.',
    },
    {
      question: 'La TMI suffit-elle pour calculer le rendement net ?',
      answer: 'Non. La TMI est un taux marginal. Il faut intégrer le taux moyen, les charges, les prélèvements sociaux, les revenus étrangers et le mode de détention.',
    },
    {
      question: 'Les SCPI européennes ont-elles toutes le même régime ?',
      answer: 'Non. Le traitement dépend des conventions fiscales conclues avec chaque pays et de la nature du revenu.',
    },
    {
      question: 'Les prélèvements sociaux sont-ils dus sur tous les revenus étrangers ?',
      answer: 'Il ne faut pas l\'affirmer de manière générale. Leur application doit être vérifiée selon le revenu, la convention et la situation du contribuable.',
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles hors IFI ?',
      answer: 'Non, pas automatiquement. Dans un contrat rachetable, la fraction de valeur représentative d\'actifs immobiliers imposables peut entrer dans l\'assiette IFI.',
    },
    {
      question: 'Le démembrement supprime-t-il la fiscalité ?',
      answer: 'Le nu-propriétaire ne reçoit pas les distributions de la période. Il ne faut pas assimiler cette absence de revenu à une exonération générale ni oublier l\'IFI et la fiscalité future.',
    },
    {
      question: 'Une SCI à l\'IS peut-elle amortir les parts de SCPI ?',
      answer: 'Non pour les parts détenues en pleine propriété. Elles sont des titres non amortissables ; l\'usufruit temporaire relève d\'un cas différent.',
    },
    {
      question: 'Les intérêts d\'emprunt sont-ils déductibles ?',
      answer: 'Certaines charges financières peuvent être déductibles des revenus fonciers lorsqu\'elles remplissent les conditions légales. Le traitement dépend du financement et de son affectation.',
    },
    {
      question: 'Qu\'est-ce que le taux effectif ?',
      answer: 'C\'est l\'un des mécanismes prévus par certaines conventions pour tenir compte de revenus étrangers dans le calcul du taux applicable aux autres revenus français. Il ne s\'applique pas uniformément à tous les pays.',
    },
    {
      question: 'Comment MaximusSCPI analyse la fiscalité ?',
      answer: 'MaximusSCPI ventile les flux par nature et par pays, compare les modes de détention et distingue les données certaines des hypothèses à vérifier avant de calculer un net fiscal.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur fiscalité et leur rendement',
}
