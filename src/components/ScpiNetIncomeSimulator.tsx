import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, Plus, Minus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScpiNetIncomeSimulatorProps {
  defaultAmount?: number;
  defaultYield?: number;
  defaultTmi?: number;
  ctaUrl?: string;
  onCtaClick?: () => void;
}

const ScpiNetIncomeSimulator: React.FC<ScpiNetIncomeSimulatorProps> = ({
  defaultAmount = 50000,
  defaultYield = 5,
  defaultTmi = 30,
  ctaUrl = '#contact',
  onCtaClick
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [yieldRate, setYieldRate] = useState(defaultYield);
  const [tmi, setTmi] = useState(defaultTmi);
  const [fiscalRegime, setFiscalRegime] = useState<'foncier' | 'pfu'>('foncier');
  const [horizon, setHorizon] = useState(15);
  const [reinvest, setReinvest] = useState(false);

  // Nouveaux paramètres
  const [delaiJouissanceMois, setDelaiJouissanceMois] = useState(6);
  const [fraisEntreePourcent, setFraisEntreePourcent] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [origineRevenus, setOrigineRevenus] = useState<'france' | 'international'>('france');

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fonction pour calculer le taux de prélèvements sociaux selon l'origine des revenus
  const getTauxPS = (origine: 'france' | 'international'): number => {
    if (origine === 'france') return 0.172; // 17,2 % pour les SCPI France
    return 0; // Pas de PS sur les revenus principalement étrangers (modélisation simplifiée)
  };

  const calculations = useMemo(() => {
    // Écart souscription/retrait (base de rendement = montant versé)
    const montantVerse = amount;
    const tauxFraisEntree = fraisEntreePourcent / 100;
    const valeurRetraitImmediat = montantVerse * (1 - tauxFraisEntree);
    const fraisEntreeEuros = montantVerse - valeurRetraitImmediat;

    // Mois productifs en année 1
    const moisProductifsAn1 = Math.max(0, 12 - delaiJouissanceMois);
    const prorata = moisProductifsAn1 / 12;

    // Revenus bruts année pleine et année 1 (calculés sur montantVerse)
    const grossAnnualFull = montantVerse * (yieldRate / 100);
    const grossAnnualYear1 = grossAnnualFull * prorata;

    // Taux de prélèvements sociaux selon l'origine des revenus
    const tauxPS = getTauxPS(origineRevenus);

    // Calcul des impôts année pleine
    let taxesIRFull = 0;
    let taxesPSFull = 0;
    let taxesFull = 0;

    if (fiscalRegime === 'foncier') {
      taxesIRFull = grossAnnualFull * (tmi / 100);
      taxesPSFull = grossAnnualFull * tauxPS;
      taxesFull = taxesIRFull + taxesPSFull;
    } else {
      // PFU : modélisation simplifiée (30% global pour France, idem pour international)
      taxesFull = grossAnnualFull * 0.30;
      taxesIRFull = grossAnnualFull * 0.128; // approximation IR dans PFU
      taxesPSFull = grossAnnualFull * 0.172; // approximation PS dans PFU (pour affichage)
    }

    // Calcul des impôts année 1
    let taxesIRYear1 = 0;
    let taxesPSYear1 = 0;
    let taxesYear1 = 0;

    if (fiscalRegime === 'foncier') {
      taxesIRYear1 = grossAnnualYear1 * (tmi / 100);
      taxesPSYear1 = grossAnnualYear1 * tauxPS;
      taxesYear1 = taxesIRYear1 + taxesPSYear1;
    } else {
      taxesYear1 = grossAnnualYear1 * 0.30;
      taxesIRYear1 = grossAnnualYear1 * 0.128;
      taxesPSYear1 = grossAnnualYear1 * 0.172;
    }

    // Revenus nets
    const netAnnualFull = grossAnnualFull - taxesFull;
    const netAnnualYear1 = grossAnnualYear1 - taxesYear1;
    const netMonthlyFull = netAnnualFull / 12;
    const netMonthlyYear1 = netAnnualYear1 / 12;

    // Rendements nets (calculés sur montantVerse)
    const rendementNetYear1 = montantVerse > 0 ? (netAnnualYear1 / montantVerse) * 100 : 0;
    const rendementNetFull = montantVerse > 0 ? (netAnnualFull / montantVerse) * 100 : 0;

    // Temps pour amortir l'écart souscription/retrait
    const nbAnneesAmortissementFrais = netAnnualFull > 0 ? fraisEntreeEuros / netAnnualFull : 0;

    // Projection sans réinvestissement
    let cumulativeWithoutReinvest = 0;
    if (horizon === 1) {
      cumulativeWithoutReinvest = netAnnualYear1;
    } else {
      cumulativeWithoutReinvest = netAnnualYear1 + netAnnualFull * (horizon - 1);
    }

    // Projection avec réinvestissement
    let capitalWithReinvest = montantVerse;
    let cumulativeNetWithReinvest = 0;
    const projectionData = [];

    for (let year = 1; year <= horizon; year++) {
      let yearGross = 0;
      let yearTaxes = 0;
      let yearNet = 0;

      if (year === 1) {
        // Année 1 avec délai de jouissance
        yearGross = capitalWithReinvest * (yieldRate / 100) * prorata;
        if (fiscalRegime === 'foncier') {
          yearTaxes = yearGross * (tmi / 100) + yearGross * tauxPS;
        } else {
          yearTaxes = yearGross * 0.30;
        }
        yearNet = yearGross - yearTaxes;
      } else {
        // Années suivantes en pleine jouissance
        yearGross = capitalWithReinvest * (yieldRate / 100);
        if (fiscalRegime === 'foncier') {
          yearTaxes = yearGross * (tmi / 100) + yearGross * tauxPS;
        } else {
          yearTaxes = yearGross * 0.30;
        }
        yearNet = yearGross - yearTaxes;
      }

      cumulativeNetWithReinvest += yearNet;

      if (reinvest) {
        capitalWithReinvest += yearNet;
      }

      projectionData.push({
        year,
        sansReinvest: montantVerse + (year === 1 ? netAnnualYear1 : netAnnualYear1 + netAnnualFull * (year - 1)),
        avecReinvest: capitalWithReinvest,
        revenus: reinvest ? capitalWithReinvest - montantVerse : (year === 1 ? netAnnualYear1 : netAnnualYear1 + netAnnualFull * (year - 1))
      });
    }

    return {
      montantVerse,
      valeurRetraitImmediat,
      fraisEntreeEuros,
      grossAnnualFull,
      grossAnnualYear1,
      taxesFull,
      taxesYear1,
      taxesIRFull,
      taxesPSFull,
      taxesIRYear1,
      taxesPSYear1,
      netAnnualFull,
      netAnnualYear1,
      netMonthlyFull,
      netMonthlyYear1,
      rendementNetYear1,
      rendementNetFull,
      nbAnneesAmortissementFrais,
      cumulativeWithoutReinvest,
      cumulativeWithReinvest: cumulativeNetWithReinvest,
      finalCapitalWithReinvest: capitalWithReinvest,
      projectionData
    };
  }, [amount, yieldRate, tmi, fiscalRegime, horizon, reinvest, delaiJouissanceMois, fraisEntreePourcent, origineRevenus]);

  const chartData = [
    {
      name: 'Année 1',
      'Brut': calculations.grossAnnualYear1,
      'Net': calculations.netAnnualYear1
    },
    {
      name: 'Année pleine',
      'Brut': calculations.grossAnnualFull,
      'Net': calculations.netAnnualFull
    }
  ];

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(1000, Math.min(5000000, amount + delta));
    setAmount(newAmount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Simulateur de revenus nets SCPI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Estimez vos revenus réels après fiscalité, frais d'entrée et délai de jouissance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* COLONNE GAUCHE - INPUTS */}
          <div className="space-y-6">
            {/* Montant investi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Montant versé
              </label>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => adjustAmount(-10000)}
                  className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 rounded-lg transition-colors"
                >
                  <Minus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1000, Math.min(5000000, Number(e.target.value))))}
                  step={1000}
                  min={1000}
                  max={5000000}
                  className="flex-1 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={() => adjustAmount(10000)}
                  className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </button>
              </div>
              <input
                type="range"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1000}
                max={5000000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1 000 €</span>
                <span>5 000 000 €</span>
              </div>
            </div>

            {/* Rendement brut */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Rendement brut annuel moyen estimé de la SCPI : <span className="text-xl text-green-600 dark:text-green-400">{yieldRate}%</span>
              </label>
              <input
                type="range"
                value={yieldRate}
                onChange={(e) => setYieldRate(Number(e.target.value))}
                min={2}
                max={10}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>2%</span>
                <span>10%</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 space-y-1">
                <p>Hypothèse de rendement brut annuel moyen sur la durée de la simulation.</p>
                <p>Basé sur les derniers taux de distribution connus de la SCPI.</p>
                <p className="font-medium">Rendement non garanti, susceptible de varier à la hausse comme à la baisse.</p>
                <p className="italic mt-1">Exemple : une SCPI qui a distribué 5,10 % en 2024 peut être simulée avec 5 % comme rendement moyen prudent.</p>
              </div>
            </div>

            {/* TMI */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Tranche marginale d'imposition (TMI)
              </label>
              <select
                value={tmi}
                onChange={(e) => setTmi(Number(e.target.value))}
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-3 px-4 text-lg focus:outline-none focus:border-green-500"
              >
                <option value={0}>0% - Non imposable</option>
                <option value={11}>11%</option>
                <option value={30}>30%</option>
                <option value={41}>41%</option>
                <option value={45}>45%</option>
              </select>
            </div>

            {/* Régime fiscal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Régime fiscal
              </label>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  fiscalRegime === 'foncier' ? 'border-green-600 dark:border-green-400' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    value="foncier"
                    checked={fiscalRegime === 'foncier'}
                    onChange={(e) => setFiscalRegime(e.target.value as 'foncier')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Revenus fonciers</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">TMI + 17,2% de prélèvements sociaux</div>
                  </div>
                </label>
                <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  fiscalRegime === 'pfu' ? 'border-green-600 dark:border-green-400' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    value="pfu"
                    checked={fiscalRegime === 'pfu'}
                    onChange={(e) => setFiscalRegime(e.target.value as 'pfu')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Prélèvement Forfaitaire Unique (PFU)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">30% flat</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Origine des revenus */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Origine principale des loyers de la SCPI
              </label>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  origineRevenus === 'france' ? 'border-green-600 dark:border-green-400' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    value="france"
                    checked={origineRevenus === 'france'}
                    onChange={(e) => setOrigineRevenus(e.target.value as 'france')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">SCPI 100 % France</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Les revenus sont imposés en France et supportent les prélèvements sociaux de 17,2 %.
                    </div>
                  </div>
                </label>
                <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  origineRevenus === 'international' ? 'border-green-600 dark:border-green-400' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    value="international"
                    checked={origineRevenus === 'international'}
                    onChange={(e) => setOrigineRevenus(e.target.value as 'international')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">SCPI principalement Europe / international</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Les revenus proviennent majoritairement d'immeubles situés à l'étranger. Ils ne supportent généralement pas les prélèvements sociaux de 17,2 % en France. La fiscalité exacte dépend toutefois de chaque convention fiscale.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Paramètres avancés</span>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Frais d'entrée */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Frais d'entrée : <span className="text-lg text-green-600 dark:text-green-400">{fraisEntreePourcent}%</span>
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          Écart entre le prix de souscription et le prix de retrait. Les revenus sont calculés sur le montant versé, mais en cas de revente immédiate vous récupéreriez moins. Cet écart s'amortit avec le temps grâce aux revenus nets.
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      value={fraisEntreePourcent}
                      onChange={(e) => setFraisEntreePourcent(Number(e.target.value))}
                      min={0}
                      max={15}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Délai de jouissance */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Délai de jouissance : <span className="text-lg text-green-600 dark:text-green-400">{delaiJouissanceMois} mois</span>
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          Période pendant laquelle vos parts ne génèrent pas encore de revenus. La plupart des SCPI ont un délai de jouissance entre 3 et 6 mois.
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      value={delaiJouissanceMois}
                      onChange={(e) => setDelaiJouissanceMois(Number(e.target.value))}
                      min={0}
                      max={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0 mois</span>
                      <span>12 mois</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Horizon */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Horizon de placement : <span className="text-xl text-green-600 dark:text-green-400">{horizon} ans</span>
              </label>
              <input
                type="range"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1 an</span>
                <span>30 ans</span>
              </div>
            </div>

            {/* Réinvestissement */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    Réinvestissement des revenus
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Réinvestir automatiquement les revenus nets pour bénéficier de l'effet boule de neige
                  </div>
                </div>
                <button
                  onClick={() => setReinvest(!reinvest)}
                  className={`flex-shrink-0 w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    reinvest ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={reinvest}
                  aria-label="Activer le réinvestissement des revenus"
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-1 ${
                      reinvest ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {reinvest && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    ✅ Réinvestissement activé : vos revenus nets seront automatiquement réinvestis chaque année, augmentant progressivement votre capital et vos revenus futurs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE - RÉSULTATS */}
          <div className="space-y-6">
            {/* Card Frais d'entrée & capital investi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Détail de votre investissement
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Montant versé (base de calcul des revenus)</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.montantVerse)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Écart souscription / retrait estimé ({fraisEntreePourcent} %)</span>
                  <span className="font-semibold text-red-600">{formatEuro(calculations.fraisEntreeEuros)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Valeur de retrait théorique immédiate</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{formatEuro(calculations.valeurRetraitImmediat)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">⏱️ Temps estimé pour amortir cet écart avec vos revenus nets (année pleine)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{calculations.nbAnneesAmortissementFrais.toFixed(1)} ans</span>
                </div>
              </div>

              {/* Texte explicatif pédagogique */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold">Concrètement</span>, si vous revendiez immédiatement, vous perdriez environ <span className="font-semibold">{formatEuro(calculations.fraisEntreeEuros)}</span>.
                  {' '}Au bout d'environ <span className="font-semibold">{calculations.nbAnneesAmortissementFrais.toFixed(1)} ans</span> de revenus nets, cet écart est compensé (à rendement et fiscalité constants).
                  {' '}Les SCPI sont un investissement de long terme : la durée de détention recommandée est généralement d'au moins <span className="font-semibold">8 à 10 ans</span>.
                </p>
              </div>
            </div>

            {/* Card résultats principaux */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                Vos revenus nets
              </h3>
              <div className="space-y-4">
                {/* Année pleine */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenu net en année pleine</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatEuro(calculations.netAnnualFull)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Soit {formatEuro(calculations.netMonthlyFull)} / mois • Rendement net : {calculations.rendementNetFull.toFixed(2)}%
                  </div>
                </div>

                {/* Année 1 avec délai de jouissance */}
                {delaiJouissanceMois > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Revenu net la 1ère année (avec {delaiJouissanceMois} mois de jouissance)
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatEuro(calculations.netAnnualYear1)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Soit {formatEuro(calculations.netMonthlyYear1)} / mois • Rendement net : {calculations.rendementNetYear1.toFixed(2)}%
                    </div>
                  </div>
                )}

                {/* Récapitulatif détaillé */}
                <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Origine des loyers simulés : {origineRevenus === 'france' ? 'SCPI 100 % France' : 'SCPI principalement Europe / international'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Revenu brut annuel (année pleine)</span>
                    <span className="font-semibold dark:text-white">{formatEuro(calculations.grossAnnualFull)}</span>
                  </div>
                  {fiscalRegime === 'foncier' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Impôt sur le revenu estimé (TMI {tmi}%)</span>
                        <span className="font-semibold text-red-600">- {formatEuro(calculations.taxesIRFull)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Prélèvements sociaux {origineRevenus === 'france' ? '(17,2 %)' : '(0 %)'}
                        </span>
                        <span className="font-semibold text-red-600">
                          {origineRevenus === 'france'
                            ? `- ${formatEuro(calculations.taxesPSFull)}`
                            : '0 € (revenus majoritairement étrangers)'}
                        </span>
                      </div>
                    </>
                  )}
                  {fiscalRegime === 'pfu' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Prélèvement Forfaitaire Unique (30%)</span>
                      <span className="font-semibold text-red-600">- {formatEuro(calculations.taxesFull)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="dark:text-white">Revenu net annuel</span>
                    <span className="text-green-600 dark:text-green-400">{formatEuro(calculations.netAnnualFull)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <span>Taux d'imposition effectif</span>
                    <span>{((calculations.taxesFull / calculations.grossAnnualFull) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projections */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                Projection sur {horizon} ans
              </h3>
              <div className="space-y-4">
                <div className={`rounded-lg p-4 transition-all ${
                  !reinvest ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-slate-50 dark:bg-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Sans réinvestissement</div>
                    {!reinvest && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Actif</span>}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatEuro(calculations.cumulativeWithoutReinvest)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Revenus nets cumulés • Capital stable : {formatEuro(calculations.montantVerse)}
                  </div>
                </div>
                <div className={`rounded-lg p-4 transition-all ${
                  reinvest ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500' : 'bg-slate-50 dark:bg-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Avec réinvestissement</div>
                    {reinvest && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Actif</span>}
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatEuro(calculations.cumulativeWithReinvest)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Revenus nets cumulés • Capital final : {formatEuro(calculations.finalCapitalWithReinvest)}
                  </div>
                </div>
                {reinvest && (
                  <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Avantage du réinvestissement</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gain supplémentaire :</span>
                        <span className="font-bold">{formatEuro(calculations.cumulativeWithReinvest - calculations.cumulativeWithoutReinvest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capital accru :</span>
                        <span className="font-bold">+{formatEuro(calculations.finalCapitalWithReinvest - calculations.montantVerse)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-2 border-t border-green-200 dark:border-green-800">
                        <span>Multiplicateur :</span>
                        <span className="font-bold">×{(calculations.cumulativeWithReinvest / calculations.cumulativeWithoutReinvest).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {!reinvest && (
                  <div className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4" />
                      <span className="font-semibold">Conseil</span>
                    </div>
                    <p className="text-xs">
                      Activez le réinvestissement ci-dessus pour voir l'effet boule de neige sur {horizon} ans et comparer les deux stratégies.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BarChart - Brut vs Net */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comparaison brut / net
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatEuro(value)}
                  />
                  <Legend />
                  <Bar dataKey="Brut" fill="#94a3b8" />
                  <Bar dataKey="Net" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* LineChart - Évolution capital */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Évolution du capital sur {horizon} ans
                </h3>
                {reinvest && (
                  <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-semibold">
                    Comparaison active
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Années', position: 'insideBottom', offset: -5 }}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => formatEuro(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '10px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sansReinvest"
                    name="Sans réinvestissement"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ fill: '#94a3b8', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  {reinvest && (
                    <Line
                      type="monotone"
                      dataKey="avecReinvest"
                      name="Avec réinvestissement"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ fill: '#16a34a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
              {!reinvest && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setReinvest(true)}
                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium inline-flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Activer pour comparer avec réinvestissement
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                Optimisez votre stratégie d'investissement
              </h3>
              <p className="text-green-100 mb-4">
                Nos experts vous accompagnent pour maximiser vos revenus SCPI
              </p>
              {onCtaClick ? (
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Demander une étude personnalisée
                </button>
              ) : (
                <a
                  href={ctaUrl}
                  className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Demander une étude personnalisée
                </a>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 space-y-3">
              <p>
                ⚠️ L'écart souscription/retrait et le délai de jouissance sont indicatifs et peuvent varier selon les SCPI. Les revenus sont calculés sur le montant versé (prix de souscription). Cette simulation est simplifiée et ne remplace pas une étude personnalisée. Les performances passées ne préjugent pas des performances futures.
              </p>
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold">Fiscalité France vs International :</span> Pour les SCPI investies en France, les revenus sont imposés en France et supportent les prélèvements sociaux de 17,2 %.
                {' '}Pour les SCPI investies principalement à l'international, les revenus sont en général imposés dans le pays où se trouvent les immeubles et ne supportent pas les prélèvements sociaux de 17,2 % en France.
                {origineRevenus === 'international' && (
                  <> {' '}Pour rester prudente, la simulation applique ici votre TMI sur 100 % des revenus étrangers. En pratique, la fiscalité réelle est souvent inférieure et doit être vérifiée au cas par cas dans le cadre d'un conseil personnalisé.</>
                )}
                {origineRevenus === 'france' && (
                  <> {' '}La fiscalité exacte dépend toutefois de chaque convention fiscale et doit être vérifiée au cas par cas dans le cadre d'un conseil personnalisé.</>
                )}
              </p>
              {fiscalRegime === 'pfu' && origineRevenus === 'international' && (
                <p className="pt-2 border-t border-gray-200 dark:border-gray-700 text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Note PFU :</span> Le traitement des SCPI internationales au PFU est ici simplifié pour la simulation. Une analyse précise nécessite l'étude de chaque convention fiscale et de votre situation globale.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScpiNetIncomeSimulator;
