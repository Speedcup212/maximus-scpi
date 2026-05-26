# TASK-DATA-PUBLISH-001B — Rapport qualité sources

**Agent :** Agent 03 — Data SCPI  
**Date :** 2026-05-22  
**Build :** ✅ `built in 23.64s` — zéro erreur TypeScript

---

## Résumé exécutif

| SCPI | Bulletin dispo | Statut collecte | data_status | source_origin | TD officiel |
|------|---------------|-----------------|-------------|---------------|-------------|
| Activimmo | ❌ absent | legacy_only | to_verify | legacy_dataset | ❌ |
| Comète | ⚠️ partiel | bulletin_partial | to_verify | legacy_dataset | ❌ |
| Iroko Zen | ⚠️ partiel | bulletin_partial | to_verify | legacy_dataset | ❌ |
| Remake Live | ✅ complet | bulletin_full | **verified** | **official_document** | ✅ |
| Transitions Europe | ⚠️ partiel | bulletin_partial | to_verify | legacy_dataset | ❌ |

**Seule Remake Live est entièrement vérifiable depuis un bulletin officiel.**

---

## Détail par SCPI

### Activimmo (Alderan)

| Indicateur | Valeur | Origine réelle | URL source | Statut | Risque |
|------------|--------|----------------|------------|--------|--------|
| distribution_rate | 5.5% | scpi_complet.json | — | to_verify | Aucun bulletin JSON dédié |
| share_price | 610€ | scpi_complet.json | — | to_verify | |
| capitalization | 1400 M€ | scpi_complet.json | — | to_verify | |
| tof | 92.8% | scpi_complet.json | — | to_verify | En retrait 0,5pt — délai mise en location |
| subscription_fees | 12.72% | scpi_complet.json | — | to_verify | |
| management_fees | 10% | scpi_complet.json | — | to_verify | |
| enjoyment_delay | 6 mois | scpi_complet.json | — | to_verify | |
| reconstitution_value | 609.65€ | scpi_complet.json | — | to_verify | |
| discount_premium | 0% | scpi_complet.json | — | to_verify | |
| debt_ratio | 1.46% | scpi_complet.json | — | to_verify | |
| ran | null | absent | — | missing | Non disponible |
| tri_5y | null | absent | — | missing | Non disponible |

**Note :** `updateActivimmoT3.cjs` a mis à jour `scpi_complet.json` depuis le bulletin T3 2025,  
mais la traçabilité reste indirecte — aucun `bulletin_activimmo_t3_2025.json` n'existe dans `scripts/`.

---

### Comète (Alderan)

| Indicateur | Valeur | Origine réelle | Statut | Risque |
|------------|--------|----------------|--------|--------|
| distribution_rate | 9% | scpi_complet.json | **to_verify** | Non confirmé bulletin — valeur élevée à vérifier |
| share_price | 250€ | scpi_complet.json | to_verify | |
| capitalization | 519.6 M€ | scpi_complet.json | to_verify | |
| tof | 99.1% | scpi_complet.json | to_verify | Bulletin T3 null sur ce champ |
| subscription_fees | 12% | scpi_complet.json | to_verify | |
| enjoyment_delay | 6 mois | scpi_complet.json | to_verify | |
| reconstitution_value | 258.45€ | scpi_complet.json | to_verify | |
| discount_premium | -3.27% | scpi_complet.json | to_verify | |
| **debt_ratio** | **0.1%** | **bulletin_comete_t3_2025.json** | **official_document** | Seul champ officiel |
| ran | null | absent | missing | |

---

### Iroko Zen (Iroko)

| Indicateur | Valeur | Origine réelle | Statut | Risque |
|------------|--------|----------------|--------|--------|
| **distribution_rate** | **7.12%** | **scpi_complet.json** | **to_verify** | Bulletin T3 null — non confirmé |
| **share_price** | **204€** | **bulletin_iroko_zen_t3_2025.json** | official_document | ✅ |
| **capitalization** | **1237 M€** | **bulletin_iroko_zen_t3_2025.json** | official_document | ✅ |
| **tof** | **98.1%** | **bulletin_iroko_zen_t3_2025.json** | official_document | ✅ |
| occupancy_rate | 97.6% | bulletin (TOP physique) | official_document | ✅ |
| subscription_fees | 0% | scpi_complet.json | to_verify | |
| enjoyment_delay | 1 mois | scpi_complet.json | to_verify | |
| **reconstitution_value** | **213.65€** | **bulletin_iroko_zen_t3_2025.json** | official_document | ✅ |
| discount_premium | null | absent bulletin | missing | |
| **debt_ratio** | **30.1%** | **bulletin_iroko_zen_t3_2025.json** | official_document | ✅ |

**Statut global to_verify** car l'indicateur clé (distribution_rate) n'est pas dans le bulletin.  
5/7 champs clés sont officiels — la SCPI est la plus proche de `verified` après Remake Live.

---

### Remake Live (Remake Asset Management)

| Indicateur | Valeur | Origine réelle | Statut | Risque |
|------------|--------|----------------|--------|--------|
| **distribution_rate** | **7.5%** | **bulletin_remake_live_t3_2025.json** | **verified** | ✅ |
| **share_price** | **204€** | **bulletin** | verified | ✅ |
| **capitalization** | **806 M€** | **bulletin** | verified | ✅ |
| **tof** | **99.3%** | **bulletin** | verified | ✅ |
| **reconstitution_value** | **203.52€** | **bulletin** | verified | ✅ |
| **discount_premium** | **+0.24%** | **bulletin** | verified | ✅ |
| **debt_ratio** | **18.64%** | **bulletin** | verified | ✅ |
| **sector_breakdown** | Complet | **bulletin** | verified | ✅ |
| **geography_breakdown** | Complet | **bulletin** | verified | ✅ |
| subscription_fees | 0% | scpi_complet.json | to_verify | Mineur |
| enjoyment_delay | 6 mois | scpi_complet.json | to_verify | Mineur |

