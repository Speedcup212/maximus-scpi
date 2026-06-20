# Audit Architecture SEO/Technique — MaximusSCPI

**Date :** 2026-06-18  
**Périmètre :** Codebase complète (lecture seule)  
**Méthodologie :** Analyse statique du code source, sans crawling live

---

## Synthèse exécutive

1. **[CERTAIN] CSR dominant — seul index.html est servi côté serveur, toutes les métadonnées dynamiques (title, canonical, description) sont injectées en JavaScript (`useEffect`)** et donc invisibles pour les crawlers qui n'exécutent pas JS.
2. **[CERTAIN] Les articles `/articles/{slug}/` ne sont PAS prérendus côté serveur** — aucun script de build ne génère de HTML statique pour ces pages, contrairement aux pages thématiques et aux landing pages SCPI qui le sont.
3. **[CERTAIN] Le maillage sémantique (`semanticCocon.ts`) ne couvre que 8 pages fortes**, et aucune page article ne bénéficie d'un lien entrant depuis ces pages fortes (seulement 34 liens `/articles/` ajoutés récemment, couvrant une fraction des ~143 articles).

---

## 1. Mode de rendu

### Framework et configuration

| Fichier | Rôle | Conclusion |
|---|---|---|
| `package.json` | `"build": "npx vite build && ..."` | **Vite 5.4.21** — pas de Next.js, pas de Remix, pas de framework SSR |
| `vite.config.ts` | Plugin `@vitejs/plugin-react`, pas de `ssr` | Configuration CSR standard |
| `netlify.toml` | `/* /index.html 200` (SPA fallback) | Toute URL non statique est servie par le SPA |
| `index.html` | `<div id="root">` + `<script type="module" src="/src/main.tsx">` | Page coquille vide, contenu injecté par React |

### Prerendering sélectif (SSG partiel)

Plusieurs scripts de build génèrent des fichiers HTML statiques dans `dist/` :

| Script | Pages générées | Format |
|---|---|---|
| `generateThematicPages.js` | ~30 pages (meilleures-scpi-rendement, scpi-europeennes, scpi-fiscales, managers...) | HTML complet avec `<title>`, `<meta>`, `<link canonical>` hardcodés + `<script type="module" src="/assets/index.js">` |
| `generateOptimizedStaticPages.js` | ~40 SCPI individuelles | HTML complet avec métadonnées + bundle JS |
| `generateOptimizedThematicPages.js` | Pages thématiques optimisées | HTML complet SSG |
| `generateComprendrePage.js` | `comprendre-les-scpi/` | HTML complet SSG |
| `generateIrokoZenStaticPage.js` | `iroko-zen/` | HTML complet SSG |

Ces pages **ont des métadonnées lisibles sans JS** (title, description, canonical).

### Conclusion

**Le contenu est-il rendu côté serveur et lisible par un crawler sans exécution JS ?**

**PARTIEL** — OUI pour ~70 pages prérendues statiquement (thematic, SCPI individuelles, comprendre-les-scpi). **NON** pour les ~143 articles `/articles/{slug}/`, le comparateur, les simulateurs, la FAQ, et la homepage dynamique — ces pages sont **CSR pures**, le contenu n'apparaît qu'après exécution de JavaScript.

---

## 2. Inventaire des routes/pages

### 2a. Structure de routing

Le routing est implémenté dans `src/App.tsx` via une machine à états (`useState<'home' | 'comparateur' | ...>`) avec **~126 vues** déclarées et deux mécanismes :
1. `useEffect` (initial load) — parse `window.location.pathname`
2. `popstate` handler — navigation interne (pushState + scroll)

**Aucun router déclaratif** (React Router, TanStack Router) n'est utilisé. Toute la logique est en `if/else if` chaînés (~4600 lignes).

### 2b. Catégories de pages

#### Money pages (transactionnelles)

| URL | Composant | Intention | SSG |
|---|---|---|---|
| `/` | App.tsx (home) | Hub central / comparateur | Non (CSR) |
| `/comparateur-scpi/` | FintechComparator | Transactionnel — comparaison | Non (CSR) |
| `/meilleures-scpi-rendement/` | OptimizedThematicLandingPage | Transactionnel — classement | Oui (SSG) |

