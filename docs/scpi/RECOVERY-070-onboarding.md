# RECOVERY-070 — Industrialisation progressive de l'onboarding SCPI
Date : 2026-11-02. Objectif : réutiliser le pipeline certifié existant plutôt que créer un second éditeur.

## Exécution générique (prépublication, sans écriture en production)
1. Préparer un manifeste dans scripts/scpi-onboarding/fixtures/ avec slug, nom, période trimestrielle, période annuelle si disponible, prix et domaines officiels. Exporter le vrai staging privé, sans données simulées. Cet export ne constitue pas une attestation.
2. Exécuter node --test scripts/scpi-onboarding/preflight.test.mjs.
3. Exécuter node scripts/scpi-onboarding/preflight.mjs --manifest scripts/scpi-onboarding/fixtures/bnpp-2026-t3.json.
4. Sur GitHub CI avec Chromium : SCPI_ONBOARDING_MANIFEST=... node scripts/scpi-onboarding/browser.mjs.
5. Vérifier le rapport JSON et la matrice des interfaces, puis exécuter les gates financiers, revue des anomalies, OIDC, RLS anonyme, cohorte, Netlify SHA et promotion atomique EXISTANTS.

## Invariants
- Aucune candidate ne remplace une SCPI publiée ; effectif de cohorte calculé à partir des identités, jamais d'une constante.
- L'extraction ne modifie pas la production ; source HTTPS éditeur, page, SHA-256, période et date sont obligatoires pour les métriques attestées.
- Réalisation/reconstitution : dernière date d'arrêté officielle, sans interpolation trimestrielle.
- TD annuel : période YYYY-RA et rapport officiel distinct ; nouvelle SCPI sans année publiée admise si l'absence est documentée.
- OFFICIALLY_ABSENT exige une preuve documentaire ; LAST_OFFICIAL_VALUE exige une date et son PDF ; EXTRACTION_FAILED bloque la valeur.
- Historique insuffisant : pas de tendance inventée. Un champ optionnel non classé reste signalé, jamais déclaré certifié.
- Le préflight est toujours publication_authorized=false ; la CI ne crée pas de signature humaine.

## Limites de cette tranche
Cette implémentation apporte un préflight réutilisable et une matrice navigateur paramétrée par manifeste pour les surfaces fiche, comparateur, radar, simulateur et carte client. Les contrôles spécifiques antérieurs, dont trajectoire, restent en place. Elle ne prétend pas avoir automatisé de bout en bout la découverte, les attestations en base, les valorisations datées ni le rollback. L'intégration de la 69e SCPI reste le test d'acceptation final du circuit.

## Phase 2 — Valorisation et découverte SCPI 69 (lecture seule)
- Le préflight réconcilie désormais les valorisations de reconstitution et de réalisation par date d'arrêté, à travers plusieurs bulletins, et bloque les montants contradictoires pour une même date. Une répétition d'une valeur datée dans deux trimestres n'est jamais une nouvelle expertise.
- L'identité source, la page, le SHA-256, la période et le montant déclaré dans la preuve sont contrôlés ; le résultat n'écrit aucune valeur financière en production.
- Sofidynamic est le pilote documentaire potentiel de la 69e SCPI : société de gestion Sofidy, bulletin T2 2026 officiellement annoncé, rapport annuel 2025 lié. Le PDF T2 binaire et ses preuves par page ne sont pas encore archivés/certifiés. Cette candidate conserve son statut privé.
- Les contrôles de release complets (rôle de service, OIDC distant, données bancaires, QA indépendante déléguée, navigateur, RLS anon, SHA du Netlify READY, atomicité) restent séparés et obligatoires avant activation. Ce livrable ne les simule pas.

## Phase 3 — Téléchargement officiel et preuve binaire (Sofidynamic)
- Le script `scripts/scpi-onboarding/publisherPdfAudit.py` vérifie les URL HTTPS de l'émetteur, les éventuelles redirections, les octets PDF, le SHA-256, la lisibilité du texte, l'identité SOFIDYNAMIC et la période annoncée pour T1/T2 2026 et le rapport annuel 2025.
- Les montants repérés par page restent des *indices* à revoir : un nombre présent dans un PDF n'atteste pas à lui seul le sens, l'unité, les risques ni la cohérence financière. Ces indices ne sont **jamais certifiés** par ce script.
- Le workflow `.github/workflows/scpi-official-pdf-proof.yml` produit un artefact de rapport technique (sans binaire PDF, sans signature, sans mise à jour Supabase) ; tout échec HTTP/identité/période fait échouer la CI, au lieu de simuler un document vérifié.
- Le passage aux tables `maximus_agents.scpi_candidate_document_index`, `scpi_candidate_pdf_validation`, `scpi_candidate_metric_evidence` puis aux vérifications privées n'est possible qu'après lecture et rapprochement réels du binaire et un processus de certification conforme.
- Aucune création de SCPI publique, aucun déploiement Netlify et aucun contournement OIDC/RLS ou validation financière.

