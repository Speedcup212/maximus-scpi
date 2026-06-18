---
title: "Correction des redirections canonicales"
date: "2026-06-18"
status: "done — patch double slash appliqué"
---

# Correction : Redirections canonicales manquantes

## 1. Problèmes détectés

| URL testée | Comportement observé | Comportement attendu |
|---|---|---|
| `https://maximusscpi.com/education/tof-scpi/` | **200** (SPA) → puis **301** vers `/articles/tof-scpi//` (double slash) | **301** → `/articles/tof-scpi/` |
| `https://maximusscpi.com/education/tof-scpi` | **301** → `/articles/tof-scpi/` (OK) | **301** → `/articles/tof-scpi/` |
| `https://maximusscpi.com/comprendre-les-scpi.html` | **200** (fichier statique servi) | **301** → `/comprendre-les-scpi/` |

### Cause racine

1. **Double slash** : La règle catch-all `/education/* /articles/:splat/ 301` utilisait `:splat` qui capture le trailing slash. `/education/tof-scpi/` → `splat = tof-scpi/` → cible `/articles/tof-scpi//`. Les 30 règles individuelles ne couvraient que la variante sans slash, donc l'URL avec slash tombait dans le catch-all.

2. **`.html`** : Aucune règle n'était définie pour le suffixe `.html`. Netlify servait le fichier statique correspondant en 200, créant un doublon avec `/comprendre-les-scpi/`.

## 2. Redirections ajoutées

### V1 (dépréciée — causait le problème de double slash)
```diff
+/education/* /articles/:splat/ 301   ← :splat capture le trailing slash → double slash
```

### V2 (actuelle — corrigée)
Les 30 règles individuelles et le catch-all `:splat` ont été remplacés dans `scripts/generateRedirectsSSG.js` par :

```diff
-# Redirections 301 education/ → articles/ (standardisation SEO — 30 articles éducatifs)
-/education/fonds-euros-ou-scpi /articles/fonds-euros-ou-scpi/ 301
-... (28 autres règles individuelles)
-/education/investir-scpi-jeune-actif-25-35-ans /articles/investir-scpi-jeune-actif-25-35-ans/ 301
-
-# Redirection 301 générique education/ → articles/ (catch-all pour tout article non listé)
-/education/* /articles/:splat/ 301
+# Redirections 301 education/ → articles/ (avec slash → avec slash)
+/education/:slug/ /articles/:slug/ 301
+# Redirections 301 education/ → articles/ (sans slash → avec slash)
+/education/:slug /articles/:slug/ 301
```

```diff
+# .html racine → dossier canonique (anti-duplication SEO)
+/comprendre-les-scpi.html /comprendre-les-scpi/ 301
+
 # Fallback pour toutes les autres routes vers la SPA
 /* /index.html 200
```

### Pourquoi `:slug` résout le problème

- `:slug` capture uniquement le segment de chemin, **pas** le trailing slash.
- `/education/:slug/` → match `/education/tof-scpi/` avec `:slug = tof-scpi` → `/articles/tof-scpi/` ✅
- `/education/:slug` → match `/education/tof-scpi` avec `:slug = tof-scpi` → `/articles/tof-scpi/` ✅
- La règle avec `/` est placée **en premier** (ligne 43) pour priorité correcte.

### Résultat dans `public/_redirects` :

```
43: /education/:slug/ /articles/:slug/ 301
44: # Redirections 301 education/ → articles/ (sans slash → avec slash)
45: /education/:slug /articles/:slug/ 301
...
235: /comprendre-les-scpi.html /comprendre-les-scpi/ 301
```

## 3. Fichiers modifiés

| Fichier | Action | Détail |
|---------|--------|--------|
| `scripts/generateRedirectsSSG.js` | **Modifié** | Suppression des 30 règles individuelles + catch-all `:splat`, remplacés par 2 règles `:slug` + règle `.html` |
| `public/_redirects` | **Régénéré** | 9 insertions, 69 deletions (net: -60 lignes, plus lisible) |

## 4. Contrôle des `.html` racines dans `dist/`

**Important** : 6 fichiers `.html` racines (`merci-guide-comparatif.html`, `merci-landing-page copy.html`, `merci-landing-page.calendly.html`, `merci-landing-page.html`, `qa-tracking copy.html`, `comprendre-les-scpi.html`) survivent localement dans `dist/` comme artefacts de builds antérieurs (dates février-juin 2026). Vite ne les nettoie pas car ils ne font pas partie du bundle.

Ces fichiers **ne sont pas régénérés** par les scripts post-build — ce sont des résidus de cache local.

**Action requise** : Faire un `Clear cache and deploy site` dans Netlify pour purger ces artefacts.

## 5. Contrôles post-build

```
✅ dist/_redirects : /education/:slug/ et /education/:slug avant tout rewrite 200
✅ dist/_redirects : /comprendre-les-scpi.html → /comprendre-les-scpi/ 301
✅ dist/sitemap.xml : 0 occurence de /education/
✅ dist/sitemap.xml : 145 articles /articles/
✅ dist/sitemap.xml : 0 merci, 0 qa, 0 copy, 0 sitemap-final
✅ dist/_redirects ne contient pas sitemap-final
✅ copyFinalSitemapToDist.js : OK
✅ assertFinalSitemap.js : OK
```

## 6. URLs à tester après déploiement

```bash
# Test 1 : education/ avec slash → 301 sans double slash
curl -I https://maximusscpi.com/education/tof-scpi/
# Attendu : HTTP/1.1 301, Location: /articles/tof-scpi/

# Test 2 : education/ sans slash → 301
curl -I https://maximusscpi.com/education/tof-scpi
# Attendu : HTTP/1.1 301, Location: /articles/tof-scpi/

# Test 3 : articles existants → même comportement
curl -I https://maximusscpi.com/education/fonds-euros-ou-scpi/
# Attendu : HTTP/1.1 301, Location: /articles/fonds-euros-ou-scpi/

# Test 4 : .html → 301
curl -I https://maximusscpi.com/comprendre-les-scpi.html
# Attendu : HTTP/1.1 301, Location: /comprendre-les-scpi/

# Test 5 : comprendre-les-scpi normal → 200 (inchangé)
curl -I https://maximusscpi.com/comprendre-les-scpi/
# Attendu : HTTP/1.1 200
```

## 7. Risques restants

- **Nul** : Les règles `:slug` ne peuvent pas produire de double slash (contrairement à `:splat`).
- **Nul** : La cible `/articles/:slug/` n'est pas matchée par `/education/:slug/` → pas de boucle.
- **Faible** : Les 6 fichiers `.html` racines résiduels dans `dist/` (cache local) → nécessite un `Clear cache and deploy site` sur Netlify.
- **Faible** : `sitemap-live-check.xml` apparaît comme untracked dans le repo — fichier temporaire.
