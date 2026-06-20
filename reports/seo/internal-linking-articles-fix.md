# Rapport : Maillage interne crawlable des articles SCPI

**Date :** 2026-06-11  
**Mission :** Améliorer l'indexation des articles SCPI via un maillage interne crawlable

---

## 1. Problème initial

Audit interne réalisé le 11/06/2026 :
- **143 articles** sur 144 dans le sitemap étaient **orphelins** : aucun `<a href>` crawlable depuis les pages fortes du site.
- `EducationArticlesIndexPage` (`/articles/`) référençait les articles via `<button onClick>`, ce qui est invisible pour Googlebot.
- `semanticCocon.ts`, utilisé pour le maillage sémantique des pages fortes, ne contenait **aucun** lien vers `/articles/{slug}/`.
- `InvestirScpiPillarPage` et `FiscaliteScpiPage` contenaient encore des liens en ancien préfixe `/education/`.
- Résultat GSC : articles détectés via sitemap mais classés « Détectée, actuellement non indexée ».

---

## 2. Pourquoi les articles étaient orphelins malgré le sitemap

- **Sitemap ≠ découverte crawl** : Googlebot découvre les URLs via le sitemap, mais n'indexe que celles qu'il peut crawler via des liens `<a href>` dans le DOM.
- `onClick` sur `<button>` n'est pas un signal crawlable.
- Aucun lien `/articles/{slug}/` n'était présent dans le maillage sémantique (`semanticCocon.ts`).
- Les rares liens articles existants utilisaient l'ancien préfixe `/education/` (redirigé en 301, ce qui dilue le PageRank).

---

## 3. Corrections appliquées

### Étape 1 — Hub `/articles/` crawlable

**Fichier :** `src/components/EducationArticlesIndexPage.tsx`

- **Avant :** Les cartes articles étaient rendues avec `<button type="button" onClick={...}>` sauf pour une liste blanche `DIRECT_ROUTE_SLUGS` qui utilisait `<a href={/${slug}/}>`.
- **Après :** Toutes les cartes articles sont des `<a href={`/articles/${article.slug}/`}>` crawlable, sans exception.
- Suppression du set `DIRECT_ROUTE_SLUGS` devenu obsolète.
- Correction du lien vers `/articles/construire-portefeuille-scpi/` (ajout du trailing slash).

### Étape 2 — Correction des anciens liens `/education/`

**Fichier :** `src/components/InvestirScpiPillarPage.tsx` (9 liens)
- 5 liens dans le tableau `relatedArticles`
- 4 liens inline (`<a href=...>`)

**Fichier :** `src/components/FiscaliteScpiPage.tsx` (10 liens)
- 6 liens dans le tableau `relatedArticles`
- 4 liens inline (`<a href=...>`)

**Avant :** `/education/{slug}/`  
**Après :** `/articles/{slug}/` (avec trailing slash systématique)

### Étape 3 — Maillage sémantique ciblé dans `semanticCocon.ts`

**Fichier :** `src/data/semanticCocon.ts` (+34 liens `/articles/`)

| Page forte | Liens articles ajoutés |
|---|---|
| `/comprendre-scpi` | frais-scpi, risques-scpi, delai-jouissance-scpi, liquidite-scpi, report-a-nouveau-scpi |
| `/meilleures-scpi-rendement` | rendement-scpi-2025-tdvm-taux-distribution, rendement-net-scpi, frais-scpi, risques-scpi, tof-scpi |
| `/comparateur-scpi` | comparateur-scpi-fiable, choisir-scpi, allocation-scpi, meilleures-scpi-attention, rendement-net-scpi |
| `/scpi-fiscales` | scpi-fiscalite, scpi-tmi-30, scpi-revenus-etrangers, scpi-prelevements-sociaux, scpi-sci-is-fiscalite |
| `/scpi-europeennes` | scpi-europeennes, scpi-revenus-etrangers, scpi-expatrie-fiscalite, scpi-internationales-diversification, scpi-credit-impot |
| `/scpi-sante-investissement` | scpi-sante, scpi-sante-seniors-ehpad-cliniques-investissement, risques-scpi, societe-gestion-scpi |
| `/investir-scpi` | premier-investissement-scpi-debutant-guide, combien-investir-scpi, investir-scpi-une-fois-ou-progressivement, achat-scpi-credit-effet-levier-fiscalite, scpi-comptant |

---

## 4. Pages fortes enrichies

7 pages fortes bénéficient désormais d'un maillage sémantique vers les articles :

1. `/comprendre-scpi` — 5 articles
2. `/meilleures-scpi-rendement` — 5 articles
3. `/comparateur-scpi` — 5 articles
4. `/scpi-fiscales` — 5 articles
5. `/scpi-europeennes` — 5 articles
6. `/scpi-sante-investissement` — 4 articles
7. `/investir-scpi` — 5 articles (nouvelle entrée créée)

---

## 5. Nombre approximatif de liens articles crawlables ajoutés

| Source | Liens `/articles/` ajoutés |
|---|---|
| `EducationArticlesIndexPage` (hub `/articles/`) | ~143 (tous les articles listés → `<a href>`) |
| `InvestirScpiPillarPage` | 9 |
| `FiscaliteScpiPage` | 10 |
| `semanticCocon.ts` (7 pages fortes) | 34 |
| **Total estimé** | **~196 liens crawlables** |

---

## 6. URLs à vérifier après déploiement

- `https://maximusscpi.com/articles/` → doit contenir des `<a href="/articles/{slug}/">` dans le DOM
- `https://maximusscpi.com/comprendre-scpi/` → doit afficher les liens articles sémantiques
- `https://maximusscpi.com/meilleures-scpi-rendement/` → idem
- `https://maximusscpi.com/comparateur-scpi/` → idem
- `https://maximusscpi.com/scpi-fiscales/` → idem
- `https://maximusscpi.com/scpi-europeennes/` → idem
- `https://maximusscpi.com/scpi-sante-investissement/` → idem
- `https://maximusscpi.com/investir-scpi/` → idem

**Requête Search Console après déploiement :**
- Soumettre une demande de réexploration pour `/articles/` et les 7 pages fortes enrichies.

---

## 7. Risques restants

1. **Articles sans lien interne direct :** 34 articles ont désormais un lien sémantique depuis au moins 1 page forte. Les ~110 autres articles ne sont crawlables QUE depuis le hub `/articles/`. Un maillage plus profond (articles → articles) serait souhaitable à terme.
2. **Profondeur de crawl :** Le hub `/articles/` porte ~143 liens. Pour Googlebot, les articles liés uniquement depuis le hub sont à profondeur 2 (home → hub → article). C'est acceptable mais pas optimal.
3. **La page `/investir-scpi/`** est une nouvelle entrée dans `semanticCocon`. Il faut vérifier que le composant qui la rend (`ThematicLandingPage` ou autre) appelle bien `getSemanticLinks('/investir-scpi')`.
4. **Pages `FiscaliteScpiPage` et `InvestirScpiPillarPage` :** Ces pages ne passent probablement pas par `getSemanticLinks()` — elles ont leurs propres liens articles inline. Les liens corrigés sont maintenant `/articles/{slug}/` avec trailing slash.

---

## Fichiers modifiés

```
src/components/EducationArticlesIndexPage.tsx  — Hub crawlable, suppression DIRECT_ROUTE_SLUGS
src/components/InvestirScpiPillarPage.tsx      — /education/ → /articles/ (9 liens)
src/components/FiscaliteScpiPage.tsx            — /education/ → /articles/ (10 liens)
src/data/semanticCocon.ts                       — +34 liens /articles/ sur 7 pages fortes
```
