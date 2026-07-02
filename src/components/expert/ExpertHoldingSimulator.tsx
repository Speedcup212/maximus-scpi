import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Calculator, TrendingUp, Building2, Euro, Percent,
  BarChart3, Shield, AlertTriangle, ChevronDown,
  Landmark, FileText, Info, ArrowRight, Table2, Receipt, Wallet,
  FileDown, Save, Clock, CheckCircle2, Search, Loader2,
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { getExpertDossiers, findOrCreateDossier, saveExpertHoldingSimulation } from '../../utils/expertDossiersSupabase';
import type { ExpertClientDossier } from '../../types/expertDossier';
import {
  HoldingISInputs, HoldingISResult,
  FeesMode, FeesTreatment, FeesVatMode, HoldingVatProfile,
  calculateHoldingISProjection, calculateCorporateTax,
} from '../../utils/holdingSimulation';
import ExpertHoldingReportPdf from './pdf/ExpertHoldingReportPdf';

/* ── Constantes ── */

const COMPANY_TYPES: HoldingISInputs['companyType'][] = ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre'];
const DURATION_OPTIONS = [3, 5, 7, 10, 12, 15];
const FEES_MODES: FeesMode[] = ['fixed', 'percentage'];
const FEES_VAT_MODES: FeesVatMode[] = ['HT', 'TTC'];
const FEES_TREATMENTS: FeesTreatment[] = ['not-integrated', 'deductible-year1', 'amortized', 'non-deductible'];

const VAT_PROFILES: { value: HoldingVatProfile; label: string; hint: string }[] = [
  { value: 'to-qualify', label: 'À qualifier', hint: 'Le droit à récupération de TVA dépend du statut fiscal réel de la holding.' },
  { value: 'animator', label: 'Holding animatrice', hint: 'TVA récupérable sous réserve d\'une activité économique taxable et de prestations effectivement facturées.' },
  { value: 'pure', label: 'Holding pure', hint: 'Récupération de TVA généralement non retenue. La TVA non récupérable augmente l\'effort économique.' },
  { value: 'mixed', label: 'Holding mixte / récupération partielle', hint: 'Taux de récupération à préciser selon le coefficient de taxation applicable.' },
];

const FEES_TREATMENT_LABELS: Record<FeesTreatment, string> = {
  'not-integrated': 'Non intégré à la simulation',
  'deductible-year1': 'Charge déductible immédiate année 1',
  'amortized': 'Intégré au coût de l\'usufruit et amorti',
  'non-deductible': 'Non déductible / prudence',
};

const FEES_TREATMENT_SHORT: Record<FeesTreatment, string> = {
  'not-integrated': 'Non intégré',
  'deductible-year1': 'Déductible année 1',
  'amortized': 'Amorti sur la durée',
  'non-deductible': 'Non déductible',
};

const DEFAULT_INPUTS: HoldingISInputs = {
  dossierName: '',
  companyType: 'SAS',
  availableCash: 250_000,
  preTaxProfit: 100_000,
  reducedRateEligible: true,
  usufruitInvestment: 100_000,
  usufruitDuration: 10,
  usufruitKeyPercent: 35,
  grossYieldRate: 6.5,
  revalorizationRate: 0,
  feesEnabled: true,
  feesMode: 'fixed',
  feesFixedAmount: 3_000,
  feesPercentage: 3,
  feesTreatment: 'deductible-year1',
  feesVatMode: 'HT',
  feesVatRate: 20,
  feesVatRecoverable: true,
  holdingVatProfile: 'to-qualify',
  vatRecoveryRate: 100,
};

type TabId = 'synthese' | 'analyse' | 'projections';

/* ── Helpers formatage ── */

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtNumber = (v: number) =>
  new Intl.NumberFormat('fr-FR').format(v);

/** Normalise un nom pour comparaison anti-doublon */
const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/* ── Composant ── */

interface ExpertHoldingSimulatorProps {
  onNavigateToDossier: (dossierId: string) => void;
}

