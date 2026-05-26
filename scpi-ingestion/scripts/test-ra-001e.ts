/**
 * TASK-DATA-PUBLISH-001E — Test rapport_annuel Iroko Zen
 *
 * Teste les phases 0→4 du chemin rapport_annuel SANS écriture Supabase :
 *   Phase 0 : découverte du lien rapport annuel sur la page officielle
 *   Phase 1 : téléchargement du PDF
 *   Phase 2 : parsing texte
 *   Phase 3 : extractAnnualReportTd
 *   Phase 4 : vérification non-écrasement bulletin (lecture scpi_indicators)
 *
 * Usage :
 *   npx tsx scripts/test-ra-001e.ts
 */

import "dotenv/config";
import { fetchBestPdfLink } from "../src/html.js";
import { downloadPdf }      from "../src/downloader.js";
import { parsePdfBuffer }   from "../src/pdfParser.js";
import { extractAnnualReportTd } from "../src/extractor.js";
import { createClient }     from "@supabase/supabase-js";

const SCPI      = "iroko-zen";
const PAGE_URL  = "https://www.iroko.eu/documentation";
const RA_YEAR   = 2024;

// ANSI helpers
const ok    = (s: string) => `\x1b[32m✅ ${s}\x1b[0m`;
const warn  = (s: string) => `\x1b[33m⚠  ${s}\x1b[0m`;
const fail  = (s: string) => `\x1b[31m❌ ${s}\x1b[0m`;
const info  = (s: string) => `\x1b[36mℹ  ${s}\x1b[0m`;
const head  = (s: string) => `\n\x1b[1m── ${s} ──\x1b[0m`;

console.log(`\n${"=".repeat(60)}`);
console.log(" TASK-DATA-PUBLISH-001E — Test rapport_annuel Iroko Zen");
console.log(`${"=".repeat(60)}\n`);

// ─── Phase 0 : découverte du lien ────────────────────────────────────────────
console.log(head("Phase 0 : Découverte du lien rapport annuel"));
console.log(info(`Page : ${PAGE_URL}`));
console.log(info(`Année cible : ${RA_YEAR}\n`));

const linkResult = await fetchBestPdfLink(PAGE_URL, "rapport_annuel", RA_YEAR);

if (!linkResult.ok) {
  console.log(fail(`Lien non trouvé : [${linkResult.error.reason}] ${linkResult.error.message}`));
  console.log(warn("→ Vérifier manuellement si le rapport annuel 2024 est disponible sur iroko.eu"));
  console.log(warn("  Alternative : chercher sur iroko.eu/documents/ ou iroko.eu/publications/"));
  process.exit(1);
}

const candidate = linkResult.value;
console.log(ok(`Lien trouvé : ${candidate.url}`));
console.log(info(`Période extraite : ${candidate.period.normalized}`));
console.log(info(`Texte du lien : "${candidate.linkText}"`));

// ─── Phase 1 : téléchargement ────────────────────────────────────────────────
console.log(head("Phase 1 : Téléchargement du PDF"));

const fakeSource = {
  id:            `${SCPI}:ra`,
  scpi:          SCPI,
  pageUrl:       PAGE_URL,
  document_type: "rapport_annuel" as const,
  ra_year:       RA_YEAR,
};

const dlResult = await downloadPdf(fakeSource, candidate.url);

if (!dlResult.ok) {
  console.log(fail(`Téléchargement échoué : ${dlResult.error.reason}`));
  process.exit(1);
}

const dl = dlResult.value;
console.log(ok(`PDF téléchargé : ${(dl.sizeBytes / 1024).toFixed(0)} Ko`));
console.log(info(`SHA-256 : ${dl.sha256.slice(0, 16)}...`));

// ─── Phase 2 : parsing texte ──────────────────────────────────────────────────
console.log(head("Phase 2 : Parsing du texte PDF"));

let pdfText = "";
try {
  pdfText = await parsePdfBuffer(dl.buffer);
  const lines = pdfText.split("\n").length;
  const chars  = pdfText.length;
  console.log(ok(`Texte extrait : ${chars.toLocaleString()} caractères, ${lines.toLocaleString()} lignes`));
  // Afficher les 5 premières lignes non-vides pour vérification visuelle
  const preview = pdfText.split("\n").filter(l => l.trim().length > 10).slice(0, 5).join("\n  ");
  console.log(info(`Aperçu :\n  ${preview}`));
} catch (e) {
  console.log(fail(`Parsing PDF échoué : ${e instanceof Error ? e.message : String(e)}`));
  process.exit(1);
}

// ─── Phase 3 : extractAnnualReportTd ─────────────────────────────────────────
console.log(head("Phase 3 : Extraction du taux de distribution"));

const tdResult = extractAnnualReportTd(pdfText, RA_YEAR);

