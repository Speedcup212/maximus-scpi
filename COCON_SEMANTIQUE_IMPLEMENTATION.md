# Cocon Sémantique - Guide d'Implémentation

## 🎯 Vue d'ensemble

Ce document explique comment utiliser le système de maillage intelligent automatisé pour optimiser la circulation du "Jus SEO" sur MaximusSCPI.

## 📊 Architecture des Silos

### Têtes de Cocon (Priority 10)
1. **/** - Portefeuille SCPI (Hub central)
2. **/meilleures-scpi-rendement** - Analyse portefeuille rendement
3. **/comprendre-scpi** - Guide Éducatif

### Niveau 2 - Pages Sectorielles/Thématiques (Priority 8)
- `/scpi-bureaux`, `/scpi-commerces`, `/scpi-sante`, `/scpi-logistique`
- `/scpi-europeennes`, `/scpi-france`
- `/preparer-retraite-scpi`, `/revenu-complementaire-scpi`

### Niveau 3 - Pages Gestionnaires (Priority 7)
- `/alderan-scpi`, `/perial-asset-management-scpi`, etc.

### Niveau 4 - Fiches SCPI Individuelles (Priority 6)
- `/scpi-comete`, `/scpi-iroko-zen`, etc.

### Niveau 5 - Articles Éducatifs (Priority 5-6)
- `/fonds-euros-ou-scpi`, `/scpi-direct-ou-assurance-vie`, etc.

## 🗄️ Table Supabase `semantic_pages`

### Structure
```sql
CREATE TABLE semantic_pages (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  page_type text NOT NULL, -- scpi_page, article, landing_page, hub_page, gestionnaire
  category text,           -- bureaux, commerces, sante, fiscalite, retraite, etc.
  subcategory text,
  tags text[],            -- Array de tags pour matching
  priority integer,        -- 1-10 (10 = tête de cocon)
  parent_slug text,       -- Slug de la page mère
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Indexation
- Index sur `slug` (unique)
- Index composite sur `page_type + category`
- Index GIN sur `tags` (recherche full-text)
- Index sur `priority DESC` (filtré par active = true)

## 🔧 Composants React

### 1. RelatedSCPI
**Usage** : Affiche les SCPI similaires (sœurs) dans la même catégorie

```tsx
import RelatedSCPI from './components/RelatedSCPI';

<RelatedSCPI
  currentSlug="/scpi-comete"
  category="bureaux"
  maxResults={3}
  className="mt-8"
/>
```

**Props** :
- `currentSlug` (required) : Slug de la page actuelle
- `category` (optional) : Filtrer par catégorie
- `maxResults` (default: 3) : Nombre maximum de résultats
- `className` (optional) : Classes CSS supplémentaires

**Logique** :
1. Récupère les SCPI de la même catégorie
2. Exclut la SCPI actuelle
3. Trie par priority DESC
4. Limite au nombre demandé

**Où l'utiliser** :
- ✅ Pages SCPI individuelles (`/scpi-comete`, `/scpi-iroko-zen`)
- ✅ Pages sectorielles en fin de page
- ❌ Pas sur la page d'accueil (trop générique)

### 2. ContextualCTA
**Usage** : Génère des CTA intelligents basés sur les mots-clés du contenu

```tsx
import ContextualCTA from './components/ContextualCTA';

<ContextualCTA
  contentKeywords={['rendement', 'fiscalité', 'retraite']}
  className="mt-8"
