/**
 * retry-non-verified-reconstitution-deepseek.ts
 *
 * Reprise ciblée DeepSeek sur les SCPI non vérifiées du full run.
 * Lit data-import/scpi-agent/deepseek_reconstitution_full.json,
 * sélectionne les statuts manual_review + rejected (dont réponses tronquées),
 * relance DeepSeek avec un budget de tokens augmenté + plus de pages.
 *
 * Usage: npx tsx scripts/scpi-agents/retry-non-verified-reconstitution-deepseek.ts
 *
 * Sorties:
 *   data-import/scpi-agent/deepseek_reconstitution_retry_non_verified.json
 *   reports/scpi-2026/rapport_deepseek_reconstitution_retry_non_verified.md
 *
 * NE relance PAS les 72 SCPI. Lecture seule du full run, écriture isolée.
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { llmChatJson } from '../../src/ai/llmRouter';
import {
  collectRelevantPageChunks,
  folderToScpiName,
  isExcludedScpi,
  isFicommerceFolder,
  type PageChunk,
} from './lib/pdf-page-utils';
import {
  computeAdjustedReconstitution,
  computeDecoteSurcote,
  determineStatut,
  LlmExtractionSchema,
  SCHEMA_HINT,
  SYSTEM_PROMPT,
  type BatchStatut,
  type LlmExtraction,
} from './lib/reconstitution-extract';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const DOCS_ROOT = join(ROOT, 'data-import', 'Liste SCPI + Doc');
const FULL_JSON = join(ROOT, 'data-import', 'scpi-agent', 'deepseek_reconstitution_full.json');
const OUTPUT_JSON = join(ROOT, 'data-import', 'scpi-agent', 'deepseek_reconstitution_retry_non_verified.json');
const OUTPUT_REPORT = join(ROOT, 'reports', 'scpi-2026', 'rapport_deepseek_reconstitution_retry_non_verified.md');

// Budget augmenté pour éviter les réponses tronquées
const MAX_CHARS_PER_PAGE = 4000;
const LLM_MAX_TOKENS = 8192;
const MAX_PAGES = 8;
const API_RETRY_DELAY_MS = 2500;
const INTER_SCPI_DELAY_MS = 1500;
const ECART_ANOMALIE_PCT = 15;

config({ path: join(ROOT, '.env.local') });
config({ path: join(ROOT, '.env') });

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScpiResult {
  nom_scpi: string;
  folder: string;
  statut_initial: BatchStatut;
  document_source: string | null;
  pages_source: number[];
  pages_documents: Array<{ document: string; page: number }>;
  pages_sent_to_llm: number;
  extraction: LlmExtraction;
  valeur_reconstitution_ajustee: { value: number | null; formula: string | null };
  decote_surcote: ReturnType<typeof computeDecoteSurcote>;
  statut: BatchStatut;
  statut_change: string;
  commentaire: string;
  anomalies: string[];
  error?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface FullJson {
  meta?: {
    non_verified?: Array<{ nom_scpi: string; folder: string; statut: BatchStatut; raison: string }>;
  };
  results?: Array<{ nom_scpi: string; folder: string; statut: BatchStatut }>;
}

interface RetryOutput {
  meta: {
    generated_at: string;
    provider: 'deepseek';
    model: string;
    source_full_run: string;
    scpi_retried: number;
    became_verified: number;
    became_verified_adjusted_split: number;
    still_manual_review: number;
    still_rejected: number;
    stats_finales: Record<BatchStatut, number>;
    tokens: { prompt: number; completion: number; total: number };
    estimated_cost_usd: number | null;
    still_non_publiable: Array<{ nom_scpi: string; statut: BatchStatut; raison: string }>;
    disclaimer: string;
  };
  results: ScpiResult[];
}

// ─── Helpers (réutilise lib + logique full) ─────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadNonVerified(): Array<{ nom_scpi: string; folder: string; statut: BatchStatut }> {
  if (!existsSync(FULL_JSON)) {
    throw new Error(`Full run introuvable: ${FULL_JSON}`);
  }
  const parsed = JSON.parse(readFileSync(FULL_JSON, 'utf8')) as FullJson;

  if (parsed.meta?.non_verified?.length) {
    return parsed.meta.non_verified.map((nv) => ({
      nom_scpi: nv.nom_scpi,
      folder: nv.folder,
      statut: nv.statut,
    }));
  }

  // Fallback: dériver depuis results
  return (parsed.results ?? [])
    .filter((r) => r.statut === 'manual_review' || r.statut === 'rejected')
    .map((r) => ({ nom_scpi: r.nom_scpi, folder: r.folder, statut: r.statut }));
}

/** Recalcule les champs dérivés depuis l'extraction brute, sans appel API. */
function recomputeDerived(r: ScpiResult): ScpiResult {
  if (r.error || r.extraction.prix_souscription.value == null) return r;
  const vrAdjusted = computeAdjustedReconstitution(r.extraction);
  const decote_surcote = computeDecoteSurcote(r.extraction, vrAdjusted.value);
  const statut = determineStatut(r.extraction, decote_surcote, vrAdjusted.value);
  const commentaire = buildCommentaire(r.extraction, vrAdjusted, decote_surcote, statut);
  const anomalies = detectAnomalies(r.extraction, decote_surcote, vrAdjusted);
  return {
    ...r,
    valeur_reconstitution_ajustee: vrAdjusted,
    decote_surcote,
    statut,
    statut_change: `${r.statut_initial} → ${statut}`,
    commentaire,
    anomalies,
  };
}

