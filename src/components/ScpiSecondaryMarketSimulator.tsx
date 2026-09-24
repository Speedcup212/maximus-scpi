import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Euro, Gauge, Info, RotateCcw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import scpiDataExtended from '../data/scpiDataExtended';

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

const formatPct = (value: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number.isFinite(value) ? value : 0) + ' %';

const clamp = (value: number, min = 0, max = 100000000) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

type NumericInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  step?: number;
  max?: number;
  helper?: string;
};

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  max = 100000000,
  helper,
}) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</span>
    <div className="relative">
      <input
        type="number"
        value={value}
        min={0}
        max={max}
        step={step}
        onChange={(e) => {
          const next = e.currentTarget.valueAsNumber;
          onChange(Number.isFinite(next) ? clamp(next, 0, max) : 0);
        }}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 pr-14 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <span className="absolute right-4 top-[24px] -translate-y-1/2 text-sm text-gray-500">{suffix}</span>
    </div>
    {helper && <span className="block mt-1.5 text-xs text-gray-500 dark:text-gray-400">{helper}</span>}
  </label>
);

type HistoricalPricePeriod = {
  from: string;
  to: string;
  price: number;
};

// Historique validé progressivement. Le moteur n'auto-remplit que lorsqu'une période est connue.
// Les mois où un changement de prix intervient en cours de mois sont volontairement exclus.
const HISTORICAL_PRICES: Record<string, HistoricalPricePeriod[]> = {
  Primovie: [
    { from: '2018-01', to: '2024-01', price: 203 },
    { from: '2024-03', to: '2024-12', price: 185 },
    { from: '2025-02', to: '2026-05', price: 164 },
  ],
};

const findHistoricalPrice = (name: string, month: string): number | null => {
  if (!name || !month) return null;
  const periods = HISTORICAL_PRICES[name] || [];
  const match = periods.find((period) => month >= period.from && month <= period.to);
  return match?.price ?? null;
};

