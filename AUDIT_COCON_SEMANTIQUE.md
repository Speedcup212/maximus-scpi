# Audit Cocon Sémantique - MaximusSCPI

## 📊 ANALYSE CRITIQUE DE LA STRUCTURE ACTUELLE

### 1. Points Forts ✅

#### Structure Sémantique Déjà Présente
- **Fichier `semanticCocon.ts`** : Excellente base avec relations parent/child/sibling bien définies
- **1005 lignes de configuration** couvrant toutes les pages principales
- **Logique hiérarchique claire** : Pages piliers → Pages sectorielles → Pages gestionnaires
- **Types de liens définis** : parent, child, sibling (bonne taxonomie)

#### Mega Menu Intelligent
- **Menu SCPI** : Séparation claire entre Top SCPI et catégories (Secteurs, Géographie, Gestionnaires)
- **Menu Simulateurs** : Regroupement thématique des outils
- **Menu Éducation** : Catégorisation des articles par thématique

### 2. Fuites de Jus Identifiées ⚠️

#### A. Footer - Fuites Majeures

**Problème** : Le Footer contient 4 liens vers des pages légales qui drainent du jus sans apporter de valeur SEO.

```tsx
// Footer.tsx lignes 90-99
<a href="/mentions-legales">Mentions Légales</a>
<a href="/politique-confidentialite">Politique de Confidentialité</a>
<a href="/conditions-utilisation">Conditions d'Utilisation</a>
<a href="/reclamation">Réclamation</a>
```

**Solution** : Ajouter `rel="nofollow"` sur ces liens légaux

```tsx
<a href="/mentions-legales" rel="nofollow">Mentions Légales</a>
<a href="/politique-confidentialite" rel="nofollow">Politique de Confidentialité</a>
<a href="/conditions-utilisation" rel="nofollow">Conditions d'Utilisation</a>
<a href="/reclamation" rel="nofollow">Réclamation</a>
```

**Impact** : Conserve le jus pour les pages stratégiques

#### B. Header - Bonne Structure mais à Optimiser

**Point Fort** : Le Mega Menu est déjà bien structuré avec catégorisation claire

**Amélioration** : Ajouter des liens contextuels dans les dropdowns vers les têtes de cocon

#### C. Liens Transversaux Non Contrôlés

**Problème** : Les liens entre silos différents ne sont pas filtrés (ex: SCPI Bureaux → SCPI Santé)

**Solution** : Utiliser le composant `RelatedSCPI` qui filtre automatiquement par catégorie

### 3. Têtes de Cocon Identifiées 🎯

#### Niveau 1 - Hub Central (Priority 10)
1. **/** - Comparateur SCPI
   - Mots-clés : comparateur, scpi, rendement, investissement
   - Objectif : Conversion (outils interactifs)
   - Cible : Tous les visiteurs

2. **/meilleures-scpi-rendement** - Top 10 SCPI
   - Mots-clés : meilleures, top, classement, rendement
   - Objectif : SEO + Conversion
   - Cible : Chercheurs de performance

3. **/comprendre-scpi** - Guide Éducatif
   - Mots-clés : comprendre, guide, fonctionnement, débutant
   - Objectif : SEO éducatif + nurturing
   - Cible : Débutants

#### Niveau 2 - Pages Thématiques (Priority 8)

**Sectorielles** :
- `/scpi-bureaux`, `/scpi-commerces`, `/scpi-sante`, `/scpi-logistique`

**Géographiques** :
- `/scpi-europeennes`, `/scpi-france`

**Objectifs** :
- `/preparer-retraite-scpi`, `/revenu-complementaire-scpi`

**Fiscales** :
- `/scpi-fiscales`, `/scpi-sans-frais`

#### Niveau 3 - Pages Gestionnaires (Priority 7)
- `/alderan-scpi`, `/perial-asset-management-scpi`, `/iroko-scpi`, etc.

#### Niveau 4 - Fiches SCPI (Priority 6)
- `/scpi-comete`, `/scpi-iroko-zen`, etc.

#### Niveau 5 - Articles Éducatifs (Priority 5-6)
- `/fonds-euros-ou-scpi`, `/scpi-direct-ou-assurance-vie`, etc.

### 4. Logique de Glissement Sémantique 🔄

#### A. Relation Mère → Filles

**Exemple : Comprendre SCPI (Mère) → Articles Spécifiques (Filles)**

```
/comprendre-scpi (Hub)
    ├── /fonds-euros-ou-scpi (Article)
    ├── /scpi-direct-ou-assurance-vie (Article)
    ├── /scpi-demembrement-strategie-retraite (Article)
    └── /scpi-fiscales (Landing Page)
```

**Implémentation** : Composant `SimilarArticles` en fin d'article

#### B. Relation Sœur → Sœur

**Exemple : SCPI du même secteur**

```
SCPI Bureaux (Silo)
    ├── /scpi-comete (Bureaux diversifiés)
    ├── /scpi-epargne-pierre (Bureaux France)
    └── /scpi-primonial-reim (Bureaux Europe)

❌ PAS DE LIEN VERS :
    └── /scpi-primovie (Santé) ← Silo différent
```