/>
```

**Props** :
- `contentKeywords` (required) : Array de mots-clés du contenu
- `className` (optional) : Classes CSS

**Logique** :
1. Analyse les keywords fournis
2. Matche avec les CTAs prédéfinis
3. Calcule un score de pertinence
4. Affiche les 2 CTA les plus pertinents
5. Fallback : affiche le comparateur si aucun match

**Mapping Keywords → CTA** :
- `rendement, performance, tdvm` → "Comparez les Rendements" (`/meilleures-scpi-rendement`)
- `fiscalité, impôt, tmi, défiscalisation` → "Simulateur Fiscal" (`/simulateur-fiscal`)
- `retraite, pension, senior` → "Préparez votre Retraite" (`/preparer-retraite-scpi`)
- `revenu, complément, passif` → "Générez des Revenus Passifs" (`/revenu-complementaire-scpi`)
- `comparer, comparaison, choisir` → "Comparateur Intelligent" (`/`)
- `comprendre, fonctionnement, définition` → "Guide Complet SCPI" (`/comprendre-scpi`)

**Où l'utiliser** :
- ✅ Articles de blog (extraire les keywords du titre + H2)
- ✅ Pages thématiques
- ✅ Pages SCPI (si contexte pertinent)
- ❌ Pas sur les pages CTA elles-mêmes

### 3. SimilarArticles
**Usage** : Affiche les articles similaires (même catégorie/tags)

```tsx
import SimilarArticles from './components/SimilarArticles';

<SimilarArticles
  currentSlug="/fonds-euros-ou-scpi"
  category="fiscalite"
  tags={['fiscalité', 'impôt', 'arbitrage']}
  maxResults={4}
  className="mt-8"
/>
```

**Props** :
- `currentSlug` (required) : Slug de l'article actuel
- `category` (optional) : Filtrer par catégorie
- `tags` (optional) : Array de tags pour matching sémantique
- `maxResults` (default: 4) : Nombre maximum d'articles
- `className` (optional) : Classes CSS

**Logique** :
1. Récupère les articles de la même catégorie
2. Si `tags` fournis : utilise `overlaps` (intersection d'arrays PostgreSQL)
3. Exclut l'article actuel
4. Trie par priority DESC
5. Ajoute un temps de lecture estimé

**Où l'utiliser** :
- ✅ Pages d'articles (en fin d'article)
- ✅ Pages éducatives
- ❌ Pas sur les pages SCPI/landing pages

## 📝 Exemples d'Intégration

### Exemple 1 : Page SCPI (ScpiDetailPage.tsx)

```tsx
import RelatedSCPI from './RelatedSCPI';
import ContextualCTA from './ContextualCTA';

function ScpiDetailPage({ scpi }) {
  return (
    <div>
      {/* Contenu principal */}
      <h1>{scpi.nom}</h1>
      <div>{/* Description, stats, etc. */}</div>

      {/* CTA Contextuel basé sur le secteur */}
      <ContextualCTA
        contentKeywords={[scpi.secteur, 'rendement', 'investir']}
        className="my-12"
      />

      {/* SCPI Similaires (même secteur) */}
      <RelatedSCPI
        currentSlug={`/scpi-${scpi.slug}`}
        category={scpi.secteur}
        maxResults={3}
        className="my-12"
      />
    </div>
  );
}
```

### Exemple 2 : Article de Blog (ArticlePage.tsx)

```tsx
import SimilarArticles from './SimilarArticles';
import ContextualCTA from './ContextualCTA';

function ArticlePage({ article }) {
  // Extraire les keywords du titre et des H2
  const keywords = extractKeywords(article.content);

  return (
    <div>
      {/* Contenu de l'article */}
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* CTA Contextuel au milieu de l'article */}
      <ContextualCTA
        contentKeywords={keywords}
        className="my-8"
      />

      {/* Articles similaires en fin */}
      <SimilarArticles
        currentSlug={article.slug}
        category={article.category}
        tags={article.tags}
        maxResults={4}
        className="mt-12"
      />
    </div>
  );
}
```

### Exemple 3 : Page Sectorielle (ScpiBureauxPage.tsx)

```tsx
import RelatedSCPI from './RelatedSCPI';
import ContextualCTA from './ContextualCTA';

