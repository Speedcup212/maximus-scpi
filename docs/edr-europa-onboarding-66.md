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


## Reprise du 31/10/2026 — audit complémentaire et conformité
- Confirmation officielle : première souscription de **25 parts**, prix courant **202 €**, soit **5 050 €** (note d'information juin 2026 p. 12-13). Corrigé dans le JSON ; l'ancien 5 000 € était la valeur commerciale basée sur 200 €.
- Frais distincts : **commission de souscription 10 % HT / 12 % TTC**, **gestion 10,50 % HT / 12,60 % TTC** sur produits locatifs HT encaissés et produits financiers nets (bulletin T2 2026 p. 9). Corrigés dans le catalogue et `scpi_indicators.frais_gestion`. Provenance et unités dans les données.
- Documents périodiques officiels identifiés et enregistrés dans `scpi_bulletins` : `2024-T2`, `2024-T3`, `2024-S2`, `2025-T3`, `2025-S2`, `2026-T1`, `2026-T2` ; **7 sources distinctes** au statut `discovered`, extraction/QA non attestée.
- Backfill : 10 entrées `scpi_backfill_queue` pour EdR avec contrôle de source explicite, dont `2025-T1`, `2025-T2`, `2026-T3` sans URL directe officielle confirmée. Enregistrement dans la file de revue ne vaut pas traitement ni certification.
- Rapports annuels 2024 et 2025 identifiés dans `scpi_annual_reports` et mis en file `scpi_annual_backfill_queue` au statut `pending` ; **ne pas assimiler l'existence de leur URL à une extraction**.
- Première et seconde clôtures comptables 2024 identifiées ; `scpi_history_scope` garde `multiple_closings_unmodeled` jusqu'à réconciliation démontrée.
- Un article externe du 30/10/2026 mentionne un bulletin T3 2026, mais le PDF officiel T3 n'est pas relié depuis le site du gestionnaire au moment de la vérification. Les données T3 ne sont **pas importées**.
- Test intégré au `prebuild` et à `qa:scpi` : `node --test scripts/scpi-agents/test-edr-europa-onboarding.mjs`. **Tests de CI à exécuter par GitHub Actions** ; présence du test dans le code ≠ passage du job distant.
- `scripts/checkScpiCertification.ts` : garde additionnelle **fail-closed** en release, pour les **66** sources courantes ayant un statut `certified` et une URL officielle, sans exception de cohorte.
- **Incident de transition 65→66 résolu en production :** fonction OIDC Supabase déployée en v2, désormais filtrée sur `scpi_trajectory_pilot.enabled=true`, contrôle exact **65** conservé. Correctif synchronisé avec la branche `main` (commit `f894275b28ba75ccd1f519a7a5c364a4fbc04e6b`). La branche EdR prépare le même filtre avec exigence **66**. **Ne pas déployer la version 66 tant qu'EdR n'est pas activée et complètement certifiée.**

## Liste des documents officiels découverts
| Période | Statut | Document |
|---|---|---|
| 2024-T2 | découvert | https://edr-europa.com/wp-content/uploads/2024/08/SCPI-Edmond-de-Rothschild-Bulletin-trimestriel-30-06-2024-1.pdf |
| 2024-T3 | découvert | https://edr-europa.com/wp-content/uploads/2024/11/SCPI-Edmond-de-Rothschild-Europa-Bulletin-trimestriel-T3-2024.pdf |
| 2024-S2 | découvert | https://edr-europa.com/wp-content/uploads/2025/02/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-S2-2024-2.pdf |
| 2025-T3 | découvert | https://edr-europa.com/wp-content/uploads/2025/11/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T3-2025.pdf |
| 2025-S2 | découvert | https://edr-europa.com/wp-content/uploads/2026/01/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-S2-2025.pdf |
| 2026-T1 | découvert | https://edr-europa.com/wp-content/uploads/2026/05/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T1-2026.pdf |
| 2026-T2 | découvert | https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf |

**Interdiction de publication :** tant que 66/66 certifications et le contrôle d'historique ne sont pas prêts, garder cette PR en brouillon et les deux options EdR de connecteur / pilote désactivées. La CI GitHub et le test Netlify restent à établir.


## Audit source exécuté — GitHub Actions 31/10/2026
Preuves reproductibles et non-certifiantes :
- [Audit PDF 41183264173](https://github.com/Speedcup212/maximus-scpi/actions/runs/41183264173) : **12/18 documents téléchargés, identité de l'émetteur vérifiée par texte PDF, empreinte SHA256 calculée** ; 6 anciennes URL officielles renvoient encore HTTP 404, et le job reste volontairement en échec.
- **Trois PDF sur domaine officiel EdR** : bulletin T2 2026 (11 p., SHA256 `401987ac4d713eb30253a3d327b76b723c73753f72b5b31e28ffcd504f737d7d`), rapport annuel clos 31/12/2024 (44 p., SHA256 `05263c54c27697ed1f7036f1f620ea106094d25427376bdeda25d925e382b640`, titre exact confirmé malgré nom de fichier ambigu) et rapport annuel 2025 (79 p., SHA256 `cfb2b425b57146fec7ee7b765e92c6855989f778ea82d6a10067321cc90cd192`).
- **Premier rapport annuel clos le 30/06/2024** : PDF de l'émetteur hébergé chez Fortuny Conseil, 37 p., SHA256 `a8e8590987611879323ab2975c5b0e8e64e9cb0de8abd7db94b36fb82b1ba35d`. Son hébergement tiers est explicite et exige une validation d'origine avant certification.
- **Huit bulletins d'origine EdR archivés chez FranceSCPI**, périodes 2024-T2, 2024-T3, 2024-T4, 2025-T1, 2025-T2, 2025-T3, 2025-T4, 2026-T1 ; les huit documents ont passé la vérification SHA, de période et d'identité. Toutefois, les exemplaires hébergés chez le distributeur sont des copies parfois filigranées et **ne sont pas des originaux téléchargeables du site du gestionnaire**. Leurs 8 URL, empreintes, pages, origine et restrictions de certification sont dans `public.scpi_source_link_audit` (sous le slug `edr-europa`). Les six anciennes URL du domaine EdR restent notées HTTP 404.
- **Historique en base** : 8 lignes `scpi_indicator_history`, de 2024-T2 à 2026-T2, plusieurs trimestres ayant seulement les dividendes. 23 preuves trimestrielles, 26 candidats annuels (13 sur 2024 clôture décembre, 13 sur 2025) ; toutes les validations finales restent en attente.
- T3 2026 : des informations secondaires datées du 30/10/2026 l'évoquent, mais le PDF original officiel n'est pas encore retrouvé ; **aucune valeur T3 n'est publiée sous statut certifié**.
- Technique CI : les anciens tests/étapes de validation 61→65 et le sitemap ont été adaptés sur branche au périmètre 61+4 CORUM+EdR ; des jobs GitHub Actions continuent d'échouer tant que l'ensemble de la matrice de release et l'archive officielle ne passent pas. **Ne pas fusionner** avant les tests complets.

**Point réglementaire** : les valeurs TOF retenues ou certifiées pour MaximusSCPI doivent provenir des bulletins de chaque société de gestion. Les miroirs tiers ne justifient pas une certification de TOF indépendante des originaux.


## Certification documentée le 31/10/2026 — issue de la lecture des PDF officiels
- Bulletin original **T2 2026** (11 pages, `SHA256=401987ac4d713eb30253a3d327b76b723c73753f72b5b31e28ffcd504f737d7d`) : **23 certificats** de champ en `public.scpi_metric_certifications`, `manual_verified_official_pdf_sha256_page` (dont dividendes rétrospectifs, TD2025, 16 métriques courantes); 43 tests indépendants valeur+page réussis sur l'ensemble du lot bulletin/RA. URL : https://edr-europa.com/wp-content/uploads/2026/07/SCPI-Edmond-de-Rothschild-Europa-Bulletin-dinformation-T2-2026.pdf .
- Rapports annuels originaux **2024 clôture décembre** (44 pages, SHA256 `05263c54c27697ed1f7036f1f620ea106094d25427376bdeda25d925e382b640`) et **2025** (79 pages, SHA256 `cfb2b425b57146fec7ee7b765e92c6855989f778ea82d6a10067321cc90cd192`) : **13 champs certifiés par exercice**, soit 26 au total. Seuls ces 13 champs officiels et leurs périodes ont le niveau certificat ; autres annexes non certifiées.
- **Note d'information officielle** de juin 2026 (39 pages, SHA256 `abab3708fc0240a16390e55714b0866666e3cc65b3d45bcaf3f59a00a495acea`, preuve GitHub Actions https://github.com/Speedcup212/maximus-scpi/actions/runs/41183919228) : **8 observations certifiées** : 25 parts initiales (p.12), prix courant 202€ (p.13), 10% HT/12% TTC frais d'entrée (p.20), 10,50% HT/12,60% TTC gestion (p.20), premier jour du sixième mois suivant souscription pour entrée en jouissance (p.13), minimum calculé 5 050€. Pour les frais, respecter la base de calcul, les éventuelles modalités/exception et les unités HT/TTC.
- **Décote** prix/reconstitution T2 2026 : **-5,07 %**, visible au bulletin original p.4, certificat distinct.
- **TOTAL 58 observations certifiées** dans `public.scpi_metric_certifications` (23 bulletin et rétrospective + 26 annuelles + 8 note + 1 décote), chacune avec URL, page, période, valeur et type de preuve.
- **Recalcul du moteur de certification Supabase effectué** après certification T2 original : `current_source_certified=true`, `source_confidence=1`, bulletin et snapshot reliés par ID. Statut global **`current_certified_history_unverified`** (et `comparison_certified=false`) : l'original du bulletin T1 2026 (sur site source en version consultable) n'a pas pu être téléchargé en octets et hashé par le pipeline, six anciennes URLs officielles ont répondu HTTP404, les copies archivées par FranceSCPI sont clairement marquées comme des miroirs tiers. **Ne pas certifier le TOF T1 sur le seul miroir**.
- Cette preuve de source courante est distincte de la **publication** : EdR reste `scpi_trajectory_pilot.enabled=false`, `scpi_source_connectors.enabled=false`, et `maximus_publication_status=pending_certification`. PR en brouillon.
- Bulletin officiel T3 2026 toujours non obtenu ; aucun indicateur T3 certifié ; l'historique 2024 comporte deux clôtures distinctes.
- Mise à jour du catalogue JSON et du test de contrat EdR sur cette branche pour inclure 58 champs, empreinte de la note et certification T2 courante sans fausse attestation de l'historique.

**Doctrine :** ne jamais certifier sur seul taux secondaire, ne jamais déguiser une URL historique renvoyant HTTP404 en original téléchargeable, ne pas imputer une valeur au T1 si le document donne comme date de valorisation le 31/12/2025. Tout gain de statut historique doit résulter de la preuve du bulletin d'origine, pas du changement manuel du champ `qa_status`.


## État actualisé du 31 octobre 2026 — production 66 et valorisations datées

**Cette section prévaut sur les mentions « pending_certification » ci-dessus, qui documentent les étapes préparatoires de la PR #244.**

- SCPI EdR Europa et quatre CORUM comprises dans les **66 SCPI actives**, sources courantes certifiées.
- Raccordement du prédicat sécurisé `maximus_scpi_is_in_public_cohort` aux historiques publics EdR.
- **Cinq valeurs d'arrêté vérifiées** (reconstitution / réalisation par part) : 30/06/2024 203,85 € / 171,33 € ; 31/12/2024 210,81 € / 169,60 € ; 30/06/2025 213,21 € / 174,71 € ; 31/12/2025 220,66 € / 179,28 € ; 30/06/2026 212,78 € / 174,23 €. Chaque valeur conserve son document, sa page et sa date.
- **T3 2025 et T1 2026 ne comportent pas une nouvelle valeur d'arrêté** : le comparateur présente désormais la dernière valeur officielle connue directement en montant avec mention distincte de sa date d'arrêté, et ne crée aucun point de valorisation artificiel.
- Historique public : 8 périodes couvrant 2024-T2 à 2026-T2, dont 5 couples de valorisation, distributions vérifiées et observations locatives selon pièces disponibles. Absences réelles restent N.D., sans zéro fictif.
- Note historique : deux clôtures 2024, 2025 pleinement documenté, distribution totale 2024 non reconstituée artificiellement.
- Code fusionné : PR #245 (trajectoire et valorisations), PR #247 (affichage dernière valeur datée), commit de code `599ae7e10592eeee1b76807a47e7f058773236e8`. CI GitHub [41190737591](https://github.com/Speedcup212/maximus-scpi/actions/runs/41190737591) : succès, incluant validations Chromium desktop et mobile et certification distante de la cohorte.
- **Ce paragraphe ne prouve pas un déploiement Netlify** : publication de la version frontend à contrôler séparément par l'ID et le SHA du déploiement effectif.

## Release EDR Europa — reprise du 31/10/2026 (supersède l'état documentaire précédent)

- État confirmé en base Supabase de production : `edr-europa` actif dans la cohorte 66 ; `scpi_bulletin_analysis.certification_status=certified`, `current_source_certified=true`, `comparison_certified=true`, `scpi_crash_test_status=PASS`, `scpi_operational_status=DONE`.
- Neuf périodes trimestrielles conservées : 2024-T2, 2024-T3, 2024-T4, 2025-T1, T2, T3, T4, 2026-T1 et T2. TOF 100 % documenté pour chacune par un bulletin rédigé par l'émetteur ; distinguer originaux téléchargeables des copies hébergées par distributeur, sans attribuer une empreinte d'original à une copie.
- Cinq couples réalisation/reconstitution datés aux 30/06/2024, 31/12/2024, 30/06/2025, 31/12/2025 et 30/06/2026 ; dates d'arrêté réelles, pas de valeurs trimestrielles interpolées.
- Le bulletin T2 2026 officiel : correction du JSON d'extraction automatique (nombres de parts, immeubles, dividende, valorisations) en préservant l'ancienne extraction pour audit ; horodatage de l'historique rectifié au 30/06/2026.
- Rapports annuels 2024 et 2025 certifiés en base avec arrêts au 31 décembre ; première clôture distincte du 30 juin 2024 maintenue dans l'historique.
- Fichier statique `src/data/scpiIndicatorHistory.json` enrichi de neuf périodes, et test `test-edr-europa-onboarding.mjs` complété ; `scpi_publish_queue` contient l'événement `trajectory_data` tant que la mise en ligne n'est pas confirmée.
- Les commits préparatoires sans token ont été volontairement ignorés par `scripts/netlify-ignore.mjs`. Ce commit est le **déclencheur unique** de build Netlify de production via le marqueur `[deploy]` ; le succès du build, l'ID de déploiement et le rendu public doivent être vérifiés avant de marquer l'événement publié.
