import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScpiCreditSimulatorProps {
  defaultAmount?: number;
  defaultApport?: number;
  defaultRate?: number;
  defaultDuration?: number;
  ctaUrl?: string;
  onCtaClick?: () => void;
}

const ScpiCreditSimulator: React.FC<ScpiCreditSimulatorProps> = ({
  defaultAmount = 100000,
  defaultApport = 20000,
  defaultRate = 3.5,
  defaultDuration = 20,
  ctaUrl = '#contact',
  onCtaClick
}) => {
  // États principaux
  const [montantTotal, setMontantTotal] = useState(defaultAmount);
  const [apport, setApport] = useState(defaultApport);
  const [rendementBrut, setRendementBrut] = useState(5);
  const [origineRevenus, setOrigineRevenus] = useState<'france' | 'international'>('france');
  const [dureeCredit, setDureeCredit] = useState(defaultDuration);
  const [tauxNominal, setTauxNominal] = useState(defaultRate);
  const [tauxAssurance, setTauxAssurance] = useState(0.30);
  const [tmi, setTmi] = useState(30);

  // Paramètres avancés
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [delaiJouissanceMois, setDelaiJouissanceMois] = useState(6);
  const [ecartSouscriptionRetrait, setEcartSouscriptionRetrait] = useState(10);
  const [horizonAnalyse, setHorizonAnalyse] = useState(dureeCredit);
  const [revaloAnnuelle, setRevaloAnnuelle] = useState(0);
  const [fraisAnnuels, setFraisAnnuels] = useState(0);

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Fonction calcul mensualité
  const computeMensualite = (capital: number, tauxAnnuel: number, dureeAns: number): number => {
    if (capital === 0 || tauxAnnuel === 0) return 0;
    const tauxMensuel = tauxAnnuel / 12 / 100;
    const nbMois = dureeAns * 12;
    return capital * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nbMois)));
  };

  // Tableau d'amortissement
  const buildAmortizationSchedule = (
    capital: number,
    tauxAnnuel: number,
    dureeAns: number,
    mensualite: number
  ) => {
    const tauxMensuel = tauxAnnuel / 12 / 100;
    const nbMois = dureeAns * 12;
    const schedule: {
      annee: number;
      interetsAnnuels: number;
      capitalRembourseAnnuel: number;
      capitalRestantDuFinAnnee: number;
    }[] = [];

    let capitalRestant = capital;
    let anneeEnCours = 1;
    let interetsAnnee = 0;
    let capitalAnnee = 0;

    for (let mois = 1; mois <= nbMois; mois++) {
      const interetsMois = capitalRestant * tauxMensuel;
      const capitalMois = mensualite - interetsMois;

      interetsAnnee += interetsMois;
      capitalAnnee += capitalMois;
      capitalRestant -= capitalMois;

      if (mois % 12 === 0 || mois === nbMois) {
        schedule.push({
          annee: anneeEnCours,
          interetsAnnuels: interetsAnnee,
          capitalRembourseAnnuel: capitalAnnee,
          capitalRestantDuFinAnnee: Math.max(0, capitalRestant)
        });
        anneeEnCours++;
        interetsAnnee = 0;
        capitalAnnee = 0;
      }
    }

    return schedule;
  };

  // Calcul TRI (IRR)
  const computeIRR = (flows: number[], guess: number = 0.1): number => {
    const maxIterations = 100;
    const tolerance = 0.0001;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let t = 0; t < flows.length; t++) {
        npv += flows[t] / Math.pow(1 + rate, t);
        dnpv -= t * flows[t] / Math.pow(1 + rate, t + 1);
      }

      const newRate = rate - npv / dnpv;

      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100;
      }

      rate = newRate;
    }

    return rate * 100;
  };

  const calculations = useMemo(() => {
    const capitalEmprunte = montantTotal - apport;
    const mensualiteHorsAssurance = computeMensualite(capitalEmprunte, tauxNominal, dureeCredit);
    const assuranceAnnuelle = capitalEmprunte * (tauxAssurance / 100);
    const assuranceMensuelle = assuranceAnnuelle / 12;

    // Tableau d'amortissement
    const amortization = buildAmortizationSchedule(capitalEmprunte, tauxNominal, dureeCredit, mensualiteHorsAssurance);

    // Coût total du crédit
    const coutTotalCredit = amortization.reduce((sum, a) => sum + a.interetsAnnuels, 0) + (assuranceAnnuelle * dureeCredit);

    // Revenus SCPI
    const moisProductifsAn1 = Math.max(0, 12 - delaiJouissanceMois);
    const prorata = moisProductifsAn1 / 12;
    const revenuBrutPlein = montantTotal * (rendementBrut / 100);
    const revenuBrutAn1 = revenuBrutPlein * prorata;

    // Taux PS selon origine
    const tauxPS = origineRevenus === 'france' ? 17.2 : 0;

    // Calculs annuels
    const cashflows: {
      annee: number;
      revenuBrut: number;
      interets: number;
      chargesDeductibles: number;
      baseImposable: number;
      impotIR: number;
      impotPS: number;
      revenuApresImpotsAvantCredit: number;
      chargeCreditAnnuelle: number;
      cashflowAvantImpots: number;
      cashflowApresImpots: number;
      capitalRestantDu: number;
      valeurParts: number;
    }[] = [];

    const flows: number[] = [-apport]; // Pour TRI, année 0

    for (let annee = 1; annee <= Math.max(horizonAnalyse, dureeCredit); annee++) {
      const revenuBrut = annee === 1 ? revenuBrutAn1 : revenuBrutPlein;
      const amortAnnee = amortization[annee - 1] || { interetsAnnuels: 0, capitalRestantDuFinAnnee: 0 };
      const interets = amortAnnee.interetsAnnuels;
      const chargesDeductibles = interets + assuranceAnnuelle + fraisAnnuels;
      const baseImposable = Math.max(0, revenuBrut - chargesDeductibles);

      const impotIR = baseImposable * (tmi / 100);
      const impotPS = baseImposable * (tauxPS / 100);
      // Revenu après impôts AVANT mensualités de crédit
      const revenuApresImpotsAvantCredit = revenuBrut - impotIR - impotPS;

      const chargeCreditAnnuelle = mensualiteHorsAssurance * 12 + assuranceAnnuelle;
      // Cash-flow = Revenu après impôts - mensualités crédit - frais
      const cashflowApresImpots = revenuApresImpotsAvantCredit - chargeCreditAnnuelle - fraisAnnuels;
      const cashflowAvantImpots = revenuBrut - chargeCreditAnnuelle - fraisAnnuels;

      const capitalRestantDu = amortAnnee.capitalRestantDuFinAnnee;
      const valeurParts = montantTotal * Math.pow(1 + revaloAnnuelle / 100, annee);

      cashflows.push({
        annee,
        revenuBrut,
        interets,
        chargesDeductibles,
        baseImposable,
        impotIR,
        impotPS,
        revenuApresImpotsAvantCredit,
        chargeCreditAnnuelle,
        cashflowAvantImpots,
        cashflowApresImpots,
        capitalRestantDu,
        valeurParts
      });

      // Pour TRI : flows[1..N-1] = cashflow, flows[N] = cashflow + patrimoine net
      if (annee < horizonAnalyse) {
        flows.push(cashflowApresImpots);
      } else if (annee === horizonAnalyse) {
        const patrimoineNet = valeurParts - capitalRestantDu;
        flows.push(cashflowApresImpots + patrimoineNet);
      }
    }

    // Données pour l'horizon
    const horizonData = cashflows[horizonAnalyse - 1] || cashflows[cashflows.length - 1];
    const patrimoineNetHorizon = horizonData.valeurParts - horizonData.capitalRestantDu;

    // TRI - calculé uniquement si apport > 0
    let triApport: number | null = null;
    if (apport > 0) {
      try {
        triApport = computeIRR(flows);
      } catch (e) {
        triApport = null;
      }
    }

    // Cashflow année pleine (année 2)
    const cashflowPlein = cashflows.length > 1 ? cashflows[1] : cashflows[0];

    return {
      capitalEmprunte,
      mensualiteHorsAssurance,
      assuranceMensuelle,
      coutTotalCredit,
      cashflows,
      cashflowAn1: cashflows[0],
      cashflowPlein,
      horizonData,
      patrimoineNetHorizon,
      triApport,
      tauxPS
    };
  }, [
    montantTotal,
    apport,
    rendementBrut,
    origineRevenus,
    dureeCredit,
    tauxNominal,
    tauxAssurance,
    tmi,
    delaiJouissanceMois,
    ecartSouscriptionRetrait,
    horizonAnalyse,
    revaloAnnuelle,
    fraisAnnuels
  ]);

  // Données graphiques
  const chartDataCRD = calculations.cashflows.map(cf => ({
    annee: `Année ${cf.annee}`,
    capitalRestantDu: cf.capitalRestantDu,
    valeurParts: cf.valeurParts
  }));

  const chartDataCashflow = [
    { name: 'Année 1', cashflow: calculations.cashflowAn1.cashflowApresImpots },
    { name: 'Année pleine', cashflow: calculations.cashflowPlein.cashflowApresImpots },
    { name: `Année ${horizonAnalyse}`, cashflow: calculations.horizonData.cashflowApresImpots }
  ];

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Titre */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simulateur SCPI à crédit : effet de levier & cash-flow
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Estimez vos mensualités, votre cash-flow net et votre patrimoine à terme pour un projet de SCPI financé à crédit.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* COLONNE GAUCHE - PARAMÈTRES */}
          <div className="space-y-6">
            {/* Paramètres du projet SCPI */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Paramètres du projet SCPI
              </h3>

              {/* Montant total */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Montant total investi en SCPI
                </label>
                <input
                  type="number"
                  value={montantTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setMontantTotal(val);
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value) || 10000;
                    if (val < 10000) setMontantTotal(10000);
                    else if (val > 2000000) setMontantTotal(2000000);
                  }}
                  min={10000}
                  max={2000000}
                  step={1000}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500 mb-3"
                />
                <input
                  type="range"
                  value={montantTotal}
                  onChange={(e) => setMontantTotal(Number(e.target.value))}
                  min={10000}
                  max={2000000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>10 000 €</span>
                  <span>2 000 000 €</span>
                </div>
              </div>

              {/* Apport */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Apport personnel
                </label>
                <input
                  type="number"
                  value={apport}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setApport(val);
                  }}
                  onBlur={(e) => {
                    const val = Number(e.target.value) || 0;
                    if (val < 0) setApport(0);
                    else if (val > montantTotal) setApport(montantTotal);
                  }}
                  min={0}
                  max={montantTotal}
                  step={1000}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500 mb-3"
                />
                <input
                  type="range"
                  value={apport}
                  onChange={(e) => setApport(Math.min(Number(e.target.value), montantTotal))}
                  min={0}
                  max={montantTotal}
                  step={1000}
                  className="w-full"
                />
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    Montant financé par le crédit : <span className="font-bold">{formatEuro(calculations.capitalEmprunte)}</span>
                  </p>
                </div>
              </div>

              {/* Rendement brut */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Rendement brut annuel moyen estimé de la SCPI (%)
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={rendementBrut}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setRendementBrut(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value) || 5;
                      if (val < 3) setRendementBrut(3);
                      else if (val > 8) setRendementBrut(8);
                    }}
                    min={3}
                    max={8}
                    step={0.1}
                    className="w-32 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500"
                  />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">%</span>
                </div>
                <input
                  type="range"
                  value={rendementBrut}
                  onChange={(e) => setRendementBrut(Number(e.target.value))}
                  min={3}
                  max={8}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  <p>Hypothèse de rendement brut annuel moyen sur la durée de la simulation.</p>
                  <p>Basé sur les derniers taux de distribution connus de la SCPI.</p>
                  <p className="font-medium">Rendement non garanti, susceptible de varier à la hausse comme à la baisse.</p>
                  <p className="italic mt-1">Exemple : une SCPI qui a distribué 5,10 % en 2024 peut être simulée avec 5 % comme rendement moyen prudent.</p>
                </div>
              </div>

              {/* Origine des revenus */}
              <div>
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
            </div>

            {/* Paramètres du crédit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Paramètres du crédit
              </h3>

              {/* Durée */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Durée du crédit
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={dureeCredit}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setDureeCredit(val);
                      setHorizonAnalyse(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value) || 20;
                      if (val < 5) {
                        setDureeCredit(5);
                        setHorizonAnalyse(5);
                      } else if (val > 25) {
                        setDureeCredit(25);
                        setHorizonAnalyse(25);
                      }
                    }}
                    min={5}
                    max={25}
                    step={1}
                    className="w-32 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500"
                  />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">ans</span>
                </div>
                <input
                  type="range"
                  value={dureeCredit}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDureeCredit(val);
                    setHorizonAnalyse(val);
                  }}
                  min={5}
                  max={25}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5 ans</span>
                  <span>25 ans</span>
                </div>
              </div>

              {/* Taux nominal */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Taux nominal du crédit
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={tauxNominal}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTauxNominal(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value) || 3.5;
                      if (val < 1) setTauxNominal(1);
                      else if (val > 6) setTauxNominal(6);
                    }}
                    min={1}
                    max={6}
                    step={0.1}
                    className="w-32 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500"
                  />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">% / an</span>
                </div>
                <input
                  type="range"
                  value={tauxNominal}
                  onChange={(e) => setTauxNominal(Number(e.target.value))}
                  min={1}
                  max={6}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1 %</span>
                  <span>6 %</span>
                </div>
              </div>

              {/* Taux assurance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Taux d'assurance emprunteur
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    value={tauxAssurance}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTauxAssurance(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value) || 0.3;
                      if (val < 0) setTauxAssurance(0);
                      else if (val > 1) setTauxAssurance(1);
                    }}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-32 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 text-lg font-semibold focus:outline-none focus:border-green-500"
                  />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">% / an</span>
                </div>
                <input
                  type="range"
                  value={tauxAssurance}
                  onChange={(e) => setTauxAssurance(Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0 %</span>
                  <span>1 %</span>
                </div>
              </div>
            </div>

            {/* Profil fiscal */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profil fiscal
              </h3>

              {/* TMI */}
              <div className="mb-6">
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Régime fiscal des revenus
                </label>
                <div className="p-4 border-2 border-green-600 dark:border-green-400 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="font-semibold text-gray-900 dark:text-white mb-1">
                    Revenus fonciers (détention directe)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    TMI + prélèvements sociaux
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Ce simulateur modélise un achat de SCPI à crédit en détention directe. Les mécanismes exacts de déficit foncier sont simplifiés.
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres avancés
                </h3>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Délai de jouissance */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Délai de jouissance : {delaiJouissanceMois} mois
                    </label>
                    <input
                      type="range"
                      value={delaiJouissanceMois}
                      onChange={(e) => setDelaiJouissanceMois(Number(e.target.value))}
                      min={0}
                      max={12}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Pendant le délai de jouissance, les parts ne produisent pas encore de revenus. Impacte la première année.
                    </p>
                  </div>

                  {/* Écart souscription/retrait */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Écart souscription / retrait : {ecartSouscriptionRetrait} %
                    </label>
                    <input
                      type="range"
                      value={ecartSouscriptionRetrait}
                      onChange={(e) => setEcartSouscriptionRetrait(Number(e.target.value))}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Différence entre le prix de souscription et le prix de retrait. Modélise le coût de sortie implicite.
                    </p>
                  </div>

                  {/* Horizon d'analyse */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Horizon d'analyse : {horizonAnalyse} ans
                    </label>
                    <input
                      type="range"
                      value={horizonAnalyse}
                      onChange={(e) => setHorizonAnalyse(Number(e.target.value))}
                      min={5}
                      max={25}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Horizon d'analyse patrimoniale (valeur des parts + capital restant dû)
                    </p>
                  </div>

                  {/* Revalorisation annuelle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Revalorisation annuelle du prix de part : {revaloAnnuelle.toFixed(1)} %
                    </label>
                    <input
                      type="range"
                      value={revaloAnnuelle}
                      onChange={(e) => setRevaloAnnuelle(Number(e.target.value))}
                      min={-1}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Hypothèse de variation du prix de la part. 0 % par défaut (scénario neutre).
                    </p>
                  </div>

                  {/* Frais annuels */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Frais / charges annuels : {formatEuro(fraisAnnuels)}
                    </label>
                    <input
                      type="number"
                      value={fraisAnnuels}
                      onChange={(e) => setFraisAnnuels(Number(e.target.value))}
                      min={0}
                      step={100}
                      className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-2 px-4 focus:outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Permet d'ajouter des frais de gestion, conseil, etc.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE - RÉSULTATS */}
          <div className="space-y-6">
            {/* Synthèse projet à crédit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                Synthèse projet à crédit
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Apport</span>
                  <span className="font-semibold dark:text-white">{formatEuro(apport)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Montant financé par le crédit</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.capitalEmprunte)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Mensualité hors assurance</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.mensualiteHorsAssurance)} / mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Assurance</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.assuranceMensuelle)} / mois</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Coût total du crédit (intérêts + assurance)</span>
                  <span className="font-semibold text-red-600">{formatEuro(calculations.coutTotalCredit)}</span>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Cash-flow net estimé en année pleine</div>
                  <div className={`text-2xl font-bold ${calculations.cashflowPlein.cashflowApresImpots >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                    {formatEuro(calculations.cashflowPlein.cashflowApresImpots)} / an
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Soit {formatEuro(calculations.cashflowPlein.cashflowApresImpots / 12)} / mois
                  </div>
                  {calculations.cashflowPlein.cashflowApresImpots < 0 && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Cash-flow légèrement négatif</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Cash-flow net la 1re année (avec délai de jouissance)</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatEuro(calculations.cashflowAn1.cashflowApresImpots)} / an
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Soit {formatEuro(calculations.cashflowAn1.cashflowApresImpots / 12)} / mois
                  </div>
                </div>
              </div>
            </div>

            {/* Patrimoine net à l'horizon */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Patrimoine net à l'horizon
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Horizon d'analyse</span>
                  <span className="font-semibold dark:text-white">{horizonAnalyse} ans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Valeur théorique des parts</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatEuro(calculations.horizonData.valeurParts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Capital restant dû</span>
                  <span className="font-semibold text-red-600">- {formatEuro(calculations.horizonData.capitalRestantDu)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Patrimoine net estimé</span>
                  <span className="font-bold text-2xl text-green-600 dark:text-green-400">{formatEuro(calculations.patrimoineNetHorizon)}</span>
                </div>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-purple-800 dark:text-purple-300 mb-1">TRI approximatif sur votre apport</div>
                  {calculations.triApport !== null && apport > 0 ? (
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatPercent(calculations.triApport)}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Non calculé (aucun apport initial dans la simulation)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Détail fiscal & effet de levier */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                Détail fiscal & effet de levier (année pleine)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                  Origine des loyers simulés : {origineRevenus === 'france' ? 'SCPI 100 % France' : 'SCPI principalement Europe / international'}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Revenu brut annuel</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.cashflowPlein.revenuBrut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Intérêts & assurance déductibles</span>
                  <span className="font-semibold text-orange-600">- {formatEuro(calculations.cashflowPlein.chargesDeductibles)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Base imposable estimée</span>
                  <span className="font-semibold dark:text-white">{formatEuro(calculations.cashflowPlein.baseImposable)}</span>
                </div>
                {calculations.cashflowPlein.baseImposable <= 0 && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-300">
                    Base imposable négative : situation de déficit foncier théorique (non modélisé ici).
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Impôt sur le revenu (TMI {tmi}%)</span>
                  <span className="font-semibold text-red-600">- {formatEuro(calculations.cashflowPlein.impotIR)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Prélèvements sociaux ({calculations.tauxPS}%)
                  </span>
                  <span className="font-semibold text-red-600">
                    {origineRevenus === 'france' ? `- ${formatEuro(calculations.cashflowPlein.impotPS)}` : '0 €'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Revenu après impôts (avant mensualités de crédit)</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatEuro(calculations.cashflowPlein.revenuApresImpotsAvantCredit)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Cash-flow après impôts</span>
                  <span className={`font-bold text-xl ${calculations.cashflowPlein.cashflowApresImpots >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                    {formatEuro(calculations.cashflowPlein.cashflowApresImpots)} / an
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Soit {formatEuro(calculations.cashflowPlein.cashflowApresImpots / 12)} / mois
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Évolution : Capital restant dû vs Valeur des parts
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDataCRD}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="annee"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => formatEuro(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="capitalRestantDu"
                    name="Capital restant dû"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="valeurParts"
                    name="Valeur des parts"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cash-flow annuel après impôts
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartDataCashflow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => formatEuro(value)}
                  />
                  <Bar
                    dataKey="cashflow"
                    name="Cash-flow"
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                Besoin de valider ce montage ?
              </h3>
              <p className="text-sm mb-4 opacity-90">
                Banque, fiscalité, choix de SCPI : faites-vous accompagner par un conseiller indépendant.
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
                ⚠️ Cette simulation est indicative et simplifiée. Elle ne prend pas en compte l'intégralité des paramètres fiscaux (déficit foncier, plafonds, situation globale du foyer) ni les frais détaillés (banque, notaire, conseil, etc.).
              </p>
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold">Modélisation simplifiée :</span> La base imposable est calculée comme revenus bruts – intérêts – assurance – frais. Le mécanisme complet du déficit foncier n'est pas reproduit à l'identique.
              </p>
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold">SCPI internationales :</span> Pour les SCPI investies principalement à l'international, la fiscalité est simplifiée dans ce simulateur. En pratique, les conventions fiscales et crédits d'impôt peuvent réduire la charge fiscale réelle.
              </p>
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                Les SCPI sont un investissement de long terme présentant un risque de perte en capital, une liquidité limitée et une variabilité des revenus. Les résultats présentés ne constituent pas un conseil personnalisé et ne préjugent pas des performances futures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScpiCreditSimulator;
