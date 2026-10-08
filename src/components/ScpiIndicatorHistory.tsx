import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Database, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
// Copie locale ciblée du résolveur certifié : la branche autonome ne contient pas encore
// le module partagé de la branche de référence. Conserver ce garde-fou dans ce consommateur.
type LiquidityBasis =
  | 'withdrawal_queue'
  | 'secondary_market_order_book'
  | 'fixed_capital_market'
  | null;

type CertifiedLiquiditySnapshot = {
  scpi_slug?: string;
  source_period?: string | null;
  parts_attente_retrait?: number | string | null;
  nombre_parts?: number | string | null;
  retrait_attente_pct?: number | string | null;
  prev_pct?: number | string | null;
  liquidity_basis?: string | null;
  liquidity_pressure_pct?: number | string | null;
  prev_pressure_pct?: number | string | null;
  liquidity_sell_orders?: number | string | null;
  liquidity_buy_orders?: number | string | null;
  regime_changed?: boolean | null;
  signal_certification?: string | null;
  niveau_liquidite?: string | null;
  trajectoire_liquidite?: string | null;
};

type LiquiditySignalGate = {
  data_gate?: string | null;
  structural_gate?: string | null;
  semantic_gate?: string | null;
  liquidity_gate?: string | null;
  liquidity_signal_eligible?: boolean | null;
  reconstitution_gate?: string | null;
  market_signal_gate?: string | null;
};

