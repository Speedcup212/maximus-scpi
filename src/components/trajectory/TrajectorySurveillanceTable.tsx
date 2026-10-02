import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Table2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
  retrait_attente_pct: number | string | null;
  endettement: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  valeur_realisation: number | string | null;
  source_confidence: number | string | null;
};

type SortKey = 'tofDelta' | 'retraits' | 'valorisation' | 'dette';
type SortDirection = 'asc' | 'desc';

type EnrichedRow = {
  slug: string;
  name: string;
  latestPeriod: string | null;
  tof: number | null;
  tofDelta: number | null;
  retraits: number | null;
  dette: number | null;
  prix: number | null;
  reconstitution: number | null;
  realisation: number | null;
  valuationGap: number | null;
  tofSeries: number[];
  liquiditySeries: number[];
};

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const deltaTone = (value: number | null, inverse = false) => {
  if (value === null || Math.abs(value) < 0.01) return 'text-slate-400';
  const good = inverse ? value < 0 : value > 0;
  return good ? 'text-emerald-300' : 'text-rose-300';
};

const TrajectorySurveillanceTable: React.FC = () => {
  const [dashboardRows, setDashboardRows] = useState<DashboardRow[]>([]);
  const [historyRows, setHistoryRows] = useState<ScpiHistoryRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('retraits');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [dashboardResult, historyResult] = await Promise.all([
        supabase
          .from('scpi_trajectory_pilot_dashboard')
          .select(
            'scpi_slug,latest_period,tof,delta_4obs,retrait_attente_pct,endettement,prix_souscription,prix_reconstitution,valeur_realisation,source_confidence',
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
        console.warn('[TrajectorySurveillanceTable] Dashboard indisponible.', dashboardResult.error);
      } else {
        setDashboardRows((dashboardResult.data || []) as unknown as DashboardRow[]);
      }

      if (historyResult.error) {
        console.warn('[TrajectorySurveillanceTable] Historique indisponible.', historyResult.error);
      } else {
        setHistoryRows((historyResult.data || []) as unknown as ScpiHistoryRow[]);
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

      return {
        slug: row.scpi_slug,
        name: humanizeSlug(row.scpi_slug),
        latestPeriod: row.latest_period,
        tof: toFiniteNumber(row.tof),
        tofDelta: toFiniteNumber(row.delta_4obs),
        retraits: toFiniteNumber(row.retrait_attente_pct),
        dette: toFiniteNumber(row.endettement),
        prix,
        reconstitution,
        realisation: toFiniteNumber(row.valeur_realisation),
        valuationGap: valuationGapPct(prix, reconstitution),
        tofSeries: getNumericSeries(history, 'tof'),
        liquiditySeries: getNumericSeries(history, 'retrait_attente_pct'),
      };
    });
  }, [dashboardRows, historyBySlug]);

  const sortedRows = useMemo(() => {
    const getSortValue = (row: EnrichedRow) => {
      if (sortKey === 'tofDelta') return row.tofDelta;
      if (sortKey === 'retraits') return row.retraits;
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

  const changeSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === 'tofDelta' || nextKey === 'valorisation' ? 'asc' : 'desc');
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-sky-300" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-sky-300" />
    );
  };

  if (!loading && sortedRows.length === 0) return null;

  return (
    <section id="observatoire-trajectoires" className="border-t border-slate-800 bg-slate-950 py-12 sm:py-16">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              <Table2 className="h-4 w-4" />
              Observatoire Maximus
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Trajectoires comparées des SCPI</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Une lecture factuelle des mouvements de TOF, des retraits, de la valorisation et de la dette. Clique sur une colonne pour faire ressortir les écarts les plus significatifs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => changeSort('tofDelta')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Baisses de TOF</button>
            <button type="button" onClick={() => changeSort('retraits')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Retraits élevés</button>
            <button type="button" onClick={() => changeSort('valorisation')} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 hover:border-sky-500/50">Valorisation</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55 shadow-2xl shadow-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-slate-950/90 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">SCPI</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3">Trajectoire TOF</th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => changeSort('tofDelta')} className="inline-flex items-center gap-1.5">Δ 4 obs. {sortIcon('tofDelta')}</button>
                  </th>
                  <th className="px-4 py-3">Trajectoire retraits</th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => changeSort('retraits')} className="inline-flex items-center gap-1.5">Retraits {sortIcon('retraits')}</button>
                  </th>
                  <th className="px-4 py-3 text-right">Prix</th>
                  <th className="px-4 py-3 text-right">Reconstitution</th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => changeSort('valorisation')} className="inline-flex items-center gap-1.5">Écart {sortIcon('valorisation')}</button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" onClick={() => changeSort('dette')} className="inline-flex items-center gap-1.5">Dette {sortIcon('dette')}</button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/90">
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={10} className="px-4 py-5"><div className="h-4 rounded bg-slate-800" /></td>
                    </tr>
                  ))
                ) : (
                  sortedRows.map((row) => (
                    <tr key={row.slug} className="transition hover:bg-slate-800/35">
                      <td className="px-4 py-3.5">
                        <a href={`/${row.slug}/`} className="font-semibold text-white hover:text-sky-300">{row.name}</a>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{formatPeriod(row.latestPeriod)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <TrajectorySparkline values={row.tofSeries} className="text-sky-300" />
                          <span className="min-w-[54px] text-right font-semibold text-slate-200">{formatNumber(row.tof, ' %')}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3.5 font-semibold ${deltaTone(row.tofDelta)}`}>
                        {row.tofDelta === null ? 'N.D.' : `${row.tofDelta > 0 ? '+' : ''}${formatNumber(row.tofDelta, ' pt')}`}
                      </td>
                      <td className="px-4 py-3.5">
                        <TrajectorySparkline values={row.liquiditySeries} className="text-amber-300" />
                      </td>
                      <td className={`px-4 py-3.5 font-semibold ${deltaTone(row.retraits, true)}`}>
                        {formatNumber(row.retraits, ' %')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-300">{formatNumber(row.prix, ' €')}</td>
                      <td className="px-4 py-3.5 text-right text-slate-300">{formatNumber(row.reconstitution, ' €')}</td>
                      <td className={`px-4 py-3.5 font-semibold ${deltaTone(row.valuationGap, true)}`}>
                        {row.valuationGap === null ? 'N.D.' : `${row.valuationGap > 0 ? '+' : ''}${formatNumber(row.valuationGap, ' %')}`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{formatNumber(row.dette, ' %')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-600">
          Les données sont issues des documents publics consolidés dans MaximusSCPI. Une absence de donnée est affichée N.D. Les variations ne constituent ni une prévision de performance ni une notation réglementaire.
        </p>
      </div>
    </section>
  );
};

export default TrajectorySurveillanceTable;
