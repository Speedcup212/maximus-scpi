# Rapport QA — Valeurs aberrantes SCPI

**Date :** 01/06/2026  
**Mission :** Détection et correction des valeurs aberrantes dans les fichiers data SCPI  
**Déclencheur :** Bug critique en production — Opportunité Immo affichait 2025,00% de taux de distribution  

---

## 1. Cause du bug

Le script d'intégration `scripts/integrate-scpi-71-enriched.ts` appelle `parseNumericStr()` sur les champs numériques sans validation de plage. Pour Opportunité Immo, le champ `taux_distribution_2025` contenait la valeur `"2025"` (l'année de référence du document source), qui a été parsée comme taux de distribution.

Ce champ `yield` est ensuite injecté dans `scpi_complet.json`, et `scpiData.ts` mappe directement :
```typescript
yield: scpi['Taux de distribution (%)'] || 0
```
La valeur 2025 se propageait donc au comparateur via `enrichScpiExtended` qui donne priorité à `matchingScpi.yield`.

---

## 2. Audit complet — Anomalies détectées

### 2.1 `src/data/scpi_complet.json` — 8 anomalies

| SCPI | Champ | Valeur corrompue | Cause probable |
|------|-------|-----------------|----------------|
| **Opportunité Immo** | Taux de distribution (%) | `2025` | Année du document parsée comme TDVM |
| **Perial Grand Paris** | Prix de souscription (€) | `45810518734862295000` | Concaténation date+prix |
| **Perial Opportunités Europe** | Prix de souscription (€) | `442001012026880` | Concaténation date+prix |
| **Perial O2** | Prix de souscription (€) | `164240114643842` | Concaténation date+prix |
| **Ficommerce Proximité** | Prix de souscription (€) | `7001012026210.3` | Concaténation split+date+prix |
| **Selectipierre 2** | Prix de souscription (€) | `77301032023` | Concaténation prix+date |
| **Wemo One** | Taux de distribution (%) | `15.272024` | Année 2024 concaténée au TDVM |
| **Wemo One** | Prix de souscription (€) | `2002102026` | Concaténation prix+date |

### 2.2 Faux positifs (non corrigés)

- `Comète` : `Année de création = 2023` → valeur correcte
- `Patrimmo Croissance Impact` : `Année de création = 2025` → valeur correcte

---

## 3. Corrections appliquées

### 3.1 `src/data/scpi_complet.json` — 8 corrections

| SCPI | Champ | Ancienne valeur | Nouvelle valeur | Source |
|------|-------|----------------|----------------|--------|
| Opportunité Immo | Taux de distribution (%) | 2025 | **5.62** | scpiDataExtended.ts (valeur curéee) |
| Perial Grand Paris | Prix de souscription (€) | 45810518734862295000 | **458** | scpiDataExtended.ts |
| Perial Opportunités Europe | Prix de souscription (€) | 442001012026880 | **44** | scpiDataExtended.ts |
| Perial O2 | Prix de souscription (€) | 164240114643842 | **164** | scpiDataExtended.ts |
| Ficommerce Proximité | Prix de souscription (€) | 7001012026210.3 | **70** | Split nominal 01/01/2026 (210€ → 3×70€) |
| Selectipierre 2 | Prix de souscription (€) | 77301032023 | **773** | scpiDataExtended.ts |
| Wemo One | Taux de distribution (%) | 15.272024 | **15.27** | Suppression suffixe année |
| Wemo One | Prix de souscription (€) | 2002102026 | **210** | Revalorisation avril 2026 (note warning) |

### 3.2 `src/data/scpiDataExtended.ts` — 1 correction

| SCPI | Champ | Avant | Après | Raison |
|------|-------|-------|-------|--------|
| Ficommerce Proximité | price | 210 | **70** | Split nominal 01/01/2026 (ancienne part 210€ → 3 parts à 70€) |
| Ficommerce Proximité | minInvestment | 2100 | **700** | Aligné sur nouveau prix |

### 3.3 `public/SCPI_complet_avec_SFDR_Profil.json` — 1 correction

| SCPI | Champ | Avant | Après |
|------|-------|-------|-------|
| Ficommerce Proximité | Prix de souscription (€) | 210 | **70** |

---

## 4. Garde ajoutée dans `scripts/integrate-scpi-71-enriched.ts`

Deux nouvelles fonctions de validation ajoutées avant injection :

```typescript
// Garde taux de distribution
function validateTaux(val, scpiName): number | undefined {
  if (FORBIDDEN_YEAR_VALUES.has(Math.round(val))) → rejeté  // 2023, 2024, 2025, 2026
  if (val < 0) → rejeté
  if (val > 20 && !VALIDATED_HIGH_YIELDS.has(scpiName)) → rejeté
  return val;
}

// Garde prix de part
function validatePrix(val, scpiName): number | undefined {
  if (FORBIDDEN_YEAR_VALUES.has(Math.round(val))) → rejeté
  if (val <= 0 || val > 10000) → rejeté
  return val;
}
```

Toute valeur rejetée génère un `console.warn` avec `[GUARD]` pour traçabilité.  
Exception possible via `VALIDATED_HIGH_YIELDS` (Set manuel, vide par défaut).

---

## 5. Build

```
✓ Vite build réussi — 24.60s
```

---

## 6. Fichiers modifiés

```
src/data/scpi_complet.json                    8 corrections de valeurs aberrantes
src/data/scpiDataExtended.ts                  1 correction prix/minInvestment (split nominal)
public/SCPI_complet_avec_SFDR_Profil.json     1 correction prix (split nominal)
scripts/integrate-scpi-71-enriched.ts         2 fonctions de garde + FORBIDDEN_YEAR_VALUES
```

---

## 7. Recommandation post-déploiement

- Surveiller Opportunité Immo sur le site live : le taux de distribution doit s'afficher à 5,62% (et non 2025%).
- Surveiller Ficommerce Proximité : le prix affiché doit être 70€ (post-split) et non 210€.
- Si un TDVM plus récent est disponible pour Opportunité Immo (T1 2026), il devra être sourcé depuis le bulletin trimestriel T1 2026 et mis à jour manuellement.
