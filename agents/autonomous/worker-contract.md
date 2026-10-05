# Contrat commun d'exécution

1. Projet Supabase `ygvsddcpohsnaowofuwc`, repo `Speedcup212/maximus-scpi`, site `e4f16f87-663d-4965-8de8-00f6840f1aa7`.
2. Lire `agents/autonomous/README.md` et prendre sa tâche via `maximus_agents.claim_task(role)`. Si aucune tâche n'est disponible, arrêter sans message.
3. Une seule tâche par exécution, maximum cinq fichiers de projet nécessaires par mission. Les instructions du dépôt s'appliquent. Aucun accès aux secrets ni contenu client.
4. Collecter des preuves actuelles, distinguer certain/probable/à vérifier. Conserver les absences à NULL ; comparer uniquement les périodes comparables et les sources vérifiées.
5. Enregistrer le résultat structuré avec `finish_task` : summary, verdict, evidence (sources, observations, dates), findings et next_actions. Écrire les correctifs candidats sous `agents/autonomous/reports/` ou dans le résultat JSON ; ne pas modifier le site en production.
6. En cas d'incident, utiliser failed ou blocked. Ne pas réessayer dans la même exécution, ne pas demander de nouveaux droits au nom de l'automatisation.
7. Aucun déploiement Netlify, aucun merge/push de code public automatiquement. QA prépare la décision de release, sans action de publication.
8. Notifier uniquement une régression, un blocage réel ou un résultat nouveau utile ; la synthèse quotidienne est produite par CONTROL.
