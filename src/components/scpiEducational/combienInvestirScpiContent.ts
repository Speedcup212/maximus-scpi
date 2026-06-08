import type { ScpiEducationalPageConfig } from './shared'

export const combienInvestirScpiConfig: ScpiEducationalPageConfig = {
  path: '/combien-investir-scpi',
  badge: 'Montant &calibrage',
  h1: 'Combien investir en SCPI selon son patrimoine ?',
  heroSubtitle:
    'Il n\'existe pas de montant universel pour investir en SCPI. Le montant dépend de la situation patrimoniale, de la liquidité disponible, de l\'horizon, du besoin de revenus, de la fiscalité et de la capacité à accepter une perte en capital ou une revente longue.',
  seoTitle: 'Combien investir en SCPI : montant, diversification, risque et fiscalité',
  seoDescription:
    'Comprenez combien investir en SCPI selon votre patrimoine, votre fiscalité, votre horizon, votre besoin de revenus, votre liquidité et votre tolérance au risque.',
  shortAnswerTitle: 'Quel montant investir en SCPI ?',
  shortAnswer:
    'Le montant à investir en SCPI dépend de plusieurs facteurs : la part du patrimoine financier que l\'on souhaite allouer à l\'immobilier, la liquidité de précaction à conserver, l\'horizon d\'investissement (8-10 ans minimum recommandé), le besoin de revenus complémentaires, la fiscalité personnelle et la capacité à diversifier. Il n\'existe pas de montant unique valable pour tous.',
  keyMessage:
    'Le bon montant n\'est pas celui qui maximise le rendement affiché, mais celui qui reste cohérent avec la liquidité, la fiscalité, l\'horizon et les objectifs patrimoniaux.',
  definitionParagraphs: [
    'Le montant minimum d\'entrée en SCPI varie selon les sociétés de gestion : généralement entre 1 000 € et 5 000 €, parfois plus pour certaines SCPI. En assurance-vie, le seuil peut être plus bas.',
    'La part du patrimoine financier allouée aux SCPI dépend de la situation personnelle. Une règle de prudence consiste à ne pas immobiliser toute son épargne dans des actifs non liquides.',
    'La liquidité de précaution doit être conservée : il est déconseillé d\'investir en SCPI des sommes dont on pourrait avoir besoin à court terme (moins de 5-8 ans).',
    'L\'investissement à crédit peut amplifier la capacité d\'investissement, mais il augmente le risque : les intérêts courent avant les premiers revenus, et le délai de jouissance peut impacter le cash-flow de première année.',
    'La fiscalité personnelle influence le montant à investir : plus la TMI est élevée, plus l\'enveloppe (assurance-vie, PER) et le choix des SCPI (européennes, démembrement) sont importants.',
    'La diversification sectorielle et géographique peut nécessiter un montant plus important pour répartir l\'investissement entre plusieurs SCPI.',
  ],
  tableTitle: 'Montant à investir en SCPI : repères indicatifs',
  tableRows: [
    {
      level: 'Moins de 10 000 €',
      advantage:
        'Accès possible via le minimum de souscription de certaines SCPI ou via une assurance-vie.',
      vigilance:
        'Diversification très limitée. Privilégier une SCPI diversifiée de qualité plutôt que plusieurs SCPI.',
    },
    {
      level: '10 000 € à 50 000 €',
      advantage:
        'Possibilité de répartir entre 1 et 3 SCPI. Choix entre direct, AV ou mix.',
      vigilance:
        'Vérifier les frais de souscription qui pèsent proportionnellement plus sur les petits montants.',
    },
    {
      level: '50 000 € à 150 000 €',
      advantage:
        'Diversification possible entre 3 et 5 SCPI. Secteurs, géographies et enveloppes.',
      vigilance:
        'Éviter la sur-diversification. Chaque SCPI doit représenter un montant significatif.',
    },
    {
      level: 'Plus de 150 000 €',
      advantage:
        'Allocation patrimoniale complète : 5 à 8 SCPI, secteurs variés, enveloppes multiples.',
      vigilance:
        'Veiller à la cohérence d\'ensemble et à la lisibilité du portefeuille. Consulter un conseiller.',
    },
  ],
  tableNote:
    'Ces repères sont des simulations indicatives. Le montant réel doit être adapté à la situation personnelle, à l\'horizon et aux objectifs.',
  criteriaTitle: 'Facteurs à prendre en compte pour déterminer le montant',
  criteriaCards: [
    { title: 'Patrimoine total', text: 'Évaluer la part de l\'immobilier (direct + SCPI) dans le patrimoine global. Éviter la sur-concentration.' },
    { title: 'Liquidité disponible', text: 'Ne pas immobiliser toute son épargne. Conserver une épargne de précaution accessible à court terme.' },
    { title: 'Horizon', text: 'Plus l\'horizon est long, plus le montant peut être important. Éviter les SCPI si sortie prévue avant 8 ans.' },
    { title: 'Besoin de revenus', text: 'Le montant investi détermine le niveau de revenus complémentaires. Simuler le rendement net attendu.' },
    { title: 'Fiscalité', text: 'Adapter le montant et l\'enveloppe à la TMI. L\'impact fiscal peut modifier le rendement net de manière significative.' },
    { title: 'Crédit', text: 'L\'effet de levier peut augmenter la capacité d\'investissement, mais il amplifie aussi le risque.' },
  ],
  commonErrors: [
    'Investir toute son épargne disponible en SCPI.',
    'Investir un montant trop faible pour permettre une diversification suffisante.',
    'Ne pas tenir compte de la liquidité de précaution.',
    'Investir avec un horizon trop court.',
    'Sous-estimer l\'impact des frais de souscription sur le montant net investi.',
    'Confondre capacité d\'investissement et somme à immobiliser.',
  ],
  practicalCases: [
    {
      title: 'Jeune actif — 15 000 € à investir',
      text: 'Un jeune actif avec TMI 11 % souhaite investir 15 000 €. Simulation : 1 SCPI diversifiée en direct ou en AV. Montant suffisant pour une exposition de qualité mais diversification limitée. Pré-orientation pédagogique à valider.',
    },
    {
      title: 'Couple — 80 000 € à investir',
      text: 'Un couple TMI 30 % dispose de 80 000 €. Simulation : 3 SCPI (diversifiée France, logistique ou santé, SCPI européenne). Enveloppes : direct et AV. Simulation indicative.',
    },
    {
      title: 'Investisseur confirmé — 200 000 € à investir',
      text: 'Un investisseur TMI 41 % dispose de 200 000 €. Simulation : 5 à 6 SCPI, secteurs variés, enveloppes multiples (direct, AV, PER). Pré-orientation à valider selon sa situation.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI aide à calibrer un projet d\'investissement en SCPI à travers ses contenus pédagogiques. Le montant est abordé comme un élément de la stratégie patrimoniale.',
    'La méthode MaximusSCPI consiste à analyser la situation globale avant de déterminer un montant : patrimoine, liquidité, horizon, fiscalité, objectifs.',
    'MaximusSCPI ne constitue pas une recommandation personnalisée. Le calibrage final doit être validé avec un conseiller.',
  ],
  conclusionParagraphs: [
    'Le montant à investir en SCPI dépend de multiples facteurs personnels. Il n\'existe pas de réponse universelle. La cohérence patrimoniale prime sur la recherche du rendement maximal.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les SCPI, puis validez votre projet avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Quel montant minimum investir en SCPI ?',
      answer: 'Le minimum varie de 1 000 € à 5 000 € selon les SCPI, parfois plus. En assurance-vie, le seuil peut être plus bas.',
    },
    {
      question: 'Peut-on investir 10 000 € en SCPI ?',
      answer: 'Oui, c\'est un montant accessible. La diversification sera limitée à 1 ou 2 SCPI. Privilégier une SCPI de qualité.',
    },
    {
      question: 'Combien de SCPI faut-il avec 50 000 € ?',
      answer: '2 à 3 SCPI maximum. Répartir entre secteurs ou enveloppes selon les objectifs.',
    },
    {
      question: 'Faut-il investir toute son épargne ?',
      answer: 'Non. Il est déconseillé d\'immobiliser toute son épargne dans des actifs non liquides. Conserver une épargne de précaution.',
    },
    {
      question: 'Quelle part du patrimoine mettre en SCPI ?',
      answer: 'Cela dépend de la situation. Une règle de prudence : ne pas dépasser 30-50 % de l\'épargne financière dans des actifs immobiliers non cotés.',
    },
    {
      question: 'Le crédit change-t-il le montant à investir ?',
      answer: 'Oui, le crédit peut augmenter la capacité d\'investissement, mais il augmente aussi le risque. Simuler le cash-flow avant d\'investir.',
    },
    {
      question: 'Comment intégrer la fiscalité ?',
      answer: 'Simuler le rendement net après impôt selon la TMI. Adapter le montant et l\'enveloppe en fonction.',
    },
    {
      question: 'Comment MaximusSCPI aide à calibrer un projet ?',
      answer: 'Les contenus pédagogiques et le comparateur fournissent les repères pour analyser. MaximusSCPI ne constitue pas une recommandation personnalisée.',
    },
  ],
  comparateurCtaLabel: 'Découvrir le comparateur SCPI MaximusSCPI',
}
