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

type SignalWithTone = AnalysisSignal & {
  tone: 'alert' | 'watch' | 'negative' | 'positive';
};

type DisplayRow = {
  row: BulletinAnalysisRow;
  signals: SignalWithTone[];
  riskLevel: RiskLevel;
  freshness: AnalysisFreshness;
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

const validExternalUrl = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value));

const getSignals = (row: BulletinAnalysisRow): SignalWithTone[] => {
  const buckets: SignalWithTone[] = [
    ...((Array.isArray(row.alerts) ? row.alerts : []).map((item) => ({ ...item, tone: 'alert' as const }))),
    ...((Array.isArray(row.watch_points) ? row.watch_points : []).map((item) => ({ ...item, tone: 'watch' as const }))),
    ...((Array.isArray(row.deteriorations) ? row.deteriorations : []).map((item) => ({ ...item, tone: 'negative' as const }))),
    ...((Array.isArray(row.improvements) ? row.improvements : []).map((item) => ({ ...item, tone: 'positive' as const }))),
  ].map((signal) => sanitizeAnalysisSignal(signal));

  const seen = new Set<string>();
  return buckets.filter((item) => {
    const key = `${item.metric || ''}|${item.message || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const freshnessOrder: Record<AnalysisFreshness, number> = {
  recent: 0,
  unknown: 1,
  old: 2,
};

const AnalysesLiveFeed: React.FC = () => {
  const [rows, setRows] = useState<BulletinAnalysisRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [sourceByPeriod, setSourceByPeriod] = useState<Record<string, BulletinSourceRow>>({});
  const [latestSourceBySlug, setLatestSourceBySlug] = useState<Record<string, BulletinSourceRow>>({});
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
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

      const [analysisResult, sourceResult, scpiModule] = await Promise.all([
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
        import('../data/scpiData'),
      ]);

      if (cancelled) return;

      if (analysisResult.error) {
        console.warn('[AnalysesLiveFeed] Analyses indisponibles.', analysisResult.error);
        setError('Impossible de charger les analyses pour le moment.');
        setLoading(false);
        return;
      }

      const deduped = new Map<string, BulletinAnalysisRow>();
      (analysisResult.data || []).forEach((item) => {
        const row = item as BulletinAnalysisRow;
        if (!deduped.has(row.scpi_slug)) deduped.set(row.scpi_slug, row);
      });

      const nameMap: Record<string, string> = {};
      scpiModule.scpiData.forEach((scpi) => {
        const slug = findScpiSlug(scpi.name) ?? createSlugFromName(scpi.name);
        nameMap[slug] = scpi.name;
      });

      const periodMap: Record<string, BulletinSourceRow> = {};
      const latestMap: Record<string, BulletinSourceRow> = {};
      (sourceResult.data || []).forEach((item) => {
        const source = item as BulletinSourceRow;
        if (!latestMap[source.scpi_slug]) latestMap[source.scpi_slug] = source;
        const key = `${source.scpi_slug}|${normalizePeriod(source.period)}`;
        if (!periodMap[key]) periodMap[key] = source;
      });

      setRows(Array.from(deduped.values()));
      setNames(nameMap);
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
  }, [riskFilter]);

  const displayRows = useMemo<DisplayRow[]>(
    () =>
      rows.map((row) => {
        const signals = getSignals(row);
        return {
          row,
          signals,
          riskLevel: getEffectiveRiskLevel(row.risk_level, signals),
          freshness: getPeriodFreshness(row.current_period),
        };
      }),
    [rows]
  );

  const sortedRows = useMemo(() => {
    return [...displayRows].sort((a, b) => {
      const riskDiff = riskConfig[a.riskLevel].order - riskConfig[b.riskLevel].order;
      if (riskDiff !== 0) return riskDiff;

      const freshnessDiff = freshnessOrder[a.freshness] - freshnessOrder[b.freshness];
      if (freshnessDiff !== 0) return freshnessDiff;

      const aTrend = Number(a.row.trend_score ?? 0);
      const bTrend = Number(b.row.trend_score ?? 0);
      if (aTrend !== bTrend) return aTrend - bTrend;

      return new Date(b.row.generated_at || 0).getTime() - new Date(a.row.generated_at || 0).getTime();
    });
  }, [displayRows]);

  const filteredRows = useMemo(
    () => sortedRows.filter((item) => riskFilter === 'all' || item.riskLevel === riskFilter),
    [riskFilter, sortedRows]
  );

  const counts = useMemo(
    () => ({
      all: displayRows.length,
      high: displayRows.filter((item) => item.riskLevel === 'high').length,
      medium: displayRows.filter((item) => item.riskLevel === 'medium').length,
      low: displayRows.filter((item) => item.riskLevel === 'low').length,
    }),
    [displayRows]
  );

  const latestGeneratedAt = useMemo(() => {
    const timestamps = rows
      .map((row) => (row.generated_at ? new Date(row.generated_at).getTime() : 0))
      .filter(Boolean);
    if (!timestamps.length) return null;
    return formatDate(new Date(Math.max(...timestamps)).toISOString());
  }, [rows]);

  return (
    <section id="analyses-scpi" className="border-y border-slate-800 bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <RefreshCw className="h-4 w-4" />
              Flux d’analyses réel
            </div>
            <h2 className="mt-2 text-3xl font-bold text-white">Ce que disent les derniers bulletins SCPI</h2>
            <p className="mt-3 leading-7 text-slate-400">
              Cette sélection est alimentée automatiquement par les bulletins collectés et analysés par MaximusSCPI.
              Une vigilance élevée n’est affichée que lorsqu’un signal sévère est explicitement documenté ; les valeurs douteuses sont neutralisées et signalées à vérifier.
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
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-400">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => setRiskFilter('all')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  riskFilter === 'all'
                    ? 'border-blue-400/40 bg-blue-400/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl font-bold">{counts.all}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">SCPI analysées</div>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('high')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  riskFilter === 'high'
                    ? 'border-rose-400/40 bg-rose-400/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-rose-400/20'
                }`}
              >
                <div className="text-2xl font-bold text-rose-300">{counts.high}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance élevée</div>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('medium')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  riskFilter === 'medium'
                    ? 'border-amber-400/40 bg-amber-400/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-amber-400/20'
                }`}
              >
                <div className="text-2xl font-bold text-amber-300">{counts.medium}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance modérée</div>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('low')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  riskFilter === 'low'
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-emerald-400/20'
                }`}
              >
                <div className="text-2xl font-bold text-emerald-300">{counts.low}</div>
                <div className="mt-1 text-xs uppercase tracking-wide">Vigilance faible</div>
              </button>
            </div>

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

                return (
                  <article
                    key={row.scpi_slug}
                    className="flex min-h-[22rem] flex-col rounded-2xl border border-slate-800 bg-slate-950/75 p-5 transition hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-white" translate="no">{name}</h3>
                        <div className="mt-1 text-xs text-slate-500">
                          {hasHistory
                            ? `${formatPeriod(row.previous_period)} → ${formatPeriod(row.current_period)}`
                            : `${formatPeriod(row.current_period)} · historique partiel`}
                        </div>
                        <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${freshnessClasses[freshness]}`}>
                          {freshnessLabel[freshness]}
                        </span>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${risk.classes}`}>
                        {risk.label}
                      </span>
                    </div>

                    {riskWasDowngraded && (
                      <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/[0.05] px-3.5 py-3 text-xs leading-5 text-sky-100">
                        Niveau élevé neutralisé : aucun signal sévère documenté ne permet de justifier publiquement ce niveau de vigilance.
                      </div>
                    )}

                    <div className="mt-5 space-y-2.5">
                      {signals.slice(0, 3).map((signal, index) => {
                        const metricLabel = humanizeAnalysisMetric(signal.metric);
                        return (
                          <div
                            key={`${signal.metric || 'signal'}-${index}`}
                            className={`rounded-xl border px-3.5 py-3 text-sm leading-6 ${signalToneClasses[signal.tone]}`}
                          >
                            <div className="flex gap-2.5">
                              {signal.quality_issue ? (
                                <FileSearch className="mt-1 h-4 w-4 shrink-0 text-sky-300" />
                              ) : signal.tone === 'alert' ? (
                                <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-rose-300" />
                              ) : signal.tone === 'negative' ? (
                                <TrendingDown className="mt-1 h-4 w-4 shrink-0 text-orange-300" />
                              ) : signal.tone === 'positive' ? (
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                              ) : (
                                <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                              )}
                              <span>
                                {metricLabel && (
                                  <strong className="mr-1 text-white">{metricLabel} :</strong>
                                )}
                                {signal.quality_issue && (
                                  <strong className="mr-1 text-sky-200">À vérifier —</strong>
                                )}
                                {signal.message || 'Signal détecté sur le dernier bulletin.'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

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
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-sky-200"
                          >
                            Bulletin source
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedSlug(expanded ? null : row.scpi_slug)}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-200"
                        aria-expanded={expanded}
                      >
                        {expanded ? 'Masquer le détail' : 'Voir le détail des vigilances'}
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {expanded && (
                        <React.Suspense
                          fallback={
                            <div className="mt-4 h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
                          }
                        >
                          <LazyScpiQuarterlyAnalysis scpiKey={row.scpi_slug} inline />
                        </React.Suspense>
                      )}

                      <a
                        href={`/${row.scpi_slug}/`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                      >
                        Voir la fiche complète de la SCPI
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            {visibleCount < filteredRows.length && (
              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 12)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-800"
                >
                  Afficher 12 analyses supplémentaires
                </button>
              </div>
            )}

            <p className="mt-7 text-xs leading-6 text-slate-500">
              « Récent » correspond au trimestre courant ou aux deux trimestres précédents. Une donnée plus ancienne est signalée « Ancien ».
              Les niveaux de vigilance synthétisent des indicateurs publiés dans les bulletins et servent à identifier les points à approfondir ; ils ne constituent ni une recommandation personnalisée, ni une prévision de performance.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default AnalysesLiveFeed;
