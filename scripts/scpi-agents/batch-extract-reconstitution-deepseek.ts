/**
 * batch-extract-reconstitution-deepseek.ts
 *
 * Lot test DeepSeek sur documents SCPI locaux (max 10).
 * Parcourt data-import/Liste SCPI + Doc/, filtre les pages utiles,
 * appelle DeepSeek uniquement sur ces pages.
 *
 * Usage: npx tsx scripts/scpi-agents/batch-extract-reconstitution-deepseek.ts
 *
 * Sorties:
 *   data-import/scpi-agent/deepseek_reconstitution_batch_test.json
 *   reports/scpi-2026/rapport_test_deepseek_reconstitution_batch.md
 */

import { config } from 'dotenv';
import { mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { llmChatJson } from '../../src/ai/llmRouter';
import {
  collectRelevantPageChunks,
  folderToScpiName,
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
const OUTPUT_JSON = join(ROOT, 'data-import', 'scpi-agent', 'deepseek_reconstitution_batch_test.json');
const OUTPUT_REPORT = join(ROOT, 'reports', 'scpi-2026', 'rapport_test_deepseek_reconstitution_batch.md');

const MAX_SCPI = 10;

/** Lot prioritaire — Ficommerce ajouté automatiquement */
const PRIORITY_FOLDER_NAMES = [
  'Credit Mutuel Pierre 1',
  'SCPI Activimmo',
  'SCPI Aestiam Horizon',
  'Paref Evo',
  'NCAPRégions',
  'LF Grand Paris Patrimoine',
  'Iroko Atlas',
  'Epsicap Nano',
  'Perial O2',
];

config({ path: join(ROOT, '.env.local') });
config({ path: join(ROOT, '.env') });

// ─── Types sortie ─────────────────────────────────────────────────────────────

interface ScpiBatchResult {
  nom_scpi: string;
  folder: string;
  document_source: string | null;
  pages_source: number[];
  pages_documents: Array<{ document: string; page: number }>;
  pages_sent_to_llm: number;
  extraction: LlmExtraction;
  valeur_reconstitution_ajustee: { value: number | null; formula: string | null };
  decote_surcote: ReturnType<typeof computeDecoteSurcote>;
  statut: BatchStatut;
  commentaire: string;
  error?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface BatchOutput {
  meta: {
    generated_at: string;
    provider: 'deepseek';
    model: string;
    scpi_tested: number;
    stats: Record<BatchStatut, number>;
    tokens: { prompt: number; completion: number; total: number };
    estimated_cost_usd: number | null;
    disclaimer: string;
  };
  results: ScpiBatchResult[];
}

// ─── Sélection dossiers ─────────────────────────────────────────────────────────

function selectBatchFolders(): string[] {
  const allDirs = readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const ficommerce = allDirs.find((d) => isFicommerceFolder(d));
  const selected: string[] = [];

  if (ficommerce) selected.push(ficommerce);

  for (const name of PRIORITY_FOLDER_NAMES) {
    if (selected.length >= MAX_SCPI) break;
    const match = allDirs.find((d) => d === name);
    if (match && !selected.includes(match)) selected.push(match);
  }

  if (selected.length < MAX_SCPI) {
    for (const d of allDirs.sort()) {
      if (selected.length >= MAX_SCPI) break;
      if (!selected.includes(d)) selected.push(d);
    }
  }

  return selected.slice(0, MAX_SCPI);
}

const MAX_CHARS_PER_PAGE = 3500;
const LLM_MAX_TOKENS = 4096;
const API_RETRY_DELAY_MS = 2000;

function buildPagesPrompt(chunks: PageChunk[]): string {
  return chunks
    .map(
      (c) =>
        `### Document: ${c.document} — Page ${c.page}\n---\n${c.text.slice(0, MAX_CHARS_PER_PAGE)}\n---`
    )
    .join('\n\n');
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
            content: `SCPI cible: ${nom_scpi}\nExtrais prix de souscription, valeur de reconstitution, valeur de réalisation, division nominale.\nPages filtrées:\n\n${pagesPrompt}`,
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

function summarizeDocuments(chunks: PageChunk[]): string | null {
  if (!chunks.length) return null;
  const docs = [...new Set(chunks.map((c) => c.document))];
  return docs.length === 1 ? docs[0] : docs.join(' + ');
}

// ─── Extraction unitaire ──────────────────────────────────────────────────────

async function extractOneScpi(
  folder: string,
  modelRef: { value: string }
): Promise<ScpiBatchResult> {
  const folderAbs = join(DOCS_ROOT, folder);
  const nom_scpi = folderToScpiName(folder);

  const maxPages = isFicommerceFolder(folder) ? 7 : 6;
  const { chunks, primaryDocument } = await collectRelevantPageChunks(folderAbs, 3, maxPages);

  if (!chunks.length) {
    return {
      nom_scpi,
      folder,
      document_source: primaryDocument,
      pages_source: [],
      pages_documents: [],
      pages_sent_to_llm: 0,
      extraction: emptyExtraction(nom_scpi),
      valeur_reconstitution_ajustee: { value: null, formula: null },
      decote_surcote: {
        computed: false,
        pct: null,
        label: null,
        formula: null,
        reason_if_skipped: 'Aucune page pertinente trouvée dans les PDF.',
      },
      statut: 'rejected',
      commentaire: 'Aucune page contenant les mots-clés reconstitution / souscription / division.',
      error: 'no_relevant_pages',
    };
  }

  const pagesPrompt = buildPagesPrompt(chunks);

  try {
    const { data, model, result } = await callDeepSeekExtraction(nom_scpi, pagesPrompt);

    modelRef.value = model;

    const parsed = LlmExtractionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        nom_scpi,
        folder,
        document_source: summarizeDocuments(chunks),
        pages_source: chunks.map((c) => c.page),
        pages_documents: chunks.map((c) => ({ document: c.document, page: c.page })),
        pages_sent_to_llm: chunks.length,
        extraction: emptyExtraction(nom_scpi),
        valeur_reconstitution_ajustee: { value: null, formula: null },
        decote_surcote: {
          computed: false,
          pct: null,
          label: null,
          formula: null,
          reason_if_skipped: 'Réponse LLM invalide.',
        },
        statut: 'rejected',
        commentaire: `JSON LLM non conforme: ${parsed.error.message}`,
        error: 'invalid_llm_json',
        usage: result.usage,
      };
    }

    const extraction = parsed.data;
    if (!extraction.nom_scpi) extraction.nom_scpi = nom_scpi;

    const vrAdjusted = computeAdjustedReconstitution(extraction);
    const decote_surcote = computeDecoteSurcote(extraction, vrAdjusted.value);
    const statut = determineStatut(extraction, decote_surcote, vrAdjusted.value);
    const commentaire = buildCommentaire(extraction, vrAdjusted, decote_surcote, statut);

    return {
      nom_scpi: extraction.nom_scpi ?? nom_scpi,
      folder,
      document_source: summarizeDocuments(chunks) ?? primaryDocument,
      pages_source: [...new Set(chunks.map((c) => c.page))].sort((a, b) => a - b),
      pages_documents: chunks.map((c) => ({ document: c.document, page: c.page })),
      pages_sent_to_llm: chunks.length,
      extraction,
      valeur_reconstitution_ajustee: vrAdjusted,
      decote_surcote,
      statut,
      commentaire,
      usage: result.usage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      nom_scpi,
      folder,
      document_source: summarizeDocuments(chunks),
      pages_source: chunks.map((c) => c.page),
      pages_documents: chunks.map((c) => ({ document: c.document, page: c.page })),
      pages_sent_to_llm: chunks.length,
      extraction: emptyExtraction(nom_scpi),
      valeur_reconstitution_ajustee: { value: null, formula: null },
      decote_surcote: {
        computed: false,
        pct: null,
        label: null,
        formula: null,
        reason_if_skipped: message,
      },
      statut: 'rejected',
      commentaire: `Erreur API: ${message}`,
      error: 'api_error',
    };
  }
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
  if (extraction.prix_souscription.extract) {
    parts.push(`Prix: ${extraction.prix_souscription.extract.slice(0, 120)}`);
  }
  if (extraction.valeur_reconstitution.extract) {
    parts.push(`VR: ${extraction.valeur_reconstitution.extract.slice(0, 120)}`);
  }
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

// ─── Rapport Markdown ─────────────────────────────────────────────────────────

function buildReport(output: BatchOutput): string {
  const { meta, results } = output;
  const lines: string[] = [
    '# Rapport test batch — DeepSeek reconstitution SCPI',
    '',
    `**Date :** ${meta.generated_at.slice(0, 10)}`,
    `**Provider :** ${meta.provider} (${meta.model})`,
    `**SCPI testées :** ${meta.scpi_tested}`,
    '',
    '## Synthèse statuts',
    '',
    '| Statut | Nombre |',
    '|--------|--------|',
    `| verified | ${meta.stats.verified} |`,
    `| verified_adjusted_split | ${meta.stats.verified_adjusted_split} |`,
    `| manual_review | ${meta.stats.manual_review} |`,
    `| rejected | ${meta.stats.rejected} |`,
    '',
    '## Tokens & coût',
    '',
    `- Prompt tokens : ${meta.tokens.prompt}`,
    `- Completion tokens : ${meta.tokens.completion}`,
    `- Total tokens : ${meta.tokens.total}`,
    meta.estimated_cost_usd != null
      ? `- Coût estimé (indicatif) : ~${meta.estimated_cost_usd.toFixed(4)} USD`
      : '- Coût estimé : non calculé',
    '',
    '## Détail par SCPI',
    '',
  ];

  for (const r of results) {
    lines.push(`### ${r.nom_scpi}`);
    lines.push('');
    lines.push(`- **Dossier :** \`${r.folder}\``);
    lines.push(`- **Document :** ${r.document_source ?? '—'}`);
    lines.push(`- **Pages LLM :** ${r.pages_sent_to_llm} (${r.pages_documents.map((p) => `${p.document} p.${p.page}`).join(', ') || '—'})`);
    lines.push(`- **Prix souscription :** ${fmtVal(r.extraction.prix_souscription)}`);
    lines.push(`- **VR :** ${fmtVal(r.extraction.valeur_reconstitution)}`);
    lines.push(`- **VR ajustée :** ${r.valeur_reconstitution_ajustee.value ?? '—'} ${r.valeur_reconstitution_ajustee.formula ? `(${r.valeur_reconstitution_ajustee.formula})` : ''}`);
    lines.push(`- **Réalisation :** ${fmtVal(r.extraction.valeur_realisation)}`);
    lines.push(`- **Division :** ${r.extraction.division_nominale.detected ? `oui (×${r.extraction.division_nominale.ratio ?? '?'})` : 'non'}`);
    lines.push(
      `- **Décote/surcote :** ${r.decote_surcote.computed ? `${r.decote_surcote.pct} % (${r.decote_surcote.label})` : r.decote_surcote.reason_if_skipped ?? '—'}`
    );
    lines.push(`- **Statut :** \`${r.statut}\``);
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

function fmtVal(field: { value: number | null; source_page: number | null }): string {
  if (field.value == null) return '—';
  return `${field.value} €${field.source_page ? ` (p.${field.source_page})` : ''}`;
}

function estimateCostUsd(totalTokens: number): number {
  // Tarif indicatif DeepSeek v4 pro ~ $0.55 / 1M input + $2.19 / 1M output (moyenne pondérée ~$1/1M)
  return (totalTokens / 1_000_000) * 1.0;
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

  const folders = selectBatchFolders();
  console.log(`📂 Lot: ${folders.length} SCPI`);
  folders.forEach((f, i) => console.log(`   ${i + 1}. ${folderToScpiName(f)} (${f})`));

  const modelRef = { value: 'deepseek-v4-pro' };
  const results: ScpiBatchResult[] = [];
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalTokens = 0;

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    console.log(`\n[${i + 1}/${folders.length}] ${folderToScpiName(folder)}…`);
    if (i > 0) await sleep(1500);
    const result = await extractOneScpi(folder, modelRef);
    results.push(result);
    if (result.usage) {
      totalPrompt += result.usage.prompt_tokens ?? 0;
      totalCompletion += result.usage.completion_tokens ?? 0;
      totalTokens += result.usage.total_tokens ?? 0;
    }
    console.log(
      `   → ${result.statut} | pages LLM: ${result.pages_sent_to_llm} | décote/surcote: ${result.decote_surcote.computed ? `${result.decote_surcote.pct}%` : '—'}`
    );
  }

  const stats: Record<BatchStatut, number> = {
    verified: 0,
    verified_adjusted_split: 0,
    manual_review: 0,
    rejected: 0,
  };
  for (const r of results) stats[r.statut]++;

  const output: BatchOutput = {
    meta: {
      generated_at: new Date().toISOString(),
      provider: 'deepseek',
      model: modelRef.value,
      scpi_tested: results.length,
      stats,
      tokens: {
        prompt: totalPrompt,
        completion: totalCompletion,
        total: totalTokens,
      },
      estimated_cost_usd: totalTokens > 0 ? estimateCostUsd(totalTokens) : null,
      disclaimer:
        'Données extraites automatiquement depuis documents officiels. Performances passées ne préjugent pas des performances futures. Pas de promesse de rendement.',
    },
    results,
  };

  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  mkdirSync(dirname(OUTPUT_REPORT), { recursive: true });
  writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT_REPORT, buildReport(output), 'utf8');

  console.log('\n═══════════════════════════════════════');
  console.log(`SCPI testées     : ${output.meta.scpi_tested}`);
  console.log(`verified         : ${stats.verified}`);
  console.log(`verified_adj_split: ${stats.verified_adjusted_split}`);
  console.log(`manual_review    : ${stats.manual_review}`);
  console.log(`rejected         : ${stats.rejected}`);
  console.log(`Tokens total     : ${totalTokens}`);
  if (output.meta.estimated_cost_usd != null) {
    console.log(`Coût estimé      : ~${output.meta.estimated_cost_usd.toFixed(4)} USD`);
  }
  console.log(`JSON  → ${OUTPUT_JSON}`);
  console.log(`Rapport → ${OUTPUT_REPORT}`);
}

main().catch((err: unknown) => {
  console.error('❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
