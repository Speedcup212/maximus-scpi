/**
 * test-extract-reconstitution-deepseek.ts
 *
 * Extraction DeepSeek : prix de souscription, valeur de reconstitution,
 * valeur de réalisation, division nominale → décote/surcote si fiable.
 *
 * Usage:
 *   npx tsx scripts/scpi-agents/test-extract-reconstitution-deepseek.ts
 *   npx tsx scripts/scpi-agents/test-extract-reconstitution-deepseek.ts --text path/to/excerpt.txt
 *   npx tsx scripts/scpi-agents/test-extract-reconstitution-deepseek.ts --pdf path/to/bulletin.pdf
 *
 * Sortie: data-import/scpi-agent/test_deepseek_reconstitution.json
 * Clé: DEEPSEEK_API_KEY dans .env.local (jamais VITE_*).
 */

import { config } from 'dotenv';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { llmChatJson } from '../../src/ai/llmRouter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const OUTPUT_PATH = join(ROOT, 'data-import', 'scpi-agent', 'test_deepseek_reconstitution.json');
const DEFAULT_FIXTURE = join(
  ROOT,
  'data-import',
  'scpi-agent',
  'fixtures',
  'credit-mutuel-pierre-1-excerpt.txt'
);

config({ path: join(ROOT, '.env.local') });
config({ path: join(ROOT, '.env') });

// ─── Zod: réponse LLM stricte ───────────────────────────────────────────────

const FieldSchema = z.object({
  value: z.number().nullable(),
  unit: z.literal('EUR/part').or(z.literal('EUR')).nullable(),
  confidence: z.number().min(0).max(1),
  extract: z.string().nullable(),
  status: z.enum(['verified', 'unverified', 'missing', 'manual_review']),
  comment: z.string().nullable().optional(),
});

const LlmExtractionSchema = z.object({
  nom_scpi: z.string().nullable(),
  source_document: z.string().nullable(),
  source_periode: z.string().nullable(),
  prix_souscription: FieldSchema,
  valeur_reconstitution: FieldSchema,
  valeur_realisation: FieldSchema,
  division_nominale: z.object({
    detected: z.boolean(),
    ratio: z.number().nullable(),
    date_effet: z.string().nullable(),
    prix_avant_split: z.number().nullable(),
    prix_apres_split: z.number().nullable(),
    vr_avant_split: z.number().nullable(),
    vr_apres_split: z.number().nullable(),
    comment: z.string().nullable(),
  }),
});

type LlmExtraction = z.infer<typeof LlmExtractionSchema>;

// ─── Types sortie ─────────────────────────────────────────────────────────────

interface DecoteSurcoteResult {
  computed: boolean;
  pct: number | null;
  label: 'decote' | 'surcote' | 'parite' | null;
  formula: string | null;
  reason_if_skipped: string | null;
}

