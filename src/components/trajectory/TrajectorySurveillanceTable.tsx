import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Table2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import certifiedScpiCohort from '../../data/certified_scpi_cohort.json';
import TrajectorySparkline from './TrajectorySparkline';
import {
  HISTORY_SELECT,
  ScpiHistoryRow,
  formatPeriod,
  getNumericSeries,
  humanizeSlug,
  normalizeAndDedupeHistory,
  toFiniteNumber,
  valuationGapPct,
} from './trajectoryData';

type DashboardRow = {
  scpi_slug: string;
  latest_period: string | null;
  tof: number | string | null;
  delta_4obs: number | string | null;
  endettement: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  valeur_realisation: number | string | null;
  liquidity_basis: string | null;
  liquidity_pressure_pct: number | string | null;
  retrait_attente_pct: number | string | null;
  liquidity_regime_changed: boolean | null;
  liquidity_signal_certification: string | null;
  tof_gate: string | null;
  tof_signal_eligible: boolean | null;
  liquidity_gate: string | null;
  liquidity_signal_eligible: boolean | null;
  reconstitution_gate: string | null;
  debt_gate: string | null;
  market_signal_gate: string | null;
};

type SortKey = 'tofDelta' | 'liquidite' | 'valorisation' | 'dette';
type SortDirection = 'asc' | 'desc';

type EnrichedRow = {
  slug: string;
  name: string;
  latestPeriod: string | null;
  tof: number | null;
  tofDelta: number | null;
  liquidity: number | null;
  liquidityLabel: string;
  dette: number | null;
  prix: number | null;
  reconstitution: number | null;
  realisation: number | null;
  valuationGap: number | null;
  tofSeries: number[];
};

const certifiedSlugSet = new Set<string>(certifiedScpiCohort.slugs);

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const gatePass = (value?: string | null) => Boolean(value?.startsWith('PASS'));

const safePercent = (value: unknown) => {
  const parsed = toFiniteNumber(value);
  return parsed !== null && parsed >= 0 && parsed <= 100 ? parsed : null;
};

const safeDelta = (value: unknown) => {
  const parsed = toFiniteNumber(value);
  return parsed !== null && Math.abs(parsed) <= 100 ? parsed : null;
};

const deltaTone = (value: number | null) => {
  if (value === null || Math.abs(value) < 0.01) return 'text-slate-400';
  return value > 0 ? 'text-emerald-300' : 'text-rose-300';
};

const certifiedLiquidity = (row: DashboardRow) => {
  if (
    row.liquidity_regime_changed ||
    row.liquidity_signal_certification === 'suppressed_regime_change_pending_data'
  ) {
    return { value: null, label: 'Régime en transition' };
  }

  if (!row.liquidity_signal_eligible || !gatePass(row.liquidity_gate)) {
    return { value: null, label: 'Signal non certifié' };
  }

  if (row.liquidity_basis?.startsWith('secondary_market_order_book')) {
    return {
      value: safePercent(row.liquidity_pressure_pct),
      label: 'Pression marché secondaire',
    };
  }

  if (row.liquidity_basis?.startsWith('withdrawal_queue')) {
    return {
      value: safePercent(row.retrait_attente_pct),
      label: 'File de retraits',
    };
  }

  return { value: null, label: 'Liquidité N.D.' };
};

