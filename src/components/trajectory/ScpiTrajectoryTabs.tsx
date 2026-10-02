import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Gauge,
  LineChart as LineChartIcon,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ScpiTrajectoryPanel from './ScpiTrajectoryPanel';
import {
  HISTORY_SELECT,
  NormalizedHistoryRow,
  ScpiHistoryRow,
  formatPeriod,
  formatSigned,
  latestDelta,
  normalizeAndDedupeHistory,
  valuationGapPct,
} from './trajectoryData';

type TabKey = 'trajectory' | 'market';
type Tone = 'positive' | 'neutral' | 'watch' | 'unavailable';

type Signal = {
  title: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: React.ReactNode;
};

const toneClasses: Record<Tone, string> = {
  positive: 'border-emerald-500/25 bg-emerald-500/5',
  neutral: 'border-sky-500/20 bg-sky-500/5',
  watch: 'border-amber-500/30 bg-amber-500/5',
  unavailable: 'border-slate-700 bg-slate-900/40',
};

const toneLabel: Record<Tone, string> = {
  positive: 'Solide',
  neutral: 'Neutre',
  watch: 'À surveiller',
  unavailable: 'Donnée insuffisante',
};

const toneLabelClasses: Record<Tone, string> = {
  positive: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  neutral: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  watch: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  unavailable: 'text-slate-400 border-slate-700 bg-slate-800/60',
};

const latestNumeric = (
  rows: NormalizedHistoryRow[],
  key: keyof NormalizedHistoryRow,
): number | null => {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const raw = rows[i][key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  }
  return null;
};

