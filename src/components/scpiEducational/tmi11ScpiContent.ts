import type { ScpiEducationalPageConfig } from './shared'

export const tmi11ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-11',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 11 % : quels critères analyser avant d\'investir ?',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 11 %, l\'enjeu fiscal n\'est pas aussi fort qu\'à TMI 30 % ou 41 %, mais il ne faut pas négliger la fiscalité, les prélèvements sociaux, le rendement net, les SCPI européennes et la diversification. Les SCPI européennes peuvent rester pertinentes pour la diversification géographique et la fiscalité nette potentielle.',
  seoTitle: 'SCPI TMI 11 % : fiscalité, rendement net et SCPI européennes',
  seoDescription:
    'Comprenez comment analyser les SCPI avec une tranche marginale d\'imposition à 11 % : rendement net, SCPI européennes, fiscalité, frais et diversification.',
  shortAnswerTitle: 'Les SCPI sont-elles intéressantes avec une TMI à 11 % ?',
  shortAnswer:
    'Oui. Une TMI à 11 % ne rend pas les SCPI inintéressantes : le rendement net après impôt et prélèvements sociaux reste compétitif par rapport à d\'autres placements. L\'analyse doit porter sur le rendement net plutôt que sur le TDVM brut, intégrer la fiscalité des revenus fonciers et des prélèvements sociaux (17,2 %), et considérer la diversification géographique et sectorielle comme critères complémentaires à l\'optimisation fiscale.',
  keyMessage:
    'Une TMI faible ne dispense pas d\'analyser le rendement net, les frais, la diversification et la qualité de la SCPI.',
  definitionParagraphs: [
    'La tranche marginale d\'imposition (TMI) est le taux auquel sont imposés les derniers euros de revenus du foyer fiscal. En France, la TMI à 11 % concerne les revenus compris entre environ 11 000 € et 28 000 € par part fiscale (seuils 2026 indicatifs).',
    'Les revenus des SCPI françaises détenues en direct sont imposés comme des revenus fonciers : ils s\'ajoutent au revenu global du foyer et sont soumis au barème progressif de l\'impôt sur le revenu, plus les prélèvements sociaux de 17,2 %. Pour une TMI à 11 %, le taux marginal total est donc d\'environ 28,2 % (11 % + 17,2 %).',
    'Le rendement net après impôt pour un investisseur en TMI 11 % reste généralement compétitif par rapport à des placements monétaires ou obligataires, surtout si la SCPI bénéficie d\'un bon TOF, d\'une capitalisation solide et d\'une régularité de distributions.',
    'Les SCPI européennes peuvent présenter un intérêt même à TMI 11 %, non pas pour l\'optimisation fiscale maximale (qui bénéficie davantage aux TMI 30 % et plus), mais pour la diversification géographique, la fiscalité nette potentiellement avantageuse selon les pays d\'investissement, et l\'accès à des marchés immobiliers européens dynamiques.',
    'Le démembrement en nue-propriété est moins pertinent à TMI 11 % si l\'investisseur a besoin de revenus immédiats, car il ne perçoit rien pendant la période. En revanche, si l\'investisseur n\'a pas besoin de revenus, le démembrement conserve son intérêt patrimonial indépendamment de la TMI.',
    'L\'assurance-vie reste une option à considérer, notamment pour l\'horizon de détention, la fiscalité différée et l\'éventuel objectif de transmission. À TMI 11 %, l\'avantage fiscal pur de l\'assurance-vie est moins marqué qu\'à TMI 30 % ou 41 %, mais le cadre patrimonial global peut justifier le choix.',
  ],
  tableTitle: 'Quel intérêt des options avec TMI 11 % ?',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage:
        'Simplicité, choix large, rendement net après impôt (∼11 % + 17,2 %) compétitif par rapport à d\'autres placements.',
      vigilance:
        'Ne pas négliger les frais de souscription et le délai de jouissance. Comparer avec d\'autres enveloppes.',
    },
    {
      level: 'SCPI européennes',
      advantage:
        'Diversification géographique, fiscalité nette potentiellement avantageuse selon pays, intérêt même à TMI 11 %.',
      vigilance:
        'Le gain fiscal pur est moindre qu\'à TMI 30 %, mais la diversification reste un critère pertinent.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage:
        'Capitalisation sans imposition immédiate, cadre successoral, horizon long.',
      vigilance:
        'À TMI 11 %, l\'avantage fiscal est moins marqué. Comparer le rendement net avec le direct.',
    },
    {
      level: 'SCPI en démembrement',
      advantage:
        'Intérêt patrimonial si absence de besoin de revenus. Prix d\'entrée décoté.',
      vigilance:
        'Pertinent uniquement si l\'investisseur n\'a pas besoin de revenus immédiats.',
    },
    {
      level: 'SCPI à crédit',
      advantage:
        'Effet de levier, intérêts potentiellement déductibles des revenus fonciers.',
      vigilance:
        'Le coût du crédit et le risque de taux doivent être compatibles avec le rendement de la SCPI.',
    },
  ],
  tableNote:
    'Ces repères sont indicatifs. La situation personnelle (horizon, besoin de revenus, objectifs) prime sur l\'optimisation fiscale seule.',
  criteriaTitle: 'Critères à croiser avec une TMI à 11 %',
  criteriaCards: [
    { title: 'Rendement net fiscal', text: 'Le TDVM brut doit être retraité de la TMI (11 %) et des prélèvements sociaux (17,2 %). Le rendement net est le chiffre pertinent pour comparer.' },
    { title: 'TOF', text: 'Un TOF élevé garantit une meilleure régularité des distributions, quel que soit le niveau de TMI.' },
    { title: 'Capitalisation', text: 'La taille de la SCPI et sa diversification sectorielle et géographique sont des critères de résilience.' },
    { title: 'Frais', text: 'Des frais de souscription élevés pèsent sur le rendement net, surtout si l\'horizon est court.' },
    { title: 'SCPI européennes', text: 'À TMI 11 %, l\'intérêt des SCPI européennes repose sur la diversification et la fiscalité nette, pas sur l\'optimisation pure.' },
    { title: 'Endettement', text: 'Une SCPI endettée peut réduire les distributions, ce qui impacte le rendement net après impôt.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus l\'impact des frais d\'entrée s\'amortit et plus la fiscalité cumulée compte.' },
  ],
  commonErrors: [
    'Penser que les SCPI sont réservées aux TMI élevées.',
    'Ignorer les prélèvements sociaux (17,2 %) dans le calcul du rendement net.',
    'Négliger les frais de souscription qui pèsent sur le rendement réel.',
    'Écarter les SCPI européennes sous prétexte que la TMI est faible.',
    'Choisir une SCPI uniquement sur son TDVM brut sans calculer le rendement net.',
    'Sous-estimer l\'importance du TOF, de la capitalisation et de l\'endettement.',
  ],
  practicalCases: [
    {
      title: 'SCPI française en direct — TMI 11 %, TDVM 5 %',
      text: 'Un investisseur en TMI 11 % détient une SCPI française en direct avec un TDVM de 5 %. Après impôt (11 % + 17,2 %), le rendement net est d\'environ 3,6 %. Le rendement reste compétitif, mais doit être comparé avec le rendement net d\'autres placements.',
    },
    {
      title: 'SCPI européenne — TMI 11 %, diversification',
      text: 'Un jeune investisseur en TMI 11 % choisit une SCPI européenne pour diversifier son patrimoine sur l\'Allemagne et les Pays-Bas. La fiscalité nette est légèrement plus favorable qu\'en France, mais le critère principal reste la diversification géographique.',
    },
    {
      title: 'SCPI assurance-vie — TMI 11 %, horizon 10 ans',
      text: 'Un investisseur place des SCPI dans une assurance-vie avec un horizon de 10 ans. La capitalisation sans impôt immédiat et l\'abattement après 8 ans peuvent améliorer le rendement net, même si le gain fiscal est moins marqué qu\'à TMI 30 %.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI analyse chaque projet SCPI selon la TMI de l\'investisseur, en comparant le rendement net après impôt des différentes options : direct, européennes, assurance-vie, démembrement, crédit.',
    'La première étape consiste à calculer le rendement net fiscal prévisionnel à partir du TDVM brut, de la TMI et des prélèvements sociaux.',
    'La deuxième étape intègre les frais de souscription et de gestion, amortis sur l\'horizon d\'investissement.',
    'La troisième étape compare les options entre elles : direct, assurance-vie, démembrement, SCPI européennes, crédit. Le comparateur MaximusSCPI facilite cette pré-orientation.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Un échange avec le Cabinet Eric Bellaiche permet de simuler le rendement net selon votre TMI réelle et votre situation patrimoniale.',
  ],
  conclusionParagraphs: [
    'Les SCPI sont accessibles et pertinentes à TMI 11 %, à condition d\'analyser le rendement net après impôt et prélèvements sociaux, la qualité de la SCPI et l\'adéquation avec l\'horizon et les objectifs patrimoniaux.',
    'Utilisez le comparateur MaximusSCPI pour identifier les SCPI à approfondir, puis validez votre analyse avec un conseiller pour une simulation adaptée à votre TMI réelle.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles intéressantes avec une TMI à 11 % ?',
      answer: 'Oui. Le rendement net après impôt (TMI + prélèvements sociaux) reste compétitif par rapport à d\'autres placements. L\'analyse doit porter sur le rendement net et la qualité de la SCPI, pas seulement sur la fiscalité.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes avec TMI 11 % ?',
      answer: 'L\'intérêt des SCPI européennes à TMI 11 % repose davantage sur la diversification géographique que sur l\'optimisation fiscale. La fiscalité nette peut être légèrement plus favorable selon les pays, mais ce n\'est pas le critère principal.',
    },
    {
      question: 'Les prélèvements sociaux changent-ils l\'analyse ?',
      answer: 'Oui, les prélèvements sociaux de 17,2 % s\'appliquent sur les revenus fonciers des SCPI françaises, quel que soit le niveau de TMI. Ils doivent être intégrés dans le calcul du rendement net.',
    },
    {
      question: 'Le démembrement est-il utile avec TMI 11 % ?',
      answer: 'Pas si l\'investisseur a besoin de revenus immédiats. Si l\'investisseur n\'a pas besoin de revenus, le démembrement conserve son intérêt patrimonial (décote, pas de fiscalité pendant la période) indépendamment de la TMI.',
    },
    {
      question: 'Assurance-vie ou SCPI en direct avec TMI 11 % ?',
      answer: 'Cela dépend de l\'horizon, des frais du contrat et des objectifs de transmission. À TMI 11 %, l\'avantage fiscal de l\'assurance-vie est moins marqué, mais le cadre patrimonial global peut justifier le choix.',
    },
    {
      question: 'Comment calculer le rendement net ?',
      answer: 'Partez du TDVM brut, appliquez la TMI (11 %) et les prélèvements sociaux (17,2 %), puis déduisez les frais amortis sur l\'horizon. Un conseiller peut réaliser cette simulation.',
    },
    {
      question: 'Quels critères regarder en priorité ?',
      answer: 'Le TOF pour évaluer la qualité locative, la capitalisation pour apprécier la diversification, le rendement net fiscal pour comparer les options, et les frais pour mesurer l\'impact sur la performance.',
    },
    {
      question: 'Comment MaximusSCPI analyse un projet avec TMI 11 % ?',
      answer: 'Le comparateur affiche le TDVM brut et les indicateurs clés. Les contenus pédagogiques aident à calculer le rendement net selon la TMI. L\'analyse personnalisée relève d\'un échange avec un conseiller.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI',
}
