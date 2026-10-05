# ANALYST — premier cycle réel, 5 octobre 2026

Tâche : `06a629d3-e84a-401f-bc02-8dfce68f2ac9`. Verdict : **REVIEW**.
Observations SQL du 05/10/2026, entre 10:48 et 10:54 UTC. Aucune donnée métier ni aucun code public modifié.

## Certain : état des vues internes

- Périmètre actif : 61 SCPI ; aucune ne manque dans les vues de gates/readiness.
- 61/61 `SURVEILLANCE_READY_100`, 12 dimensions internes sur 12.
- Gates data, structure et sémantique : 61 PASS ; market : 57 PASS et 4 PASS_LIMITED.
- Exceptions normales : Grand Paris Résidentiel (cadence), Iroko Atlas (jeune fonds), Patrimmo Croissance Impact (structure), Remake UK 2025 (nouveau fonds).
- Signaux TOF éligibles : 57/61 ; liquidité : 30/61. Les autres sont correctement limités ou supprimés, sans les transformer en échecs.
- Aucune incohérence entre nombre de points, certification métrique et éligibilité des gates ; aucune période en double dans l'historique pilote.
- `scpi_trajectory_qa_queue` : 1 192 lignes, toutes `qa_check=ok` ; ce nombre n'est pas un nombre d'alertes. `scpi_qa_guard_review_queue` : zéro ligne.

Ces résultats décrivent les règles internes actuelles. Ils ne certifient pas chaque PDF, chaque métrique ni la conformité réglementaire. DATA signale séparément un TOF historique non certifié pour Altixia Commerces malgré le PASS legacy : transféré à QA.

## REVIEW : candidat de correction de présentation

Fichiers examinés : `src/components/trajectory/trajectoryData.ts` et `src/components/trajectory/ScpiTrajectoryPanel.tsx`.

Le panneau charge `scpi_indicator_history`, calcule `parts_attente_retrait / nombre_parts` et affiche le résultat sans intégrer les changements de régime et gates certifiés. Présence effective du composant sur les pages publiques non vérifiée dans cette mission.

Preuves SQL actuelles pour 2026-T2 :

| SCPI | Champs historiques utilisés par le panneau | Vue certifiée |
|---|---|---|
| LF Grand Paris Patrimoine | 499 968 / 4 907 637 = 10,19 % | Marché secondaire ; ratio de file de retraits NULL ; level_only |
| Patrimmo Commerce | 0 / 3 807 739 = 0 % | Marché secondaire ; signal supprimé après changement de régime |
| Primovie | 0 / 25 575 793 = 0 % | Marché secondaire ; signal supprimé après changement de régime |

Un zéro résultant de l'annulation de la file ne démontre pas une amélioration de liquidité. Proposition : préparer un correctif utilisant la base de liquidité et le statut certifiés ; masquer le ratio de file de retraits après bascule, afficher le contexte de régime, conserver NULL lorsqu'aucune mesure comparable n'est publiée. Valider les trois cas avant release, sans changer les données historiques.

Autre défaut certain du code : le libellé `Δ 4 obs.` appelle `latestDelta(..., 4)` qui cherche quatre trimestres calendaires auparavant. Proposition : libeller `variation sur un an` lorsque les périodes comparables existent ; conserver N.D. sinon. Ne pas confondre avec les quatre observations de la vue SQL.

## Transfert SEARCH → QA

SEARCH a observé dans le HTML initial de Transitions Europe des textes T3 2025 associés à un bloc daté 2026-T2. Vérification SQL actuelle : source `te_s1-2026.pdf`, collecte nette 274 M€, distribution par part 4,10 € ; certifications correspondantes `auto_verified_with_evidence`. La phrase « 12,50 € depuis début année » ne peut être validée ni invalidée par la seule distribution par période : les agrégats sont différents. QA doit vérifier le texte source et son périmètre temporel, ainsi que le HTML/hydratation, avant correction.

## Suite

1. QA confirme l'exposition réelle du panneau et reproduit les trois cas de régime.
2. Préparer un patch de présentation sous agents/, soumis aux autorisations existantes.
3. QA reprend l'exception stricte Altixia Commerces de DATA et le texte daté Transitions Europe de SEARCH.
4. Aucune certification globale ni release ne découle de ce rapport.
