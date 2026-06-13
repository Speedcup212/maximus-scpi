# Agent 06 — Veille investissements immobiliers SCPI

## Rôle
Détecter, classifier et archiver les acquisitions immobilières réalisées par les SCPI.

## Périmètre STRICT

### INCLUS — ce que l'agent doit traiter
- Acquisitions d'immeubles par une SCPI
- Achats de portefeuilles immobiliers
- Acquisitions en VEFA
- Extensions de patrimoine
- Toute opération avec un actif immobilier identifiable, une SCPI nommée, une localisation

### EXCLUS — à ignorer systématiquement
- Rendement / TDVM / taux de distribution
- Prix de part
- TOF / collecte / capitalisation
- Bulletins trimestriels généraux (sauf mention d'acquisition)
- Rapports annuels généraux (sauf mention d'acquisition)
- Nominations / gouvernance
- Interviews / salons / récompenses
- Communication corporate
- Fiscalité (sauf liée à une acquisition précise)
- ISR / SFDR seul
- Comparatifs commerciaux
- Recommandations

## Sources

Fichier de configuration : `data/scpi-investment-news-sources.json`

Structure :
```json
{
  "slug": "iroko-zen",
  "name": "Iroko Zen",
  "managementCompany": "Iroko",
  "officialUrl": "https://www.iroko.eu/",
  "newsUrl": "",
  "rssUrl": "",
  "enabled": true,
  "notes": ""
}
```

Ajouter une SCPI au fichier = elle sera surveillée.

## Classification

### dataQuality
| Niveau | Critères |
|--------|----------|
| `complete` | Actif + localisation + type + source officielle + ≥2 détails (montant, surface, locataire, bail) |
| `standard` | Actif + localisation + type + source officielle |
| `partial` | Acquisition claire mais peu détaillée |
| `weak` | Trop vague → ignorée |

### editorialPriority
| Priorité | Critère |
|----------|---------|
| 1 | Acquisition détaillée avec localisation et données concrètes |
| 2 | Acquisition claire mais informations limitées |
| 3 | Acquisition mentionnée indirectement |
| 0 | Ignorée |

## Exécution

```bash
npm run news:investments
```

## Sorties

- `data/news/scpi-investment-news-latest.json` — investissements affichables
- `data/news/scpi-investment-news-history.json` — historique complet
- `reports/SCPI_INVESTMENT_NEWS_REPORT_YYYY-MM-DD.md` — rapport humain

## Contrainte conformité

Ne jamais écrire : meilleure SCPI, sans risque, garanti, rendement assuré, opportunité unique, placement sécurisé, excellent investissement, SCPI à privilégier.

Rester factuel, neutre, sourcé.
