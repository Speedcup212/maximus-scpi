# QA — premier cycle autonome, 5 octobre 2026

Tâche `18799cd6-0850-4758-8cda-0646821efe39`. Verdict global **REVIEW**. Aucune release autorisée par ce verdict. Aucune modification du code public, des données métiers ou des crons ; aucun déploiement.

## Vérifications indépendantes

Les trois dépendances DATA, ANALYST et SEARCH sont terminées avec REVIEW. QA a repris leurs résultats JSON persistants et leurs preuves datées, puis effectué ses propres lectures SQL et HTTP entre 10:55 et 10:57 UTC le 05/10/2026.

| Priorité | Constat certain | Preuve indépendante | Limite |
|---|---|---|---|
| 1 | Certification stricte incomplète : 60 PASS_100 / 1 FAIL_STRICT | `scpi_crash_test_strict_v2`, 10:56:33 UTC : Altixia Commerces, `uncertified_tof_periods=1`, dernière période documentaire 2026-T2 | La période précise du TOF et sa source officielle doivent être rapprochées ; 2026-T2 est la dernière période documentaire, pas nécessairement le TOF incriminé |
| 1 | Actualité Transitions Europe temporellement contradictoire | HTTP 200 de `/transitions-europe/`, 10:55:39 UTC : « Collecte nette de 135 M€ au T3 2025 », puis « Période : 2026-T2 » dans le même bloc | La bonne période du texte doit être vérifiée dans la source ; ne pas comparer un acompte avec un cumul annuel |
| 1 | Page analyses initiale canonical home | HTTP 200 de `/analyses/`, 10:55:39 UTC : canonical `https://maximusscpi.com/`, H1 de home | Indexation Google et rendu hydraté non audités |
| 1 | Calcul frontend de liquidité ignore le régime certifié | Code `trajectoryData.ts` et `ScpiTrajectoryPanel.tsx`, SQL 10:55:05/10:56:01 UTC, chunks publics HTTP 200 à 10:57:03 UTC | Composant effectivement monté et résultat affiché dans le DOM client non observés ; présence du code déployé confirmée |
| 2 | Libellé « Δ 4 obs. » incompatible avec le calcul quatre trimestres calendaires | Code `latestDelta` et chunk public `ScpiTrajectoryPanel-BhJR6N5N.js`, 10:57:03 UTC | Utiliser des périodes comparables ; N.D. si période homologue absente |

Cas liquidité reproduits par SQL : LF Grand Paris Patrimoine, 499 968 / 4 907 637 = 10,1875505 %, alors que le ratio de file de retrait certifié est NULL après passage au marché secondaire (`level_only`) ; Patrimmo Commerce et Primovie, ratios calculables à 0 % dans l'historique, mais signaux certifiés supprimés après changement de régime (`suppressed_regime_change_pending_data`). Le zéro ne prouve pas une amélioration de liquidité. Pour LF Grand Paris Patrimoine, la vue certifiée conserve une pression de marché secondaire de 10,1876 % : cette mesure doit être nommée selon sa base, sans être requalifiée en file de retraits.

Le bundle d'entrée seul ne contenait pas le code du panneau : QA a suivi les chunks déclarés avant de conclure. `ScpiTrajectoryPanel-BhJR6N5N.js` contient la lecture `scpi_indicator_history`, le ratio et « Δ 4 obs. » ; `trajectoryData-DSVU7wcS.js` contient les champs de calcul, sans contexte `regime_changed` ni `secondary_market_order_book`.

## Installation des agents

Certain : l'automatisation `6ac3810a28f48191aec0ec9312e1fe66` est active, avec règle quotidienne 07 h et 18 h, Europe/Paris, horaires flexibles. Elle porte les cinq rôles dans une seule tâche planifiée. Au contrôle, cinq automatisations sont actives au total ; la limite de forfait et le choix d'une orchestration unique ont été constatés pendant l'installation par CONTROL.

Certain : DATA, ANALYST et SEARCH ont clôturé des tâches réelles du cycle du jour, et QA a obtenu une lease exclusive. La première délégation parallèle est attestée par CONTROL ; les dates de clôture SQL prouvent les résultats, sans suffire seules à établir le parallélisme. Le contrat planifié demande une délégation parallèle si disponible, sinon un traitement séquentiel journalisé. Il ne s'agit pas de processus IA permanents.

ACL revérifiées à 10:57:22 UTC : les quatre tables privées ont RLS activée ; tables et dashboard sans SELECT anon/authenticated ; fonctions claim/prepare/finish SECURITY INVOKER, sans EXECUTE anon/authenticated. Le dashboard est une vue sans RLS propre, protégée par ses privilèges.

Le script `verify.sql` a été exécuté par CONTROL avec PASS sur déduplication, leases, retries, budget et ACL. QA n'a pas rejoué les mutations transactionnelles ; les contrôles ACL et les tâches réelles ont été vérifiés indépendamment. Les futurs runs planifiés n'ont pas encore été observés : leur bon fonctionnement récurrent reste à confirmer après déclenchement.

## Lot de corrections préparé, à contrôler avant release

1. DATA/ANALYST : identifier la période TOF d'Altixia non certifiée et rapprocher valeur + période + preuve PDF officielle. Conserver NULL/REVIEW si la preuve manque. Validation : strict gate PASS_100 seulement après correction justifiée ; aucune certification de convenance.
2. DATA/SEARCH : fournir au générateur statique un seul enregistrement éditorial liant texte, période, date et source Transitions Europe. Étiqueter le texte selon sa vraie période ou le remplacer par un texte documenté de la période attendue. Validation : HTML et DOM hydraté concordants, source et agrégat identifiables.
3. SEARCH : préparer page initiale dédiée `/analyses/`, canonical propre, title/H1 et contenu spécifiques ; sitemap cohérent après contrôle. Validation : HTTP 200, canonical propre unique, HTML initial pertinent, liens et sitemap valides ; Search Console demeure une preuve distincte.
4. ANALYST : adapter présentation de liquidité à la base et au statut certifiés, masquer les ratios non comparables après bascule, préserver NULL et distinguer pression secondaire/file de retraits. Corriger « Δ 4 obs. » en variation sur un an lorsque le calcul est annuel. Validation : trois cas ci-dessus, SCPI à capital variable sans bascule, période homologue absente, contrôle visuel hydraté mobile/desktop.
5. CONTROL/DATA : rapprocher les failed/needs_review métiers de leur résolution et distinguer réussite cron de réussite PDF → extraction → validation → historique → analyse. Valider sur un document réellement nouveau ; aucun cron réactivé pour ce seul audit.

Regrouper les correctifs dans un seul lot candidat, puis QA les vérifier avant toute décision de release. Les droits d'écriture des agents restent limités à `agents/`, `tasks/` et au schéma privé. Aucune publication n'est déclenchée par l'installation ou par ce rapport.

Les constats supplémentaires SEARCH concernant les H1 génériques ont été reconfirmés pour Transitions Europe ; couverture des 61 fiches, indexation/citations IA, mesure des coûts et PDF complets non audités. La vieille file trajectoire signalée par DATA est distincte du nouveau runtime ; son classement nécessite une décision CONTROL, sans réactivation automatique.
