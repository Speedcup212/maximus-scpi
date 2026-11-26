/**
 * Diagnostic statique de la file d'exécution historique (`maximus_agents`).
 *
 * ## Pourquoi un outil *statique* et pas une requête
 *
 * Le mandat du 26/11 demande d'inventorier 11 tâches en attente, 4 incidents bloqués et
 * l'absence d'exécution sur 24 h, puis de distinguer l'obsolète du nécessaire. Cursor n'a
 * **aucun jeton Supabase** : la lecture réelle de la base est impossible ici. En revanche,
 * une bonne part du diagnostic est *structurelle* : elle se déduit des définitions SQL et
 * des workflows présents dans le dépôt. C'est ce que cet outil produit, de façon
 * reproductible et citable, sans jamais prétendre avoir lu la base.
 *
 * ## Le défaut qu'il établit
 *
 * L'inventaire d'un système d'exécution doit répondre à une question simple : **qui peut
 * réclamer cette tâche ?** Une tâche qu'aucun consommateur ne peut réclamer n'est pas
 * « en attente », elle est **orpheline**. Elle gonfle le compteur `pending_tasks`, fait
 * croire le système occupé, et explique un watchdog `IDLE` alors que des tâches existent.
 *
 * L'outil croise donc, pour chaque classe de tâche produite par `prepare_execution` et
 * `prepare_cycle`, les fonctions de claim et les workflows qui les appellent, et classe la
 * classe en `CLAIMABLE` ou `ORPHANED`.
 *
 * ## Ce qu'il ne fait pas
 *
 *  - il n'exécute aucune requête SQL, ne modifie aucun état, ne ferme aucun incident ;
 *  - il ne relance aucun worker ;
 *  - il ne prétend pas identifier les 11 tâches par UUID : cela exige la base. Il énonce la
 *    requête exacte à exécuter et les critères de succès (voir `buildInventoryQuery`).
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Chemin du helper d'exécution contenant `record_execution`. */
export const EXECUTION_SQL = 'agents/autonomous/execution.sql';

/** Workflows qui appellent réellement une fonction de claim SQL. */
export const CLAIM_CONSUMERS = Object.freeze([
  {
    workflow: '.github/workflows/maximus-deepseek-search.yml',
    claimFunction: 'maximus_agents.claim_scoped_corrective_task',
    kinds: ['execute'],
    modes: ['scoped_code_correction'],
    reachable: true,
    note: 'Seul consommateur d\'exécution actif. Exige exactement 1 issue et '
      + 'execution_mode=scoped_code_correction avec exactement 1 fichier.',
  },
  {
    workflow: '.github/workflows/maximus-agent-parallel.yml',
    claimFunction: 'maximus_agents.claim_parallel_audit_task',
    kinds: ['audit'],
    modes: ['parallel_readonly_audit', 'candidate_documentary_audit'],
    reachable: true,
    note: 'Audits en lecture seule uniquement : refuse les kind=execute/verify.',
  },
  {
    workflow: '.github/workflows/maximus-agent-parallel.yml',
    claimFunction: 'maximus_agents.claim_candidate_batch20_task',
    kinds: ['audit'],
    modes: ['candidate_documentary_audit'],
    reachable: true,
    note: 'Cohorte candidate20 uniquement, via batch_claim.',
  },
  {
    workflow: '.github/workflows/maximus-agent-parallel.yml',
    claimFunction: 'maximus_agents.claim_existing_strict_evidence_v1',
    kinds: ['audit'],
    modes: ['existing_strict_evidence'],
    reachable: true,
    note: 'Preuves strictes existantes uniquement.',
  },
]);

/**
 * Classes de tâches que les producteurs SQL créent, et qui doit les réclamer.
 *
 * `claimedBy: null` signifie qu'aucun consommateur vivant n'existe dans le dépôt : c'est la
 * définition d'une classe orpheline, et la cause probable d'un `pending_tasks` durablement
 * non nul sans exécution.
 */
