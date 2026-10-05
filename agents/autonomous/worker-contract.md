# Contrat commun des workers

1. Projet Supabase ygvsddcpohsnaowofuwc, dépôt Speedcup212/maximus-scpi, site e4f16f87-663d-4965-8de8-00f6840f1aa7. Lire README et execution-contract sur branche candidate explicitement référencée, puis instructions du dépôt.
2. Prendre personnellement sa tâche via maximus_agents.claim_task(role). Aucune ligne : arrêter honnêtement. Une tâche par invocation ; deux claims maximum/jour Paris, audits et exécutions compris. Ne pas contourner leases, budgets ou dépendances.
3. kind=audit : collecter preuves et enregistrer/dédupliquer les anomalies dans maximus_agents.issues. kind=execute : **implémenter réellement** le scope, exécuter les tests et conserver référence vérifiable. kind=verify : QA indépendante.
4. Autorisation Éric du 05/10 : code candidat, tests, commits/push sur branche agents/autonomous* et SQL métier ciblé sourcé. Pas d'élargissement non justifié, secret/contenu client, message externe, nouvel achat, cron rapide, retraitement payant massif ou publication automatique.
5. Préserver NULL ; distinguer marché secondaire/file de retraits/changements de régime ; comparer des périodes homogènes ; lier texte, période et source. Aucune métrique, certification ou PASS inventé.
6. Audits : finish_task. Exécutions/vérifications : **record_execution**, avec id/token, status done/failed/blocked et JSON summary, verdict, evidence datées, tests nommés PASS, implementation_reference pour implémentation PASS. QA ajoute issue_verdicts pour toutes les issues. Ne pas appeler finish_task directement pour contourner les contrôles d'exécution.
7. Tâche terminée ≠ issue résolue. Execute PASS → implemented. QA PASS → qa_pass si publication requise ; SQL sans release → resolved après QA. Code resolved exige publication et contrôle public prouvés. Conserver les anciens échecs.
8. Dépendance manquante : blocked avec cause/étape suivante. Erreur transitoire : failed, aucun retry local ni demande de droits nouveaux au nom de l'automatisation. CONTROL coordonne les reprises bornées.
9. Aucun deploy Netlify, hook, merge main ou marqueur de release automatique. Regrouper dans un candidat QA. HTTP/cron réussi ne prouve ni ingestion nouvelle certifiée ni publication.
10. Notifier corrections réelles, anomalies nouvelles ou blocages utiles. CONTROL synthétise ; un audit inchangé ne devient pas une avancée.
