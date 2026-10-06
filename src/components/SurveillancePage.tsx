import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Search,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import certifiedScpiCohort from '../data/certified_scpi_cohort.json';

type SignalLevel = 'critical' | 'watch' | 'info' | 'clear';
type SignalKind = 'liquidity' | 'tof' | 'valuation' | 'debt' | 'structure';
type FilterKey = 'all' | 'priority' | 'watching' | SignalKind;

type DashboardRow = {
  scpi_slug: string;
  latest_period: string | null;
  tof: number | string | null;
  niveau_tof: string | null;
  trajectoire_tof: string | null;
  delta_4obs: number | string | null;
  niveau_liquidite: string | null;
  trajectoire_liquidite: string | null;
  liquidity_basis: string | null;
  liquidity_pressure_pct: number | string | null;
  retrait_attente_pct: number | string | null;
  liquidity_regime_changed: boolean | null;
  liquidity_signal_certification: string | null;
  endettement: number | string | null;
  endettement_delta_last: number | string | null;
  prix_souscription: number | string | null;
  prix_reconstitution: number | string | null;
  tof_gate: string | null;
  tof_signal_eligible: boolean | null;
  liquidity_gate: string | null;
  liquidity_signal_eligible: boolean | null;
  reconstitution_gate: string | null;
  debt_gate: string | null;
  market_signal_gate: string | null;
  data_gate: string | null;
};

type IndicatorRow = {
  scpi_slug: string;
  nom: string | null;
};

type Signal = {
  kind: SignalKind;
  level: Exclude<SignalLevel, 'clear'>;
  title: string;
  detail: string;
};

type SurveillanceRow = {
  slug: string;
  name: string;
  latestPeriod: string | null;
  level: SignalLevel;
  signals: Signal[];
};

const certifiedSlugSet = new Set<string>(certifiedScpiCohort.slugs);

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const gatePass = (value?: string | null) => Boolean(value?.startsWith('PASS'));

const formatNumber = (value: number | null, suffix = '', digits = 2) =>
  value === null
    ? 'N.D.'
    : `${value.toLocaleString('fr-FR', { maximumFractionDigits: digits })}${suffix}`;

const formatPeriod = (period: string | null) => {
  if (!period) return 'Période N.D.';
  const match = period.match(/^(\d{4})-T([1-4])$/);
  return match ? `T${match[2]} ${match[1]}` : period;
};

const severityRank: Record<SignalLevel, number> = {
  critical: 3,
  watch: 2,
  info: 1,
  clear: 0,
};

const levelFromSignals = (signals: Signal[]): SignalLevel => {
  if (signals.some((signal) => signal.level === 'critical')) return 'critical';
  if (signals.some((signal) => signal.level === 'watch')) return 'watch';
  if (signals.some((signal) => signal.level === 'info')) return 'info';
  return 'clear';
};

