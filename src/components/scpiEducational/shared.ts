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
  { href: '/choisir-scpi', label: 'Comment choisir une SCPI — méthode complète' },
  { href: '/meilleures-scpi-attention', label: 'Meilleures SCPI — limites des classements' },
  { href: '/comparateur-scpi-fiable', label: 'Comparateur SCPI fiable — critères à vérifier' },
  { href: '/allocation-scpi', label: 'Allocation SCPI — diversification et fiscalité' },
  { href: '/combien-investir-scpi', label: 'Combien investir en SCPI — montant et patrimoine' },
  { href: '/scpi-sante', label: 'SCPI santé — stabilité et limites' },
  { href: '/scpi-logistique', label: 'SCPI logistique — entrepôts et e-commerce' },
  { href: '/scpi-bureaux', label: 'SCPI bureaux — analyse et perspectives' },
  { href: '/scpi-commerce', label: 'SCPI commerce — rendement et risque locatif' },
  { href: '/scpi-diversifiees', label: 'SCPI diversifiées — mutualisation ou lisibilité' },
  { href: '/societe-gestion-scpi', label: 'Société de gestion SCPI — rôle et responsabilités' },
  { href: '/gestionnaire-scpi', label: 'Gestionnaire SCPI — qui gère vraiment ?' },
  { href: '/cgp-cif-scpi', label: 'CGP-CIF SCPI — conseil et analyse' },
  { href: '/psi-scpi', label: 'PSI SCPI — statut et cadre réglementaire' },
  { href: '/retrocommissions-scpi', label: 'Rétrocessions SCPI — frais et transparence' },
  { href: '/scpi-fiscalite', label: 'Fiscalité SCPI — comprendre l\'imposition' },
  { href: '/scpi-tmi-41', label: 'SCPI TMI 41 % — fiscalité et rendement net' },
  { href: '/scpi-tmi-45', label: 'SCPI TMI 45 % — analyse fiscale renforcée' },
  { href: '/scpi-revenus-etrangers', label: 'Revenus étrangers SCPI — fiscalité européenne' },
  { href: '/scpi-revenus-fonciers', label: 'Revenus fonciers SCPI — imposition' },
  { href: '/scpi-prelevements-sociaux', label: 'Prélèvements sociaux SCPI — impact sur le rendement' },
  { href: '/scpi-credit-impot', label: 'Crédit d\'impôt SCPI — revenus étrangers' },
  { href: '/scpi-taux-effectif', label: 'Taux effectif SCPI — fiscalité étrangère' },
  { href: '/scpi-ifi', label: 'SCPI et IFI — déclaration des parts' },
  { href: '/scpi-sci-is-fiscalite', label: 'SCPI en SCI à l\'IS — fiscalité' },
  { href: '/amf-scpi', label: 'AMF SCPI — contrôle et réglementation' },
  { href: '/orias-scpi', label: 'ORIAS SCPI — vérification des statuts' },
  { href: '/documents-reglementaires-scpi', label: 'Documents réglementaires SCPI — DIC, note, rapports' },
  { href: '/dic-scpi', label: 'DIC SCPI — document d\'informations clés' },
  { href: '/note-information-scpi', label: 'Note d\'information SCPI — avant souscription' },
  { href: '/scpi-credit', label: 'SCPI à crédit — effet de levier et fiscalité' },
  { href: '/scpi-comptant', label: 'SCPI au comptant — avantages et limites' },
  { href: '/scpi-retraite', label: 'SCPI pour la retraite — revenus et horizon' },
  { href: '/scpi-revenus-complementaires', label: 'SCPI revenus complémentaires — rendement net' },
  { href: '/scpi-transmission', label: 'SCPI et transmission — donation et succession' },
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
