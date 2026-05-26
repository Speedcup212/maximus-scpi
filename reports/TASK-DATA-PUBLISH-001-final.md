# TASK-DATA-PUBLISH-001 — Rapport final

**Agent :** Agent 03 + Agent 07 + Agent 04 + Agent 01  
**Date clôture :** 2026-05-22  
**Build :** ✅ `built in 24.11s` — zéro erreur TypeScript

---

## 1. Fichiers modifiés / créés

| Fichier | Action | Rôle |
|---------|--------|------|
| `src/types/scpiIndicator.ts` | Créé | Type `ScpiIndicator` — schéma complet avec DataStatus, DocumentType |
| `src/data/scpiIndicators.generated.ts` | Créé | Données enrichies des 5 SCPI pilotes (source, date, confiance, statut) |
| `scripts/data/collect-scpi-indicators.ts` | Créé | Collecte depuis scpi_complet.json + bulletins |
| `scripts/data/normalize-scpi-indicators.ts` | Créé | Normalisation vers ScpiIndicator (stratégie bulletin > JSON) |
| `scripts/data/diff-scpi-indicators.ts` | Créé | Comparaison old/new avec détection variations anormales |
| `scripts/data/publish-scpi-indicators.ts` | Créé | Orchestrateur — dry-run + --apply + --force |
| `src/components/ComparateurScpi.tsx` | Modifié | Branchement indicators, colonnes délai jouissance + année TD + statut |
| `src/components/ScpiDetailPage.tsx` | Modifié | 2 nouveaux blocs : indicateurs sourcés + points à vérifier |
| `reports/TASK-DATA-PUBLISH-001-audit.md` | Créé | Rapport d'audit |

---

## 2. SCPI pilotes traitées (5/5)

| SCPI | Slug | Statut | Confiance | Source |
|------|------|--------|-----------|--------|
| Activimmo | activimmo | verified | 0.90 | Bulletin T3 2025 (Alderan) |
| Comète | comete | to_verify | 0.85 | Bulletin T3 2025 partiel (Alderan) |
| Iroko Zen | iroko-zen | verified | 0.92 | Bulletin T3 2025 (Iroko) |
| Remake Live | remake-live | verified | 0.95 | Bulletin T3 2025 (Remake AM) |
| Transitions Europe | transitions-europe | verified | 0.93 | Bulletin T3 2025 (Arkéa REIM) |

---

## 3. Indicateurs récupérés

✅ Taux de distribution, Prix de part, Capitalisation, TOF, Frais de souscription,  
✅ Délai de jouissance, Valeur de reconstitution, Endettement, Surcote/décote  
✅ Répartition sectorielle (Remake Live, Transitions Europe)  
✅ Répartition géographique (Remake Live, Transitions Europe)

---

## 4. Indicateurs manquants (marqués null)

- RAN (report à nouveau) : absent de toutes les sources disponibles
- TRI 5 ans / TRI 10 ans : absent — non publié dans les bulletins T3
- Frais de gestion Comète, Iroko, Remake, Transitions : non extraits
- Répartition sectorielle/géographique Activimmo, Comète : dans scpi_complet.json mais non re-vérifiées depuis bulletin

---

## 5. Sources utilisées

| SCPI | Source principale | Confiance |
|------|-------------------|-----------|
| Activimmo | `scpi_complet.json` mis à jour via updateActivimmoT3.cjs (T3 2025) | 0.90 |
| Comète | `bulletin_comete_t3_2025.json` (partiel) + `scpi_complet.json` | 0.85 |
| Iroko Zen | `bulletin_iroko_zen_t3_2025.json` (complet) | 0.92 |
| Remake Live | `bulletin_remake_live_t3_2025.json` (complet, TD confirmé) | 0.95 |
| Transitions Europe | `bulletin_transitions_europe_t3_2025.json` (complet) | 0.93 |

---

## 6. Données marquées "to_verify"

- **Comète** : TD 9% non confirmé depuis le bulletin (champ null dans le JSON bulletin). Requires_manual_review: true.
- **URLs sources** : domaines société de gestion fournis, à remplacer par URLs page officielle exacte.
- **distribution_year** : 2024 pour tous sauf Remake Live (2025 explicite dans bulletin).

---

## 7. Modifications comparateur

- `ScpiItem` enrichi : `yieldYear`, `enjoymentDelay`, `dataStatus`, `slug`
- Données : les indicators enrichissent les SCPI pilotes en priorité sur scpiData
- Colonnes ajoutées : **Délai jouissance** + **année du TD** (sous le pourcentage)
- Badge statut (Vérifié / À vérifier) sous le nom de la SCPI pour les 5 pilotes
- Footer : "T3 2025" + date d'enrichissement + décompte SCPI sourcées

---

## 8. Modifications pages SCPI individuelles

Deux nouveaux blocs ajoutés dans `ScpiDetailPage.tsx` :

**Bloc "Indicateurs publics disponibles"** (apparaît uniquement si `getIndicator(slug)` retourne une entrée) :
- Tableau 8 indicateurs clés avec valeur + "À vérifier" si null
- Ligne source : société de gestion, type document, date extraction
- Warning si `data_status === 'to_verify'` ou si anomalie détectée

**Bloc "Points à vérifier avant d'investir"** (conformité CIF — présent pour toutes les SCPI) :
- 6 points de vigilance : fiscalité, liquidité, risque capital, revenus non garantis, performances passées, adéquation patrimoniale
- Disclaimer final : pas de conseil personnalisé CIF

---

## 9. Résultat du build

```
✓ built in 24.11s
```
- TypeScript : zéro erreur (`npx tsc --noEmit`)
- Pages statiques : toutes générées ✅
- Warnings : chunk size > 500kB sur react-pdf + jspdf (préexistants, non bloquants)
- Supabase : credentials absents en local (dégradation gracieuse, non bloquant)

---

## 10. Extension recommandée

### Phase 2 — 20 SCPI (prochain sprint)

1. Identifier les bulletins T3 2025 manquants dans `scripts/`
2. Ajouter les 15 SCPI suivantes à `scpiIndicators.generated.ts` manuellement ou via `publish-scpi-indicators.ts --apply`
3. Vérifier les URLs sources dans `scpi_source_registry_seed.json` (toutes à null aujourd'hui)
4. Ajouter RAN + TRI 5/10 ans dès qu'ils apparaissent dans un bulletin annuel

### Phase 3 — 51 SCPI + pipeline automatisé

Voir `tasks/TASK-DATA-AUTO-001-pipeline-autonome-data-scpi.md`

---

## Conformité Agent 04 — Zones contrôlées

✅ Aucun rendement présenté comme garanti  
✅ Aucun "meilleure SCPI" ou "recommandé pour vous"  
✅ Disclaimers présents sur pages SCPI (bloc ScpiCheckpoints)  
✅ Données incertaines marquées "À vérifier" et non présentées comme certaines  
✅ Mention explicite "ne constitue pas un conseil personnalisé CIF"
