import React, { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, Calendar, Euro, Info, ShieldCheck } from 'lucide-react';
import { estimateSimpleScpiIncomeTax } from '../domain/scpi/simpleDirectFiscal';

interface ScpiDirectIncomeSimulatorProps {
  defaultAmount?: number;
  defaultYield?: number;
  defaultTmi?: number;
  embedded?: boolean;
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ScpiDirectIncomeSimulator: React.FC<ScpiDirectIncomeSimulatorProps> = ({
  defaultAmount = 50000,
  defaultYield = 5,
  defaultTmi = 30,
  embedded = false,
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [yieldRate, setYieldRate] = useState(defaultYield);
  const [yieldWasCustomized, setYieldWasCustomized] = useState(false);
  const [tmi, setTmi] = useState(defaultTmi);
  const [origin, setOrigin] = useState<'france' | 'international'>('france');
  const [delaiJouissanceMois, setDelaiJouissanceMois] = useState(6);
  const [spreadRate, setSpreadRate] = useState(10);
  const [horizon, setHorizon] = useState(10);

  const calculations = useMemo(() => {
    const fullYearGross = amount * (yieldRate / 100);
    const productiveMonths = Math.max(0, 12 - delaiJouissanceMois);
    const firstYearGross = fullYearGross * (productiveMonths / 12);

    const commonTaxInput = {
      origin,
      tmiRate: tmi / 100,
    } as const;

    const fullYearTax = estimateSimpleScpiIncomeTax({
      grossIncome: fullYearGross,
      ...commonTaxInput,
    });

    const firstYearTax = estimateSimpleScpiIncomeTax({
      grossIncome: firstYearGross,
      ...commonTaxInput,
    });

    const withdrawalGap = amount * (spreadRate / 100);
    const immediateWithdrawalValue = amount - withdrawalGap;
    const netFull = fullYearTax.netIncome;
    const netFirst = firstYearTax.netIncome;
    const cumulativeNet =
      netFull !== null && netFirst !== null
        ? netFirst + Math.max(0, horizon - 1) * netFull
        : null;
    const breakEvenYears =
      netFull !== null && netFull > 0 ? withdrawalGap / netFull : null;

    return {
      fullYearGross,
      firstYearGross,
      fullYearTax,
      firstYearTax,
      withdrawalGap,
      immediateWithdrawalValue,
      cumulativeNet,
      breakEvenYears,
      productiveMonths,
    };
  }, [amount, yieldRate, delaiJouissanceMois, origin, tmi, spreadRate, horizon]);

  const taxEstimateAvailable = calculations.fullYearTax.available;
  const netAnnual = calculations.fullYearTax.netIncome;
  const netMonthly = netAnnual !== null ? netAnnual / 12 : null;
  const firstYearNet = calculations.firstYearTax.netIncome;

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {!embedded && (
          <header className="mx-auto mb-8 max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 dark:text-white">
              Simulateur SCPI : revenus après fiscalité
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Estimez vos revenus à partir de vos hypothèses, sans appliquer de fiscalité internationale fictive.
            </p>
          </header>
        )}

        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Montant investi
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  min={1000}
                  max={5000000}
                  step={1000}
                  value={amount}
                  onChange={(event) => setAmount(clamp(Number(event.target.value) || 1000, 1000, 5000000))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xl font-bold text-gray-950 outline-none focus:border-green-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
                <Euro className="h-5 w-5 shrink-0 text-gray-400" />
              </div>
              <input
                type="range"
                min={1000}
                max={5000000}
                step={1000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="mt-4 w-full"
              />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Hypothèse de taux de distribution : <span className="text-green-700 dark:text-green-400">{yieldRate.toFixed(1)} %</span>
              </label>
              <input
                type="range"
                min={2}
                max={10}
                step={0.1}
                value={yieldRate}
                onChange={(event) => {
                  setYieldRate(Number(event.target.value));
                  setYieldWasCustomized(true);
                }}
                className="mt-4 w-full"
              />
              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Hypothèse indicative pour la simulation. Le taux de distribution réel dépend de chaque SCPI et n'est pas garanti.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Origine des revenus immobiliers</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('france');
                    if (!yieldWasCustomized) setYieldRate(5);
                  }}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    origin === 'france'
                      ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="block font-semibold text-gray-950 dark:text-white">France</span>
                  <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">Estimation simplifiée au barème + prélèvements sociaux.</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('international');
                    if (!yieldWasCustomized) setYieldRate(6);
                  }}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    origin === 'international'
                      ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className="block font-semibold text-gray-950 dark:text-white">Europe / international</span>
                  <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">Fiscalité dépendante des pays et conventions fiscales.</span>
                </button>
              </div>
            </div>

