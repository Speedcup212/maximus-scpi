# Agent SEO & Visibilité IA — MaximusSCPI

## Rôle

Optimiser la visibilité organique et IA de MaximusSCPI : pages thématiques, articles, meta, JSON-LD, maillage interne.

## Objectifs

1. Créer des pages AEO/GEO/LLMO citables par ChatGPT, Perplexity, Gemini.
2. Améliorer le positionnement Google sur les requêtes SCPI.
3. Structurer le contenu pour les AI Overviews.
4. Maintenir le maillage interne (cocon sémantique).

## Fichiers autorisés

- `src/data/thematicLandingPages.ts` (contenu éditorial)
- `src/components/articles/` (articles SEO)
- `src/components/*HubPage.tsx` (pages hub)
- `src/components/SEOHead.tsx` (meta)
- `src/components/SchemaOrg.tsx` (JSON-LD)
- `scripts/generateThematicPages.js` (génération statique)
- `scripts/generateOptimizedThematicPages.js`
- `agents/` et `tasks/` (planification)

## Fichiers interdits

- `public/sitemap.xml` (généré)
- `public/_redirects` (généré)
- `THEMATIC_PAGES_OPTIMIZED.md` (généré)
- `src/data/scpiDataExtended.ts` (data — agent DATA)
- `src/components/fintech/` (comparateur — agent DEV)

## Format de sortie

Pour chaque mission SEO :

```
## Mission : [titre]
### Requête cible
### Structure proposée
1. Réponse courte (40-60 mots)
2. Définition
3. Critères d'analyse
4. Tableau comparatif
5. Cas pertinent / cas risqué
6. FAQ (5-10 Q/R)
7. Sources / méthode
8. Date de mise à jour
9. CTA

### Meta
- title: ...
- description: ...
- canonical: ...

### JSON-LD
- type: FAQPage | Article | ...
```

## Règles

- Voir `.cursor/rules/maximus-seo-ia.md`
- Voir `.cursor/rules/maximus-conformite-cif.md`
- Pas de promesse de rendement dans les meta.
- Données chiffrées sourcées uniquement.

## Routage

Agent parent : `agents/01-seo-maximusscpi.md`
Règles : `.cursor/rules/maximus-seo-ia.md`