## Revue visuelle ciblée
- Le bulletin Sofidynamic T2 2026 contient le TOF **97,73 %** page 4 dans un graphique PDF, mais la couche texte ne porte pas exactement la chaîne « 97,73 ». Le test textuel ne doit donc jamais en déduire une absence officielle. La revue de la page rendue est nécessaire et a été exécutée.
- L'audit source produit désormais les captures des pages pertinentes pour le contrôle secondaire des graphiques, montants et dates (T2 pages 1/2/4/5/6, T1 pages 1/5, RA 2025 pages 3/9). Elles ne valent pas validation indépendante à elles seules.
- Les métadonnées documentaires officiellement vérifiées sont enregistrées en **staging privé** (index + validation PDF) avec hash et pages ; aucun montant de la base publique n'est touché.

## Registre de sources et preuves privees
- Migration appliquee 20261102142947 : maximus_agents.scpi_candidate_issuer_hosts ; source_url admise uniquement si HTTPS et hostname present dans le registre prive (CORUM, BNP Paribas REIM, Sofidy). Aucun role anonyme ni authentifie n'a le droit de modifier ce registre, lecture service_role seule.
- 11 metriques candidate Sofidynamic dans la table privee maximus_agents.scpi_candidate_metric_evidence, et un manifeste repro de valeurs, pages, unites, empreintes sous scripts/scpi-onboarding/fixtures. Toutes portent pending_independent_qa. Aucun QA-pass ni revue independante n'est auto attribue.
- Les valeurs realisee/reconstitution 305,55/336,75 EUR concernent le 31/12/2025, non le T2 2026. Le TOF 97,73% T2 est dans le graphique p4 ; lecture du rendu et non extraction textuelle.

## Phase 4 — Candidat Sofidynamic mis en staging privé (02/11/2026)
- Le snapshot privé contient désormais 29 métriques documentées réparties sur T1/T2 2026 et RA 2025, sans aucune certification indépendante. Les onze répartitions du T2 sont au statut needs_review (géographie 99,9 % arrondi éditeur ; secteurs 100 %).
- Migration 20261102150657 appliquée : une allocation publiée à une décimale peut présenter au maximum une erreur d'arrondi de 0,05 point par ligne ; la somme est contrôlée dans cette borne au lieu d'exiger abusivement exactement 100,000. La QA des lignes, des empreintes, des pages et l'identité de la SCPI restent des conditions bloquantes. La vue conserve security_invoker=true et les grants privés.
- La table maximus_agents.scpi_candidate_indicator_stage est alimentée avec capitalisation **247,58848 M€** (valeur source **247 588 480 €**) ; il ne faut jamais confondre ces unités. Prix de reconstitution 336,75 € et valeur de réalisation 305,55 € datent du **31/12/2025**, et non du T2 2026. Statut pending_independent_qa ; aucune promotion publique.
- Registre réglementaire Sofidy : découverte de liens PDF officiels par HTTPS/TLS vérifié, sans attribuer de QA avant contrôle des fichiers. Dernier bulletin visible sur Sofidy au 02/11/2026 : T2 2026. La publication Sofidynamic reste interdite tant que la revue financière, l'adéquation réglementaire, le DIC et la note, les historiques et la QA interfaces ne sont pas certifiés.

## Phase 4 — Réglementation et identité du gestionnaire vérifiées (02/11/2026)
- Sofidynamic : société de gestion juridique **Tikehau Investment Management**, marque commerciale **Sofidy**. La fiche privée et le référentiel candidat sont corrigés ; aucune exposition publique.
- PDF DIC du 01/08/2026 vérifié : 3 pages, empreinte SHA-256 `1b1e7acf03074e0dec326aa46c39df84c0302b21be337fcd97379c042aeec6e2`. Note d'information de 2026 vérifiée : 43 pages, empreinte `782f5b2fcdabe3cc5219fe3bb49e7a636760b42b2c5f3afa2b4110fc853e51c3`.
- Statuts fournis par la page du diffuseur : édition juillet 2025, 21 pages, SHA-256 `d6873340ccb0c8a7eb1db75e238cb26b6ac1c49e2e396bc5207e095cc2295ebe`. Le registre indique un dépôt mis à jour le 08/07/2026 ; la version juillet 2025 est enregistrée **historique seulement** (`kind_verified=false`) et ne satisfait pas le contrôle courant. Ne pas inventer ni réattribuer cette approbation.
- Le contrôle de la publication conserve le seuil de trois documents à jour, la revue des 29 preuves métriques et 11 allocations, la validation du comparateur/simulateurs/trajectoire et la certification financière finale. Aucun PASS fictif.
