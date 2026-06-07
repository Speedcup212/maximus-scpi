/**
 * full-extract-reconstitution-deepseek.ts
 *
 * Extraction DeepSeek reconstitution sur TOUTES les SCPI locales.
 * Parcourt data-import/Liste SCPI + Doc/, filtre les pages utiles,
 * appelle DeepSeek uniquement sur ces pages.
 *
 * Usage:
 *   npx tsx scripts/scpi-agents/full-extract-reconstitution-deepseek.ts
 *   npx tsx scripts/scpi-agents/full-extract-reconstitution-deepseek.ts --fresh   (ignore la reprise)
 *   npx tsx scripts/scpi-agents/full-extract-reconstitution-deepseek.ts --limit 20
 *
 * Sorties:
 *   data-import/scpi-agent/deepseek_reconstitution_full.json
 *   reports/scpi-2026/rapport_deepseek_reconstitution_full.md
 *
 * Sauvegarde incrémentale: le JSON est réécrit après chaque SCPI (reprise possible).
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
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
const OUTPUT_JSON = join(ROOT, 'data-import', 'scpi-agent', 'deepseek_reconstitution_full.json');
const OUTPUT_REPORT = join(ROOT, 'reports', 'scpi-2026', 'rapport_deepseek_reconstitution_full.md');

const MAX_CHARS_PER_PAGE = 3500;
const LLM_MAX_TOKENS = 4096;
const API_RETRY_DELAY_MS = 2000;
const INTER_SCPI_DELAY_MS = 1500;

/** Bande de décote/surcote considérée "normale" — au-delà = anomalie à vérifier. */
const ECART_ANOMALIE_PCT = 15;

config({ path: join(ROOT, '.env.local') });
config({ path: join(ROOT, '.env') });

// ─── Types sortie ─────────────────────────────────────────────────────────────

