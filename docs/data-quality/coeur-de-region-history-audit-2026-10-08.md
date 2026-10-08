# Contrôle documentaire — Cœur de Régions, dette et parts en attente

**Date : 2026-10-08.** Audit des bulletins de Sogenial et correction ciblée de la table source `public.scpi_indicator_history`.

## Rectifications appliquées en base (4 lignes, aucune ligne d'une autre SCPI)

| Période | Parts initiales en attente | Parts vérifiées | Parts en circulation | Dette vérifiée | Référence officielle |
| --- | ---: | ---: | ---: | ---: | --- |
| 2025-T2 | 30 | **0** | 614582 | *Non intégrée : méthode différente* | [BT T2 2025](https://www.sogenial.fr/wp-content/uploads/2025/07/Coeur-de-Regions-Bulletin-Trimestriel-2T2025.pdf), p. 3 |
| 2025-T3 | 30 | **0** | 626190 | **8,53 %** | [BT T3 2025](https://www.sogenial.fr/wp-content/uploads/2025/10/Bulletin-Trimestriel-3T-2025-%E2%80%93-Coeur-de-Regions.pdf), p. 3 |
| 2025-T4 | 25 | **0** | 642199 | **12,83 %** | [BT T4 2025](https://www.sogenial.fr/wp-content/uploads/2026/03/Bulletin-Trimestriel-4T-2025-%E2%80%93-Coeur-de-Regions.pdf), pp. 3, 5 |
| 2026-T1 | 25 | **0** | 656071 | **9,88 %** | [BT T1 2026](https://www.sogenial.fr/wp-content/uploads/2026/05/Bulletin-Trimestriel-1T-2026-%E2%80%93-Coeur-de-Regions.pdf), pp. 3, 5 |

Les quatre périodes sont à capital variable, base `withdrawal_queue`. `2025-T3` a également bénéficié de la reconstitution du nombre de parts (626190) expressément publié. Toutes les données ont été relues en sortie via `scpi_trajectory_pilot_history`.

### Attention à la comparabilité de la dette

Au T2 2025 le bulletin affiche un effet de levier de **8,75 % de la valeur du patrimoine**, tandis que le T3 2025 et les suivants l'expriment **en pourcentage de l'actif net augmenté des dettes**. Il serait incorrect d'insérer ces deux ratios dans la même courbe sans préciser la rupture de méthode. La valeur T2 2025 demeure donc non renseignée dans la série homogène.

### Origine du défaut et protection du référentiel

Des lignes `auto_verified_product_period_tof` disposaient d'une confiance globale élevée bien que leurs champs de liquidité et de dette fussent manquants ou erronés. **Ne pas considérer une certification de période / TOF comme une certification de tous les indicateurs.**

Avant réimport de données historiques :
1. Vérifier les champs **séparément** (TOF, parts en attente, nombre de parts, dette, capital variable/fixe).
2. Ne jamais confondre le nombre de *retraits effectués* avec le *stock de parts en attente à date*.
3. Ne pas recopier la dette d'un autre trimestre ni comparer des pourcentages calculés sur des bases différentes.
4. Ne pas écraser une correction documentaire par un import non vérifié.
5. Réconciliation automatique recommandée : comparer chaque champ source au bulletin officiel et générer une liste d'écarts avant écriture.

## Suite de l'audit

Sur les huit dernières périodes disponibles des 61 SCPI (467 lignes), 111 lignes présentent une dette, 81 lignes disposent des deux éléments du ratio de parts en attente mais ne précisent pas la base de liquidité. **Elles ne doivent pas être complétées automatiquement** tant que la base et l'exactitude du numérateur ne sont pas vérifiées.

Les fiches SCPI et l'espace client réutilisent le même composant `ScpiTrajectoryPanel`; la correction des libellés y est commune. Ce document ne valide pas l'ensemble des autres SCPI.
