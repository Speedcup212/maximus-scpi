import type { ScpiEducationalPageConfig } from './shared'

export const tmi11ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-11',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 11 % : quels critères analyser avant d’investir ?',
  heroSubtitle:
    'Une TMI à 11 % peut limiter le frottement fiscal par rapport à des tranches supérieures, mais elle ne suffit jamais à déterminer le bon mode de détention. Il faut comparer la fiscalité marginale réelle, les frais, le financement, la géographie des revenus, l’IFI, la liquidité et l’horizon.',
  seoTitle: 'SCPI TMI 11 % : fiscalité, direct, Europe et assurance-vie',
  seoDescription:
    'SCPI et TMI 11 % : comprendre la fiscalité marginale, comparer direct, SCPI européennes, assurance-vie, crédit et démembrement sans allocation automatique.',
  shortAnswerTitle: 'Une TMI à 11 % rend-elle les SCPI plus intéressantes ?',
  shortAnswer:
    'Pas automatiquement. La TMI est le taux de la tranche supérieure du revenu imposable, pas le taux moyen du foyer. Une SCPI française détenue en direct génère en principe des revenus fonciers soumis au barème progressif et aux prélèvements sociaux applicables. Pour les revenus étrangers, le traitement dépend des conventions fiscales. L’assurance-vie diffère l’imposition jusqu’au rachat sur la quote-part de gains. La bonne comparaison se fait donc en rendement net après fiscalité et frais, selon la situation réelle.',
  keyMessage:
    'À TMI 11 %, éviter toute règle du type « direct optimal » ou « Europe optimale » : le mode de détention doit être simulé, pas déduit de la seule tranche marginale.',
  definitionParagraphs: [
    'La tranche marginale d’imposition correspond au taux appliqué à la tranche supérieure du revenu imposable. Elle ne signifie pas que tous les revenus du foyer sont imposés à 11 %.',
    'Pour les revenus 2025 déclarés en 2026, la tranche à 11 % couvre la fraction de revenu imposable par part comprise entre 11 601 € et 29 579 €. Ces seuils évoluent avec les lois de finances.',
    'Les revenus fonciers français de SCPI détenues en direct sont en principe soumis au barème progressif et aux prélèvements sociaux applicables. Le coût fiscal exact dépend du foyer, des charges déductibles et du régime retenu.',
    'La fiscalité d’une SCPI investie à l’étranger ne se résume pas à « prélèvements sociaux à zéro ». Elle dépend du pays de situation des immeubles, de la convention fiscale, des éventuelles retenues locales et du mécanisme de crédit d’impôt ou de taux effectif.',
    'Dans une assurance-vie, les revenus générés à l’intérieur du contrat ne sont pas imposés chaque année comme des revenus fonciers au nom du souscripteur. Lors d’un rachat, seule la quote-part de gains comprise dans le retrait est fiscalisée selon les règles de l’assurance-vie.',
    'Le démembrement ou le crédit peuvent répondre à des objectifs différents : capitalisation sans revenus immédiats pour le premier, effet de levier potentiel pour le second. Leur pertinence ne dépend pas uniquement de la TMI.',
  ],
  tableTitle: 'Mode de détention / intérêt possible / vigilance',
  tableRows: [
    { level: 'Direct France', advantage: 'Choix large, crédit possible, revenus immédiats.', vigilance: 'Fiscalité annuelle des revenus fonciers, prélèvements sociaux, frais et liquidité à intégrer.' },
    { level: 'Direct Europe', advantage: 'Diversification géographique et fiscalité potentiellement différente.', vigilance: 'Convention fiscale à analyser pays par pays ; pas de règle universelle « PS 0 % ».' },
    { level: 'Assurance-vie', advantage: 'Capitalisation dans l’enveloppe et fiscalité lors des rachats.', vigilance: 'Frais du contrat, supports disponibles, conditions de rachat et IFI éventuel des UC immobilières.' },
    { level: 'Nue-propriété', advantage: 'Pas de distribution au nu-propriétaire pendant le démembrement.', vigilance: 'Absence de revenus, durée bloquante et risque de valeur de la part au terme.' },
    { level: 'Crédit', advantage: 'Effet de levier potentiel et déductibilité possible de certains intérêts.', vigilance: 'Coût du financement, effort d’épargne, durée et risque de baisse de valeur.' },
  ],
  tableNote:
    'Ces pistes sont des cadres d’analyse. Une allocation personnalisée nécessite une simulation fiscale et patrimoniale complète.',
  criteriaTitle: 'Critères à croiser avec une TMI à 11 %',
  criteriaCards: [
    { title: 'Fiscalité marginale réelle', text: 'Simuler le revenu supplémentaire de SCPI dans le foyer plutôt que d’appliquer 11 % à tout le revenu.' },
    { title: 'Origine des revenus', text: 'France et étranger peuvent avoir des traitements fiscaux différents selon les conventions.' },
    { title: 'Frais', text: 'Comparer frais de souscription, frais du contrat éventuel et conditions de sortie.' },
    { title: 'Liquidité', text: 'Une SCPI n’offre pas de délai garanti de revente. L’assurance-vie obéit aux modalités du contrat.' },
    { title: 'TOF et qualité locative', text: 'Le TOF est un indicateur utile mais ne garantit ni revenu ni performance future.' },
    { title: 'Endettement', text: 'Croiser le levier de la SCPI et celui du foyer avec la capacité à absorber une baisse de distribution.' },
    { title: 'IFI', text: 'La fraction immobilière taxable dépend du mode de détention et des informations IFI officielles.' },
    { title: 'Horizon', text: 'Plus l’horizon est long, plus les coûts d’entrée et la liquidité doivent être appréciés sur la durée.' },
  ],
  commonErrors: [
    'Additionner mécaniquement 11 % et les prélèvements sociaux puis appliquer ce taux à tous les revenus du foyer.',
    'Présenter les SCPI européennes comme fiscalement identiques.',
    'Affirmer qu’un TOF élevé garantit la régularité des distributions.',
    'Comparer assurance-vie et direct uniquement sur le rendement affiché.',
    'Oublier que la TMI peut évoluer pendant la durée de détention.',
  ],
  practicalCases: [
    { title: 'Direct France', text: 'Un foyer en TMI 11 % envisage une SCPI française. Il simule le revenu foncier supplémentaire, les prélèvements sociaux, les frais et l’impact éventuel sur sa tranche avant de conclure.' },
    { title: 'SCPI européenne', text: 'Une SCPI investit dans plusieurs pays. La comparaison nette nécessite de ventiler les revenus et d’appliquer les conventions fiscales correspondantes, plutôt qu’un taux unique.' },
    { title: 'Assurance-vie', text: 'Le souscripteur compare le rendement crédité dans le contrat, les frais de gestion, la fiscalité future des rachats et les supports disponibles avec une détention directe.' },
    { title: 'Crédit', text: 'Le financement peut améliorer le rendement des fonds propres mais augmente le risque. Le taux du prêt, l’assurance, l’effort mensuel et la déductibilité réelle doivent être modélisés.' },
  ],
  methodParagraphs: [
    'Calculer le revenu supplémentaire attendu sans supposer que toute la distribution sera taxée à la TMI.',
    'Distinguer revenus français et revenus étrangers et appliquer les règles fiscales correspondantes.',
    'Comparer direct, assurance-vie, démembrement et crédit en intégrant tous les frais et la liquidité.',
    'Tester plusieurs scénarios de distribution, de valeur de part et d’évolution de la TMI.',
    'Valider les conventions fiscales, valeurs IFI et règles applicables à l’année concernée avant une décision personnalisée.',
  ],
  conclusionParagraphs: [
    'Une TMI à 11 % n’impose ni n’exclut aucun mode de détention. Elle constitue un paramètre parmi d’autres.',
    'Le point décisif est le rendement net après fiscalité et frais, corrigé du risque de liquidité et de perte en capital.',
    'Les données fiscales et contractuelles doivent être vérifiées au moment de l’investissement et de la déclaration.',
  ],
  faqItems: [
    { question: 'Les SCPI sont-elles adaptées à une TMI 11 % ?', answer: 'Elles peuvent l’être, mais la TMI seule ne permet pas de conclure. Rendement net, risques, horizon, frais, liquidité et objectifs doivent être analysés ensemble.' },
    { question: 'Faut-il privilégier les SCPI européennes ?', answer: 'Pas automatiquement. Elles apportent une diversification et une fiscalité différente selon les pays, qui doit être calculée convention par convention.' },
    { question: 'Les prélèvements sociaux s’appliquent-ils toujours ?', answer: 'Ils concernent notamment les revenus fonciers français, mais le traitement des revenus immobiliers étrangers dépend de leur nature et des conventions fiscales. Il faut éviter une règle universelle.' },
    { question: 'L’assurance-vie est-elle meilleure à TMI 11 % ?', answer: 'Pas nécessairement. Elle diffère l’imposition jusqu’au rachat mais ajoute des frais et limite souvent les supports. La comparaison doit être faite net de tous coûts.' },
    { question: 'Le TOF permet-il de garantir les revenus ?', answer: 'Non. Un TOF élevé est un indicateur d’occupation, pas une garantie de distribution ni de performance future.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI selon mon projet',
}
