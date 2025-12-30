# Configuration SEO et URLs Production - MaximusSCPI

## Récapitulatif des modifications

### 1. Variable d'environnement VITE_PUBLIC_SITE_URL
- Ajoutée dans `.env` et `.env.example`
- Valeur: `https://maximusscpi.com`
- Utilisée pour générer les URLs canoniques et le sitemap

### 2. Composant SEOHead amélioré
- **Canonical automatique** : Génère automatiquement `<link rel="canonical" href="...">` basé sur VITE_PUBLIC_SITE_URL + pathname
- **Meta robots selon environnement** :
  - **PRODUCTION** : `<meta name="robots" content="index,follow">`
  - **DEV/PREVIEW** (webcontainer, stackblitz, bolt.new, localhost) : `<meta name="robots" content="noindex,nofollow">`
- Détection automatique de l'environnement via `import.meta.env.PROD` et hostname

### 3. Configs de rewrite SPA (anti-404)
- **Netlify** : `public/_redirects` avec fallback `/* /index.html 200` ✅
- **Vercel** : `vercel.json` avec routes vers `/index.html` ✅
- Les deux configs sont présentes pour compatibilité maximale

### 4. Table de redirections dans Supabase
- Table `slug_redirects` créée avec colonnes :
  - `from_slug` : ancien slug
  - `to_slug` : nouveau slug
  - `redirect_type` : 301 (permanent) ou 302 (temporaire)
  - `active` : statut de la redirection
- Hook `useSlugRedirect()` dans App.tsx pour gérer les redirections côté client
- 10 redirections pré-configurées depuis les anciens slugs d'articles

### 5. Génération dynamique du sitemap.xml
- Script : `scripts/generateSitemapFromDB.ts`
- Source : Base de données Supabase (tables `articles_seo` et `scpi`)
- Exécuté automatiquement au build via `prebuild`
- Résultat : `public/sitemap.xml`
- Contenu :
  - 51 pages SCPI individuelles
  - 36 articles depuis la DB
  - 49 pages thématiques (gestionnaires + secteurs + géographie)
  - Pages statiques (FAQ, Qui sommes-nous, etc.)

### 6. Génération dynamique du robots.txt
- Script : `scripts/generateRobotsTxt.ts`
- Mode PRODUCTION :
  ```
  User-agent: *
  Allow: /
  Sitemap: https://maximusscpi.com/sitemap.xml
  ```
- Mode DEV/PREVIEW :
  ```
  User-agent: *
  Disallow: /
  ```
- Exécuté automatiquement au build via `prebuild`

## 5 exemples d'URLs à tester en accès direct (production)

Ces URLs doivent fonctionner en accès direct sans 404 :

### 1. Page SCPI individuelle
**URL** : `https://maximusscpi.com/scpi-iroko-zen-iroko`
- Slug basé sur le nom de la SCPI depuis la DB
- Page statique générée au build
- Canonical : `https://maximusscpi.com/scpi-iroko-zen-iroko`
- Robots : `index,follow` (prod)

### 2. Article éducatif
**URL** : `https://maximusscpi.com/fonds-euros-ou-scpi`
- Slug depuis la table `articles_seo`
- Component : `FondsEurosOuScpiArticle`
- Canonical : `https://maximusscpi.com/fonds-euros-ou-scpi`
- Robots : `index,follow` (prod)

### 3. Page gestionnaire
**URL** : `https://maximusscpi.com/alderan-scpi`
- Landing page thématique optimisée
- Génération statique au build
- Canonical : `https://maximusscpi.com/alderan-scpi`
- Robots : `index,follow` (prod)

### 4. Page sectorielle
**URL** : `https://maximusscpi.com/scpi-bureaux`
- Page thématique par secteur
- SPA + rewrite configuré
- Canonical : `https://maximusscpi.com/scpi-bureaux`
- Robots : `index,follow` (prod)

### 5. Page légale depuis DB
**URL** : `https://maximusscpi.com/mentions-legales`
- Slug depuis la table `articles_seo` (catégorie: Légal)
- Component : `MentionsLegalesPage`
- Canonical : `https://maximusscpi.com/mentions-legales`
- Robots : `index,follow` (prod)

## Vérifications à effectuer

### En production (sur le domaine maximusscpi.com)

1. **Canonical** : Toutes les pages ont `<link rel="canonical" href="https://maximusscpi.com/[slug]">`
2. **Meta robots** : Toutes les pages ont `<meta name="robots" content="index,follow">`
3. **Sitemap** : Accessible sur `https://maximusscpi.com/sitemap.xml`
4. **Robots.txt** : Accessible sur `https://maximusscpi.com/robots.txt` avec Allow: /
5. **Accès direct** : Les 5 URLs ci-dessus ne retournent PAS de 404
6. **Redirections** : Les anciens slugs (ex: `/fonds-euros-ou-scpi-2025`) redirigent vers les nouveaux

### En dev/preview (webcontainer, localhost)

1. **Meta robots** : Toutes les pages ont `<meta name="robots" content="noindex,nofollow">`
2. **Robots.txt** : `Disallow: /` si généré en mode dev
3. **Aucune indexation** : Les moteurs de recherche ne doivent pas indexer

## Fichiers modifiés/créés

### Créés
- `scripts/generateSitemapFromDB.ts`
- `scripts/generateRobotsTxt.ts`
- `src/hooks/useSlugRedirect.ts`
- `SEO_URLS_PRODUCTION.md` (ce fichier)

### Modifiés
- `.env` : ajout de `VITE_PUBLIC_SITE_URL`
- `.env.example` : ajout de `VITE_PUBLIC_SITE_URL`
- `package.json` : modification du `prebuild` pour inclure les nouveaux scripts
- `src/components/SEOHead.tsx` : ajout de canonical automatique et meta robots selon env
- `src/App.tsx` : ajout du hook `useSlugRedirect()`
- `src/components/MentionsLegalesPage.tsx` : contenu réel depuis LegalFooter
- `src/components/PolitiqueConfidentialitePage.tsx` : contenu réel depuis LegalFooter

### Migration Supabase
- `supabase/migrations/create_slug_redirects_table.sql` : table de redirections

### Existants (vérifiés)
- `public/_redirects` : config Netlify ✅
- `vercel.json` : config Vercel ✅
- `public/sitemap.xml` : généré dynamiquement ✅
- `public/robots.txt` : généré dynamiquement ✅

## Notes importantes

1. **AUCUNE URL de preview** (webcontainer-api.io, bolt.new, etc.) ne sera indexée grâce au meta robots noindex en dev
2. **TOUTES les URLs internes** doivent être relatives (ex: `/scpi/slug`) et non absolues
3. **Le sitemap est régénéré** à chaque build avec les données fraîches de la DB
4. **Les redirections** sont gérées à deux niveaux :
   - Serveur : via `_redirects` (Netlify) ou `vercel.json` (Vercel)
   - Client : via le hook `useSlugRedirect()` qui vérifie la table Supabase
5. **En cas d'ajout d'un nouvel article** dans la DB, il apparaîtra automatiquement dans le sitemap au prochain build
