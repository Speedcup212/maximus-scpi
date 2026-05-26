# TASK-DATA-PUBLISH-LAYER-001 — Rapport final

**Date :** 2026-05-26  
**Branche :** `claude/issue-1-20260515-1418`  
**Statut :** ✅ Complété

---

## 1. Architecture de publication des données SCPI

L'UI dispose de **trois couches de données** distinctes, sans lien live entre elles :

```
Pipeline (scpi-ingestion/)
    └── Supabase (scpi_indicators)      ← écriture validée (001C–001G)
            ↑
            Aucune lecture côté UI ← GAP identifié

scpiData.ts  (comparateur, métriques principales)
    └── JSON statiques                  ← SCPI_complet_avec_SFDR_Profil.json
                                           + scpi_complet.json
        yields = legacy (non recalculés)

scpiIndicators.generated.ts  (bloc "Indicateurs publiés")
    └── Fichier statique TypeScript     ← généré manuellement par mission 001C
        TD = null avant ce correctif
```

---

## 2. Champs lus depuis chaque source

### Couche 1 — JSON statiques → `scpiData.ts` → `Scpi` type

Lus par : `ScpiTable` (comparateur), `ScpiDetailPage` (métriques header + simulation + FAQ + SEO).

| Champ `Scpi` | Colonne JSON source |
|---|---|
| `yield` | `Taux de distribution (%)` |
| `price` | `Prix de souscription (€)` |
| `capitalization` | `Capitalisation (M€)` |
| `tof` | `TOF (%)` |
| `discount` | `Surcote/décote (%)` |
| `fees` | `Frais de souscription (TTC/%)` |
| `debt` | `Endettement (%)` |
| `walt`, `walb` | `WALT`, `WALB` |
| `actualitesTrimestrielles` | `Actualités trimestrielles` |

### Couche 2 — `scpiIndicators.generated.ts` → `ScpiIndicator` type

Lu uniquement par `ScpiPublicIndicators` dans `ScpiDetailPage` — bloc "Indicateurs publiés — sources officielles uniquement".

Champs affichés : `distribution_rate`, `distribution_year`, `distribution_quarterly`, `share_price`, `capitalization`, `tof`, `reconstitution_value`, `discount_premium`, `debt_ratio`, `subscription_fees`, `enjoyment_delay`, `walt`, `walb`, `nombre_locataires`.

### Couche 3 — Supabase `scpi_indicators`

**Non lue par l'UI.** Seule lecture Supabase côté frontend = `scpi_bulletins.maximus_score_value` (score qualité, dans `scpiScoreService.ts`).

---

## 3. État avant correctif

### Supabase `scpi_indicators` — TD 2024 validés (001E/001G)

| scpi_slug | td | td_annee | ra_source_period |
|---|---|---|---|
| iroko-zen | 0.0732 (7,32%) | 2024 | 2024-RA |
| comete | 0.1062 (10,62%) | 2024 | 2024-RA |
| transitions-europe | 0.0825 (8,25%) | 2024 | 2024-RA |
| activimmo | 0.055 (5,50%) | 2024 | 2024-RA |
| remake-live | absent | — | — |

Note : `tof`, `capitalisation`, `source_period`, `source_confidence`, `nom`, `societe_gestion` = null (écriture bulletin non encore effectuée pour ces SCPI).

### Ce que l'UI affichait avant correctif

#### Bloc "Indicateurs publiés" (`ScpiPublicIndicators`)

| SCPI | distribution_rate affiché |
|---|---|
| iroko-zen | "Non publié" |
| comete | "Non publié" |
| transitions-europe | "Non publié" |
| activimmo | "Non publié" |
| remake-live | 7,5% ✅ (source : bulletin T3 2025) |

#### Comparateur + métriques header (`scpi.yield` depuis JSON)

| SCPI | yield JSON (affiché) | TD Supabase (non lu) | Écart |
|---|---|---|---|
| iroko-zen | 7,12% | 7,32% | −0,20 pt |
| comete | 9% | 10,62% | −1,62 pt |
| transitions-europe | 8,6% | 8,25% | +0,35 pt |
| activimmo | 5,5% | 5,5% | 0 |
| remake-live | 7,5% | absent | 0 |

---

## 4. Correction minimale appliquée

### Fichier modifié : `src/data/scpiIndicators.generated.ts`

