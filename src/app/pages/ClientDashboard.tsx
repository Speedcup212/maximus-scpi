import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  Building2,
  Euro,
  FileText,
  Gauge,
  Globe2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TrendingUp,
  WalletCards
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import type { Case } from '../types';
import {
  buildSurveillanceSignals,
  getSurveillanceStatus,
  SURVEILLANCE_DASHBOARD_SELECT,
  type SurveillanceDashboardRow,
} from '../../utils/surveillanceSignals';

type ClientDashboardProps = {
  onNavigate: (path: string) => void;
};

type Position = {
  id: string;
  user_id: string;
  scpi_slug: string;
  units: number | string;
  purchase_price_per_unit: number | string;
  purchase_date: string | null;
  source: 'maximus' | 'external';
  created_at: string;
};

type Breakdown = Record<string, number> | null;

type ScpiIndicator = {
  scpi_slug: string;
  nom: string | null;
  td: number | string | null;
  tof: number | string | null;
  prix_souscription: number | string | null;
  prix_retrait: number | string | null;
  prix_reconstitution: number | string | null;
  prime_decote: number | string | null;
  endettement: number | string | null;
  distribution_par_part: number | string | null;
  repartition_sectorielle: Breakdown;
  repartition_geographique: Breakdown;
  secteur_principal: string | null;
  geographie_principale: string | null;
  qa_status: string | null;
};

type Trajectory = SurveillanceDashboardRow;

type PortfolioHolding = {
  slug: string;
  name: string;
  positionIds: string[];
  units: number;
  invested: number;
  averagePurchasePrice: number;
  currentUnitValue: number;
  currentValue: number;
  annualIncome: number | null;
  yieldOnCost: number | null;
  indicator?: ScpiIndicator;
  trajectory?: Trajectory;
  source: 'maximus' | 'external' | 'mixed';
};

type RadarLevel = 'stable' | 'info' | 'watch' | 'critical' | 'pending';

type PortfolioAlert = {
  slug: string;
  name: string;
  level: 'info' | 'watch' | 'critical';
  message: string;
};

const numberValue = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value: number | null | undefined, maximumFractionDigits = 0) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits
  }).format(value);
};

