# Revue finale SCPI — 8 octobre 2026

## Correction de l'échec Netlify

Build de production initial du commit `69c3a200` : échec du contrôle `scripts/checkScpiCertification.ts` sur **Crédit Mutuel Pierre 1** : `surcote_reconstitution` était publiée pendant un événement structurel (passage du capital variable au capital fixe).

La donnée source n'a pas été modifiée ni le contrôle désactivé. Dans **Supabase**, les alertes `surcote_reconstitution` / `decote_reconstitution` sont désormais filtrées **avant enregistrement** lorsqu'un événement structurel est actif. Le déclencheur protège aussi les futures régénérations. Invariant revérifié : zéro surcote/décote publiée dans un épisode structurel.

Migration versionnée : `20261008224000_guard_scpi_certified_analysis_consistency.sql`.

## Altixia Cadence XII — T2 2026

**Document primaire** : bulletin officiel **Altixia REIM 26-02 du 30/07/2026**, retrouvé sur le miroir PDF Rock-n-Data :
https://api.rock-n-data.io/fichiers/publications/6a708fd02b6f8415260897.pdf

Données du bulletin, contrôlées avec pages :
- Page 4 : TOF **92,4 %**, dette **10,9 %**, prix part **200 €**, retrait **182 €**, valeur de reconstitution **200,71 €**, réalisation **163,71 €**, capitalisation **190 356 200 €**, associés **2 453**, distribution T2 brute **2,52 €** par part.
- Page 8 : TOP **91,6 %**, WALT annoncé **5,7 ans**, WALB annoncé **2,3 ans**, **94** locataires.
- Page 9 : **951 781** parts, **4 505 parts en attente de retrait** ; **2 533** parts souscrites, **2 533** retirées.
- Page 7 : **32** actifs en portefeuille.
- Page 11 : capital **variable**.

**20 métriques** sont enregistrées dans `scpi_metric_certifications` avec le statut `manual_verified_official_document_mirror`, le document `scpi_bulletins` et les numéros de page. La fiche `scpi_indicators` et l'historique `scpi_indicator_history` portent désormais `2026-T2`.

Le module liquidité indique une file d'attente de **4 505 / 951 781 = 0,4733 %** : signal d'augmentation par rapport au T1, sans prétendre à un blocage généralisé.

## Précaution sur les durées de bail

Le bulletin **T1 2026** (source éditeur : https://www.altixia.fr/medias/documentations/doc1-20260430-122013.pdf, p. 8) présente visuellement WALT **2,6 ans** et WALB **5,9 ans** : le délai ferme semble excéder la durée totale. Le T2 rapporte 5,7 et 2,3 ans respectivement. Les valeurs publiées sont conservées, mais **la tendance trimestrielle WALT/WALB est neutralisée** en raison de l'incomparabilité manifeste du T1, sans réécrire les chiffres historiques.

## Contrôles et règle de déploiement

- `scpi_internal.scpi_fiche_history_audit_v1` : **61/61 CONSISTENT**.
- `scpi_internal.metric_conflicts_live` : **0 divergence active** sur les métriques auditées.
- `scpi_internal.publication_backfill_queue` : le ticket documentaire Altixia T2 est clôturé ; GitHub #118 clôturé.
- Contrôles de certification : aucune surcote/décote publiée avec `structural_event_detected`.
- Lancer **une seule release Netlify**, avec commit `[release]` après tests de la branche ; ne pas déclencher des rebuilds pour chaque correction de données.

Ce contrôle n'est pas une vérification exhaustive de toutes les données historiques ni une recommandation d'investissement.