**⚠️ URL source_url** : `https://remake-am.com` — à confirmer vs `remake-asset-management.com`.

---

### Transitions Europe (Arkéa REIM)

| Indicateur | Valeur | Origine réelle | Statut | Risque |
|------------|--------|----------------|--------|--------|
| **distribution_rate** | **8.6%** | **scpi_complet.json** | **to_verify** | Bulletin T3 null — non confirmé |
| **share_price** | **200€** | **bulletin_transitions_europe_t3_2025.json** | official_document | ✅ |
| **capitalization** | **948 M€** | **bulletin** | official_document | ✅ |
| **tof** | **97.54%** | **bulletin** | official_document | ✅ |
| **reconstitution_value** | **207.02€** | **bulletin** | official_document | ✅ |
| **discount_premium** | **-3.4%** | **bulletin** | official_document | ✅ |
| **debt_ratio** | **0%** | **bulletin** | official_document | ✅ |
| **sector_breakdown** | Complet | **bulletin** | official_document | ✅ |
| **geography_breakdown** | Complet | **bulletin** | official_document | ✅ |
| subscription_fees | 12% | scpi_complet.json | to_verify | Mineur |
| enjoyment_delay | 6 mois | scpi_complet.json | to_verify | Mineur |

**⚠️ URL source_url** : `https://arkeaim.com` — à confirmer vs `arkea-im.com`.

---

## Données réellement officielles (bulletin extrait)

| Champ | Remake Live | Iroko Zen | Transitions Europe | Comète | Activimmo |
|-------|-------------|-----------|-------------------|--------|-----------|
| distribution_rate | ✅ | ❌ | ❌ | ❌ | ❌ |
| share_price | ✅ | ✅ | ✅ | ❌ | ❌ |
| capitalization | ✅ | ✅ | ✅ | ❌ | ❌ |
| tof | ✅ | ✅ | ✅ | ❌ | ❌ |
| reconstitution_value | ✅ | ✅ | ✅ | ❌ | ❌ |
| discount_premium | ✅ | ❌ | ✅ | ❌ | ❌ |
| debt_ratio | ✅ | ✅ | ✅ | ✅ | ❌ |
| sector_breakdown | ✅ | ❌ | ✅ | ❌ | ❌ |
| geography_breakdown | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## Données restant issues du fichier legacy

- **Distribution rate** : 4/5 SCPI (Activimmo, Comète, Iroko Zen, Transitions Europe)
- **Source publication date** : 5/5 SCPI (date T3 2025 non extraite des bulletins JSON)
- **Frais de souscription** : 5/5 SCPI (non présent dans les bulletins)
- **Délai de jouissance** : 5/5 SCPI (non présent dans les bulletins)
- **URLs sources exactes** : 5/5 SCPI (registre à null, domaines déduits)

---

## Données à vérifier manuellement avant extension à 20 SCPI

| Priorité | Action | SCPI |
|----------|--------|------|
| 🔴 P0 | Créer `bulletin_activimmo_t3_2025.json` depuis le bulletin PDF | Activimmo |
| 🔴 P0 | Confirmer TD Comète 9% (bulletin) | Comète |
| 🟡 P1 | Confirmer TD Iroko Zen 7.12% dans bulletin annuel | Iroko Zen |
| 🟡 P1 | Confirmer TD Transitions Europe 8.6% dans bulletin annuel | Transitions Europe |
| 🟡 P1 | Vérifier URL `remake-am.com` | Remake Live |
| 🟡 P1 | Vérifier URL `arkeaim.com` | Transitions Europe |
| 🟢 P2 | Renseigner URLs dans `scpi_source_registry_seed.json` | Tous |
| 🟢 P2 | Extraire date publication réelle des bulletins T3 2025 | Tous |

---

## Le pipeline est-il prêt pour 20 SCPI ?

**Réponse : non, pas encore — mais le fondement est sain.**

### Ce qui fonctionne
- Les scripts s'exécutent correctement (`npx tsx scripts/data/collect-scpi-indicators.ts`)
- La classification source_origin / data_status est maintenant honnête
- Le comparateur et les pages SCPI consomment correctement les données enrichies
- La règle "données legacy = to_verify" est appliquée
- Remake Live est la référence pour ce qu'un `verified` doit signifier

### Ce qui bloque l'extension à 20 SCPI
1. **Le taux de distribution n'est pas dans les bulletins JSON** pour 4/5 pilotes — c'est le champ le plus affiché dans le comparateur. L'extension ne peut pas se faire proprement sans résoudre ce point.
2. **Les URLs officielles sont toutes à null** dans `scpi_source_registry_seed.json` — les prochaines SCPI n'auront aucune source traceable.
3. **Activimmo n'a pas de bulletin JSON** — le pattern `collect → normalize` ne pourra pas s'appliquer uniformément.

### Condition pour passer à 20 SCPI
- Alimenter `scpi_source_registry_seed.json` avec les URLs officielles
- Produire les bulletins JSON manquants (notamment Activimmo)
- Identifier pour chaque SCPI si le TD est dans le bulletin ou seulement dans les rapports annuels
