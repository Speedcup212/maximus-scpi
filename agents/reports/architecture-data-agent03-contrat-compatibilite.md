# Architecture Data Agent 03 — Contrat de compatibilité MaximusSCPI

**Version :** 1.0  
**Date :** 2026-05-18  
**Auteur :** Agent 03 — Data SCPI  
**Statut :** Référence permanente — ne pas modifier sans validation explicite

---

## 1. Objectif Agent 03

L'Agent 03 construit le futur moteur data SCPI de MaximusSCPI.

Son rôle n'est pas de remplacer brutalement le pipeline existant, mais de construire progressivement une architecture data fiable, traçable et sourcée, qui pourra ensuite alimenter proprement les composants frontend actuels via un contrat de compatibilité explicite.

**Principes fondateurs :**

- Aucune donnée n'est publiée sans source officielle identifiée.
- Aucun fichier frontend n'est modifié tant que le contrat data n'est pas sécurisé.
- Le comparateur MaximusSCPI ne doit jamais être cassé.
- Chaque évolution data est validée humainement avant tout raccordement.

---

## 2. Architecture cible

```
Sources officielles
(bulletins trimestriels, rapports annuels, DIC, notes d'information, sites sociétés de gestion)
      │
      ▼
┌─────────────────────────┐
│   scpi_source_registry  │  ← Registre documentaire officiel (Phase 1 ✓)
│   (URLs, statuts, dates)│
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│  scpi_raw_extractions   │  ← Données brutes extraites, non publiables (Phase 2)
│  (PDF parse, scraping)  │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│   Validation humaine    │  ← Revue, correction, approbation
│   (interface de review) │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐   ┌──────────────────────┐   ┌───────────────────────┐
│  scpi_metrics_current   │   │  scpi_metrics_history │   │  scpi_scores_history  │
│  (données validées)     │   │  (historique valeurs) │   │  (historique scores)  │
└─────────────────────────┘   └──────────────────────┘   └───────────────────────┘
      │
      ▼
┌─────────────────────────┐
│   Adapter / Mapper      │  ← Couche de compatibilité avec le modèle Scpi existant
│   frontend              │
└─────────────────────────┘
      │
      ▼
┌───────────────────────────────────────────────────────────────┐
│  Comparateur  │  Fiches SCPI  │  Filtres  │  Scoring          │
│  Simulateurs  │  Graphiques   │  Cartes   │  Cohérence portef.│
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Rôle de chaque couche

### `scpi_source_registry`
Registre documentaire officiel des 51 SCPI MaximusSCPI.  
Contient : URLs officielles (page SCPI, bulletins, RA, DIC, note d'information, statuts), statuts de vérification, niveaux de confiance, fraîcheur documentaire.  
**Ne contient pas de données financières.** Sert uniquement à localiser les sources.  
Accès : service role uniquement en Phase 1. Aucune exposition frontend.

### `scpi_raw_extractions`
Données brutes extraites des documents officiels (PDF parse, scraping contrôlé).  
Chaque ligne contient : SCPI, champ, valeur extraite, source, URL, date, méthode d'extraction, niveau de confiance.  
**Non publiables directement.** Toujours soumises à validation humaine avant tout usage.  
Ne remplace pas `scpi_complet.json`.

### `scpi_metrics_current`
Dernières valeurs validées par champ et par SCPI.  
Alimentée uniquement après validation humaine des extractions.  
Contient les métadonnées de sourcing (source, date, document, confiance).  
**Cible à terme du raccordement frontend**, via l'adapter.

### `scpi_metrics_history`
Historique complet de toutes les valeurs par champ et par SCPI.  
Permet de tracer l'évolution dans le temps (prix, rendement, TOF, collecte…).  
Aucune valeur n'est écrasée : chaque mise à jour génère une nouvelle ligne.  
**Jamais de suppression** de données historiques.

### `scpi_scores_history`
Historique des scores MaximusSCPI par SCPI : score global, sous-scores, delta, facteurs explicatifs, date.  
Permet de tracer l'évolution de la notation.  
Distingue : score calculé / score validé / score publié.  
Un retour arrière est possible en cas d'erreur.

### Adapter / Mapper frontend
Couche de transformation entre `scpi_metrics_current` et le modèle `Scpi` actuellement utilisé par le comparateur.  
**Obligatoire avant tout raccordement frontend.**  
Garantit la compatibilité des champs, des types et des valeurs par défaut.  
Aucun composant frontend ne consomme directement les tables Supabase sans passer par cet adapter.

---

## 4. Pipeline actuel à préserver

Le site MaximusSCPI utilise actuellement les fichiers suivants pour alimenter le comparateur, les fiches SCPI, le scoring et les simulateurs :

| Fichier | Rôle |
|---|---|
| `src/data/scpi_complet.json` | Source principale des données SCPI (62 lignes brutes, 51 SCPI après fusion) |
| `src/data/scpiData.ts` | Mapping JSON → modèle TypeScript `Scpi`, pipeline principal runtime |
| `src/data/scpiDataExtended.ts` | Modèle parallèle `SCPIExtended`, 51 entrées statiques codées en dur |
| `src/utils/scpiScoring.ts` | Calcul du score 0–100 (rendement 40, secteur 20, géo 15, qualité 15, taille 10) |
| Composants comparateur | `FintechComparator.tsx`, `MobileComparator.tsx` et leurs dépendances |
| Composants fiches SCPI | Pages individuelles SCPI dynamiques |

**Règle absolue : ces fichiers ne doivent pas être remplacés ou modifiés tant que le contrat data n'est pas sécurisé et que l'adapter frontend n'est pas en place.**

---

## 5. Champs critiques — cartographie par usage

| Champ | Comparateur | Fiches SCPI | Filtres | Scoring | Simulateurs | Graphiques |
|---|---|---|---|---|---|---|
| `yield` | ✓ tri, carte | ✓ | ✓ filtre rendement | ✓ score_rendement (40 pts) | ✓ | ✓ |
| `price` | ✓ | ✓ souscription | ✓ | — | ✓ | — |
| `capitalization` | ✓ | ✓ | ✓ filtre taille | ✓ score_taille (10 pts) | — | ✓ |
| `tof` | ✓ | ✓ | ✓ | ✓ score_qualite | — | ✓ |
| `fees` | ✓ comparaison | ✓ | ✓ | — | ✓ | — |
| `fraisGestion` | ✓ | ✓ | — | ✓ | — | — |
| `delaiJouissance` | ✓ | ✓ | — | — | ✓ cash-flow | — |
| `repartitionSector` | ✓ | ✓ | ✓ filtre secteur | ✓ score_secteur (20 pts) | — | ✓ |
| `repartitionGeo` | ✓ | ✓ | ✓ filtre géo | ✓ score_geo (15 pts) | — | ✓ |
| `rating` / `maximus_score_value` | ✓ étoiles | ✓ badge score | ✓ | — | — | — |
| `valeurReconstitution` | ✓ décote | ✓ | — | ✓ (approximation) | — | — |
| `valeurRealisation` | ✓ | ✓ | — | — | — | — |
| `debt` | ✓ | ✓ | ✓ | ✓ risque endettement | — | — |
| `distribution` | ✓ | ✓ | — | — | ✓ | — |
| `nombreLocataires` | — | ✓ | — | ✓ concentration | — | — |
| `nbImmeubles` | ✓ | ✓ | — | ✓ diversification | — | — |
| `walt` / `walb` | — | ✓ | — | ✓ | — | — |
| `collecteNetteTrimestre` | ✓ | ✓ | — | ✓ dynamique | — | ✓ |

**Tout changement sur un champ marqué ✓ dans la colonne Scoring entraîne un test de non-régression obligatoire sur `scpiScoring.ts`.**

---

## 6. Règles de compatibilité frontend

Ces règles s'appliquent à toute évolution data, sans exception :

1. **Aucun changement de champ critique sans adapter.** Toute modification du nom, du type ou de la valeur par défaut d'un champ critique passe par la couche adapter/mapper avant d'atteindre le frontend.

2. **Aucun renommage direct dans les composants.** Un champ ne peut pas être renommé directement dans un composant React sans avoir d'abord créé le mapping correspondant dans l'adapter.

3. **Aucune suppression de champ sans fallback.** Si un champ est supprimé ou devient `null`, le composant qui le consomme doit recevoir une valeur par défaut acceptable, jamais `undefined` ou une erreur runtime.

4. **Aucune donnée publiée sans source.** Chaque valeur affichée sur le site doit être traçable jusqu'à un document officiel ou un calcul documenté.

5. **Aucune donnée brute extraite ne doit aller directement au frontend.** `scpi_raw_extractions` → validation humaine → `scpi_metrics_current` → adapter → frontend. Jamais de raccourci.

6. **Aucune modification du scoring sans test de non-régression.** `scpiScoring.ts` et la Edge Function `scpi-scoring` doivent produire les mêmes résultats avant et après toute modification data.

7. **Tout nouveau modèle Supabase doit être mappé vers le modèle `Scpi` existant** avant utilisation par le comparateur, les fiches SCPI ou tout autre composant frontend.

---

## 7. Règles conformité CIF — non négociables

| Règle | Application |
|---|---|
| Ne jamais présenter une SCPI comme la meilleure | Interdiction dans tout texte généré ou score affiché |
| Ne jamais promettre de rendement | Le taux de distribution est toujours présenté comme donnée historique datée |
| Toujours dater les performances | Format obligatoire : `Taux de distribution XXXX (données historiques)` |
| Distinguer les types de données | Badge obligatoire : `donnée officielle` / `donnée extraite` / `donnée calculée` / `score MaximusSCPI` |
| Afficher les scores comme indicatifs | Mention obligatoire : "Score indicatif — information générale, non conseil personnalisé" |
| Ne jamais transformer une donnée passée en projection garantie | Aucun verbe au futur pour les taux dans les templates ou fiches SCPI |
| Mentionner les risques SCPI | Rappel obligatoire si chiffres de performance cités : perte en capital, revenus non garantis, liquidité limitée |

---

## 8. Critères avant raccordement frontend

Avant tout raccordement d'une nouvelle source de données au frontend, les critères suivants doivent tous être satisfaits :

- [ ] Cartographie champ → composant complète et documentée
- [ ] Test comparateur : affichage, tri, filtres, cartes fonctionnels
- [ ] Test fiches SCPI : tous les champs affichés présents et typés correctement
- [ ] Test scoring : `scpiScoring.ts` produit les mêmes résultats avant/après
- [ ] Test simulateurs concernés : résultats inchangés
- [ ] Vérification build : `npm run build` sans erreur nouvelle
- [ ] Vérification absence de régression visuelle sur les pages SCPI
- [ ] Validation humaine des données à raccorder (pas uniquement validation technique)
- [ ] Adapter/mapper documenté et testé
- [ ] Aucun champ critique manquant ou `undefined` en runtime

---

## 9. Phases projet Agent 03

| Phase | Livrable | Statut |
|---|---|---|
| **Phase 1** | Migration `scpi_source_registry` + types TypeScript + seed JSON 51 SCPI | ✓ Terminée |
| **Phase 1B** | Script d'import contrôlé du seed vers Supabase (`importScpiSourceRegistrySeed.ts`) | En cours |
| **Phase 2** | Migration `scpi_raw_extractions` + extraction pilote sur 5 SCPI (Activimmo, Iroko Zen, Comète, Épargne Pierre, +1) | À valider |
| **Phase 3** | Migration `scpi_metrics_current` + validation humaine des extractions pilotes | À planifier |
| **Phase 4** | Migration `scpi_metrics_history` + `scpi_scores_history` + logique d'historisation | À planifier |
| **Phase 5** | Adapter/mapper frontend : transformation `scpi_metrics_current` → modèle `Scpi` | À planifier — **nécessite cartographie complète** |
| **Phase 6** | Remplacement progressif des fichiers statiques (`scpi_complet.json`, `scpiDataExtended.ts`) si et seulement si l'adapter est sécurisé, testé et validé humainement | À planifier — **ne jamais précipiter** |

---

## 10. Principes architecturaux de référence

- **Fiabilité documentaire avant automatisation.** La Phase 1 construit le registre des sources. Les phases suivantes n'avancent que si les sources sont vérifiées.
- **Validation humaine obligatoire avant publication.** Aucun pipeline ne publie automatiquement sans revue.
- **Historisation immuable.** Aucune donnée historique ne peut être supprimée ou écrasée.
- **Rollback possible.** Toute mise à jour doit permettre un retour à l'état précédent.
- **Transparence du calcul.** Le score MaximusSCPI doit rester explicable via `audit_trail`.
- **Compatibilité descendante.** Aucun composant frontend ne casse lors d'une évolution data.
- **Scraping responsable.** Extraction seulement sur documents publics officiels, avec identification de l'agent, jamais de scraping massif non contrôlé.