interface OutputPayload {
  meta: {
    generated_at: string;
    provider: 'deepseek';
    model: string;
    task: 'extraction';
    source: { type: 'pdf' | 'text' | 'fixture'; path: string };
    tokens?: number;
  };
  extraction: LlmExtraction;
  decote_surcote: DecoteSurcoteResult;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { type: 'pdf' | 'text' | 'fixture'; path: string } {
  const pdfIdx = argv.indexOf('--pdf');
  if (pdfIdx !== -1 && argv[pdfIdx + 1]) {
    return { type: 'pdf', path: resolve(argv[pdfIdx + 1]) };
  }

  const textIdx = argv.indexOf('--text');
  if (textIdx !== -1 && argv[textIdx + 1]) {
    return { type: 'text', path: resolve(argv[textIdx + 1]) };
  }

  return { type: 'fixture', path: DEFAULT_FIXTURE };
}

async function loadDocumentText(source: { type: 'pdf' | 'text' | 'fixture'; path: string }): Promise<string> {
  if (source.type === 'pdf') {
    const buffer = readFileSync(source.path);
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();
    if (!text) {
      throw new Error(`PDF vide ou illisible: ${source.path}`);
    }
    return text;
  }

  return readFileSync(source.path, 'utf8');
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SCHEMA_HINT = `Return a single JSON object with this exact shape:
{
  "nom_scpi": string|null,
  "source_document": string|null,
  "source_periode": string|null,
  "prix_souscription": { "value": number|null, "unit": "EUR"|"EUR/part"|null, "confidence": 0-1, "extract": string|null, "status": "verified"|"unverified"|"missing"|"manual_review", "comment": string|null },
  "valeur_reconstitution": { same field shape },
  "valeur_realisation": { same field shape },
  "division_nominale": {
    "detected": boolean,
    "ratio": number|null,
    "date_effet": string|null,
    "prix_avant_split": number|null,
    "prix_apres_split": number|null,
    "vr_avant_split": number|null,
    "vr_apres_split": number|null,
    "comment": string|null
  }
}
Rules:
- Extract ONLY from the provided document text. No extrapolation.
- Values in EUR per part (absolute numbers, not millions).
- If a value is absent or ambiguous, set value=null and status="missing".
- If division par 2/3/etc. is mentioned, set division_nominale.detected=true and fill ratio + pre/post split values when stated.
- confidence 0.9+ only when the exact figure is quoted; lower if inferred.
- extract must quote the source phrase (max 200 chars).`;

const SYSTEM_PROMPT = `Tu es un extracteur de données SCPI pour MaximusSCPI.
Tu extrais des indicateurs factuels depuis des bulletins trimestriels, rapports annuels ou notes d'information.
Tu ne fais aucune recommandation d'investissement.
Les performances passées ne préjugent pas des performances futures.
Réponds uniquement en JSON valide.`;

// ─── Décote / surcote ─────────────────────────────────────────────────────────

const MIN_PART_EUR = 1;
const MAX_PART_EUR = 15_000;
const MAX_ECART_PCT = 50;

function isReliableField(field: z.infer<typeof FieldSchema>): boolean {
  if (field.status === 'missing') return false;
  if (field.value == null || !Number.isFinite(field.value)) return false;
  if (field.value < MIN_PART_EUR || field.value > MAX_PART_EUR) return false;
  if (field.confidence < 0.7) return false;
  if (field.status === 'manual_review') return false;
  return true;
}

function resolveComparableValues(extraction: LlmExtraction): {
  prix: number | null;
  vr: number | null;
  note: string | null;
} {
  const split = extraction.division_nominale;

  let prix = extraction.prix_souscription.value;
  let vr = extraction.valeur_reconstitution.value;

  if (split.detected) {
    const hasPostSplit =
      split.prix_apres_split != null &&
      split.vr_apres_split != null &&
      split.prix_apres_split > 0 &&
      split.vr_apres_split > 0;

    if (hasPostSplit) {
      prix = split.prix_apres_split;
      vr = split.vr_apres_split;
      return {
        prix,
        vr,
        note: 'Valeurs post-division nominale utilisées pour le calcul.',
      };
    }

    if (
      split.ratio != null &&
      split.ratio > 1 &&
      prix != null &&
      vr != null &&
      (extraction.prix_souscription.status === 'manual_review' ||
        extraction.valeur_reconstitution.status === 'manual_review' ||
        (prix > MAX_PART_EUR / 2 && vr > MAX_PART_EUR / 2))
    ) {
      return {
        prix: prix / split.ratio,
        vr: vr / split.ratio,
        note: `Division nominale ×${split.ratio} — valeurs ramenées à post-split (à confirmer manuellement).`,
      };
    }

    return { prix, vr, note: 'Division nominale détectée sans valeurs post-split fiables.' };
  }

  return { prix, vr, note: null };
}

function computeDecoteSurcote(extraction: LlmExtraction): DecoteSurcoteResult {
  const prixOk = isReliableField(extraction.prix_souscription);
  const vrOk = isReliableField(extraction.valeur_reconstitution);

  if (!prixOk || !vrOk) {
    const reasons: string[] = [];
    if (!prixOk) reasons.push('prix de souscription non fiable ou absent');
    if (!vrOk) reasons.push('valeur de reconstitution non fiable ou absente');
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: reasons.join(' ; '),
    };
  }

  const { prix, vr, note } = resolveComparableValues(extraction);

  if (prix == null || vr == null || vr <= 0) {
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: note ?? 'Valeurs comparables indisponibles.',
    };
  }