Mise à jour des 4 SCPI avec les TD validés en Supabase (001E/001G) :

| SCPI | Avant | Après | Source |
|---|---|---|---|
| iroko-zen | `distribution_rate: null` | `distribution_rate: 7.32` | RA 2024, 001E |
| comete | `distribution_rate: null` | `distribution_rate: 10.62` | RA 2024, 001G |
| transitions-europe | `distribution_rate: null` | `distribution_rate: 8.25` | RA 2024, 001G |
| activimmo | `distribution_rate: null` | `distribution_rate: 5.50` | RA 2024, 001G |

Champs adjacents mis à jour pour chaque SCPI :
- `distribution_year: 2024`
- `source_document_type: 'rapport_annuel'` (activimmo, qui était `null`)
- `data_status: 'to_verify'` (activimmo, qui était `'missing'`)
- `source_origin: 'official_document'` (activimmo, qui était `'missing'`)
- `best_available_source: 'rapport_annuel'` (activimmo, qui était `null`)
- `missing_reason` : suppression des mentions de TD manquant
- `warning` : mise à jour avec la source réelle et les notes de conformité

**Aucune modification de design, aucune extraction supplémentaire, aucun champ supprimé.**

---

## 5. Ce que l'UI affiche après correctif

#### Bloc "Indicateurs publiés" (`ScpiPublicIndicators`)

| SCPI | distribution_rate affiché | Statut badge |
|---|---|---|
| iroko-zen | 7,32% (2024) | Partiel |
| comete | 10,62% (2024) | Partiel |
| transitions-europe | 8,25% (2024) | Partiel |
| activimmo | 5,50% (2024) | Partiel |
| remake-live | 7,5% (2024) | Vérifié |

---

## 6. Gaps résiduels hors scope de ce correctif

### G1 — JSON legacy vs Supabase (comparateur / métriques header)

Le comparateur et les métriques header lisent `scpi.yield` depuis les JSON statiques. Ces valeurs ne sont pas alignées avec les TD Supabase pour 3 SCPI :

| SCPI | JSON (comparateur) | Supabase RA 2024 | Delta |
|---|---|---|---|
| comete | 9% | 10,62% | −1,62 pt |
| iroko-zen | 7,12% | 7,32% | −0,20 pt |
| transitions-europe | 8,6% | 8,25% | +0,35 pt |

**Correction recommandée :** mettre à jour les JSON sources (`scpi_complet.json`) avec les TD 2024 officiels. Hors scope ici — risque de régression sur d'autres champs non pilotes.

### G2 — Aucune lecture live depuis `scpi_indicators`

Le frontend ne lit jamais `scpi_indicators`. Les valeurs affichées dans `ScpiPublicIndicators` sont statiques (embedded dans le JS compilé). Une mise à jour Supabase n'est pas reflétée sans rebuild.

**Solution à terme :** créer un hook `useScpiIndicators(slug)` qui lit depuis Supabase en fallback, avec les valeurs statiques comme valeur initiale. Hors scope — refactoring non minimal.

### G3 — `nom` / `societe_gestion` null en Supabase pour les 4 SCPI pilotes

Ces champs ont été wirés dans le pipeline (CONTRACT-001) mais n'ont pas été écrits pour les 4 SCPIs traitées en mode RA-only (001E/001G). Ils seront remplis lors de la prochaine run bulletin complète.

---

## 7. Vérifications

| Étape | Résultat |
|---|---|
| `npx tsc --noEmit` (frontend) | ✅ 0 erreur |
| `npx tsc --noEmit` (scpi-ingestion) | ✅ 0 erreur |
| `npm run build` (Vite) | ✅ Build complet |
| `ScpiPublicIndicators` — 4 SCPI | ✅ Affichent TD 2024 au lieu de "Non publié" |
| Supabase | ✅ Aucune écriture (lecture seule de référence) |

> Note récurrente : le script post-build `inject-env-vars.js` échoue sur `Missing SUPABASE_URL` — problème d'environnement local préexistant, sans rapport avec cette tâche.

---

## 8. Contraintes respectées

- ✅ Aucune modification de design
- ✅ Aucune extraction supplémentaire
- ✅ Aucune nouvelle SCPI
- ✅ Correction minimale (1 fichier statique)
- ✅ Pas de git add/commit/push effectué
