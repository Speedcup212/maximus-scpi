import type { ScpiEducationalPageConfig } from './shared'

export const declarationRevenusScpiErreursConfig: ScpiEducationalPageConfig = {
  path: '/declaration-revenus-scpi-erreurs',
  badge: 'Fiscalité et modes de détention',
  h1: 'Déclaration des revenus SCPI : les erreurs fréquentes',
  heroSubtitle:
    'Chaque année, des investisseurs commettent des erreurs dans la déclaration de leurs revenus de SCPI. Confusion entre brut et net, oubli des revenus étrangers, méconnaissance des prélèvements sociaux, mauvaise interprétation de l\'IFU : cette page récapitule les erreurs les plus fréquentes pour aider à les éviter.',
  seoTitle: 'Déclaration revenus SCPI : les 10 erreurs fréquentes à éviter',
  seoDescription:
    'Guide des erreurs courantes dans la déclaration des revenus SCPI : IFU, brut/net, revenus étrangers, prélèvements sociaux, assurance-vie, intérêts d\'emprunt. Restez conforme et optimisez votre déclaration.',
  shortAnswerTitle: 'Pourquoi la déclaration des revenus SCPI est-elle source d\'erreurs ?',
  shortAnswer:
    'La déclaration des revenus SCPI peut être source d\'erreurs car les investisseurs confondent souvent le montant brut distribué et le montant net imposable, oublient de déclarer les revenus de source étrangère, ne comprennent pas le traitement des prélèvements sociaux, ou mélangent les règles entre détention directe et assurance-vie. L\'IFU transmis par la société de gestion simplifie la déclaration, mais son interprétation nécessite de connaître quelques règles de base.',
  keyMessage:
    'La déclaration des revenus SCPI se simplifie avec l\'IFU, mais des erreurs récurrentes (brut/net, revenus étrangers, prélèvements sociaux) peuvent entraîner des redressements ou une sur-imposition. Prendre le temps de vérifier chaque ligne.',
  definitionParagraphs: [
    'Les revenus distribués par les SCPI sont imposés dans la catégorie des revenus fonciers. La société de gestion transmet chaque année un Imprimé Fiscal Unique (IFU) qui récapitule les montants à déclarer.',
    'L\'IFU distingue généralement les revenus de source française et les revenus de source étrangère (selon les pays d\'investissement de la SCPI). Chaque catégorie peut avoir un traitement fiscal différent.',
    'Les prélèvements sociaux (17,2 %) s\'appliquent sur les revenus fonciers, quel que soit le mode de détention en direct. En assurance-vie, le traitement est différent.',
    'Les intérêts d\'emprunt contractés pour acquérir des parts de SCPI sont déductibles des revenus fonciers, sous réserve de respecter les règles de déduction.',
    'En assurance-vie, les revenus des SCPI ne sont pas déclarés annuellement comme des revenus fonciers. Ils sont capitalisés dans le contrat et imposés uniquement en cas de rachat.',
  ],
  tableTitle: 'Erreur fréquente / Conséquence possible / Bon réflexe / À savoir',
  tableRows: [
    {
      level: 'Déclarer le montant brut au lieu du net',
      advantage: 'Éviter une sur-déclaration qui augmenterait l\'impôt.',
      vigilance: 'L\'IFU indique le montant net imposable après déduction des frais de gestion par la SCPI. Utiliser ce montant.',
    },
    {
      level: 'Oublier les revenus de source étrangère',
      advantage: 'Crédit d\'impôt ou taux effectif possible selon les conventions.',
      vigilance: 'L\'IFU détaille les revenus par pays. Les déclarer dans les cases appropriées pour bénéficier du crédit d\'impôt.',
    },
    {
      level: 'Confondre direct et assurance-vie',
      advantage: 'En AV, les revenus ne sont pas déclarés annuellement en revenus fonciers.',
      vigilance: 'Ne pas déclarer les revenus SCPI en AV comme des revenus fonciers. Ils suivent le régime de l\'assurance-vie.',
    },
    {
      level: 'Oublier les intérêts d\'emprunt déductibles',
      advantage: 'Les intérêts d\'emprunt sont déductibles des revenus fonciers.',
      vigilance: 'Déclarer les intérêts d\'emprunt dans les charges déductibles. Conserver les justificatifs.',
    },
    {
      level: 'Négliger les prélèvements sociaux',
      advantage: 'Les PS (17,2 %) s\'appliquent sur les revenus fonciers, y compris SCPI.',
      vigilance: 'Vérifier que les prélèvements sociaux sont bien calculés sur le montant imposable. Ils sont prélevés via la déclaration.',
    },
  ],
  tableNote:
    'Ces repères sont généraux. La situation fiscale de chaque investisseur peut varier. En cas de doute, consulter un conseil fiscal.',
  criteriaTitle: 'Bonnes pratiques pour une déclaration sans erreur',
  criteriaCards: [
    { title: 'Lire l\'IFU attentivement', text: 'L\'IFU détaille les montants à déclarer. Vérifier chaque ligne avant de reporter.' },
    { title: 'Distinguer France et étranger', text: 'Les revenus étrangers peuvent bénéficier d\'un crédit d\'impôt. Les déclarer dans les cases appropriées.' },
    { title: 'Vérifier le mode de détention', text: 'Direct = revenus fonciers. Assurance-vie = régime des rachats. Ne pas mélanger.' },
    { title: 'Déclarer les intérêts d\'emprunt', text: 'Si vous avez financé vos parts à crédit, les intérêts sont déductibles.' },
    { title: 'Conserver les justificatifs', text: 'Garder les IFU et les relevés de la société de gestion pendant au moins 3 ans.' },
    { title: 'Anticiper la fiscalité', text: 'Simuler l\'impact fiscal des revenus SCPI avant la déclaration pour éviter les mauvaises surprises.' },
  ],
  commonErrors: [
    'Déclarer le montant brut distribué au lieu du montant net imposable indiqué sur l\'IFU.',
    'Oublier de déclarer les revenus de source étrangère et le crédit d\'impôt correspondant.',
    'Déclarer les revenus SCPI en assurance-vie comme des revenus fonciers.',
    'Ne pas déduire les intérêts d\'emprunt alors qu\'ils sont déductibles.',
    'Confondre IFU reçu par la SCPI et relevé de compte bancaire.',
    'Ne pas déclarer les revenus de SCPI détenues en nue-propriété.',
    'Ignorer les prélèvements sociaux qui s\'ajoutent à l\'impôt sur le revenu.',
  ],
  practicalCases: [
    {
      title: 'Investisseur direct avec SCPI européenne',
      text: 'Un investisseur TMI 30 % perçoit 2 000 € de revenus SCPI (dont 500 € de source étrangère). Simulation pédagogique : déclarer 1 500 € en revenus fonciers France et 500 € en revenus étrangers avec crédit d\'impôt. Simulation non contractuelle, sans garantie.',
    },
    {
      title: 'Investisseur avec crédit',
      text: 'Un investisseur a souscrit 80 000 € de SCPI à crédit. Intérêts d\'emprunt : 1 200 €. Simulation pédagogique : déduire les intérêts des revenus fonciers. L\'économie fiscale dépend de la TMI. Simulation non contractuelle.',
    },
  ],
  methodParagraphs: [
    'MaximusSCPI fournit des repères pédagogiques sur la fiscalité des SCPI. Ce contenu n\'est pas un conseil fiscal personnalisé.',
    'La déclaration des revenus SCPI peut être complexe. En cas de doute, consulter un expert-comptable ou un conseiller fiscal.',
    'Conserver l\'IFU et les relevés annuels pour faciliter les déclarations futures.',
  ],
  conclusionParagraphs: [
    'La déclaration des revenus SCPI est simplifiée par l\'IFU, mais des erreurs fréquentes peuvent survenir. Prendre le temps de vérifier chaque ligne et de comprendre le traitement fiscal des différents types de revenus.',
    'Sources et points à vérifier : IFU transmis par la société de gestion, avis d\'imposition, convention fiscale pour les revenus étrangers.',
    'Utilisez le comparateur MaximusSCPI pour visualiser les SCPI, puis validez votre projet fiscal avec un conseiller.',
  ],
  faqItems: [
    {
      question: 'Où trouver les informations pour déclarer mes revenus SCPI ?',
      answer: 'La société de gestion vous transmet chaque année un IFU (Imprimé Fiscal Unique) détaillant les montants à déclarer.',
    },
    {
      question: 'Faut-il déclarer les revenus SCPI en assurance-vie ?',
      answer: 'Non, pas annuellement. Les revenus sont capitalisés dans le contrat et imposés uniquement en cas de rachat.',
    },
    {
      question: 'Les intérêts d\'emprunt SCPI sont-ils déductibles ?',
      answer: 'Oui, les intérêts d\'emprunt pour acquérir des parts de SCPI sont déductibles des revenus fonciers.',
    },
    {
      question: 'Que faire en cas d\'erreur de déclaration ?',
      answer: 'Vous pouvez corriger votre déclaration en ligne via le service de correction ou contacter votre centre des impôts.',
    },
    {
      question: 'Comment déclarer les revenus de SCPI européennes ?',
      answer: 'Suivre les indications de l\'IFU. Les revenus étrangers peuvent bénéficier d\'un crédit d\'impôt à déclarer dans les cases appropriées.',
    },
    {
      question: 'Les prélèvements sociaux sont-ils déjà prélevés ?',
      answer: 'Non, ils sont calculés lors de la déclaration et prélevés avec l\'impôt sur le revenu.',
    },
  ],
}
