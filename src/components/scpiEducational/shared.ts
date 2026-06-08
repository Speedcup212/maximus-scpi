export const COMPLIANCE_TEXT =
  "Cette page est pédagogique. Elle ne constitue pas une recommandation personnalisée ni un conseil en investissement. Avant toute souscription, il convient d'analyser votre situation, votre fiscalité, votre horizon d'investissement, vos objectifs et les documents réglementaires des SCPI."

export const AUTHOR_CREDIT =
  'Cabinet Eric Bellaiche, CGP-CIF inscrit ORIAS n°13001580'

export const RISK_REMINDER =
  'Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée.'

export const INTERNAL_LINKS = [
  { href: '/comparateur-scpi', label: 'Comparateur SCPI — comparer les indicateurs clés' },
  { href: '/tof-scpi', label: 'TOF SCPI — taux d\'occupation financier' },
  { href: '/capitalisation-scpi', label: 'Capitalisation SCPI — taille et diversification' },
  { href: '/decote-valeur-reconstitution-scpi', label: 'Décote et valeur de reconstitution SCPI' },
  { href: '/endettement-scpi', label: 'Endettement SCPI — dette et levier' },
  { href: '/rendement-net-scpi', label: 'Rendement net SCPI — brut, fiscalité et frais' },
  { href: '/scpi-europeennes', label: 'SCPI européennes — fiscalité et diversification' },
  { href: '/scpi-demembrement', label: 'Démembrement SCPI — nue-propriété et stratégie' },
  { href: '/scpi-assurance-vie', label: 'SCPI en assurance-vie — fiscalité et frais' },
  { href: '/frais-scpi', label: 'Frais SCPI — coûts et rendement net' },
  { href: '/risques-scpi', label: 'Risques SCPI — perte en capital, liquidité et fiscalité' },
  { href: '/liquidite-scpi', label: 'Liquidité SCPI — revente, délais et risques' },
  { href: '/baisse-prix-part-scpi', label: 'Baisse du prix de part SCPI — causes et conséquences' },
  { href: '/delai-jouissance-scpi', label: 'Délai de jouissance SCPI — impact sur le rendement' },
  { href: '/report-a-nouveau-scpi', label: 'Report à nouveau SCPI — réserve et distribution' },
] as const

export interface TableRow {
  level: string
  advantage: string
  vigilance: string
}

export interface CriteriaCard {
  title: string
  text: string
}

export interface PracticalCase {
  title: string
  text: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface ScpiEducationalPageConfig {
  path: string
  badge: string
  h1: string
  heroSubtitle: string
  seoTitle: string
  seoDescription: string
  shortAnswerTitle: string
  shortAnswer: string
  definitionParagraphs: string[]
  tableTitle: string
  tableRows: TableRow[]
  tableNote?: string
  criteriaTitle: string
  criteriaCards: CriteriaCard[]
  commonErrors: string[]
  practicalCases: PracticalCase[]
  methodParagraphs: string[]
  keyMessage: string
  conclusionParagraphs: string[]
  faqItems: FaqItem[]
  comparateurCtaLabel?: string
}
