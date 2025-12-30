import React, { useState, useEffect } from 'react';

type WithdrawalMode = 'interest_only' | 'percent_capital';

interface SimulationInputs {
  montantActuel: number;
  horizon: number;
  tmi: number;
  estEnCouple: boolean;
  contratPlusDe8Ans: boolean;
  besoinRevenus: boolean;
  withdrawalMode: WithdrawalMode;
  annualWithdrawalRate: number;
  rendementFondsEuros: number;
  rendementScpi: number;
  inflation: number;
  tauxRetrocessionAV: number;
  fraisGestionAV: number;
  tauxRevalorisationPart: number;
  pctArbitrage: number;
  pctRachat: number;
  montantCredit: number;
  tauxCredit: number;
  dureeCredit: number;
  useDemembrement: boolean;
  pctDemembrement: number;
  dureeDemembrement: number;
  cleNuePropriete: number;
}

interface ScenarioResult {
  id: string;
  titre: string;
  capitalFinal: number;
  revenusAnnuels: number;
  risque: string;
  complexite: string;
  liquidite: string;
  details: string;
  capitalFinalBrutAV?: number;
  capitalFinalNetAV?: number;
  impotSortieAV?: number;
  abattementAV?: number;
}

function calculerFiscaliteSortieAV(
  capitalFinalBrut: number,
  primeVersee: number,
  contratPlusDe8Ans: boolean,
  estEnCouple: boolean
): { capitalFinalNet: number; impotSortie: number; abattement: number; gainsBruts: number } {
  // 1. Calculer les gains bruts
  const gainsBruts = Math.max(0, capitalFinalBrut - primeVersee);

  // 2. Déterminer l'abattement applicable
  let abattement = 0;
  if (contratPlusDe8Ans) {
    abattement = estEnCouple ? 9200 : 4600;
  }

  // 3. Calculer la base imposable
  const baseImposable = Math.max(0, gainsBruts - abattement);

  // 4. Appliquer la flat tax (PFU 30%)
  const tauxPFU = 0.30;
  const impotSortie = baseImposable * tauxPFU;

  // 5. Calculer le capital final net
  const capitalFinalNet = capitalFinalBrut - impotSortie;

  return {
    capitalFinalNet,
    impotSortie,
    abattement,
    gainsBruts
  };
}

function projectFondsEuros(
  montantInitial: number,
  rendement: number,
  horizon: number
): number {
  return montantInitial * Math.pow(1 + rendement / 100, horizon);
}

/**
 * Calcule la projection du fonds euros avec rachats partiels automatiques
 * @param montantInitial Capital de départ en fonds euros
 * @param rendement Rendement annuel du fonds euros (%)
 * @param horizon Durée de placement (années)
 * @param withdrawalMode Mode de retrait ('interest_only' ou 'percent_capital')
 * @param annualWithdrawalRate Taux de retrait annuel (% du capital initial, utilisé uniquement en mode 'percent_capital')
 * @param effectiveTaxRate Taux de fiscalité moyen sur les retraits (ex: 0.20 pour 20%)
 * @returns Objet avec capitalFinal, revenusAnnuelsMoyensNets et totalNetIncome
 */
function computeFondsEurosWithWithdrawals(
  montantInitial: number,
  rendement: number,
  horizon: number,
  withdrawalMode: WithdrawalMode,
  annualWithdrawalRate: number,
  effectiveTaxRate: number
): { capitalFinal: number; revenusAnnuelsMoyensNets: number; totalNetIncome: number } {
  let capital = montantInitial;
  let totalNetIncome = 0;

  if (withdrawalMode === 'interest_only') {
    // Mode 1: Retirer 100% des intérêts chaque année (capital reste stable)
    for (let year = 1; year <= horizon; year++) {
      const interestBrut = capital * (rendement / 100);
      const taxOnWithdrawal = interestBrut * effectiveTaxRate;
      const netIncomeYear = interestBrut - taxOnWithdrawal;
      totalNetIncome += netIncomeYear;

      // Le capital reste approximativement constant car les intérêts sont retirés
      // (simplification: on ne modélise pas la micro-fiscalité annuelle sur le capital lui-même)
    }

    const capitalFinalBrut = capital;
    const capitalFinalNet = capitalFinalBrut;
    const revenusAnnuelsMoyensNets = totalNetIncome / horizon;

    return {
      capitalFinal: capitalFinalNet,
      revenusAnnuelsMoyensNets,
      totalNetIncome
    };
  } else {
    // Mode 2: Retrait annuel fixe (% du capital initial)
    const withdrawalBrutPerYear = montantInitial * (annualWithdrawalRate / 100);

    for (let year = 1; year <= horizon; year++) {
      const interestBrut = capital * (rendement / 100);
      const grossWithdrawal = withdrawalBrutPerYear;

      // Fiscalité sur le retrait
      const taxOnWithdrawal = grossWithdrawal * effectiveTaxRate;
      const netIncomeYear = grossWithdrawal - taxOnWithdrawal;
      totalNetIncome += netIncomeYear;

      // Évolution du capital
      capital = capital + interestBrut - grossWithdrawal;
    }

    const capitalFinalBrut = Math.max(0, capital); // Ne peut pas être négatif
    const capitalFinalNet = capitalFinalBrut;
    const revenusAnnuelsMoyensNets = totalNetIncome / horizon;

    return {
      capitalFinal: capitalFinalNet,
      revenusAnnuelsMoyensNets,
      totalNetIncome
    };
  }
}

function projectScpiUc(
  montantInitial: number,
  pctArbitrage: number,
  rendementFE: number,
  rendementScpi: number,
  horizon: number,
  tauxRetrocession: number,
  fraisGestionAV: number,
  tauxRevalorisationPart: number,
  besoinRevenus: boolean = false,
  withdrawalMode: WithdrawalMode = 'interest_only',
  annualWithdrawalRate: number = 3
): { capitalFinal: number; revenusAnnuels: number } {
  const montantFE = montantInitial * (1 - pctArbitrage / 100);
  const montantScpi = montantInitial * (pctArbitrage / 100);

  // Rendement net AV = (rendement brut SCPI × taux rétrocession) - frais gestion AV
  const rendementScpiAV = (rendementScpi * tauxRetrocession / 100) - fraisGestionAV;

  // Gérer la partie fonds euros selon besoinRevenus
  let capitalFE: number;
  let revenusFE: number = 0;

  if (besoinRevenus && montantFE > 0) {
    const effectiveTaxRate = 0.30;
    const resultFE = computeFondsEurosWithWithdrawals(
      montantFE,
      rendementFE,
      horizon,
      withdrawalMode,
      annualWithdrawalRate,
      effectiveTaxRate
    );
    capitalFE = resultFE.capitalFinal;
    revenusFE = resultFE.revenusAnnuelsMoyensNets;
  } else {
    capitalFE = montantFE * Math.pow(1 + rendementFE / 100, horizon);
  }

  const capitalScpi = montantScpi * Math.pow(1 + rendementScpiAV / 100, horizon);

  // Appliquer la revalorisation des parts
  const facteurRevalo = Math.pow(1 + tauxRevalorisationPart / 100, horizon);
  const capitalScpiAvecRevalo = capitalScpi * facteurRevalo;

  const revenusScpi = capitalScpiAvecRevalo * (rendementScpiAV / 100);

  return {
    capitalFinal: capitalFE + capitalScpiAvecRevalo,
    revenusAnnuels: revenusScpi + revenusFE
  };
}