#### Pages thématiques / Hub (informationnelles mixtes)

| URL | Intention | SSG |
|---|---|---|
| `/comprendre-les-scpi/` | Informationnel — guide débutant | Oui |
| `/investir-scpi/` | Mixte — guide + CTA | Non (CSR) |
| `/scpi-europeennes/` | Transactionnel — diversification | Oui (SSG) |
| `/scpi-fiscales/` | Mixte — défiscalisation | Oui (SSG) |
| `/scpi-fiscalite/` | Informationnel — fiscalité | Non (CSR) |
| `/scpi-sans-frais/` | Transactionnel | Oui (SSG) |
| `/preparer-retraite-scpi/` | Mixte | Oui (SSG) |
| `/revenu-complementaire-scpi/` | Mixte | Oui (SSG) |
| `/scpi-sante-investissement/` | Transactionnel — secteur | Non (CSR) |
| `/scpi-bureaux-investissement/` | Transactionnel — secteur | Non (CSR) |
| `/scpi-commerces-investissement/` | Transactionnel — secteur | Non (CSR) |
| `/scpi-france-investissement/` | Mixte | Non (CSR) |
| `/scpi-secteurs/` | Hub navigationnel | Non (CSR) |
| `/scpi-gestionnaires/` | Hub navigationnel | Non (CSR) |
| `/scpi-objectifs/` | Hub navigationnel | Non (CSR) |
| `/scpi-europeennes-hub/` | Hub navigationnel | Non (CSR) |
| `/recyclage-urbain-scpi/` | Transactionnel — niche | Oui (SSG) |

#### Simulateurs

| URL | Composant | SSG |
|---|---|---|
| `/simulateurs/` | SimulateursHub | Non (CSR) |
| `/simulateur-revenus-nets-scpi/` | ScpiNetIncomeSimulator | Non (CSR) |
| `/simulateur-credit-scpi/` | ScpiCreditSimulator | Non (CSR) |
| `/simulateur-demembrement-scpi/` | ScpiDemembrementSimulator | Non (CSR) |
| `/simulateur-enveloppes-scpi/` | ScpiEnvelopeComparator | Non (CSR) |
| `/simulateur-tresorerie-is/` | SimulateurTresorerieIS | Non (CSR) |
| `/simulateur-impact-fiscal-scpi/` | SimulateurImpactFiscal | Non (CSR) |
| `/simulateur-profil-investisseur/` | InvestorProfileSimulator | Non (CSR) |
| `/comparateur-demembrement-scpi/` | ComparateurDemembrementScpi | Non (CSR) |
| `/simulateur-fonds-euros-scpi/` | LifeToScpiPage | Non (CSR) |

#### Pages EEAT / institutionnelles

| URL | Composant | SSG |
|---|---|---|
| `/expertise-orias-cif/` | ExpertiseOriasPage | Non (CSR) |
| `/methodologie-donnees-scpi/` | MethodologieDonneesPage | Non (CSR) |
| `/avertissements-risques-scpi/` | AvertissementsRisquesPage | Non (CSR) |
| `/qui-sommes-nous/` | AboutUsPage | Non (CSR) |
| `/faq/` | FAQPage | Non (CSR) |
| `/conditions-utilisation/` | ConditionsUtilisationPage | Non (CSR) |

#### Articles éducatifs (2 systèmes coexistent)

**Système Legacy (~30 articles)** — chaque article a sa propre vue et composant dédié :

| Pattern d'URL | Nombre | Rendu | SSG |
|---|---|---|---|
| `/education/{slug}/` (redirigé 301 → `/articles/{slug}/`) | ~30 | Composants individuels (FondsEurosOuScpiArticle, etc.) | **Non** |
| `/articles/{slug}/` (mêmes articles, URLs canoniques) | ~30 | Composants individuels | **Non** |

**Système Dynamique (~143 articles)** :

