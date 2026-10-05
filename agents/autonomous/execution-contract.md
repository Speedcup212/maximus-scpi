# Contrat d'exécution ciblée et de clôture

## Autorisation et périmètre

Éric, 05/10/2026 : « oui, il faut qu'il y ai exécution. fait tout ce qui doit etre fait ». L'autorisation étend l'audit à la réparation effective des anomalies documentées de MaximusSCPI.

Chaque anomalie est dédupliquée dans maximus_agents.issues : issue_key, title, owner_role, priority, scope JSON, acceptance, requires_release, implementation, qa_result et release_reference. Le scope nomme fichiers/routes ou tables/métriques/périodes, source et mutation attendue. Lire la ligne entière avant écriture ; portée ambiguë → blocage documenté.

Écritures permises : registre privé ; fichiers de code/tests du scope sur branche candidate agents/autonomous* ; commits/push de cette branche ; SQL métier ciblé, réversible et sourcé quand requis. Changements de schéma : workflow migrations du dépôt et outils Supabase adaptés. Aucun merge main ni déploiement automatique.

Pas de secrets, contenu client, commande cron contenant jeton, message externe, recommandation personnalisée, nouvel achat/API IA payante, cron accéléré, backfill global ou ressource cloud nouvelle. Ne pas changer parser-version uniquement pour forcer un retraitement. Workers existants à cadence inchangée.

## Déroulement obligatoire

1. CONTROL appelle prepare_execution() **avant** prepare_cycle(). Exécutions prioritaires ; execute/verify persistantes au-delà de leur jour de création.
2. Workers claim personnellement : une tâche/invocation, deux claims/rôle/jour Paris, deux tentatives/tâche maximum. Audits et exécutions partagent les plafonds ; aucun contournement local.
3. Execute : rapprocher preuve/état actuel, implémenter, tester critères et non-régressions, vérifier diff et enregistrer référence. Preuve manquante ou valeur supposée : pas de correction de convenance.
4. record_execution(task_id, lease_token, status, result). done/PASS exige implementation_reference, tests non vide avec name/status PASS, evidence non vide avec source/observed_at/finding. SQL valide la forme ; QA valide les faits. Résultat partiel ou dépendance manquante : REVIEW/FAIL ou blocked.
5. Après dépendances terminales, QA distincte vérifie diff/requêtes, reproduit tests et verdict par **chaque issue** dans issue_verdicts, avec issue_id et verdict PASS/REVIEW/FAIL. Elle enregistre record_execution et ses propres preuves datées. Conclusion worker ≠ preuve indépendante.

## Conservation des faits

- Absence/non-publication/non-comparabilité : NULL/statut documenté, jamais zéro inventé.
- Certification : valeur, période et PDF officiel effectivement vérifiés ; conserver page et méthode. URL officielle seule ≠ extraction démontrée.
- Liquidité : distinguer file de retraits et carnet secondaire ; respecter regime_changed, level_only, suppressed_regime_change_pending_data. Zéro après bascule ≠ amélioration démontrée.
- Trajectoire : période homologue réellement disponible, variation annuelle libellée sur un an ; acompte et cumul non interchangeables.
- Texte/actualité : période, date et source du même enregistrement. Masquer/qualifier un texte ancien non vérifiable plutôt que lui attribuer la nouvelle période.
- Ingestion : HTTP/cron/découverte/déduplication ≠ PDF nouveau → extraction → validation → historique → analyse. Aucune duplication artificielle pour fabriquer la preuve.
- Gardes SQL actifs, snapshots manuels same-period préservés, vrais rejets visibles. Ne pas réécrire les événements failed historiques.

## Clôture exacte

open → in_progress → implemented → qa_pass → resolved ; blocked documente empêchement ou rejet.

- Audit done : aucune clôture automatique.
- Execute done/PASS : implemented avec référence/tests.
- Verify QA/PASS et requires_release=true : **qa_pass**, pas publié.
- Verify QA/PASS et requires_release=false : **resolved**, correction DB effective vérifiée indépendamment.
- Code resolved : publication regroupée réelle, release_reference et contrôle public documentés. Publication distincte, jamais réalisée par cette automatisation.

Blocked ne revient à open qu'après action concrète et motif journalisé. File obsolète : classer blocked/non exécutée et conserver tentatives, jamais prétendre une exécution.

CONTROL rapporte séparément : DB corrigée/validée ; code implémenté/testé ; QA passée ; publié ou en attente ; limites et prochaines preuves. Aucun pourcentage global, garantie de capital/rendement ni micro-déploiement.
