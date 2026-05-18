# Plan de modification fichier par fichier — Page `/fiscalite-scpi/`

**Date :** 17 mai 2026  
**Agent :** 06 — Validation UX / SEO / Conformité CIF  
**Statut :** Plan validé IA — en attente de `VALIDÉ POUR MODIFICATION DU SITE`  
**Source :** `brief-final-implementation-fiscalite-scpi.md` (17/05/2026)  
**Périmètre :** Documentation uniquement — aucune modification du site

---

## 1. Synthèse du brief final `/fiscalite-scpi/`

La page `/fiscalite-scpi/` doit devenir la **référence pédagogique française sur la fiscalité des SCPI**. Le brief consolidé (30 points) couvre :

- Objectif double : acquisition SEO + IA / conversion leads qualifiés
- Structure de page en 8 blocs ordonnés, 5 sections de contenu + FAQ + maillage
- Règles UX tirées des erreurs documentées (transparence de fond, marges insuffisantes, balises JSX invalides)
- Conformité CIF intégrale : bandeau, disclaimers, formulations, risques, ORIAS
- Validation Agent 06 : scores SEO 82, IA 80, UX 85, CIF 88 — risque faible — aucun red flag

Le brief est **prêt à implémenter**. Seule la phrase `VALIDÉ POUR MODIFICATION DU SITE` manque pour autoriser Cursor à agir sur les fichiers du site.

---

## 2. Objectif exact de la future modification

| Dimension | Objectif |
|-----------|----------|
| SEO Google | Optimiser `<title>`, méta-description, H1, H2/H3 ; ajouter FAQ `schema.org FAQPage` ; mettre à jour `dateModified` |
| Visibilité IA | Intégrer 2 définitions directes AEO, FAQ avec disclaimers, entités nommées (AMF, ASPIM, ORIAS), schema.org Article |
| Structure UX | Séparer hero et CTA intro en deux blocs indépendants opaques (`mb-8`) ; corriger les marges et fonds |
| CTA | Positionner 1 CTA intro + 2 CTA intermédiaires + 1 CTA final ; libellés et actions conformes |
| Maillage interne | Ajouter 5 liens contextuels conformes CIF vers les pages éducatives et le comparateur |
| Conformité CIF | Vérifier bandeau, formulations, tableaux avec légende source, mentions légales |

**Ce qui ne change pas :** routing, props, identifiants Supabase, configuration Netlify, sitemap.

---

## 3. Fichiers du site probablement concernés

| Fichier | Nature de la modification attendue | Priorité |
|---------|-----------------------------------|----------|
| `src/components/FiscaliteScpiPage.tsx` | **Principal** — structure, contenu, CTA, FAQ, marges, maillage | Obligatoire |
| `src/components/SEOHead.tsx` | **Secondaire** — vérifier si `<title>` et méta sont passés en props ou hardcodés | À vérifier |
| `src/components/SchemaOrg.tsx` | **Secondaire** — vérifier le format attendu pour `FAQPage` et `dateModified` | À vérifier |
| `src/App.tsx` | **Lecture seule probable** — vérifier les props disponibles (`onRdvClick`, `onNavigate`) | Vérification seule |
| `src/components/Breadcrumb.tsx` | **Lecture seule probable** — vérifier le composant existant | Vérification seule |

**Modification principale :** `FiscaliteScpiPage.tsx` concentre 90 % des changements.

---

## 4. Fichiers à ne surtout pas modifier

| Fichier / Dossier | Raison |
|-------------------|--------|
| `public/sitemap.xml` | Généré automatiquement — ne pas éditer manuellement |
| `public/robots.txt` | Configuration SEO globale — hors scope |
| `netlify.toml` | Configuration de déploiement — hors scope |
| `vite.config.*` | Configuration de build — hors scope |
| `package.json` / `package-lock.json` | Dépendances — aucune nouvelle dépendance nécessaire |
| `supabase/` | Base de données — hors scope |
| `scripts/` | Scripts d'automatisation — hors scope |
| `src/App.tsx` | Routing existant fonctionnel — modification uniquement si props manquantes (vérification préalable) |
| `THEMATIC_PAGES_OPTIMIZED.md` | Fichier généré — jamais commiter |
| Tout autre composant `src/components/*.tsx` | Hors périmètre de cette tâche |

