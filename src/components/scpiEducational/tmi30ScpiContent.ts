import type { ScpiEducationalPageConfig } from './shared'

export const tmi30ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-30',
  badge: 'Fiscalité & stratégie',
  h1: 'SCPI avec TMI 30 % : fiscalité, Europe et modes de détention',
  heroSubtitle:
    'Avec une tranche marginale d\'imposition à 30 %, la fiscalité des revenus fonciers français devient un paramètre important, mais elle ne suffit pas à déterminer la bonne stratégie. Il faut comparer le net fiscal, les frais, l\'origine des revenus, l\'IFI, la liquidité et l\'horizon.',
  seoTitle: 'SCPI TMI 30 % : fiscalité, rendement net, Europe, AV et crédit',
  seoDescription:
    'SCPI et TMI 30 % : rendement net, revenus français et étrangers, assurance-vie, démembrement, crédit, SCI à l\'IS et IFI.',
  shortAnswerTitle: 'Que change une TMI à 30 % pour un projet SCPI ?',
  shortAnswer:
    'Une TMI à 30 % augmente le poids marginal de l\'impôt sur les revenus fonciers français, auxquels peuvent s\'ajouter les prélèvements sociaux. Mais le taux marginal n\'est pas un taux moyen appliqué à tous les flux. La bonne méthode consiste à calculer le net réellement conservé puis à comparer, sans automatisme, le direct France, les revenus étrangers selon les conventions, l\'assurance-vie, la nue-propriété, le crédit et éventuellement une structure sociétaire.',
  keyMessage:
    'À TMI 30 %, la fiscalité compte, mais elle doit rester un élément de comparaison parmi la qualité de la SCPI, les frais, l\'IFI, l\'horizon et la liquidité.',
  definitionParagraphs: [
    'La TMI de 30 % s\'applique uniquement à la tranche marginale correspondante du revenu imposable. Elle ne signifie pas que l\'ensemble des revenus du foyer est taxé à 30 %.',
    'Les revenus fonciers français détenus en direct sont soumis au barème progressif et, en principe, aux prélèvements sociaux selon les règles en vigueur. Une simulation simplifiée TMI + prélèvements sociaux donne un ordre de grandeur marginal, pas le taux effectif réel du foyer.',
    'Le calcul peut être modifié par la nature des revenus, les charges déductibles et l\'effet fiscal de la CSG déductible lorsque les conditions sont réunies.',
    'Pour les revenus immobiliers étrangers, le traitement dépend de la convention fiscale conclue avec chaque pays. Il ne faut pas appliquer automatiquement un crédit d\'impôt ou un taux effectif identique à toute l\'Europe.',
    'L\'assurance-vie peut différer l\'imposition à l\'IR jusqu\'au rachat, mais ajoute les frais et contraintes du contrat. Une unité de compte immobilière peut rester partiellement taxable à l\'IFI.',
    'La nue-propriété peut être étudiée lorsque l\'investisseur n\'a pas besoin de distributions pendant la durée du démembrement. La clé représente la valeur économique des droits abandonnés pendant la période et ne constitue pas une économie fiscale garantie.',
    'Le crédit peut permettre la déduction de certaines charges financières lorsque les conditions sont réunies, mais le coût du financement et le cash-flow doivent être intégrés avant de conclure.',
    'Une SCI à l\'IS peut servir à capitaliser au niveau d\'une société, mais les parts de SCPI détenues en pleine propriété ne sont pas amortissables. L\'IS, les coûts de structure, la distribution future et la sortie doivent être modélisés.',
  ],
  tableTitle: 'Pistes à comparer avec une TMI à 30 %',
  tableRows: [
    {
      level: 'SCPI françaises en direct',
      advantage: 'Simplicité et accès large au marché.',
      vigilance: 'Fiscalité courante à calculer précisément, sans se limiter à une addition TMI + prélèvements sociaux.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Diversification et fiscalité pouvant différer selon les conventions.',
      vigilance: 'Analyse pays par pays indispensable ; déclaration plus complexe et risque de change hors zone euro.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Capitalisation dans le contrat et fiscalité propre aux rachats.',
      vigilance: 'Frais UC, liste de supports, IFI potentiel et modalités de sortie à intégrer.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Pas de distributions attribuées au nu-propriétaire pendant le démembrement.',
      vigilance: 'Aucun revenu, liquidité réduite, clé à analyser et IFI à vérifier selon le montage.',
    },
    {
      level: 'Crédit',
      advantage: 'Effet de levier et charges financières potentiellement déductibles sous conditions.',
      vigilance: 'Coût du crédit, cash-flow, garanties et risque de taux peuvent absorber le bénéfice fiscal.',
    },
    {
      level: 'SCI à l\'IS',
      advantage: 'Capitalisation possible dans la société après IS.',
      vigilance: 'Coûts, fiscalité de distribution et sortie. Pas d\'amortissement des parts de SCPI en pleine propriété.',
    },
  ],
  tableNote:
    'Aucune option n\'est automatiquement supérieure à TMI 30 %. Les comparaisons doivent être faites en net après fiscalité, frais et risques.',
  criteriaTitle: 'Critères à croiser avec une TMI à 30 %',
  criteriaCards: [
    { title: 'Net fiscal réel', text: 'Distinguer taux marginal, taux moyen, prélèvements sociaux et charges déductibles.' },
    { title: 'Origine des revenus', text: 'Ventiler France et étranger puis appliquer les conventions fiscales concernées.' },
    { title: 'Besoin de revenus', text: 'Un besoin immédiat peut rendre la nue-propriété ou certaines stratégies de capitalisation inadaptées.' },
    { title: 'Horizon', text: 'L\'horizon influence l\'impact des frais, du crédit, du démembrement et de l\'assurance-vie.' },
    { title: 'IFI', text: 'Le traitement dépend du mode de détention et de la fraction immobilière taxable.' },
    { title: 'Liquidité', text: 'Comparer les mécanismes de retrait ou de cession avant de rechercher un avantage fiscal.' },
    { title: 'Qualité de la SCPI', text: 'TOF, valeurs, dette, collecte, patrimoine et gouvernance restent prioritaires.' },
  ],
  commonErrors: [
    'Appliquer 30 % à l\'ensemble des revenus au lieu de raisonner par tranche marginale.',
    'Présenter les SCPI européennes comme automatiquement plus avantageuses fiscalement.',
    'Présenter l\'assurance-vie comme automatiquement hors IFI.',
    'Présenter la nue-propriété comme une économie d\'impôt sans valoriser les revenus abandonnés.',
    'Supposer qu\'une SCI à l\'IS permet d\'amortir les parts de SCPI en pleine propriété.',
    'Choisir un montage uniquement pour sa fiscalité sans intégrer les frais, le risque et la liquidité.',
  ],
  practicalCases: [
    {
      title: 'Direct France',
      text: 'La simulation distingue revenu foncier, prélèvements sociaux, charges déductibles éventuelles et situation globale du foyer avant de calculer le net réellement conservé.',
    },
    {
      title: 'Revenus étrangers',
      text: 'Une SCPI investit dans plusieurs pays. La fiche fiscale annuelle permet de ventiler les revenus et d\'appliquer les conventions concernées au lieu d\'utiliser un taux moyen européen.',
    },
    {
      title: 'Assurance-vie',
      text: 'La fiscalité à l\'IR est différée jusqu\'au rachat, mais le comparatif intègre les frais UC, la distribution réellement créditée, l\'IFI éventuel et la fiscalité de sortie.',
    },
    {
      title: 'Nue-propriété',
      text: 'L\'investisseur n\'a pas besoin de revenus pendant plusieurs années. La décision dépend de la clé proposée, de la valeur future des parts, de la liquidité et de la qualité de la SCPI.',
    },
    {
      title: 'Crédit',
      text: 'La déductibilité éventuelle de certaines charges financières doit être comparée au coût total du crédit, au cash-flow et au risque de baisse de valeur des parts.',
    },
  ],
  methodParagraphs: [
    'Confirmer la TMI et distinguer taux marginal et taux moyen d\'imposition.',
    'Ventiler les revenus SCPI par nature et par pays.',
    'Calculer le net de la détention directe avec les règles applicables au foyer.',
    'Comparer plusieurs modes de détention sur un même horizon et avec des supports de risque comparable.',
    'Intégrer frais, IFI, liquidité et besoin de revenus dans chaque scénario.',
    'Tester des scénarios défavorables sur distribution, prix de part et coût du crédit.',
    'Écarter les solutions dont l\'avantage dépend d\'une hypothèse fiscale non vérifiée.',
  ],
  conclusionParagraphs: [
    'À TMI 30 %, la fiscalité devient importante mais ne justifie aucune allocation automatique.',
    'Le bon arbitrage résulte d\'une comparaison en net après fiscalité, frais, IFI et liquidité.',
    'La qualité de la SCPI reste le premier filtre avant le choix de l\'enveloppe.',
  ],
  faqItems: [
    {
      question: 'Les SCPI sont-elles fiscalement pénalisées à TMI 30 % ?',
      answer: 'La fiscalité des revenus fonciers français peut réduire sensiblement le rendement net, mais le calcul dépend du foyer, des charges et du mode de détention.',
    },
    {
      question: 'Faut-il privilégier les SCPI européennes ?',
      answer: 'Non automatiquement. Leur fiscalité varie selon les conventions et leur qualité immobilière doit être analysée séparément.',
    },
    {
      question: 'Le démembrement est-il pertinent à TMI 30 % ?',
      answer: 'Il peut l\'être si l\'investisseur n\'a pas besoin de revenus et accepte une liquidité réduite. La clé de démembrement reste déterminante.',
    },
    {
      question: 'Assurance-vie ou direct ?',
      answer: 'L\'assurance-vie peut différer l\'imposition à l\'IR jusqu\'au rachat, mais il faut intégrer les frais, les supports disponibles, la fiscalité du rachat et l\'IFI éventuel.',
    },
    {
      question: 'Les intérêts d\'emprunt sont-ils déductibles ?',
      answer: 'Certaines charges financières peuvent être déductibles des revenus fonciers lorsqu\'elles remplissent les conditions légales. Le traitement dépend du financement et de l\'affectation de la dette.',
    },
    {
      question: 'La SCI à l\'IS est-elle pertinente à TMI 30 % ?',
      answer: 'Elle peut être étudiée pour une logique de capitalisation, mais la TMI seule ne la justifie pas. Les coûts, l\'IS, les distributions futures et la sortie doivent être comparés.',
    },
    {
      question: 'Une SCI à l\'IS peut-elle amortir les parts de SCPI ?',
      answer: 'Non pour des parts détenues en pleine propriété. Elles sont des titres sans durée d\'utilisation limitée. L\'usufruit temporaire relève d\'un traitement différent.',
    },
    {
      question: 'Quel impact sur l\'IFI ?',
      answer: 'Le traitement dépend du mode de détention et de la fraction immobilière taxable. L\'assurance-vie et la nue-propriété ne sont pas automatiquement hors IFI.',
    },
    {
      question: 'Comment MaximusSCPI traite une TMI à 30 % ?',
      answer: 'MaximusSCPI compare les scénarios en net après fiscalité et frais puis croise ce résultat avec la qualité de la SCPI, l\'IFI, l\'horizon et la liquidité.',
    },
  ],
  comparateurCtaLabel: 'Comparer les scénarios SCPI avec une TMI à 30 %',
}
