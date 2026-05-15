# TASK-002C — Correction cannibalisation SEO sectorielle

**Date :** 2026-05-15  
**Agent :** 01-SEO MaximusSCPI + 04-Conformité CIF  
**Statut :** ✅ Terminé — en attente de build et validation finale

---

## 1. Contexte

5 paires de doublons SEO identifiées lors de TASK-002A/002B :

| Doublon (slug à rediriger) | URL gagnante | Type |
|---|---|---|
| `/scpi-bureaux-investissement/` | `/scpi-bureaux/` | SSG → SSG renommée |
| `/scpi-commerces-investissement/` | `/scpi-commerces/` | SSG → SSG renommée |
| `/scpi-sante-investissement/` | `/scpi-sante/` | SSG → SSG renommée |
| `/scpi-france-investissement/` | `/scpi-france/` | SSG → SSG renommée |
| `/scpi-europe/` | `/scpi-europeennes/` | SPA fallback → SSG existante |

**Diagnostic TASK-002C2 :** les 4 slugs courts (`/scpi-bureaux/` etc.) étaient des routes SPA sans contenu propre (fallback vide dans App.tsx). Les pages riches étaient les pages `-investissement`. Option A retenue : déplacer le contenu riche vers les slugs courts.

---

## 2. Fichiers modifiés

| Fichier | Nature de la modification |
|---|---|
| `src/data/thematicLandingPages.ts` | Renommage des 4 clés/slugs + corrections CIF |
| `scripts/generateThematicPages.js` | Remplacement des 4 slugs -investissement par les slugs courts |
| `scripts/generateRedirectsSSG.js` | Ajout de 10 redirections 301 + suppression de 5 routes SPA obsolètes |

---

## 3. Renommages effectués

| Ancienne clé/slug | Nouvelle clé/slug |
|---|---|
| `scpi-bureaux-investissement` | `scpi-bureaux` |
| `scpi-commerces-investissement` | `scpi-commerces` |
| `scpi-sante-investissement` | `scpi-sante` |
| `scpi-france-investissement` | `scpi-france` |

---

## 4. Corrections CIF effectuées (par entrée)

### Communes aux 4 entrées
- **Titles** : remplacement des titres commerciaux `"Investir SCPI ... 2026 | Sélection Personnalisée"` par des titres sobres `"SCPI [secteur] : analyse, comparaison et points de vigilance | MaximusSCPI"`.
- **heroTitleHighlight** : `"Investissez dans..."` → `"Analyser..."`.
- **heroSubtitle** : suppression des chiffres de rendement sectoriel non sourcés.
- **labelText** : `"- Rendements Attractifs"` / `"- Valeur Refuge"` / `"- Valeur Défensive"` → `"- Analyse pédagogique"`.
- **keyMetrics** : `{ value: 'X%', label: 'Rendement moyen' }` → `{ value: 'Variable', label: 'Distribution passée non garantie' }`.
- **informationsPratiques** : `'Rendement moyen : X% à Y%'` → `'Distribution passée : variable selon les SCPI (non garantie)'`.

### Bureaux
- `pourquoiChoisir` feature : `"Rendements moyens de 4% à 6% avec des distributions trimestrielles régulières"` → formulation prudente non-garantie.
- FAQ : remplacement de la mention de rendement moyen fixe par une formulation avec disclaimer.
- Témoignage : suppression de `"distributions sont régulières et conformes aux prévisions"`.

### Commerces
- benefit[0] : `"Rendements supérieurs aux SCPI bureaux"` → `"Diversification sur plusieurs formats de commerce"`.
- `pourquoiChoisir` feature : `"rendements de 5% à 7%"` → formulation prudente.
- FAQ : remplacement des 2 questions sur les rendements par des questions neutres sur la structure des loyers et l'adéquation investisseur.
- Témoignage : suppression de `"Le rendement de 6% est attractif"`.

### Santé
- `pourquoiChoisir` feature : `"Rendements de 4% à 5% avec une très faible volatilité, idéal..."` → formulation prudente avec disclaimer.
- FAQ : `"Les SCPI santé sont-elles plus sûres ?"` → `"moins risquées ?"` + réponse incluant les risques.
- FAQ : `"rendements de 4% à 5% reflètent la stabilité et la sécurité"` → formulation factuelle non-garantie.
- Témoignage : suppression de `"garantissent la pérennité"`.

### France
- `pourquoiChoisir` feature : `"Rendements de 4% à 6% selon les secteurs"` → formulation prudente avec disclaimer.
- FAQ : `"rendements comparables aux SCPI européennes (4% à 6%)"` → suppression du chiffre de rendement, ajout du disclaimer.

---

## 5. Redirections 301 ajoutées

```
/scpi-bureaux-investissement  → /scpi-bureaux/
/scpi-bureaux-investissement/ → /scpi-bureaux/
/scpi-commerces-investissement  → /scpi-commerces/
/scpi-commerces-investissement/ → /scpi-commerces/
/scpi-sante-investissement  → /scpi-sante/
/scpi-sante-investissement/ → /scpi-sante/
/scpi-france-investissement  → /scpi-france/
/scpi-france-investissement/ → /scpi-france/
/scpi-europe  → /scpi-europeennes/
/scpi-europe/ → /scpi-europeennes/
```

---

## 6. Routes SPA supprimées

Les 5 routes `200 SPA` suivantes ont été retirées de `generateRedirectsSSG.js` car les pages sont désormais servies en statique (SSG) :
- `/scpi-bureaux /index.html 200`
- `/scpi-commerces /index.html 200`
- `/scpi-sante /index.html 200`
- `/scpi-france /index.html 200`
- `/scpi-europe /index.html 200`

---

## 7. Build requis

Un `npm run build` est nécessaire pour :
1. Régénérer les pages statiques SSG avec les nouveaux slugs courts.
2. Régénérer `public/_redirects` avec les nouvelles règles 301.
3. Vérifier l'absence d'erreur TypeScript dans `thematicLandingPages.ts`.

**Vérifications post-build recommandées :**
- Confirmer que les dossiers `dist/scpi-bureaux/`, `dist/scpi-commerces/`, `dist/scpi-sante/`, `dist/scpi-france/` ont bien été générés.
- Confirmer l'absence des dossiers `dist/scpi-bureaux-investissement/` etc.
- Vérifier que `public/_redirects` contient bien les 10 lignes 301.
- Tester les redirections après déploiement Netlify.

---

## 8. Commit recommandé

```
Résolution cannibalisation SEO sectorielle TASK-002C
```

**Fichiers à inclure dans le commit :**
- `src/data/thematicLandingPages.ts`
- `scripts/generateThematicPages.js`
- `scripts/generateRedirectsSSG.js`
- `tasks/backlog.md`
- `tasks/in-progress.md`
- `tasks/done.md`
- `agents/reports/TASK-002C-cannibalisation-sectorielle.md`
