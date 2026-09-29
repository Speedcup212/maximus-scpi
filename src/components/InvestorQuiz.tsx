// MaximusSCPI — questionnaire de conversion homepage

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Scpi } from '../types/scpi'
import type {
  Montant,
  TMI,
  Horizon,
  Objectif,
  QuizData,
  QuizResult,
} from '../types/quiz'

interface InvestorQuizProps {
  onComplete: (data: QuizData) => void
  onRdvClick: () => void
}

type PartialQuizData = Partial<QuizData>
type Option<T extends string> = { value: T; label: string }

type ScpiQuality = {
  yield: number
  occupation: number
  debt: number
  valuation: number
  size: number
  liquidity: number
}

type PortfolioPick = {
  scpi: Scpi
  weight: number
  score: number
  reason: string
  vigilance: string
}

type PortfolioAnalysis = {
  orientation: string
  orientationDetail: string
  universeCount: number
  eligibleCount: number
  picks: PortfolioPick[]
  weightedYield?: number
  weightedTof?: number
  weightedDebt?: number
  weightedDiscount?: number
  radar: { label: string; value: number }[]
  strongest: string
  watch: string
}

const MONTANT_OPTIONS: Option<Montant>[] = [
  { value: 'moins-10k', label: 'Moins de 10 000 €' },
  { value: '10k-50k', label: '10 000 – 50 000 €' },
  { value: '50k-150k', label: '50 000 – 150 000 €' },
  { value: 'plus-150k', label: 'Plus de 150 000 €' },
]

const TMI_OPTIONS: Option<TMI>[] = [
  { value: '0', label: '0 %' },
  { value: '11', label: '11 %' },
  { value: '30', label: '30 %' },
  { value: '41', label: '41 % ou 45 %' },
  { value: 'inconnu', label: 'Je ne sais pas' },
]

const HORIZON_OPTIONS: Option<Horizon>[] = [
  { value: 'moins-5ans', label: 'Moins de 5 ans' },
  { value: '5-10ans', label: '5 à 10 ans' },
  { value: 'plus-10ans', label: 'Plus de 10 ans' },
]

const OBJECTIF_OPTIONS: Option<Objectif>[] = [
  { value: 'revenus', label: 'Revenus complémentaires' },
  { value: 'fiscalite', label: 'Optimiser ma fiscalité' },
  { value: 'diversification', label: 'Diversifier mon patrimoine' },
  { value: 'croissance', label: 'Faire fructifier mon capital' },
  { value: 'retraite', label: 'Préparer ma retraite' },
  { value: 'transmission', label: 'Préparer la transmission' },
]

const MONTANT_LABELS: Record<Montant, string> = {
  'moins-10k': '< 10 k€',
  '10k-50k': '10–50 k€',
  '50k-150k': '50–150 k€',
  'plus-150k': '> 150 k€',
}

const HORIZON_LABELS: Record<Horizon, string> = {
  'moins-5ans': '< 5 ans',
  '5-10ans': '5–10 ans',
  'plus-10ans': '10 ans +',
}

const OBJECTIF_LABELS: Record<Objectif, string> = {
  revenus: 'Revenus',
  fiscalite: 'Fiscalité',
  diversification: 'Diversification',
  croissance: 'Croissance',
  retraite: 'Retraite',
  transmission: 'Transmission',
}

const HIGH_TMI_FRANCE_MAX = 10
const HIGH_TMI_FRANCE_PREFERRED = 5
const isHighTmi = (tmi: TMI) => tmi === '30' || tmi === '41' || tmi === '45'
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const formatPct = (value?: number, digits = 1) =>
  finite(value) ? `${value.toFixed(digits).replace('.', ',')} %` : 'n.d.'

const franceExposure = (scpi: Scpi) =>
  (scpi.repartitionGeo ?? [])
    .filter(item => item.name.toLowerCase().includes('france'))
    .reduce((sum, item) => sum + (finite(item.value) ? item.value : 0), 0)

