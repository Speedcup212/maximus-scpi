import type { ScpiEducationalPageConfig } from './shared'

export const scpiEuropeennesConfig: ScpiEducationalPageConfig = {
  path: '/scpi-europeennes',
  badge: 'Diversification internationale — Page pilier',
  h1: 'SCPI européennes : fiscalité, diversification et critères à analyser',
  heroSubtitle:
    'Les SCPI européennes permettent d’accéder à des marchés immobiliers situés hors de France. Leur intérêt peut venir de la diversification géographique, des cycles immobiliers différents et d’un traitement fiscal conventionnel spécifique. Il n’existe toutefois ni avantage fiscal uniforme ni rendement net européen standard : l’analyse doit être menée pays par pays et SCPI par SCPI.',
  seoTitle: 'SCPI européennes : fiscalité, conventions, rendement net et diversification',
  seoDescription:
    'Guide SCPI européennes : fiscalité des revenus étrangers, conventions fiscales, crédit d’impôt, taux effectif, risques pays, change, rendement net et diversification.',
  shortAnswerTitle: 'Pourquoi analyser les SCPI européennes ?',
  shortAnswer:
    'Une SCPI européenne est un véhicule français qui détient tout ou partie de son patrimoine immobilier hors de France. Les revenus provenant de ces immeubles suivent les règles de la convention fiscale entre la France et le pays concerné. Selon la convention, l’élimination de la double imposition peut passer notamment par un crédit d’impôt égal à l’impôt français, un crédit d’impôt égal à l’impôt étranger ou un mécanisme équivalent au taux effectif. La fiscalité n’est donc jamais identique pour toute l’Europe. L’analyse doit aussi porter sur la qualité des actifs, le TOF, l’endettement, les frais, la liquidité et le risque de change hors zone euro.',
  keyMessage:
    'Le bon comparatif n’est pas France contre Europe en bloc : il faut comparer les SCPI sur leurs actifs et recalculer la fiscalité selon la géographie réelle des revenus.',
  definitionParagraphs: [
    'Une SCPI européenne est une SCPI de droit français dont le patrimoine comprend des immeubles situés dans un ou plusieurs pays européens. Elle peut être paneuropéenne ou, au contraire, très concentrée sur un seul pays.',
    'Le principe général des conventions fiscales est que les revenus immobiliers sont imposables dans l’État où se situe l’immeuble. Pour un résident fiscal français, la France peut néanmoins tenir compte de ces revenus selon le mécanisme prévu par la convention afin d’éviter la double imposition.',
    'La notice française 2047 distingue notamment les crédits d’impôt égaux à l’impôt payé à l’étranger et les crédits d’impôt égaux à l’impôt français. Ces mécanismes n’ont pas le même effet et ne doivent pas être remplacés par un calcul simplifié du type « TMI moins impôt étranger ».',
    'Le traitement des prélèvements sociaux dépend lui aussi de la nature du revenu et du mécanisme conventionnel applicable. Un revenu étranger n’est ni automatiquement soumis à 17,2 %, ni automatiquement exonéré. Il faut utiliser la fiche fiscale de la société de gestion et les règles françaises de déclaration de l’année concernée.',
    'Une SCPI européenne peut être intéressante à faible comme à forte TMI, mais pour des raisons différentes. La diversification géographique peut être pertinente indépendamment de la fiscalité, tandis qu’une TMI élevée peut accroître l’intérêt d’une comparaison nette plus détaillée.',
    'Le risque immobilier reste le risque principal : prix d’acquisition des actifs, qualité des locataires, vacance, durée des baux, financement et profondeur du marché local peuvent avoir plus d’impact sur la performance future qu’un avantage fiscal théorique.',
    'Hors zone euro, un risque de change s’ajoute lorsque les loyers ou la valeur des actifs sont exposés à une devise étrangère. Il faut vérifier si la SCPI couvre ce risque et à quel coût.',
    'L’étiquette « européenne » ne garantit pas la diversification. Une SCPI concentrée sur deux villes ou une seule classe d’actifs peut être moins diversifiée qu’une SCPI française multi-sectorielle.',
  ],
  tableTitle: 'Dimension / intérêt potentiel / vigilance',
  tableRows: [
    { level: 'Fiscalité internationale', advantage: 'Mécanisme conventionnel destiné à éviter la double imposition.', vigilance: 'Convention différente selon chaque pays ; calcul net à réaliser par géographie.' },
    { level: 'Diversification géographique', advantage: 'Accès à plusieurs économies et cycles immobiliers.', vigilance: 'Une forte concentration sur un pays ou une ville peut réduire l’intérêt de diversification.' },
    { level: 'Risque de change', advantage: 'Diversification monétaire possible hors zone euro.', vigilance: 'La devise peut amplifier les gains comme les pertes ; vérifier la politique de couverture.' },
    { level: 'Baux et droit local', advantage: 'Certaines juridictions offrent des baux longs ou des structures locatives différentes.', vigilance: 'Comparer les durées fermes, indexations, charges, protections du locataire et pratiques locales.' },
    { level: 'Liquidité', advantage: 'La diversification du patrimoine peut soutenir l’attractivité de la SCPI.', vigilance: 'La liquidité des parts n’est jamais garantie et dépend du mécanisme de la SCPI et de l’équilibre souscriptions/retraits.' },
    { level: 'Gestionnaire', advantage: 'Une équipe expérimentée localement peut mieux sourcer et gérer les actifs.', vigilance: 'Vérifier l’historique du gestionnaire dans les pays ciblés plutôt que son seul discours commercial.' },
  ],
  tableNote:
    'Les conventions fiscales peuvent évoluer. La fiche fiscale annuelle de la société de gestion et la notice fiscale officielle de l’année de déclaration priment sur tout exemple générique.',
  criteriaTitle: 'Critères à croiser pour analyser une SCPI européenne',
  criteriaCards: [
    { title: 'Répartition par pays', text: 'Mesurer la concentration réelle et l’exposition à chaque convention fiscale.' },
    { title: 'Rendement net', text: 'Recalculer après fiscalité étrangère, mécanisme conventionnel français et frais, sans taux fiscal européen unique.' },
    { title: 'TOF', text: 'Indicateur d’occupation utile, mais ni garantie de loyers ni garantie de performance future.' },
    { title: 'WALT / WALB', text: 'Comparer la durée des baux avec les pratiques locales et la qualité des locataires.' },
    { title: 'Prix et valeurs d’expertise', text: 'Croiser prix de part, valeur de reconstitution et évolution des expertises immobilières.' },
    { title: 'Endettement', text: 'Analyser niveau, coût, maturité et devise de la dette.' },
    { title: 'Frais', text: 'Contrôler souscription, acquisition, gestion et éventuels coûts liés aux structures étrangères.' },
    { title: 'Change', text: 'Identifier les expositions hors euro et la politique de couverture.' },
    { title: 'Liquidité', text: 'Observer retraits en attente, collecte et mécanisme de marché secondaire selon le type de capital.' },
    { title: 'Gestionnaire', text: 'Évaluer présence locale, équipes, sourcing, historique de cessions et gestion des actifs.' },
  ],
  commonErrors: [
    'Écrire qu’une SCPI européenne bénéficie automatiquement de « 0 % de prélèvements sociaux ».',
    'Appliquer un crédit d’impôt identique à tous les pays européens.',
    'Comparer un taux de distribution brut français à un rendement net européen.',
    'Présenter une TMI élevée comme une raison suffisante pour privilégier l’Europe.',
    'Ignorer l’impôt éventuellement acquitté à l’étranger et les modalités françaises de déclaration.',
    'Confondre étiquette européenne et diversification réelle.',
    'Négliger le risque de change et le risque immobilier local.',
  ],
  practicalCases: [
    { title: 'SCPI réellement paneuropéenne', text: 'Une SCPI répartit ses actifs entre plusieurs pays. L’investisseur ventile les revenus par pays à partir de l’IFU ou de la fiche fiscale puis applique le mécanisme conventionnel indiqué, au lieu d’utiliser un taux moyen européen.' },
    { title: 'SCPI concentrée', text: 'Une SCPI affiche une marque européenne mais réalise l’essentiel de ses loyers dans un seul pays. La concentration immobilière, économique et fiscale doit être analysée comme telle.' },
    { title: 'Investissement hors zone euro', text: 'Une acquisition au Royaume-Uni ajoute un risque GBP/EUR. Le rendement immobilier doit être distingué de l’effet de change et du coût éventuel de couverture.' },
    { title: 'Comparaison France / Europe', text: 'Deux SCPI sont comparées avec les mêmes hypothèses de distribution et de variation de part. La fiscalité est ensuite appliquée selon l’origine réelle des revenus ; aucune conclusion n’est tirée du seul taux de distribution.' },
  ],
  methodParagraphs: [
    'Cartographier les pays, secteurs, locataires et devises du patrimoine.',
    'Récupérer la fiche fiscale annuelle et identifier le mécanisme de double imposition applicable à chaque pays.',
    'Calculer un rendement net après impôts étrangers, fiscalité française résiduelle éventuelle et frais.',
    'Croiser cette lecture avec TOF, WALT/WALB, endettement, prix de part, valeurs d’expertise et liquidité.',
    'Tester un scénario de baisse de loyers, de valeur immobilière ou de change avant de retenir l’allocation.',
  ],
  conclusionParagraphs: [
    'Les SCPI européennes peuvent enrichir une allocation, mais leur fiscalité est plus complexe qu’un simple avantage de TMI.',
    'La diversification géographique n’a de valeur que si la qualité des actifs, les prix d’acquisition et la gestion locale sont cohérents.',
    'Pour la déclaration, les documents officiels de la société de gestion et les conventions fiscales applicables doivent être vérifiés chaque année.',
  ],
  faqItems: [
    { question: 'Les SCPI européennes sont-elles exonérées de prélèvements sociaux ?', answer: 'Pas de manière générale. Le traitement dépend de la nature des revenus et du mécanisme conventionnel applicable. Il faut utiliser la fiche fiscale et les règles de l’année concernée.' },
    { question: 'Les revenus étrangers sont-ils imposés deux fois ?', answer: 'Les conventions fiscales prévoient des mécanismes destinés à éviter la double imposition, par exemple un crédit d’impôt ou une méthode de taux effectif. Le mécanisme exact dépend du pays.' },
    { question: 'Une SCPI européenne est-elle meilleure à TMI 41 % ou 45 % ?', answer: 'Pas automatiquement. Une forte TMI rend la comparaison fiscale plus importante, mais la qualité immobilière, les frais, les risques et la convention fiscale restent déterminants.' },
    { question: 'Comment comparer deux SCPI européennes ?', answer: 'Comparer d’abord patrimoine, prix, TOF, baux, endettement, liquidité et gestionnaire, puis recalculer la fiscalité selon les pays d’exposition.' },
    { question: 'Faut-il déclarer les revenus étrangers ?', answer: 'Oui lorsque les règles françaises l’exigent. La société de gestion fournit généralement une fiche fiscale détaillée, à rapprocher de la notice 2047 et des conventions applicables.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI européennes',
}
