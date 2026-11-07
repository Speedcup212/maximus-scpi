# RECOVERY-115 — DeepSeek API : preuve d'identité, file existante et coût borné

**Projet** : MaximusSCPI · dépôt `Speedcup212/maximus-scpi` · Supabase `ygvsddcpohsnaowofuwc` · PR industrielle de certification #292.

## Faits vérifiés le 6 novembre 2026 (Europe/Paris)

- Le compte DeepSeek Platform montré par le propriétaire dispose d'un solde API de **29,85 $** ; la vue « Last 30 days » affiche **60 requêtes**, **618 323 tokens**, **0,04 $**. Il s'agit de la vue de compte, pas de l'utilisation du runner GitHub.
- Le workflow existant `.github/workflows/maximus-deepseek-search.yml`, run [#42098223703](https://github.com/Speedcup212/maximus-scpi/actions/runs/42098223703), a été exécuté le 05/11/2026 à 19:53 UTC : **SUCCESS**. La vérification `test -n "$DEEPSEEK_API_KEY"` a passé. L'étape OIDC a renvoyé **`no_eligible_scoped_task_or_daily_budget`**, **zéro appel modèle**. La seule présence d'un secret non vide ne prouve pas qu'il est toujours autorisé par DeepSeek.
- La requête Supabase sur `maximus_agents.issues` renvoie **zéro issue open** pour le correcteur mono-fichier DATA/SEARCH. Les issues `in_progress`, `implemented` ou `blocked` conservent leur statut, sans réouverture artificielle.
- Les cinq rôles dans `maximus_agents.agents` demeurent configurés `enabled=true`. Les audits manuels `RECOVERY-114` ont actualisé les heartbeats et fait tomber `AI_WORKERS_STALLED` à `active=false` : **ce n'est pas une preuve d'exécuteur modèle autonome**. `SCPI_STRICT_FAILURES` reste actif : 35 échecs sur le référentiel contrôlé de 68.
- L'ancien pont Supabase `maximus-search-agent-oidc` n'accepte que l'instance officielle du workflow de `main` ; le runner ne fusionne et ne publie jamais automatiquement.
- Les fonctions `prepare_execution()`, `claim_scoped_corrective_task()` et `record_execution()` restent la **file et le système de baux** existants. Ne créer aucun orchestrateur parallèle.
- Les modèles DeepSeek officiellement pris en charge comprennent `deepseek-flash` (V4.1-Flash-1017) et `deepseek-v4-pro`. Référence : https://api-docs.deepseek.com/updates/ et https://api-docs.deepseek.com/api/list-models/.

## Corrections de cette PR (aucun frais d'inférence)

1. Ajouter `scripts/agents/deepseekApiPreflight.mjs`. Il envoie **une unique requête GET authentifiée** vers `https://api.deepseek.com/models`, vérifie un JSON `object=list` avec `id=deepseek-flash` et retourne uniquement un état sûr. Ni prompt, ni inférence, ni tokens générés ; aucun secret ou corps d'erreur journalisé.
2. Appeler ce contrôle **avant** `claim_scoped_corrective_task()`. Une clé révoquée ou un modèle inaccessible provoque une erreur explicite **avant qu'un bail de tâche soit pris**.
3. Conserver le comportement exact `NO_ELIGIBLE` : les planifications GitHub doivent prouver la disponibilité sans fabriquer de mission, ni utiliser de tokens, ni créer de PR.
4. Tests unitaires négatifs (clé absente, 401, JSON invalide, modèle absent), tests de contrat GitHub et workflow historique conservés ; aucun secret API ajouté au dépôt ou exposé à une PR non fiable.
5. Aucun élargissement de scope, aucun changement Supabase financier, aucun déploiement Netlify, aucun merge vers `main`.

## Ce que cette PR ne prouve pas

- **Une vraie requête de modèle DeepSeek** a été facturée depuis GitHub : non, car aucune issue éligible n'existe.
- La clé est valide : la preuve `GET /models` n'aura lieu **en production** qu'après revue/merge de cette PR ou exécution contrôlée du script dans un environnement ayant ce secret.
- Les cinq rôles sont des workers IA autonomes : non. Le moteur correctif existant couvre seulement les tâches de code **DATA** et **SEARCH** sous scope exact, avec un plafond SQL quotidien et un appel modèle par tâche.
- Admission des SCPI : toujours **NO GO** jusqu'à preuves financières et QA indépendantes ; PR #292 non fusionnée.

## Plan d'activation et d'admission réel

1. Vérifier la PR de ce correctif, CI verte, puis approuver sa fusion sur `main` par la voie normale.
2. À la prochaine exécution GitHub ou exécution manuelle autorisée, vérifier le log `DEEPSEEK_API_PREFLIGHT_OK model=deepseek-flash inference_calls=0`. Si 401, **reconfigurer uniquement le secret GitHub `DEEPSEEK_API_KEY`** via Settings → Secrets and variables → Actions ; ne pas transmettre la clé en chat ou dans une issue.
3. Pour déclencher une **vraie correction**, utiliser une anomalie actuelle, vérifiée et sourcée, dont `owner_role` est DATA/SEARCH, `execution_mode=scoped_code_correction`, `scope.files` contient **un seul fichier de code permis** et l'acceptance est mesurable. Cette création doit être fondée sur un défaut réel, pas sur un scénario synthétique.
4. Réutiliser `prepare_execution`, prendre un bail via OIDC, générer une seule modification DeepSeek Flash, exécuter les tests, ouvrir une **PR candidate**, enregistrer le résultat, puis transmettre à une **QA indépendante**. Ne pas déclarer `resolved` ni `published` sur un simple retour modèle.
5. Mesurer les **tokens réellement consommés**, les coût/mission, taux de succès des builds et régressions sur 10 à 20 corrections représentatives ; financer les chantiers autonomes suivants seulement après ce crash-test.

**Économie** : conserver Claude Code pour les vidéos. Le compte DeepSeek dispose déjà d'un solde ; aucune nouvelle souscription n'a été engagée. La politique actuelle `max_claims_per_role_day`, le plafond de **3 claims correctifs DATA/SEARCH par jour** et `max_tokens=3200` limitent les dépenses ; ne pas les relever sans mesures.

**Action hors périmètre** : le watchdog actuel s'appuie sur le dernier heartbeat maximal. Les audits manuels ont donc temporairement masqué l'inactivité autonome. Une modification distincte, avec provenance GitHub OIDC vérifiée, est nécessaire avant d'utiliser `AI_WORKERS_STALLED=false` comme preuve d'activation.