function projectScpiDirect(
  montantInitial: number,
  pctRachat: number,
  rendementFE: number,
  rendementScpi: number,
  horizon: number,
  tmi: number,
  tauxRevalorisationPart: number,
  besoinRevenus: boolean = false,
  withdrawalMode: WithdrawalMode = 'interest_only',
  annualWithdrawalRate: number = 3
): { capitalFinal: number; revenusAnnuelsNets: number } {
  const montantFE = montantInitial * (1 - pctRachat / 100);
  const montantScpiDirect = montantInitial * (pctRachat / 100);

  // Gérer la partie fonds euros selon besoinRevenus
  let capitalFE: number;
  let revenusFE: number = 0;

  if (besoinRevenus && montantFE > 0) {
    const effectiveTaxRate = 0.30;
    const resultFE = computeFondsEurosWithWithdrawals(
      montantFE,
      rendementFE,
      horizon,
      withdrawalMode,
      annualWithdrawalRate,
      effectiveTaxRate
    );
    capitalFE = resultFE.capitalFinal;
    revenusFE = resultFE.revenusAnnuelsMoyensNets;
  } else {
    capitalFE = montantFE * Math.pow(1 + rendementFE / 100, horizon);
  }

  // SCPI en direct : rendement net = rendement brut × (1 - (TMI + 17.2%))
  const tauxFiscalTotal = (tmi + 17.2) / 100;
  const rendementNetScpi = rendementScpi * (1 - tauxFiscalTotal);

  // Capitalisation avec rendement net
  const capitalScpi = montantScpiDirect * Math.pow(1 + rendementNetScpi / 100, horizon);

  // Appliquer la revalorisation des parts
  const facteurRevalo = Math.pow(1 + tauxRevalorisationPart / 100, horizon);
  const capitalScpiAvecRevalo = capitalScpi * facteurRevalo;

  const revenusScpi = capitalScpiAvecRevalo * (rendementNetScpi / 100);

  return {
    capitalFinal: capitalFE + capitalScpiAvecRevalo,
    revenusAnnuelsNets: revenusScpi + revenusFE
  };
}

function projectScpiCredit(
  montantCredit: number,
  tauxCredit: number,
  dureeCredit: number,
  rendementScpi: number,
  horizon: number
): {
  capitalFinal: number;
  cashFlowAnnuel: number;
  mensualite: number;
} {
  const tauxMensuel = tauxCredit / 100 / 12;
  const nbMois = dureeCredit * 12;
  const mensualite = montantCredit *
    (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) /
    (Math.pow(1 + tauxMensuel, nbMois) - 1);

  const capitalFinal = montantCredit * Math.pow(1 + rendementScpi / 100, horizon);
  const revenusAnnuels = montantCredit * (rendementScpi / 100);
  const annuiteCredit = mensualite * 12;
  const cashFlowAnnuel = revenusAnnuels - annuiteCredit;

  return {
    capitalFinal,
    cashFlowAnnuel,
    mensualite
  };
}

function projectScpiDemembrement(
  montantScpiDirect: number,
  pctDemembrement: number,
  cleNuePropriete: number,
  dureeDemembrement: number,
  horizon: number,
  rendementScpi: number,
  tmi: number,
  tauxRevalorisationPart: number
): { capitalFinal: number; revenusAnnuels: number; montantInvestiNP: number } {
  // Montant investi en nue-propriété
  const montantInvestiNP = montantScpiDirect * (pctDemembrement / 100) * (cleNuePropriete / 100);

  // Valeur en pleine propriété à l'issue du démembrement
  const valeurPleineProprieteFin = montantScpiDirect * (pctDemembrement / 100) *
    Math.pow(1 + tauxRevalorisationPart / 100, dureeDemembrement);

  let capitalFinal = 0;
  let revenusAnnuels = 0;

  if (horizon === dureeDemembrement) {
    // Cas A : Horizon = durée de démembrement
    // Pas de revenus pendant toute la durée
    capitalFinal = valeurPleineProprieteFin;
    revenusAnnuels = 0;
  } else if (horizon > dureeDemembrement) {
    // Cas B : Horizon > durée de démembrement
    // Après reconstitution, on considère la PP comme SCPI direct
    const anneesApresReconstitution = horizon - dureeDemembrement;
    const tauxFiscalTotal = (tmi + 17.2) / 100;
    const rendementNetScpi = rendementScpi * (1 - tauxFiscalTotal);

    // Continuer la revalorisation des parts pendant les années restantes
    const facteurRevalo = Math.pow(1 + tauxRevalorisationPart / 100, anneesApresReconstitution);
    capitalFinal = valeurPleineProprieteFin *
      Math.pow(1 + rendementNetScpi / 100, anneesApresReconstitution) *
      facteurRevalo;
    revenusAnnuels = capitalFinal * (rendementNetScpi / 100);
  } else {
    // Horizon < durée démembrement : pas encore reconstitué
    capitalFinal = montantInvestiNP; // On reste sur la valeur investie
    revenusAnnuels = 0;
  }

  return {
    capitalFinal,
    revenusAnnuels,
    montantInvestiNP
  };
}

