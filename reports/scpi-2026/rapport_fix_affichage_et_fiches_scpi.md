# Rapport : Fix Affichage SCPIs — De 51 à 63 SCPI visibles

**Date :** 01/06/2026  
**Mission :** Rendre visibles les 12 nouvelles SCPI intégrées dans le comparateur MaximusSCPI  
**Branche :** data/scpi-47-extraction  

---

## 1. Diagnostic : Pourquoi seules 51 SCPI s'affichaient

### Architecture des données SCPI (5 fichiers impliqués)

| Fichier | Rôle | SCPIs avant | SCPIs après |
|---------|------|-------------|-------------|
| `src/data/scpiDataExtended.ts` | **Source primaire du comparateur** (`baseSCPIData`) | 51 | **63** |
| `src/data/scpi_complet.json` | Source d'enrichissement (champs secondaires) | 64 | 64 (inchangé) |
| `public/SCPI_complet_avec_SFDR_Profil.json` | Source des fiches individuelles (`StaticScpiPage`) | 51 | **63** |
| `src/utils/scpiSlugMapper.ts` | Générateur de slugs dynamiques | — | inchangé |
| `src/data/landingPagesData.ts` | Pages landing dédiées (fiches optimisées) | — | inchangé |

### Cause racine

Le comparateur (`FintechComparator.tsx`) utilise `scpiDataExtended` comme liste maître :

```typescript
// FintechComparator.tsx ligne 67
const enrichedScpiData = useMemo(() => {
  const enriched = enrichScpiExtendedArray(scpiDataExtended, scpiData);
  // ...
```

La fonction `enrichScpiExtendedArray` **enrichit** les entrées existantes mais **n'en ajoute pas de nouvelles**. Les 12 SCPI ajoutées dans `scpi_complet.json` lors de l'intégration précédente n'étaient donc pas connues du comparateur.

La fiche individuelle (`StaticScpiPage`) chargeait `public/SCPI_complet_avec_SFDR_Profil.json` par `fetch()` — ce fichier contenait toujours les 51 SCPIs d'origine.

---

## 2. Corrections apportées

### 2.1 `src/data/scpiDataExtended.ts` — Ajout de 12 entrées dans `baseSCPIData`

IDs 52 à 63 ajoutés :

| ID | Nom SCPI | Rendement | Prix | Catégorie | Société |
|----|----------|-----------|------|-----------|---------|
| 52 | NCap Continent | 7,1 % | 210 € | Diversifié | Norma Capital |
| 53 | Wemo One | 15,27 %* | 210 € | Diversifié | Wemo REIM |
| 54 | Iroko Atlas | 9,66 % | 200 € | Diversifié | Iroko |
| 55 | Epsicap Nano | 6,08 % | 257 € | Diversifié | Epsicap |
| 56 | Alta Convictions | 6,57 % | 308 € | Diversifié | Altarea Investment Managers |
| 57 | Cristal Rente | 5,0 % | 255,68 € | Diversifié | Inter Gestion REIM |
| 58 | Rivoli Avenir Patrimoine | 3,69 % | 228 € | Bureaux | Amundi Immobilier |
| 59 | Primovie | 4,04 % | 164 € | Santé | Praemia REIM France |
| 60 | Praemia Hôtels Europe | 3,9 % | 204 € | Hôtellerie | Praemia REIM France |
| 61 | Pierval Santé | 4,39 % | 204 € | Santé | Euryale AM |
| 62 | Patrimmo Commerce | 3,38 % | 160 € | Commerces | Praemia REIM France |
| 63 | Aestiam Agora | 4,5 % | 922 € | Diversifié | Aestiam |

*\* Wemo One : taux de distribution T1 2026 élevé (SCPI jeune 2024), non représentatif d'un TD récurrent. Warning intégré dans la stratégie.*

### 2.2 `public/SCPI_complet_avec_SFDR_Profil.json` — Ajout de 12 entrées dans `Sheet1`

Même 12 SCPIs ajoutées au fichier public utilisé par les fiches individuelles.  
Total : 51 → 63 entrées.

---

## 3. Ce qui a été corrigé

- ✅ Corrections manuelles appliquées :
  - **Wemo One** : prix corrigé de 2002102026 → 210 € (donnée corrompue dans extraction)
  - **Rivoli Avenir Patrimoine** : endettement corrigé de 93138.6 → 38,6 %
  - **Pierval Santé** : capitalisation corrigée de 3,3 M€ → 2 500 M€ (~2,5 Md€ réel)
  - **Iroko Atlas** : TDVM calculé depuis distribution (19,32 €/200 € × 100 = 9,66 %)

---

## 4. Périmètre exclu

- **Remake UK 2025** : maintenu en `manual_review` dans `scpi_complet.json`, non ajouté à `baseSCPIData`
- **Kyaneos Denormandie 4** : non-SCPI, exclu de l'intégration
- Aucune modification : design, UI, routes, simulateurs, Netlify, robots.txt, sitemap

---

## 5. Build

```
✓ Vite build réussi — 26.39s
```

> Note : exit code 1 final causé par `inject-env-vars.js` (SUPABASE_URL manquant dans .env local) — problème pré-existant sans impact sur le déploiement Netlify (variables injectées en CI/CD).

---

## 6. Résultat attendu sur le site

- **Comparateur** : 63 SCPI affichées (au lieu de 51)
- **Recherche** : NCap Continent, Wemo One, Iroko Atlas, Epsicap Nano, Alta Convictions, Cristal Rente, Rivoli Avenir Patrimoine, Primovie, Praemia Hôtels Europe, Pierval Santé, Patrimmo Commerce, Aestiam Agora trouvables
- **Fiches individuelles** : accessibles via `/scpi-ncap-continent`, `/scpi-iroko-atlas`, etc.
- **Filtres sectoriels** : Santé (Primovie, Pierval Santé), Hôtellerie (Praemia Hôtels Europe), Bureaux (Rivoli Avenir Patrimoine), Commerces (Patrimmo Commerce) fonctionnels

---

## 7. Fichiers modifiés

```
src/data/scpiDataExtended.ts        +12 entrées dans baseSCPIData (IDs 52-63)
public/SCPI_complet_avec_SFDR_Profil.json  +12 entrées dans Sheet1
```