const TrajectorySurveillanceTable: React.FC = () => {
  const [dashboardRows, setDashboardRows] = useState<DashboardRow[]>([]);
  const [historyRows, setHistoryRows] = useState<ScpiHistoryRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('tofDelta');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardLoadError, setDashboardLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) {
        if (!cancelled) {
          setDashboardLoadError(true);
          setLoading(false);
        }
        return;
      }

      const [dashboardResult, historyResult] = await Promise.all([
        supabase
          .from('scpi_trajectory_pilot_dashboard')
          .select(
            'scpi_slug,latest_period,tof,delta_4obs,endettement,prix_souscription,prix_reconstitution,valeur_realisation,liquidity_basis,liquidity_pressure_pct,retrait_attente_pct,liquidity_regime_changed,liquidity_signal_certification,tof_gate,tof_signal_eligible,liquidity_gate,liquidity_signal_eligible,reconstitution_gate,debt_gate,market_signal_gate',
          )
          .limit(100),
        supabase
          .from('scpi_indicator_history')
          .select(HISTORY_SELECT)
          .order('snapshot_at', { ascending: true })
          .limit(5000),
      ]);

      if (cancelled) return;

      if (dashboardResult.error) {
        setDashboardLoadError(true);
        console.warn('[TrajectorySurveillanceTable] Dashboard indisponible.', dashboardResult.error);
      } else {
        setDashboardRows(
          ((dashboardResult.data || []) as DashboardRow[]).filter((row) =>
            certifiedSlugSet.has(row.scpi_slug),
          ),
        );
      }

      if (historyResult.error) {
        console.warn('[TrajectorySurveillanceTable] Historique indisponible.', historyResult.error);
      } else {
        setHistoryRows(
          ((historyResult.data || []) as ScpiHistoryRow[]).filter((row) =>
            certifiedSlugSet.has(row.scpi_slug),
          ),
        );
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const historyBySlug = useMemo(() => {
    const grouped = new Map<string, ScpiHistoryRow[]>();
    historyRows.forEach((row) => {
      const list = grouped.get(row.scpi_slug) || [];
      list.push(row);
      grouped.set(row.scpi_slug, list);
    });
    return grouped;
  }, [historyRows]);

  const enrichedRows = useMemo<EnrichedRow[]>(() => {
    return dashboardRows.map((row) => {
      const history = normalizeAndDedupeHistory(historyBySlug.get(row.scpi_slug) || []).slice(-8);
      const prix = toFiniteNumber(row.prix_souscription);
      const reconstitution = toFiniteNumber(row.prix_reconstitution);
      const liquidity = certifiedLiquidity(row);

      const comparableValuation =
        gatePass(row.reconstitution_gate) &&
        gatePass(row.market_signal_gate) &&
        !row.liquidity_regime_changed &&
        !row.liquidity_basis?.startsWith('secondary_market_order_book');

      return {
        slug: row.scpi_slug,
        name: humanizeSlug(row.scpi_slug),
        latestPeriod: row.latest_period,
        tof: row.tof_signal_eligible && gatePass(row.tof_gate) ? safePercent(row.tof) : null,
        tofDelta: row.tof_signal_eligible && gatePass(row.tof_gate) ? safeDelta(row.delta_4obs) : null,
        liquidity: liquidity.value,
        liquidityLabel: liquidity.label,
        dette: gatePass(row.debt_gate) ? safePercent(row.endettement) : null,
        prix,
        reconstitution,
        realisation: toFiniteNumber(row.valeur_realisation),
        valuationGap: comparableValuation ? valuationGapPct(prix, reconstitution) : null,
        tofSeries: getNumericSeries(history, 'tof').filter((value) => value >= 0 && value <= 100),
      };
    });
  }, [dashboardRows, historyBySlug]);

  const sortedRows = useMemo(() => {
    const getSortValue = (row: EnrichedRow) => {
      if (sortKey === 'tofDelta') return row.tofDelta;
      if (sortKey === 'liquidite') return row.liquidity;
      if (sortKey === 'valorisation') return row.valuationGap;
      return row.dette;
    };

    return [...enrichedRows].sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (aValue === null && bValue === null) return a.name.localeCompare(b.name, 'fr');
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      const diff = aValue - bValue;
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [enrichedRows, sortDirection, sortKey]);

  const visibleRows = showAll ? sortedRows : sortedRows.slice(0, 8);

  const changeSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === 'tofDelta' || nextKey === 'valorisation' ? 'asc' : 'desc');
    setShowAll(false);
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-sky-300" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-sky-300" />
    );
  };



  return (
    <section id="observatoire-trajectoires" className="bg-slate-950 py-7 sm:py-9">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              <Table2 className="h-4 w-4" />
              Observatoire Maximus
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Trajectoires comparées des SCPI</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-5 text-slate-500">
              Même référentiel que Surveillance : TOF, liquidité, valorisation et dette sont affichés uniquement lorsque les gates de certification autorisent la comparaison.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => changeSort('tofDelta')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Baisses de TOF</button>
            <button type="button" onClick={() => changeSort('liquidite')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Liquidité</button>
            <button type="button" onClick={() => changeSort('valorisation')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Valorisation</button>
          </div>
        </div>

        {!loading && dashboardLoadError && (
          <div role="alert" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
            Impossible de charger les trajectoires pour le moment. Actualise la page ou réessaie plus tard.
          </div>
        )}
        {!loading && !dashboardLoadError && sortedRows.length === 0 && (
          <div role="status" className="mb-4 rounded-xl border border-slate-800 bg-slate-900/55 px-4 py-4 text-sm text-slate-300">
            Aucune trajectoire exploitable n'est disponible actuellement. Les indicateurs non certifiés restent masqués.
          </div>
        )}
        {(loading || (!dashboardLoadError && sortedRows.length > 0)) && <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/55">
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left text-sm">
              <thead className="bg-slate-950/90 text-[10px] uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">SCPI</th>
                  <th className="px-4 py-2.5">Période</th>
                  <th className="px-4 py-2.5">Trajectoire TOF</th>
                  <th className="px-4 py-2.5">
                    <button type="button" onClick={() => changeSort('tofDelta')} className="inline-flex items-center gap-1.5">Δ 4 obs. {sortIcon('tofDelta')}</button>
                  </th>
                  <th className="px-4 py-2.5">Base liquidité</th>
                  <th className="px-4 py-2.5">
                    <button type="button" onClick={() => changeSort('liquidite')} className="inline-flex items-center gap-1.5">Liquidité {sortIcon('liquidite')}</button>
                  </th>
                  <th className="px-4 py-2.5 text-right">Prix</th>
                  <th className="px-4 py-2.5 text-right">Reconstitution</th>
                  <th className="px-4 py-2.5">
                    <button type="button" onClick={() => changeSort('valorisation')} className="inline-flex items-center gap-1.5">Écart {sortIcon('valorisation')}</button>
                  </th>
                  <th className="px-4 py-2.5">
                    <button type="button" onClick={() => changeSort('dette')} className="inline-flex items-center gap-1.5">Dette {sortIcon('dette')}</button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/90">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={10} className="px-4 py-4"><div className="h-4 rounded bg-slate-800" /></td>
                    </tr>
                  ))
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.slug} className="transition hover:bg-slate-800/35">
                      <td className="px-4 py-3">
                        <a href={`/${row.slug}/`} className="font-semibold text-white hover:text-sky-300">{row.name}</a>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatPeriod(row.latestPeriod)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TrajectorySparkline values={row.tofSeries} className="text-sky-300" />
                          <span className="min-w-[54px] text-right font-semibold text-slate-200">{formatNumber(row.tof, ' %')}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${deltaTone(row.tofDelta)}`}>
                        {row.tofDelta === null ? 'N.D.' : `${row.tofDelta > 0 ? '+' : ''}${formatNumber(row.tofDelta, ' pt')}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.liquidityLabel}</td>
                      <td className="px-4 py-3 font-semibold text-slate-300">
                        {formatNumber(row.liquidity, ' %', 3)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">{formatNumber(row.prix, ' €')}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{formatNumber(row.reconstitution, ' €')}</td>
                      <td className="px-4 py-3 font-semibold text-slate-300">
                        {row.valuationGap === null ? 'N.D.' : `${row.valuationGap > 0 ? '+' : ''}${formatNumber(row.valuationGap, ' %')}`}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{formatNumber(row.dette, ' %')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>}

        {!loading && sortedRows.length > 8 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-sky-500/40 hover:text-white"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Voir les {sortedRows.length} trajectoires
                </>
              )}
            </button>
          </div>
        )}

        <p className="mt-3 text-xs leading-5 text-slate-600">
          Une donnée non certifiée, un changement de régime ou une comparaison non homogène est neutralisé en N.D. La pression d’un marché secondaire n’est jamais présentée comme une file de retraits.
        </p>
      </div>
    </section>
  );
};

export default TrajectorySurveillanceTable;
