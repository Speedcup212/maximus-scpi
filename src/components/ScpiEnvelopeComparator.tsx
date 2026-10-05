import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Building2, Shield, Briefcase, ChevronDown, ChevronUp, Info, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ScpiPortfolioBuilder, { PortfolioLine, ScpiDataForPortfolio } from './ScpiPortfolioBuilder';
import { PortfolioAggregates, computePortfolioAggregates, createManualAggregates } from '../utils/portfolioAggregator';
import { scpiData } from '../data/scpiData';
import { SliderNumberField, TMISelector, NumberField } from './simulators';
import {
  GeoScenarioId,
  GEO_SCENARIOS,
  getGeoScenarioById,
  computeYieldAndReval,
  GROSS_YIELD_FRANCE_DEFAULT,
  GROSS_YIELD_EUROPE_DEFAULT
} from '../utils/scpiYield';

interface ScpiEnvelopeComparatorProps {
  defaultAmount?: number;
  defaultYield?: number;
  defaultDuration?: number;
  ctaUrl?: string;
  onCtaClick?: () => void;
}

// ============================================================================
// FONCTIONS UTILITAIRES CAPITAL
// ============================================================================

/**
 * Calcule la valeur brute de la pleine propriété à l'horizon (avant écart souscription/retrait).
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
// TYPES POUR RÉSULTATS STRUCTURÉS
// ============================================================================

type EnvelopeType = "direct" | "assurance_vie" | "sci_is";

type LineItem = {
  label: string;
  montant: number;
};

type EnvelopeResult = {
  envelopeType: EnvelopeType;

  // Bloc A : investissement & coûts initiaux
  investissement: {
    montantInvesti: number;              // M0 brut
    coutsInitiaux: number;               // total des coûts initiaux
    detailsCoutsInitiaux: LineItem[];    // ex: [{ label: "Frais d'entrée SCPI", montant: ... }, ...]
    capitalProductifInitial: number;     // capital réellement placé sur la SCPI
  };

  // Bloc B : flux, charges et fiscalité sur la période
  flux: {
    // Revenus / dividendes
    revenusBrutsCumules: number;         // loyers / revenus bruts générés sur la SCPI
    revenusNetsCumules: number;          // revenus réellement perçus par le client
    dividendesBrutsCumules?: number;     // spécifique SCI IS
    dividendesNetsCumules?: number;      // dividendes nets perçus par l'associé (SCI IS)

    // Coûts récurrents (frais de gestion, structure, etc.)
    fraisRecurrentsCumules: number;      // total des frais récurrents
    detailsFraisRecurrents: LineItem[];  // ex: "Frais de gestion contrat AV", "Frais structure SCI", ...

    // Fiscalité courante (hors fiscalité de sortie AV)
    impotRevenusCumules: number;         // IR + PS sur revenus directs, IS sur résultats SCI, etc.
    detailsImpots: LineItem[];           // ex: "Impôt sur le revenu", "Prélèvements sociaux", "IS", ...

    // Compte courant d'associé (spécifique SCI IS)
    remboursementCCA?: number;           // remboursement de compte courant (non fiscalisé)
  };

  // Bloc C : patrimoine final & synthèse
  patrimoineFinal: {
    capitalFinalBrut: number;            // valeur brute de la SCPI / UC / patrimoine SCI à l'horizon
    fiscaliteSortie: number;             // fiscalité de sortie (AV, liquidation SCI, etc.)
    capitalFinalNet: number;             // capital net après fiscalité de sortie
  };

  synthese: {
    gainNetGlobal: number;               // revenus/perçus + capital final net – montant investi initial
    rendementNetMoyenAnnuel: number;     // approx simple : (gainNetGlobal / (M0 * duree)) * 100
    tri: number | null;                  // TRI estimé sur la période
  };

  // Décomposition capital (optionnel, uniquement pour détention directe)
  capitalBreakdown?: {
    montantInvesti: number;
    valeurBruteHorizon: number;
    ecartSouscriptionRetrait: number;
    ecartAmount: number;
    capitalNetRecupere: number;
  };
};

// ============================================================================
// FONCTIONS DE CALCUL PURES
// ============================================================================

/**
 * Calcul du TRI (Taux de Rendement Interne) par la méthode de Newton-Raphson
 * @param cashflows Flux de trésorerie [CF0, CF1, ..., CFn] où CF0 est négatif (investissement)
 * @returns TRI en % ou null si pas de convergence
 */
