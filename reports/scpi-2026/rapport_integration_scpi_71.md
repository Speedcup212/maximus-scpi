# Rapport d'intégration — SCPI T1 2026 → MaximusSCPI

**Date :** 01/06/2026 17:35:10
**Script :** scripts/integrate-scpi-71-enriched.ts
**Branche :** data/scpi-47-extraction

---

## Résumé

| Indicateur | Valeur |
|---|---|
| SCPIs ajoutées (nouvelles) | **12** |
| SCPIs mises à jour | **33** |
| SCPIs en partial_review | 0 |
| SCPIs en manual_review | 1 |
| SCPIs avec maximus_warnings | 16 |
| SCPIs ignorées | 0 |
| Erreurs de mapping | 0 |
| Total SCPIs dans scpi_complet.json après intégration | 64 |
| Doublons supprimés | 10 |

---

## SCPIs ajoutées (12 nouvelles)

- ✅ NCap Continent
- ✅ Wemo One
- ✅ Iroko Atlas
- ✅ Epsicap Nano
- ✅ Alta Convictions
- ✅ Cristal Rente
- ✅ Rivoli Avenir Patrimoine
- ✅ Primovie
- ✅ Praemia Hôtels Europe
- ✅ Pierval Santé
- ✅ Patrimmo Commerce
- ✅ Aestiam Agora

## SCPIs mises à jour (33)

- 🔄 Comète
- 🔄 Optimale
- 🔄 Remake Live
- 🔄 Iroko Zen
- 🔄 Log In
- 🔄 Cristal Life
- 🔄 Cœur Europe
- 🔄 Paref Evo
- 🔄 Activimmo
- 🔄 NCap Régions
- 🔄 Urban Cœur Commerce
- 🔄 Sofiprime
- 🔄 Selectipierre 2 Paris
- 🔄 Aestiam Horizon
- 🔄 PERIAL O2
- 🔄 PERIAL Opportunités Europe
- 🔄 PERIAL Grand Paris
- 🔄 Patrimmo Croissance Impact
- 🔄 Novapierre 1
- 🔄 Novaxia Néo
- 🔄 LF Opportunité Immo
- 🔄 LF Grand Paris Patrimoine
- 🔄 LF Europimmo
- 🔄 Kyaneos Pierre
- 🔄 PAREF Hexa
- 🔄 Immorente
- 🔄 Ficommerce Proximité
- 🔄 Épargne Pierre
- 🔄 Épargne Foncière
- 🔄 Efimmo 1
- 🔄 Cœur de Ville
- 🔄 Atream Hôtels
- 🔄 Altixia Cadence XII

## SCPIs en partial_review (0)

_Aucune_

## SCPIs en manual_review (1)

- 🔴 Remake UK 2025

## SCPIs avec maximus_warnings (16)

### Wemo One
- SCPI jeune (2024) — taux de distribution élevé non représentatif d'un TD récurrent
- Revalorisation du prix à 210 € en avril 2026

