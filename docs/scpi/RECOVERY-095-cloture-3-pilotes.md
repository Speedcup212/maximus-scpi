# RECOVERY-095 — Clôture bornée du cycle documentaire et 3 pilotes

Date : 05/11/2026. Projet : MaximusSCPI. PR #292 conservée en **draft / NO GO**.
**Objectif ici : supprimer les doubles travaux documentaires, sans promouvoir des données financières non revues.**

## Corrections vérifiées en production privée
1. L'ancienne contrainte Supabase refusait tout bulletin **S1/S2** : migration `20261105135939` appliquée pour accepter `semiannual_bulletin` et les seules périodes `20xx-S1/S2`, en conservant les périodes T1–T4 et RA.
2. Le site émetteur officiel `www.aewpatrimoine.com` a été enregistré dans l'allowlist restreinte, avec le lien produit comme provenance.
3. La CI GitHub [#42024494906](https://github.com/Speedcup212/maximus-scpi/actions/runs/42024494906) a vérifié les binaires, identités et SHA ; **5 preuves financières documentaires** (Sofidynamic T3, Opus Real T3, AEW S1 2026, S2 2025, RA 2025) et **3 preuves réglementaires** (AEW DIC, note et statuts combinés) ont été inscrites dans les tables existantes. Le document signé Sofidynamic d'avril 2026 **n'a pas** été utilisé pour certifier les statuts courants de juillet 2026.
4. La work queue existante traitait AEW comme `VERIFY_PDF_AND_IDENTITY` malgré les binaires. Migration `20261105140854` appliquée : le passage à `COMPLETE_PAGINATED_METRIC_QA` ne nécessite **que la preuve S1 officielle avec identité, empreinte SHA, volume textuel et hostname approuvé** ; jamais une validation financière.
5. La migration est versionnée ici sous **son numéro exact déjà attribué par Supabase**, avec tests permanents dans le workflow documentaire existant. Pas de deuxième pipeline.

## Read-back des trois dossiers — seules mesures pertinentes

| Dossier | PDF financiers vérifiés en base | Réglementaires validés | Métriques déjà QA | QA allocation | Gate de publication |
|---|---:|---:|---:|---:|---|
| Sofidynamic | 4 | 2 | 29 (plusieurs périodes) | 11 | **BLOCKED** |
| Opus Real | 3 | 3 | 4 (annuel) | 0 | **BLOCKED** |
| AEW Opportunités Europe | 3 | 3 | 0 | 0 | **BLOCKED** |

Source : requête Supabase read-only datée et stockée dans [l'artefact JSON](evidence/recovery-095-three-pilots-live-readback.json). Ces décomptes ne signifient PAS certification intégrale ni QA de la période courante.

## Arrêt contrôlé et travaux restants

- **Sofidynamic** : bilan officiel T3, chiffres et allocations T3 indépendamment revus ; résolution documentée de l'écart de **15 parts** ; statuts juridiquement à jour (les fichiers de juillet 2026 ne sont pas vérifiés contre le registre opposable) ; six surfaces et risque/SFDR à qualifier. Le public reste T2 avec réserves.
- **Opus Real** : le bulletin T3 est vérifié comme document, seuls **2 champs techniques T3** étaient rapprochés dans la dernière exécution ; revue complète et risque spécifique de marché secondaire à faire.
- **AEW Opportunités Europe** : le bulletin **2026-S1** est juridiquement un semestriel, jamais un trimestre inventé. Les deux lecteurs ne rapprochaient que **2 champs** lors de la dernière exécution ; la QA des allocations n'existe pas encore. L'ancien gate de publication exige explicitement T2 2026 : **une adaptation de circuit strictement sourcée S1 est encore nécessaire avant une future éligibilité**. Elle n'a pas été contournée ici.

Il reste impératif de prouver **revue indépendante réelle → QA complète → preuve multi-surfaces privée → décision responsable par lot → publication autorisée → read-back post-production**. Aucun de ces éléments ne peut être inféré de la simple présence de PDF.

**Décision : pas de merge ni déploiement tant que `final_release_ready` n'est pas vrai pour des dossiers réellement certifiés et que les contrôles production n'ont pas été passés.** Le cycle de remédiation technique est borné ; on n'ouvre pas un nouveau moteur parallèle.

