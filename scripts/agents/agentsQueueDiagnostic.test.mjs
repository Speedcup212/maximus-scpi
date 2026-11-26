import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  buildQueueDiagnostic,
  buildInventoryQuery,
  auditRecordExecutionProvisioning,
  TASK_CLASSES,
  CLAIM_CONSUMERS,
} from './agentsQueueDiagnostic.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('le diagnostic classe chaque classe de tâche en claimable ou orpheline', () => {
  const d = buildQueueDiagnostic(REPO_ROOT, { now: '2026-11-26T08:30:00Z' });
  assert.equal(d.schemaVersion, 'agents-queue-diagnostic-v1');
  assert.equal(d.summary.classes_total, TASK_CLASSES.length);
  assert.equal(
    d.summary.classes_claimable + d.summary.classes_orphaned,
    d.summary.classes_total,
  );
  // Une classe est réclamable si et seulement si un workflow vivant l'appelle. Avoir un nom
  // de fonction de claim ne suffit pas : `claim_task` existe encore mais n'a plus d'appelant,
  // et une tâche qu'aucun workflow ne réclame reste orpheline.
  for (const c of TASK_CLASSES) {
    assert.equal(c.claimable, c.consumerWorkflow !== null, `${c.id} incohérent`);
  }
});

test('un lot multi-issues et les tâches QA/verify sont établis comme orphelins', () => {
  const d = buildQueueDiagnostic(REPO_ROOT);
  assert.ok(d.summary.orphaned_ids.includes('role_batch_execute'));
  assert.ok(d.summary.orphaned_ids.includes('qa_verify'));
});

test('le claim scoped ne peut pas réclamer un lot multi-issues : preuve dans la migration', () => {
  const sql = readFileSync(
    resolve(REPO_ROOT, 'supabase/migrations/20261016_deepseek_scoped_corrective_worker.sql'),
    'utf8',
  );
  // La fonction de claim exige exactement une issue…
  assert.match(sql, /cardinality\(x\.issue_ids\)=1/);
  // …et un mode d'exécution scoped, sur la ligne issue de la jointure.
  assert.match(sql, /i\.scope->>'execution_mode'='scoped_code_correction'/);
  // La production d'un lot multi-issues existe bien dans la même migration.
  assert.match(sql, /jsonb_build_object\('issues',payload,'authorization'/);
});

test('record_execution est référencé par le pont OIDC mais absent des migrations', () => {
  const p = auditRecordExecutionProvisioning(REPO_ROOT);
  assert.ok(p.referencedIn.includes('supabase/functions/maximus-search-agent-oidc/index.ts'));
  assert.deepEqual(p.definedIn, [], 'aucune migration ne doit définir record_execution');
  assert.equal(p.defined, false);
  // Il existe bien hors chaîne de migrations : c'est cette asymétrie qui est le défaut.
  assert.ok(p.definedOnlyOutsideMigrations.includes('agents/autonomous/execution.sql'));
});

test('le diagnostic n affirme jamais avoir lu la base', () => {
  const d = buildQueueDiagnostic(REPO_ROOT);
  assert.match(d.source, /repository-only/);
  assert.match(d.source, /aucune requête SQL/i);
});

test('la requête d inventaire est en lecture seule', () => {
  const q = buildInventoryQuery();
  assert.match(q, /select/i);
  for (const forbidden of ['insert ', 'update ', 'delete ', 'drop ', 'alter ', 'truncate ']) {
    assert.equal(
      q.toLowerCase().includes(forbidden),
      false,
      `la requête ne doit pas contenir ${forbidden.trim()}`,
    );
  }
  // Elle doit couvrir les trois familles demandées par le mandat.
  assert.match(q, /maximus_agents\.tasks/);
  assert.match(q, /watchdog_incidents/);
  assert.match(q, /maximus_agents\.runs/);
  assert.match(q, /heartbeat_at/);
});

test('chaque consommateur de claim nomme un workflow réel du dépôt', () => {
  for (const c of CLAIM_CONSUMERS) {
    const text = readFileSync(resolve(REPO_ROOT, c.workflow), 'utf8');
    assert.ok(text.length > 0, `${c.workflow} doit exister`);
    assert.ok(
      text.includes('claim') || text.includes(c.claimFunction.split('.').pop()),
      `${c.workflow} doit appeler un claim`,
    );
  }
});

test('aucun workflow n appelle claim_task : les audits du cycle n ont pas de consommateur', () => {
  const claude = readFileSync(resolve(REPO_ROOT, '.github/workflows/maximus-agent-parallel.yml'), 'utf8');
  const deepseek = readFileSync(resolve(REPO_ROOT, '.github/workflows/maximus-deepseek-search.yml'), 'utf8');
  for (const text of [claude, deepseek]) {
    assert.equal(/maximus_agents\.claim_task\s*\(/.test(text), false);
  }
});