function computeIRR(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;

  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = 0.1; // Estimation initiale 10%

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

/**
 * Détention directe : IR + PS sur revenus bruts
 * PS appliqués uniquement sur la part France (17,2%), pas sur l'Europe
 */
function computeDirectEnvelope(params: {
  montantInvesti: number;
  rendementBrut: number;
  revaloPrixPart: number;
  duree: number;
  tmi: number;
  prelevementsSociaux: number;
  fraisEntree: number;
  partFrance: number;
}): EnvelopeResult {
  const {
    montantInvesti,
    rendementBrut,
    revaloPrixPart,
    duree,
    tmi,
    prelevementsSociaux,
    fraisEntree,
    partFrance
  } = params;

  // Note importante : 100% du montant investi sert de base au calcul des revenus
  // Les frais d'entrée n'impactent QUE la valeur récupérable à la sortie, pas les loyers
  const capitalProductif = montantInvesti; // Base de calcul des revenus

  const cashflows: number[] = [-montantInvesti];

  let revenusBrutsCumules = 0;
  let revenusNetsCumules = 0;
  let impotIRCumule = 0;
  let impotPSCumule = 0;

  for (let year = 1; year <= duree; year++) {
    // Revenus calculés sur le montant investi, pas sur le capital après frais
    const revenuBrut = capitalProductif * (rendementBrut / 100);
    revenusBrutsCumules += revenuBrut;

    // IR sur la totalité des revenus (France + Europe)
    const impotIR = revenuBrut * (tmi / 100);
    impotIRCumule += impotIR;

    // PS uniquement sur la part France
    const revenuFrance = revenuBrut * (partFrance / 100);
    const impotPS = revenuFrance * (prelevementsSociaux / 100);
    impotPSCumule += impotPS;

    const impotTotal = impotIR + impotPS;
    const revenuNet = revenuBrut - impotTotal;
    revenusNetsCumules += revenuNet;

    // Cashflow de l'année (revenus uniquement, le capital est calculé à la fin)
    cashflows.push(revenuNet);
  }

  // Calcul du capital final avec la fonction commune
  const breakdown = computeCapitalBreakdown(
    montantInvesti,
    fraisEntree / 100,
    revaloPrixPart / 100,
    duree
  );

  // Remplacer le dernier cashflow pour inclure le capital final
  cashflows[cashflows.length - 1] = cashflows[cashflows.length - 1] + breakdown.netValue;

  const tri = computeIRR(cashflows);
  const gainNetGlobal = revenusNetsCumules + breakdown.netValue - montantInvesti;
  const rendementNetMoyenAnnuel = (gainNetGlobal / (montantInvesti * duree)) * 100;

  const fraisEntreeScpi = breakdown.ecartAmount; // Les frais sont inclus dans l'écart

  return {
    envelopeType: "direct",
    investissement: {
      montantInvesti,
      coutsInitiaux: 0, // Les frais d'entrée sont intégrés dans l'écart souscription/retrait
      detailsCoutsInitiaux: [],
      capitalProductifInitial: capitalProductif
    },
    flux: {
      revenusBrutsCumules,
      revenusNetsCumules,
      fraisRecurrentsCumules: 0,
      detailsFraisRecurrents: [],
      impotRevenusCumules: impotIRCumule + impotPSCumule,
      detailsImpots: [
        { label: "Impôt sur le revenu", montant: impotIRCumule },
        { label: "Prélèvements sociaux", montant: impotPSCumule }
      ]
    },
    patrimoineFinal: {
      capitalFinalBrut: breakdown.grossValue,
      fiscaliteSortie: 0,
      capitalFinalNet: breakdown.netValue
    },
    synthese: {
      gainNetGlobal,
      rendementNetMoyenAnnuel,
      tri
    },
    capitalBreakdown: {
      montantInvesti,
      valeurBruteHorizon: breakdown.grossValue,
      ecartSouscriptionRetrait: fraisEntree,
      ecartAmount: breakdown.ecartAmount,
      capitalNetRecupere: breakdown.netValue
    }
  };
}

/**
 * Assurance-vie : Capitalisation + fiscalité sur gain à la sortie
 * Intègre ancienneté contrat, abattements 4600/9200€ et fiscalité avant/après 8 ans
 * Intègre taux de reversement assureur et frais de gestion UC SCPI
 */
function computeLifeInsuranceEnvelope(params: {
  montantInvesti: number;
  rendementBrut: number;
  revaloPrixPart: number;
  duree: number;
  fraisEntreeAV: number;
  fraisGestionAV: number;
  tauxFiscaliteRachat: number;
  partFrance: number;
  contractAgeYears: number;
  householdStatus: 'single' | 'couple';
  usedAbatement: number;
  avTaxMode: 'auto' | 'custom';
  customAvTaxRate: number;
  tauxReversementAssureur: number;
  fraisGestionUcScpi: number;
}): EnvelopeResult {
  const {
    montantInvesti,
    rendementBrut,
    revaloPrixPart,
    duree,
    fraisEntreeAV,
    fraisGestionAV,
    tauxFiscaliteRachat,
    partFrance,
    contractAgeYears,
    householdStatus,
    usedAbatement,
    avTaxMode,
    customAvTaxRate,
    tauxReversementAssureur,
    fraisGestionUcScpi
  } = params;

  // Coûts initiaux
  const fraisVersement = montantInvesti * (fraisEntreeAV / 100);
  let capital = montantInvesti - fraisVersement;
  const capitalInitial = capital;

  const cashflows: number[] = [-montantInvesti];
  let revenusBrutsCumules = 0;
  let fraisGestionCumules = 0;

  for (let year = 1; year <= duree; year++) {
    // Revenus bruts de l'année (rendement SCPI)
    const revenuBrutScpi = capital * (rendementBrut / 100);

    // Application du taux de reversement assureur
    const revenuReverse = revenuBrutScpi * (tauxReversementAssureur / 100);
    revenusBrutsCumules += revenuReverse;

    // Frais de gestion UC SCPI (prélevés sur l'encours)
    const fraisUcScpi = capital * (fraisGestionUcScpi / 100);

    // Frais de gestion du contrat AV (sur l'encours)
    const fraisGestionContrat = capital * (fraisGestionAV / 100);
    const fraisGestionTotal = fraisUcScpi + fraisGestionContrat;
    fraisGestionCumules += fraisGestionTotal;

    // Revenus nets de frais, capitalisés
    const revenuNetFrais = revenuReverse - fraisGestionTotal;
    capital = capital + revenuNetFrais;

    // Revalorisation du prix de part
    capital = capital * (1 + revaloPrixPart / 100);

    // Pas de cashflow annuel (capitalisation)
    if (year < duree) {
      cashflows.push(0);
    }
  }

  // À la sortie : fiscalité sur le gain avec nouvelle logique
  const gainBrut = Math.max(capital - montantInvesti, 0);
  let impotRachat = 0;
  let tauxEffectif = 0;

  if (gainBrut > 0) {
    let tauxGlobal: number;

    if (avTaxMode === 'custom') {
      // Mode personnalisé : taux global saisi par l'utilisateur
      tauxGlobal = customAvTaxRate / 100;
    } else {
      // Mode automatique : fiscalité selon ancienneté
      if (contractAgeYears < 8) {
        // Avant 8 ans : PFU 30% (12,8% IR + 17,2% PS)
        tauxGlobal = 0.30;
      } else {
        // Après 8 ans : 24,7% (7,5% IR + 17,2% PS)
        tauxGlobal = 0.247;
      }
    }

    // Abattement disponible (uniquement pour contrats > 8 ans en mode auto)
    let abattementTheorique = 0;
    if (contractAgeYears >= 8 && avTaxMode === 'auto') {
      abattementTheorique = householdStatus === 'single' ? 4600 : 9200;
    }

    const abattementDisponible = Math.max(abattementTheorique - usedAbatement, 0);
    const gainTaxable = Math.max(gainBrut - abattementDisponible, 0);

    impotRachat = gainTaxable * tauxGlobal;
    tauxEffectif = gainBrut > 0 ? (impotRachat / gainBrut) * 100 : 0;
  }

  const capitalNetFinal = capital - impotRachat;
  cashflows.push(capitalNetFinal);

  const tri = computeIRR(cashflows);
  const gainNetGlobal = capitalNetFinal - montantInvesti;
  const rendementNetMoyenAnnuel = (gainNetGlobal / (montantInvesti * duree)) * 100;

  return {
    envelopeType: "assurance_vie",
    investissement: {
      montantInvesti,
      coutsInitiaux: fraisVersement,
      detailsCoutsInitiaux: [
        { label: "Frais sur versement", montant: fraisVersement }
      ],
      capitalProductifInitial: capitalInitial
    },
    flux: {
      revenusBrutsCumules,
      revenusNetsCumules: 0,
      fraisRecurrentsCumules: fraisGestionCumules,
      detailsFraisRecurrents: [
        { label: "Frais de gestion UC du contrat AV", montant: fraisGestionCumules }
      ],
      impotRevenusCumules: impotRachat,
      detailsImpots: [
        {
          label: "Fiscalité de sortie sur le gain (IR + PS, après abattement et ancienneté)",
          montant: impotRachat
        }
      ]
    },
    patrimoineFinal: {
      capitalFinalBrut: capital,
      fiscaliteSortie: impotRachat,
      capitalFinalNet: capitalNetFinal
    },
    synthese: {
      gainNetGlobal,
      rendementNetMoyenAnnuel,
      tri
    }
  };
}

/**
 * SCI à l'IS : IS sur résultat + PFU sur dividendes + Compte courant d'associé
 * PFU 30% = 12,8% IR + 17,2% PS, mais PS uniquement sur la part France
 */
function computeSciIsEnvelope(params: {
  montantInvesti: number;
  rendementBrut: number;
  revaloPrixPart: number;
  duree: number;
  tauxIS: number;
  tauxDistribution: number;
  fraisSCIAnnuels: number;
  partFrance: number;
  apportCapital: number;
  apportCompteCourant: number;
}): EnvelopeResult {
  const {
    montantInvesti,
    rendementBrut,
    revaloPrixPart,
    duree,
    tauxIS,
    tauxDistribution,
    fraisSCIAnnuels,
    partFrance,
    apportCapital,
    apportCompteCourant
  } = params;

  // Capital SCPI dans la SCI
  let capitalSCPI = montantInvesti;
  let tresorerieAccumulee = 0;

  const cashflows: number[] = [-montantInvesti];
  let revenusBrutsCumules = 0;
  let dividendesBrutsCumules = 0;
  let dividendesNetsCumules = 0;
  let fraisStructureCumules = 0;
  let impotISCumule = 0;
  let impotDividendesCumule = 0;

  for (let year = 1; year <= duree; year++) {
    // Revenus bruts de la SCPI
    const revenuBrut = capitalSCPI * (rendementBrut / 100);
    revenusBrutsCumules += revenuBrut;

    // Frais de structure annuels
    fraisStructureCumules += fraisSCIAnnuels;

    // Résultat imposable (simplifié : pas d'amortissement)
    const resultatImposable = revenuBrut - fraisSCIAnnuels;

    // Impôt IS
    const impotIS = Math.max(resultatImposable, 0) * (tauxIS / 100);
    impotISCumule += impotIS;

    // Résultat net après IS
    const resultatNet = resultatImposable - impotIS;

    // Distribution de dividendes
    const dividende = Math.max(resultatNet, 0) * (tauxDistribution / 100);
    dividendesBrutsCumules += dividende;

    // Fiscalité PFU sur dividendes : 12,8% IR + 17,2% PS (France uniquement)
    const dividendeFrance = dividende * (partFrance / 100);

    const impotIRDividende = dividende * 0.128; // 12,8% sur tout le dividende
    const impotPSDividende = dividendeFrance * 0.172; // 17,2% uniquement sur part France
    const impotDividende = impotIRDividende + impotPSDividende;
    impotDividendesCumule += impotDividende;

    const dividendeNet = dividende - impotDividende;
    dividendesNetsCumules += dividendeNet;

    // Mise en réserve
    const miseEnReserve = resultatNet - dividende;
    tresorerieAccumulee += miseEnReserve;

    // Revalorisation du capital SCPI
    capitalSCPI = capitalSCPI * (1 + revaloPrixPart / 100);

    // Cashflow de l'année
    if (year < duree) {
      cashflows.push(dividendeNet);
    } else {
      // Dernière année : dividende + patrimoine total
      const patrimoineFinal = capitalSCPI + tresorerieAccumulee;
      cashflows.push(dividendeNet + patrimoineFinal);
    }
  }

  const patrimoineTotal = capitalSCPI + tresorerieAccumulee;

  // Remboursement de compte courant (simplifié : on considère qu'il peut être remboursé)
  const remboursementCCA = Math.min(apportCompteCourant, tresorerieAccumulee);

  const tri = computeIRR(cashflows);
  const gainNetGlobal = dividendesNetsCumules + patrimoineTotal - montantInvesti;
  const rendementNetMoyenAnnuel = (gainNetGlobal / (montantInvesti * duree)) * 100;

  return {
    envelopeType: "sci_is",
    investissement: {
      montantInvesti,
      coutsInitiaux: 0,
      detailsCoutsInitiaux: [
        { label: "Apport en capital social", montant: apportCapital },
        { label: "Apport en compte courant d'associé", montant: apportCompteCourant }
      ],
      capitalProductifInitial: montantInvesti
    },
    flux: {
      revenusBrutsCumules,
      revenusNetsCumules: dividendesNetsCumules,
      dividendesBrutsCumules,
      dividendesNetsCumules,
      fraisRecurrentsCumules: fraisStructureCumules,
      detailsFraisRecurrents: [
        { label: "Frais structure SCI / comptabilité", montant: fraisStructureCumules }
      ],
      impotRevenusCumules: impotISCumule + impotDividendesCumule,
      detailsImpots: [
        { label: "Impôt sur les sociétés (IS)", montant: impotISCumule },
        { label: "Fiscalité sur dividendes (PFU)", montant: impotDividendesCumule }
      ],
      remboursementCCA
    },
    patrimoineFinal: {
      capitalFinalBrut: patrimoineTotal,
      fiscaliteSortie: 0,
      capitalFinalNet: patrimoineTotal
    },
    synthese: {
      gainNetGlobal,
      rendementNetMoyenAnnuel,
      tri
    }
  };
}

// ============================================================================
// COMPOSANT ENVELOPECARD
// ============================================================================

interface EnvelopeCardProps {
  result: EnvelopeResult;
  color: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
  icon: React.ReactNode;
  title: string;
}

const EnvelopeCard: React.FC<EnvelopeCardProps> = ({ result, color, icon, title }) => {
  const { investissement, flux, patrimoineFinal, synthese, envelopeType } = result;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const tauxFraisEntree = investissement.coutsInitiaux > 0
    ? ((investissement.coutsInitiaux / investissement.montantInvesti) * 100).toFixed(1)
    : '0';

  const valeurRetraitImmediat = investissement.montantInvesti - investissement.coutsInitiaux;

  return (
    <div className={`${color.bg} rounded-xl shadow-lg p-6 border-2 ${color.border} space-y-5`}>
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-4">
        <div className={color.icon}>{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Bloc A : Investissement & coûts initiaux */}
      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
          Investissement & coûts initiaux
        </h4>
        <div className="space-y-1.5 text-sm">
          {envelopeType === 'direct' && result.capitalBreakdown && (
            <div className="bg-gray-50 dark:bg-gray-900/50 -mx-4 px-4 py-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-xs">Montant investi (base de calcul des revenus)</span>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  {formatCurrency(result.capitalBreakdown.montantInvesti)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-xs">Valeur brute théorique à l'horizon</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(result.capitalBreakdown.valeurBruteHorizon)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300 text-xs">
                  Écart souscription/retrait ({result.capitalBreakdown.ecartSouscriptionRetrait}%)
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  −{formatCurrency(result.capitalBreakdown.ecartAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">Capital net récupéré en cas de revente</span>
                <span className={`font-bold ${color.text} text-base`}>
                  {formatCurrency(result.capitalBreakdown.capitalNetRecupere)}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 italic bg-white/50 dark:bg-gray-800/50 p-2 rounded mt-2">
                Les {formatCurrency(result.capitalBreakdown.montantInvesti)} sont intégralement investis et servent de base au calcul des loyers.
                L'écart souscription/retrait n'impacte pas les revenus annuels mais uniquement le capital net récupéré en cas de revente.
              </div>
            </div>
          )}

          {envelopeType === 'assurance_vie' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Montant investi</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(investissement.montantInvesti)}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Coûts initiaux totaux</span>
                <span className="font-semibold">{formatCurrency(investissement.coutsInitiaux)}</span>
              </div>
              {investissement.detailsCoutsInitiaux.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                  <span>• {item.label}</span>
                  <span>{formatCurrency(item.montant)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200">Capital réellement investi sur la SCPI</span>
                <span className={`font-bold ${color.text}`}>{formatCurrency(investissement.capitalProductifInitial)}</span>
              </div>
            </>
          )}

          {envelopeType === 'sci_is' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Montant investi</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(investissement.montantInvesti)}</span>
              </div>
              {investissement.coutsInitiaux > 0 && (
                <>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Coûts initiaux totaux</span>
                    <span className="font-semibold">{formatCurrency(investissement.coutsInitiaux)}</span>
                  </div>
                  {investissement.detailsCoutsInitiaux.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                      <span>• {item.label}</span>
                      <span>{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200">Capital investi en SCPI dans la SCI</span>
                <span className={`font-bold ${color.text}`}>{formatCurrency(investissement.capitalProductifInitial)}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bloc B : Flux, charges & fiscalité */}
      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
          Revenus, charges & fiscalité (sur la période)
        </h4>
        <div className="space-y-1.5 text-sm">
          {envelopeType === 'assurance_vie' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Revenus bruts cumulés (à l'intérieur du contrat)</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(flux.revenusBrutsCumules)}</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>Frais récurrents cumulés</span>
                <span className="font-semibold">{formatCurrency(flux.fraisRecurrentsCumules)}</span>
              </div>
              {flux.detailsFraisRecurrents.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                  <span>• {item.label}</span>
                  <span>{formatCurrency(item.montant)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200">Revenus nets perçus pendant la période</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(0)}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2">
                Dans cette simulation, les revenus de la SCPI sont intégralement capitalisés dans le contrat d'assurance-vie.
                Aucun flux n'est perçu avant le rachat.
              </div>
              {patrimoineFinal.fiscaliteSortie > 0 && (
                <>
                  <div className="flex justify-between text-red-600 dark:text-red-400 pt-2">
                    <span>Impôts cumulés</span>
                    <span className="font-semibold">{formatCurrency(patrimoineFinal.fiscaliteSortie)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                    <span>• Fiscalité de sortie sur le gain (taux moyen)</span>
                    <span>{formatCurrency(patrimoineFinal.fiscaliteSortie)}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Revenus bruts cumulés</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(flux.revenusBrutsCumules)}</span>
              </div>

              {flux.fraisRecurrentsCumules > 0 && (
                <>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Frais récurrents cumulés</span>
                    <span className="font-semibold">{formatCurrency(flux.fraisRecurrentsCumules)}</span>
                  </div>
                  {flux.detailsFraisRecurrents.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                      <span>• {item.label}</span>
                      <span>{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </>
              )}

              {flux.impotRevenusCumules > 0 && (
                <>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Impôts cumulés</span>
                    <span className="font-semibold">{formatCurrency(flux.impotRevenusCumules)}</span>
                  </div>
                  {flux.detailsImpots.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pl-4">
                      <span>• {item.label}</span>
                      <span>{formatCurrency(item.montant)}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {envelopeType === 'sci_is' ? 'Revenus nets perçus (dividendes nets cumulés)' : 'Revenus nets perçus'}
                </span>
                <span className={`font-bold ${color.text}`}>
                  {formatCurrency(flux.revenusNetsCumules)}
                </span>
              </div>

              {envelopeType === 'sci_is' && (
                <>
                  {flux.remboursementCCA !== undefined && flux.remboursementCCA > 0 && (
                    <div className="flex justify-between pt-2 text-blue-600 dark:text-blue-400">
                      <span className="font-medium">Dont remboursement de compte courant (non fiscalisé)</span>
                      <span className="font-semibold">{formatCurrency(flux.remboursementCCA)}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2">
                    Les dividendes nets cumulés correspondent aux flux effectivement perçus par l'associé.
                    Le reste de la performance est logé dans la valeur de la SCPI et la trésorerie de la SCI.
                    {flux.remboursementCCA !== undefined && flux.remboursementCCA > 0 && (
                      <> L'apport en compte courant d'associé est remboursable sans fiscalité au niveau de l'associé.</>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Bloc C : Résultat net & rendement */}
      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-1">
          Résultat net & rendement
        </h4>
        <div className="space-y-1.5 text-sm">
          {envelopeType === 'assurance_vie' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Capital final brut</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(patrimoineFinal.capitalFinalBrut)}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Fiscalité de sortie estimée</span>
                <span className="font-semibold">{formatCurrency(patrimoineFinal.fiscaliteSortie)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-200">Capital final net</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(patrimoineFinal.capitalFinalNet)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Capital final net {envelopeType === 'direct' ? '(hors fiscalité de plus-value, non modélisée)' : '(hors fiscalité de liquidation, non modélisée)'}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(patrimoineFinal.capitalFinalNet)}</span>
            </div>
          )}

          <div className={`flex justify-between pt-2 mt-2 border-t-2 ${color.border}`}>
            <span className="font-bold text-gray-900 dark:text-white">Gain net global</span>
            <span className={`font-bold text-xl ${color.text}`}>{formatCurrency(synthese.gainNetGlobal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-300">Rendement net moyen / an</span>
            <span className={`text-sm font-bold ${color.text}`}>{synthese.rendementNetMoyenAnnuel.toFixed(2)} %</span>
          </div>

          {synthese.tri !== null && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-300">TRI estimé</span>
              <span className={`text-sm font-bold ${color.text}`}>{synthese.tri.toFixed(2)} % / an</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

const ScpiEnvelopeComparator: React.FC<ScpiEnvelopeComparatorProps> = ({
  defaultAmount = 100000,
  defaultYield = 0,
  defaultDuration = 15,
  ctaUrl = '#contact',
  onCtaClick
}) => {
  // Mode portefeuille
  const [modePortefeuille, setModePortefeuille] = useState<'manuel' | 'scpi'>('manuel');
  const [portfolio, setPortfolio] = useState<PortfolioLine[]>([]);

  // États pour les paramètres généraux
  const [montantInvesti, setMontantInvesti] = useState(defaultAmount);
  const [rendementBrut, setRendementBrut] = useState(defaultYield);
  const [revaloPrixPart, setRevaloPrixPart] = useState(0);
  const [duree, setDuree] = useState(defaultDuration);
  const [partFrance, setPartFrance] = useState(100);

  // États pour scénario géographique (harmonisation rendements)
  const [selectedGeoScenarioId, setSelectedGeoScenarioId] = useState<GeoScenarioId>('FR70_EU30');
  const [grossYieldFrance, setGrossYieldFrance] = useState(GROSS_YIELD_FRANCE_DEFAULT * 100); // 5.5%
  const [grossYieldEurope, setGrossYieldEurope] = useState(GROSS_YIELD_EUROPE_DEFAULT * 100); // 6.5%

  // États pour le profil fiscal personne physique
  const [tmi, setTmi] = useState(30);
  const [prelevementsSociaux, setPrelevementsSociaux] = useState(17.2);

  // États pour détention directe
  const [showDirectParams, setShowDirectParams] = useState(true);
  const [fraisEntreeDirect, setFraisEntreeDirect] = useState(10);

  // États pour assurance-vie
  const [showAVParams, setShowAVParams] = useState(true);
  const [fraisEntreeAV, setFraisEntreeAV] = useState(2);
  const [fraisGestionAV, setFraisGestionAV] = useState(0.8);
  const [tauxFiscaliteRachat, setTauxFiscaliteRachat] = useState(15);
  // Nouveaux paramètres AV pour fiscalité détaillée
  const [contractAgeYears, setContractAgeYears] = useState(10);
  const [householdStatus, setHouseholdStatus] = useState<'single' | 'couple'>('couple');
  const [usedAbatement, setUsedAbatement] = useState(0);
  const [avTaxMode, setAvTaxMode] = useState<'auto' | 'custom'>('auto');
  const [customAvTaxRate, setCustomAvTaxRate] = useState(25);
  // Paramètres additionnels AV (taux de reversement et frais UC)
  const [tauxReversementAssureur, setTauxReversementAssureur] = useState(90); // 90%
  const [fraisGestionUcScpi, setFraisGestionUcScpi] = useState(0.8); // 0.8%

  // États pour SCI IS
  const [showSCIParams, setShowSCIParams] = useState(true);
  const [tauxIS, setTauxIS] = useState(25);
  const [tauxDistribution, setTauxDistribution] = useState(50);
  const [fraisSCIAnnuels, setFraisSCIAnnuels] = useState(1500);
  // Nouveaux paramètres SCI IS pour compte courant d'associé
  const [apportCapital, setApportCapital] = useState(100000);
  const [apportCompteCourant, setApportCompteCourant] = useState(0);

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null || !isFinite(value)) return 'N/A';
    return `${value.toFixed(2)} %`;
  };

  // Préparer les données SCPI pour le builder
  const scpisForPortfolio: ScpiDataForPortfolio[] = useMemo(() => {
    return scpiData.map(scpi => {
      // Parser la répartition géographique
      let partFrance = 100;
      let partEtranger = 0;

      if (scpi.repartitionGeo && scpi.repartitionGeo.length > 0) {
        const franceTotal = scpi.repartitionGeo
          .filter(r => r.name.toLowerCase().includes('france'))
          .reduce((sum, r) => sum + r.value, 0);
        partFrance = franceTotal;
        partEtranger = 100 - franceTotal;
      }

      return {
        id: scpi.id.toString(),
        name: scpi.name,
        rendementBrut: scpi.yield,
        revaloMoyenne: 0, // Simplification : pas de revalo par défaut
        partFrance,
        partEtranger,
        company: scpi.company,
        disponibleAssuranceVie: true,
        disponibleSciIs: true
      };
    });
  }, []);

  // Calcul du rendement harmonisé basé sur le scénario géographique
  const yieldData = useMemo(() => {
    const selectedScenario = getGeoScenarioById(selectedGeoScenarioId);
    return computeYieldAndReval({
      geoScenario: selectedScenario,
      grossYieldFrance: grossYieldFrance / 100,
      grossYieldEurope: grossYieldEurope / 100,
      revalFrance: 0, // Pas de revalorisation par défaut
      revalEurope: 0
    });
  }, [selectedGeoScenarioId, grossYieldFrance, grossYieldEurope]);

  // Calcul des agrégats selon le mode
  const aggregates: PortfolioAggregates = useMemo(() => {
    if (modePortefeuille === 'scpi') {
      return computePortfolioAggregates(portfolio, scpisForPortfolio, montantInvesti);
    } else {
      // En mode manuel, utiliser le rendement harmonisé du scénario géographique
      return createManualAggregates(
        montantInvesti,
        yieldData.grossYieldWeighted * 100, // Convertir en pourcentage
        revaloPrixPart,
        yieldData.partFrance * 100 // Convertir en pourcentage
      );
    }
  }, [modePortefeuille, portfolio, scpisForPortfolio, montantInvesti, yieldData, revaloPrixPart]);

  // Calculs pour les 3 enveloppes (utilisant les agrégats)
  const calculations = useMemo(() => {
    const direct = computeDirectEnvelope({
      montantInvesti: aggregates.montantTotal,
      rendementBrut: aggregates.rendementBrutMoyen,
      revaloPrixPart: aggregates.revaloMoyenne,
      duree,
      tmi,
      prelevementsSociaux,
      fraisEntree: fraisEntreeDirect,
      partFrance: aggregates.partFrance
    });

    const av = computeLifeInsuranceEnvelope({
      montantInvesti: aggregates.montantTotal,
      rendementBrut: aggregates.rendementBrutMoyen,
      revaloPrixPart: aggregates.revaloMoyenne,
      duree,
      fraisEntreeAV,
      fraisGestionAV,
      tauxFiscaliteRachat,
      partFrance: aggregates.partFrance,
      contractAgeYears,
      householdStatus,
      usedAbatement,
      avTaxMode,
      customAvTaxRate,
      tauxReversementAssureur,
      fraisGestionUcScpi
    });

    const montantInvestiTotal = apportCapital + apportCompteCourant;

    const sciIS = computeSciIsEnvelope({
      montantInvesti: montantInvestiTotal,
      rendementBrut: aggregates.rendementBrutMoyen,
      revaloPrixPart: aggregates.revaloMoyenne,
      duree,
      tauxIS,
      tauxDistribution,
      fraisSCIAnnuels,
      partFrance: aggregates.partFrance,
      apportCapital,
      apportCompteCourant
    });

    return { direct, av, sciIS };
  }, [
    aggregates,
    duree,
    tmi,
    prelevementsSociaux,
    fraisEntreeDirect,
    fraisEntreeAV,
    fraisGestionAV,
    tauxFiscaliteRachat,
    tauxIS,
    tauxDistribution,
    fraisSCIAnnuels,
    contractAgeYears,
    householdStatus,
    usedAbatement,
    avTaxMode,
    customAvTaxRate,
    apportCapital,
    apportCompteCourant,
    tauxReversementAssureur,
    fraisGestionUcScpi
  ]);

  // Données pour les graphiques
  const chartTRI = [
    {
      name: 'Direct',
      TRI: calculations.direct.synthese.tri || 0,
      color: '#3b82f6'
    },
    {
      name: 'Assurance-vie',
      TRI: calculations.av.synthese.tri || 0,
      color: '#8b5cf6'
    },
    {
      name: 'SCI IS',
      TRI: calculations.sciIS.synthese.tri || 0,
      color: '#10b981'
    }
  ];

  const chartCapital = [
    {
      name: 'Direct',
      Capital: calculations.direct.patrimoineFinal.capitalFinalNet,
      color: '#3b82f6'
    },
    {
      name: 'Assurance-vie',
      Capital: calculations.av.patrimoineFinal.capitalFinalNet,
      color: '#8b5cf6'
    },
    {
      name: 'SCI IS',
      Capital: calculations.sciIS.patrimoineFinal.capitalFinalNet,
      color: '#10b981'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Comparateur d'enveloppes SCPI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            Comparez, à partir d'une même SCPI, l'impact de l'enveloppe de détention sur vos revenus, votre fiscalité et votre rendement global (Direct, Assurance-vie, SCI à l'IS).
            <br />
            <span className="text-sm italic">Modélisation simplifiée destinée à la pré-analyse et au support de conseil, à affiner au cas par cas.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* COLONNE GAUCHE - PARAMÈTRES (3/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* ========================================= */}
            {/* BLOC 1 - HYPOTHÈSES SCPI COMMUNES        */}
            {/* ========================================= */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Bloc 1 – Hypothèses SCPI communes
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Définissez le portefeuille SCPI et ses caractéristiques, indépendamment de l'enveloppe
              </p>

              {/* Info pédagogique mode */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Choisissez d'entrer un rendement moyen global</strong> ou de <strong>construire un portefeuille réel</strong> à partir des SCPI disponibles.
                  <br />
                  Le comparatif d'enveloppe (Direct / AV / SCI IS) s'applique ensuite sur l'ensemble du portefeuille.
                </p>
              </div>

              {/* Sélecteur de mode */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Mode de saisie
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    modePortefeuille === 'manuel' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      value="manuel"
                      checked={modePortefeuille === 'manuel'}
                      onChange={(e) => setModePortefeuille(e.target.value as 'manuel')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Portefeuille agrégé (saisie manuelle)</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Entrez directement un rendement et une revalorisation moyens</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    modePortefeuille === 'scpi' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      value="scpi"
                      checked={modePortefeuille === 'scpi'}
                      onChange={(e) => setModePortefeuille(e.target.value as 'scpi')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Portefeuille de SCPI (sélection dans la liste)</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Construisez un portefeuille à partir de {scpisForPortfolio.length} SCPI disponibles</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Montant investi */}
              <SliderNumberField
                label="Montant investi"
                value={montantInvesti}
                onChange={setMontantInvesti}
                min={10000}
                max={2000000}
                step={10000}
                formatValue={(v) => formatEuro(v)}
                className="mb-6"
              />

              {/* Builder de portefeuille SCPI */}
              {modePortefeuille === 'scpi' && (
                <div className="mb-6">
                  <ScpiPortfolioBuilder
                    scpis={scpisForPortfolio}
                    montantTotal={montantInvesti}
                    portfolio={portfolio}
                    onChangePortfolio={setPortfolio}
                  />
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Agrégats calculés du portefeuille :
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <div>Rendement moyen : <strong>{aggregates.rendementBrutMoyen.toFixed(2)} %</strong></div>
                      <div>Revalorisation moyenne : <strong>{aggregates.revaloMoyenne.toFixed(2)} %</strong></div>
                      <div>Part France : <strong>{aggregates.partFrance.toFixed(1)} %</strong></div>
                      <div>Part Étranger : <strong>{aggregates.partEtranger.toFixed(1)} %</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rendement brut (mode manuel uniquement) */}
              {modePortefeuille === 'manuel' && (
                <SliderNumberField
                  label="Rendement brut annuel estimé"
                  value={rendementBrut}
                  onChange={setRendementBrut}
                  min={0}
                  max={99}
                  step={0.1}
                  unit=" %"
                  tooltip="Hypothèse de rendement brut annuel moyen sur la durée de la simulation. Basé sur les derniers taux de distribution connus de la SCPI. Rendement non garanti, susceptible de varier à la hausse comme à la baisse."
                  className="mb-6"
                />
              )}

              {/* Revalorisation prix part (mode manuel uniquement) */}
              {modePortefeuille === 'manuel' && (
                <SliderNumberField
                  label="Revalorisation annuelle du prix de part"
                  value={revaloPrixPart}
                  onChange={setRevaloPrixPart}
                  min={-1}
                  max={3}
                  step={0.1}
                  formatValue={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} %`}
                  tooltip="Hypothèse de variation moyenne du prix de la part (scénario prudent/neutre/dynamique). 0 % = scénario neutre. Valeur négative = baisse progressive, valeur positive = revalorisation annuelle. Les revalorisations passées ne préjugent pas des revalorisations futures."
                  className="mb-6"
                />
              )}

              {/* Durée */}
              <SliderNumberField
                label="Horizon de projection"
                value={duree}
                onChange={setDuree}
                min={5}
                max={25}
                step={1}
                formatValue={(v) => `${v} ans`}
                className="mb-6"
              />

              {/* Section Scénario géographique */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Scénario géographique (France / Europe)
                </h3>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-xs text-gray-700 dark:text-gray-300">
                  <p>
                    Les rendements bruts sont calculés selon la répartition géographique France/Europe.
                    <br />
                    Rendements par défaut : <strong>France 5,5 %</strong> / <strong>Europe 6,5 %</strong>
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Répartition géographique
                  </label>
                  {GEO_SCENARIOS.map((scenario) => (
                    <label
                      key={scenario.id}
                      className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedGeoScenarioId === scenario.id ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={scenario.id}
                        checked={selectedGeoScenarioId === scenario.id}
                        onChange={(e) => setSelectedGeoScenarioId(e.target.value as GeoScenarioId)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{scenario.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{scenario.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Rendements personnalisables */}
                <div className="space-y-3">
                  <NumberField
                    label="Rendement brut France"
                    value={grossYieldFrance}
                    onChange={setGrossYieldFrance}
                    min={0}
                    max={15}
                    step={0.1}
                    unit="%"
                    tooltip="Rendement brut annuel des actifs situés en France. Par défaut : 5,5%"
                  />

                  <NumberField
                    label="Rendement brut Europe"
                    value={grossYieldEurope}
                    onChange={setGrossYieldEurope}
                    min={0}
                    max={15}
                    step={0.1}
                    unit="%"
                    tooltip="Rendement brut annuel des actifs situés en Europe (hors France). Par défaut : 6,5%"
                  />
                </div>
              </div>
            </div>

            {/* ========================================= */}
            {/* BLOC 2 - PROFIL FISCAL PERSONNE PHYSIQUE */}
            {/* ========================================= */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Bloc 2 – Profil fiscal (personne physique)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Fiscalité commune aux calculs Direct / AV / PFU dividendes
              </p>

              {/* TMI */}
              <TMISelector
                value={tmi}
                onChange={setTmi}
                className="mb-4"
              />

              {/* Prélèvements sociaux */}
              <NumberField
                label="Prélèvements sociaux"
                value={prelevementsSociaux}
                onChange={setPrelevementsSociaux}
                min={0}
                max={25}
                step={0.1}
                unit="%"
                tooltip="Taux des prélèvements sociaux appliqués aux revenus fonciers. Par défaut : 17,2 %"
              />

              {/* Texte explicatif fiscal */}
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Régime fiscal (détention directe) :</strong> Revenus fonciers simplifiés (TMI + PS sur loyers bruts).
                </p>
                <p className="mt-2">
                  Modélisation simplifiée : la base imposable est assimilée aux revenus bruts. Le mécanisme réel (déductions, charges, intérêts d'emprunt, déficit foncier) n'est pas entièrement reproduit.
                </p>
              </div>
            </div>

            {/* ========================================= */}
            {/* BLOC 3 - DÉTENTION DIRECTE              */}
            {/* ========================================= */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <button
                onClick={() => setShowDirectParams(!showDirectParams)}
                className="w-full flex items-center justify-between mb-2"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    Bloc 3 – Détention directe
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Paramètres spécifiques à la détention en direct
                  </p>
                </div>
                {showDirectParams ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showDirectParams && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300">
                    <p>
                      L'écart souscription/retrait modélise les frais d'entrée / de sortie implicites : en cas de revente immédiate, le prix de retrait est inférieur au prix de souscription.
                    </p>
                  </div>

                  <NumberField
                    label="Frais d'entrée (écart souscription/retrait)"
                    value={fraisEntreeDirect}
                    onChange={setFraisEntreeDirect}
                    min={0}
                    max={15}
                    step={0.5}
                    unit="%"
                    tooltip="Écart entre le prix de souscription et le prix de retrait immédiat. Généralement entre 8% et 12% selon les SCPI."
                  />
                </div>
              )}
            </div>

            {/* ========================================= */}
            {/* BLOC 4 - ASSURANCE-VIE                   */}
            {/* ========================================= */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <button
                onClick={() => setShowAVParams(!showAVParams)}
                className="w-full flex items-center justify-between mb-2"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Bloc 4 – Assurance-vie
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Frais, reversement et fiscalité de sortie AV
                  </p>
                </div>
                {showAVParams ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showAVParams && (
                <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">

                  {/* Sous-section : Frais & mécanique de rendement */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Frais & mécanique de rendement
                    </h3>

                    <div className="space-y-4">
                      <NumberField
                        label="Frais sur versement"
                        value={fraisEntreeAV}
                        onChange={setFraisEntreeAV}
                        min={0}
                        max={5}
                        step={0.1}
                        unit="%"
                        tooltip="Frais prélevés sur le versement initial dans le contrat d'assurance-vie."
                      />

                      <NumberField
                        label="Frais de gestion du contrat sur UC"
                        value={fraisGestionAV}
                        onChange={setFraisGestionAV}
                        min={0}
                        max={2}
                        step={0.05}
                        unit="%"
                        tooltip="Frais annuels de gestion prélevés sur les unités de compte au niveau du contrat AV. Par défaut : 0,80 %"
                      />

                      <NumberField
                        label="Frais de gestion UC SCPI"
                        value={fraisGestionUcScpi}
                        onChange={setFraisGestionUcScpi}
                        min={0}
                        max={2}
                        step={0.05}
                        unit="%"
                        tooltip="Frais de gestion annuels spécifiques aux UC SCPI (prélevés par l'assureur). Par défaut : 0,80 %"
                      />

                      <SliderNumberField
                        label="Taux de reversement assureur"
                        value={tauxReversementAssureur}
                        onChange={setTauxReversementAssureur}
                        min={70}
                        max={100}
                        step={1}
                        formatValue={(v) => `${v} %`}
                        tooltip="Pourcentage des revenus SCPI effectivement reversés par l'assureur dans le contrat. Par défaut : 90 %"
                      />
                    </div>
                  </div>

                  {/* Sous-section : Fiscalité de sortie AV */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Fiscalité de sortie Assurance-vie
                    </h3>

                    <div className="space-y-4">
                      {/* Ancienneté du contrat */}
                  <SliderNumberField
                    label="Ancienneté du contrat à la sortie"
                    value={contractAgeYears}
                    onChange={setContractAgeYears}
                    min={0}
                    max={30}
                    step={1}
                    formatValue={(v) => `${v} ans`}
                    tooltip="Durée d'existence du contrat au moment du rachat. Détermine la fiscalité applicable (avant/après 8 ans)."
                    className="mb-4"
                  />

                  {/* Statut fiscal pour l'abattement */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Statut fiscal pour l'abattement
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="single"
                          checked={householdStatus === 'single'}
                          onChange={(e) => setHouseholdStatus(e.target.value as 'single' | 'couple')}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Célibataire / Veuf / Divorcé (abattement 4 600 €)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="couple"
                          checked={householdStatus === 'couple'}
                          onChange={(e) => setHouseholdStatus(e.target.value as 'single' | 'couple')}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Couple (imposition commune) (abattement 9 200 €)</span>
                      </label>
                    </div>
                  </div>

                  {/* Abattement déjà utilisé */}
                  <NumberField
                    label="Abattement déjà utilisé cette année"
                    value={usedAbatement}
                    onChange={setUsedAbatement}
                    min={0}
                    max={20000}
                    step={100}
                    unit="€"
                    tooltip="Montant d'abattement déjà consommé dans l'année (si plusieurs rachats sur différents contrats)."
                  />

                  {/* Mode de calcul de la fiscalité */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Mode de calcul de la fiscalité
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="auto"
                          checked={avTaxMode === 'auto'}
                          onChange={(e) => setAvTaxMode(e.target.value as 'auto' | 'custom')}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Calcul automatique (règles avant/après 8 ans)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="custom"
                          checked={avTaxMode === 'custom'}
                          onChange={(e) => setAvTaxMode(e.target.value as 'auto' | 'custom')}
                          className="text-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Taux global personnalisé</span>
                      </label>
                    </div>
                  </div>

                      {/* Si mode custom, afficher le champ de taux */}
                      {avTaxMode === 'custom' && (
                        <NumberField
                          label="Taux global IR + PS sur le gain"
                          value={customAvTaxRate}
                          onChange={setCustomAvTaxRate}
                          min={0}
                          max={50}
                          step={0.5}
                          unit="%"
                          tooltip="Taux global personnalisé intégrant IR + prélèvements sociaux sur le gain."
                        />
                      )}

                      {/* Texte explicatif */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300">
                        <p className="font-semibold mb-2">Fiscalité de sortie Assurance-vie</p>
                        <p>
                          La fiscalité est calculée en fonction de l'ancienneté du contrat, de l'abattement annuel disponible (4 600 € ou 9 200 €) et du mode d'imposition choisi.
                        </p>
                        <p className="mt-2">
                          <strong>Avant 8 ans :</strong> PFU de 30 % (12,8 % IR + 17,2 % PS) sur le gain taxable.
                        </p>
                        <p className="mt-2">
                          <strong>Après 8 ans :</strong> Taux de 24,7 % (7,5 % IR + 17,2 % PS) après imputation de l'abattement disponible.
                        </p>
                        <p className="mt-2">
                          Vous pouvez basculer en mode « Taux global personnalisé » pour ajuster manuellement le taux effectif.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================= */}
            {/* BLOC 5 - SCI À L'IS                      */}
            {/* ========================================= */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <button
                onClick={() => setShowSCIParams(!showSCIParams)}
                className="w-full flex items-center justify-between mb-2"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-green-600" />
                    Bloc 5 – SCI à l'IS
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Structure de financement, IS, PFU et frais de structure
                  </p>
                </div>
                {showSCIParams ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showSCIParams && (
                <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">

                  {/* Sous-section : Structure de financement */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Structure de financement
                    </h3>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">

                    <NumberField
                      label="Apport en capital (SCI)"
                      value={apportCapital}
                      onChange={(v) => {
                        setApportCapital(v);
                        // Ajuster le montant investi total pour garder la cohérence
                        const newTotal = v + apportCompteCourant;
                        if (newTotal !== montantInvesti) {
                          setMontantInvesti(newTotal);
                        }
                      }}
                      min={0}
                      max={2000000}
                      step={1000}
                      unit="€"
                      tooltip="Montant apporté au capital social de la SCI."
                    />

                    <NumberField
                      label="Apport en compte courant d'associé"
                      value={apportCompteCourant}
                      onChange={(v) => {
                        setApportCompteCourant(v);
                        // Ajuster le montant investi total pour garder la cohérence
                        const newTotal = apportCapital + v;
                        if (newTotal !== montantInvesti) {
                          setMontantInvesti(newTotal);
                        }
                      }}
                      min={0}
                      max={2000000}
                      step={1000}
                      unit="€"
                      tooltip="Montant prêté à la SCI en compte courant d'associé. Remboursable sans fiscalité."
                    />

                      <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-green-200 dark:border-green-700">
                        <strong>Total investi :</strong> {formatEuro(apportCapital + apportCompteCourant)}
                      </div>
                    </div>
                  </div>

                  {/* Sous-section : Fiscalité & frais SCI */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Fiscalité & frais SCI
                    </h3>

                    <div className="space-y-4">
                      <NumberField
                        label="Taux d'IS"
                        value={tauxIS}
                        onChange={setTauxIS}
                        min={15}
                        max={33}
                        step={0.5}
                        unit="%"
                        tooltip="Taux de l'impôt sur les sociétés applicable. Par défaut : 25 %"
                      />

                      <NumberField
                        label="Part du résultat distribué"
                        value={tauxDistribution}
                        onChange={setTauxDistribution}
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                        tooltip="Pourcentage du résultat net après IS distribué en dividendes. Le reste est capitalisé en réserves dans la SCI."
                      />

                      <NumberField
                        label="Frais structure SCI / comptabilité"
                        value={fraisSCIAnnuels}
                        onChange={setFraisSCIAnnuels}
                        min={0}
                        max={5000}
                        step={100}
                        unit="€ / an"
                        tooltip="Coûts annuels de gestion, comptabilité et formalités de la SCI. Par défaut : 1 500 €/an"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                    <p><strong>Fiscalité sur dividendes :</strong> PFU 30 % (12,8 % IR + 17,2 % PS)</p>
                    <p>
                      L'apport en compte courant d'associé est remboursable sans fiscalité au niveau de l'associé.
                      Dans cette simulation, la fiscalité de liquidation de la SCI (plus-values latentes, boni de liquidation, etc.) n'est pas modélisée :
                      le capital final net est présenté à titre indicatif comme valeur économique globale de la SCI (SCPI + trésorerie).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE - RÉSULTATS (2/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Encadré répartition géographique et fiscalité */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Répartition géographique et rendement harmonisé
                  </p>

                  {/* Affichage du rendement pondéré calculé */}
                  {modePortefeuille === 'manuel' && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                        Rendement brut pondéré calculé :
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {(yieldData.grossYieldWeighted * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Basé sur France {yieldData.grossYieldFranceUsed.toFixed(1)}% × {(yieldData.partFrance * 100).toFixed(0)}% +
                        Europe {yieldData.grossYieldEuropeUsed.toFixed(1)}% × {(yieldData.partEurope * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">France : {aggregates.partFrance.toFixed(1)}%</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">PS 17,2% appliqués</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-green-600 dark:text-green-400">Europe : {aggregates.partEtranger.toFixed(1)}%</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">PS 0% (exonération)</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic pt-2 border-t border-amber-200 dark:border-amber-700">
                    Les prélèvements sociaux (17,2 %) sont appliqués uniquement sur la part des revenus de source française.
                    Les revenus de source européenne/internationale sont modélisés sans prélèvements sociaux en France.
                    En pratique, la fiscalité exacte dépend des conventions fiscales et de la documentation de chaque SCPI.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards résultats pour chaque enveloppe */}
            <div className="grid md:grid-cols-3 gap-6">
              <EnvelopeCard
                result={calculations.direct}
                color={{
                  bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
                  border: 'border-blue-200 dark:border-blue-700',
                  text: 'text-blue-600 dark:text-blue-400',
                  icon: 'text-blue-600 dark:text-blue-400'
                }}
                icon={<Building2 className="w-6 h-6" />}
                title="Détention directe"
              />

              <EnvelopeCard
                result={calculations.av}
                color={{
                  bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
                  border: 'border-purple-200 dark:border-purple-700',
                  text: 'text-purple-600 dark:text-purple-400',
                  icon: 'text-purple-600 dark:text-purple-400'
                }}
                icon={<Shield className="w-6 h-6" />}
                title="Assurance-vie"
              />

              <EnvelopeCard
                result={calculations.sciIS}
                color={{
                  bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20',
                  border: 'border-green-200 dark:border-green-700',
                  text: 'text-green-600 dark:text-green-400',
                  icon: 'text-green-600 dark:text-green-400'
                }}
                icon={<Briefcase className="w-6 h-6" />}
                title="SCI à l'IS"
              />
            </div>

            {/* Graphiques comparatifs */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Graphique TRI */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  TRI par enveloppe
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartTRI}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)} %`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="TRI" name="TRI (%)">
                      {chartTRI.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique Capital final */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  Capital net final
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartCapital}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value: number) => formatEuro(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="Capital" name="Capital (€)">
                      {chartCapital.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                Optimisez votre stratégie patrimoniale
              </h3>
              <p className="text-blue-100 mb-4">
                Bénéficiez d'une analyse personnalisée pour choisir la meilleure enveloppe selon votre profil
              </p>
              {onCtaClick ? (
                <button
                  onClick={onCtaClick}
                  className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Demander une étude personnalisée
                </button>
              ) : (
                <a
                  href={ctaUrl}
                  className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  Demander une étude personnalisée
                </a>
              )}
            </div>

            {/* Disclaimers */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-600" />
                Mentions importantes - Modèle simplifié CGP
              </h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  ⚠️ Simulation à titre indicatif, basée sur des hypothèses simplifiées de rendement, de frais et de fiscalité
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">Les calculs ne prennent pas en compte :</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>L'ensemble des règles fiscales applicables (déficit foncier, abattements spécifiques, tranches d'IS/IR détaillées)</li>
                    <li>La fiscalité des plus-values immobilières (détention directe et SCI)</li>
                    <li>La fiscalité de liquidation de la SCI à l'IS</li>
                    <li>Les frais de création de SCI</li>
                    <li>Les spécificités contractuelles de chaque contrat d'assurance-vie</li>
                  </ul>
                </div>

                <p>
                  <strong>Objectif de cette comparaison :</strong> Illustrer l'impact des enveloppes de détention (Direct, Assurance-vie, SCI à l'IS) sur des hypothèses homogènes pour faciliter la décision stratégique.
                  Cette simulation ne remplace pas une étude fiscale personnalisée complète.
                </p>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Les taux utilisés (rendement, fiscalité, frais) sont des hypothèses de travail et ne constituent pas un engagement contractuel.
                  Les SCPI présentent un risque de perte en capital, une liquidité limitée et une variabilité des revenus.
                </p>

                <p className="font-bold text-amber-900 dark:text-amber-200 pt-2 border-t border-amber-200 dark:border-amber-700">
                  Cette simulation ne constitue pas un conseil en investissement personnalisé et doit être complétée par une étude globale de la situation du client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScpiEnvelopeComparator;
