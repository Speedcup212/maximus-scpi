import { scpiLandingPages, ScpiLandingData } from '../data/landingPagesData';
import { scpiData } from '../data/scpiData';
import { createSlugFromName } from './scpiSlugMapper';
import { qualifyYield } from './yieldContext';
import { Scpi } from '../types/scpi';

/**
 * Source unique de la donnée alimentant le template `OptimizedScpiLandingPage`.
 *
 * Objectif : que TOUTE SCPI visible ait la même structure de page que les
 * anciennes (ex. /sofiprime), sans dupliquer le design.
 *
 * - Si une fiche éditoriale existe (`scpiLandingPages`), on l'utilise telle quelle.
 * - Sinon, on GÉNÈRE une fiche par défaut depuis les données live (`scpiData`),
 *   avec fallbacks propres. Le flag `_generated` permet au template de masquer
 *   le bloc « Verdict MaximusSCPI » (décision validée : pas d'argument non sourcé
 *   pour les SCPI sans contenu rédigé).
 *
 * Retourne `null` uniquement si le slug ne correspond à aucune SCPI connue.
 */

const NA = 'Non disponible';

function formatCurrency(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return NA;
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' Md€';
  if (amount >= 1_000_000) return Math.round(amount / 1_000_000) + ' M€';
  return Math.round(amount) + ' €';
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return NA;
  return value.toFixed(2) + '%';
}

function repartitionToRecord(
  rep: { name: string; value: number }[] | undefined
): Record<string, number> {
  if (!rep || rep.length === 0) return {};
  const out: Record<string, number> = {};
  for (const { name, value } of rep) {
    if (name && typeof value === 'number' && Number.isFinite(value)) {
      out[name] = value;
    }
  }
  return out;
}

/** Avantages strictement factuels (aucun argument marketing non sourcé). */
function buildFactualAdvantages(scpi: Scpi): string[] {
  const out: string[] = [];
  if (scpi.fees === 0) out.push("0 % de frais de souscription : capital investi à 100 %.");
  if (scpi.isr) out.push("Labellisée ISR (Investissement Socialement Responsable).");
  if (typeof scpi.tof === 'number' && scpi.tof >= 90) {
    out.push(`Taux d'occupation financier élevé (${formatPercent(scpi.tof)}).`);
  }
  if (typeof scpi.capitalization === 'number' && scpi.capitalization >= 100_000_000) {
    out.push(`Capitalisation de ${formatCurrency(scpi.capitalization)}.`);
  }
  if (scpi.european) out.push("Diversification européenne.");
  return out;
}

/** Points de vigilance factuels, sourcés sur les indicateurs. */
function buildFactualWarnings(scpi: Scpi): string[] {
  const out: string[] = [];
  const age = scpi.creation ? new Date().getFullYear() - scpi.creation : null;
  if (age !== null && age < 3) {
    out.push("SCPI récente : track record court, performances peu représentatives sur la durée.");
  }
  if (typeof scpi.fees === 'number' && scpi.fees >= 10) {
    out.push(`Frais de souscription élevés (${formatPercent(scpi.fees)}).`);
  }
  const topSector = scpi.repartitionSector?.slice().sort((a, b) => b.value - a.value)[0];
  if (topSector && topSector.value >= 50) {
    out.push(`Concentration sectorielle : ${topSector.name} représente ${topSector.value.toFixed(0)} % du patrimoine.`);
  }
  if (qualifyYield(scpi.yield).isAtypical) {
    out.push("Rendement atypique (> 8 %) : non garanti, à contextualiser.");
  }
  return out;
}

function findScpiBySlug(slug: string): Scpi | undefined {
  const norm = slug.toLowerCase();
  return scpiData.find((s) => createSlugFromName(s.name) === norm);
}

export interface BuiltLandingData {
  data: ScpiLandingData;
  isEditorial: boolean;
}

export function buildScpiLandingData(scpiKey: string): BuiltLandingData | null {
  // 1. Fiche éditoriale par clé directe.
  const direct = scpiLandingPages[scpiKey];
  if (direct) return { data: direct, isEditorial: true };

  // 2. Fiche éditoriale par slug.
  const bySlug = Object.values(scpiLandingPages).find((d) => d.slug === scpiKey);
  if (bySlug) return { data: bySlug, isEditorial: true };

  // 3. Génération depuis les données live.
  const scpi = findScpiBySlug(scpiKey);
  if (!scpi) return null;

  const yq = qualifyYield(scpi.yield);
  const generated: ScpiLandingData = {
    nom: scpi.name,
    slug: scpiKey,
    h1_question: `SCPI ${scpi.name}`,
    societe_gestion: scpi.company || NA,
    annee_creation: scpi.creation || 0,
    label_isr: !!scpi.isr,
    capitalisation: formatCurrency(scpi.capitalization),
    prix_souscription: formatCurrency(scpi.minInvest),
    rendement: formatPercent(scpi.yield),
    tof: formatPercent(scpi.tof),
    decote: typeof scpi.discount === 'number' ? `${scpi.discount}%` : NA,
    endettement: typeof scpi.debt === 'number' ? formatPercent(scpi.debt) : NA,
    frais_souscription: typeof scpi.fees === 'number' ? formatPercent(scpi.fees) : NA,
    frequence_versement: scpi.versementLoyers || undefined,
    geographie: repartitionToRecord(scpi.repartitionGeo),
    secteurs: repartitionToRecord(scpi.repartitionSector),
    avantages: buildFactualAdvantages(scpi),
    description_courte: `${scpi.name} est gérée par ${scpi.company || 'sa société de gestion'}. ${yq.label}.`,
    description_longue: '',
    pourquoi_investir: [],
    points_attention: buildFactualWarnings(scpi),
    profil_investisseur: '',
    simulator: {
      defaultInvestment: 10000,
      defaultYield: Number.isFinite(scpi.yield) ? scpi.yield : 0,
      title: `Simulez vos revenus avec ${scpi.name}`,
      subtitle: 'Simulation indicative — performances non garanties',
      theme: 'blue',
    },
    _generated: true,
  };

  return { data: generated, isEditorial: false };
}
