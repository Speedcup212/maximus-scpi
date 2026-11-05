# RECOVERY-111 — Protocole d'admission à deux phases, non déclaratif

Date : 05/11/2026. PR #292, branche `recovery/091-scpi-certification-industrialisation`.
**Statut : NO GO, aucune autorisation de publication, aucune fusion ni déploiement.**

## Problème de causalité démontré

Le workflow de PR exige `score === 100` alors qu'il calcule `evaluateMaturity(observed)` sans contexte protégé : **plafond 75/100**. Le cinquième critère inclut un contrôle post-publication qui n'est pas possible avant le déploiement du SHA. Le simple booléen `trustedProtectedReadback=true` ne constitue pas une attestation.

## Correctif intégré dans la PR

- `scripts/scpi-onboarding/admissionPhases.mjs` sépare la revue **PREPUBLICATION** de la preuve **POSTDEPLOY**. Un snapshot de PR peut seulement devenir `CANDIDATE_FOR_PROTECTED_REVIEW`, jamais une autorisation ni un 100 post-déploiement.
- La phase post-déploiement exige une **attestation Ed25519 extérieure** avec ancre de confiance fournie exclusivement par un exécuteur protégé, un SHA Git complet identique sur la décision/Netlify/Supabase, un vrai déploiement déclaré publié en contexte production, une lecture Supabase protégée, une décision de lot approuvée et les trois pilotes explicitement identifiés.
- Les trois pilotes exigent les documents courants, analyses financières et juridiques, historique réconcilié ou exception formellement validée, revue et audit **distincts et identifiables**, éligibilité finale, et **douze preuves navigateur** (six surfaces sur desktop et mobile) liées au déploiement exact, au domaine HTTPS de production, à la fenêtre temporelle et à un SHA-256 de preuve.
- Une attestation expirée (>10 minutes), modifiée, non signée, signée par une clé différente, portant le SHA d'une autre release ou d'un domaine de prévisualisation est rejetée.
- Même une attestation cryptographiquement valide **n'active pas la publication** : `publication_authorized=false`. La signature établit seulement que le signataire protégé a fait ces affirmations. La qualité de sa collecte et son indépendance doivent être auditées.
- `.github/workflows/scpi-industrial-readiness.yml` exécute les tests de la frontière de confiance et produit un `prepublication-indicative.json` étiqueté **PR_LOCAL_SNAPSHOT_NOT_LIVE**. L'étape d'admission 100 reste volontairement bloquante et échoue si la preuve protégée n'est pas présente.

## Vérifications

Tests locaux `node --test scripts/scpi-onboarding/admissionPhases.test.mjs` : **9/9 PASS** sur la version consolidée avec URL de production et identifiant de déploiement. La fixture Ed25519 est **entièrement synthétique**, limitée au test du protocole, et ne doit jamais être utilisée comme certification réelle.

**Contrôle GitHub vérifié**, exécution [#42091429113](https://github.com/Speedcup212/maximus-scpi/actions/runs/42091429113), SHA `a0608364f73cafa3820a18ca1eff79eca4abd19b` : étape de test d'attestation **9/9 PASS**, TypeScript **0 diagnostic**, delta **1023 résolus / 0 introduit**, diagnostic prépublication **BLOCKED** avec 19 constats, admission `INDUSTRIAL_NO_GO: score=75`. L'échec final est intentionnel et indépendant de ces tests techniques. Le commit documentaire ultérieur ne modifie pas ces sources.

## Lecture Supabase en direct du 05/11/2026 (sans mutation)

| SCPI | Métriques courantes QA | Annuelles QA | Noyau régime | Identités réglementaires | Source finance | Analyse/revue/audit/6 surfaces/lot/release |
|---|---:|---:|---:|---:|---|---|---|
| AEW Opportunités Europe S1 | 15 | 15 | 11/11 | 3/3 | PASS | TOUS BLOQUÉS |
| Opus Real T3 | 13 | 4 | 11/11 | 3/3 | PASS | TOUS BLOQUÉS |
| Sofidynamic T3 | 17 | 4 | 11/11 | 2/3 | BLOCKED | TOUS BLOQUÉS |

La vue `maximus_agents.scpi_industrial_admission_live_v1` donne `admission_100_proven=false` sur les trois lignes. Cette mesure n'est ni une certification des données, ni un accord de publication.

## Dépendances restantes, sans raccourcis

**P0 — Séparation d'exécution effective :** installer un vérificateur externe protégé sur le code approuvé de `main`, en environnement non contrôlé par la PR, avec clé publique de confiance fixée hors PR, récupération vérifiée du SHA/ID Netlify réellement publié et interrogation read-only des tables/vues Supabase. Implémenter l'émission d'attestation par un signataire indépendant, sa rotation et sa révocation. Le vérificateur présent dans la PR est une **bibliothèque préparatoire testée**, pas cet exécuteur opérationnel.

**P1 — Trois dossiers :** obtenir le PDF authentique des statuts Sofidynamic déposés le 08/07/2026 (registre INPI), rapprocher les quinze parts et la résolution effective sur l'endettement ; compléter les analyses privées, revues juridique/financière indépendantes et preuves de 12 cas navigateur pour Sofidynamic, AEW et Opus Real. Respecter le régime de marché secondaire d'Opus et le semestriel d'AEW.

**P2 — Publication :** seulement après décision de lot réellement déléguée et autorisée, permettre le déploiement contrôlé, puis exécuter le readback SHA/DB/browser sur la **vraie production** et émettre l'attestation postdéploiement. Le 100 ne peut être délivré avant cette étape.

## État et interprétation

- **Technique** : TypeScript 0 diagnostic au commit initial 10017eac, build et sept autres workflows réussis ; tous les nouveaux tests devront être revérifiés sur le dernier SHA.
- **Admission** : 75/100 descriptifs, NO GO. Le chiffre n'est ni un pourcentage de fiches certifiées ni un taux de fiabilité.
- **Publication** : aucune permission nouvelle. La PR reste draft, la protection de l'admission reste active.