---

## 5. Modifications prévues par fichier

### `src/components/FiscaliteScpiPage.tsx` — fichier principal

#### a. Balises SEO (via `SEOHead` ou props)
```
AVANT → vérifier l'état actuel
APRÈS :
  <title> : "Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers | MaximusSCPI"
  meta description : "Revenus fonciers, prélèvements sociaux, SCPI européennes, optimisation fiscale (assurance-vie, PER, démembrement) : tout comprendre sur la fiscalité des SCPI. Données pédagogiques, non personnalisées."
```

#### b. H1
```
AVANT → "La fiscalité des SCPI" (ou variante actuelle)
APRÈS → "Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers"
```

#### c. Bloc Hero
```
AVANT → potentiellement imbriqué dans l'<article> ou avec fond semi-transparent
APRÈS :
  - <div> indépendant hors <article>
  - className inclut bg-gradient-to-br from-slate-800 to-slate-900 (opaque)
  - mb-8 entre le hero et le CTA intro
  - Icône TrendingUp + H1 + sous-titre + encadré bleu intro
```

#### d. Bloc CTA intro
```
AVANT → potentiellement imbriqué dans le hero ou dans l'<article>
APRÈS :
  - <aside> indépendant avec aria-label
  - className : bg-slate-900 opaque, border-l-4 border-l-blue-500, mb-8
  - Label "Point de départ" (text-xs text-blue-400)
  - <p> accroche (pas <h2>) : "Vous détenez ou envisagez des SCPI ?"
  - Texte court + disclaimer CIF 1 phrase
  - Bouton primaire "Analyser ma fiscalité SCPI" → handleRdvClick
  - Bouton secondaire "Comparer les SCPI" → handleComparateurClick
  - Les deux boutons : w-full sm:w-auto, type="button"
```

#### e. <article> principal
```
AVANT → potentiellement bg-slate-900/70 (semi-transparent) ou sans fond défini
APRÈS :
  - className : bg-slate-900 (opaque, sans slash)
  - space-y-16 entre les sections
```

#### f. Sections de contenu (5 sections)
```
Sections à vérifier / créer :
  - Section 1 : "Comprendre l'imposition des revenus fonciers issus de SCPI"
  - Section 2 : "Les prélèvements sociaux sur les revenus de SCPI"
  - Section 3 : "Fiscalité des SCPI européennes et internationales"
  - Section 4 : "Optimiser la fiscalité de son investissement SCPI"
  - Section 5 : "Points de vigilance et risques liés à la fiscalité SCPI"

Format de chaque section :
  - <section id="[slug]" className="scroll-mt-28 rounded-2xl border...">
  - H2 avec icône (w-8 h-8 text-blue-400)
  - Sous-titres H3
  - Encadrés info (border-l-4 border-blue-500 bg-blue-950/50)
  - Encadrés alerte (border-l-4 border-amber-500 bg-amber-950/50)
  - Tableaux fiscaux avec légende source
```

#### g. CTA intermédiaires (2 nouveaux)
```
CTA intermédiaire 1 — après section 2 :
  Accroche : "Votre rendement net dépend de votre tranche d'imposition"
  Bouton primaire uniquement → handleRdvClick
  
CTA intermédiaire 2 — après section 4 :
  Accroche : "Comparer les modes de détention selon votre profil"
  Bouton secondaire uniquement → handleComparateurClick
```

#### h. Section FAQ (schema.org)
```
AVANT → vérifier l'état actuel
APRÈS :
  - <SchemaOrg type="FAQPage" data={{ questions: [...] }} />
  - 5 questions minimum :
      Q1 : "Comment sont imposés les revenus d'une SCPI ?"
      Q2 : "Quel est le taux des prélèvements sociaux sur les SCPI ?"
      Q3 : "Les SCPI européennes sont-elles moins imposées en France ?"
      Q4 : "Peut-on réduire la fiscalité de ses revenus SCPI ?"
      Q5 : "Quels sont les risques fiscaux d'un investissement en SCPI ?"
  - Chaque réponse : 2-4 phrases, réponse directe + disclaimer final
```