function buildPagesPrompt(chunks: PageChunk[]): string {
  return chunks
    .map(
      (c) => `### Document: ${c.document} — Page ${c.page}\n---\n${c.text.slice(0, MAX_CHARS_PER_PAGE)}\n---`
    )
    .join('\n\n');
}

function summarizeDocuments(chunks: PageChunk[]): string | null {
  if (!chunks.length) return null;
  const docs = [...new Set(chunks.map((c) => c.document))];
  return docs.length === 1 ? docs[0] : docs.join(' + ');
}

async function callDeepSeekExtraction(
  nom_scpi: string,
  pagesPrompt: string
): Promise<Awaited<ReturnType<typeof llmChatJson>>> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await llmChatJson({
        task: 'extraction',
        schemaHint: SCHEMA_HINT,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `SCPI cible: ${nom_scpi}\nExtrais prix de souscription, valeur de reconstitution, valeur de réalisation, division nominale.\nSois concis dans les champs "extract" (max 150 caractères) pour éviter toute troncature.\nPages filtrées:\n\n${pagesPrompt}`,
          },
        ],
        maxTokens: LLM_MAX_TOKENS,
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 3 && lastError.message.includes('empty response')) {
        await sleep(API_RETRY_DELAY_MS * attempt);
        continue;
      }
      throw lastError;
    }
  }
  throw lastError ?? new Error('DeepSeek extraction failed');
}

function emptyExtraction(nom: string): LlmExtraction {
  const emptyField = {
    value: null,
    unit: null,
    confidence: 0,
    extract: null,
    source_document: null,
    source_page: null,
    status: 'missing' as const,
    comment: null,
  };
  return {
    nom_scpi: nom,
    source_periode: null,
    prix_souscription: { ...emptyField },
    valeur_reconstitution: { ...emptyField },
    valeur_realisation: { ...emptyField },
    division_nominale: {
      detected: false,
      ratio: null,
      date_effet: null,
      prix_avant_split: null,
      prix_apres_split: null,
      vr_avant_split: null,
      vr_apres_split: null,
      comment: null,
    },
  };
}

function buildCommentaire(
  extraction: LlmExtraction,
  vrAdj: { value: number | null; formula: string | null },
  decote: ReturnType<typeof computeDecoteSurcote>,
  statut: BatchStatut
): string {
  const parts: string[] = [];
  if (extraction.prix_souscription.extract) parts.push(`Prix: ${extraction.prix_souscription.extract.slice(0, 120)}`);
  if (extraction.valeur_reconstitution.extract) parts.push(`VR: ${extraction.valeur_reconstitution.extract.slice(0, 120)}`);
  if (extraction.division_nominale.detected) {
    parts.push(
      `Division nominale ×${extraction.division_nominale.ratio ?? '?'}${extraction.division_nominale.date_effet ? ` (${extraction.division_nominale.date_effet})` : ''}`
    );
  }
  if (vrAdj.value != null) parts.push(`VR ajustée: ${vrAdj.formula}`);
  if (decote.computed) parts.push(`Écart: ${decote.pct} % (${decote.label})`);
  else if (decote.reason_if_skipped) parts.push(decote.reason_if_skipped);
  parts.push(`Statut: ${statut}`);
  return parts.join(' | ');
}

