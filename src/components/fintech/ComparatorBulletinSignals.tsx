import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createSlugFromName } from '../../utils/scpiSlugMapper';

type RiskLevel = 'low' | 'medium' | 'high';
type AnalysisStatus = 'complete' | 'insufficient_history' | 'pending';

type Signal = {
  metric?: string;
  severity?: 'high' | 'medium' | 'info';
  message?: string;
  [key: string]: unknown;
};

type BulletinAnalysis = {
  scpi_slug: string;
  current_period: string | null;
  previous_period: string | null;
  status: AnalysisStatus;
  risk_level: RiskLevel;
  improvements: Signal[] | null;
  deteriorations: Signal[] | null;
  alerts: Signal[] | null;
  watch_points: Signal[] | null;
};

type Host = {
  id: string;
  element: HTMLElement;
  slug: string;
  compact: boolean;
};

const riskStyle: Record<RiskLevel, { label: string; classes: string }> = {
  low: {
    label: 'Vigilance faible',
    classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  medium: {
    label: 'Vigilance modérée',
    classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  high: {
    label: 'Vigilance élevée',
    classes: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
};

const metricLabel = (metric?: string, direction?: 'up' | 'down') => {
  switch (metric) {
    case 'liquidite_retraits':
    case 'parts_attente_retrait':
      return direction === 'down' ? 'Retraits ↓' : direction === 'up' ? 'Retraits ↑' : 'Liquidité à surveiller';
    case 'tof':
      return direction === 'up' ? 'TOF ↑' : direction === 'down' ? 'TOF ↓' : 'TOF faible';
    case 'prix_reconstitution':
      return direction === 'up' ? 'Valeur reconst. ↑' : 'Valeur reconst. ↓';
    case 'valeur_realisation':
      return direction === 'up' ? 'Valeur réalisation ↑' : 'Valeur réalisation ↓';
    case 'endettement':
      return direction === 'down' ? 'Dette ↓' : direction === 'up' ? 'Dette ↑' : 'Endettement élevé';
    case 'walb':
      return direction === 'up' ? 'WALB ↑' : direction === 'down' ? 'WALB ↓' : 'WALB à surveiller';
    case 'capital_type':
      return 'Liquidité à réévaluer';
    case 'croissance_occupation':
      return 'Collecte / occupation';
    default:
      return null;
  }
};

const getSignalChips = (analysis: BulletinAnalysis) => {
  const result: Array<{ label: string; tone: 'bad' | 'good' | 'watch' }> = [];
  const seen = new Set<string>();

  const add = (label: string | null, tone: 'bad' | 'good' | 'watch') => {
    if (!label || seen.has(label)) return;
    seen.add(label);
    result.push({ label, tone });
  };

  for (const signal of analysis.alerts || []) {
    add(metricLabel(signal.metric), signal.severity === 'high' ? 'bad' : 'watch');
  }
  for (const signal of analysis.deteriorations || []) {
    add(metricLabel(signal.metric, 'down'), 'bad');
  }
  for (const signal of analysis.improvements || []) {
    add(metricLabel(signal.metric, 'up'), 'good');
  }
  for (const signal of analysis.watch_points || []) {
    if (signal.metric !== 'history') add(metricLabel(signal.metric), 'watch');
  }

  if (analysis.status === 'insufficient_history') {
    add('Historique T-1 incomplet', 'watch');
  }

  return result.slice(0, 2);
};

const Badge: React.FC<{ analysis: BulletinAnalysis; compact: boolean }> = ({ analysis, compact }) => {
  const risk = riskStyle[analysis.risk_level] || riskStyle.low;
  const chips = getSignalChips(analysis);
  const title = analysis.status === 'complete' && analysis.previous_period
    ? `Lecture du bulletin ${analysis.previous_period} → ${analysis.current_period || 'courant'}. Ce niveau de vigilance n'est pas une notation de risque réglementaire.`
    : `Lecture du dernier bulletin disponible. Historique trimestriel précédent incomplet. Ce niveau de vigilance n'est pas une notation de risque réglementaire.`;

  return (
    <div
      data-bulletin-risk-portal="true"
      className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${compact ? 'max-w-[170px]' : ''}`}
      title={title}
    >
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold leading-4 ${risk.classes}`}>
        {analysis.risk_level === 'high' ? <AlertTriangle className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {compact ? risk.label.replace('Vigilance ', '') : risk.label}
      </span>
      {chips.slice(0, compact ? 1 : 2).map((chip) => (
        <span
          key={chip.label}
          className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-4 ${
            chip.tone === 'bad'
              ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
              : chip.tone === 'good'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                : 'border-sky-500/25 bg-sky-500/10 text-sky-300'
          }`}
        >
          {chip.tone === 'bad' ? <ArrowDownRight className="h-2.5 w-2.5" /> : chip.tone === 'good' ? <ArrowUpRight className="h-2.5 w-2.5" /> : null}
          {chip.label}
        </span>
      ))}
    </div>
  );
};

const ComparatorBulletinSignals: React.FC = () => {
  const [analyses, setAnalyses] = useState<Record<string, BulletinAnalysis>>({});
  const [hosts, setHosts] = useState<Host[]>([]);
  const idSequence = useRef(0);
  const signatureRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('scpi_bulletin_analysis')
        .select('scpi_slug,current_period,previous_period,status,risk_level,improvements,deteriorations,alerts,watch_points');

      if (cancelled) return;
      if (error) {
        console.warn('[ComparatorBulletinSignals] Analyse bulletins indisponible.', error);
        return;
      }

      const mapped: Record<string, BulletinAnalysis> = {};
      for (const row of (data || []) as BulletinAnalysis[]) {
        mapped[row.scpi_slug] = row;
      }
      setAnalyses(mapped);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const knownSlugs = useMemo(() => new Set(Object.keys(analyses)), [analyses]);

  useEffect(() => {
    const root = document.getElementById('comparator-container');
    if (!root || knownSlugs.size === 0) return;

    const scan = () => {
      const next: Host[] = [];
      const candidates = root.querySelectorAll<HTMLElement>(
        'h3.text-base.font-bold.text-white, div.font-bold.text-white.text-sm.truncate'
      );

      candidates.forEach((node) => {
        const rawName = node.textContent?.trim() || '';
        const slug = createSlugFromName(rawName);
        if (!knownSlugs.has(slug)) return;

        const host = node.parentElement as HTMLElement | null;
        if (!host) return;

        let id = host.dataset.bulletinRiskHostId;
        if (!id) {
          idSequence.current += 1;
          id = `bulletin-host-${idSequence.current}`;
          host.dataset.bulletinRiskHostId = id;
        }

        next.push({
          id,
          element: host,
          slug,
          compact: !Boolean(host.closest('#scpi-grid')),
        });
      });

      const signature = next.map((item) => `${item.id}:${item.slug}:${item.compact ? 1 : 0}`).join('|');
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
        const analysis = analyses[host.slug];
        if (!analysis) return null;
        return createPortal(
          <Badge analysis={analysis} compact={host.compact} />,
          host.element,
          host.id
        );
      })}
    </>
  );
};

export default ComparatorBulletinSignals;
