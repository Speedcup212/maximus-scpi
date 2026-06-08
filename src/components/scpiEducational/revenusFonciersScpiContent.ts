import type { ScpiEducationalPageConfig } from './shared'

export const revenusFonciersScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-fonciers/',
  badge: 'Fiscalité SCPI',
  h1: 'Revenus fonciers SCPI : imposition, fiscalité et rendement net',
  heroSubtitle:
    'Les revenus distribués par une SCPI française sont généralement qualifiés de revenus fonciers. Leur imposition dépend de la TMI, des prélèvements sociaux et du régime fiscal applicable.',
  seoTitle: 'Revenus fonciers SCPI : fiscalité, prélèvements sociaux et déclaration',
  seoDescription:
    'Comprenez les revenus fonciers issus des SCPI : fiscalité française, prélèvements sociaux, TMI, rendement net, déduction des intérêts d\'emprunt et points de vigilance.',
  shortAnswerTitle: 'Comment sont imposés les revenus fonciers de SCPI ?',
  shortAnswer:
    'Les revenus distribués par une SCPI française sont imposés comme des revenus fonciers : au barème progressif de l\'IR (selon la TMI) + prélèvements sociaux. Le rendement net fiscal peut être très différent du rendement brut affiché. Les intérêts d\'emprunt sont déductibles des revenus fonciers, ce qui peut réduire l\'imposition.',
  keyMessage:
    'Les revenus fonciers de SCPI doivent être analysés nets de fiscalité. Le rendement affiché peut être très différent du rendement réellement conservé.',
  definitionParagraphs: [
    'Les revenus distribués par une SCPI française sont, en règle générale, imposés dans la catégorie des revenus fonciers. La société de gestion communique chaque année le montant des revenus à déclarer.',
    'Le calcul de l\'impôt sur les revenus fonciers s\'effectue après déduction des éventuelles charges : intérêts d\'emprunt, frais de gestion, assurance-emprunteur, etc. Le régime micro-foncier n\'est généralement pas applicable aux SCPI.',
    'Les revenus fonciers s\'ajoutent aux autres revenus du foyer fiscal (salaires, pensions, BIC, etc.) et sont soumis au barème progressif de l\'impôt sur le revenu. Le taux effectif dépend de l\'ensemble des revenus.',
    'Les prélèvements sociaux (au taux en vigueur) s\'appliquent sur le montant brut des revenus fonciers, avant déduction des éventuelles charges. Ils sont prélevés par voie de rôle ou directement par la société de gestion selon les cas.',
    'Si la SCPI investit également à l\'étranger, une partie des revenus peut être qualifiée de revenus étrangers et bénéficier d\'un traitement fiscal spécifique (crédit d\'impôt, taux effectif).',
    'En cas d\'investissement à crédit, les intérêts d\'emprunt sont déductibles des revenus fonciers, ce qui peut réduire l\'imposition. L\'effet de levier fiscal dépend du taux d\'emprunt et de la TMI.',
  ],
  tableTitle: 'Éléments fiscaux à intégrer dans l\'analyse',
  tableRows: [
    {
      level: 'TMI',
      advantage: 'Le rendement net est d\'autant plus réduit que la TMI est élevée.',
      vigilance: 'À TMI 41 % ou 45 %, le cumul IR + PS peut dépasser 50 % des revenus bruts.',
    },
    {
      level: 'Prélèvements sociaux',
      advantage: 'S\'appliquent sur les revenus fonciers bruts, avant déduction des charges.',
      vigilance: 'Le taux en vigueur est à vérifier. Il peut évoluer.',
    },
    {
      level: 'Intérêts d\'emprunt',
      advantage: 'Déductibles des revenus fonciers. Réduisent la base imposable.',
      vigilance: 'Sous réserve des conditions de déductibilité. À vérifier selon la réglementation.',
    },
    {
      level: 'Régime micro-foncier',
      advantage: 'Abattement forfaitaire de 30 % sous conditions de seuil.',
      vigilance: 'Généralement non applicable aux SCPI. Se renseigner selon les cas.',
    },
    {
      level: 'Régime réel',
      advantage: 'Déduction des charges réelles (intérêts, frais de gestion, assurance).',
      vigilance: 'Nécessite une déclaration spécifique. À évaluer selon le montant des charges.',
    },
    {
      level: 'Revenus étrangers',
      advantage: 'Crédit d\'impôt ou taux effectif possibles. Amélioration du rendement net.',
      vigilance: 'Traitement différent des revenus fonciers français. Déclaration séparée.',
    },
  ],
  tableNote:
    'Les règles fiscales applicables aux revenus fonciers peuvent évoluer. À vérifier selon la réglementation en vigueur.',
  criteriaTitle: 'Critères à croiser avec les revenus fonciers',
  criteriaCards: [
    { title: 'TMI', text: 'La TMI détermine le poids de l\'IR sur les revenus fonciers. Plus elle est élevée, plus le rendement net est réduit.' },
    { title: 'Prélèvements sociaux', text: 'Ils s\'ajoutent à l\'IR et s\'appliquent sur les revenus bruts. Leur impact est indépendant de la TMI.' },
    { title: 'Intérêts d\'emprunt', text: 'Déductibles des revenus fonciers. L\'effet de levier fiscal dépend du taux d\'emprunt, de la TMI et des revenus.' },
    { title: 'Frais de gestion', text: 'Les frais de gestion de la SCPI sont inclus dans le rendement brut affiché. Ils ne sont pas déductibles en sus.' },
    { title: 'Origine des revenus', text: 'Les revenus étrangers peuvent avoir un traitement fiscal différent. À vérifier selon les conventions.' },
    { title: 'Régime fiscal', text: 'Micro-foncier ou réel ? Le choix du régime (lorsqu\'il est possible) impacte le calcul de l\'impôt.' },
  ],
  commonErrors: [
    'Confondre rendement brut annoncé et rendement net après fiscalité.',
    'Oublier que les prélèvements sociaux s\'appliquent sur le brut, pas sur le net de charges.',
    'Croire que le micro-foncier est toujours applicable aux SCPI.',
    'Négliger la déduction des intérêts d\'emprunt en cas d\'investissement à crédit.',
    'Ne pas distinguer revenus français et étrangers dans la déclaration.',
  ],
  practicalCases: [
    {
      title: 'TMI 30 %, 5 000 € de revenus fonciers SCPI',
      text: 'Revenus bruts : 5 000 €. IR à 30 % = 1 500 €. PS = 875 €. Impôt total = 2 375 €. Rendement net = 52,5 % du brut.',
    },
    {
      title: 'TMI 30 % avec intérêts d\'emprunt',
      text: 'Revenus bruts : 5 000 €, intérêts d\'emprunt : 1 000 €. Revenus nets imposables : 4 000 €. IR à 30 % = 1 200 €. PS sur brut = 875 €. Impôt total = 2 075 €. Économie d\'IR = 300 €.',
    },
    {
      title: 'SCPI européenne avec revenus étrangers',
      text: 'Les revenus étrangers ne sont pas imposés comme des revenus fonciers français. Ils bénéficient d\'un traitement fiscal spécifique (crédit d\'impôt ou taux effectif).',
    },
  ],
  methodParagraphs: [
    'Relever le rendement brut annoncé (TDVM ou taux de distribution sur VR).',
    'Identifier la part française et la part étrangère des revenus.',
    'Calculer l\'impôt estimé : IR selon TMI + prélèvements sociaux.',
    'Déduire les intérêts d\'emprunt le cas échéant.',
    'Estimer le rendement net fiscal.',
    'Comparer avec les alternatives disponibles.',
  ],
  conclusionParagraphs: [
    'Les revenus fonciers de SCPI sont fiscalisés de manière significative. Le rendement net fiscal peut être très inférieur au rendement brut, surtout aux TMI élevées.',
    'L\'analyse ne doit pas s\'arrêter au rendement brut. La fiscalité, les intérêts d\'emprunt, l\'origine des revenus et le mode de détention doivent être intégrés.',
  ],
  faqItems: [
    {
      question: 'Les revenus de SCPI sont-ils des revenus fonciers ?',
      answer: 'En règle générale, oui. Les revenus distribués par une SCPI française sont imposés dans la catégorie des revenus fonciers. La société de gestion communique chaque année le montant à déclarer.',
    },
    {
      question: 'Comment sont imposés les revenus fonciers SCPI ?',
      answer: 'Ils sont soumis au barème progressif de l\'IR (selon la TMI) + prélèvements sociaux. Le calcul tient compte des éventuelles charges déductibles (intérêts d\'emprunt).',
    },
    {
      question: 'Les prélèvements sociaux s\'appliquent-ils ?',
      answer: 'Oui, les prélèvements sociaux s\'appliquent sur les revenus fonciers bruts. Le taux en vigueur est à vérifier au moment de l\'imposition.',
    },
    {
      question: 'Peut-on déduire les intérêts d\'emprunt ?',
      answer: 'Oui, les intérêts d\'emprunt sont déductibles des revenus fonciers, sous réserve des conditions de déductibilité applicables. Cela réduit la base imposable.',
    },
    {
      question: 'Micro-foncier ou régime réel ?',
      answer: 'Certains contribuables peuvent relever du micro-foncier (abattement de 30 %) si leurs revenus fonciers n\'excèdent pas un certain seuil. Ce régime n\'est généralement pas applicable aux SCPI, mais il convient de vérifier.',
    },
    {
      question: 'Quelle différence avec les revenus étrangers ?',
      answer: 'Les revenus étrangers de SCPI ne sont pas imposés comme des revenus fonciers français. Ils bénéficient d\'un traitement spécifique selon la convention fiscale applicable.',
    },
    {
      question: 'Comment calculer le rendement net ?',
      answer: 'Rendement net fiscal estimé = rendement brut − IR (TMI × rendement brut) − prélèvements sociaux. Cette estimation est indicative.',
    },
    {
      question: 'Comment MaximusSCPI analyse les revenus fonciers ?',
      answer: 'MaximusSCPI analyse le rendement brut, la fiscalité applicable, l\'origine des revenus et le mode de détention pour estimer le rendement net. L\'approche est pédagogique.',
    },
  ],
}
