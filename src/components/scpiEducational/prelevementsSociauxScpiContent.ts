import type { ScpiEducationalPageConfig } from './shared'

export const prelevementsSociauxScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-prelevements-sociaux/',
  badge: 'Fiscalité SCPI',
  h1: 'Prélèvements sociaux SCPI : impact sur le rendement net',
  heroSubtitle:
    'Les prélèvements sociaux pèsent significativement sur les revenus fonciers de SCPI françaises. Ils s\'ajoutent à l\'impôt sur le revenu et peuvent réduire le rendement net de 15 % à 20 % supplémentaires. Leur traitement diffère selon l\'origine des revenus et le mode de détention.',
  seoTitle: 'Prélèvements sociaux SCPI : impact, calcul et comparaison France / Europe',
  seoDescription:
    'Analyse complète des prélèvements sociaux sur les revenus de SCPI : CSG, CRDS, impact sur le rendement net, différence entre revenus français et étrangers, assurance-vie, démembrement. Exemples chiffrés et tableau comparatif.',
  shortAnswerTitle: 'Pourquoi les prélèvements sociaux changent la lecture du rendement ?',
  shortAnswer:
    'Les prélèvements sociaux s\'appliquent sur les revenus fonciers de SCPI françaises au taux en vigueur. Ils s\'ajoutent à l\'impôt sur le revenu et réduisent le rendement net. Par exemple, sur un revenu brut de 5 000 €, les PS peuvent représenter environ 875 €, soit 17,5 % du brut. Pour les SCPI européennes, selon la convention fiscale applicable, les PS peuvent être réduits ou supprimés. Ce point est essentiel dans la comparaison entre SCPI françaises et européennes.',
  keyMessage:
    'Les prélèvements sociaux peuvent changer fortement la perception du rendement d\'une SCPI. Ils doivent être intégrés dans toute comparaison sérieuse entre SCPI françaises et européennes.',
  definitionParagraphs: [
    'Les prélèvements sociaux sont des cotisations affectées au financement de la protection sociale (CSG, CRDS, etc.). Leur taux global est fixé par la loi et peut évoluer. En 2026, le taux en vigueur est à vérifier au moment de l\'imposition.',
    'Sur les revenus fonciers de SCPI françaises, les prélèvements sociaux sont calculés sur le montant brut des revenus, avant déduction des éventuelles charges. Ils sont recouvrés par voie de rôle ou directement retenus par la société de gestion dans certains cas.',
    'Le cumul IR + prélèvements sociaux peut représenter une part importante des revenus distribués. Par exemple, à TMI 30 %, le prélèvement total (IR à 30 % + PS à ~17,5 %) peut atteindre environ 47,5 % des revenus bruts.',
    'Pour les revenus étrangers de SCPI, le traitement des prélèvements sociaux peut être différent. Selon les conventions fiscales, certains revenus étrangers peuvent être exonérés de PS ou soumis à un taux réduit. Ce point est à vérifier pays par pays.',
    'En assurance-vie, les revenus des SCPI sont capitalisés dans le contrat. Les prélèvements sociaux ne s\'appliquent pas annuellement sur les revenus, mais sur la plus-value en cas de rachat. Le traitement diffère donc du direct.',
    'En démembrement (nue-propriété), l\'investisseur ne perçoit pas de revenus. Il n\'est pas soumis aux prélèvements sociaux sur les revenus de la SCPI pendant la durée du démembrement.',
    'La différence de traitement des PS entre SCPI françaises et européennes peut modifier significativement la comparaison de rendement. C\'est un critère important à intégrer dans l\'analyse.',
  ],
  tableTitle: 'Comparaison : TMI / fiscalité à surveiller / impact sur le rendement net',
  tableRows: [
    {
      level: 'TMI 11 % — Revenus France',
      advantage: 'IR modéré. Impact fiscal limité.',
      vigilance: 'PS : ~17,5 % sur le brut. Cumul IR + PS : ~28,5 %. Rendement net : ~71,5 % du brut.',
    },
    {
      level: 'TMI 30 % — Revenus France',
      advantage: 'Déduction des intérêts d\'emprunt possible.',
      vigilance: 'PS : ~17,5 % sur le brut. Cumul IR + PS : ~47,5 %. Rendement net : ~52,5 % du brut.',
    },
    {
      level: 'TMI 41 % — Revenus France',
      advantage: 'Alternatives à étudier (Europe, AV, nue-propriété).',
      vigilance: 'PS : ~17,5 % sur le brut. Cumul IR + PS : ~58,5 %. Rendement net : ~41,5 % du brut.',
    },
    {
      level: 'TMI 45 % — Revenus France',
      advantage: 'Solutions à fiscalité différée prioritaires.',
      vigilance: 'PS : ~17,5 % sur le brut. Cumul IR + PS : ~62,5 %. Rendement net : ~37,5 % du brut.',
    },
    {
      level: 'TMI 30 % — Revenus Europe (PS réduit)',
      advantage: 'PS potentiellement réduits ou supprimés. Rendement net amélioré.',
      vigilance: 'À vérifier selon la convention fiscale. Pas d\'exonération automatique.',
    },
    {
      level: 'TMI 41 % — Assurance-vie',
      advantage: 'Pas de PS annuels sur les revenus capitalisés.',
      vigilance: 'PS sur la plus-value en cas de rachat. À intégrer dans la simulation.',
    },
  ],
  tableNote:
    'Taux de PS indicatif. Le taux en vigueur peut évoluer. À vérifier selon la réglementation applicable.',
  criteriaTitle: 'Critères à croiser avec les prélèvements sociaux',
  criteriaCards: [
    { title: 'Origine des revenus', text: 'Les revenus français sont soumis aux PS. Les revenus étrangers peuvent bénéficier d\'un traitement différent selon la convention applicable. Ce point est clé dans la comparaison France / Europe.' },
    { title: 'Taux en vigueur', text: 'Le taux des PS peut évoluer chaque année. À vérifier au moment de l\'imposition.' },
    { title: 'Mode de détention', text: 'L\'assurance-vie, la nue-propriété et la SCI à l\'IS modifient le traitement des PS par rapport au direct.' },
    { title: 'Rendement net', text: 'Les PS réduisent le rendement net. Leur impact doit être intégré dans toute comparaison entre SCPI.' },
    { title: 'TMI', text: 'Plus la TMI est élevée, plus l\'impact proportionnel des PS est important dans l\'analyse globale.' },
    { title: 'Convention fiscale', text: 'Pour les SCPI européennes, la convention fiscale détermine le traitement des PS. À vérifier pays par pays.' },
  ],
  commonErrors: [
    'Oublier d\'intégrer les PS dans le calcul du rendement net fiscal, ce qui conduit à surestimer le rendement.',
    'Croire que les PS ne s\'appliquent pas aux revenus étrangers : cela dépend des conventions fiscales, ce n\'est pas automatique.',
    'Penser que l\'assurance-vie supprime définitivement les PS : ils s\'appliquent sur la plus-value en cas de rachat.',
    'Confondre le taux des PS avec le taux de l\'IR : ils s\'additionnent.',
    'Comparer des SCPI françaises et européennes sans intégrer la différence de traitement des PS.',
  ],
  practicalCases: [
    {
      title: 'Revenu brut 5 000 € — TMI 30 % — France',
      text: 'IR (30 %) = 1 500 €. PS (17,5 %) = 875 €. Total prélevé = 2 375 €. L\'investisseur conserve 2 625 €, soit 52,5 % du brut. Les PS représentent 36,8 % du total des prélèvements.',
    },
    {
      title: 'Revenu brut 5 000 € — TMI 41 % — France',
      text: 'IR (41 %) = 2 050 €. PS (17,5 %) = 875 €. Total = 2 925 €. L\'investisseur conserve 2 075 €, soit 41,5 % du brut. Les PS représentent 29,9 % du total des prélèvements.',
    },
    {
      title: 'Comparaison France vs Europe — TMI 30 %',
      text: 'SCPI française : brut 6 %, net après IR (30 %) + PS (~17,5 %) = ~3,2 %. SCPI européenne : brut 6,5 %, PS exonéré selon convention, crédit d\'impôt = ~4,8 %. L\'écart de PS contribue significativement à la différence de rendement net.',
    },
    {
      title: 'Assurance-vie — Absence de PS annuels',
      text: 'Investissement de 100 000 € en SCPI via AV. Rendement brut 6 %. Les 6 000 € annuels sont capitalisés sans PS ni IR. En cas de rachat après 8 ans, les PS s\'appliquent sur la plus-value constatée.',
    },
    {
      title: 'Nue-propriété — Pas de PS pendant le démembrement',
      text: 'Un investisseur acquiert des parts en nue-propriété pour 10 ans. Il ne perçoit pas de revenus. Les PS ne s\'appliquent pas. À l\'issue, il récupère la pleine propriété.',
    },
  ],
  methodParagraphs: [
    'Identifier la nature et l\'origine des revenus de la SCPI (France, Europe, mixte).',
    'Vérifier le taux des PS en vigueur au moment de l\'imposition.',
    'Calculer l\'impact des PS sur le rendement brut.',
    'Comparer le rendement net avant et après PS.',
    'Pour les SCPI européennes, vérifier la convention fiscale pour le traitement des PS.',
    'Intégrer l\'impact du mode de détention (AV, nue-propriété, SCI) sur les PS.',
    'Ne pas comparer des rendements sans tenir compte des PS.',
  ],
  conclusionParagraphs: [
    'Les prélèvements sociaux sont un élément clé de la fiscalité des SCPI. Leur impact peut représenter environ 17,5 % du rendement brut, ce qui est loin d\'être négligeable.',
    'La différence de traitement des PS entre SCPI françaises et européennes est un critère important dans l\'analyse comparative. Elle peut expliquer une partie significative de l\'écart de rendement net.',
    'L\'assurance-vie et la nue-propriété permettent de différer ou d\'éviter temporairement les PS, ce qui peut être pertinent selon la situation.',
  ],
  faqItems: [
    {
      question: 'Les SCPI supportent-elles des prélèvements sociaux ?',
      answer: 'Les revenus fonciers de SCPI françaises sont soumis aux prélèvements sociaux au taux en vigueur. Pour les revenus étrangers, le traitement peut être différent selon la convention fiscale.',
    },
    {
      question: 'Quel impact sur le rendement net ?',
      answer: 'Les PS réduisent le rendement net d\'environ 17,5 % (taux indicatif). Exemple : un rendement brut de 6 % devient environ 4,95 % avant IR, soit une réduction de 1,05 point.',
    },
    {
      question: 'Les revenus étrangers sont-ils traités différemment ?',
      answer: 'Oui, selon les conventions fiscales, certains revenus étrangers peuvent être exonérés de PS ou soumis à un taux réduit. Ce point est à vérifier pays par pays.',
    },
    {
      question: 'Les SCPI européennes réduisent-elles les prélèvements sociaux ?',
      answer: 'Cela dépend du pays et de la convention fiscale applicable. Dans certains cas, les PS peuvent être réduits ou supprimés. Ce n\'est pas automatique.',
    },
    {
      question: 'L\'assurance-vie change-t-elle l\'analyse des PS ?',
      answer: 'Oui. En assurance-vie, les PS ne s\'appliquent pas annuellement sur les revenus capitalisés. Ils s\'appliquent sur la plus-value en cas de rachat.',
    },
    {
      question: 'Le démembrement évite-t-il les PS ?',
      answer: 'En nue-propriété, l\'investisseur ne perçoit pas de revenus. Les PS ne s\'appliquent donc pas pendant la durée du démembrement.',
    },
    {
      question: 'Comment intégrer les PS dans une simulation de rendement ?',
      answer: 'Estimation : rendement net avant IR = rendement brut − PS. Exemple : 6 % − 1,05 % (PS indicatifs) = 4,95 %. Puis appliquer l\'IR selon la TMI.',
    },
    {
      question: 'Les PS peuvent-ils évoluer ?',
      answer: 'Oui, le taux des prélèvements sociaux peut être modifié par la loi de finances. À vérifier au moment de chaque imposition.',
    },
    {
      question: 'Ce que MaximusSCPI regarde avant de comparer deux SCPI ?',
      answer: 'MaximusSCPI compare les SCPI en intégrant la nature des revenus (France/Europe), le traitement des PS, le rendement brut, la fiscalité applicable et le mode de détention. Chaque comparaison tient compte de l\'impact des PS sur le rendement net.',
    },
    {
      question: 'Comment MaximusSCPI prend en compte les PS ?',
      answer: 'MaximusSCPI intègre les PS dans l\'analyse du rendement net fiscal, en distinguant selon l\'origine des revenus et le mode de détention. L\'approche est pédagogique.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI avec l\'impact des prélèvements sociaux',
}
