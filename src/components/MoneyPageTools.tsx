import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

type MoneyPageToolsProps = {
  slug: string;
};

type IndicatorRow = {
  nom: string | null;
  td: number | string | null;
  tof: number | string | null;
  endettement: number | string | null;
  prime_decote: number | string | null;
  capitalisation: number | string | null;
  source_period: string | null;
  qa_status: string | null;
};

type MarketStats = {
  universeCount: number;
  medianYield: number | null;
  medianTof: number | null;
  medianDebt: number | null;
  medianDiscount: number | null;
  medianCapitalization: number | null;
  verifiedShare: number;
  sourcePeriod: string | null;
};

const SUPPORTED = new Set([
  'investir-100000-euros-scpi',
  'scpi-tmi-30-quelles-scpi-privilegier',
  '500-euros-par-mois-scpi-capital-necessaire',
]);

const parseNum = (value: number | string | null | undefined): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const median = (values: Array<number | null>): number | null => {
  const clean = values.filter((value): value is number => value !== null && Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 === 0 ? (clean[middle - 1] + clean[middle]) / 2 : clean[middle];
};

const euro = (value: number) => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
}).format(value);

const pct = (value: number | null, digits = 1) => value === null ? 'n.d.' : `${value.toFixed(digits).replace('.', ',')} %`;

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const buildMarketStats = (rows: IndicatorRow[]): MarketStats => {
  const periods = rows.map(row => row.source_period).filter((value): value is string => Boolean(value));
  const verified = rows.filter(row => /verified/i.test(row.qa_status || '')).length;
  return {
    universeCount: rows.length,
    medianYield: median(rows.map(row => parseNum(row.td))),
    medianTof: median(rows.map(row => parseNum(row.tof))),
    medianDebt: median(rows.map(row => parseNum(row.endettement))),
    medianDiscount: median(rows.map(row => parseNum(row.prime_decote))),
    medianCapitalization: median(rows.map(row => parseNum(row.capitalisation))),
    verifiedShare: rows.length ? (verified / rows.length) * 100 : 0,
    sourcePeriod: periods[0] || null,
  };
};

function MarketRadar({ stats }: { stats: MarketStats }) {
  const rows = [
    { label: 'Rendement', value: clamp(((stats.medianYield ?? 4) - 3.5) * 22) },
    { label: 'Occupation', value: clamp(((stats.medianTof ?? 85) - 80) * 5) },
    { label: 'Dette', value: clamp(100 - (stats.medianDebt ?? 20) * 2) },
    { label: 'Valorisation', value: clamp(50 - (stats.medianDiscount ?? 0) * 4) },
    { label: 'Taille', value: clamp(((stats.medianCapitalization ?? 200) / 1200) * 100) },
    { label: 'Données', value: clamp(stats.verifiedShare) },
  ];

  const width = 260;
  const height = 220;
  const cx = width / 2;
  const cy = 105;
  const radius = 62;
  const labelRadius = 88;
  const point = (value: number, index: number, r = radius) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / rows.length;
    return {
      x: cx + Math.cos(angle) * r * (value / 100),
      y: cy + Math.sin(angle) * r * (value / 100),
    };
  };
  const polygon = (level: number) => rows.map((_, index) => {
    const p = point(level, index);
    return `${p.x},${p.y}`;
  }).join(' ');
  const data = rows.map((row, index) => {
    const p = point(row.value, index);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Radar marché Maximus</p>
          <p className="mt-1 text-xs text-slate-500">Lecture agrégée de l'univers suivi, pas un classement.</p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-slate-400">{stats.universeCount} SCPI</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto mt-3 w-full max-w-[300px] overflow-visible" role="img" aria-label="Radar agrégé du marché SCPI suivi par MaximusSCPI">
        {[25, 50, 75, 100].map(level => <polygon key={level} points={polygon(level)} fill="none" stroke="rgba(148,163,184,.2)" strokeWidth="1" />)}
        {rows.map((_, index) => {
          const end = point(100, index);
          return <line key={index} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(148,163,184,.15)" strokeWidth="1" />;
        })}
        <polygon points={data} fill="rgba(0,200,150,.2)" stroke="#00C896" strokeWidth="2" />
        {rows.map((row, index) => {
          const p = point(100, index, labelRadius);
          const anchor = Math.abs(p.x - cx) < 10 ? 'middle' : p.x > cx ? 'start' : 'end';
          return <text key={row.label} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">{row.label}</text>;
        })}
      </svg>
    </div>
  );
}

