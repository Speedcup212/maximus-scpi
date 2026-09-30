import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  FileSearch,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingDown,
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

type TrajectoryPoint = {
  period: string;
  value: number;
};

type Trajectory = {
  label: string;
  points: TrajectoryPoint[];
  deltaLabel: string;
};

type MarketMovement = {
  slug: string;
  name: string;
  riskLevel: RiskLevel;
  signal: SignalWithTone;
  period: string;
  category: string;
};

const riskConfig: Record<RiskLevel, { label: string; classes: string; order: number }> = {
  high: {
    label: 'Vigilance élevée',
    classes: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    order: 0,
  },
  medium: {
    label: 'Vigilance modérée',
    classes: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    order: 1,
  },
  low: {
    label: 'Vigilance faible',
    classes: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    order: 2,
  },
};

const freshnessClasses: Record<AnalysisFreshness, string> = {
  recent: 'border-sky-400/25 bg-sky-400/[0.08] text-sky-200',
  old: 'border-slate-600 bg-slate-800/70 text-slate-300',
  unknown: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-200',
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

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);

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

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const validExternalUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value));

const extractPercentages = (message?: string): number[] => {
  if (!message) return [];
  return [...message.matchAll(/(-?\d+(?:[.,]\d+)?)\s*%/g)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter(Number.isFinite);
};

const closeEnough = (a: number, b: number, tolerance = 2) => Math.abs(Math.abs(a) - Math.abs(b)) <= tolerance;

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

const validateExtremeSignal = <T extends SignalWithTone>(signal: T, history: IndicatorHistoryRow[]): T => {
  if (signal.quality_issue) return signal;

  const key = normalizeMetric(signal.metric);
  const percentages = extractPercentages(signal.message);
  const largest = percentages.length
    ? percentages.reduce((current, value) => Math.abs(value) > Math.abs(current) ? value : current)
    : null;

  let requiresValidation = false;
  let validated = false;

  if (key === 'surcote_reconstitution' && largest !== null && Math.abs(largest) >= 15) {
    requiresValidation = true;
    const latest = sortHistory(history)
      .filter((row) => parseNumber(row.prix_souscription) !== null && parseNumber(row.prix_reconstitution) !== null)
      .slice(-1)[0];
    if (latest) {
      const price = parseNumber(latest.prix_souscription);
      const reconstruction = parseNumber(latest.prix_reconstitution);
      if (price !== null && reconstruction !== null && reconstruction > 0) {
        const computed = ((price / reconstruction) - 1) * 100;
        validated = closeEnough(computed, largest, 1.5);
      }
    }
  }

  if ((key === 'valeur_reconstitution' || key === 'prix_reconstitution') && largest !== null && Math.abs(largest) >= 15) {
    requiresValidation = true;
    const points = latestNumericRows(history, (row) => parseNumber(row.prix_reconstitution), 2);
    if (points.length === 2 && points[0].value !== 0) {
      const computed = ((points[1].value / points[0].value) - 1) * 100;
      validated = closeEnough(computed, largest, 2);
    }
  }

  if (key === 'valeur_realisation' && largest !== null && Math.abs(largest) >= 15) {
    requiresValidation = true;
    const points = latestNumericRows(history, (row) => parseNumber(row.valeur_realisation), 2);
    if (points.length === 2 && points[0].value !== 0) {
      const computed = ((points[1].value / points[0].value) - 1) * 100;
      validated = closeEnough(computed, largest, 2);
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

const getSignals = (row: BulletinAnalysisRow, history: IndicatorHistoryRow[]): SignalWithTone[] => {
  const buckets: SignalWithTone[] = [
    ...((Array.isArray(row.alerts) ? row.alerts : []).map((item) => ({ ...item, tone: 'alert' as const }))),
    ...((Array.isArray(row.watch_points) ? row.watch_points : []).map((item) => ({ ...item, tone: 'watch' as const }))),
    ...((Array.isArray(row.deteriorations) ? row.deteriorations : []).map((item) => ({ ...item, tone: 'negative' as const }))),
    ...((Array.isArray(row.improvements) ? row.improvements : []).map((item) => ({ ...item, tone: 'positive' as const }))),
  ]
    .map((signal) => sanitizeAnalysisSignal(signal))
    .map((signal) => validateExtremeSignal(signal, history));

  const seen = new Set<string>();
  return buckets.filter((item) => {
    const key = `${item.metric || ''}|${item.message || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getThresholdText = (signal: SignalWithTone) => {
  const key = normalizeMetric(signal.metric);
  if (key === 'tof' || key === 'taux_occupation_financier') {
    return 'Repère MaximusSCPI : < 80 % = critique ; 80–85 % = vigilance forte ; 85–90 % = vigilance modérée.';
  }
  if (key === 'liquidite_retraits' || key === 'parts_attente_retrait' || key === 'parts_en_attente_de_retrait') {
    return 'Repère MaximusSCPI : ≥ 5 % de parts en attente = vigilance élevée ; 2–5 % = vigilance modérée.';
  }
  if (key === 'surcote_reconstitution') {
    return 'Repère MaximusSCPI : ≥ 15 % = vigilance élevée ; 5–15 % = vigilance modérée.';
  }
  if (key === 'endettement' || key === 'dette') {
    return 'Repère MaximusSCPI : ≥ 40 % = vigilance élevée ; 30–40 % = vigilance modérée.';
  }
  return null;
};

const getDiscountPresentation = (metrics?: ScpiMetrics) => {
  if (!metrics) return { label: 'Décote / surcote', value: 'N.D.' };
  const value = metrics.discount;
  const invalid =
    metrics.discountQaStatus === 'manual_review' ||
    metrics.discountQaStatus === 'excluded_non_scpi' ||
    !Number.isFinite(value) ||
    Math.abs(value) >= 50;

  if (invalid) return { label: 'Décote / surcote', value: 'N.D.' };
  if (value > 0.05) return { label: 'Surcote', value: formatPct(Math.abs(value)) };
  if (value < -0.05) return { label: 'Décote', value: formatPct(Math.abs(value)) };
  return { label: 'Écart', value: '0,0 %' };
};

const buildTrajectory = (history: IndicatorHistoryRow[]): Trajectory | null => {
  const tofPoints = latestNumericRows(history, (row) => parseNumber(row.tof), 4)
    .map(({ row, value }) => ({ period: formatPeriod(row.source_period), value }));

  if (tofPoints.length >= 2) {
    const delta = tofPoints[tofPoints.length - 1].value - tofPoints[0].value;
    return {
      label: 'Trajectoire TOF',
      points: tofPoints,
      deltaLabel: `${delta >= 0 ? '+' : ''}${formatCompactNumber(delta)} pt${Math.abs(delta) === 1 ? '' : 's'} sur la série affichée`,
    };
  }

  const reconstructionPoints = latestNumericRows(history, (row) => parseNumber(row.prix_reconstitution), 4)
    .map(({ row, value }) => ({ period: formatPeriod(row.source_period), value }));

  if (reconstructionPoints.length >= 2 && reconstructionPoints[0].value !== 0) {
    const delta = ((reconstructionPoints[reconstructionPoints.length - 1].value / reconstructionPoints[0].value) - 1) * 100;
    return {
      label: 'Valeur de reconstitution',
      points: reconstructionPoints,
      deltaLabel: `${delta >= 0 ? '+' : ''}${formatCompactNumber(delta)} % sur la série affichée`,
    };
  }

  return null;
};

const getMovementCategory = (signal: SignalWithTone) => {
  if (signal.tone === 'positive') return 'Amélioration';
  const key = normalizeMetric(signal.metric);
  if (key.includes('retrait') || key.includes('liquidite')) return 'Liquidité';
  if (key === 'tof' || key.includes('occupation')) return 'Occupation';
  if (key.includes('reconstitution') || key.includes('realisation') || key.includes('surcote') || key.includes('decote')) return 'Valorisation';
  if (key.includes('dette') || key.includes('endettement')) return 'Financement';
  return 'Dégradation';
};

const displayTone = (signal: SignalWithTone, riskLevel: RiskLevel): SignalWithTone['tone'] =>
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
  const [visibleCount, setVisibleCount] = useState(12);
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
        const key = `${source.scpi_slug}|${normalizePeriod(source.period)}`;
        if (!periodMap[key]) periodMap[key] = source;
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
    setVisibleCount(12);
    setExpandedSlug(null);
  }, [riskFilter, sortMode, searchQuery]);

  const displayRows = useMemo<DisplayRow[]>(
    () => rows.map((row) => {
      const signals = getSignals(row, historyBySlug[row.scpi_slug] || []);
      return {
        row,
        signals,
        riskLevel: getEffectiveRiskLevel(row.risk_level, signals),
        freshness: getPeriodFreshness(row.current_period),
      };
    }),
    [historyBySlug, rows]
  );

  const sortedRows = useMemo(() => {
    return [...displayRows].sort((a, b) => {
      if (sortMode === 'recent') {
        const periodDiff = periodRank(b.row.current_period) - periodRank(a.row.current_period);
        if (periodDiff !== 0) return periodDiff;
        const freshnessDiff = freshnessOrder[a.freshness] - freshnessOrder[b.freshness];
        if (freshnessDiff !== 0) return freshnessDiff;
        const generatedDiff =
          new Date(b.row.generated_at || 0).getTime() - new Date(a.row.generated_at || 0).getTime();
        if (generatedDiff !== 0) return generatedDiff;
        return riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
      }

      const riskDiff = riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
      if (riskDiff !== 0) return riskDiff;
      const aTrend = Number(a.row.trend_score ?? 0);
      const bTrend = Number(b.row.trend_score ?? 0);
      if (aTrend !== bTrend) return aTrend - bTrend;
      const periodDiff = periodRank(b.row.current_period) - periodRank(a.row.current_period);
      if (periodDiff !== 0) return periodDiff;
      return new Date(b.row.generated_at || 0).getTime() - new Date(a.row.generated_at || 0).getTime();
    });
  }, [displayRows, sortMode]);

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
        item.signals
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
    const preferredCategories = ['Liquidité', 'Occupation', 'Valorisation', 'Amélioration'];

    preferredCategories.forEach((category) => {
      const candidate = movements.find((movement) => movement.category === category && !usedSlugs.has(movement.slug));
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

  return (
    <section id="analyses-scpi" className="border-y border-slate-800 bg-slate-900/30">
      <div className="mx-auto max-w-[1500px] px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <RefreshCw className="h-4 w-4" />
              Flux d’analyses réel
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white">Ce qui change sur le marché des SCPI</h2>
            <p className="mt-3 leading-7 text-slate-400">
              Les bulletins collectés sont comparés, contrôlés et synthétisés. Une vigilance élevée n’est conservée que lorsqu’un signal sévère franchit un repère quantitatif et reste vérifiable ; les valeurs extrêmes non reproductibles sont neutralisées.
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
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-400">{error}</div>
        ) : (
          <>
            {marketMovements.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/65 p-5 lg:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">Radar du marché</p>
                    <h3 className="mt-1 text-xl font-bold text-white">Les mouvements à surveiller maintenant</h3>
                  </div>
                  <span className="text-xs text-slate-500">Liquidité · occupation · valorisation · améliorations</span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {marketMovements.map((movement) => {
                    const tone = displayTone(movement.signal, movement.riskLevel);
                    return (
                      <a
                        key={`${movement.slug}-${movement.category}`}
                        href={`/${movement.slug}/`}
                        className="rounded-xl border border-slate-800 bg-slate-900/75 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-white" translate="no">{movement.name}</div>
                            <div className="mt-1 text-xs text-slate-500">{movement.period}</div>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone === 'positive' ? signalToneClasses.positive : riskConfig[movement.riskLevel].classes}`}>
                            {movement.category}
                          </span>
                        </div>
                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          {getSignalLabel(movement.signal, movement.riskLevel)}
                        </div>
                        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-300">
                          {movement.signal.message || 'Évolution détectée dans le dernier bulletin.'}
                        </p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button type="button" onClick={() => setRiskFilter('all')} className={`rounded-xl border px-4 py-3 text-left transition ${riskFilter === 'all' ? 'border-blue-400/40 bg-blue-400/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'}`}>
                <div className="text-2xl font-bold">{counts.all}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">SCPI analysées</div>
              </button>
              <button type="button" onClick={() => setRiskFilter('high')} className={`rounded-xl border px-4 py-3 text-left transition ${riskFilter === 'high' ? 'border-rose-400/40 bg-rose-400/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-rose-400/20'}`}>
                <div className="text-2xl font-bold text-rose-300">{counts.high}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance élevée</div>
              </button>
              <button type="button" onClick={() => setRiskFilter('medium')} className={`rounded-xl border px-4 py-3 text-left transition ${riskFilter === 'medium' ? 'border-amber-400/40 bg-amber-400/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-amber-400/20'}`}>
                <div className="text-2xl font-bold text-amber-300">{counts.medium}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance modérée</div>
              </button>
              <button type="button" onClick={() => setRiskFilter('low')} className={`rounded-xl border px-4 py-3 text-left transition ${riskFilter === 'low' ? 'border-emerald-400/40 bg-emerald-400/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-emerald-400/20'}`}>
                <div className="text-2xl font-bold text-emerald-300">{counts.low}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance faible</div>
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher une SCPI…"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60"
                  aria-label="Rechercher une SCPI dans les analyses"
                />
              </label>

              <div className="inline-flex w-full rounded-xl border border-slate-700 bg-slate-950/80 p-1 lg:w-auto" aria-label="Trier les analyses">
                <button type="button" onClick={() => setSortMode('recent')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition lg:flex-none ${sortMode === 'recent' ? 'bg-sky-400/15 text-sky-200' : 'text-slate-400 hover:text-white'}`}>
                  <Clock3 className="h-4 w-4" /> Récentes
                </button>
                <button type="button" onClick={() => setSortMode('risk')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition lg:flex-none ${sortMode === 'risk' ? 'bg-rose-400/15 text-rose-200' : 'text-slate-400 hover:text-white'}`}>
                  <ShieldAlert className="h-4 w-4" /> Plus vigilantes
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-sm leading-6 text-slate-300">
              <strong className="text-amber-200">Comment lire une vigilance :</strong> elle ne constitue ni une recommandation d’acheter, de conserver ou de vendre une SCPI. Elle signale un indicateur documenté qui mérite d’être approfondi. Les valeurs non fiables sont affichées « N.D. » ou « À vérifier » et ne servent pas à déclencher une vigilance élevée.
            </div>

            {filteredRows.length ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredRows.slice(0, visibleCount).map(({ row, signals, riskLevel, freshness }) => {
                  const risk = riskConfig[riskLevel];
                  const sourceKey = `${row.scpi_slug}|${normalizePeriod(row.current_period)}`;
                  const source = sourceByPeriod[sourceKey] || latestSourceBySlug[row.scpi_slug];
                  const sourceUrl = validExternalUrl(source?.source_url) ? source?.source_url : null;
                  const generatedAt = formatDate(row.generated_at);
                  const name = names[row.scpi_slug] || humanizeSlug(row.scpi_slug);
                  const hasHistory = row.status === 'complete' && Boolean(row.previous_period);
                  const riskWasDowngraded = row.risk_level === 'high' && riskLevel !== 'high';
                  const expanded = expandedSlug === row.scpi_slug;
                  const metrics = metricsBySlug[row.scpi_slug];
                  const discountPresentation = getDiscountPresentation(metrics);
                  const trajectory = buildTrajectory(historyBySlug[row.scpi_slug] || []);
                  const dataStatusLabel = row.status === 'pending' ? 'Analyse en cours' : hasHistory ? 'Données comparables' : 'Historique partiel';
                  const dataStatusClasses = row.status === 'pending'
                    ? 'border-sky-400/25 bg-sky-400/[0.08] text-sky-200'
                    : hasHistory
                      ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-200'
                      : 'border-amber-400/25 bg-amber-400/[0.08] text-amber-200';
                  const visibleSignals = signals.slice(0, 2);
                  const hiddenSignalCount = Math.max(0, signals.length - visibleSignals.length);

                  return (
                    <article key={row.scpi_slug} className="flex min-h-[21rem] flex-col rounded-2xl border border-slate-800 bg-slate-950/75 p-5 transition hover:border-slate-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-white" translate="no">{name}</h3>
                          <div className="mt-1 text-xs text-slate-500">{hasHistory ? `${formatPeriod(row.previous_period)} → ${formatPeriod(row.current_period)}` : formatPeriod(row.current_period)}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${freshnessClasses[freshness]}`}>{freshnessLabel[freshness]}</span>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${dataStatusClasses}`}>{dataStatusLabel}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${risk.classes}`}>{risk.label}</span>
                      </div>

                      {metrics && (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
                          {[
                            ['TD', formatPct(metrics.yield)],
                            ['TOF', formatPct(metrics.tof)],
                            ['Dette', formatPct(metrics.debt)],
                            [discountPresentation.label, discountPresentation.value],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2">
                              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                              <div className="mt-1 text-xs font-bold text-slate-100">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {trajectory && (
                        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/45 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{trajectory.label}</div>
                            <div className="text-[10px] font-semibold text-sky-300">{trajectory.deltaLabel}</div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                            {trajectory.points.map((point) => (
                              <div key={`${point.period}-${point.value}`} className="rounded-md bg-slate-950/70 px-2 py-1.5 text-center">
                                <div className="text-[9px] text-slate-500">{point.period}</div>
                                <div className="mt-0.5 text-[11px] font-bold text-slate-200">
                                  {trajectory.label === 'Trajectoire TOF' ? `${formatCompactNumber(point.value)} %` : formatCompactNumber(point.value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {riskWasDowngraded && (
                        <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/[0.05] px-3.5 py-3 text-xs leading-5 text-sky-100">
                          Niveau élevé recalibré : le signal ne franchit pas le repère quantitatif requis ou une valeur extrême n’est pas suffisamment reproductible dans l’historique disponible.
                        </div>
                      )}

                      <div className="mt-5 space-y-2.5">
                        {visibleSignals.map((signal, index) => {
                          const metricLabel = humanizeAnalysisMetric(signal.metric);
                          const thresholdText = getThresholdText(signal);
                          const tone = displayTone(signal, riskLevel);
                          return (
                            <div key={`${signal.metric || 'signal'}-${index}`} className={`rounded-xl border px-3.5 py-3 text-sm leading-6 ${signalToneClasses[tone]}`}>
                              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">{getSignalLabel(signal, riskLevel)}</div>
                              <div className="flex gap-2.5">
                                {signal.quality_issue ? <FileSearch className="mt-1 h-4 w-4 shrink-0 text-sky-300" /> : tone === 'alert' ? <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-rose-300" /> : tone === 'negative' ? <TrendingDown className="mt-1 h-4 w-4 shrink-0 text-orange-300" /> : tone === 'positive' ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" /> : <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-300" />}
                                <span>
                                  {metricLabel && <strong className="mr-1 text-white">{metricLabel} :</strong>}
                                  {signal.quality_issue && <strong className="mr-1 text-sky-200">À vérifier —</strong>}
                                  {signal.message || 'Signal détecté sur le dernier bulletin.'}
                                </span>
                              </div>
                              {thresholdText && !signal.quality_issue && <div className="mt-2 border-t border-white/10 pt-2 text-[11px] leading-5 opacity-75">{thresholdText}</div>}
                            </div>
                          );
                        })}

                        {hiddenSignalCount > 0 && (
                          <button type="button" onClick={() => setExpandedSlug(expanded ? null : row.scpi_slug)} className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white">
                            + {hiddenSignalCount} autre{hiddenSignalCount > 1 ? 's' : ''} point{hiddenSignalCount > 1 ? 's' : ''} à analyser
                          </button>
                        )}

                        {!signals.length && (
                          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-3.5 py-3 text-sm leading-6 text-slate-400">
                            Aucun signal quantitatif significatif détecté avec les données actuellement disponibles.
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-5">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                          {generatedAt && <span>Analyse générée le {generatedAt}</span>}
                          {sourceUrl && (
                            <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-sky-200">
                              Bulletin source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                          <button type="button" onClick={() => setExpandedSlug(expanded ? null : row.scpi_slug)} className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-200" aria-expanded={expanded}>
                            {expanded ? 'Masquer le détail' : 'Voir l’analyse détaillée'}
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <a href={`/${row.scpi_slug}/`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
                            Fiche complète <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>

                        {expanded && (
                          <React.Suspense fallback={<div className="mt-4 h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />}>
                            <LazyScpiQuarterlyAnalysis scpiKey={row.scpi_slug} inline />
                          </React.Suspense>
                        )}

                        {riskLevel !== 'low' && (
                          <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3.5">
                            <div className="text-xs font-semibold text-white">Vous détenez cette SCPI ?</div>
                            <p className="mt-1 text-xs leading-5 text-slate-400">Mesurez son poids dans votre allocation avant d’envisager un arbitrage.</p>
                            <a
                              href={`/?source=analyses&scpi=${encodeURIComponent(row.scpi_slug)}#quiz-section`}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200"
                            >
                              Analyser mon portefeuille <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 text-center">
                <Search className="mx-auto h-6 w-6 text-slate-600" />
                <p className="mt-3 font-semibold text-white">Aucune SCPI ne correspond à cette recherche.</p>
                <button type="button" onClick={() => { setSearchQuery(''); setRiskFilter('all'); }} className="mt-3 text-sm font-semibold text-emerald-300 hover:text-emerald-200">Réinitialiser les filtres</button>
              </div>
            )}

            {visibleCount < filteredRows.length && (
              <div className="mt-7 text-center">
                <button type="button" onClick={() => setVisibleCount((count) => count + 12)} className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-800">
                  Afficher 12 analyses supplémentaires
                </button>
              </div>
            )}

            <p className="mt-7 text-xs leading-6 text-slate-500">
              « Récent » correspond au trimestre courant ou aux deux trimestres précédents. Une donnée plus ancienne est signalée « Ancien ». Les repères MaximusSCPI servent à homogénéiser la lecture des signaux ; les valeurs extrêmes sont rapprochées de l’historique disponible avant de pouvoir soutenir une vigilance élevée. Ces repères ne constituent ni une norme réglementaire, ni une recommandation personnalisée, ni une prévision de performance.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default AnalysesLiveFeed;
