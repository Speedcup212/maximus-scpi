# Template de cadrage — Pages MaximusSCPI
## UX · SEO · CTA · Conformité CIF

**Date :** 17 mai 2026  
**Agent :** 00 — Superviseur (synthèse) + 01 — SEO + 04 — Conformité CIF  
**Statut :** Référentiel permanent — à consulter avant toute création ou modification de page  
**Périmètre :** Toutes les pages publiques de MaximusSCPI (`/fiscalite-scpi/`, `/rendement-scpi/`, pages sectorielles, articles `/education/`, etc.)

---

## 1. Diagnostic des erreurs constatées sur la première page

Observations issues du travail sur `/fiscalite-scpi/` (mai 2026) — à ne pas reproduire.

### Problèmes visuels / UX
| Problème | Cause | Conséquence |
|----------|-------|-------------|
| Texte fantôme visible derrière les blocs | Fond semi-transparent (`bg-slate-900/70`) dans un conteneur `isolate` + blocs CTA à fond partiellement transparent | Lisibilité dégradée, rendu professionnel compromis |
| Chevauchement hero / CTA | Hero et CTA dans le même conteneur avec `space-y-16` sans séparation visuelle suffisante | Blocs fusionnés visuellement, hiérarchie illisible |
| Marges incohérentes | Alternance de `mb-4`, `mb-6`, `mb-8` sans règle systématique | Rythme visuel chaotique |
| Boutons inaccessibles sur mobile | `w-auto` sans `w-full` sur mobile | CTA coupés ou trop petits sur petits écrans |
| Fond quasi identique hero / CTA | `bg-slate-900` vs `bg-slate-950` — différence imperceptible | Les deux blocs se confondent, pas de respiration visuelle |
| Balises JSX invalides (`motionlessPage`) | Remplacement accidentel de `div` par une balise inexistante | Erreurs TypeScript, page cassée en production |

### Problèmes SEO / structure
| Problème | Impact |
|----------|--------|
| Pas de FAQ schema.org | Pas d'éligibilité aux AI Overviews ni aux rich snippets Google |
| Méta-description non optimisée | CTR organique sous-optimal |
| Maillage interne absent | Autorité thématique non transmise aux pages satellites |
| H2 dans un `<aside>` (CTA) | Confusion de hiérarchie pour les crawlers |

### Problèmes conformité CIF
| Problème | Risque |
|----------|--------|
| Paragraphe CIF gris (`text-slate-400`) dans le bloc CTA | Peu lisible = mentions légales non vues = risque réglementaire |
| Disclaimer présent uniquement en pied de page | Contenu au-dessus non couvert si l'utilisateur ne défile pas |
| CTA "Analyser ma fiscalité SCPI" sans mention du recueil d'informations | Assimilable à une promesse de conseil personnalisé |

---

## 2. Structure type d'une page MaximusSCPI

Ordre des blocs, du haut vers le bas :

```
┌─────────────────────────────────────────────┐
│  HEADER GLOBAL (navigation, logo)           │  ← Composant global — ne pas modifier
├─────────────────────────────────────────────┤
│  BANDEAU CIF (avertissement général)        │  ← Obligatoire sur toutes les pages
├─────────────────────────────────────────────┤
│  BREADCRUMB                                 │  ← Navigation contextuelle
├─────────────────────────────────────────────┤
│  HERO (titre + sous-titre + intro courte)   │  ← Fond opaque solide, séparé visuellement
├─────────────────────────────────────────────┤
│  CTA INTRO (accroche + 2 boutons max)       │  ← Fond distinct du hero, bordure colorée
├─────────────────────────────────────────────┤
│  SOMMAIRE (ancres de navigation)            │  ← Fond opaque, liste simple sans numérotation double
├─────────────────────────────────────────────┤
│  SECTION 1 (contenu pédagogique)            │  ← Fond card, espace suffisant
│  SECTION 2                                  │
│  …                                          │
│  CTA INTERMÉDIAIRE (1 ou 2 par page max)    │  ← Entre les sections, fond distinct
│  …                                          │
│  SECTION N                                  │
├─────────────────────────────────────────────┤
│  BLOC SIMULATEUR ou COMPARATEUR (si présent)│  ← Fond neutre, bien délimité
├─────────────────────────────────────────────┤
│  ARTICLES CONNEXES (maillage interne)       │  ← Grille 2 ou 3 colonnes
├─────────────────────────────────────────────┤
│  CTA FINAL (primaire + secondaire)          │  ← Fort contraste, CTA primaire bien visible
├─────────────────────────────────────────────┤
│  MENTIONS LÉGALES BAS DE PAGE               │  ← Toujours présent, texte xs lisible
├─────────────────────────────────────────────┤
│  FOOTER GLOBAL                              │  ← Composant global — ne pas modifier
└─────────────────────────────────────────────┘
```

