# Rapport d'extraction — Crédit Mutuel Pierre 1

**Date :** 2026-05-28
**Package :** `data-import/processed/credit-mutuel-pierre-1/`
**Source primaire :** Bulletin T1 2026 (A7_BT_20260331.pdf)
**Statut :** ✅ Package structuré — intégré dans MaximusSCPI

---

## Documents traités

| Fichier | Type | Confiance |
|---|---|---|
| `A7_BT_20260331.pdf` | Bulletin trimestriel T1 2026 | 99% |
| `A7_DIC.pdf` | DIC PRIIPs | 99% |
| `A7_note_statuts.pdf` | Note d'information + Statuts | 99% |
| `Fiche commerciale Crédit Mutuel Pierre 1.pdf` | Plaquette officielle | 90% |

---

## Indicateurs extraits

- **Publishable :** 51
- **manual_review :** 6 (walt, walb, label_isr, date_dissolution, collecte_nette_t1_2026)
- **Hors modèle (gap) :** 11 champs publiables non mappés dans ScpiIndicator

---

## Situation exceptionnelle — Liquidité

**Marché des parts suspendu depuis le 12/02/2026.**
- 396 756 parts en attente de retrait
- Montant : 78 500 000 €
- Ratio : 10,7 % du total des parts
- Collecte brute T1 2026 : 1 100 € (quasiment nulle)
- Première confrontation prévue : 31/07/2026

---

## Anomalies

1. **critical** — Marché des parts suspendu (liquidité)
2. **warning** — WALT/WALB : manual_review (règle ASPIM à vérifier)
3. **warning** — Label ISR : non confirmé dans le bulletin T1 2026
4. **warning** — Date de dissolution : conflit entre sources
5. **info** — TOF en forte baisse (93,8% legacy → 82,3% T1 2026)
6. **info** — Capitalisation divisée par ~2,7 (2154 M€ → 800 M€)
7. **info** — Collecte nette T1 2026 : tiret dans le bulletin (non publiée)

---

## Règles appliquées

- WALT/WALB → manual_review (règle établie TASK-DATA-SCPI-PILOT-ALTIXIA-CADENCE-XII-002)
- Label ISR → manual_review (confirmation explicite requise)
- Données calculées → toujours vérifiées avant publication
- Données prévisionnelles → jamais publishable
