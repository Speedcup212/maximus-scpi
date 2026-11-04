import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Building2, PieChart as PieChartIcon, Info } from 'lucide-react';


// ============================================================================
// TYPES
// ============================================================================

type DemembrementScenario = "pleine_propriete" | "nue_propriete" | "usufruit";

type OrigineLoyers = "100_france" | "100_europe" | "50_50" | "70_30" | "30_70";

interface DemembrementInputs {
  // Profil fiscal
  tmi: number;
  ps: number;
  needsIncome: boolean;

  // Paramètres SCPI communs
  montantBase: number;
  horizonTotal: number;
  rendementBrut: number;
  revalorisation: number;
  origineLoyers: OrigineLoyers;
  fraisEntree: number;
  delaiJouissanceMois: number;

  // Pleine propriété
  montantPleinePropriete: number;

  // Nue-propriété
  dureeDemembrement: number;
  decoteNuePro: number;
  montantNuePro: number;

  // Usufruit
  dureeUsufruit: number;
  prixUsufruit: number;
  montantUsufruit: number;
  enableUsufruit: boolean;
}

interface DemembrementScenarioResult {
  scenario: DemembrementScenario;
  label: string;
  capitalInitialDebourse: number;
  revenusNetsAnnuelsMoyens: number;
  revenusNetsCumules: number;
  capitalFinalNet: number;
  gainNetGlobal: number;
  tri: number | null;
  profil: "Revenus" | "Capitalisation" | "Mixte";
  details: string;
  revenusNetsPhaseAn?: number;
  nbAnneesFlux?: number;
  showTaxWarning?: boolean;
  fiscalite?: {
    revenusBrutsAnnuelsMoyens: number;
    impotIRAnnuelMoyen: number;
    impotPSAnnuelMoyen: number;
    impotTotalAnnuelMoyen: number;
    tauxImpositionEffectif: number;
  };
  capitalBreakdown?: {
    montantInvesti: number;
    valeurBruteHorizon: number;
    ecartSouscriptionRetrait: number;
    ecartAmount: number;
    capitalNetRecupere: number;
  };
}

interface DemembrementComparisonResult {
  pleinePropriete: DemembrementScenarioResult;
  nuePropriete: DemembrementScenarioResult;
  usufruit?: DemembrementScenarioResult;
}

// ============================================================================
// FONCTION UTILITAIRE : VALEUR PLEINE PROPRIÉTÉ À L'HORIZON
// ============================================================================

/**
 * Calcule la valeur de la pleine propriété à un horizon donné,
 * en appliquant la revalorisation annuelle du prix de part et l'écart souscription/retrait.
 *
 * Cette fonction garantit que la revalorisation est appliquée de manière identique
 * pour tous les scénarios (PP, NP, Usufruit), car le sous-jacent SCPI est le même.
 *
 * @param baseAmount - Montant de référence en pleine propriété (ex: 100 000 €)
 * @param ecartSouscription - Écart souscription/retrait en décimal (ex: 0.10 pour 10%)
 * @param revalAnnuelle - Taux de revalorisation annuel en décimal (ex: 0.01 pour 1%)
 * @param years - Nombre d'années
 * @returns Valeur de retrait nette après revalorisation et frais
 */
function computeFullOwnershipValueAtHorizon(
  baseAmount: number,
  ecartSouscription: number,
  revalAnnuelle: number,
  years: number
): number {
  // Valeur de marché de la pleine propriété après revalorisation
  const fullOwnershipMarketValue = baseAmount * Math.pow(1 + revalAnnuelle, years);

  // Valeur de retrait après application de l'écart souscription/retrait
  const withdrawalValue = fullOwnershipMarketValue * (1 - ecartSouscription);

  return withdrawalValue;
}

/**
 * Calcule la valeur brute de la pleine propriété à l'horizon (avant écart souscription/retrait).
 *
 * @param baseAmount - Montant investi initialement (ex: 100 000 €)
 * @param revalAnnuelle - Taux de revalorisation annuel en décimal (ex: 0.01 pour 1%)
 * @param years - Nombre d'années
 * @returns Valeur brute théorique avant frais de sortie
 */
function computeFullOwnershipGrossAtHorizon(
  baseAmount: number,
  revalAnnuelle: number,
  years: number
): number {
  return baseAmount * Math.pow(1 + revalAnnuelle, years);
}

/**
 * Calcule la décomposition du capital pour l'affichage (brut, écart, net).
 *
 * @param baseAmount - Montant investi (base de calcul des revenus)
 * @param ecartSouscription - Écart souscription/retrait en décimal (ex: 0.10)
 * @param revalAnnuelle - Taux de revalorisation annuel en décimal
 * @param years - Nombre d'années
 * @returns Objet avec valeur brute, montant écart, et valeur nette
 */
