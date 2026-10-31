# MaximusSCPI — onboarding EdR Europa (66e SCPI)

## Périmètre
- Slug canonique : `edr-europa`; libellé affiché : EdR Europa ; société de gestion : Edmond de Rothschild REIM (France).
- Cible finale : 66 SCPI actives, **sans retirer les 4 CORUM** de la cohorte.
- Données initiales de référence : bulletin officiel T2 2026, URL `https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf`.
- Bulletin T3 2026 : signalé comme publié, **ne pas importer de chiffres T3 tant que le PDF source officiel exact n'est pas vérifié**.

## Réalisé le 31 octobre 2026
- Référentiel SQL : `scpi_indicators` contient une 66e entrée `edr-europa` au statut `pending_certification` (T2 2026), provenance par métrique et unités/périodes.
- `scpi_source_registry` renseigné avec URL officielle, bulletin, DIC, rapport annuel 2025, note d'information ; statut `incomplete`, `automation_enabled=false`.
- `scpi_source_connectors` : 66 lignes au total, connecteur `edr-europa` désactivé, 65 activés.
- `scpi_trajectory_pilot` : `edr-europa` désactivé, cohorte active maintenue à 65.
- `scpi_bulletins` : T2 2026 identifié, `qa_status=discovered` — **PDF non certifié / extraction automatisée non encore attestée**.
- `scpi_annual_reports` : références 2024 et 2025 déclarées `discovered`; ne pas présenter ces documents comme traités/certifiés.
- `scpi_history_scope` : début 2024 documenté ; `multiple_closings_unmodeled` pour exercices initiaux — une réconciliation est nécessaire.
- `scpi_name_aliases` : variantes officielles « Edmond de Rothschild Europa » et « EDR EUROPA ».
- Catalogue JSON et cohorte GitHub préparés, garde de recommandation automatique ajoutée pour les fiches `pending_certification`.
- Contrôle d'effectif strict de la CI / Edge Function OIDC préparé pour 66 **uniquement dans cette branche**.

## État des analyses après génération automatique
- Total : **66 analyses** en base, dont **52 `certified`**, **6 `current_certified_history_unverified`** et **8 `review_required`** (dont EdR Europa), au contrôle du 31/10/2026. Cela ne constitue pas 66 certifications complètes. Le statut de l'analyse EdR est `insufficient_history` ; `certification_reasons` inclut `current_source_not_certified`.

## Conditions obligatoires avant mise en production
1. Vérifier l'accessibilité et le contenu de chaque document officiel cité ; récupérer le **dernier** bulletin officiel T3 2026 s'il est effectivement disponible. Calculer hash, périodes et pages.
2. Ingestion réelle et QA du dernier bulletin, extraction de tous les indicateurs utiles avec preuve URL / page / date / unité ; appliquer la doctrine absence officielle ≠ échec d'extraction (TOF uniquement depuis bulletin du gestionnaire).
3. Vérifier les paramètres investisseur : entrée, frais, délai de jouissance, dividendes, liquidité, risque et concentration locative, avec bon périmètre des taux de gestion et souscription.
4. Reconstituer la trajectoire complète depuis 2024, avec traitement explicite des exercices clos multiples en 2024 ; certifier les années disponibles et justifier les données officiellement absentes.
5. Une analyse `scpi_bulletin_analysis` EdR a été générée automatiquement le 31/10/2026 après l'insertion : 66 analyses présentes, mais **EdR est en `review_required`, `current_source_certified=false`**. La faire relier au bulletin certifié, résoudre les motifs de revue et s'assurer que les 66 slugs correspondent exactement au fichier `certified_scpi_cohort.json`. Ne pas confondre présence d'une analyse et certification.
6. Activer `scpi_source_connectors.enabled`, `scpi_source_registry.automation_enabled` et `scpi_trajectory_pilot.enabled` **seulement après** la certification du périmètre, sans faire perdre le 65/65 existant.
7. Déployer la nouvelle version de l'Edge Function OIDC `scpi-release-certification-oidc` (source modifiée dans cette branche), en synchronisant ses exigences de cohorte 66. En l'état **la fonction active exige 65** : un merge prématuré bloquerait la CI.
8. Faire passer tous les tests de release : `npm run check:certification`, `npm run qa:scpi`, contrôles des 66 cartes et pages, comparaison, simulateurs, radar, trajectoire, espace client, sitemap/canonical/SEO ; aucune recommandation ou décote non certifiée.
9. Fusionner cette PR puis déployer **uniquement après** obtention des 66/66 validations documentaires et du bon effectif de la release.

**IMPORTANT — Ne pas fusionner ni activer directement depuis ce document.** L'ouverture d'une PR brouillon n'autorise pas la publication.