| Pattern d'URL | Composant | SSG |
|---|---|---|
| `/articles/{slug}/` | DynamicArticlePage ou OptimizedArticlePage | **Non** (CSR pur) |
| `/articles/` (hub) | EducationArticlesIndexPage | **Non** (CSR) |
| `/articles/construire-portefeuille-scpi/` | ConstruirePortefeuilleScpiPage | **Non** (CSR) |

#### SCPI individuelles

| Pattern | Nombre | Rendu | SSG |
|---|---|---|---|
| `/{scpi-slug}/` (ex: `/iroko-zen/`) | ~63 | OptimizedScpiLandingPage | **Oui** (SSG via generateOptimizedStaticPages) |
| `/comparateur/scpi/{slug}/` | ~63 | ScpiDetailPage | Non (CSR) |

#### Pages sociétés de gestion

| Pattern | Nombre | SSG |
|---|---|---|
| `/{manager-slug}/` (ex: `/alderan-scpi/`) | ~26 | Oui (SSG via generateThematicPages) |
| `/societe-gestion/{slug}/` | ~26 | Non (CSR) |
| `/societes-de-gestion-scpi/` | 1 | Non (CSR) |
| `/gestionnaires-acteurs-scpi/` | 1 | Non (CSR) |

#### Pages éducatives "1:1" (~60 views individuelles)

Pages comme `/tof-scpi/`, `/frais-scpi/`, `/risques-scpi/`, `/scpi-credit/`, `/scpi-comptant/`, `/scpi-sci-is-fiscalite/` etc. — chacune a sa propre vue et son composant. **Aucune n'est SSG.**

### 2c. Doublons et risques de cannibalisation

**[CERTAIN] Doublons SCPI :** chaque SCPI a deux URLs concurrentes :
- `/{scpi-slug}/` → OptimizedScpiLandingPage (SSG, bien indexable)
- `/comparateur/scpi/{slug}/` → ScpiDetailPage (CSR, non indexable sans JS)
- **Risque :** contenu similaire servi sur deux URLs, canonical non vérifié systématiquement.

**[CERTAIN] Doublons gestionnaires :** chaque société de gestion a deux URLs :
- `/{manager-slug}/` → SSG
- `/societe-gestion/{slug}/` → CSR

**[CERTAIN] Articles en double système :** ~30 articles existent à la fois comme vues legacy (`/education/{slug}/` → redirigé 301) et comme articles dynamiques (`/articles/{slug}/` via DynamicArticlePage). La redirection 301 est en place, ce qui limite la cannibalisation.

**[CERTAIN] `/scpi-fiscales` vs `/scpi-fiscalite` :** le sitemap liste `/scpi-fiscalite/` comme canonique, mais `/scpi-fiscales/` existe (SSG) et renvoie du contenu différent. Le sitemap ne référence pas `/scpi-fiscales`.

**[À VÉRIFIER] `/preparer-retraite-scpi/` vs `/scpi-retraite/` :** URLs proches, intention similaire.

---

## 3. Maillage interne réel

### 3a. Système de maillage sémantique (SemanticLinks)

Le composant `SemanticLinks` est utilisé par **11 composants** :

| Composant | Page concernée |
|---|---|
| App.tsx | Homepage `/` |
| ThematicLandingPage | Pages thématiques legacy |
| OptimizedThematicLandingPage | Pages thématiques optimisées |
| ScpiSecteursHubPage | `/scpi-secteurs/` |
| ScpiGestionnairesHubPage | `/scpi-gestionnaires/` |
| ScpiObjectifsHubPage | `/scpi-objectifs/` |
| ScpiEuropeennesHubPage | `/scpi-europeennes-hub/` |
| FAQPage | `/faq/` |
| DynamicArticlePage | Articles dynamiques |
| OptimizedArticlePage | Articles optimisés (Supabase) |
| FondsEurosOuScpiArticlePage | Article spécifique |

La source de données est `src/data/semanticCocon.ts` avec la fonction `getSemanticLinks(pagePath)`.

### 3b. Couverture du cocon sémantique

Nombre de clés dans `semanticCoconConfig` : **21**

| Clé (pagePath) | Page | Liens configurés |
|---|---|---|
| `/` | Home | 7 |
| `/comprendre-scpi` | Guide SCPI | 10 (dont 5 /articles/) |
| `/meilleures-scpi-rendement` | Top rendement | 10 (dont 5 /articles/) |
| `/scpi-europeennes` | SCPI Europe | 11 (dont 5 /articles/) |
| `/preparer-retraite-scpi` | Préparer retraite | 7 |
| `/revenu-complementaire-scpi` | Revenu complémentaire | 6 |
| `/scpi-fiscales` | SCPI fiscales | 8 (dont 5 /articles/) |
| `/scpi-sans-frais` | Sans frais | 6 |
| `/comparateur-scpi` | Comparateur | 9 (dont 5 /articles/) |
| `/scpi-france-investissement` | SCPI France | 6 |
| `/scpi-bureaux-investissement` | Bureaux | 7 |
| `/scpi-commerces-investissement` | Commerces | 7 |
| `/scpi-sante-investissement` | Santé | 8 (dont 4 /articles/) |
| `/scpi-logistique-investissement` | Logistique | 6 |
| `/scpi-hotellerie-investissement` | Hôtellerie | 5 |
| `/scpi-residentiel-investissement` | Résidentiel | 6 |
| `/alderan-scpi` | Alderan | 5 |
| `/scpi-example` | Exemple | 6 |
| `/scpi-detail` | Détail SCPI | 8 |
| `/fiscalite-scpi` | Fiscalité | NON TROUVÉ (pas dans config) |
| `/investir-scpi` | Investir | 7 (dont 5 /articles/) |
| (pages manager: perial, iroko, etc.) | ~25 pages | NON TROUVÉ (pas dans config) |

**Total des liens `/articles/` dans semanticCocon : 34** (ajoutés récemment, couvrant 7 pages fortes).

### 3c. Liens internes des pages articles vers les money pages

**[CERTAIN] NON.** Aucun article éducatif ne pointe vers les pages transactionnelles (`/comparateur-scpi/`, `/meilleures-scpi-rendement/`) via le système de cocon sémantique. Les articles ont des `SemanticLinks` mais aucun n'a de clé configurée dans le cocon (les articles ne sont pas dans `semanticCoconConfig`).

Les articles peuvent contenir des CTA et des liens inline dans leur contenu éditorial, mais ceux-ci sont **rendus dynamiquement en JS** (React) et non visibles dans le HTML source.

### 3d. Pages orphelines

**[CERTAIN] Les articles individuels `/articles/{slug}/`** n'ont qu'un seul lien entrant depuis le hub `/articles/` (récemment corrigé en `<a href>`). Avant cette correction, ils étaient totalement orphelins (liens en `<button onClick>`).

**[CERTAIN] Les simulateurs** (`/simulateur-*`) ne sont liés que depuis le header (menu déroulant "Simulateurs") et la page hub `/simulateurs/`. Pas de liens contextuels depuis les articles ou les pages SCPI.

**[CERTAIN] Les pages EEAT** (`/expertise-orias-cif/`, `/methodologie-donnees-scpi/`) n'ont que des liens header/footer.

### 3e. Distinction liens contextuels vs navigationnels

- **Liens contextuels :** SemanticLinks (dans le corps de page, sous forme de cartes), CTA inline, liens dans le contenu éditorial
- **Liens navigationnels :** Header (menu principal + sous-menus), Footer (colonnes de liens)
- **Proportion :** ~90% des liens internes crawlables sont navigationnels (header/footer/SemanticLinks). Moins de 10% sont contextuels (dans le contenu éditorial).

---

## 4. Profondeur de clic

### Calcul depuis l'accueil `/`

| Profondeur | Pages | Exemples |
|---|---|---|
| **0 clic** | 1 | `/` |
| **1 clic** | ~50 | `/comparateur-scpi/`, `/meilleures-scpi-rendement/`, `/comprendre-les-scpi/`, `/articles/`, `/faq/`, toutes les pages du header |
| **2 clics** | ~150 | `/articles/{slug}/` (depuis `/articles/`), `/simulateur-*` (depuis `/simulateurs/`), pages secteur (depuis hub secteurs), SCPI individuelles (depuis comparateur) |
| **3 clics** | ~60 | `/societe-gestion/{slug}/` (depuis page gestionnaire → hub → accueil), `/comparateur/scpi/{slug}/` (depuis comparateur → accueil) |
| **4 clics +** | 0 | Aucune page identifiée à 4+ clics [CERTAIN] |

**[CERTAIN] Aucune page n'est à plus de 3 clics.** Le header + footer + SemanticLinks assurent une couverture à 2 clics pour la plupart des pages importantes.

---

## 5. Balises SEO par page

### 5a. Mécanisme utilisé

| Mécanisme | Description | Crawlable sans JS ? |
|---|---|---|
| `index.html` (statique) | Title/meta/OG/canonical hardcodés dans le `<head>` | **OUI** |
| Scripts SSG (generateThematicPages.js, etc.) | Title/meta/canonical hardcodés dans le HTML généré | **OUI** |
| `SEOHead` (React) | `useEffect` → manipulation DOM (`document.title`, `setAttribute`, `createElement`) | **NON** |
| `renderEducationalScpiPage()` helper | Wrapper qui injecte `<SEOHead>` + `<Header>` + `<Footer>` | **NON** |

### 5b. Comportement de SEOHead

```20:72:src/components/SEOHead.tsx
  useEffect(() => {
    // ...
    document.title = title;  // JS only
    // Manipule les meta tags existants ou en crée
    // Injecte canonical via createElement('link')
    // Injecte Organization schema JSON-LD
  }, [title, description, ...]);
```

**[CERTAIN] SEOHead est 100% JavaScript** — tout est fait dans un `useEffect`. Les crawlers qui n'exécutent pas JS verront uniquement les métadonnées par défaut de `index.html` :

```69:71:index.html
    <title>MaximusSCPI — Investir en SCPI avec un Expert Certifié ORIAS</title>
    <meta name="description" content="Comparez 63 SCPI en temps réel ✓ Rendements jusqu'à 11,18% ✓ Simulateurs gratuits ✓ Conseiller certifié ORIAS ✓ Investissez dès 200€" />
```

### 5c. Pages SSG — métadonnées OK

Exemple de `generateComprendrePage.js` :

```20:23:scripts/generateComprendrePage.js
  <title>Comprendre les SCPI : Guide Complet 2026 | Maximus SCPI</title>
  <meta name="description" content="Guide complet pour comprendre les SCPI : fonctionnement, avantages, types d'actifs, méthodes d'investissement et fiscalité.">
  <link rel="canonical" href="https://maximusscpi.com/comprendre-les-scpi/">
```

**[CERTAIN] Les pages SSG ont des métadonnées correctement indexables.**

### 5d. Pages CSR — métadonnées dynamiques uniquement

**[CERTAIN] Pour ~126 vues CSR** (articles, simulateurs, FAQ, pages légales, etc.), les métadonnées spécifiques à la page sont injectées via `SEOHead` (JavaScript). Un crawler sans JS verra le title/meta générique de `index.html` pour toutes ces pages.

### 5e. Anomalies détectées

- **[CERTAIN] Pages sans H1 dédié :** Les vues `'acheter-scpi'`, `'investir-scpi'`, `'rendement-scpi'`, `'category'`, `'article'` sont dans le type `currentView` mais n'ont **aucun bloc de rendu dédié** — elles tombent sur la homepage par défaut.
- **[CERTAIN] H1 multiples :** NON TROUVÉ (analyse statique limitée, nécessite audit des templates individuels)
- **[CERTAIN] Canonical manquante pour les pages CSR :** Les pages purement CSR (articles, simulateurs) n'ont pas de `<link rel="canonical">` dans le HTML initial — il est injecté par `SEOHead` en JS.
- **[CERTAIN] Pas de hreflang :** Une seule balise `hreflang="fr"` dans `index.html` pointant vers `/`. Aucune balise `hreflang` dynamique par page.

---

## 6. Données structurées (schema.org) — Volet AEO/GEO