function detectAnomalies(
  extraction: LlmExtraction,
  decote: ReturnType<typeof computeDecoteSurcote>,
  vrAdj: { value: number | null; formula: string | null }
): string[] {
  const anomalies: string[] = [];
  if (extraction.prix_souscription.value == null) anomalies.push('Prix de souscription introuvable.');
  if (extraction.valeur_reconstitution.value == null) anomalies.push('Valeur de reconstitution introuvable.');
  if (extraction.valeur_realisation.value == null) anomalies.push('Valeur de réalisation introuvable.');
  if (extraction.division_nominale.detected) {
    anomalies.push(
      `Division nominale ×${extraction.division_nominale.ratio ?? '?'} détectée${extraction.division_nominale.date_effet ? ` (${extraction.division_nominale.date_effet})` : ''} — valeurs à harmoniser.`
    );
    if (vrAdj.value == null) anomalies.push('Split détecté mais valeur de reconstitution ajustée non calculable.');
  }
  if (decote.computed && decote.pct != null && Math.abs(decote.pct) > ECART_ANOMALIE_PCT) {
    anomalies.push(`Écart décote/surcote inhabituel (${decote.pct} %, > |${ECART_ANOMALIE_PCT}| %) — vérifier split ou erreur de saisie.`);
  }
  const vr = extraction.valeur_reconstitution.value;
  const real = extraction.valeur_realisation.value;
  if (vr != null && real != null && real > vr) {
    anomalies.push(`Incohérence: valeur de réalisation (${real}) > valeur de reconstitution (${vr}).`);
  }
  const prix = extraction.prix_souscription.value;
  if (prix != null && vr != null && !extraction.division_nominale.detected && vr / prix > 1.5) {
    anomalies.push(`Ratio VR/prix élevé (${(vr / prix).toFixed(2)}) sans split détecté — division nominale possiblement manquée.`);
  }
  return anomalies;
}

// ─── Extraction unitaire ──────────────────────────────────────────────────────

async function retryOneScpi(
  entry: { nom_scpi: string; folder: string; statut: BatchStatut },
  modelRef: { value: string }
): Promise<ScpiResult> {
  const folderAbs = join(DOCS_ROOT, entry.folder);
  const nom_scpi = entry.nom_scpi || folderToScpiName(entry.folder);
  const maxPages = isFicommerceFolder(entry.folder) ? MAX_PAGES + 1 : MAX_PAGES;

  let chunks: PageChunk[] = [];
  let primaryDocument: string | null = null;
  try {
    const collected = await collectRelevantPageChunks(folderAbs, 4, maxPages);
    chunks = collected.chunks;
    primaryDocument = collected.primaryDocument;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return baseFail(entry, nom_scpi, [], null, `Lecture PDF impossible: ${message}`, 'pdf_error');
  }

  if (!chunks.length) {
    return baseFail(entry, nom_scpi, [], primaryDocument, 'Aucune page pertinente trouvée dans les PDF.', 'no_relevant_pages');
  }

  const pagesPrompt = buildPagesPrompt(chunks);

  try {
    const { data, model, result } = await callDeepSeekExtraction(nom_scpi, pagesPrompt);
    modelRef.value = model;

    const parsed = LlmExtractionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ...baseFail(entry, nom_scpi, chunks, summarizeDocuments(chunks), `JSON LLM non conforme: ${parsed.error.message}`, 'invalid_llm_json'),
        usage: result.usage,
      };
    }

    const extraction = parsed.data;
    if (!extraction.nom_scpi) extraction.nom_scpi = nom_scpi;

    const vrAdjusted = computeAdjustedReconstitution(extraction);
    const decote_surcote = computeDecoteSurcote(extraction, vrAdjusted.value);
    const statut = determineStatut(extraction, decote_surcote, vrAdjusted.value);
    const commentaire = buildCommentaire(extraction, vrAdjusted, decote_surcote, statut);
    const anomalies = detectAnomalies(extraction, decote_surcote, vrAdjusted);

    return {
      nom_scpi: extraction.nom_scpi ?? nom_scpi,
      folder: entry.folder,
      statut_initial: entry.statut,
      document_source: summarizeDocuments(chunks) ?? primaryDocument,
      pages_source: [...new Set(chunks.map((c) => c.page))].sort((a, b) => a - b),
      pages_documents: chunks.map((c) => ({ document: c.document, page: c.page })),
      pages_sent_to_llm: chunks.length,
      extraction,
      valeur_reconstitution_ajustee: vrAdjusted,
      decote_surcote,
      statut,
      statut_change: `${entry.statut} → ${statut}`,
      commentaire,
      anomalies,
      usage: result.usage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ...baseFail(entry, nom_scpi, chunks, summarizeDocuments(chunks), `Erreur API: ${message}`, 'api_error'),
    };
  }
}

