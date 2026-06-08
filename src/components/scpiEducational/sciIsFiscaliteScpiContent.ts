import type { ScpiEducationalPageConfig } from './shared'

export const sciIsFiscaliteScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-sci-is-fiscalite/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI en SCI à l\'IS : fiscalité, avantages et limites',
  heroSubtitle:
    'Détenir des SCPI via une SCI à l\'IS peut être une piste patrimoniale pour certains investisseurs, mais ce n\'est pas une solution universelle. Ce montage ajoute une couche fiscale, comptable et juridique qui doit être justifiée par des objectifs patrimoniaux clairs.',
  seoTitle: 'SCPI SCI à l\'IS : fiscalité, amortissement, trésorerie, distribution et plus-value',
  seoDescription:
    'Analyse complète de la détention de SCPI via une SCI à l\'IS : imposition à l\'IS, capitalisation, amortissement comptable, distribution des dividendes, plus-value, frais de comptabilité, complexité juridique. Cas pratiques où c\'est pertinent ou surdimensionné.',
  shortAnswerTitle: 'Pourquoi détenir des SCPI via une SCI à l\'IS ?',
  shortAnswer:
    'La SCI à l\'IS permet de capitaliser les revenus des SCPI dans une société avec une imposition à l\'IS, potentiellement plus faible que l\'IR pour les TMI élevées. Elle offre aussi la possibilité d\'amortir comptablement les parts de SCPI et de différer la distribution des revenus aux associés. En contrepartie, ce montage ajoute des frais de comptabilité, une complexité juridique, une double imposition lors de la redistribution (IS + impôt sur les dividendes), et des contraintes de gestion. Ce n\'est pas une solution adaptée à tous les profils.',
  keyMessage:
    'La SCI à l\'IS peut être utile dans certains montages patrimoniaux, mais elle ajoute une couche fiscale, comptable et juridique qui doit être justifiée par l\'objectif patrimonial.',
  definitionParagraphs: [
    'Une Société Civile Immobilière (SCI) soumise à l\'Impôt sur les Sociétés (IS) est une société qui peut détenir des parts de SCPI. Contrairement à une SCI à l\'IR (transparence fiscale), la SCI à l\'IS est imposée sur ses bénéfices au taux de l\'IS.',
    'Les revenus des SCPI sont perçus par la SCI et imposés à l\'IS. Le taux d\'IS est progressif : un taux réduit s\'applique jusqu\'à un certain seuil de bénéfice, et le taux normal au-delà. Ces taux sont susceptibles d\'évoluer.',
    'La SCI à l\'IS peut amortir comptablement la valeur des parts de SCPI, ce qui réduit le résultat imposable et peut générer de la trésorerie non imposée à l\'IS. L\'amortissement est calculé sur la durée d\'utilité estimée des actifs.',
    'Si la SCI réalise des bénéfices après IS et amortissement, elle peut les conserver (capitalisation) ou les distribuer aux associés sous forme de dividendes. La distribution est ensuite imposée chez l\'associé : flat tax (30 %) ou option pour le barème progressif.',
    'En cas de revente des parts de SCPI par la SCI, la plus-value est imposée à l\'IS, sans abattement pour durée de détention. La revente des parts de la SCI elle-même est soumise au régime des plus-values mobilières.',
    'Ce montage est généralement plus adapté à un objectif de capitalisation long terme qu\'à un objectif de revenus immédiats. Les frais annuels de comptabilité (souvent 2 000 € à 5 000 €) doivent être mis en balance avec les avantages fiscaux attendus.',
    'La SCI à l\'IS peut être pertinente dans certaines situations : TMI très élevée, volonté de capitalisation, objectif de transmission avec donation de parts. Elle peut être surdimensionnée pour des petits montants ou des objectifs simples.',
  ],
  tableTitle: 'Éléments à analyser pour une SCI à l\'IS',
  tableRows: [
    {
      level: 'Fiscalité courante',
      advantage: 'Imposition à l\'IS (taux réduit jusqu\'à un seuil). Amortissement comptable possible. Capitalisation des revenus.',
      vigilance: 'Si les bénéfices dépassent le seuil, le taux normal d\'IS s\'applique. À comparer avec l\'IR.',
    },
    {
      level: 'Distribution',
      advantage: 'Flexibilité : possibilité de capitaliser ou de distribuer selon les besoins.',
      vigilance: 'Distribution imposée chez l\'associé (flat tax 30 % ou barème progressif). Double imposition IS + IR.',
    },
    {
      level: 'Plus-value',
      advantage: 'Imposition à l\'IS en cas de revente par la SCI.',
      vigilance: 'Pas d\'abattement pour durée de détention à l\'IS. À comparer avec le régime des particuliers.',
    },
    {
      level: 'Comptabilité',
      advantage: 'Structure professionnelle. Suivi précis. Possibilité d\'amortissement.',
      vigilance: 'Frais de comptabilité annuels (2 000 à 5 000 €). Déclaration fiscale obligatoire.',
    },
    {
      level: 'Financement',
      advantage: 'L\'emprunt peut être souscrit par la SCI. Intérêts déductibles du résultat.',
      vigilance: 'Capacité d\'endettement de la société. Garanties personnelles souvent demandées.',
    },
    {
      level: 'Transmission',
      advantage: 'Donation de parts de SCI possible. Valorisation potentiellement optimisée.',
      vigilance: 'Valorisation des parts à justifier. Droit d\'enregistrement. Complexité juridique.',
    },
    {
      level: 'Horizon',
      advantage: 'Adapté à un objectif long terme avec capitalisation.',
      vigilance: 'Peu pertinent pour un besoin de revenus immédiats ou un horizon court.',
    },
  ],
  tableNote:
    'Les taux d\'IS et les règles applicables peuvent évoluer. À vérifier selon la réglementation en vigueur.',
  criteriaTitle: 'Critères à croiser pour évaluer une SCI à l\'IS',
  criteriaCards: [
    { title: 'Objectif patrimonial', text: 'Capitalisation long terme ou distribution ? L\'IS est plus adapté à la capitalisation. Pour des revenus immédiats, le direct ou l\'AV sont souvent plus pertinents.' },
    { title: 'TMI', text: 'Plus la TMI est élevée, plus l\'IS peut être favorable comparé à l\'IR. À TMI 11 % ou 30 %, la SCI à l\'IS est rarement justifiée. À TMI 45 %, elle peut être une piste.' },
    { title: 'Volume investi', text: 'Un volume suffisant (généralement > 200 000 €) est nécessaire pour justifier les frais de structure et de comptabilité.' },
    { title: 'Horizon', text: 'Un horizon long (> 10 ans) est généralement nécessaire pour amortir les coûts de la structure et bénéficier de l\'effet de capitalisation.' },
    { title: 'Transmission', text: 'La SCI à l\'IS peut faciliter la transmission par donation de parts, avec des avantages spécifiques à étudier.' },
    { title: 'Complexité', text: 'Frais comptables, déclarations fiscales, obligations juridiques : ne pas sous-estimer la charge administrative et les coûts récurrents.' },
  ],
  commonErrors: [
    'Croire que l\'IS est toujours plus favorable que l\'IR : cela dépend du montant des bénéfices et de la TMI.',
    'Sous-estimer les frais de comptabilité et de structure qui peuvent annuler l\'avantage fiscal.',
    'Oublier la double imposition : IS sur les bénéfices + impôt sur les dividendes distribués.',
    'Choisir la SCI à l\'IS sans objectif patrimonial clair, juste parce que c\'est une option possible.',
    'Négliger les conséquences en cas de revente des parts de la SCI (plus-value mobilière).',
    'Opter pour une SCI à l\'IS pour un petit montant d\'investissement où les frais ne seront pas amortis.',
  ],
  practicalCases: [
    {
      title: 'TMI 45 % — SCI à l\'IS avec capitalisation',
      text: 'Apport de 300 000 €. Rendement brut 6 % = 18 000 €/an. Après amortissement et IS, bénéfice net ~10 000 € capitalisé dans la SCI. En direct TMI 45 %, le rendement net serait d\'environ 2,3 % (6 900 €). La SCI permet de capitaliser davantage.',
    },
    {
      title: 'TMI 30 % — SCI à l\'IS surdimensionnée',
      text: 'Apport de 100 000 €. Rendement brut 6 % = 6 000 €/an. Frais de comptabilité : 3 000 €/an. Avantage fiscal potentiel avant frais : faible. Coût de structure qui absorbe une part significative du rendement. Le direct ou l\'AV seraient probablement plus pertinents.',
    },
    {
      title: 'SCI à l\'IS avec distribution',
      text: 'Bénéfice après IS : 15 000 €. Distribution aux associés. Flat tax 30 % = 4 500 €. Net perçu : 10 500 €. Le coût fiscal global (IS + flat tax) est à comparer avec l\'IR qui serait dû en direct.',
    },
    {
      title: 'SCI à l\'IS vs direct TMI 41 %',
      text: 'Hypothèse : rendement brut 6 %. En direct TMI 41 % : net estimé ~2,5 %. En SCI à l\'IS avec capitalisation : le rendement net après IS peut être supérieur, mais la distribution est imposée en plus. La comparaison doit porter sur l\'objectif (capitalisation vs revenus).',
    },
    {
      title: 'SCI à l\'IS pour la transmission',
      text: 'Un investisseur apporte 500 000 € de SCPI à une SCI à l\'IS. Après 15 ans, il donne des parts de SCI à ses enfants. La donation est calculée sur la valeur des parts, potentiellement optimisée. L\'objectif transmission justifie la complexité.',
    },
  ],
  methodParagraphs: [
    'Définir l\'objectif patrimonial : capitalisation, distribution, transmission.',
    'Comparer le coût fiscal global (IS + impôt sur distribution) vs l\'IR en direct.',
    'Estimer les frais de structure (comptabilité, juridique) et les intégrer dans l\'analyse.',
    'Vérifier la capacité d\'endettement de la SCI et les garanties demandées.',
    'Analyser l\'impact sur la transmission et la fiscalité en cas de revente.',
    'Comparer avec les alternatives : direct, assurance-vie, démembrement, PER.',
    'Ne pas choisir la SCI à l\'IS sans une analyse complète et un accompagnement professionnel.',
  ],
  conclusionParagraphs: [
    'La SCI à l\'IS peut être une piste pertinente pour certains investisseurs souhaitant capitaliser des revenus de SCPI dans une structure dédiée, notamment aux TMI élevées et pour des montants significatifs.',
    'Ce montage est complexe et coûteux. Il doit être justifié par un objectif patrimonial clair et un horizon suffisant. Il n\'est pas adapté à tous les profils ni à tous les montants.',
    'Avant de choisir la SCI à l\'IS, il est conseillé de comparer avec les alternatives : détention en direct, assurance-vie, démembrement, PER. Un accompagnement par un professionnel est fortement recommandé.',
  ],
  faqItems: [
    {
      question: 'Peut-on acheter des SCPI via une SCI à l\'IS ?',
      answer: 'Oui, une SCI soumise à l\'IS peut acquérir des parts de SCPI. Les revenus sont perçus par la société et imposés à l\'IS. L\'objet social de la SCI doit être compatible.',
    },
    {
      question: 'Quel intérêt fiscal ?',
      answer: 'L\'IS peut être plus favorable que l\'IR pour les TMI élevées. L\'amortissement comptable réduit le résultat imposable. La capitalisation des revenus est possible sans imposition immédiate.',
    },
    {
      question: 'Quels sont les risques ?',
      answer: 'Double imposition lors de la distribution (IS + impôt sur les dividendes). Frais de comptabilité et de structure. Complexité juridique et fiscale. Moins de liquidité.',
    },
    {
      question: 'Que se passe-t-il lors de la revente des parts de SCPI ?',
      answer: 'La revente des parts de SCPI par la SCI génère une plus-value imposée à l\'IS, sans abattement pour durée de détention.',
    },
    {
      question: 'La SCI à l\'IS est-elle adaptée aux revenus complémentaires ?',
      answer: 'Moins, car la distribution des revenus est soumise à double imposition. La SCI à l\'IS est plus adaptée à un objectif de capitalisation long terme.',
    },
    {
      question: 'Quels frais faut-il prévoir ?',
      answer: 'Frais de constitution (500 à 2 000 €), frais de comptabilité annuels (2 000 à 5 000 €), frais juridiques, déclarations fiscales, éventuels frais de commissariat aux comptes.',
    },
    {
      question: 'SCI à l\'IS ou détention en direct ?',
      answer: 'Le choix dépend de la TMI, du volume investi, de l\'horizon et des objectifs. La détention en direct est plus simple, moins coûteuse et plus liquide.',
    },
    {
      question: 'Quel volume minimum pour justifier une SCI à l\'IS ?',
      answer: 'À titre indicatif, un volume d\'au moins 200 000 € à 300 000 € est souvent nécessaire pour que la structure soit économiquement justifiée, compte tenu des frais récurrents.',
    },
    {
      question: 'La SCI à l\'IS peut-elle être dissoute facilement ?',
      answer: 'La dissolution d\'une SCI à l\'IS entraîne des conséquences fiscales (imposition des plus-values latentes). Ce n\'est pas une opération anodine.',
    },
    {
      question: 'Comment MaximusSCPI analyse cette piste ?',
      answer: 'MaximusSCPI compare la SCI à l\'IS avec les autres modes de détention (direct, AV, démembrement, PER) selon la TMI, l\'objectif, le volume et l\'horizon. L\'approche est pédagogique.',
    },
    {
      question: 'Cas où la SCI à l\'IS peut être pertinente ?',
      answer: 'TMI élevée (41-45 %), volume significatif (> 200 000 €), objectif de capitalisation long terme, souhait de transmission organisée, détention via une holding existante.',
    },
    {
      question: 'Cas où la SCI à l\'IS peut être surdimensionnée ?',
      answer: 'TMI faible ou moyenne (11-30 %), petit montant, objectif de revenus complémentaires, horizon court, absence d\'objectif de transmission, volonté de simplicité.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avant d\'envisager une structure',
}