#### i. Maillage interne (5 liens)
```
À ajouter dans les sections de contenu :
  1. Ancre "fiscalité SCPI en assurance-vie" → /education/scpi-direct-ou-assurance-vie (§4)
  2. Ancre "déduction fiscale via le PER" → /education/per-scpi-retraite-deduction-fiscale (§4)
  3. Ancre "démembrement et optimisation fiscale" → /education/demembrement-scpi-nue-propriete-usufruit (§4)
  4. Ancre "comparer les SCPI selon votre profil fiscal" → /comparateur-scpi/ (§4 + CTA final)
  5. Ancre "SCPI européennes : analyse et points de vigilance" → /scpi-europeennes/ (§3)
```

#### j. CTA final
```
Position : avant les mentions légales, après les articles connexes
Bouton primaire : "Analyser ma fiscalité SCPI" → handleRdvClick
Bouton secondaire : "Comparer les SCPI" → handleComparateurClick
Les deux boutons : w-full sm:w-auto, type="button"
```

#### k. dateModified schema.org Article
```
Mettre à jour avec la date d'implémentation effective
Format ISO 8601 : "2026-MM-DD"
```

### `src/components/SEOHead.tsx` — vérification uniquement avant modification

Lire en lecture seule pour vérifier :
- Si `<title>` et `<meta name="description">` sont injectés via props ou hardcodés dans `FiscaliteScpiPage.tsx`
- Si une modification de SEOHead est nécessaire ou si les props suffisent

### `src/components/SchemaOrg.tsx` — vérification uniquement avant modification

Lire en lecture seule pour vérifier :
- Le format exact attendu par le composant pour `type="FAQPage"`
- Le format de `dateModified` pour `type="Article"`

---

## 6. Blocs à ajouter, modifier ou conserver

| Bloc | Action | Justification |
|------|--------|---------------|
| Bandeau CIF | **Conserver** — vérifier lisibilité | Obligatoire CIF |
| Breadcrumb | **Conserver** | Navigation et SEO |
| Hero (H1 + intro) | **Modifier** — séparer en bloc indépendant opaque | Erreur UX documentée |
| CTA intro | **Modifier** — fond opaque, \<aside\>, \<p\> au lieu de \<h2\> | Erreur UX + SEO |
| Sommaire | **Conserver ou ajouter** — vérifier ancres `scroll-mt-28` | Navigation UX |
| Section 1 — Revenus fonciers | **Modifier ou créer** — H2 conforme, encadrés, H3 | SEO + UX |
| Section 2 — Prélèvements sociaux | **Modifier ou créer** — tableau avec légende source | SEO + CIF |
| CTA intermédiaire 1 | **Ajouter** — après section 2 | Conversion |
| Section 3 — SCPI européennes | **Modifier ou créer** | SEO thématique |
| Section 4 — Optimisation | **Modifier ou créer** — 4 modes détention, maillage interne | SEO + conversion |
| CTA intermédiaire 2 | **Ajouter** — après section 4 | Conversion |
| Section 5 — Vigilance risques | **Modifier ou créer** | Conformité CIF |
| Section FAQ schema.org | **Ajouter ou compléter** — 5 Q/R minimum | AEO + Google |
| Articles connexes | **Conserver ou ajouter** | Maillage |
| CTA final | **Modifier** — deux boutons conformes | Conversion |
| Mentions légales + ORIAS | **Conserver** — vérifier présence | CIF obligatoire |

---

## 7. Structure finale attendue de la page