            {origin === 'france' ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Tranche marginale d'imposition
                </label>
                <select
                  value={tmi}
                  onChange={(event) => setTmi(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-950 outline-none focus:border-green-600 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  <option value={0}>0 %</option>
                  <option value={11}>11 %</option>
                  <option value={30}>30 %</option>
                  <option value={41}>41 %</option>
                  <option value={45}>45 %</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Le calcul applique une approximation marginale sur le revenu simulé. La base fiscale réelle communiquée par la SCPI peut différer du montant distribué.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                  Fiscalité Europe / international
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
                  La fiscalité dépend des pays détenus par la SCPI et des conventions fiscales applicables. MaximusSCPI n'applique donc aucun taux standard pour fabriquer un revenu net.
                </p>
                <a
                  href="/comparateur-scpi/"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
                >
                  Sélectionner une SCPI pour affiner l'analyse
                </a>
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Délai de jouissance : {delaiJouissanceMois} mois
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={1}
                    value={delaiJouissanceMois}
                    onChange={(event) => setDelaiJouissanceMois(Number(event.target.value))}
                    className="mt-3 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Écart souscription / retrait : {spreadRate.toFixed(1)} %
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.5}
                    value={spreadRate}
                    onChange={(event) => setSpreadRate(Number(event.target.value))}
                    className="mt-3 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-gray-950 p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <Calculator className="h-5 w-5" />
                Résultat de la simulation
              </div>

              {taxEstimateAvailable && netAnnual !== null && netMonthly !== null ? (
                <>
                  <p className="mt-5 text-sm text-gray-300">Revenu annuel après fiscalité estimée</p>
                  <p className="mt-1 text-4xl font-bold">{formatEuro(netAnnual)}</p>
                  <p className="mt-2 text-lg text-gray-200">{formatEuro(netMonthly)} / mois en année pleine</p>
                  <p className="mt-3 text-xs leading-5 text-gray-400">
                    Sur la base d'un revenu brut de {formatEuro(calculations.fullYearGross)} et des seules hypothèses affichées.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-5 text-sm text-gray-300">Revenu brut annuel estimé</p>
                  <p className="mt-1 text-4xl font-bold">{formatEuro(calculations.fullYearGross)}</p>
                  <div className="mt-4 rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-100">
                    MaximusSCPI n'affiche pas de faux « net international ». Sélectionnez une SCPI pour tenir compte de sa répartition géographique et des conventions fiscales applicables.
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Détail annuel</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-300">Revenu brut année pleine</span>
                  <strong className="text-gray-950 dark:text-white">{formatEuro(calculations.fullYearGross)}</strong>
                </div>

                {origin === 'france' && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600 dark:text-gray-300">IR estimatif au taux marginal ({tmi} %)</span>
                      <strong className="text-red-600">- {formatEuro(calculations.fullYearTax.ir || 0)}</strong>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600 dark:text-gray-300">Prélèvements sociaux (17,2 %)</span>
                      <strong className="text-red-600">- {formatEuro(calculations.fullYearTax.socialContributions || 0)}</strong>
                    </div>
                  </>
                )}

                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Première année ({calculations.productiveMonths} mois productifs)</span>
                  <strong className="text-gray-950 dark:text-white">
                    {firstYearNet !== null ? formatEuro(firstYearNet) : formatEuro(calculations.firstYearGross) + ' brut'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <Calendar className="h-5 w-5 text-green-600" />
                Projection simple
              </h2>
              <div className="mt-4 flex items-center gap-3">
                {[10, 15, 20].map((years) => (
                  <button
                    type="button"
                    key={years}
                    onClick={() => setHorizon(years)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      horizon === years
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {years} ans
                  </button>
                ))}
              </div>

              {calculations.cumulativeNet !== null ? (
                <div className="mt-5">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Revenus cumulés estimatifs, sans réinvestissement</p>
                  <p className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">{formatEuro(calculations.cumulativeNet)}</p>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-amber-800 dark:text-amber-300">
                  Projection nette non affichée pour l'international tant qu'une SCPI et sa répartition géographique ne sont pas prises en compte.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Écart souscription / retrait
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-900">
                  <p className="text-xs text-gray-500">Valeur théorique immédiate</p>
                  <p className="mt-1 text-xl font-bold text-gray-950 dark:text-white">{formatEuro(calculations.immediateWithdrawalValue)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-900">
                  <p className="text-xs text-gray-500">Écart simulé</p>
                  <p className="mt-1 text-xl font-bold text-red-600">{formatEuro(calculations.withdrawalGap)}</p>
                </div>
              </div>
              {calculations.breakEvenYears !== null && (
                <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  À hypothèses constantes, cet écart représente environ {calculations.breakEvenYears.toFixed(1)} années de revenus nets estimatifs. Ce n'est pas une durée de détention recommandée ni une garantie de récupération du capital.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Limites de la simulation</p>
                  <p className="mt-1">
                    {origin === 'france'
                      ? "Le calcul applique de façon pédagogique la TMI et 17,2 % de prélèvements sociaux au revenu brut simulé. La base imposable réelle de la SCPI, les charges déductibles, les intérêts d'emprunt, les éventuels revenus financiers et la situation du foyer peuvent modifier le résultat."
                      : "Les revenus immobiliers étrangers doivent être traités selon les pays détenus par la SCPI et les conventions fiscales applicables. Le simulateur grand public affiche donc le brut et n'invente pas de fiscalité nette standard."}
                  </p>
                  <p className="mt-2">
                    Les revenus et la valeur des parts de SCPI ne sont pas garantis. Il existe un risque de perte en capital et un risque de liquidité.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Simulation indicative et non contractuelle. Elle ne constitue pas une recommandation personnalisée ni une consultation fiscale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScpiDirectIncomeSimulator;
