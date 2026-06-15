# AUDIT URLs — MaximusSCPI — 2026-06-15

> Audit SEO technique strictement observationnel.  
> Aucune modification de code.  
> Aucune correction automatique.  

---

## A. SYNTHÈSE EXÉCUTIVE

| Métrique | Valeur |
|----------|--------|
| URLs dans le sitemap | **209** |
| Routes publiques distinctes identifiées dans le code | **~270** (SPA + statiques + articles + SCPI individuelles + gestionnaires) |
| Incohérences détectées | **14** |
| **Gravité globale** | **ÉLEVÉE** |

### Problème n°1 — Doublon slash final systématique

Le sitemap contient **toutes** les URLs avec slash final (`/url/`).  
Le `SEOHead` force le canonical avec slash final quelles que soient les conditions.  
Or Google a indexé certaines URLs **sans** slash final : `/scpi-france`, `/scpi-hotellerie`, `/scpi-residentiel`, `/comprendre-les-scpi`, `/test-formulaire-guide`.  
Et surtout : **`/scpi-sante` ET `/scpi-sante/` sont toutes deux indexées**.

### Problème n°2 — 19 pages indexées sur 209 découvertes (9%)

276 pages non indexées sur ~295 connues de Google. Le delta provient de :
- Pages `/app/*` non routables côté serveur (200 rewrite vers index.html = SPA vide sans contenu statique)
- Pages `/education/*` servies uniquement via le SPA sans `__INITIAL_PATH__` ni shell HTML dédié
- Absence de contenu statique prérendu pour la majorité des routes du sitemap

### Problème n°3 — Pages non-stratégiques dans le sitemap

- `/reclamation` — page de réclamation, aucun intérêt SEO
- `/test-formulaire-guide` — page de test, indexée par Google

### Problème n°4 — Canonical auto-généré incohérent

`SEOHead.tsx` ligne 64 force systématiquement un slash final :

```typescript
const trailingPath = pathname === '/' ? '/' : (pathname.endsWith('/') ? pathname : pathname + '/');
const canonicalUrl = canonical || `${siteUrl}${trailingPath}`;
```

Si un utilisateur arrive sur `/scpi-sante` (sans slash), le canonical auto-généré sera `https://maximusscpi.com/scpi-sante/` — ce qui crée un signal contradictoire (la page sans slash déclare une canonical avec slash).

---

## B. TABLEAU COMPLET DES URLs

> Légende des colonnes :  
> **S** = Présent dans le sitemap ?  
> **R** = Route fonctionnelle probable ?  
> **SF** = Slash final dans le sitemap ?  
> **C** = Canonical explicite ?  
> **I** = Indexation souhaitée ?  
> **Risque** = SEO risk  
> **Action** = Recommandation

### B.1 — Pages principales (Money Pages)