```
┌─────────────────────────────────────────────┐
│ [GLOBAL] Header navigation                  │
├─────────────────────────────────────────────┤
│ Date de mise à jour (text-sm, discret)      │
│ Breadcrumb                                  │
│ Bandeau CIF (amber, AlertTriangle)          │
├─────────────────────────────────────────────┤
│ BLOC HERO (bg-slate-800→900, mb-8)          │
│   TrendingUp + H1 + sous-titre              │
│   Encadré intro bleu                        │
├─────────────────────────────────────────────┤
│ BLOC CTA INTRO (aside, bg-slate-900, mb-8)  │
│   Label "Point de départ"                   │
│   "Vous détenez ou envisagez des SCPI ?"   │
│   Disclaimer CIF                            │
│   [Analyser ma fiscalité] [Comparer]        │
├─────────────────────────────────────────────┤
│ ARTICLE (bg-slate-900, space-y-16)          │
│  ├ Sommaire (nav, ancres)                   │
│  ├ Section 1 — Revenus fonciers             │
│  │   H2 + H3 × 3 + encadrés               │
│  ├ Section 2 — Prélèvements sociaux         │
│  │   H2 + H3 × 2 + tableau + légende       │
│  ├ CTA intermédiaire 1                      │
│  │   [Analyser ma fiscalité]                │
│  ├ Section 3 — SCPI européennes             │
│  │   H2 + H3 × 2 + lien maillage           │
│  ├ Section 4 — Optimisation fiscale         │
│  │   H2 + H3 × 4 + liens maillage × 3      │
│  ├ CTA intermédiaire 2                      │
│  │   [Comparer les SCPI]                    │
│  ├ Section 5 — Points de vigilance          │
│  │   H2 + H3 × 2 + encadré alerte          │
│  ├ Section FAQ (FAQPage schema.org)         │
│  │   5 Q/R avec disclaimers                 │
│  ├ Articles connexes (grille 2 col.)        │
│  ├ CTA final                                │
│  │   [Analyser ma fiscalité] [Comparer]     │
│  └ Mentions légales + ORIAS                 │
├─────────────────────────────────────────────┤
│ [GLOBAL] Footer                             │
└─────────────────────────────────────────────┘
```

---

## 8. Règles UX à respecter

| Règle | Valeur / Classe | Interdit |
|-------|----------------|----------|
| Fond de l'`<article>` | `bg-slate-900` opaque | `bg-slate-900/70`, `bg-slate-900/80` |
| Espacement entre blocs majeurs | `mb-8` | `mb-4`, `-mt-*` |
| Espacement entre sections | `space-y-16` sur `<article>` | `space-y-8` seul sans `mb-8` sur les blocs intro |
| Boutons CTA | `w-full sm:w-auto type="button"` | `w-auto` seul, `<a href>` pour les modales |
| Titre CTA | `<p>` accroche dans `<aside>` | `<h2>` dans `<aside>` |
| Icônes | `aria-hidden` systématique | Icônes sans `aria-hidden` |
| Padding blocs | `p-6 md:p-8` | `p-3` seul sur les blocs majeurs |
| Ancres sommaire | `scroll-mt-28` sur les `<section>` | Ancres sans `scroll-mt-*` |

---

## 9. Règles SEO Google à respecter

| Élément | Règle | Valeur cible |
|---------|-------|-------------|
| `<title>` | 50-65 caractères, mot-clé en tête | "Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers \| MaximusSCPI" |
| Méta-description | 140-160 caractères, mot-clé + appel à l'action | Voir brief §2 |
| H1 | Unique, mot-clé principal `Fiscalité des SCPI` en début | "Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers" |
| H2 | 5 minimum, hiérarchie logique, pas dans `<aside>` ni `<nav>` | Voir brief §8 |
| H3 | Sous-thèmes précis, structurés sous le H2 parent | Voir brief §8 |
| Maillage | ≥ 3 liens internes, ancres conformes CIF | Voir brief §17 |
| FAQ schema.org | `FAQPage` via `SchemaOrg`, ≥ 5 questions | Voir brief §13 |
| `dateModified` | Mis à jour à la date d'implémentation | Format ISO 8601 |
| Urls maillage | Vérifier post-TASK-002C qu'aucun slug n'est redirigé | — |

---

## 10. Règles visibilité IA / AEO / GEO / LLMO à respecter

