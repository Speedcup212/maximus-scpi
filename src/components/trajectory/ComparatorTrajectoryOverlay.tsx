import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import TrajectorySparkline from './TrajectorySparkline';
import {
  HISTORY_SELECT,
  ScpiHistoryRow,
  getNumericSeries,
  normalizeAndDedupeHistory,
} from './trajectoryData';

type Host = {
  id: string;
  element: HTMLElement;
  slug: string;
  compact: boolean;
};

type TrajectorySnapshot = {
  tofSeries: number[];
  liquiditySeries: number[];
  latestTof: number | null;
  latestLiquidity: number | null;
  tofDelta: number | null;
};

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const CompactTrajectory: React.FC<{
  data: TrajectorySnapshot;
  compact: boolean;
}> = ({ data, compact }) => {
  const delta = data.tofDelta;

  return (
    <div
      data-maximus-trajectory-portal="true"
      className={compact ? 'mt-1.5 max-w-[190px]' : 'mt-2 max-w-[270px]'}
      title="Historique observé dans les bulletins et documents officiels consolidés par MaximusSCPI."
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
        <span className="w-12 shrink-0">TOF</span>
        <TrajectorySparkline
          values={data.tofSeries}
          width={compact ? 64 : 82}
          height={20}
          className="text-sky-300"
          strokeWidth={1.8}
        />
        <span className="min-w-[42px] text-right text-slate-300">
          {formatNumber(data.latestTof, '%')}
        </span>
        {!compact && (
          <span
            className={
              delta === null || Math.abs(delta) < 0.01
                ? 'min-w-[48px] text-right text-slate-500'
                : delta > 0
                  ? 'min-w-[48px] text-right text-emerald-300'
                  : 'min-w-[48px] text-right text-rose-300'
            }
          >
            {delta === null ? 'N.D.' : `${delta > 0 ? '+' : ''}${formatNumber(delta, ' pt')}`}
          </span>
        )}
      </div>

      {!compact && data.liquiditySeries.length > 0 && (
        <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
          <span className="w-12 shrink-0">Retraits</span>
          <TrajectorySparkline
            values={data.liquiditySeries}
            width={82}
            height={20}
            className="text-amber-300"
            strokeWidth={1.8}
          />
          <span className="min-w-[42px] text-right text-slate-300">
            {formatNumber(data.latestLiquidity, '%')}
          </span>
        </div>
      )}
    </div>
  );
};

const ComparatorTrajectoryOverlay: React.FC = () => {
  const [rows, setRows] = useState<ScpiHistoryRow[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const idSequence = useRef(0);
  const signatureRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('scpi_indicator_history')
        .select(HISTORY_SELECT)
        .order('snapshot_at', { ascending: true })
        .limit(5000);

      if (cancelled) return;
      if (error) {
        console.warn('[ComparatorTrajectoryOverlay] Historique indisponible.', error);
        return;
      }

      setRows((data || []) as unknown as ScpiHistoryRow[]);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const trajectories = useMemo(() => {
    const grouped = new Map<string, ScpiHistoryRow[]>();
    rows.forEach((row) => {
      const list = grouped.get(row.scpi_slug) || [];
      list.push(row);
      grouped.set(row.scpi_slug, list);
    });

    const mapped: Record<string, TrajectorySnapshot> = {};
    grouped.forEach((slugRows, slug) => {
      const history = normalizeAndDedupeHistory(slugRows).slice(-8);
      const tofSeries = getNumericSeries(history, 'tof');
      const liquiditySeries = getNumericSeries(history, 'retrait_attente_pct');
      const latest = history[history.length - 1] || null;
      const tofDelta =
        tofSeries.length >= 2
          ? tofSeries[tofSeries.length - 1] - tofSeries[Math.max(0, tofSeries.length - 5)]
          : null;

      if (tofSeries.length >= 2 || liquiditySeries.length >= 2) {
        mapped[slug] = {
          tofSeries,
          liquiditySeries,
          latestTof: latest?.tof ?? (tofSeries[tofSeries.length - 1] ?? null),
          latestLiquidity:
            latest?.retrait_attente_pct ??
            (liquiditySeries[liquiditySeries.length - 1] ?? null),
          tofDelta,
        };
      }
    });

    return mapped;
  }, [rows]);

  const knownSlugs = useMemo(() => new Set(Object.keys(trajectories)), [trajectories]);

  useEffect(() => {
    const root = document.getElementById('comparator-container');
    if (!root || knownSlugs.size === 0) return;

    const scan = () => {
      const next: Host[] = [];
      const candidates = root.querySelectorAll<HTMLElement>(
        'h3.text-base.font-bold.text-white, div.font-bold.text-white.text-sm.truncate',
      );

      candidates.forEach((node) => {
        const rawName = node.textContent?.trim() || '';
        const slug = createSlugFromName(rawName);
        if (!knownSlugs.has(slug)) return;

        const host = node.parentElement as HTMLElement | null;
        if (!host) return;

        let id = host.dataset.maximusTrajectoryHostId;
        if (!id) {
          idSequence.current += 1;
          id = `trajectory-host-${idSequence.current}`;
          host.dataset.maximusTrajectoryHostId = id;
        }

        next.push({
          id,
          element: host,
          slug,
          compact: !Boolean(host.closest('#scpi-grid')),
        });
      });

      const signature = next
        .map((item) => `${item.id}:${item.slug}:${item.compact ? 1 : 0}`)
        .join('|');
      if (signature !== signatureRef.current) {
        signatureRef.current = signature;
        setHosts(next);
      }
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [knownSlugs]);

  return (
    <>
      {hosts.map((host) => {
        const trajectory = trajectories[host.slug];
        if (!trajectory) return null;
        return createPortal(
          <CompactTrajectory data={trajectory} compact={host.compact} />,
          host.element,
          host.id,
        );
      })}
    </>
  );
};

export default ComparatorTrajectoryOverlay;
