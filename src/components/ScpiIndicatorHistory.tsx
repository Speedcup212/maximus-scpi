import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Database,
  FileText,
  Minus,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type ChangeRow = {
  scpi_slug: string;
  previous_period: string | null;
  current_period: string | null;
  previous_source_document: string | null;
  current_source_document: string | null;
  previous_source_url: string | null;
  current_source_url: string | null;
  previous_td: number | string | null;
  current_td: number | string | null;
  td_delta: number | string | null;
  previous_tof: number | string | null;
  current_tof: number | string | null;
  tof_delta: number | string | null;
  previous_capitalisation: number | string | null;
  current_capitalisation: number | string | null;
  capitalisation_delta: number | string | null;
  previous_prix_souscription: number | string | null;
  current_prix_souscription: number | string | null;
  prix_souscription_delta: number | string | null;
  previous_prix_reconstitution: number | string | null;
  current_prix_reconstitution: number | string | null;
  prix_reconstitution_delta: number | string | null;
  previous_prix_retrait: number | string | null;
  current_prix_retrait: number | string | null;
  prix_retrait_delta: number | string | null;
  previous_valeur_realisation: number | string | null;
  current_valeur_realisation: number | string | null;
  valeur_realisation_delta: number | string | null;
  previous_endettement: number | string | null;
  current_endettement: number | string | null;
  endettement_delta: number | string | null;
  previous_walt: number | string | null;
  current_walt: number | string | null;
  walt_delta: number | string | null;
  previous_walb: number | string | null;
  current_walb: number | string | null;
  walb_delta: number | string | null;
  previous_collecte_nette: number | string | null;
  current_collecte_nette: number | string | null;
  collecte_nette_delta: number | string | null;
  previous_distribution_par_part: number | string | null;
  current_distribution_par_part: number | string | null;
  distribution_par_part_delta: number | string | null;
  previous_nombre_locataires: number | string | null;
  current_nombre_locataires: number | string | null;
  nombre_locataires_delta: number | string | null;
  previous_nombre_immeubles: number | string | null;
  current_nombre_immeubles: number | string | null;
  nombre_immeubles_delta: number | string | null;
  previous_parts_attente_retrait: number | string | null;
  current_parts_attente_retrait: number | string | null;
  parts_attente_retrait_delta: number | string | null;
};

type IndicatorRow = {
  scpi_slug: string;
  parts_attente_retrait: number | string | null;
  nombre_parts: number | string | null;
  capital_type: string | null;
  source_period: string | null;
  source_document: string | null;
  qa_status: string | null;
};

interface ScpiIndicatorHistoryProps {
  scpiSlug: string;
  scpiName: string;
}

type Metric = {
  key: string;
  label: string;
  previous: number;
  current: number;
  delta: number;
  format: (value: number) => string;
  deltaFormat: (value: number) => string;
};

type LiquidityLevel = {
  label: string;
  badgeClass: string;
  cardClass: string;
  valueClass: string;
};

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const formatPct = (value: number) => `${value.toFixed(2).replace('.', ',')} %`;
const formatEuros = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value) + ' €';
const formatParts = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' parts';
const formatYears = (value: number) => `${value.toFixed(1).replace('.', ',')} ans`;
const formatDeltaPoints = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')} pt`;
const formatDeltaValue = (value: number, suffix: string) => `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)}${suffix}`;