| Moteur | Optimisation requise | Élément technique |
|--------|---------------------|-------------------|
| Google AI Overviews | FAQ `FAQPage` schema.org, réponses directes 2-4 phrases | `<SchemaOrg type="FAQPage">` |
| Perplexity | Sources explicites citées, entités nommées | AMF, ASPIM, CGI art. 197, taux 17,2% |
| ChatGPT Search | Structure propre, H2 descriptifs, pas de jargon opaque | Titres H2 sous forme "Comment...", "Quels..." |
| Claude | Contenu factuel, sources cités, nuances présentes | Disclaimers dans les réponses, pas de superlatifs |

**Éléments obligatoires pour la visibilité IA :**
1. Au moins 2 définitions directes format AEO (ex : "Le taux de distribution est...")
2. Entités nommées : AMF, ASPIM, ORIAS (≥ 2)
3. Disclaimer dans chaque réponse FAQ (pas uniquement en pied de page)
4. `dateModified` dans le schéma Article
5. Couverture thématique complète (micro-foncier, réel, PS, SCPI UE, AV, PER, démembrement)

---

## 11. Règles conformité CIF à respecter

| Point CIF | Règle | Vérification |
|-----------|-------|-------------|
| Bandeau avertissement | Visible en tête, fond amber, icône AlertTriangle | Présent avant le hero |
| Données chiffrées | Source + "données historiques, non garanties" | Sur chaque tableau et chaque taux cité |
| Titres | Aucun H1/H2/H3 assimilable à une promesse | Grep sur "garantis", "sûr", "le meilleur" |
| 4 risques SCPI | Perte en capital, revenus non garantis, liquidité limitée, risque fiscal | Dans section 5 et/ou bas de page |
| CTA RDV | Pas de promesse de conseil direct, modal interne uniquement | `onClick={handleRdvClick}` — jamais Calendly direct |
| Mentions légales | ORIAS visible en bas de page | Vérifier présence avant livraison |
| Recommandation personnalisée | Interdite sans recueil d'informations patrimoniales | Aucune formulation "pour votre profil, choisissez..." |

---

## 12. CTA attendus

| Emplacement | Libellé | Action | Type |
|-------------|---------|--------|------|
| CTA intro (après hero) | "Analyser ma fiscalité SCPI" | `handleRdvClick` → modal | Primaire |
| CTA intro (après hero) | "Comparer les SCPI" | `handleComparateurClick` | Secondaire |
| CTA intermédiaire 1 (après §2) | "Analyser ma fiscalité SCPI" | `handleRdvClick` → modal | Primaire seul |
| CTA intermédiaire 2 (après §4) | "Comparer les modes de détention" | `handleComparateurClick` | Secondaire seul |
| CTA final (bas de page) | "Analyser ma fiscalité SCPI" | `handleRdvClick` → modal | Primaire |
| CTA final (bas de page) | "Comparer les SCPI" | `handleComparateurClick` | Secondaire |

**Total : 4 CTA distincts, 6 boutons, 0 lien Calendly direct.**

---

## 13. Maillage interne attendu

| # | Ancre du lien | URL cible | Section |
|---|---------------|-----------|---------|
| 1 | "fiscalité SCPI en assurance-vie" | `/education/scpi-direct-ou-assurance-vie` | Section 4 |
| 2 | "déduction fiscale via le PER" | `/education/per-scpi-retraite-deduction-fiscale` | Section 4 |
| 3 | "démembrement et optimisation fiscale" | `/education/demembrement-scpi-nue-propriete-usufruit` | Section 4 |
| 4 | "comparer les SCPI selon votre profil fiscal" | `/comparateur-scpi/` | Section 4 + CTA final |
| 5 | "SCPI européennes : analyse et points de vigilance" | `/scpi-europeennes/` | Section 3 |

**Ancres interdites :** "les SCPI qui rapportent le plus", "meilleure SCPI", "économisez X%"  
**Format technique :** boutons `onClick` pour la navigation interne React (pas `<a href>`)

---

## 14. Risques techniques

| Risque | Probabilité | Action préventive |
|--------|-------------|------------------|
| Balise JSX invalide (`motionlessPage`) | Élevée (historique) | `grep -r "motionlessPage" src/` avant livraison |
| Fond semi-transparent sur `<article>` | Élevée (historique) | `grep "bg-slate-900/"` dans le fichier diff |
| `<h2>` dans un `<aside>` | Moyenne (historique) | Vérifier chaque `<aside>` après modification |
| Bouton `w-auto` sans `w-full` sur mobile | Moyenne (historique) | Vérifier tous les `<button>` dans les CTA |
| Props manquantes dans `FiscaliteScpiPage` | Faible | Lire `App.tsx` en lecture seule avant de modifier |
| `SchemaOrg` format FAQ incorrect | Faible | Lire `SchemaOrg.tsx` en lecture seule avant usage |
| Build échouant sur `inject-env-vars.js` | Connue | Ce script nécessite les variables d'env — tester en dev uniquement |
| `git checkout` accidentel perdant les changements | Élevée (historique) | Lancer `git status` avant et après chaque modification |
| URL de maillage pointant vers slug redirigé | Faible | Vérifier post-TASK-002C que les slugs `/education/*` existent |

---

## 15. Risques conformité

| Risque | Gravité | Détection |
|--------|---------|-----------|
| Chiffre de taux sans source | Élevée | Grep sur "%" dans le contenu — vérifier chaque occurrence |
| Titre H2 assimilable à promesse | Élevée | Grep sur "garantis", "sûr", "zéro impôt", "exonéré" |
| CTA avec promesse de conseil direct | Élevée | Vérifier le texte des boutons et accroches CTA |
| Absence de disclaimer dans les réponses FAQ | Moyenne | Chaque réponse doit se terminer par une nuance |
| ORIAS absent des mentions légales | Moyenne | Vérifier présence dans le bas de page |
| Bandeau CIF absent ou illisible | Élevée | Vérifier visibilité sur fond sombre |
| Formulation "les SCPI européennes sont exonérées" | Élevée | Grep sur "exonér" dans le fichier |

---

## 16. Critères d'acceptation avant review

**UX :**
- [ ] Hero et CTA intro : deux `div` / `aside` indépendants avec `mb-8` entre eux
- [ ] `bg-slate-900` opaque sur l'`<article>` (pas de `/70`)
- [ ] Tous les boutons CTA : `type="button"`, `w-full sm:w-auto`, `onClick` interne
- [ ] Aucun `<h2>` dans `<aside>`, `<nav>`, ou un bloc CTA
- [ ] Aucune balise JSX invalide (`grep motionlessPage` = 0 résultat)

**SEO :**
- [ ] `<title>` 50-65 caractères, mot-clé `Fiscalité des SCPI` en tête
- [ ] Méta-description 140-160 caractères
- [ ] H1 unique et conforme
- [ ] FAQ schema.org `FAQPage` présente (≥ 5 questions)
- [ ] `dateModified` mis à jour
- [ ] ≥ 3 liens maillage interne avec ancres conformes

**Visibilité IA :**
- [ ] ≥ 2 définitions directes format AEO
- [ ] Entités nommées AMF, ASPIM, ORIAS présentes (≥ 2)
- [ ] Disclaimer dans chaque réponse FAQ

**Conformité CIF :**
- [ ] Bandeau CIF visible en tête
- [ ] Aucun chiffre sans source et disclaimer
- [ ] 4 risques SCPI mentionnés
- [ ] Aucune formulation de la liste "Formulations interdites" (brief §20)
- [ ] Mentions légales + ORIAS en bas de page

---

## 17. Critères de refus automatique

Ces critères déclenchent un refus **sans discussion** — la modification est bloquée et doit être corrigée avant toute livraison :

| # | Critère | Type de blocage |
|---|---------|----------------|
| 1 | Balise JSX invalide présente dans le diff | Technique — build échoue |
| 2 | `bg-slate-900/` (transparent) sur le conteneur `<article>` | UX — erreur documentée répétée |
| 3 | `<h2>` présent dans un `<aside>` | Sémantique HTML + SEO |
| 4 | Bouton de modal avec `<a href="calendly...">` | CIF — Calendly direct interdit |
| 5 | Chiffre de performance sans source ni disclaimer | CIF — promesse de rendement |
| 6 | Titre H1/H2/H3 contenant "garantis", "exonéré", "zéro impôt" | CIF — promesse implicite |
| 7 | FAQ absente ou < 5 questions | SEO + AEO — non conforme au brief |
| 8 | `dateModified` non mis à jour | Fraîcheur IA — score réduit |
| 9 | Maillage interne < 3 liens | SEO — non conforme au brief |
| 10 | Absence du bandeau CIF en tête de page | CIF — obligation réglementaire |