const formatPercent = (value: number | null | undefined, digits = 1) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })} %`;
};

const prettifySignal = (value: string | null | undefined) => {
  if (!value) return 'Donnée en cours de certification';
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const getRadarLevel = (trajectory?: Trajectory): RadarLevel => {
  const status = getSurveillanceStatus(trajectory);
  return status === 'clear' ? 'stable' : status;
};

const radarPresentation: Record<RadarLevel, { label: string; className: string }> = {
  stable: {
    label: 'Stable',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
  },
  info: {
    label: 'Information',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-200'
  },
  watch: {
    label: 'À surveiller',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-200'
  },
  critical: {
    label: 'Vigilance forte',
    className: 'border-red-500/30 bg-red-500/10 text-red-200'
  },
  pending: {
    label: 'Certification en cours',
    className: 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  }
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [indicators, setIndicators] = useState<ScpiIndicator[]>([]);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [units, setUnits] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!supabase || !user) return;

    setLoading(true);
    setError(null);

    const [positionsResult, indicatorsResult, casesResult] = await Promise.all([
      supabase
        .from('client_scpi_positions')
        .select('id,user_id,scpi_slug,units,purchase_price_per_unit,purchase_date,source,created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('scpi_indicators')
        .select('scpi_slug,nom,td,tof,prix_souscription,prix_retrait,prix_reconstitution,prime_decote,endettement,distribution_par_part,repartition_sectorielle,repartition_geographique,secteur_principal,geographie_principale,qa_status')
        .order('nom', { ascending: true }),
      supabase.from('cases').select('*').order('updated_at', { ascending: false }).limit(3)
    ]);

    if (positionsResult.error) {
      setError(`Impossible de charger le portefeuille : ${positionsResult.error.message}`);
      setLoading(false);
      return;
    }

    if (indicatorsResult.error) {
      setError(`Impossible de charger les données SCPI : ${indicatorsResult.error.message}`);
      setLoading(false);
      return;
    }

    const loadedPositions = (positionsResult.data ?? []) as Position[];
    setPositions(loadedPositions);
    setIndicators((indicatorsResult.data ?? []) as ScpiIndicator[]);
    if (!casesResult.error) setCases((casesResult.data ?? []) as Case[]);

    const slugs = Array.from(new Set(loadedPositions.map(position => position.scpi_slug)));
    if (slugs.length === 0) {
      setTrajectories([]);
      setLoading(false);
      return;
    }

    const trajectoryResult = await supabase
      .from('scpi_trajectory_pilot_dashboard')
      .select(SURVEILLANCE_DASHBOARD_SELECT)
      .in('scpi_slug', slugs);

    setTrajectories(
      trajectoryResult.error ? [] : ((trajectoryResult.data ?? []) as Trajectory[])
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const indicatorMap = useMemo(
    () => new Map(indicators.map(indicator => [indicator.scpi_slug, indicator])),
    [indicators]
  );

  const trajectoryMap = useMemo(
    () => new Map(trajectories.map(trajectory => [trajectory.scpi_slug, trajectory])),
    [trajectories]
  );

  const holdings = useMemo<PortfolioHolding[]>(() => {
    const grouped = new Map<string, PortfolioHolding>();

    for (const position of positions) {
      const positionUnits = numberValue(position.units) ?? 0;
      const purchaseUnitPrice = numberValue(position.purchase_price_per_unit) ?? 0;
      const invested = positionUnits * purchaseUnitPrice;
      const indicator = indicatorMap.get(position.scpi_slug);
      const trajectory = trajectoryMap.get(position.scpi_slug);
      const currentUnitValue =
        numberValue(indicator?.prix_retrait) ??
        numberValue(indicator?.prix_souscription) ??
        purchaseUnitPrice;
      const distributionPerPart = numberValue(indicator?.distribution_par_part);
      const td = numberValue(indicator?.td);

      const existing = grouped.get(position.scpi_slug);
      if (existing) {
        existing.units += positionUnits;
        existing.invested += invested;
        existing.positionIds.push(position.id);
        existing.averagePurchasePrice =
          existing.units > 0 ? existing.invested / existing.units : 0;
        existing.currentValue = existing.units * currentUnitValue;
        existing.annualIncome =
          distributionPerPart !== null
            ? existing.units * distributionPerPart
            : td !== null
              ? existing.currentValue * td / 100
              : null;
        existing.yieldOnCost =
          existing.annualIncome !== null && existing.invested > 0
            ? existing.annualIncome / existing.invested * 100
            : null;
        existing.source = existing.source === position.source ? existing.source : 'mixed';
        continue;
      }

      const currentValue = positionUnits * currentUnitValue;
      const annualIncome =
        distributionPerPart !== null
          ? positionUnits * distributionPerPart
          : td !== null
            ? currentValue * td / 100
            : null;

      grouped.set(position.scpi_slug, {
        slug: position.scpi_slug,
        name: indicator?.nom || position.scpi_slug,
        positionIds: [position.id],
        units: positionUnits,
        invested,
        averagePurchasePrice: purchaseUnitPrice,
        currentUnitValue,
        currentValue,
        annualIncome,
        yieldOnCost:
          annualIncome !== null && invested > 0 ? annualIncome / invested * 100 : null,
        indicator,
        trajectory,
        source: position.source
      });
    }

    return Array.from(grouped.values()).sort((a, b) => b.currentValue - a.currentValue);
  }, [positions, indicatorMap, trajectoryMap]);

  const totals = useMemo(() => {
    const invested = holdings.reduce((sum, holding) => sum + holding.invested, 0);
    const currentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const incomeHoldings = holdings.filter(holding => holding.annualIncome !== null);
    const annualIncome = incomeHoldings.reduce(
      (sum, holding) => sum + (holding.annualIncome ?? 0),
      0
    );

    return {
      invested,
      currentValue,
      annualIncome,
      monthlyIncome: incomeHoldings.length > 0 ? annualIncome / 12 : null,
      yieldOnCost:
        incomeHoldings.length > 0 && invested > 0 ? annualIncome / invested * 100 : null,
      delta: invested > 0 ? currentValue - invested : null,
      incomeCoverage: incomeHoldings.length
    };
  }, [holdings]);

  const buildDiversification = useCallback(
    (kind: 'sector' | 'geo') => {
      const result = new Map<string, number>();
      if (totals.currentValue <= 0) return [] as Array<[string, number]>;

      for (const holding of holdings) {
        const portfolioWeight = holding.currentValue / totals.currentValue;
        const breakdown =
          kind === 'sector'
            ? holding.indicator?.repartition_sectorielle
            : holding.indicator?.repartition_geographique;
        const fallback =
          kind === 'sector'
            ? holding.indicator?.secteur_principal
            : holding.indicator?.geographie_principale;

        if (breakdown && Object.keys(breakdown).length > 0) {
          for (const [label, percentage] of Object.entries(breakdown)) {
            const numericPercentage = numberValue(percentage) ?? 0;
            result.set(label, (result.get(label) ?? 0) + portfolioWeight * numericPercentage);
          }
        } else if (fallback) {
          result.set(fallback, (result.get(fallback) ?? 0) + portfolioWeight * 100);
        }
      }

      return Array.from(result.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    },
    [holdings, totals.currentValue]
  );

  const sectorBreakdown = useMemo(() => buildDiversification('sector'), [buildDiversification]);
  const geoBreakdown = useMemo(() => buildDiversification('geo'), [buildDiversification]);

  const alerts = useMemo<PortfolioAlert[]>(() => {
    const nextAlerts: PortfolioAlert[] = [];

    for (const holding of holdings) {
      if (!holding.trajectory) continue;

      const signals = buildSurveillanceSignals(holding.trajectory);
      for (const signal of signals) {
        nextAlerts.push({
          slug: holding.slug,
          name: holding.name,
          level: signal.level,
          message: `${signal.title} · ${signal.detail}`
        });
      }
    }

    return nextAlerts;
  }, [holdings]);

  const radarCounts = useMemo(
    () =>
      holdings.reduce(
        (acc, holding) => {
          acc[getRadarLevel(holding.trajectory)] += 1;
          return acc;
        },
        { stable: 0, info: 0, watch: 0, critical: 0, pending: 0 } as Record<RadarLevel, number>
      ),
    [holdings]
  );

  const selectedIndicator = selectedSlug ? indicatorMap.get(selectedSlug) : undefined;

  useEffect(() => {
    if (!selectedIndicator || purchasePrice) return;
    const currentSubscriptionPrice = numberValue(selectedIndicator.prix_souscription);
    if (currentSubscriptionPrice !== null) {
      setPurchasePrice(String(currentSubscriptionPrice));
    }
  }, [selectedIndicator, purchasePrice]);

  const resetForm = () => {
    setSelectedSlug('');
    setUnits('');
    setPurchasePrice('');
    setPurchaseDate('');
  };

  const handleAddPosition = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !user) return;

    const parsedUnits = Number(units.replace(',', '.'));
    const parsedPrice = Number(purchasePrice.replace(',', '.'));

    if (
      !selectedSlug ||
      !Number.isFinite(parsedUnits) ||
      parsedUnits <= 0 ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      setError('Renseigne une SCPI, un nombre de parts et un prix d’achat valides.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from('client_scpi_positions').insert({
      user_id: user.id,
      scpi_slug: selectedSlug,
      units: parsedUnits,
      purchase_price_per_unit: parsedPrice,
      purchase_date: purchaseDate || null,
      source: 'external'
    });

    if (insertError) {
      setError(`La position n’a pas été enregistrée : ${insertError.message}`);
      setSaving(false);
      return;
    }

    resetForm();
    setShowAddPosition(false);
    setSaving(false);
    await loadDashboard();
  };

  const handleDeleteHolding = async (holding: PortfolioHolding) => {
    if (!supabase || !user) return;

    const confirmed = window.confirm(`Supprimer ${holding.name} de ton portefeuille Maximus ?`);
    if (!confirmed) return;

    setError(null);
    const { error: deleteError } = await supabase
      .from('client_scpi_positions')
      .delete()
      .eq('user_id', user.id)
      .in('id', holding.positionIds);

    if (deleteError) {
      setError(`Suppression impossible : ${deleteError.message}`);
      return;
    }

    await loadDashboard();
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    detail
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    detail: string;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );

  return (
    <AppLayout
      role="client"
      title="Mon portefeuille Maximus"
      onNavigate={onNavigate}
      onSignOut={signOut}
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Suivi SCPI
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
                Ton portefeuille, surveillé dans le temps.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Valorisation indicative, revenus estimés, diversification et signaux de vigilance sont recalculés à partir des données MaximusSCPI disponibles.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void loadDashboard()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button
                onClick={() => setShowAddPosition(value => !value)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              >
                <Plus className="h-4 w-4" /> Ajouter une SCPI
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {showAddPosition && (
          <section className="rounded-2xl border border-emerald-500/20 bg-slate-900/70 p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Ajouter une SCPI détenue ailleurs</h3>
              <p className="mt-1 text-sm text-slate-400">
                Les souscriptions réalisées via Maximus seront raccordées automatiquement dans une phase ultérieure. L’ajout manuel est réservé ici aux positions externes.
              </p>
            </div>
            <form onSubmit={handleAddPosition} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="text-xs text-slate-400 xl:col-span-2">
                SCPI
                <select
                  required
                  value={selectedSlug}
                  onChange={event => {
                    setSelectedSlug(event.target.value);
                    setPurchasePrice('');
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="">Sélectionner une SCPI</option>
                  {indicators.map(indicator => (
                    <option key={indicator.scpi_slug} value={indicator.scpi_slug}>
                      {indicator.nom || indicator.scpi_slug}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Nombre de parts
                <input
                  required
                  inputMode="decimal"
                  value={units}
                  onChange={event => setUnits(event.target.value)}
                  placeholder="Ex. 40"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </label>
              <label className="text-xs text-slate-400">
                Prix d’achat / part
                <input
                  required
                  inputMode="decimal"
                  value={purchasePrice}
                  onChange={event => setPurchasePrice(event.target.value)}
                  placeholder="Ex. 200"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </label>
              <label className="text-xs text-slate-400">
                Date d’achat
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={event => setPurchaseDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </label>
              <div className="flex items-end gap-3 md:col-span-2 xl:col-span-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Ajouter au portefeuille'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddPosition(false);
                  }}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={WalletCards}
            label="Capital investi"
            value={formatCurrency(totals.invested)}
            detail={`${holdings.length} SCPI suivie${holdings.length > 1 ? 's' : ''}`}
          />
          <MetricCard
            icon={Building2}
            label="Valeur indicative"
            value={formatCurrency(totals.currentValue)}
            detail={
              totals.delta === null
                ? 'Valeur de retrait ou prix publié selon disponibilité'
                : `${totals.delta >= 0 ? '+' : ''}${formatCurrency(totals.delta)} vs prix d’achat`
            }
          />
          <MetricCard
            icon={Euro}
            label="Revenus annuels"
            value={totals.incomeCoverage > 0 ? formatCurrency(totals.annualIncome) : '—'}
            detail={`${totals.incomeCoverage}/${holdings.length} SCPI avec distribution exploitable`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Rendement sur coût"
            value={formatPercent(totals.yieldOnCost)}
            detail="Revenus estimés / capital investi"
          />
          <MetricCard
            icon={BellRing}
            label="Revenus mensuels"
            value={formatCurrency(totals.monthlyIncome)}
            detail="Équivalent mensuel indicatif"
          />
        </section>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-slate-400">
            Chargement du portefeuille…
          </div>
        ) : holdings.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
            <WalletCards className="mx-auto h-8 w-8 text-emerald-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Ton portefeuille est vide</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Ajoute tes SCPI détenues ailleurs pour obtenir une vue consolidée et les signaux de surveillance disponibles.
            </p>
            <button
              onClick={() => setShowAddPosition(true)}
              className="mt-5 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Ajouter ma première SCPI
            </button>
          </section>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-emerald-300" />
                  <h3 className="font-semibold text-white">Radar portefeuille</h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Synthèse des trajectoires actuellement disponibles. Ce n’est ni une notation réglementaire ni une prévision de performance.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(['stable', 'info', 'watch', 'critical', 'pending'] as RadarLevel[]).map(level => (
                    <div
                      key={level}
                      className={`rounded-xl border p-4 ${radarPresentation[level].className}`}
                    >
                      <div className="text-2xl font-semibold">{radarCounts[level]}</div>
                      <div className="mt-1 text-xs">{radarPresentation[level].label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-300" />
                  <h3 className="font-semibold text-white">Diversification sectorielle</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {sectorBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-500">Données sectorielles insuffisantes.</p>
                  ) : (
                    sectorBreakdown.map(([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-slate-500">{formatPercent(value)}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-emerald-400"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-emerald-300" />
                  <h3 className="font-semibold text-white">Diversification géographique</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {geoBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-500">Données géographiques insuffisantes.</p>
                  ) : (
                    geoBreakdown.map(([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-slate-500">{formatPercent(value)}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-emerald-400"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex flex-col gap-2 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">Mes SCPI</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Plusieurs achats d’une même SCPI sont consolidés dans une seule ligne.
                  </p>
                </div>
                <span className="text-xs text-slate-500">Données MaximusSCPI + prix d’achat renseignés</span>
              </div>
              <div className="divide-y divide-white/10">
                {holdings.map(holding => {
                  const radar = getRadarLevel(holding.trajectory);
                  return (
                    <div key={holding.slug} className="p-5 lg:px-6">
                      <div className="grid gap-5 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))_auto] xl:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`/${holding.slug}/`}
                              className="font-semibold text-white hover:text-emerald-300"
                            >
                              {holding.name}
                            </a>
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-medium ${radarPresentation[radar].className}`}
                            >
                              {radarPresentation[radar].label}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            {holding.units.toLocaleString('fr-FR', { maximumFractionDigits: 6 })} parts ·{' '}
                            {holding.source === 'external'
                              ? 'Achetée ailleurs'
                              : holding.source === 'maximus'
                                ? 'Via Maximus'
                                : 'Origines mixtes'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Investi</div>
                          <div className="mt-1 text-sm text-slate-200">{formatCurrency(holding.invested)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Valeur</div>
                          <div className="mt-1 text-sm text-slate-200">{formatCurrency(holding.currentValue)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Revenus/an</div>
                          <div className="mt-1 text-sm text-slate-200">{formatCurrency(holding.annualIncome)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Rend. coût</div>
                          <div className="mt-1 text-sm text-slate-200">{formatPercent(holding.yieldOnCost)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">TOF</div>
                          <div className="mt-1 text-sm text-slate-200">{formatPercent(numberValue(holding.indicator?.tof))}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Trajectoire</div>
                          <div className="mt-1 max-w-40 text-xs text-slate-300">{prettifySignal(holding.trajectory?.trajectoire_tof)}</div>
                        </div>
                        <button
                          onClick={() => void handleDeleteHolding(holding)}
                          title="Supprimer du portefeuille"
                          className="rounded-lg border border-white/10 p-2 text-slate-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-300" />
                  <h3 className="font-semibold text-white">Alertes Maximus</h3>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Signaux dérivés des trajectoires publiées : TOF, liquidité et variations de prix disponibles.
                </p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                {alerts.length}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                  Aucun signal de vigilance exploitable sur les SCPI suivies à cet instant.
                </div>
              ) : (
                alerts.slice(0, 8).map((alert, index) => (
                  <div
                    key={`${alert.slug}-${index}`}
                    className={`rounded-xl border p-4 ${
                      alert.level === 'critical'
                        ? 'border-red-500/25 bg-red-500/5'
                        : alert.level === 'watch'
                          ? 'border-amber-500/25 bg-amber-500/5'
                          : 'border-sky-500/25 bg-sky-500/5'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{alert.name}</div>
                    <div
                      className={`mt-1 text-xs ${
                        alert.level === 'critical'
                          ? 'text-red-200'
                          : alert.level === 'watch'
                            ? 'text-amber-200'
                            : 'text-sky-200'
                      }`}
                    >
                      {alert.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-300" />
                <h3 className="font-semibold text-white">Mon dossier</h3>
              </div>
              <button
                onClick={() => onNavigate('/app/client/dossiers')}
                className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
              >
                Voir le dossier →
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Documents, suivi réglementaire et échanges restent séparés du portefeuille SCPI.
            </p>
            <div className="mt-5 space-y-3">
              {cases.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
                  Aucun dossier actif pour le moment.
                </div>
              ) : (
                cases.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(`/app/client/dossiers/${item.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4 text-left hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Mis à jour le {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-xs leading-5 text-slate-500">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              La valeur affichée est indicative : Maximus utilise en priorité la valeur de retrait publiée lorsqu’elle est disponible, puis le prix de souscription à défaut. Elle ne garantit pas le prix ni le délai de cession. Les revenus sont estimés à partir de la dernière distribution exploitable ou, à défaut, du taux de distribution disponible. Les performances passées ne préjugent pas des performances futures ; les parts de SCPI présentent notamment un risque de perte en capital et de liquidité.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