### Règles de séparation entre blocs
- Chaque bloc majeur est un conteneur autonome avec `mb-8` minimum.
- Jamais deux blocs au fond identique côte à côte sans séparation visuelle.
- Le hero et le CTA intro sont **toujours deux blocs distincts** — jamais imbriqués dans le même conteneur.

---

## 3. Hiérarchie H1 / H2 / H3 recommandée

### Règles générales
- **1 seul H1 par page** — titre principal de la page, orienté SEO, 50-70 caractères.
- **H2 = titres de sections de contenu** — jamais dans un `<aside>`, un CTA ou une nav.
- **H3 = sous-sections à l'intérieur d'une section H2**.
- Les FAQ utilisent `<h3>` pour chaque question dans la section FAQ, pas `<h2>`.

### Schéma type
```
H1 — Fiscalité des SCPI : comprendre l'imposition de vos revenus
  H2 — 1. Comprendre l'imposition des revenus fonciers issus de SCPI
    H3 — Le régime micro-foncier
    H3 — Le régime réel
  H2 — 2. Les prélèvements sociaux
    H3 — CSG / CRDS
  H2 — 3. Fiscalité des SCPI européennes
  H2 — 4. Optimiser la fiscalité
    H3 — Assurance-vie
    H3 — PER
    H3 — Démembrement
  H2 — 5. Points de vigilance
  H2 — Questions fréquentes (FAQ)
    H3 — Question 1
    H3 — Question 2
```

### Règles de formulation
- H1 : pédagogique, pas de conseil direct. ❌ "Comment payer moins d'impôt" ✅ "Comprendre l'imposition des revenus SCPI"
- H2 : structurant, descriptif. ❌ "Les meilleures SCPI pour défiscaliser" ✅ "Les dispositifs d'optimisation fiscale"
- H3 : précis, sans accroche commerciale.

---

## 4. Règles de marges et espacements

### Espacements verticaux entre blocs majeurs
| Contexte | Classe Tailwind | Valeur |
|----------|----------------|--------|
| Entre deux blocs majeurs (hero, CTA, article, footer) | `mb-8` | 2 rem |
| Entre sections dans un article | `space-y-16` (sur le conteneur article) | 4 rem |
| Entre éléments dans une section | `space-y-6` | 1.5 rem |
| Entre un titre et son contenu | `mt-2` ou `mt-3` | 0.5–0.75 rem |

### Padding interne des blocs
| Type de bloc | Padding recommandé |
|-------------|-------------------|
| Hero | `p-6 md:p-8` |
| CTA intro / CTA intermédiaire | `p-6 md:p-8` |
| Section contenu | `p-6 md:p-8` |
| Encadré info / alerte | `p-5` |
| Tableau | `px-4 py-3.5` par cellule |

### Règles absolues
- Jamais de `mb-4` entre deux blocs visuellement distincts — trop serré.
- Jamais de `margin-top` négatif (`-mt-*`) — crée des chevauchements.
- Jamais de `absolute` ou `fixed` sur les blocs de contenu principal.

---

## 5. Format des blocs pédagogiques

Un bloc pédagogique = une section de contenu informationnel.