const ScpiSecondaryMarketSimulator: React.FC = () => {
  const [mode, setMode] = useState<'assisted' | 'manual'>('assisted');
  const [selectedScpiName, setSelectedScpiName] = useState('');
  const [acquisitionMonth, setAcquisitionMonth] = useState('');
  const acquisitionMonthPart = acquisitionMonth ? acquisitionMonth.slice(5, 7) : '';
  const acquisitionYearPart = acquisitionMonth ? acquisitionMonth.slice(0, 4) : '';

  const setAcquisitionDatePart = (month: string, year: string) => {
    if (month && year) {
      setAcquisitionMonth(`${year}-${month}`);
    } else {
      setAcquisitionMonth('');
    }
  };
  const [parts, setParts] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [saleFeesPct, setSaleFeesPct] = useState(0);
  const [annualDistributionPerPart, setAnnualDistributionPerPart] = useState(0);
  const [distributionsReceived, setDistributionsReceived] = useState(0);
  const [purchasePriceAuto, setPurchasePriceAuto] = useState(false);

  const scpiOptions = useMemo(
    () => [...scpiDataExtended].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    []
  );

  const selectedScpi = useMemo(
    () => scpiOptions.find((scpi) => scpi.name === selectedScpiName) || null,
    [scpiOptions, selectedScpiName]
  );

  const isPrimovieSecondaryMarket = selectedScpiName === 'Primovie';

  useEffect(() => {
    if (mode !== 'assisted' || !selectedScpi) return;

    if (isPrimovieSecondaryMarket) {
      setSalePrice(0);
    } else {
      setSalePrice(selectedScpi.valeurRetrait ?? selectedScpi.price ?? 0);
    }

    if (selectedScpi.distribution && selectedScpi.distribution > 0) {
      setAnnualDistributionPerPart(selectedScpi.distribution);
    } else if (selectedScpi.price > 0 && selectedScpi.yield > 0) {
      setAnnualDistributionPerPart(Number(((selectedScpi.price * selectedScpi.yield) / 100).toFixed(2)));
    } else {
      setAnnualDistributionPerPart(0);
    }
  }, [mode, selectedScpi, isPrimovieSecondaryMarket]);

  useEffect(() => {
    if (mode !== 'assisted' || !selectedScpiName || !acquisitionMonth) return;
    const historical = findHistoricalPrice(selectedScpiName, acquisitionMonth);
    if (historical !== null) {
      setPurchasePrice(historical);
      setPurchasePriceAuto(true);
    } else {
      setPurchasePriceAuto(false);
    }
  }, [mode, selectedScpiName, acquisitionMonth]);

  const r = useMemo(() => {
    const n = clamp(parts, 0, 1000000);
    const pp = clamp(purchasePrice);
    const sp = clamp(salePrice);
    const fees = clamp(saleFeesPct, 0, 30) / 100;
    const annual = clamp(annualDistributionPerPart);
    const received = clamp(distributionsReceived);

    const invested = n * pp;
    const grossExit = n * sp;
    const saleFees = grossExit * fees;
    const netExit = grossExit - saleFees;
    const capitalDelta = netExit - invested;
    const capitalDeltaPct = invested > 0 ? (capitalDelta / invested) * 100 : 0;
    const totalEconomic = netExit + received;
    const totalDelta = totalEconomic - invested;
    const totalDeltaPct = invested > 0 ? (totalDelta / invested) * 100 : 0;
    const annualIncome = n * annual;
    const lossToRecover = Math.max(0, invested - netExit - received);
    const breakEvenYears = annualIncome > 0 ? lossToRecover / annualIncome : null;
    const exitDiscountPct = pp > 0 ? ((sp - pp) / pp) * 100 : 0;

    return { invested, grossExit, saleFees, netExit, capitalDelta, capitalDeltaPct, totalEconomic, totalDelta, totalDeltaPct, annualIncome, lossToRecover, breakEvenYears, exitDiscountPct };
  }, [parts, purchasePrice, salePrice, saleFeesPct, annualDistributionPerPart, distributionsReceived]);

  const ready = parts > 0 && purchasePrice > 0 && salePrice > 0;

  const reset = () => {
    setSelectedScpiName('');
    setAcquisitionMonth('');
    setParts(0);
    setPurchasePrice(0);
    setSalePrice(0);
    setSaleFeesPct(0);
    setAnnualDistributionPerPart(0);
    setDistributionsReceived(0);
    setPurchasePriceAuto(false);
  };

  const switchMode = (nextMode: 'assisted' | 'manual') => {
    setMode(nextMode);
    reset();
  };

  const positive = r.totalDelta >= 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">Outil MaximusSCPI</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Simulateur de revente de parts SCPI</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">
            Choisissez votre SCPI pour laisser Maximus préremplir les données connues, ou saisissez directement vos propres chiffres.
          </p>
        </div>

        <div className="mt-7 inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-1">
          <button
            type="button"
            onClick={() => switchMode('assisted')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === 'assisted' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
          >
            Ma SCPI est référencée
          </button>
          <button
            type="button"
            onClick={() => switchMode('manual')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === 'manual' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
          >
            Saisie manuelle
          </button>
        </div>

        <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-7 items-start">
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold">{mode === 'assisted' ? 'Votre SCPI' : 'Vos données'}</h2>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600">
                <RotateCcw className="w-4 h-4" /> Réinitialiser
              </button>
            </div>

            {mode === 'assisted' && (
              <div className="mb-6 space-y-5">
                <label className="block">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Quelle SCPI détenez-vous ?</span>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={selectedScpiName}
                      onChange={(e) => {
                        setSelectedScpiName(e.target.value);
                        setAcquisitionMonth('');
                        setPurchasePrice(0);
                        setPurchasePriceAuto(false);
                      }}
                      className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-11 pr-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Rechercher / choisir une SCPI</option>
                      {scpiOptions.map((scpi) => (
                        <option key={scpi.id} value={scpi.name}>{scpi.name}</option>
                      ))}
                    </select>
                  </div>
                </label>

                {selectedScpi && (
                  <>
                    <div className="block">
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Date d'achat</span>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={acquisitionMonthPart}
                          onChange={(e) => setAcquisitionDatePart(e.target.value, acquisitionYearPart)}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Mois</option>
                          <option value="01">Janvier</option>
                          <option value="02">Février</option>
                          <option value="03">Mars</option>
                          <option value="04">Avril</option>
                          <option value="05">Mai</option>
                          <option value="06">Juin</option>
                          <option value="07">Juillet</option>
                          <option value="08">Août</option>
                          <option value="09">Septembre</option>
                          <option value="10">Octobre</option>
                          <option value="11">Novembre</option>
                          <option value="12">Décembre</option>
                        </select>
                        <select
                          value={acquisitionYearPart}
                          onChange={(e) => setAcquisitionDatePart(acquisitionMonthPart, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Année</option>
                          {Array.from({ length: 36 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <span className="block mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        Si Maximus connaît le prix historique de cette période, il sera prérempli automatiquement.
                      </span>
                    </div>

                    {isPrimovieSecondaryMarket && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Primovie : marché secondaire</p>
                        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                          Maximus ne préremplit pas un faux « prix de retrait ». Saisissez ci-dessous le prix de sortie que vous souhaitez tester.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => switchMode('manual')}
                  className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Je ne trouve pas ma SCPI → saisir mes chiffres
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <NumericInput label="Nombre de parts" value={parts} onChange={setParts} suffix="parts" />
              <NumericInput
                label="Prix payé par part"
                value={purchasePrice}
                onChange={(value) => {
                  setPurchasePrice(value);
                  setPurchasePriceAuto(false);
                }}
                suffix="€"
                step={0.01}
                helper={
                  mode === 'assisted' && purchasePriceAuto
                    ? 'Prix historique prérempli par Maximus — modifiable.'
                    : mode === 'assisted' && selectedScpiName && acquisitionMonth
                      ? 'Historique non disponible pour cette période : saisissez votre prix réel.'
                      : undefined
                }
              />
              <NumericInput
                label={isPrimovieSecondaryMarket && mode === 'assisted' ? 'Prix de sortie à tester' : 'Prix de sortie estimé par part'}
                value={salePrice}
                onChange={setSalePrice}
                suffix="€"
                step={0.01}
                helper={
                  mode === 'assisted' && selectedScpi && !isPrimovieSecondaryMarket
                    ? 'Valeur de retrait connue préremplie par Maximus — modifiable.'
                    : undefined
                }
              />
              <NumericInput label="Frais de cession estimés" value={saleFeesPct} onChange={setSaleFeesPct} suffix="%" step={0.1} max={30} />
              <NumericInput
                label="Distribution annuelle par part"
                value={annualDistributionPerPart}
                onChange={setAnnualDistributionPerPart}
                suffix="€"
                step={0.01}
                helper={mode === 'assisted' && selectedScpi ? 'Donnée Maximus préremplie lorsqu’elle est disponible — modifiable.' : undefined}
              />
              <NumericInput label="Revenus déjà encaissés" value={distributionsReceived} onChange={setDistributionsReceived} suffix="€" step={100} />
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-900 p-4 flex gap-3">
              <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Les données préremplies restent modifiables. Si Maximus ne connaît pas une donnée ou si votre situation est particulière, vous gardez toujours la main.
              </p>
            </div>
          </section>

          <section className="space-y-5" aria-live="polite">
            {!ready ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-7">
                <h2 className="text-xl font-bold">Résultat</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Renseignez au minimum le nombre de parts, le prix d'achat et le prix de sortie pour lancer le calcul.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Montant net estimé récupéré aujourd’hui</p>
                  <p className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">{formatEuro(r.netExit)}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5">Investi : {formatEuro(r.invested)}</span>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5">Frais de cession : {formatEuro(r.saleFees)}</span>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1.5">Écart prix sortie/achat : {formatPct(r.exitDiscountPct)}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"><TrendingDown className="w-4 h-4" /> Écart en capital si vente</div>
                    <p className={'mt-3 text-3xl font-bold ' + (r.capitalDelta >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatEuro(r.capitalDelta)}</p>
                    <p className="mt-1 text-sm text-gray-500">{formatPct(r.capitalDeltaPct)} du capital investi</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"><Euro className="w-4 h-4" /> Revenus annuels actuels</div>
                    <p className="mt-3 text-3xl font-bold">{formatEuro(r.annualIncome)}</p>
                    <p className="mt-1 text-sm text-gray-500">Sur la base de la distribution renseignée</p>
                  </div>
                </div>

                <div className={'rounded-2xl border p-6 ' + (positive ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20')}>
                  <div className="flex items-start gap-3">
                    {positive ? <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0" /> : <Gauge className="w-6 h-6 text-amber-600 shrink-0" />}
                    <div>
                      <h2 className="text-lg font-bold">Bilan économique depuis l’achat</h2>
                      <p className="mt-2 text-3xl font-bold">{formatEuro(r.totalDelta)} <span className="text-base font-semibold">({formatPct(r.totalDeltaPct)})</span></p>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Ce bilan additionne le montant net de sortie estimé et les revenus déjà perçus, puis le compare au capital investi. Il n’intègre pas la fiscalité personnelle ni la valeur temps de l’argent.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
                  <h2 className="text-lg font-bold">Point mort de conservation</h2>
                  {r.lossToRecover <= 0 ? (
                    <p className="mt-3 text-gray-700 dark:text-gray-300">Les revenus déjà encaissés compensent déjà l’écart de sortie par rapport au capital investi.</p>
                  ) : r.breakEvenYears !== null ? (
                    <>
                      <p className="mt-2 text-4xl font-bold">{r.breakEvenYears.toFixed(1)} ans</p>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Au niveau de distribution renseigné, il faudrait environ {r.breakEvenYears.toFixed(1)} années supplémentaires pour compenser {formatEuro(r.lossToRecover)} d’écart économique. Hypothèse simplifiée : distribution et prix de part constants.
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-gray-700 dark:text-gray-300">Impossible de calculer un point mort avec une distribution annuelle nulle.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-5 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-200">
                    Un point mort court ne signifie pas automatiquement qu’il faut conserver, et une moins-value ne signifie pas automatiquement qu’il faut vendre. La liquidité réelle, la qualité du patrimoine, le niveau de distribution futur et le coût d’opportunité doivent aussi être analysés.
                  </p>
                </div>

                <a href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-3 font-semibold text-white transition">
                  Faire analyser ma SCPI <ArrowRight className="w-4 h-4" />
                </a>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default ScpiSecondaryMarketSimulator;
