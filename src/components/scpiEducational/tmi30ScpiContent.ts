import type { ScpiEducationalPageConfig } from './shared'

export const tmi30ScpiConfig: ScpiEducationalPageConfig = {
  path: '/scpi-tmi-30',
  badge: 'Fiscalité & profil',
  h1: 'SCPI avec TMI 30 % : direct, Europe ou assurance-vie ?',
  heroSubtitle:
    'À TMI 30 %, la fiscalité annuelle des revenus fonciers français devient un paramètre important, mais elle ne justifie aucune allocation automatique. Il faut comparer le rendement net, les conventions fiscales étrangères, les frais, le financement, l’IFI, la liquidité et l’horizon.',
  seoTitle: 'SCPI TMI 30 % : direct, Europe, assurance-vie et fiscalité',
  seoDescription:
    'SCPI et TMI 30 % : comparer détention directe, SCPI européennes, assurance-vie, démembrement et crédit avec une fiscalité réaliste et sans allocation automatique.',
  shortAnswerTitle: 'Quelle stratégie SCPI avec une TMI à 30 % ?',
  shortAnswer:
    'Il n’existe pas de répartition standard. En direct, les revenus fonciers français sont en principe soumis au barème progressif et aux prélèvements sociaux applicables. Les revenus immobiliers étrangers suivent les conventions fiscales des pays concernés. L’assurance-vie diffère l’imposition jusqu’au rachat sur la quote-part de gains. Le bon choix dépend donc de la situation du foyer, des frais et des objectifs patrimoniaux.',
  keyMessage:
    'À TMI 30 %, comparer plusieurs modes de détention est pertinent ; imposer un mix prédéfini ne l’est pas.',
  definitionParagraphs: [
    'La TMI de 30 % désigne le taux appliqué à la tranche supérieure du revenu imposable, non le taux moyen du foyer. Pour les revenus 2025 déclarés en 2026, cette tranche concerne la fraction par part comprise entre 29 580 € et 84 577 €.',
    'Des revenus fonciers français supplémentaires peuvent être imposés en partie à 30 %, auxquels s’ajoutent les prélèvements sociaux applicables. Le calcul exact dépend toutefois du foyer et des charges ou intérêts déductibles.',
    'Les SCPI européennes doivent être analysées pays par pays. Crédit d’impôt, taux effectif, retenues locales et prélèvements sociaux ne se traitent pas de façon uniforme.',
    'Dans une assurance-vie, les revenus restent dans l’enveloppe et ne sont pas imposés chaque année comme des revenus fonciers au nom du souscripteur. La fiscalité intervient lors des rachats sur la quote-part de gains.',
    'Après huit ans, un abattement annuel sur les gains retirés peut s’appliquer selon la situation familiale. Il ne rend pas l’assurance-vie automatiquement supérieure car les frais et la sélection de supports peuvent réduire l’avantage.',
    'Le crédit ou le démembrement peuvent répondre à d’autres objectifs : effet de levier, différé de revenus, préparation de la retraite ou de la transmission. Ils doivent être étudiés indépendamment d’une simple logique de TMI.',
  ],
  tableTitle: 'Option / intérêt possible / vigilance',
  tableRows: [
    { level: 'Direct France', advantage: 'Revenus immédiats, large choix, crédit possible.', vigilance: 'Frottement fiscal annuel potentiellement élevé, frais et liquidité à intégrer.' },
    { level: 'Direct Europe', advantage: 'Diversification et traitement fiscal potentiellement différent.', vigilance: 'Convention fiscale pays par pays ; ne pas appliquer un taux unique.' },
    { level: 'Assurance-vie', advantage: 'Capitalisation dans l’enveloppe et fiscalité au rachat.', vigilance: 'Frais de contrat, supports disponibles, conditions de rachat et IFI éventuel des UC immobilières.' },
    { level: 'Nue-propriété', advantage: 'Absence de distribution pendant le démembrement et prix d’acquisition décoté selon la clé.', vigilance: 'Pas de revenus, durée longue et risque sur la valeur future de la part.' },
    { level: 'Crédit', advantage: 'Effet de levier potentiel et intérêts parfois déductibles des revenus fonciers.', vigilance: 'Coût du financement, taux, assurance, cash-flow et risque de baisse des distributions.' },
  ],
  tableNote:
    'Aucune allocation 60/40, 70/30 ou autre ne peut être déduite de la seule TMI. Une simulation patrimoniale est nécessaire.',
  criteriaTitle: 'Critères décisifs à TMI 30 %',
  criteriaCards: [
    { title: 'Revenu marginal', text: 'Mesurer l’effet réel des distributions supplémentaires sur l’impôt du foyer.' },
    { title: 'Convention fiscale', text: 'Pour l’étranger, calculer pays par pays le traitement fiscal effectif.' },
    { title: 'Frais de l’enveloppe', text: 'Les frais d’assurance-vie peuvent réduire ou annuler un avantage fiscal théorique.' },
    { title: 'Rendement crédité', text: 'Vérifier le mode de traitement des distributions SCPI dans le contrat, sans supposer un taux de reversement standard.' },
    { title: 'Liquidité', text: 'La revente de parts en direct n’a pas de délai garanti ; les rachats d’assurance-vie dépendent du contrat et de l’assureur.' },
    { title: 'IFI', text: 'Les UC immobilières d’un contrat rachetable peuvent entrer dans l’IFI à hauteur de leur fraction taxable.' },
    { title: 'Crédit', text: 'Comparer coût du levier et rentabilité nette, avec scénario de baisse de distribution.' },
    { title: 'Horizon', text: 'L’horizon doit permettre d’absorber les coûts d’entrée et un éventuel manque de liquidité.' },
  ],
  commonErrors: [
    'Appliquer 30 % à l’intégralité des revenus du foyer.',
    'Recommander une allocation standard assurance-vie/direct en fonction de la seule TMI.',
    'Présenter les revenus européens comme exonérés ou identiques quel que soit le pays.',
    'Considérer l’assurance-vie comme automatiquement hors IFI.',
    'Annoncer un délai de liquidité fixe pour la SCPI ou pour l’assurance-vie.',
  ],
  practicalCases: [
    { title: 'Direct France', text: 'Le foyer simule la distribution supplémentaire, les charges déductibles, les prélèvements sociaux et l’impact sur le barème avant de retenir un rendement net.' },
    { title: 'Europe', text: 'La SCPI détient des immeubles dans plusieurs pays : le rendement net est recalculé par géographie à partir des conventions fiscales et de l’imposition locale.' },
    { title: 'Assurance-vie', text: 'Le contrat est comparé au direct en intégrant frais de gestion, supports accessibles, fiscalité des rachats et conditions de liquidité.' },
    { title: 'Mix de détention', text: 'Un mix peut être pertinent pour diversifier les cadres fiscaux et les objectifs, mais ses proportions doivent résulter de la situation du client et non d’un barème automatique.' },
  ],
  methodParagraphs: [
    'Simuler les flux nets dans chaque mode de détention avec les mêmes hypothèses de distribution et de valeur de part.',
    'Distinguer la fiscalité française des revenus immobiliers étrangers.',
    'Intégrer tous les frais, y compris ceux de l’enveloppe et du financement éventuel.',
    'Tester la liquidité et le risque dans un scénario dégradé, pas uniquement le scénario central.',
    'Valider les règles fiscales et contractuelles applicables à l’année de l’investissement.',
  ],
  conclusionParagraphs: [
    'À TMI 30 %, le direct France peut être fiscalement coûteux, mais cela ne suffit pas à l’écarter.',
    'Les SCPI européennes et l’assurance-vie peuvent améliorer certains paramètres, avec des contreparties qu’il faut chiffrer.',
    'La décision doit être construite sur un rendement net, un horizon et un niveau de risque cohérents avec le projet.',
  ],
  faqItems: [
    { question: 'Faut-il mettre les SCPI en assurance-vie à TMI 30 % ?', answer: 'Pas systématiquement. La fiscalité différée peut être intéressante, mais les frais, les supports disponibles, l’IFI et les objectifs doivent être comparés au direct.' },
    { question: 'Les SCPI européennes sont-elles toujours plus intéressantes ?', answer: 'Non. Leur fiscalité dépend des pays et des conventions, et leur qualité immobilière reste déterminante.' },
    { question: 'Peut-on définir un mix standard direct / assurance-vie ?', answer: 'Non. Une proportion standard ne tient pas compte du patrimoine, de l’horizon, des besoins de revenus, du crédit, de l’IFI ni des supports réellement disponibles.' },
    { question: 'La liquidité est-elle meilleure en assurance-vie ?', answer: 'L’assureur porte la relation de rachat du contrat, mais le délai effectif dépend des conditions contractuelles et administratives. Il ne faut pas promettre un délai fixe.' },
    { question: 'L’assurance-vie évite-t-elle l’IFI ?', answer: 'Pas automatiquement. La fraction de la valeur de rachat représentative d’unités de compte immobilières imposables peut entrer dans l’IFI.' },
  ],
  comparateurCtaLabel: 'Comparer les SCPI et modes de détention',
}
