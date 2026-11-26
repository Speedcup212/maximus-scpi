import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  buildQueueDiagnostic,
  buildInventoryQuery,
  disposeTasks,
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

test('record_execution est défini hors migrations : l hypothèse d absence est REFUTÉE', () => {
  // Le contrôle indépendant du 26/11 a exécuté `pg_proc ⋈ pg_namespace` en production :
  // exactement 1 fonction `maximus_agents.record_execution` existe. L'hypothèse d'une
  // fonction absente (donc d'un 422 après chaque claim) est donc écartée, et ce test ne
  // doit plus l'affirmer. Ce qui reste vrai — et vérifiable depuis le dépôt seul — est que
  // la seule définition se trouve dans `agents/autonomous/execution.sql`, hors de la chaîne
  // `supabase/migrations/`. C'est une **asymétrie de dépôt**, pas une preuve d'absence en base.
  const p = auditRecordExecutionProvisioning(REPO_ROOT);
  assert.ok(p.referencedIn.includes('supabase/functions/maximus-search-agent-oidc/index.ts'));
  assert.deepEqual(p.definedIn, [], 'aucune migration ne définit record_execution');
  assert.ok(p.definedOnlyOutsideMigrations.includes('agents/autonomous/execution.sql'));
  // La conclusion publiée ne doit pas trancher ce que le dépôt ne peut pas observer.
  assert.equal(p.defined, false);
  assert.match(p.note, /production|refut|inobservable/i);
});

test('la disposition par tâche applique l inventaire réel du 26/11 sans muter l état', () => {
  // Inventaire fourni par le contrôle indépendant : 7 audit (2 DATA, 5 QA), 3 verify QA,
  // 1 execute ANALYST (une issue mais execution_mode NULL). Aucune tâche ne porte le scope
  // correctif : c'est la conclusion à opposer à « pending_tasks = charge de travail ».
  const inventory = [
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `audit-data-${i}`, role: 'DATA', kind: 'audit', status: 'pending', issue_count: 0,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `audit-qa-${i}`, role: 'QA', kind: 'audit', status: 'pending', issue_count: 0,
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `verify-qa-${i}`, role: 'QA', kind: 'verify', status: 'pending', issue_count: 0,
    })),
    {
      id: 'ca1cc7be-2e80-43dd-afc6-42f01e069951',
      role: 'ANALYST',
      kind: 'execute',
      status: 'pending',
      issue_count: 1,
      mode: null,
    },
  ];
  const d = disposeTasks(inventory);
  assert.equal(d.summary.total, 11);
  assert.equal(d.summary.historicalBlocked, 0);
  // Le seul execute a bien une issue, mais pas le mode scoped : inéligible, pas « en attente ».
  assert.equal(d.summary.claimable, 0);
  assert.equal(d.summary.byDisposition.ORPHANED_DAILY_AUDIT, 7);
  assert.equal(d.summary.byDisposition.ORPHANED_QA_VERIFY, 3);
  assert.equal(d.summary.byDisposition.EXECUTE_MISSING_SCOPE, 1);
  // Aucune disposition n'écrit en base.
  assert.equal(d.summary.mutatesState, false);
  const exec = d.tasks.find((t) => t.id === 'ca1cc7be-2e80-43dd-afc6-42f01e069951');
  assert.match(exec.action, /scoped_code_correction/);
  // Une QA financière ne doit jamais être requalifiée en correction de code.
  const verify = d.tasks.find((t) => t.kind === 'verify');
  assert.match(verify.rationale, /PAS une correction de code/);
});

test('une tâche bloquée reste un fait historique, distinct d un incident actif', () => {
  const d = disposeTasks([
    { id: 'b1', role: 'QA', kind: 'verify', status: 'blocked', issue_count: 1 },
  ]);
  assert.equal(d.summary.historicalBlocked, 1);
  assert.equal(d.tasks[0].disposition, 'HISTORICAL_BLOCKED_KEEP');
  assert.equal(d.summary.claimable, 0);
  assert.equal(d.summary.mutatesState, false);
});

test('une issue réellement scopée est la seule forme déclarée réclamable', () => {
  const d = disposeTasks([
    { id: 'ok', role: 'DATA', kind: 'execute', status: 'pending', issue_count: 1, mode: 'scoped_code_correction' },
    { id: 'multi', role: 'DATA', kind: 'execute', status: 'pending', issue_count: 3, mode: 'scoped_code_correction' },
  ]);
  assert.equal(d.tasks.find((t) => t.id === 'ok').disposition, 'CLAIMABLE');
  assert.equal(d.tasks.find((t) => t.id === 'multi').disposition, 'EXECUTE_MISSING_SCOPE');
  assert.equal(d.summary.claimable, 1);
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

test('une tâche execute hors scope exige d établir la nécessité métier avant requalification', () => {
  const d = disposeTasks([
    { id: 'ca1cc7be-2e80-43dd-afc6-42f01e069951', role: 'ANALYST', kind: 'execute', status: 'pending', issue_count: 1, mode: null },
  ]);
  const t = d.tasks[0];
  assert.equal(t.disposition, 'EXECUTE_MISSING_SCOPE');
  // Arbitrage du 26/11 : la nécessité métier précède la requalification, pas l'inverse.
  assert.equal(t.prerequisite, 'BUSINESS_NEED_ESTABLISHED');
  assert.match(t.action, /NÉCESSITÉ MÉTIER/);
  assert.match(t.action, /UN fichier exact/);
  // Et la disposition reste non mutante : rien n'est écrit en base depuis Cursor.
  assert.equal(t.mutatesState, false);

  // Une tâche réellement scopée n'a pas de prérequis : elle est prête à être réclamée.
  const ok = disposeTasks([
    { id: 'ok', role: 'DATA', kind: 'execute', status: 'pending', issue_count: 1, mode: 'scoped_code_correction' },
  ]).tasks[0];
  assert.equal(ok.disposition, 'CLAIMABLE');
  assert.equal(ok.prerequisite, null);
});
