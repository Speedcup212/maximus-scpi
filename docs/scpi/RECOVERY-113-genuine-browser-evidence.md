# RECOVERY-113 — Chaîne de preuves authentifiées, préflight protégé et captures vérifiables

Date : 05/11/2026. Projet : MaximusSCPI. PR #292, **draft**, publication et admission **NO GO**.

## 1. Audit contradictoire sur les artefacts réels de Sofidynamic

Lecture read-only Supabase `maximus_agents.scpi_candidate_final_review.review_evidence.browser_smoke` :
- GitHub run `41614241965`, commit `89c6debe146fe6f8d2386198af39be93a8483378`.
- La déclaration stockée pointe vers l'artefact `13220705285` avec SHA-256 ZIP `a26c74486a5c01232252ad101ab3ee615a46bcf73ea464164dbb7b428bed8a07` et **12 cases PASS**.
- Lecture **live de l'API GitHub** des artefacts de ce run : trois IDs **13221210168** (ZIP `7f649216...`), **13220232837** (`5e353067...`) et **13219943883** (`437cca085...`). Aucun ne correspond à l'ID et au digest enregistrés.
- Téléchargement réel de `13219943883` : archive SHA `437cca0854e3a9e17b3558c728fc173ddcc756fae4f661fda58043fbd35118f1` confirmé, neuf fichiers, dont `report-sofidynamic.json` énumérant **10 cases** et seulement deux PNG Sofidynamic `sofidynamic-1440.png`, `sofidynamic-390.png`.
- Téléchargement réel de `13221210168` : ZIP SHA `7f649216f75bf82db66674b16abae6ca38c2728cd258dd56a349b34d51501baa`, trois fichiers, dont rapport trajectoire avec **2 cases** et deux PNG de trajectoire.
- Ainsi **12 cas déclarés ≠ 12 preuves individuelles consolidées dans l'artefact annoncé**. Ceci invalide une lecture naïve de `browser_contract_ready` ; cela **ne signifie pas** que les composants ont échoué. Aucun ancien PASS de QA bancaire ou financier n'a été modifié.

## 2. Corrections versionnées dans les composants existants

### Moteur navigateur existant, pas de duplicata

- `scripts/scpi-onboarding/browser.mjs` sauvegarde maintenant une capture **par cas** (profile, comparator_analysis, radar, simulator, client_card) × deux largeurs et enregistre dans chaque cas `proof_file`, `proof_sha256`, `source_period`, `proof_kind`.
- `scripts/scpi-history/sofidynamicPrivateTrajectoryBrowser.mjs` produit deux captures trajectoire identifiées et hashées séparément.
- `scripts/scpi-onboarding/combinePrivateBrowserEvidence.mjs` regroupe **10 + 2** cas et captures réellement présents en un seul manifeste `scpi-browser-cases/v2` et vérifie **tous les SHA-256** avant d'écrire. Cette étape est ajoutée au **workflow préflight existant**, pas à un nouveau moteur.
- **Important :** les données de la prévisualisation Sofidynamic sont **T2 2026**, volontairement marquées `PRIVATE_T2_FIXTURE_NOT_CURRENT_T3_NOT_PRODUCTION` ; elles ne prouvent ni les chiffres T3 ni les six surfaces en production. La promotion T3 nécessite des captures sur les données privées actuelles, puis une revue indépendante.

### Lecture protégée des preuves GitHub réelles

- `githubArtifactProvenance.mjs` vérifie via GitHub API l'ID de l'artefact, son appartenance au run, le dépôt exact, le SHA du commit, la conclusion du workflow, l'empreinte ZIP et la chronologie.
- `githubArtifactArchive.mjs` télécharge la ZIP de l'artefact référencé via GitHub, sans transmettre le token à l'URL signée, impose un plafond de taille puis vérifie la ZIP par SHA avant de la confier à l'analyseur.
- `verify_browser_artifact.py` inspecte **les octets du ZIP** sans extraction : manifeste, période, commit, 12 surfaces uniques, noms de fichiers stricts, contenu de chacun des douze PNG comparé à son SHA.
- **Un fichier JSON en base, même avec 12 PASS et des chaînes SHA bien formées, ne permet plus une admissibilité par simple déclaration.**
- Le résultat de ces vérifications a toujours `publication_authorized:false` et ne prouve ni la véracité des données mockées, ni l'indépendance du QA, ni l'état réel de production.

### Résolution de la circularité de validation

- `protectedCandidateIdentity.mjs` exige que le SHA demandé soit **la tête courante de la PR #292**, même dépôt, même branche et `main` comme base.
- Le workflow protégé existant dans cette PR accepte désormais deux modes **à partir du code de `main`** :
  - `prepublication` : confronte en lecture seule les preuves live de la **PR candidate exacte**, sans exécuter son code, aux approbations et artefacts réellement produits ;
  - `postdeploy` : contrôle l'état Netlify/Supabase et le SHA réellement publié, avant toute attestation indépendante.
- Dans les deux modes, en l'absence des approbations et de la preuve indépendante : **NO GO ; pas d'écriture Supabase, pas de merge, pas d'autorisation de publier**.
- Les tests adversariaux Node et Python sont raccordés aux workflows de la PR et de préflight.

## 3. Ce qui demeure indispensable

