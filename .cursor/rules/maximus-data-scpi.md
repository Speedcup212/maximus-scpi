# MaximusSCPI — Règles data SCPI

## Objectif

Garantir la **fiabilité**, la **cohérence** et la **traçabilité** de toutes les données SCPI affichées sur MaximusSCPI.

## Indicateurs prioritaires

| Indicateur | Source | Priorité |
|---|---|---|
| Taux de distribution (TDVM) | Bulletin trimestriel, DIC | Critique |
| TOF (taux d'occupation financier) | Rapport annuel, bulletin | Critique |
| Capitalisation | Bulletin, site gestionnaire | Haute |
| Valeur de reconstitution | Bulletin, DIC | Haute |
| Décote / surcote | Calcul : prix / VR - 1 | Haute |
| Frais de souscription | DIC, note d'information | Haute |
| Frais de gestion | DIC | Haute |
| Endettement | Rapport annuel | Moyenne |
| Report à nouveau | Rapport annuel | Moyenne |
| Collecte nette | Bulletin trimestriel | Moyenne |
| Secteur d'activité | Rapport annuel | Haute |
| Zone géographique | Rapport annuel | Haute |
| Gestionnaire | DIC | Haute |
| Label ISR | Site gestionnaire | Basse |
| Date de source | Métadonnée obligatoire | Critique |

## Statuts de qualité

Chaque indicateur doit porter un statut :

| Statut | Signification | Affichage |
|---|---|---|
| `verified` | Donnée extraite et validée par QA | Publiable |
| `manual_review` | Donnée extraite mais non validée | Afficher avec réserve ou masquer |
| `source_missing` | Source document absente | Ne pas afficher — afficher N/A |
| `inconsistent` | Divergence entre sources ou surfaces UI | Bloquer publication, alerter |

## Règles absolues

- **Ne jamais inventer une donnée absente** — afficher N/A ou masquer.
- **Ne jamais extrapoler** un taux de distribution passé vers le futur.
- **Prioriser la valeur de reconstitution QA-validée** pour le calcul décote/surcote.
- **Recalculer la décote/surcote à l'affichage** si le prix a changé depuis l'extraction.
- **Une seule source de vérité** : `scpiIndicatorRegistry` / `resolveScpiIndicator`.
- **Auditer** après chaque modification data avec les scripts `scripts/scpi-agents/`.

## Sources autorisées

- DIC (Document d'Information Clé)
- Note d'information
- Bulletin trimestriel
- Rapport annuel
- Site de la société de gestion
- ASPIM (statistiques sectorielles)
- Extraction DeepSeek (avec QA obligatoire avant intégration)

## Agent responsable

`agents/DATA_SCPI_AGENT.md`
