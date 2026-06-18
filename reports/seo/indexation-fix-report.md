# Rapport de correction — Indexation SEO

**Date** : 2026-06-18
**Périmètre** : Correction technique minimale des signaux d'indexation

---

## 1. Problèmes corrigés

### 1.1 Sitemap : Google voyait un sitemap statique obsolète

**Problème** : La règle `public/_redirects` (ligne 2) redirigeait `/sitemap.xml` → `/sitemap-final.xml` avec un rewrite 200. Googlebot voyait donc systématiquement `sitemap-final.xml`, un fichier statique jamais mis à jour par `generateSitemapFromDB.ts`. Le sitemap dynamique généré par `prebuild` n'était jamais servi en production.

**Correction** :
- Suppression de la règle `sitemap-final.xml` dans `scripts/generateRedirectsSSG.js`
- Régénération de `public/_redirects` → plus aucune référence à `sitemap-final.xml`
- Suppression de `public/sitemap-final.xml` (38,7 KB de contenu obsolète)
- Suppression de `sitemap-live.xml` (fichier non versionné, identique)

**Après build** : `dist/sitemap.xml` est copié depuis `public/sitemap.xml` (généré par `generateSitemapFromDB.ts`), et `/sitemap.xml` est servi directement sans rewrite.

### 1.2 DynamicArticlePage : canonical racine au lieu de /articles/

**Problème** : `DynamicArticlePage.tsx` déclarait :
- `canonical="https://maximusscpi.com/${slug}/"` (racine)
- Breadcrumb : `url: https://maximusscpi.com/${slug}`
- SemanticLinks : `currentPage="/${slug}"`

Google voyait chaque article comme une page racine, créant un conflit avec le sitemap qui les référence sous `/articles/{slug}/`.

**Correction** :
- Canonical → `https://maximusscpi.com/articles/${slug}/`
- Breadcrumb → `https://maximusscpi.com/articles/${slug}`
- SemanticLinks → `/articles/${slug}`

### 1.3 OptimizedArticlePage : canonical /education/ au lieu de /articles/

**Problème** : `OptimizedArticlePage.tsx` déclarait :
- `canonical="https://maximusscpi.com/education/${slug}/"`
- Breadcrumb : `url: https://maximusscpi.com/education/${slug}`
- SemanticLinks : `currentPage="/education/${slug}"`

L'URL canonique `/education/` créait une canonical chain : la page dit `/education/` mais le `_redirects` redirige `/education/*` → `/articles/*` en 301. Google suivait la canonical vers `/education/`, tombait sur le 301, et se retrouvait avec un conflit.

**Correction** :
- Canonical → `https://maximusscpi.com/articles/${slug}/`
- Breadcrumb → `https://maximusscpi.com/articles/${slug}`
- SemanticLinks → `/articles/${slug}`

---

## 2. Pourquoi cela protège les 178 articles

Aucun article individuel n'a été modifié. Les corrections portent exclusivement sur :

- Les **composants génériques** qui rendent TOUS les articles (`DynamicArticlePage`, `OptimizedArticlePage`)
- Le **pipeline de génération** qui produit le sitemap et les redirects
- Les signaux SEO structurels, pas le contenu

Chaque article hérite automatiquement de la canonical correcte `/articles/{slug}/` sans avoir besoin d'être retouché.

---

## 3. Fichiers modifiés

| Fichier | Action | Lignes |
|---|---|---|
| `scripts/generateRedirectsSSG.js` | Suppression règle sitemap-final.xml | 2 lignes retirées |
| `public/sitemap-final.xml` | **Supprimé** | — |
| `sitemap-live.xml` | **Supprimé** (fichier non versionné) | — |
| `public/_redirects` | **Régénéré** (plus de sitemap-final) | — |
| `src/components/DynamicArticlePage.tsx` | 4 corrections (canonical + breadcrumb + semantic links) | 4 occurrences |
| `src/components/OptimizedArticlePage.tsx` | 4 corrections (canonical + breadcrumb + semantic links) | 4 occurrences |

---

## 4. Avant / Après

### Sitemap servi à Google

| | Avant | Après |
|---|---|---|
| Requête `/sitemap.xml` | Redirigé vers `sitemap-final.xml` (statique, obsolète) | Servi directement (généré par `generateSitemapFromDB.ts`) |

### DynamicArticlePage

| | Avant | Après |
|---|---|---|
| Canonical | `https://maximusscpi.com/liquidite-scpi/` | `https://maximusscpi.com/articles/liquidite-scpi/` |
| Breadcrumb | `https://maximusscpi.com/liquidite-scpi` | `https://maximusscpi.com/articles/liquidite-scpi` |

### OptimizedArticlePage

| | Avant | Après |
|---|---|---|
| Canonical | `https://maximusscpi.com/education/liquidite-scpi/` | `https://maximusscpi.com/articles/liquidite-scpi/` |
| Breadcrumb | `https://maximusscpi.com/education/liquidite-scpi` | `https://maximusscpi.com/articles/liquidite-scpi` |

---

## 5. URLs à vérifier après déploiement

1. `https://maximusscpi.com/sitemap.xml` — doit servir le sitemap dynamique (vérifier qu'il contient `/articles/` et aucune `/education/`)
2. `https://maximusscpi.com/articles/tof-scpi/` — doit retourner 200 avec canonical auto-référente
3. `https://maximusscpi.com/education/tof-scpi/` — doit retourner 301 → `/articles/tof-scpi/`
4. `https://maximusscpi.com/articles/construire-portefeuille-scpi/` — hub collection, doit retourner 200

---

## 6. Risques restants

1. **SPA rendering** : Les articles sont servis via le SPA (React). Google n'exécute pas toujours le JS. Le `SEOHead` corrige la canonical au runtime, mais sans JS, Google voit la canonical par défaut. **Mitigation** : le sitemap et les redirects donnent maintenant les bons signaux, même sans JS.
2. **Articles en racine `/{slug}/`** : Certains articles étaient historiquement à la racine (30 "articles système" listés dans `_redirects` comme `SPA routes`). Ces URLs redirigent-elles correctement ? À vérifier dans le routage React.
3. **Netlify `_redirects` vs `netlify.toml`** : `netlify.toml` a `/* → /index.html 200`. Netlify traite `_redirects` en premier, donc OK.

---

## 7. Actions Search Console après déploiement

1. **Resoumettre le sitemap** dans GSC : `https://maximusscpi.com/sitemap.xml`
2. **Inspecter quelques URLs** articles (`/articles/tof-scpi/`) pour vérifier que la canonical est bien auto-référente
3. **Suivre le rapport "Pages non indexées"** : les 174 pages "explorées, non indexées" devraient progressivement passer en "indexées"
4. **Vérifier les redirections education** : `/education/*` doit renvoyer 301
5. **Patienter 1-2 semaines** pour que Google recrawle l'ensemble du site