| URL | Source | S | R | SF | C | I | Risque | Action |
|-----|--------|---|---|----|---|---|--------|--------|
| `/` | sitemap + route | Oui | Oui | N/A | Auto (SEOHead) | Oui | Faible | RAS |
| `/comparateur-scpi/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | Ajouter canonical explicite |
| `/meilleures-scpi-rendement/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible | Ajouter canonical |
| `/scpi-fiscales/` | sitemap (redirigé 301 → /scpi-fiscalite/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** (301 active) |
| `/scpi-europeennes/` | sitemap + route + statique | Oui | Oui | Oui | Oui (SEOHead) | Oui | Faible | RAS |
| `/preparer-retraite-scpi/` | sitemap (redirigé 301 → /scpi-retraite/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** (301 active) |
| `/revenu-complementaire-scpi/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | Vérifier route |

### B.2 — Pages sectorielles (/scpi-xxx/)

| URL | Source | S | R | SF | C | I | Risque | Action |
|-----|--------|---|---|----|---|---|--------|--------|
| `/scpi-bureaux-investissement/` | sitemap (redirigé 301 → /scpi-bureaux/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** |
| `/scpi-commerces-investissement/` | sitemap (redirigé 301 → /scpi-commerces/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** |
| `/scpi-sante-investissement/` | sitemap (redirigé 301 → /scpi-sante/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** |
| `/scpi-france-investissement/` | sitemap (redirigé 301 → /scpi-france/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** |
| `/scpi-sans-frais/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/scpi-bureaux/` | sitemap + route + _redirects | Oui | Oui | Oui | Non | Oui | **MOYEN** | Doublon potentiel /scpi-bureaux vs /scpi-bureaux/ |
| `/scpi-commerces/` | sitemap + route + _redirects | Oui | Oui | Oui | Non | Oui | **MOYEN** | Doublon slash final |
| `/scpi-sante/` | sitemap + route + _redirects | Oui | Oui | Oui | Non | Oui | **ÉLEVÉ** | **DOUBLON INDEXÉ** : /scpi-sante ET /scpi-sante/ |
| `/scpi-logistique/` | sitemap + route | Oui | Oui | Oui | Non | Oui | **MOYEN** | Doublon slash final |
| `/scpi-residentiel/` | sitemap + route | Oui | Oui | Oui | Non | Oui | **MOYEN** | Version sans slash indexée |
| `/scpi-hotellerie/` | sitemap + route | Oui | Oui | Oui | Non | Oui | **MOYEN** | Version sans slash indexée |
| `/scpi-mixte/` | sitemap uniquement | Oui | **?** | Oui | Non | Oui | **MOYEN** | Vérifier route App.tsx |

### B.3 — Pages géographiques

| URL | Source | S | R | SF | C | I | Risque | Action |
|-----|--------|---|---|----|---|---|--------|--------|
| `/scpi-france/` | sitemap + route | Oui | Oui | Oui | Non | Oui | **MOYEN** | Version sans slash indexée |
| `/scpi-europe/` | sitemap (redirigé 301 → /scpi-europeennes/) | Oui | **Non** | Oui | Non | Non | **ÉLEVÉ** | **Retirer du sitemap** |
| `/scpi-international/` | sitemap uniquement | Oui | **?** | Oui | Non | Oui | **MOYEN** | Vérifier route App.tsx |

### B.4 — Pages institutionnelles / EEAT / statiques

| URL | Source | S | R | SF | C | I | Risque | Action |
|-----|--------|---|---|----|---|---|--------|--------|
| `/comprendre-les-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | **MOYEN** | Version sans slash indexée |
| `/faq/` | sitemap + route + _redirects | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/investir-scpi/` | sitemap + _redirects | Oui | Oui | Oui | Non | Oui | Faible | Google Ads landing |
| `/expertise-orias-cif/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/methodologie-donnees-scpi/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/avertissements-risques-scpi/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/qui-sommes-nous/` | sitemap + route + _redirects | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/reclamation` | _redirects uniquement | **Non** | Oui | — | Non | **Non** | **ÉLEVÉ** | **Indexée par Google. À exclure.** |
| `/test-formulaire-guide` | Aucune | **Non** | Oui | — | Non | **Non** | **ÉLEVÉ** | **Indexée par Google. À exclure.** |
| `/conditions-utilisation/` | _redirects uniquement | **Non** | Oui | — | Non | **Non** | Faible | Page légale, OK hors sitemap |

### B.5 — Simulateurs (9 URLs)

| URL | Source | S | R | SF | C | I | Risque | Action |
|-----|--------|---|---|----|---|---|--------|--------|
| `/simulateurs/` | sitemap + route | Oui | Oui | Oui | Non | Oui | Faible | RAS |
| `/simulateur-revenus-nets-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-credit-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-demembrement-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-enveloppes-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-tresorerie-is/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-impact-fiscal-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/simulateur-profil-investisseur/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |
| `/comparateur-demembrement-scpi/` | sitemap + route | Oui | Oui | Oui | Oui (config) | Oui | Faible | RAS |

### B.6 — Pages sociétés de gestion (26 pages thématiques)

| URL | Source | S | R | SF | C | I | Risque |
|-----|--------|---|---|----|---|---|--------|
| `/alderan-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/arkea-reim-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/la-francaise-rem-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/atland-voisin-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/aestiam-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/altixia-reim-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/amundi-immobilier-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/atream-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/consultim-asset-management-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/fiducial-gerance-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/greenman-arth-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/inter-gestion-reim-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/iroko-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/kyaneos-asset-management-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/magellim-reim-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/norma-capital-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/novaxia-investissement-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/paref-gestion-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/perial-asset-management-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/praemia-reim-france-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/remake-asset-management-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/sofidy-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/sogenial-immobilier-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/swiss-life-am-france-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/theoreim-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |
| `/urban-premium-scpi/` | sitemap + route + statique | Oui | Oui | Oui | Non | Oui | Faible |

### B.7 — Articles /articles/ (145 URLs dans le sitemap)

| Catégorie | Nombre | S | R | Risque |
|-----------|--------|---|---|--------|
| `/articles/` (hub) | 1 | Oui | Oui | Faible |
| `/articles/construire-portefeuille-scpi/` | 1 | Oui | Oui | Faible |
| Articles longs (30 education) | 30 | Oui | **?** | **MOYEN** — les slugs sitemap sont sous `/articles/{slug}` mais le code route vers `/education/{slug}` |
| Articles gestionnaires | ~38 | Oui | Oui | Faible |
| Articles thématiques courts | ~73 | Oui | Oui | Faible |

**Incohérence majeure :** les 30 articles education ont dans le sitemap un chemin `/articles/{slug}/` (ex: `/articles/fonds-euros-ou-scpi/`) alors que dans `App.tsx` leur URL est `/education/{slug}/`. Le sitemap et les routes React pointent vers des URLs différentes.

### B.8 — URL problématiques identifiées par GSC

| URL | Problème | Action |
|-----|----------|--------|
| `/scpi-sante` (sans slash) | Indexée en doublon de `/scpi-sante/` | Forcer 301 ou canonical strict |
| `/scpi-france` (sans slash) | Indexée | Forcer 301 |
| `/scpi-hotellerie` (sans slash) | Indexée | Forcer 301 |
| `/scpi-residentiel` (sans slash) | Indexée | Forcer 301 |
| `/comprendre-les-scpi` (sans slash) | Indexée | Forcer 301 |
| `/test-formulaire-guide` | Page de test indexée | noindex + exclure robots |
| `/reclamation` | Page non-stratégique indexée | noindex |
| `/scpi-sante-investissement/` | 301 → `/scpi-sante/` mais dans le sitemap | Retirer du sitemap |

### B.9 — URLs dans le sitemap mais avec route incertaine

| URL | Problème |
|-----|----------|
| `/scpi-mixte/` | Pas de route explicite dans App.tsx, pas de statique prévue |
| `/scpi-international/` | Pas de route explicite identifiée |
| `/scpi-europe/` | 301 → `/scpi-europeennes/` mais présent dans le sitemap |
| `/scpi-fiscales/` | 301 → `/scpi-fiscalite/` mais présent dans le sitemap |
| `/preparer-retraite-scpi/` | 301 → `/scpi-retraite/` mais présent dans le sitemap |
| `/scpi-bureaux-investissement/` | 301 → `/scpi-bureaux/` mais présent dans le sitemap |
| `/scpi-commerces-investissement/` | 301 → `/scpi-commerces/` mais présent dans le sitemap |
| `/scpi-sante-investissement/` | 301 → `/scpi-sante/` mais présent dans le sitemap |
| `/scpi-france-investissement/` | 301 → `/scpi-france/` mais présent dans le sitemap |

### B.10 — Routes existantes mais absentes du sitemap

| URL | Source | Impact |
|-----|--------|--------|
| `/scpi-secteurs/` | App.tsx + composant | Page hub non référencée |
| `/scpi-gestionnaires/` | App.tsx + composant | Page hub non référencée |
| `/scpi-objectifs/` | App.tsx + composant | Page hub non référencée |
| `/actualites/` | App.tsx + composant | Page actualités non référencée |
| `/parcours-guide/` | App.tsx | Page parcours guidé |
| `/education/*` (30 articles) | App.tsx | Accessible via /education/ mais sitemap pointe /articles/ |
| `/societe-gestion/{slug}` | App.tsx | Fiches gestionnaires individuelles |
| `/scpi-rentable/` | _redirects uniquement | Landing Google Ads |

---

## C. PROBLÈMES PRIORITAIRES

### 🔴 CRITIQUE

#### C.1 — 8 URLs 301 présentes dans le sitemap
Les URLs suivantes sont redirigées (301) par `_redirects` mais **toujours listées dans le sitemap**. Google voit 209 URLs, tente de crawler ces 8, reçoit une 301, et gaspille son budget de crawl.

| URL dans le sitemap | Redirection 301 |
|---------------------|-----------------|
| `/scpi-fiscales/` | → `/scpi-fiscalite/` |
| `/preparer-retraite-scpi/` | → `/scpi-retraite/` |
| `/scpi-europe/` | → `/scpi-europeennes/` |
| `/scpi-bureaux-investissement/` | → `/scpi-bureaux/` |
| `/scpi-commerces-investissement/` | → `/scpi-commerces/` |
| `/scpi-sante-investissement/` | → `/scpi-sante/` |
| `/scpi-france-investissement/` | → `/scpi-france/` |

#### C.2 — Doublon `/scpi-sante` / `/scpi-sante/` toutes deux indexées
Google a indexé les deux variantes. Le canonical dynamique de `SEOHead` ajoute toujours un slash final, mais quand Google arrive sur `/scpi-sante`, il peut soit suivre le canonical, soit ignorer le signal. Résultat : deux URLs en compétition.

#### C.3 — 30 articles `/education/` vs `/articles/` — incohérence sitemap/routes
Le sitemap référence `/articles/fonds-euros-ou-scpi/` alors que App.tsx route vers `/education/fonds-euros-ou-scpi`. Les URLs du sitemap ne correspondent pas aux URLs réelles de l'application. **Impact : 30 URLs du sitemap mènent à des pages inexistantes ou incorrectes.**

### 🟠 IMPORTANT

#### C.4 — `/reclamation` et `/test-formulaire-guide` indexées
- `/reclamation` : page fonctionnelle (formulaire de réclamation légal) mais aucun intérêt SEO. Figure dans `_redirects` (200 → index.html) mais absente du sitemap et du robots.txt.
- `/test-formulaire-guide` : page de test, ne devrait jamais être indexée. Absente de tout fichier de configuration.

#### C.5 — Slash final non géré au niveau serveur
Aucune redirection 301 `/url` → `/url/` (ou l'inverse) n'est configurée dans `_redirects`. Seul le canonical dans `SEOHead` tente de corriger le signal, mais Google n'est pas obligé de le suivre. Netlify lui-même ne force pas de trailing slash par défaut.

#### C.6 — Pages `/scpi-france`, `/scpi-hotellerie`, `/scpi-residentiel`, `/comprendre-les-scpi` indexées sans slash
Indexées par Google malgré le sitemap qui les référence avec slash. Signe que Google découvre ces URLs par d'autres moyens (liens internes ou externes) et les indexe sans passer par le sitemap.

### 🟡 SECONDAIRE

#### C.7 — Hub pages non présentes dans le sitemap
`/scpi-secteurs/`, `/scpi-gestionnaires/`, `/scpi-objectifs/`, `/actualites/` sont des pages de contenu mais absentes du sitemap.

#### C.8 — `/articles/` dans le sitemap avec priorité 0.8
Le hub articles est bien présent, mais les 30 articles education (les plus riches en contenu) sont sous `/articles/` dans le sitemap alors qu'ils sont accessibles via `/education/` dans le code.

#### C.9 — `_redirects` — 301 en double pour chaque SCPI (avec et sans slash final)
Pour chaque SCPI, deux lignes de redirection existent (`/scpi-xxx` et `/scpi-xxx/` → `/{slug}`). C'est redondant et augmente le fichier sans gain fonctionnel.

#### C.10 — `scpi-mixte` et `scpi-international` dans le sitemap sans route confirmée
Ces URLs n'ont pas de composant dédié trouvé dans App.tsx. Risque de soft 404.

---

## D. RECOMMANDATIONS TECHNIQUES

### D.1 — Convention d'URL recommandée
**Trailing slash obligatoire partout.** C'est déjà la convention du sitemap et du `SEOHead`. Il faut la rendre stricte et systématique :
- Toutes les URLs canoniques doivent se terminer par `/`
- Une redirection 301 doit forcer `url` → `url/` au niveau serveur (Netlify `_redirects`)

### D.2 — Redirections à prévoir (fichier `_redirects`)

**Priorité 1 : forcer le slash final pour les pages indexées sans**
```
/scpi-sante         /scpi-sante/         301
/scpi-france        /scpi-france/        301
/scpi-hotellerie    /scpi-hotellerie/    301
/scpi-residentiel   /scpi-residentiel/   301
/comprendre-les-scpi /comprendre-les-scpi/ 301
/scpi-bureaux       /scpi-bureaux/       301
/scpi-commerces     /scpi-commerces/     301
/scpi-logistique    /scpi-logistique/    301
```

**Priorité 2 : bloquer l'indexation des pages non-stratégiques**
```
/test-formulaire-guide   /test-formulaire-guide   301   (ou noindex)
```

### D.3 — Pages à retirer du sitemap

1. `/scpi-fiscales/` → déjà en 301, inutile dans le sitemap
2. `/preparer-retraite-scpi/` → déjà en 301
3. `/scpi-europe/` → déjà en 301
4. `/scpi-bureaux-investissement/` → déjà en 301
5. `/scpi-commerces-investissement/` → déjà en 301
6. `/scpi-sante-investissement/` → déjà en 301
7. `/scpi-france-investissement/` → déjà en 301

### D.4 — Pages à passer en `noindex`

1. `/reclamation` — via `SEOHead noIndex` (ou robots.txt `Disallow`)
2. `/test-formulaire-guide` — via `SEOHead noIndex` (ou robots.txt)
3. `/conditions-utilisation/` — discutable, peut rester indexée

### D.5 — Pages à renforcer (canonical explicite)

Les pages suivantes utilisent le canonical auto-généré par `SEOHead` (basé sur `pathname`). Il serait plus robuste de fournir un canonical explicite :

1. `/` → `https://maximusscpi.com/`
2. `/comparateur-scpi/` → `https://maximusscpi.com/comparateur-scpi/`
3. `/meilleures-scpi-rendement/` → explicite
4. Toutes les pages sectorielles : `/scpi-bureaux/`, `/scpi-commerces/`, `/scpi-sante/`, etc.
5. Toutes les pages de gestionnaires : `/alderan-scpi/`, etc.

### D.6 — Pages à demander en indexation dans Google Search Console

Une fois les redirections slash final en place :

1. `/scpi-sante/` — ré-indexer la version avec slash
2. `/scpi-france/` — ré-indexer la version avec slash
3. `/scpi-hotellerie/` — ré-indexer la version avec slash
4. `/scpi-residentiel/` — ré-indexer la version avec slash
5. `/comprendre-les-scpi/` — ré-indexer la version avec slash
6. Les hub pages manquantes : `/actualites/`, `/scpi-secteurs/`, `/scpi-gestionnaires/`

Puis, dans Google Search Console, utiliser l'outil de suppression temporaire pour les versions sans slash.

### D.7 — Alignement sitemap ↔ routes pour les articles education

Deux options :
- **Option A** : Modifier le sitemap pour référencer `/education/{slug}` (reflète la réalité du routage React)
- **Option B** : Faire correspondre App.tsx pour router `/articles/{slug}` vers les composants education, garder le sitemap tel quel, et mettre à jour les _redirects

---

## E. COMMANDES DE VÉRIFICATION

```powershell
# Vérifier le sitemap (compter les URLs)
[xml]$sitemap = Get-Content .\public\sitemap.xml
($sitemap.urlset.url | Measure-Object).Count

# Vérifier les URLs qui sont en 301 dans _redirects mais encore dans le sitemap
$redirects301 = Get-Content .\public\_redirects | Select-String '301$'
$sitemapUrls = [xml](Get-Content .\public\sitemap.xml)
$sitemapUrls.urlset.url.loc | ForEach-Object { $_.'#text' }

# Vérifier robots.txt
Get-Content .\public\robots.txt

# Vérifier que les pages statiques ont bien un canonical
rg -l 'canonical' dist/

# Build
npm run build

# Vérifier la présence des pages sensibles dans dist/
Test-Path dist/scpi-sante/index.html
Test-Path dist/scpi-france/index.html
Test-Path dist/comprendre-les-scpi.html

# Vérifier les balises meta robots dans les pages générées
rg 'meta name="robots"' dist/scpi-sante/index.html
rg 'meta name="robots"' dist/scpi-france/index.html

# Lister toutes les pages statiques générées dans dist/
Get-ChildItem -Recurse dist/*.html | Select-Object -ExpandProperty FullName

# Vérifier que les redirections fonctionnent (localement)
curl -I http://localhost:8888/scpi-sante 2>&1 | Select-String 'Location|HTTP'
curl -I http://localhost:8888/scpi-sante/ 2>&1 | Select-String 'Location|HTTP'
```

---

## F. RÉCAPITULATIF

| # | Problème | Gravité | Action |
|---|----------|---------|--------|
| 1 | 8 URLs 301 dans le sitemap | 🔴 Critique | Retirer du générateur de sitemap |
| 2 | `/scpi-sante` / `/scpi-sante/` toutes deux indexées | 🔴 Critique | 301 + canonical strict |
| 3 | 30 articles `/education/` vs `/articles/` dans le sitemap | 🔴 Critique | Aligner sitemap avec les routes réelles |
| 4 | `/reclamation` et `/test-formulaire-guide` indexées | 🟠 Important | noindex + exclure robots.txt |
| 5 | Aucune redirection slash final | 🟠 Important | Ajouter 301 dans _redirects |
| 6 | 4 pages indexées sans slash | 🟠 Important | Forcer 301 + canonical |
| 7 | Hub pages hors sitemap | 🟡 Secondaire | Ajouter au sitemap |
| 8 | Canonical auto-généré fragile | 🟡 Secondaire | Rendre explicite sur les pages clés |
| 9 | `scpi-mixte` et `scpi-international` sans route | 🟡 Secondaire | Vérifier ou retirer du sitemap |

---

*Rapport généré le 2026-06-15 — MaximusSCPI — Audit SEO technique.*  
*Prochaine étape recommandée : corriger les 3 problèmes critiques avant toute autre action SEO.*