function computeCapitalBreakdown(
  baseAmount: number,
  ecartSouscription: number,
  revalAnnuelle: number,
  years: number
): {
  grossValue: number;
  ecartAmount: number;
  netValue: number;
} {
  const grossValue = computeFullOwnershipGrossAtHorizon(baseAmount, revalAnnuelle, years);
  const netValue = grossValue * (1 - ecartSouscription);
  const ecartAmount = grossValue - netValue;

  return {
    grossValue,
    ecartAmount,
    netValue
  };
}

// ============================================================================
// CALCUL DU TRI
// ============================================================================

function computeIRR(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;

  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + rate, t);
      dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    if (Math.abs(dnpv) < 1e-10) break;
    rate = rate - npv / dnpv;

    if (rate < -0.99 || rate > 10) break;
  }

  return null;
}

// ============================================================================
// CALCUL PLEINE PROPRIÉTÉ
// ============================================================================

function computePleinePropriete(inputs: DemembrementInputs): DemembrementScenarioResult {
  const {
    montantPleinePropriete,
    horizonTotal,
    rendementBrut,
    revalorisation,
    tmi,
    ps,
    origineLoyers,
    fraisEntree,
    delaiJouissanceMois
  } = inputs;

  // Capital productif initial pour générer des revenus
  // Note: On ne déduit PAS les frais d'entrée du capital productif car
  // les frais d'entrée impactent uniquement la revente, pas la génération de revenus
  const capitalProductif = montantPleinePropriete;

  // Part France pour calcul des PS
  const partFrance = origineLoyers === "100_france" ? 1.0 :
                     origineLoyers === "100_europe" ? 0.0 :
                     origineLoyers === "50_50" ? 0.5 :
                     origineLoyers === "70_30" ? 0.7 : 0.3;

  const cashflows: number[] = [-montantPleinePropriete];
  let capitalActuel = capitalProductif;
  let revenusNetsCumules = 0;
  let revenusBrutsCumules = 0;
  let impotIRCumule = 0;
  let impotPSCumule = 0;

  for (let year = 1; year <= horizonTotal; year++) {
    // Délai de jouissance la première année
    const facteurDelai = year === 1 ? (1 - delaiJouissanceMois / 12) : 1;

    // Revenus bruts (calculés sur le capital productif, pas sur capitalActuel qui évolue)
    const revenusBruts = capitalProductif * (rendementBrut / 100) * facteurDelai;

    // Fiscalité: TMI sur tout + PS sur part France uniquement
    const impotIR = revenusBruts * (tmi / 100);
    const impotPS = revenusBruts * partFrance * (ps / 100);
    const impotTotal = impotIR + impotPS;

    const revenusNets = revenusBruts - impotTotal;
    revenusNetsCumules += revenusNets;
    revenusBrutsCumules += revenusBruts;
    impotIRCumule += impotIR;
    impotPSCumule += impotPS;

    // Cashflow de l'année
    if (year < horizonTotal) {
      cashflows.push(revenusNets);
    } else {
      // Dernière année: revenu + capital final
      // Utilise la fonction commune pour calculer la valeur finale
      const capitalFinalNet = computeFullOwnershipValueAtHorizon(
        montantPleinePropriete,
        fraisEntree / 100,
        revalorisation / 100,
        horizonTotal
      );
      cashflows.push(revenusNets + capitalFinalNet);
    }
  }

  // Capital final calculé avec la fonction commune
  const capitalFinalNet = computeFullOwnershipValueAtHorizon(
    montantPleinePropriete,
    fraisEntree / 100,
    revalorisation / 100,
    horizonTotal
  );
  const gainNetGlobal = revenusNetsCumules + capitalFinalNet - montantPleinePropriete;
  const tri = computeIRR(cashflows);

  // Déterminer le profil
  const ratioRevenus = revenusNetsCumules / (revenusNetsCumules + capitalFinalNet);
  const profil = ratioRevenus > 0.6 ? "Revenus" : ratioRevenus > 0.35 ? "Mixte" : "Capitalisation";

  // Calcul fiscalité détaillée
  const revenusBrutsAnnuelsMoyens = revenusBrutsCumules / horizonTotal;
  const impotIRAnnuelMoyen = impotIRCumule / horizonTotal;
  const impotPSAnnuelMoyen = impotPSCumule / horizonTotal;
  const impotTotalAnnuelMoyen = impotIRAnnuelMoyen + impotPSAnnuelMoyen;
  const tauxImpositionEffectif = revenusBrutsAnnuelsMoyens > 0
    ? (impotTotalAnnuelMoyen / revenusBrutsAnnuelsMoyens) * 100
    : 0;

  // Calcul décomposition capital (brut, écart, net)
  const breakdown = computeCapitalBreakdown(
    montantPleinePropriete,
    fraisEntree / 100,
    revalorisation / 100,
    horizonTotal
  );

  return {
    scenario: "pleine_propriete",
    label: "SCPI Classique (Pleine propriété)",
    capitalInitialDebourse: montantPleinePropriete,
    revenusNetsAnnuelsMoyens: revenusNetsCumules / horizonTotal,
    revenusNetsCumules,
    capitalFinalNet,
    gainNetGlobal,
    tri,
    profil,
    details: `Revenus réguliers + capital. Fiscalité: TMI ${tmi}% + PS ${ps}% (part France).`,
    fiscalite: {
      revenusBrutsAnnuelsMoyens,
      impotIRAnnuelMoyen,
      impotPSAnnuelMoyen,
      impotTotalAnnuelMoyen,
      tauxImpositionEffectif
    },
    capitalBreakdown: {
      montantInvesti: montantPleinePropriete,
      valeurBruteHorizon: breakdown.grossValue,
      ecartSouscriptionRetrait: fraisEntree,
      ecartAmount: breakdown.ecartAmount,
      capitalNetRecupere: breakdown.netValue
    }
  };
}

