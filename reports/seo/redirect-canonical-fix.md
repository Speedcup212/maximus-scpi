---
title: "Correction des redirections canonicales"
date: "2026-06-18"
status: "done"
---

# Correction : Redirections canonicales manquantes

## 1. Problèmes détectés

| URL testée | Comportement observé | Comportement attendu |
|---|---|---|
| `https://maximusscpi.com/education/tof-scpi/` | **200** (SPA sert la page) | **301** → `/articles/tof-scpi/` |
| `https://maximusscpi.com/comprendre-les-scpi.html` | **200** (fichier statique servi) | **301** → `/comprendre-les-scpi/` |

### Cause racine

1. **`/education/`** : Le générateur `generateRedirectsSSG.js` contenait 30 règles individuelles pour les articles connus, mais **aucun catch-all**. Tout slug non listé (ex: `tof-scpi`) tombait dans le fallback `/* /index.html 200`, produisant une réponse 200 au lieu d'un 301.

2. **`/comprendre-les-scpi.html`** : Aucune règle n'était définie pour le suffixe `.html`. Netlify servait le fichier statique correspondant en 200, créant un doublon avec `/comprendre-les-scpi/`.

## 2. Redirections ajoutées

### Dans `scripts/generateRedirectsSSG.js` :

```diff
 /education/investir-scpi-jeune-actif-25-35-ans /articles/investir-scpi-jeune-actif-25-35-ans/ 301

+# Redirection 301 générique education/ → articles/ (catch-all pour tout article non listé)
+/education/* /articles/:splat/ 301
+
 # Pages statiques générales
```

```diff
+# .html racine → dossier canonique (anti-duplication SEO)
+/comprendre-les-scpi.html /comprendre-les-scpi/ 301
+
 # Fallback pour toutes les autres routes vers la SPA
 /* /index.html 200
```

### Résultat dans `public/_redirects` :

```
75: /education/* /articles/:splat/ 301
...
264: /comprendre-les-scpi.html /comprendre-les-scpi/ 301
```

- **Ligne 75** : Le catch-all education est placé après les 30 règles individuelles (qui ont priorité) et avant toutes les règles 200.
- **Ligne 264** : La règle `.html` est placée juste avant `/* /index.html 200` pour intercepter toute requête en `.html`.

## 3. Fichiers modifiés

| Fichier | Action | Détail |
|---------|--------|--------|
| `scripts/generateRedirectsSSG.js` | **Modifié** (+6 lignes) | Ajout des 2 règles de redirection |
| `public/_redirects` | **Régénéré** | Contient les nouvelles règles (via le générateur) |

## 4. Contrôle des `.html` racines dans `dist/`

Après `npm run build` complet :
```
=== Fichiers .html racine dans dist ===
(AUCUN fichier .html à la racine — propre)
```

Le dossier `dist/comprendre-les-scpi/index.html` existe (norme `/slug/index.html`), donc aucun fichier `.html` racine résiduel. La règle `/comprendre-les-scpi.html` agit comme filet de sécurité au cas où Netlify conserverait un ancien fichier en cache.

## 5. Contrôles post-build

```
✅ dist/_redirects : contient /education/* /articles/:splat/ 301
✅ dist/_redirects : contient /comprendre-les-scpi.html /comprendre-les-scpi/ 301
✅ dist/sitemap.xml : 0 occurence de /education/
✅ dist/sitemap.xml : 145 articles /articles/
✅ dist/sitemap.xml : 0 merci, 0 qa, 0 copy, 0 sitemap-final
✅ dist/_redirects ne contient pas sitemap-final
✅ assertFinalSitemap.js : OK
```

## 6. URLs à tester après déploiement

```bash
# Test 1 : education/ catch-all → 301
curl -I https://maximusscpi.com/education/tof-scpi/
# Attendu : HTTP/1.1 301, Location: /articles/tof-scpi/

curl -I https://maximusscpi.com/education/tof-scpi
# Attendu : HTTP/1.1 301, Location: /articles/tof-scpi/

# Test 2 : education/ articles déjà listés → 301 (inchangé)
curl -I https://maximusscpi.com/education/fonds-euros-ou-scpi/
# Attendu : HTTP/1.1 301, Location: /articles/fonds-euros-ou-scpi/

# Test 3 : .html → 301
curl -I https://maximusscpi.com/comprendre-les-scpi.html
# Attendu : HTTP/1.1 301, Location: /comprendre-les-scpi/

# Test 4 : comprendre-les-scpi normal → 200 (inchangé)
curl -I https://maximusscpi.com/comprendre-les-scpi/
# Attendu : HTTP/1.1 200
```

## 7. Risques restants

- **Nul** : Le catch-all `/education/*` ne peut pas créer de boucle car la cible `/articles/:splat/` n'est pas matchée par `/education/*`.
- **Nul** : Les 30 règles individuelles restent prioritaires (plus spécifiques), le catch-all est un filet de sécurité.
- **Faible** : `sitemap-live-check.xml` apparaît comme untracked dans le repo — fichier temporaire à nettoyer.
- **Faible** : Si Netlify a un ancien `dist/comprendre-les-scpi.html` dans son cache de build, la règle `.html` → 301 le neutralisera. Faire un "Clear cache and deploy site" pour plus de sûreté.
