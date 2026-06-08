import type { ScpiEducationalPageConfig } from './shared'

export const sciIsFiscaliteScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-sci-is-fiscalite/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI en SCI à l\'IS : fiscalité, avantages et limites',
  heroSubtitle:
    'Détenir des SCPI via une SCI à l\'IS peut être une piste patrimoniale ou entrepreneuriale, mais ce n\'est pas une solution automatique. Ce montage ajoute une couche fiscale, comptable et juridique qui doit être justifiée par l\'objectif patrimonial.',
  seoTitle: 'SCPI SCI à l\'IS : fiscalité, amortissement, trésorerie et risques',
  seoDescription:
    'Comprenez la détention de SCPI via une SCI à l\'IS : fiscalité société, trésorerie, capitalisation, distribution, plus-value, frais, limites et points de vigilance.',
  shortAnswerTitle: 'Pourquoi détenir des SCPI via une SCI à l\'IS ?',
  shortAnswer:
    'La SCI à l\'IS permet de capitaliser les revenus des SCPI dans une société avec une imposition à l\'IS, potentiellement plus faible que l\'IR selon la TMI. Elle offre aussi la possibilité d\'amortir comptablement le patrimoine et de différer la distribution des revenus. En contrepartie, ce montage ajoute des frais de comptabilité, une complexité juridique et une double imposition lors de la redistribution.',
  keyMessage:
    'La SCI à l\'IS peut être utile dans certains montages patrimoniaux, mais elle ajoute une couche fiscale, comptable et juridique qui doit être justifiée.',
  definitionParagraphs: [
    'Une Société Civile Immobilière (SCI) soumise à l\'Impôt sur les Sociétés (IS) est une société qui peut détenir des parts de SCPI. Contrairement à une SCI à l\'IR (transparence fiscale), la SCI à l\'IS est imposée sur ses bénéfices au taux de l\'IS.',
    'Les revenus des SCPI sont perçus par la SCI et imposés à l\'IS. Si la SCI réalise des bénéfices, elle peut les conserver (capitalisation) ou les distribuer aux associés sous forme de dividendes.',
    'La SCI à l\'IS peut amortir comptablement la valeur des parts de SCPI, ce qui réduit le résultat imposable et peut générer de la trésorerie non imposée à l\'IS.',
    'La distribution des bénéfices aux associés est imposée dans leur catégorie de revenus (dividendes), avec application de la flat tax ou du barème progressif selon l\'option choisie.',
    'En cas de revente des parts de SCPI par la SCI, la plus-value est imposée à l\'IS (sauf régime des plus-values à long terme sous conditions). La revente des parts de la SCI elle-même est soumise au régime des plus-values mobilières.',
    'Ce montage est généralement plus adapté à un objectif de capitalisation long terme qu\'à un objectif de revenus immédiats. Les frais de comptabilité et de structure doivent être mis en balance avec les avantages fiscaux attendus.',
  ],
  tableTitle: 'Éléments à analyser pour une SCI à l\'IS',
  tableRows: [
    {
      level: 'Fiscalité courante',
      advantage: 'Imposition à l\'IS (taux potentiellement inférieur à l\'IR selon les bénéfices). Amortissement comptable possible.',
      vigilance: 'Si les bénéfices sont élevés, l\'IS peut dépasser l\'IR. Taux progressif à vérifier.',
    },
    {
      level: 'Distribution',
      advantage: 'Flexibilité : possibilité de capitaliser ou de distribuer.',
      vigilance: 'Distribution imposée chez l\'associé (flat tax ou barème).',
    },
    {
      level: 'Plus-value',
      advantage: 'Imposition à l\'IS en cas de revente par la SCI.',
      vigilance: 'Taux d\'IS applicable. Abattement pour durée de détention limité.' ,
    },
    {
      level: 'Comptabilité',
      advantage: 'Structure professionnelle. Suivi précis.',
      vigilance: 'Frais de comptabilité annuels. Déclaration fiscale obligatoire.',
    },
    {
      level: 'Financement',
      advantage: 'L\'emprunt peut être souscrit par la SCI. Intérêts déductibles.',
      vigilance: 'Capacité d\'endettement de la société. Garanties personnelles souvent demandées.',
    },
    {
      level: 'Transmission',
      advantage: 'Donation de parts de SCI possible. Aménagement de la transmission.',
      vigilance: 'Valorisation des parts à justifier. Droit d\'enregistrement.',
    },
    {
      level: 'Horizon',
      advantage: 'Adapté à un objectif long terme avec capitalisation.',
      vigilance: 'Peu pertinent pour un besoin de revenus immédiats. Complexité à gérer.',
    },
  ],
  tableNote:
    'Ce tableau présente des éléments d\'analyse. La pertinence de la SCI à l\'IS dépend de la situation patrimoniale et des objectifs.',
  criteriaTitle: 'Critères à croiser pour évaluer une SCI à l\'IS',
  criteriaCards: [
    { title: 'Objectif', text: 'Capitalisation long terme ou distribution ? L\'IS est plus adapté à la capitalisation.' },
    { title: 'TMI', text: 'Plus la TMI est élevée, plus l\'IS peut être favorable vs l\'IR. À comparer.' },
    { title: 'Volume investi', text: 'Un volume suffisant est nécessaire pour justifier les frais de structure et de comptabilité.' },
    { title: 'Horizon', text: 'Un horizon long (> 10 ans) est généralement nécessaire pour amortir les coûts de la structure.' },
    { title: 'Transmission', text: 'La SCI à l\'IS peut faciliter la transmission des parts, mais avec des contraintes spécifiques.' },
    { title: 'Complexité', text: 'Frais comptables, déclarations fiscales, obligations juridiques : ne pas sous-estimer la charge administrative.' },
  ],
  commonErrors: [
    'Croire que l\'IS est toujours plus favorable que l\'IR.',
    'Sous-estimer les frais de comptabilité et de structure.',
    'Oublier la double imposition (IS + impôt sur les dividendes).',
    'Choisir la SCI à l\'IS sans objectif patrimonial clair.',
    'Négliger les conséquences en cas de revente des parts de la SCI.',
  ],
  practicalCases: [
    {
      title: 'SCI à l\'IS avec capitalisation',
      text: 'Un investisseur apporte 200 000 € à une SCI à l\'IS pour acquérir des SCPI. Rendement brut : 6 %. Revenus : 12 000 €/an. IS sur bénéfices (après amortissement) : réduit. Trésorerie capitalisée dans la SCI.',
    },
    {
      title: 'SCI à l\'IS avec distribution',
      text: 'Même SCI mais les bénéfices sont distribués aux associés. Après IS, la distribution est soumise à la flat tax (30 %) ou au barème. Le coût fiscal global peut être proche de l\'IR selon les montants.',
    },
    {
      title: 'SCI à l\'IS vs direct TMI 45 %',
      text: 'Un investisseur à TMI 45 % compare : direct (IR 45 % + PS) vs SCI à l\'IS (IS + flat tax sur distribution). Selon les hypothèses, la SCI peut améliorer le rendement net, mais pas nécessairement.',
    },
  ],
  methodParagraphs: [
    'Définir l\'objectif patrimonial : capitalisation, distribution, transmission.',
    'Comparer le coût fiscal global (IS + impôt sur distribution) vs IR direct.',
    'Estimer les frais de structure (comptabilité, juridique) et les intégrer dans l\'analyse.',
    'Vérifier la capacité d\'endettement de la SCI et les garanties demandées.',
    'Analyser l\'impact sur la transmission et la fiscalité en cas de revente.',
    'Ne pas choisir la SCI à l\'IS sans une analyse complète et un accompagnement professionnel.',
  ],
  conclusionParagraphs: [
    'La SCI à l\'IS peut être une piste pertinente pour certains investisseurs souhaitant capitaliser des revenus de SCPI dans une structure dédiée, notamment aux TMI élevées.',
    'Ce montage est complexe et coûteux. Il doit être justifié par un objectif patrimonial clair et un horizon suffisant. Un accompagnement par un professionnel est fortement recommandé.',
    'Avant de choisir la SCI à l\'IS, il est conseillé de comparer avec les alternatives : détention en direct, assurance-vie, démembrement, PER.',
  ],
  faqItems: [
    {
      question: 'Peut-on acheter des SCPI via une SCI à l\'IS ?',
      answer: 'Oui, une SCI soumise à l\'IS peut acquérir des parts de SCPI. Les revenus sont perçus par la société et imposés à l\'IS.',
    },
    {
      question: 'Quel intérêt fiscal ?',
      answer: 'L\'IS peut être plus favorable que l\'IR pour les TMI élevées. L\'amortissement comptable réduit le résultat imposable. La capitalisation est possible.',
    },
    {
      question: 'Quels sont les risques ?',
      answer: 'Double imposition lors de la distribution. Frais de comptabilité et de structure. Complexité juridique et fiscale. Moins de liquidité.',
    },
    {
      question: 'Que se passe-t-il lors de la revente ?',
      answer: 'La revente des parts de SCPI par la SCI génère une plus-value imposée à l\'IS. La revente des parts de la SCI par l\'associé relève du régime des plus-values mobilières.',
    },
    {
      question: 'La SCI à l\'IS est-elle adaptée aux revenus complémentaires ?',
      answer: 'Moins, car la distribution des revenus est soumise à double imposition. La SCI à l\'IS est plus adaptée à un objectif de capitalisation.',
    },
    {
      question: 'Quels frais faut-il prévoir ?',
      answer: 'Frais de constitution, frais de comptabilité annuels, frais juridiques, déclarations fiscales, éventuels frais de commissariat aux comptes.',
    },
    {
      question: 'SCI à l\'IS ou détention en direct ?',
      answer: 'Le choix dépend de la TMI, du volume investi, de l\'horizon et des objectifs. La détention en direct est plus simple et moins coûteuse.',
    },
    {
      question: 'Comment MaximusSCPI analyse cette piste ?',
      answer: 'MaximusSCPI compare la SCI à l\'IS avec les autres modes de détention (direct, AV, démembrement) selon la TMI, l\'objectif et l\'horizon. L\'approche est pédagogique.',
    },
  ],
}