  if (extraction.division_nominale.detected && note?.includes('sans valeurs post-split')) {
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: note,
    };
  }

  const pct = ((prix - vr) / vr) * 100;
  const rounded = Math.round(pct * 100) / 100;

  if (Math.abs(rounded) > MAX_ECART_PCT) {
    return {
      computed: false,
      pct: null,
      label: null,
      formula: null,
      reason_if_skipped: `Écart ${rounded} % hors plage plausible (>|${MAX_ECART_PCT}| %) — vérification manuelle requise.`,
    };
  }

  let label: DecoteSurcoteResult['label'];
  if (rounded < -0.01) label = 'decote';
  else if (rounded > 0.01) label = 'surcote';
  else label = 'parite';

  const formula = `(prix_souscription ${prix} - valeur_reconstitution ${vr}) / valeur_reconstitution ${vr} × 100 = ${rounded} %`;

  return {
    computed: true,
    pct: rounded,
    label,
    formula: note ? `${formula} (${note})` : formula,
    reason_if_skipped: null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error('❌ DEEPSEEK_API_KEY absente — ajoutez-la dans .env.local');
    process.exit(1);
  }

  if (process.env.VITE_DEEPSEEK_API_KEY) {
    console.error('❌ VITE_DEEPSEEK_API_KEY détectée — supprimez-la.');
    process.exit(1);
  }

  const source = parseArgs(process.argv.slice(2));
  console.log(`📄 Source: ${source.type} → ${source.path}`);

  const documentText = await loadDocumentText(source);
  const truncated =
    documentText.length > 24_000
      ? `${documentText.slice(0, 24_000)}\n\n[… texte tronqué …]`
      : documentText;

  console.log(`📝 Texte chargé (${documentText.length} caractères)`);
  console.log('🤖 Extraction DeepSeek (task: extraction → deepseek-v4-pro)…');

  const { data, model, result } = await llmChatJson({
    task: 'extraction',
    schemaHint: SCHEMA_HINT,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extrais les indicateurs de souscription / reconstitution depuis ce document SCPI.\n\n---\n${truncated}\n---`,
      },
    ],
    maxTokens: 2048,
  });

  const parsed = LlmExtractionSchema.safeParse(data);
  if (!parsed.success) {
    console.error('❌ JSON LLM invalide (schéma Zod):');
    console.error(parsed.error.flatten());
    console.error('Brut:', result.content);
    process.exit(1);
  }

  const extraction = parsed.data;
  const decote_surcote = computeDecoteSurcote(extraction);

  const output: OutputPayload = {
    meta: {
      generated_at: new Date().toISOString(),
      provider: 'deepseek',
      model,
      task: 'extraction',
      source,
      tokens: result.usage?.total_tokens,
    },
    extraction,
    decote_surcote,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log('✅ Extraction terminée');
  console.log(`   SCPI: ${extraction.nom_scpi ?? '—'}`);
  console.log(
    `   Prix: ${extraction.prix_souscription.value ?? '—'} € | VR: ${extraction.valeur_reconstitution.value ?? '—'} € | Réalisation: ${extraction.valeur_realisation.value ?? '—'} €`
  );
  if (extraction.division_nominale.detected) {
    console.log(`   ⚠️  Division nominale détectée (ratio: ${extraction.division_nominale.ratio ?? '—'})`);
  }
  if (decote_surcote.computed) {
    console.log(`   Décote/surcote: ${decote_surcote.pct} % (${decote_surcote.label})`);
  } else {
    console.log(`   Décote/surcote: non calculée — ${decote_surcote.reason_if_skipped}`);
  }
  console.log(`📁 Résultat: ${OUTPUT_PATH}`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌ Échec extraction:', message);
  process.exit(1);
});
