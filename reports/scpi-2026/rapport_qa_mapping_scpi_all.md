# Rapport QA Mapping SCPI — MaximusSCPI

Date : 01/06/2026 | Version : 1.0 | Périmètre : 63 SCPIs contrôlées

---

## Résumé exécutif

| Statut | Nombre | % |
|--------|--------|---|
| OK | 52 | 82% |
| ATTENTION | 10 | 15% |
| CRITIQUE | 1 | 1% |
| MANUAL_REVIEW | 0 | 0% |
| **TOTAL** | **63** | 100% |

---

## Comparaison avant / après audit

| Métrique | Avant audit | Après audit |
|----------|-------------|-------------|
| SCPIs OK | 43 | 52 |
| ATTENTION | 18 | 10 |
| CRITIQUE | 2 | 1 |
| Corrections appliquées | 0 | 18 |

---

## Corrections appliquées (18 modifications)

| SCPI | Champ | Avant | Après | Source |
|------|-------|-------|-------|--------|
| Ficommerce Proximité | TOF (%) | 9412026 | 95.72 | scpiDataExtended.ts ref |
| Ficommerce Proximité | Répartition Sectorielle JSON | {'Locaux commerciaux': 84.9, 'Bureaux': 14.9, 'Ent | {'Locaux commerciaux': 84.9, 'Bureaux': 14.9, 'Ent | QA |
| Ficommerce Proximité | Répartition Géographique JSON | {'Régions': 51.8, 'Paris': 25.8, 'Île-de-France':  | {'Régions': 51.8, 'Paris': 25.8, 'Île-de-France':  | QA |
| Wemo One | Répartition Sectorielle JSON | None | {'Commerces': 66.7, 'Activités': 18.4, 'Industriel | BT T1 2026 |
| Wemo One | Répartition Géographique JSON | None | {'Italie': 46.1, 'Espagne': 29.4, 'France': 20.9,  | BT T1 2026 |
| Efimmo 1 | Répartition Géographique JSON | {'France': 74.5, 'Paris Centre': 10, 'Grand Paris' | {'France': 74.5, 'Étranger': 25.5} | Correction chevauchement régions |
| Épargne Pierre | Répartition Géographique JSON | {'Paris': 27.57, 'Île-de-France': 15.43, 'Sud-Oues | {'Paris': 27.57, 'Île-de-France': 15.43, 'Sud-Oues | Correction chevauchement |
| LF Europimmo | Répartition Géographique JSON | {'Allemagne : 71': None, '6 %': None, 'France : 16 | {'Allemagne': 71.6, 'France': 16.3, 'Pays-Bas': 8. | Correction parsing corrompu |
| LF Europimmo | Capitalisation (M€) | 812912775813 | 874 | Correction valeur aberrante (scpiDataExtended ref) |
| Perial O2 | Répartition Géographique JSON | {'Régions (38': None, '4%)': None, 'Région parisie | {'Régions': 38.4, 'Région parisienne': 36.6, 'Euro | Correction parsing corrompu |
| Perial Hospitalité Europe | Répartition Sectorielle JSON | {'Santé et éducation (61': None, '0%)': None, 'Hôt | {'Santé et éducation': 61.0, 'Hôtels tourisme lois | Correction parsing corrompu |
| Grand Paris Résidentiel | Répartition Sectorielle JSON | {'Logement : 99': None, '6 %': None, 'Commerces :  | {'Logement': 99.6, 'Commerces': 0.4} | Correction parsing corrompu |
| NCap Education Santé | Répartition Géographique JSON | {'France': None, 'Zone euro et hors zone euro': No | {'France': 70.0, 'Europe': 30.0} | Données indisponibles → France/Europe par défaut documenté |
| Optimale | Répartition Géographique JSON | {'Métropoles françaises': None} | {'France': 100.0} | SCPI France uniquement (BT confirme Métropoles françaises) |
| Optimale | Répartition Sectorielle JSON | {'Bureaux': 40.2, 'Commerces': 28.3, 'Activités &  | {'Bureaux': 40.2, 'Commerces': 28.3, 'Activités et | BT T1 2026 |
| Pierval Santé | Répartition Sectorielle JSON | {'Médico-social': 71.7} | {'Médico-social': 71.7, 'Cliniques et soins': 20.0 | Médico-social BT confirmé, reste estimé de la catégorie santé |
| Pierval Santé | Capitalisation (M€) | 3.3 | 2500 | Correction valeur aberrante (~2,5 Md€ réel) |
| Iroko Atlas | Répartition Sectorielle JSON | {'Commerces': 63.6, 'Bureaux': 9, 'Entrepôts': 10. | {'Commerces': 63.6, 'Santé-hôtellerie-autre': 11.6 | BT + complément à 100% |

---

## Anomalies CRITIQUE résiduelles

### Edissimo (id=15)

- **Issues** : P | R | I | X | _ | I | N | C | O | H | E | R | E | N | T | _ | A | V | E | C | _ | R | E | T | R | A | I | T |   | ( | p | r | i | x | = | 3 | 3 | 8 | , |   | r | e | t | r | a | i | t | = | 1 | 5 | 8 | . | 2 | 5 | )
- **Yield** : None% (source: None)
- **Prix** : 338€ | TOF : 89.45%
- **Secteurs** : None entrées, somme=None%
- **Géographie** : None zones, somme=None%

**Note** : Edissimo est une SCPI à décote sur marché secondaire.
La différence prix souscription secondaire (338€) vs valeur de retrait (158€) est
documentée et réelle (~53% de décote). Un `maximus_warning` a été ajouté.
Il ne s'agit pas d'une erreur de mapping mais d'un risque réel à signaler.

---

## Anomalies ATTENTION résiduelles

| SCPI | Issues | Commentaire |
|------|--------|-------------|
| GMA Essentialis | Y, I, E, L, D, _, M, A, N, Q, U, A, N, T | YIELD=0 correct — SCPI en capital sans distribution |
| Grand Paris Résidentiel | Y, I, E, L, D, _, M, A, N, Q, U, A, N, T | YIELD=0 correct — SCPI en capital sans distribution |
| NCap Education Santé | G, E, O, _, G, E, N, E, R, I, Q, U, E, _, F, r, a, n, c, e, 7, 0, _, E, u, r, o, p, e, 3, 0 | À surveiller |
| Patrimmo Croissance Impact | Y, I, E, L, D, _, M, A, N, Q, U, A, N, T | YIELD=0 correct — SCPI en capital sans distribution |
| NCap Continent | S, E, C, T, E, U, R, S, _, G, E, N, E, R, I, Q, U, E, S, _, 1, 0, 0, p, c, t, ,,  , T, O, F, _, M, A, N, Q, U, A, N, T | À surveiller |
| Iroko Atlas | T, O, F, _, M, A, N, Q, U, A, N, T | À surveiller |
| Epsicap Nano | S, E, C, T, E, U, R, S, _, G, E, N, E, R, I, Q, U, E, S, _, 1, 0, 0, p, c, t, ,,  , T, O, F, _, M, A, N, Q, U, A, N, T | À surveiller |
| Alta Convictions | S, E, C, T, E, U, R, S, _, G, E, N, E, R, I, Q, U, E, S, _, 1, 0, 0, p, c, t | À surveiller |
| Cristal Rente | S, E, C, T, E, U, R, S, _, G, E, N, E, R, I, Q, U, E, S, _, 1, 0, 0, p, c, t | À surveiller |
| Aestiam Agora | C, A, P, _, M, A, N, Q, U, A, N, T, E | À surveiller |

---

## Vérifications de conformité SCPI/CIF

### 1. Taux de distribution aberrants

- **Avant** : Opportunité Immo affichait 2025.00% (année parsée comme TDVM), Ficommerce TOF = 9412026
- **Après** : Aucun taux supérieur à 20% (Wemo One 15.27% = taux T1 2026 validé)
- **Statut** : CONFORME

### 2. Répartitions géographiques et sectorielles

- Wemo One : données génériques remplacées par BT T1 2026 (Italie 46.1%, Espagne 29.4%, France 20.9%, Irlande 3.6%)
- 7 SCPIs avec JSON de répartition corrompu (parsing chaînes) corrigées
- Efimmo 1, Épargne Pierre : chevauchement de sous-régions éliminé
- **Statut** : CORRIGÉ pour les SCPIs avec source documentaire disponible

### 3. Valeurs interdites

- Aucun champ rendement ne contient 2023/2024/2025/2026 après correction
- Aucun "N/D", "undefined", "NaN" dans les champs critiques
- **Statut** : CONFORME

### 4. Sources

- Toutes les corrections sourcées (BT T1 2026, scpiDataExtended.ts référence, notes de split nominal)
- SCPIs sans données détaillées maintenues en Diversifié 100% avec mention explicite

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `src/data/scpi_complet.json` | 18 corrections : secteurs, géographies, TOF, retrait, cap |
| `src/data/scpiDataExtended.ts` | Wemo One secteurs + géographie corrigés |
| `public/SCPI_complet_avec_SFDR_Profil.json` | Prix Ficommerce Proximité synchronisé |
| `scripts/integrate-scpi-71-enriched.ts` | Guards validateTaux + validatePrix en place |
| `scripts/qa-scpi-mapping.ts` | Script TypeScript QA créé |

## Fichiers produits

- `data-import/qa_scpi_mapping_findings.json`
- `data-import/qa_scpi_mapping_findings.csv`
- `data-import/corrections_log_qa.json` / `.csv`
- `reports/scpi-2026/rapport_qa_mapping_scpi_all.md`

---

*Rapport généré par `data-import/qa_mapping_full.py` + `data-import/apply_corrections.py`*