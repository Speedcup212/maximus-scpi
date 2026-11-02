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
