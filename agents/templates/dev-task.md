# Template — Mission Dev / Cursor (Agent 00 → Cursor)

## Cycle obligatoire
1. Diagnostic lecture seule → 2. Liste fichiers → 3. Attente validation → 4. Modification ciblée → 5. Lint + vérification

---

## À remplir par l'opérateur

```
COMPOSANT / FICHIER CIBLÉ : 
TYPE D'INTERVENTION : [correction bug / ajout feature / conformité / refactoring ciblé / audit]
RISQUE IDENTIFIÉ : 
FICHIERS PROBABLEMENT CONCERNÉS : 
```

---

## Étape 1 — Diagnostic (lecture seule, max 5 fichiers)

Lister les fichiers à consulter et attendre validation :
- [ ] Fichier principal ciblé
- [ ] Fichier(s) dépendant(s) si import direct
- [ ] Autre : ___

**Ne jamais modifier avant validation explicite.**

---

## Étape 2 — Règles d'intervention

### Interdit sans validation explicite
- Modifier `src/` (composants, pages, hooks, utils, data, domain)
- Modifier `public/`, `supabase/`, `package.json`, `netlify.toml`
- Modifier le sitemap ou les redirects
- Lancer un refactoring global
- Pousser directement en production

### Autorisé sans validation (Phase 1)
- Lire n'importe quel fichier en lecture seule
- Modifier les fichiers dans `/agents` et `/tasks`
- Proposer des corrections sans les appliquer

---

## Étape 3 — Modification ciblée

Décrire précisément avant d'agir :
```
FICHIER : 
LIGNE(S) CONCERNÉE(S) : 
ANCIEN CONTENU : 
NOUVEAU CONTENU : 
RAISON : 
```

Appliquer uniquement ce qui a été validé. Un changement à la fois.

---

## Étape 4 — Vérification post-modification

- [ ] `ReadLints` sur le fichier modifié
- [ ] Aucune erreur TypeScript introduite
- [ ] Build non cassé (vérifier si modification critique)
- [ ] Commit ciblé proposé (ne pas pousser sans confirmation)

---

## Format de réponse

```
FICHIER MODIFIÉ : 
NATURE DU CHANGEMENT : 
LINTER : [aucune erreur / erreurs détectées — préciser]
BUILD REQUIS : [oui / non]
COMMIT PROPOSÉ : [message]
PUSH : [en attente de validation]
```