const ExpertHoldingSimulator: React.FC<ExpertHoldingSimulatorProps> = ({ onNavigateToDossier }) => {
  const [inputs, setInputs] = useState<HoldingISInputs>({ ...DEFAULT_INPUTS });
  const [activeTab, setActiveTab] = useState<TabId>('synthese');
  const [showProjection, setShowProjection] = useState(false);
  const [showHypotheses, setShowHypotheses] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');

  /* ── Dossiers Supabase ── */
  const [dossierList, setDossierList] = useState<ExpertClientDossier[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [selectedDossierSiret, setSelectedDossierSiret] = useState<string | null>(null);
  const [dossierSearch, setDossierSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dossiersLoading, setDossiersLoading] = useState(true);
  const [dossiersError, setDossiersError] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dossierContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les dossiers au montage
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setDossiersLoading(true);
      try {
        const data = await getExpertDossiers();
        if (!cancelled) {
          setDossierList(data);
          setDossiersError('');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setDossiersError(err instanceof Error ? err.message : 'Impossible de charger les dossiers clients.');
        }
      } finally {
        if (!cancelled) setDossiersLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Reprise de simulation depuis sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('maximus_expert_resume_simulation');
      if (raw) {
        const savedInputs = JSON.parse(raw) as HoldingISInputs;
        setInputs(savedInputs);
        // Tenter de retrouver le dossier correspondant
        if (savedInputs.dossierName) {
          setDossierSearch(savedInputs.dossierName);
        }
        sessionStorage.removeItem('maximus_expert_resume_simulation');
      }
    } catch { /* ignore */ }
  }, []);

  // Quand dossierList est chargé, tenter de matcher si un nom est déjà saisi (reprise)
  useEffect(() => {
    if (dossierList.length > 0 && inputs.dossierName && !selectedDossierId) {
      const norm = normalizeName(inputs.dossierName);
      const match = dossierList.find((d) => normalizeName(d.clientName) === norm);
      if (match) {
        setSelectedDossierId(match.id);
        setDossierSearch(match.clientName);
      } else {
        setDossierSearch(inputs.dossierName || '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierList]);

  // Clic extérieur → fermer dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dossierContainerRef.current && !dossierContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ── Filtrage dossiers pour autocomplete ── */
  const filteredDossiers = useMemo(() => {
    if (!dossierSearch.trim()) return dossierList.slice(0, 8);
    const q = normalizeName(dossierSearch);
    return dossierList
      .filter((d) =>
        normalizeName(d.clientName).includes(q) ||
        (d.siret && d.siret.includes(dossierSearch.trim())) ||
        normalizeName(d.companyType).includes(q)
      )
      .slice(0, 8);
  }, [dossierList, dossierSearch]);

  // ── Synchronisation profil TVA → TVA récupérable ──
  useEffect(() => {
    if (inputs.holdingVatProfile === 'pure') {
      setInputs((prev) => prev.feesVatRecoverable ? { ...prev, feesVatRecoverable: false } : prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.holdingVatProfile]);

  /* ── Calculs ── */
  const result: HoldingISResult = useMemo(() => calculateHoldingISProjection(inputs), [inputs]);
  const isSansOperation = useMemo(() => calculateCorporateTax(inputs.preTaxProfit, {
    reducedRateEligible: inputs.reducedRateEligible,
  }), [inputs.preTaxProfit, inputs.reducedRateEligible]);

  /* ── Warnings métier ── */
  const warnings = useMemo(() => {
    const w: { id: string; message: string; severity: 'critical' | 'warning' | 'info' }[] = [];
    const tresorerieResiduelle = inputs.availableCash - result.effortEconomique;

    if (result.effortEconomique > inputs.availableCash) {
      w.push({ id: 'effort-exceeds-tresorerie', message: 'L\'effort de trésorerie dépasse la trésorerie disponible.', severity: 'critical' });
    }

    if (tresorerieResiduelle < 0) {
      w.push({ id: 'tresorerie-negative', message: `Trésorerie résiduelle négative : ${fmtEuro(tresorerieResiduelle)}.`, severity: 'critical' });
    }

    if (inputs.usufruitKeyPercent <= 0 || inputs.usufruitKeyPercent > 100) {
      w.push({ id: 'key-invalid', message: 'Clé usufruit invalide (doit être entre 1 % et 100 %).', severity: 'critical' });
    }

    if (inputs.usufruitDuration <= 0) {
      w.push({ id: 'duration-invalid', message: 'La durée d\'usufruit doit être supérieure à 0.', severity: 'critical' });
    }

    if (inputs.grossYieldRate <= 0) {
      w.push({ id: 'no-yield', message: 'Aucun revenu projeté : l\'opération repose uniquement sur l\'effet fiscal.', severity: 'warning' });
    }

    if (result.annualNetCashFlowAfterFees < 0) {
      w.push({ id: 'cashflow-negative', message: 'Cash-flow net négatif en année 1.', severity: 'warning' });
    }

    if (result.netCompanyYieldAvgAnnual < 0) {
      w.push({ id: 'yield-negative', message: 'Rendement net moyen négatif sur la durée.', severity: 'warning' });
    }

    if (inputs.feesEnabled && result.effortEconomique > 0 && (result.feesHT / inputs.usufruitInvestment) > 0.10) {
      w.push({ id: 'fees-high', message: 'Frais de mission élevés par rapport au montant investi (> 10 %).', severity: 'warning' });
    }

    if (inputs.feesEnabled && !inputs.feesVatRecoverable && result.nonRecoverableVatAmount > 0 && inputs.holdingVatProfile === 'to-qualify') {
      w.push({ id: 'vat-not-recoverable', message: 'TVA non récupérable : l\'effort de trésorerie intègre le TTC.', severity: 'info' });
    }

    if (inputs.feesEnabled && inputs.holdingVatProfile === 'pure' && result.nonRecoverableVatAmount > 0) {
      w.push({ id: 'vat-pure-non-recoverable', message: `Holding pure : TVA non récupérable de ${fmtEuro(result.nonRecoverableVatAmount)} augmente l'effort économique.`, severity: 'warning' });
    }

    if (inputs.feesEnabled && inputs.holdingVatProfile === 'mixed') {
      w.push({ id: 'vat-mixed', message: `Récupération partielle TVA : ${fmtEuro(result.recoverableVatAmount)} récupérable, ${fmtEuro(result.nonRecoverableVatAmount)} non récupérable.`, severity: 'info' });
    }

    if (inputs.feesEnabled && inputs.feesTreatment === 'non-deductible') {
      w.push({ id: 'fees-non-deductible', message: 'Les frais de mission n\'impactent pas le résultat fiscal dans cette simulation (traitement non déductible).', severity: 'info' });
    }

    // ── Contrôles de cohérence cabinet ──

    // A. Holding pure + TVA récupérable (ne devrait pas arriver avec la synchro, mais ceinture + bretelles)
    if (inputs.holdingVatProfile === 'pure' && inputs.feesVatRecoverable) {
      w.push({ id: 'vat-pure-inconsistency', message: 'Incohérence probable : une holding pure ne permet généralement pas la récupération de TVA. À valider.', severity: 'critical' });
    }

    // B. Profil TVA à qualifier + TVA récupérable cochée
    if (inputs.holdingVatProfile === 'to-qualify' && inputs.feesVatRecoverable && inputs.feesEnabled && result.feesVAT > 0) {
      w.push({ id: 'vat-to-qualify-recoverable', message: 'TVA récupérable retenue alors que le profil TVA de la holding est à qualifier.', severity: 'warning' });
    }

    // C. Frais de mission > 10 % de l'usufruit investi (already covered above by fees-high)

    // D. Cash-flow net année 1 négatif
    if (result.annualNetCashFlowAfterFees < 0) {
      w.push({ id: 'cashflow-negative-year1', message: 'Flux net année 1 négatif — opération à revoir.', severity: 'warning' });
    }

    // E. Gain net après extinction négatif
    if (result.gainNetAfterUsufructExtinction < 0) {
      w.push({ id: 'gain-negative', message: 'Gain économique négatif après extinction de l\'usufruit — opération défavorable.', severity: 'critical' });
    }

    // F. Résultat fiscal avant opération < 42 500 €
    if (inputs.reducedRateEligible && inputs.preTaxProfit < 42500 && inputs.preTaxProfit > 0) {
      w.push({ id: 'reduced-rate-available', message: 'La tranche à taux réduit peut absorber une partie du résultat additionnel selon les conditions d\'éligibilité.', severity: 'info' });
    }

    // G. Résultat fiscal avant opération ≥ 42 500 €
    if (inputs.reducedRateEligible && inputs.preTaxProfit >= 42500) {
      w.push({ id: 'reduced-rate-exhausted', message: 'La tranche d\'IS à taux réduit étant déjà consommée, le résultat additionnel est principalement imposé au taux marginal applicable.', severity: 'info' });
    }

    return w;
  }, [inputs, result.effortEconomique, result.annualNetCashFlowAfterFees, result.netCompanyYieldAvgAnnual, result.feesHT, result.feesVAT, result.gainNetAfterUsufructExtinction]);

  /* ── Avis d'expert ── */
  const expertOpinion = useMemo(() => {
    const perfLabel = result.gainNetAfterUsufructExtinction > 0 ? 'favorable' : 'défavorable';
    const vatLabel = inputs.holdingVatProfile === 'to-qualify'
      ? 'à qualifier'
      : inputs.holdingVatProfile === 'pure'
        ? 'vigilance forte'
        : 'cohérente';
    const conclusionLabel = result.gainNetAfterUsufructExtinction > 0
      ? 'favorable sous réserves'
      : 'à approfondir';

    return {
      fiscalSection: 'Mécanique fiscale cohérente : l\'amortissement de l\'usufruit réduit la base taxable des revenus SCPI.',
      performanceSection: `Performance économique ${perfLabel} : le gain net après extinction ressort à ${fmtEuro(result.gainNetAfterUsufructExtinction)} sur ${inputs.usufruitDuration} ans.`,
      vatSection: `TVA ${vatLabel} : ${inputs.holdingVatProfile === 'to-qualify' ? 'la récupération dépend du statut réel de la holding.' : inputs.holdingVatProfile === 'pure' ? 'la TVA non récupérable est intégrée à l\'effort économique.' : inputs.holdingVatProfile === 'mixed' ? `récupération partielle à ${inputs.vatRecoveryRate} %.` : 'la récupération est retenue sous réserve du statut d\'animatrice.'}`,
      conclusionSection: `Opération ${conclusionLabel} de validation du statut TVA, du traitement des frais de mission et de l'adéquation avec la trésorerie stable de la société.`,
    };
  }, [result.gainNetAfterUsufructExtinction, inputs.holdingVatProfile, inputs.usufruitDuration, inputs.vatRecoveryRate]);

  const updateInput = <K extends keyof HoldingISInputs>(key: K, value: HoldingISInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Sélection dossier ── */
  const handleSelectDossier = useCallback((dossier: ExpertClientDossier) => {
    setSelectedDossierId(dossier.id);
    setSelectedDossierSiret(dossier.siret || null);
    setDossierSearch(dossier.clientName);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    updateInput('dossierName', dossier.clientName);
    updateInput('companyType', dossier.companyType as HoldingISInputs['companyType']);
  }, [updateInput]);

  const handleDossierSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDossierSearch(val);
    setShowDropdown(true);
    setHighlightedIndex(-1);

    if (selectedDossierId) {
      // L'utilisateur a modifié manuellement → désélectionner
      const norm = normalizeName(val);
      const match = dossierList.find((d) => d.id === selectedDossierId && normalizeName(d.clientName) === norm);
      if (!match) {
        setSelectedDossierId(null);
        setSelectedDossierSiret(null);
      }
    }

    updateInput('dossierName', val || undefined);
  }, [selectedDossierId, dossierList, updateInput]);

  const handleDossierKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const max = filteredDossiers.length - 1;
        return prev >= max ? 0 : prev + 1;
      });
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const max = filteredDossiers.length - 1;
        return prev <= 0 ? max : prev - 1;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredDossiers.length > 0) {
        const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
        handleSelectDossier(filteredDossiers[idx]);
      }
      return;
    }
  }, [showDropdown, filteredDossiers, highlightedIndex, handleSelectDossier]);

  const handleDossierSearchFocus = useCallback(() => {
    setShowDropdown(true);
    setHighlightedIndex(-1);
  }, []);

  /* ── Enregistrement ── */
  const handleSaveToDossier = async () => {
    setSaveError('');
    const name = (inputs.dossierName || '').trim();
    if (!name) {
      setSaveError('Veuillez renseigner le nom de la société cliente avant d\'enregistrer.');
      return;
    }
    setSaveStatus('saving');

    try {
      let dossierId = selectedDossierId;

      if (!dossierId) {
        // Anti-doublon : chercher un dossier existant avec le même nom normalisé
        const norm = normalizeName(name);
        const existing = dossierList.find((d) => normalizeName(d.clientName) === norm);
        if (existing) {
          dossierId = existing.id;
        } else {
          const newDossier = await findOrCreateDossier(name, inputs.companyType);
          dossierId = newDossier.id;
        }
      }

      await saveExpertHoldingSimulation({
        dossierId: dossierId,
        label: `Simulation Holding IS — ${inputs.companyType}`,
        inputs,
        results: result,
      });

      setSaveStatus('success');
      setTimeout(() => {
        onNavigateToDossier(dossierId!);
      }, 800);
    } catch (err: unknown) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Impossible d\'enregistrer la simulation dans le dossier client.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: 'synthese', label: 'Synthèse & Argumentaire' },
    { id: 'analyse', label: 'Analyse Comptable' },
    { id: 'projections', label: 'Projections & Hypothèses' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Simulateur</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Simulateur Holding IS</h1>
        <p className="text-slate-400 max-w-3xl">
          Chiffrage société — trésorerie, usufruit temporaire SCPI et fiscalité IS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Panneau de saisie ── */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 sticky top-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />Paramètres
            </h2>

            {/* Dossier — autocomplete */}
            <div ref={dossierContainerRef} className="relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nom de la société cliente
              </label>
              {dossiersLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Chargement des dossiers...
                </div>
              ) : dossiersError ? (
                <p className="text-[10px] text-amber-400 py-1">{dossiersError}</p>
              ) : null}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={dossierSearch}
                  onChange={handleDossierSearchChange}
                  onKeyDown={handleDossierKeyDown}
                  onFocus={handleDossierSearchFocus}
                  placeholder="Rechercher ou saisir un nom de société..."
                  autoComplete="off"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors"
                />
              </div>

              {/* Statut dossier */}
              {selectedDossierId && (
                <p className="text-[10px] text-blue-400 mt-1">
                  Dossier existant sélectionné — les simulations seront rattachées à ce dossier.
                </p>
              )}
              {!selectedDossierId && inputs.dossierName && inputs.dossierName.trim().length > 0 && (
                <p className="text-[10px] text-amber-400 mt-1">
                  Nouveau dossier à créer lors de l'enregistrement.
                </p>
              )}

              {/* Dropdown */}
              {showDropdown && !dossiersLoading && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  {filteredDossiers.length === 0 ? (
                    <p className="px-3 py-3 text-[11px] text-slate-500 text-center">
                      {dossierSearch.trim()
                        ? 'Aucun dossier trouvé — un nouveau dossier sera créé à l\'enregistrement.'
                        : 'Aucun dossier client — un nouveau dossier sera créé à l\'enregistrement.'}
                    </p>
                  ) : (
                    filteredDossiers.map((d, idx) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDossier(d)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-600/10 transition-colors flex items-center justify-between ${
                          highlightedIndex === idx ? 'bg-blue-600/15 border-l-2 border-blue-400' : ''
                        } ${
                          selectedDossierId === d.id ? 'bg-blue-600/20 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-white font-medium">{d.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span>{d.companyType}</span>
                            {d.siret && <span>— SIRET: {d.siret}</span>}
                          </div>
                        </div>
                        {selectedDossierId === d.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Type société */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type de société</label>
              <div className="grid grid-cols-3 gap-1.5">
                {COMPANY_TYPES.map((t) => (
                  <button key={t} onClick={() => updateInput('companyType', t)}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${inputs.companyType === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Trésorerie + Résultat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trésorerie dispo.</label>
                <input type="number" value={inputs.availableCash}
                  onChange={(e) => updateInput('availableCash', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rés. fiscal avant opér.</label>
                <input type="number" value={inputs.preTaxProfit}
                  onChange={(e) => updateInput('preTaxProfit', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
              </div>
            </div>

            {/* Taux réduit IS */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Taux réduit IS PME</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={inputs.reducedRateEligible}
                  onChange={(e) => updateInput('reducedRateEligible', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-600" />
                <span className="text-xs text-slate-300">Appliquer le taux réduit IS PME</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">15 % jusqu'à 42 500 € de bénéfice, puis 25 %, sous conditions.</p>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Conditions à vérifier : CA HT ≤ 10 M€, capital entièrement libéré,
                    détention du capital conforme aux règles du taux réduit.
                    L'expert-comptable reste responsable de la validation.
                  </p>
                </div>
              </div>
            </div>

            {/* Usufruit */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Usufruit temporaire</span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Montant investi en usufruit (€)</label>
                <input type="number" value={inputs.usufruitInvestment}
                  onChange={(e) => updateInput('usufruitInvestment', Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Durée (ans)</label>
                  <div className="grid grid-cols-3 gap-1">
                    {DURATION_OPTIONS.map((d) => (
                      <button key={d} onClick={() => updateInput('usufruitDuration', d)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition ${inputs.usufruitDuration === d ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-slate-200'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Clé usufruit (%)</label>
                  <input type="number" value={inputs.usufruitKeyPercent}
                    onChange={(e) => updateInput('usufruitKeyPercent', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
                </div>
              </div>
            </div>

            {/* Taux distribution + Revalorisation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Taux distrib. brut (%)</label>
                <input type="number" step="0.01" value={inputs.grossYieldRate}
                  onChange={(e) => updateInput('grossYieldRate', Math.min(20, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Revalo. revenus (%)</label>
                <input type="number" value={inputs.revalorizationRate}
                  onChange={(e) => updateInput('revalorizationRate', Math.min(10, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors" />
              </div>
            </div>

            {/* ── Frais de mission ── */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-violet-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Frais de mission et de structuration</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={inputs.feesEnabled}
                  onChange={(e) => updateInput('feesEnabled', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-violet-600 focus:ring-violet-600" />
                <span className="text-xs text-slate-300">Activer les frais de mission</span>
              </label>
              {inputs.feesEnabled && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mode de calcul</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FEES_MODES.map((m) => (
                        <button key={m} onClick={() => updateInput('feesMode', m)}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${inputs.feesMode === m ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-slate-200'}`}>
                          {m === 'fixed' ? 'Montant fixe' : 'Pourcentage'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Frais de mission saisis en</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FEES_VAT_MODES.map((m) => (
                        <button key={m} onClick={() => updateInput('feesVatMode', m)}
                          className={`px-2 py-1.5 rounded text-[11px] font-medium transition ${inputs.feesVatMode === m ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-slate-200'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={inputs.feesMode === 'fixed' ? '' : 'hidden'}>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Montant fixe {inputs.feesVatMode} (€)</label>
                    <input type="number" value={inputs.feesFixedAmount}
                      onChange={(e) => updateInput('feesFixedAmount', Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors" />
                  </div>
                  <div className={inputs.feesMode === 'percentage' ? '' : 'hidden'}>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Pourcentage {inputs.feesVatMode} (%)</label>
                    <input type="number" step="0.1" value={inputs.feesPercentage}
                      onChange={(e) => updateInput('feesPercentage', Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Taux TVA (%)</label>
                    <input type="number" step="0.1" value={inputs.feesVatRate}
                      onChange={(e) => updateInput('feesVatRate', Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600/50 transition-colors" />
                  </div>
                  <label className="flex items-start gap-2 select-none"
                    style={{ cursor: inputs.holdingVatProfile === 'pure' ? 'not-allowed' : 'pointer' }}>
                    <input type="checkbox" checked={inputs.feesVatRecoverable}
                      onChange={(e) => updateInput('feesVatRecoverable', e.target.checked)}
                      disabled={inputs.holdingVatProfile === 'pure'}
                      className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-violet-600 focus:ring-violet-600 disabled:opacity-40 disabled:cursor-not-allowed" />
                    <span className={`text-xs ${inputs.holdingVatProfile === 'pure' ? 'text-slate-600' : 'text-slate-300'}`}>
                      TVA récupérable
                      {inputs.holdingVatProfile === 'pure' && <span className="text-[10px] text-slate-600 ml-1">(verrouillée — holding pure)</span>}
                    </span>
                  </label>

                  {/* ── Profil TVA holding ── */}
                  <div className="col-span-full space-y-2 border-t border-slate-700/40 pt-3">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Profil TVA de la holding</label>
                    <div className="space-y-1.5">
                      {VAT_PROFILES.map((p) => (
                        <button key={p.value} type="button" onClick={() => updateInput('holdingVatProfile', p.value)}
                          className={`w-full text-left px-3 py-2.5 rounded text-xs transition
                            ${inputs.holdingVatProfile === p.value
                              ? 'bg-violet-600/20 border border-violet-600/30 text-violet-200'
                              : 'bg-slate-700/50 border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                        >
                          <span className="font-medium">{p.label}</span>
                          <br /><span className="text-[10px] opacity-70">{p.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alerte profil TVA conditionnelle */}
                  {inputs.holdingVatProfile === 'to-qualify' && (
                    <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2 text-[10px] text-amber-300/80">
                      Profil TVA à qualifier — le droit à récupération doit être validé par le cabinet.
                    </div>
                  )}
                  {inputs.holdingVatProfile === 'animator' && (
                    <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg px-3 py-2 text-[10px] text-blue-300/80">
                      TVA récupérable sous réserve d'une activité économique taxable et de prestations effectivement facturées.
                    </div>
                  )}
                  {inputs.holdingVatProfile === 'pure' && (
                    <div className="bg-orange-950/30 border border-orange-800/40 rounded-lg px-3 py-2 text-[10px] text-orange-300/80">
                      Holding pure : récupération de TVA généralement non retenue. La TVA non récupérable augmente l'effort économique.
                    </div>
                  )}

                  {/* Taux récupération TVA partielle */}
                  {inputs.holdingVatProfile === 'mixed' && (
                    <div className="col-span-full">
                      <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                        Taux de récupération TVA (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0" max="100" step="5" value={inputs.vatRecoveryRate}
                          onChange={(e) => updateInput('vatRecoveryRate', Number(e.target.value))}
                          className="w-full accent-violet-600"
                        />
                        <span className="text-sm font-mono text-white min-w-[3.5rem] text-right">{inputs.vatRecoveryRate}&#8239;%</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Traitement fiscal/comptable</label>
                    <div className="space-y-1">
                      {FEES_TREATMENTS.map((t) => (
                        <button key={t} onClick={() => updateInput('feesTreatment', t)}
                          className={`w-full text-left px-3 py-2 rounded text-[11px] transition ${inputs.feesTreatment === t ? 'bg-violet-600/20 border border-violet-600/30 text-violet-300' : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'}`}>
                          {FEES_TREATMENT_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Colonne résultats ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── 6 KPI synthèse ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <KpiCard icon={<Wallet className="w-4 h-4" />} label="Effort initial économique" value={fmtEuro(result.effortEconomique)} color="blue"
              sublabel="Usufruit + frais + TVA non récup. éventuelle" />
            <KpiCard icon={<Euro className="w-4 h-4" />} label="Cash-flow net année 1" value={fmtEuro(result.annualNetCashFlowAfterFees)} color="emerald"
              sublabel="Après frais de mission" />
            <KpiCard icon={<Percent className="w-4 h-4" />} label="Rendement cash-flow moyen" value={fmtPercent(result.cashFlowAverageReturn)} color="amber"
              sublabel="Flux net moyen / effort initial" />
            <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Gain net après extinction" value={fmtEuro(result.gainNetAfterUsufructExtinction)} color="emerald"
              sublabel="Flux cumulés – effort initial" />
            <KpiCard icon={<Percent className="w-4 h-4" />} label="Rendement simple après extinction" value={fmtPercent(result.annualizedSimpleReturnAfterExtinction)} color="emerald"
              sublabel={`Sur ${inputs.usufruitDuration} ans`} />
            <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Impact IS année 1" value={fmtEuro(result.annualISImpact)} color="orange"
              sublabel={result.annualISImpact === 0 ? 'Neutre' : undefined} />
          </div>

          {/* ── Warnings métier ── */}
          {warnings.length > 0 && (
            <div className={`rounded-lg border p-4 space-y-2
              ${warnings.some(w => w.severity === 'critical') ? 'bg-red-950/20 border-red-900/30' :
                warnings.some(w => w.severity === 'warning') ? 'bg-orange-950/20 border-orange-900/30' :
                'bg-blue-950/20 border-blue-900/30'}`}
            >
              {warnings.map((w) => (
                <div key={w.id} className="flex items-start gap-2">
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    w.severity === 'critical' ? 'text-red-400' :
                    w.severity === 'warning' ? 'text-orange-400' : 'text-blue-400'
                  }`} />
                  <span className={`text-xs leading-relaxed ${
                    w.severity === 'critical' ? 'text-red-200/80' :
                    w.severity === 'warning' ? 'text-orange-200/80' : 'text-blue-200/80'
                  }`}>
                    {w.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Onglets ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-800 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {/* ── Onglet 1 : Synthèse & Argumentaire ── */}
              {activeTab === 'synthese' && (
                <div className="space-y-5">
                  {/* Lecture expert-comptable */}
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Lecture expert-comptable</span>
                    </div>
                    <ul className="space-y-2 text-xs text-blue-100/80 leading-relaxed">
                      <li><ArrowRight className="w-3 h-3 text-blue-400 inline mr-1.5" />
                        L'opération génère un résultat fiscal additionnel de <strong>{fmtEuro(result.annualFiscalResultOperationOnly)}</strong> la première année.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-blue-400 inline mr-1.5" />
                        L'impact IS année 1 ressort à <strong>{result.annualISImpact >= 0 ? '+' : '−'}{fmtEuro(Math.abs(result.annualISImpact))}</strong>.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-blue-400 inline mr-1.5" />
                        Le cash-flow net année 1 ressort à <strong>{fmtEuro(result.annualNetCashFlowAfterFees)}</strong>.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-blue-400 inline mr-1.5" />
                        Le rendement cash-flow moyen annuel ressort à <strong>{fmtPercent(result.cashFlowAverageReturn)}</strong> (flux net moyen / effort initial).
                      </li>
                      {inputs.feesEnabled && result.feesHT > 0 && (
                        <>
                          <li className="pt-1 border-t border-blue-900/40 mt-1"><ArrowRight className="w-3 h-3 text-violet-400 inline mr-1.5" />
                            Frais de mission : <strong>{fmtEuro(result.feesHT)} HT</strong>
                            {result.feesVAT > 0 && <span> + {fmtEuro(result.feesVAT)} TVA = {fmtEuro(result.feesTTC)} TTC</span>}
                            {result.recoverableVatAmount > 0 && result.nonRecoverableVatAmount > 0
                              ? ` (TVA récupérable partielle : ${fmtEuro(result.recoverableVatAmount)} / non récupérable : ${fmtEuro(result.nonRecoverableVatAmount)}).`
                              : inputs.holdingVatProfile === 'pure'
                                ? ' (TVA non récupérable — holding pure).'
                                : inputs.holdingVatProfile === 'animator'
                                  ? ' (TVA récupérable — holding animatrice).'
                                  : result.recoverableVatAmount > 0
                                    ? ' (TVA récupérable).' : ' (TVA non récupérable).'}
                          </li>
                          <li><ArrowRight className="w-3 h-3 text-violet-400 inline mr-1.5" />
                            Effort économique total : <strong>{fmtEuro(result.effortEconomique)}</strong>.
                            Traitement fiscal : {FEES_TREATMENT_SHORT[inputs.feesTreatment].toLowerCase()}.
                          </li>
                        </>
                      )}
                      <li className="pt-1 border-t border-blue-900/40 mt-1"><ArrowRight className="w-3 h-3 text-blue-400 inline mr-1.5" />
                        Validation comptable et fiscale requise avant toute présentation client.
                      </li>
                    </ul>
                  </div>

                  {/* Synthèse dirigeant */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Synthèse dirigeant</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      <li>• La société mobilise <strong className="text-white">{fmtEuro(result.effortEconomique)}</strong> sur une trésorerie disponible de {fmtEuro(inputs.availableCash)}.</li>
                      <li>• La trésorerie résiduelle théorique ressort à <strong className={inputs.availableCash - result.effortEconomique < 0 ? 'text-red-400' : 'text-emerald-400'}>{fmtEuro(inputs.availableCash - result.effortEconomique)}</strong> après opération.</li>
                      <li>• Investissement de {fmtEuro(result.effortEconomique)} finançant {fmtEuro(result.reconstitutedFullProperty)} de patrimoine SCPI (pleine propriété).</li>
                      <li>• L'opération dégage un cash-flow net de {fmtEuro(result.annualNetCashFlowAfterFees)} dès l'année 1.</li>
                      <li>• Sur {inputs.usufruitDuration} ans, le cash-flow cumulé atteint {fmtEuro(result.cumulativeNetCashFlowAfterFees)}.</li>
                    </ul>
                  </div>

                  {/* Lecture économique après extinction */}
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lecture économique après extinction de l'usufruit</span>
                    </div>
                    <ul className="space-y-2 text-xs text-emerald-100/80 leading-relaxed">
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        L'effort initial total est de <strong>{fmtEuro(result.effortEconomique)}</strong>.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        Flux nets encaissés sur {inputs.usufruitDuration} ans : <strong>{fmtEuro(result.cumulativeNetCashFlowAfterFees)}</strong>.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        Gain net économique après extinction de l'usufruit : <strong>{fmtEuro(result.gainNetAfterUsufructExtinction)}</strong> (flux cumulés – effort initial).
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        Rendement cash-flow moyen annuel : <strong>{fmtPercent(result.cashFlowAverageReturn)}</strong> (flux net moyen / effort initial).
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        Rendement simple après extinction : <strong>{fmtPercent(result.annualizedSimpleReturnAfterExtinction)}&nbsp;/&nbsp;an</strong>.
                      </li>
                      <li><ArrowRight className="w-3 h-3 text-emerald-400 inline mr-1.5" />
                        L'usufruit temporaire s'éteint sans valeur résiduelle à l'échéance.
                      </li>
                    </ul>
                    <div className="bg-emerald-950/40 border border-emerald-900/20 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-emerald-300/70 leading-relaxed">
                        Le rendement cash-flow moyen ne constitue pas un TRI. Il mesure le rapport entre les flux nets moyens et l'effort initial. L'analyse économique doit intégrer l'extinction de l'usufruit à l'échéance.
                      </p>
                    </div>
                  </div>

                  {/* Avis d'expert */}
                  <div className="bg-violet-950/20 border border-violet-900/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Avis d'expert</span>
                    </div>
                    <ul className="space-y-2 text-xs text-violet-100/80 leading-relaxed">
                      <li><span className="text-violet-400 font-semibold mr-1">Mécanique fiscale :</span>{expertOpinion.fiscalSection}</li>
                      <li><span className="text-violet-400 font-semibold mr-1">Performance économique :</span>{expertOpinion.performanceSection}</li>
                      <li><span className="text-violet-400 font-semibold mr-1">TVA :</span>{expertOpinion.vatSection}</li>
                    </ul>
                    <div className="bg-violet-950/40 border border-violet-900/20 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-violet-300/70 leading-relaxed">
                        <span className="font-semibold">Conclusion cabinet :</span> {expertOpinion.conclusionSection}
                      </p>
                    </div>
                    <p className="text-[10px] text-violet-400/50 italic">
                      Note de travail — ne constitue ni un conseil fiscal ni une recommandation d'investissement.
                    </p>
                  </div>

                  {/* Points de vigilance */}
                  <div className="bg-orange-950/20 border border-orange-900/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Points de vigilance</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-orange-200/80 leading-relaxed">
                      <li>• L'usufruit temporaire s'éteint sans valeur résiduelle à l'échéance.</li>
                      <li>• Le rendement cash-flow moyen ne constitue pas un TRI. Il doit être lu avec l'extinction de l'usufruit à l'échéance.</li>
                      <li>• Les revenus futurs des SCPI ne sont pas garantis et dépendent du marché immobilier.</li>
                      <li>• La fiscalité IS dépend de la structure juridique et de l'éligibilité au taux réduit.</li>
                      {inputs.feesEnabled && (
                        <li>• Le traitement fiscal des frais de mission doit être validé selon la nature de la facture et le régime TVA de la société.</li>
                      )}
                      {inputs.feesEnabled && inputs.holdingVatProfile !== 'to-qualify' && (
                        <li>• Le droit à récupération de TVA dépend du statut de la holding : pure, animatrice ou mixte. Le traitement des frais de mission doit être validé selon la nature de la facture et le régime TVA de la société.</li>
                      )}
                      {inputs.feesEnabled && inputs.holdingVatProfile === 'pure' && (
                        <li>• En cas de holding pure, la TVA non récupérable doit être intégrée dans l'effort économique.</li>
                      )}
                      <li>• Ce document constitue une note de travail, pas un conseil fiscal engageant.</li>
                    </ul>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-wrap gap-3">
                    <PDFDownloadLink
                      document={<ExpertHoldingReportPdf inputs={inputs} result={result} isSansOperation={isSansOperation} />}
                      fileName={(() => {
                        const dossier = (inputs.dossierName || 'maximusscpi').replace(/[^a-zA-Z0-9\-_]/g, '-').substring(0, 50);
                        const date = new Date().toISOString().slice(0, 10);
                        return `rapport-holding-is-${dossier}-${date}.pdf`;
                      })()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium
                        bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                    >
                      {({ loading }) => (
                        <>
                          <FileDown className="w-4 h-4" />
                          {loading ? 'Génération...' : 'Générer le PDF'}
                        </>
                      )}
                    </PDFDownloadLink>
                    <button onClick={handleSaveToDossier}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium
                        bg-violet-600/20 text-violet-300 border border-violet-600/30
                        hover:bg-violet-600/30 hover:text-violet-200 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed">
                      {saveStatus === 'saving' ? (
                        <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      ) : saveStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saveStatus === 'success' ? 'Enregistré !' : 'Enregistrer dans le dossier client'}
                    </button>
                    {saveError && (
                      <p className="text-xs text-red-400 mt-2 w-full">{saveError}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Onglet 2 : Analyse Comptable ── */}
              {activeTab === 'analyse' && (
                <div className="space-y-5">
                  {/* Comparatif */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-white">Comparatif avant / après opération</span>
                      <span className="text-[10px] text-slate-500 ml-1">(année 1)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/50 bg-slate-900/50">
                            <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Indicateur</th>
                            <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Sans opération</th>
                            <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Avec opération</th>
                            <th className="py-2.5 px-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Montant / Impact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          <ComparatifRow label="Résultat fiscal société"
                            before={inputs.preTaxProfit}
                            after={result.annualFiscalResultAfterOperation}
                            delta={result.annualFiscalResultAfterOperation - inputs.preTaxProfit}
                            deltaKind="positive" />
                          <ComparatifRow label="IS estimé"
                            before={isSansOperation}
                            after={result.annualISAfterOperation}
                            delta={result.annualISImpact}
                            deltaKind="is" />
                          <ComparatifRow label="Revenus bruts SCPI" before={0} after={result.annualGrossIncome}
                            delta={result.annualGrossIncome} deltaKind="positive" />
                          <ComparatifRow label="Charge déductible : amort. usufruit" before={0} after={result.annualAmortization}
                            delta={result.annualAmortization} deltaKind="charge" />
                          {inputs.feesEnabled && result.feesFiscalYear1 > 0 && (
                            <ComparatifRow label="Charge déductible : frais de mission" before={0} after={result.feesFiscalYear1}
                              delta={result.feesFiscalYear1} deltaKind="charge"
                              deltaLabel="Frais"
                              sub={FEES_TREATMENT_SHORT[inputs.feesTreatment]} />
                          )}
                          <ComparatifRow label="Cash-flow net société" before={0}
                            after={result.annualNetCashFlowAfterFees}
                            delta={result.annualNetCashFlowAfterFees}
                            deltaKind="cash" highlight />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Détail honoraires (si activés) */}
                  {inputs.feesEnabled && result.feesHT > 0 && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Receipt className="w-4 h-4" />Détail frais de mission et TVA
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Frais de mission HT</span>
                          <p className="text-white font-semibold mt-0.5">{fmtEuro(result.feesHT)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">TVA ({inputs.feesVatRate} %)</span>
                          <p className={`font-semibold mt-0.5 ${result.nonRecoverableVatAmount > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                            {fmtEuro(result.feesVAT)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Frais de mission TTC</span>
                          <p className="text-violet-400 font-semibold mt-0.5">{fmtEuro(result.feesTTC)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">TVA</span>
                          <p className={`font-semibold mt-0.5 ${result.recoverableVatAmount > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {inputs.holdingVatProfile === 'mixed'
                              ? `Partielle (${inputs.vatRecoveryRate} %)`
                              : inputs.holdingVatProfile === 'pure'
                                ? 'Non récupérable'
                                : inputs.holdingVatProfile === 'animator'
                                  ? 'Récupérable'
                                  : result.recoverableVatAmount > 0
                                    ? 'Récupérable'
                                    : 'Non récupérable'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash-flow cumulé */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />Cash-flow cumulé sur {inputs.usufruitDuration} ans
                    </span>
                    <div className="space-y-3">
                      {/* Barre après honoraires */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Après frais de mission</span>
                          <span className="text-emerald-400 font-semibold">{fmtEuro(result.cumulativeNetCashFlowAfterFees)}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
                          <div className="bg-emerald-500/60 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (result.cumulativeNetCashFlowAfterFees / result.effortEconomique) * 100)}%` }} />
                        </div>
                      </div>
                      {/* Barre hors honoraires */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Hors frais de mission</span>
                          <span className="text-slate-400 font-medium">{fmtEuro(result.cumulativeNetCashFlow)}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div className="bg-slate-600/50 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (result.cumulativeNetCashFlow / result.effortEconomique) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Détail résultat fiscal & IS */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" />Détail résultat fiscal et IS (année 1)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Résultat fiscal opération</span>
                        <p className="text-orange-400 font-semibold mt-0.5">{fmtEuro(result.annualFiscalResultOperationOnly)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Résultat fiscal après opération</span>
                        <p className="text-white font-semibold mt-0.5">{fmtEuro(result.annualFiscalResultAfterOperation)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">IS sans opération</span>
                        <p className="text-slate-400 font-semibold mt-0.5">{fmtEuro(isSansOperation)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">IS avec opération</span>
                        <p className="text-orange-400 font-semibold mt-0.5">{fmtEuro(result.annualISAfterOperation)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Pleine propriété SCPI</span>
                        <p className="text-blue-400 font-semibold mt-0.5">{fmtEuro(result.reconstitutedFullProperty)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Revenus bruts annuels</span>
                        <p className="text-violet-400 font-semibold mt-0.5">{fmtEuro(result.annualGrossIncome)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Amortissement annuel</span>
                        <p className="text-slate-300 font-semibold mt-0.5">{fmtEuro(result.annualAmortization)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Impact IS net</span>
                        <p className={`font-semibold mt-0.5 ${result.annualISImpact > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {result.annualISImpact >= 0 ? '+' : ''}{fmtEuro(result.annualISImpact)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Onglet 3 : Projections & Hypothèses ── */}
              {activeTab === 'projections' && (
                <div className="space-y-5">
                  {/* Hypothèses comptables */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    <button onClick={() => setShowHypotheses(!showHypotheses)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-white">Hypothèses comptables et fiscales</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHypotheses ? 'rotate-180' : ''}`} />
                    </button>
                    {showHypotheses && (
                      <div className="px-5 py-4 border-t border-slate-700/50">
                        <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                          <li><span className="text-blue-400 mr-2">•</span>Usufruit temporaire amorti linéairement sur la durée retenue.</li>
                          <li><span className="text-blue-400 mr-2">•</span>Aucune valeur résiduelle retenue à l'échéance de l'usufruit.</li>
                          <li><span className="text-blue-400 mr-2">•</span>Revenus SCPI supposés constants sur la durée, sauf revalorisation renseignée.</li>
                          <li><span className="text-blue-400 mr-2">•</span>Simulation hors frais spécifiques, hors délais de jouissance et hors fiscalité étrangère.</li>
                          <li><span className="text-blue-400 mr-2">•</span>Taux d'IS : taux réduit PME (15 % / 25 %) ou taux normal (25 %) selon éligibilité.</li>
                          {inputs.feesEnabled && (
                            <>
                              <li>
                                <span className="text-violet-400 mr-2">•</span>
                                <span className="text-violet-300/70">
                                  Frais de mission : {inputs.feesVatMode}, TVA {inputs.feesVatRate} %, {inputs.feesVatRecoverable ? 'récupérable' : 'non récupérable'}.
                                  Traitement : {FEES_TREATMENT_LABELS[inputs.feesTreatment].toLowerCase()}.
                                  Déductibilité sur base {inputs.feesVatRecoverable ? 'HT' : 'TTC'}.
                                </span>
                              </li>
                              <li>
                                <span className="text-violet-400 mr-2">•</span>
                                <span className="text-violet-300/70">
                                  Le traitement HT/TTC et la récupération de TVA doivent être validés par le cabinet.
                                </span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Projection annuelle */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    <button onClick={() => setShowProjection(!showProjection)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-white">Projection annuelle</span>
                        <span className="text-[10px] text-slate-500 ml-1">({result.projections.length} ans)</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProjection ? 'rotate-180' : ''}`} />
                    </button>
                    {showProjection && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/50">
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Année</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Revenus</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Amort.</th>
                              {inputs.feesEnabled && (
                                <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-violet-500 font-semibold text-right">Mission</th>
                              )}
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rés. fiscal op.</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS sans</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">IS avec</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Impact IS</th>
                              <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-right">Cash-flow net</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/30">
                            {result.projections.map((row, i) => (
                              <tr key={row.year} className={`${i % 2 === 0 ? 'bg-slate-900/20' : ''} hover:bg-slate-800/30 transition-colors`}>
                                <td className="py-2 px-2 font-semibold text-slate-200">A{row.year}</td>
                                <td className="py-2 px-2 text-right text-violet-400 font-medium">{fmtNumber(row.grossIncome)} €</td>
                                <td className="py-2 px-2 text-right text-slate-400">{fmtNumber(row.amortization)} €</td>
                                {inputs.feesEnabled && (
                                  <td className={`py-2 px-2 text-right ${row.feesFiscal > 0 ? 'text-violet-400 font-medium' : 'text-slate-600'}`}>
                                    {row.feesFiscal > 0 ? fmtNumber(row.feesFiscal) + ' €' : '—'}
                                  </td>
                                )}
                                <td className="py-2 px-2 text-right text-orange-400">{fmtNumber(row.fiscalResultOperationOnly)} €</td>
                                <td className="py-2 px-2 text-right text-slate-500">{fmtNumber(row.isBeforeOperation)} €</td>
                                <td className="py-2 px-2 text-right text-orange-400">{fmtNumber(row.isAfterOperation)} €</td>
                                <td className={`py-2 px-2 text-right font-semibold ${row.isImpact > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                  {row.isImpact >= 0 ? '+' : ''}{fmtNumber(row.isImpact)} €
                                </td>
                                <td className="py-2 px-2 text-right font-semibold text-emerald-400">
                                  {fmtNumber(inputs.feesEnabled ? row.netCashFlowAfterFees : row.netCashFlow)} €
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-600 bg-slate-900/50 font-semibold">
                              <td className="py-2.5 px-2 text-slate-200">Cumul</td>
                              <td className="py-2.5 px-2 text-right text-slate-300" colSpan={inputs.feesEnabled ? 7 : 6}></td>
                              <td className="py-2.5 px-2 text-right text-emerald-400 text-sm">
                                {fmtEuro(inputs.feesEnabled ? result.cumulativeNetCashFlowAfterFees : result.cumulativeNetCashFlow)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Disclaimer complet */}
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        <strong>Simulation indicative.</strong> Les hypothèses fiscales, comptables et financières
                        doivent être validées par l'expert-comptable selon la situation réelle de la société.
                        L'outil ne constitue ni un conseil fiscal, ni une recommandation d'investissement.
                      </p>
                    </div>
                    {inputs.feesEnabled && (
                      <div className="flex items-start gap-3 border-t border-amber-900/20 pt-3">
                        <Receipt className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-200/70 leading-relaxed space-y-1">
                          <p><strong>Frais de mission.</strong> Le traitement dépend de leur nature, de leur justification
                            et de leur comptabilisation. Sous la responsabilité de l'expert-comptable.</p>
                          <p><strong>HT/TTC.</strong> Le traitement HT/TTC et la récupération de TVA doivent être validés
                            par le cabinet selon le régime TVA de la société.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rappel disclaimer bas de page */}
          <p className="text-center text-[10px] text-slate-600">
            Simulation indicative — validation cabinet requise avant présentation client.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Sous-composants ── */

interface KpiCardProps {
  icon: React.ReactNode; label: string; value: string;
  color?: 'emerald' | 'violet' | 'blue' | 'orange' | 'slate';
  highlight?: boolean; large?: boolean; sublabel?: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-600/20' },
  violet: { bg: 'bg-violet-600/10', text: 'text-violet-400', border: 'border-violet-600/20' },
  blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/20' },
  orange: { bg: 'bg-orange-600/10', text: 'text-orange-400', border: 'border-orange-600/20' },
  slate: { bg: 'bg-slate-800/50', text: 'text-slate-400', border: 'border-slate-700/50' },
};

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, color = 'emerald', highlight, large, sublabel }) => {
  const c = colorMap[color] ?? colorMap.emerald;
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 ${large ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={c.text}>{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={`font-bold ${large ? 'text-xl' : 'text-lg'} ${highlight ? 'text-orange-400' : c.text}`}>{value}</p>
      {sublabel && <p className="text-[10px] text-slate-600 mt-0.5">{sublabel}</p>}
    </div>
  );
};

type DeltaKind = 'positive' | 'negative' | 'is' | 'charge' | 'cash';

interface ComparatifRowProps {
  label: string; before: number; after: number; delta: number;
  deltaKind: DeltaKind; highlight?: boolean; sub?: string; deltaLabel?: string;
}

const ComparatifRow: React.FC<ComparatifRowProps> = ({ label, before, after, delta, deltaKind, highlight, sub, deltaLabel }) => {
  const absDelta = Math.abs(delta);
  const sign = delta >= 0 ? '+' : '−';

  let deltaDisplay: string;
  let deltaColor: string;

  if (deltaKind === 'charge') {
    deltaDisplay = `${deltaLabel || 'Charge'} : ${fmtNumber(absDelta)} €`;
    deltaColor = 'text-orange-400';
  } else if (deltaKind === 'is') {
    deltaDisplay = `${sign}${fmtNumber(absDelta)} €`;
    deltaColor = delta > 0 ? 'text-orange-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-400';
  } else if (deltaKind === 'positive') {
    deltaDisplay = `${sign}${fmtNumber(absDelta)} €`;
    deltaColor = delta >= 0 ? 'text-slate-300' : 'text-orange-400';
  } else if (deltaKind === 'negative') {
    deltaDisplay = `${sign}${fmtNumber(absDelta)} €`;
    deltaColor = delta <= 0 ? 'text-emerald-400' : 'text-orange-400';
  } else if (deltaKind === 'cash') {
    deltaDisplay = `${sign}${fmtNumber(absDelta)} €`;
    deltaColor = 'text-emerald-400';
  } else {
    deltaDisplay = `${sign}${fmtNumber(absDelta)} €`;
    deltaColor = 'text-slate-400';
  }

  return (
    <tr className={highlight ? 'bg-emerald-950/20' : ''}>
      <td className={`py-2.5 px-4 ${highlight ? 'font-semibold text-white' : 'text-slate-300'}`}>
        {label}
        {sub && <span className="text-slate-600 ml-1">({sub})</span>}
      </td>
      <td className="py-2.5 px-4 text-right text-slate-500">{before > 0 ? fmtNumber(before) + ' €' : '0 €'}</td>
      <td className="py-2.5 px-4 text-right text-slate-200">{after > 0 ? fmtNumber(after) + ' €' : '0 €'}</td>
      <td className={`py-2.5 px-4 text-right font-medium ${deltaColor}`}>{deltaDisplay}</td>
    </tr>
  );
};

export default ExpertHoldingSimulator;