const getQuality = (scpi: Scpi): ScpiQuality => {
  const yieldScore = clamp((scpi.yield - 3.5) * 20)
  const occupationScore = clamp((scpi.tof - 80) * 5)
  const debtScore = finite(scpi.debt) ? clamp(100 - scpi.debt * 2) : 55
  const valuationScore = scpi.discountQaStatus === 'manual_review'
    ? 55
    : clamp(50 - scpi.discount * 4)
  const capM = Math.max(0, scpi.capitalization / 1_000_000)
  const sizeScore = clamp((Math.log10(capM + 10) / Math.log10(3010)) * 100)
  const liquidityScore = scpi.hasWaitingShares === true ? 25 : scpi.hasWaitingShares === false ? 90 : 60

  return {
    yield: yieldScore,
    occupation: occupationScore,
    debt: debtScore,
    valuation: valuationScore,
    size: sizeScore,
    liquidity: liquidityScore,
  }
}

const scoreScpi = (scpi: Scpi, objective: Objectif): number => {
  const q = getQuality(scpi)

  const weights: Record<Objectif, ScpiQuality> = {
    revenus: { yield: 35, occupation: 25, debt: 12, valuation: 10, size: 10, liquidity: 8 },
    fiscalite: { yield: 25, occupation: 20, debt: 15, valuation: 15, size: 10, liquidity: 15 },
    diversification: { yield: 20, occupation: 20, debt: 15, valuation: 15, size: 15, liquidity: 15 },
    croissance: { yield: 25, occupation: 15, debt: 10, valuation: 25, size: 15, liquidity: 10 },
    retraite: { yield: 10, occupation: 30, debt: 20, valuation: 5, size: 15, liquidity: 20 },
    transmission: { yield: 10, occupation: 25, debt: 15, valuation: 15, size: 20, liquidity: 15 },
  }

  const w = weights[objective]
  const weighted =
    q.yield * w.yield +
    q.occupation * w.occupation +
    q.debt * w.debt +
    q.valuation * w.valuation +
    q.size * w.size +
    q.liquidity * w.liquidity

  let bonus = 0
  if (objective === 'revenus' && scpi.yield >= 5.5) bonus += 4
  if (objective === 'croissance' && scpi.discountQaStatus !== 'manual_review' && scpi.discount < 0) bonus += 4
  if (objective === 'retraite' && scpi.tof >= 95) bonus += 4
  if (objective === 'diversification' && scpi.sector === 'diversifie') bonus += 4
  if (objective === 'fiscalite' && (scpi.geography === 'europe' || scpi.geography === 'international')) bonus += 4

  return clamp(weighted / 100 + bonus)
}

const reasonFor = (scpi: Scpi, objective: Objectif) => {
  const reasons: string[] = []
  const france = franceExposure(scpi)

  if (objective === 'revenus' && scpi.yield >= 5) reasons.push(`rendement ${formatPct(scpi.yield)}`)
  if (scpi.tof >= 94) reasons.push(`TOF ${formatPct(scpi.tof)}`)
  if (finite(scpi.debt) && scpi.debt <= 20) reasons.push(`dette contenue ${formatPct(scpi.debt)}`)
  if (scpi.discountQaStatus !== 'manual_review' && scpi.discount <= -2) reasons.push(`décote ${formatPct(scpi.discount)}`)
  if (scpi.capitalization >= 500_000_000) reasons.push('capitalisation significative')
  if (france <= HIGH_TMI_FRANCE_MAX && (scpi.geography === 'europe' || scpi.geography === 'international')) {
    reasons.push(france <= 0.5 ? 'exposition hors France' : `France limitée à ${formatPct(france)}`)
  }

  if (reasons.length < 2) {
    if (scpi.yield > 0) reasons.push(`rendement ${formatPct(scpi.yield)}`)
    if (scpi.tof > 0) reasons.push(`occupation ${formatPct(scpi.tof)}`)
  }

  return reasons.slice(0, 3).join(' • ')
}

