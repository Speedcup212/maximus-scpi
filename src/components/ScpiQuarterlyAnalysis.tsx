import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSearch,
  Info,
  MinusCircle,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { classifyTofOccupation } from '../utils/surveillanceSignals';
import {
  freshnessLabel,
  getEffectiveRiskLevel,
  getPeriodFreshness,
  humanizeAnalysisMetric,
  sanitizeAnalysisSignal,
  type AnalysisRiskLevel,
  type ReliableAnalysisSignal,
} from '../utils/analysisReliability';

type RiskLevel = AnalysisRiskLevel;
type AnalysisStatus = 'complete' | 'insufficient_history' | 'pending';
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

interface ScpiQuarterlyAnalysisProps {
  scpiKey: string;
  inline?: boolean;
}

const formatPeriod = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toUpperCase().trim();
  const yearFirst = normalized.match(/(20\d{2})\s*[-_/ ]?\s*[TQ]\s*([1-4])/);
  if (yearFirst) return `T${yearFirst[2]} ${yearFirst[1]}`;
  const quarterFirst = normalized.match(/[TQ]\s*([1-4])\s*[-_/ ]?\s*(20\d{2})/);
  if (quarterFirst) return `T${quarterFirst[1]} ${quarterFirst[2]}`;
  const numberFirst = normalized.match(/([1-4])\s*T\s*[-_/ ]?\s*(20\d{2})/);
  if (numberFirst) return `T${numberFirst[1]} ${numberFirst[2]}`;
  return value;
};

const riskConfig: Record<RiskLevel, { label: string; badge: string; panel: string }> = {
  low: {
    label: 'Vigilance faible',
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    panel: 'border-emerald-400/20 bg-emerald-400/[0.05]',
  },
  medium: {
    label: 'Vigilance modérée',
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    panel: 'border-amber-400/20 bg-amber-400/[0.05]',
  },
  high: {
    label: 'Vigilance élevée',
    badge: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    panel: 'border-rose-400/20 bg-rose-400/[0.05]',
  },
};

const freshnessClasses = {
  recent: 'border-sky-400/25 bg-sky-400/[0.08] text-sky-200',
  old: 'border-slate-600 bg-slate-800/70 text-slate-300',
  unknown: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-200',
};

