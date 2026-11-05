# RECOVERY-112 — Chaîne de preuves, séparation des validations et admission protégée

Date : 2026-11-05. Projet : MaximusSCPI. PR #292.
**Statut initial : NO GO — aucune écriture de publication ni fusion.**

## 1. Constat Supabase live (connecteur, lecture seule)

- Projet `ygvsddcpohsnaowofuwc`, vue `maximus_agents.scpi_industrial_admission_live_v1`.
- Les trois audits `scpi_candidate_final_audit` sont `pending`, sans `approved_by`, `approved_at` ni `evidence_digest_sha256`.
- Le lot `RECOVERY-100-THREE-PILOTS-20261105` est `draft`, sans responsable de décision ni digest validé.
- Le seul acteur explicitement délégué enregistré et actif dans `scpi_publication_delegations` est `codex-automation-delegated-release` (autorisation du 01/11/2026). **Cette délégation concerne la publication, et ne donne PAS une revue financière ou un audit juridique indépendant.**
- `scpi_candidate_final_review` a un enregistrement Sofidynamic dont `reviewed_by` porte un identifiant d'essai navigateur, tandis que `legal_identity_passed=false` et `dic_risk_sfdr_review_passed=false`. Ce nom n'est pas une signature juridique.
- Sofidynamic : 17 indicateurs QA courants, 4 annuels, DIC/NI 2/3 réglementaires, sources financières bloquées (statuts 08/07/2026 non authentifiés, delta T1→T2 −15 parts).
- Opus Real : 13 courants, 4 annuels, 3/3 documents réglementaires, minimum technique financier atteint ; analyse et audit bloqués, marché secondaire à respecter.
- AEW Opportunités Europe : 15 courants, 15 annuels, 3/3 documents, minimum financier technique atteint ; analyse et audit bloqués, S1 semestriel.
- Tous les `analysis_gate`, `independent_review_gate`, `independent_audit_gate`, `six_surface_browser_gate`, `responsible_batch_gate`, `final_release_gate` sont `false` sur ces trois pilotes.

## 2. Matrice de responsabilités — les autorisations ne sont pas auto-attribuées

| Étape | Rôle minimal | Source de la preuve | Autorisé aujourd'hui ? |
|---|---|---|---|
| Acquisition PDF | DATA / collecteur existant | PDF officiel, URL, période, SHA et pages | Pour certaines pièces, sans attestation finale |
| Analyse financière | ANALYST (préparateur) | Métriques/allocations, calculs et historique privés | Préparation partielle seulement |
| Revue financière et juridique | QA indépendant habilité, distinct du préparateur et de l'auditeur | `scpi_candidate_final_review`, approbation imputable | **NON — pas de sign-off** |
| Audit contradictoire | Contrôleur indépendant distinct du relecteur | `scpi_candidate_final_audit`, digest du dossier, date et identité | **NON — 3 pending** |
| Décision responsable du lot | Acteur expressément délégué `codex-automation-delegated-release` | `scpi_candidate_batch_decisions` + délégation active + digest | Délégation OUI ; décision du lot **NON** |
| Publication | Exécuteur technique restreint hors PR | SHA Git exact, contrôles d'accès et activation | **NON** |
| Réconciliation production | Vérificateur GitHub `main` à environnement protégé | Netlify publié + Supabase lecture seule + 36 cas navigateur | **NON — environnement et preuves à finaliser** |
| Attestation 100/100 | Vérificateur externe indépendant + signature vérifiée | `admissionPhases.mjs`, attestation Ed25519 courte et contrôles réels | **NON — signataire non en service** |

**Interdit** : donner plusieurs noms à un même automate pour simuler une indépendance. Chaque rôle doit avoir une provenance d'identité et de permission, une séparation effective des accès et une trace contrôlable. Les approbations purement automatiques ne sont admises que si la délégation appropriée existe pour leur domaine. Faute de cette preuve, NO GO.