const vigilanceFor = (scpi: Scpi) => {
  if (scpi.maximusWarnings?.length) return scpi.maximusWarnings[0]
  if (scpi.hasWaitingShares === true) return 'Liquidité à surveiller : parts en attente de retrait signalées.'
  if (finite(scpi.debt) && scpi.debt > 30) return `Endettement à surveiller (${formatPct(scpi.debt)}).`
  if (scpi.tof > 0 && scpi.tof < 90) return `Occupation à surveiller (TOF ${formatPct(scpi.tof)}).`
  if (scpi.discountQaStatus !== 'manual_review' && scpi.discount > 5) return `Prix en surcote de ${formatPct(scpi.discount)}.`

  if (finite(scpi.creation) && scpi.creation >= 2024) {
    return `Historique encore court : SCPI créée en ${scpi.creation}, avec un recul limité sur plusieurs cycles immobiliers.`
  }

  if (scpi.yield >= 7.5) {
    return `Distribution élevée (${formatPct(scpi.yield)}) : niveau à confirmer dans la durée et sur plusieurs exercices.`
  }

  const capitalizationM = scpi.capitalization / 1_000_000
  if (capitalizationM > 0 && capitalizationM < 250) {
    return `Capitalisation encore limitée (${Math.round(capitalizationM)} M€) : profondeur du portefeuille immobilier à suivre.`
  }

  const geoConcentration = [...(scpi.repartitionGeo ?? [])]
    .filter(item => finite(item.value))
    .sort((a, b) => b.value - a.value)[0]
  if (geoConcentration && geoConcentration.value >= 55) {
    return `Concentration géographique : ${geoConcentration.name} représente ${formatPct(geoConcentration.value)} du patrimoine.`
  }

  const sectorConcentration = [...(scpi.repartitionSector ?? [])]
    .filter(item => finite(item.value))
    .sort((a, b) => b.value - a.value)[0]
  if (sectorConcentration && sectorConcentration.value >= 60) {
    return `Concentration sectorielle : ${sectorConcentration.name} représente ${formatPct(sectorConcentration.value)} du patrimoine.`
  }

  if (scpi.discountQaStatus !== 'manual_review' && scpi.discount <= -4) {
    return `Écart de valorisation notable (${formatPct(scpi.discount)}) : cohérence du prix de part et de la valeur de reconstitution à suivre.`
  }

  if (scpi.hasWaitingShares === undefined) {
    return 'Liquidité secondaire à confirmer dans les dernières données publiées par la société de gestion.'
  }

  return 'Aucun point de vigilance majeur identifié sur les données analysées.'
}

const allocationWeights = (count: number): number[] => {
  if (count <= 1) return [100]
  if (count === 2) return [52, 48]
  if (count === 3) return [38, 34, 28]
  if (count === 4) return [30, 27, 23, 20]
  return [24, 22, 20, 18, 16]
}

const desiredScpiCount = (montant: Montant) => {
  if (montant === 'moins-10k') return 2
  if (montant === '10k-50k') return 3
  if (montant === '50k-150k') return 4
  return 5
}

const representativeBudget = (montant: Montant) => {
  if (montant === 'moins-10k') return 7_500
  if (montant === '10k-50k') return 30_000
  if (montant === '50k-150k') return 100_000
  return 200_000
}

const isStructurallyEligible = (scpi: Scpi) =>
  Boolean(scpi.name) &&
  scpi.maximusLifecycleStatus !== 'liquidation' &&
  scpi.maximusLifecycleStatus !== 'dissolution_proposed' &&
  scpi.yield >= 4 &&
  scpi.tof >= 85 &&
  scpi.capitalization >= 50_000_000

const buildPortfolioAnalysis = (data: QuizData, universe: Scpi[]): PortfolioAnalysis => {
  const highTmi = isHighTmi(data.tmi)
  const budget = representativeBudget(data.montant)
  const desiredCount = desiredScpiCount(data.montant)

  let candidates = universe.filter(isStructurallyEligible)
    .filter(scpi => scpi.minInvest <= Math.max(5_000, budget / 2))

  if (highTmi) {
    candidates = candidates.filter(scpi =>
      franceExposure(scpi) <= HIGH_TMI_FRANCE_MAX &&
      (scpi.geography === 'europe' || scpi.geography === 'international' || scpi.european)
    )
  }

  const scored = candidates.map(scpi => ({ scpi, base: scoreScpi(scpi, data.objectif) }))
  const picks: { scpi: Scpi; score: number }[] = []
  const remaining = [...scored]

  while (picks.length < desiredCount && remaining.length > 0) {
    const usedCompanies = new Set(picks.map(p => p.scpi.company))
    const usedSectors = new Set(picks.map(p => p.scpi.sector))

    let bestIndex = 0
    let bestAdjusted = -Infinity

    remaining.forEach((entry, index) => {
      let adjusted = entry.base
      if (!usedCompanies.has(entry.scpi.company)) adjusted += 8
      if (!usedSectors.has(entry.scpi.sector)) adjusted += 4
      if (entry.scpi.hasWaitingShares === true) adjusted -= 8
      if (entry.scpi.maximusDataStatus && /stale|manual|review/i.test(entry.scpi.maximusDataStatus)) adjusted -= 4

      if (highTmi) {
        const france = franceExposure(entry.scpi)
        if (france <= 0.5) adjusted += 4
        else if (france <= HIGH_TMI_FRANCE_PREFERRED) adjusted += 2
      }

      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted
        bestIndex = index
      }
    })

    const [chosen] = remaining.splice(bestIndex, 1)
    picks.push({ scpi: chosen.scpi, score: clamp(bestAdjusted) })
  }

  const weights = allocationWeights(picks.length)
  const portfolioPicks: PortfolioPick[] = picks.map((pick, index) => ({
    scpi: pick.scpi,
    score: pick.score,
    weight: weights[index] ?? 0,
    reason: reasonFor(pick.scpi, data.objectif),
    vigilance: vigilanceFor(pick.scpi),
  }))

  const weightedMetric = (extractor: (scpi: Scpi) => number | undefined) => {
    const known = portfolioPicks.filter(p => finite(extractor(p.scpi)))
    const knownWeight = known.reduce((sum, p) => sum + p.weight, 0)
    if (!known.length || knownWeight <= 0) return undefined
    return known.reduce((sum, p) => sum + (extractor(p.scpi) as number) * p.weight, 0) / knownWeight
  }

  const weightedYield = weightedMetric(scpi => scpi.yield)
  const weightedTof = weightedMetric(scpi => scpi.tof)
  const weightedDebt = weightedMetric(scpi => scpi.debt)
  const weightedDiscount = weightedMetric(scpi => scpi.discountQaStatus === 'manual_review' ? undefined : scpi.discount)

  const qualityRows = portfolioPicks.map(p => ({ q: getQuality(p.scpi), weight: p.weight }))
  const radarWeighted = (key: keyof ScpiQuality) => {
    const totalWeight = qualityRows.reduce((sum, row) => sum + row.weight, 0)
    return totalWeight > 0
      ? qualityRows.reduce((sum, row) => sum + row.q[key] * row.weight, 0) / totalWeight
      : 0
  }

  const companies = new Set(portfolioPicks.map(p => p.scpi.company)).size
  const sectors = new Set(portfolioPicks.map(p => p.scpi.sector)).size
  const diversification = portfolioPicks.length
    ? clamp(((companies / portfolioPicks.length) * 65) + ((sectors / portfolioPicks.length) * 35))
    : 0

  const radar = [
    { label: 'Rendement', value: Math.round(radarWeighted('yield')) },
    { label: 'Occupation', value: Math.round(radarWeighted('occupation')) },
    { label: 'Valorisation', value: Math.round(radarWeighted('valuation')) },
    { label: 'Dette', value: Math.round(radarWeighted('debt')) },
    { label: 'Diversif.', value: Math.round(diversification) },
    { label: 'Liquidité', value: Math.round(radarWeighted('liquidity')) },
  ]

  const sortedRadar = [...radar].sort((a, b) => b.value - a.value)
  const strongest = sortedRadar[0]?.label ?? 'Diversification'
  const watch = [...radar].sort((a, b) => a.value - b.value)[0]?.label ?? 'Liquidité'

  return {
    orientation: highTmi ? '≥ 90 % hors France' : 'Allocation France + Europe + international',
    orientationDetail: highTmi
      ? 'À partir de 30 % de TMI, Maximus privilégie les SCPI très majoritairement investies hors de France. Une SCPI reste éligible si son exposition française identifiée ne dépasse pas 10 %, avec préférence pour 0 à 5 %.'
      : 'La sélection recherche un équilibre entre rendement, occupation, valorisation, dette, liquidité et diversification.',
    universeCount: universe.length,
    eligibleCount: candidates.length,
    picks: portfolioPicks,
    weightedYield,
    weightedTof,
    weightedDebt,
    weightedDiscount,
    radar,
    strongest,
    watch,
  }
}

