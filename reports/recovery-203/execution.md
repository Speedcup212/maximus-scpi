# RECOVERY-203 — Suivi durable des anomalies documentaires

Demande du 12 novembre 2026. Extension de CONTROL et du watchdog de 30 minutes existants ; aucune nouvelle table de file, cron, orchestration ou API de modèle.

## Comportement

Inventaire privé de 13 familles de sources : OCR, replays, triage métriques, backfill trimestriel et annuel, registre source, tâches échouées/bloquées, issues bloquées, frais incomplets, quarantaines historiques et de provenance, certifications rejetées, refus CORUM journalisés. Les clés stables dédupliquent les dossiers dans `maximus_agents.issues`.

Chaque dossier conserve responsable DATA/SEARCH/ANALYST, superviseur CONTROL, action suivante, échéance initiale de 48 heures immuable, revue sous 24 heures, compteur et escalade. Huit SCPI au maximum par passage sont remises à échéance dans le worker officiel existant, une fois par SCPI sur 24 heures, trois tentatives par dossier. Les quarantaines, quotas, sources approuvées et vérifications d’identité restent intacts. Les cas non automatisables sont assignés à une revue indépendante puis, si nécessaire, à une demande d’information à l’émetteur préparée pour validation. Aucun email envoyé automatiquement.

Une trace de recherche planifiée ne prouve pas son exécution. Les refus CORUM conservent désormais URL officielle, période, SHA-256 et code borné même après rollback RPC ; aucun jeton ni erreur brute n’est journalisé. La clôture vérifie côté serveur la preuve propre au type de défaut ; aucun `PASS` JSON arbitraire, expiration ou disparition ne suffit. Les types sans vérificateur positif dédié restent ouverts et escaladés jusqu’à une correction précisément testée du vérificateur. Cette limite est explicite : le dispositif ne garantit pas de découvrir une information absente, ni l’infaillibilité financière.

## Vérification avant publication

- Tests Node ciblés : 35 PASS (résolution, contrôle existant, cohortes/watchdog).
- Contrôles SQL transactionnels préparés : couverture, déduplication, budget, refus de fausse clôture, échéance immuable, quarantaine conservée, privilèges privés, absence de modification des indicateurs.
- Build complet CI, application de migration, déploiement des deux bridges et consommation réelle : EN ATTENTE.

Le chiffre « zéro anomalie orpheline » décrit uniquement l’inventaire technique couvert et sa prise en charge. Il ne signifie jamais zéro anomalie, 100 % des valeurs certifiées, ni garantie de rendement/capital/liquidité.