## 3. Chaîne de preuves cible réutilisant les tables existantes

`scpi_candidate_pdf_validation` et `scpi_candidate_regulatory_documents`
→ `scpi_candidate_metric_evidence` (`qa_pass` attribué indépendamment)
→ `scpi_candidate_indicator_stage` + historique / analyse privée sourcée
→ `scpi_candidate_final_review` (risques/DIC/SFDR, endettement, frais, liquidité, cohérence, identité)
→ `scpi_candidate_final_audit` (personne/agent distinct, digest, timestamp)
→ `scpi_candidate_batch_decisions` (acteur délégué actif)
→ preuve navigateur privée liée au **SHA Git exact**
→ publication transactionnelle autorisée
→ lecture réelle Netlify + Supabase + navigateur production
→ attestation indépendante courte permettant seulement de **constater** le 100/100.

L'échec d'un contrôle financier source interdit la certification de ce champ. Une réserve visible peut autoriser la **publication limitée** uniquement si la politique de publication et les contrôles légaux permettent cette réserve. Jamais un prix de retrait fictif ni une recommandation fondée sur une fiche non certifiée.

## 4. Nouveaux composants — pas de second moteur d'ingestion

- `scripts/scpi-onboarding/protectedReleaseEvidence.mjs` : audit **en lecture seule** de la vue live, des revues, audits, délégations et décision de lot, des huit contrôles du responsable de revue, cinq contrôles d'audit et des 12 preuves navigateur par pilote. Toute preuve absente produit `BLOCKED` ; aucune décision de publication possible.
- `scripts/scpi-onboarding/protectedProductionReadback.mjs` : rapprochement du **déploiement actuellement publié** avec le SHA Git, le site, le contexte et la branche. Un déploiement ancien même `ready` échoue.
- `scripts/scpi-onboarding/protectedAdmissionReadback.mjs` : diagnostic protégé **à lecture seule** via PostgreSQL + API Netlify. Il ne signe rien et sort toujours `NO_GO` en attendant les preuves réelles postdéploiement.
- `.github/workflows/scpi-protected-postdeploy-admission.yml` : déclenchement manuel exclusivement sur `main`, environnement `scpi-industrial-production`. Le workflow ne contient pas de secrets en clair et n'autorise pas une PR à utiliser les identifiants. **Il ne devient actif qu'une fois le code approuvé sur `main` et l'environnement sécurisé configuré.**
- `admissionPhases.mjs` : les six noms de surface sont maintenant alignés avec ceux de la base (`profile`, `comparator_analysis`, `radar`, `simulator`, `client_card`, `trajectory`).
- Tests adversariaux `protectedReleaseEvidence.test.mjs` et `protectedProductionReadback.test.mjs`, dans la CI PR existante.

La présence d'un SHA-256 formel ou d'un nom d'approbateur dans une table ne constitue pas, à elle seule, une preuve cryptographique de l'identité ou de la véracité. L'évaluation est donc non habilitante tant que la lecture et la provenance ne sont pas protégées.

## 5. Activation du diagnostic protégé — configuration requise

1. Dans GitHub, **sur la branche protégée `main`**, configurer l'environnement `scpi-industrial-production` avec *required reviewers* et restrictions de branche ; ne pas créer un environnement non protégé doté de secrets sensibles.
2. Créer un identifiant **PostgreSQL dédié à SELECT seulement** sur les vues et tables privées nécessaires, sans droits de modification, d'exécution d'actes privilégiés ni `BYPASSRLS`. Enregistrer sa chaîne de connexion comme secret de cet environnement : `SCPI_SUPABASE_READONLY_DATABASE_URL`.
3. Créer un identifiant Netlify de privilèges minimaux permettant uniquement les lectures GET de l'état du site et des déploiements, si disponible avec ce niveau de granularité : `SCPI_NETLIFY_READ_TOKEN`. Vérifier les permissions réelles du jeton ; son nom ne garantit pas qu'il soit read-only.
4. Déployer le seul contrôleur **après revue et fusion autorisées** ; lancer manuellement `SCPI protected production admission - read-only diagnostic` depuis `main`.
5. Archiver les observations horodatées et les décisions `BLOCKED` sans exposer les données privées. Ne jamais exécuter une signature Ed25519 à partir d'un script ou d'un secret que la PR peut contrôler.
6. Compléter le test de **36 vrais cas navigateur** (12 par pilote : six surfaces × desktop et mobile), contrôle de l'artefact GitHub source, des captures, de l'identité des relecteurs et signataire indépendant, avant de relier un émetteur d'attestation postdéploiement.

