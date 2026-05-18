# TASK-DATA-001 — Audit architecture données SCPI MaximusSCPI

**Agent :** Agent 03 — Data SCPI  
**Statut :** Complétée  
**Date :** 2026-05-18  
**Type :** Audit lecture seule — aucune modification

---

## Objectif

Réaliser un audit technique complet de l'architecture des données SCPI existante dans le projet MaximusSCPI, avant toute modification.

**Audit uniquement. Ne rien modifier.**

---

## Périmètre

### Ce qui doit être audité

1. **Stockage des données SCPI actuelles**
   - Fichiers frontend dans `src/data/`
   - Tables Supabase éventuelles
   - Scripts d'import ou de génération statique
   - Logique de scoring, Z-score, comparaison
   - Logique des fiches SCPI et pages thématiques

2. **Fichiers utilisés par les fonctionnalités clés**
   - Comparateur SCPI
   - Fiches SCPI
   - Pages SCPI statiques
   - Simulateurs
   - Notation MaximusSCPI
   - Cohérence de portefeuille

3. **Champs SCPI existants**
   Pour chaque champ : nom, fichier, type, exemple, usage, présence de source/date, risque si obsolète.

4. **Champs manquants**
   Identifier les champs nécessaires pour une fiche SCPI complète mais absents du modèle actuel.

5. **Scripts existants**
   - Scraping, ingestion PDF, extraction bulletins
   - Génération JSON, synchronisation Supabase
   - Génération sitemap, enrichissement SEO

6. **Dépendances disponibles**
   - `pdf-parse`, Playwright, Supabase client, `tsx`, librairies OCR/HTML

---

## Livrables attendus

- [ ] Diagnostic de l'existant
- [ ] Liste des fichiers / tables / scripts concernés
- [ ] Liste exhaustive des champs SCPI présents
- [ ] Liste des champs manquants
- [ ] Schéma cible recommandé (tables Supabase)
- [ ] Pipeline recommandé étape par étape
- [ ] Stratégie de validation humaine
- [ ] Stratégie d'historisation
- [ ] Stratégie de scoring et évolution de la notation
- [ ] Risques techniques
- [ ] Risques conformité
- [ ] Plan d'action en 3 phases
- [ ] Première liste de 5 SCPI pilotes

---

## 5 SCPI pilotes recommandées

| SCPI | Critère | Gestionnaire |
|---|---|---|
| Activimmo | Grande capitalisation, scripts existants, logistique pure | Alderan |
| Iroko Zen | SCPI européenne, script extraction existant | Iroko |
| Comète | Script PDF existant (`extractCometeT3_2025.cjs`) | Alderan |
| Épargne Pierre | Profil patrimonial, bonne représentativité | Atland Voisin |
| À définir | Mix santé ou diversifié, gestionnaire différent | — |

---

## Contraintes absolues

- Ne modifier aucun fichier.
- Ne créer aucun script.
- Ne faire aucun commit.
- Ne pas lancer de scraping.
- Ne pas modifier Supabase.
- Ne pas modifier `scpiData.ts`, `scpiDataExtended.ts`, `scpi_complet.json`.
- Ne pas modifier le comparateur, les fiches SCPI ou les simulateurs.

---

## Résultat

Audit réalisé le 2026-05-18. Rapport complet dans :

`agents/reports/architecture-data-agent03-contrat-compatibilite.md`

**Conclusion :** 51 SCPI, double pipeline statique (JSON + TS), scoring 0–100 existant, bulletins PDF semi-automatisés via `scripts/`, tables Supabase `scores_scpi` et `scpi_bulletins` existantes. Angle faible : dualité des modèles, mapping JSON incomplet, transformateur scoring partiel.

**Phase 1 lancée** : création de `scpi_source_registry`.