function LiveMarketStrip({ stats, loading }: { stats: MarketStats | null; loading: boolean }) {
  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 text-sm text-slate-500">Chargement des données MaximusSCPI…</div>;
  }
  if (!stats) return null;

  const metrics = [
    ['TD médian', pct(stats.medianYield)],
    ['TOF médian', pct(stats.medianTof)],
    ['Dette médiane', pct(stats.medianDebt)],
    ['Capitalisation médiane', stats.medianCapitalization === null ? 'n.d.' : `${Math.round(stats.medianCapitalization)} M€`],
  ];

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Données du comparateur</p>
          <p className="mt-1 text-sm text-slate-300">Snapshot agrégé de {stats.universeCount} SCPI suivies par MaximusSCPI.</p>
        </div>
        <p className="text-[10px] text-slate-500">Source : indicateurs MaximusSCPI{stats.sourcePeriod ? ` · ${stats.sourcePeriod}` : ''}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-3">
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Allocation100kTool({ stats, loading }: { stats: MarketStats | null; loading: boolean }) {
  const [amount, setAmount] = useState(100000);
  const weights = useMemo(() => amount < 70000 ? [38, 34, 28] : amount <= 150000 ? [30, 27, 23, 20] : [24, 22, 20, 18, 16], [amount]);
  const scenarios = [4.5, 5, 6];

  return (
    <section className="mx-auto mb-10 max-w-5xl rounded-3xl border border-slate-700/70 bg-[#0D1117] p-4 shadow-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Outil MaximusSCPI</p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Construire une enveloppe multi-SCPI</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Ajuste le montant : les pondérations et les scénarios de distribution se recalculent immédiatement.</p>
        </div>
        <a href="/#quiz-section" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:opacity-90">Tester mon profil réel</a>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="money-amount" className="text-sm font-semibold text-slate-200">Montant à répartir</label>
          <span className="text-lg font-extrabold text-emerald-300">{euro(amount)}</span>
        </div>
        <input id="money-amount" type="range" min={25000} max={250000} step={5000} value={amount} onChange={event => setAmount(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {weights.map((weight, index) => (
            <div key={`${weight}-${index}`} className="rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-3 text-center">
              <p className="text-[10px] text-slate-500">SCPI {index + 1}</p>
              <p className="mt-1 text-sm font-bold text-white">{weight} %</p>
              <p className="mt-1 text-xs text-emerald-300">{euro(amount * weight / 100)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {scenarios.map(rate => {
          const annual = amount * rate / 100;
          return (
            <div key={rate} className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
              <p className="text-xs font-semibold text-slate-400">Hypothèse TD {rate.toFixed(1).replace('.', ',')} %</p>
              <p className="mt-2 text-lg font-extrabold text-white">{euro(annual)} / an</p>
              <p className="mt-1 text-xs text-slate-500">≈ {euro(annual / 12)} / mois brut</p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Illustrations brutes avant fiscalité et délai de jouissance. Les distributions, la valeur des parts et la liquidité ne sont pas garanties.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <LiveMarketStrip stats={stats} loading={loading} />
        {stats && <MarketRadar stats={stats} />}
      </div>
    </section>
  );
}

function Tmi30Tool({ stats, loading }: { stats: MarketStats | null; loading: boolean }) {
  const [tmi, setTmi] = useState<'30' | '41' | '45'>('30');
  const [franceMax, setFranceMax] = useState(10);
  const outsideTarget = 100 - franceMax;

  return (
    <section className="mx-auto mb-10 max-w-5xl rounded-3xl border border-slate-700/70 bg-[#0D1117] p-4 shadow-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Méthode MaximusSCPI</p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Tester l'orientation géographique</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Le filtre géographique est un critère d'orientation. Il ne remplace pas l'analyse fiscale liée aux conventions applicables.</p>
        </div>
        <a href="/#quiz-section" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:opacity-90">Construire mon allocation</a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
          <p className="text-xs font-semibold text-slate-400">TMI</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['30', '41', '45'] as const).map(value => (
              <button key={value} type="button" onClick={() => setTmi(value)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${tmi === value ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}>{value} %</button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">Exposition France maximale</p>
            <span className="text-lg font-extrabold text-emerald-300">{franceMax} %</span>
          </div>
          <input type="range" min={0} max={20} step={5} value={franceMax} onChange={event => setFranceMax(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" aria-label="Exposition France maximale" />
          <p className="mt-3 text-sm text-slate-300">Orientation résultante : <strong className="text-white">≥ {outsideTarget} % hors France</strong></p>
          <p className="mt-1 text-xs text-slate-500">Règle Maximus actuellement retenue : 10 % maximum, avec préférence pour 0–5 %.</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-relaxed text-slate-300">
        Avec une TMI de <strong className="text-white">{tmi} %</strong>, Maximus donne davantage de poids à la géographie des revenus. L'imposition finale dépend toutefois du pays des actifs, de la convention fiscale, du mode de détention et de la situation du contribuable.
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <LiveMarketStrip stats={stats} loading={loading} />
        {stats && <MarketRadar stats={stats} />}
      </div>
    </section>
  );
}

function Income500Tool({ stats, loading }: { stats: MarketStats | null; loading: boolean }) {
  const [monthlyTarget, setMonthlyTarget] = useState(500);
  const [rate, setRate] = useState(5);
  const annualTarget = monthlyTarget * 12;
  const capital = annualTarget / (rate / 100);

  return (
    <section className="mx-auto mb-10 max-w-5xl rounded-3xl border border-slate-700/70 bg-[#0D1117] p-4 shadow-2xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Calculateur revenus SCPI</p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Quel capital pour ton objectif mensuel ?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Le calcul est volontairement brut : il évite de donner une fausse précision fiscale.</p>
        </div>
        <a href="/#quiz-section" className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:opacity-90">Construire mon portefeuille</a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="monthly-income" className="text-sm font-semibold text-slate-200">Revenu mensuel brut visé</label>
            <span className="text-lg font-extrabold text-emerald-300">{euro(monthlyTarget)}</span>
          </div>
          <input id="monthly-income" type="range" min={250} max={2000} step={50} value={monthlyTarget} onChange={event => setMonthlyTarget(Number(event.target.value))} className="mt-4 w-full accent-emerald-400" />
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
          <p className="text-sm font-semibold text-slate-200">Hypothèse de distribution</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[4.5, 5, 6].map(value => (
              <button key={value} type="button" onClick={() => setRate(value)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${rate === value ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}>{value.toFixed(1).replace('.', ',')} %</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Capital théorique</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{euro(capital)}</p>
        <p className="mt-2 text-sm text-slate-400">pour viser {euro(monthlyTarget)}/mois brut avec une hypothèse de {rate.toFixed(1).replace('.', ',')} %.</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[4.5, 5, 6].map(value => (
          <div key={value} className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-4">
            <p className="text-xs text-slate-500">À {value.toFixed(1).replace('.', ',')} %</p>
            <p className="mt-1 text-base font-bold text-white">{euro(annualTarget / (value / 100))}</p>
            <p className="mt-1 text-[10px] text-slate-500">avant fiscalité et délai de jouissance</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Le taux de distribution passé ne préjuge pas des distributions futures. Le capital et la liquidité des parts ne sont pas garantis.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <LiveMarketStrip stats={stats} loading={loading} />
        {stats && <MarketRadar stats={stats} />}
      </div>
    </section>
  );
}

export default function MoneyPageTools({ slug }: MoneyPageToolsProps) {
  const [rows, setRows] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SUPPORTED.has(slug) || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from('scpi_indicators')
        .select('nom,td,tof,endettement,prime_decote,capitalisation,source_period,qa_status')
        .limit(100);

      if (!cancelled) {
        if (!error && data) setRows(data as IndicatorRow[]);
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  const stats = useMemo(() => rows.length ? buildMarketStats(rows) : null, [rows]);

  if (!SUPPORTED.has(slug)) return null;
  if (slug === 'investir-100000-euros-scpi') return <Allocation100kTool stats={stats} loading={loading} />;
  if (slug === 'scpi-tmi-30-quelles-scpi-privilegier') return <Tmi30Tool stats={stats} loading={loading} />;
  return <Income500Tool stats={stats} loading={loading} />;
}