const buildSignals = (row: DashboardRow): Signal[] => {
  const signals: Signal[] = [];
  const tof = toNumber(row.tof);
  const tofDelta = toNumber(row.delta_4obs);

  const tofLevelBad =
    Boolean(row.tof_signal_eligible && gatePass(row.tof_gate)) &&
    (row.niveau_tof === 'faible' || row.niveau_tof === 'fragile');
  const tofTrendBad =
    Boolean(row.tof_signal_eligible && gatePass(row.tof_gate)) &&
    (row.trajectoire_tof === 'baisse' || row.trajectoire_tof === 'baisse_forte');
  const tofExtreme =
    Boolean(row.tof_signal_eligible && gatePass(row.tof_gate)) &&
    row.niveau_tof === 'faible' &&
    row.trajectoire_tof === 'baisse_forte';

  const liquidityBasis = row.liquidity_basis || '';
  const regimeSuppressed =
    Boolean(row.liquidity_regime_changed) ||
    row.liquidity_signal_certification === 'suppressed_regime_change_pending_data';

  if (regimeSuppressed) {
    signals.push({
      kind: 'structure',
      level: 'info',
      title: 'Changement de régime de liquidité',
      detail: 'Le signal de liquidité est neutralisé tant que les observations du nouveau régime ne sont pas comparables.',
    });
  }

  const liquidityLevel = row.niveau_liquidite;
  const liquidityTrend = row.trajectoire_liquidite;
  const liquidityEligible =
    Boolean(row.liquidity_signal_eligible && gatePass(row.liquidity_gate)) &&
    !regimeSuppressed;
  const liquidityBad =
    liquidityEligible &&
    (
      liquidityLevel === 'tension_significative' ||
      liquidityLevel === 'tension_forte' ||
      liquidityLevel === 'tension_forte_secondaire' ||
      liquidityLevel === 'tension_tres_forte' ||
      liquidityTrend === 'deterioration' ||
      liquidityTrend === 'deterioration_forte'
    );
  const liquidityExtreme = liquidityEligible && liquidityLevel === 'tension_tres_forte';

  const debt = toNumber(row.endettement);
  const debtDelta = toNumber(row.endettement_delta_last);
  const debtBad = gatePass(row.debt_gate) && debt !== null && debt >= 30;
  const debtExtreme = gatePass(row.debt_gate) && debt !== null && debt >= 40;

  const criticalContext =
    liquidityExtreme ||
    tofExtreme ||
    (liquidityBad && tofTrendBad) ||
    (debtExtreme && (tofLevelBad || liquidityBad));

  if (tofLevelBad || tofTrendBad) {
    const tofCritical =
      criticalContext &&
      (tofExtreme || (liquidityBad && tofTrendBad) || (debtExtreme && tofLevelBad));
    const parts = [
      tof !== null ? `TOF ${formatNumber(tof, ' %')}` : null,
      tofDelta !== null ? `Δ 4 observations ${tofDelta > 0 ? '+' : ''}${formatNumber(tofDelta, ' pt')}` : null,
    ].filter(Boolean);

    signals.push({
      kind: 'tof',
      level: tofCritical ? 'critical' : 'watch',
      title: tofCritical ? 'Occupation sous vigilance forte' : 'Occupation à surveiller',
      detail: parts.join(' · ') || 'Trajectoire du TOF défavorable sur données certifiées.',
    });
  }

  if (liquidityBad) {
    const isSecondary = liquidityBasis.startsWith('secondary_market_order_book');
    const metric = toNumber(isSecondary ? row.liquidity_pressure_pct : row.retrait_attente_pct);
    const liquidityCritical =
      criticalContext &&
      (liquidityExtreme || (liquidityBad && tofTrendBad) || (debtExtreme && liquidityBad));

    signals.push({
      kind: 'liquidity',
      level: liquidityCritical ? 'critical' : 'watch',
      title: isSecondary ? 'Pression sur le marché secondaire' : 'Liquidité sous surveillance',
      detail: metric === null
        ? 'Signal certifié de liquidité défavorable.'
        : `${isSecondary ? 'Pression secondaire' : 'File de retraits'} : ${formatNumber(metric, ' %', 3)}`,
    });
  }

  const price = toNumber(row.prix_souscription);
  const reconstitution = toNumber(row.prix_reconstitution);
  const comparableValuation =
    gatePass(row.reconstitution_gate) &&
    gatePass(row.market_signal_gate) &&
    !row.liquidity_regime_changed &&
    !liquidityBasis.startsWith('secondary_market_order_book');

  if (comparableValuation && price !== null && reconstitution !== null && reconstitution > 0) {
    const gap = (price / reconstitution - 1) * 100;
    if (Math.abs(gap) >= 10) {
      signals.push({
        kind: 'valuation',
        level: 'watch',
        title: 'Écart de valorisation marqué',
        detail: `Prix / valeur de reconstitution : ${gap > 0 ? '+' : ''}${formatNumber(gap, ' %')}`,
      });
    } else if (Math.abs(gap) >= 5) {
      signals.push({
        kind: 'valuation',
        level: 'info',
        title: 'Écart de valorisation à suivre',
        detail: `Prix / valeur de reconstitution : ${gap > 0 ? '+' : ''}${formatNumber(gap, ' %')}`,
      });
    }
  }

  if (debtBad && debt !== null) {
    const debtCritical = criticalContext && debtExtreme && (tofLevelBad || liquidityBad);
    signals.push({
      kind: 'debt',
      level: debtCritical ? 'critical' : 'watch',
      title: debtCritical ? 'Endettement élevé avec signal concordant' : 'Endettement à surveiller',
      detail: `${formatNumber(debt, ' %')}${debtDelta !== null ? ` · variation ${debtDelta > 0 ? '+' : ''}${formatNumber(debtDelta, ' pt')}` : ''}`,
    });
  }

  return signals;
};

