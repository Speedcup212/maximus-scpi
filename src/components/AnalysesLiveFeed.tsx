import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createSlugFromName, findScpiSlug } from '../utils/scpiSlugMapper';
import {
  freshnessLabel,
  getEffectiveRiskLevel,
  getPeriodFreshness,
  humanizeAnalysisMetric,
  sanitizeAnalysisSignal,
  type AnalysisFreshness,
  type AnalysisRiskLevel,
  type ReliableAnalysisSignal,
} from '../utils/analysisReliability';

const LazyScpiQuarterlyAnalysis = React.lazy(() => import('./ScpiQuarterlyAnalysis'));

type RiskLevel = AnalysisRiskLevel;
type AnalysisStatus = 'complete' | 'insufficient_history' | 'pending';
type RiskFilter = 'all' | RiskLevel;
type SortMode = 'recent' | 'risk';
type AnalysisSignal = ReliableAnalysisSignal;

type BulletinAnalysisRow = {
  scpi_slug: string;
  current_period: string | null;
  previous_period: string | null;
  status: AnalysisStatus;
  risk_level: RiskLevel;
  trend_score: number | string | null;
  improvements: AnalysisSignal[] | null;
  deteriorations: AnalysisSignal[] | null;
  alerts: AnalysisSignal[] | null;
  watch_points: AnalysisSignal[] | null;
  generated_at: string | null;
};

type BulletinSourceRow = {
  scpi_slug: string;
  period: string | null;
  source_url: string | null;
  found_at: string | null;
  qa_status: string | null;
};

type IndicatorHistoryRow = {
  scpi_slug: string;
  source_period: string | null;
  tof: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  valeur_realisation: number | string | null;
  endettement: number | string | null;
  parts_attente_retrait: number | string | null;
};

type SignalWithTone = AnalysisSignal & {
  tone: 'alert' | 'watch' | 'negative' | 'positive';
};

type DisplayRow = {
  row: BulletinAnalysisRow;
  signals: SignalWithTone[];
  publicSignals: SignalWithTone[];
  riskLevel: RiskLevel;
  freshness: AnalysisFreshness;
};

type ScpiMetrics = {
  yield: number;
  tof: number;
  debt?: number;
  discount: number;
  discountQaStatus?: 'publishable' | 'manual_review' | 'excluded_non_scpi';
};

type MarketMovement = {
  slug: string;
  name: string;
  riskLevel: RiskLevel;
  signal: SignalWithTone;
  period: string;
  category: string;
};

const riskConfig: Record<RiskLevel, { label: string; classes: string; dot: string; order: number }> = {
  high: {
    label: 'Vigilance élevée',
    classes: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    dot: 'bg-rose-400',
    order: 0,
  },
  medium: {
    label: 'Vigilance modérée',
    classes: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    dot: 'bg-amber-400',
    order: 1,
  },
  low: {
    label: 'Vigilance faible',
    classes: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-400',
    order: 2,
  },
};

const signalToneClasses = {
  alert: 'border-rose-400/20 bg-rose-400/[0.06] text-rose-100',
  watch: 'border-amber-400/20 bg-amber-400/[0.06] text-amber-100',
  negative: 'border-orange-400/20 bg-orange-400/[0.05] text-orange-100',
  positive: 'border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-100',
};