const formatMillions = (value: number) => {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2).replace('.', ',')} Md€`;
  return `${value.toFixed(value >= 100 ? 0 : 1).replace('.', ',')} M€`;
};

const normalizeCapitalType = (capitalType: string | null | undefined) => {
  const value = (capitalType || '').trim().toLowerCase();
  if (!value) return 'non_documente' as const;
  if (value.includes('suspend')) return 'suspendu' as const;
  if (value.includes('fix')) return 'fixe' as const;
  if (value.includes('secondaire')) return 'secondaire' as const;
  if (value.includes('variab')) return 'variable' as const;
  return 'autre' as const;
};

const liquidityLevel = (
  waitingPct: number | null,
  capitalRegime: ReturnType<typeof normalizeCapitalType>,
  waitingParts: number | null,
): LiquidityLevel => {
  if (capitalRegime === 'suspendu' || capitalRegime === 'fixe' || capitalRegime === 'secondaire') {
    return {
      label: 'Régime spécifique',
      badgeClass: 'border-slate-300 bg-slate-100 text-slate-800',
      cardClass: 'border-slate-200 bg-slate-50',
      valueClass: 'text-slate-950',
    };
  }

  if (waitingParts === null || waitingPct === null) {
    return {
      label: 'Non documenté',
      badgeClass: 'border-slate-200 bg-white text-slate-600',
      cardClass: 'border-slate-200 bg-slate-50',
      valueClass: 'text-slate-700',
    };
  }

  if (waitingParts === 0) {
    return {
      label: 'Aucune part signalée',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      cardClass: 'border-emerald-200 bg-emerald-50/60',
      valueClass: 'text-emerald-950',
    };
  }

  if (waitingPct < 0.5) {
    return {
      label: 'File faible',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      cardClass: 'border-emerald-200 bg-emerald-50/60',
      valueClass: 'text-emerald-950',
    };
  }

  if (waitingPct < 2) {
    return {
      label: 'À surveiller',
      badgeClass: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      cardClass: 'border-yellow-200 bg-yellow-50/60',
      valueClass: 'text-yellow-950',
    };
  }

  if (waitingPct < 3) {
    return {
      label: 'Pré-alerte Maximus',
      badgeClass: 'border-yellow-300 bg-yellow-50 text-yellow-950',
      cardClass: 'border-yellow-300 bg-yellow-50/70',
      valueClass: 'text-yellow-950',
    };
  }

  if (waitingPct < 5) {
    return {
      label: 'Vigilance modérée',
      badgeClass: 'border-amber-300 bg-amber-50 text-amber-950',
      cardClass: 'border-amber-300 bg-amber-50/70',
      valueClass: 'text-amber-950',
    };
  }

  if (waitingPct < 10) {
    return {
      label: 'Vigilance élevée',
      badgeClass: 'border-red-300 bg-red-50 text-red-900',
      cardClass: 'border-red-300 bg-red-50/70',
      valueClass: 'text-red-950',
    };
  }

  return {
    label: 'Liquidité critique',
    badgeClass: 'border-red-400 bg-red-100 text-red-950',
    cardClass: 'border-red-400 bg-red-50',
    valueClass: 'text-red-950',
  };
};

const capitalRegimeLabel = (regime: ReturnType<typeof normalizeCapitalType>) => {
  switch (regime) {
    case 'variable': return 'Capital variable';
    case 'fixe': return 'Capital fixe';
    case 'secondaire': return 'Marché secondaire';
    case 'suspendu': return 'Variabilité suspendue';
    case 'autre': return 'Régime à vérifier';
    default: return 'N/D';
  }
};

const ScpiIndicatorHistory: React.FC<ScpiIndicatorHistoryProps> = ({ scpiSlug, scpiName }) => {
  const [data, setData] = useState<ChangeRow | null>(null);
  const [indicator, setIndicator] = useState<IndicatorRow | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!supabase) return;

      const [changesResult, indicatorResult] = await Promise.all([
        supabase.from('scpi_indicator_changes').select('*').eq('scpi_slug', scpiSlug).maybeSingle(),
        supabase
          .from('scpi_indicators')
          .select('scpi_slug,parts_attente_retrait,nombre_parts,capital_type,source_period,source_document,qa_status')
          .eq('scpi_slug', scpiSlug)
          .maybeSingle(),
      ]);

      if (!active) return;
      setData(changesResult.error || !changesResult.data ? null : changesResult.data as ChangeRow);
      setIndicator(indicatorResult.error || !indicatorResult.data ? null : indicatorResult.data as IndicatorRow);
    };

    void load();
    return () => { active = false; };
  }, [scpiSlug]);

  const metrics = useMemo<Metric[]>(() => {
    if (!data) return [];

    const raw = [
      { key: 'tof', label: 'TOF', previous: toNumber(data.previous_tof), current: toNumber(data.current_tof), delta: toNumber(data.tof_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'endettement', label: 'Endettement', previous: toNumber(data.previous_endettement), current: toNumber(data.current_endettement), delta: toNumber(data.endettement_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'parts_attente_retrait', label: 'Parts en attente', previous: toNumber(data.previous_parts_attente_retrait), current: toNumber(data.current_parts_attente_retrait), delta: toNumber(data.parts_attente_retrait_delta), format: formatParts, deltaFormat: (v: number) => formatDeltaValue(v, ' parts') },
      { key: 'capitalisation', label: 'Capitalisation', previous: toNumber(data.previous_capitalisation), current: toNumber(data.current_capitalisation), delta: toNumber(data.capitalisation_delta), format: formatMillions, deltaFormat: (v: number) => formatDeltaValue(v, ' M€') },
      { key: 'prix_souscription', label: 'Prix de la part', previous: toNumber(data.previous_prix_souscription), current: toNumber(data.current_prix_souscription), delta: toNumber(data.prix_souscription_delta), format: formatEuros, deltaFormat: (v: number) => formatDeltaValue(v, ' €') },
      { key: 'prix_reconstitution', label: 'Valeur de reconstitution', previous: toNumber(data.previous_prix_reconstitution), current: toNumber(data.current_prix_reconstitution), delta: toNumber(data.prix_reconstitution_delta), format: formatEuros, deltaFormat: (v: number) => formatDeltaValue(v, ' €') },
      { key: 'prix_retrait', label: 'Prix de retrait', previous: toNumber(data.previous_prix_retrait), current: toNumber(data.current_prix_retrait), delta: toNumber(data.prix_retrait_delta), format: formatEuros, deltaFormat: (v: number) => formatDeltaValue(v, ' €') },
      { key: 'walt', label: 'WALT', previous: toNumber(data.previous_walt), current: toNumber(data.current_walt), delta: toNumber(data.walt_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
      { key: 'walb', label: 'WALB', previous: toNumber(data.previous_walb), current: toNumber(data.current_walb), delta: toNumber(data.walb_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
    ];

    return raw
      .filter((metric) => metric.previous !== null && metric.current !== null && metric.delta !== null)
      .map((metric) => ({ ...metric, previous: metric.previous as number, current: metric.current as number, delta: metric.delta as number }))
      .slice(0, 6);
  }, [data]);

  const observations = useMemo(() => {
    if (!data) return [];
    const result: string[] = [];
    const tofDelta = toNumber(data.tof_delta);
    const debtDelta = toNumber(data.endettement_delta);
    const previousWaiting = toNumber(data.previous_parts_attente_retrait);
    const currentWaiting = toNumber(data.current_parts_attente_retrait);
    const previousReconstitution = toNumber(data.previous_prix_reconstitution);
    const currentReconstitution = toNumber(data.current_prix_reconstitution);

    if (tofDelta !== null && Math.abs(tofDelta) >= 0.5) {
      result.push(`TOF ${tofDelta < 0 ? 'en baisse' : 'en hausse'} de ${Math.abs(tofDelta).toFixed(2).replace('.', ',')} point${Math.abs(tofDelta) >= 2 ? 's' : ''}.`);
    }
    if (debtDelta !== null && Math.abs(debtDelta) >= 1) {
      result.push(`Endettement ${debtDelta > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(debtDelta).toFixed(2).replace('.', ',')} point${Math.abs(debtDelta) >= 2 ? 's' : ''}.`);
    }
    if (previousWaiting !== null && currentWaiting !== null && previousWaiting !== currentWaiting) {
      result.push(currentWaiting === 0 && previousWaiting > 0
        ? `Parts en attente : ${formatParts(previousWaiting)} → aucune part signalée sur la dernière période structurée.`
        : `Parts en attente : ${formatParts(previousWaiting)} → ${formatParts(currentWaiting)}.`);
    }
    if (previousReconstitution !== null && currentReconstitution !== null && previousReconstitution !== 0) {
      const pct = ((currentReconstitution - previousReconstitution) / previousReconstitution) * 100;
      if (Math.abs(pct) >= 1) result.push(`Valeur de reconstitution ${pct > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(pct).toFixed(1).replace('.', ',')} %.`);
    }

    return result.slice(0, 3);
  }, [data]);

  const liquidity = useMemo(() => {
    const waitingParts = toNumber(indicator?.parts_attente_retrait);
    const totalParts = toNumber(indicator?.nombre_parts);
    const waitingPct = waitingParts !== null && totalParts !== null && totalParts > 0 ? (waitingParts / totalParts) * 100 : null;
    const capitalRegime = normalizeCapitalType(indicator?.capital_type);
    const level = liquidityLevel(waitingPct, capitalRegime, waitingParts);

    const previousWaiting = toNumber(data?.previous_parts_attente_retrait);
    const currentWaitingHistory = toNumber(data?.current_parts_attente_retrait);
    const trend = previousWaiting !== null && currentWaitingHistory !== null
      ? currentWaitingHistory > previousWaiting ? 'hausse' : currentWaitingHistory < previousWaiting ? 'baisse' : 'stable'
      : 'non_documentee';

    const hasSource = Boolean(indicator?.source_document || indicator?.source_period);
    const qaVerified = Boolean(indicator?.qa_status && /verified/i.test(indicator.qa_status));
    const quality = waitingParts !== null && totalParts !== null && hasSource && qaVerified
      ? 'A'
      : waitingParts !== null && hasSource
        ? 'B'
        : waitingParts !== null
          ? 'C'
          : 'N/D';

    let analysis = 'Les données disponibles ne permettent pas de qualifier la liquidité sans extrapolation.';
    if (capitalRegime === 'suspendu') {
      analysis = 'La variabilité est indiquée comme suspendue. Le stock de retraits ne doit pas être comparé mécaniquement à celui d’une SCPI fonctionnant normalement à capital variable.';
    } else if (capitalRegime === 'fixe' || capitalRegime === 'secondaire') {
      analysis = 'Cette SCPI relève d’un marché secondaire. La liquidité doit être analysée à partir des ordres de vente, des ordres d’achat, des volumes exécutés et des prix d’exécution, et non à partir de la seule file de retraits.';
    } else if (waitingParts === 0 && waitingPct !== null) {
      analysis = 'Aucune part en attente de retrait n’est signalée dans la dernière donnée structurée. Cela décrit la situation publiée à cette date, sans garantir un délai futur de retrait.';
    } else if (waitingPct !== null && waitingPct >= 10) {
      analysis = 'Le ratio atteint ou dépasse 10 %. C’est un signal quantitatif critique. La condition réglementaire d’ancienneté de douze mois doit encore être vérifiée avant de conclure que le seuil légal est constitué.';
    } else if (waitingPct !== null && waitingPct >= 5) {
      analysis = `La file représente ${formatPct(waitingPct)} des parts. Selon la doctrine MaximusSCPI active, le niveau de vigilance est élevé.`;
    } else if (waitingPct !== null && waitingPct >= 3) {
      analysis = trend === 'hausse'
        ? `La file représente ${formatPct(waitingPct)} des parts et progresse entre les deux dernières périodes structurées. Le niveau de vigilance est modéré, avec une trajectoire défavorable à suivre.`
        : trend === 'baisse'
          ? `La file représente ${formatPct(waitingPct)} des parts. Le niveau de vigilance est modéré, mais la dernière évolution disponible est orientée à la baisse.`
          : `La file représente ${formatPct(waitingPct)} des parts. Le niveau de vigilance est modéré selon la doctrine MaximusSCPI.`;
    } else if (waitingPct !== null && waitingPct >= 2) {
      analysis = trend === 'hausse'
        ? `La file représente ${formatPct(waitingPct)} des parts et augmente. Le seuil de 2 % déclenche une pré-alerte interne Maximus, mais ne relève pas à lui seul la SCPI en vigilance modérée.`
        : `La file représente ${formatPct(waitingPct)} des parts. Le seuil de 2 % sert de pré-alerte interne Maximus ; la vigilance modérée commence à 3 % dans la doctrine actuellement appliquée.`;
    } else if (waitingPct !== null && waitingPct >= 0.5) {
      analysis = `La file représente ${formatPct(waitingPct)} des parts. Le niveau reste faible mais mérite un suivi de trajectoire.`;
    } else if (waitingPct !== null && waitingPct > 0) {
      analysis = `La file publiée reste faible à ${formatPct(waitingPct)} des parts. La tendance et la capacité réelle d’exécution restent nécessaires pour apprécier la liquidité dans la durée.`;
    }

    return { waitingParts, totalParts, waitingPct, capitalRegime, level, previousWaiting, currentWaitingHistory, trend, quality, analysis };
  }, [data, indicator]);

  const hasHistory = Boolean(data && data.previous_period && data.current_period && metrics.length > 0);
  const hasLiquidity = Boolean(indicator);

  if (!hasHistory && !hasLiquidity) return null;

  return (
    <section className="bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {hasLiquidity && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 sm:p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  Liquidité Maximus
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950">Marché des parts de {scpiName}</h2>
                <p className="mt-2 max-w-3xl text-slate-600">Lecture factuelle de la file publiée, de sa tendance et du régime de liquidité. Aucun score artificiel n’est calculé lorsque la donnée manque.</p>
              </div>
              <div className={`inline-flex items-center self-start gap-2 rounded-xl border px-4 py-2.5 text-sm font-black ${liquidity.level.badgeClass}`}>
                <ShieldAlert className="w-4 h-4" />
                {liquidity.level.label}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`rounded-2xl border p-4 ${liquidity.level.cardClass}`}>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Stock en attente</div>
                <div className={`mt-2 text-2xl font-black ${liquidity.level.valueClass}`}>
                  {liquidity.waitingPct !== null ? formatPct(liquidity.waitingPct) : liquidity.waitingParts !== null ? formatParts(liquidity.waitingParts) : 'N/D'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {liquidity.waitingParts !== null && liquidity.totalParts !== null
                    ? `${formatParts(liquidity.waitingParts)} sur ${formatParts(liquidity.totalParts)}`
                    : 'Pourcentage non calculable avec les données publiées'}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><BarChart3 className="w-4 h-4" />Tendance</div>
                <div className="mt-2 text-xl font-black text-slate-950">
                  {liquidity.trend === 'hausse' ? 'En hausse' : liquidity.trend === 'baisse' ? 'En baisse' : liquidity.trend === 'stable' ? 'Stable' : 'N/D'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {liquidity.previousWaiting !== null && liquidity.currentWaitingHistory !== null
                    ? `${formatParts(liquidity.previousWaiting)} → ${formatParts(liquidity.currentWaitingHistory)}`
                    : 'Historique insuffisant pour qualifier la trajectoire'}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Clock className="w-4 h-4" />Absorption</div>
                <div className="mt-2 text-xl font-black text-slate-950">N/D</div>
                <div className="mt-1 text-xs text-slate-600">Retraits exécutés non encore structurés : aucun délai théorique n’est inventé.</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><FileText className="w-4 h-4" />Régime</div>
                <div className="mt-2 text-xl font-black text-slate-950">{capitalRegimeLabel(liquidity.capitalRegime)}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {liquidity.capitalRegime === 'variable'
                    ? 'Lecture par demandes de retrait et compensation.'
                    : liquidity.capitalRegime === 'fixe' || liquidity.capitalRegime === 'secondaire'
                      ? 'Lecture par carnet et transactions du marché secondaire.'
                      : liquidity.capitalRegime === 'suspendu'
                        ? 'Comparaison directe avec une file normale à éviter.'
                        : 'Régime non suffisamment documenté.'}
                </div>
              </div>
            </div>

            <div className="mt-4 grid lg:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="text-sm font-black text-slate-950">Analyse Maximus</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{liquidity.analysis}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 min-w-[220px]">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Qualité de la donnée</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{liquidity.quality}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {liquidity.quality === 'A'
                    ? 'Stock calculable + source vérifiée.'
                    : liquidity.quality === 'B'
                      ? 'Donnée sourcée mais calcul ou QA incomplet.'
                      : liquidity.quality === 'C'
                        ? 'Donnée partielle, à compléter.'
                        : 'Donnée de file non disponible.'}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
              <strong className="text-slate-800">Méthode MaximusSCPI :</strong> 2 % = pré-alerte interne, sans valeur réglementaire ; 3 % à moins de 5 % = vigilance modérée ; 5 % et plus = vigilance élevée. À 10 % ou plus, la condition réglementaire d’ancienneté de douze mois doit encore être vérifiée. Une file à 0 ne garantit pas la liquidité future.
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Source : {indicator?.source_document || indicator?.source_period || 'dernière donnée structurée disponible'}
              {indicator?.source_document && indicator?.source_period ? ` · ${indicator.source_period}` : ''}
              {indicator?.qa_status ? ` · Statut données : ${indicator.qa_status}` : ''}
            </div>
          </div>
        )}

        {hasHistory && data && (
          <div className="rounded-3xl border border-emerald-900/10 bg-white p-5 sm:p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700"><Activity className="w-4 h-4" />Évolution documentée</div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950">Ce qui a changé sur {scpiName}</h2>
                <p className="mt-2 text-slate-600">Comparaison des indicateurs publiés entre {data.previous_period} et {data.current_period}.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><Database className="w-4 h-4 text-emerald-300" />Historique MaximusSCPI</div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.map((metric) => {
                const isUp = metric.delta > 0;
                const isDown = metric.delta < 0;
                const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
                return (
                  <div key={metric.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-slate-700">{metric.label}</div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700"><Icon className="w-3.5 h-3.5" />{metric.deltaFormat(metric.delta)}</div>
                    </div>
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div><div className="text-[11px] uppercase tracking-wide text-slate-400">{data.previous_period}</div><div className="mt-1 font-bold text-slate-700">{metric.format(metric.previous)}</div></div>
                      <div className="text-slate-300">→</div>
                      <div className="text-right"><div className="text-[11px] uppercase tracking-wide text-slate-400">{data.current_period}</div><div className="mt-1 font-black text-slate-950">{metric.format(metric.current)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {observations.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-black text-amber-950">Évolutions à surveiller</div>
                    <ul className="mt-2 space-y-1.5 text-sm text-amber-950/85">{observations.map((observation) => <li key={observation}>• {observation}</li>)}</ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
              <div>Source actuelle : {data.current_source_document || data.current_period}{data.previous_source_document ? ` · Source précédente : ${data.previous_source_document}` : ''}</div>
              <div>Une variation d’indicateur ne constitue pas, à elle seule, un signal d’achat ou de vente.</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScpiIndicatorHistory;