### 6a. Types de schema détectés

| Type Schema.org | Nombre de pages | Fichiers |
|---|---|---|
| `FinancialService` (Organization) | 1 | ExpertiseOriasPage.tsx |
| `BreadcrumbList` | 7 | FiscaliteScpiPage, InvestirScpiPillarPage, AvertissementsRisquesPage, DynamicArticlePage, OptimizedArticlePage, ConstruirePortefeuilleScpiPage, ScpiEducationalPageLayout |
| `FAQPage` | 3 | FiscaliteScpiPage, AvertissementsRisquesPage, FAQPage (composant) |
| `Article` | 7 | ScpiEducationalPageLayout, OptimizedScpiLandingPage, ThematicLandingPage, OptimizedThematicLandingPage, ScpiDetailPage, LandingPage, ScpiLandingPage |
| `FinancialProduct` | 0 | Déclaré dans l'interface mais **jamais utilisé** dans le code |
| **Organization (SEOHead)** | 1 (global) | Injecté par SEOHead dans chaque page (JSON-LD via `useEffect`) |

### 6b. Mécanisme d'injection

**SchemaOrg.tsx :** Injecte un `<script type="application/ld+json">` dans le DOM via `useEffect` → **JavaScript only, invisible pour crawlers sans JS**.

**SEOHead.tsx :** Injecte un schema `Organization` également via `useEffect`.

### 6c. Conclusion AEO/GEO

**Le site expose-t-il des données factuelles structurées exploitables par les moteurs IA ?**

**PARTIEL** — OUI pour les pages SSG (où le SchemaOrg est rendu dans le HTML servi). **NON** pour les pages CSR (où le SchemaOrg est injecté en JS, donc invisible pour Googlebot sans rendu JS).

- `FAQPage` : utilisé sur 3 pages — bon pour les rich snippets si correctement rendu
- `BreadcrumbList` : 7 pages — aide à la compréhension de la structure
- `Article` : 7 pages — utile pour Google News / Discover
- **Absence notable :** pas de `WebPage`, `WebSite`, `SearchAction` (Sitelinks Searchbox), `Review`, `HowTo`, `Product`

---

## 7. Source des données SCPI

### 7a. Sources identifiées

| Source | Type | Utilisation |
|---|---|---|
| `src/data/scpiData.ts` | Fichier statique (export JS) | Données principales des SCPI (~63 entrées) |
| `src/data/scpiDataExtended.ts` | Fichier statique (export JS) | Données étendues/complémentaires |
| `src/data/SCPI_complet_avec_SFDR_Profil.json` | Fichier JSON statique | Données brutes pour les pages statiques SSG |
| **Supabase** (`articles_seo`, `scpi` tables) | Base de données externe | Contenu éditorial des articles, liste des SCPI |

### 7b. Mode de rendu des données

**[CERTAIN] Toutes les données SCPI sont chargées dynamiquement après hydratation React.** Aucune donnée SCPI n'est inline dans le HTML initial (sauf pour les pages SSG qui peuvent les inclure).

- `scpiData.ts` / `scpiDataExtended.ts` : importés dans les bundles JS, chargés côté client
- `SCPI_complet_avec_SFDR_Profil.json` : lu par les scripts de build (Node.js) pour générer les pages SSG — les données sont **incluses dans le HTML** des pages SSG
- Supabase : données fetchées dynamiquement (`supabase.from('articles_seo').select(...)`) → **JavaScript only**

### 7c. Impact SEO

- **Pages SSG (SCPI individuelles) :** Les données SCPI sont dans le HTML → lisibles par crawlers
- **Comparateur :** Données chargées via JS bundle → **invisibles sans JS**
- **Articles :** Contenu éditorial chargé via articleTemplatesConfig (JS bundle) ou Supabase (fetch) → **invisible sans JS**

---

## Tableau récapitulatif par page

