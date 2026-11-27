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
 * résultat. Depuis le dépôt seul, on observe une **asymétrie** : la seule définition se
 * trouve dans `agents/autonomous/execution.sql`, qui n'est pas une migration.
 *
 * Cette asymétrie avait conduit à l'hypothèse « la fonction n'existe pas en base, donc tout
 * claim réussi finirait en HTTP 422 ». Le contrôle indépendant du 26/11 l'a **réfutée** :
 * `pg_proc ⋈ pg_namespace` renvoie exactement 1 fonction en production. L'outil ne doit donc
 * plus présenter l'asymétrie de dépôt comme une panne. Elle reste un **risque de
 * reproductibilité** — un environnement recréé depuis les migrations seules n'aurait pas la
 * fonction — ce qui est une conclusion plus faible, mais exacte et vérifiable ici.
 *
 * @param {string} repoRoot
 * @returns {{defined: boolean, definedIn: string[], referencedIn: string[], note: string}}
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
    // Ce que l'audit peut affirmer depuis le dépôt, et ce que la production a réfuté.
    note: migrationsDefine.length > 0
      ? 'record_execution est défini dans la chaîne de migrations.'
      : 'record_execution n\'est défini que hors de la chaîne de migrations. La production a '
        + 'été contrôlée le 26/11 (pg_proc ⋈ pg_namespace) : 1 fonction existe, donc l\'absence '
        + 'est RÉFUTÉE. Reste un risque de reproductibilité pour un environnement recréé depuis '
        + 'les migrations seules — à ne pas confondre avec un 422 observé.',
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
        ? 'record_execution n\'est défini que hors chaîne de migrations. Sa présence en '
          + 'production a été vérifiée le 26/11 (1 fonction dans pg_proc) : l\'hypothèse d\'un '
          + '422 par absence est réfutée. L\'asymétrie reste un risque de reproductibilité, pas '
          + 'une explication des incidents observés.'
        : 'record_execution est défini dans la chaîne de migrations.',
      'Un run vert sans tâche (NO-OP) ne prouve aucun cycle métier : il faut lire le motif.',
    ],
  };
}

/**
 * Disposition **par tâche**, à partir de l'inventaire fourni par le contrôle indépendant.
 *
 * L'arbitrage du 26/11 donne la répartition réelle des 11 tâches en attente — 7 audits
 * (2 DATA, 5 QA), 3 verify QA, 1 execute ANALYST — et demande une disposition par ID, sans
 * mutation ni fermeture artificielle. Une tâche n'est donc plus jugée par sa classe seule :
 * elle est jugée sur son scope réel.
 *
 * Aucune de ces dispositions n'écrit en base. Elles disent **ce qu'il faudrait faire**, à qui
 * appartient la décision, et pourquoi : c'est ce qui évite de convertir une tâche QA financière
 * en simple correction de code.
 *
 * @param {Array<object>} tasks Lignes d'inventaire (id, role, kind, status, …).
 * @returns {{tasks: Array<object>, summary: object}}
 */
