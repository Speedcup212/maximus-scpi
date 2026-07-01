import React, { useState, useMemo } from 'react';
import {
  Calculator, TrendingUp, Building2, Euro, Percent,
  BarChart3, Shield, AlertTriangle, ChevronDown,
  Landmark, FileText, Info, ArrowRight, Table2, Receipt, Wallet,
  FileDown, Save, Clock,
} from 'lucide-react';
import {
  HoldingISInputs, HoldingISResult,
  FeesMode, FeesTreatment, FeesVatMode,
  calculateHoldingISProjection, calculateCorporateTax,
} from '../../utils/holdingSimulation';

/* ── Constantes ── */

const COMPANY_TYPES: HoldingISInputs['companyType'][] = ['SAS', 'SARL', 'SCI IS', 'Holding', 'Autre'];
const DURATION_OPTIONS = [3, 5, 7, 10, 12, 15];
const FEES_MODES: FeesMode[] = ['fixed', 'percentage'];
const FEES_VAT_MODES: FeesVatMode[] = ['HT', 'TTC'];
const FEES_TREATMENTS: FeesTreatment[] = ['not-integrated', 'deductible-year1', 'amortized', 'non-deductible'];

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
};

type TabId = 'synthese' | 'analyse' | 'projections';

/* ── Helpers formatage ── */

const fmtEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const fmtPercent = (v: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '\u202f%';
const fmtNumber = (v: number) =>
  new Intl.NumberFormat('fr-FR').format(v);

/* ── Composant ── */

const ExpertHoldingSimulator: React.FC = () => {
  const [inputs, setInputs] = useState<HoldingISInputs>({ ...DEFAULT_INPUTS });
  const [activeTab, setActiveTab] = useState<TabId>('synthese');
  const [showProjection, setShowProjection] = useState(false);
  const [showHypotheses, setShowHypotheses] = useState(false);

  const result: HoldingISResult = useMemo(() => calculateHoldingISProjection(inputs), [inputs]);
  const isSansOperation = useMemo(() => calculateCorporateTax(inputs.preTaxProfit, {
    reducedRateEligible: inputs.reducedRateEligible,
  }), [inputs.preTaxProfit, inputs.reducedRateEligible]);

  const updateInput = <K extends keyof HoldingISInputs>(key: K, value: HoldingISInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
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

            {/* Dossier */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom du dossier</label>
              <input type="text" value={inputs.dossierName ?? ''}
                onChange={(e) => updateInput('dossierName', e.target.value || undefined)}
                placeholder="Ex: SCI Dupont SCPI"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600/50 transition-colors" />
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

            {/* ── Honoraires et frais ── */}
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3 border border-violet-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Honoraires et frais de structuration</span>
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={inputs.feesEnabled}
                  onChange={(e) => updateInput('feesEnabled', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-violet-600 focus:ring-violet-600" />
                <span className="text-xs text-slate-300">Activer les honoraires</span>
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
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Honoraires saisis en</label>
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
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={inputs.feesVatRecoverable}
                      onChange={(e) => updateInput('feesVatRecoverable', e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded bg-slate-800 border-slate-600 text-violet-600 focus:ring-violet-600" />
                    <span className="text-xs text-slate-300">TVA récupérable</span>
                  </label>
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
          {/* ── 4 KPI synthèse ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={<Wallet className="w-4 h-4" />} label="Effort de trésorerie" value={fmtEuro(result.effortEconomique)} color="blue"
              sublabel={inputs.feesEnabled ? (inputs.feesVatRecoverable ? 'Usufruit + HT' : 'Usufruit + TTC') : undefined} />
            <KpiCard icon={<Euro className="w-4 h-4" />} label="Cash-flow net année 1" value={fmtEuro(result.annualNetCashFlowAfterFees)} color="emerald"
              sublabel="Après honoraires" />
            <KpiCard icon={<Percent className="w-4 h-4" />} label="Rendement net moyen" value={fmtPercent(result.netCompanyYieldAvgAnnual)} color="emerald"
              sublabel={`Sur ${inputs.usufruitDuration} ans`} />
            <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Impact IS année 1" value={fmtEuro(result.annualISImpact)} color="orange"
              sublabel={result.annualISImpact === 0 ? 'Neutre' : undefined} />
          </div>

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
                        Le rendement net moyen annuel ressort à <strong>{fmtPercent(result.netCompanyYieldAvgAnnual)}</strong>.
                      </li>
                      {inputs.feesEnabled && result.feesHT > 0 && (
                        <>
                          <li className="pt-1 border-t border-blue-900/40 mt-1"><ArrowRight className="w-3 h-3 text-violet-400 inline mr-1.5" />
                            Honoraires : <strong>{fmtEuro(result.feesHT)} HT</strong>
                            {result.feesVAT > 0 && <span> + {fmtEuro(result.feesVAT)} TVA = {fmtEuro(result.feesTTC)} TTC</span>}
                            {inputs.feesVatRecoverable ? ' (TVA récupérable).' : ' (TVA non récupérable).'}
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
                      <li>• La trésorerie résiduelle théorique ressort à <strong className="text-emerald-400">{fmtEuro(inputs.availableCash - result.effortEconomique)}</strong> après opération.</li>
                      <li>• Investissement de {fmtEuro(result.effortEconomique)} finançant {fmtEuro(result.reconstitutedFullProperty)} de patrimoine SCPI (pleine propriété).</li>
                      <li>• L'opération dégage un cash-flow net de {fmtEuro(result.annualNetCashFlowAfterFees)} dès l'année 1.</li>
                      <li>• Sur {inputs.usufruitDuration} ans, le cash-flow cumulé atteint {fmtEuro(result.cumulativeNetCashFlowAfterFees)}.</li>
                    </ul>
                  </div>

                  {/* Points de vigilance */}
                  <div className="bg-orange-950/20 border border-orange-900/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Points de vigilance</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-orange-200/80 leading-relaxed">
                      <li>• L'usufruit temporaire n'offre pas de valeur de revente à l'échéance.</li>
                      <li>• Les revenus futurs des SCPI ne sont pas garantis et dépendent du marché immobilier.</li>
                      <li>• La fiscalité IS dépend de la structure juridique et de l'éligibilité au taux réduit.</li>
                      {inputs.feesEnabled && (
                        <li>• Le traitement fiscal des honoraires doit être validé selon la nature de la facture et le régime TVA de la société.</li>
                      )}
                      <li>• Ce document constitue une note de travail, pas un conseil fiscal engageant.</li>
                    </ul>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-wrap gap-3">
                    <button disabled
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium
                        bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed transition-opacity opacity-60">
                      <FileDown className="w-4 h-4" />
                      Générer le PDF
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-500">Bientôt</span>
                    </button>
                    <button disabled
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium
                        bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed transition-opacity opacity-60">
                      <Save className="w-4 h-4" />
                      Sauvegarder
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-500">Bientôt</span>
                    </button>
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
                            <ComparatifRow label="Charge déductible : honoraires" before={0} after={result.feesFiscalYear1}
                              delta={result.feesFiscalYear1} deltaKind="charge"
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
                        <Receipt className="w-4 h-4" />Détail honoraires et TVA
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Honoraires HT</span>
                          <p className="text-white font-semibold mt-0.5">{fmtEuro(result.feesHT)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">TVA ({inputs.feesVatRate} %)</span>
                          <p className={`font-semibold mt-0.5 ${inputs.feesVatRecoverable ? 'text-slate-400' : 'text-orange-400'}`}>
                            {fmtEuro(result.feesVAT)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Honoraires TTC</span>
                          <p className="text-violet-400 font-semibold mt-0.5">{fmtEuro(result.feesTTC)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">TVA</span>
                          <p className={`font-semibold mt-0.5 ${inputs.feesVatRecoverable ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {inputs.feesVatRecoverable ? 'Récupérable' : 'Non récupérable'}
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
                          <span className="text-slate-400">Après honoraires</span>
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
                          <span className="text-slate-500">Hors honoraires</span>
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
                                  Honoraires : {inputs.feesVatMode}, TVA {inputs.feesVatRate} %, {inputs.feesVatRecoverable ? 'récupérable' : 'non récupérable'}.
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
                                <th className="py-2.5 px-2 text-[10px] uppercase tracking-wider text-violet-500 font-semibold text-right">Honor.</th>
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
                          <p><strong>Honoraires.</strong> Le traitement dépend de leur nature, de leur justification
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
  deltaKind: DeltaKind; highlight?: boolean; sub?: string;
}

const ComparatifRow: React.FC<ComparatifRowProps> = ({ label, before, after, delta, deltaKind, highlight, sub }) => {
  const absDelta = Math.abs(delta);
  const sign = delta >= 0 ? '+' : '−';

  // Colonne Montant/Impact : libellé selon le type de ligne
  let deltaDisplay: string;
  let deltaColor: string;

  if (deltaKind === 'charge') {
    deltaDisplay = `Charge retenue : ${fmtNumber(absDelta)} €`;
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
