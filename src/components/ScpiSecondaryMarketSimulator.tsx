import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Euro, HelpCircle, Info, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(Number.isFinite(value) ? value : 0);

const formatPct = (value: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    .format(Number.isFinite(value) ? value : 0) + ' %';

const clamp = (value: number, min = 0, max = 100000000) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

type NumericInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
  optional?: boolean;
};

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  helper,
  optional = false,
}) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</span>
      {optional && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Facultatif
        </span>
      )}
    </div>
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        min={0}
        step={100}
        placeholder="0"
        onChange={(e) => {
          const next = e.currentTarget.valueAsNumber;
          onChange(Number.isFinite(next) ? clamp(next) : 0);
        }}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
    </div>
    {helper && <span className="mt-1.5 block text-xs text-gray-500 dark:text-gray-400">{helper}</span>}
  </label>
);

const ScpiSecondaryMarketSimulator: React.FC = () => {
  const [invested, setInvested] = useState(0);
  const [recoverable, setRecoverable] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const result = useMemo(() => {
    const capitalInvested = clamp(invested);
    const capitalRecoverable = clamp(recoverable);
    const income = clamp(annualIncome);

    const delta = capitalRecoverable - capitalInvested;
    const deltaPct = capitalInvested > 0 ? (delta / capitalInvested) * 100 : 0;
    const gap = Math.max(0, capitalInvested - capitalRecoverable);
    const incomeYears = income > 0 && gap > 0 ? gap / income : null;

    return {
      delta,
      deltaPct,
      gap,
      incomeYears,
    };
  }, [invested, recoverable, annualIncome]);

  const ready = invested > 0 && recoverable > 0;

  const reset = () => {
    setInvested(0);
    setRecoverable(0);
    setAnnualIncome(0);
    setSubmitted(false);
    setShowHelp(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ready) setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Outil MaximusSCPI
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Simulateur de revente de parts SCPI</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Trois chiffres suffisent pour visualiser ce que vous récupéreriez aujourd’hui et mesurer l’écart avec votre investissement.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Votre situation</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pas besoin du nombre de parts ni des frais détaillés.</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600"
              >
                <RotateCcw className="h-4 w-4" /> Réinitialiser
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <NumericInput
                label="1. Combien avez-vous investi ?"
                value={invested}
                onChange={(value) => {
                  setInvested(value);
                  setSubmitted(false);
                }}
                helper="Le montant total que vous avez consacré à cette SCPI."
              />

              <div>
                <NumericInput
                  label="2. Combien pourriez-vous récupérer aujourd’hui ?"
                  value={recoverable}
                  onChange={(value) => {
                    setRecoverable(value);
                    setSubmitted(false);
                  }}
                  helper="Utilisez le montant net estimé que vous pourriez réellement récupérer aujourd’hui."
                />
                <button
                  type="button"
                  onClick={() => setShowHelp((current) => !current)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Je ne connais pas ce montant
                </button>

                {showHelp && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-gray-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-white">Comment le trouver ?</p>
                    <ul className="mt-2 space-y-1.5">
                      <li><strong>SCPI à capital variable :</strong> nombre de parts × prix de retrait actuel.</li>
                      <li><strong>SCPI à capital fixe ou variabilité suspendue :</strong> utilisez un prix net vendeur réaliste à partir du carnet d’ordres ou du dernier prix d’exécution.</li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Si vous n’avez pas cette information, consultez le dernier bulletin ou contactez la société de gestion avant de simuler.
                    </p>
                  </div>
                )}
              </div>

              <NumericInput
                label="3. Combien la SCPI vous rapporte-t-elle actuellement par an ?"
                value={annualIncome}
                onChange={(value) => {
                  setAnnualIncome(value);
                  setSubmitted(false);
                }}
                helper="Montant annuel approximatif reçu. Sert uniquement à exprimer l’écart en années de revenus."
                optional
              />

              <button
                type="submit"
                disabled={!ready}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyser ma revente <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Le simulateur ne cherche pas à reconstituer toute l’histoire de votre investissement. Il répond d’abord à une question simple : que se passe-t-il si vous vendez aujourd’hui ?
              </p>
            </div>
          </section>

          <section className="space-y-5" aria-live="polite">
            {!submitted ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-950">
                <h2 className="text-xl font-bold">Résultat</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Renseignez le montant investi et ce que vous pourriez récupérer aujourd’hui, puis lancez l’analyse.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Si vous vendez aujourd’hui</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">{formatEuro(recoverable)}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Montant récupérable renseigné</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {result.delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      Écart actuel
                    </div>
                    <p className={'mt-3 text-3xl font-bold ' + (result.delta >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {formatEuro(result.delta)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{formatPct(result.deltaPct)} du montant investi</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Euro className="h-4 w-4" />
                      Écart en années de revenus
                    </div>
                    {result.gap <= 0 ? (
                      <>
                        <p className="mt-3 text-3xl font-bold text-emerald-600">0 an</p>
                        <p className="mt-1 text-sm text-gray-500">Aucun écart négatif à compenser.</p>
                      </>
                    ) : result.incomeYears !== null ? (
                      <>
                        <p className="mt-3 text-3xl font-bold">{result.incomeYears.toFixed(1)} ans</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatEuro(result.gap)} d’écart au niveau de revenu annuel renseigné.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-2xl font-bold text-gray-400">Non calculé</p>
                        <p className="mt-1 text-sm text-gray-500">Ajoutez votre revenu annuel si vous voulez cette lecture.</p>
                      </>
                    )}
                  </div>
                </div>

                {result.incomeYears !== null && result.gap > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="font-semibold text-gray-900 dark:text-white">Comment lire ce chiffre ?</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      L’écart actuel de {formatEuro(result.gap)} représente environ <strong>{result.incomeYears.toFixed(1)} années de revenus</strong> au niveau que vous avez renseigné. Ce n’est pas un “point mort” : le prix de part, la distribution et la fiscalité peuvent évoluer.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <h2 className="text-xl font-bold">Avant de vendre, vérifiez 4 éléments</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                      <p className="font-semibold">Liquidité</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Pouvez-vous réellement vendre à ce prix, et dans quel délai ?</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                      <p className="font-semibold">Valeur du patrimoine</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Le prix actuel est-il cohérent avec les valeurs de réalisation et de reconstitution ?</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                      <p className="font-semibold">Endettement</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">La dette peut-elle amplifier une nouvelle baisse ou peser sur les refinancements ?</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                      <p className="font-semibold">Distribution</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Le revenu actuel paraît-il soutenable au regard du TOF, des baux et des locataires ?</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <p className="text-sm text-red-900 dark:text-red-200">
                      Une moins-value ne signifie pas automatiquement qu’il faut vendre ou conserver. Le prix et le délai de cession ne sont pas garantis.
                    </p>
                  </div>
                </div>

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
                    Analyser la SCPI concernée <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default ScpiSecondaryMarketSimulator;
