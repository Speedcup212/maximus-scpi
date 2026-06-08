import type { ScpiEducationalPageConfig } from './shared'

export const fiscaliteAvanceeScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-fiscalite/',
  badge: 'Fiscalité SCPI',
  h1: 'Fiscalité SCPI : comprendre l\'imposition avant d\'investir',
  heroSubtitle:
    'La fiscalité des SCPI est un sujet central : elle détermine le rendement réellement conservé par l\'investisseur. Cette page pose les bases de la fiscalité SCPI sans se substituer à un conseil fiscal personnalisé.',
  seoTitle: 'Fiscalité SCPI : revenus fonciers, Europe, IFI et rendement net',
  seoDescription:
    'Comprenez la fiscalité des SCPI : revenus fonciers, prélèvements sociaux, SCPI européennes, crédit d\'impôt, IFI, assurance-vie, démembrement et SCI à l\'IS.',
  shortAnswerTitle: 'Pourquoi la fiscalité est-elle centrale dans l\'analyse SCPI ?',
  shortAnswer:
    'Le rendement affiché d\'une SCPI est un rendement brut avant impôt. Le rendement réellement conservé dépend de la fiscalité applicable selon le mode de détention, l\'origine des revenus, la tranche marginale d\'imposition (TMI) de l\'investisseur et les prélèvements sociaux. Ignorer la fiscalité peut conduire à surévaluer fortement le rendement attendu.',
  keyMessage:
    'Le taux de distribution affiché ne suffit jamais. La fiscalité peut transformer profondément la lecture du rendement d\'une SCPI.',
  definitionParagraphs: [
    'Les revenus distribués par une SCPI française sont généralement qualifiés de revenus fonciers. Ils sont soumis au barème progressif de l\'impôt sur le revenu (IR) selon la tranche marginale d\'imposition (TMI) de l\'investisseur, ainsi qu\'aux prélèvements sociaux au taux en vigueur.',
    'Les SCPI investies dans d\'autres pays européens génèrent des revenus immobiliers de source étrangère. Selon les conventions fiscales applicables, ces revenus peuvent bénéficier d\'un crédit d\'impôt ou d\'un taux effectif différent, ce qui modifie leur traitement fiscal par rapport aux revenus français.',
    'Le mode de détention des parts influence également la fiscalité : détention en direct, en assurance-vie, en nue-propriété, via une SCI à l\'IS ou à crédit. Chaque enveloppe a ses propres règles fiscales, qu\'il convient d\'analyser selon la situation de l\'investisseur.',
    'Les SCPI peuvent également entrer dans l\'assiette de l\'Impôt sur la Fortune Immobilière (IFI) selon les modalités de détention et la fraction immobilière du patrimoine. La valeur IFI communiquée par la société de gestion ou l\'assureur doit être vérifiée.',
    'Enfin, certains dispositifs fiscaux spécifiques — crédit d\'impôt, taux effectif, déficit foncier, report à nouveau — peuvent avoir un impact sur la fiscalité des revenus de SCPI. Leur application dépend de la situation individuelle et de la réglementation en vigueur.',
  ],
  tableTitle: 'Mode de détention et fiscalité associée',
  tableRows: [
    {
      level: 'SCPI en direct (France)',
      advantage: 'Revenus fonciers imposables au barème IR + prélèvements sociaux.',
      vigilance: 'Rendement net fortement impacté selon TMI. Déclaration obligatoire chaque année.',
    },
    {
      level: 'SCPI européennes',
      advantage: 'Crédit d\'impôt ou taux effectif possible selon convention fiscale. Prélèvements sociaux potentiellement réduits.',
      vigilance: 'Fiscalité variable selon pays. Documentation fiscale à vérifier. Déclaration spécifique.',
    },
    {
      level: 'SCPI en assurance-vie',
      advantage: 'Capitalisation possible des revenus. Fiscalité allégée en cas de rachat après 8 ans. Transmission avantageuse.',
      vigilance: 'Frais du contrat. Choix limité de SCPI. Pas de déduction des intérêts d\'emprunt.',
    },
    {
      level: 'SCPI en nue-propriété',
      advantage: 'Absence de revenus imposables pendant la durée du démembrement. Fiscalité neutralisée temporairement.',
      vigilance: 'Pas de revenus pendant la période. Nécessite un horizon long. Décote à analyser.',
    },
    {
      level: 'SCPI via SCI à l\'IS',
      advantage: 'Imposition à l\'IS. Possibilité de capitaliser les revenus. Amortissement comptable.',
      vigilance: 'Double imposition lors de la distribution. Frais comptables et juridiques. Complexité de gestion.',
    },
    {
      level: 'SCPI à crédit',
      advantage: 'Déduction des intérêts d\'emprunt des revenus fonciers. Effet de levier fiscal potentiel.',
      vigilance: 'Cash-flow à analyser. Risque de taux. Endettement global à surveiller.',
    },
  ],
  tableNote:
    'Ce tableau présente les grands principes fiscaux. La situation réelle dépend de la réglementation applicable et de la situation individuelle de chaque investisseur.',
  criteriaTitle: 'Critères à croiser avec la fiscalité',
  criteriaCards: [
    { title: 'TMI', text: 'La tranche marginale d\'imposition détermine le poids de l\'IR sur les revenus fonciers. Plus elle est élevée, plus le rendement net est réduit.' },
    { title: 'Origine des revenus', text: 'Revenus français ou étrangers : la fiscalité diffère selon les conventions fiscales et l\'origine géographique des actifs.' },
    { title: 'Mode de détention', text: 'Direct, assurance-vie, démembrement, SCI à l\'IS : chaque enveloppe a ses propres règles fiscales.' },
    { title: 'Prélèvements sociaux', text: 'Ils s\'ajoutent à l\'IR et peuvent représenter un coût significatif. Leur taux et leur application varient selon la nature des revenus.' },
    { title: 'Horizon', text: 'Un investissement long terme peut être combiné avec une solution de capitalisation (AV, SCI à l\'IS, nue-propriété) pour réduire la pression fiscale immédiate.' },
    { title: 'IFI', text: 'Les parts de SCPI peuvent être intégrées à l\'assiette IFI selon le mode de détention. À vérifier selon le patrimoine global.' },
  ],
  commonErrors: [
    'Confondre rendement brut et rendement net fiscal : le rendement affiché inclut les frais de gestion mais pas la fiscalité personnelle.',
    'Oublier les prélèvements sociaux dans le calcul du rendement net : ils représentent un coût supplémentaire significatif.',
    'Croire que toutes les SCPI européennes sont fiscalement identiques : chaque pays a sa convention et son traitement.',
    'Penser que l\'assurance-vie supprime toute fiscalité : les revenus sont imposés en cas de rachat, selon la part de plus-value.',
    'Ignorer l\'impact IFI : les parts de SCPI détenues en direct sont généralement imposables à l\'IFI.',
    'Négliger l\'impact des frais de structure (SCI, assurance-vie) dans l\'analyse fiscale globale.',
  ],
  practicalCases: [
    {
      title: 'Investisseur TMI 30 % en direct',
      text: 'Un investisseur à TMI 30 % perçoit 5 000 € de revenus fonciers SCPI. Après IR (1 500 €) et prélèvements sociaux (875 € environ), le rendement net fiscal est réduit d\'environ 47 %.',
    },
    {
      title: 'Investisseur TMI 41 % avec SCPI européennes',
      text: 'Un investisseur à TMI 41 % investit dans une SCPI européenne. Les revenus étrangers peuvent bénéficier d\'un crédit d\'impôt et de prélèvements sociaux réduits, améliorant le rendement net par rapport à une SCPI française.',
    },
    {
      title: 'Détention en assurance-vie sans besoin de revenus',
      text: 'Un investisseur sans besoin de revenus immédiats place 100 000 € en SCPI via un contrat d\'assurance-vie en gestion libre. Les revenus sont capitalisés. La fiscalité n\'intervient qu\'en cas de rachat.',
    },
  ],
  methodParagraphs: [
    'Analyser le rendement brut affiché (TDVM ou taux de distribution sur VR).',
    'Identifier le mode de détention et son cadre fiscal.',
    'Déterminer la TMI et l\'impact des prélèvements sociaux.',
    'Vérifier l\'origine des revenus (France / étranger).',
    'Calculer le rendement net fiscal estimé.',
    'Intégrer l\'horizon et le besoin ou non de revenus.',
    'Vérifier l\'impact IFI le cas échéant.',
    'Ne pas conclure sur la seule base du rendement brut.',
  ],
  conclusionParagraphs: [
    'La fiscalité est un élément clé de l\'analyse SCPI. Elle ne doit pas être ignorée, mais elle ne doit pas non plus être le seul critère de décision.',
    'Chaque situation est unique. Il est recommandé d\'approfondir avec un professionnel pour analyser l\'impact fiscal réel selon votre patrimoine, votre TMI, votre horizon et vos objectifs.',
    'MaximusSCPI met à disposition son comparateur pour analyser les indicateurs bruts, et ses articles spécialisés pour approfondir chaque volet fiscal.',
  ],
  faqItems: [
    {
      question: 'Comment sont fiscalisés les revenus de SCPI ?',
      answer: 'Les revenus distribués par une SCPI française sont généralement imposés comme des revenus fonciers, au barème progressif de l\'IR (selon la TMI) + prélèvements sociaux. Les revenus de SCPI étrangères peuvent bénéficier d\'un crédit d\'impôt ou d\'un taux effectif selon les conventions fiscales.',
    },
    {
      question: 'Quelle différence entre SCPI françaises et européennes ?',
      answer: 'Les SCPI françaises génèrent des revenus fonciers français imposés au barème IR + PS. Les SCPI européennes génèrent des revenus immobiliers étrangers pouvant bénéficier d\'un crédit d\'impôt et, dans certains cas, de prélèvements sociaux réduits ou supprimés.',
    },
    {
      question: 'Les SCPI sont-elles soumises aux prélèvements sociaux ?',
      answer: 'En règle générale, les revenus fonciers de SCPI françaises sont soumis aux prélèvements sociaux au taux en vigueur. Pour les revenus étrangers, le traitement peut différer selon la convention fiscale applicable.',
    },
    {
      question: 'Les SCPI entrent-elles dans l\'IFI ?',
      answer: 'Oui, en principe. Les parts de SCPI détenues en direct sont généralement considérées comme des actifs immobiliers imposables à l\'IFI. La valeur à déclarer est celle communiquée par la société de gestion. Les modalités exactes dépendent du mode de détention et de la situation patrimoniale.',
    },
    {
      question: 'L\'assurance-vie change-t-elle la fiscalité ?',
      answer: 'Oui. En assurance-vie, les revenus des SCPI sont capitalisés au sein du contrat. Ils ne sont imposés qu\'en cas de rachat, selon la part de plus-value et l\'ancienneté du contrat. Ce cadre peut être intéressant pour les investisseurs sans besoin de revenus immédiats.',
    },
    {
      question: 'Le démembrement permet-il de neutraliser les revenus ?',
      answer: 'En nue-propriété, l\'investisseur ne perçoit pas de revenus pendant la durée du démembrement. Il n\'a donc pas de revenus fonciers à déclarer. L\'usufruitier perçoit les revenus et les déclare. Ce mécanisme peut être étudié selon les objectifs.',
    },
    {
      question: 'Une SCI à l\'IS peut-elle détenir des SCPI ?',
      answer: 'Oui, une SCI soumise à l\'IS peut détenir des parts de SCPI. Les revenus sont alors imposés à l\'IS, avec possibilité de capitalisation. La distribution aux associés est ensuite imposée dans leur catégorie de revenus. Ce montage ajoute une couche fiscale et comptable.',
    },
    {
      question: 'Comment MaximusSCPI analyse la fiscalité SCPI ?',
      answer: 'MaximusSCPI analyse la fiscalité SCPI à travers plusieurs indicateurs : rendement brut et net estimé, origine des revenus, mode de détention, TMI, prélèvements sociaux, crédit d\'impôt, IFI et conventions fiscales. L\'objectif est pédagogique et ne constitue pas un conseil fiscal personnalisé.',
    },
  ],
}