### Structure type
```tsx
<section id="slug-ancre" className="scroll-mt-28 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 md:p-8 space-y-6">
  <h2>Titre de la section</h2>
  <p>Introduction courte (2-3 phrases max).</p>

  {/* Sous-section optionnelle */}
  <h3>Sous-titre</h3>
  <p>Contenu.</p>

  {/* Encadré alerte ou info */}
  <div className="rounded-xl border-l-4 border-amber-500 bg-amber-950/50 p-5">
    <p>⚠ Point de vigilance ou source.</p>
  </div>

  {/* Tableau si données */}
  <div className="overflow-x-auto rounded-xl border border-slate-700/50">
    <table>…</table>
  </div>
</section>
```

### Règles de fond
- Fond de section : `bg-slate-800/50` (semi-transparent acceptable ici — sur fond de page sombre solide).
- Encadrés info : `bg-blue-950` + bordure bleue gauche.
- Encadrés alerte : `bg-amber-950/50` + bordure ambre gauche.
- Encadrés risque : `bg-red-950/30` + bordure rouge gauche.

### Règles typographiques dans les sections
- Texte courant : `text-slate-300`
- Titres H2/H3 : `text-slate-100`
- Gras : `text-white`
- Liens internes : `text-blue-400 hover:text-blue-300 underline`
- Source citée : `text-xs text-slate-400`

---

## 6. Format des blocs simulateurs / comparateurs

### Structure type
```tsx
<section className="scroll-mt-28 rounded-2xl border border-slate-700/50 bg-slate-900 p-6 md:p-8 space-y-6">
  <h2>Titre du simulateur</h2>
  <p className="text-slate-300 text-sm">Description courte + disclaimer.</p>

  {/* Zone interactive */}
  <div className="rounded-xl border border-slate-600 bg-slate-950 p-6">
    {/* Contrôles / inputs */}
  </div>

  {/* Résultats */}
  <div className="rounded-xl border border-blue-700/40 bg-blue-950/30 p-5">
    {/* Affichage résultats */}
  </div>

  {/* Disclaimer obligatoire */}
  <p className="text-xs text-slate-400">
    Les résultats sont indicatifs et basés sur les données saisies. 
    Ils ne constituent pas un conseil fiscal ou financier personnalisé.
    Les performances passées ne préjugent pas des performances futures.
  </p>
</section>
```

### Règles spécifiques simulateurs / comparateurs
- Le disclaimer doit être **visible sans défilement** depuis la zone de résultats — le placer directement sous les résultats, pas uniquement en pied de page.
- Aucun résultat chiffré ne doit être présenté comme une projection garantie.
- Le bouton "Affiner avec un conseiller" → modal RDV doit être présent à proximité des résultats.
- Les données SCPI affichées dans le comparateur doivent indiquer leur source et leur date.

---

## 7. Format des CTA principaux et secondaires

### CTA intro (sous le hero)
```tsx
<aside
  aria-label="[Description de l'action]"
  className="mb-8 rounded-2xl border border-blue-700/40 border-l-4 border-l-blue-500 bg-slate-900 p-6 md:p-8 shadow-md"
>
  <div className="space-y-5">
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        [Label contextuel court]
      </p>
      <h2 className="text-xl font-bold text-white md:text-2xl">
        [Question ou accroche]
      </h2>
      <p className="text-sm leading-relaxed text-slate-300 md:text-base">
        [Texte court pédagogique + disclaimer CIF en 1 phrase]
      </p>
    </div>
    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
      {/* Bouton primaire */}
      {/* Bouton secondaire */}
    </div>
  </div>
</aside>
```

**Règles :**
- Fond : `bg-slate-900` (opaque, jamais semi-transparent)
- Bordure colorée gauche : `border-l-4 border-l-blue-500`
- 1 seul `<h2>` dans l'aside — jamais `<h1>`
- Le texte doit inclure une mention CIF courte (1 phrase)
- Pas de `relative z-0` ou `absolute` sur ce bloc

