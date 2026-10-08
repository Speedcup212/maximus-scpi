import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  Building2,
  Euro,
  FileText,
  Globe2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
  TrendingUp,
  WalletCards
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import { estimateAnnualizedScpiIncome } from '../../utils/clientPortfolioMath';
import { aggregatePortfolioExposure, resolveExposure, type ScpiExposure } from '../../utils/clientPortfolioExposure';
import { scpiDataExtended } from '../../data/scpiDataExtended';
import { createSlugFromName } from '../../utils/scpiSlugMapper';
import ClientScpiCard from '../components/ClientScpiCard';
import ClientPortfolioRadarTrajectory from '../components/ClientPortfolioRadarTrajectory';
import { aggregateGlobalPortfolioTrajectory } from '../../utils/clientPortfolioTrajectory';
import { buildHistoricalPortfolioTof, type HistoricalTofRow } from '../../utils/clientPortfolioHistory';
import StatusBadge from '../components/StatusBadge';
import type { Case } from '../types';
import {
  buildSurveillanceSignals,
  getSurveillanceStatus,
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
  societe_gestion: string | null;
  td_annee: number | null;
  source_period: string | null;
  updated_at: string | null;
  categorie: string | null;
  versement_loyers: string | null;
  sfdr: string | null;
  label_isr: boolean | null;
  delai_jouissance: number | string | null;
  srri: number | null;
  capitalisation: number | string | null;
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
  valuationBasis: 'withdrawal' | 'subscription' | 'purchase';
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

const EMPTY_EXPOSURE: ScpiExposure = { items: [], source: 'missing' };

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [indicators, setIndicators] = useState<ScpiIndicator[]>([]);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoricalTofRow[]>([]);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveillanceError, setSurveillanceError] = useState<string | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [managedSlug, setManagedSlug] = useState<string | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [editUnits, setEditUnits] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState('');
  const [editPurchaseDate, setEditPurchaseDate] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [units, setUnits] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const todayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  const futurePositions = positions.filter(position => position.purchase_date && position.purchase_date > todayIso);
  const futureDatedPositions = futurePositions.length;
  const firstEditableFuturePosition = futurePositions.find(position => position.source === 'external');

  const loadDashboard = useCallback(async () => {
    if (!supabase || !user) return;

    setLoading(true);
    setError(null);
    setSurveillanceError(null);
    setHistoryUnavailable(false);

    const [positionsResult, indicatorsResult, casesResult] = await Promise.all([
      supabase
        .from('client_scpi_positions')
        .select('id,user_id,scpi_slug,units,purchase_price_per_unit,purchase_date,source,created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('scpi_indicators')
        .select('scpi_slug,nom,societe_gestion,td_annee,source_period,updated_at,categorie,versement_loyers,sfdr,label_isr,delai_jouissance,srri,capitalisation,td,tof,prix_souscription,prix_retrait,prix_reconstitution,prime_decote,endettement,distribution_par_part,repartition_sectorielle,repartition_geographique,secteur_principal,geographie_principale,qa_status')
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

    if (loadedPositions.length === 0) {
      setHistoryRows([]);
      setTrajectories([]);
      setLoading(false);
      return;
    }

    // Historique public strictement filtré par RLS (bulletins sourcés, QA forte).
    // Limité aux SCPI réellement détenues : jamais de données d'un autre client.
    const slugs = [...new Set(loadedPositions.map(position => position.scpi_slug))];
    const [surveillanceResult, historyResult] = await Promise.all([
      supabase.functions.invoke('client-surveillance', { body: {} }),
      supabase.from('scpi_indicator_history')
        .select('scpi_slug,source_period,tof,qa_status,source_url,snapshot_at')
        .in('scpi_slug', slugs)
        .order('source_period', { ascending: true })
        .limit(600),
    ]);
    const { data: surveillancePayload, error: surveillanceInvokeError } = surveillanceResult;
    if (historyResult.error) {
      setHistoryRows([]);
      setHistoryUnavailable(true);
    } else {
      setHistoryRows((historyResult.data ?? []) as HistoricalTofRow[]);
    }

    if (surveillanceInvokeError || surveillancePayload?.error) {
      setTrajectories([]);
      setSurveillanceError(
        surveillancePayload?.error ||
          'La surveillance Maximus est momentanément indisponible. Le portefeuille reste accessible.'
      );
    } else {
      setTrajectories((surveillancePayload?.data ?? []) as Trajectory[]);
    }

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
      const withdrawal = numberValue(indicator?.prix_retrait);
      const subscription = numberValue(indicator?.prix_souscription);
      const valuationBasis = withdrawal !== null ? 'withdrawal' : subscription !== null ? 'subscription' : 'purchase';
      const currentUnitValue = withdrawal ?? subscription ?? purchaseUnitPrice;
      const td = numberValue(indicator?.td);

      const existing = grouped.get(position.scpi_slug);
      if (existing) {
        existing.units += positionUnits;
        existing.invested += invested;
        existing.positionIds.push(position.id);
        existing.averagePurchasePrice =
          existing.units > 0 ? existing.invested / existing.units : 0;
        existing.currentValue = existing.units * currentUnitValue;
        existing.annualIncome = estimateAnnualizedScpiIncome(
          existing.units,
          numberValue(indicator?.prix_souscription),
          td,
        );
        existing.yieldOnCost =
          existing.annualIncome !== null && existing.invested > 0
            ? existing.annualIncome / existing.invested * 100
            : null;
        existing.source = existing.source === position.source ? existing.source : 'mixed';
        continue;
      }

      const currentValue = positionUnits * currentUnitValue;
      const annualIncome = estimateAnnualizedScpiIncome(
        positionUnits,
        numberValue(indicator?.prix_souscription),
        td,
      );

      grouped.set(position.scpi_slug, {
        slug: position.scpi_slug,
        name: indicator?.nom || position.scpi_slug,
        positionIds: [position.id],
        units: positionUnits,
        invested,
        averagePurchasePrice: purchaseUnitPrice,
        currentUnitValue,
        currentValue,
        valuationBasis,
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
      monthlyIncome: incomeHoldings.length === holdings.length && holdings.length > 0
        ? annualIncome / 12
        : null,
      yieldOnCost:
        incomeHoldings.length === holdings.length && holdings.length > 0 && invested > 0
          ? annualIncome / invested * 100
          : null,
      delta: invested > 0 ? currentValue - invested : null,
      incomeCoverage: incomeHoldings.length
    };
  }, [holdings]);

  // Les fiches détaillées publiques disposent déjà de répartitions structurées.
  // Aucune catégorie principale n'est artificiellement transformée en 100 %.
  const catalogBySlug = useMemo(
    () => new Map(scpiDataExtended.map(item => [createSlugFromName(item.name), item])),
    []
  );
  const holdingExposures = useMemo(() => {
    const result = new Map<string, {
      sector: ReturnType<typeof resolveExposure>;
      geography: ReturnType<typeof resolveExposure>;
    }>();
    for (const holding of holdings) {
      const catalog = catalogBySlug.get(holding.slug);
      result.set(holding.slug, {
        sector: resolveExposure(holding.indicator?.repartition_sectorielle, catalog?.sectors, 'sector'),
        geography: resolveExposure(holding.indicator?.repartition_geographique, catalog?.geography, 'geography'),
      });
    }
    return result;
  }, [holdings, catalogBySlug]);

  const sectorBreakdown = useMemo(
    () => aggregatePortfolioExposure(holdings.map(holding => ({
      currentValue: holding.currentValue,
      // Sources structurées en priorité, fiches historiques en repli.
      // Les séries éditoriales ne sont pas certifiées ; l'écran le précise.
      exposure: holdingExposures.get(holding.slug)?.sector || EMPTY_EXPOSURE,
    }))),
    [holdings, holdingExposures],
  );

  const geoBreakdown = useMemo(
    () => aggregatePortfolioExposure(holdings.map(holding => ({
      currentValue: holding.currentValue,
      exposure: holdingExposures.get(holding.slug)?.geography || EMPTY_EXPOSURE,
    }))),
    [holdings, holdingExposures],
  );

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

  const globalTrajectory = useMemo(
    () => aggregateGlobalPortfolioTrajectory(holdings.map(holding => ({
      slug: holding.slug,
      name: holding.name,
      currentValue: holding.currentValue,
      trajectory: holding.trajectory,
    })), Boolean(surveillanceError)),
    [holdings, surveillanceError]
  );

  const historicalTof = useMemo(
    () => buildHistoricalPortfolioTof(
      historyRows,
      holdings.map(holding => ({ slug: holding.slug, currentValue: holding.currentValue })),
    ),
    [historyRows, holdings]
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
      setError('Veuillez renseigner une SCPI, un nombre de parts et un prix d’achat valides.');
      return;
    }

    if (purchaseDate && purchaseDate > todayIso) {
      setError('La date d’achat ne peut pas être dans le futur pour une position déjà détenue.');
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

  const startEditPosition = (position: Position) => {
    setEditingPositionId(position.id);
    setEditUnits(String(position.units ?? ''));
    setEditPurchasePrice(String(position.purchase_price_per_unit ?? ''));
    setEditPurchaseDate(position.purchase_date || '');
    setError(null);
  };

  const cancelEditPosition = () => {
    setEditingPositionId(null);
    setEditUnits('');
    setEditPurchasePrice('');
    setEditPurchaseDate('');
  };

  const handleUpdatePosition = async (position: Position) => {
    if (!supabase || !user || position.source !== 'external') return;

    const parsedUnits = Number(editUnits.replace(',', '.'));
    const parsedPrice = Number(editPurchasePrice.replace(',', '.'));

    if (
      !Number.isFinite(parsedUnits) ||
      parsedUnits <= 0 ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      setError('Veuillez renseigner un nombre de parts et un prix d’achat valides.');
      return;
    }

    if (editPurchaseDate && editPurchaseDate > todayIso) {
      setError('La date d’achat ne peut pas être dans le futur pour une position déjà détenue.');
      return;
    }

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('client_scpi_positions')
      .update({
        units: parsedUnits,
        purchase_price_per_unit: parsedPrice,
        purchase_date: editPurchaseDate || null
      })
      .eq('id', position.id)
      .eq('user_id', user.id)
      .eq('source', 'external');

    if (updateError) {
      setError(`Modification impossible : ${updateError.message}`);
      setSaving(false);
      return;
    }

    cancelEditPosition();
    setSaving(false);
    await loadDashboard();
  };

  const handleDeletePosition = async (position: Position) => {
    if (!supabase || !user || position.source !== 'external') return;

    const indicator = indicatorMap.get(position.scpi_slug);
    const name = indicator?.nom || position.scpi_slug;
    const confirmed = window.confirm(`Supprimer cette ligne ${name} ajoutée manuellement ?`);
    if (!confirmed) return;

    setError(null);
    const { error: deleteError } = await supabase
      .from('client_scpi_positions')
      .delete()
      .eq('id', position.id)
      .eq('user_id', user.id)
      .eq('source', 'external');

    if (deleteError) {
      setError(`Suppression impossible : ${deleteError.message}`);
      return;
    }

    if (editingPositionId === position.id) cancelEditPosition();
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
      <div className="space-y-5">
        <section className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Suivi SCPI
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white lg:text-3xl">
                {surveillanceError ? 'Surveillance temporairement indisponible' : 'Votre portefeuille, surveillé dans le temps.'}
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

        {surveillanceError && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            {surveillanceError} Aucun indicateur de surveillance ne doit être interprété comme rassurant tant que le service est hors ligne.
          </div>
        )}
        {futureDatedPositions > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {futureDatedPositions} position(s) comportent une date d’achat future.
              {firstEditableFuturePosition
                ? ' Vérifiez et corrigez la date de la position concernée.'
                : ' Cette donnée synchronisée doit être corrigée à la source.'}
            </p>
            {firstEditableFuturePosition && (
              <button
                type="button"
                onClick={() => {
                  setManagedSlug(firstEditableFuturePosition.scpi_slug);
                  setExpandedSlug(firstEditableFuturePosition.scpi_slug);
                  startEditPosition(firstEditableFuturePosition);
                  requestAnimationFrame(() => document.getElementById('holding-' + firstEditableFuturePosition.scpi_slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                }}
                className="shrink-0 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-400/10"
              >
                Corriger la date
              </button>
            )}
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
                  max={todayIso}
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
            label="Revenus théoriques annualisés"
            value={totals.incomeCoverage > 0 ? formatCurrency(totals.annualIncome) : '—'}
            detail={`${totals.incomeCoverage}/${holdings.length} SCPI avec TD exploitable (année publiée)`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Rendement indicatif sur coût"
            value={formatPercent(totals.yieldOnCost)}
            detail={totals.incomeCoverage === holdings.length ? 'Annualisation au TD publié / capital investi' : 'Non calculable : données partielles'}
          />
          <MetricCard
            icon={BellRing}
            label="Équivalent mensuel indicatif"
            value={formatCurrency(totals.monthlyIncome)}
            detail="Projection, non revenus réellement perçus"
          />
        </section>

        <p className="px-1 text-sm leading-6 text-slate-400">
          Les revenus affichés sont des <strong className="text-slate-200">projections brutes au dernier TD annuel publié</strong>,
          hors date de jouissance et fiscalité. Aucun historique de distributions réellement encaissées
          n’est connecté à votre espace. Le montant mensuel n'est pas un calendrier de paiement.
        </p>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-slate-400">
            Chargement du portefeuille…
          </div>
        ) : holdings.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
            <WalletCards className="mx-auto h-8 w-8 text-emerald-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Votre portefeuille est vide</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
              Ajoutez vos SCPI détenues ailleurs pour obtenir une vue consolidée et les signaux de surveillance disponibles.
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
            <section aria-label="Alertes du portefeuille" className="grid gap-4">
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
                {surveillanceError ? '—' : alerts.length}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {surveillanceError ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
                  Surveillance indisponible : aucun bilan des alertes n’est possible actuellement.
                </div>
              ) : alerts.length === 0 && globalTrajectory.unverifiedPercent > 0.01 ? (
                <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-4 text-sm text-slate-300">
                  Aucun signal détecté sur les positions certifiées. Certaines SCPI restent hors du périmètre de surveillance.
                </div>
              ) : alerts.length === 0 ? (
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
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">Composition de votre portefeuille</h3>
                  <p className="mt-1 text-xs text-slate-400">Poids calculé sur les valeurs de retrait indicatives. Ce n’est pas une allocation recommandée.</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{holdings.length} SCPI détenues</span>
              </div>
              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-800" role="img" aria-label="Poids des SCPI détenues">
                {holdings.map((holding, index) => (
                  <div key={holding.slug}
                    title={holding.name + ' · ' + formatPercent(totals.currentValue > 0 ? holding.currentValue / totals.currentValue * 100 : 0)}
                    style={{
                      width: (totals.currentValue > 0 ? holding.currentValue / totals.currentValue * 100 : 0) + '%',
                      backgroundColor: ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#fb7185', '#38bdf8'][index % 6]
                    }}
                  />
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {holdings.map((holding, index) => (
                  <div key={holding.slug} className="flex min-w-0 items-center gap-3 text-xs text-slate-300">
                    <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#fb7185', '#38bdf8'][index % 6] }} />
                    <span className="min-w-0 flex-1 truncate">{holding.name}</span>
                    <span className="font-semibold tabular-nums text-white">{formatPercent(totals.currentValue > 0 ? holding.currentValue / totals.currentValue * 100 : 0)}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Répartitions du portefeuille</h3>
              <p className="text-sm leading-5 text-slate-400">Secteurs et pays, pondérés par les valeurs indicatives de vos SCPI. Les sources et limites de fiabilité sont indiquées sous les graphiques.</p>
            </div>
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:p-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-base font-semibold text-white">Répartition sectorielle du portefeuille</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {sectorBreakdown.catalogPercent > 0 && (
                    <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100">
                      Estimation historique non certifiée sur {formatPercent(sectorBreakdown.catalogPercent, 0)} de la valeur du portefeuille.
                    </p>
                  )}
                  {sectorBreakdown.entries.length === 0 ? (
                    <p className="text-sm text-slate-500">Répartition détaillée non documentée.</p>
                  ) : (
                    sectorBreakdown.entries.slice(0, 5).map(({ label, value }) => (
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
                  <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-slate-400">
                    Répartition affichée sur {formatPercent(sectorBreakdown.coveredPercent, 0)} du portefeuille.
                    {' '}Source structurée : {formatPercent(sectorBreakdown.structuredPercent, 0)} ;
                    {' '}fiches historiques : {formatPercent(sectorBreakdown.catalogPercent, 0)}.
                    {sectorBreakdown.missingPercent > 0 ? ' Non documenté : ' + formatPercent(sectorBreakdown.missingPercent, 0) + '.' : ''}
                    {' '}Répartition indicative pondérée par les valeurs affichées. Les fiches historiques ne sont pas certifiées et leurs périodes restent à vérifier ; les catégories des sociétés de gestion peuvent se recouper.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:p-6">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-emerald-300" />
                  <h3 className="text-base font-semibold text-white">Répartition géographique du portefeuille</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {geoBreakdown.catalogPercent > 0 && (
                    <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100">
                      Estimation historique non certifiée sur {formatPercent(geoBreakdown.catalogPercent, 0)} de la valeur du portefeuille.
                    </p>
                  )}
                  {geoBreakdown.entries.length === 0 ? (
                    <p className="text-sm text-slate-500">Répartition détaillée non documentée.</p>
                  ) : (
                    geoBreakdown.entries.slice(0, 5).map(({ label, value }) => (
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
                  <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-slate-400">
                    Répartition affichée sur {formatPercent(geoBreakdown.coveredPercent, 0)} du portefeuille.
                    {' '}Source structurée : {formatPercent(geoBreakdown.structuredPercent, 0)} ;
                    {' '}fiches historiques : {formatPercent(geoBreakdown.catalogPercent, 0)}.
                    {geoBreakdown.missingPercent > 0 ? ' Non documenté : ' + formatPercent(geoBreakdown.missingPercent, 0) + '.' : ''}
                    {' '}Répartition indicative pondérée par les valeurs affichées. Les données historiques du catalogue sont non certifiées et leurs périodes restent à vérifier.
                  </p>
                </div>
              </div>
            </section>


            <ClientPortfolioRadarTrajectory
              summary={globalTrajectory}
              surveillanceUnavailable={Boolean(surveillanceError)}
              history={historicalTof}
              historyUnavailable={historyUnavailable}
              onSelectHolding={setExpandedSlug}
            />

            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-2 px-1 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-lg font-semibold text-white">Mes SCPI — analyses détaillées</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Résumé des positions. Dépliez une SCPI pour consulter ses indicateurs, expositions et signaux propres.
                  </p>
                </div>
                <span className="text-[11px] text-slate-500">Les achats d’une même SCPI sont consolidés.</span>
              </div>
              {holdings.map(holding => {
                const radar = getRadarLevel(holding.trajectory);
                const exposure = holdingExposures.get(holding.slug);
                return (
                  <ClientScpiCard
                    key={holding.slug}
                    holding={holding}
                    sector={exposure?.sector || EMPTY_EXPOSURE}
                    geography={exposure?.geography || EMPTY_EXPOSURE}
                    company={holding.indicator?.societe_gestion || catalogBySlug.get(holding.slug)?.managementCompany}
                    alerts={holding.trajectory ? buildSurveillanceSignals(holding.trajectory) : []}
                    radarLabel={radarPresentation[radar].label}
                    radarClass={radarPresentation[radar].className}
                    surveillanceUnavailable={Boolean(surveillanceError)}
                    manageExpanded={managedSlug === holding.slug}
                    expanded={expandedSlug === holding.slug || managedSlug === holding.slug}
                    onToggleExpanded={() => setExpandedSlug(current => current === holding.slug ? null : holding.slug)}
                    onManage={() => {
                      setExpandedSlug(holding.slug);
                      setManagedSlug(current => current === holding.slug ? null : holding.slug);
                      cancelEditPosition();
                    }}
                  >
                    <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Positions ajoutées manuellement
                          </div>
                          <div className="space-y-3">
                            {positions
                              .filter(position => position.scpi_slug === holding.slug && position.source === 'external')
                              .map(position => (
                                <div
                                  key={position.id}
                                  className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
                                >
                                  {editingPositionId === position.id ? (
                                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                                      <label className="text-xs text-slate-400">
                                        Parts
                                        <input
                                          value={editUnits}
                                          onChange={event => setEditUnits(event.target.value)}
                                          inputMode="decimal"
                                          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                                        />
                                      </label>
                                      <label className="text-xs text-slate-400">
                                        Prix d’achat / part
                                        <input
                                          value={editPurchasePrice}
                                          onChange={event => setEditPurchasePrice(event.target.value)}
                                          inputMode="decimal"
                                          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                                        />
                                      </label>
                                      <label className="text-xs text-slate-400">
                                        Date d’achat
                                        <input
                                          type="date"
                                          max={todayIso}
                                          value={editPurchaseDate}
                                          onChange={event => setEditPurchaseDate(event.target.value)}
                                          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                                        />
                                      </label>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          disabled={saving}
                                          onClick={() => void handleUpdatePosition(position)}
                                          className="rounded-lg bg-emerald-400 p-2 text-slate-950 disabled:opacity-50"
                                          title="Enregistrer"
                                        >
                                          <Save className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditPosition}
                                          className="rounded-lg border border-white/10 p-2 text-slate-300"
                                          title="Annuler"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="text-xs text-slate-300">
                                        <span className="font-medium text-white">
                                          {numberValue(position.units)?.toLocaleString('fr-FR', { maximumFractionDigits: 6 }) ?? '—'} parts
                                        </span>
                                        {' · '}
                                        {formatCurrency(numberValue(position.purchase_price_per_unit), 2)} / part
                                        {' · '}
                                        {position.purchase_date
                                          ? new Date(position.purchase_date).toLocaleDateString('fr-FR')
                                          : 'date non renseignée'}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => startEditPosition(position)}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                          Modifier
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => void handleDeletePosition(position)}
                                          className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10"
                                          title="Supprimer cette position"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                  </ClientScpiCard>
                );
              })}
            </section>



          </>
        )}

        <section aria-label="Dossier client" className="grid gap-4">
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
              La valeur affichée est indicative : Maximus utilise en priorité la valeur de retrait publiée lorsqu’elle est disponible, puis le prix de souscription à défaut. Elle ne garantit pas le prix ni le délai de cession. Les revenus sont des annualisations indicatives calculées avec le taux de distribution publié et le prix de souscription de référence, sans garantie de maintien du taux, de jouissance immédiate ni de versements mensuels. En l’absence de taux exploitable, les revenus ne sont pas calculés. Les performances passées ne préjugent pas des performances futures ; les parts de SCPI présentent notamment un risque de perte en capital et de liquidité.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default ClientDashboard;