const toneClasses: Record<SignalLevel, string> = {
  critical: 'border-rose-500/35 bg-rose-500/10 text-rose-200',
  watch: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
  info: 'border-sky-500/35 bg-sky-500/10 text-sky-200',
  clear: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

const toneLabels: Record<SignalLevel, string> = {
  critical: 'Vigilance forte',
  watch: 'À surveiller',
  info: 'Information',
  clear: 'Aucun signal fort',
};

const SurveillancePage: React.FC = () => {
  const [dashboardRows, setDashboardRows] = useState<DashboardRow[]>([]);
  const [indicatorRows, setIndicatorRows] = useState<IndicatorRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('priority');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!supabase) {
        if (!cancelled) setLoading(false);
        return;
      }

      const [dashboardResult, indicatorResult] = await Promise.all([
        supabase
          .from('scpi_trajectory_pilot_dashboard')
          .select(
            'scpi_slug,latest_period,tof,niveau_tof,trajectoire_tof,delta_4obs,niveau_liquidite,trajectoire_liquidite,liquidity_basis,liquidity_pressure_pct,retrait_attente_pct,liquidity_regime_changed,liquidity_signal_certification,endettement,endettement_delta_last,prix_souscription,prix_reconstitution,tof_gate,tof_signal_eligible,liquidity_gate,liquidity_signal_eligible,reconstitution_gate,debt_gate,market_signal_gate,data_gate',
          )
          .limit(100),
        supabase
          .from('scpi_indicators')
          .select('scpi_slug,nom')
          .limit(100),
      ]);

      if (cancelled) return;

      if (dashboardResult.error) {
        console.warn('[Surveillance] Dashboard indisponible.', dashboardResult.error);
      } else {
        setDashboardRows(
          ((dashboardResult.data || []) as DashboardRow[]).filter((row) => certifiedSlugSet.has(row.scpi_slug)),
        );
      }

      if (indicatorResult.error) {
        console.warn('[Surveillance] Noms SCPI indisponibles.', indicatorResult.error);
      } else {
        setIndicatorRows(
          ((indicatorResult.data || []) as IndicatorRow[]).filter((row) => certifiedSlugSet.has(row.scpi_slug)),
        );
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo<SurveillanceRow[]>(() => {
    const nameMap = new Map(indicatorRows.map((row) => [row.scpi_slug, row.nom || row.scpi_slug]));

    return dashboardRows
      .map((row) => {
        const signals = buildSignals(row);
        return {
          slug: row.scpi_slug,
          name: nameMap.get(row.scpi_slug) || row.scpi_slug,
          latestPeriod: row.latest_period,
          level: levelFromSignals(signals),
          signals,
        };
      })
      .sort((a, b) => {
        const severity = severityRank[b.level] - severityRank[a.level];
        if (severity !== 0) return severity;
        const signalCount = b.signals.length - a.signals.length;
        if (signalCount !== 0) return signalCount;
        return a.name.localeCompare(b.name, 'fr');
      });
  }, [dashboardRows, indicatorRows]);

  const counts = useMemo(() => ({
    total: rows.length,
    critical: rows.filter((row) => row.level === 'critical').length,
    watch: rows.filter((row) => row.level === 'watch').length,
    noPriority: rows.filter((row) => row.level === 'info' || row.level === 'clear').length,
  }), [rows]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr-FR');

    return rows.filter((row) => {
      if (normalizedQuery && !row.name.toLocaleLowerCase('fr-FR').includes(normalizedQuery)) return false;
      if (filter === 'all') return true;
      if (filter === 'priority') return row.level === 'critical';
      if (filter === 'watching') return row.level === 'watch';
      return row.signals.some((signal) => signal.kind === filter);
    });
  }, [filter, query, rows]);

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: 'priority', label: 'Priorité' },
    { key: 'watching', label: 'À surveiller' },
    { key: 'all', label: 'Toutes' },
    { key: 'liquidity', label: 'Liquidité' },
    { key: 'tof', label: 'TOF' },
    { key: 'valuation', label: 'Valorisation' },
    { key: 'debt', label: 'Dette' },
    { key: 'structure', label: 'Structure' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.11),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.09),transparent_28%)]">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-5xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
              <Eye className="h-4 w-4" />
              Surveillance MaximusSCPI
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Surveillance SCPI : les signaux qui méritent une attention immédiate
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-400 sm:text-base">
              Les 61 SCPI de la cohorte MaximusSCPI sont relues avec les mêmes gates de certification.
              Un signal n’est affiché que si la donnée est exploitable et comparable ; les changements de régime
              sont explicitement neutralisés lorsqu’ils cassent la continuité historique.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['SCPI surveillées', counts.total, 'text-sky-300'],
              ['Vigilances fortes', counts.critical, 'text-rose-300'],
              ['À surveiller', counts.watch, 'text-amber-300'],
              ['Sans alerte prioritaire', counts.noPriority, 'text-emerald-300'],
            ].map(([label, value, tone]) => (
              <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/65 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</div>
                <div className={`mt-1 text-3xl font-bold ${tone}`}>{loading ? '—' : value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={
                  filter === item.key
                    ? 'rounded-lg bg-rose-400 px-3 py-2 text-xs font-bold text-slate-950'
                    : 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white'
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="relative lg:ml-auto lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une SCPI"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/60"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <Activity className="h-4 w-4" />
              Lecture priorisée
            </div>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {loading ? 'Chargement des signaux…' : `${visibleRows.length} SCPI affichées`}
            </h2>
          </div>
          <a
            href="/analyses/"
            className="hidden items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200 sm:inline-flex"
          >
            Voir les trajectoires
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900/55" />
            ))}
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/55 p-8 text-center text-slate-400">
            Aucun signal ne correspond à ce filtre.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row) => (
              <article key={row.slug} className="rounded-xl border border-slate-800 bg-slate-900/55 p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`/${row.slug}/`} className="text-lg font-bold text-white hover:text-sky-300">
                        {row.name}
                      </a>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClasses[row.level]}`}>
                        {toneLabels[row.level]}
                      </span>
                      <span className="text-xs text-slate-600">{formatPeriod(row.latestPeriod)}</span>
                    </div>

                    {row.signals.length === 0 ? (
                      <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Aucun signal prioritaire certifié dans les métriques surveillées.
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2 lg:grid-cols-2">
                        {row.signals.map((signal, index) => (
                          <div
                            key={`${signal.kind}-${index}`}
                            className={`rounded-lg border px-3 py-2.5 ${toneClasses[signal.level]}`}
                          >
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
                              {signal.level === 'critical' ? (
                                <ShieldAlert className="h-4 w-4" />
                              ) : signal.level === 'watch' ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {signal.title}
                            </div>
                            <div className="mt-1 text-sm leading-5 text-slate-300">{signal.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <a
                    href={`/${row.slug}/`}
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-sky-500/40 hover:text-white"
                  >
                    Ouvrir la fiche
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/45 p-4 text-xs leading-5 text-slate-500">
          Les seuils de classement MaximusSCPI servent à prioriser la lecture et ne constituent pas une notation réglementaire ni une recommandation.
          La liquidité n’est comparée que dans un même régime certifié. Les ratios prix / valeur de reconstitution sont neutralisés lorsque le marché ou la comparabilité ne le permettent pas.
          Pour l’endettement, les seuils d’affichage de 30 % et 40 % sont des seuils internes de surveillance.
        </div>
      </section>
    </main>
  );
};

export default SurveillancePage;