function getRecommendedScenario(scenarios: ScenarioResult[]): ScenarioResult | null {
  // Exclure le scénario "100% Fonds euros" (baseline)
  const scpiScenarios = scenarios.filter(s => s.id !== 'A');

  if (scpiScenarios.length === 0) return null;

  // Tri par ordre de priorité :
  // 1. Capital final le plus élevé (net AV si disponible, sinon brut)
  // 2. En cas d'égalité, revenus annuels les plus élevés
  // 3. En cas d'égalité, risque le plus faible
  return scpiScenarios.reduce((best, current) => {
    const bestCapital = best.capitalFinalNetAV ?? best.capitalFinal;
    const currentCapital = current.capitalFinalNetAV ?? current.capitalFinal;

    if (currentCapital > bestCapital) return current;
    if (currentCapital < bestCapital) return best;

    // Égalité de capital : comparer les revenus
    if (current.revenusAnnuels > best.revenusAnnuels) return current;
    if (current.revenusAnnuels < best.revenusAnnuels) return best;

    // Égalité de revenus : préférer le risque le plus faible
    const riskOrder = { 'Faible': 1, 'Moyen': 2, 'Élevé': 3 };
    const bestRisk = riskOrder[best.risque as keyof typeof riskOrder] || 2;
    const currentRisk = riskOrder[current.risque as keyof typeof riskOrder] || 2;

    return currentRisk < bestRisk ? current : best;
  });
}

