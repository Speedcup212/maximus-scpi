import type { ScpiEducationalPageConfig } from './shared'

export const sciIsFiscaliteScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-sci-is-fiscalite/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI en SCI à l\'IS : fiscalité, avantages et limites',
  heroSubtitle:
    'Détenir des SCPI via une SCI soumise à l\'IS peut répondre à un objectif de capitalisation ou d\'organisation patrimoniale, mais ce montage ne crée pas à lui seul un avantage fiscal. Il faut comparer la fiscalité de la société, le coût de la structure, la fiscalité de la sortie et les alternatives.',
  seoTitle: 'SCPI en SCI à l\'IS : fiscalité, capitalisation, revente et distribution',
  seoDescription:
    'SCPI détenues via une SCI à l\'IS : imposition des revenus, absence d\'amortissement des parts en pleine propriété, distribution, revente, coûts et points de vigilance.',
  shortAnswerTitle: 'Pourquoi détenir des SCPI via une SCI à l\'IS ?',
  shortAnswer:
    'Une SCI à l\'IS peut conserver et réinvestir des revenus après impôt sans les distribuer immédiatement aux associés. En revanche, les parts de SCPI détenues en pleine propriété sont des titres : elles ne sont pas amortissables comme un immeuble détenu directement. L\'intérêt du montage dépend donc du taux d\'IS applicable, des frais de structure, de la durée de détention, du besoin de revenus et de la fiscalité lors d\'une distribution ou d\'une sortie.',
  keyMessage:
    'La SCI à l\'IS est un outil de structuration et de capitalisation. Elle ne doit pas être présentée comme une technique d\'amortissement des parts de SCPI détenues en pleine propriété.',
  definitionParagraphs: [
    'Une Société Civile Immobilière (SCI) soumise à l\'Impôt sur les Sociétés (IS) peut détenir des parts de SCPI si son objet social et son fonctionnement le permettent. La société est alors imposée sur son propre résultat fiscal.',
    'Les produits issus des SCPI sont intégrés au résultat de la SCI et soumis à l\'IS selon les règles applicables à la société. Le taux réduit d\'IS, lorsqu\'il est applicable, est soumis à des conditions ; le taux normal s\'applique au-delà ou lorsque les conditions du taux réduit ne sont pas remplies.',
    'Les parts de SCPI détenues en pleine propriété sont comptabilisées comme des titres ou immobilisations financières. Elles n\'ont pas de durée d\'utilisation limitée et ne font donc pas l\'objet d\'un amortissement comptable périodique. Une éventuelle dépréciation obéit à des règles distinctes et doit être justifiée.',
    'L\'usufruit temporaire de parts de SCPI constitue un cas différent : sa durée est limitée et son traitement comptable et fiscal doit être analysé spécifiquement avec l\'expert-comptable. Il ne faut pas transposer ce traitement à la pleine propriété des parts.',
    'La SCI peut conserver le bénéfice après IS pour le réinvestir, ou le distribuer aux associés. En cas de distribution, une seconde fiscalité peut s\'appliquer chez l\'associé selon le régime en vigueur et sa situation.',
    'En cas de cession des parts de SCPI par la SCI, le résultat de cession est déterminé selon les règles applicables à une société à l\'IS. Il n\'existe pas d\'abattement immobilier des particuliers pour durée de détention au niveau de la société.',
    'La SCI à l\'IS peut donc être cohérente pour une logique de capitalisation ou d\'organisation patrimoniale, mais elle peut être pénalisante si les revenus doivent être distribués régulièrement ou si une sortie à moyen terme est envisagée.',
  ],
  tableTitle: 'Éléments à analyser pour une SCI à l\'IS',
  tableRows: [
    {
      level: 'Fiscalité courante',
      advantage: 'Imposition du résultat au niveau de la société et possibilité de conserver le bénéfice après IS pour le réinvestir.',
      vigilance: 'Les parts de SCPI en pleine propriété ne sont pas amortissables. Le gain fiscal doit être mesuré après tous les coûts.',
    },
    {
      level: 'Distribution',
      advantage: 'La société choisit de conserver ou de distribuer la trésorerie disponible.',
      vigilance: 'Une distribution peut entraîner une seconde imposition chez l\'associé selon le régime applicable.',
    },
    {
      level: 'Revente des SCPI',
      advantage: 'La cession est traitée au niveau de la société.',
      vigilance: 'Pas d\'abattement immobilier des particuliers pour durée de détention. Il faut modéliser la fiscalité de sortie.',
    },
    {
      level: 'Comptabilité',
      advantage: 'Suivi comptable et patrimonial structuré.',
      vigilance: 'Comptes annuels, liasse fiscale et coûts récurrents. Une économie fiscale théorique peut être absorbée par les frais.',
    },
    {
      level: 'Financement',
      advantage: 'La SCI peut emprunter et, sous conditions, déduire les charges financières admises fiscalement.',
      vigilance: 'Capacité d\'endettement, garanties, règles de déductibilité et risque de trésorerie doivent être vérifiés.',
    },
    {
      level: 'Transmission',
      advantage: 'La détention via des parts sociales peut faciliter certaines stratégies de donation ou de gouvernance.',
      vigilance: 'La valorisation des parts, l\'IFI, les droits de mutation et les clauses statutaires doivent être étudiés au cas par cas.',
    },
    {
      level: 'Horizon',
      advantage: 'La structure peut être pertinente pour une capitalisation longue et organisée.',
      vigilance: 'Une liquidation ou une restructuration ultérieure peut avoir un coût fiscal et juridique significatif.',
    },
  ],
  tableNote:
    'Les règles d\'IS, de distribution, de déductibilité et de plus-value évoluent. Les hypothèses doivent être vérifiées pour l\'exercice concerné et validées avec l\'expert-comptable ou le conseil fiscal de la structure.',
  criteriaTitle: 'Critères à croiser pour évaluer une SCI à l\'IS',
  criteriaCards: [
    { title: 'Objectif patrimonial', text: 'Capitalisation, revenus, transmission ou réinvestissement : la structure doit répondre à un objectif précis.' },
    { title: 'Fiscalité globale', text: 'Comparer l\'IS payé par la société, la fiscalité d\'une distribution et la fiscalité de sortie avec les autres modes de détention.' },
    { title: 'Montant investi', text: 'Il n\'existe pas de seuil universel. Le montant doit simplement être suffisant pour que les coûts fixes restent proportionnés aux bénéfices attendus.' },
    { title: 'Horizon', text: 'Plus la structure est conservée longtemps, plus les coûts de constitution et de suivi peuvent être amortis économiquement.' },
    { title: 'Transmission', text: 'Les parts de SCI peuvent offrir une souplesse de gouvernance et de donation, mais la valeur des parts et la fiscalité doivent être justifiées.' },
    { title: 'Complexité', text: 'Comptabilité, déclarations fiscales, décisions sociales, trésorerie et suivi juridique sont des coûts réels à intégrer.' },
  ],
  commonErrors: [
    'Croire que les parts de SCPI détenues en pleine propriété par une SCI à l\'IS sont amortissables.',
    'Comparer uniquement le taux d\'IS avec la TMI personnelle sans intégrer la fiscalité des distributions et de la sortie.',
    'Sous-estimer les frais comptables, juridiques et bancaires de la structure.',
    'Choisir une SCI à l\'IS sans objectif patrimonial clair.',
    'Oublier qu\'une cession de parts de SCPI au niveau de la société ne bénéficie pas du régime immobilier des particuliers.',
    'Fixer un seuil de montant ou de TMI comme règle automatique alors que la pertinence dépend de l\'ensemble du dossier.',
  ],
  practicalCases: [
    {
      title: 'Capitalisation sans besoin de revenus immédiats',
      text: 'Une SCI perçoit des produits de SCPI, acquitte l\'IS correspondant puis conserve la trésorerie pour réinvestir. L\'intérêt vient de la capitalisation dans la société, pas d\'un amortissement des parts détenues en pleine propriété.',
    },
    {
      title: 'Petit portefeuille et coûts fixes élevés',
      text: 'Lorsque les revenus annuels sont faibles, les coûts de comptabilité, de banque et de suivi juridique peuvent absorber une part importante du différentiel fiscal. La comparaison doit être faite en euros nets, pas seulement en taux.',
    },
    {
      title: 'Distribution régulière aux associés',
      text: 'Si la SCI distribue chaque année l\'essentiel de son résultat après IS, la fiscalité au niveau des associés réduit l\'avantage de la capitalisation. Il faut comparer le net réellement perçu avec le direct et les autres enveloppes.',
    },
    {
      title: 'Revente à moyen terme',
      text: 'Une cession des parts de SCPI par la SCI génère un résultat taxable à l\'IS selon les règles de la société. L\'absence d\'abattement immobilier des particuliers peut peser fortement dans la comparaison à la sortie.',
    },
    {
      title: 'Transmission organisée',
      text: 'Une SCI peut faciliter la donation progressive de parts sociales et l\'organisation de la gouvernance. Le bénéfice patrimonial doit toutefois être distingué du seul traitement fiscal des revenus de SCPI.',
    },
  ],
  methodParagraphs: [
    'Définir l\'objectif : capitalisation, revenus, transmission ou financement.',
    'Projeter le résultat de la SCI et l\'IS réellement applicable, sans amortir les parts de SCPI détenues en pleine propriété.',
    'Intégrer tous les coûts de structure : comptabilité, banque, juridique et éventuels frais de financement.',
    'Modéliser la fiscalité d\'une distribution aux associés et celle d\'une cession future des parts de SCPI.',
    'Analyser séparément l\'IFI et la valeur des parts de SCI lorsque le foyer est concerné.',
    'Comparer le résultat net avec les alternatives : détention directe, assurance-vie, démembrement ou autre véhicule adapté.',
    'Faire valider le traitement comptable et fiscal retenu par l\'expert-comptable ou le conseil fiscal de la SCI.',
  ],
  conclusionParagraphs: [
    'Une SCI à l\'IS peut être pertinente pour capitaliser et organiser un patrimoine de SCPI, mais son intérêt ne repose pas sur l\'amortissement des parts détenues en pleine propriété.',
    'La décision doit être fondée sur le net après IS, coûts, éventuelle distribution et fiscalité de sortie.',
    'Ce montage doit être validé au cas par cas avec les professionnels qui suivent la structure.',
  ],
  faqItems: [
    {
      question: 'Peut-on acheter des SCPI via une SCI à l\'IS ?',
      answer: 'Oui, si l\'objet social et le fonctionnement de la SCI le permettent. Les produits et les cessions sont alors traités fiscalement au niveau de la société.',
    },
    {
      question: 'Peut-on amortir les parts de SCPI en pleine propriété ?',
      answer: 'Non. Les parts détenues en pleine propriété sont des titres sans durée d\'utilisation limitée et ne font pas l\'objet d\'un amortissement comptable périodique. L\'usufruit temporaire relève d\'une analyse différente.',
    },
    {
      question: 'Quel est l\'intérêt fiscal principal ?',
      answer: 'La société peut conserver après IS une partie de son résultat pour le réinvestir. L\'intérêt dépend du taux d\'IS applicable, des coûts, de la fiscalité des distributions et de la sortie.',
    },
    {
      question: 'Quels sont les principaux risques ?',
      answer: 'Coûts fixes, complexité, fiscalité lors d\'une distribution, fiscalité de sortie et mauvaise anticipation de la trésorerie.',
    },
    {
      question: 'Que se passe-t-il lors de la revente des parts de SCPI ?',
      answer: 'Le résultat de cession est imposé selon les règles applicables à la société à l\'IS, sans abattement immobilier des particuliers pour durée de détention.',
    },
    {
      question: 'La SCI à l\'IS est-elle adaptée aux revenus complémentaires ?',
      answer: 'Pas automatiquement. Si les revenus doivent être distribués régulièrement, la seconde fiscalité chez l\'associé peut réduire fortement l\'intérêt du montage.',
    },
    {
      question: 'Quel montant minimum faut-il investir ?',
      answer: 'Il n\'existe pas de seuil universel. Il faut vérifier que les coûts fixes de la structure restent proportionnés au gain patrimonial ou fiscal attendu.',
    },
    {
      question: 'La SCI à l\'IS est-elle réservée aux TMI élevées ?',
      answer: 'Non. Une TMI élevée peut renforcer l\'intérêt de la comparaison, mais elle ne suffit pas à justifier la structure. L\'horizon, les distributions, la sortie et les coûts sont déterminants.',
    },
    {
      question: 'Comment MaximusSCPI analyse cette piste ?',
      answer: 'MaximusSCPI compare les modes de détention en net après fiscalité et coûts, puis isole les enjeux de capitalisation, de distribution, d\'IFI et de transmission.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avant d\'envisager une structure',
}
