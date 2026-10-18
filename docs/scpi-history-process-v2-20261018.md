# Processus historique SCPI V2 — source → preuve → données → affichage

Date : 18 octobre 2026. Ce document remplace l'équivalence incorrecte « année dans la file = année certifiée ». **Ne pas créer une seconde base de données historiques.** Les vues de contrôle lisent les tables annuelles et trimestrielles existantes.

## Définition des trois statuts indépendants

1. **Données courantes vérifiées** : source officielle, période, métrique, QA, affichage courant. Les indicateurs T2 2026 peuvent être exacts sans historique.
2. **Noyau historique vérifié** : chaque exercice clos depuis le lancement contient (a) distribution brute annuelle par part, (b) valeur de réalisation par part, (c) valeur de reconstitution par part, chacune avec valeur, preuve/page et contrôle manuel valide. Les exceptions motivées ne sont jamais des données chiffrées. Le marqueur `CORE_HISTORY_VERIFIED` est réservé à **toutes** les valeurs présentes ; `CORE_HISTORY_WITH_EXCEPTIONS` reste distinct.
3. **Fiche intégralement certifiée** : 1 et 2, ET autres familles de données prévues, ET propagation vérifiée dans fiche/comparateur/analyse/radar/trajectoire/espace client. La certification du noyau historique n'autorise PAS à elle seule `PASS_100`.

**Interdit :** déclarer `PASS_100`, `DONE` ou `historique complet` à partir d'un statut de file `extracted`, d'un taux de confiance, du seul nombre de PDF ou d'un test de chargement de page.

## Une seule chaîne de production

| Étape | Preuve d'achèvement | Sinon |
|---|---|---|
| Identité du fonds et année de lancement | `scpi_history_scope.start_year_status=official_verified`, source publique et note de vérification | `catalog_provisional` / `missing` |
| Périmètre des exercices | De l'année de lancement au dernier exercice civil clos | Aucun exercice créé hors période |
| Recherche documentaire | Registre `scpi_annual_reports` (source, année, PDF, empreinte) | `report_to_discover` |
| Extraction et recoupement | Données par année + page du PDF + année de la colonne réellement retenue | `unverified_value`, pas de passage automatique en certifié |
| Certification | `scpi_annual_fundamentals` : `manual_verified_official`, confiance ≥ 0,95, page et source, trois champs renseignés | Statut partiel |
| Exceptions véritables | `scpi_history_metric_exceptions` : motif et preuve officielle de non-publication ou non-applicabilité, page, reviewer | `NULL`, jamais zéro |
| Réconciliation des registres | Les métriques 2025 déjà certifiées dans `scpi_metric_certifications` sont rapprochées avec `scpi_annual_fundamentals` sans recopier aveuglément les définitions « brut »/« net » | `verified_elsewhere_not_reconciled` |
| QA produit | Vérification numérique de la série, des années et dates de chaque surface, non-régression | Pas de label intégral |
| Publication | Un lot cohérent, un déploiement Netlify explicite puis lecture réelle du public | Ne pas annoncer « publié » |

La vue `scpi_history_metric_audit_v1` examine **année × indicateur**. La vue `scpi_history_year_audit_v1` exige trois métriques. La vue `scpi_history_readiness_v1` consolide par SCPI. Ce sont des registres de **diagnostic** et non de publication.

## Cas CORUM : lot pilote prioritaire, pas d'extension avant résultat

- Origin : 2012–2025 = **14** exercices.
- XL : 2017–2025 = **9** exercices.
- Eurion : 2020–2025 = **6** exercices.
- USA : 2024–2025 = **2** exercices.
- Total : **31 exercices, 93 contrôles financiers de base**. **31 lignes** sont placées dans `scpi_annual_backfill_queue` au statut `to_discover` sans lancement d'agent ni achat d'API.
- Les preuves CORUM 2025 déjà inscrites dans `scpi_metric_certifications` doivent être réconciliées **en premier**, pas re-téléchargées et re-certifiées indistinctement.
- Pour les années antérieures : utiliser d'abord les tableaux comparatifs des rapports déjà identifiés, contrôler chaque colonne/année, puis chercher uniquement les rapports complémentaires nécessaires. Ne jamais dater artificiellement une valeur 2025 en 2018.
- Le moteur `scpi-annual-safe-extract` doit traiter les anciens exercices comme **candidats en attente de QA de colonne**, pas faire une promotion implicite.

## Traiter les 61 existantes puis généraliser aux 211–225

Au 18/10/2026, le registre courant couvre **65 SCPI** : 54 années de départ provenant du catalogue sont enregistrées comme **provisoires** ; 11 sont à retrouver ; aucune année de départ n'est encore officiellement validée dans le registre de lancement. Sur les 54 périmètres calculables, la couverture provisoire couvre 897 exercices, dont 13 disposent des trois métriques annuelles acceptées avec preuves par page selon la règle stricte. Ne jamais confondre ces chiffres avec 897 documents à télécharger : les tableaux pluriannuels peuvent couvrir plusieurs exercices.

Traiter les manques par priorité documentaire **sans repartir à zéro** : d'abord données certifiées dans un autre registre, ensuite PDF déjà présent, ensuite document à découvrir ; certification des années de départ ; QA et tests. L'extension à d'autres SCPI ne démarre qu'après un **pilote CORUM complet et testé**, réutilisable sans correctifs manuels SCPI par SCPI.

## Coût et exécution

- Ne pas multiplier les agents ni leur fréquence ; garder les quotas existants.
- Une seule modification de code en lot, pas un déploiement pour chaque indicateur.
- `node scripts/scpi-history/seed-provisional-start-years.mjs` : aperçu **sans mutation** ; `--apply` uniquement pour la synchronisation voulue.
- `scripts/scpi-history/verify_history_readiness.sql` : test SQL sans écriture.
- La synchronisation du catalogue injecte désormais `maximus_history_status`, `maximus_history_years_expected`, `maximus_history_years_verified`. Sans lecture du registre privé, statut `NOT_ASSESSED` et **aucune déclaration implicite** de complétude.
- La propagation au site nécessite une PR testée puis une publication autorisée et contrôlée ; la migration SQL ne modifie ni le statut courant des SCPI, ni la cohorte publique.

**Définition de fin de chantier :** les quatre CORUM ont tous leurs exercices historiquement justifiés, les trois séries réconciliées, les autres familles de données vérifiées ou explicitement signalées, le rendu complet prouvé sur tous les modules et les contrôles de production sans divergence. Alors seulement établir un modèle standard pour toute nouvelle SCPI.
