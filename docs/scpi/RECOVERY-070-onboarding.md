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