interface ScpiFullResult {
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
  anomalies: string[];
  error?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

interface FullOutput {
  meta: {
    generated_at: string;
    provider: 'deepseek';
    model: string;
    scpi_analyzed: number;
    stats: Record<BatchStatut, number>;
    tokens: { prompt: number; completion: number; total: number };
    estimated_cost_usd: number | null;
    non_verified: Array<{ nom_scpi: string; folder: string; statut: BatchStatut; raison: string }>;
    anomalies: Array<{ nom_scpi: string; anomalie: string }>;
    disclaimer: string;
  };
  results: ScpiFullResult[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { fresh: boolean; limit: number | null; recompute: boolean } {
  const fresh = argv.includes('--fresh');
  const recompute = argv.includes('--recompute');
  const limitIdx = argv.indexOf('--limit');
  const limit = limitIdx !== -1 && argv[limitIdx + 1] ? parseInt(argv[limitIdx + 1], 10) : null;
  return { fresh, recompute, limit: limit != null && Number.isFinite(limit) ? limit : null };
}

/** Recalcule les champs dérivés depuis l'extraction brute, sans appel API. */
function recomputeDerived(r: ScpiFullResult): ScpiFullResult {
  if (r.error || r.extraction.prix_souscription.value == null) return r;
  const vrAdjusted = computeAdjustedReconstitution(r.extraction);
  const decote_surcote = computeDecoteSurcote(r.extraction, vrAdjusted.value);
  const statut = determineStatut(r.extraction, decote_surcote, vrAdjusted.value);
  const commentaire = buildCommentaire(r.extraction, vrAdjusted, decote_surcote, statut);
  const anomalies = detectAnomalies(r.extraction, decote_surcote, vrAdjusted);
  return { ...r, valeur_reconstitution_ajustee: vrAdjusted, decote_surcote, statut, commentaire, anomalies };
}

function listAllScpiFolders(): string[] {
  return readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !isExcludedScpi(name)) // Règle 8 : exclusion hors-périmètre SCPI
    .filter((name) => {
      const files = readdirSync(join(DOCS_ROOT, name));
      return files.some((f) => f.toLowerCase().endsWith('.pdf'));
    })
    .sort((a, b) => {
      // Ficommerce d'abord (cas de contrôle split), puis ordre alphabétique
      if (isFicommerceFolder(a)) return -1;
      if (isFicommerceFolder(b)) return 1;
      return a.localeCompare(b, 'fr');
    });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function detectAnomalies(
  extraction: LlmExtraction,
  decote: ReturnType<typeof computeDecoteSurcote>,
  vrAdj: { value: number | null; formula: string | null }
): string[] {
  const anomalies: string[] = [];

  if (extraction.prix_souscription.value == null) {
    anomalies.push('Prix de souscription introuvable.');
  }
  if (extraction.valeur_reconstitution.value == null) {
    anomalies.push('Valeur de reconstitution introuvable.');
  }
  if (extraction.valeur_realisation.value == null) {
    anomalies.push('Valeur de réalisation introuvable.');
  }

  if (extraction.division_nominale.detected) {
    anomalies.push(
      `Division nominale ×${extraction.division_nominale.ratio ?? '?'} détectée${extraction.division_nominale.date_effet ? ` (${extraction.division_nominale.date_effet})` : ''} — valeurs à harmoniser.`
    );
    if (vrAdj.value == null) {
      anomalies.push('Split détecté mais valeur de reconstitution ajustée non calculable.');
    }
  }

  if (decote.computed && decote.pct != null && Math.abs(decote.pct) > ECART_ANOMALIE_PCT) {
    anomalies.push(
      `Écart décote/surcote inhabituel (${decote.pct} %, > |${ECART_ANOMALIE_PCT}| %) — vérifier split ou erreur de saisie.`
    );
  }

  // Cohérence: réalisation devrait être < reconstitution
  const vr = extraction.valeur_reconstitution.value;
  const real = extraction.valeur_realisation.value;
  if (vr != null && real != null && real > vr) {
    anomalies.push(`Incohérence: valeur de réalisation (${real}) > valeur de reconstitution (${vr}).`);
  }

  // Ratio VR/prix très élevé sans split → split probablement manqué
  const prix = extraction.prix_souscription.value;
  if (
    prix != null &&
    vr != null &&
    !extraction.division_nominale.detected &&
    vr / prix > 1.5
  ) {
    anomalies.push(
      `Ratio VR/prix élevé (${(vr / prix).toFixed(2)}) sans split détecté — division nominale possiblement manquée.`
    );
  }

  return anomalies;
}

// ─── Extraction unitaire ──────────────────────────────────────────────────────

async function extractOneScpi(folder: string, modelRef: { value: string }): Promise<ScpiFullResult> {
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
      anomalies: ['Aucune page pertinente détectée dans les documents.'],
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
        anomalies: ['Réponse DeepSeek non conforme au schéma.'],
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
    const anomalies = detectAnomalies(extraction, decote_surcote, vrAdjusted);

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
      anomalies,
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
      anomalies: [`Erreur API: ${message}`],
      error: 'api_error',
    };
  }
}

// ─── Agrégation & rapport ───────────────────────────────────────────────────────

function estimateCostUsd(totalTokens: number): number {
  return (totalTokens / 1_000_000) * 1.0;
}

function nonVerifiedReason(r: ScpiFullResult): string {
  if (r.error) return r.error;
  if (!r.decote_surcote.computed) return r.decote_surcote.reason_if_skipped ?? 'décote/surcote non calculée';
  return 'données partielles ou non fiables';
}

function buildOutput(results: ScpiFullResult[], model: string): FullOutput {
  const stats: Record<BatchStatut, number> = {
    verified: 0,
    verified_adjusted_split: 0,
    manual_review: 0,
    rejected: 0,
  };
  let totalPrompt = 0;
  let totalCompletion = 0;
  let totalTokens = 0;

  for (const r of results) {
    stats[r.statut]++;
    if (r.usage) {
      totalPrompt += r.usage.prompt_tokens ?? 0;
      totalCompletion += r.usage.completion_tokens ?? 0;
      totalTokens += r.usage.total_tokens ?? 0;
    }
  }

  const non_verified = results
    .filter((r) => r.statut === 'manual_review' || r.statut === 'rejected')
    .map((r) => ({ nom_scpi: r.nom_scpi, folder: r.folder, statut: r.statut, raison: nonVerifiedReason(r) }));

  const anomalies = results.flatMap((r) =>
    r.anomalies.map((a) => ({ nom_scpi: r.nom_scpi, anomalie: a }))
  );

  return {
    meta: {
      generated_at: new Date().toISOString(),
      provider: 'deepseek',
      model,
      scpi_analyzed: results.length,
      stats,
      tokens: { prompt: totalPrompt, completion: totalCompletion, total: totalTokens },
      estimated_cost_usd: totalTokens > 0 ? estimateCostUsd(totalTokens) : null,
      non_verified,
      anomalies,
      disclaimer:
        'Données extraites automatiquement depuis documents officiels. Performances passées ne préjugent pas des performances futures. Pas de promesse de rendement.',
    },
    results,
  };
}

function fmtVal(field: { value: number | null; source_page: number | null }): string {
  if (field.value == null) return '—';
  return `${field.value} €${field.source_page ? ` (p.${field.source_page})` : ''}`;
}

function buildReport(output: FullOutput): string {
  const { meta, results } = output;
  const lines: string[] = [
    '# Rapport complet — DeepSeek reconstitution SCPI',
    '',
    `**Date :** ${meta.generated_at.slice(0, 10)}`,
    `**Provider :** ${meta.provider} (${meta.model})`,
    `**SCPI analysées :** ${meta.scpi_analyzed}`,
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
    '## SCPI non vérifiées',
    '',
  ];

  if (meta.non_verified.length === 0) {
    lines.push('_Aucune — toutes les SCPI sont verified ou verified_adjusted_split._');
  } else {
    lines.push('| SCPI | Statut | Raison |');
    lines.push('|------|--------|--------|');
    for (const nv of meta.non_verified) {
      lines.push(`| ${nv.nom_scpi} | \`${nv.statut}\` | ${nv.raison} |`);
    }
  }
  lines.push('');

  lines.push('## Anomalies détectées');
  lines.push('');
  if (meta.anomalies.length === 0) {
    lines.push('_Aucune anomalie détectée._');
  } else {
    lines.push('| SCPI | Anomalie |');
    lines.push('|------|----------|');
    for (const a of meta.anomalies) {
      lines.push(`| ${a.nom_scpi} | ${a.anomalie} |`);
    }
  }
  lines.push('');

  lines.push('## Tableau récapitulatif');
  lines.push('');
  lines.push('| SCPI | Prix | VR | VR ajustée | Réalisation | Split | Décote/surcote | Statut |');
  lines.push('|------|------|----|-----------|-------------|-------|----------------|--------|');
  for (const r of results) {
    const prix = r.extraction.prix_souscription.value ?? '—';
    const vr = r.extraction.valeur_reconstitution.value ?? '—';
    const vrAdj = r.valeur_reconstitution_ajustee.value ?? '—';
    const real = r.extraction.valeur_realisation.value ?? '—';
    const split = r.extraction.division_nominale.detected
      ? `×${r.extraction.division_nominale.ratio ?? '?'}`
      : '—';
    const ds = r.decote_surcote.computed ? `${r.decote_surcote.pct} %` : '—';
    lines.push(`| ${r.nom_scpi} | ${prix} | ${vr} | ${vrAdj} | ${real} | ${split} | ${ds} | \`${r.statut}\` |`);
  }
  lines.push('');

  lines.push('## Détail par SCPI');
  lines.push('');
  for (const r of results) {
    lines.push(`### ${r.nom_scpi}`);
    lines.push('');
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
    lines.push(`- **Statut :** \`${r.statut}\``);
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

function persist(results: ScpiFullResult[], model: string): FullOutput {
  const output = buildOutput(results, model);
  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  mkdirSync(dirname(OUTPUT_REPORT), { recursive: true });
  writeFileSync(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT_REPORT, buildReport(output), 'utf8');
  return output;
}

function loadExisting(): ScpiFullResult[] {
  if (!existsSync(OUTPUT_JSON)) return [];
  try {
    const parsed = JSON.parse(readFileSync(OUTPUT_JSON, 'utf8')) as FullOutput;
    return Array.isArray(parsed.results) ? parsed.results : [];
  } catch {
    return [];
  }
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

  const { fresh, limit, recompute } = parseArgs(process.argv.slice(2));

  // Mode recompute: recharge le JSON et recalcule les dérivés, sans appel API.
  if (recompute) {
    const reloaded = loadExisting();
    if (!reloaded.length) {
      console.error('❌ Aucun résultat existant à recalculer.');
      process.exit(1);
    }
    // Règle 8 : retirer les produits hors périmètre SCPI (ex. Kyaneos Denormandie 4).
    const filtered = reloaded.filter((r) => !isExcludedScpi(r.folder) && !isExcludedScpi(r.nom_scpi));
    const recomputed = filtered.map(recomputeDerived);
    const model = 'deepseek-v4-pro';
    const out = buildOutput(recomputed, model);
    mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
    mkdirSync(dirname(OUTPUT_REPORT), { recursive: true });
    writeFileSync(OUTPUT_JSON, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    writeFileSync(OUTPUT_REPORT, buildReport(out), 'utf8');
    console.log(`♻️  Recompute terminé sur ${recomputed.length} SCPI (sans API).`);
    console.log(
      `verified: ${out.meta.stats.verified} | adj_split: ${out.meta.stats.verified_adjusted_split} | manual_review: ${out.meta.stats.manual_review} | rejected: ${out.meta.stats.rejected}`
    );
    console.log(`non vérifiées: ${out.meta.non_verified.length} | anomalies: ${out.meta.anomalies.length}`);
    return;
  }

  let folders = listAllScpiFolders();
  if (limit != null) folders = folders.slice(0, limit);

  const existing = fresh ? [] : loadExisting();
  const doneFolders = new Set(existing.map((r) => r.folder));
  const results: ScpiFullResult[] = [...existing];

  const todo = folders.filter((f) => !doneFolders.has(f));

  console.log(`📂 SCPI disponibles : ${folders.length}`);
  console.log(`   déjà traitées (reprise) : ${existing.length}`);
  console.log(`   à traiter : ${todo.length}${fresh ? ' (--fresh: tout retraité)' : ''}`);

  const modelRef = { value: 'deepseek-v4-pro' };

  for (let i = 0; i < todo.length; i++) {
    const folder = todo[i];
    console.log(`\n[${i + 1}/${todo.length}] ${folderToScpiName(folder)}…`);
    if (i > 0) await sleep(INTER_SCPI_DELAY_MS);
    const result = await extractOneScpi(folder, modelRef);
    results.push(result);
    // Sauvegarde incrémentale après chaque SCPI
    persist(results, modelRef.value);
    console.log(
      `   → ${result.statut} | pages LLM: ${result.pages_sent_to_llm} | décote/surcote: ${result.decote_surcote.computed ? `${result.decote_surcote.pct}%` : '—'}${result.anomalies.length ? ` | ⚠️ ${result.anomalies.length} anomalie(s)` : ''}`
    );
  }

  const output = persist(results, modelRef.value);
  const { stats, tokens, estimated_cost_usd, non_verified, anomalies } = output.meta;

  console.log('\n═══════════════════════════════════════');
  console.log(`SCPI analysées        : ${output.meta.scpi_analyzed}`);
  console.log(`verified              : ${stats.verified}`);
  console.log(`verified_adjusted_split: ${stats.verified_adjusted_split}`);
  console.log(`manual_review         : ${stats.manual_review}`);
  console.log(`rejected              : ${stats.rejected}`);
  console.log(`Tokens total          : ${tokens.total}`);
  if (estimated_cost_usd != null) console.log(`Coût estimé           : ~${estimated_cost_usd.toFixed(4)} USD`);
  console.log(`SCPI non vérifiées    : ${non_verified.length}`);
  console.log(`Anomalies détectées   : ${anomalies.length}`);
  console.log(`JSON   → ${OUTPUT_JSON}`);
  console.log(`Rapport → ${OUTPUT_REPORT}`);
}

main().catch((err: unknown) => {
  console.error('❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
