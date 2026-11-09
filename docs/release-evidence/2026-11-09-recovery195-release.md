# RECOVERY-195 — release demandée, 9 novembre 2026

## Périmètre
- PR #384 : `b055aace5b72322ae62fabdac4000f7d0aee23b4`, six workflows de PR réussis : réparation du reconciler d'agents, séparation de l'event push d'un vrai run planifié, navigation SCPI Documents après hydratation React.
- PR #385 : `0e5d75929b589168ae6d0a9a1d6b1839811acffb`, quatre contrôles de PR réussis : alignement du terminateur de fonction SQL.
- Supabase MaximusSCPI : migration `recovery195_orphan_running_lease_guard` réellement appliquée et read-back : ancien `LEASE_EXPIRED_RECONCILED` préservé, nouveau `ORPHAN_RUNNING_NO_LEASE_NO_RUN` installé; ACL anon/authenticated désactivées.
- Dernier crash-test strict avant release : 42 PASS_100 / 26 FAIL_STRICT sur 68 existing ; EdR Europa distinct hors univers existant, vue brute 42/69.
- Aucun indicateur financier nouveau, aucune promotion ou QA financière automatiquement accordée.

## Conditions d'acceptation
1. Commit effectif de la release publié en production sur Netlify `maximusscpi`, statut READY et SHA identique.
2. Les fiches Comète, Iroko Atlas, Sofidynamic présentent Radar, Trajectoire et navigation 6 rubriques, dont le hash `#scpi-documents` sur mobile.
3. Vérifier le read-back de publication; absence de régression des politiques de liquidité et certification.
4. **Ne pas annoncer un cycle agent autonome complet** en l'absence d'un vrai run `schedule`/récovery avec CONTROL→DATA/SEARCH/ANALYST→QA et des logs concordants.

Ce fichier est un marqueur d'audit et de release. Aucun raccourci de validation ni ajout de moteur agent. Les contrôles financiers/réglementaires et le plugin Netlify natif restent inchangés.