| URL | Intention | Prof. | Liens → money page (O/N) | Liens entrants | Title OK | H1 OK | Schema | SSG |
|---|---|---|---|---|---|---|---|---|
| `/` | Hub/transactionnel | 0 | O (header + SemanticLinks) | — | O (index.html) | O | O (SEOHead) | Non |
| `/comparateur-scpi/` | Transactionnel | 1 | O (liens header) | Home, SemanticLinks | O (SEOHead) | À VÉRIFIER | O (SchEduPg) | Non |
| `/meilleures-scpi-rendement/` | Transactionnel | 1 | O (SemanticLinks) | Home, comprendr. | O (SSG) | À VÉRIFIER | O (SchEduPg) | Oui |
| `/comprendre-les-scpi/` | Informationnel | 1 | O (SemanticLinks→meilleures) | Home, header | O (SSG) | À VÉRIFIER | NON TROUVÉ | Oui |
| `/investir-scpi/` | Mixte | 1 | À VÉRIFIER | Home, SemanticLinks | O (SEOHead) | À VÉRIFIER | À VÉRIFIER | Non |
| `/scpi-europeennes/` | Transactionnel | 1 | N (pas de lien → comparateur) | SemanticLinks | O (SSG) | À VÉRIFIER | O (SchEduPg) | Oui |
| `/scpi-fiscales/` | Mixte | 1 | N | SemanticLinks | O (SSG) | À VÉRIFIER | O (SchEduPg) | Oui |
| `/scpi-fiscalite/` | Informationnel | 1 | À VÉRIFIER | SemanticLinks | O (SEOHead) | À VÉRIFIER | O (Breadcrumb+FAQ) | Non |
| `/faq/` | Informationnel | 1 | N | Header | O (SEOHead) | À VÉRIFIER | O (FAQPage) | Non |
| `/articles/` | Hub | 1 | N | Home, header | O (SEOHead) | À VÉRIFIER | NON TROUVÉ | Non |
| `/articles/{slug}/` | Informationnel | 2 | **N** (pas de lien contextuel) | `/articles/` uniquement | O (SEOHead) | À VÉRIFIER | O (Breadcrumb+Article) | **Non** |
| `/simulateurs/` | Transactionnel | 1 | O (header) | Header | O (SEOHead) | À VÉRIFIER | NON TROUVÉ | Non |
| `/simulateur-*/` | Transactionnel | 2 | N | `/simulateurs/` | O (SEOHead) | À VÉRIFIER | À VÉRIFIER | Non |
| `/expertise-orias-cif/` | EEAT | 1 | N | Header | O (SEOHead) | À VÉRIFIER | O (FinancialService) | Non |
| `/{scpi-slug}/` | Transactionnel | 2 | N | Comparateur | O (SSG) | À VÉRIFIER | O (SchEduPg) | Oui |
| `/{manager-slug}/` | Informationnel | 2 | N | Hub gestionnaire | O (SSG) | À VÉRIFIER | O (SchEduPg) | Oui |

**Légende :**
- **SchEduPg** = ScpiEducationalPageLayout (injecte BreadcrumbList + Article)
- **À VÉRIFIER** = nécessite inspection du composant individuel (non lu dans cet audit statique)
- **NON TROUVÉ** = aucune trace dans le code inspecté

---

## Conclusion de l'audit

L'architecture actuelle présente un **mix CSR/SSG** avec une couverture SSG partielle (~70 pages sur ~200+). Les trois blocages structurels majeurs sont :

1. **Les métadonnées dynamiques (SEOHead) sont 100% JavaScript** — tout le SEO on-page des pages CSR (articles, simulateurs, FAQ) dépend de l'exécution JS par le crawler.
2. **Les articles sont CSR purs sans SSG** — aucun script ne génère de HTML statique pour `/articles/{slug}/`, ce qui est critique pour l'indexation des 143 articles.
3. **Le maillage interne contextuel est faible** — les articles ne pointent pas vers les money pages, et les money pages ne couvrent qu'une fraction des articles (34 liens sur 143 via semanticCocon).

---

*Audit réalisé en lecture seule le 2026-06-18. Aucune modification de code effectuée.*
*Statut des constats : [CERTAIN] = prouvé par le code source ; [À VÉRIFIER] = déduit, nécessite inspection complémentaire.*
