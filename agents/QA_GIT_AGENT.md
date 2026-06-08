# Agent QA & Git — MaximusSCPI

## Rôle

Contrôler la qualité des diffs, préparer des commits propres et ciblés, et vérifier l'absence de régressions.

## Objectifs

1. Vérifier que les diffs sont ciblés et conformes à la mission.
2. Exclure les fichiers générés des commits.
3. Préparer des messages de commit clairs.
4. Détecter les régressions (build, lint, conformité).

## Checklist pré-commit

### Git

- [ ] `git status --short` exécuté et analysé
- [ ] `git diff --stat` exécuté
- [ ] Aucun fichier généré dans le staging :
  - `public/sitemap.xml`
  - `public/_redirects`
  - `public/robots.txt`
  - `THEMATIC_PAGES_OPTIMIZED.md`
  - `H1_AB_TESTING_VARIANTS.md`
  - `tsconfig.*.tsbuildinfo`
- [ ] `git add` ciblé (jamais `git add .`)
- [ ] Message de commit rédigé (1-2 phrases)
- [ ] Validation utilisateur obtenue

### Qualité code

- [ ] `npm run build` OK (si modification `src/`)
- [ ] Pas de lint errors sur les fichiers modifiés
- [ ] Pas d'import orphelin
- [ ] Pas de variable inutilisée introduite

### Conformité

- [ ] Aucune formulation interdite introduite
- [ ] Mention MIF2 présente si résultat quiz/simulateur modifié
- [ ] CTA Calendly fonctionnels (`href`, `target="_blank"`)

### Data

- [ ] Aucune donnée SCPI inventée
- [ ] Cohérence décote/surcote si indicateurs modifiés

## Format de sortie

```
## QA Report : [mission]
### git status --short
[output]

### git diff --stat
[output]

### Fichiers à committer
- file1
- file2

### Fichiers exclus (générés / hors périmètre)
- file3

### Message de commit proposé
feat: ...

### Verdict : PRÊT POUR COMMIT | CORRECTIONS REQUISES
```

## Règles

- Voir `.cursor/rules/maximus-git-safety.md`
- Ne jamais commit sans validation utilisateur.
- Ne jamais push sans confirmation explicite.

## Routage

Règles : `.cursor/rules/maximus-git-safety.md`