function baseFail(
  entry: { nom_scpi: string; folder: string; statut: BatchStatut },
  nom_scpi: string,
  chunks: PageChunk[],
  document_source: string | null,
  commentaire: string,
  error: string
): ScpiResult {
  return {
    nom_scpi,
    folder: entry.folder,
    statut_initial: entry.statut,
    document_source,
    pages_source: chunks.map((c) => c.page),
    pages_documents: chunks.map((c) => ({ document: c.document, page: c.page })),
    pages_sent_to_llm: chunks.length,
    extraction: emptyExtraction(nom_scpi),
    valeur_reconstitution_ajustee: { value: null, formula: null },
    decote_surcote: { computed: false, pct: null, label: null, formula: null, reason_if_skipped: commentaire },
    statut: 'rejected',
    statut_change: `${entry.statut} → rejected`,
    commentaire,
    anomalies: [commentaire],
    error,
  };
}

// ─── Rapport ────────────────────────────────────────────────────────────────────

function estimateCostUsd(totalTokens: number): number {
  return (totalTokens / 1_000_000) * 1.0;
}

function fmtVal(field: { value: number | null; source_page: number | null }): string {
  if (field.value == null) return '—';
  return `${field.value} €${field.source_page ? ` (p.${field.source_page})` : ''}`;
}

