import type { ScpiEducationalPageConfig } from './shared'

export const tmi41ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-41/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI avec TMI 41 % : fiscalité, rendement net et arbitrages',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 41 %, la fiscalité des revenus immobiliers français peut peser fortement sur le rendement net. L\'analyse doit comparer les revenus français et étrangers, les frais, le mode de détention, l\'IFI, la liquidité et le besoin de revenus.',
  seoTitle: 'SCPI TMI 41 % : fiscalité, rendement net, Europe, AV et démembrement',
  seoDescription:
    'SCPI et TMI 41 % : rendement net, revenus français et étrangers, assurance-vie, démembrement, crédit, SCI à l\'IS et IFI.',
  shortAnswerTitle: 'Que change une TMI à 41 % pour un projet SCPI ?',
  shortAnswer:
    'Une TMI à 41 % augmente le poids marginal de l\'impôt sur les revenus fonciers français, mais elle ne permet pas de conclure seule sur le bon mode de détention. Il faut distinguer taux marginal et taux moyen, ventiler les revenus par pays, intégrer les prélèvements sociaux, les charges éventuelles, les frais et l\'IFI, puis comparer les scénarios sur une même base nette.',
  keyMessage:
    'À TMI 41 %, la fiscalité doit être modélisée précisément, sans transformer la TMI en règle automatique d\'allocation.',
  definitionParagraphs: [
    'La TMI de 41 % s\'applique uniquement à la tranche marginale correspondante du revenu imposable. Elle ne signifie pas que l\'ensemble des revenus du foyer est taxé à 41 %.',
    'Les revenus fonciers français détenus en direct sont soumis au barème progressif et, en principe, aux prélèvements sociaux selon les règles en vigueur. Une simulation simplifiée TMI + prélèvements sociaux donne un ordre de grandeur marginal, pas le taux effectif réel du foyer.',
    'Le calcul doit tenir compte de la nature des revenus, d\'éventuelles charges déductibles et de l\'effet fiscal de la CSG déductible lorsque les conditions sont réunies.',
    'Pour les revenus immobiliers étrangers, le traitement dépend de la convention fiscale conclue avec chaque pays. Crédit d\'impôt, taux effectif et autres mécanismes ne doivent pas être généralisés à toute l\'Europe.',
    'L\'assurance-vie peut différer l\'imposition à l\'IR jusqu\'au rachat, mais elle ajoute des frais et des règles contractuelles. Une UC immobilière peut rester partiellement taxable à l\'IFI.',
    'La nue-propriété peut être étudiée si l\'investisseur accepte de ne percevoir aucune distribution pendant la durée du démembrement. La clé doit être comparée à la valeur économique des droits abandonnés.',
    'Le crédit peut créer un effet de levier et permettre la déduction de certaines charges financières lorsqu\'elles sont éligibles, mais son coût et son risque doivent être intégrés.',
    'Une SCI à l\'IS peut servir à capitaliser, mais les parts de SCPI détenues en pleine propriété ne sont pas amortissables. La comparaison doit inclure l\'IS, les coûts, les distributions futures et la sortie.',
  ],
  tableTitle: 'Pistes à comparer avec une TMI à 41 %',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage: 'Simplicité et accès large au marché.',
      vigilance: 'Fiscalité courante potentiellement élevée. Comparer le net réel avec les autres modes de détention.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Diversification et fiscalité pouvant différer selon les conventions.',
      vigilance: 'Analyse pays par pays indispensable ; risque de change hors zone euro et déclaration plus complexe.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Capitalisation dans le contrat et fiscalité propre aux rachats.',
      vigilance: 'Frais UC, supports référencés, IFI potentiel et règles de sortie à intégrer.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Pas de distributions attribuées au nu-propriétaire pendant le démembrement.',
      vigilance: 'Aucun revenu, liquidité réduite, clé à analyser et IFI à vérifier selon le montage.',
    },
    {
      level: 'Crédit',
      advantage: 'Effet de levier et charges financières potentiellement déductibles sous conditions.',
      vigilance: 'Le coût du financement et le cash-flow peuvent neutraliser l\'avantage fiscal.',
    },
    {
      level: 'SCI à l\'IS',
      advantage: 'Capitalisation possible dans la société après IS.',
      vigilance: 'Coûts, fiscalité de distribution et de sortie. Pas d\'amortissement des parts de SCPI en pleine propriété.',
    },
  ],
  tableNote:
    'Ces options doivent être comparées en net après fiscalité, frais et risques. Aucune n\'est automatiquement préférable à TMI 41 %.',
  criteriaTitle: 'Critères à croiser avec une TMI à 41 %',
  criteriaCards: [
    { title: 'Net fiscal réel', text: 'Distinguer taux marginal, taux moyen, prélèvements sociaux et charges déductibles.' },
    { title: 'Origine des revenus', text: 'Ventiler France et étranger puis appliquer les conventions fiscales concernées.' },
    { title: 'Besoin de revenus', text: 'Un besoin immédiat peut rendre la nue-propriété ou certaines stratégies de capitalisation inadaptées.' },
    { title: 'Horizon', text: 'L\'horizon influence l\'impact des frais, du démembrement, du crédit et des enveloppes.' },
    { title: 'IFI', text: 'Le traitement dépend du mode de détention et de la fraction immobilière taxable.' },
    { title: 'Liquidité', text: 'Comparer délais de retrait, parts en attente et contraintes de cession avant d\'optimiser la fiscalité.' },
    { title: 'Qualité de la SCPI', text: 'TOF, valeurs, dette, collecte, patrimoine et gouvernance restent prioritaires.' },
  ],
  commonErrors: [
    'Appliquer 41 % à l\'ensemble des revenus au lieu de raisonner par tranche marginale.',
    'Ajouter mécaniquement les prélèvements sociaux sans calculer le régime réel du revenu.',
    'Présenter les SCPI européennes comme fiscalement supérieures par principe.',
    'Présenter l\'assurance-vie comme automatiquement hors IFI.',
    'Présenter la nue-propriété comme une économie fiscale sans valoriser les revenus abandonnés.',
    'Supposer qu\'une SCI à l\'IS permet d\'amortir les parts de SCPI en pleine propriété.',
  ],
  practicalCases: [
    {
      title: 'Direct France',
      text: 'Une simulation correcte distingue le revenu foncier, les prélèvements sociaux, les charges déductibles éventuelles et la situation globale du foyer avant de calculer le net réellement conservé.',
    },
    {
      title: 'SCPI européenne',
      text: 'Une SCPI investit dans plusieurs pays. La fiche fiscale annuelle permet de ventiler les revenus et d\'appliquer les conventions concernées au lieu d\'utiliser un taux européen moyen.',
    },
    {
      title: 'Assurance-vie',
      text: 'La fiscalité à l\'IR est différée jusqu\'au rachat, mais le comparatif intègre les frais, la distribution réellement créditée, l\'IFI éventuel et la fiscalité de sortie.',
    },
    {
      title: 'Nue-propriété',
      text: 'L\'absence de revenus peut correspondre à un horizon de préparation de retraite, mais la pertinence dépend de la clé et de la qualité de la SCPI.',
    },
    {
      title: 'SCI à l\'IS',
      text: 'La société peut capitaliser après IS, mais il faut intégrer les coûts fixes, la fiscalité d\'une future distribution et la sortie, sans amortir les parts en pleine propriété.',
    },
  ],
  methodParagraphs: [
    'Confirmer la TMI et distinguer taux marginal et taux moyen.',
    'Ventiler les revenus SCPI par nature et par pays.',
    'Calculer le net de la détention directe avec les règles applicables au foyer.',
    'Comparer plusieurs modes de détention sur un même horizon et avec des supports de risque comparable.',
    'Intégrer frais, IFI, liquidité et besoin de revenus dans chaque scénario.',
    'Tester des scénarios défavorables sur distribution, prix de part et coût du crédit.',
    'Écarter les solutions dont l\'avantage dépend d\'une hypothèse fiscale non vérifiée.',
  ],
  conclusionParagraphs: [
    'À TMI 41 %, la fiscalité est un élément majeur mais ne doit pas devenir le seul critère.',
    'Le bon arbitrage résulte d\'une comparaison en net après fiscalité, frais, IFI et liquidité.',
    'La qualité de la SCPI reste le premier filtre avant le choix de l\'enveloppe.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles adaptées à une TMI 41 % ?',
      answer: 'Elles peuvent l\'être, mais il faut calculer le net fiscal réel et comparer les modes de détention sans automatisme.',
    },
    {
      question: 'Pourquoi la fiscalité pèse-t-elle davantage ?',
      answer: 'Parce que les revenus fonciers français se situent dans une tranche marginale élevée et peuvent supporter des prélèvements sociaux en plus de l\'IR.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Non automatiquement. Leur fiscalité varie selon les conventions et leur qualité immobilière doit être analysée séparément.',
    },
    {
      question: 'Le démembrement est-il pertinent ?',
      answer: 'Il peut l\'être si l\'investisseur n\'a pas besoin de revenus et accepte une liquidité réduite. La clé de démembrement reste déterminante.',
    },
    {
      question: 'L\'assurance-vie est-elle plus efficace ?',
      answer: 'Elle peut différer l\'imposition à l\'IR jusqu\'au rachat, mais il faut intégrer les frais, les supports disponibles et l\'IFI éventuel.',
    },
    {
      question: 'Une SCI à l\'IS est-elle une solution fiscale ?',
      answer: 'C\'est avant tout une structure de capitalisation. Son intérêt dépend des coûts, de l\'IS, des distributions futures et de la sortie. Les parts de SCPI en pleine propriété ne sont pas amortissables.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Le traitement dépend du mode de détention et de la fraction immobilière taxable. Il doit être vérifié séparément pour le direct, l\'assurance-vie, le démembrement et les sociétés.',
    },
    {
      question: 'Comment MaximusSCPI traite une TMI à 41 % ?',
      answer: 'MaximusSCPI compare les scénarios en net après fiscalité et frais puis croise ce résultat avec la qualité de la SCPI, l\'IFI, l\'horizon et la liquidité.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon leur rendement net estimé',
}
