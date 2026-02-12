import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFiscalISModel } from '../hooks/useFiscalISModel';
import { generateISReportPDF } from '../lib/pdfIS';

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const formatPercent = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);

const formatPoints = (value: number) => {
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  return `${sign}${value.toFixed(2)} pts`;
};

type TaxPreset = '15' | '25' | 'custom';

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const SimulateurTresorerieIS: React.FC = () => {
  const [investedAmount, setInvestedAmount] = useState(100000);
  const [grossYieldRate, setGrossYieldRate] = useState(5);
  const [taxPreset, setTaxPreset] = useState<TaxPreset>('25');
  const [corporateTaxRate, setCorporateTaxRate] = useState(25);
  const [years, setYears] = useState(10);
  const [capitalize, setCapitalize] = useState(false);
  const [revalorizeCapital, setRevalorizeCapital] = useState(false);
  const [revalorizationRate, setRevalorizationRate] = useState(1.5);
  const [exitTaxEnabled, setExitTaxEnabled] = useState(false);
  const [exitTaxRate, setExitTaxRate] = useState(25);
  const [amortizationEnabled, setAmortizationEnabled] = useState(false);
  const [amortizationYears, setAmortizationYears] = useState(20);
  const [amortizationShare, setAmortizationShare] = useState(80);
  const [subscriptionFeesRate, setSubscriptionFeesRate] = useState(10);
  const [delaiJouissanceMonths, setDelaiJouissanceMonths] = useState(0);
  const [showExpertTable, setShowExpertTable] = useState(false);

  const normalizedTaxRate = useMemo(() => {
    if (taxPreset === '15') return 15;
    if (taxPreset === '25') return 25;
    return corporateTaxRate;
  }, [corporateTaxRate, taxPreset]);

  const simulation = useFiscalISModel({
    investedAmount,
    grossYieldRate,
    corporateTaxRate: normalizedTaxRate,
    years,
    capitalize,
    revalorizeCapital,
    revalorizationRate,
    exitTaxEnabled,
    exitTaxRate,
    amortizationEnabled,
    amortizationYears,
    amortizationShare,
    subscriptionFeesRate,
    delaiJouissanceMonths
  });

  const chartData = simulation.projections.map(item => ({
    year: item.year,
    cash: item.cumulativeNetCash
  }));

  const handleExport = () => {
    generateISReportPDF({
      inputs: {
        investedAmount,
        grossYieldRate,
        corporateTaxRate: normalizedTaxRate,
        years,
        capitalize,
        revalorizeCapital,
        revalorizationRate,
        exitTaxEnabled,
        exitTaxRate,
        amortizationEnabled,
        amortizationYears,
        amortizationShare,
        subscriptionFeesRate,
        delaiJouissanceMonths
      },
      result: simulation
    });
  };

  const impactPoints =
    simulation.summary.irrImpact === null ? null : simulation.summary.irrImpact * 100;
  const totalGrossIncome = useMemo(() => {
    return simulation.projections.reduce((sum, row) => sum + row.grossIncome, 0);
  }, [simulation.projections]);
  const effectiveTaxRate = totalGrossIncome > 0
    ? simulation.summary.totalCorporateTax / totalGrossIncome
    : 0;
  const totalTaxWithoutAmort = simulation.summary.deltaIsPaid === null
    ? null
    : simulation.summary.totalCorporateTax + simulation.summary.deltaIsPaid;
  const fiscalEfficiency = totalTaxWithoutAmort && totalTaxWithoutAmort > 0
    ? simulation.summary.deltaIsPaid! / totalTaxWithoutAmort
    : null;
  const performanceOnProductiveCapital = simulation.summary.capitalProductive > 0
    ? simulation.summary.annualNetIncome / simulation.summary.capitalProductive
    : null;

  const debugEnabled = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).has('debug');
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">Simulateur</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
            Trésorerie IS – <span className="text-emerald-400">SCPI</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Outil pédagogique pour estimer une trésorerie nette soumise à l’IS.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
          <div className="lg:sticky lg:top-[120px] self-start bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paramètres <span className="text-emerald-400">clés</span>
            </h2>

            <div>
              <label className="text-sm text-gray-600 dark:text-white">Montant investi (€)</label>
              <input
                type="number"
                min={0}
                value={investedAmount}
                onChange={(event) => setInvestedAmount(Math.max(0, Number(event.target.value)))}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-white">Frais de souscription (%)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={subscriptionFeesRate}
                  onChange={(event) => setSubscriptionFeesRate(clampNumber(Number(event.target.value), 0, 20))}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-white">Délai de jouissance (mois)</label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={delaiJouissanceMonths}
                  onChange={(event) => setDelaiJouissanceMonths(clampNumber(Number(event.target.value), 0, 12))}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-white">Rendement brut annuel estimé (%)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={grossYieldRate}
                onChange={(event) => setGrossYieldRate(clampNumber(Number(event.target.value), 0, 20))}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-white">Taux IS (%)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['15', '25', 'custom'] as TaxPreset[]).map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTaxPreset(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs border ${
                      taxPreset === preset
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                        : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {preset === '15' ? '15 %' : preset === '25' ? '25 %' : 'Custom'}
                  </button>
                ))}
              </div>

              {taxPreset === 'custom' && (
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={corporateTaxRate}
                  onChange={(event) => setCorporateTaxRate(clampNumber(Number(event.target.value), 0, 50))}
                  className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-white">Durée projection (années)</label>
              <input
                type="number"
                min={1}
                max={15}
                value={years}
                onChange={(event) => setYears(clampNumber(Number(event.target.value), 1, 15))}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(event) => setCapitalize(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Capitalisation des revenus
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={revalorizeCapital}
                onChange={(event) => setRevalorizeCapital(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Revalorisation du capital
            </label>

            {revalorizeCapital && (
              <div>
                <label className="text-sm text-gray-600 dark:text-white">Taux de revalorisation annuel (%)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={revalorizationRate}
                  onChange={(event) => setRevalorizationRate(clampNumber(Number(event.target.value), 0, 10))}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            )}

            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={exitTaxEnabled}
                onChange={(event) => setExitTaxEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Fiscalité sur plus-value à la sortie
            </label>

            {exitTaxEnabled && (
              <div>
                <label className="text-sm text-gray-600 dark:text-white">Taux IS sortie (%)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={exitTaxRate}
                  onChange={(event) => setExitTaxRate(clampNumber(Number(event.target.value), 0, 50))}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            )}

            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-white">
              <input
                type="checkbox"
                checked={amortizationEnabled}
                onChange={(event) => setAmortizationEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Amortissement comptable (SCI IS)
            </label>

            {amortizationEnabled && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-white">Durée amortissement (années)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={amortizationYears}
                    onChange={(event) => setAmortizationYears(clampNumber(Number(event.target.value), 1, 40))}
                    className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white">Quote-part amortissable (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={amortizationShare}
                    onChange={(event) => setAmortizationShare(clampNumber(Number(event.target.value), 0, 100))}
                    className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="w-full mt-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-400"
            >
              Exporter PDF synthèse
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-950 border border-emerald-500/30 dark:border-emerald-400/20 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Résumé exécutif</h3>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-emerald-500/15 text-emerald-200">
                  📌 Efficacité fiscale du montage :
                  <span className="font-semibold text-emerald-300">
                    {fiscalEfficiency === null ? 'Non calculable' : formatPercent(fiscalEfficiency * 100)}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">TRI net IS</p>
                  <p className="text-2xl font-semibold text-emerald-300">
                    {simulation.summary.simplifiedIrr === null
                      ? 'Non calculable'
                      : formatPercent(simulation.summary.simplifiedIrr * 100)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">TRI brut</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {simulation.summary.grossIrr === null
                      ? 'Non calculable'
                      : formatPercent(simulation.summary.grossIrr * 100)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Impact fiscal (pts)</p>
                  <p className="text-xl font-semibold text-emerald-300">
                    {impactPoints === null ? 'Non calculable' : formatPoints(impactPoints)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Cash net cumulé</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.cumulativeNetCash)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Capital final net</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.capitalNetFinal)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Valeur totale récupérée</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.totalRecovered)}
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-500 dark:text-white">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Comparatif amortissement</p>
                  <div className="flex flex-wrap gap-4">
                    <span>Gain fiscal amortissement : <strong className="text-emerald-300">{formatEuro(simulation.summary.amortizationTaxSaving)}</strong></span>
                    <span>Gain TRI : <strong>{simulation.summary.deltaIrrAmortizationPts === null ? 'Non calculable' : formatPoints(simulation.summary.deltaIrrAmortizationPts * 100)}</strong></span>
                    <span>Réduction IS cumulée : <strong className="text-emerald-300">{simulation.summary.deltaIsPaid === null ? 'Non calculable' : formatEuro(simulation.summary.deltaIsPaid)}</strong></span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-500 dark:text-white">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Performance réelle du capital productif</p>
                  <div className="flex flex-wrap gap-4">
                    <span>Capital productif : <strong>{formatEuro(simulation.summary.capitalProductive)}</strong></span>
                    <span>Capital investi : <strong>{formatEuro(investedAmount)}</strong></span>
                    <span>Performance : <strong className="text-emerald-300">{performanceOnProductiveCapital === null ? 'Non calculable' : formatPercent(performanceOnProductiveCapital * 100)}</strong></span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500 dark:text-white">
                Dans cette hypothèse, la détention via IS permet de générer{' '}
                <strong>{formatEuro(simulation.summary.cumulativeNetCash)}</strong> de trésorerie nette cumulée
                {amortizationEnabled && simulation.summary.deltaIrrAmortizationPts !== null
                  ? ` et d’améliorer la performance de ${formatPoints(simulation.summary.deltaIrrAmortizationPts * 100)} grâce à l’amortissement.`
                  : '.'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Fiscalité & Structure IS
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-white">
                <div>
                  <p>IS total payé</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.totalCorporateTax)}
                  </p>
                </div>
                <div>
                  <p>IS sortie</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.exitTax)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Base taxable sortie : {formatEuro(simulation.summary.plusValueTaxable)}
                  </p>
                  <p className="text-xs text-gray-400">
                    IS sortie calculé sur : Plus-value (Capital brut final – VNC)
                  </p>
                </div>
                {amortizationEnabled && (
                  <div>
                    <p>Économie IS amortissement</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatEuro(simulation.summary.amortizationTaxSaving)}
                    </p>
                  </div>
                )}
                <div>
                  <p>Taux effectif moyen d’IS</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPercent(effectiveTaxRate * 100)}
                  </p>
                </div>
                {simulation.summary.deficitReportableCumule > 0 && (
                  <div>
                    <p>Déficit reporté cumulé</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatEuro(simulation.summary.deficitReportableCumule)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Flux & Capital
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-white">
                <div>
                  <p>Capital réellement productif</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.capitalProductive)}
                  </p>
                </div>
                <div>
                  <p>Frais de souscription payés</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(investedAmount - simulation.summary.capitalProductive)}
                  </p>
                </div>
                <div>
                  <p>Délai de jouissance</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {delaiJouissanceMonths} mois
                  </p>
                </div>
                <div>
                  <p>Capital brut final</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.capitalFinal)}
                  </p>
                </div>
                <div>
                  <p>VNC</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.vnc)}
                  </p>
                </div>
                <div>
                  <p>Plus-value taxable</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatEuro(simulation.summary.plusValueTaxable)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Projection cash net cumulé
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#374151" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#e5e7eb', fontSize: 12 }}
                      axisLine={{ stroke: '#4b5563' }}
                      tickLine={{ stroke: '#4b5563' }}
                    />
                    <YAxis
                      tick={{ fill: '#e5e7eb', fontSize: 12 }}
                      axisLine={{ stroke: '#4b5563' }}
                      tickLine={{ stroke: '#4b5563' }}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        color: '#f9fafb'
                      }}
                      itemStyle={{ color: '#f9fafb' }}
                      labelStyle={{ color: '#9ca3af' }}
                      formatter={(value: number) => formatEuro(value)}
                      labelFormatter={(label) => `Année ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="cash"
                      stroke="#34d399"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 0, fill: '#34d399' }}
                      activeDot={{ r: 5, fill: '#6ee7b7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Tableau année par année
                </h3>
                <button
                  type="button"
                  onClick={() => setShowExpertTable(prev => !prev)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-200"
                >
                  {showExpertTable ? 'Vue standard' : 'Vue expert'}
                </button>
              </div>
              <div className="overflow-auto">
                {!showExpertTable ? (
                  <table className="min-w-full text-sm">
                    <thead className="text-gray-500 dark:text-white">
                      <tr className="border-b border-emerald-500/30 dark:border-emerald-400/20">
                        <th className="text-left py-2">Année</th>
                        <th className="text-left py-2">Revenus bruts</th>
                        <th className="text-left py-2">IS payé</th>
                        <th className="text-left py-2">Revenus nets</th>
                        <th className="text-left py-2">Cash cumulé</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900 dark:text-white">
                      {simulation.projections.map(row => (
                        <tr key={row.year} className="border-b border-gray-100 dark:border-gray-900">
                          <td className="py-2">{row.year}</td>
                          <td className="py-2">{formatEuro(row.grossIncome)}</td>
                          <td className="py-2">{formatEuro(row.corporateTax)}</td>
                          <td className="py-2">{formatEuro(row.netIncome)}</td>
                          <td className="py-2">{formatEuro(row.cumulativeNetCash)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead className="text-gray-500 dark:text-white">
                      <tr className="border-b border-emerald-500/30 dark:border-emerald-400/20">
                        <th className="text-left py-2">Année</th>
                        <th className="text-left py-2">Brut</th>
                        <th className="text-left py-2">Amort.</th>
                        <th className="text-left py-2">Résultat fiscal</th>
                        <th className="text-left py-2">IS théorique</th>
                        <th className="text-left py-2">IS réel</th>
                        <th className="text-left py-2">Net</th>
                        <th className="text-left py-2">Cash cumulé</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-900 dark:text-white">
                      {simulation.projections.map(row => (
                        <tr key={row.year} className="border-b border-gray-100 dark:border-gray-900">
                          <td className="py-2">{row.year}</td>
                          <td className="py-2">{formatEuro(row.grossIncome)}</td>
                          <td className="py-2">{formatEuro(row.amortizationAnnual)}</td>
                          <td className="py-2">{formatEuro(row.taxableResult)}</td>
                          <td className="py-2">{formatEuro(row.corporateTaxNoAmort)}</td>
                          <td className="py-2">{formatEuro(row.corporateTax)}</td>
                          <td className="py-2">{formatEuro(row.netIncome)}</td>
                          <td className="py-2">{formatEuro(row.cumulativeNetCash)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <p className="mt-4 text-xs text-gray-500 dark:text-white">
                Simulation pédagogique – ne constitue pas une recommandation.
              </p>
            </div>

            {debugEnabled && (
              <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-4 text-xs text-gray-200">
                <div className="font-semibold uppercase tracking-wide text-gray-300 mb-2">Debug interne</div>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>Capital brut final : {formatEuro(simulation.summary.capitalFinal)}</div>
                  <div>VNC : {formatEuro(simulation.summary.vnc)}</div>
                  <div>Plus-value taxable : {formatEuro(simulation.summary.plusValueTaxable)}</div>
                  <div>IS sortie : {formatEuro(simulation.summary.exitTax)}</div>
                  <div>Amortissements cumulés : {formatEuro(simulation.summary.amortizationCumulated)}</div>
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default SimulateurTresorerieIS;