// Export conservé pour les usages/tests existants du questionnaire.
export function calculateResult(data: QuizData): QuizResult {
  if (data.horizon === 'moins-5ans') {
    return {
      profil: 'Horizon à réexaminer',
      score: 0,
      alerte: 'Un horizon inférieur à 5 ans est généralement trop court pour construire un portefeuille SCPI standard.',
      geographicAllocation: [],
      sectorAllocation: [],
      recommandations: ['Réexaminer l’horizon avant de sélectionner des SCPI.'],
      criteria: [],
      fiscalStrategy: [],
      vigilancePoints: ['La liquidité des parts n’est pas garantie et les frais nécessitent un horizon long.'],
    }
  }

  if (isHighTmi(data.tmi)) {
    return {
      profil: 'Orientation très majoritairement hors France',
      score: 88,
      geographicAllocation: [
        { label: 'Europe hors France', value: 70 },
        { label: 'International', value: 20 },
        { label: 'France (maximum)', value: 10 },
      ],
      sectorAllocation: [],
      recommandations: ['Privilégier les SCPI investies hors France, avec une exposition française identifiée limitée à 10 % maximum.'],
      criteria: [],
      fiscalStrategy: ['À partir de 30 % de TMI, l’orientation MaximusSCPI vise au moins 90 % hors France.'],
      vigilancePoints: ['La fiscalité étrangère varie selon les pays et les conventions applicables.'],
    }
  }

  return {
    profil: 'Orientation diversifiée',
    score: 76,
    geographicAllocation: [
      { label: 'Europe hors France', value: 45 },
      { label: 'France', value: 35 },
      { label: 'International', value: 20 },
    ],
    sectorAllocation: [],
    recommandations: ['Diversifier les sociétés de gestion, secteurs et zones géographiques.'],
    criteria: [],
    fiscalStrategy: ['Comparer la fiscalité nette France et étranger selon votre situation.'],
    vigilancePoints: ['Le capital, les revenus et la liquidité ne sont pas garantis.'],
  }
}

const TOTAL_STEPS = 4

