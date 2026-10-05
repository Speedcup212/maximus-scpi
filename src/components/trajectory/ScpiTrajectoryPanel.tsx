import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Database, LineChart as LineChartIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CERTIFIED_HISTORY_SELECT,
  CertifiedLiquiditySnapshot,
  ScpiHistoryRow,
  TrajectorySignalGate,
  applyCertifiedLiquidity,
  currentCertifiedLiquidity,
  formatPeriod,
  formatSigned,
  latestDelta,
  liquidityLabel,
  normalizeAndDedupeHistory,
  valuationGapPct,
} from './trajectoryData';

type MetricKey = 'tof' | 'liquidite' | 'valorisation' | 'distribution' | 'dette';

type ScpiTrajectoryPanelProps = {
  scpiSlug: string;
};

const metricTabs: Array<{ key: MetricKey; label: string }> = [
  { key: 'tof', label: 'TOF' },
  { key: 'liquidite', label: 'Liquidité' },
  { key: 'valorisation', label: 'Valorisation' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'dette', label: 'Dette' },
];

const numberFormatter = (value: number | null, suffix = '', maxDigits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: maxDigits })}${suffix}`;

const ScpiTrajectoryPanel: React.FC<ScpiTrajectoryPanelProps> = ({ scpiSlug }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('tof');
  const [rows, setRows] = useState<ScpiHistoryRow[]>([]);
  const [liquidity, setLiquidity] = useState<CertifiedLiquiditySnapshot | null>(null);
  const [signalGate, setSignalGate] = useState<TrajectorySignalGate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setRows([]);
      setLiquidity(null);
      setSignalGate(null);
      if (!supabase || !scpiSlug) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [historyResult, liquidityResult, gateResult] = await Promise.all([
        supabase
        .from('scpi_trajectory_pilot_history')
        .select(CERTIFIED_HISTORY_SELECT)
        .eq('scpi_slug', scpiSlug)
        .order('snapshot_at', { ascending: true })
        .limit(80),
        supabase.from('scpi_trajectory_pilot_liquidity')
          .select('scpi_slug,source_period,liquidity_basis,liquidity_pressure_pct,retrait_attente_pct,regime_changed,signal_certification')
          .eq('scpi_slug', scpiSlug).maybeSingle(),
        supabase.from('scpi_trajectory_signal_gate')
          .select('scpi_slug,data_gate,structural_gate,semantic_gate,liquidity_gate,liquidity_signal_eligible')
          .eq('scpi_slug', scpiSlug).maybeSingle(),
      ]);

      if (cancelled) return;
      if (historyResult.error) {
        console.warn('[ScpiTrajectoryPanel] Historique indisponible.', historyResult.error);
        setLoading(false);
        return;
      }

      setRows((historyResult.data || []) as unknown as ScpiHistoryRow[]);
      if (liquidityResult.error || gateResult.error) {
        console.warn('[ScpiTrajectoryPanel] Contexte de liquidité indisponible : ratios masqués.');
      } else {
        setLiquidity(liquidityResult.data as CertifiedLiquiditySnapshot | null);
        setSignalGate(gateResult.data as TrajectorySignalGate | null);
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [scpiSlug]);

  const history = useMemo(() => applyCertifiedLiquidity(normalizeAndDedupeHistory(rows), liquidity, signalGate), [rows, liquidity, signalGate]);
  const recentHistory = useMemo(() => history.slice(-16), [history]);
  const latest = history[history.length - 1] || null;

  const chartData = useMemo(
    () =>
      recentHistory.map((row) => ({
        period: formatPeriod(row.source_period),
        tof: row.tof,
        retrait_attente_pct: row.retrait_attente_pct,
        secondary_pressure_pct: row.liquidity_basis === 'secondary_market_order_book' ? row.liquidity_pressure_pct : null,
        prix_souscription: row.prix_souscription,
        prix_reconstitution: row.prix_reconstitution,
        valeur_realisation: row.valeur_realisation,
        distribution_par_part: row.distribution_par_part,
        endettement: row.endettement,
      })),
    [recentHistory],
  );

  const tofDelta = latestDelta(history, 'tof', 4);
  const { value: liquidityValue, delta: liquidityDelta } = currentCertifiedLiquidity(history, liquidity, signalGate);
  const debtDelta = latestDelta(history, 'endettement', 4);
  const distributionDelta = latestDelta(history, 'distribution_par_part', 4);
  const valuationGap = latest
    ? valuationGapPct(latest.prix_souscription, latest.prix_reconstitution)
    : null;

  if (loading) {
    return (
      <section className="border-y border-slate-800 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-56 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        </div>
      </section>
    );
  }

  if (history.length < 2) return null;

  const renderChart = () => {
    if (activeMetric === 'liquidite') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
            <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} width={56} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10 }} labelStyle={{ color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="linear" dataKey="retrait_attente_pct" name="File de retraits (%)" connectNulls={false} stroke="#f59e0b" strokeWidth={2.6} dot={{ r: 2.8 }} />
            <Line type="linear" dataKey="secondary_pressure_pct" name="Pression du marché secondaire (%)" connectNulls={false} stroke="#38bdf8" strokeWidth={2.6} dot={{ r: 2.8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (activeMetric === 'valorisation') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
            <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} width={56} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="prix_souscription" name="Prix de part" connectNulls stroke="#38bdf8" strokeWidth={2.4} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="prix_reconstitution" name="Valeur de reconstitution" connectNulls stroke="#34d399" strokeWidth={2.4} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="valeur_realisation" name="Valeur de réalisation" connectNulls stroke="#fbbf24" strokeWidth={2.1} dot={{ r: 2.2 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    const config =
      activeMetric === 'tof'
        ? { dataKey: 'tof', name: 'TOF (%)', stroke: '#38bdf8' }
        : activeMetric === 'distribution'
            ? { dataKey: 'distribution_par_part', name: 'Distribution / part', stroke: '#34d399' }
            : { dataKey: 'endettement', name: 'Endettement (%)', stroke: '#a78bfa' };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
          <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} width={56} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            name={config.name}
            connectNulls
            stroke={config.stroke}
            strokeWidth={2.6}
            dot={{ r: 2.8 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <section id="trajectoire-scpi" className="border-y border-slate-800 bg-slate-950 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              <LineChartIcon className="h-4 w-4" />
              Trajectoire Maximus
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">L’évolution des fondamentaux dans le temps</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Données historiques consolidées à partir des bulletins et documents officiels. Le graphique montre les observations disponibles, sans transformer la tendance en score supplémentaire.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
            <Database className="h-4 w-4 text-slate-500" />
            {history.length} périodes observées
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-500">TOF actuel</div>
            <div className="mt-1 text-xl font-bold text-white">{numberFormatter(latest?.tof ?? null, ' %')}</div>
            <div className="mt-1 text-xs text-slate-400">Variation sur un an : {formatSigned(tofDelta, ' pt')}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-500">{liquidityLabel(latest?.liquidity_basis)}</div>
            <div className="mt-1 text-xl font-bold text-white">{numberFormatter(liquidityValue, ' %')}</div>
            <div className="mt-1 text-xs text-slate-400">Variation sur un an : {formatSigned(liquidityDelta, ' pt')}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-500">Prix / reconstitution</div>
            <div className="mt-1 text-xl font-bold text-white">
              {numberFormatter(latest?.prix_souscription ?? null, ' €', 0)} / {numberFormatter(latest?.prix_reconstitution ?? null, ' €')}
            </div>
            <div className="mt-1 text-xs text-slate-400">Écart {formatSigned(valuationGap, ' %')}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-500">Distribution / part</div>
            <div className="mt-1 text-xl font-bold text-white">{numberFormatter(latest?.distribution_par_part ?? null, ' €')}</div>
            <div className="mt-1 text-xs text-slate-400">Variation sur un an : {formatSigned(distributionDelta, ' €')}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs text-slate-500">Endettement</div>
            <div className="mt-1 text-xl font-bold text-white">{numberFormatter(latest?.endettement ?? null, ' %')}</div>
            <div className="mt-1 text-xs text-slate-400">Variation sur un an : {formatSigned(debtDelta, ' pt')}</div>
          </div>
        </div>

        {activeMetric === 'liquidite' && (
            <p className="mb-4 text-xs leading-5 text-slate-400">
              {liquidity?.regime_changed
                ? 'Changement de régime : la file de retraits et le marché secondaire ne sont pas directement comparables. '
                : ''}
              {liquidity?.signal_certification === 'suppressed_regime_change_pending_data'
                ? 'Les données du nouveau marché sont en attente ; aucun ratio ni amélioration ne peut être déduit de l’annulation de la file.'
                : !liquidity || !signalGate
                  ? 'Contexte certifié indisponible ; les ratios de liquidité sont masqués.'
                  : 'Les interruptions correspondent à des données absentes ou non comparables. La pression secondaire est distincte de la file de retraits.'}
            </p>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {metricTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveMetric(tab.key)}
                className={
                  activeMetric === tab.key
                    ? 'whitespace-nowrap rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950 sm:text-sm'
                    : 'whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 sm:text-sm'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-[300px] w-full sm:h-[360px]">{renderChart()}</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white sm:px-5">
            <Activity className="h-4 w-4 text-sky-300" />
            Historique vérifiable
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3 text-right">TOF</th>
                  <th className="px-4 py-3 text-right">Liquidité / base</th>
                  <th className="px-4 py-3 text-right">Prix</th>
                  <th className="px-4 py-3 text-right">Reconstitution</th>
                  <th className="px-4 py-3 text-right">Réalisation</th>
                  <th className="px-4 py-3 text-right">Dette</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {history
                  .slice(-8)
                  .reverse()
                  .map((row, index) => (
                    <tr key={`${row.source_period || row.snapshot_at}-${index}`} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-white">{formatPeriod(row.source_period)}</td>
                      <td className="px-4 py-3 text-right">{numberFormatter(row.tof, ' %')}</td>
                      <td className="px-4 py-3 text-right">
                        {numberFormatter(row.liquidity_basis === 'secondary_market_order_book' ? row.liquidity_pressure_pct : row.retrait_attente_pct, ' %')}
                        <span className="block text-[10px] text-slate-500">{liquidityLabel(row.liquidity_basis)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{numberFormatter(row.prix_souscription, ' €')}</td>
                      <td className="px-4 py-3 text-right">{numberFormatter(row.prix_reconstitution, ' €')}</td>
                      <td className="px-4 py-3 text-right">{numberFormatter(row.valeur_realisation, ' €')}</td>
                      <td className="px-4 py-3 text-right">{numberFormatter(row.endettement, ' %')}</td>
                      <td className="px-4 py-3">
                        {row.source_url ? (
                          <a
                            href={row.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-sky-300 hover:text-sky-200"
                          >
                            Document officiel ↗
                          </a>
                        ) : (
                          <span className="text-slate-600">N.D.</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScpiTrajectoryPanel;
