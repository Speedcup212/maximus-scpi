import type { ScpiEducationalPageConfig } from './shared'

export const tmi11ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-11',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 11 % : quels critères analyser avant d\'investir ?',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 11 %, la fiscalité des revenus fonciers français reste à intégrer mais ne doit pas dominer l\'analyse. Le choix doit d\'abord reposer sur la qualité de la SCPI, les frais, la liquidité, l\'horizon et le besoin de revenus.',
  seoTitle: 'SCPI TMI 11 % : fiscalité, rendement net, Europe, AV et crédit',
  seoDescription:
    'SCPI et TMI 11 % : rendement net, revenus français et étrangers, assurance-vie, démembrement, crédit, frais, IFI et critères de sélection.',
  shortAnswerTitle: 'Que change une TMI à 11 % pour un projet SCPI ?',
  shortAnswer:
    'Une TMI à 11 % limite le poids marginal de l\'impôt sur le revenu par rapport aux tranches supérieures, mais les revenus fonciers français peuvent aussi supporter des prélèvements sociaux. La bonne méthode consiste à calculer le net réellement conservé sans réduire la décision à la fiscalité, puis à comparer la qualité des SCPI, les frais, la liquidité et les modes de détention.',
  keyMessage:
    'À TMI 11 %, la fiscalité est un paramètre secondaire mais réel ; la qualité de la SCPI et l\'adéquation au projet restent prioritaires.',
  definitionParagraphs: [
    'La TMI de 11 % s\'applique uniquement à la tranche marginale correspondante du revenu imposable. Elle ne signifie pas que l\'ensemble des revenus du foyer est taxé à 11 %.',
    'Les revenus fonciers français détenus en direct sont soumis au barème progressif et, en principe, aux prélèvements sociaux selon les règles en vigueur. Une simulation doit distinguer taux marginal et taux moyen et intégrer les éventuelles charges déductibles.',
    'Une TMI faible ne garantit pas qu\'une SCPI soit attractive : une mauvaise liquidité, une baisse des valeurs, un endettement élevé ou des frais importants peuvent peser bien davantage que la fiscalité.',
    'Les SCPI européennes peuvent être pertinentes pour diversifier un portefeuille. Leur fiscalité doit être analysée pays par pays selon les conventions, sans supposer qu\'elles sont automatiquement plus avantageuses à TMI 11 %.',
    'L\'assurance-vie peut être utile pour la capitalisation, la fiscalité des rachats ou la transmission, mais ses frais et son univers de supports doivent être comparés au direct. Une UC immobilière peut rester partiellement comprise dans l\'IFI.',
    'La nue-propriété peut être cohérente si l\'investisseur n\'a pas besoin de distributions pendant la période. Son intérêt dépend de la clé de démembrement et de l\'horizon, pas seulement de la TMI.',
    'Le crédit peut être étudié pour l\'effet de levier et la déductibilité éventuelle de certaines charges financières, mais le coût du financement et le cash-flow sont déterminants.',
  ],
  tableTitle: 'Options à comparer avec une TMI à 11 %',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage: 'Simplicité, accès large au marché et lecture directe des distributions.',
      vigilance: 'Fiscalité courante à intégrer avec les prélèvements sociaux et les charges éventuelles.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Diversification géographique et cycles immobiliers différents.',
      vigilance: 'Fiscalité pays par pays, risque de change hors zone euro et déclaration plus complexe.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Capitalisation dans le contrat et fiscalité propre aux rachats.',
      vigilance: 'Frais UC, liste de supports, distribution créditée et IFI éventuel à vérifier.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Pas de distributions attribuées au nu-propriétaire pendant le démembrement.',
      vigilance: 'Aucun revenu, liquidité réduite et clé de démembrement à analyser.',
    },
    {
      level: 'Crédit',
      advantage: 'Effet de levier et charges financières potentiellement déductibles sous conditions.',
      vigilance: 'Coût du crédit, endettement et cash-flow peuvent être plus importants que l\'avantage fiscal.',
    },
  ],
  tableNote:
    'À TMI 11 %, aucune enveloppe ne doit être choisie pour sa seule fiscalité. La comparaison doit rester patrimoniale et économique.',
  criteriaTitle: 'Critères à croiser avec une TMI à 11 %',
  criteriaCards: [
    { title: 'Qualité de la SCPI', text: 'TOF, valeurs, dette, collecte, patrimoine, gouvernance et liquidité sont prioritaires.' },
    { title: 'Net fiscal réel', text: 'Calculer le net après IR, prélèvements sociaux et charges sans transformer la TMI en taux moyen.' },
    { title: 'Frais', text: 'Comparer souscription, gestion, enveloppe, crédit et coûts de sortie sur l\'horizon retenu.' },
    { title: 'Horizon', text: 'L\'horizon détermine l\'importance des frais d\'entrée, de la liquidité et du choix de l\'enveloppe.' },
    { title: 'Besoin de revenus', text: 'La nue-propriété n\'est pas adaptée à un besoin de distributions immédiates.' },
    { title: 'Diversification', text: 'Éviter qu\'une optimisation fiscale marginale dégrade la diversification sectorielle ou géographique.' },
    { title: 'IFI', text: 'Si le foyer est concerné, vérifier le traitement selon le mode de détention.' },
  ],
  commonErrors: [
    'Considérer qu\'une TMI faible rend automatiquement toutes les SCPI intéressantes.',
    'Comparer uniquement le taux de distribution sans regarder la trajectoire, les valeurs et la liquidité.',
    'Présenter les SCPI européennes comme automatiquement plus avantageuses fiscalement.',
    'Choisir l\'assurance-vie uniquement pour la fiscalité sans intégrer les frais et les supports disponibles.',
    'Présenter la nue-propriété comme une économie fiscale sans valoriser les revenus abandonnés.',
    'Négliger le coût du crédit au motif que certaines charges sont potentiellement déductibles.',
  ],
  practicalCases: [
    {
      title: 'Direct France',
      text: 'La simulation distingue revenu foncier, prélèvements sociaux, charges déductibles éventuelles et situation globale du foyer avant de calculer le net réellement conservé.',
    },
    {
      title: 'SCPI européenne',
      text: 'Une SCPI européenne peut être retenue pour diversifier le patrimoine. L\'éventuel avantage fiscal est calculé séparément à partir de la fiche fiscale et des conventions concernées.',
    },
    {
      title: 'Assurance-vie',
      text: 'Le contrat peut être pertinent pour la capitalisation ou la transmission, mais le comparatif inclut les frais UC, la distribution créditée, la fiscalité du rachat et l\'IFI éventuel.',
    },
    {
      title: 'Nue-propriété',
      text: 'Un investisseur sans besoin de revenus peut étudier une nue-propriété, mais la décision dépend de la clé, de la durée, de la liquidité et de la qualité de la SCPI.',
    },
    {
      title: 'Crédit',
      text: 'Le financement peut créer un effet de levier, mais la pertinence se mesure après coût du crédit, assurance, garanties, fiscalité et scénario de baisse de valeur.',
    },
  ],
  methodParagraphs: [
    'Confirmer la TMI et distinguer taux marginal et taux moyen.',
    'Analyser d\'abord la qualité intrinsèque des SCPI.',
    'Calculer le net fiscal de la détention directe avec les règles applicables au foyer.',
    'Comparer les autres modes de détention uniquement s\'ils répondent à un objectif patrimonial réel.',
    'Intégrer les frais, l\'horizon, l\'IFI et la liquidité dans chaque scénario.',
    'Tester un scénario défavorable sur distribution et prix de part avant de conclure.',
  ],
  conclusionParagraphs: [
    'À TMI 11 %, la fiscalité doit être intégrée mais ne doit pas prendre le pas sur la sélection de la SCPI.',
    'La diversification, les valeurs, la dette, les frais et la liquidité expliquent souvent davantage le résultat final que l\'écart fiscal entre deux enveloppes.',
    'Le choix du mode de détention doit rester cohérent avec l\'horizon et le besoin de revenus.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles intéressantes avec une TMI à 11 % ?',
      answer: 'Elles peuvent l\'être, mais la TMI seule ne suffit pas. Il faut analyser le net fiscal, la qualité du support, les frais et la liquidité.',
    },
    {
      question: 'Faut-il privilégier les SCPI françaises ?',
      answer: 'Pas automatiquement. Une SCPI européenne peut apporter de la diversification ; le choix doit reposer sur la qualité du support et le net réel.',
    },
    {
      question: 'Les SCPI européennes sont-elles fiscalement meilleures ?',
      answer: 'Pas nécessairement. Le traitement dépend des pays et des conventions fiscales.',
    },
    {
      question: 'Le démembrement est-il utile à TMI 11 % ?',
      answer: 'Il peut l\'être pour un investisseur sans besoin de revenus, mais son intérêt dépend surtout de l\'horizon, de la clé et de la qualité de la SCPI.',
    },
    {
      question: 'Assurance-vie ou direct ?',
      answer: 'Le bon choix dépend des frais, des supports, de l\'horizon, de la fiscalité des rachats, de l\'IFI éventuel et de l\'objectif de transmission.',
    },
    {
      question: 'Les intérêts d\'emprunt sont-ils déductibles ?',
      answer: 'Certaines charges financières peuvent être déductibles lorsqu\'elles remplissent les conditions légales. Le traitement dépend du financement et de l\'affectation de la dette.',
    },
    {
      question: 'Quels critères regarder en priorité ?',
      answer: 'La qualité du patrimoine, le TOF, les valeurs, la dette, la collecte, la liquidité, les frais et la cohérence avec l\'horizon.',
    },
    {
      question: 'Comment MaximusSCPI traite une TMI à 11 % ?',
      answer: 'MaximusSCPI calcule le net fiscal sans automatiser l\'allocation puis croise ce résultat avec les indicateurs de risque, de valeur et de liquidité.',
    },
  ],
  comparateurCtaLabel: 'Analyser le rendement net SCPI avec une TMI à 11 %',
}
