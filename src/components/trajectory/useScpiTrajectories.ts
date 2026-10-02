import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  HISTORY_SELECT,
  ScpiHistoryRow,
  getNumericSeries,
  normalizeAndDedupeHistory,
} from './trajectoryData';

export type ScpiTrajectorySnapshot = {
  tofSeries: number[];
  liquiditySeries: number[];
  latestTof: number | null;
  latestLiquidity: number | null;
  tofDelta: number | null;
};

export const useScpiTrajectories = () => {
  const [rows, setRows] = useState<ScpiHistoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('scpi_indicator_history')
        .select(HISTORY_SELECT)
        .limit(5000);

      if (cancelled) return;
      if (error) {
        console.warn('[useScpiTrajectories] Historique indisponible.', error);
        return;
      }

      setRows((data || []) as unknown as ScpiHistoryRow[]);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const grouped = new Map<string, ScpiHistoryRow[]>();

    rows.forEach((row) => {
      const list = grouped.get(row.scpi_slug) || [];
      list.push(row);
      grouped.set(row.scpi_slug, list);
    });

    const mapped: Record<string, ScpiTrajectorySnapshot> = {};

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
};