// ============================================================================
// CALCUL NUE-PROPRIÉTÉ
// ============================================================================

function computeNuePropriete(inputs: DemembrementInputs): DemembrementScenarioResult {
  const {
    montantNuePro,
    decoteNuePro,
    horizonTotal,
    dureeDemembrement,
    rendementBrut,
    revalorisation,
    tmi,
    ps,
    origineLoyers,
    fraisEntree,
    delaiJouissanceMois
  } = inputs;

  // Prix payé (avec décote)
  const capitalInitialDebourse = montantNuePro * (decoteNuePro / 100);

  // Part France pour calcul des PS
  const partFrance = origineLoyers === "100_france" ? 1.0 :
                     origineLoyers === "100_europe" ? 0.0 :
                     origineLoyers === "50_50" ? 0.5 :
                     origineLoyers === "70_30" ? 0.7 : 0.3;

  const cashflows: number[] = [-capitalInitialDebourse];
  let revenusNetsCumules = 0;
  let revenusBrutsCumules = 0;
  let impotIRCumule = 0;
  let impotPSCumule = 0;

  // Valeur de la pleine propriété (évolue pendant le démembrement)
  let valeurPP = montantNuePro;

  // Phase 1: Pendant le démembrement (0 revenu)
  for (let year = 1; year <= Math.min(dureeDemembrement, horizonTotal); year++) {
    cashflows.push(0); // Pas de revenus
  }

  // Nombre d'années avec flux de revenus
  const nbAnneesFlux = Math.max(0, horizonTotal - dureeDemembrement);

  // Phase 2: Après remembrement (si horizon > durée démembrement)
  if (horizonTotal > dureeDemembrement) {
    // Capital productif après remembrement pour générer revenus
    // (on utilise directement montantNuePro car la revalo est appliquée à la fin via la fonction commune)
    const capitalProductif = montantNuePro;

    for (let year = dureeDemembrement + 1; year <= horizonTotal; year++) {
      // Délai de jouissance seulement la première année post-remembrement
      const facteurDelai = year === dureeDemembrement + 1 ? (1 - delaiJouissanceMois / 12) : 1;

      // Revenus bruts (calculés sur le capital de base, pas revalorisé)
      const revenusBruts = capitalProductif * (rendementBrut / 100) * facteurDelai;

      // Fiscalité
      const impotIR = revenusBruts * (tmi / 100);
      const impotPS = revenusBruts * partFrance * (ps / 100);
      const impotTotal = impotIR + impotPS;

      const revenusNets = revenusBruts - impotTotal;
      revenusNetsCumules += revenusNets;
      revenusBrutsCumules += revenusBruts;
      impotIRCumule += impotIR;
      impotPSCumule += impotPS;

      // Cashflow
      if (year < horizonTotal) {
        cashflows.push(revenusNets);
      } else {
        // Capital final calculé avec la fonction commune
        const capitalFinalNet = computeFullOwnershipValueAtHorizon(
          montantNuePro,
          fraisEntree / 100,
          revalorisation / 100,
          horizonTotal
        );
        cashflows.push(revenusNets + capitalFinalNet);
      }
    }
  }

  // Capital final calculé avec la fonction commune (même formule que PP)
  const capitalFinalNet = computeFullOwnershipValueAtHorizon(
    montantNuePro,
    fraisEntree / 100,
    revalorisation / 100,
    horizonTotal
  );
  const gainNetGlobal = revenusNetsCumules + capitalFinalNet - capitalInitialDebourse;
  const tri = computeIRR(cashflows);

  const profil = "Capitalisation";

  // Calcul des revenus pendant la phase de flux
  const revenusNetsPhaseAn = nbAnneesFlux > 0 ? revenusNetsCumules / nbAnneesFlux : 0;

  // Texte descriptif mis à jour
  let details = `Aucun revenu pendant la période de démembrement (${dureeDemembrement} ans).`;
  if (nbAnneesFlux > 0) {
    details += ` Les revenus n'apparaissent qu'après la reconstitution de la pleine propriété, sur les ${nbAnneesFlux} dernières années dans cet exemple.`;
  } else {
    details += ` Récupération automatique pleine propriété à l'échéance.`;
  }

  // Calcul fiscalité détaillée (seulement sur la phase de revenus)
  const revenusBrutsAnnuelsMoyens = nbAnneesFlux > 0 ? revenusBrutsCumules / nbAnneesFlux : 0;
  const impotIRAnnuelMoyen = nbAnneesFlux > 0 ? impotIRCumule / nbAnneesFlux : 0;
  const impotPSAnnuelMoyen = nbAnneesFlux > 0 ? impotPSCumule / nbAnneesFlux : 0;
  const impotTotalAnnuelMoyen = impotIRAnnuelMoyen + impotPSAnnuelMoyen;
  const tauxImpositionEffectif = revenusBrutsAnnuelsMoyens > 0
    ? (impotTotalAnnuelMoyen / revenusBrutsAnnuelsMoyens) * 100
    : 0;

  return {
    scenario: "nue_propriete",
    label: "Nue-propriété (Démembrement temporaire)",
    capitalInitialDebourse,
    revenusNetsAnnuelsMoyens: revenusNetsCumules / horizonTotal,
    revenusNetsCumules,
    capitalFinalNet,
    gainNetGlobal,
    tri,
    profil,
    details,
    revenusNetsPhaseAn,
    nbAnneesFlux,
    fiscalite: nbAnneesFlux > 0 ? {
      revenusBrutsAnnuelsMoyens,
      impotIRAnnuelMoyen,
      impotPSAnnuelMoyen,
      impotTotalAnnuelMoyen,
      tauxImpositionEffectif
    } : undefined
  };
}