type ResolvedLiquidity = {
  basis: LiquidityBasis;
  currentPct: number | null;
  previousPct: number | null;
  deltaPct: number | null;
  withdrawalParts: number | null;
  totalParts: number | null;
  sellOrders: number | null;
  buyOrders: number | null;
  comparableTrend: boolean;
  publishableLevel: boolean;
  regimeChanged: boolean;
  certification: string | null;
  reason: 'certified' | 'regime_change' | 'gate_blocked' | 'not_certified' | 'unsupported_basis';
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const normalizeLiquidityBasis = (
  basis?: string | null,
  capitalType?: string | null,
): LiquidityBasis => {
  const normalizedBasis = (basis || '').trim().toLowerCase();
  const normalizedCapital = (capitalType || '').trim().toLowerCase();

  if (normalizedBasis.startsWith('secondary_market_order_book')) return 'secondary_market_order_book';
  if (normalizedBasis.startsWith('withdrawal_queue')) return 'withdrawal_queue';
  if (normalizedBasis.startsWith('fixed_capital')) return 'fixed_capital_market';
  if (normalizedBasis) return null;

  if (normalizedCapital.includes('secondaire') || normalizedCapital.includes('fix')) return 'fixed_capital_market';
  if (normalizedCapital.includes('variab') && !normalizedCapital.includes('suspend')) return 'withdrawal_queue';
  return null;
};

const isLiquidityGateUsable = (gate?: LiquiditySignalGate | null): boolean => Boolean(
  gate &&
  gate.data_gate === 'PASS' &&
  gate.structural_gate === 'PASS' &&
  gate.semantic_gate === 'PASS' &&
  gate.liquidity_gate?.startsWith('PASS'),
);

const safePercent = (value: unknown): number | null => {
  const parsed = toFiniteNumber(value);
  return parsed !== null && parsed >= 0 && parsed <= 100 ? parsed : null;
};

const resolveCertifiedLiquidity = (
  snapshot?: CertifiedLiquiditySnapshot | null,
  gate?: LiquiditySignalGate | null,
): ResolvedLiquidity => {
  const empty = (reason: ResolvedLiquidity['reason']): ResolvedLiquidity => ({
    basis: null,
    currentPct: null,
    previousPct: null,
    deltaPct: null,
    withdrawalParts: null,
    totalParts: null,
    sellOrders: null,
    buyOrders: null,
    comparableTrend: false,
    publishableLevel: false,
    regimeChanged: Boolean(snapshot?.regime_changed),
    certification: snapshot?.signal_certification || null,
    reason,
  });

  if (!snapshot || !isLiquidityGateUsable(gate)) return empty('gate_blocked');

  const basis = normalizeLiquidityBasis(snapshot.liquidity_basis);
  if (!basis) return empty('unsupported_basis');

  const certification = snapshot.signal_certification || null;
  const publishableLevel = ['trajectory_certified', 'level_only', 'stale_last_known'].includes(certification || '');
  if (!publishableLevel) return { ...empty('not_certified'), basis, certification };

  const regimeChanged = Boolean(snapshot.regime_changed);
  const currentPct = basis === 'withdrawal_queue'
    ? safePercent(snapshot.retrait_attente_pct)
    : basis === 'secondary_market_order_book'
      ? safePercent(snapshot.liquidity_pressure_pct)
      : null;
  const previousPct = basis === 'withdrawal_queue'
    ? safePercent(snapshot.prev_pct)
    : basis === 'secondary_market_order_book'
      ? safePercent(snapshot.prev_pressure_pct)
      : null;

  const comparableTrend = certification === 'trajectory_certified' && !regimeChanged && currentPct !== null && previousPct !== null;

  return {
    basis,
    currentPct,
    previousPct: comparableTrend ? previousPct : null,
    deltaPct: comparableTrend ? currentPct - previousPct : null,
    withdrawalParts: basis === 'withdrawal_queue' ? toFiniteNumber(snapshot.parts_attente_retrait) : null,
    totalParts: basis === 'withdrawal_queue' ? toFiniteNumber(snapshot.nombre_parts) : null,
    sellOrders: basis === 'secondary_market_order_book' ? toFiniteNumber(snapshot.liquidity_sell_orders) : null,
    buyOrders: basis === 'secondary_market_order_book' ? toFiniteNumber(snapshot.liquidity_buy_orders) : null,
    comparableTrend,
    publishableLevel,
    regimeChanged,
    certification,
    reason: regimeChanged ? 'regime_change' : 'certified',
  };
};

const isSubscriptionReconstitutionComparable = (input: {
  capitalType?: string | null;
  liquidityBasis?: string | null;
  liquidityRegimeChanged?: boolean | null;
  reconstitutionGate?: string | null;
}): boolean => {
  const capital = (input.capitalType || '').trim().toLowerCase();
  const basis = normalizeLiquidityBasis(input.liquidityBasis, input.capitalType);

  if (input.liquidityRegimeChanged) return false;
  if (basis === 'secondary_market_order_book' || basis === 'fixed_capital_market') return false;
  if (capital.includes('suspend') || capital.includes('secondaire') || capital.includes('fix')) return false;
  if (input.reconstitutionGate && !input.reconstitutionGate.startsWith('PASS')) return false;
  return true;
};


type ChangeRow = {
  scpi_slug: string;
  previous_period: string | null;
  current_period: string | null;
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
  previous_endettement: number | string | null;
  current_endettement: number | string | null;
  endettement_delta: number | string | null;
  previous_walt: number | string | null;
  current_walt: number | string | null;
  walt_delta: number | string | null;
  previous_walb: number | string | null;
  current_walb: number | string | null;
  walb_delta: number | string | null;
};

type SourceRow = {
  scpi_slug: string;
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

const formatPct = (value: number) => `${value.toFixed(2).replace('.', ',')} %`;
const formatEuros = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value) + ' €';
const formatYears = (value: number) => `${value.toFixed(1).replace('.', ',')} ans`;
const formatDeltaPoints = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')} pt`;
const formatDeltaValue = (value: number, suffix: string) => `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)}${suffix}`;
const formatMillions = (value: number) => Math.abs(value) >= 1000
  ? `${(value / 1000).toFixed(2).replace('.', ',')} Md€`
  : `${value.toFixed(value >= 100 ? 0 : 1).replace('.', ',')} M€`;

const liquidityLabel = (basis: ReturnType<typeof resolveCertifiedLiquidity>['basis']) => {
  if (basis === 'withdrawal_queue') return 'File de retraits';
  if (basis === 'secondary_market_order_book') return 'Pression du marché secondaire';
  if (basis === 'fixed_capital_market') return 'Marché secondaire / capital fixe';
  return 'Liquidité non comparable';
};

const liquidityLevel = (value: number | null, basis: ReturnType<typeof resolveCertifiedLiquidity>['basis']) => {
  if (value === null || basis === 'fixed_capital_market') {
    return { label: 'Non comparable', className: 'border-slate-500/40 bg-slate-800/80 text-slate-200' };
  }
  if (value < 0.5) return { label: 'Faible', className: 'border-emerald-400/30 bg-emerald-950/35 text-emerald-200' };
  if (value < 2) return { label: 'À surveiller', className: 'border-yellow-400/30 bg-yellow-950/35 text-yellow-200' };
  if (value < 5) return { label: 'Vigilance modérée', className: 'border-amber-400/35 bg-amber-950/40 text-amber-100' };
  if (value < 10) return { label: 'Vigilance élevée', className: 'border-red-400/35 bg-red-950/40 text-red-200' };
  return { label: 'Liquidité critique', className: 'border-red-400/45 bg-red-950/60 text-red-100' };
};

const ScpiIndicatorHistory: React.FC<ScpiIndicatorHistoryProps> = ({ scpiSlug, scpiName }) => {
  const [data, setData] = useState<ChangeRow | null>(null);
  const [liquidity, setLiquidity] = useState<CertifiedLiquiditySnapshot | null>(null);
  const [gate, setGate] = useState<LiquiditySignalGate | null>(null);
  const [source, setSource] = useState<SourceRow | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!supabase) return;
      const [changesResult, liquidityResult, gateResult, sourceResult] = await Promise.all([
        supabase.from('scpi_indicator_changes').select('*').eq('scpi_slug', scpiSlug).maybeSingle(),
        supabase.from('scpi_trajectory_pilot_liquidity')
          .select('scpi_slug,source_period,parts_attente_retrait,nombre_parts,retrait_attente_pct,prev_pct,niveau_liquidite,trajectoire_liquidite,liquidity_basis,liquidity_pressure_pct,prev_pressure_pct,liquidity_sell_orders,liquidity_buy_orders,regime_changed,signal_certification')
          .eq('scpi_slug', scpiSlug).maybeSingle(),
        supabase.from('scpi_trajectory_signal_gate')
          .select('scpi_slug,data_gate,structural_gate,semantic_gate,liquidity_gate,liquidity_signal_eligible,reconstitution_gate,market_signal_gate')
          .eq('scpi_slug', scpiSlug).maybeSingle(),
        supabase.from('scpi_indicators')
          .select('scpi_slug,source_period,source_document,qa_status')
          .eq('scpi_slug', scpiSlug).maybeSingle(),
      ]);

      if (!active) return;
      setData(changesResult.error || !changesResult.data ? null : changesResult.data as ChangeRow);
      setLiquidity(liquidityResult.error || !liquidityResult.data ? null : liquidityResult.data as CertifiedLiquiditySnapshot);
      setGate(gateResult.error || !gateResult.data ? null : gateResult.data as LiquiditySignalGate);
      setSource(sourceResult.error || !sourceResult.data ? null : sourceResult.data as SourceRow);
    };

    void load();
    return () => { active = false; };
  }, [scpiSlug]);

  const metrics = useMemo<Metric[]>(() => {
    if (!data) return [];
    const raw = [
      { key: 'tof', label: 'TOF', previous: toFiniteNumber(data.previous_tof), current: toFiniteNumber(data.current_tof), delta: toFiniteNumber(data.tof_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'endettement', label: 'Endettement', previous: toFiniteNumber(data.previous_endettement), current: toFiniteNumber(data.current_endettement), delta: toFiniteNumber(data.endettement_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'capitalisation', label: 'Capitalisation', previous: toFiniteNumber(data.previous_capitalisation), current: toFiniteNumber(data.current_capitalisation), delta: toFiniteNumber(data.capitalisation_delta), format: formatMillions, deltaFormat: (v: number) => formatDeltaValue(v, ' M€') },
      { key: 'prix_souscription', label: 'Prix de la part', previous: toFiniteNumber(data.previous_prix_souscription), current: toFiniteNumber(data.current_prix_souscription), delta: toFiniteNumber(data.prix_souscription_delta), format: formatEuros, deltaFormat: (v: number) => formatDeltaValue(v, ' €') },
      { key: 'walt', label: 'WALT', previous: toFiniteNumber(data.previous_walt), current: toFiniteNumber(data.current_walt), delta: toFiniteNumber(data.walt_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
      { key: 'walb', label: 'WALB', previous: toFiniteNumber(data.previous_walb), current: toFiniteNumber(data.current_walb), delta: toFiniteNumber(data.walb_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
    ];
    return raw
      .filter((metric) => metric.previous !== null && metric.current !== null && metric.delta !== null)
      .map((metric) => ({ ...metric, previous: metric.previous as number, current: metric.current as number, delta: metric.delta as number }));
  }, [data]);

  const certified = useMemo(() => resolveCertifiedLiquidity(liquidity, gate), [liquidity, gate]);
  const level = liquidityLevel(certified.currentPct, certified.basis);

  const trendLabel = certified.comparableTrend && certified.deltaPct !== null
    ? certified.deltaPct > 0 ? 'En hausse' : certified.deltaPct < 0 ? 'En baisse' : 'Stable'
    : 'Non comparable';

  const liquidityAnalysis = useMemo(() => {
    if (!certified.publishableLevel) return 'Les données certifiées disponibles ne permettent pas de qualifier la liquidité sans extrapolation.';
    if (certified.regimeChanged) return 'Un changement de régime a été identifié. Les données avant et après bascule ne sont pas comparées comme une même série.';
    if (certified.basis === 'secondary_market_order_book') return 'La liquidité est lue à partir du carnet d’ordres du marché secondaire. Une ancienne file de retraits n’est pas réutilisée.';
    if (certified.basis === 'withdrawal_queue') return 'La liquidité est lue à partir de la file de retraits certifiée pour la période courante. La tendance n’est affichée que sur périodes comparables.';
    return 'Le régime ne permet pas de produire un ratio comparable de liquidité.';
  }, [certified]);

  const hasHistory = Boolean(data && data.previous_period && data.current_period && metrics.length > 0);
  const hasLiquidity = Boolean(liquidity || gate);
  if (!hasHistory && !hasLiquidity) return null;

  return (
    <section className="bg-[#0B1116] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {hasLiquidity && (
          <div className="rounded-3xl border border-white/10 bg-[#111B20] p-5 sm:p-7 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Liquidité Maximus
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">Marché des parts de {scpiName}</h2>
                <p className="mt-2 max-w-3xl text-slate-300">Lecture fondée sur le régime et les signaux certifiés. Les séries incompatibles ne sont pas raccordées artificiellement.</p>
              </div>
              <div className={`inline-flex items-center self-start gap-2 rounded-xl border px-4 py-2.5 text-sm font-black ${level.className}`}>
                <ShieldAlert className="w-4 h-4" /> {level.label}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{liquidityLabel(certified.basis)}</div>
                <div className="mt-2 text-2xl font-black text-white">{certified.currentPct !== null ? formatPct(certified.currentPct) : 'N/D'}</div>
                <div className="mt-1 text-xs text-slate-300">
                  {certified.basis === 'withdrawal_queue' && certified.withdrawalParts !== null && certified.totalParts !== null
                    ? `${new Intl.NumberFormat('fr-FR').format(certified.withdrawalParts)} parts sur ${new Intl.NumberFormat('fr-FR').format(certified.totalParts)}`
                    : certified.basis === 'secondary_market_order_book'
                      ? 'Carnet d’ordres secondaire — pas de conversion en file de retraits'
                      : 'Ratio non comparable'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><BarChart3 className="w-4 h-4" />Tendance</div>
                <div className="mt-2 text-xl font-black text-white">{trendLabel}</div>
                <div className="mt-1 text-xs text-slate-300">
                  {certified.comparableTrend && certified.previousPct !== null && certified.currentPct !== null
                    ? `${formatPct(certified.previousPct)} → ${formatPct(certified.currentPct)}`
                    : certified.regimeChanged ? 'Changement de régime : variation neutralisée' : 'Historique comparable insuffisant'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Certification</div>
                <div className="mt-2 text-xl font-black text-white">{certified.certification || 'N/D'}</div>
                <div className="mt-1 text-xs text-slate-300">Gate : {gate?.liquidity_gate || 'N/D'}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><Database className="w-4 h-4" />Source</div>
                <div className="mt-2 text-lg font-black text-white">{liquidity?.source_period || source?.source_period || 'N/D'}</div>
                <div className="mt-1 text-xs text-slate-300">{source?.source_document || 'Document officiel certifié / registre Maximus'}</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-300">{liquidityAnalysis}</p>
          </div>
        )}

        {hasHistory && (
          <div className="rounded-3xl border border-white/10 bg-[#111B20] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-sky-300">
              <Activity className="w-4 h-4" /> Évolution des indicateurs
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white">{data?.previous_period} → {data?.current_period}</h3>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.key} className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{metric.label}</div>
                  <div className="mt-2 text-lg font-black text-white">{metric.format(metric.previous)} → {metric.format(metric.current)}</div>
                  <div className="mt-1 text-xs text-slate-300">Variation : {metric.deltaFormat(metric.delta)}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">La liquidité est volontairement exclue de ce tableau générique : elle est traitée séparément avec son régime et ses gates de comparabilité.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScpiIndicatorHistory;
