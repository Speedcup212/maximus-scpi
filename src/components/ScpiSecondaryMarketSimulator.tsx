import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Info,
  Search,
  ShieldCheck,
  TrendingDown,
  WalletCards,
} from 'lucide-react';
import { scpiData } from '../data/scpiData';
import { createSlugFromName } from '../utils/scpiSlugMapper';
import { supabase } from '../lib/supabase';
import type { Scpi } from '../types/scpi';

type SourceRegistry = {
  official_url: string;
  news_url: string;
  documents_url: string;
  status: string;
  last_checked_at: string | null;
  last_success_at: string | null;
};

type ExitMode = 'withdrawal' | 'secondary_market' | 'unknown';
type CapitalType = 'fixed' | 'variable' | 'variable_suspended' | 'unknown';
type LifecycleStatus = 'normal' | 'dissolution_proposed' | 'liquidation';
type DataStatus = 'verified' | 'partial' | 'unavailable';

const fmtEuro = (value?: number | null, digits = 2) => {
  if (value == null || !Number.isFinite(value)) return 'Non disponible';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

const fmtNumber = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return 'Non disponible';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
};

const fmtPct = (value?: number | null, digits = 1) => {
  if (value == null || !Number.isFinite(value)) return 'Non disponible';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value) + ' %';
};

const fmtDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const fmtHoldingPeriod = (value?: string | null) => {
  if (!value) return null;
  const start = new Date(value);
  const end = new Date();
  if (Number.isNaN(start.getTime()) || start > end) return null;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) return `${Math.max(months, 0)} mois`;
  if (months === 0) return `${years} an${years > 1 ? 's' : ''}`;
  return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
};

const cleanNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const classifyExitMode = (scpi: Scpi): ExitMode => {
  const note = `${scpi.liquidite || ''} ${(scpi as any).strategy || ''}`.toLowerCase();

  if (/pas de marché secondaire/.test(note)) {
    return scpi.valeurRetrait != null ? 'withdrawal' : 'unknown';
  }

  if (
    /variabilit[eé].*suspendue/.test(note) ||
    /capital fixe/.test(note) ||
    /[eé]changes d[eé]sormais.*march[eé] secondaire/.test(note) ||
    /ouverture d['’]un march[eé] secondaire/.test(note) ||
    /march[eé] secondaire mensuel/.test(note) ||
    /march[eé] des parts suspendu/.test(note)
  ) {
    return 'secondary_market';
  }

  if (scpi.valeurRetrait != null) return 'withdrawal';
  return 'unknown';
};

const classifyCapitalType = (scpi: Scpi): { type: CapitalType; explicit: boolean } => {
  const note = `${scpi.liquidite || ''} ${(scpi as any).strategy || ''}`.toLowerCase();

  // Ne jamais assimiler automatiquement marché secondaire et capital fixe :
  // une SCPI à capital variable peut suspendre sa variabilité.
  if (/variabilit[eé].*suspendue|suspension de la variabilit[eé]/.test(note)) {
    return { type: 'variable_suspended', explicit: true };
  }

  if (/capital fixe/.test(note)) {
    return { type: 'fixed', explicit: true };
  }

  // Un prix de retrait documenté correspond au mécanisme usuel d'une SCPI à capital variable.
  // En l'absence de mention explicite, on l'affiche avec un statut de donnée partielle.
  if (cleanNumber(scpi.valeurRetrait) != null) {
    return { type: 'variable', explicit: false };
  }

  return { type: 'unknown', explicit: false };
};

const parseWaitingShares = (scpi: Scpi): number | null => {
  if (scpi.partsAttenteRetrait != null && Number.isFinite(scpi.partsAttenteRetrait)) {
    return scpi.partsAttenteRetrait;
  }
  const note = scpi.liquidite || '';
  const match = note.match(/([0-9][0-9\s\u00a0.]{1,})\s+parts?\s+en attente/i);
  if (!match) return null;
  const parsed = Number(match[1].replace(/[\s\u00a0.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};


const classifyLifecycleStatus = (scpi: Scpi): LifecycleStatus => {
  if (scpi.maximusLifecycleStatus) return scpi.maximusLifecycleStatus;

  const note = [
    scpi.maximusLifecycleNote,
    ...(scpi.maximusWarnings || []),
    scpi.actualitesTrimestrielles,
    scpi.liquidite,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    /soci[eé]t[eé] en liquidation/.test(note) ||
    /liquidation en cours/.test(note) ||
    /dissolution.{0,40}(adopt[eé]e|d[eé]cid[eé]e|approuv[eé]e)/.test(note) ||
    /liquidateur.{0,30}(nomm[eé]|d[eé]sign[eé])/.test(note)
  ) {
    return 'liquidation';
  }

  if (
    /dissolution anticip[eé]e.{0,60}(propos[eé]e|soumise|assembl[eé]e|age)/.test(note) ||
    /projet de dissolution/.test(note)
  ) {
    return 'dissolution_proposed';
  }

  return 'normal';
};

const parseWaitingShareRatio = (scpi: Scpi, waitingShares: number | null): number | null => {
  if (
    waitingShares != null &&
    scpi.nbPartsTotal != null &&
    Number.isFinite(scpi.nbPartsTotal) &&
    scpi.nbPartsTotal > 0
  ) {
    return (waitingShares / scpi.nbPartsTotal) * 100;
  }

  const note = scpi.liquidite || '';
  const explicit = note.match(/(?:soit|environ|≈)?\s*(\d{1,2}(?:[.,]\d+)?)\s*%/i);
  if (!explicit) return null;
  const parsed = Number(explicit[1].replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const liquidityAssessment = (
  ratio: number | null,
  waitingShares: number | null,
  hasWaitingShares?: boolean
) => {
  if (ratio != null && ratio >= 10) return { label: 'Tension élevée', tone: 'red' as const };
  if (ratio != null && ratio >= 5) return { label: 'Tension significative', tone: 'amber' as const };
  if (waitingShares != null && waitingShares > 0) return { label: 'Retraits en attente', tone: 'amber' as const };
  if (hasWaitingShares === false) return { label: 'Aucune file signalée', tone: 'emerald' as const };
  return { label: 'À documenter', tone: 'slate' as const };
};

const isDebtUsable = (value?: number) =>
  value != null && Number.isFinite(value) && value >= 0 && value <= 100;

const valuationStatus = (value: number | undefined, price: number, kind: 'reconstitution' | 'realisation') => {
  if (value == null || !Number.isFinite(value) || value <= 0 || price <= 0) {
    return { usable: false, warning: false };
  }
  const ratio = value / price;
  const min = kind === 'reconstitution' ? 0.6 : 0.45;
  const max = kind === 'reconstitution' ? 1.6 : 1.8;
  return {
    usable: ratio >= min && ratio <= max,
    warning: ratio < min || ratio > max,
  };
};

const ScpiSecondaryMarketSimulator: React.FC = () => {
  const sortedScpis = useMemo(
    () => [...scpiData].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    []
  );

  const [selectedName, setSelectedName] = useState('');
  const [parts, setParts] = useState(0);
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionPrice, setAcquisitionPrice] = useState(0);
  const [sourceRegistry, setSourceRegistry] = useState<SourceRegistry | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);

  const selected = useMemo(
    () => sortedScpis.find((item) => item.name === selectedName) || null,
    [sortedScpis, selectedName]
  );

  useEffect(() => {
    let cancelled = false;

    const loadSource = async () => {
      setSourceRegistry(null);
      if (!selected || !supabase) return;

      setSourceLoading(true);
      const slug = createSlugFromName(selected.name);

      let { data } = await supabase
        .from('scpi_news_sources')
        .select('official_url,news_url,documents_url,status,last_checked_at,last_success_at')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) {
        const fallback = await supabase
          .from('scpi_news_sources')
          .select('official_url,news_url,documents_url,status,last_checked_at,last_success_at')
          .ilike('name', selected.name)
          .maybeSingle();
        data = fallback.data;
      }

      if (!cancelled) {
        setSourceRegistry((data as SourceRegistry | null) || null);
        setSourceLoading(false);
      }
    };

    loadSource();
    return () => {
      cancelled = true;
    };
  }, [selected?.name]);

  const diagnostic = useMemo(() => {
    if (!selected) return null;

    const mode = classifyExitMode(selected);
    const capital = classifyCapitalType(selected);
    const lifecycle = classifyLifecycleStatus(selected);
    const waitingShares = parseWaitingShares(selected);
    const waitingShareRatio = parseWaitingShareRatio(selected, waitingShares);
    const liquidity = liquidityAssessment(waitingShareRatio, waitingShares, selected.hasWaitingShares);
    const withdrawalPrice = cleanNumber(selected.valeurRetrait);
    const currentExitPrice = mode === 'withdrawal' ? withdrawalPrice : null;

    const reconstitution = cleanNumber(selected.valeurReconstitution);
    const realisation = cleanNumber(selected.valeurRealisation);
    const reconstitutionCheck = valuationStatus(reconstitution ?? undefined, selected.price, 'reconstitution');
    const realisationCheck = valuationStatus(realisation ?? undefined, selected.price, 'realisation');

    const debt = isDebtUsable(selected.debt) ? selected.debt! : null;
    const sourceDocument = selected.maximusSourceDocument || null;
    const sourcePeriod = selected.maximusSourcePeriode || selected.periodeBulletinTrimestriel || null;
    const sourceDate = selected.dateBulletin || selected.maximusUpdateDate || null;
    const liquidityEvidence =
      waitingShares != null ||
      selected.hasWaitingShares != null ||
      Boolean(selected.liquidite);

    const checks = [
      { key: 'source', ok: Boolean(sourceDocument), weight: 20 },
      { key: 'period', ok: Boolean(sourcePeriod || sourceDate), weight: 10 },
      { key: 'mode', ok: mode !== 'unknown', weight: 20 },
      { key: 'exitPrice', ok: currentExitPrice != null && currentExitPrice > 0, weight: 25 },
      { key: 'liquidity', ok: liquidityEvidence, weight: 10 },
      { key: 'valuation', ok: reconstitutionCheck.usable && realisationCheck.usable, weight: 10 },
      { key: 'fundamentals', ok: selected.tof > 0 && debt != null && selected.yield > 0, weight: 5 },
    ];

    const rawReliabilityScore = checks.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
    const criticalAvailable = checks.filter((item) => item.ok).length;

    // Une donnée critique absente doit empêcher une note de confiance artificiellement élevée.
    let reliabilityCap = 100;
    if (!realisationCheck.usable || !reconstitutionCheck.usable) reliabilityCap = Math.min(reliabilityCap, 82);
    if (!liquidityEvidence) reliabilityCap = Math.min(reliabilityCap, 74);
    if (!sourceDocument || (!sourcePeriod && !sourceDate)) reliabilityCap = Math.min(reliabilityCap, 74);
    if (mode === 'unknown' || (currentExitPrice == null && lifecycle === 'normal')) reliabilityCap = Math.min(reliabilityCap, 64);
    if (lifecycle === 'dissolution_proposed') reliabilityCap = Math.min(reliabilityCap, 84);

    const reliabilityScore = Math.min(rawReliabilityScore, reliabilityCap);
    const reliability =
      reliabilityScore >= 85
        ? { label: 'Élevée', tone: 'emerald' as const }
        : reliabilityScore >= 65
          ? { label: 'Correcte', tone: 'blue' as const }
          : reliabilityScore >= 45
            ? { label: 'Partielle', tone: 'amber' as const }
            : { label: 'Insuffisante', tone: 'red' as const };

    const estimatedGross =
      lifecycle === 'normal' && parts > 0 && currentExitPrice != null ? parts * currentExitPrice : null;

    const acquisitionAmount =
      parts > 0 && acquisitionPrice > 0 ? parts * acquisitionPrice : null;
    const capitalDifference =
      estimatedGross != null && acquisitionAmount != null ? estimatedGross - acquisitionAmount : null;
    const capitalDifferencePct =
      currentExitPrice != null && acquisitionPrice > 0
        ? ((currentExitPrice / acquisitionPrice) - 1) * 100
        : null;
    const holdingPeriod = fmtHoldingPeriod(acquisitionDate);

    const missing: string[] = [];
    if (!sourceDocument) missing.push('document source identifié');
    if (!sourcePeriod && !sourceDate) missing.push('période/date de la source');
    if (mode === 'unknown') missing.push('mode de sortie actuel');
    if (lifecycle === 'normal') {
      if (mode === 'secondary_market' && currentExitPrice == null) {
        missing.push('dernier prix d’exécution ou prix net vendeur du marché secondaire');
      } else if (currentExitPrice == null) {
        missing.push('prix de sortie actuel');
      }
    }
    if (!liquidityEvidence) missing.push('information récente sur la liquidité');
    if (!reconstitutionCheck.usable) missing.push('valeur de reconstitution cohérente et vérifiée');
    if (!realisationCheck.usable) missing.push('valeur de réalisation cohérente et vérifiée');

    return {
      mode,
      capitalType: capital.type,
      capitalTypeExplicit: capital.explicit,
      lifecycle,
      lifecycleNote: selected.maximusLifecycleNote || null,
      lifecycleSource: selected.maximusLifecycleSource || null,
      waitingShares,
      waitingShareRatio,
      liquidity,
      currentExitPrice,
      reconstitution,
      realisation,
      reconstitutionCheck,
      realisationCheck,
      debt,
      sourceDocument,
      sourcePeriod,
      sourceDate,
      reliabilityScore,
      rawReliabilityScore,
      reliability,
      criticalAvailable,
      criticalTotal: checks.length,
      estimatedGross,
      acquisitionAmount,
      capitalDifference,
      capitalDifferencePct,
      holdingPeriod,
      missing,
    };
  }, [selected, parts, acquisitionDate, acquisitionPrice]);

  const sourceUrl =
    sourceRegistry?.documents_url ||
    sourceRegistry?.news_url ||
    sourceRegistry?.official_url ||
    null;

  const reliabilityClass = diagnostic?.reliability.tone === 'emerald'
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    : diagnostic?.reliability.tone === 'blue'
      ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
      : diagnostic?.reliability.tone === 'amber'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-red-500/40 bg-red-500/10 text-red-300';

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Outil MaximusSCPI
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Diagnostic de revente SCPI</h1>
          <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Sélectionnez votre SCPI. Maximus analyse son mode de sortie, sa liquidité, les valeurs patrimoniales et les données officielles réellement disponibles.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[0.72fr_1.28fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-start gap-3">
              <Search className="mt-1 h-5 w-5 text-emerald-500" />
              <div>
                <h2 className="text-xl font-bold">Votre SCPI</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Le diagnostic utilise uniquement les données présentes dans MaximusSCPI.
                </p>
              </div>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold">Quelle SCPI détenez-vous ?</span>
              <select
                value={selectedName}
                onChange={(e) => {
                  setSelectedName(e.target.value);
                  setParts(0);
                  setAcquisitionDate('');
                  setAcquisitionPrice(0);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Sélectionner une SCPI…</option>
                {sortedScpis.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-semibold">Nombre de parts détenues</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Facultatif
                </span>
              </div>
              <input
                type="number"
                min={0}
                step={1}
                value={parts || ''}
                placeholder="Ex. 200"
                onChange={(e) => {
                  const value = e.currentTarget.valueAsNumber;
                  setParts(Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <span className="mt-1.5 block text-xs text-gray-500 dark:text-gray-400">
                Sert uniquement à calculer un montant total lorsqu’un prix de sortie fiable est disponible.
              </span>
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold">Date d’acquisition</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Facultatif
                  </span>
                </div>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold">Prix réellement payé par part</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    Facultatif
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={acquisitionPrice || ''}
                    placeholder="Ex. 203,00"
                    onChange={(e) => {
                      const value = e.currentTarget.valueAsNumber;
                      setAcquisitionPrice(Number.isFinite(value) && value > 0 ? value : 0);
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">€</span>
                </div>
              </label>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Le prix payé dépend de la date d’acquisition. Maximus ne reconstitue pas un prix historique sans source fiable : utilisez le prix figurant sur votre bulletin de souscription ou relevé.
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Maximus ne transforme jamais une ancienne valeur de retrait en prix de marché. Si une donnée critique manque, le diagnostic le signale.
                </p>
              </div>
            </div>
          </section>

          {!selected || !diagnostic ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-xl font-bold">Résultat du diagnostic</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Sélectionnez une SCPI pour afficher les données officielles disponibles, leur source et le niveau de fiabilité du diagnostic.
              </p>
            </section>
          ) : (
            <section className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Diagnostic de revente</p>
                    <h2 className="mt-1 text-2xl font-bold">{selected.name}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selected.company}</p>
                  </div>
                  <div className={`rounded-xl border px-4 py-3 ${reliabilityClass}`}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Fiabilité</div>
                    <div className="mt-0.5 text-lg font-bold">{diagnostic.reliability.label} · {diagnostic.reliabilityScore}/100</div>
                    <div className="mt-0.5 text-[11px] opacity-80">
                      {diagnostic.criticalAvailable}/{diagnostic.criticalTotal} contrôles disponibles
                    </div>
                    {diagnostic.missing.length > 0 && (
                      <div className="mt-1 text-[10px] font-medium opacity-90">
                        {diagnostic.missing.length} donnée{diagnostic.missing.length > 1 ? 's' : ''} importante{diagnostic.missing.length > 1 ? 's' : ''} à compléter
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {diagnostic.lifecycle !== 'normal' && (
                <div className={`rounded-2xl border p-6 ${
                  diagnostic.lifecycle === 'liquidation'
                    ? 'border-red-500/40 bg-red-500/10'
                    : 'border-amber-500/40 bg-amber-500/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 h-6 w-6 shrink-0 ${
                      diagnostic.lifecycle === 'liquidation' ? 'text-red-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <h3 className="text-lg font-bold">
                        {diagnostic.lifecycle === 'liquidation'
                          ? 'SCPI en liquidation — la revente classique n’est plus le bon référentiel'
                          : 'Dissolution proposée — résultat officiel à confirmer'}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {diagnostic.lifecycleNote ||
                          (diagnostic.lifecycle === 'liquidation'
                            ? 'Le montant récupéré dépendra de la réalisation des actifs, du remboursement des dettes et charges, puis du solde distribué aux associés.'
                            : 'Une dissolution anticipée est soumise aux associés. Tant que le résultat officiel n’est pas publié, Maximus n’anticipe pas l’issue du vote.')}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Le prix de retrait et les scénarios de revente ne constituent pas une estimation du boni de liquidation.
                      </p>
                      {diagnostic.lifecycleSource && (
                        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                          Source du statut : {diagnostic.lifecycleSource}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {parts > 0 && diagnostic.lifecycle !== 'normal' && (
                <div className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WalletCards className="h-4 w-4" />
                    Repère patrimonial — pas un montant récupérable
                  </div>
                  {diagnostic.realisation != null ? (
                    <>
                      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {fmtEuro(parts * diagnostic.realisation, 0)}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {fmtNumber(parts)} parts × valeur de réalisation {fmtEuro(diagnostic.realisation)} / part
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                        Cette valeur est un repère patrimonial. Elle ne préjuge ni du prix de cession effectif des actifs, ni des dettes, frais, fiscalité ou délais de liquidation.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      Aucune valeur patrimoniale suffisamment exploitable n’est disponible pour fournir un repère.
                    </p>
                  )}
                </div>
              )}

              {parts > 0 && diagnostic.lifecycle === 'normal' && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WalletCards className="h-4 w-4" />
                    {diagnostic.mode === 'withdrawal'
                      ? 'Montant théorique au prix de retrait actuel'
                      : 'Montant théorique au dernier prix d’exécution'}
                  </div>

                  {diagnostic.estimatedGross != null && diagnostic.currentExitPrice != null ? (
                    <>
                      <p className="mt-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {fmtEuro(diagnostic.estimatedGross, 0)}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {fmtNumber(parts)} parts × {fmtEuro(diagnostic.currentExitPrice)} / part
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Montant théorique brut, hors fiscalité et éventuels frais, sous réserve d’exécution effective.
                      </p>
                      {(diagnostic.liquidity.tone === 'red' || diagnostic.liquidity.tone === 'amber') && diagnostic.mode === 'withdrawal' && (
                        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {diagnostic.liquidity.label}
                          {diagnostic.waitingShareRatio != null ? ` · ${fmtPct(diagnostic.waitingShareRatio)} des parts en attente` : ''}
                          {' — le montant affiché n’est pas nécessairement récupérable immédiatement.'}
                        </div>
                      )}

                      {(diagnostic.acquisitionAmount != null || diagnostic.holdingPeriod) && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-sm font-bold">Depuis votre acquisition</h3>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Montant investi</div>
                              <div className="mt-1 text-lg font-bold">
                                {diagnostic.acquisitionAmount != null ? fmtEuro(diagnostic.acquisitionAmount, 0) : 'Prix à renseigner'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Écart en capital</div>
                              <div className={`mt-1 text-lg font-bold ${
                                diagnostic.capitalDifference == null
                                  ? ''
                                  : diagnostic.capitalDifference >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                              }`}>
                                {diagnostic.capitalDifference != null && diagnostic.capitalDifferencePct != null
                                  ? `${diagnostic.capitalDifference >= 0 ? '+' : ''}${fmtEuro(diagnostic.capitalDifference, 0)} · ${diagnostic.capitalDifferencePct >= 0 ? '+' : ''}${fmtPct(diagnostic.capitalDifferencePct)}`
                                  : 'Prix à renseigner'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Durée de détention</div>
                              <div className="mt-1 text-lg font-bold">{diagnostic.holdingPeriod || 'Date à renseigner'}</div>
                            </div>
                          </div>
                          <p className="mt-3 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                            Écart sur le capital uniquement : les distributions reçues, la fiscalité et les éventuels frais ne sont pas intégrés. Ce chiffre n’est donc pas une performance totale.
                          </p>
                        </div>
                      )}

                      <div className="mt-5 border-t border-emerald-500/20 pt-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Scénarios de sensibilité</h3>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            Hypothèses pédagogiques — pas des prévisions
                          </span>
                        </div>

                        {diagnostic.mode === 'secondary_market' ? (
                          <>
                            <div className="mt-3 rounded-xl border border-slate-500/30 bg-slate-500/5 p-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Référence observée</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Prix documenté</span>
                              </div>
                              <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{fmtEuro(parts * diagnostic.currentExitPrice, 0)}</div>
                              <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{fmtEuro(diagnostic.currentExitPrice)} / part</div>
                            </div>

                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                              <ScenarioCard
                                label="Marché tendu"
                                variation="-20 %"
                                price={diagnostic.currentExitPrice * 0.80}
                                amount={parts * diagnostic.currentExitPrice * 0.80}
                                tone="amber"
                              />
                              <ScenarioCard
                                label="Stress fort"
                                variation="-40 %"
                                price={diagnostic.currentExitPrice * 0.60}
                                amount={parts * diagnostic.currentExitPrice * 0.60}
                                tone="red"
                              />
                              <ScenarioCard
                                label="Stress extrême"
                                variation="-60 %"
                                price={diagnostic.currentExitPrice * 0.40}
                                amount={parts * diagnostic.currentExitPrice * 0.40}
                                tone="red"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-3 rounded-xl border border-slate-500/30 bg-slate-500/5 p-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Référence actuelle</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Prix de retrait</span>
                              </div>
                              <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{fmtEuro(parts * diagnostic.currentExitPrice, 0)}</div>
                              <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{fmtEuro(diagnostic.currentExitPrice)} / part</div>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                              <ScenarioCard
                                label="Baisse modérée"
                                variation="-10 %"
                                price={diagnostic.currentExitPrice * 0.90}
                                amount={parts * diagnostic.currentExitPrice * 0.90}
                                tone="amber"
                              />
                              <ScenarioCard
                                label="Baisse marquée"
                                variation="-20 %"
                                price={diagnostic.currentExitPrice * 0.80}
                                amount={parts * diagnostic.currentExitPrice * 0.80}
                                tone="red"
                              />
                              <ScenarioCard
                                label="Stress"
                                variation="-30 %"
                                price={diagnostic.currentExitPrice * 0.70}
                                amount={parts * diagnostic.currentExitPrice * 0.70}
                                tone="red"
                              />
                            </div>
                          </>
                        )}

                        <p className="mt-3 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                          {diagnostic.mode === 'secondary_market'
                            ? 'Le prix observé reste la seule référence documentée. Les hypothèses -20 %, -40 % et -60 % servent uniquement à mesurer le risque de décote supplémentaire sur un marché secondaire dégradé ; elles ne constituent ni une estimation ni une prévision.'
                            : 'Pour une SCPI à capital variable, le prix de retrait actuel reste la référence réglementaire publiée. Les hypothèses -10 %, -20 % et -30 % mesurent uniquement une sensibilité à la baisse ; elles ne constituent pas une prévision.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xl font-bold text-amber-600 dark:text-amber-300">Impossible à estimer sérieusement</p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Le dernier prix d’exécution / prix net vendeur n’est pas disponible dans les données structurées MaximusSCPI.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <DataCard
                  title="Mode de sortie actuel"
                  value={
                    diagnostic.lifecycle === 'liquidation'
                      ? 'Liquidation de la SCPI'
                      : diagnostic.lifecycle === 'dissolution_proposed'
                        ? 'Dissolution proposée'
                        : diagnostic.mode === 'secondary_market'
                          ? 'Marché secondaire'
                          : diagnostic.mode === 'withdrawal'
                            ? 'Demande de retrait'
                            : 'À vérifier'
                  }
                  note={
                    diagnostic.lifecycle === 'liquidation'
                      ? 'La récupération du capital dépend désormais des opérations de liquidation, et non d’un prix de retrait.'
                      : diagnostic.lifecycle === 'dissolution_proposed'
                        ? 'Une AGE a été appelée à statuer sur la dissolution. Le résultat officiel doit être confirmé.'
                        : diagnostic.mode === 'secondary_market'
                          ? 'La vente dépend du carnet d’ordres et d’un prix d’exécution.'
                          : diagnostic.mode === 'withdrawal'
                            ? 'L’exécution dépend notamment des souscriptions disponibles.'
                            : 'Le mode de sortie n’est pas suffisamment documenté.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.mode !== 'unknown' && diagnostic.sourceDocument ? 'verified' : diagnostic.mode !== 'unknown' ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Structure du capital"
                  value={
                    diagnostic.capitalType === 'fixed'
                      ? 'Capital fixe'
                      : diagnostic.capitalType === 'variable_suspended'
                        ? 'Capital variable — variabilité suspendue'
                        : diagnostic.capitalType === 'variable'
                          ? 'Capital variable'
                          : 'À vérifier'
                  }
                  note={
                    diagnostic.capitalType === 'fixed'
                      ? 'La sortie s’effectue normalement par cession sur le marché secondaire.'
                      : diagnostic.capitalType === 'variable_suspended'
                        ? 'La SCPI reste juridiquement à capital variable, mais la variabilité est suspendue : la sortie passe alors par confrontation des ordres.'
                        : diagnostic.capitalType === 'variable'
                          ? 'Le retrait s’effectue normalement via le registre des demandes de retrait, sous réserve de liquidité.'
                          : 'La structure du capital n’est pas suffisamment documentée dans les données Maximus.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={
                    diagnostic.capitalType === 'unknown'
                      ? 'unavailable'
                      : diagnostic.capitalTypeExplicit && diagnostic.sourceDocument
                        ? 'verified'
                        : 'partial'
                  }
                />

                <DataCard
                  title={
                    diagnostic.lifecycle !== 'normal'
                      ? 'Prix de retrait — repère uniquement'
                      : diagnostic.mode === 'secondary_market'
                        ? 'Dernier prix d’exécution'
                        : 'Prix de retrait'
                  }
                  value={diagnostic.currentExitPrice != null ? fmtEuro(diagnostic.currentExitPrice) : 'Non disponible'}
                  note={
                    diagnostic.lifecycle !== 'normal'
                      ? 'Ce prix ne permet pas d’estimer le montant qui serait distribué dans le cadre d’une liquidation.'
                      : diagnostic.mode === 'secondary_market' && diagnostic.currentExitPrice == null
                        ? 'Maximus ne dispose pas encore d’un dernier prix d’exécution structuré : aucun prix de sortie n’est estimé.'
                        : 'Montant par part issu des données disponibles.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.currentExitPrice != null && diagnostic.sourceDocument ? 'verified' : diagnostic.currentExitPrice != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Tension de liquidité"
                  value={diagnostic.liquidity.label}
                  note={
                    diagnostic.waitingShares != null
                      ? `${fmtNumber(diagnostic.waitingShares)} parts en attente${diagnostic.waitingShareRatio != null ? ` · ${fmtPct(diagnostic.waitingShareRatio)} des parts` : ''}. Plus la file est importante, plus le délai et l’incertitude de sortie augmentent.`
                      : selected.hasWaitingShares === false
                        ? 'Aucune part en attente n’est mentionnée dans la source consultée. Cela ne prouve pas qu’aucune demande n’existe aujourd’hui.'
                        : 'Le niveau de tension sur les retraits n’est pas suffisamment documenté.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.waitingShares != null ? 'verified' : selected.hasWaitingShares != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Valeur de réalisation"
                  value={fmtEuro(diagnostic.realisation)}
                  note={
                    diagnostic.realisationCheck.warning
                      ? 'Valeur disponible mais contrôle de cohérence nécessaire avant de l’utiliser dans une conclusion.'
                      : 'Repère patrimonial, distinct d’un prix de marché.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.realisationCheck.usable && diagnostic.sourceDocument ? 'verified' : diagnostic.realisation != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Valeur de reconstitution"
                  value={fmtEuro(diagnostic.reconstitution)}
                  note={
                    diagnostic.reconstitutionCheck.warning
                      ? 'Valeur disponible mais contrôle de cohérence nécessaire avant de l’utiliser dans une conclusion.'
                      : 'Repère patrimonial, distinct du prix réellement exécutable.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.reconstitutionCheck.usable && diagnostic.sourceDocument ? 'verified' : diagnostic.reconstitution != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="TOF / Endettement"
                  value={`${fmtPct(selected.tof)} · ${diagnostic.debt != null ? fmtPct(diagnostic.debt) : 'Dette à vérifier'}`}
                  note={
                    diagnostic.debt == null
                      ? 'La donnée d’endettement présente dans la base est absente ou incohérente.'
                      : 'Ces indicateurs renseignent sur l’exploitation et la structure financière, pas sur la liquidité des parts.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={selected.tof > 0 && diagnostic.debt != null && diagnostic.sourceDocument ? 'verified' : selected.tof > 0 || diagnostic.debt != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Distribution"
                  value={`${fmtPct(selected.yield, 2)}${selected.distribution != null ? ` · ${fmtEuro(selected.distribution)}/part` : ''}`}
                  note="Distribution historique : elle peut évoluer et n’est pas garantie."
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={selected.yield > 0 && diagnostic.sourceDocument ? 'verified' : selected.yield > 0 ? 'partial' : 'unavailable'}
                />
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <h3 className="text-xl font-bold">Analyse Maximus</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Insight
                    title="Liquidité"
                    text={
                      diagnostic.lifecycle === 'liquidation'
                        ? 'La liquidité des parts n’est plus le sujet principal : le calendrier dépend désormais de la cession des actifs et des opérations de liquidation.'
                        : diagnostic.lifecycle === 'dissolution_proposed'
                          ? 'La dissolution proposée peut rendre le mécanisme de retrait secondaire par rapport au calendrier de liquidation si elle est adoptée.'
                          : diagnostic.mode === 'secondary_market'
                            ? 'La sortie dépend du marché secondaire. Sans dernier prix d’exécution et volumes récents, Maximus ne peut pas quantifier la liquidité réelle.'
                            : diagnostic.waitingShares != null && diagnostic.waitingShares > 0
                              ? `${diagnostic.liquidity.label} : ${fmtNumber(diagnostic.waitingShares)} parts sont signalées en attente${diagnostic.waitingShareRatio != null ? `, soit ${fmtPct(diagnostic.waitingShareRatio)} des parts` : ''}.`
                              : selected.hasWaitingShares === false
                                ? 'Aucune part en attente n’est mentionnée dans la source consultée. Cela ne permet pas de conclure qu’aucune demande n’existe aujourd’hui.'
                                : 'Les données disponibles ne suffisent pas à mesurer précisément la tension sur les retraits.'
                    }
                  />
                  <Insight
                    title="Prix & valorisation"
                    text={
                      diagnostic.lifecycle !== 'normal'
                        ? 'En cas de liquidation, la valeur de réalisation est un repère patrimonial plus pertinent que le prix de retrait, mais elle ne garantit pas le montant final distribué.'
                        : diagnostic.currentExitPrice != null && diagnostic.reconstitutionCheck.usable && diagnostic.reconstitution != null
                          ? `Le prix de sortie documenté représente ${fmtPct(((diagnostic.currentExitPrice / diagnostic.reconstitution) - 1) * 100)} par rapport à la valeur de reconstitution.`
                          : 'Sans prix de sortie actuel fiable et valeurs patrimoniales cohérentes, Maximus n’affiche pas de décote de marché calculée.'
                    }
                  />
                  <Insight
                    title="Patrimoine & dette"
                    text={
                      diagnostic.debt != null
                        ? `TOF ${fmtPct(selected.tof)} et endettement ${fmtPct(diagnostic.debt)}. Ces données doivent être lues avec les expertises immobilières et les échéances de financement.`
                        : `TOF ${fmtPct(selected.tof)}. L’endettement doit être vérifié avant toute conclusion sur la solidité financière.`
                    }
                  />
                  <Insight
                    title="Revenus"
                    text={
                      `Taux de distribution historique ${fmtPct(selected.yield, 2)}. Il ne permet pas, à lui seul, de décider de vendre ou conserver.`
                    }
                  />
                </div>
              </div>

              {(diagnostic.sourceDocument || sourceRegistry) && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-bold">Source & veille</h3>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    {diagnostic.sourceDocument && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Document utilisé : </span>
                        <span className="font-semibold">{diagnostic.sourceDocument}</span>
                      </div>
                    )}
                    {(diagnostic.sourcePeriod || diagnostic.sourceDate) && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Période / date : </span>
                        <span className="font-semibold">
                          {[diagnostic.sourcePeriod, fmtDate(diagnostic.sourceDate)].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}
                    {diagnostic.lifecycleSource && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Source du statut exceptionnel : </span>
                        <span className="font-semibold">{diagnostic.lifecycleSource}</span>
                      </div>
                    )}
                    {sourceRegistry && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Veille du site officiel : </span>
                        <span className="font-semibold">
                          {sourceRegistry.status === 'active' ? 'active' : sourceRegistry.status}
                          {sourceRegistry.last_checked_at ? ` · contrôlé le ${fmtDate(sourceRegistry.last_checked_at)}` : ''}
                        </span>
                      </div>
                    )}
                    {sourceLoading && <div className="text-gray-500">Vérification de la source officielle…</div>}
                  </div>

                  {selected.liquidite && (
                    <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Information de liquidité issue de la source</div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{selected.liquidite}</p>
                    </div>
                  )}

                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      Consulter la source officielle surveillée <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              {diagnostic.missing.length > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Ce qu’il manque pour fiabiliser davantage le diagnostic</h3>
                      <ul className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                        {diagnostic.missing.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/articles/revendre-parts-scpi-delais-marche-secondaire/"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-100"
                >
                  Comprendre la revente
                </a>
                <a
                  href="/comparateur-scpi/"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400"
                >
                  Comparer cette SCPI <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
};

const DataCard: React.FC<{
  title: string;
  value: string;
  note: string;
  source?: string | null;
  period?: string | null;
  sourceUrl?: string | null;
  status?: DataStatus;
}> = ({ title, value, note, source, period, sourceUrl, status = 'partial' }) => {
  const statusConfig = status === 'verified'
    ? {
        label: 'Vérifiée',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
        border: 'border-gray-200 dark:border-gray-800',
      }
    : status === 'unavailable'
      ? {
          label: 'Non disponible',
          icon: <Info className="h-3.5 w-3.5" />,
          badge: 'border-slate-400/30 bg-slate-500/10 text-slate-500 dark:text-slate-300',
          border: 'border-slate-300 dark:border-slate-700',
        }
      : {
          label: 'Partielle',
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          badge: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
          border: 'border-amber-300 dark:border-amber-900/60',
        };

  const sourceLabel = period || (source ? 'document officiel' : null);

  return (
    <div className={`rounded-2xl border bg-white p-5 dark:bg-gray-950 ${statusConfig.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusConfig.badge}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
      <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{note}</p>
      {sourceLabel && (
        <div className="mt-3 border-t border-gray-100 pt-2 text-[10px] leading-relaxed text-gray-400 dark:border-gray-800 dark:text-gray-500">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              title={source || undefined}
            >
              Source : {sourceLabel} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span title={source || undefined}>Source : {sourceLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};


const ScenarioCard: React.FC<{
  label: string;
  variation: string;
  price: number;
  amount: number;
  tone: 'red' | 'amber' | 'slate' | 'emerald';
}> = ({ label, variation, price, amount, tone }) => {
  const toneClass = tone === 'red'
    ? 'border-red-500/30 bg-red-500/5'
    : tone === 'amber'
      ? 'border-amber-500/30 bg-amber-500/5'
      : tone === 'emerald'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-slate-500/30 bg-slate-500/5';

  const labelClass = tone === 'red'
    ? 'text-red-600 dark:text-red-300'
    : tone === 'amber'
      ? 'text-amber-600 dark:text-amber-300'
      : tone === 'emerald'
        ? 'text-emerald-600 dark:text-emerald-300'
        : 'text-slate-600 dark:text-slate-300';

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-bold ${labelClass}`}>{label}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">{variation}</span>
      </div>
      <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{fmtEuro(amount, 0)}</div>
      <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{fmtEuro(price)} / part</div>
    </div>
  );
};

const Insight: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-emerald-500" />
      <p className="font-semibold">{title}</p>
    </div>
    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>
  </div>
);

// Netlify redeploy marker
export default ScpiSecondaryMarketSimulator;
