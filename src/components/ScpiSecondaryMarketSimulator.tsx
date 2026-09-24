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
    const waitingShares = parseWaitingShares(selected);
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
    if (mode === 'unknown' || currentExitPrice == null) reliabilityCap = Math.min(reliabilityCap, 64);

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
      parts > 0 && currentExitPrice != null ? parts * currentExitPrice : null;

    const missing: string[] = [];
    if (!sourceDocument) missing.push('document source identifié');
    if (!sourcePeriod && !sourceDate) missing.push('période/date de la source');
    if (mode === 'unknown') missing.push('mode de sortie actuel');
    if (mode === 'secondary_market' && currentExitPrice == null) {
      missing.push('dernier prix d’exécution ou prix net vendeur du marché secondaire');
    } else if (currentExitPrice == null) {
      missing.push('prix de sortie actuel');
    }
    if (!liquidityEvidence) missing.push('information récente sur la liquidité');
    if (!reconstitutionCheck.usable) missing.push('valeur de reconstitution cohérente et vérifiée');
    if (!realisationCheck.usable) missing.push('valeur de réalisation cohérente et vérifiée');

    return {
      mode,
      waitingShares,
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
      missing,
    };
  }, [selected, parts]);

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

              {parts > 0 && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WalletCards className="h-4 w-4" />
                    {diagnostic.mode === 'withdrawal'
                      ? 'Valeur théorique de sortie aujourd’hui'
                      : 'Valeur théorique au dernier prix d’exécution'}
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
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <ScenarioCard
                              label="Défavorable"
                              variation="-20 %"
                              price={diagnostic.currentExitPrice * 0.80}
                              amount={parts * diagnostic.currentExitPrice * 0.80}
                              tone="red"
                            />
                            <ScenarioCard
                              label="Référence"
                              variation="Prix actuel"
                              price={diagnostic.currentExitPrice}
                              amount={parts * diagnostic.currentExitPrice}
                              tone="slate"
                            />
                            <ScenarioCard
                              label="Favorable"
                              variation="+10 %"
                              price={diagnostic.currentExitPrice * 1.10}
                              amount={parts * diagnostic.currentExitPrice * 1.10}
                              tone="emerald"
                            />
                          </div>
                        )}

                        <p className="mt-3 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                          {diagnostic.mode === 'secondary_market'
                            ? 'Le prix observé reste la seule référence documentée. Les hypothèses -20 %, -40 % et -60 % servent uniquement à mesurer le risque de décote supplémentaire sur un marché secondaire dégradé ; elles ne constituent ni une estimation ni une prévision.'
                            : 'Pour une SCPI à capital variable, ces scénarios testent simplement la sensibilité à une évolution du prix de retrait. Ils ne constituent pas une prévision.'}
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
                    diagnostic.mode === 'secondary_market'
                      ? 'Marché secondaire'
                      : diagnostic.mode === 'withdrawal'
                        ? 'Demande de retrait'
                        : 'À vérifier'
                  }
                  note={
                    diagnostic.mode === 'secondary_market'
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
                  title={diagnostic.mode === 'secondary_market' ? 'Dernier prix d’exécution' : 'Prix de retrait'}
                  value={diagnostic.currentExitPrice != null ? fmtEuro(diagnostic.currentExitPrice) : 'Non disponible'}
                  note={
                    diagnostic.mode === 'secondary_market' && diagnostic.currentExitPrice == null
                      ? 'Maximus ne dispose pas encore d’un dernier prix d’exécution structuré : aucun prix de sortie n’est estimé.'
                      : 'Montant par part issu des données disponibles.'
                  }
                  source={diagnostic.sourceDocument}
                  period={diagnostic.sourcePeriod}
                  sourceUrl={sourceUrl}
                  status={diagnostic.currentExitPrice != null && diagnostic.sourceDocument ? 'verified' : diagnostic.currentExitPrice != null ? 'partial' : 'unavailable'}
                />

                <DataCard
                  title="Parts en attente"
                  value={
                    diagnostic.waitingShares != null
                      ? fmtNumber(diagnostic.waitingShares)
                      : selected.hasWaitingShares === false
                        ? 'Aucune mentionnée'
                        : selected.hasWaitingShares === true
                          ? 'Présentes'
                          : 'Non documenté'
                  }
                  note={
                    selected.hasWaitingShares === false
                      ? 'Aucune part en attente n’est mentionnée dans la source consultée. Cela ne prouve pas qu’il n’existe aucune demande aujourd’hui.'
                      : 'Le stock en attente est un indicateur de tension sur la liquidité.'
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
                      diagnostic.mode === 'secondary_market'
                        ? 'La sortie dépend du marché secondaire. Sans dernier prix d’exécution et volumes récents, Maximus ne peut pas quantifier la liquidité réelle.'
                        : diagnostic.waitingShares != null && diagnostic.waitingShares > 0
                          ? `${fmtNumber(diagnostic.waitingShares)} parts sont signalées en attente : la liquidité mérite une vigilance renforcée.`
                          : selected.hasWaitingShares === false
                            ? 'Aucune part en attente n’est mentionnée dans la source consultée. Cela ne permet pas de conclure qu’aucune demande n’existe aujourd’hui.'
                            : 'Les données disponibles ne suffisent pas à mesurer précisément la tension sur les retraits.'
                    }
                  />
                  <Insight
                    title="Prix & valorisation"
                    text={
                      diagnostic.currentExitPrice != null && diagnostic.reconstitutionCheck.usable && diagnostic.reconstitution != null
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

export default ScpiSecondaryMarketSimulator;