### CTA intermédiaire (entre sections)
Même structure que le CTA intro, mais sans le label "Point de départ" — remplacé par un label contextuel lié à la section précédente.

### CTA final (bas de page)
```tsx
<section className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 md:p-8 space-y-4">
  <p className="text-slate-200 font-semibold text-lg">
    [Accroche forte — sans promesse de rendement]
  </p>
  <p className="text-sm text-slate-400">
    [Mention CIF + ORIAS]
  </p>
  <div className="flex flex-wrap gap-3">
    <button className="[btnPrimaryClass]">Prendre rendez-vous</button>
    <button className="[btnSecondaryClass]">Comparer les SCPI</button>
  </div>
</section>
```

### Boutons — classes de référence
```
Primaire  : bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700
Secondaire: bg-slate-800 text-slate-200 border border-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700
```

### Règles CTA
- Maximum **2 CTA par page** hors CTA final — ne pas disperser les points de conversion.
- Le CTA primaire est toujours le RDV ou le simulateur.
- Le CTA secondaire est toujours le comparateur ou un article éducatif lié.
- Jamais de `<a href="https://calendly.com/...">` direct — passer par `onRdvClick` → modal interne.
- Jamais de lien externe dans un CTA sans attribut `rel="noopener noreferrer"`.

---

## 8. Règles de conformité CIF par type de bloc

### Hero
| Règle | Application |
|-------|-------------|
| H1 sans promesse | ❌ "Payez moins d'impôt" ✅ "Comprendre l'imposition" |
| Sous-titre neutre | Pas de chiffre de rendement dans le sous-titre |
| Pas de SCPI recommandée | Le hero ne cite pas de SCPI spécifique sans source |

### Bandeau CIF (obligatoire en tête de page)
Texte minimal obligatoire :
> "Information générale uniquement. Les informations présentées sont de nature pédagogique et ne constituent pas un conseil en investissement personnalisé. La fiscalité dépend de votre situation individuelle. Consultez un professionnel habilité. Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée."

### Blocs pédagogiques
| Règle | Application |
|-------|-------------|
| Chiffres sourcés | Tout taux ou chiffre doit citer sa source (DIC, ASPIM, bulletin) |
| Disclaimer performances | Toute mention d'un taux de distribution → "donnée historique, non garantie" |
| Pas de conseil personnalisé | "Selon votre situation" ≠ recommandation directe |
| Risques mentionnés | Si performance citée : mentionner perte en capital + revenus non garantis |

### Blocs FAQ (schema.org)
| Règle | Application |
|-------|-------------|
| Réponses pédagogiques | Jamais de réponse du type "il faut choisir la SCPI X" |
| Disclaimer dans la réponse | Chaque réponse se termine par une nuance ou un disclaimer |
| Pas de projection | Pas de "vous pouvez espérer X% de rendement" |

### Blocs CTA
| Règle | Application |
|-------|-------------|
| Texte du bouton | ❌ "Investissez maintenant" ✅ "Analyser ma situation" |
| Texte d'accroche | Inclure "données historiques, non garanties" ou "analyse personnalisée après recueil" |
| Lien RDV | Vers modal interne uniquement — pas de lien Calendly direct |

### Mentions légales bas de page
Texte obligatoire en bas de chaque page :
> "Les informations présentées sur cette page sont de nature pédagogique et générale. Elles ne constituent pas un conseil en investissement ni un conseil fiscal personnalisé au sens de la réglementation CIF/AMF. L'investissement en SCPI présente des risques de perte en capital, des revenus non garantis et une liquidité limitée. Les performances passées ne préjugent pas des performances futures. MaximusSCPI est enregistré à l'ORIAS en qualité de Conseiller en Investissements Financiers."

---

## 9. Checklist responsive mobile / tablette / desktop

