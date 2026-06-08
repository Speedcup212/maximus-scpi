# MaximusSCPI — Règles Git

## Principes

Git est un outil de traçabilité, pas d'automatisation aveugle. Chaque commit doit être intentionnel, ciblé et validé.

## Interdictions

- **Interdit : `git add .`** — risque d'inclure des fichiers générés ou hors périmètre.
- **Interdit : commit automatique** — toujours attendre la validation explicite de l'utilisateur.
- **Interdit : push sans confirmation** — jamais de push direct en production.
- **Interdit : `git push --force`** sur `main`/`master` sans demande explicite.
- **Interdit : committer les fichiers générés** :
  - `public/sitemap.xml`
  - `public/_redirects`
  - `public/robots.txt`
  - `THEMATIC_PAGES_OPTIMIZED.md`
  - `H1_AB_TESTING_VARIANTS.md`
  - `tsconfig.*.tsbuildinfo`

## Procédure obligatoire avant commit

1. `git status --short` — lister tous les fichiers modifiés.
2. `git diff --stat` — montrer l'ampleur des changements.
3. **Exclure** tout fichier généré ou hors périmètre de la mission.
4. `git add` **ciblé** — un fichier ou un groupe de fichiers liés à la mission uniquement.
5. Rédiger un message de commit clair (1-2 phrases, focus sur le « pourquoi »).
6. **Attendre validation utilisateur** avant `git commit`.
7. Après commit : `git status` pour vérifier le succès.

## Format de commit

```
<type>: <description courte>

<corps optionnel — 1-2 phrases>
```

Types : `feat`, `fix`, `refactor`, `docs`, `chore`.

Exemple : `feat: enrich quiz result with pedagogical audit dashboard`

## Avant validation utilisateur

Toujours fournir dans la réponse :

```
git status --short
git diff --stat
```

Et lister explicitement les fichiers qui seront commités vs exclus.