### Remake UK 2025
- Données partielles — prix de souscription non extrait
- SCPI à durée de vie limitée (7 ans, jusqu'en 2032)
- Risque de change EUR/GBP

### Sofiprime
- TOF : 79,47 % — faible taux d'occupation
- Taux de distribution annuel : 0,54 %

### Rivoli Avenir Patrimoine
- Distribution T1 2026 en baisse
- Taux d'endettement élevé (~38,6 %)
- Bureaux IDF difficile

### Primovie
- 1 438 276 parts en attente de retrait
- PGA 2025 : -7,31 %
- Fonds de remboursement actif (15 M€)

### Praemia Hôtels Europe
- Pivot stratégique vers l'hôtellerie — anciennement Primofamily (résidentiel)
- Visa AMF du 10/02/2026
- 120 187 parts en attente de retrait

### PERIAL O2
- Variabilité du capital suspendue depuis février 2026
- Marché secondaire ouvert en avril 2026
- TOF : 86,2 %

### PERIAL Opportunités Europe
- Division du prix de part par 20 au 01/01/2026 (avant : ~880 €, après : ~44 €)
- Distribution mensuelle depuis janvier 2026

### PERIAL Grand Paris
- Variabilité du capital suspendue depuis février 2026
- Marché secondaire ouvert en avril 2026
- Bureaux IDF difficile — distribution en baisse

### Patrimmo Croissance Impact
- PGA 2025 : -7,68 %
- Aucune distribution courante (nue-propriété)
- 38 277 parts en attente de retrait

### Patrimmo Commerce
- 765 342 parts en attente de retrait
- PGA 2025 : -5,71 %
- Fonds de remboursement actif

### LF Grand Paris Patrimoine
- Marché des parts suspendu depuis le 12/02/2026
- 10,2 % de parts en attente de retrait
- Dividende T1 2026 en forte baisse (-65 % vs trimestres précédents)

### LF Europimmo
- Prix de part -23,28 % en 2025
- Collecte à l'arrêt

### PAREF Hexa
- PGA 2025 : -12,10 %
- TRI 5 ans : 0,41 %
- Plan de cession en cours

### Ficommerce Proximité
- Division du nominal par 3 au 01/01/2026 (ancienne part 210 € → 3 parts à 70 €)

### Épargne Foncière
- TRI 5 ans : -0,80 %
- Retraits élevés

## SCPIs ignorées (0)

_Aucune_

## Erreurs de mapping (0)

_Aucune_

---

## Détails techniques

- **Fichier source :** data-import/master_scpi_71_enriched.json
- **Fichier mis à jour :** src/data/scpi_complet.json
- **Sauvegarde :** C:\Users\ericb\Desktop\maximus-scpi\src\data\scpi_complet.backup.2026-06-01T15-35-10-099Z.json
- **Champs mis à jour :** Taux de distribution, Prix de souscription, TOF, Capitalisation, Endettement, Valeur de réalisation/reconstitution/retrait, Nb immeubles, Distribution T1 2026, Répartition sectorielle JSON
- **Nouveaux champs ajoutés :** maximus_warnings, maximus_data_status, maximus_source_document, maximus_source_periode, maximus_confidence_score, Distribution trimestrielle T1 2026 (€/part)
- **Règles appliquées :** Pas d'écrasement des champs existants utiles par des valeurs vides / Jamais de "N/D" / Déduplification automatique / Kyaneos Denormandie 4 exclu

---

## Résultat build npm

| Étape | Statut | Détail |
|---|---|---|
| `npx vite build` | ✅ **OK** | Built in 23.95s — 64 modules transformés |
| `generateSitemapFromDB.ts` | ⚠️ Partiel | Supabase tables pas accessibles en local (attendu) |
| `generateRobotsTxt.ts` | ✅ OK | robots.txt régénéré |
| `generateRedirectsSSG.js` | ✅ OK | 51 pages statiques SCPI générées |
| `generateOptimizedStaticPages.js` | ✅ OK | 51 pages SCPI optimisées |
| `generateThematicPages.js` | ✅ OK | 38 pages thématiques |
| `inject-env-vars.js` | ❌ Pre-existing | Missing SUPABASE_URL/SUPABASE_ANON_KEY en local — non lié à cette intégration |

> **Conclusion :** Le build Vite est **OK**. L'exit code 1 est dû uniquement au script `inject-env-vars.js` qui nécessite des credentials Supabase non disponibles en local. Ce problème est **pre-existant** et indépendant de l'intégration des données SCPI.

---

## Sauvegarde

Fichier de sauvegarde créé avant modification : `src/data/scpi_complet.backup.2026-06-01T15-35-10-099Z.json`

---

*Rapport généré automatiquement par scripts/integrate-scpi-71-enriched.ts — Agent 03 Data SCPI — MaximusSCPI*
