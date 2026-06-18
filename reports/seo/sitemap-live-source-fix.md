---
title: "Correction source du sitemap live incorrect"
date: "2026-06-11"
status: "done"
---

# Correction : Source du sitemap live incorrect

## 1. Source exacte du mauvais sitemap

Le sitemap live (92 URLs) était généré par **Netlify** en scannant les fichiers `.html` présents dans le répertoire `dist/`. Netlify listait tous les `.html` du dossier `dist/` et les convertissait en entrées `<url>` sans trailing slash.

Le vrai sitemap (`generateSitemapFromDB.ts`) n'était **pas** servi car l'ancien `_redirects` redirigeait `/sitemap.xml` → `/sitemap-final.xml` (fichier statique obsolète).

### Origine des artefacts
Les 6 fichiers HTML trouvés à la racine de `dist/` :

| Fichier | Date | Source |
|---------|------|--------|
| `merci-guide-comparatif.html` | 17/06/2026 | Ancien build (jamais nettoyé) |
| `merci-landing-page copy.html` | 04/02/2026 | Ancien build (jamais nettoyé) |
| `merci-landing-page.calendly.html` | 18/02/2026 | Ancien build (jamais nettoyé) |
| `merci-landing-page.html` | 04/02/2026 | Ancien build (jamais nettoyé) |
| `qa-tracking copy.html` | 04/02/2026 | Ancien build (jamais nettoyé) |
| `comprendre-les-scpi.html` | Régénéré à chaque build | `generateComprendrePage.js` écrivait un fichier `.html` à la racine au lieu de `dist/slug/index.html` |

## 2. Pourquoi les pages merci/copy/qa étaient incluses

1. **Fichiers `.html` jamais supprimés** : Netlify conserve le cache `dist/` entre les builds. Des fichiers créés il y a des mois étaient toujours présents.
2. **Vite ne nettoie pas les fichiers non-bundlés** : Vite avec `emptyOutDir: true` vide `dist/` au début du build, mais ces fichiers étaient recréés par les scripts post-build ou conservés dans le cache Netlify.
3. **`generateComprendrePage.js`** créait `dist/comprendre-les-scpi.html` (fichier racine), ce qui polluait `dist/` avec un `.html` hors convention.

## 3. Pourquoi /articles/ était absent

- L'ancien `_redirects` redirigeait `/sitemap.xml` vers `/sitemap-final.xml` (fichier statique obsolète qui n'était pas régénéré).
- Le sitemap que Netlify générait (en scannant `dist/`) ne contenait QUE les fichiers `.html` à la racine. Comme les articles sont sous `dist/articles/*/index.html` (dossiers), ils n'apparaissaient pas.

## 4. Fichiers modifiés

| Fichier | Action | Raison |
|---------|--------|--------|
| `scripts/generateSitemap.js` | **Supprimé** | Ancien générateur obsolète non utilisé dans le pipeline. Génère des URLs sans trailing slash, sans `/articles/`, avec des 301. Source de confusion. |
| `scripts/generateComprendrePage.js` | **Corrigé** | Écrit désormais `dist/comprendre-les-scpi/index.html` au lieu de `dist/comprendre-les-scpi.html`. Respecte la convention du projet. |
| `dist/merci-*.html` (5 fichiers) | **Supprimés** | Artefacts obsolètes polluant le sitemap live. |
| `dist/qa-tracking copy.html` | **Supprimé** | Artefact obsolète. |
| `THEMATIC_PAGES_OPTIMIZED.md` | Auto-généré | Rapport post-build (non critique). |

## 5. Avant / Après

### Avant (live actuel)
```
GET https://maximusscpi.com/sitemap.xml
→ 92 URLs
→ merci-guide-comparatif
→ merci-landing-page%20copy
→ qa-tracking%20copy
→ AUCUN article /articles/
→ AUCUN trailing slash
```

### Après (local build)
```
dist/sitemap.xml
→ 202 URLs
→ 145 articles sous /articles/{slug}/
→ 0 merci / qa / copy
→ 0 /education/
→ 0 sitemap-final
→ 0 scpi-fiscales (non-articles)
→ 100% trailing slash
```

## 6. Contrôles locaux exécutés

```
✅ npx vite build → OK (28s)
✅ node scripts/generateThematicPages.js → OK (33 pages)
✅ node scripts/generateOptimizedStaticPages.js → OK (51 pages)
✅ node scripts/generateOptimizedThematicPages.js → OK (32 pages)
✅ node scripts/generateComprendrePage.js → OK (comprendre-les-scpi/index.html)
✅ node scripts/generateIrokoZenStaticPage.js → OK
✅ node scripts/copyFinalSitemapToDist.js → OK (37 Ko)
✅ node scripts/assertFinalSitemap.js → OK

✅ dist/sitemap.xml : 202 URLs, toutes avec trailing slash
✅ dist/sitemap.xml : 145 articles /articles/
✅ dist/sitemap.xml : 0 merci, 0 qa, 0 copy, 0 education
✅ dist/_redirects : 0 sitemap-final
✅ dist/ : 0 fichier .html à la racine (hors index.html)
```

## 7. Commandes de vérification live après déploiement

```bash
# 1. Vérifier que le sitemap live est bien le bon
curl https://maximusscpi.com/sitemap.xml | node -e "
const c=require('fs').readFileSync('/dev/stdin','utf8');
console.log('URLs:',[...c.matchAll(/<loc>/g)].length);
console.log('Articles:',c.includes('/articles/'));
console.log('Merci:',c.includes('merci')?'⚠️':'✅');
console.log('Education:',c.includes('/education/')?'⚠️':'✅');
console.log('Trailing slash:',c.includes('<loc>https://maximusscpi.com/</loc>'));
"

# 2. Vérifier le Content-Type
curl -I https://maximusscpi.com/sitemap.xml | grep content-type
# Doit retourner: application/xml

# 3. Vérifier que /education/ redirige
curl -I https://maximusscpi.com/education/construire-portefeuille-scpi/ | grep Location
# Doit retourner: /articles/construire-portefeuille-scpi/

# 4. Dans Google Search Console :
# - Supprimer l'ancien sitemap soumis (si sitemap-final était soumis)
# - Resoumettre https://maximusscpi.com/sitemap.xml
# - Vérifier que Google voit ~200 URLs (pas 92)
```

## 8. Risques restants

- **Faible** : `THEMATIC_PAGES_OPTIMIZED.md` et `H1_AB_TESTING_VARIANTS.md` sont régénérés par les scripts post-build. Ne pas les commiter.
- **Faible** : `dist/` doit toujours contenir le sitemap généré. `copyFinalSitemapToDist.js` et `assertFinalSitemap.js` garantissent cela.
- **Moyen** : Si Netlify conserve une ancienne version de `dist/merci-*.html` dans son cache de build, il faudra faire un `Clear cache and deploy site` dans l'interface Netlify.