function buildReport(output: RetryOutput): string {
  const { meta, results } = output;
  const lines: string[] = [
    '# Rapport reprise ciblée — DeepSeek reconstitution SCPI non vérifiées',
    '',
    `**Date :** ${meta.generated_at.slice(0, 10)}`,
    `**Provider :** ${meta.provider} (${meta.model})`,
    `**Source :** ${meta.source_full_run}`,
    `**SCPI retraitées :** ${meta.scpi_retried}`,
    '',
    '## Bilan de la reprise',
    '',
    '| Évolution | Nombre |',
    '|-----------|--------|',
    `| Devenues verified | ${meta.became_verified} |`,
    `| Devenues verified_adjusted_split | ${meta.became_verified_adjusted_split} |`,
    `| Restées manual_review | ${meta.still_manual_review} |`,
    `| Restées rejected | ${meta.still_rejected} |`,
    '',
    '## Statuts finaux (lot retraité)',
    '',
    '| Statut | Nombre |',
    '|--------|--------|',
    `| verified | ${meta.stats_finales.verified} |`,
    `| verified_adjusted_split | ${meta.stats_finales.verified_adjusted_split} |`,
    `| manual_review | ${meta.stats_finales.manual_review} |`,
    `| rejected | ${meta.stats_finales.rejected} |`,
    '',
    '## Tokens & coût supplémentaire',
    '',
    `- Prompt tokens : ${meta.tokens.prompt}`,
    `- Completion tokens : ${meta.tokens.completion}`,
    `- Total tokens : ${meta.tokens.total}`,
    meta.estimated_cost_usd != null
      ? `- Coût supplémentaire estimé (indicatif) : ~${meta.estimated_cost_usd.toFixed(4)} USD`
      : '- Coût supplémentaire : non calculé',
    '',
    '## SCPI encore non publiables',
    '',
  ];

  if (meta.still_non_publiable.length === 0) {
    lines.push('_Aucune — toutes les SCPI retraitées sont désormais publiables._');
  } else {
    lines.push('| SCPI | Statut | Raison |');
    lines.push('|------|--------|--------|');
    for (const s of meta.still_non_publiable) {
      lines.push(`| ${s.nom_scpi} | \`${s.statut}\` | ${s.raison} |`);
    }
  }
  lines.push('');

  lines.push('## Détail par SCPI');
  lines.push('');
  for (const r of results) {
    lines.push(`### ${r.nom_scpi}`);
    lines.push('');
    lines.push(`- **Évolution :** ${r.statut_change}`);
    lines.push(`- **Dossier :** \`${r.folder}\``);
    lines.push(`- **Document :** ${r.document_source ?? '—'}`);
    lines.push(
      `- **Pages LLM :** ${r.pages_sent_to_llm} (${r.pages_documents.map((p) => `${p.document} p.${p.page}`).join(', ') || '—'})`
    );
    lines.push(`- **Prix souscription :** ${fmtVal(r.extraction.prix_souscription)}`);
    lines.push(`- **VR :** ${fmtVal(r.extraction.valeur_reconstitution)}`);
    lines.push(
      `- **VR ajustée :** ${r.valeur_reconstitution_ajustee.value ?? '—'} ${r.valeur_reconstitution_ajustee.formula ? `(${r.valeur_reconstitution_ajustee.formula})` : ''}`
    );
    lines.push(`- **Réalisation :** ${fmtVal(r.extraction.valeur_realisation)}`);
    lines.push(
      `- **Division :** ${r.extraction.division_nominale.detected ? `oui (×${r.extraction.division_nominale.ratio ?? '?'})` : 'non'}`
    );
    lines.push(
      `- **Décote/surcote :** ${r.decote_surcote.computed ? `${r.decote_surcote.pct} % (${r.decote_surcote.label})` : r.decote_surcote.reason_if_skipped ?? '—'}`
    );
    lines.push(`- **Statut final :** \`${r.statut}\``);
    if (r.anomalies.length) lines.push(`- **Anomalies :** ${r.anomalies.join(' / ')}`);
    lines.push(`- **Commentaire :** ${r.commentaire}`);
    if (r.usage?.total_tokens) lines.push(`- **Tokens :** ${r.usage.total_tokens}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(meta.disclaimer);
  lines.push('');
  return lines.join('\n');
}

function nonPubliableReason(r: ScpiResult): string {
  if (r.error) return r.error;
  if (!r.decote_surcote.computed) return r.decote_surcote.reason_if_skipped ?? 'décote/surcote non calculée';
  return 'données partielles ou non fiables';
}

function assembleOutput(results: ScpiResult[], model: string): RetryOutput {
  const statsFinales: Record<BatchStatut, number> = {
    verified: 0,
    verified_adjusted_split: 0,
    manual_review: 0,
    rejected: 0,
  };
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalTokens = 0;
  let becameVerified = 0;
  let becameAdj = 0;

  for (const r of results) {
    statsFinales[r.statut]++;
    if (r.statut === 'verified') becameVerified++;
    if (r.statut === 'verified_adjusted_split') becameAdj++;
    if (r.usage) {
      totalPrompt += r.usage.prompt_tokens ?? 0;
      totalCompletion += r.usage.completion_tokens ?? 0;
      totalTokens += r.usage.total_tokens ?? 0;
    }
  }

  const stillNonPubliable = results
    .filter((r) => r.statut === 'manual_review' || r.statut === 'rejected')
    .map((r) => ({ nom_scpi: r.nom_scpi, statut: r.statut, raison: nonPubliableReason(r) }));

  return {
    meta: {
      generated_at: new Date().toISOString(),
      provider: 'deepseek',
      model,
      source_full_run: 'data-import/scpi-agent/deepseek_reconstitution_full.json',
      scpi_retried: results.length,
      became_verified: becameVerified,
      became_verified_adjusted_split: becameAdj,
      still_manual_review: statsFinales.manual_review,
      still_rejected: statsFinales.rejected,
      stats_finales: statsFinales,
      tokens: { prompt: totalPrompt, completion: totalCompletion, total: totalTokens },
      estimated_cost_usd: totalTokens > 0 ? estimateCostUsd(totalTokens) : null,
      still_non_publiable: stillNonPubliable,
      disclaimer:
        'Données extraites automatiquement depuis documents officiels. Performances passées ne préjugent pas des performances futures. Pas de promesse de rendement.',
    },
    results,
  };
}

function writeOutputs(output: RetryOutput): void {
  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  mkdirSync(dirname(OUTPUT_REPORT), { recursive: true });
  writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT_REPORT, buildReport(output), 'utf8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error('❌ DEEPSEEK_API_KEY absente');
    process.exit(1);
  }
  if (process.env.VITE_DEEPSEEK_API_KEY) {
    console.error('❌ VITE_DEEPSEEK_API_KEY interdite');
    process.exit(1);
  }

  // Mode recompute : recharge le JSON de reprise et recalcule les dérivés, sans appel API.
  if (process.argv.includes('--recompute')) {
    if (!existsSync(OUTPUT_JSON)) {
      console.error(`❌ Aucun résultat de reprise à recalculer: ${OUTPUT_JSON}`);
      process.exit(1);
    }
    const prev = JSON.parse(readFileSync(OUTPUT_JSON, 'utf8')) as RetryOutput;
    const recomputed = (prev.results ?? [])
      .filter((r) => !isExcludedScpi(r.folder) && !isExcludedScpi(r.nom_scpi))
      .map(recomputeDerived);
    const out = assembleOutput(recomputed, prev.meta?.model ?? 'deepseek-v4-pro');
    writeOutputs(out);
    console.log(`♻️  Recompute reprise terminé sur ${recomputed.length} SCPI (sans API).`);
    console.log(
      `verified: ${out.meta.stats_finales.verified} | adj_split: ${out.meta.stats_finales.verified_adjusted_split} | manual_review: ${out.meta.stats_finales.manual_review} | rejected: ${out.meta.stats_finales.rejected}`
    );
    console.log(`encore non publiables: ${out.meta.still_non_publiable.length}`);
    return;
  }

  const targets = loadNonVerified().filter((t) => !isExcludedScpi(t.folder) && !isExcludedScpi(t.nom_scpi));
  console.log(`🎯 Reprise ciblée : ${targets.length} SCPI non vérifiées (Kyaneos exclu — règle 8)`);
  targets.forEach((t, i) => console.log(`   ${i + 1}. ${t.nom_scpi} [${t.statut}] (${t.folder})`));

  const modelRef = { value: 'deepseek-v4-pro' };
  const results: ScpiResult[] = [];

  for (let i = 0; i < targets.length; i++) {
    console.log(`\n[${i + 1}/${targets.length}] ${targets[i].nom_scpi}…`);
    if (i > 0) await sleep(INTER_SCPI_DELAY_MS);
    const result = await retryOneScpi(targets[i], modelRef);
    results.push(result);
    console.log(
      `   → ${result.statut_change} | pages: ${result.pages_sent_to_llm} | décote/surcote: ${result.decote_surcote.computed ? `${result.decote_surcote.pct}%` : '—'}`
    );
  }

  const output = assembleOutput(results, modelRef.value);
  writeOutputs(output);

  const { stats_finales, tokens, estimated_cost_usd, became_verified, became_verified_adjusted_split, still_non_publiable } =
    output.meta;

  console.log('\n═══════════════════════════════════════');
  console.log(`SCPI retraitées            : ${output.meta.scpi_retried}`);
  console.log(`Devenues verified          : ${became_verified}`);
  console.log(`Devenues verified_adj_split: ${became_verified_adjusted_split}`);
  console.log(`Restées manual_review      : ${stats_finales.manual_review}`);
  console.log(`Restées rejected           : ${stats_finales.rejected}`);
  console.log(`Tokens total               : ${tokens.total}`);
  if (estimated_cost_usd != null) {
    console.log(`Coût supplémentaire estimé : ~${estimated_cost_usd.toFixed(4)} USD`);
  }
  console.log(`Encore non publiables      : ${still_non_publiable.length}`);
  console.log(`JSON   → ${OUTPUT_JSON}`);
  console.log(`Rapport → ${OUTPUT_REPORT}`);
}

main().catch((err: unknown) => {
  console.error('❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
