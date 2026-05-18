# TASK-DATA-AUTO-001 — Pipeline autonome Data SCPI (51 SCPI)

## Objectif

Concevoir un pipeline autonome capable de récupérer, contrôler, extraire, historiser et proposer la mise à jour des données SCPI pour les **51 SCPI** présentes dans MaximusSCPI, avec un objectif d’**efficacité supérieure à 95 %** sur les **données publiables** uniquement.

## Principe central

L’agent ne doit **plus** demander de validation humaine **SCPI par SCPI**.

Il doit :

- traiter les SCPI par **lots** ;
- appliquer des **règles métier prédéfinies** ;
- **publier uniquement** les données à **haute confiance** ;
- **mettre automatiquement en quarantaine** les cas douteux ;
- **rejeter automatiquement** les sources non officielles ;
- produire **uniquement un rapport d’exception** ;
- **ne jamais publier** une donnée non sourcée, non datée ou ambiguë.

## Définition de l’efficacité >95 %

L’objectif **>95 %** porte **uniquement** sur les **données publiables**, c’est-à-dire les données qui remplissent **toutes** les conditions suivantes :

- source **officielle** ;
- **hub documentaire officiel** identifié ;
- **document officiel daté** ;
- donnée **localisée** dans le document ;
- **extraction structurée** ;
- **cohérence** avec l’historique ;
- **confidence_score >= 0.95** ;
- absence de **variation anormale** non expliquée.

Les données incertaines **ne doivent pas** être publiées. Elles doivent être placées en **quarantaine**.

## Règles métier automatiques

1. Source officielle obligatoire.
2. Hub documentaire prioritaire.
3. PDF isolé jamais utilisé comme source principale.
4. Donnée sans date = rejet.
5. Donnée sans document = rejet.
6. Donnée sans localisation = quarantaine.
7. Donnée contradictoire entre deux documents = quarantaine.
8. Variation forte vs historique = quarantaine.
9. Portail avec login / gate instable = quarantaine.
10. Marketplace, distributeur, blog, comparateur ou média = source interdite.
11. Rendement passé **jamais** présenté comme indicateur futur.
12. Aucune recommandation personnalisée.
13. Aucun score MaximusSCPI modifié sans historique.
14. Toute publication doit être **réversible**.

## Statuts automatiques

- `validated_auto`
- `published_auto`
- `quarantine_review`
- `rejected_source`
- `rejected_low_confidence`
- `rejected_missing_date`
- `rejected_missing_document`
- `rejected_non_official_source`
- `blocked_gate_or_login`
- `extraction_failed`

## Pipeline cible

1. Charger les 51 SCPI depuis les fichiers data existants, **en lecture seule**.
2. Regrouper les SCPI par société de gestion.
3. Identifier ou vérifier la **page produit** officielle.
4. Identifier ou vérifier le **hub documentaire** officiel.
5. Détecter les documents disponibles :
   - bulletin trimestriel ;
   - rapport annuel ;
   - DIC / KID ;
   - note d’information ;
   - statuts.
6. **Versionner** les documents détectés.
7. Extraire les **champs prioritaires**.
8. Comparer avec les données actuelles.
9. Calculer les variations.
10. Calculer un **confidence_score**.
11. Classer chaque donnée.
12. **Publier** seulement les données `validated_auto` (seuil de confiance et règles à préciser dans la phase de conception / implémentation future).
13. Placer les autres en `quarantine_review` (ou statuts de rejet appropriés).
14. Générer un **rapport d’exception**.

## Champs prioritaires à extraire

- prix de souscription ;
- prix de retrait ;
- délai de jouissance ;
- taux de distribution ;
- capitalisation ;
- TOF ;
- TOP ;
- valeur de reconstitution ;
- valeur de réalisation ;
- frais de souscription ;
- frais de gestion ;
- répartition sectorielle ;
- répartition géographique ;
- collecte ;
- parts en attente ;
- nombre d’associés ;
- nombre d’immeubles ;
- surface ;
- taux d’endettement ;
- report à nouveau ;
- acquisitions ;
- cessions ;
- commentaire de gestion ;
- date document ;
- type document ;
- URL document ;
- page source ;
- méthode extraction ;
- confidence_score.

## Tables cibles à concevoir ultérieurement

- `scpi_source_registry`
- `scpi_documents`
- `scpi_document_versions`
- `scpi_raw_extractions`
- `scpi_metrics_current`
- `scpi_metrics_history`
- `scpi_scoring_history`
- `scpi_update_proposals`
- `scpi_quarantine_queue`
- `scpi_pipeline_logs`

## Rôle de l’humain

**Aucune** intervention humaine dans le **flux courant**.

L’humain intervient uniquement :

- pour modifier les **règles globales** ;
- pour **auditer ponctuellement** les quarantaines ;
- pour corriger les **sources officielles** si un gestionnaire change son site ;
- pour **valider les évolutions** du modèle de scoring.

## Livrable attendu

L’Agent 03 devra produire un **rapport d’architecture** avec :

1. architecture pipeline autonome ;
2. règles de décision automatique ;
3. seuils de confiance ;
4. stratégie de quarantaine ;
5. modèle de données cible ;
6. stratégie de publication automatique ;
7. stratégie de logs ;
8. stratégie de rollback ;
9. stratégie de test ;
10. méthode pour viser >95 % d’efficacité ;
11. limites réalistes ;
12. prochaines tâches de construction.

## Source de départ (inventaire nominal)

Pour le chargement des 51 SCPI, référence **lecture seule** aux fichiers data du projet (sans les modifier dans cette phase de conception documentaire) : `scpi_complet.json`, `scpiData.ts`, `scpiDataExtended.ts`, et tout autre inventaire pertinent identifié en audit interne.

## Contraintes d’exécution (mission documentaire)

- Pas de scraping massif ni script dans le cadre de ce fichier de tâche.
- Pas de téléchargement de PDF pour valider le pipeline au moment de la rédaction de cette spécification.
- Pas de modification du code applicatif, de Supabase, ni des données SCPI tant qu’une phase de construction n’est pas explicitement autorisée hors périmètre `/tasks`.

## Alignement conformité SCPI / CIF

Toute future implémentation doit rester alignée avec `AGENTS.md` et l’Agent 03 : pas de promesse de rendement ; distinction information générale / conseil ; données sourcées ; rappel des risques lorsque des performances passées sont exposées.
