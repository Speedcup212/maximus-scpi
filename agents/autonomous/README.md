# Maximus — agents autonomes

Installation autorisée par Éric le 05/10/2026 : « met en place les agents autonomes ».

Ce dispositif complète les workers Supabase de découverte, extraction et certification déjà actifs. Il ne les recrée pas et ne réactive pas les anciens backfills rapides ni la publication automatique suspendue.

## Exécution

Les cinq rôles sont exécutés par une automatisation d'orchestration ChatGPT Work utilisant les connecteurs GitHub et Supabase. Le forfait courant autorise cinq tâches planifiées au total : quatre suivis étaient actifs, une seule place était disponible. Les agents DATA, ANALYST et SEARCH travaillent en parallèle lorsque les sous-agents sont disponibles dans l'exécution ; sinon CONTROL les exécute successivement et journalise ce mode. QA passe après leurs sorties terminales. Le schéma privé `maximus_agents` conserve tâches, tentatives, preuves et verdicts. Une fonction SQL prépare le cycle du jour ; les workers prennent une tâche exclusive. Les horaires sont ceux de Paris et les tâches sont relançables après interruption.

Le cycle planifié démarre le matin et reprend le soir les tentatives interrompues, dans les limites de deux claims par rôle et par jour. Il ne s'agit pas de processus IA tournant en permanence. Les workers Data Supabase et la surveillance horaire existante continuent leur propre cadence.

Programmation confirmée : matin autour de 07 h, soir autour de 18 h, fuseau Europe/Paris, horaires flexibles dans la fenêtre du planificateur. Le cycle d'installation a été lancé immédiatement en parallèle. La disponibilité future de la délégation est vérifiée à chaque exécution, pas supposée.

Les documents d'exploitation sont conservés sur la branche `agents/autonomous-control-20261005`. Le code métier inspecté reste celui de `main`. Aucun merge n'est nécessaire au fonctionnement des agents planifiés ; aucun code public ne fait partie de cette installation.

| Agent | Travail | Sortie |
|---|---|---|
| CONTROL | Prioriser, préparer le cycle, vérifier heartbeat/budgets et blocages | File persistante et synthèse |
| DATA | Contrôler 61 SCPI, sources, ingestion et jobs existants | Preuves, anomalie ou PASS |
| ANALYST | Contrôler data, gates, trajectoires et textes | Incohérences sourcées, propositions de correction |
| SEARCH | Contrôler pages publiques, canonical, robots, sitemap et extractibilité | Anomalies reproductibles, correctifs préparés |
| QA | Revoir les trois sorties indépendamment, contrôler release et limites | PASS / REVIEW / FAIL, sans déployer |

## Périmètre et garde-fous

- Les instructions historiques des agents restent applicables hors du périmètre d'installation autorisé ici.
- Écriture automatique : uniquement `agents/`, `tasks/` et le schéma privé `maximus_agents`.
- Lecture des données métiers, code et logs pour vérification ; aucune invention de donnée ou certification.
- Aucun agent ne modifie automatiquement `src/`, `public/`, les données métiers, les crons existants ni la configuration Netlify. Préparer les corrections sous `agents/` et les faire contrôler par QA ; les modifications sensibles restent soumises à leur autorisation existante.
- Aucun commit portant `[deploy]`, `[release]`, `[hotfix]` ou `DEPLOY_NOW`, aucun build hook, aucun deploy, aucun merge automatique.
- Aucun mail, message client ou recommandation personnalisée.
- Un seul agent actif par rôle, lease de 30 minutes, deux tentatives maximum par tâche, deux prises de tâche maximum par rôle et par jour de Paris.
- Pas de nouvel appel à une API IA payante, abonnement, ressource cloud ou dépendance. Les plafonds de tâches limitent le travail ; ils ne constituent pas un plafond monétaire des plateformes existantes.
- Un résultat sans preuve n'est jamais PASS. Une indisponibilité de connecteur est BLOCKED, pas un succès.
- Les anomalies et nouveaux travaux sont dédupliqués. Aucun retraitement des SCPI PASS sans régression.
- La couverture SEO publique ne prouve pas une indexation Google ; Search Console reste une preuve distincte.

## Entrées SQL

```sql
select maximus_agents.prepare_cycle();
select * from maximus_agents.claim_task('DATA');
select * from maximus_agents.claim_task('ANALYST');
select * from maximus_agents.claim_task('SEARCH');
select * from maximus_agents.claim_task('QA');
select maximus_agents.finish_task('<task_uuid>', '<lease_uuid>', 'done',
  '{"summary":"...","verdict":"PASS","evidence":[{"source":"...","observed_at":"...","finding":"..."}]}');
select * from maximus_agents.dashboard;
```

Toujours utiliser le `lease_token` renvoyé par `claim_task`. `finish_task` refuse un token obsolète ou expiré. Pour une erreur transitoire, terminer avec `failed` ; CONTROL libère un seul retry. Pour une dépendance indisponible, terminer avec `blocked` et expliquer la dépendance. QA ne peut prendre son travail avant les trois autres sorties terminales.

Installation reproductible : `bootstrap.sql`. Vérifications transactionnelles, sans travaux fictifs persistants : `verify.sql`. Les fichiers SQL sont des scripts internes à appliquer via le connecteur administrateur ; ils ne sont pas exposés à l'API publique et ne contiennent aucun secret.

Les tables privées ont RLS activée et aucun privilège pour anon/authenticated. L'avertissement Advisor « RLS enabled, no policies » est intentionnel : aucun accès client n'est souhaité, seul le connecteur administrateur exécute les fonctions SECURITY INVOKER.
