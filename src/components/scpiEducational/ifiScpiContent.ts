import type { ScpiEducationalPageConfig } from './shared'

export const ifiScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-ifi/',
  badge: 'Fiscalité SCPI',
  h1: 'SCPI et IFI : faut-il déclarer ses parts ?',
  heroSubtitle:
    'Les parts de SCPI peuvent entrer dans l\'assiette de l\'Impôt sur la Fortune Immobilière (IFI) à hauteur de la fraction représentative d\'actifs immobiliers imposables. Le traitement dépend notamment du mode de détention, du démembrement, des dettes et des informations IFI transmises par la société de gestion ou l\'assureur.',
  seoTitle: 'SCPI IFI : déclaration, valorisation, mode de détention et dette',
  seoDescription:
    'Guide SCPI et IFI : fraction immobilière taxable, valeur IFI, détention en direct, assurance-vie, démembrement, SCI et dettes déductibles.',
  shortAnswerTitle: 'Les SCPI sont-elles imposables à l\'IFI ?',
  shortAnswer:
    'Les parts de SCPI détenues en direct entrent en principe dans l\'IFI à hauteur de la fraction représentative d\'actifs immobiliers imposables. Pour un contrat d\'assurance-vie rachetable, la fraction de la valeur de rachat représentative d\'unités de compte immobilières imposables peut également entrer dans l\'IFI. La valeur ou le ratio IFI est communiqué par la société de gestion ou l\'assureur. Le démembrement, les dettes et les structures de détention nécessitent une analyse spécifique.',
  keyMessage:
    'La SCPI n\'est ni systématiquement taxable à 100 %, ni automatiquement hors IFI lorsqu\'elle est logée en assurance-vie. Il faut utiliser l\'information IFI officielle correspondant au mode de détention.',
  definitionParagraphs: [
    'L\'Impôt sur la Fortune Immobilière (IFI) concerne les foyers dont le patrimoine immobilier net taxable excède 1,3 million d\'euros au 1er janvier. Une fois ce seuil franchi, le barème s\'applique à partir de 800 000 euros.',
    'Les parts de SCPI détenues en direct entrent en principe dans l\'assiette à hauteur de la fraction de leur valeur représentative des biens et droits immobiliers imposables. La société de gestion communique généralement une valeur ou un ratio IFI destiné aux associés.',
    'La valeur IFI peut différer du prix de souscription, de la valeur de retrait et de la valeur de reconstitution. Ces indicateurs ne doivent pas être utilisés comme substituts automatiques à l\'information IFI officielle.',
    'Pour un contrat d\'assurance-vie rachetable investi en unités de compte immobilières, la fraction de la valeur de rachat représentative d\'actifs immobiliers imposables peut entrer dans l\'IFI. L\'assureur doit fournir les informations nécessaires à la déclaration.',
    'En démembrement, l\'article 968 du CGI pose en principe l\'imposition de l\'usufruitier sur la valeur en pleine propriété, mais il existe des exceptions selon l\'origine du démembrement. Il faut donc vérifier la situation juridique exacte avant de conclure que le nu-propriétaire est toujours hors assiette.',
    'Certaines dettes afférentes aux actifs immobiliers imposables peuvent être déductibles sous conditions, avec des règles spécifiques de plafonnement et d\'exclusion. La dette doit être justifiée et rattachée à un actif taxable.',
    'En cas de détention via une société, y compris une SCI, la fraction de la valeur des titres représentative d\'actifs immobiliers imposables peut entrer dans l\'IFI. Le traitement dépend notamment de la structure, des actifs et des règles de valorisation applicables.',
  ],
  tableTitle: 'Traitement IFI selon le mode de détention',
  tableRows: [
    {
      level: 'Détention en direct',
      advantage: 'Valeur ou ratio IFI communiqué par la société de gestion.',
      vigilance: 'Fraction immobilière imposable à intégrer si le foyer est dans le champ de l\'IFI.',
    },
    {
      level: 'Assurance-vie rachetable (UC)',
      advantage: 'L\'assureur calcule la fraction immobilière de la valeur de rachat.',
      vigilance: 'Une UC immobilière n\'est pas automatiquement hors IFI : utiliser l\'information fournie par l\'assureur.',
    },
    {
      level: 'Nue-propriété / usufruit',
      advantage: 'Le traitement peut différer selon l\'origine juridique du démembrement.',
      vigilance: 'Principe d\'imposition de l\'usufruitier sur la pleine propriété, avec exceptions prévues par l\'article 968 du CGI.',
    },
    {
      level: 'SCI ou autre société',
      advantage: 'Analyse de la fraction immobilière représentative des titres.',
      vigilance: 'Ne pas appliquer une transparence simplifiée sans vérifier la structure, les actifs et les règles de valorisation.',
    },
    {
      level: 'Crédit',
      advantage: 'Certaines dettes peuvent réduire l\'assiette taxable.',
      vigilance: 'Déductibilité conditionnelle, plafonnements et exclusions à vérifier.',
    },
  ],
  tableNote:
    'La valeur IFI est une donnée fiscale spécifique. Pour les SCPI et contrats concernés, utiliser les informations officielles fournies pour l\'année de déclaration.',
  criteriaTitle: 'Critères à croiser avec l\'IFI',
  criteriaCards: [
    { title: 'Seuil IFI', text: 'Patrimoine immobilier net taxable supérieur à 1,3 M€ au 1er janvier.' },
    { title: 'Valeur / ratio IFI', text: 'Donnée communiquée par la société de gestion ou l\'assureur. Ne pas la confondre avec la valeur de reconstitution.' },
    { title: 'Mode de détention', text: 'Direct, assurance-vie, démembrement ou société : le calcul de la fraction taxable change.' },
    { title: 'Dette déductible', text: 'Certaines dettes afférentes aux actifs imposables sont déductibles sous conditions.' },
    { title: 'Patrimoine global', text: 'L\'IFI s\'apprécie au niveau du foyer et du patrimoine immobilier net taxable total.' },
    { title: 'Documentation', text: 'Conserver les valeurs IFI, relevés d\'assureur, dettes et justificatifs utilisés dans la déclaration.' },
  ],
  commonErrors: [
    'Déclarer automatiquement 100 % de la valeur d\'une SCPI sans utiliser la fraction immobilière taxable communiquée.',
    'Confondre prix de souscription, valeur de retrait, valeur de reconstitution et valeur IFI.',
    'Croire qu\'une SCPI logée en assurance-vie est automatiquement exonérée d\'IFI.',
    'Considérer que le nu-propriétaire est toujours hors IFI sans vérifier l\'origine du démembrement et les exceptions légales.',
    'Déduire une dette sans vérifier son affectation, son éligibilité et les plafonnements applicables.',
    'Appliquer à une SCI une règle de transparence simplifiée sans analyser les actifs et la valeur des titres.',
  ],
  practicalCases: [
    {
      title: 'Détention directe — valeur IFI',
      text: 'Un associé reçoit de sa société de gestion une valeur IFI ou un ratio IFI par part au titre de l\'année. C\'est cette information officielle qu\'il utilise pour déterminer la fraction à intégrer dans son patrimoine taxable, et non la valeur de reconstitution par défaut.',
    },
    {
      title: 'Assurance-vie — UC immobilière',
      text: 'Un contrat rachetable contient une UC investie en SCPI. L\'assureur communique la fraction de la valeur de rachat représentative d\'actifs immobiliers imposables. Cette fraction peut entrer dans l\'assiette IFI du souscripteur.',
    },
    {
      title: 'Démembrement',
      text: 'Le traitement dépend de l\'origine juridique du démembrement. Le principe légal et ses exceptions doivent être vérifiés avant de répartir l\'assiette entre usufruitier et nu-propriétaire.',
    },
    {
      title: 'Dette déductible',
      text: 'Une dette contractée pour acquérir un actif immobilier taxable peut être déductible si elle remplit les conditions légales. La dette, son affectation et le capital restant dû doivent être documentés.',
    },
    {
      title: 'Détention via SCI',
      text: 'La valeur des titres est examinée à hauteur de la fraction représentative d\'actifs immobiliers imposables. Les dettes et actifs de la société doivent être analysés selon les règles IFI applicables.',
    },
  ],
  methodParagraphs: [
    'Vérifier si le patrimoine immobilier net taxable du foyer dépasse 1,3 M€ au 1er janvier.',
    'Recenser les SCPI et leur mode de détention : direct, contrat rachetable, démembrement ou société.',
    'Récupérer la valeur ou le ratio IFI officiel fourni par chaque société de gestion ou assureur.',
    'Appliquer les règles propres au mode de détention et, en démembrement, vérifier l\'origine juridique du démembrement.',
    'Identifier les dettes potentiellement déductibles et contrôler leur éligibilité.',
    'Conserver les justificatifs ayant servi au calcul et à la déclaration.',
  ],
  conclusionParagraphs: [
    'La fiscalité IFI des SCPI ne se résume pas à « direct taxable, assurance-vie exonérée ». La fraction immobilière imposable et le mode de détention déterminent l\'assiette.',
    'La donnée de référence est l\'information IFI officielle communiquée pour l\'année concernée par le gestionnaire ou l\'assureur.',
    'Démembrement, dette et détention sociétaire nécessitent une vérification juridique et fiscale avant déclaration.',
  ],
  faqItems: [
    {
      question: 'Les SCPI entrent-elles dans l\'IFI ?',
      answer: 'En principe oui à hauteur de la fraction de leur valeur représentative d\'actifs immobiliers imposables. La société de gestion communique généralement la valeur ou le ratio IFI à utiliser.',
    },
    {
      question: 'Quelle valeur déclarer ?',
      answer: 'Utiliser la valeur ou le ratio IFI communiqué pour l\'année concernée. Le prix de souscription et la valeur de reconstitution ne sont pas des substituts automatiques à cette donnée fiscale.',
    },
    {
      question: 'Les SCPI en assurance-vie sont-elles concernées ?',
      answer: 'Oui, potentiellement. Dans un contrat rachetable, la fraction de la valeur de rachat représentative d\'unités de compte immobilières imposables peut entrer dans l\'IFI. L\'assureur fournit l\'information nécessaire.',
    },
    {
      question: 'Que se passe-t-il en démembrement ?',
      answer: 'Le principe légal impose généralement l\'usufruitier sur la valeur en pleine propriété, mais l\'article 968 du CGI prévoit des exceptions selon l\'origine du démembrement. Il faut examiner le cas précis.',
    },
    {
      question: 'Peut-on déduire une dette ?',
      answer: 'Certaines dettes afférentes aux actifs immobiliers imposables peuvent être déductibles sous conditions, plafonnements et exclusions. Elles doivent être justifiées.',
    },
    {
      question: 'Les SCPI européennes sont-elles concernées par l\'IFI ?',
      answer: 'Pour un résident fiscal français soumis à l\'IFI, les actifs immobiliers étrangers peuvent entrer dans l\'assiette sous réserve des conventions fiscales internationales et de la situation exacte. Il faut vérifier pays par pays.',
    },
    {
      question: 'Faut-il déclarer chaque année ?',
      answer: 'Le foyer soumis à l\'IFI doit déterminer chaque année son patrimoine immobilier net taxable au 1er janvier avec les valeurs et ratios IFI actualisés.',
    },
    {
      question: 'Comment MaximusSCPI traite-t-il l\'IFI ?',
      answer: 'MaximusSCPI distingue le mode de détention et utilise les valeurs ou ratios IFI publiés lorsqu\'ils sont disponibles. La page reste pédagogique et ne remplace pas une analyse fiscale individualisée.',
    },
  ],
  comparateurCtaLabel: 'Comparer les SCPI et leur impact IFI potentiel',
}