function MiniRadar({ rows }: { rows: { label: string; value: number }[] }) {
  // ViewBox élargi sur mobile : les libellés restent entièrement dans le SVG.
  const width = 280
  const height = 236
  const centerX = width / 2
  const centerY = 116
  const radius = 62
  const labelRadius = 88
  const count = rows.length

  const point = (value: number, index: number, r = radius) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / count
    const appliedRadius = r * (value / 100)
    return {
      x: centerX + Math.cos(angle) * appliedRadius,
      y: centerY + Math.sin(angle) * appliedRadius,
    }
  }

  const polygon = (level: number) => rows.map((_, index) => {
    const p = point(level, index)
    return `${p.x},${p.y}`
  }).join(' ')

  const dataPoints = rows.map((row, index) => {
    const p = point(row.value, index)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-3 items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[280px] mx-auto overflow-visible" role="img" aria-label="Radar MaximusSCPI du portefeuille">
        {[25, 50, 75, 100].map(level => (
          <polygon key={level} points={polygon(level)} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
        ))}
        {rows.map((_, index) => {
          const end = point(100, index)
          return <line key={index} x1={centerX} y1={centerY} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
        })}
        <polygon points={dataPoints} fill="rgba(0,200,150,0.20)" stroke="#00C896" strokeWidth="2" />
        {rows.map((row, index) => {
          const p = point(100, index, labelRadius)
          const anchor = Math.abs(p.x - centerX) < 10 ? 'middle' : p.x > centerX ? 'start' : 'end'
          return (
            <text key={row.label} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" fill="#cbd5e1" fontSize="8.5" fontWeight="600">
              {row.label}
            </text>
          )
        })}
      </svg>

      <div className="grid grid-cols-2 gap-2">
        {rows.map(row => (
          <div key={row.label} className="rounded-lg border border-slate-700/60 bg-slate-950/35 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-semibold text-slate-100">{row.value}/100</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultLoading() {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto h-10 w-10 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
      <h3 className="mt-4 text-lg font-bold text-white">Analyse de l’univers SCPI…</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Croisement rendement, TOF, valorisation, dette, liquidité, diversification et fiscalité.
      </p>
    </div>
  )
}

function ShortHorizonResult({ data, onReset, onRdvClick }: { data: QuizData; onReset: () => void; onRdvClick: () => void }) {
  const handleRdv = () => {
    sessionStorage.setItem('maximus_quiz_context', JSON.stringify({ quiz: data, result: 'horizon-court' }))
    onRdvClick()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-400/35 bg-amber-400/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Diagnostic MaximusSCPI</p>
        <h3 className="mt-1 text-xl font-bold text-white">Horizon trop court pour un portefeuille SCPI standard</h3>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          Avec un horizon inférieur à 5 ans, les frais d’entrée et l’absence de liquidité garantie peuvent rendre la SCPI inadaptée. MaximusSCPI ne vous affiche donc pas artificiellement un portefeuille “optimal”.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3"><span className="text-slate-500">Montant</span><div className="mt-1 font-semibold text-white">{MONTANT_LABELS[data.montant]}</div></div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3"><span className="text-slate-500">Horizon</span><div className="mt-1 font-semibold text-white">{HORIZON_LABELS[data.horizon]}</div></div>
      </div>

      <button type="button" onClick={handleRdv} className="w-full rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:opacity-90">
        Faire analyser mon projet
      </button>
      <button type="button" onClick={onReset} className="w-full text-xs font-medium text-slate-500 hover:text-slate-300">← Modifier mes réponses</button>
    </div>
  )
}

function PortfolioResult({
  data,
  analysis,
  onReset,
  onRdvClick,
}: {
  data: QuizData
  analysis: PortfolioAnalysis
  onReset: () => void
  onRdvClick: () => void
}) {
  const handleRdv = () => {
    sessionStorage.setItem('maximus_quiz_context', JSON.stringify({
      quiz: data,
      orientation: analysis.orientation,
      portfolio: analysis.picks.map(p => ({ name: p.scpi.name, weight: p.weight })),
    }))
    onRdvClick()
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Analyse MaximusSCPI</p>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">Votre stratégie SCPI</h3>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            {analysis.picks.length} SCPI retenues
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{MONTANT_LABELS[data.montant]}</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">TMI {data.tmi === 'inconnu' ? 'inconnue' : `${data.tmi} %`}</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{HORIZON_LABELS[data.horizon]}</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{OBJECTIF_LABELS[data.objectif]}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/10 to-blue-500/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Orientation géographique</p>
            <p className="mt-0.5 text-lg font-bold text-white">{analysis.orientation}</p>
          </div>
          <span className="rounded-lg border border-emerald-400/25 bg-slate-950/30 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-300">Méthode Maximus</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{analysis.orientationDetail}</p>
        <p className="mt-2 text-[10px] text-slate-500">{analysis.universeCount} SCPI analysées • {analysis.eligibleCount} passent les filtres de cette simulation</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-3">
          <p className="text-[10px] text-slate-500">Rendement pondéré</p>
          <p className="mt-1 text-base font-bold text-white">{formatPct(analysis.weightedYield)}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-3">
          <p className="text-[10px] text-slate-500">TOF pondéré</p>
          <p className="mt-1 text-base font-bold text-white">{formatPct(analysis.weightedTof)}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-3">
          <p className="text-[10px] text-slate-500">Dette pondérée</p>
          <p className="mt-1 text-base font-bold text-white">{formatPct(analysis.weightedDebt)}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/35 p-3">
          <p className="text-[10px] text-slate-500">Décote / surcote</p>
          <p className="mt-1 text-base font-bold text-white">{formatPct(analysis.weightedDiscount)}</p>
        </div>
      </div>

      <div className="sm:hidden rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-3">
        <p className="text-center text-[10px] text-slate-400">L’allocation est prête. Consultez le détail ou faites-la valider directement.</p>
        <button type="button" onClick={handleRdv} className="mt-2 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:opacity-90">
          Faire valider cette allocation
        </button>
      </div>

      {/* Conversion d'abord : le visiteur voit la proposition avant la méthodologie détaillée. */}
      <div>
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Votre allocation proposée</p>
            <p className="text-[10px] text-slate-500">Pondérations indicatives adaptées à votre tranche de montant</p>
          </div>
        </div>

        <div className="space-y-2">
          {analysis.picks.map((pick, index) => {
            const publishedYieldNeedsContext = /premier exercice|non représentatif|non stabilis/i.test(pick.vigilance)
            return (
              <details key={pick.scpi.id} open={index === 0} className="group rounded-xl border border-slate-700/60 bg-slate-800/30 overflow-hidden">
                <summary className="list-none cursor-pointer px-3.5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-sm font-bold text-emerald-300">{pick.weight}%</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{pick.scpi.name}</p>
                        <span className="text-[10px] text-slate-500 group-open:hidden">Détails ↓</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                        <span className={publishedYieldNeedsContext ? 'text-amber-300' : ''}>TD {formatPct(pick.scpi.yield)}{publishedYieldNeedsContext ? '*' : ''}</span>
                        <span>TOF {formatPct(pick.scpi.tof)}</span>
                        <span>Dette {formatPct(pick.scpi.debt)}</span>
                      </div>
                      {publishedYieldNeedsContext && (
                        <p className="mt-1 text-[9px] leading-tight text-amber-300/80">* rendement publié à contextualiser</p>
                      )}
                    </div>
                  </div>
                </summary>
                <div className="border-t border-slate-700/50 px-3.5 py-3 space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Pourquoi elle ressort</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{pick.reason || 'Équilibre favorable entre les principaux critères analysés.'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Vigilance</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{pick.vigilance}</p>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/30 bg-slate-800/45 p-4 text-center">
        <h4 className="text-sm sm:text-base font-bold text-white">Faire valider cette allocation</h4>
        <p className="mx-auto mt-1 max-w-sm text-[10px] sm:text-xs leading-relaxed text-slate-400">
          Adéquation, disponibilité des SCPI et répartition finale avant souscription.
        </p>
        <button type="button" onClick={handleRdv} className="mt-2.5 w-full rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:opacity-90">
          Faire valider mon portefeuille
        </button>
      </div>

      <div className="pt-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Analyse approfondie</p>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/25 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Radar MaximusSCPI — portefeuille</p>
            <p className="text-[10px] text-slate-500">Synthèse des SCPI retenues dans cette simulation</p>
          </div>
        </div>
        <MiniRadar rows={analysis.radar} />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-emerald-400/8 border border-emerald-400/15 px-3 py-2 text-slate-300"><span className="font-semibold text-emerald-300">Point fort :</span> {analysis.strongest}</div>
          <div className="rounded-lg bg-amber-400/5 border border-amber-400/15 px-3 py-2 text-slate-300"><span className="font-semibold text-amber-300">À surveiller :</span> {analysis.watch}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/20 px-3.5 py-3 text-center">
        <a href="/comparateur-scpi/" className="text-xs font-medium text-emerald-300 underline underline-offset-4 hover:text-emerald-200">
          Comparer les SCPI en détail →
        </a>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500">
        Simulation informative fondée sur les données disponibles dans MaximusSCPI. Elle ne constitue pas une recommandation personnalisée ni une garantie de rendement, de liquidité ou de capital. La fiscalité étrangère dépend notamment du pays, de la convention fiscale et de votre situation.
      </p>

      <button type="button" onClick={onReset} className="w-full text-xs font-medium text-slate-500 hover:text-slate-300">← Modifier mes réponses</button>
    </div>
  )
}

export default function InvestorQuiz({ onComplete, onRdvClick }: InvestorQuizProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<PartialQuizData>({})
  const [showTmiTooltip, setShowTmiTooltip] = useState(false)
  const [locked, setLocked] = useState(false)
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(false)

  const completedData = useMemo<QuizData | null>(() => {
    if (
      step < TOTAL_STEPS ||
      !data.montant ||
      !data.tmi ||
      !data.horizon ||
      !data.objectif
    ) return null

    return data as QuizData
  }, [data, step])

  useEffect(() => {
    if (!completedData) return

    if (completedData.horizon === 'moins-5ans') {
      setAnalysis(null)
      setAnalysisLoading(false)
      setAnalysisError(false)
      return
    }

    let cancelled = false
    setAnalysisLoading(true)
    setAnalysisError(false)

    import('../data/scpiData')
      .then(({ scpiData }) => {
        if (cancelled) return
        setAnalysis(buildPortfolioAnalysis(completedData, scpiData))
        setAnalysisLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setAnalysisError(true)
        setAnalysisLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [completedData])

  const selectAnswer = <K extends keyof QuizData>(key: K, value: QuizData[K]) => {
    if (locked) return
    const updated = { ...data, [key]: value }
    setData(updated)
    setLocked(true)

    window.setTimeout(() => {
      if (step >= TOTAL_STEPS - 1) {
        const finalData = updated as QuizData
        onComplete(finalData)
        setStep(TOTAL_STEPS)
      } else {
        setStep(current => current + 1)
      }
      setLocked(false)
    }, 220)
  }

  const goBack = () => {
    if (step > 0 && step < TOTAL_STEPS) setStep(current => current - 1)
  }

  const reset = () => {
    setStep(0)
    setData({})
    setShowTmiTooltip(false)
    setLocked(false)
    setAnalysis(null)
    setAnalysisError(false)
  }

  const optionButtonClass = (selected: boolean) => [
    'group w-full text-left px-4 py-3.5 rounded-xl border text-slate-100 font-medium',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
    'flex items-center justify-between gap-3',
    selected
      ? 'border-emerald-400/60 bg-emerald-400/15'
      : 'border-slate-700/70 bg-slate-800/40 hover:border-emerald-400/60 hover:bg-emerald-400/10',
  ].join(' ')

  const renderProgress = () => (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Étape {step + 1} sur {TOTAL_STEPS}</span>
        <span className="text-xs font-bold text-emerald-300">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-inset ring-slate-700/60">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-400 transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  )

  const renderQuestion = (
    title: ReactNode,
    subtitle: string,
    options: { value: string; label: string }[],
    onSelect: (value: string) => void,
    selectedValue?: string
  ) => (
    <div className="transition-all duration-300">
      <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 mb-5 text-xs sm:text-sm text-slate-400">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => onSelect(opt.value)} className={optionButtonClass(selectedValue === opt.value)}>
            <span>{opt.label}</span>
            <span className={`h-2 w-2 rounded-full bg-emerald-400 transition-opacity ${selectedValue === opt.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div id="quiz-section" className="scroll-mt-24 rounded-3xl border border-emerald-400/20 bg-slate-900/85 p-5 sm:p-7 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-100">Analyse MaximusSCPI</span>
            {step < TOTAL_STEPS && <span className="block text-[10px] text-slate-500">4 questions • analyse immédiate • sans coordonnées</span>}
          </div>
        </div>
        {step < TOTAL_STEPS && <span className="shrink-0 rounded-full border border-slate-700/70 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">≈ 30 sec</span>}
      </div>

      {step < TOTAL_STEPS && renderProgress()}

      {step > 0 && step < TOTAL_STEPS && (
        <button type="button" onClick={goBack} className="mb-4 text-sm font-medium text-slate-400 hover:text-slate-200">← Précédent</button>
      )}

      {step === 0 && renderQuestion(
        'Quel montant envisagez-vous d’investir ?',
        'Le montant détermine le niveau de diversification réaliste du portefeuille.',
        MONTANT_OPTIONS,
        value => selectAnswer('montant', value as Montant),
        data.montant,
      )}

      {step === 1 && (
        <div className="transition-all duration-300">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Quelle est votre tranche marginale d’imposition ?</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">Elle influence fortement la géographie de l’allocation et la fiscalité nette potentielle.</p>
          <button type="button" onClick={() => setShowTmiTooltip(v => !v)} className="mt-2 mb-4 text-xs underline text-slate-400 hover:text-slate-200">Comment la trouver ?</button>
          {showTmiTooltip && (
            <p className="mb-4 rounded-lg border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-xs text-slate-300">Consultez votre dernier avis d’imposition, rubrique « taux marginal d’imposition ».</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TMI_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => selectAnswer('tmi', opt.value)} className={optionButtonClass(data.tmi === opt.value)}>
                <span>{opt.label}</span>
                <span className={`h-2 w-2 rounded-full bg-emerald-400 transition-opacity ${data.tmi === opt.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && renderQuestion(
        'Quel est votre horizon d’investissement ?',
        'MaximusSCPI bloque volontairement une proposition standard lorsque l’horizon est trop court.',
        HORIZON_OPTIONS,
        value => selectAnswer('horizon', value as Horizon),
        data.horizon,
      )}

      {step === 3 && renderQuestion(
        'Quel est votre objectif principal ?',
        'Il modifie la pondération des critères : rendement, occupation, valorisation, dette et liquidité.',
        OBJECTIF_OPTIONS,
        value => selectAnswer('objectif', value as Objectif),
        data.objectif,
      )}

      {completedData && completedData.horizon === 'moins-5ans' && (
        <ShortHorizonResult data={completedData} onReset={reset} onRdvClick={onRdvClick} />
      )}

      {completedData && completedData.horizon !== 'moins-5ans' && analysisLoading && <ResultLoading />}

      {completedData && completedData.horizon !== 'moins-5ans' && analysisError && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-slate-300">L’analyse détaillée n’a pas pu charger les données SCPI. Le projet peut néanmoins être repris avec un conseiller.</div>
          <button type="button" onClick={onRdvClick} className="w-full rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-bold text-slate-950">Faire analyser mon projet</button>
          <button type="button" onClick={reset} className="w-full text-xs text-slate-500">← Modifier mes réponses</button>
        </div>
      )}

      {completedData && completedData.horizon !== 'moins-5ans' && analysis && (
        <PortfolioResult data={completedData} analysis={analysis} onReset={reset} onRdvClick={onRdvClick} />
      )}
    </div>
  )
}
