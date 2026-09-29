import type { Scpi, ScpiRepartition } from '../types/scpi'

type PickLike = { scpi: Scpi; weight: number }

type RadarRow = { label: string; value: number }

type DonutRow = { name: string; value: number }

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const formatPct = (value?: number, digits = 1) =>
  finite(value) ? `${value.toFixed(digits).replace('.', ',')} %` : 'n.d.'

const formatEuro = (value?: number) => {
  if (!finite(value) || value <= 0) return 'n.d.'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

const formatCapitalization = (value?: number) => {
  if (!finite(value) || value <= 0) return 'n.d.'
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.', ',')} Md€`
  return `${Math.round(value / 1_000_000)} M€`
}

const normalizeRows = (rows?: ScpiRepartition[], maxRows = 6): DonutRow[] => {
  const cleaned = (rows ?? [])
    .filter(row => row.name && finite(row.value) && row.value > 0)
    .map(row => ({ name: row.name, value: row.value }))
    .sort((a, b) => b.value - a.value)

  if (cleaned.length <= maxRows) return cleaned
  const head = cleaned.slice(0, maxRows - 1)
  const other = cleaned.slice(maxRows - 1).reduce((sum, row) => sum + row.value, 0)
  return [...head, { name: 'Autres', value: other }]
}

const PALETTE = ['#00C896', '#3B82F6', '#A78BFA', '#F59E0B', '#F472B6', '#22D3EE', '#94A3B8']

function DonutChart({ title, rows }: { title: string; rows: DonutRow[] }) {
  const cleaned = normalizeRows(rows)
  const total = cleaned.reduce((sum, row) => sum + row.value, 0)

  if (!cleaned.length || total <= 0) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="mt-3 text-xs text-slate-500">Répartition non disponible dans les données actuelles.</p>
      </div>
    )
  }

  let cursor = 0
  const gradient = cleaned.map((row, index) => {
    const start = cursor
    const end = cursor + (row.value / total) * 100
    cursor = end
    return `${PALETTE[index % PALETTE.length]} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
      <p className="text-xs font-semibold text-white">{title}</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="absolute inset-[16px] flex items-center justify-center rounded-full bg-slate-900">
            <span className="text-[10px] font-semibold text-slate-400">100 %</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {cleaned.map((row, index) => (
            <div key={`${title}-${row.name}`} className="flex items-center justify-between gap-3 text-[10px]">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
                <span className="truncate text-slate-400">{row.name}</span>
              </div>
              <span className="shrink-0 font-semibold text-slate-200">{formatPct((row.value / total) * 100)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompactRadar({ rows }: { rows: RadarRow[] }) {
  const width = 250
  const height = 214
  const centerX = width / 2
  const centerY = 105
  const radius = 58
  const labelRadius = 82
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
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/25 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-[250px] overflow-visible" role="img" aria-label="Radar MaximusSCPI individuel">
        {[25, 50, 75, 100].map(level => (
          <polygon key={level} points={polygon(level)} fill="none" stroke="rgba(148,163,184,0.20)" strokeWidth="1" />
        ))}
        {rows.map((_, index) => {
          const end = point(100, index)
          return <line key={index} x1={centerX} y1={centerY} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.16)" strokeWidth="1" />
        })}
        <polygon points={dataPoints} fill="rgba(0,200,150,0.18)" stroke="#00C896" strokeWidth="2" />
        {rows.map((row, index) => {
          const p = point(100, index, labelRadius)
          const anchor = Math.abs(p.x - centerX) < 10 ? 'middle' : p.x > centerX ? 'start' : 'end'
          return (
            <text key={row.label} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" fill="#cbd5e1" fontSize="8" fontWeight="600">
              {row.label}
            </text>
          )
        })}
      </svg>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        {rows.map(row => (
          <div key={row.label} className="rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-center">
            <div className="text-[9px] text-slate-500">{row.label}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-slate-200">{row.value}/100</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const radarForScpi = (scpi: Scpi): RadarRow[] => {
  const yieldScore = clamp((scpi.yield - 3.5) * 20)
  const occupationScore = clamp((scpi.tof - 80) * 5)
  const valuationScore = scpi.discountQaStatus === 'manual_review' ? 55 : clamp(50 - scpi.discount * 4)
  const debtScore = finite(scpi.debt) ? clamp(100 - scpi.debt * 2) : 55
  const liquidityScore = scpi.hasWaitingShares === true ? 25 : scpi.hasWaitingShares === false ? 90 : 60
  const geoMax = Math.max(0, ...(scpi.repartitionGeo ?? []).map(row => finite(row.value) ? row.value : 0))
  const sectorMax = Math.max(0, ...(scpi.repartitionSector ?? []).map(row => finite(row.value) ? row.value : 0))
  const diversificationScore = clamp(100 - ((geoMax + sectorMax) / 2) + 20)

  return [
    { label: 'Rendement', value: Math.round(yieldScore) },
    { label: 'Occupation', value: Math.round(occupationScore) },
    { label: 'Valorisation', value: Math.round(valuationScore) },
    { label: 'Dette', value: Math.round(debtScore) },
    { label: 'Diversif.', value: Math.round(diversificationScore) },
    { label: 'Liquidité', value: Math.round(liquidityScore) },
  ]
}

const roleForScpi = (scpi: Scpi) => {
  if (scpi.geography === 'europe' && scpi.sector === 'diversifie') return 'Diversification européenne multi-sectorielle'
  if (scpi.geography === 'europe') return `Diversification européenne — ${scpi.sector}`
  if (scpi.geography === 'international') return 'Diversification internationale'
  if (scpi.sector === 'diversifie') return 'Socle diversifié du portefeuille'
  return `Exposition ${scpi.sector}`
}

export function ScpiDetailedAnalysis({ scpi }: { scpi: Scpi }) {
  const radar = radarForScpi(scpi)
  const geoRows = normalizeRows(scpi.repartitionGeo)
  const sectorRows = normalizeRows(scpi.repartitionSector)

  const metrics = [
    ['Rendement', formatPct(scpi.yield)],
    ['TOF', formatPct(scpi.tof)],
    ['Dette', formatPct(scpi.debt)],
    ['Décote / surcote', scpi.discountQaStatus === 'manual_review' ? 'à vérifier' : formatPct(scpi.discount)],
    ['Capitalisation', formatCapitalization(scpi.capitalization)],
    ['Prix de part', formatEuro(scpi.price)],
    ['Délai de jouissance', finite(scpi.delaiJouissance) ? `${scpi.delaiJouissance} mois` : 'n.d.'],
    ['Risque', finite(scpi.profilRisque) ? `${scpi.profilRisque}/7` : 'n.d.'],
  ]

  return (
    <div className="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Rôle dans le portefeuille</p>
        <p className="mt-1 text-xs font-medium text-slate-200">{roleForScpi(scpi)}</p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Chiffres clés</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-700/60 bg-slate-950/30 px-3 py-2">
              <p className="text-[9px] text-slate-500">{label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Radar MaximusSCPI</p>
          <CompactRadar rows={radar} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <DonutChart title="Répartition géographique" rows={geoRows} />
          <DonutChart title="Répartition sectorielle" rows={sectorRows} />
        </div>
      </div>
    </div>
  )
}

const aggregateDistribution = (picks: PickLike[], selector: (scpi: Scpi) => ScpiRepartition[] | undefined): DonutRow[] => {
  const totals = new Map<string, number>()
  picks.forEach(pick => {
    const rows = selector(pick.scpi) ?? []
    rows.forEach(row => {
      if (!row.name || !finite(row.value) || row.value <= 0) return
      totals.set(row.name, (totals.get(row.name) ?? 0) + row.value * (pick.weight / 100))
    })
  })

  return normalizeRows([...totals.entries()].map(([name, value]) => ({ name, value })), 7)
}

export function PortfolioDistributionCharts({ picks }: { picks: PickLike[] }) {
  const geo = aggregateDistribution(picks, scpi => scpi.repartitionGeo)
  const sectors = aggregateDistribution(picks, scpi => scpi.repartitionSector)

  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Répartition consolidée du portefeuille</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DonutChart title="Géographie du portefeuille" rows={geo} />
        <DonutChart title="Secteurs du portefeuille" rows={sectors} />
      </div>
    </div>
  )
}
