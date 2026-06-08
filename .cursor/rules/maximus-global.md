# MaximusSCPI — Règles globales

## Contexte projet

MaximusSCPI est un site **React + TypeScript + Tailwind CSS (Vite)** dédié à la **comparaison pédagogique des SCPI**, opéré par un **CGP-CIF indépendant**.

## Objectifs stratégiques

1. **Acquisition qualifiée** — convertir des prospects froids en leads via quiz, comparateur et Calendly.
2. **Visibilité IA** — être cité par ChatGPT, Perplexity, Gemini et Google AI (AEO / GEO / LLMO).
3. **Fiabilité data** — indicateurs SCPI sourcés, cohérents et auditables.
4. **Conformité CGP-CIF** — respect strict de la réglementation MIF2 et des règles AMF.

## Règle de validation obligatoire

**Aucune modification du site** (fichiers `src/`, `public/`, scripts de build, données SCPI, routes) sans la phrase exacte :

```
VALIDÉ POUR MODIFICATION DU SITE
```

Les modifications dans `/agents`, `/tasks` et `.cursor/rules/` sont autorisées librement.

## Fichiers générés — interdiction de modification

Ne jamais modifier les fichiers suivants sauf **demande explicite** de l'utilisateur :

| Fichier | Raison |
|---|---|
| `public/sitemap.xml` | Généré automatiquement par le build |
| `public/_redirects` | Généré automatiquement |
| `public/robots.txt` | Généré automatiquement |
| `THEMATIC_PAGES_OPTIMIZED.md` | Généré par script |
| `H1_AB_TESTING_VARIANTS.md` | Généré par script |
| `tsconfig.*.tsbuildinfo` | Artefact TypeScript |

## Règles de travail

- **Pas de commit automatique** — toujours attendre la validation explicite de l'utilisateur.
- **Avant toute validation**, fournir systématiquement :
  - `git status --short`
  - `git diff --stat`
- **Lecture limitée** à 5 fichiers maximum par mission, sauf justification validée.
- **Un commit = une mission** — commits petits, ciblés, documentés.
- **Pas de push** sans confirmation explicite.
- **Pas de dépendance npm** sans validation.
- **Répondre en français** — court, hiérarchisé, opérationnel.

## Agents disponibles

| Fichier | Rôle |
|---|---|
| `agents/SEO_IA_AGENT.md` | SEO éditorial et visibilité IA |
| `agents/DATA_SCPI_AGENT.md` | Data SCPI sourcée |
| `agents/CONFORMITE_AGENT.md` | Conformité CIF/AMF |
| `agents/UX_CONVERSION_AGENT.md` | UX et conversion |
| `agents/DEV_EXECUTOR_AGENT.md` | Exécution technique validée |
| `agents/QA_GIT_AGENT.md` | Contrôle qualité et git |

Routage détaillé → `agents/router.md`
