// MaximusSCPI — types quiz — refonte homepage

export type Montant =
  | 'moins-10k'
  | '10k-50k'
  | '50k-150k'
  | 'plus-150k'

export type TMI =
  | 'inconnu'
  | '11'
  | '30'
  | '41'
  | '45'

export type Horizon =
  | 'moins-5ans'
  | '5-10ans'
  | 'plus-10ans'

export type Objectif =
  | 'revenus'
  | 'fiscalite'
  | 'diversification'
  | 'croissance'
  | 'retraite'
  | 'transmission'

export type QuizData = {
  montant: Montant
  tmi: TMI
  horizon: Horizon
  objectif: Objectif
}

export type AllocationItem = {
  label: string
  value: number
}

export type AnalysisCriterion = {
  label: string
  status: 'prioritaire' | 'important' | 'a-verifier'
  description: string
}

export type QuizResult = {
  profil: string
  score: number
  recommandations: string[]
  alerte?: string
  geographicAllocation: AllocationItem[]
  sectorAllocation: AllocationItem[]
  criteria: AnalysisCriterion[]
  fiscalStrategy: string[]
  vigilancePoints: string[]
}