export const TASK_CLASSES = Object.freeze([
  {
    id: 'scoped_corrective_execute',
    producer: 'prepare_execution (branche scoped_code_correction)',
    role: 'DATA/SEARCH',
    kind: 'execute',
    titleExample: 'Correction DeepSeek ciblée : …',
    claimedBy: 'maximus_agents.claim_scoped_corrective_task',
    consumerWorkflow: '.github/workflows/maximus-deepseek-search.yml',
    claimable: true,
    note: 'Seule classe d\'exécution réellement servie. Dépend d\'un issue '
      + 'execution_mode=scoped_code_correction qui n\'existe pas par défaut.',
  },
  {
    id: 'role_batch_execute',
    producer: 'prepare_execution (boucle DATA/ANALYST/SEARCH)',
    role: 'DATA/ANALYST/SEARCH',
    kind: 'execute',
    titleExample: 'Implémenter le lot de corrections autorisées …',
    claimedBy: null,
    consumerWorkflow: null,
    claimable: false,
    note: 'Regroupe PLUSIEURS issues en une tâche. `claim_scoped_corrective_task` exige '
      + 'cardinality(issue_ids)=1 et un execution_mode scoped : il ne peut structurellement '
      + 'pas la réclamer. `claim_parallel_audit_task` exige kind=audit. Classe ORPHELINE.',
  },
  {
    id: 'qa_verify',
    producer: 'prepare_execution (branche QA) et prepare_cycle',
    role: 'QA',
    kind: 'verify',
    titleExample: 'Vérifier les corrections implémentées …',
    claimedBy: null,
    consumerWorkflow: null,
    claimable: false,
    note: 'Aucun workflow n\'appelle une fonction de claim pour kind=verify. '
      + 'Classe ORPHELINE, en plus d\'être bloquée par depends_on non satisfaites.',
  },
  {
    id: 'daily_role_audit',
    producer: 'prepare_cycle (boucle DATA/ANALYST/SEARCH)',
    role: 'DATA/ANALYST/SEARCH',
    kind: 'audit',
    titleExample: 'Contrôler données et pipeline des 61 SCPI',
    claimedBy: 'maximus_agents.claim_task',
    consumerWorkflow: null,
    claimable: false,
    note: '`prepare_cycle` s\'arrête avant de les créer dès que des execute/verify '
      + 'attendent (PENDING_EXECUTION_FIRST), donc cette classe n\'est pas la source du '
      + 'compteur. Surtout, `claim_task` n\'a plus aucun appelant workflow : la fonction '
      + 'existe mais n\'a pas de consommateur actif.',
  },
  {
    id: 'daily_qa_audit',
    producer: 'prepare_cycle (tâche QA du jour)',
    role: 'QA',
    kind: 'audit',
    titleExample: 'Revoir résultats indépendants et décision de release',
    claimedBy: 'maximus_agents.claim_task',
    consumerWorkflow: null,
    claimable: false,
    note: 'Même remarque : `claim_task` n\'est plus appelée par aucun workflow.',
  },
]);

/**
 * Détecte si le helper `record_execution` est présent dans la chaîne de migrations.
 *
 * Le pont OIDC appelle `maximus_agents.record_execution(...)` à chaque écriture de
 * résultat. Si la fonction n'existe dans aucune migration appliquée, alors **tout claim
 * réussi finit en HTTP 422** : le worker ne peut pas enregistrer son issue, la tâche reste
 * `running` jusqu'à expiration du bail, puis est bloquée. C'est un défaut de cohérence
 * structurel, indépendant de la qualité du travail produit.
 *
 * @param {string} repoRoot
 * @returns {{defined: boolean, definedIn: string[], referencedIn: string[]}}
 */