function ScpiBureauxPage() {
  return (
    <div>
      <h1>SCPI Bureaux : Investissement Tertiaire</h1>

      {/* Contenu principal */}
      <div>{/* Description du secteur bureaux */}</div>

      {/* CTA vers le comparateur */}
      <ContextualCTA
        contentKeywords={['bureaux', 'tertiaire', 'comparer']}
        className="my-12"
      />

      {/* Liste des meilleures SCPI bureaux */}
      <div>{/* Tableau des SCPI */}</div>

      {/* SCPI Bureaux recommandées */}
      <RelatedSCPI
        currentSlug="/scpi-bureaux"
        category="bureaux"
        maxResults={4}
        className="my-12"
      />
    </div>
  );
}
```

## 🔄 Alimentation de la Table `semantic_pages`

### Script d'Import Automatique

Créer un script `scripts/populateSemanticPages.ts` :

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Importer toutes les SCPI depuis la table scpi
async function importSCPI() {
  const { data: scpiData } = await supabase
    .from('scpi')
    .select('nom, secteur, zone_geo');

  const pages = scpiData.map(scpi => ({
    slug: `/scpi-${scpi.nom.toLowerCase().replace(/\s+/g, '-')}`,
    title: `SCPI ${scpi.nom}`,
    page_type: 'scpi_page',
    category: scpi.secteur,
    tags: [scpi.secteur, scpi.zone_geo, scpi.nom],
    priority: 6,
    parent_slug: `/scpi-${scpi.secteur}`,
    active: true
  }));

  await supabase.from('semantic_pages').upsert(pages);
}

// Importer tous les articles depuis articles_seo
async function importArticles() {
  const { data: articles } = await supabase
    .from('articles_seo')
    .select('slug, title, category');

  const pages = articles.map(article => ({
    slug: `/${article.slug}`,
    title: article.title,
    page_type: 'article',
    category: article.category,
    tags: extractTags(article.title), // Fonction à créer
    priority: 5,
    parent_slug: '/comprendre-scpi',
    active: true
  }));

  await supabase.from('semantic_pages').upsert(pages);
}
```

## ⚠️ Règles de Maillage (Anti-Fuites)

### ✅ À FAIRE
1. **Liens contextuels uniquement** : Chaque lien doit avoir un lien sémantique avec le contenu
2. **Hiérarchie respectée** : Toujours remonter vers les têtes de cocon
3. **Liens sœur-sœur filtrés** : Uniquement dans la même catégorie
4. **CTA vers les têtes** : Les articles poussent vers Comparateur / Simulateurs / Guides

### ❌ À NE PAS FAIRE
1. **Footer pollué** : Mettre les liens légaux en `rel="nofollow"`
2. **Liens transversaux** : Ne pas relier Bureaux ↔ Santé (silos différents)
3. **Liens orphelins** : Chaque page doit avoir au moins 1 lien entrant depuis une tête de cocon
4. **Sur-optimisation** : Ne pas mettre 10 liens similaires, 3-4 suffisent

## 🎨 Styling des Composants

Tous les composants utilisent Tailwind CSS avec support du mode sombre. Ils sont responsive et s'intègrent naturellement dans le design existant.

**Classes principales** :
- Background : `bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900`
- Hover : `hover:shadow-xl transition-all duration-300`
- Icons : `h-5 w-5` ou `h-6 w-6` selon le contexte

## 📈 Indicateurs de Succès

### Mesurer l'Efficacité du Maillage
1. **Taux de clics internes** : % d'utilisateurs qui cliquent sur les liens contextuels
2. **Profondeur de navigation** : Nombre moyen de pages vues par session
3. **Pages orphelines** : Doit être 0
4. **Taux de sortie** : Doit diminuer sur les pages avec maillage intelligent

### Outils de Monitoring
- Google Search Console : Liens internes
- Analytics : Flux de comportement
- Screaming Frog : Audit de structure

## 🚀 Déploiement

1. **Créer la table** : Migration déjà appliquée ✅
2. **Alimenter la table** : Exécuter le script d'import
3. **Intégrer les composants** : Ajouter dans les pages concernées
4. **Tester** : Vérifier que les liens s'affichent correctement
5. **Monitorer** : Suivre les KPIs pendant 2-4 semaines

## 📚 Ressources

- [Audit Cocon Sémantique](./AUDIT_COCON_SEMANTIQUE.md)
- [Table slug_redirects](./supabase/migrations/create_slug_redirects_table.sql)
- [Table semantic_pages](./supabase/migrations/create_semantic_pages_table.sql)
