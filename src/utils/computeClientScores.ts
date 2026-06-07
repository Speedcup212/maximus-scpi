// computeClientScores.ts
// Calcule la "Note MaximusSCPI" (0-100) côté client à partir des données locales
// déjà rectifiées, via le moteur déterministe scpiScoring.ts.
// Objectif : afficher une note fiable et traçable sans dépendre d'un appel réseau
// (la table Supabase pouvant être vide → "N/A").

import { SCPIExtended } from '../data/scpiDataExtended';
import { scoreScpiBatch, ScpiInput, ScpiScores } from './scpiScoring';
import { createSlugFromName } from './scpiSlugMapper';

/** Convertit une capitalisation texte ("1400M€", "121.9M€", "1,2Md€", "850 M€") en M€ numériques. */
export function parseCapitalisationToMeur(value: string | null | undefined): number | null {
  if (!value) return null;
  const raw = String(value).toLowerCase().replace(/\u00a0/g, ' ').trim();
  // nombre (gère séparateurs " " et "," décimaux)
  const m = raw.match(/([\d\s.,]+)/);
  if (!m) return null;
  let numStr = m[1].replace(/\s/g, '');
  // si virgule décimale (ex "1,2") et pas de point → convertir en point
  if (numStr.includes(',') && !numStr.includes('.')) numStr = numStr.replace(',', '.');
  else numStr = numStr.replace(/,/g, '');
  const num = parseFloat(numStr);
  if (!Number.isFinite(num)) return null;
  // milliards → ×1000 pour rester en M€
  if (/(md|mds|milliard|bn|b€|\bg€)/.test(raw)) return num * 1000;
  return num; // déjà en M€
}

/** Transforme un tableau {name,value} en Record<string,number>. */
function toMap(arr?: Array<{ name: string; value: number }> | null): Record<string, number> | null {
  if (!arr || arr.length === 0) return null;
  const out: Record<string, number> = {};
  for (const item of arr) {
    if (item && item.name != null && Number.isFinite(Number(item.value))) {
      out[item.name] = Number(item.value);
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Mappe une SCPIExtended vers l'entrée attendue par le moteur de scoring. */
export function mapScpiExtendedToInput(scpi: SCPIExtended): ScpiInput {
  return {
    id: scpi.id,
    nom: scpi.name,
    societe_gestion: scpi.managementCompany ?? null,
    rendement: Number.isFinite(scpi.yield) ? scpi.yield : null,
    tof: Number.isFinite(scpi.tof) ? scpi.tof : null,
    endettement: scpi.ltv ?? null,
    sfdr: scpi.sfdr ?? null,
    capitalisation: parseCapitalisationToMeur(scpi.capitalization),
    delai_jouissance: scpi.delaiJouissance ?? null,
    prix_souscription: Number.isFinite(scpi.price) ? scpi.price : null,
    valeur_reconstitution: scpi.reconstitutionValue ?? null,
    frais_gestion: scpi.managementFees ?? null,
    frais_souscription: scpi.entryFees ?? null,
    repartition_sectorielle: toMap(scpi.sectors),
    repartition_geographique: toMap(scpi.geography),
  };
}

export type ClientScore = {
  score: number;
  detail: ScpiScores;
};

/**
 * Calcule les scores sur l'ensemble de la cohorte (percentile rendement cohérent)
 * et retourne un index par slug ainsi qu'un index par id.
 */
export function computeClientScores(scpis: SCPIExtended[]): {
  bySlug: Record<string, number>;
  byId: Record<string, ClientScore>;
} {
  const inputs = scpis.map(mapScpiExtendedToInput);
  // useReferenceCohorte=false : on utilise la cohorte courante (62 SCPI) comme référence percentile.
  const results = scoreScpiBatch(inputs, undefined, false);

  const bySlug: Record<string, number> = {};
  const byId: Record<string, ClientScore> = {};

  results.forEach((res, idx) => {
    const scpi = scpis[idx];
    const slug = createSlugFromName(scpi.name);
    if (slug) bySlug[slug] = res.score_total;
    byId[String(scpi.id)] = { score: res.score_total, detail: res };
  });

  return { bySlug, byId };
}
