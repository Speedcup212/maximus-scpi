# Maximus — agents autonomes avec exécution

Éric a autorisé l'installation le 05/10/2026, puis l'exécution : « oui, il faut qu'il y ai exécution. fait tout ce qui doit etre fait ».

Une seule automatisation ChatGPT Work orchestre CONTROL, DATA, ANALYST, SEARCH et QA, autour de **07 h et 18 h Europe/Paris**, aux horaires flexibles du planificateur. Ce ne sont pas cinq automatisations ni des processus permanents. DATA, ANALYST et SEARCH travaillent en parallèle si la délégation est disponible, sinon successivement avec mode journalisé. QA intervient ensuite indépendamment.

Le schéma privé `maximus_agents` conserve tâches, leases, tentatives, preuves et anomalies. Les workers Supabase existants gardent leur cadence ; les anciens backfills et déploiements quotidiens suspendus restent suspendus.

| Rôle | Mission réelle | Preuve attendue |
|---|---|---|
| CONTROL | Prioriser les issues, préparer les lots et reprises | Synthèse de corrections et blocages |
| DATA | Corriger sources, périodes, certifications et ingestion ciblées | PDF officiel, SQL avant/après, tests |
| ANALYST | Corriger calculs, trajectoires et présentation | Périodes/régimes comparables, cas limites, rendu |
| SEARCH | Corriger HTML, canonical, H1 et extractibilité | HTML généré, routes et tests ciblés |
| QA | Vérifier indépendamment les changements | Verdict par issue et tests reproduits |

Contrats sur branche candidate `agents/autonomous-control-20261005`. Vérifier explicitement la référence avant intervention ; main représente la production Git, pas nécessairement le dernier candidat. Les agents peuvent implémenter, tester et committer/pousser sur branche **agents/autonomous***. Aucun merge main ni publication automatique.

Lire `worker-contract.md` et `execution-contract.md`. Le scope et les critères des issues sont la source de vérité. L'autorisation couvre l'exécution ciblée, pas uniquement l'audit.

## Cycle SQL

```sql
select maximus_agents.prepare_execution();
select maximus_agents.prepare_cycle();
select * from maximus_agents.issue_dashboard;
select * from maximus_agents.claim_task('DATA');
-- audit : finish_task ; execute/verify : record_execution
select * from maximus_agents.dashboard;
```

Utiliser le lease_token retourné par claim_task. **Deux claims maximum par rôle et par jour Paris**, audits/exécutions/vérifications compris ; deux tentatives maximum par tâche ; une lease active par rôle. Une tâche par invocation. Ne pas contourner les plafonds avec une file locale. Exécutions prioritaires avant audits récurrents ; reprises bornées gérées par le runtime.

Une tâche d'audit terminée ne ferme pas une anomalie. Implémentation testée → implemented. QA indépendante → qa_pass pour code nécessitant publication ; SQL sans release → resolved après QA. Code resolved seulement après release effective et contrôle public documentés.

Aucun micro-déploiement, hook ou marqueur [deploy], [release], [hotfix], DEPLOY_NOW automatique. Aucun service/API IA payante supplémentaire, cron accéléré, retraitement général ou ressource cloud nouvelle. Les plafonds de tâches ne constituent pas un budget monétaire.

Installation : bootstrap.sql puis execution.sql. Tests transactionnels : verify.sql et contrôles d'exécution associés. Tables privées avec RLS, sans privilèges anon/authenticated ; fonctions SECURITY INVOKER. Aucun secret dans ces documents.

Préserver NULL, sources/périodes, régimes de liquidité et guards SQL. Sans Search Console, ne pas prétendre mesurer l'indexation. Sans PDF réellement nouveau, ne pas annoncer une ingestion nouvelle bout en bout.