const latestRowWith = (
  rows: NormalizedHistoryRow[],
  predicate: (row: NormalizedHistoryRow) => boolean,
) => {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (predicate(rows[i])) return rows[i];
  }
  return null;
};

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const MarketSignalsPanel: React.FC<{ scpiSlug: string }> = ({ scpiSlug }) => {
  const [rows, setRows] = useState<ScpiHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase || !scpiSlug) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('scpi_indicator_history')
        .select(HISTORY_SELECT)
        .eq('scpi_slug', scpiSlug)
        .order('snapshot_at', { ascending: true })
        .limit(80);

      if (cancelled) return;
      if (error) {
        console.warn('[MarketSignalsPanel] Historique indisponible.', error);
        setLoading(false);
        return;
      }

      setRows((data || []) as unknown as ScpiHistoryRow[]);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [scpiSlug]);

  const history = useMemo(() => normalizeAndDedupeHistory(rows), [rows]);

  const signals = useMemo<Signal[]>(() => {
    const liquidity = latestNumeric(history, 'retrait_attente_pct');
    const liquidityDelta = latestDelta(history, 'retrait_attente_pct', 4);
    const tof = latestNumeric(history, 'tof');
    const tofDelta = latestDelta(history, 'tof', 4);
    const debt = latestNumeric(history, 'endettement');

    const valuationRow = latestRowWith(
      history,
      (row) => row.prix_souscription !== null && row.prix_reconstitution !== null,
    );
    const valuationGap = valuationRow
      ? valuationGapPct(valuationRow.prix_souscription, valuationRow.prix_reconstitution)
      : null;

    const caps = history
      .map((row) => row.capitalisation)
      .filter((value): value is number => value !== null && Number.isFinite(value));
    const currentCap = caps.length ? caps[caps.length - 1] : null;
    const previousCap = caps.length >= 2 ? caps[Math.max(0, caps.length - 5)] : null;
    const capDeltaPct =
      currentCap !== null && previousCap !== null && previousCap !== 0
        ? ((currentCap - previousCap) / previousCap) * 100
        : null;

    const liquidityTone: Tone =
      liquidity === null
        ? 'unavailable'
        : liquidity >= 2 || (liquidityDelta !== null && liquidityDelta >= 0.5)
          ? 'watch'
          : liquidity <= 0.25 && (liquidityDelta === null || liquidityDelta <= 0.1)
            ? 'positive'
            : 'neutral';

    const tofTone: Tone =
      tof === null
        ? 'unavailable'
        : tof < 90 || (tofDelta !== null && tofDelta <= -2)
          ? 'watch'
          : tof >= 95 && (tofDelta === null || tofDelta >= -0.5)
            ? 'positive'
            : 'neutral';

    const valuationTone: Tone =
      valuationGap === null
        ? 'unavailable'
        : valuationGap > 5
          ? 'watch'
          : Math.abs(valuationGap) <= 5
            ? 'neutral'
            : 'positive';

    const capTone: Tone =
      capDeltaPct === null
        ? 'unavailable'
        : capDeltaPct > 25
          ? 'watch'
          : 'neutral';

    const debtTone: Tone =
      debt === null
        ? 'unavailable'
        : debt >= 35
          ? 'watch'
          : debt <= 20
            ? 'positive'
            : 'neutral';

    return [
      {
        title: 'Liquidité des parts',
        value: formatNumber(liquidity, ' %', 3),
        detail:
          liquidity === null
            ? 'File de retrait non exploitable sur les observations disponibles.'
            : liquidity === 0
              ? 'Aucune tension visible dans la file de retrait publiée ; cela ne garantit pas la liquidité future.'
              : `Évolution sur 4 observations : ${formatSigned(liquidityDelta, ' pt')}.`,
        tone: liquidityTone,
        icon: <Activity className="h-5 w-5" />,
      },
      {
        title: 'Occupation locative',
        value: formatNumber(tof, ' %'),
        detail:
          tof === null
            ? 'TOF historique insuffisant.'
            : `Évolution sur 4 observations : ${formatSigned(tofDelta, ' pt')}.`,
        tone: tofTone,
        icon: <Gauge className="h-5 w-5" />,
      },
      {
        title: 'Prix / valeur de reconstitution',
        value: valuationGap === null ? 'N.D.' : formatSigned(valuationGap, ' %'),
        detail:
          valuationGap === null
            ? 'Comparaison prix / reconstitution indisponible sur une même période.'
            : valuationGap > 0
              ? 'Le prix de souscription est au-dessus de la valeur de reconstitution observée.'
              : 'Le prix de souscription est sous la valeur de reconstitution observée.',
        tone: valuationTone,
        icon: <Scale className="h-5 w-5" />,
      },
      {
        title: 'Dynamique de capitalisation',
        value: capDeltaPct === null ? 'N.D.' : formatSigned(capDeltaPct, ' %'),
        detail:
          capDeltaPct === null
            ? 'Historique de capitalisation insuffisant.'
            : capDeltaPct > 25
              ? 'Croissance rapide : vérifier la capacité de déploiement de la collecte et la qualité des acquisitions.'
              : 'Variation calculée sur les dernières observations disponibles.',
        tone: capTone,
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        title: 'Endettement',
        value: formatNumber(debt, ' %'),
        detail:
          debt === null
            ? 'Donnée d’endettement historique insuffisante.'
            : 'Lecture de résilience financière ; à rapprocher des échéances et du coût de la dette.',
        tone: debtTone,
        icon: <BarChart3 className="h-5 w-5" />,
      },
    ];
  }, [history]);

  const watchCount = signals.filter((signal) => signal.tone === 'watch').length;
  const availableCount = signals.filter((signal) => signal.tone !== 'unavailable').length;
  const latestPeriod = history.length ? formatPeriod(history[history.length - 1]?.source_period) : 'N.D.';

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-bold text-white">Signaux du marché de la SCPI</div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
            Lecture dynamique des signaux observables dans les publications de la SCPI : retraits, occupation, valorisation, capitalisation et dette.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-400">
          <Database className="h-4 w-4" />
          Dernière période : {latestPeriod}
        </div>
      </div>

      <div
        className={
          watchCount > 0
            ? 'rounded-xl border border-amber-500/25 bg-amber-500/5 p-4'
            : 'rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4'
        }
      >
        <div className="flex items-start gap-3">
          {watchCount > 0 ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-300" />
          ) : (
            <Activity className="mt-0.5 h-5 w-5 flex-none text-emerald-300" />
          )}
          <div>
            <div className="text-sm font-bold text-white">
              {watchCount > 0
                ? `${watchCount} signal${watchCount > 1 ? 'aux' : ''} à surveiller`
                : 'Pas de signal de tension majeur sur les données disponibles'}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {availableCount}/5 indicateurs exploitables. Les seuils affichés sont des repères d’analyse MaximusSCPI, pas des seuils réglementaires ni une prévision de performance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {signals.map((signal) => (
          <div key={signal.title} className={`rounded-xl border p-4 ${toneClasses[signal.tone]}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-slate-300">{signal.icon}</div>
              <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${toneLabelClasses[signal.tone]}`}>
                {toneLabel[signal.tone]}
              </span>
            </div>
            <div className="mt-4 text-xs font-semibold text-slate-400">{signal.title}</div>
            <div className="mt-1 text-xl font-bold text-white">{signal.value}</div>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">{signal.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScpiTrajectoryTabs: React.FC<{ scpiSlug: string }> = ({ scpiSlug }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('trajectory');

  return (
    <section className="px-6 pb-6" data-maximus-analysis-tabs="true">
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/45 shadow-lg">
        <div className="border-b border-slate-800 px-4 pt-4 sm:px-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">
            <LineChartIcon className="h-4 w-4" />
            Analyse dynamique
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('trajectory')}
              className={
                activeTab === 'trajectory'
                  ? 'border-b-2 border-sky-400 px-3 pb-3 text-sm font-bold text-white'
                  : 'border-b-2 border-transparent px-3 pb-3 text-sm font-semibold text-slate-500 hover:text-slate-300'
              }
            >
              Trajectoire
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('market')}
              className={
                activeTab === 'market'
                  ? 'border-b-2 border-sky-400 px-3 pb-3 text-sm font-bold text-white'
                  : 'border-b-2 border-transparent px-3 pb-3 text-sm font-semibold text-slate-500 hover:text-slate-300'
              }
            >
              Signaux du marché de la SCPI
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {activeTab === 'trajectory' ? (
            <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:py-0 [&>section>div]:px-0">
              <ScpiTrajectoryPanel scpiSlug={scpiSlug} />
            </div>
          ) : (
            <MarketSignalsPanel scpiSlug={scpiSlug} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ScpiTrajectoryTabs;