const formatPeriod = (value?: string | null) => {
  if (!value) return 'Période non précisée';
  const normalized = value.toUpperCase().trim();
  const yearFirst = normalized.match(/(20\d{2})\s*[-_/ ]?\s*[TQ]\s*([1-4])/);
  if (yearFirst) return `T${yearFirst[2]} ${yearFirst[1]}`;
  const quarterFirst = normalized.match(/[TQ]\s*([1-4])\s*[-_/ ]?\s*(20\d{2})/);
  if (quarterFirst) return `T${quarterFirst[1]} ${quarterFirst[2]}`;
  return value;
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatPct = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1).replace('.', ',')} %`
    : 'N.D.';

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const humanizeSlug = (slug: string) =>
  slug
    .split('-')
    .map((part) => {
      const upper = new Set(['lf', 'ncap', 'perial', 'paref', 'esg', 'scpi']);
      if (upper.has(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');

const normalizePeriod = (value?: string | null) =>
  (value || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/Q/g, 'T')
    .replace(/[_/]/g, '-');

const normalizeMetric = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const periodRank = (value?: string | null) => {
  const normalized = normalizePeriod(value);
  const yearFirst = normalized.match(/(20\d{2})-?T([1-4])/);
  if (yearFirst) return Number(yearFirst[1]) * 10 + Number(yearFirst[2]);
  const quarterFirst = normalized.match(/T([1-4])-?(20\d{2})/);
  if (quarterFirst) return Number(quarterFirst[2]) * 10 + Number(quarterFirst[1]);
  const semester = normalized.match(/S([1-2])-?(20\d{2})/);
  if (semester) return Number(semester[2]) * 10 + (semester[1] === '1' ? 2 : 4);
  return 0;
};

const validExternalUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

const extractPercentages = (message?: string): number[] => {
  if (!message) return [];
  return [...message.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter(Number.isFinite);
};

const closeEnough = (a: number, b: number, tolerance = 2) =>
  Math.abs(Math.abs(a) - Math.abs(b)) <= tolerance;

const sortHistory = (rows: IndicatorHistoryRow[]) =>
  [...rows].sort((a, b) => periodRank(a.source_period) - periodRank(b.source_period));

const latestNumericRows = (
  rows: IndicatorHistoryRow[],
  selector: (row: IndicatorHistoryRow) => number | null,
  count = 2
) =>
  sortHistory(rows)
    .map((row) => ({ row, value: selector(row) }))
    .filter((item): item is { row: IndicatorHistoryRow; value: number } => item.value !== null)
    .slice(-count);

const isTechnicalQualitySignal = (signal: SignalWithTone) => {
  const key = normalizeMetric(signal.metric);
  const message = (signal.message || '').toLowerCase();
  return (
    key.startsWith('data_quality_') ||
    message.includes('comparaison historique neutralisée') ||
    (message.includes('comparabilit') && message.includes('certifi'))
  );
};

const validateExtremeSignal = <T extends SignalWithTone>(
  signal: T,
  history: IndicatorHistoryRow[]
): T => {
  if (signal.quality_issue) return signal;

  const key = normalizeMetric(signal.metric);
  const percentages = extractPercentages(signal.message);
  const largest = percentages.length
    ? percentages.reduce((current, value) =>
        Math.abs(value) > Math.abs(current) ? value : current
      )
    : null;

  let requiresValidation = false;
  let validated = false;

  if (key === 'surcote_reconstitution' && largest !== null && Math.abs(largest) >= 15) {
    requiresValidation = true;
    const latest = sortHistory(history)
      .filter(
        (row) =>
          parseNumber(row.prix_souscription) !== null &&
          parseNumber(row.prix_reconstitution) !== null
      )
      .slice(-1)[0];
    if (latest) {
      const price = parseNumber(latest.prix_souscription);
      const reconstruction = parseNumber(latest.prix_reconstitution);
      if (price !== null && reconstruction !== null && reconstruction > 0) {
        validated = closeEnough(((price / reconstruction) - 1) * 100, largest, 1.5);
      }
    }
  }

  if (
    (key === 'valeur_reconstitution' || key === 'prix_reconstitution') &&
    largest !== null &&
    Math.abs(largest) >= 15
  ) {
    requiresValidation = true;
    const points = latestNumericRows(history, (row) => parseNumber(row.prix_reconstitution), 2);
    if (points.length === 2 && points[0].value !== 0) {
      validated = closeEnough(((points[1].value / points[0].value) - 1) * 100, largest, 2);
    }
  }

  if (key === 'valeur_realisation' && largest !== null && Math.abs(largest) >= 15) {
    requiresValidation = true;
    const points = latestNumericRows(history, (row) => parseNumber(row.valeur_realisation), 2);
    if (points.length === 2 && points[0].value !== 0) {
      validated = closeEnough(((points[1].value / points[0].value) - 1) * 100, largest, 2);
    }
  }

  if ((key === 'tof' || key === 'taux_occupation_financier') && percentages.length) {
    const current = percentages[percentages.length - 1];
    if (current < 70) {
      requiresValidation = true;
      const latest = latestNumericRows(history, (row) => parseNumber(row.tof), 1)[0];
      validated = Boolean(latest && closeEnough(latest.value, current, 1));
    }
  }

  if ((key === 'endettement' || key === 'dette') && percentages.length) {
    const debt = percentages[0];
    if (Math.abs(debt) >= 50) {
      requiresValidation = true;
      const latest = latestNumericRows(history, (row) => parseNumber(row.endettement), 1)[0];
      validated = Boolean(latest && closeEnough(latest.value, debt, 2));
    }
  }

  if (!requiresValidation || validated) return signal;

  return {
    ...signal,
    severity: 'info',
    quality_issue: true,
    message: `${signal.message || 'Valeur extrême détectée.'} Valeur extrême neutralisée : l’historique disponible ne permet pas de reproduire ce signal avec un niveau de confiance suffisant.`,
  } as T;
};

const getSignals = (
  row: BulletinAnalysisRow,
  history: IndicatorHistoryRow[]
): SignalWithTone[] => {
  const buckets: SignalWithTone[] = [
    ...((Array.isArray(row.alerts) ? row.alerts : []).map((item) => ({
      ...item,
      tone: 'alert' as const,
    }))),
    ...((Array.isArray(row.watch_points) ? row.watch_points : []).map((item) => ({
      ...item,
      tone: 'watch' as const,
    }))),
    ...((Array.isArray(row.deteriorations) ? row.deteriorations : []).map((item) => ({
      ...item,
      tone: 'negative' as const,
    }))),
    ...((Array.isArray(row.improvements) ? row.improvements : []).map((item) => ({
      ...item,
      tone: 'positive' as const,
    }))),
  ]
    .map((signal) => sanitizeAnalysisSignal(signal))
    .map((signal) => validateExtremeSignal(signal, history));

  const seen = new Set<string>();
  return buckets.filter((item) => {
    const dedupeKey = `${item.metric || ''}|${item.message || ''}`;
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });
};

const getDiscountPresentation = (metrics?: ScpiMetrics) => {
  if (!metrics) return { label: 'Écart', value: 'N.D.' };
  const value = metrics.discount;
  const invalid =
    metrics.discountQaStatus === 'manual_review' ||
    metrics.discountQaStatus === 'excluded_non_scpi' ||
    !Number.isFinite(value) ||
    Math.abs(value) >= 50;

  if (invalid) return { label: 'Écart', value: 'N.D.' };
  if (value > 0.05) return { label: 'Surcote', value: formatPct(Math.abs(value)) };
  if (value < -0.05) return { label: 'Décote', value: formatPct(Math.abs(value)) };
  return { label: 'Écart', value: '0,0 %' };
};

const getMovementCategory = (signal: SignalWithTone) => {
  if (signal.tone === 'positive') return 'Amélioration';
  const key = normalizeMetric(signal.metric);
  if (key.includes('retrait') || key.includes('liquidite')) return 'Liquidité';
  if (key === 'tof' || key.includes('occupation')) return 'Occupation';
  if (
    key.includes('reconstitution') ||
    key.includes('realisation') ||
    key.includes('surcote') ||
    key.includes('decote')
  ) {
    return 'Valorisation';
  }
  if (key.includes('dette') || key.includes('endettement')) return 'Financement';
  return 'Dégradation';
};

const displayTone = (
  signal: SignalWithTone,
  riskLevel: RiskLevel
): SignalWithTone['tone'] =>
  signal.tone === 'alert' && riskLevel !== 'high' ? 'watch' : signal.tone;

const getSignalLabel = (signal: SignalWithTone, riskLevel: RiskLevel) => {
  const tone = displayTone(signal, riskLevel);
  if (tone === 'alert') return 'Point critique';
  if (tone === 'watch' && signal.tone === 'alert') return 'Vigilance forte';
  if (tone === 'watch') return 'À surveiller';
  if (tone === 'negative') return 'Dégradation';
  return 'Amélioration';
};

const freshnessOrder: Record<AnalysisFreshness, number> = {
  recent: 0,
  unknown: 1,
  old: 2,
};

const AnalysesLiveFeed: React.FC = () => {
  const [rows, setRows] = useState<BulletinAnalysisRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [metricsBySlug, setMetricsBySlug] = useState<Record<string, ScpiMetrics>>({});
  const [historyBySlug, setHistoryBySlug] = useState<Record<string, IndicatorHistoryRow[]>>({});
  const [sourceByPeriod, setSourceByPeriod] = useState<Record<string, BulletinSourceRow>>({});
  const [latestSourceBySlug, setLatestSourceBySlug] = useState<Record<string, BulletinSourceRow>>({});
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) {
        setError('Le flux de données est momentanément indisponible.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [analysisResult, sourceResult, historyResult, scpiModule] = await Promise.all([
        supabase
          .from('scpi_bulletin_analysis')
          .select('scpi_slug,current_period,previous_period,status,risk_level,trend_score,improvements,deteriorations,alerts,watch_points,generated_at')
          .order('generated_at', { ascending: false })
          .limit(150),
        supabase
          .from('scpi_bulletins')
          .select('scpi_slug,period,source_url,found_at,qa_status')
          .order('found_at', { ascending: false })
          .limit(500),
        supabase
          .from('scpi_indicator_history')
          .select('scpi_slug,source_period,tof,prix_souscription,prix_reconstitution,valeur_realisation,endettement,parts_attente_retrait')
          .limit(5000),
        import('../data/scpiData'),
      ]);

      if (cancelled) return;

      if (analysisResult.error) {
        console.warn('[AnalysesLiveFeed] Analyses indisponibles.', analysisResult.error);
        setError('Impossible de charger les analyses pour le moment.');
        setLoading(false);
        return;
      }

      if (historyResult.error) {
        console.warn('[AnalysesLiveFeed] Historique partiellement indisponible.', historyResult.error);
      }

      const deduped = new Map<string, BulletinAnalysisRow>();
      (analysisResult.data || []).forEach((item) => {
        const row = item as BulletinAnalysisRow;
        if (!deduped.has(row.scpi_slug)) deduped.set(row.scpi_slug, row);
      });

      const nameMap: Record<string, string> = {};
      const metricsMap: Record<string, ScpiMetrics> = {};
      scpiModule.scpiData.forEach((scpi) => {
        const slug = findScpiSlug(scpi.name) ?? createSlugFromName(scpi.name);
        nameMap[slug] = scpi.name;
        metricsMap[slug] = {
          yield: scpi.yield,
          tof: scpi.tof,
          debt: scpi.debt,
          discount: scpi.discount,
          discountQaStatus: scpi.discountQaStatus,
        };
      });

      const periodMap: Record<string, BulletinSourceRow> = {};
      const latestMap: Record<string, BulletinSourceRow> = {};
      (sourceResult.data || []).forEach((item) => {
        const source = item as BulletinSourceRow;
        if (!latestMap[source.scpi_slug]) latestMap[source.scpi_slug] = source;
        const sourceKey = `${source.scpi_slug}|${normalizePeriod(source.period)}`;
        if (!periodMap[sourceKey]) periodMap[sourceKey] = source;
      });

      const historyMap: Record<string, IndicatorHistoryRow[]> = {};
      (historyResult.data || []).forEach((item) => {
        const historyRow = item as IndicatorHistoryRow;
        if (!historyMap[historyRow.scpi_slug]) historyMap[historyRow.scpi_slug] = [];
        historyMap[historyRow.scpi_slug].push(historyRow);
      });
      Object.keys(historyMap).forEach((slug) => {
        historyMap[slug] = sortHistory(historyMap[slug]);
      });

      setRows(Array.from(deduped.values()));
      setNames(nameMap);
      setMetricsBySlug(metricsMap);
      setHistoryBySlug(historyMap);
      setSourceByPeriod(periodMap);
      setLatestSourceBySlug(latestMap);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(20);
    setExpandedSlug(null);
  }, [riskFilter, sortMode, searchQuery]);

  const displayRows = useMemo<DisplayRow[]>(
    () =>
      rows.map((row) => {
        const signals = getSignals(row, historyBySlug[row.scpi_slug] || []);
        const publicSignals = signals.filter((signal) => !isTechnicalQualitySignal(signal));
        return {
          row,
          signals,
          publicSignals,
          riskLevel: getEffectiveRiskLevel(row.risk_level, signals),
          freshness: getPeriodFreshness(row.current_period),
        };
      }),
    [historyBySlug, rows]
  );

  const sortedRows = useMemo(
    () =>
      [...displayRows].sort((a, b) => {
        if (sortMode === 'recent') {
          const periodDiff = periodRank(b.row.current_period) - periodRank(a.row.current_period);
          if (periodDiff !== 0) return periodDiff;
          const freshnessDiff = freshnessOrder[a.freshness] - freshnessOrder[b.freshness];
          if (freshnessDiff !== 0) return freshnessDiff;
          const generatedDiff =
            new Date(b.row.generated_at || 0).getTime() -
            new Date(a.row.generated_at || 0).getTime();
          if (generatedDiff !== 0) return generatedDiff;
          return riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
        }

        const riskDiff = riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
        if (riskDiff !== 0) return riskDiff;
        const aTrend = Number(a.row.trend_score ?? 0);
        const bTrend = Number(b.row.trend_score ?? 0);
        if (aTrend !== bTrend) return aTrend - bTrend;
        return periodRank(b.row.current_period) - periodRank(a.row.current_period);
      }),
    [displayRows, sortMode]
  );

  const filteredRows = useMemo(() => {
    const needle = normalizeSearchText(searchQuery);
    return sortedRows.filter((item) => {
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
      if (!needle) return true;
      const name = names[item.row.scpi_slug] || humanizeSlug(item.row.scpi_slug);
      return normalizeSearchText(`${name} ${item.row.scpi_slug}`).includes(needle);
    });
  }, [names, riskFilter, searchQuery, sortedRows]);

  const counts = useMemo(
    () => ({
      all: displayRows.length,
      high: displayRows.filter((item) => item.riskLevel === 'high').length,
      medium: displayRows.filter((item) => item.riskLevel === 'medium').length,
      low: displayRows.filter((item) => item.riskLevel === 'low').length,
    }),
    [displayRows]
  );

  const marketMovements = useMemo(() => {
    const movements: MarketMovement[] = [];

    displayRows
      .filter((item) => item.freshness === 'recent')
      .forEach((item) => {
        item.publicSignals
          .filter((signal) => !signal.quality_issue)
          .forEach((signal) => {
            movements.push({
              slug: item.row.scpi_slug,
              name: names[item.row.scpi_slug] || humanizeSlug(item.row.scpi_slug),
              riskLevel: item.riskLevel,
              signal,
              period: formatPeriod(item.row.current_period),
              category: getMovementCategory(signal),
            });
          });
      });

    movements.sort((a, b) => {
      if (a.signal.tone === 'positive' && b.signal.tone !== 'positive') return 1;
      if (b.signal.tone === 'positive' && a.signal.tone !== 'positive') return -1;
      return riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
    });

    const selected: MarketMovement[] = [];
    const usedSlugs = new Set<string>();
    ['Liquidité', 'Occupation', 'Valorisation', 'Amélioration'].forEach((category) => {
      const candidate = movements.find(
        (movement) => movement.category === category && !usedSlugs.has(movement.slug)
      );
      if (candidate) {
        selected.push(candidate);
        usedSlugs.add(candidate.slug);
      }
    });

    for (const movement of movements) {
      if (selected.length >= 4) break;
      if (usedSlugs.has(movement.slug)) continue;
      selected.push(movement);
      usedSlugs.add(movement.slug);
    }

    return selected.slice(0, 4);
  }, [displayRows, names]);

  const latestGeneratedAt = useMemo(() => {
    const timestamps = rows
      .map((row) => (row.generated_at ? new Date(row.generated_at).getTime() : 0))
      .filter(Boolean);
    if (!timestamps.length) return null;
    return formatDate(new Date(Math.max(...timestamps)).toISOString());
  }, [rows]);

  const visibleRows = filteredRows.slice(0, visibleCount);

  const getRowData = (item: DisplayRow) => {
    const { row, publicSignals, riskLevel, freshness } = item;
    const sourceKey = `${row.scpi_slug}|${normalizePeriod(row.current_period)}`;
    const source = sourceByPeriod[sourceKey] || latestSourceBySlug[row.scpi_slug];
    const sourceUrl = validExternalUrl(source?.source_url) ? source?.source_url : null;
    const name = names[row.scpi_slug] || humanizeSlug(row.scpi_slug);
    const metrics = metricsBySlug[row.scpi_slug];
    const discountPresentation = getDiscountPresentation(metrics);
    const primarySignal = publicSignals[0] || null;
    const metricLabel = primarySignal ? humanizeAnalysisMetric(primarySignal.metric) : null;
    const expanded = expandedSlug === row.scpi_slug;
    return {
      row,
      riskLevel,
      freshness,
      sourceUrl,
      name,
      metrics,
      discountPresentation,
      primarySignal,
      metricLabel,
      expanded,
    };
  };

  return (
    <section id="analyses-scpi" className="border-y border-slate-800 bg-slate-900/30">
      <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <RefreshCw className="h-4 w-4" />
              Flux d’analyses réel
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white">Ce qui change sur le marché des SCPI</h2>
            <p className="mt-3 leading-7 text-slate-400">
              Les bulletins collectés sont comparés, contrôlés et synthétisés. Une vigilance élevée n’est conservée que lorsqu’un signal sévère franchit un repère quantitatif et reste vérifiable.
            </p>
          </div>
          {latestGeneratedAt && (
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Clock3 className="h-4 w-4" />
              Dernière analyse : {latestGeneratedAt}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-8 space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse border-b border-slate-800 bg-slate-900/40" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/70 p-6 text-slate-400">
            {error}
          </div>
        ) : (
          <>
            {marketMovements.length > 0 && (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/55 p-4 lg:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">Radar du marché</p>
                    <h3 className="mt-1 text-lg font-bold text-white">Les mouvements à surveiller maintenant</h3>
                  </div>
                  <span className="text-xs text-slate-500">Liquidité · occupation · valorisation · améliorations</span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {marketMovements.map((movement) => {
                    const tone = displayTone(movement.signal, movement.riskLevel);
                    return (
                      <a
                        key={`${movement.slug}-${movement.category}`}
                        href={`/${movement.slug}/`}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/55 px-3.5 py-3 transition hover:border-slate-700 hover:bg-slate-900"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 truncate text-sm font-bold text-white" translate="no">
                            {movement.name}
                          </div>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone === 'positive' ? signalToneClasses.positive : riskConfig[movement.riskLevel].classes}`}>
                            {movement.category}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                          {movement.signal.message || 'Évolution détectée dans le dernier bulletin.'}
                        </p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="border-b border-blue-400/30 px-2 py-2">
                <div className="text-xl font-bold text-white">{counts.all}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">SCPI analysées</div>
              </div>
              <div className="border-b border-rose-400/30 px-2 py-2">
                <div className="text-xl font-bold text-rose-300">{counts.high}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Vigilance élevée</div>
              </div>
              <div className="border-b border-amber-400/30 px-2 py-2">
                <div className="text-xl font-bold text-amber-300">{counts.medium}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Vigilance modérée</div>
              </div>
              <div className="border-b border-emerald-400/30 px-2 py-2">
                <div className="text-xl font-bold text-emerald-300">{counts.low}</div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Vigilance faible</div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <label className="relative block w-full xl:max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher une SCPI…"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60"
                  aria-label="Rechercher une SCPI dans les analyses"
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-1" aria-label="Filtrer par niveau de vigilance">
                  {([
                    ['all', 'Toutes', counts.all],
                    ['low', 'Faible', counts.low],
                    ['medium', 'Modérée', counts.medium],
                    ['high', 'Élevée', counts.high],
                  ] as const).map(([value, label, count]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRiskFilter(value)}
                      aria-pressed={riskFilter === value}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${riskFilter === value ? value === 'low' ? 'bg-emerald-400/15 text-emerald-100' : value === 'medium' ? 'bg-amber-400/15 text-amber-100' : value === 'high' ? 'bg-rose-400/15 text-rose-100' : 'bg-sky-400/15 text-sky-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                      {label} <span className="ml-1 opacity-70">{count}</span>
                    </button>
                  ))}
                </div>

                <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/60 p-1" aria-label="Trier les analyses">
                  <button
                    type="button"
                    onClick={() => setSortMode('recent')}
                    className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${sortMode === 'recent' ? 'bg-sky-400/15 text-sky-200' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Clock3 className="h-3.5 w-3.5" /> Récentes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortMode('risk')}
                    className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${sortMode === 'risk' ? 'bg-rose-400/15 text-rose-200' : 'text-slate-400 hover:text-white'}`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" /> Plus vigilantes
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              <strong className="text-slate-300">Lecture :</strong> une vigilance signale un indicateur documenté à approfondir ; elle ne constitue pas une recommandation d’achat, de conservation ou de vente. Les contrôles de qualité restent dans l’analyse détaillée.
            </p>

            {filteredRows.length ? (
              <>
                <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-800 bg-slate-950/45 lg:block">
                  <div className="grid grid-cols-[minmax(210px,1.3fr)_92px_82px_82px_110px_130px_minmax(280px,2fr)_88px] items-center gap-3 border-b border-slate-800 bg-slate-900/65 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    <div>SCPI</div>
                    <div>Rendement</div>
                    <div>TOF</div>
                    <div>Dette</div>
                    <div>Écart prix</div>
                    <div>Vigilance</div>
                    <div>Signal principal</div>
                    <div className="text-right">Analyse</div>
                  </div>

                  {visibleRows.map((item) => {
                    const {
                      row,
                      riskLevel,
                      freshness,
                      sourceUrl,
                      name,
                      metrics,
                      discountPresentation,
                      primarySignal,
                      metricLabel,
                      expanded,
                    } = getRowData(item);
                    const risk = riskConfig[riskLevel];

                    return (
                      <React.Fragment key={row.scpi_slug}>
                        <div className="grid grid-cols-[minmax(210px,1.3fr)_92px_82px_82px_110px_130px_minmax(280px,2fr)_88px] items-center gap-3 border-b border-slate-800/80 px-4 py-3 transition hover:bg-slate-900/45">
                          <div className="min-w-0">
                            <a href={`/${row.scpi_slug}/`} className="block truncate text-sm font-bold text-white hover:text-emerald-200" translate="no">
                              {name}
                            </a>
                            <div className="mt-0.5 text-[10px] text-slate-500">
                              {formatPeriod(row.current_period)} · {freshnessLabel[freshness]}
                            </div>
                          </div>

                          <div className="text-sm font-semibold text-slate-200">{formatPct(metrics?.yield)}</div>
                          <div className="text-sm font-semibold text-slate-200">{formatPct(metrics?.tof)}</div>
                          <div className="text-sm font-semibold text-slate-200">{formatPct(metrics?.debt)}</div>
                          <div>
                            <div className="text-[10px] text-slate-500">{discountPresentation.label}</div>
                            <div className="text-sm font-semibold text-slate-200">{discountPresentation.value}</div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold ${risk.classes}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                              {riskLevel === 'high' ? 'Élevée' : riskLevel === 'medium' ? 'Modérée' : 'Faible'}
                            </span>
                          </div>

                          <div className="min-w-0 text-xs leading-5 text-slate-400">
                            {primarySignal ? (
                              <p className="line-clamp-2">
                                {metricLabel && <strong className="mr-1 text-slate-200">{metricLabel} :</strong>}
                                {primarySignal.message || 'Signal détecté sur le dernier bulletin.'}
                              </p>
                            ) : (
                              <span className="text-emerald-300/80">Aucun signal significatif</span>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Bulletin source"
                                className="text-slate-500 transition hover:text-sky-300"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setExpandedSlug(expanded ? null : row.scpi_slug)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200"
                              aria-expanded={expanded}
                            >
                              {expanded ? 'Fermer' : 'Voir'}
                              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="border-b border-slate-800 bg-slate-900/25 px-5 py-4">
                            <React.Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-slate-900" />}>
                              <LazyScpiQuarterlyAnalysis scpiKey={row.scpi_slug} inline />
                            </React.Suspense>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="mt-5 divide-y divide-slate-800 border-y border-slate-800 lg:hidden">
                  {visibleRows.map((item) => {
                    const {
                      row,
                      riskLevel,
                      sourceUrl,
                      name,
                      metrics,
                      discountPresentation,
                      primarySignal,
                      metricLabel,
                      expanded,
                    } = getRowData(item);
                    const risk = riskConfig[riskLevel];

                    return (
                      <div key={row.scpi_slug} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <a href={`/${row.scpi_slug}/`} className="block truncate text-sm font-bold text-white" translate="no">
                              {name}
                            </a>
                            <div className="mt-0.5 text-[10px] text-slate-500">{formatPeriod(row.current_period)}</div>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${risk.classes}`}>
                            {riskLevel === 'high' ? 'Élevée' : riskLevel === 'medium' ? 'Modérée' : 'Faible'}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          <span>Rend. <strong className="text-slate-200">{formatPct(metrics?.yield)}</strong></span>
                          <span>TOF <strong className="text-slate-200">{formatPct(metrics?.tof)}</strong></span>
                          <span>Dette <strong className="text-slate-200">{formatPct(metrics?.debt)}</strong></span>
                          <span>{discountPresentation.label} <strong className="text-slate-200">{discountPresentation.value}</strong></span>
                        </div>

                        <div className="mt-2 flex gap-2 text-xs leading-5 text-slate-400">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${risk.dot}`} />
                          <p>
                            {primarySignal ? (
                              <>
                                {metricLabel && <strong className="mr-1 text-slate-200">{metricLabel} :</strong>}
                                {primarySignal.message || 'Signal détecté sur le dernier bulletin.'}
                              </>
                            ) : (
                              <span className="text-emerald-300/80">Aucun signal significatif détecté.</span>
                            )}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setExpandedSlug(expanded ? null : row.scpi_slug)}
                            className="inline-flex items-center gap-1 text-white hover:text-emerald-200"
                            aria-expanded={expanded}
                          >
                            {expanded ? 'Masquer l’analyse' : 'Voir l’analyse'}
                            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          <a href={`/${row.scpi_slug}/`} className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">
                            Fiche <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                          {sourceUrl && (
                            <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200">
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {expanded && (
                          <div className="mt-4 border-t border-slate-800 pt-4">
                            <React.Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-slate-900" />}>
                              <LazyScpiQuarterlyAnalysis scpiKey={row.scpi_slug} inline />
                            </React.Suspense>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mt-6 border-y border-slate-800 py-8 text-center">
                <Search className="mx-auto h-6 w-6 text-slate-600" />
                <p className="mt-3 font-semibold text-white">Aucune SCPI ne correspond à cette recherche.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setRiskFilter('all');
                  }}
                  className="mt-3 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {visibleCount < filteredRows.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 20)}
                  className="border-b border-slate-600 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-white"
                >
                  Afficher 20 analyses supplémentaires
                </button>
              </div>
            )}

            <p className="mt-6 text-xs leading-6 text-slate-500">
              « Récent » correspond au trimestre courant ou aux deux trimestres précédents. Les contrôles de certification et de comparabilité historique restent accessibles dans chaque analyse détaillée. Les repères MaximusSCPI ne constituent ni une norme réglementaire, ni une recommandation personnalisée, ni une prévision de performance.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default AnalysesLiveFeed;
