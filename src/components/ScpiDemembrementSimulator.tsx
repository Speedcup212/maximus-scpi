import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { TrendingUp, DollarSign, Calendar, ChevronDown, ChevronUp, AlertCircle, Info, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import PieChart from './PieChart';

interface ScpiDemembrementSimulatorProps {
  defaultMontant?: number;
  defaultDuree?: number;
  defaultRendement?: number;
  ctaUrl?: string;
  onCtaClick?: () => void;
}

const ScpiDemembrementSimulator: React.FC<ScpiDemembrementSimulatorProps> = ({
  defaultMontant = 0,
  defaultDuree = 10,
  defaultRendement = 5.0,
  ctaUrl = '#contact',
  onCtaClick
}) => {
  console.log('[ScpiDemembrementSimulator] Component mounted');
  const [mode, setMode] = useState<'nue-pro' | 'usufruit' | 'comparatif'>('nue-pro');

  const [montantPPInput, setMontantPPInput] = useState(String(defaultMontant));
  const [dureeInput, setDureeInput] = useState(String(defaultDuree));
  const [rendementBrutInput, setRendementBrutInput] = useState(String(defaultRendement));
  const [age, setAge] = useState(60);
  const [tmiInput, setTmiInput] = useState('30');
  const [psFiscalesInput, setPsFiscalesInput] = useState('17.2');
  const [tauxActuInput, setTauxActuInput] = useState('3.5');
  const [cleNuePropriete, setCleNuePropriete] = useState<number | null>(null);
  const [cleUsufruit, setCleUsufruit] = useState<number | null>(null);
  const [cleMode, setCleMode] = useState<'auto' | 'manuel'>('auto');
  const [valeurNueProManuellePourcentInput, setValeurNueProManuellePourcentInput] = useState('65');
  const [revaloPrixPartInput, setRevaloPrixPartInput] = useState('0');
  const [indexationRevenusInput, setIndexationRevenusInput] = useState('0');

  const parseNumericInput = (value: string) => {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const stopInputEventPropagation = (
    event: React.MouseEvent<HTMLInputElement> | React.PointerEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
  };

  const deferredMontantPPInput = useDeferredValue(montantPPInput);
  const deferredDureeInput = useDeferredValue(dureeInput);
  const deferredRendementBrutInput = useDeferredValue(rendementBrutInput);
  const deferredTmiInput = useDeferredValue(tmiInput);
  const deferredPsFiscalesInput = useDeferredValue(psFiscalesInput);
  const deferredTauxActuInput = useDeferredValue(tauxActuInput);
  const deferredValeurNueProManuellePourcentInput = useDeferredValue(valeurNueProManuellePourcentInput);
  const deferredRevaloPrixPartInput = useDeferredValue(revaloPrixPartInput);
  const deferredIndexationRevenusInput = useDeferredValue(indexationRevenusInput);

  const montantPP = useMemo(() => parseNumericInput(deferredMontantPPInput), [deferredMontantPPInput]);
  const duree = useMemo(() => parseNumericInput(deferredDureeInput), [deferredDureeInput]);
  const rendementBrut = useMemo(() => parseNumericInput(deferredRendementBrutInput), [deferredRendementBrutInput]);
  const tmi = useMemo(() => parseNumericInput(deferredTmiInput), [deferredTmiInput]);
  const psFiscales = useMemo(() => parseNumericInput(deferredPsFiscalesInput), [deferredPsFiscalesInput]);
  const tauxActu = useMemo(() => parseNumericInput(deferredTauxActuInput), [deferredTauxActuInput]);
  const valeurNueProManuellePourcent = useMemo(
    () => parseNumericInput(deferredValeurNueProManuellePourcentInput),
    [deferredValeurNueProManuellePourcentInput]
  );
  const revaloPrixPart = useMemo(() => parseNumericInput(deferredRevaloPrixPartInput), [deferredRevaloPrixPartInput]);
  const indexationRevenus = useMemo(() => parseNumericInput(deferredIndexationRevenusInput), [deferredIndexationRevenusInput]);


  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  function getDefaultNueProPercent(durationYears: number): number {
    if (durationYears <= 5) return 60;
    if (durationYears >= 20) return 75;
    const pct = 60 + ((durationYears - 5) / 15) * (75 - 60);
    return Math.min(Math.max(pct, 50), 80);
  }

  const calculDemembrement = useMemo(() => {
    const revenuBrutAnnuel = montantPP * (rendementBrut / 100);
    const tauxPS = psFiscales / 100;
    const tauxTMI = tmi / 100;
    const tauxActualisation = tauxActu / 100;
    const tauxRevalo = revaloPrixPart / 100;
    const tauxIndexation = indexationRevenus / 100;

    const revenuNetAnnuel = revenuBrutAnnuel * (1 - tauxPS - tauxTMI);

    let valeurNueProPourcent: number;
    if (cleMode === 'auto') {
      valeurNueProPourcent = getDefaultNueProPercent(duree);
    } else {
      valeurNueProPourcent = valeurNueProManuellePourcent;
    }

    const coeffNuePro = valeurNueProPourcent / 100;
    const coeffUsufruit = 1 - coeffNuePro;

    const prixUsufruit = montantPP * coeffUsufruit;
    const prixNuePro = montantPP * coeffNuePro;

    const decoteNuePro = ((montantPP - prixNuePro) / montantPP) * 100;

    const montantPPFinal = montantPP * Math.pow(1 + tauxRevalo, duree);

    let revenusTotauxUsufruit = 0;
    for (let i = 1; i <= duree; i++) {
      const revenuAnneeI = revenuNetAnnuel * Math.pow(1 + tauxIndexation, i - 1);
      revenusTotauxUsufruit += revenuAnneeI;
    }
    const capitalFinalUsufruit = 0;

    const vaCashFlows = Array.from({ length: duree }, (_, i) => {
      const revenuAnneeI = revenuNetAnnuel * Math.pow(1 + tauxIndexation, i);
      return revenuAnneeI / Math.pow(1 + tauxActualisation, i + 1);
    }).reduce((sum, val) => sum + val, 0);

    const rendementImpliciteNuePro = duree > 0 && prixNuePro > 0
      ? (Math.pow(montantPPFinal / prixNuePro, 1 / duree) - 1) * 100
      : 0;

    const rendementGlobalUsufruit = prixUsufruit > 0
      ? ((revenusTotauxUsufruit / prixUsufruit) * 100) / duree
      : 0;

    const capitaliseRevenusNP = Array.from({ length: duree }, (_, i) => {
      const revenuAnneeI = revenuBrutAnnuel * Math.pow(1 + tauxIndexation, i);
      return revenuAnneeI * Math.pow(1 + rendementBrut / 100, duree - i - 1);
    }).reduce((sum, val) => sum + val, 0);

    const patrimoineReconstitueNP = montantPPFinal + capitaliseRevenusNP;

    const timeline = Array.from({ length: duree + 1 }, (_, i) => {
      const annee = i;
      const valeurPPActuelle = montantPP * Math.pow(1 + tauxRevalo, i);

      let revenusCumulesUsufruit = 0;
      for (let j = 1; j <= i; j++) {
        revenusCumulesUsufruit += revenuNetAnnuel * Math.pow(1 + tauxIndexation, j - 1);
      }

      const valeurNuePro = i === duree ? valeurPPActuelle : prixNuePro;
      const cashFlowUsufruit = i > 0 ? revenuNetAnnuel * Math.pow(1 + tauxIndexation, i - 1) : 0;

      return {
        annee,
        revenusCumulesUsufruit,
        valeurNuePro,
        valeurPPReference: valeurPPActuelle,
        cashFlowUsufruit
      };
    });

    return {
      montantPP,
      montantPPFinal,
      coeffUsufruit,
      coeffNuePro,
      valeurNueProPourcent,
      prixUsufruit,
      prixNuePro,
      decoteNuePro,
      revenuBrutAnnuel,
      revenuNetAnnuel,
      revenusTotauxUsufruit,
      capitalFinalUsufruit,
      rendementImpliciteNuePro,
      rendementGlobalUsufruit,
      vaCashFlows,
      patrimoineReconstitueNP,
      timeline
    };
  }, [montantPP, duree, rendementBrut, age, tmi, psFiscales, tauxActu, cleMode, valeurNueProManuellePourcent, revaloPrixPart, indexationRevenus]);

  const formatEuro = useCallback((value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, []);

  const formatPercent = useCallback((value: number, decimals = 2) => {
    return `${value.toFixed(decimals)} %`;
  }, []);


  const renderModeSelector = () => (
    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Mode de simulation
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setMode('nue-pro')}
          className={`p-4 rounded-lg border-2 transition-all ${
            mode === 'nue-pro'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-400'
          }`}
        >
          <div className="font-bold mb-1">Nue-propriété</div>
          <div className="text-xs opacity-90">Capitalisation différée</div>
        </button>
        <button
          onClick={() => setMode('usufruit')}
          className={`p-4 rounded-lg border-2 transition-all ${
            mode === 'usufruit'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-400'
          }`}
        >
          <div className="font-bold mb-1">Usufruit</div>
          <div className="text-xs opacity-90">Revenus immédiats</div>
        </button>
        <button
          onClick={() => setMode('comparatif')}
          className={`p-4 rounded-lg border-2 transition-all ${
            mode === 'comparatif'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-400'
          }`}
        >
          <div className="font-bold mb-1">Comparatif</div>
          <div className="text-xs opacity-90">Analyse complète</div>
        </button>
      </div>
    </div>
  );

  const renderParametresBase = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-emerald-600" />
        Paramètres de base
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Valeur pleine propriété
          </label>
          <input
            type="text"
            value={montantPPInput}
            onChange={(e) => setMontantPPInput(e.target.value)}
            onMouseDown={stopInputEventPropagation}
            onPointerDown={stopInputEventPropagation}
            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 px-4 text-lg font-semibold focus:outline-none focus:border-emerald-500"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prix si achat en pleine propriété
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Durée du démembrement (années)
          </label>
          <input
            type="text"
            value={dureeInput}
            onChange={(e) => setDureeInput(e.target.value)}
            onMouseDown={stopInputEventPropagation}
            onPointerDown={stopInputEventPropagation}
            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 px-4 text-lg font-semibold focus:outline-none focus:border-emerald-500"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Durée de démembrement en années.
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Rendement brut annuel moyen estimé de la SCPI (%)
          </label>
          <input
            type="text"
            value={rendementBrutInput}
            onChange={(e) => setRendementBrutInput(e.target.value)}
            onMouseDown={stopInputEventPropagation}
            onPointerDown={stopInputEventPropagation}
            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 px-4 text-lg font-semibold focus:outline-none focus:border-emerald-500"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <p>Hypothèse de rendement brut annuel moyen sur la durée de la simulation.</p>
            <p>Basé sur les derniers taux de distribution connus de la SCPI.</p>
            <p className="font-medium">Rendement non garanti, susceptible de varier à la hausse comme à la baisse.</p>
            <p className="italic mt-1">Exemple : une SCPI qui a distribué 5,10 % en 2024 peut être simulée avec 5 % comme rendement moyen prudent.</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-600" />
            Paramètres de démembrement
          </h4>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Clé de répartition nue-propriété / usufruit
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                style={{
                  borderColor: cleMode === 'auto' ? 'rgb(16, 185, 129)' : 'rgb(209, 213, 219)',
                  backgroundColor: cleMode === 'auto' ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                }}>
                <input
                  type="radio"
                  name="cleMode"
                  value="auto"
                  checked={cleMode === 'auto'}
                  onChange={() => setCleMode('auto')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Automatique</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Clé standard selon la durée</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                style={{
                  borderColor: cleMode === 'manuel' ? 'rgb(16, 185, 129)' : 'rgb(209, 213, 219)',
                  backgroundColor: cleMode === 'manuel' ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                }}>
                <input
                  type="radio"
                  name="cleMode"
                  value="manuel"
                  checked={cleMode === 'manuel'}
                  onChange={() => setCleMode('manuel')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Personnalisée</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Je choisis le % de nue-propriété</div>
                </div>
              </label>
            </div>
          </div>

          {cleMode === 'auto' ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Prix de la nue-propriété (clé auto)</span>
                  <span className="text-lg font-bold text-emerald-600">{formatPercent(calculDemembrement.valeurNueProPourcent, 1)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatEuro(calculDemembrement.prixNuePro)}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-emerald-200 dark:border-emerald-800">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Prix de l'usufruit (complément)</span>
                  <span className="text-lg font-bold text-emerald-600">{formatPercent((100 - calculDemembrement.valeurNueProPourcent), 1)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatEuro(calculDemembrement.prixUsufruit)}
                </div>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span>
                    Clé indicative basée sur une grille standard. La clé réelle dépend de la SCPI et de la société de gestion.
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Prix de la nue-propriété (% du prix en pleine propriété)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={valeurNueProManuellePourcent}
                  onChange={(e) => {
                    setValeurNueProManuellePourcentInput(e.target.value);
                  }}
                  onMouseDown={stopInputEventPropagation}
                  onPointerDown={stopInputEventPropagation}
                  min={40}
                  max={90}
                  step={0.5}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={valeurNueProManuellePourcentInput}
                    onChange={(e) => setValeurNueProManuellePourcentInput(e.target.value)}
                    onMouseDown={stopInputEventPropagation}
                    onPointerDown={stopInputEventPropagation}
                    className="w-20 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-3 text-center font-semibold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Pourcentage de la pleine propriété attribué à la nue-propriété.
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Nue-propriété</div>
                  <div className="text-xl font-bold text-emerald-600">{formatEuro(calculDemembrement.prixNuePro)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Usufruit ({formatPercent(100 - valeurNueProManuellePourcent, 1)})</div>
                  <div className="text-xl font-bold text-emerald-600">{formatEuro(calculDemembrement.prixUsufruit)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Revalorisation annuelle du prix de part (%)
            </label>
            <input
              type="text"
              value={revaloPrixPartInput}
              onChange={(e) => setRevaloPrixPartInput(e.target.value)}
              onMouseDown={stopInputEventPropagation}
              onPointerDown={stopInputEventPropagation}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 px-4 text-lg font-semibold focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Impact sur la valeur finale de la part.
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-6 w-full flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Paramètres avancés
      </button>

      {showAdvanced && (
        <div className="mt-6 space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              TMI - Tranche Marginale d'Imposition (%)
            </label>
            <input
              type="text"
              value={tmiInput}
              onChange={(e) => setTmiInput(e.target.value)}
              onMouseDown={stopInputEventPropagation}
              onPointerDown={stopInputEventPropagation}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tranche marginale d'imposition.
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Prélèvements sociaux (%)
            </label>
            <input
              type="text"
              value={psFiscalesInput}
              onChange={(e) => setPsFiscalesInput(e.target.value)}
              onMouseDown={stopInputEventPropagation}
              onPointerDown={stopInputEventPropagation}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Prélèvements sociaux applicables.
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Taux d'actualisation (%)
            </label>
            <input
              type="text"
              value={tauxActuInput}
              onChange={(e) => setTauxActuInput(e.target.value)}
              onMouseDown={stopInputEventPropagation}
              onPointerDown={stopInputEventPropagation}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Utilisé pour calcul de la valeur actuelle.
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Indexation annuelle des revenus (%)
            </label>
            <input
              type="text"
              value={indexationRevenusInput}
              onChange={(e) => setIndexationRevenusInput(e.target.value)}
              onMouseDown={stopInputEventPropagation}
              onPointerDown={stopInputEventPropagation}
              className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Impact sur l'évolution des revenus de l'usufruitier.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderResultatsNuePro = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        Résultats Nue-propriété
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix d'achat</div>
          <div className="text-2xl font-bold text-emerald-600">{formatEuro(calculDemembrement.prixNuePro)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Décote : {formatPercent(calculDemembrement.decoteNuePro)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valeur finale (an {duree})</div>
          <div className="text-2xl font-bold text-emerald-600">{formatEuro(calculDemembrement.montantPPFinal)}</div>
          <div className="text-xs text-emerald-600 mt-1">
            Reconstitution pleine propriété {revaloPrixPart !== 0 && `(+${formatPercent(revaloPrixPart)} / an)`}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendement implicite</div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatPercent(calculDemembrement.rendementImpliciteNuePro)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            TRI annuel moyen
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coefficient fiscal</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {formatPercent(calculDemembrement.coeffNuePro * 100)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Barème fiscal âge {age} ans
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-600 p-4 rounded">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Avantage :</strong> Pas de fiscalité sur les revenus pendant la durée du démembrement.
            Récupération automatique de la pleine propriété à terme. Idéal pour capitaliser sans imposition.
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultatsUsufruit = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-600" />
        Résultats Usufruit
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix d'achat</div>
          <div className="text-2xl font-bold text-emerald-600">{formatEuro(calculDemembrement.prixUsufruit)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Coefficient : {formatPercent(calculDemembrement.coeffUsufruit * 100)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenus nets/an</div>
          <div className="text-2xl font-bold text-emerald-600">{formatEuro(calculDemembrement.revenuNetAnnuel)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Après IR et PS
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenus totaux sur {duree} ans</div>
          <div className="text-2xl font-bold text-emerald-600">{formatEuro(calculDemembrement.revenusTotauxUsufruit)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Cumul nets
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendement global</div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatPercent(calculDemembrement.rendementGlobalUsufruit)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Rendement moyen annuel
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-600 p-4 rounded">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Avantage :</strong> Revenus immédiats et investissement initial réduit.
            Attention : capital nul en fin de période, revenus soumis à l'IR + PS.
          </div>
        </div>
      </div>
    </div>
  );

  const renderGraphiqueEvolution = () => {
    const data = calculDemembrement.timeline;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Évolution sur {duree} ans
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="annee"
              label={{ value: 'Années', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
            />
            <Tooltip
              formatter={(value: number) => formatEuro(value)}
              labelFormatter={(label) => `Année ${label}`}
            />
            <Legend />
            {mode === 'usufruit' && (
              <Area
                type="monotone"
                dataKey="revenusCumulesUsufruit"
                name="Revenus cumulés Usufruit"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            )}
            {mode === 'nue-pro' && (
              <Area
                type="step"
                dataKey="valeurNuePro"
                name="Valeur Nue-propriété"
                stroke="#059669"
                fill="#10b981"
                fillOpacity={0.6}
              />
            )}
            {mode === 'comparatif' && (
              <>
                <Area
                  type="monotone"
                  dataKey="revenusCumulesUsufruit"
                  name="Revenus cumulés Usufruit"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Area
                  type="step"
                  dataKey="valeurNuePro"
                  name="Valeur Nue-propriété"
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTableauComparatif = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Tableau comparatif
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Critère</th>
              <th className="text-right py-3 px-4 font-semibold text-emerald-600">Nue-propriété</th>
              <th className="text-right py-3 px-4 font-semibold text-emerald-600">Usufruit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Prix d'acquisition</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatEuro(calculDemembrement.prixNuePro)}</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatEuro(calculDemembrement.prixUsufruit)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Revenus nets/an</td>
              <td className="py-3 px-4 text-right text-gray-500">0 €</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatEuro(calculDemembrement.revenuNetAnnuel)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Revenus totaux</td>
              <td className="py-3 px-4 text-right text-gray-500">0 €</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatEuro(calculDemembrement.revenusTotauxUsufruit)}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Valeur finale (an {duree})</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatEuro(calculDemembrement.montantPP)}</td>
              <td className="py-3 px-4 text-right text-gray-500">0 €</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Rendement annuel</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatPercent(calculDemembrement.rendementImpliciteNuePro)}</td>
              <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatPercent(calculDemembrement.rendementGlobalUsufruit)}</td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fiscalité</td>
              <td className="py-3 px-4 text-right text-xs text-emerald-600">Aucune pendant la durée</td>
              <td className="py-3 px-4 text-right text-xs text-emerald-600">IR + PS sur revenus</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExplicationsPedagogiques = () => (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 mb-6">
      <button
        onClick={() => setShowExplanations(!showExplanations)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-600" />
          Comment fonctionne le démembrement ?
        </h3>
        {showExplanations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showExplanations && (
        <div className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-600 mb-3">🏛️ Nue-propriété</h4>
            <ul className="space-y-2 list-none">
              <li>• Vous achetez la valeur des parts (les "murs"), pas les revenus.</li>
              <li>• Prix décoté par rapport à la pleine propriété (la nue-pro vaut souvent 50 à 80 % de la PP selon la durée).</li>
              <li>• Aucun revenu pendant la période, donc pas d'impôt ni de prélèvements sociaux sur ces parts pendant le démembrement.</li>
              <li>• À l'échéance, vous récupérez automatiquement la pleine propriété sans repayer la différence.</li>
              <li>• <strong>Idéal :</strong> capitalisation long terme, préparation de la transmission, optimisation patrimoniale en démembrement temporaire.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-600 mb-3">💰 Usufruit</h4>
            <ul className="space-y-2 list-none">
              <li>• Vous achetez uniquement le droit aux revenus sur une durée donnée.</li>
              <li>• Prix réduit par rapport à la pleine propriété (clé fixée par la SCPI selon la durée du démembrement).</li>
              <li>• Revenus immédiats, imposés à l'IR + prélèvements sociaux en personne physique ou à l'IS en société.</li>
              <li>• En fin de période, l'usufruit s'éteint : vous ne récupérez aucun capital.</li>
              <li>• <strong>Idéal :</strong> besoin de cash-flow (retraite, complément de revenus) ou optimisation de trésorerie en société à l'IS.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-600 mb-3">⚖️ Quel profil pour quel choix ?</h4>
            <div className="space-y-3">
              <div>
                <strong className="text-emerald-600">Nue-propriété :</strong>
                <ul className="ml-4 mt-1 space-y-1 list-none text-gray-600 dark:text-gray-400">
                  <li>- Jeune actif ou contribuable avec TMI élevée,</li>
                  <li>- Objectif de capitalisation long terme,</li>
                  <li>- Transmission (donation de NP),</li>
                  <li>- Patrimoine logé en SCI ou structure patrimoniale.</li>
                </ul>
              </div>
              <div>
                <strong className="text-emerald-600">Usufruit :</strong>
                <ul className="ml-4 mt-1 space-y-1 list-none text-gray-600 dark:text-gray-400">
                  <li>- Retraité ou foyer à TMI faible,</li>
                  <li>- Besoin de revenus immédiats et temporaires,</li>
                  <li>- Société à l'IS qui cherche à optimiser son résultat en transformant de la trésorerie dormante en revenus amortissables.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNueProDonutCard = () => {
    const gainNuePro = Math.max(calculDemembrement.montantPPFinal - calculDemembrement.prixNuePro, 0);
    const dataNuePro = [
      { name: "Investissement", value: calculDemembrement.prixNuePro, color: "#0f172a" },
      { name: "Gain potentiel", value: gainNuePro, color: "#22c55e" },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Nue-propriété : Investissement vs Gain
        </h4>
        <div className="flex justify-center">
          <PieChart
            data={dataNuePro}
            width={280}
            height={280}
            showLabels={true}
            animated={true}
          />
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-slate-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Investi</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">{formatEuro(calculDemembrement.prixNuePro)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Valeur à terme</span>
            </div>
            <span className="font-semibold text-emerald-600">{formatEuro(calculDemembrement.montantPPFinal)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rendement implicite</span>
            <span className="text-lg font-bold text-emerald-600">{formatPercent(calculDemembrement.rendementImpliciteNuePro)} / an</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
          En nue-propriété, toute la performance vient de la décote d'entrée et de la valeur de la pleine propriété récupérée à l'échéance.
        </p>
      </div>
    );
  };

  const renderUsufruitDonutCard = () => {
    const revenusNetsCumules = calculDemembrement.revenusTotauxUsufruit;
    const dataUsufruit = [
      { name: "Investissement", value: calculDemembrement.prixUsufruit, color: "#0f172a" },
      { name: "Revenus nets", value: Math.max(revenusNetsCumules, 0), color: "#eab308" },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Usufruit : Investissement vs Revenus
        </h4>
        <div className="flex justify-center">
          <PieChart
            data={dataUsufruit}
            width={280}
            height={280}
            showLabels={true}
            animated={true}
          />
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-slate-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Investi</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">{formatEuro(calculDemembrement.prixUsufruit)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenus cumulés</span>
            </div>
            <span className="font-semibold text-yellow-600">{formatEuro(revenusNetsCumules)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rendement global</span>
            <span className="text-lg font-bold text-yellow-600">{formatPercent(calculDemembrement.rendementGlobalUsufruit)} / an</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
          En usufruit, la performance provient exclusivement des revenus perçus pendant la durée du démembrement, sans capital récupéré à la fin.
        </p>
      </div>
    );
  };

  const renderVisualisationGraphique = () => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Visualisation graphique
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Comprenez en un coup d'œil la mécanique nue-propriété / usufruit
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {(mode === "nue-pro" || mode === "comparatif") && renderNueProDonutCard()}
        {(mode === "usufruit" || mode === "comparatif") && renderUsufruitDonutCard()}
      </div>
    </div>
  );

  const renderCTASection = () => (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-2xl p-8 text-center text-white">
      <h3 className="text-2xl font-bold mb-3">
        Besoin d'un conseil personnalisé ?
      </h3>
      <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
        Le démembrement est une stratégie avancée qui nécessite une analyse sur-mesure
        de votre situation fiscale et patrimoniale. Nos experts vous accompagnent.
      </p>
      <button
        onClick={() => {
          if (onCtaClick) onCtaClick();
          if (ctaUrl.startsWith('#')) {
            const element = document.querySelector(ctaUrl);
            element?.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = ctaUrl;
          }
        }}
        className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
      >
        Prendre rendez-vous gratuitement
      </button>
    </div>
  );

  const memoResultatsNuePro = useMemo(
    () => renderResultatsNuePro(),
    [calculDemembrement, duree, revaloPrixPart, age, formatEuro, formatPercent]
  );

  const memoResultatsUsufruit = useMemo(
    () => renderResultatsUsufruit(),
    [calculDemembrement, duree, revaloPrixPart, age, formatEuro, formatPercent]
  );

  const memoTableauComparatif = useMemo(
    () => renderTableauComparatif(),
    [calculDemembrement, duree, revaloPrixPart, valeurNueProManuellePourcent, age, formatEuro, formatPercent]
  );

  const memoVisualisationGraphique = useMemo(
    () => renderVisualisationGraphique(),
    [calculDemembrement, mode, formatEuro, formatPercent]
  );

  const memoGraphiqueEvolution = useMemo(
    () => renderGraphiqueEvolution(),
    [calculDemembrement, mode, formatEuro, formatPercent, duree]
  );

  const memoExplicationsPedagogiques = useMemo(
    () => renderExplicationsPedagogiques(),
    [calculDemembrement, mode, formatEuro, formatPercent, duree]
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
          Simulateur Démembrement SCPI
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Comparez nue-propriété et usufruit : deux stratégies, deux profils d'investisseur
        </p>
      </div>

      {renderModeSelector()}
      {renderParametresBase()}

      {mode === 'nue-pro' && memoResultatsNuePro}
      {mode === 'usufruit' && memoResultatsUsufruit}
      {mode === 'comparatif' && (
        <>
          {memoResultatsNuePro}
          {memoResultatsUsufruit}
          {memoTableauComparatif}
        </>
      )}

      {memoVisualisationGraphique}
      {memoGraphiqueEvolution}
      {memoExplicationsPedagogiques}
      {renderCTASection()}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 text-center">
        <AlertCircle className="w-4 h-4 inline mr-2" />
        Les calculs sont fournis à titre indicatif et ne constituent pas un conseil en investissement.
        Consultez un professionnel pour une analyse personnalisée.
      </div>
    </div>
  );
};

export default ScpiDemembrementSimulator;