1. **Bootstrap de confiance** : le contrôleur doit être revu puis rendu disponible sur `main` dans un environnement GitHub effectivement protégé (required reviewers + restriction de branche), avec un rôle PostgreSQL SELECT-only et un jeton GitHub `actions:read,pull-requests:read`. Il n'est **pas encore** exécuté sur `main` ; la PR #292 reste draft.
2. **Déclarations d'audit réellement indépendantes** : les trois `scpi_candidate_final_audit` sont `pending` et le lot `RECOVERY-100-THREE-PILOTS-20261105` est `draft`. La délégation de publication existante ne permet pas d'inventer les identités d'un réviseur et d'un auditeur indépendants.
3. **Sources Sofidynamic** : statuts réellement courants (dépôt juillet 2026) à télécharger/authentifier ; delta **15 parts** et plafond d'endettement à clarifier ou exception formelle protégeant les comparaisons concernées.
4. **AEW/Opus** : approbation effective des analyses et risques, contrôle du capital secondaire Opus, 12 preuves réelles par pilote, décisions de lot.
5. **Source temporelle** : le bundle Sofidynamic T2 est insuffisant pour le candidat T3. Il faut produire des captures sur le vrai snapshot privé T3. Toute comparaison entre dates reste contrôlée.
6. **Postdéploiement** : 12 contrôles réels par pilote sur la version Netlify publique au SHA exact, lecture sécurisée Supabase, puis attestation externe indépendante récente ; ce dernier composant n'est pas opérationnel.

## 4. Industrialisation future jusqu'à 200 SCPI

Conserver un **bundle de preuves par lot borné** (5 SCPI maximum), non une ZIP globale de 2 400 captures exécutée d'un bloc. Les réexécutions doivent viser le sous-ensemble touché par un changement de source, composant, contrat ou autorisation. Chaque bundle inclut son SHA code, période source, document et empreinte, les relecteurs et un statut non habilitant tant que le sign-off indépendant manque.

**Verdict :** circuit de preuves renforcé, ancienne incohérence documentaire identifiée et reproduite, vérification des octets préparée. Aucune certification T3 ni publication additionnelle n'est déclarée.

## 5. Crash test réel de la CI et correction du faux dossier Sofidynamic (05/11/2026)

**CI SHA `55142cca233648b64141fe120c5b77aeb0521f9f`** :
- Admission [#42117529697](https://github.com/Speedcup212/maximus-scpi/actions/runs/42117529697) : **33/33 tests Node PASS**, **6/6 tests Python PASS**, **TypeScript 0/1 023**, anti-régression PASS ; **75/100 NO GO** de contrôle des preuves toujours intentionnel.
- Premier préflight générique [#42117529516](https://github.com/Speedcup212/maximus-scpi/actions/runs/42117529516) : FAIL sur `TEN_PLUS_TWO_SOURCE_CASES_REQUIRED`. La cause réelle ne provient pas des nouveaux hash, mais du **statut déjà publié avec réserves** : `privatePreviewDisposition` retourne `ALREADY_PUBLIC_SKIPPED`, puis l'ancien workflow copiait à tort `report.json` issu des deux pilotes BNP vers `report-sofidynamic.json`. L'archive réellement téléchargée contient 20 cas BNP et aucun cas Sofidynamic ; les deux cas trajectoire sont à part.
- Correctif appliqué dans `.github/workflows/scpi-onboarding-preflight.yml` : on ne conserve un `report-sofidynamic.json` que s'il contient réellement les **10 cas Sofidynamic** sur les cinq surfaces et les deux largeurs. **Sinon SKIPPED est déclaré, sans copier le rapport BNP, sans créer de manifeste 12 cases.**
- Nouvelle CI sur le **SHA `740e2f0bc5e180015200302a5c872a09d8c36ea3`** : [préflight #42118151338](https://github.com/Speedcup212/maximus-scpi/actions/runs/42118151338) **SUCCESS**, 187 tests Node PASS, 6 tests Python PASS ; `SOFIDYNAMIC_PRIVATE_REPORT_NOT_EXECUTED` et `NO_SOFIDYNAMIC_PRIVATE_REPORT` explicitement journalisés. Build [#42118151320](https://github.com/Speedcup212/maximus-scpi/actions/runs/42118151320) **SUCCESS**. La réussite du préflight **ne vaut pas** exécution de 12 nouveaux cas Sofidynamic.
- Les nouveaux PNG et manifests *source-bound* sont désormais générés pour tout dossier réellement exécuté par le moteur navigateur générique. La preuve Sofidynamic T3 **reste à produire** depuis les bonnes données privées ; ses 12 captures ne sont pas fabriquées à partir des tests BNP.

**Sources publiques complémentaires** : Pappers et Societe.com répertorient le dépôt de statuts Sofidynamic du **08/07/2026**, sans téléchargement du PDF source authentifié à ce stade :
- https://www.pappers.fr/entreprise/sofidynamic-983023003
- https://www.societe.com/societe/sofidynamic-983023003.html

## 6. Prérequis avant toute promotion

Le prochain saut fonctionnel nécessite un test navigateur **T3 Sofidynamic réellement exécuté**, ainsi que des snapshots privés actuels AEW/Opus et de leurs douze cas, puis vérification du ZIP par le contrôleur externe protégé, revue financière/juridique imputable et audit indépendant. Le pipeline ne doit plus traduire un SKIPPED en PASS. **Aucune migration financière ou publique, aucune promotion QA, aucun merge/déploiement effectué dans RECOVERY-113.**