const LifeToScpiSimulator: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInputs>({
    montantActuel: 100000,
    horizon: 15,
    tmi: 30,
    estEnCouple: true,
    contratPlusDe8Ans: true,
    besoinRevenus: false,
    withdrawalMode: 'interest_only',
    annualWithdrawalRate: 3,
    rendementFondsEuros: 2.5,
    rendementScpi: 5.0,
    inflation: 2.0,
    tauxRetrocessionAV: 90,
    fraisGestionAV: 0.85,
    tauxRevalorisationPart: 0,
    pctArbitrage: 0,
    pctRachat: 0,
    montantCredit: 0,
    tauxCredit: 4.0,
    dureeCredit: 15,
    useDemembrement: false,
    pctDemembrement: 100,
    dureeDemembrement: 10,
    cleNuePropriete: 65
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<ScenarioResult[] | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof SimulationInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateInputs = (): boolean => {
    if (inputs.pctArbitrage + inputs.pctRachat > 100) {
      setError('La somme des pourcentages ne peut pas dépasser 100%');
      return false;
    }
    if (inputs.montantActuel <= 0) {
      setError('Le montant actuel doit être supérieur à 0');
      return false;
    }
    if (inputs.useDemembrement && inputs.pctDemembrement > 100) {
      setError('Le pourcentage de démembrement ne peut pas dépasser 100%');
      return false;
    }
    return true;
  };

  const runSimulation = () => {
    if (!validateInputs()) return;

    const scenarios: ScenarioResult[] = [];

    // Option 1 : 100% Fonds euros (baseline)
    if (inputs.besoinRevenus) {
      // Mode avec rachats partiels automatiques
      // Taux de fiscalité moyen estimé: PFU 30% simplifié
      const effectiveTaxRate = 0.30;
      const resultatAvecRetraits = computeFondsEurosWithWithdrawals(
        inputs.montantActuel,
        inputs.rendementFondsEuros,
        inputs.horizon,
        inputs.withdrawalMode,
        inputs.annualWithdrawalRate,
        effectiveTaxRate
      );

      const modeDesc = inputs.withdrawalMode === 'interest_only'
        ? 'Retrait de 100% des intérêts annuels (capital préservé)'
        : `Retrait de ${inputs.annualWithdrawalRate}% du capital initial par an`;

      scenarios.push({
        id: 'A',
        titre: '100% Fonds euros',
        capitalFinal: resultatAvecRetraits.capitalFinal,
        revenusAnnuels: resultatAvecRetraits.revenusAnnuelsMoyensNets,
        risque: 'Faible',
        complexite: 'Faible',
        liquidite: 'Liquide',
        details: `${modeDesc}. Revenus nets de fiscalité (taux moyen 30%).`
      });
    } else {
      // Mode sans rachats (comportement actuel)
      scenarios.push({
        id: 'A',
        titre: '100% Fonds euros',
        capitalFinal: projectFondsEuros(inputs.montantActuel, inputs.rendementFondsEuros, inputs.horizon),
        revenusAnnuels: 0,
        risque: 'Faible',
        complexite: 'Faible',
        liquidite: 'Liquide',
        details: 'Capitalisation intégrale, pas de revenus complémentaires'
      });
    }

    // Option 2 : SCPI en assurance-vie (avec frais de gestion)
    if (inputs.pctArbitrage > 0) {
      const resultB = projectScpiUc(
        inputs.montantActuel,
        inputs.pctArbitrage,
        inputs.rendementFondsEuros,
        inputs.rendementScpi,
        inputs.horizon,
        inputs.tauxRetrocessionAV,
        inputs.fraisGestionAV,
        inputs.tauxRevalorisationPart,
        inputs.besoinRevenus,
        inputs.withdrawalMode,
        inputs.annualWithdrawalRate
      );

      // Calculer la prime versée en AV (montant arbitré vers SCPI)
      const primeVerseeAV = inputs.montantActuel * (inputs.pctArbitrage / 100);

      // Calculer la fiscalité de sortie AV
      const fiscaliteAV = calculerFiscaliteSortieAV(
        resultB.capitalFinal,
        primeVerseeAV,
        inputs.contratPlusDe8Ans,
        inputs.estEnCouple
      );

      const rendementNetAV = (inputs.rendementScpi * inputs.tauxRetrocessionAV / 100) - inputs.fraisGestionAV;
      scenarios.push({
        id: 'B',
        titre: `SCPI dans votre assurance-vie (${inputs.pctArbitrage}%)`,
        capitalFinal: fiscaliteAV.capitalFinalNet,
        capitalFinalBrutAV: resultB.capitalFinal,
        capitalFinalNetAV: fiscaliteAV.capitalFinalNet,
        impotSortieAV: fiscaliteAV.impotSortie,
        abattementAV: fiscaliteAV.abattement,
        revenusAnnuels: resultB.revenusAnnuels,
        risque: 'Moyen',
        complexite: 'Faible',
        liquidite: 'Liquide',
        details: `Rendement net: ${rendementNetAV.toFixed(2)}% (rétrocession ${inputs.tauxRetrocessionAV}% - frais ${inputs.fraisGestionAV}%)`
      });
    }

    // Option 3 : SCPI en direct (fiscalité IR + PS)
    if (inputs.pctRachat > 0) {
      const resultC = projectScpiDirect(
        inputs.montantActuel,
        inputs.pctRachat,
        inputs.rendementFondsEuros,
        inputs.rendementScpi,
        inputs.horizon,
        inputs.tmi,
        inputs.tauxRevalorisationPart,
        inputs.besoinRevenus,
        inputs.withdrawalMode,
        inputs.annualWithdrawalRate
      );
      scenarios.push({
        id: 'C',
        titre: `SCPI en direct (${inputs.pctRachat}%)`,
        capitalFinal: resultC.capitalFinal,
        revenusAnnuels: resultC.revenusAnnuelsNets,
        risque: 'Moyen',
        complexite: 'Moyenne',
        liquidite: 'Moins liquide',
        details: `Rendement net: ${(inputs.rendementScpi * (1 - (inputs.tmi + 17.2) / 100)).toFixed(2)}% (après fiscalité TMI ${inputs.tmi}% + PS 17.2%)`
      });
    }

    // Option 4 : SCPI à crédit (optionnelle)
    if (inputs.montantCredit > 0) {
      const resultD = projectScpiCredit(
        inputs.montantCredit,
        inputs.tauxCredit,
        inputs.dureeCredit,
        inputs.rendementScpi,
        inputs.horizon
      );
      scenarios.push({
        id: 'D',
        titre: `SCPI à crédit (${(inputs.montantCredit / 1000).toFixed(0)}k €)`,
        capitalFinal: resultD.capitalFinal,
        revenusAnnuels: resultD.cashFlowAnnuel,
        risque: 'Élevé',
        complexite: 'Élevée',
        liquidite: 'Illiquide',
        details: `Cash-flow annuel : ${resultD.cashFlowAnnuel >= 0 ? '+' : ''}${resultD.cashFlowAnnuel.toFixed(0)} €/an (revenus SCPI - mensualités)`
      });
    }

    // Option 5 : SCPI en démembrement (nue-propriété)
    if (inputs.useDemembrement && inputs.pctRachat > 0) {
      const montantScpiDirect = inputs.montantActuel * (inputs.pctRachat / 100);
      const resultE = projectScpiDemembrement(
        montantScpiDirect,
        inputs.pctDemembrement,
        inputs.cleNuePropriete,
        inputs.dureeDemembrement,
        inputs.horizon,
        inputs.rendementScpi,
        inputs.tmi,
        inputs.tauxRevalorisationPart
      );
      scenarios.push({
        id: 'E',
        titre: `SCPI en démembrement (${inputs.pctDemembrement}% en NP)`,
        capitalFinal: resultE.capitalFinal,
        revenusAnnuels: resultE.revenusAnnuels,
        risque: 'Moyen',
        complexite: 'Élevée',
        liquidite: 'Illiquide',
        details: `Investissement NP : ${resultE.montantInvestiNP.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € • Durée : ${inputs.dureeDemembrement} ans • Pas de revenus pendant ${inputs.dureeDemembrement} ans`
      });
    }

    setResults(scenarios);
  };

  const pctResteFondsEuros = 100 - inputs.pctArbitrage - inputs.pctRachat;

  // Recalcul automatique des résultats à chaque changement d'input
  useEffect(() => {
    if (inputs.pctArbitrage + inputs.pctRachat > 100 || inputs.montantActuel <= 0) {
      return;
    }
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputs.montantActuel,
    inputs.horizon,
    inputs.tmi,
    inputs.estEnCouple,
    inputs.contratPlusDe8Ans,
    inputs.besoinRevenus,
    inputs.withdrawalMode,
    inputs.annualWithdrawalRate,
    inputs.rendementFondsEuros,
    inputs.rendementScpi,
    inputs.tauxRetrocessionAV,
    inputs.fraisGestionAV,
    inputs.tauxRevalorisationPart,
    inputs.pctArbitrage,
    inputs.pctRachat,
    inputs.montantCredit,
    inputs.tauxCredit,
    inputs.dureeCredit,
    inputs.useDemembrement,
    inputs.pctDemembrement,
    inputs.dureeDemembrement,
    inputs.cleNuePropriete
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Simulateur de réallocation
        </h2>
        <p className="text-lg text-white max-w-2xl mx-auto">
          Comparez les différentes options pour faire évoluer votre épargne
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-white dark:text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
            Votre situation actuelle
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Montant de fonds euros à investir en SCPI
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputs.montantActuel}
                  onChange={(e) => handleInputChange('montantActuel', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium"
                />
                <span className="absolute right-4 top-3 text-white dark:text-gray-300 font-medium">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Horizon de projection
              </label>
              <select
                value={inputs.horizon}
                onChange={(e) => handleInputChange('horizon', Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium appearance-none cursor-pointer"
              >
                <option value={5}>5 ans</option>
                <option value={8}>8 ans</option>
                <option value={10}>10 ans</option>
                <option value={15}>15 ans</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Votre tranche marginale d'imposition (TMI)
              </label>
              <select
                value={inputs.tmi}
                onChange={(e) => handleInputChange('tmi', Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium appearance-none cursor-pointer"
              >
                <option value={0}>0 %</option>
                <option value={11}>11 %</option>
                <option value={30}>30 %</option>
                <option value={41}>41 %</option>
                <option value={45}>45 %</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Situation familiale
              </label>
              <select
                value={inputs.estEnCouple ? 'couple' : 'seul'}
                onChange={(e) => setInputs(prev => ({ ...prev, estEnCouple: e.target.value === 'couple' }))}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium appearance-none cursor-pointer"
              >
                <option value="seul">Personne seule (abattement 4 600 €)</option>
                <option value="couple">En couple (abattement 9 200 €)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Votre contrat d'assurance-vie a-t-il plus de 8 ans ?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.contratPlusDe8Ans === true}
                    onChange={() => setInputs(prev => ({ ...prev, contratPlusDe8Ans: true }))}
                    className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-white dark:text-gray-100">Oui</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.contratPlusDe8Ans === false}
                    onChange={() => setInputs(prev => ({ ...prev, contratPlusDe8Ans: false }))}
                    className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-white dark:text-gray-100">Non</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Avez-vous besoin de revenus complémentaires pendant la période de placement ?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.besoinRevenus === true}
                    onChange={() => setInputs(prev => ({ ...prev, besoinRevenus: true }))}
                    className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-white dark:text-gray-100">Oui</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.besoinRevenus === false}
                    onChange={() => setInputs(prev => ({ ...prev, besoinRevenus: false }))}
                    className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-white dark:text-gray-100">Non</span>
                </label>
              </div>
            </div>
          </div>

          {inputs.besoinRevenus && (
            <div className="mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-300 dark:border-orange-700">
              <h4 className="text-base font-bold text-orange-900 dark:text-orange-200 mb-4">
                🔄 Configuration des revenus sur le fonds euros
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3">
                    Mode de génération de revenus
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 transition-colors">
                      <input
                        type="radio"
                        checked={inputs.withdrawalMode === 'interest_only'}
                        onChange={() => setInputs(prev => ({ ...prev, withdrawalMode: 'interest_only' }))}
                        className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500 mt-0.5"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Retirer 100% des intérêts chaque année (capital stable)
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Recommandé : votre capital reste proche de sa valeur initiale, seuls les intérêts sont distribués en revenus.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 transition-colors">
                      <input
                        type="radio"
                        checked={inputs.withdrawalMode === 'percent_capital'}
                        onChange={() => setInputs(prev => ({ ...prev, withdrawalMode: 'percent_capital' }))}
                        className="w-5 h-5 text-orange-600 border-gray-300 focus:ring-orange-500 mt-0.5"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Retrait annuel fixe (% du capital initial)
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Vous retirez un montant fixe chaque année. Le capital peut diminuer si le taux de retrait dépasse le rendement.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {inputs.withdrawalMode === 'percent_capital' && (
                  <div>
                    <label className="block text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
                      Taux de retrait annuel (% du capital initial)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={inputs.annualWithdrawalRate}
                        onChange={(e) => handleInputChange('annualWithdrawalRate', Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-medium">%</span>
                    </div>
                    <p className="text-xs text-orange-800 dark:text-orange-300 mt-2">
                      💡 Conseil : un taux entre 2% et 4% permet de préserver le capital sur le long terme (rendement fonds euros ~2.5%).
                    </p>
                  </div>
                )}

                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    ℹ️ <strong>Fiscalité simplifiée :</strong> Les revenus affichés sont nets de fiscalité estimée à 30% (PFU moyen). Le détail des abattements annuels n'est pas modélisé pour rester lisible.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 Ces paramètres (TMI, situation familiale, ancienneté de votre contrat, besoin de revenus) permettent d'affiner la comparaison entre assurance-vie, détention en direct et démembrement.
            </p>
          </div>
        </div>

        <div className="mb-10 pb-10 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-white dark:text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
            Hypothèses de rendement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Rendement annuel estimé du fonds euros
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={inputs.rendementFondsEuros}
                  onChange={(e) => handleInputChange('rendementFondsEuros', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium"
                />
                <span className="absolute right-4 top-3 text-white dark:text-gray-300 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                Rendement annuel estimé des SCPI <span className="text-gray-400 font-normal">(5% France et 6.5% Europe)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={inputs.rendementScpi}
                  onChange={(e) => handleInputChange('rendementScpi', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium"
                />
                <span className="absolute right-4 top-3 text-white dark:text-gray-300 font-medium">%</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-white italic">
            Inflation estimée : {inputs.inflation}% (modifiable dans les options avancées)
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white dark:text-white mb-6 flex items-center">
            <span className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
            Comment souhaitez-vous utiliser vos fonds euros ?
          </h3>

          <div className="max-w-md">
            <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
              Sélectionnez votre stratégie
            </label>
            <select
              value={`${inputs.pctArbitrage}-${inputs.pctRachat}`}
              onChange={(e) => {
                const [arbitrage, rachat] = e.target.value.split('-').map(Number);
                setInputs(prev => ({ ...prev, pctArbitrage: arbitrage, pctRachat: rachat }));
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-900 text-white dark:text-gray-100 text-lg font-medium appearance-none cursor-pointer [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:text-white [&>option]:dark:text-gray-100"
            >
              <option value="50-0">Arbitrer 50% vers SCPI en assurance-vie</option>
              <option value="100-0">Arbitrer 100% vers SCPI en assurance-vie</option>
              <option value="0-50">Racheter 50% pour investir en SCPI en direct</option>
              <option value="0-100">Racheter 100% pour investir en SCPI en direct</option>
              <option value="50-50">Mixte : 50% SCPI AV + 50% SCPI direct</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">
              {inputs.pctArbitrage > 0 && `${inputs.pctArbitrage}% en SCPI AV (${((inputs.montantActuel * inputs.pctArbitrage) / 100).toLocaleString('fr-FR')} €)`}
              {inputs.pctArbitrage > 0 && inputs.pctRachat > 0 && ' • '}
              {inputs.pctRachat > 0 && `${inputs.pctRachat}% en SCPI direct (${((inputs.montantActuel * inputs.pctRachat) / 100).toLocaleString('fr-FR')} €)`}
              {inputs.pctArbitrage === 0 && inputs.pctRachat === 0 && 'Aucun investissement en SCPI'}
            </p>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/15 dark:to-amber-500/15 rounded-xl border border-orange-100 dark:border-orange-800/40">
            <h4 className="text-sm font-bold text-white dark:text-gray-100 mb-3">Répartition de vos {inputs.montantActuel.toLocaleString('fr-FR')} €</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white dark:text-gray-100 font-medium">• Fonds euros conservé</span>
                <span className="font-bold text-white dark:text-gray-50">{pctResteFondsEuros}% ({((inputs.montantActuel * pctResteFondsEuros) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</span>
              </div>
              {inputs.pctArbitrage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 dark:text-green-400">• SCPI dans votre AV</span>
                  <span className="font-semibold text-orange-900 dark:text-green-300">{inputs.pctArbitrage}% ({((inputs.montantActuel * inputs.pctArbitrage) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</span>
                </div>
              )}
              {inputs.pctRachat > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 dark:text-green-500">• SCPI en direct</span>
                  <span className="font-semibold text-orange-800 dark:text-green-400">{inputs.pctRachat}% ({((inputs.montantActuel * inputs.pctRachat) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Options avancées (facultatif)
            </span>
            <svg
              className={`w-5 h-5 text-white transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-6 p-6 bg-gray-800 rounded-lg space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-white dark:text-gray-300 mb-3 uppercase tracking-wide">Options avancées du contrat</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2 flex items-center">
                      Taux de rétrocession des revenus SCPI en AV
                      <span className="ml-2 text-gray-400 cursor-help" title="Certains assureurs ne reversent pas 100% des revenus SCPI">ⓘ</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={inputs.tauxRetrocessionAV}
                        onChange={(e) => handleInputChange('tauxRetrocessionAV', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Taux de reversement des loyers SCPI</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Frais de gestion annuels sur UC
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        value={inputs.fraisGestionAV}
                        onChange={(e) => handleInputChange('fraisGestionAV', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Prélevés par l'assureur sur les UC</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Revalorisation annuelle estimée du prix de part SCPI
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.tauxRevalorisationPart}
                        onChange={(e) => handleInputChange('tauxRevalorisationPart', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Impact sur la plus-value finale</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Inflation annuelle moyenne
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.inflation}
                        onChange={(e) => handleInputChange('inflation', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Pour information uniquement</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <h4 className="text-sm font-semibold text-white dark:text-gray-300 mb-3 uppercase tracking-wide">
                  SCPI en démembrement (nue-propriété)
                </h4>

                {inputs.tmi >= 30 && !inputs.besoinRevenus ? (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-200 font-semibold">
                      ✨ <strong>Recommandé pour votre profil fiscal</strong> (TMI ≥ 30% sans besoin de revenus immédiats)
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-300 mt-2">
                      Le démembrement permet d'optimiser votre fiscalité en différant les revenus tout en bénéficiant d'une décote à l'achat.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-900 dark:text-orange-200">
                      💡 Option plutôt destinée aux <strong>TMI ≥ 30%</strong> sans besoin de revenus immédiats.
                      {inputs.tmi < 30 && " Votre TMI actuelle est inférieure à 30%."}
                      {inputs.besoinRevenus && " Vous avez indiqué avoir besoin de revenus complémentaires."}
                    </p>
                  </div>
                )}

                <label className="flex items-center cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={inputs.useDemembrement}
                    onChange={(e) => setInputs(prev => ({ ...prev, useDemembrement: e.target.checked }))}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-white dark:text-gray-100">
                    Investir une partie en SCPI en nue-propriété (démembrement)
                  </span>
                </label>

                {inputs.useDemembrement && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-700 dark:bg-gray-800 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                        % de SCPI direct en nue-propriété
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.pctDemembrement}
                          onChange={(e) => handleInputChange('pctDemembrement', Number(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                        />
                        <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                        Durée du démembrement
                      </label>
                      <select
                        value={inputs.dureeDemembrement}
                        onChange={(e) => {
                          const duree = Number(e.target.value);
                          const clefs = { 5: 75, 10: 65, 15: 55, 20: 45 } as const;
                          setInputs(prev => ({
                            ...prev,
                            dureeDemembrement: duree,
                            cleNuePropriete: clefs[duree as keyof typeof clefs] || 65
                          }));
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      >
                        <option value={5}>5 ans</option>
                        <option value={10}>10 ans</option>
                        <option value={15}>15 ans</option>
                        <option value={20}>20 ans</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                        Clé de nue-propriété
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inputs.cleNuePropriete}
                          onChange={(e) => handleInputChange('cleNuePropriete', Number(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                        />
                        <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Prix en % de la pleine propriété</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                        Revalorisation annuelle estimée
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.tauxRevalorisation}
                          onChange={(e) => handleInputChange('tauxRevalorisation', Number(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                        />
                        <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Revalorisation des parts (optionnel)</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-300">
                <h4 className="text-sm font-semibold text-white dark:text-gray-300 mb-3 uppercase tracking-wide">
                  SCPI à crédit (optionnel)
                </h4>
                <p className="text-sm text-white dark:text-gray-400 mb-4">
                  Ajouter un investissement SCPI financé par un crédit bancaire
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Montant souhaité
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.montantCredit}
                        onChange={(e) => handleInputChange('montantCredit', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">€</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Taux du crédit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.tauxCredit}
                        onChange={(e) => handleInputChange('tauxCredit', Number(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                      />
                      <span className="absolute right-4 top-2 text-white dark:text-gray-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white dark:text-gray-100 mb-2">
                      Durée du crédit
                    </label>
                    <select
                      value={inputs.dureeCredit}
                      onChange={(e) => handleInputChange('dureeCredit', Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 dark:focus:ring-green-500 focus:border-orange-600 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-white dark:text-white"
                    >
                      <option value={10}>10 ans</option>
                      <option value={15}>15 ans</option>
                      <option value={20}>20 ans</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={runSimulation}
            disabled={!!error}
            className="px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            Voir les résultats
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white dark:text-white mb-2">
              Vos scénarios à {inputs.horizon} ans
            </h3>
            <p className="text-white dark:text-gray-300">
              Comparaison basée sur vos paramètres
            </p>
          </div>

          {/* BLOC SYNTHÈSE : 2 cartes comparatives */}
          {(() => {
            const baseline = results.find(s => s.id === 'A');
            const recommended = getRecommendedScenario(results);

            if (!baseline || !recommended) return null;

            return (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
                <h4 className="text-xl font-bold text-orange-900 dark:text-orange-400 mb-6 text-center">
                  📊 Synthèse : Situation actuelle vs Stratégie recommandée
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Carte 1 : Situation actuelle */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        Situation actuelle
                      </h5>
                      <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                        Baseline
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">100% Fonds euros</p>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Capital final</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {baseline.capitalFinal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500">Revenus annuels</div>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {baseline.revenusAnnuels > 0
                              ? `${baseline.revenusAnnuels.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
                              : '0 €'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Risque</div>
                          <div className="text-sm font-semibold text-green-600">{baseline.risque}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 pt-2">
                        <span className="font-medium">Liquidité :</span> {baseline.liquidite}
                      </div>
                    </div>
                  </div>

                  {/* Carte 2 : Stratégie recommandée */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-400 dark:border-green-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-bold text-green-900 dark:text-green-200">
                        Stratégie recommandée
                      </h5>
                      <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full">
                        ✨ Optimal
                      </span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-300 mb-4 font-semibold">
                      {recommended.titre.replace(/\(\d+%\)/, '').trim()}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-green-700 dark:text-green-400 uppercase">Capital final net</div>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {(recommended.capitalFinalNetAV ?? recommended.capitalFinal).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                          +{((recommended.capitalFinalNetAV ?? recommended.capitalFinal) - baseline.capitalFinal).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € vs baseline
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-green-200 dark:border-green-800">
                        <div>
                          <div className="text-xs text-green-700 dark:text-green-400">Revenus annuels</div>
                          <div className="text-sm font-semibold text-green-900 dark:text-green-200">
                            {recommended.revenusAnnuels > 0
                              ? `+${recommended.revenusAnnuels.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
                              : '0 €'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-green-700 dark:text-green-400">Risque</div>
                          <div className="text-sm font-semibold text-green-900 dark:text-green-200">{recommended.risque}</div>
                        </div>
                      </div>

                      <div className="text-xs text-green-700 dark:text-green-400 pt-2">
                        <span className="font-medium">Liquidité :</span> {recommended.liquidite}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-800 dark:text-green-300">
                        💡 Avec vos paramètres (TMI {inputs.tmi}%, horizon {inputs.horizon} ans{inputs.besoinRevenus ? ', besoin de revenus' : ''}), cette stratégie offre le meilleur compromis entre capital final et revenus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TABLEAU COMPARATIF DÉTAILLÉ */}
          {results.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-x-auto">
              <h4 className="text-xl font-bold text-white dark:text-white mb-2">
                📋 Tableau comparatif détaillé
              </h4>
              <p className="text-sm text-white dark:text-gray-400 mb-6">
                Comparaison entre Fonds euros, SCPI en assurance-vie et SCPI en direct
              </p>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-white dark:text-gray-300">Critère</th>
                    {results.map(scenario => (
                      <th key={scenario.id} className="text-center py-3 px-4 font-semibold text-white dark:text-gray-300">
                        <div className="text-xs uppercase mb-1 text-gray-500 dark:text-gray-500">
                          {scenario.id === 'A' ? 'Baseline' : scenario.id === 'B' ? 'En AV' : scenario.id === 'C' ? 'En direct' : 'Autre'}
                        </div>
                        <div>{scenario.titre.replace(/\(\d+%\)/, '').trim()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Capital final brut */}
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <td className="py-3 px-4 font-medium text-white dark:text-gray-300">Capital final brut</td>
                    {results.map(scenario => (
                      <td key={scenario.id} className="text-center py-3 px-4 font-semibold text-white dark:text-gray-100">
                        {scenario.id === 'B' && scenario.capitalFinalBrutAV
                          ? `${(scenario.capitalFinalBrutAV / 1000).toFixed(0)}k €`
                          : `${(scenario.capitalFinal / 1000).toFixed(0)}k €`
                        }
                      </td>
                    ))}
                  </tr>

                  {/* Capital final net */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium text-white dark:text-gray-300">
                      Capital final net
                      <div className="text-xs text-gray-500 font-normal">après fiscalité sortie</div>
                    </td>
                    {results.map(scenario => (
                      <td key={scenario.id} className="text-center py-3 px-4">
                        {scenario.id === 'B' && scenario.capitalFinalNetAV ? (
                          <div>
                            <div className="font-bold text-green-600">
                              {(scenario.capitalFinalNetAV / 1000).toFixed(0)}k €
                            </div>
                            <div className="text-xs text-gray-500">
                              (PFU 30%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Revenus annuels */}
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <td className="py-3 px-4 font-medium text-white dark:text-gray-300">
                      Revenus annuels
                      <div className="text-xs text-gray-500 font-normal">nets estimés</div>
                    </td>
                    {results.map(scenario => (
                      <td key={scenario.id} className="text-center py-3 px-4">
                        {scenario.revenusAnnuels > 0 ? (
                          <div className="font-semibold text-green-600">
                            +{(scenario.revenusAnnuels / 1000).toFixed(1)}k €
                          </div>
                        ) : scenario.id === 'B' ? (
                          <div className="text-xs text-gray-500">
                            Potentiel de<br/>rachat programmé
                          </div>
                        ) : (
                          <span className="text-gray-400">0 €</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Risque */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium text-white dark:text-gray-300">Niveau de risque</td>
                    {results.map(scenario => (
                      <td key={scenario.id} className="text-center py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          scenario.risque === 'Faible' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          scenario.risque === 'Moyen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {scenario.risque}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Liquidité */}
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <td className="py-3 px-4 font-medium text-white dark:text-gray-300">Liquidité</td>
                    {results.map(scenario => (
                      <td key={scenario.id} className="text-center py-3 px-4 text-sm text-white dark:text-gray-300">
                        {scenario.id === 'C' ? (
                          <div className="text-xs">
                            Moins liquide<br/>
                            <span className="text-gray-500">(marché secondaire)</span>
                          </div>
                        ) : scenario.id === 'B' ? (
                          <div className="text-xs">
                            Liquide<br/>
                            <span className="text-gray-500">(via AV)</span>
                          </div>
                        ) : (
                          scenario.liquidite
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* Options avancées (autres scénarios) */}
              {results.some(s => !['A', 'B', 'C'].includes(s.id)) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-white dark:text-gray-300 mb-4">
                    📌 Autres stratégies activées
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.filter(s => !['A', 'B', 'C'].includes(s.id)).map(scenario => (
                      <div key={scenario.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-white dark:text-gray-200 mb-2">{scenario.titre}</div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Capital final:</span>
                            <span className="font-semibold text-white dark:text-gray-100">
                              {(scenario.capitalFinal / 1000).toFixed(0)}k €
                            </span>
                          </div>
                          {scenario.revenusAnnuels > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Revenus:</span>
                              <span className="font-semibold text-green-600">
                                +{(scenario.revenusAnnuels / 1000).toFixed(1)}k €/an
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risque:</span>
                            <span className="text-white dark:text-gray-200">{scenario.risque}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-5xl mx-auto text-left border-2 border-orange-200 dark:border-orange-800">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between text-left group hover:bg-orange-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
            >
              <h3 className="text-xl font-bold text-white dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Comment interpréter ces résultats ?
              </h3>
              <svg
                className={`w-6 h-6 text-orange-500 transition-transform duration-300 ${showExplanation ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showExplanation && (
              <div className="space-y-6 text-sm text-white dark:text-gray-300 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-bold text-orange-600 dark:text-orange-400 text-base mb-2">📊 Capital final</p>
                <p>Valeur totale estimée de votre patrimoine au bout de {inputs.horizon} ans, en tenant compte :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>de la capitalisation de votre fonds euros au taux que vous avez renseigné,</li>
                  <li>de la performance de vos SCPI (en assurance-vie, en direct, à crédit ou en démembrement),</li>
                  <li>et du remboursement progressif du capital en cas de SCPI à crédit.</li>
                </ul>
                <p className="mt-2"><strong>Pour l'assurance-vie</strong> : le capital final NET affiché intègre la fiscalité de sortie (PFU 30% après abattement). Pour les autres scénarios, les montants sont hors fiscalité sur les plus-values immobilières en cas de revente des SCPI.</p>
              </div>

              <div>
                <p className="font-bold text-orange-600 dark:text-orange-400 text-base mb-2">💰 Revenus annuels</p>
                <p className="mb-2">Flux de revenus estimés générés chaque année par vos SCPI :</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>SCPI dans votre assurance-vie :</strong><br/>Le rendement est capitalisé dans le contrat. Les revenus ne sont pas imposés tant que vous ne réalisez pas de rachat. Les montants affichés correspondent au potentiel de revenus, pas à des rachats effectifs.</li>
                  <li><strong>SCPI en direct :</strong><br/>Les revenus indiqués sont <strong>nets de fiscalité annuelle</strong>, en intégrant votre tranche marginale d'imposition (TMI) et les prélèvements sociaux (17,2%).</li>
                  <li><strong>SCPI à crédit :</strong><br/>Les revenus annuels correspondent au flux estimé : <em>Revenus de SCPI – mensualités de crédit</em>. Cette approche illustre l'effet de levier et le cash-flow. La fiscalité détaillée (déductibilité des intérêts, plus-value) n'est pas modélisée.</li>
                  <li><strong>SCPI en démembrement (nue-propriété) :</strong><br/>Pendant toute la durée du démembrement, vous ne percevez aucun revenu sur ces parts : pas d'impôt sur le revenu, pas de prélèvements sociaux, en principe pas d'IFI sur la nue-propriété (l'IFI est porté par l'usufruitier). À l'issue du démembrement, vous récupérez la pleine propriété de la totalité des parts.</li>
                </ul>
              </div>

              <div className="border-t border-gray-300 dark:border-gray-700 pt-6 mt-6">
                <h4 className="font-bold text-white dark:text-white text-lg mb-4">Méthodologie de calcul</h4>

                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-orange-500 dark:text-orange-400">• Fonds euros</p>
                    <p className="ml-4">Capitalisation au taux annuel que vous avez saisi (par défaut {inputs.rendementFondsEuros}% net de frais de gestion), sans prise en compte de la fiscalité sur les éventuels rachats.</p>
                  </div>

                  <div>
                    <p className="font-semibold text-orange-500 dark:text-orange-400">• SCPI en assurance-vie</p>
                    <p className="ml-4">Rendement brut basé sur le taux que vous avez indiqué ({inputs.rendementScpi}%), multiplié par le taux de rétrocession de votre contrat ({inputs.tauxRetrocessionAV}%), puis diminué des frais de gestion annuels ({inputs.fraisGestionAV}%). Le tout est intégralement réinvesti dans l'enveloppe assurance-vie. La revalorisation du prix de part ({inputs.tauxRevalorisationPart}% par an) est appliquée au capital final. <strong>La fiscalité de sortie est intégrée au capital final NET</strong> : application du PFU 30% (12,8% IR + 17,2% PS) sur les gains, après déduction de l'abattement de {inputs.estEnCouple ? '9 200' : '4 600'} € {inputs.contratPlusDe8Ans ? '(contrat > 8 ans)' : '(pas d\'abattement si contrat < 8 ans)'}.</p>
                  </div>

                  <div>
                    <p className="font-semibold text-orange-500 dark:text-orange-400">• SCPI en direct</p>
                    <p className="ml-4">Rendement brut : {inputs.rendementScpi}%, fiscalité modélisée comme une imposition annuelle des revenus fonciers (impôt sur le revenu à votre TMI de {inputs.tmi}% + 17,2% de prélèvements sociaux). Le rendement net affiché correspond au rendement après impôts et prélèvements sociaux, encaissé chaque année. La revalorisation du prix de part ({inputs.tauxRevalorisationPart}% par an) est appliquée au capital final. La fiscalité sur la plus-value immobilière en cas de revente n'est pas modélisée.</p>
                  </div>

                  <div>
                    <p className="font-semibold text-orange-500 dark:text-orange-400">• SCPI à crédit (optionnel)</p>
                    <p className="ml-4">Simulation d'un investissement financé par un crédit bancaire au montant, taux et durée que vous avez renseignés. Les revenus annuels affichés correspondent au flux estimé : <em>Revenus de SCPI – mensualités de crédit</em>. Cette approche illustre l'effet de levier et le cash-flow. La fiscalité réelle (déductibilité des intérêts, régime des revenus fonciers, plus-value) sera affinée dans le cadre d'un conseil personnalisé.</p>
                  </div>

                  <div>
                    <p className="font-semibold text-orange-500 dark:text-orange-400">• SCPI en démembrement (nue-propriété)</p>
                    <p className="ml-4">Le simulateur modélise l'achat de la nue-propriété de parts de SCPI pour une durée déterminée (par exemple {inputs.dureeDemembrement} ans), l'usufruit étant détenu par un autre investisseur. Vous payez une fraction du prix de la pleine propriété (clé de {inputs.cleNuePropriete}%), vous ne percevez aucun revenu pendant toute la durée, vous n'êtes pas imposé, et en principe ces parts ne sont pas prises en compte dans votre assiette IFI. À l'issue, vous récupérez la pleine propriété. Ce type de montage est particulièrement adapté aux contribuables à partir d'une TMI de 30%, qui n'ont pas besoin de revenus complémentaires à court terme.</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-300 dark:border-orange-700 mt-6">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">⚠️ Avertissement important</p>
                <p className="text-xs text-orange-800 dark:text-orange-300">
                  Ces simulations sont indicatives et reposent sur des hypothèses de rendement, de fiscalité et de revalorisation susceptibles d'évoluer. Les performances passées ne préjugent pas des performances futures. Les montants affichés ne constituent en aucun cas une garantie de résultat ni une recommandation personnalisée. Pour une analyse fondée sur vos contrats réels, votre fiscalité précise et une sélection de SCPI adaptée à votre situation, il est indispensable de réaliser un diagnostic personnalisé.
                </p>
              </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/15 dark:to-amber-500/15 rounded-2xl p-8 text-center border border-orange-100 dark:border-orange-800/40">
            <h4 className="text-2xl font-bold text-white dark:text-white mb-4">
              Besoin d'un accompagnement personnalisé ?
            </h4>
            <p className="text-white dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Ces simulations sont indicatives. Pour une analyse avec vos vrais contrats,
              votre fiscalité exacte et une sélection de SCPI adaptée, réservez une visio de 30 minutes.
            </p>
            <a
              href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              Réserver un diagnostic Fonds euros / SCPI
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const LifeToScpiPage: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 dark:from-green-900 dark:via-gray-900 dark:to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Simulateur Fonds euros → SCPI
            </h1>
            <h2 className="text-xl md:text-2xl mb-8 text-orange-100 leading-relaxed">
              Comparez plusieurs stratégies pour réallouer une partie de votre assurance-vie vers des SCPI
            </h2>

            <ul className="space-y-3 mb-8 text-left inline-block">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-white mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Simulation basée sur vos montants réels</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-white mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Projection multi-scénarios comparative</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-white mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">Résultats pédagogiques et détaillés</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => scrollToSection('simulateur')}
                className="px-8 py-4 bg-white text-orange-900 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Lancer la simulation
              </button>
              <a
                href="https://calendly.com/eric-bellaiche/gp-rendez-vous-avec-eric-bellaiche-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-orange-900 transition-all text-center"
              >
                Réserver un diagnostic
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="simulateur" className="py-16 scroll-mt-16">
        <LifeToScpiSimulator />
      </section>

      <footer className="bg-gray-900 dark:bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 MaximusSCPI - Eric Bellaiche, Conseiller en Gestion de Patrimoine
          </p>
          <p className="text-white text-sm mt-2">
            Membre CNCEF - Immatriculé ORIAS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LifeToScpiPage;