### Mobile (< 640px)
- [ ] H1 lisible sans zoom (min `text-2xl`, max `text-3xl`)
- [ ] Boutons CTA en `w-full` — pas de bouton coupé
- [ ] Pas de tableau horizontal débordant (utiliser `overflow-x-auto`)
- [ ] Texte courant min `text-sm` (14px) — jamais `text-xs` pour le contenu principal
- [ ] Padding interne min `p-4` sur les cartes (pas `p-6` sur mobile sans `md:p-8`)
- [ ] Sommaire lisible et cliquable (pas de liste débordant sur les bords)
- [ ] CTA intro : boutons empilés verticalement (`flex-col gap-3`)

### Tablette (640px → 1024px)
- [ ] H1 en `md:text-4xl`
- [ ] Boutons CTA en `sm:flex-row sm:flex-wrap`
- [ ] Grille articles connexes en 2 colonnes (`md:grid-cols-2`)
- [ ] Hero : icône + titre sur la même ligne (flex horizontal)
- [ ] Tableaux : scroll horizontal activé, pas de coupure

### Desktop (> 1024px)
- [ ] Contenu centré (`max-w-5xl mx-auto`)
- [ ] H1 en `md:text-5xl` maximum — pas de titre géant
- [ ] Espacement entre blocs `mb-8` constant
- [ ] Sidebar ou sommaire fixe si page > 2000 mots (à étudier)
- [ ] Pas de fond transparent laissant voir le fond de la page derrière les blocs

### Règles transversales
- [ ] Chaque image a un attribut `alt` descriptif
- [ ] Chaque icône décorative a `aria-hidden`
- [ ] Les boutons ont un `type="button"` explicite
- [ ] Les `<aside>` ont un `aria-label`
- [ ] Les sections navigables ont un `id` + `scroll-mt-28`
- [ ] La couleur de fond de l'`<article>` principal est **toujours opaque** (`bg-slate-900`, jamais `bg-slate-900/70`)

---

## 10. Critères d'acceptation avant modification du site

Ces critères doivent être vérifiés sur le brief **avant** d'écrire `VALIDÉ POUR MODIFICATION DU SITE`.

### Structure et UX
- [ ] La page comporte exactement 1 H1
- [ ] Les H2 sont dans des `<section>` ou `<article>`, jamais dans des `<aside>` ou `<nav>`
- [ ] Le hero et le CTA intro sont des conteneurs indépendants (non imbriqués)
- [ ] Chaque bloc majeur a un fond opaque (pas de transparence sur fond de page)
- [ ] Les boutons sont des `<button type="button">` avec `onClick` → fonction interne (pas de `<a>` vers Calendly)
- [ ] Aucun `motionlessPage`, `relative z-0` non justifié ou `absolute` sur les blocs de contenu

### SEO
- [ ] Titre `<title>` entre 50 et 65 caractères
- [ ] Méta-description entre 140 et 160 caractères
- [ ] Mot-clé principal présent dans le H1 et le titre `<title>`
- [ ] Au moins 3 liens de maillage interne avec ancres conformes
- [ ] FAQ schema.org présente (min 3 questions, max 10)

### Conformité CIF
- [ ] Bandeau d'avertissement CIF en tête de page
- [ ] Aucun chiffre de rendement sans source et sans disclaimer
- [ ] Aucun titre ou accroche assimilable à une promesse de rendement
- [ ] Mention risques SCPI présente (perte en capital, revenus non garantis, liquidité)
- [ ] CTA RDV renvoyant vers modal interne (pas Calendly direct)
- [ ] Mentions légales en pied de page avec référence ORIAS

### Technique
- [ ] Aucune erreur TypeScript / linter sur les fichiers modifiés
- [ ] `npm run build` passant sans erreur
- [ ] Pas de `motionlessPage` ou balise JSX invalide dans le fichier
- [ ] Vérification `git status` avant commit — aucun fichier non prévu dans le diff

---

## Formule de validation humaine

Avant toute modification de `/src`, l'utilisateur doit écrire exactement :

```
VALIDÉ POUR MODIFICATION DU SITE
```

Sans cette phrase, les agents restent en mode brief, analyse et recommandation.

---

*Rapport produit par Agent 00 — Superviseur. Aucun fichier hors de `/agents` n'a été modifié.*