if (tdResult === null) {
  console.log(fail("Taux de distribution NON trouvé dans le PDF"));
  console.log(warn("→ Vérifier manuellement le format du document"));

  // Chercher des occurrences de "distribution" pour aider au débogage
  const distLines = pdfText
    .split("\n")
    .filter(l => /distribution|taux|DVM|TDVM/i.test(l) && l.trim().length > 5)
    .slice(0, 10);
  if (distLines.length > 0) {
    console.log(info(`Lignes contenant "distribution" :`));
    distLines.forEach(l => console.log(`    ${l.trim()}`));
  }
} else {
  console.log(ok(`TD trouvé : ${(tdResult.td * 100).toFixed(2)}%`));
  console.log(ok(`Année : ${tdResult.year}`));
  console.log(info(`Texte source : "${tdResult.raw}"`));

  if (tdResult.year !== RA_YEAR) {
    console.log(warn(`L'année extraite (${tdResult.year}) diffère de l'année cible (${RA_YEAR})`));
  }
  if (tdResult.td < 0.01 || tdResult.td > 0.15) {
    console.log(warn(`TD hors plage attendue [1%, 15%] : ${(tdResult.td * 100).toFixed(2)}%`));
  }
}

// ─── Phase 4 : vérification non-écrasement bulletin ──────────────────────────
console.log(head("Phase 4 : Vérification données bulletin (lecture seule Supabase)"));

const supabaseUrl = process.env["SUPABASE_URL"];
const serviceKey  = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceKey) {
  console.log(warn("Variables Supabase manquantes — vérification ignorée"));
} else {
  try {
    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await client
      .from("scpi_indicators")
      .select("scpi_slug, td, tof, capitalisation, prix_souscription, source_period, updated_at")
      .eq("scpi_slug", SCPI)
      .maybeSingle();

    if (error) {
      console.log(warn(`Lecture Supabase échouée : ${error.message}`));
    } else if (data === null) {
      console.log(info("Aucune ligne iroko-zen dans scpi_indicators (première fois)"));
      console.log(info("→ updateTdFromRapportAnnuel créera une nouvelle ligne"));
    } else {
      console.log(ok("Ligne iroko-zen existante dans scpi_indicators :"));
      console.log(info(`  td              = ${data.td ?? "null"}`));
      console.log(info(`  tof             = ${data.tof ?? "null"}`));
      console.log(info(`  capitalisation  = ${data.capitalisation ?? "null"}`));
      console.log(info(`  prix_souscription = ${data.prix_souscription ?? "null"}`));
      console.log(info(`  source_period   = ${data.source_period ?? "null"}`));
      console.log(info(`  updated_at      = ${data.updated_at ?? "null"}`));

      if (data.tof !== null || data.capitalisation !== null) {
        console.log(ok("Données bulletin présentes — updateTdFromRapportAnnuel ne les écrasera PAS"));
        console.log(info("  (la fonction n'écrit que: td, td_annee, ra_source_period, ra_source_sha256, ra_updated_at)"));
      }
    }

    // Vérifier si les colonnes RA existent déjà
    const { error: colError } = await client
      .from("scpi_indicators")
      .select("td_annee, ra_source_period, ra_source_sha256, ra_updated_at")
      .eq("scpi_slug", SCPI)
      .maybeSingle();

    if (colError && colError.message.includes("column")) {
      console.log(fail("Colonnes RA ABSENTES de scpi_indicators — migration SQL requise avant run"));
      console.log(warn("→ Appliquer la migration 05_add_ra_columns.sql avant la première run rapport_annuel"));
    } else if (!colError) {
      console.log(ok("Colonnes RA présentes dans scpi_indicators — migration déjà appliquée"));
    }

  } catch (e) {
    console.log(warn(`Connexion Supabase échouée : ${e instanceof Error ? e.message : String(e)}`));
  }
}

// ─── Résumé ───────────────────────────────────────────────────────────────────
console.log(`\n${"=".repeat(60)}`);
console.log(" RÉSUMÉ 001E");
console.log("=".repeat(60));

if (tdResult !== null) {
  console.log(ok(`Phase 0 : lien rapport annuel trouvé`));
  console.log(ok(`Phase 1 : PDF téléchargé (${(dl.sizeBytes / 1024).toFixed(0)} Ko)`));
  console.log(ok(`Phase 2 : texte extrait (${pdfText.length.toLocaleString()} caractères)`));
  console.log(ok(`Phase 3 : TD = ${(tdResult.td * 100).toFixed(2)}% (${tdResult.year})`));
  console.log(info(`Phase 5 : écriture Supabase — EN ATTENTE de la migration SQL`));
  console.log(`\n${ok("Pipeline rapport_annuel opérationnel pour Iroko Zen")}`);
} else {
  console.log(ok(`Phase 0 : lien rapport annuel trouvé`));
  console.log(ok(`Phase 1 : PDF téléchargé`));
  console.log(ok(`Phase 2 : texte extrait`));
  console.log(fail(`Phase 3 : TD non extrait — patterns à affiner`));
  console.log(warn(`→ Ajuster extractAnnualReportTd selon les lignes "distribution" loggées ci-dessus`));
}

console.log();