// ============================================================================
// CALCUL USUFRUIT
// ============================================================================

function computeUsufruit(inputs: DemembrementInputs): DemembrementScenarioResult {
  const {
    montantUsufruit,
    prixUsufruit,
    dureeUsufruit,
    horizonTotal,
    rendementBrut,
    tmi,
    ps,
    origineLoyers,
    delaiJouissanceMois
  } = inputs;

  // Prix payé
  const capitalInitialDebourse = montantUsufruit * (prixUsufruit / 100);

  // Part France
  const partFrance = origineLoyers === "100_france" ? 1.0 :
                     origineLoyers === "100_europe" ? 0.0 :
                     origineLoyers === "50_50" ? 0.5 :
                     origineLoyers === "70_30" ? 0.7 : 0.3;

  const cashflows: number[] = [-capitalInitialDebourse];
  let revenusNetsCumules = 0;
  let revenusBrutsCumules = 0;
  let impotIRCumule = 0;
  let impotPSCumule = 0;

  // Phase 1: Pendant la durée d'usufruit
  for (let year = 1; year <= Math.min(dureeUsufruit, horizonTotal); year++) {
    const facteurDelai = year === 1 ? (1 - delaiJouissanceMois / 12) : 1;

    const revenusBruts = montantUsufruit * (rendementBrut / 100) * facteurDelai;

    const impotIR = revenusBruts * (tmi / 100);
    const impotPS = revenusBruts * partFrance * (ps / 100);
    const impotTotal = impotIR + impotPS;

    const revenusNets = revenusBruts - impotTotal;
    revenusNetsCumules += revenusNets;
    revenusBrutsCumules += revenusBruts;
    impotIRCumule += impotIR;
    impotPSCumule += impotPS;

    cashflows.push(revenusNets);
  }

  // Phase 2: Après extinction usufruit (0 revenu, 0 capital)
  for (let year = dureeUsufruit + 1; year <= horizonTotal; year++) {
    cashflows.push(0);
  }

  const capitalFinalNet = 0; // L'usufruit s'éteint
  const gainNetGlobal = revenusNetsCumules - capitalInitialDebourse;
  const tri = computeIRR(cashflows);

  const profil = "Revenus";

  // Nombre d'années avec flux de revenus
  const nbAnneesFlux = Math.min(dureeUsufruit, horizonTotal);
  const revenusNetsPhaseAn = nbAnneesFlux > 0 ? revenusNetsCumules / nbAnneesFlux : 0;

  // Avertissement si TMI élevé
  const showTaxWarning = tmi >= 30;

  let details = `Revenus uniquement pendant ${dureeUsufruit} ans. Capital nul à l'extinction. Prix d'entrée réduit.`;
  if (showTaxWarning) {
    details = `Revenus pendant ${dureeUsufruit} ans. Capital nul à l'extinction. ⚠️ À TMI ${tmi}%, la fiscalité pénalise fortement ce montage.`;
  }

  // Calcul fiscalité détaillée
  const revenusBrutsAnnuelsMoyens = nbAnneesFlux > 0 ? revenusBrutsCumules / nbAnneesFlux : 0;
  const impotIRAnnuelMoyen = nbAnneesFlux > 0 ? impotIRCumule / nbAnneesFlux : 0;
  const impotPSAnnuelMoyen = nbAnneesFlux > 0 ? impotPSCumule / nbAnneesFlux : 0;
  const impotTotalAnnuelMoyen = impotIRAnnuelMoyen + impotPSAnnuelMoyen;
  const tauxImpositionEffectif = revenusBrutsAnnuelsMoyens > 0
    ? (impotTotalAnnuelMoyen / revenusBrutsAnnuelsMoyens) * 100
    : 0;

  return {
    scenario: "usufruit",
    label: "Usufruit (Démembrement temporaire)",
    capitalInitialDebourse,
    revenusNetsAnnuelsMoyens: revenusNetsCumules / horizonTotal,
    revenusNetsCumules,
    capitalFinalNet,
    gainNetGlobal,
    tri,
    profil,
    details,
    revenusNetsPhaseAn,
    nbAnneesFlux,
    showTaxWarning,
    fiscalite: {
      revenusBrutsAnnuelsMoyens,
      impotIRAnnuelMoyen,
      impotPSAnnuelMoyen,
      impotTotalAnnuelMoyen,
      tauxImpositionEffectif
    }
  };
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

const ComparateurDemembrementScpi: React.FC = () => {
  const [inputs, setInputs] = useState<DemembrementInputs>({
    tmi: 30,
    ps: 17.2,
    needsIncome: false,

    montantBase: 100000,
    horizonTotal: 15,
    rendementBrut: 5.0,
    revalorisation: 0,
    origineLoyers: "100_france",
    fraisEntree: 10,
    delaiJouissanceMois: 6,

    montantPleinePropriete: 100000,

    dureeDemembrement: 10,
    decoteNuePro: 60,
    montantNuePro: 100000,

    dureeUsufruit: 10,
    prixUsufruit: 40,
    montantUsufruit: 100000,
    enableUsufruit: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Synchronisation automatique des montants dérivés quand montantBase change
  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      montantPleinePropriete: prev.montantBase,
      montantNuePro: prev.montantBase,
      montantUsufruit: prev.montantBase
    }));
  }, [inputs.montantBase]);

  const results = useMemo<DemembrementComparisonResult>(() => {
    const pleinePropriete = computePleinePropriete(inputs);
    const nuePropriete = computeNuePropriete(inputs);
    const usufruit = inputs.enableUsufruit ? computeUsufruit(inputs) : undefined;

    return {
      pleinePropriete,
      nuePropriete,
      usufruit
    };
  }, [inputs]);

  const handleInputChange = (field: keyof DemembrementInputs, value: number | boolean | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Comparateur SCPI : Pleine Propriété vs Démembrement
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-3">
          Comparez trois stratégies à partir d'une même base de {inputs.montantBase.toLocaleString('fr-FR')} € de pleine propriété :
        </p>
        <div className="text-base text-gray-400 max-w-3xl mx-auto space-y-1">
          <p>• Achat classique (revenus + capital)</p>
          <p>• Achat de la nue-propriété avec décote (capitalisation long terme)</p>
          <p>• Achat de l'usufruit (recherche de revenus sur une durée limitée)</p>
        </div>
        <p className="text-sm text-gray-500 max-w-3xl mx-auto mt-4">
          Outil professionnel pour CGP avec modélisation fiscale simplifiée.
        </p>
      </div>

      {/* BLOC 1: PARAMÈTRES COMMUNS */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3">1</span>
          Paramètres communs
        </h2>

        {/* Profil fiscal */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Profil fiscal de l'investisseur</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tranche marginale d'imposition (TMI)
              </label>
              <select
                value={inputs.tmi}
                onChange={(e) => handleInputChange('tmi', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="0">0% - Non imposable</option>
                <option value="11">11% - 1ère tranche</option>
                <option value="30">30% - 2ème tranche</option>
                <option value="41">41% - 3ème tranche</option>
                <option value="45">45% - 4ème tranche</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prélèvements sociaux (PS)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.ps}
                onChange={(e) => handleInputChange('ps', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Besoin de revenus pendant la période ?
              </label>
              <div className="flex gap-4 mt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.needsIncome === true}
                    onChange={() => handleInputChange('needsIncome', true)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="ml-2 text-gray-200">Oui</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={inputs.needsIncome === false}
                    onChange={() => handleInputChange('needsIncome', false)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="ml-2 text-gray-200">Non</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres SCPI */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Caractéristiques de la SCPI</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Montant de référence (€)
              </label>
              <input
                type="number"
                step="1000"
                value={inputs.montantBase}
                onChange={(e) => handleInputChange('montantBase', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horizon de projection (années)
              </label>
              <input
                type="number"
                min={inputs.dureeDemembrement}
                max="30"
                value={inputs.horizonTotal}
                onChange={(e) => handleInputChange('horizonTotal', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rendement brut (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.rendementBrut}
                onChange={(e) => handleInputChange('rendementBrut', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Revalorisation prix de part (%/an)
              </label>
              <input
                type="number"
                step="0.1"
                min="-1"
                max="3"
                value={inputs.revalorisation}
                onChange={(e) => handleInputChange('revalorisation', Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Origine des loyers
              </label>
              <select
                value={inputs.origineLoyers}
                onChange={(e) => handleInputChange('origineLoyers', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="100_france">100% France</option>
                <option value="100_europe">100% Europe</option>
                <option value="50_50">50/50 France/Europe</option>
                <option value="70_30">70/30 France/Europe</option>
                <option value="30_70">30/70 France/Europe</option>
              </select>
            </div>

            {showAdvanced && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frais entrée/sortie (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.fraisEntree}
                    onChange={(e) => handleInputChange('fraisEntree', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Délai de jouissance (mois)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={inputs.delaiJouissanceMois}
                    onChange={(e) => handleInputChange('delaiJouissanceMois', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-4 text-sm text-orange-400 hover:text-orange-300 flex items-center gap-2"
          >
            {showAdvanced ? '▼ Masquer' : '▶ Afficher'} les paramètres avancés
          </button>
        </div>
      </div>

      {/* BLOC 2: PARAMÈTRES DES SCÉNARIOS */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3">2</span>
          Paramètres des scénarios
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PLEINE PROPRIÉTÉ */}
          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Pleine Propriété
            </h3>
            <p className="text-sm text-gray-300 mb-4">SCPI classique : revenus + capital</p>
            <div className="text-xs text-gray-400 bg-gray-900/50 p-3 rounded">
              Utilise le montant de référence: <strong className="text-white">{inputs.montantBase.toLocaleString('fr-FR')} €</strong>
            </div>
          </div>

          {/* NUE-PROPRIÉTÉ */}
          <div className="bg-green-900/20 border-2 border-green-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Nue-Propriété
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Durée démembrement (années)
                </label>
                <input
                  type="number"
                  min="5"
                  max={inputs.horizonTotal}
                  value={inputs.dureeDemembrement}
                  onChange={(e) => handleInputChange('dureeDemembrement', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Clé nue-propriété (%)
                </label>
                <input
                  type="number"
                  min="30"
                  max="90"
                  value={inputs.decoteNuePro}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleInputChange('decoteNuePro', val);
                    handleInputChange('prixUsufruit', 100 - val);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                Prix payé: <strong className="text-green-400">
                  {(inputs.montantNuePro * inputs.decoteNuePro / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </strong>
              </div>
            </div>
          </div>

          {/* USUFRUIT */}
          <div className={`border-2 rounded-xl p-6 ${inputs.enableUsufruit ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-900/50 border-gray-600 opacity-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Usufruit
              </h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.enableUsufruit}
                  onChange={(e) => handleInputChange('enableUsufruit', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-xs text-gray-300">Activer</span>
              </label>
            </div>

            {inputs.enableUsufruit && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Durée usufruit (années)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max={inputs.horizonTotal}
                    value={inputs.dureeUsufruit}
                    onChange={(e) => handleInputChange('dureeUsufruit', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Clé usufruit (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="70"
                    value={inputs.prixUsufruit}
                    onChange={(e) => handleInputChange('prixUsufruit', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                  Prix payé: <strong className="text-purple-400">
                    {(inputs.montantUsufruit * inputs.prixUsufruit / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BLOC 3: RÉSULTATS */}
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3">3</span>
          Résultats comparatifs
        </h2>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            Les trois scénarios sont calculés à partir d'un même montant de pleine propriété de référence ({inputs.montantBase.toLocaleString('fr-FR')} €).
            La nue-propriété et l'usufruit bénéficient d'une décote : le capital réellement déboursé est respectivement de{' '}
            <strong className="text-white">{(inputs.montantNuePro * inputs.decoteNuePro / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong> et{' '}
            <strong className="text-white">{(inputs.montantUsufruit * inputs.prixUsufruit / 100).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong> dans cet exemple.
          </p>
        </div>

        {/* Cartes synthétiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pleine propriété */}
          <ResultCard result={results.pleinePropriete} needsIncome={inputs.needsIncome} />

          {/* Nue-propriété */}
          <ResultCard result={results.nuePropriete} needsIncome={inputs.needsIncome} />

          {/* Usufruit */}
          {results.usufruit && (
            <ResultCard result={results.usufruit} needsIncome={inputs.needsIncome} />
          )}
        </div>

        {/* Tableau comparatif */}
        <ComparisonTable results={results} />
      </div>

      {/* DISCLAIMERS */}
      <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Informations importantes
        </h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <strong>Modélisation simplifiée :</strong> Cette simulation utilise une fiscalité simplifiée (revenus fonciers = TMI + PS sur la part France).
            Elle ne prend pas en compte le déficit foncier, les charges déductibles détaillées, ni la fiscalité sur plus-value à la revente.
          </p>
          <p>
            <strong>Principes du démembrement :</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Pleine propriété :</strong> Achat classique, perception des revenus + conservation du capital.</li>
            <li><strong>Nue-propriété :</strong> Achat des murs avec décote, aucun revenu pendant la durée du démembrement, récupération automatique de la pleine propriété à l'échéance (remembrement).</li>
            <li><strong>Usufruit :</strong> Achat des revenus sur une durée déterminée, capital nul à l'extinction de l'usufruit.</li>
          </ul>
          <p>
            <strong>Clés de démembrement :</strong> Les pourcentages de nue-propriété et d'usufruit sont paramétrables et doivent être alignés sur les grilles fiscales ou barèmes viagers de la SCPI.
          </p>
          <p className="text-blue-400 font-semibold">
            Outil à vocation pédagogique pour professionnels CGP. Ne constitue pas un conseil en investissement.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANTS D'AFFICHAGE
// ============================================================================

interface ResultCardProps {
  result: DemembrementScenarioResult;
  needsIncome: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, needsIncome }) => {
  const isRecommended =
    (needsIncome && (result.scenario === "pleine_propriete" || result.scenario === "usufruit")) ||
    (!needsIncome && result.scenario === "nue_propriete");

  const bgColor = result.scenario === "pleine_propriete" ? "blue" :
                  result.scenario === "nue_propriete" ? "green" : "purple";

  return (
    <div className={`bg-${bgColor}-900/30 border-2 border-${bgColor}-500 rounded-xl p-6 relative`}>
      {isRecommended && (
        <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ✨ Aligné avec vos besoins
        </div>
      )}

      <h3 className={`text-xl font-bold text-${bgColor}-400 mb-2`}>{result.label}</h3>
      <p className="text-xs text-gray-400 mb-4">{result.details}</p>

      <div className="space-y-3">
        {result.capitalBreakdown ? (
          <div className="bg-gray-900/50 -mx-6 px-6 py-4 space-y-3">
            <div className="text-sm font-semibold text-gray-200 mb-3">💰 Investissement & capital</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Montant investi (base de calcul des revenus)</span>
                <span className="text-white font-bold text-base">
                  {result.capitalBreakdown.montantInvesti.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valeur brute théorique à l'horizon</span>
                <span className="text-white font-semibold">
                  {result.capitalBreakdown.valeurBruteHorizon.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">
                  Écart souscription/retrait ({result.capitalBreakdown.ecartSouscriptionRetrait}%)
                </span>
                <span className="text-red-400 font-semibold">
                  −{result.capitalBreakdown.ecartAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-300 font-medium">Capital net récupéré en cas de revente</span>
                <span className="text-green-400 font-bold text-base">
                  {result.capitalBreakdown.capitalNetRecupere.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 italic pt-2 border-t border-gray-700">
              Les {result.capitalBreakdown.montantInvesti.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € sont intégralement investis et servent de base au calcul des loyers.
              L'écart souscription/retrait n'impacte pas les revenus annuels mais uniquement le capital net récupéré en cas de revente.
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-400">Capital initial déboursé</div>
            <div className="text-2xl font-bold text-white">
              {result.capitalInitialDebourse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-700 space-y-2">
          {result.revenusNetsPhaseAn !== undefined && result.nbAnneesFlux !== undefined && result.nbAnneesFlux > 0 && (
            <div>
              <div className="text-xs text-gray-400">Revenus nets/an (pendant phase de revenus)</div>
              <div className="text-base font-semibold text-white">
                {result.revenusNetsPhaseAn.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                <span className="text-xs text-gray-500 ml-1">sur {result.nbAnneesFlux} ans</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400">Revenus nets/an (moyenne)</div>
              <div className="text-lg font-semibold text-white">
                {result.revenusNetsAnnuelsMoyens.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </div>
            </div>
            {!result.capitalBreakdown && (
              <div>
                <div className="text-xs text-gray-400">Capital final</div>
                <div className="text-lg font-semibold text-white">
                  {result.capitalFinalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
            )}
          </div>
        </div>

        {result.fiscalite && (
          <div className="pt-3 border-t border-gray-700 bg-gray-900/50 -mx-6 px-6 py-3 space-y-2">
            <div className="text-xs font-semibold text-gray-300 mb-2">📊 Fiscalité annuelle moyenne</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Revenus bruts</div>
                <div className="text-white font-semibold">
                  {result.fiscalite.revenusBrutsAnnuelsMoyens.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-gray-500">Impôt IR</div>
                <div className="text-red-400 font-semibold">
                  -{result.fiscalite.impotIRAnnuelMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-gray-500">Prélèvements sociaux</div>
                <div className="text-red-400 font-semibold">
                  -{result.fiscalite.impotPSAnnuelMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>
              <div>
                <div className="text-gray-500">Taux effectif</div>
                <div className="text-orange-400 font-bold">
                  {result.fiscalite.tauxImpositionEffectif.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400">Gain net global</div>
          <div className={`text-xl font-bold ${result.gainNetGlobal > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {result.gainNetGlobal > 0 ? '+' : ''}{result.gainNetGlobal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">TRI</span>
          <span className="text-lg font-bold text-white">
            {result.tri !== null ? `${result.tri.toFixed(2)}%` : 'N/A'}
          </span>
        </div>

        <div className="pt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            result.profil === "Revenus" ? 'bg-blue-500 text-white' :
            result.profil === "Capitalisation" ? 'bg-green-500 text-white' :
            'bg-purple-500 text-white'
          }`}>
            Profil {result.profil}
          </span>
        </div>

        {result.showTaxWarning && (
          <div className="mt-4 pt-4 border-t border-gray-700 bg-yellow-900/20 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 text-lg">⚠️</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-yellow-400 mb-1">Avertissement fiscal</div>
                <div className="text-xs text-gray-300">
                  À ce niveau de fiscalité, l'usufruit en direct est fortement pénalisé par l'impôt.
                  Ce type de montage est souvent plus adapté à des structures soumises à l'IS ou à des investisseurs faiblement imposés.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ComparisonTableProps {
  results: DemembrementComparisonResult;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ results }) => {
  const scenarios = [
    results.pleinePropriete,
    results.nuePropriete,
    results.usufruit
  ].filter(Boolean) as DemembrementScenarioResult[];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-600">
            <th className="text-left py-3 px-4 font-semibold text-gray-300">Critère</th>
            {scenarios.map(s => (
              <th key={s.scenario} className="text-center py-3 px-4 font-semibold text-gray-300">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-700">
            <td className="py-3 px-4 text-gray-300 font-medium">Capital initial déboursé</td>
            {scenarios.map(s => (
              <td key={s.scenario} className="text-center py-3 px-4 text-white font-semibold">
                {s.capitalInitialDebourse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-700 bg-gray-900/50">
            <td className="py-3 px-4 text-gray-300 font-medium">Revenus nets cumulés</td>
            {scenarios.map(s => (
              <td key={s.scenario} className="text-center py-3 px-4 text-white font-semibold">
                {s.revenusNetsCumules.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-700">
            <td className="py-3 px-4 text-gray-300 font-medium">Capital final net</td>
            {scenarios.map(s => (
              <td key={s.scenario} className="text-center py-3 px-4 text-white font-semibold">
                {s.capitalFinalNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-700 bg-gray-900/50">
            <td className="py-3 px-4 text-gray-300 font-medium">Gain net global</td>
            {scenarios.map(s => (
              <td key={s.scenario} className={`text-center py-3 px-4 font-bold ${s.gainNetGlobal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {s.gainNetGlobal > 0 ? '+' : ''}{s.gainNetGlobal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </td>
            ))}
          </tr>

          <tr className="border-b border-gray-700">
            <td className="py-3 px-4 text-gray-300 font-medium">TRI</td>
            {scenarios.map(s => (
              <td key={s.scenario} className="text-center py-3 px-4 text-white font-bold text-lg">
                {s.tri !== null ? `${s.tri.toFixed(2)}%` : 'N/A'}
              </td>
            ))}
          </tr>

          <tr className="bg-gray-900/50">
            <td className="py-3 px-4 text-gray-300 font-medium">Profil</td>
            {scenarios.map(s => (
              <td key={s.scenario} className="text-center py-3 px-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  s.profil === "Revenus" ? 'bg-blue-500 text-white' :
                  s.profil === "Capitalisation" ? 'bg-green-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {s.profil}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparateurDemembrementScpi;