export function disposeTasks(tasks = []) {
  const disposed = tasks.map((t) => {
    const id = t?.id ?? null;
    const role = t?.role ?? null;
    const kind = t?.kind ?? null;
    const status = t?.status ?? null;
    const issueCount = Number.isInteger(t?.issue_count) ? t.issue_count : null;
    const mode = t?.mode ?? null;
    const hasDeps = t?.has_deps === true;

    // Une tâche déjà `blocked` est un fait historique : sa cause doit être établie avant
    // toute nouvelle tentative, et elle ne doit pas être confondue avec un incident actif.
    if (status === 'blocked') {
      return {
        id,
        role,
        kind,
        disposition: 'HISTORICAL_BLOCKED_KEEP',
        action: 'Établir la cause (bail expiré, 422, dépendance) avant toute relance.',
        owner: 'interactive-session',
        mutatesState: false,
        rationale: 'Une tâche bloquée n\'est pas un incident actif : la fermer maintenant '
          + 'effacerait la preuve de la cause.',
      };
    }

    // Les tâches que le claim ne peut structurellement pas servir restent en attente
    // indéfiniment : les relancer ne produirait rien.
    if (kind === 'verify') {
      return {
        id,
        role,
        kind,
        disposition: 'ORPHANED_QA_VERIFY',
        action: 'Ne pas relancer : aucun workflow ne réclame kind=verify. Réécrire la '
          + 'vérification attendue en issue scoped_code_correction à 1 fichier si elle est '
          + 'encore nécessaire, sinon documenter la clôture avec motif.',
        owner: 'interactive-session',
        mutatesState: false,
        rationale: 'Une QA financière n\'est PAS une correction de code : la requalifier '
          + 'serait un affaiblissement du contrôle.',
      };
    }

    if (kind === 'audit') {
      return {
        id,
        role,
        kind,
        disposition: 'ORPHANED_DAILY_AUDIT',
        action: hasDeps
          ? 'Dépendances non satisfaites : la tâche ne peut pas être réclamée avant elles.'
          : 'Ne pas relancer : `claim_task` n\'a plus d\'appelant workflow.',
        owner: 'interactive-session',
        mutatesState: false,
        rationale: 'Un audit récurrent sans consommateur gonfle `pending_tasks` sans produire '
          + 'de travail.',
      };
    }

    // Le seul cas admissible : une issue exactement scopée. Le contrôle a constaté qu'aucune
    // tâche ne porte ce scope — dont l'unique execute, dont `execution_mode` est NULL.
    if (kind === 'execute') {
      const scoped = issueCount === 1 && mode === 'scoped_code_correction';
      return {
        id,
        role,
        kind,
        disposition: scoped ? 'CLAIMABLE' : 'EXECUTE_MISSING_SCOPE',
        action: scoped
          ? 'Laisser worker la réclamer.'
          : `Établir la NÉCESSITÉ MÉTIER avant toute requalification (issue encore utile ?), `
            + `puis, seulement si oui, identifier UN fichier exact et ajouter `
            + `execution_mode='scoped_code_correction' avec 1 issue `
            + `(constaté : ${issueCount ?? '?'} issue(s), mode=${mode ?? 'NULL'}).`,
        owner: scoped ? 'worker' : 'interactive-session',
        mutatesState: false,
        // L'arbitrage du 26/11 interdit de requalifier avant d'avoir établi la nécessité :
        // une tâche orpheline utile se requalifie, une tâche devenue inutile se clôt.
        prerequisite: scoped ? null : 'BUSINESS_NEED_ESTABLISHED',
        rationale: '`claim_scoped_corrective_task` exige 1 issue ET le mode scoped : sans les '
          + 'deux, la tâche est inéligible par construction, pas par charge.',
      };
    }

    return {
      id,
      role,
      kind,
      disposition: 'UNKNOWN_KIND',
      action: 'Classer avant décision : le kind n\'est pas reconnu par le diagnostic.',
      owner: 'interactive-session',
      mutatesState: false,
      rationale: 'Aucune conclusion ne doit être tirée d\'une ligne non classée.',
    };
  });

  const byDisposition = {};
  for (const d of disposed) byDisposition[d.disposition] = (byDisposition[d.disposition] ?? 0) + 1;

  return {
    tasks: disposed,
    summary: {
      total: disposed.length,
      byDisposition,
      // Compté séparément : une tâche bloquée n'est pas un incident actif.
      historicalBlocked: disposed.filter((d) => d.disposition === 'HISTORICAL_BLOCKED_KEEP').length,
      claimable: disposed.filter((d) => d.disposition === 'CLAIMABLE').length,
      // Aucune disposition n'écrit en base : c'est une garantie, pas une intention.
      mutatesState: disposed.some((d) => d.mutatesState === true),
    },
  };
}

/**
 * Requête de lecture exacte à exécuter par la session interactive pour finaliser
 * l'inventaire par UUID (impossible depuis Cursor, faute de jeton).
 *
 * @returns {string} SQL en lecture seule.
 */
export function buildInventoryQuery() {  return [
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
