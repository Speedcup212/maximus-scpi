# Chemin de build production isolé — preuves (run 27/11 15:30Z)

Aucun déploiement production, aucune fusion, aucun changement de droits, aucun build Netlify payant.
Production inchangée : deploy `6b093fce31a2c5175aa3378a` / SHA `2f60880e`.

---

## 1. Le candidat isolé existe déjà et est exact

`git merge-base 2f60880e origin/fix/home-agents-ia-20261127` → `2f60880e`.
La branche #468 **part directement du SHA publié**, elle ne contient aucun commit de migration.

| Mesure | Valeur |
|---|---|
| `git diff --stat 2f60880e..9317fb0` | **2 fichiers** : `index.html` (+4), `src/HomeApp.tsx` (+18/−6) |
| Références clé/auth dans le diff | **0** (`sb_secret`, `sb_publishable`, `service_role`, `SUPABASE_`, `apikey`) |
| `plugins/maximus-scpi-native-release` | **identique** au SHA publié |
| `netlify.toml` | **identique** au SHA publié |
| `scripts/netlify-ignore.mjs` | **identique** au SHA publié |

## 2. Pourquoi le preview #468 n'est pas promouvable (mesuré, pas supposé)

`GET /scpi-release-manifest.json` sur trois artefacts réels :

| Artefact | HTTP | Content-Type | Verdict |
|---|---|---|---|
| preview #468 `6b099179864a5b75dd01616e` | 200 | **text/html** | `ARTIFACT_MANIFEST_NOT_JSON` |
| production `6b093fce31a2c5175aa3378a` | 200 | application/json | manifeste valide (`sha=2f60880e`) |
| production 19/11 `6aff522aceb33cf1877db8de` | 200 | application/json | manifeste valide (`sha=6162367b`) |

La règle SPA `/* → /index.html 200` répond **200** avec du HTML : un 200 ne prouve rien ici.
C'est pour cette raison que le contrôle doit lire le **corps**, et refuser un corps non-JSON.

## 3. Les trois conditions conjonctives d'un build production attesté

Mesurées en exécutant le code réel du dépôt.

### Condition 1 — l'ignore de build
`scripts/netlify-ignore.mjs` : branche ≠ `main` → build annulé sauf jeton `[preview]` (qui n'ouvre
qu'un `deploy-preview`) ; `main` sans jeton → annulé. Seul `main` + `[deploy|release|hotfix]`
produit `CONTEXT=production`.

### Condition 2 — la génération native du manifeste
`isProductionDeploy()` exige `CONTEXT==='production' && BRANCH==='main'`. Matrice exécutée :

| Environnement | `isProductionDeploy` | Manifeste écrit |
|---|---|---|
| production + main | true | **oui** |
| production + `release/home-agents-ia-20261127-iso` | false | **non** |
| deploy-preview + main | false | non |
| branch-deploy + main | false | non |
| production + main + autre site | false | non |
| production + main + deploy_id malformé | false | non |

`writeBuildManifest()` exécuté sur l'arbre `9317fb0` avec `CONTEXT=production BRANCH=main` produit
bien le manifeste natif :
`{"sha":"9317fb0dce…","deploy_id":"6b099179864a5b75dd01616e","issuer":"Speedcup212/maximus-scpi","context":"production"}`
→ **la génération native est intacte sur le candidat ; elle n'exige aucune modification du plugin.**

### Condition 3 — la course GitHub exigée par `checkPublishedManifest`
`checkGithubSuccessfulBuild(sha)` filtre `name=='Build verification'`, `event=='push'`,
`head_branch=='main'`, `head_sha==sha`.

| SHA | runs `Build verification` `push`+`main` |
|---|---|
| `9317fb0dce…` (candidat) | **0** |
| `2f60880e07…` (publié) | 1 |

Le candidat n'a qu'un run `event=pull_request`. Une promotion par restore ne crée aucun run `push`.

## 4. Ce que change réellement une promotion par restore

Un `POST /sites/{id}/deploys/{id}/restore` **ne relance pas de build** : aucun hook du plugin
(`onPreBuild` / `onPostBuild` / `onSuccess`) ne s'exécute. Il n'y a donc, sur ce chemin :

- aucune génération de manifeste (l'artefact promu est immuable, il est celui du preview) ;
- aucune attestation `onSuccessRelease`, donc aucune vérification `checkPublishedManifest`
  ni `checkGithubSuccessfulBuild` — **les gates ne sont pas contournés, ils ne sont jamais appelés**.

C'est exactement pourquoi promouvoir le preview serait une publication **non attestée**, et non une
publication « isolée mais valide ».

## 5. Implications demandées par le mandat

| Point | Constat mesuré |
|---|---|
| **contexte production** | inatteignable hors `main` : `netlify-ignore.mjs` annule, et `isProductionDeploy` exige `BRANCH==='main'` |
| **branche cible** | `main` uniquement. Il n'existe aucune branche de production alternative configurée |
| **plugin postpublication** | inactif sur un restore (pas de build) ; actif et **inchangé** sur un build production |
| **secrets** | chemin build : `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (scope build Netlify). Chemin restore : `NETLIFY_AUTH_TOKEN` uniquement |
| **noindex** | **n'est pas un marqueur de preview** : `main--maximusscpi.netlify.app` et le permalien d'un deploy **production** renvoient aussi `x-robots-tag: noindex`. Seul le domaine `maximusscpi.com` en est exempt. Ne jamais l'utiliser comme test d'environnement |
| **rollback** | cible exacte = deploy précédemment publié. Avant toute promotion : `6b093fce31a2c5175aa3378a` / `2f60880e`. Le workflow l'imprime désormais (`ROLLBACK_TARGET=`) |
| **séparation des permissions** | `workflow_dispatch` et `NETLIFY_AUTH_TOKEN` absents de cette VM (401/403 constatés les runs précédents) ; `gh secret list` → 403. Le dépôt est **public** : aucun secret en clair possible |

## 6. Conclusion

**Aucune voie isolée supportée ne peut produire un déploiement production attesté.** Ce n'est pas un
défaut de configuration réparable par un workflow : les trois conditions sont dans le code du dépôt
(`netlify-ignore.mjs`, `release.mjs`) et sur GitHub (`push` sur `main`). Les satisfaire depuis une
branche exigerait de modifier le plugin ou l'ignore — c'est-à-dire de détourner les contrôles, ce que
le mandat interdit explicitement.

**Chemin normal, après validation de la migration :**
1. fusionner #466 (radar) et #468 (accueil) dans `main` ;
2. pousser `main` avec un commit portant `[deploy]` ;
3. laisser le plugin générer le manifeste et attester `onSuccess` (conditions 1-3 satisfaites) ;
4. contrôle post-release : `maximusscpi.com/scpi-release-manifest.json` doit nommer le nouveau SHA
   et le nouveau `deploy_id`, `context=production`.

Rollback à tout moment : restore de `6b093fce31a2c5175aa3378a` (manifeste natif valide, vérifié
ci-dessus), puis contrôle du manifeste servi.
