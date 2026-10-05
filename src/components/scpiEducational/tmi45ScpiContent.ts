import type { ScpiEducationalPageConfig } from './shared'

export const tmi45ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-45/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI avec TMI 45 % : analyse fiscale renforcée',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 45 %, la fiscalité des revenus immobiliers français peut fortement peser sur le rendement net. Cela ne crée toutefois aucune allocation automatique : il faut comparer les SCPI, les pays, les modes de détention, les frais, l\'IFI et les besoins de liquidité.',
  seoTitle: 'SCPI TMI 45 % : fiscalité, rendement net, Europe, AV et démembrement',
  seoDescription:
    'SCPI et TMI 45 % : rendement net, revenus français et étrangers, assurance-vie, démembrement, crédit, SCI à l\'IS et IFI.',
  shortAnswerTitle: 'Que change une TMI à 45 % pour un projet SCPI ?',
  shortAnswer:
    'Une TMI à 45 % augmente le poids marginal de l\'impôt sur les revenus fonciers français, auxquels peuvent s\'ajouter les prélèvements sociaux. Mais le taux marginal n\'est pas un taux moyen appliqué mécaniquement à tout le patrimoine. La bonne méthode consiste à simuler le revenu net réellement conservé puis à comparer, sans automatisme, le direct France, les revenus étrangers selon les conventions, l\'assurance-vie, la nue-propriété, le crédit et éventuellement une structure sociétaire.',
  keyMessage:
    'À TMI 45 %, la fiscalité devient un filtre majeur, mais elle ne remplace ni l\'analyse de la SCPI ni l\'adéquation patrimoniale.',
  definitionParagraphs: [
    'La TMI de 45 % correspond au taux marginal appliqué à la tranche la plus élevée du revenu imposable. Elle ne signifie pas que l\'ensemble des revenus du foyer est imposé à 45 %.',
    'Les revenus fonciers français détenus en direct sont soumis au barème progressif et, en principe, aux prélèvements sociaux selon les règles en vigueur. Une partie de la CSG peut avoir un effet fiscal ultérieur ; une simulation simplifiée TMI + prélèvements sociaux ne remplace donc pas le calcul fiscal réel.',
    'À ce niveau de TMI, comparer le taux de distribution brut de deux SCPI est insuffisant. Il faut retraiter la fiscalité, les frais, les valeurs de part, la dette, la liquidité et les risques du véhicule.',
    'Pour les revenus immobiliers étrangers, le traitement français dépend de la convention fiscale applicable pays par pays. Il peut reposer sur un crédit d\'impôt ou une autre méthode d\'élimination de la double imposition. Il n\'existe pas de régime fiscal européen unique.',
    'L\'assurance-vie peut différer l\'imposition à l\'impôt sur le revenu jusqu\'au rachat, mais ajoute les frais et règles du contrat. Une SCPI logée dans un contrat rachetable peut par ailleurs rester partiellement comprise dans l\'IFI.',
    'La nue-propriété peut être étudiée lorsqu\'aucun revenu n\'est nécessaire pendant la durée du démembrement. La clé de démembrement représente la valeur économique des droits abandonnés pendant la période et ne constitue pas une économie fiscale garantie.',
    'Le crédit peut rendre certaines charges financières déductibles des revenus fonciers lorsque les conditions sont réunies. L\'intérêt économique dépend toutefois du coût du crédit, du cash-flow, du risque de taux et de la valeur des parts.',
    'Une SCI à l\'IS peut servir à capitaliser au niveau d\'une société, mais les parts de SCPI détenues en pleine propriété ne sont pas amortissables. Il faut intégrer l\'IS, les coûts de structure, la fiscalité d\'une distribution et celle de la sortie.',
  ],
  tableTitle: 'Pistes à comparer avec une TMI à 45 %',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage: 'Détention simple et accès large au marché.',
      vigilance: 'Fiscalité courante potentiellement élevée. Calculer le net après IR, prélèvements sociaux, frais et éventuelles charges déductibles.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Diversification et fiscalité pouvant différer selon les conventions.',
      vigilance: 'Aucune règle fiscale unique : analyse pays par pays, change éventuel et déclaration plus complexe.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Capitalisation dans le contrat et fiscalité propre aux rachats.',
      vigilance: 'Frais UC, supports référencés, IFI potentiel, valorisation et fiscalité de sortie à intégrer.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Absence de distributions attribuées au nu-propriétaire pendant le démembrement.',
      vigilance: 'Aucun revenu, liquidité réduite, clé à analyser et IFI à vérifier selon l\'origine du démembrement.',
    },
    {
      level: 'Crédit',
      advantage: 'Effet de levier et charges financières potentiellement déductibles sous conditions.',
      vigilance: 'Coût du financement, cash-flow, garanties et risque de taux peuvent annuler l\'avantage fiscal.',
    },
    {
      level: 'SCI à l\'IS',
      advantage: 'Capitalisation possible dans la société après IS.',
      vigilance: 'Coûts fixes, fiscalité de distribution et sortie. Les parts de SCPI en pleine propriété ne sont pas amortissables.',
    },
  ],
  tableNote:
    'Aucune de ces options n\'est automatiquement supérieure à TMI 45 %. La comparaison doit être faite avec les hypothèses fiscales et patrimoniales réelles du dossier.',
  criteriaTitle: 'Critères à croiser avec une TMI à 45 %',
  criteriaCards: [
    { title: 'Net fiscal réel', text: 'Calculer le revenu réellement conservé plutôt que d\'appliquer mécaniquement TMI + prélèvements sociaux à tous les flux.' },
    { title: 'Origine des revenus', text: 'Identifier la part française et étrangère et appliquer la convention fiscale de chaque pays.' },
    { title: 'Besoin de revenus', text: 'Un besoin immédiat de cash-flow peut exclure certaines stratégies de capitalisation ou de nue-propriété.' },
    { title: 'Horizon', text: 'L\'horizon conditionne la pertinence des frais d\'entrée, du démembrement, du crédit et des enveloppes de capitalisation.' },
    { title: 'IFI', text: 'Analyser la fraction immobilière taxable selon le mode de détention ; assurance-vie et démembrement ne sont pas automatiquement hors IFI.' },
    { title: 'Liquidité', text: 'Comparer les mécanismes de retrait, les parts en attente et les contraintes de cession avant de rechercher un avantage fiscal.' },
    { title: 'Qualité de la SCPI', text: 'TOF, valeurs, dette, collecte, patrimoine et gouvernance restent déterminants.' },
  ],
  commonErrors: [
    'Appliquer 45 % à l\'ensemble du revenu ou du patrimoine au lieu de raisonner par tranche marginale.',
    'Présenter une SCPI européenne comme automatiquement plus avantageuse fiscalement.',
    'Présenter l\'assurance-vie comme automatiquement hors IFI.',
    'Présenter la nue-propriété comme une économie d\'impôt sans valoriser les revenus abandonnés.',
    'Supposer que la SCI à l\'IS permet d\'amortir les parts de SCPI détenues en pleine propriété.',
    'Choisir une solution uniquement pour sa fiscalité sans intégrer les frais, le risque et la liquidité.',
  ],
  practicalCases: [
    {
      title: 'Direct France',
      text: 'Un investisseur à TMI 45 % détient une SCPI française en direct. La simulation doit distinguer revenu foncier, prélèvements sociaux, charges déductibles éventuelles et effet de la CSG déductible avant de comparer le net avec une autre solution.',
    },
    {
      title: 'Revenus étrangers',
      text: 'Une SCPI détient des immeubles dans plusieurs pays. Le calcul fiscal est ventilé par État à partir de la fiche fiscale annuelle, au lieu d\'appliquer un taux moyen européen.',
    },
    {
      title: 'Assurance-vie',
      text: 'Le contrat permet de capitaliser sans IR annuel chez le souscripteur, mais le comparatif intègre les frais UC, la distribution réellement créditée, la fiscalité du rachat et l\'IFI éventuel.',
    },
    {
      title: 'Nue-propriété',
      text: 'L\'investisseur n\'a pas besoin de revenus pendant dix ans. La décision dépend de la clé proposée, de la valeur future des parts, de la liquidité et de la qualité de la SCPI, pas de la seule TMI.',
    },
    {
      title: 'SCI à l\'IS',
      text: 'La structure conserve les revenus après IS pour réinvestir. La comparaison inclut les coûts comptables, l\'absence d\'amortissement des parts de SCPI en pleine propriété, la distribution future et la fiscalité de sortie.',
    },
  ],
  methodParagraphs: [
    'Confirmer la TMI et distinguer taux marginal et taux moyen d\'imposition.',
    'Ventiler les revenus SCPI par nature et par pays.',
    'Calculer le net fiscal réel de la détention directe avec les règles applicables au foyer.',
    'Comparer les mêmes SCPI ou des SCPI de risque comparable selon plusieurs modes de détention.',
    'Intégrer frais, IFI, liquidité, horizon et besoin de revenus dans chaque scénario.',
    'Tester la sensibilité à une baisse de distribution, une baisse de prix de part ou une hausse du coût du crédit.',
    'Écarter toute solution dont l\'avantage dépend d\'une hypothèse fiscale non vérifiée.',
  ],
  conclusionParagraphs: [
    'À TMI 45 %, la fiscalité justifie une analyse plus fine, pas une recette automatique.',
    'Les revenus étrangers, l\'assurance-vie, la nue-propriété, le crédit ou une SCI à l\'IS peuvent modifier le résultat net, mais chacun ajoute ses propres risques et contraintes.',
    'La décision doit rester fondée sur la qualité de la SCPI et le net patrimonial global après fiscalité, frais et liquidité.',
  ],
  faqItems: [
    {
      question: 'Les SCPI françaises sont-elles à éviter à TMI 45 % ?',
      answer: 'Non automatiquement. Leur fiscalité en direct peut être lourde, mais la qualité du support, les charges déductibles, le besoin de revenus et les alternatives doivent être comparés.',
    },
    {
      question: 'Les SCPI européennes sont-elles forcément meilleures ?',
      answer: 'Non. Leur fiscalité varie selon les conventions et leur risque immobilier doit être analysé comme celui de toute SCPI.',
    },
    {
      question: 'Le démembrement est-il automatiquement adapté ?',
      answer: 'Non. Il suppose de renoncer aux distributions pendant la période et d\'accepter une liquidité réduite. La clé et la SCPI doivent être analysées.',
    },
    {
      question: 'L\'assurance-vie est-elle préférable ?',
      answer: 'Elle peut différer l\'imposition jusqu\'au rachat, mais il faut intégrer les frais, les supports disponibles, la fiscalité du rachat et l\'IFI éventuel.',
    },
    {
      question: 'Une SCI à l\'IS permet-elle d\'amortir les parts de SCPI ?',
      answer: 'Non pour des parts de SCPI détenues en pleine propriété. Elles sont des titres sans durée d\'utilisation limitée. L\'usufruit temporaire est un cas différent.',
    },
    {
      question: 'Le crédit est-il plus intéressant à TMI 45 % ?',
      answer: 'La valeur fiscale de charges déductibles peut être plus élevée, mais le coût du crédit et le risque financier doivent être comparés au rendement attendu.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Le traitement dépend du mode de détention et de la fraction immobilière taxable. Ni l\'assurance-vie ni la nue-propriété ne doivent être considérées comme automatiquement exonérées.',
    },
    {
      question: 'Comment MaximusSCPI traite une TMI élevée ?',
      answer: 'MaximusSCPI compare les scénarios en net après fiscalité et frais, puis croise le résultat avec la qualité de la SCPI, l\'IFI, l\'horizon et la liquidité.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur rendement brut et net estimé',
}
