import type { ScpiEducationalPageConfig } from './shared'

export const prelevementsSociauxScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-prelevements-sociaux/',
  badge: 'Fiscalité SCPI',
  h1: 'Prélèvements sociaux SCPI : impact sur le rendement net',
  heroSubtitle:
    'Les prélèvements sociaux pèsent significativement sur les revenus fonciers de SCPI françaises. Leur traitement peut différer selon l\'origine des revenus. Cette page explique leur impact et comment les intégrer dans l\'analyse.',
  seoTitle: 'Prélèvements sociaux SCPI : revenus fonciers et rendement net',
  seoDescription:
    'Comprenez l\'impact des prélèvements sociaux sur les revenus de SCPI, leur effet sur le rendement net, les différences entre revenus français et étrangers et les points à vérifier.',
  shortAnswerTitle: 'Quel est l\'impact des prélèvements sociaux sur les SCPI ?',
  shortAnswer:
    'Les prélèvements sociaux s\'appliquent sur les revenus fonciers de SCPI françaises au taux en vigueur. Ils s\'ajoutent à l\'impôt sur le revenu et peuvent réduire significativement le rendement net. Pour les revenus étrangers de SCPI, le traitement peut être différent selon la convention fiscale applicable.',
  keyMessage:
    'Les prélèvements sociaux peuvent changer fortement la perception du rendement d\'une SCPI. Ils doivent être intégrés dans toute comparaison sérieuse.',
  definitionParagraphs: [
    'Les prélèvements sociaux sont des cotisations affectées au financement de la protection sociale (CSG, CRDS, etc.). Leur taux global est fixé par la loi et peut évoluer. En 2026, le taux en vigueur est à vérifier au moment de l\'imposition.',
    'Sur les revenus fonciers de SCPI françaises, les prélèvements sociaux sont calculés sur le montant brut des revenus, avant déduction des éventuelles charges. Ils sont recouvrés par voie de rôle ou directement retenus par la société de gestion dans certains cas.',
    'Le cumul IR + prélèvements sociaux peut représenter une part importante des revenus distribués. Par exemple, à TMI 30 %, le prélèvement total (IR + PS) peut dépasser 45 % des revenus bruts.',
    'Pour les revenus étrangers de SCPI, le traitement des prélèvements sociaux peut être différent. Selon les conventions fiscales, certains revenus étrangers peuvent être exonérés de prélèvements sociaux ou soumis à un taux réduit.',
    'En assurance-vie, les revenus des SCPI sont capitalisés dans le contrat. Les prélèvements sociaux ne s\'appliquent pas annuellement sur les revenus, mais sur la plus-value en cas de rachat. Le traitement peut différer.',
    'En démembrement (nue-propriété), l\'investisseur ne perçoit pas de revenus. Il n\'est donc pas soumis aux prélèvements sociaux sur les revenus de la SCPI pendant la durée du démembrement.',
  ],
  tableTitle: 'Impact des prélèvements sociaux selon le type de revenu',
  tableRows: [
    {
      level: 'Revenus fonciers français',
      advantage: 'Assiette : revenus bruts avant charges. Taux : en vigueur.',
      vigilance: 'S\'ajoutent à l\'IR. Peuvent réduire le rendement net de 15 à 20 % supplémentaires.',
    },
    {
      level: 'Revenus étrangers (SCPI européennes)',
      advantage: 'Exonération partielle ou totale possible selon la convention fiscale.',
      vigilance: 'À vérifier selon le pays et la convention. Pas d\'exonération automatique.',
    },
    {
      level: 'Assurance-vie',
      advantage: 'Pas de PS annuels sur les revenus capitalisés. PS sur la plus-value en cas de rachat.',
      vigilance: 'Le traitement fiscal au rachat dépend de l\'ancienneté du contrat et de la part de plus-value.',
    },
    {
      level: 'Nue-propriété',
      advantage: 'Absence de revenus perçus : pas de PS pendant la durée du démembrement.',
      vigilance: 'L\'usufruitier perçoit les revenus et supporte les PS.',
    },
    {
      level: 'SCI à l\'IS',
      advantage: 'Les revenus sont imposés à l\'IS. Les PS ne s\'appliquent pas au niveau de la société.',
      vigilance: 'Les PS peuvent s\'appliquer lors de la distribution des dividendes aux associés.',
    },
  ],
  tableNote:
    'Le taux des prélèvements sociaux est susceptible d\'évoluer. À vérifier selon la réglementation en vigueur.',
  criteriaTitle: 'Critères à croiser avec les prélèvements sociaux',
  criteriaCards: [
    { title: 'Origine des revenus', text: 'Les revenus français sont soumis aux PS. Les revenus étrangers peuvent bénéficier d\'un traitement différent selon la convention applicable.' },
    { title: 'Taux en vigueur', text: 'Le taux des PS peut évoluer. À vérifier au moment de l\'imposition.' },
    { title: 'Mode de détention', text: 'L\'assurance-vie, la nue-propriété et la SCI à l\'IS modifient le traitement des PS par rapport au direct.' },
    { title: 'Rendement net', text: 'Les PS réduisent le rendement net. Leur impact doit être intégré dans toute comparaison entre SCPI.' },
    { title: 'Déclaration', text: 'Les PS sont prélevés par voie de rôle ou retenus à la source selon les cas. À vérifier selon les modalités en vigueur.' },
  ],
  commonErrors: [
    'Oublier d\'intégrer les PS dans le calcul du rendement net fiscal.',
    'Croire que les PS ne s\'appliquent pas aux revenus étrangers (cela dépend des conventions).',
    'Penser que l\'assurance-vie supprime définitivement les PS (ils s\'appliquent au rachat).',
    'Confondre le taux des PS avec le taux de l\'IR.',
    'Négliger l\'impact des PS dans les simulations de rendement.',
  ],
  practicalCases: [
    {
      title: 'PS sur revenus français TMI 30 %',
      text: 'Revenu brut : 5 000 €. IR à 30 % : 1 500 €. PS : 875 € (17,5 %). Total prélèvement : 2 375 €. Rendement net : 52,5 %.',
    },
    {
      title: 'PS sur revenus étrangers exonérés',
      text: 'Revenu brut étranger : 5 000 €. Crédit d\'impôt : 500 €. PS : 0 € selon convention. Total prélèvement : 1 500 € (IR après crédit d\'impôt). Rendement net : 70 %.',
    },
    {
      title: 'PS en assurance-vie (rachat après 8 ans)',
      text: 'Investissement 100 000 € en SCPI par AV. Valeur à 10 ans : 150 000 €. Plus-value : 50 000 €. PS sur PV au rachat : environ 8 750 € (17,5 %). PV nette : 41 250 €.',
    },
  ],
  methodParagraphs: [
    'Identifier la nature et l\'origine des revenus de SCPI.',
    'Vérifier le taux des PS applicable.',
    'Calculer l\'impact des PS sur le rendement brut.',
    'Comparer le rendement net avant et après PS.',
    'Intégrer l\'impact du mode de détention (AV, nue-propriété, SCI) sur les PS.',
    'Ne pas comparer des rendements sans tenir compte des PS.',
  ],
  conclusionParagraphs: [
    'Les prélèvements sociaux sont un élément clé de la fiscalité des SCPI. Leur impact peut être significatif, en particulier sur les revenus fonciers français.',
    'L\'origine des revenus et le mode de détention peuvent modifier le traitement des PS. Une analyse au cas par cas est nécessaire.',
  ],
  faqItems: [
    {
      question: 'Les SCPI supportent-elles des prélèvements sociaux ?',
      answer: 'Les revenus fonciers de SCPI françaises sont soumis aux prélèvements sociaux au taux en vigueur. Pour les revenus étrangers, le traitement peut être différent.',
    },
    {
      question: 'Quel impact sur le rendement net ?',
      answer: 'Les PS réduisent le rendement net. À titre indicatif, avec un taux de PS de 17,5 %, le rendement net est réduit d\'autant par rapport au rendement brut avant impôt.',
    },
    {
      question: 'Les revenus étrangers sont-ils traités différemment ?',
      answer: 'Oui, selon les conventions fiscales, certains revenus étrangers peuvent être exonérés de PS ou soumis à un taux réduit.',
    },
    {
      question: 'Les SCPI européennes réduisent-elles les prélèvements sociaux ?',
      answer: 'Cela dépend du pays et de la convention fiscale applicable. Dans certains cas, les PS peuvent être réduits ou supprimés.',
    },
    {
      question: 'L\'assurance-vie change-t-elle l\'analyse ?',
      answer: 'Oui. En AV, les PS ne s\'appliquent pas annuellement sur les revenus capitalisés. Ils s\'appliquent sur la plus-value en cas de rachat.',
    },
    {
      question: 'Le démembrement évite-t-il les revenus imposables ?',
      answer: 'En nue-propriété, l\'investisseur ne perçoit pas de revenus. Les PS ne s\'appliquent donc pas pendant la durée du démembrement.',
    },
    {
      question: 'Comment intégrer les prélèvements sociaux dans une simulation ?',
      answer: 'Il faut appliquer le taux en vigueur au montant brut des revenus fonciers. Ce montant s\'ajoute à l\'IR estimé.',
    },
    {
      question: 'Comment MaximusSCPI les prend en compte ?',
      answer: 'MaximusSCPI intègre les PS dans l\'analyse du rendement net fiscal, en distinguant selon l\'origine des revenus et le mode de détention.',
    },
  ],
}
