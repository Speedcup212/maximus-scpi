import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Database, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { onlyCurrentScpiRow } from '../utils/scpiRowScope';
import {
  type CertifiedLiquiditySnapshot,
  type LiquiditySignalGate,
  resolveCertifiedLiquidity,
  toFiniteNumber,
} from '../utils/certifiedLiquidity';

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

type ScpiScopedLiquiditySignalGate = LiquiditySignalGate & { scpi_slug: string };

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
  const [gate, setGate] = useState<ScpiScopedLiquiditySignalGate | null>(null);
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
      setGate(gateResult.error || !gateResult.data ? null : gateResult.data as ScpiScopedLiquiditySignalGate);
      setSource(sourceResult.error || !sourceResult.data ? null : sourceResult.data as SourceRow);
    };

    void load();
    return () => { active = false; };
  }, [scpiSlug]);

  // Derive every displayed value from this render's selected fund, before any
  // memoized metric or certification calculation. Old asynchronous state is
  // never a valid source for another scpiSlug.
  const currentData = onlyCurrentScpiRow(data, scpiSlug);
  const currentLiquidity = onlyCurrentScpiRow(liquidity, scpiSlug);
  const currentGate = onlyCurrentScpiRow(gate, scpiSlug);
  const currentSource = onlyCurrentScpiRow(source, scpiSlug);

  const metrics = useMemo<Metric[]>(() => {
    if (!currentData) return [];
    const raw = [
      { key: 'tof', label: 'TOF', previous: toFiniteNumber(currentData.previous_tof), current: toFiniteNumber(currentData.current_tof), delta: toFiniteNumber(currentData.tof_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'endettement', label: 'Endettement', previous: toFiniteNumber(currentData.previous_endettement), current: toFiniteNumber(currentData.current_endettement), delta: toFiniteNumber(currentData.endettement_delta), format: formatPct, deltaFormat: formatDeltaPoints },
      { key: 'capitalisation', label: 'Capitalisation', previous: toFiniteNumber(currentData.previous_capitalisation), current: toFiniteNumber(currentData.current_capitalisation), delta: toFiniteNumber(currentData.capitalisation_delta), format: formatMillions, deltaFormat: (v: number) => formatDeltaValue(v, ' M€') },
      { key: 'prix_souscription', label: 'Prix de la part', previous: toFiniteNumber(currentData.previous_prix_souscription), current: toFiniteNumber(currentData.current_prix_souscription), delta: toFiniteNumber(currentData.prix_souscription_delta), format: formatEuros, deltaFormat: (v: number) => formatDeltaValue(v, ' €') },
      { key: 'walt', label: 'WALT', previous: toFiniteNumber(currentData.previous_walt), current: toFiniteNumber(currentData.current_walt), delta: toFiniteNumber(currentData.walt_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
      { key: 'walb', label: 'WALB', previous: toFiniteNumber(currentData.previous_walb), current: toFiniteNumber(currentData.current_walb), delta: toFiniteNumber(currentData.walb_delta), format: formatYears, deltaFormat: (v: number) => formatDeltaValue(v, ' an') },
    ];
    return raw
      .filter((metric) => metric.previous !== null && metric.current !== null && metric.delta !== null)
      .map((metric) => ({ ...metric, previous: metric.previous as number, current: metric.current as number, delta: metric.delta as number }));
  }, [currentData]);

  const certified = useMemo(() => resolveCertifiedLiquidity(currentLiquidity, currentGate), [currentLiquidity, currentGate]);
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


  const hasHistory = Boolean(currentData && currentData.previous_period && currentData.current_period && metrics.length > 0);
  const hasLiquidity = Boolean(currentLiquidity || currentGate);
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
                <div className="mt-1 text-xs text-slate-300">Gate : {currentGate?.liquidity_gate || 'N/D'}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#162229] p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"><Database className="w-4 h-4" />Source</div>
                <div className="mt-2 text-lg font-black text-white">{currentLiquidity?.source_period || currentSource?.source_period || 'N/D'}</div>
                <div className="mt-1 text-xs text-slate-300">{currentSource?.source_document || 'Document officiel certifié / registre Maximus'}</div>
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
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white">{currentData?.previous_period} → {currentData?.current_period}</h3>
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