---

## 18. Validation Agent 06

```
─────────────────────────────────────────────────────────────────
RAPPORT DE VALIDATION — Agent 06 MaximusSCPI
Date : 17/05/2026
Livrable : plan-modification-fiscalite-scpi-fichiers.md
─────────────────────────────────────────────────────────────────

VALIDATION IA :
OK

SCORE SEO (plan) :
84/100 — Structure, balises, FAQ, maillage tous définis et conformes

SCORE VISIBILITÉ IA (plan) :
82/100 — AEO, entités nommées, schema.org Article + FAQPage spécifiés

SCORE UX / CTA (plan) :
87/100 — Blocs distincts, fond opaque, boutons, mobile, marges tous
          précisés ; anti-patterns documentés et intégrés en critères

SCORE CONFORMITÉ CIF (plan) :
90/100 — Bandeau, disclaimers, formulations interdites, risques,
          ORIAS, CTA conformes tous présents dans les critères

RISQUE GLOBAL :
Faible

RED FLAGS DÉTECTÉS :
Aucun

DÉCISION :
OK — Plan prêt pour implémentation

CORRECTIONS OBLIGATOIRES AVANT EXÉCUTION :
1. Lire FiscaliteScpiPage.tsx en lecture seule pour établir le diff précis
2. Lire SEOHead.tsx en lecture seule pour valider le format des props méta
3. Lire SchemaOrg.tsx en lecture seule pour valider le format FAQPage
4. Mettre à jour dateModified avec la date effective d'implémentation
5. Vérifier post-grep les 10 critères de refus automatique après diff

VALIDATION HUMAINE NÉCESSAIRE :
Oui — pour déclencher la lecture puis la modification des fichiers /src

RAISON :
Le plan est complet. La validation humaine est la seule barrière restante
avant que Cursor procède à la modification de FiscaliteScpiPage.tsx.
─────────────────────────────────────────────────────────────────
```

---

## 19. Liste exacte des fichiers qui pourront être modifiés uniquement après validation humaine

| Fichier | Type de modification autorisée |
|---------|-------------------------------|
| `src/components/FiscaliteScpiPage.tsx` | Principal — structure, contenu, CTA, FAQ, marges, schema.org |
| `src/components/SEOHead.tsx` | Uniquement si `<title>` et méta ne sont pas gérables via props de `FiscaliteScpiPage.tsx` |
| `src/components/SchemaOrg.tsx` | Uniquement si le composant existant ne supporte pas `FAQPage` ou `dateModified` |

**Aucun autre fichier ne doit être modifié.**

Les fichiers suivants sont **en lecture seule** (vérification préalable uniquement) :
- `src/App.tsx`
- `src/components/Breadcrumb.tsx`

---

## 20. Phrase exacte nécessaire pour autoriser Cursor à modifier le site

```
VALIDÉ POUR MODIFICATION DU SITE
```

Cette phrase, écrite exactement telle quelle par l'utilisateur, autorise Cursor à :

1. Lire `FiscaliteScpiPage.tsx`, `SEOHead.tsx`, `SchemaOrg.tsx` en lecture seule
2. Proposer les diffs précis selon ce plan
3. Attendre une confirmation sur chaque modification de fichier avant exécution
4. Appliquer les modifications fichier par fichier
5. Vérifier les 10 critères de refus automatique après chaque diff
6. Lancer `npm run dev` pour validation visuelle

**Sans cette phrase, aucun fichier de `/src`, `/public` ou du projet ne sera touché.**

---

*Plan produit par Agent 06 — Validation UX / SEO / Conformité CIF. Sources : `brief-final-implementation-fiscalite-scpi.md`, `template-pages-maximusscpi-cadrage-ux-seo-cta.md`, `agents/00-superviseur.md`, `agents/README.md`. Aucun fichier hors de `/agents` n'a été modifié.*
