import type { ScpiEducationalPageConfig } from './shared'

export const revenusFonciersScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-revenus-fonciers/',
  badge: 'Fiscalité SCPI',
  h1: 'Revenus fonciers SCPI : imposition, fiscalité et rendement net',
  heroSubtitle:
    'Les revenus distribués par une SCPI française sont généralement qualifiés de revenus fonciers. Leur imposition dépend de la TMI, des prélèvements sociaux et du régime fiscal applicable. Comprendre ce mécanisme est essentiel pour estimer le rendement réellement conservé.',
  seoTitle: 'Revenus fonciers SCPI : fiscalité, imposition, TMI et prélèvements sociaux',
  seoDescription:
    'Analyse complète des revenus fonciers issus des SCPI : fiscalité française, barème IR, prélèvements sociaux, TMI, rendement net, déduction des intérêts d\'emprunt, micro-foncier. Cas pratiques et exemples chiffrés.',
  shortAnswerTitle: 'Comment sont imposés les revenus fonciers de SCPI ?',
  shortAnswer:
    'Les revenus distribués par une SCPI française sont imposés comme des revenus fonciers : au barème progressif de l\'impôt sur le revenu (selon la TMI du foyer fiscal) + prélèvements sociaux au taux en vigueur. Le rendement net fiscal peut être très inférieur au rendement brut affiché. Les intérêts d\'emprunt sont déductibles des revenus fonciers en cas d\'acquisition à crédit. Le régime micro-foncier n\'est généralement pas applicable aux SCPI. Les revenus de source étrangère (SCPI européennes) relèvent d\'un régime fiscal différent.',
  keyMessage:
    'Les revenus fonciers de SCPI doivent être analysés nets de fiscalité. Le rendement affiché peut être très différent du rendement réellement conservé, en particulier aux TMI élevées.',
  definitionParagraphs: [
    'Les revenus distribués par une SCPI française sont, en règle générale, imposés dans la catégorie des revenus fonciers. La société de gestion communique chaque année le montant des revenus à déclarer, ainsi que la répartition entre revenus français et étrangers le cas échéant.',
    'Le calcul de l\'impôt sur les revenus fonciers s\'effectue après déduction des éventuelles charges déductibles : intérêts d\'emprunt, frais de gestion, assurance-emprunteur, etc. Le régime micro-foncier (abattement forfaitaire de 30 %) n\'est généralement pas applicable aux SCPI, car elles sont soumises au régime réel par nature.',
    'Les revenus fonciers s\'ajoutent aux autres revenus du foyer fiscal (salaires, pensions, BIC, etc.) et sont soumis au barème progressif de l\'impôt sur le revenu. Le taux effectif d\'imposition dépend donc de l\'ensemble des revenus du foyer.',
    'Les prélèvements sociaux (CSG, CRDS, etc.) s\'appliquent sur le montant brut des revenus fonciers, avant déduction des éventuelles charges. Leur taux global est fixé par la loi et peut évoluer.',
    'En cas d\'investissement à crédit, les intérêts d\'emprunt sont déductibles des revenus fonciers, sous réserve des conditions de déductibilité applicables. Cette déduction réduit la base imposable et peut améliorer le rendement net.',
    'Si la SCPI investit également à l\'étranger, une partie des revenus peut être qualifiée de revenus étrangers et bénéficier d\'un traitement fiscal spécifique : crédit d\'impôt ou taux effectif selon la convention fiscale applicable.',
    'La distinction entre revenus français et étrangers est importante car elle détermine les règles d\'imposition, les formulaires déclaratifs et le montant des prélèvements sociaux applicables.',
  ],
  tableTitle: 'Éléments fiscaux à intégrer dans l\'analyse des revenus fonciers',
  tableRows: [
    {
      level: 'TMI',
      advantage: 'Le rendement net après impôt dépend directement de la TMI du foyer.',
      vigilance: 'À TMI 41 % ou 45 %, le cumul IR + PS peut dépasser 60 % des revenus bruts.',
    },
    {
      level: 'Prélèvements sociaux',
      advantage: 'S\'appliquent sur les revenus fonciers bruts, avant déduction des charges.',
      vigilance: 'Le taux en vigueur est à vérifier au moment de l\'imposition. Il peut évoluer.',
    },
    {
      level: 'Intérêts d\'emprunt',
      advantage: 'Déductibles des revenus fonciers. Réduisent la base imposable.',
      vigilance: 'Sous réserve des conditions de déductibilité. À vérifier selon la réglementation en vigueur.',
    },
    {
      level: 'Régime micro-foncier',
      advantage: 'Abattement forfaitaire de 30 % sous conditions de seuil.',
      vigilance: 'Généralement non applicable aux SCPI. À vérifier selon les cas.',
    },
    {
      level: 'Régime réel',
      advantage: 'Déduction des charges réelles (intérêts, frais de gestion, assurance).',
      vigilance: 'Nécessite une déclaration spécifique si opté. À évaluer selon le montant des charges.',
    },
    {
      level: 'Revenus étrangers',
      advantage: 'Crédit d\'impôt ou taux effectif possibles. Amélioration potentielle du rendement net.',
      vigilance: 'Traitement différent des revenus fonciers français. Déclaration séparée obligatoire.',
    },
  ],
  tableNote:
    'Les règles fiscales applicables aux revenus fonciers peuvent évoluer chaque année. À vérifier selon la réglementation en vigueur.',
  criteriaTitle: 'Critères à croiser avec les revenus fonciers',
  criteriaCards: [
    { title: 'TMI', text: 'La TMI détermine le poids de l\'IR sur les revenus fonciers. Plus elle est élevée, plus le rendement net est réduit. À TMI 45 %, près de la moitié du rendement brut peut être prélevée par l\'IR seul.' },
    { title: 'Prélèvements sociaux', text: 'Ils s\'ajoutent à l\'IR et s\'appliquent sur le brut. Leur impact est indépendant de la TMI et peut représenter environ 17,5 % supplémentaires.' },
    { title: 'Intérêts d\'emprunt', text: 'Déductibles des revenus fonciers. L\'effet de levier fiscal dépend du taux d\'emprunt, de la TMI et du montant des intérêts.' },
    { title: 'Frais de gestion', text: 'Les frais de gestion de la SCPI sont inclus dans le rendement brut affiché. Ils ne sont pas déductibles en sus pour l\'investisseur.' },
    { title: 'Origine des revenus', text: 'Revenus français ou étrangers : les règles d\'imposition, les formulaires et les PS diffèrent.' },
    { title: 'Mode de détention', text: 'Direct, AV, démembrement : le traitement fiscal des revenus varie selon l\'enveloppe choisie.' },
    { title: 'Horizon', text: 'Un horizon long permet d\'envisager des solutions à fiscalité différée qui modifient l\'imposition des revenus fonciers.' },
  ],
  commonErrors: [
    'Confondre rendement brut affiché et rendement net après fiscalité personnelle.',
    'Oublier que les prélèvements sociaux s\'appliquent sur le montant brut, pas sur le net de charges.',
    'Croire que le micro-foncier est toujours applicable aux SCPI (en pratique, le régime réel s\'applique généralement).',
    'Négliger la déduction des intérêts d\'emprunt en cas d\'investissement à crédit.',
    'Ne pas distinguer revenus français et étrangers dans la déclaration de revenus.',
    'Sous-estimer l\'impact cumulé de l\'IR et des PS sur le rendement net.',
  ],
  practicalCases: [
    {
      title: 'TMI 11 % — Revenus fonciers 5 000 €',
      text: 'IR = 550 €. PS = 875 € (taux en vigueur). Total = 1 425 €. Rendement net = 71,5 % du brut. L\'impact fiscal est modéré.',
    },
    {
      title: 'TMI 30 % — Revenus fonciers 5 000 €',
      text: 'IR = 1 500 €. PS = 875 €. Total = 2 375 €. Rendement net = 52,5 % du brut. L\'écart avec le brut devient significatif.',
    },
    {
      title: 'TMI 41 % — Revenus fonciers 5 000 €',
      text: 'IR = 2 050 €. PS = 875 €. Total = 2 925 €. Rendement net = 41,5 % du brut. L\'analyse des alternatives est recommandée.',
    },
    {
      title: 'TMI 30 % avec intérêts d\'emprunt',
      text: 'Revenus bruts : 5 000 €, intérêts d\'emprunt : 1 000 €. Revenus nets imposables : 4 000 €. IR à 30 % = 1 200 €. PS sur brut = 875 €. Total = 2 075 € (contre 2 375 € sans crédit). Économie d\'IR : 300 €.',
    },
    {
      title: 'Absence de besoin de revenus — Capitalisation en AV',
      text: 'Les revenus de SCPI en assurance-vie sont capitalisés. Ils ne sont pas imposés annuellement comme des revenus fonciers. La fiscalité n\'intervient qu\'en cas de rachat.',
    },
  ],
  methodParagraphs: [
    'Relever le rendement brut annoncé (TDVM ou taux de distribution sur VR).',
    'Identifier la part française et la part étrangère des revenus.',
    'Calculer l\'impôt estimé : IR selon TMI + prélèvements sociaux.',
    'Déduire les intérêts d\'emprunt le cas échéant.',
    'Estimer le rendement net fiscal après impôt.',
    'Comparer avec les alternatives disponibles (AV, Europe, nue-propriété).',
    'Ne pas conclure sur le seul rendement brut.',
  ],
  conclusionParagraphs: [
    'Les revenus fonciers de SCPI sont fiscalisés de manière significative. Le rendement net fiscal peut être très inférieur au rendement brut, surtout aux TMI élevées.',
    'L\'analyse ne doit pas s\'arrêter au rendement brut. La fiscalité, les intérêts d\'emprunt, l\'origine des revenus et le mode de détention doivent être intégrés dans toute décision d\'investissement.',
    'MaximusSCPI propose un comparateur pour analyser les rendements bruts et des articles spécialisés pour approfondir chaque aspect fiscal.',
  ],
  faqItems: [
    {
      question: 'Les revenus de SCPI sont-ils des revenus fonciers ?',
      answer: 'En règle générale, oui. Les revenus distribués par une SCPI française sont imposés dans la catégorie des revenus fonciers. La société de gestion communique chaque année le montant à déclarer.',
    },
    {
      question: 'Comment sont imposés les revenus fonciers SCPI ?',
      answer: 'Ils sont soumis au barème progressif de l\'IR (selon la TMI du foyer) + prélèvements sociaux. Le calcul tient compte des éventuelles charges déductibles.',
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
      answer: 'Le micro-foncier (abattement de 30 %) est applicable sous conditions de seuil, mais il n\'est généralement pas adapté aux SCPI. Le régime réel est la règle, permettant la déduction des charges réelles.',
    },
    {
      question: 'Quelle différence avec les revenus étrangers ?',
      answer: 'Les revenus étrangers de SCPI ne sont pas imposés comme des revenus fonciers français. Ils bénéficient d\'un traitement spécifique selon la convention fiscale applicable : crédit d\'impôt ou taux effectif.',
    },
    {
      question: 'Comment calculer le rendement net fiscal ?',
      answer: 'Estimation indicative : rendement brut − (TMI × rendement brut) − prélèvements sociaux (taux en vigueur × rendement brut). Exemple à TMI 30 % : 6 % − 1,8 % − 1,05 % = 3,15 % net estimé.',
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles concernées ?',
      answer: 'En assurance-vie, les revenus des SCPI sont capitalisés. Ils ne sont pas imposés annuellement comme des revenus fonciers. La fiscalité s\'applique en cas de rachat, sur la part de plus-value.',
    },
    {
      question: 'Faut-il déclarer les revenus de SCPI chaque année ?',
      answer: 'Oui, les revenus de SCPI (français comme étrangers) doivent être déclarés chaque année dans la déclaration de revenus. La société de gestion transmet les documents nécessaires.',
    },
    {
      question: 'Comment MaximusSCPI analyse les revenus fonciers ?',
      answer: 'MaximusSCPI analyse le rendement brut, la fiscalité applicable, l\'origine des revenus et le mode de détention pour estimer le rendement net. L\'approche est pédagogique et ne constitue pas un conseil personnalisé.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI par rendement brut et exposition',
}
