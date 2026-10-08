import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import TrajectorySparkline from './TrajectorySparkline';
import {
  type CertifiedLiquiditySnapshot,
  type LiquiditySignalGate,
  resolveCertifiedLiquidity,
} from '../../utils/certifiedLiquidity';
import {
  HISTORY_SELECT,
  ScpiHistoryRow,
  getNumericSeries,
  latestDelta,
  normalizeAndDedupeHistory,
} from './trajectoryData';

type TrajectorySnapshot = {
  tofSeries: number[];
  liquiditySeries: number[];
  latestTof: number | null;
  latestLiquidity: number | null;
  liquidityLabel: string;
  tofDelta: number | null;
};
type LiquidityRow = CertifiedLiquiditySnapshot & { scpi_slug: string };
type LiquidityGateRow = LiquiditySignalGate & { scpi_slug: string };

type VisibleScpi = {
  slug: string;
  name: string;
};

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const deltaClass = (value: number | null, inverse = false) => {
  if (value === null || Math.abs(value) < 0.01) return 'text-slate-500';
  const favorable = inverse ? value < 0 : value > 0;
  return favorable ? 'text-emerald-300' : 'text-rose-300';
};

const ComparatorTrajectoryTable: React.FC<{
  items: VisibleScpi[];
  trajectories: Record<string, TrajectorySnapshot>;
}> = ({ items, trajectories }) => {
  const rows = items
    .map((item) => ({ ...item, trajectory: trajectories[item.slug] }))
    .filter((item) => Boolean(item.trajectory));

  if (rows.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-sky-500/25 bg-slate-950/70 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-2 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">
            Trajectoires Maximus
          </div>
          <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
            Évolution des SCPI affichées
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            TOF vérifié et évolution à trimestre comparable. La liquidité est affichée selon son régime et sa certification.
          </p>
        </div>
        <div className="text-[11px] text-slate-500">
          {rows.length} SCPI avec historique exploitable
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-[10px] uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3 sm:px-5">SCPI</th>
              <th className="px-4 py-3">TOF — trajectoire</th>
              <th className="px-4 py-3 text-right">Actuel</th>
              <th className="px-4 py-3 text-right">Δ sur 1 an</th>
              <th className="px-4 py-3">Liquidité — trajectoire</th>
              <th className="px-4 py-3 text-right sm:pr-5">Actuel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/90">
            {rows.map(({ slug, name, trajectory }) => (
              <tr key={slug} className="transition hover:bg-slate-800/35">
                <td className="px-4 py-3.5 sm:px-5">
                  <a
                    href={`/${slug}/#trajectoire-scpi`}
                    className="font-semibold text-white hover:text-sky-300"
                  >
                    {name}
                  </a>
                </td>
                <td className="px-4 py-3.5">
                  <TrajectorySparkline
                    values={trajectory.tofSeries}
                    width={118}
                    height={28}
                    className="text-sky-300"
                    strokeWidth={2}
                  />
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-slate-200">
                  {formatNumber(trajectory.latestTof, ' %')}
                </td>
                <td className={`px-4 py-3.5 text-right font-semibold ${deltaClass(trajectory.tofDelta)}`}>
                  {trajectory.tofDelta === null
                    ? 'N.D.'
                    : `${trajectory.tofDelta > 0 ? '+' : ''}${formatNumber(trajectory.tofDelta, ' pt')}`}
                </td>
                <td className="px-4 py-3.5">
                  {trajectory.liquiditySeries.length >= 2 ? (
                    <TrajectorySparkline
                      values={trajectory.liquiditySeries}
                      width={118}
                      height={28}
                      className="text-amber-300"
                      strokeWidth={2}
                    />
                  ) : (
                    <span className="text-xs text-slate-600">Historique insuffisant</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-slate-200 sm:pr-5">
                  {formatNumber(trajectory.latestLiquidity, ' %', 3)}
                  <div className="mt-1 text-[10px] text-slate-500">{trajectory.liquidityLabel}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-800 px-4 py-3 text-[10px] leading-4 text-slate-600 sm:px-5">
        Les courbes décrivent les observations publiées ; elles ne constituent ni une prévision de performance ni un score de recommandation.
      </div>
    </section>
  );
};

const ComparatorTrajectoryOverlay: React.FC = () => {
  const [rows, setRows] = useState<ScpiHistoryRow[]>([]);
  const [liquidityRows, setLiquidityRows] = useState<LiquidityRow[]>([]);
  const [liquidityGates, setLiquidityGates] = useState<LiquidityGateRow[]>([]);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [visibleScpis, setVisibleScpis] = useState<VisibleScpi[]>([]);
  const signatureRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) return;

      const [historyResult, liquidityResult, gateResult] = await Promise.all([
        supabase.from('scpi_trajectory_pilot_history').select(HISTORY_SELECT).limit(5000),
        supabase.from('scpi_trajectory_pilot_liquidity')
          .select('scpi_slug,source_period,parts_attente_retrait,nombre_parts,retrait_attente_pct,prev_pct,liquidity_basis,liquidity_pressure_pct,prev_pressure_pct,liquidity_sell_orders,liquidity_buy_orders,regime_changed,signal_certification')
          .limit(100),
        supabase.from('scpi_trajectory_signal_gate')
          .select('scpi_slug,data_gate,structural_gate,semantic_gate,liquidity_gate,liquidity_signal_eligible')
          .limit(100),
      ]);

      if (cancelled) return;
      if (historyResult.error) {
        console.warn('[ComparatorTrajectoryOverlay] Historique certifié indisponible.', historyResult.error);
        return;
      }
      setRows((historyResult.data || []) as unknown as ScpiHistoryRow[]);
      if (liquidityResult.error || gateResult.error) {
        console.warn('[ComparatorTrajectoryOverlay] Certification de liquidité indisponible : indicateurs masqués.');
        setLiquidityRows([]);
        setLiquidityGates([]);
      } else {
        setLiquidityRows((liquidityResult.data || []) as LiquidityRow[]);
        setLiquidityGates((gateResult.data || []) as LiquidityGateRow[]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const trajectories = useMemo(() => {
    const liquidityMap = new Map(liquidityRows.map(row => [row.scpi_slug, row]));
    const gateMap = new Map(liquidityGates.map(row => [row.scpi_slug, row]));
    const grouped = new Map<string, ScpiHistoryRow[]>();

    rows.forEach((row) => {
      const list = grouped.get(row.scpi_slug) || [];
      list.push(row);
      grouped.set(row.scpi_slug, list);
    });

    const mapped: Record<string, TrajectorySnapshot> = {};

    grouped.forEach((slugRows, slug) => {
      const history = normalizeAndDedupeHistory(slugRows);
      const recentHistory = history.slice(-8);
      const tofSeries = getNumericSeries(recentHistory, 'tof');
      const latest = history[history.length - 1] || null;
      const certifiedLiquidity = resolveCertifiedLiquidity(
        liquidityMap.get(slug) || null,
        gateMap.get(slug) || null,
      );
      const latestLiquidity = certifiedLiquidity.publishableLevel &&
        certifiedLiquidity.certification !== 'stale_last_known'
        ? certifiedLiquidity.currentPct
        : null;
      const liquiditySeries = certifiedLiquidity.comparableTrend &&
        certifiedLiquidity.previousPct !== null && certifiedLiquidity.currentPct !== null
        ? [certifiedLiquidity.previousPct, certifiedLiquidity.currentPct]
        : [];
      const liquidityLabel = certifiedLiquidity.basis === 'withdrawal_queue'
        ? 'File de retraits'
        : certifiedLiquidity.basis === 'secondary_market_order_book'
          ? 'Pression du marché secondaire'
          : 'Donnée non comparable';
      const tofDelta = latestDelta(history, 'tof', 4);

      if (tofSeries.length >= 2 || latest?.tof !== null || latestLiquidity !== null) {
        mapped[slug] = {
          tofSeries,
          liquiditySeries,
          latestTof: latest?.tof ?? null,
          latestLiquidity,
          liquidityLabel,
          tofDelta,
        };
      }
    });

    return mapped;
  }, [rows, liquidityRows, liquidityGates]);

  const knownSlugs = useMemo(() => new Set(Object.keys(trajectories)), [trajectories]);

  useEffect(() => {
    const root = document.getElementById('comparator-container');
    if (!root || knownSlugs.size === 0) return;

    const scan = () => {
      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>(
          'h3.text-base.font-bold.text-white, div.font-bold.text-white.text-sm.truncate',
        ),
      );

      const next: VisibleScpi[] = [];
      const seen = new Set<string>();

      candidates.forEach((node) => {
        const name = node.textContent?.trim() || '';
        const slug = createSlugFromName(name);
        if (!name || seen.has(slug) || !knownSlugs.has(slug)) return;
        seen.add(slug);
        next.push({ slug, name });
      });

      const signature = next.map((item) => item.slug).join('|');
      if (signature !== signatureRef.current) {
        signatureRef.current = signature;
        setVisibleScpis(next);
      }

      let trajectoryHost = root.querySelector<HTMLElement>('[data-maximus-comparator-trajectory-host="true"]');
      const grid = root.querySelector<HTMLElement>('#scpi-grid');
      const firstListName = root.querySelector<HTMLElement>('div.font-bold.text-white.text-sm.truncate');
      const firstListRow = firstListName?.parentElement?.parentElement as HTMLElement | null;
      const listWrapper = firstListRow?.parentElement?.parentElement as HTMLElement | null;
      const anchor = grid || listWrapper;

      if (!anchor || !anchor.parentElement) return;

      if (!trajectoryHost) {
        trajectoryHost = document.createElement('div');
        trajectoryHost.dataset.maximusComparatorTrajectoryHost = 'true';
      }

      if (trajectoryHost.parentElement !== anchor.parentElement || trajectoryHost.nextElementSibling !== anchor) {
        anchor.parentElement.insertBefore(trajectoryHost, anchor);
      }

      setHost((current) => (current === trajectoryHost ? current : trajectoryHost));
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [knownSlugs]);

  if (!host || visibleScpis.length === 0) return null;

  return createPortal(
    <ComparatorTrajectoryTable items={visibleScpis} trajectories={trajectories} />,
    host,
  );
};

export default ComparatorTrajectoryOverlay;
