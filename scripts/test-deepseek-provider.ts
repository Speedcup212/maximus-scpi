/**
 * test-deepseek-provider.ts
 * Smoke test for DeepSeek integration (server-side only).
 *
 * Usage: npx tsx scripts/test-deepseek-provider.ts
 *
 * Requires DEEPSEEK_API_KEY in .env.local (never VITE_DEEPSEEK_API_KEY).
 */

import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { DEEPSEEK_MODELS } from '../src/ai/providers/deepseek';
import { llmChatJson } from '../src/ai/llmRouter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

config({ path: join(root, '.env.local') });
config({ path: join(root, '.env') });

const TestResponseSchema = z.object({
  ok: z.literal(true),
  provider: z.literal('deepseek'),
  model: z.string(),
  message: z.string(),
  ready_for_scpi_extraction: z.boolean(),
});

async function main(): Promise<void> {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error('❌ DEEPSEEK_API_KEY absent — ajoutez-la dans .env.local');
    process.exit(1);
  }

  if (process.env.VITE_DEEPSEEK_API_KEY) {
    console.error('❌ VITE_DEEPSEEK_API_KEY détectée — supprimez-la (clé serveur uniquement).');
    process.exit(1);
  }

  console.log('🔌 Test DeepSeek provider…');
  console.log(`   baseURL: https://api.deepseek.com`);
  console.log(`   modèle rapide: ${DEEPSEEK_MODELS.flash}`);
  console.log(`   modèle raisonnement: ${DEEPSEEK_MODELS.pro}`);

  const { data, model, result } = await llmChatJson({
    task: 'fast',
    schemaHint:
      'Return {"ok":true,"provider":"deepseek","model":"<model_name>","message":"<short French confirmation>","ready_for_scpi_extraction":true}',
    messages: [
      {
        role: 'user',
        content:
          'Confirme que le provider DeepSeek est opérationnel pour MaximusSCPI. Réponds en JSON uniquement.',
      },
    ],
    maxTokens: 256,
  });

  const parsed = TestResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error('❌ Réponse JSON invalide (schéma Zod):');
    console.error(parsed.error.flatten());
    console.error('Contenu brut:', result.content);
    process.exit(1);
  }

  console.log('✅ Réponse JSON valide:');
  console.log(JSON.stringify(parsed.data, null, 2));
  console.log(`   modèle utilisé: ${model}`);
  if (result.usage?.total_tokens != null) {
    console.log(`   tokens: ${result.usage.total_tokens}`);
  }
  console.log('✅ DeepSeek prêt pour les extractions SCPI (scripts Node / ingestion).');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌ Échec du test DeepSeek:', message);
  process.exit(1);
});