**Ne pas renseigner les secrets dans la PR.** L'environnement n'a pas été créé/configuré dans cette exécution : l'interface GitHub disponible ici ne permet pas de garantir ses restrictions/reviewers. Les noms et le workflow constituent un contrat préparatoire.

## 6. Conditions de sortie

- **Technique** : TypeScript zéro erreur, CI et tests adversariaux validés sur le dernier SHA.
- **Prépublication** : documents financiers et réglementaires vrais, rapprochements ou exceptions formelles réellement signées, relecture QA et audit séparés, lot approuvé, 12 preuves navigateurs privées par pilote. Ici : **non atteint**.
- **Production** : Netlify prêt et **actuellement publié au même SHA**, Supabase readback, 36 cas réels en production, signature externe fraîche et vérifiable. Ici : **non atteint**.
- **100/100** : seulement après toutes ces preuves. Aucun score PR statique, `trustedProtectedReadback:true` ou fiche avec réserves ne suffit.

Le déploiement Netlify observé était `6aec97d02a61623a0240031f` (commit `cdd65b06846054cfa2a9f949c491e5c2c2010534`), distinct de la branche PR. **Aucun merge ou déploiement effectué.**

## 7. Vérification du dernier cycle GitHub (constat, pas autorisation)

Exécution [admission #42096159139](https://github.com/Speedcup212/maximus-scpi/actions/runs/42096159139), SHA de code `d901b67447dfae74c8bc942e5a76c801c210999e` :
- **20 tests Node intégrés PASS / 0 FAIL** : protocole deux phases, rôles indépendants, vrais documents réglementaires, historique, navigateur 12 cas et exact SHA Netlify.
- **TypeScript PASS : zéro diagnostic restant** sur 1 023 initialement ; 0 diagnostic nouveau.
- **Prépublication : BLOCKED**. La dernière photographie PR ne remplace pas une lecture protégée courante.
- **Admission : 75/100 NO GO** ; l'étape finale refuse explicitement l'absence d'habilitations et de lecture post-déploiement.
- Le workflow `scpi-protected-postdeploy-admission.yml` a été créé dans la PR, mais **non exécuté sur `main`**, car il n'est pas encore fusionné et ses secrets/environnement protégés ne sont pas configurés.

Vérification directe Supabase (05/11/2026) : `scpi_candidate_batch_decisions`, `scpi_candidate_final_audit`, `scpi_candidate_final_review`, `scpi_candidate_regulatory_documents`, `scpi_publication_delegations` ont la RLS activée et aucun droit SELECT/INSERT/UPDATE `anon` ou `authenticated` dans les droits interrogés. La vue d'admission privée n'accorde pas SELECT à ces rôles ; c'est une vue, sa protection repose sur les privilèges et `security_invoker`.

**Condition réseau de l'exécuteur protégé** : pour GitHub-hosted runners, utiliser si nécessaire la chaîne de connexion IPv4 du **session pooler** Supabase plutôt qu'un endpoint de connexion directe IPv6. Vérifier l'accès sans afficher la chaîne, et privilégier un rôle PostgreSQL dédié en lecture seule avec `statement_timeout` et TLS.
