import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Euro, Gauge, Info, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';

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
        onFocus={(e) => {
          if (value === 0) e.currentTarget.select();
        }}
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

const ScpiSecondaryMarketSimulator: React.FC = () => {
  const [parts, setParts] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [saleFeesPct, setSaleFeesPct] = useState(0);
  const [annualDistributionPerPart, setAnnualDistributionPerPart] = useState(0);
  const [distributionsReceived, setDistributionsReceived] = useState(0);

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

    return {
      invested,
      saleFees,
      netExit,
      capitalDelta,
      capitalDeltaPct,
      totalDelta,
      totalDeltaPct,
      annualIncome,
      lossToRecover,
      breakEvenYears,
      exitDiscountPct,
    };
  }, [parts, purchasePrice, salePrice, saleFeesPct, annualDistributionPerPart, distributionsReceived]);

  const ready = parts > 0 && purchasePrice > 0 && salePrice > 0;

  const reset = () => {
    setParts(0);
    setPurchasePrice(0);
    setSalePrice(0);
    setSaleFeesPct(0);
    setAnnualDistributionPerPart(0);
    setDistributionsReceived(0);
  };

  const positive = r.totalDelta >= 0;

  const analysis = useMemo(() => {
    if (!ready) return null;

    const capitalLossPct = r.capitalDeltaPct < 0 ? Math.abs(r.capitalDeltaPct) : 0;
    const recoveredByIncome = r.invested > 0
      ? Math.max(0, Math.min(100, (distributionsReceived / r.invested) * 100))
      : 0;

    let capitalMessage = '';
    if (r.capitalDeltaPct >= 0) {
      capitalMessage = `Le prix de sortie saisi ne fait apparaître aucune moins-value en capital par rapport au prix d'achat.`;
    } else if (capitalLossPct < 10) {
      capitalMessage = `La décote de sortie reste limitée : environ ${formatPct(capitalLossPct)} du capital investi.`;
    } else if (capitalLossPct < 25) {
      capitalMessage = `La baisse de valeur est significative : environ ${formatPct(capitalLossPct)} du capital investi serait perdue sur le capital en cas de vente à ce prix.`;
    } else {
      capitalMessage = `La perte en capital est importante : environ ${formatPct(capitalLossPct)} du capital investi serait perdue en cas de vente à ce prix.`;
    }

    let incomeMessage = '';
    if (distributionsReceived <= 0) {
      incomeMessage = `Aucun revenu déjà encaissé n'a été renseigné : le bilan économique présenté repose donc principalement sur le prix de sortie.`;
    } else if (r.totalDelta >= 0) {
      incomeMessage = `Les revenus déjà encaissés compensent la baisse éventuelle du prix de part : le bilan économique cumulé ressort positif selon les données saisies.`;
    } else {
      incomeMessage = `Les revenus déjà perçus compensent une partie de la baisse du prix de part, mais pas encore la totalité. Ils représentent environ ${formatPct(recoveredByIncome)} du capital investi.`;
    }

    let breakEvenMessage = '';
    if (r.lossToRecover <= 0) {
      breakEvenMessage = `Le point mort économique est déjà atteint selon les données renseignées.`;
    } else if (r.breakEvenYears === null) {
      breakEvenMessage = `Le point mort ne peut pas être estimé sans distribution annuelle par part.`;
    } else if (r.breakEvenYears <= 2) {
      breakEvenMessage = `À distribution constante, l'écart économique restant serait compensé en environ ${r.breakEvenYears.toFixed(1)} an(s).`;
    } else if (r.breakEvenYears <= 5) {
      breakEvenMessage = `À distribution constante, il faudrait environ ${r.breakEvenYears.toFixed(1)} ans pour compenser l'écart économique restant.`;
    } else {
      breakEvenMessage = `Le délai théorique de retour au point mort est long : environ ${r.breakEvenYears.toFixed(1)} ans à distribution constante.`;
    }

    return { capitalMessage, incomeMessage, breakEvenMessage };
  }, [ready, r, distributionsReceived]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">Outil MaximusSCPI</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">Simulateur de revente de parts SCPI</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">
            Saisissez vos propres chiffres pour estimer ce que vous récupéreriez en revendant vos parts aujourd’hui.
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-7 items-start">
          <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold">Vos informations</h2>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600">
                <RotateCcw className="w-4 h-4" /> Réinitialiser
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <NumericInput label="Nombre de parts" value={parts} onChange={setParts} suffix="parts" />
              <NumericInput label="Prix payé par part" value={purchasePrice} onChange={setPurchasePrice} suffix="€" step={0.01} />
              <NumericInput
                label="Prix de sortie actuel par part"
                value={salePrice}
                onChange={setSalePrice}
                suffix="€"
                step={0.01}
                helper="Prix de retrait ou dernier prix d’exécution connu."
              />
              <NumericInput label="Frais de cession estimés" value={saleFeesPct} onChange={setSaleFeesPct} suffix="%" step={0.1} max={30} />
              <NumericInput
                label="Distribution annuelle par part"
                value={annualDistributionPerPart}
                onChange={setAnnualDistributionPerPart}
                suffix="€"
                step={0.01}
                helper="Facultatif — utile pour calculer le point mort."
              />
              <NumericInput
                label="Revenus déjà encaissés"
                value={distributionsReceived}
                onChange={setDistributionsReceived}
                suffix="€"
                step={100}
                helper="Facultatif."
              />
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-900 p-4 flex gap-3">
              <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vous gardez la main sur toutes les données. Aucun prix historique ni aucune donnée SCPI n’est imposé par le simulateur.
              </p>
            </div>
          </section>

          <section className="space-y-5" aria-live="polite">
            {!ready ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-7">
                <h2 className="text-xl font-bold">Résultat</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Renseignez le nombre de parts, le prix payé et le prix de sortie actuel pour lancer le calcul.
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
                        Le calcul additionne le montant net de sortie estimé et les revenus déjà perçus, puis le compare au capital investi. Il n’intègre pas votre fiscalité personnelle.
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
                    <p className="mt-3 text-gray-700 dark:text-gray-300">Ajoutez la distribution annuelle par part si vous souhaitez calculer le point mort.</p>
                  )}
                </div>

                {analysis && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold">Analyse Maximus</h2>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Lecture automatique
                      </span>
                    </div>
                    <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">1. Impact sur le capital</p>
                        <p className="mt-1">{analysis.capitalMessage}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">2. Revenus déjà encaissés</p>
                        <p className="mt-1">{analysis.incomeMessage}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">3. Point mort</p>
                        <p className="mt-1">{analysis.breakEvenMessage}</p>
                      </div>
                      <div className="rounded-xl bg-white/70 dark:bg-gray-950/50 p-4">
                        <p className="font-semibold text-gray-900 dark:text-white">À vérifier avant une décision</p>
                        <p className="mt-1">
                          Liquidité réelle du marché, délai de cession, évolution récente du prix de part, qualité du patrimoine,
                          niveau d'endettement et soutenabilité de la distribution.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-5 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-200">
                    Une moins-value ne signifie pas automatiquement qu’il faut vendre ou conserver. Le prix et le délai de cession ne sont pas garantis.
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
