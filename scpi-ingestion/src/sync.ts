/**
 * sync.ts — Synchronise scpi_indicators → src/data/scpi_complet.json
 *
 * Usage :
 *   npx tsx src/sync.ts
 *   npx tsx src/sync.ts --out ../src/data/scpi_complet_pipeline.json
 *   npx tsx src/sync.ts --min-confidence 0.5
 *
 * Règle d'affichage :
 *   source_confidence >= MIN_CONFIDENCE → valeur affichée
 *   source_confidence <  MIN_CONFIDENCE → champ null (affiché "N/D" côté frontend)
 *
 * Le fichier de sortie est compatible avec le format attendu par scpiData.ts.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────

const MIN_CONFIDENCE = parseFloat(
  process.argv.find((a) => a.startsWith("--min-confidence="))?.split("=")[1] ?? "0.5"
);

const DEFAULT_OUT = path.resolve(
  process.cwd(),
  "../src/data/scpi_complet_pipeline.json"
);

const outArg = process.argv.find((a) => a.startsWith("--out="))?.split("=")[1]
  ?? process.argv[process.argv.indexOf("--out") + 1];
const OUT_PATH = outArg ? path.resolve(outArg) : DEFAULT_OUT;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// ─── Row type (from Supabase) ─────────────────────────────────────────────────

interface ScpiIndicatorRow {
  scpi_slug:                  string;
  nom:                        string | null;
  societe_gestion:            string | null;
  annee_creation:             number | null;
  td:                         number | null;
  tof:                        number | null;
  top:                        number | null;
  capitalisation:             number | null;
  prix_souscription:          number | null;
  prix_reconstitution:        number | null;
  prix_retrait:               number | null;
  prime_decote:               number | null;
  frais_souscription:         number | null;
  frais_gestion:              number | null;
  commission_performance:     number | null;
  frais_sortie:               number | null;
  srri:                       number | null;
  duree_detention_recommandee: number | null;
  endettement:                number | null;
  delai_jouissance:           number | null;
  walt:                       number | null;
  walb:                       number | null;
  nombre_locataires:          number | null;
  nombre_immeubles:           number | null;
  repartition_sectorielle:    Record<string, number> | null;
  repartition_geographique:   Record<string, number> | null;
  label_isr:                  boolean | null;
  sfdr:                       string | null;
  secteur_principal:          string | null;
  geographie_principale:      string | null;
  collecte_nette:             number | null;
  nb_cessions_trimestre:      number | null;
  report_a_nouveau:           number | null;
  distribution_par_part:      number | null;
  versement_loyers:           string | null;
  source_period:              string | null;
  source_confidence:          number | null;
  source_type:                string | null;
  updated_at:                 string;
}

// ─── Champ conditionnel ───────────────────────────────────────────────────────

function field<T>(value: T | null, confidence: number | null): T | null {
  if (confidence === null || confidence < MIN_CONFIDENCE) return null;
  return value;
}

// ─── Format de sortie compatible scpiData.ts ──────────────────────────────────

function toOutputRow(row: ScpiIndicatorRow, index: number): Record<string, unknown> {
  const conf = row.source_confidence;

  return {
    // Identité (toujours affichée — données fixes)
    "Nom SCPI":                      row.nom ?? row.scpi_slug,
    "Société de gestion":            row.societe_gestion ?? null,
    "Année de création":             row.annee_creation ?? null,
    "Label ISR":                     row.label_isr ? "Oui" : "Non",
    "SFDR":                          row.sfdr ?? null,

    // Données fiables conditionnelles
    "Taux de distribution (%)":      field(row.td, conf),
    "TOF (%)":                       field(row.tof, conf),
    "TOP (%)":                       field(row.top, conf),
    "Capitalisation (M€)":           field(row.capitalisation != null ? row.capitalisation / 1_000_000 : null, conf),
    "Prix de souscription (€)":      field(row.prix_souscription, conf),
    "Valeur de reconstitution (€)":  field(row.prix_reconstitution, conf),
    "Valeur de retrait (€)":         field(row.prix_retrait, conf),
    "Surcote/décote (%)":            field(row.prime_decote, conf),
    "Frais de souscription (TTC/%)": field(row.frais_souscription, conf),
    "Frais de gestion (HT/%)":       field(row.frais_gestion, conf),
    "Endettement (%)":               field(row.endettement, conf),
    "Délai de jouissance (mois)":    field(row.delai_jouissance, conf),
    "Durée de détention recommandée (ans)": field(row.duree_detention_recommandee, conf),
    "WALT":                          field(row.walt, conf),
    "WALB":                          field(row.walb, conf),
    "Nombre de locataires":          field(row.nombre_locataires, conf),
    "Nombre d'immeubles":            field(row.nombre_immeubles, conf),
    "Distribution (€/part)":         field(row.distribution_par_part, conf),
    "Versement des loyers":          row.versement_loyers ?? null,
    "Collecte nette trimestre":      field(row.collecte_nette, conf),
    "Nombre de cessions trimestre":  field(row.nb_cessions_trimestre, conf),

    // Répartitions conditionnelles
    "Répartition Sectorielle JSON":  field(row.repartition_sectorielle, conf),
    "Répartition Géographique JSON": field(row.repartition_geographique, conf),

    // Traçabilité — toujours présente
    "Période bulletin trimestriel":  row.source_period ?? "N/A",
    "Source confidence":             row.source_confidence ?? 0,
    "Source type":                   row.source_type ?? "manuel",
    "Dernière mise à jour":          row.updated_at,

    // Index technique
    "_slug":  row.scpi_slug,
    "_index": index,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[sync] MIN_CONFIDENCE=${MIN_CONFIDENCE}, OUT=${OUT_PATH}`);

  const client = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const { data, error } = await client
    .from("scpi_indicators")
    .select("*")
    .order("nom", { ascending: true });

  if (error !== null) {
    console.error("[sync] Supabase error:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.warn("[sync] Aucune ligne dans scpi_indicators. Assurez-vous que le pipeline a tourné.");
    process.exit(0);
  }

  const rows = data as ScpiIndicatorRow[];
  const highConf  = rows.filter(r => (r.source_confidence ?? 0) >= MIN_CONFIDENCE).length;
  const lowConf   = rows.length - highConf;

  console.log(`[sync] ${rows.length} SCPI | confidence >= ${MIN_CONFIDENCE}: ${highConf} | < ${MIN_CONFIDENCE}: ${lowConf} (→ N/D)`);

  const output = rows.map((row, i) => toOutputRow(row, i + 1));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`[sync] ✓ Fichier généré : ${OUT_PATH}`);
  console.log(`[sync] Prochaine étape : vérifier le fichier puis renommer en scpi_complet.json et rebuilder.`);
}

main().catch((e: unknown) => {
  console.error("[sync] Fatal:", e instanceof Error ? e.message : e);
  process.exit(2);
});