const SignalList: React.FC<{
  title: string;
  items: AnalysisSignal[];
  icon: React.ReactNode;
  tone: 'positive' | 'negative' | 'alert' | 'watch' | 'info';
}> = ({ title, items, icon, tone }) => {
  if (!items.length) return null;

  const toneClasses = {
    positive: 'border-emerald-400/20 bg-emerald-400/[0.06]',
    negative: 'border-orange-400/20 bg-orange-400/[0.06]',
    alert: 'border-rose-400/20 bg-rose-400/[0.06]',
    watch: 'border-sky-400/20 bg-sky-400/[0.05]',
    info: 'border-sky-400/20 bg-sky-400/[0.05]',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        {icon}
        {title}
      </div>
      <ul className="space-y-2.5 text-sm leading-relaxed text-slate-300">
        {items.slice(0, 4).map((item, index) => {
          const metricLabel = humanizeAnalysisMetric(item.metric);
          return (
            <li key={`${item.metric || 'signal'}-${index}`} className="flex gap-2.5">
              {item.quality_issue ? (
                <FileSearch className="mt-1 h-4 w-4 shrink-0 text-sky-300" />
              ) : (
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
              )}
              <span>
                {metricLabel && <strong className="mr-1 text-white">{metricLabel} :</strong>}
                {item.quality_issue && <strong className="mr-1 text-sky-200">À vérifier —</strong>}
                {item.message || 'Signal détecté sur le dernier bulletin.'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ScpiQuarterlyAnalysis: React.FC<ScpiQuarterlyAnalysisProps> = ({ scpiKey, inline = false }) => {
  const [analysis, setAnalysis] = useState<BulletinAnalysisRow | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  const slug = useMemo(
    () => scpiKey.replace(/^\/+|\/+$/g, '').replace(/^scpi-/, ''),
    [scpiKey]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase || !slug) return;

      const { data, error } = await supabase
        .from('scpi_bulletin_analysis')
        .select('scpi_slug,current_period,previous_period,status,risk_level,trend_score,improvements,deteriorations,alerts,watch_points,generated_at')
        .eq('scpi_slug', slug)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.warn('[ScpiQuarterlyAnalysis] Analyse indisponible.', error);
        return;
      }
      if (data) setAnalysis(data as BulletinAnalysisRow);
    };

    setAnalysis(null);
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (inline) {
      setPortalTarget(null);
      return;
    }

    const findTarget = () => {
      const target = document.querySelector(
        'section.bg-slate-950.py-12.text-white > div > div.max-w-4xl'
      );
      if (target) {
        setPortalTarget(target);
        return true;
      }
      return false;
    };

    if (findTarget()) return;

    const observer = new MutationObserver(() => {
      if (findTarget()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [inline, slug]);

  if (!analysis || (!inline && !portalTarget)) return null;

  const improvements = (Array.isArray(analysis.improvements) ? analysis.improvements : []).map(sanitizeAnalysisSignal);
  const deteriorations = (Array.isArray(analysis.deteriorations) ? analysis.deteriorations : []).map(sanitizeAnalysisSignal);
  const alerts = (Array.isArray(analysis.alerts) ? analysis.alerts : []).map(sanitizeAnalysisSignal);
  const watchPoints = (Array.isArray(analysis.watch_points) ? analysis.watch_points : []).map(sanitizeAnalysisSignal);
  // Séparer la variation du niveau : un bulletin complet avec TOF >= 90 %
  // peut constater un recul sans justifier une alerte d'occupation.
  const isInformativeTof = (signal: AnalysisSignal) => {
    if (analysis.status !== 'complete' || signal.quality_issue) return false;
    const metric = (signal.metric || '').toLowerCase();
    if (metric !== 'tof' && metric !== 'taux_occupation_financier') return false;
    const tier = classifyTofOccupation(signal.current);
    return tier === 'eleve' || tier === 'satisfaisant';
  };
  const informationSignals = [...alerts, ...watchPoints, ...deteriorations]
    .filter(isInformativeTof)
    .map(signal => ({
      ...signal,
      severity: 'info' as const,
      message: (signal.message || 'Évolution du TOF constatée.') +
        ' Le taux d’occupation reste satisfaisant : information de suivi, sans alerte d’occupation fondée sur ce recul isolé.',
    }));
  const actualAlerts = alerts.filter(signal => !isInformativeTof(signal));
  const actualWatchPoints = watchPoints.filter(signal => !isInformativeTof(signal));
  const actualDeteriorations = deteriorations.filter(signal => !isInformativeTof(signal));
  const allSignals = [...actualAlerts, ...actualWatchPoints, ...actualDeteriorations, ...informationSignals, ...improvements];
  const effectiveRiskLevel = getEffectiveRiskLevel(analysis.risk_level, allSignals);
  const risk = riskConfig[effectiveRiskLevel] || riskConfig.low;
  const currentPeriod = formatPeriod(analysis.current_period);
  const previousPeriod = formatPeriod(analysis.previous_period);
  const hasHistory = analysis.status === 'complete' && Boolean(previousPeriod);
  const freshness = getPeriodFreshness(analysis.current_period);
  const riskWasDowngraded = analysis.risk_level === 'high' && effectiveRiskLevel !== 'high';

  const content = (
    <div className={`mt-6 rounded-3xl border p-5 sm:p-6 ${risk.panel}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <RefreshCw className="h-5 w-5 text-emerald-300" />
              Évolution du dernier bulletin
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${risk.badge}`}>
              {risk.label}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${freshnessClasses[freshness]}`}>
              {freshnessLabel[freshness]}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {hasHistory
              ? `${previousPeriod} → ${currentPeriod}`
              : `${currentPeriod || 'Dernier bulletin'} · historique précédent insuffisant pour une comparaison trimestrielle complète`}
          </div>
        </div>

        {analysis.status === 'insufficient_history' && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
            <MinusCircle className="h-4 w-4" />
            Analyse absolue uniquement
          </div>
        )}
      </div>

      {riskWasDowngraded && (
        <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-400/[0.05] px-4 py-3 text-sm leading-6 text-sky-100">
          Le niveau « vigilance élevée » a été neutralisé : aucun signal sévère documenté ne justifie ce niveau dans les données actuellement disponibles.
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SignalList
          title="Ce qui s'améliore"
          items={improvements}
          tone="positive"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
        />
        <SignalList
          title="Ce qui se dégrade"
          items={actualDeteriorations}
          tone="negative"
          icon={<TrendingDown className="h-4 w-4 text-orange-300" />}
        />
        <SignalList
          title="Vigilances prioritaires"
          items={actualAlerts}
          tone="alert"
          icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
        />
        <SignalList
          title="À surveiller"
          items={actualWatchPoints}
          tone="watch"
          icon={<Eye className="h-4 w-4 text-sky-300" />}
        />
        <SignalList
          title="Informations de suivi — occupation satisfaisante"
          items={informationSignals}
          tone="info"
          icon={<Info className="h-4 w-4 text-sky-300" />}
        />
      </div>

      {!improvements.length && !actualDeteriorations.length && !actualAlerts.length && !actualWatchPoints.length && !informationSignals.length && (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
          Aucun signal quantitatif significatif n'est détecté avec les données actuellement disponibles.
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Lecture automatisée des indicateurs publiés et fiabilisés par MaximusSCPI. « Récent » correspond au trimestre courant ou aux deux trimestres précédents. Les seuils servent à faire ressortir des évolutions ou tensions à analyser ; ils ne constituent ni une recommandation d'investissement ni une prévision de performance.
      </p>
    </div>
  );

  if (inline) return content;
  return createPortal(content, portalTarget as Element);
};

export default ScpiQuarterlyAnalysis;