**Implémentation** : Composant `RelatedSCPI` avec filtre par `category`

#### C. Cross-Silo (Appel à l'Action)

**Exemple : Article Actualité → Simulateur**

```
Article : "La hausse des taux d'intérêt"
    Mots-clés détectés : rendement, taux, investir
    → CTA automatique vers /comparateur-scpi
```

**Implémentation** : Composant `ContextualCTA` avec analyse de keywords

### 5. Plan de Maillage Intelligent 🧠

#### Règle 1 : Chaque Page a UN Parent Clair
- Article → Hub éducatif
- SCPI → Page sectorielle
- Page sectorielle → Hub performances

#### Règle 2 : Liens Sœurs = Même Catégorie UNIQUEMENT
- Bureaux ↔ Bureaux ✅
- Bureaux ↔ Santé ❌

#### Règle 3 : CTA Contextuels vers Têtes de Cocon
- Article fiscalité → Simulateur fiscal
- Article rendement → Comparateur
- Article retraite → Page "Préparer sa retraite"

#### Règle 4 : Limiter le Nombre de Liens
- Max 3-4 SCPI similaires
- Max 2 CTA contextuels
- Max 4 articles similaires

## 📝 SOLUTIONS IMPLÉMENTÉES

### 1. Table Supabase `semantic_pages`
✅ **Créée** avec colonnes : slug, title, page_type, category, tags, priority, parent_slug

### 2. Composants React Automatisés

#### A. `RelatedSCPI`
- Affiche 3 SCPI similaires (même catégorie)
- Exclut la SCPI actuelle
- Trie par priority
- Lien vers `/meilleures-scpi-rendement` en fin

**Usage** :
```tsx
<RelatedSCPI currentSlug="/scpi-comete" category="bureaux" maxResults={3} />
```

#### B. `ContextualCTA`
- Analyse les keywords du contenu
- Matche avec 8 CTAs prédéfinis
- Affiche les 2 plus pertinents
- Fallback : comparateur si aucun match

**Usage** :
```tsx
<ContextualCTA contentKeywords={['rendement', 'fiscalité']} />
```

#### C. `SimilarArticles`
- Affiche 4 articles similaires (même catégorie/tags)
- Exclut l'article actuel
- Affiche temps de lecture estimé
- Lien vers `/comprendre-scpi` en fin

**Usage** :
```tsx
<SimilarArticles currentSlug="/fonds-euros-ou-scpi" category="fiscalite" tags={['fiscalité', 'impôt']} />
```

### 3. Script de Population `populateSemanticPages.ts`
✅ **Créé** pour importer automatiquement :
- Toutes les SCPI depuis la table `scpi`
- Tous les articles depuis `articles_seo`
- Toutes les landing pages (hardcodées)

**Exécution** :
```bash
npx tsx scripts/populateSemanticPages.ts
```

## 🎯 PLAN D'ACTION

### Phase 1 : Préparation (Fait ✅)
1. ✅ Créer table `semantic_pages`
2. ✅ Créer composants React
3. ✅ Créer script de population

### Phase 2 : Alimentation (À faire)
1. ⏳ Exécuter `populateSemanticPages.ts`
2. ⏳ Vérifier les données dans Supabase
3. ⏳ Ajuster les priorités si besoin

### Phase 3 : Intégration (À faire)
1. ⏳ Ajouter `RelatedSCPI` dans `ScpiDetailPage.tsx`
2. ⏳ Ajouter `SimilarArticles` dans `ArticlePage.tsx`
3. ⏳ Ajouter `ContextualCTA` dans articles et pages sectorielles
4. ⏳ Ajouter `rel="nofollow"` aux liens légaux du Footer

### Phase 4 : Test & Monitoring (À faire)
1. ⏳ Tester sur 5 pages représentatives
2. ⏳ Vérifier que les liens s'affichent correctement
3. ⏳ Monitorer le taux de clics internes (Google Analytics)
4. ⏳ Audit avec Screaming Frog après 2 semaines

## 📈 KPIs à Suivre

1. **Taux de clics internes** : +30% attendu
2. **Pages par session** : +20% attendu
3. **Temps sur site** : +15% attendu
4. **Taux de rebond** : -10% attendu
5. **Pages orphelines** : 0 (objectif)

## 🚫 Ce Qu'il NE FAUT PAS Faire

1. ❌ Relier des silos différents (Bureaux ↔ Santé)
2. ❌ Mettre 10 liens similaires (max 3-4)
3. ❌ Oublier les `rel="nofollow"` sur pages légales
4. ❌ Créer des liens vers des pages non indexables
5. ❌ Utiliser les composants sur les têtes de cocon (risque de cannibalisation)

## 📚 Documentation

- [Guide d'Implémentation Complet](./COCON_SEMANTIQUE_IMPLEMENTATION.md)
- [Script de Population](./scripts/populateSemanticPages.ts)
- [Migration semantic_pages](./supabase/migrations/create_semantic_pages_table.sql)