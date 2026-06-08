import type { ScpiEducationalPageConfig } from './shared'

export const choisirScpiConfig: ScpiEducationalPageConfig = {
  path: '/choisir-scpi',
  badge: 'Méthode & sélection',
  h1: 'Comment choisir une SCPI : méthode complète d\'analyse',
  heroSubtitle:
    'Choisir une SCPI ne se résume pas à comparer des taux de distribution. La décision doit croiser des critères patrimoniaux, fiscaux, immobiliers et réglementaires : rendement net, TOF, capitalisation, endettement, frais, décote ou surcote, liquidité, fiscalité, secteur, géographie et horizon d\'investissement.',
  seoTitle: 'Comment choisir une SCPI : critères, fiscalité, risques et rendement',
  seoDescription:
    'Découvrez comment choisir une SCPI avec une méthode structurée : rendement, TOF, capitalisation, frais, fiscalité, décote, endettement, liquidité et diversification.',
  shortAnswerTitle: 'Comment choisir une SCPI de manière structurée ?',
  shortAnswer:
    'Choisir une SCPI nécessite une approche multicritère : analyser le rendement net après fiscalité, le TOF et son évolution, la capitalisation et la mutualisation, l\'endettement et son coût, les frais de souscription et de gestion, l\'écart entre prix de part et valeur de reconstitution, la liquidité, la qualité de la société de gestion, les secteurs immobiliers, la géographie, la fiscalité applicable selon la TMI et l\'horizon d\'investissement.',
  keyMessage:
    'Choisir une SCPI consiste à construire une cohérence patrimoniale, pas à sélectionner le rendement le plus élevé.',
  definitionParagraphs: [
    'Le rendement net après fiscalité est le point de départ : il ne suffit pas de comparer des TDVM bruts, il faut intégrer l\'imposition (TMI, prélèvements sociaux, PS à 0 % pour les SCPI européennes) et les frais.',
    'Le TOF est un indicateur de la qualité locative. Un TOF en baisse durable peut signaler une difficulté structurelle qui impactera les distributions futures.',
    'La capitalisation reflète la taille de la SCPI et sa capacité à mutualiser les risques. Une SCPI de grande taille n\'est pas automatiquement meilleure, mais elle est généralement plus diversifiée.',
    'L\'endettement peut amplifier la performance en période favorable, mais il augmente le risque en cas de hausse des taux ou de baisse des loyers. La maturité de la dette et son coût moyen doivent être analysés.',
    'Les frais pèsent sur le rendement net : frais de souscription (8-12 %), frais de gestion annuels (10-12 % HT des loyers), frais de cession éventuels. Ils doivent être intégrés dans la comparaison.',
    'La décote ou la surcote par rapport à la valeur de reconstitution est un indicateur de la justesse du prix d\'entrée. Une surcote élevée expose au risque de baisse de prix de part.',
    'La liquidité varie selon le type de capital (variable ou fixe) et les conditions de marché. Elle doit être anticipée en fonction de l\'horizon d\'investissement.',
    'La fiscalité est un critère clé : SCPI françaises (revenus fonciers), SCPI européennes (PS à 0 %), SCPI en assurance-vie, démembrement. Le choix doit tenir compte de la TMI et des objectifs patrimoniaux.',
  ],
  tableTitle: 'Critères pour choisir une SCPI : ce qu\'il faut analyser',
  tableRows: [
    {
      level: 'Rendement net',
      advantage:
        'Comparer le TDVM net de fiscalité et de frais. Le rendement brut n\'est pas suffisant.',
      vigilance:
        'Un rendement élevé peut masquer un risque plus important. Toujours croiser avec les autres critères.',
    },
    {
      level: 'TOF',
      advantage:
        'Mesure la qualité locative et la capacité à générer des loyers.',
      vigilance:
        'Un TOF en baisse durable est un signal fort. Analyser l\'évolution sur 3 à 5 ans.',
    },
    {
      level: 'Capitalisation',
      advantage:
        'Une SCPI plus grande mutualise mieux les risques. Facilite la revente.',
      vigilance:
        'La taille ne garantit ni le rendement ni la qualité de gestion.',
    },
    {
      level: 'Endettement',
      advantage:
        'Un endettement modéré peut améliorer le rendement par effet de levier.',
      vigilance:
        'Un endettement élevé amplifie le risque en cas de hausse des taux ou de baisse des loyers.',
    },
    {
      level: 'Frais',
      advantage:
        'Des frais réduits améliorent le rendement net et la rentabilité à long terme.',
      vigilance:
        'Des frais très faibles peuvent cacher une qualité de gestion moindre. À croiser avec la performance.',
    },
    {
      level: 'Décote / surcote',
      advantage:
        'La comparaison avec la valeur de reconstitution indique si le prix d\'entrée est cohérent.',
      vigilance:
        'Une surcote excessive expose au risque de baisse de prix. Une décote peut signaler une défiance du marché.',
    },
    {
      level: 'Liquidité',
      advantage:
        'Une bonne liquidité permet de sortir plus facilement en cas de besoin.',
      vigilance:
        'La liquidité n\'est jamais garantie. Toujours prévoir un horizon long terme.',
    },
    {
      level: 'Fiscalité',
      advantage:
        'Le choix du régime fiscal peut améliorer significativement le rendement net.',
      vigilance:
        'Ne pas choisir une SCPI uniquement pour sa fiscalité. La qualité du patrimoine reste centrale.',
    },
  ],
  tableNote:
    'Ces critères sont des repères pour une analyse structurée. Aucun critère ne doit être pris isolément. La cohérence d\'ensemble avec la situation personnelle est primordiale.',
  criteriaTitle: 'Étapes pour choisir une SCPI',
  criteriaCards: [
    { title: '1. Définir son objectif', text: 'Revenus complémentaires, transmission, fiscalité, diversification patrimoniale ou préparation de retraite.' },
    { title: '2. Analyser sa fiscalité', text: 'TMI, prélèvements sociaux, exonérations possibles, enveloppe (direct, AV, PER, SCI).' },
    { title: '3. Filtrer par indicateurs', text: 'TOF, capitalisation, endettement, frais, décote/surcote, liquidité, rendement net.' },
    { title: '4. Vérifier le patrimoine', text: 'Secteurs, pays, nombre d\'actifs, nombre de locataires, durée des baux.' },
    { title: '5. Croiser avec l\'horizon', text: 'Un investissement SCPI est recommandé sur 8-10 ans minimum.' },
    { title: '6. Diversifier', text: 'Plusieurs SCPI, secteurs, zones géographiques et modes de détention.' },
    { title: '7. Valider avec un conseiller', text: 'L\'analyse multicritère ne remplace pas un conseil personnalisé conforme MIF2.' },
  ],
  commonErrors: [
    'Choisir une SCPI uniquement sur son rendement affiché.',
    'Ignorer le TOF et son évolution.',
    'Ne pas vérifier l\'écart avec la valeur de reconstitution.',
    'Sous-estimer l\'impact des frais sur le rendement net.',
    'Investir sans tenir compte de sa fiscalité personnelle.',
    'Mettre toute son épargne sur une seule SCPI.',
    'Investir sans horizon long terme.',
  ],
  practicalCases: [
    {
      title: 'Investisseur A — TMI 30 %, besoin de revenus',
      text: 'Un investisseur avec TMI 30 % cherche 5 000 € de revenus annuels complémentaires. Simulation : comparer SCPI française en direct (revenus fonciers imposés TMI + PS) vs SCPI en assurance-vie (flat tax ou barème après 8 ans) vs SCPI européenne (PS 0 %, pas d\'IR). Pré-orientation pédagogique : selon l\'enveloppe et le choix, le rendement net peut varier.',
    },
    {
      title: 'Investisseur B — TMI 11 %, long terme',
      text: 'Un jeune actif avec TMI 11 % souhaite investir 20 000 € pour 15 ans. SCPI française en direct avec frais réduits ou SCPI européenne en assurance-vie. Simulation pédagogique : comparer l\'impact des frais, de la fiscalité et du délai de jouissance.',
    },
    {
      title: 'Investisseur C — diversification, 100 000 €',
      text: 'Un couple avec TMI 30 % dispose de 100 000 €. Simulation : répartir entre 3 SCPI (bureaux prime, logistique, diversifiée) et 2 enveloppes (direct et AV). Pré-orientation pédagogique : analyser la cohérence d\'ensemble.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI propose une grille de lecture multicritère dans son comparateur : TOF, capitalisation, endettement, décote/surcote, frais, rendement. Ces indicateurs sont présentés pour faciliter la pré-orientation pédagogique.',
    'La méthode MaximusSCPI ne remplace pas un conseil personnalisé. Elle structure l\'analyse pour que l\'investisseur puisse poser les bonnes questions.',
    'L\'équipe MaximusSCPI, à travers le Cabinet Eric Bellaiche, accompagne les investisseurs dans leur analyse patrimoniale.',
  ],
  conclusionParagraphs: [
    'Choisir une SCPI est une décision patrimoniale qui ne doit pas se résumer à un seul indicateur. La méthode multicritère permet d\'éviter les biais et de construire une stratégie cohérente.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les indicateurs clés, puis validez votre analyse avec un conseiller pour une approche personnalisée conforme à votre situation.',
  ],
  faqItems: [
    {
      question: 'Quels critères regarder pour choisir une SCPI ?',
      answer: 'Rendement net après fiscalité, TOF, capitalisation, endettement, frais, décote/surcote, liquidité, secteur, géographie, société de gestion et horizon.',
    },
    {
      question: 'Faut-il choisir la SCPI au meilleur rendement ?',
      answer: 'Non. Un rendement élevé peut masquer des risques plus importants. Il doit être croisé avec le TOF, l\'endettement, les frais et la fiscalité.',
    },
    {
      question: 'Comment comparer deux SCPI ?',
      answer: 'Utiliser une grille multicritère : rendement net, TOF, capitalisation, frais, endettement, décote/surcote, liquidité, secteurs, pays.',
    },
    {
      question: 'Quelle importance donner au TOF ?',
      answer: 'Le TOF est un indicateur clé de la qualité locative. Un TOF bas ou en baisse durable est un signal de vigilance important.',
    },
    {
      question: 'La fiscalité doit-elle guider le choix ?',
      answer: 'Oui, elle impacte significativement le rendement net. Le choix de l\'enveloppe (direct, AV, PER) doit être cohérent avec la TMI.',
    },
    {
      question: 'Faut-il diversifier entre plusieurs SCPI ?',
      answer: 'Oui, la diversification sectorielle, géographique et par enveloppe est recommandée pour réduire les risques.',
    },
    {
      question: 'Comment éviter les erreurs fréquentes ?',
      answer: 'Analyser plusieurs critères, ne pas se fier uniquement au rendement, anticiper la fiscalité, diversifier et consulter un conseiller.',
    },
    {
      question: 'Comment MaximusSCPI aide à choisir une SCPI ?',
      answer: 'Le comparateur affiche les indicateurs clés. Les contenus pédagogiques structurent l\'analyse. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Découvrir le comparateur SCPI MaximusSCPI',
}
