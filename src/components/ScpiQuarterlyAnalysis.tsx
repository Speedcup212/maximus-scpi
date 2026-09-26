import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  MinusCircle,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type RiskLevel = 'low' | 'medium' | 'high';
type AnalysisStatus = 'complete' | 'insufficient_history' | 'pending';

type AnalysisSignal = {
  metric?: string;
  severity?: 'high' | 'medium' | 'info';
  message?: string;
  [key: string]: unknown;
};

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

const SignalList: React.FC<{
  title: string;
  items: AnalysisSignal[];
  icon: React.ReactNode;
  tone: 'positive' | 'negative' | 'alert' | 'watch';
}> = ({ title, items, icon, tone }) => {
  if (!items.length) return null;

  const toneClasses = {
    positive: 'border-emerald-400/20 bg-emerald-400/[0.06]',
    negative: 'border-orange-400/20 bg-orange-400/[0.06]',
    alert: 'border-rose-400/20 bg-rose-400/[0.06]',
    watch: 'border-sky-400/20 bg-sky-400/[0.05]',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        {icon}
        {title}
      </div>
      <ul className="space-y-2.5 text-sm leading-relaxed text-slate-300">
        {items.slice(0, 4).map((item, index) => (
          <li key={`${item.metric || 'signal'}-${index}`} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
            <span>{item.message || 'Signal détecté sur le dernier bulletin.'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ScpiQuarterlyAnalysis: React.FC<ScpiQuarterlyAnalysisProps> = ({ scpiKey }) => {
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
  }, [slug]);

  if (!analysis || !portalTarget) return null;

  const improvements = Array.isArray(analysis.improvements) ? analysis.improvements : [];
  const deteriorations = Array.isArray(analysis.deteriorations) ? analysis.deteriorations : [];
  const alerts = Array.isArray(analysis.alerts) ? analysis.alerts : [];
  const watchPoints = Array.isArray(analysis.watch_points) ? analysis.watch_points : [];
  const risk = riskConfig[analysis.risk_level] || riskConfig.low;
  const currentPeriod = formatPeriod(analysis.current_period);
  const previousPeriod = formatPeriod(analysis.previous_period);
  const hasHistory = analysis.status === 'complete' && Boolean(previousPeriod);

  return createPortal(
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

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SignalList
          title="Ce qui s'améliore"
          items={improvements}
          tone="positive"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
        />
        <SignalList
          title="Ce qui se dégrade"
          items={deteriorations}
          tone="negative"
          icon={<TrendingDown className="h-4 w-4 text-orange-300" />}
        />
        <SignalList
          title="Alertes"
          items={alerts}
          tone="alert"
          icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
        />
        <SignalList
          title="À surveiller"
          items={watchPoints}
          tone="watch"
          icon={<Eye className="h-4 w-4 text-sky-300" />}
        />
      </div>

      {!improvements.length && !deteriorations.length && !alerts.length && !watchPoints.length && (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
          Aucun signal quantitatif significatif n'est détecté avec les données actuellement disponibles.
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Lecture automatisée des indicateurs publiés et fiabilisés par MaximusSCPI. Les seuils servent à faire ressortir
        des évolutions ou tensions à analyser ; ils ne constituent ni une recommandation d'investissement ni une
        prévision de performance.
      </p>
    </div>,
    portalTarget
  );
};

export default ScpiQuarterlyAnalysis;
