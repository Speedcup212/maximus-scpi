# Batch Nouveaux Articles 1 — MaximusSCPI

**Date :** Juin 2026  
**Objectif :** Créer un premier batch d'articles SCPI manquants à forte intention business  
**Source :** `reports/articles_scpi_audit_priorisation.md`

---

## 1. Articles créés (9)

| ID | Slug | Titre | Catégorie | Famille |
|---|---|---|---|---|
| 138 | `scpi-ou-lmnp` | SCPI ou LMNP : quel investissement locatif choisir en 2026 ? | `strategies-patrimoniales` | Stratégies patrimoniales SCPI |
| 139 | `scpi-ou-immobilier-locatif` | SCPI ou immobilier locatif direct : avantages, fiscalité et rendement | `strategies-patrimoniales` | Stratégies patrimoniales SCPI |
| 140 | `scpi-ou-assurance-vie` | SCPI ou assurance-vie : que choisir pour votre épargne ? | `fiscalite-modes` | Fiscalité et modes de détention |
| 141 | `scpi-capital-fixe-capital-variable` | SCPI à capital fixe ou capital variable : comprendre les différences | `analyse-criteres` | Critères d'analyse SCPI |
| 142 | `bulletin-trimestriel-scpi` | Comment lire un bulletin trimestriel de SCPI : guide complet | `analyse-criteres` | Critères d'analyse SCPI |
| 143 | `rapport-annuel-scpi` | Comment lire un rapport annuel de SCPI : points clés à vérifier | `analyse-criteres` | Critères d'analyse SCPI |
| 144 | `delai-revente-scpi` | Délai de revente d'une SCPI : combien de temps pour récupérer son argent ? | `risques-vigilance` | Risques, liquidité et vigilance |
| 145 | `investir-scpi-apres-50-ans` | Investir en SCPI après 50 ans : stratégie patrimoniale et revenus | `strategies-patrimoniales` | Stratégies patrimoniales SCPI |
| 146 | `scpi-non-resident-fiscal` | SCPI pour non-résident fiscal : fiscalité et investissement | `fiscalite-avancee` | Fiscalité et modes de détention |

---

## 2. Article non créé (déjà existant)

| Slug existant | Titre existant | Raison |
|---|---|---|
| `scpi-transmission` (ID 81) | SCPI et transmission : donation, démembrement et succession | Slug déjà présent dans `articleTemplatesConfig.ts`. Article existant, catégorie `strategies-patrimoniales`. |

---

## 3. Liens internes à inclure

Chaque nouvel article contient dans son contenu généré des liens internes vers :

- `/articles/` — bibliothèque complète
- `/comparateur-scpi/` — comparateur SCPI
- Pages spécifiques selon le sujet

### Liens par article (recommandés pour le maillage)

| Article | Liens recommandés |
|---|---|
| `scpi-ou-lmnp` | `/articles/`, `/comparateur-scpi/`, `/scpi-fiscalite/`, `/scpi-ou-immobilier-locatif/` |
| `scpi-ou-immobilier-locatif` | `/articles/`, `/comparateur-scpi/`, `/scpi-credit/`, `/scpi-ou-lmnp/` |
| `scpi-ou-assurance-vie` | `/articles/`, `/comparateur-scpi/`, `/scpi-assurance-vie/`, `/scpi-fiscalite/` |
| `scpi-capital-fixe-capital-variable` | `/articles/`, `/comparateur-scpi/`, `/liquidite-scpi/`, `/baisse-prix-part-scpi/` |
| `bulletin-trimestriel-scpi` | `/articles/`, `/comparateur-scpi/`, `/tof-scpi/`, `/endettement-scpi/`, `/documents-reglementaires-scpi/` |
| `rapport-annuel-scpi` | `/articles/`, `/comparateur-scpi/`, `/dic-scpi/`, `/note-information-scpi/`, `/documents-reglementaires-scpi/` |
| `delai-revente-scpi` | `/articles/`, `/comparateur-scpi/`, `/liquidite-scpi/`, `/risques-scpi/` |
| `investir-scpi-apres-50-ans` | `/articles/`, `/comparateur-scpi/`, `/scpi-retraite/`, `/scpi-transmission/`, `/scpi-revenus-complementaires/` |
| `scpi-non-resident-fiscal` | `/articles/`, `/comparateur-scpi/`, `/scpi-revenus-etrangers/`, `/scpi-credit-impot/`, `/scpi-fiscalite/` |

---

## 4. CTA utilisés (contenu généré automatiquement)

Les CTA suivants sont intégrés dans le contenu dynamique de chaque article :

- **CTA principal :** Comparer les SCPI (lien vers `/comparateur-scpi/`)
- **CTA secondaire :** Prendre rendez-vous avec un conseiller (Calendly)
- **CTA contextuel :** Analyse de projet

---

## 5. Pages à vérifier après déploiement

| Page | URL | Vérification |
|---|---|---|
| SCPI ou LMNP | `/scpi-ou-lmnp/` | Affichage correct dans `/articles/` catégorie Stratégies |
| SCPI ou immobilier locatif | `/scpi-ou-immobilier-locatif/` | Affichage correct dans `/articles/` catégorie Stratégies |
| SCPI ou assurance-vie | `/scpi-ou-assurance-vie/` | Affichage correct dans `/articles/` catégorie Fiscalité |
| Capital fixe/variable | `/scpi-capital-fixe-capital-variable/` | Affichage correct dans Critères d'analyse |
| Bulletin trimestriel | `/bulletin-trimestriel-scpi/` | Affichage correct dans Critères d'analyse |
| Rapport annuel | `/rapport-annuel-scpi/` | Affichage correct dans Critères d'analyse |
| Délai de revente | `/delai-revente-scpi/` | Affichage correct dans Risques |
| Après 50 ans | `/investir-scpi-apres-50-ans/` | Affichage correct dans Stratégies |
| Non-résident fiscal | `/scpi-non-resident-fiscal/` | Affichage correct dans Fiscalité |
| Recherche "SCPI ou LMNP" | `/articles/` | Résultat pertinent en moteur de recherche |
| Recherche "non résident" | `/articles/` | Résultat pertinent en moteur de recherche |

---

## 6. Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/data/articleTemplatesConfig.ts` | +9 entrées (IDs 138-146) |

---

## 7. Conformité

Tous les nouveaux articles respectent :

- ✅ Pas de promesse de rendement
- ✅ Pas de recommandation personnalisée automatisée
- ✅ Distinction information / pédagogie / conseil personnalisé
- ✅ Mention conformité incluse dans le rendu dynamique
- ✅ Données historiques uniquement (aucune extrapolation)
- ✅ Rappel des risques SCPI