export function auditRecordExecutionProvisioning(repoRoot) {
  const definedIn = [];
  const referencedIn = [];
  const candidates = [
    'agents/autonomous/execution.sql',
    'agents/autonomous/bootstrap.sql',
    'agents/autonomous/verify-execution.sql',
  ];
  for (const rel of candidates) {
    const p = join(repoRoot, rel);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    if (/function\s+maximus_agents\.record_execution\s*\(/i.test(text)) definedIn.push(rel);
  }
  // Les migrations sont la seule chaîne appliquée en base.
  const migrationsDir = join(repoRoot, 'supabase', 'migrations');
  const migrationsDefine = [];
  if (existsSync(migrationsDir)) {
    for (const f of readdirSync(migrationsDir)) {
      if (!f.endsWith('.sql')) continue;
      const text = readFileSync(join(migrationsDir, f), 'utf8');
      if (/function\s+maximus_agents\.record_execution\s*\(/i.test(text)) {
        migrationsDefine.push(`supabase/migrations/${f}`);
      }
    }
  }
  for (const rel of ['supabase/functions/maximus-search-agent-oidc/index.ts']) {
    const p = join(repoRoot, rel);
    if (existsSync(p) && readFileSync(p, 'utf8').includes('record_execution')) {
      referencedIn.push(rel);
    }
  }
  return {
    defined: migrationsDefine.length > 0,
    definedIn: migrationsDefine,
    definedOnlyOutsideMigrations: definedIn,
    referencedIn,
  };
}

/**
 * Construit le diagnostic complet, à partir du dépôt seul.
 *
 * @param {string} repoRoot
 * @param {{now?: string}} [options]
 * @returns {object}
 */
export function buildQueueDiagnostic(repoRoot, options = {}) {
  const provisioning = auditRecordExecutionProvisioning(repoRoot);
  const claimable = TASK_CLASSES.filter((c) => c.claimable);
  const orphaned = TASK_CLASSES.filter((c) => !c.claimable);

  return {
    schemaVersion: 'agents-queue-diagnostic-v1',
    generatedAt: options.now ?? new Date().toISOString(),
    source: 'repository-only (aucune requête SQL, aucun jeton Supabase)',
    recordExecution: provisioning,
    claimConsumers: CLAIM_CONSUMERS,
    classes: TASK_CLASSES,
    summary: {
      classes_total: TASK_CLASSES.length,
      classes_claimable: claimable.length,
      classes_orphaned: orphaned.length,
      orphaned_ids: orphaned.map((c) => c.id),
    },
    /**
     * Conclusion honnête : un `pending_tasks` non nul avec `RUNNING` absent est cohérent
     * avec un orphelinage, mais seule la base peut confirmer la répartition réelle.
     */
    interpretation: [
      'Seules les tâches kind=execute portant exactement 1 issue en execution_mode '
        + 'scoped_code_correction peuvent être réclamées aujourd\'hui.',
      'Les lots multi-issues (role_batch_execute) et toutes les tâches QA/verify n\'ont '
        + 'aucun consommateur : elles restent pending indéfiniment.',
      provisioning.defined === false
        ? 'record_execution n\'est défini dans aucune migration appliquée : le pont OIDC '
          + 'échouerait en 422 après un claim réussi.'
        : 'record_execution est défini dans la chaîne de migrations.',
      'Un run vert sans tâche (NO-OP) ne prouve aucun cycle métier : il faut lire le motif.',
    ],
  };
}

/**
 * Requête de lecture exacte à exécuter par la session interactive pour finaliser
 * l'inventaire par UUID (impossible depuis Cursor, faute de jeton).
 *
 * @returns {string} SQL en lecture seule.
 */
export function buildInventoryQuery() {
  return [
    '-- Lecture seule. Aucune écriture, aucune fermeture d\'incident.',
    'select t.id, t.role, t.kind, t.status, t.attempts, t.lease_until,',
    '       t.cycle_date, t.dedupe_key,',
    '       cardinality(t.issue_ids) as issue_count,',
    '       (t.depends_on is not null and cardinality(t.depends_on) > 0) as has_deps,',
    '       t.payload->>\'mode\' as mode,',
    '       t.payload->>\'batch_mode\' as batch_mode,',
    '       t.created_at, t.updated_at',
    '  from maximus_agents.tasks t',
    ' where t.status in (\'pending\',\'running\',\'blocked\')',
    ' order by t.status, t.priority, t.created_at;',
    '',
    '-- Incidents actifs : cause, occurrences, dernière observation.',
    'select incident_code, active, occurrences, last_seen, resolved_at,',
    '       evidence->>\'runner_state\' as runner_state,',
    '       evidence->>\'worker_heartbeat\' as worker_heartbeat',
    '  from maximus_agents.watchdog_incidents',
    ' order by active desc, last_seen desc;',
    '',
    '-- Heartbeats : quels rôles sont réellement vivants.',
    'select role, enabled, heartbeat_at,',
    '       (now() - heartbeat_at) as age',
    '  from maximus_agents.agents',
    ' order by role;',
    '',
    '-- Exécutions sur 24 h : prouve ou infirme « aucune exécution ».',
    'select r.role, r.status, count(*), max(r.started_at) as last_started',
    '  from maximus_agents.runs r',
    ' where r.started_at > now() - interval \'24 hours\'',
    ' group by r.role, r.status',
    ' order by r.role, r.status;',
  ].join('\n');
}
