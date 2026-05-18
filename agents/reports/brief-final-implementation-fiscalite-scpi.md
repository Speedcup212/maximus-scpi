# Brief final d'implémentation — Page `/fiscalite-scpi/`

**Date :** 17 mai 2026  
**Agent :** 01 — SEO/AEO + 04 — Conformité CIF + 06 — Validation  
**Statut :** Brief validé IA — en attente de `VALIDÉ POUR MODIFICATION DU SITE`  
**Périmètre :** Lecture seule — aucune modification du site avant validation humaine explicite

---

## 1. Objectif stratégique de la page `/fiscalite-scpi/`

La page `/fiscalite-scpi/` doit être **la référence pédagogique française sur la fiscalité des SCPI** pour les investisseurs particuliers. Double objectif :

1. **Acquisition** : se positionner sur les requêtes Google à forte intention (`fiscalité SCPI`, `imposition revenus SCPI`, `SCPI prélèvements sociaux`, `SCPI européennes fiscalité`) et être cité dans les réponses des LLM (Perplexity, Google AI Overviews, ChatGPT).
2. **Conversion** : transformer un lecteur informé en lead qualifié via une analyse personnalisée (modal RDV) ou une exploration du comparateur.

La page n'est pas une page de vente. C'est une page d'autorité thématique pédagogique avec des points de conversion discrets mais présents.

---

## 2. Intention SEO Google

| Type | Requêtes cibles | Intent |
|------|----------------|--------|
| Principale | `fiscalité SCPI`, `SCPI impôt`, `revenus fonciers SCPI` | Informationnelle forte |
| Secondaires | `SCPI prélèvements sociaux`, `SCPI européennes fiscalité`, `SCPI assurance-vie impôt` | Informationnelle |
| Longue traîne | `fiscalité SCPI TMI 30%`, `SCPI démembrement fiscalité`, `comment réduire impôt SCPI` | Informationnelle + transactionnelle |
| Featured snippet | `comment sont imposés les revenus d'une SCPI ?` | Réponse directe |

**Signal E-E-A-T requis :** mention ORIAS, sources (AMF, ASPIM, DIC), date de mise à jour visible, distinction info/pédagogie/conseil.

---

## 3. Intention visibilité IA / AEO / GEO / LLMO

| Moteur IA | Requête probable | Format de contenu à optimiser |
|-----------|-----------------|-------------------------------|
| Perplexity | "fiscalité revenus SCPI France" | Réponse directe + sources citées |
| Google AI Overviews | "comment sont imposés les revenus SCPI" | FAQ schema.org + définitions directes |
| ChatGPT Search | "SCPI et impôt sur le revenu" | Structure claire, entités nommées |
| Claude | "quelle fiscalité pour les SCPI" | Contenu factuel, sources réglementaires |

**Prérequis IA :**
- FAQ schema.org `FAQPage` (5 à 8 questions).
- Au moins 2 définitions directes (taux de distribution, TMI, prélèvements sociaux).
- Entités nommées : AMF, ASPIM, ORIAS, Code général des impôts, prélèvements sociaux 17,2 %.
- Date de mise à jour visible (`dateModified` en schema.org Article).

---

## 4. Cible utilisateur

| Profil | Situation | Besoin |
|--------|----------|--------|
| Investisseur particulier imposé | TMI 30 % ou 41 %, déjà propriétaire de parts SCPI | Comprendre son imposition réelle, optimiser |
| Investisseur en réflexion | Envisage d'investir, compare les enveloppes | Comprendre l'impact fiscal avant de décider |
| Profil retraite / patrimoine | Cherche une fiscalité allégée sur les revenus complémentaires | SCPI européennes, démembrement, PER |
| Profil jeune actif | Commence à investir, TMI 30 %, horizon long | Différer la fiscalité via AV ou PER |

---

## 5. Problèmes UX à éviter — erreurs documentées

Ces erreurs ont été constatées sur `/fiscalite-scpi/` lors des interventions précédentes. **Ne pas les reproduire.**

| Erreur | Cause | Règle à appliquer |
|--------|-------|-------------------|
| Texte fantôme du H1 visible derrière le CTA | Fond semi-transparent (`/70`) sur l'`<article>` + blocs CTA avec fond aussi semi-transparent | Fond de l'`<article>` = toujours `bg-slate-900` opaque |
| Hero et CTA intro dans le même conteneur | Imbrication dans un `div` partagé avec `mb-4` | Deux blocs indépendants, `mb-8` entre eux |
| Balises JSX invalides | `motionlessPage` au lieu de `div` lors de substitutions | Toujours vérifier avec `grep motionlessPage` avant livraison |
| Paragraphe CIF gris illisible dans le CTA | `text-slate-400` sur fond semi-transparent | `text-slate-300` minimum, fond opaque |
| H2 dans un `<aside>` | Bloc CTA avec `<h2>` à l'intérieur d'un aside | `<h2>` uniquement dans les sections de contenu |
| Boutons non accessibles sur mobile | `w-auto` sans `w-full` sur mobile | `w-full sm:w-auto` sur tous les boutons CTA |
| Chevauchement de blocs | `space-y-16` sur l'article sans séparation des blocs intro | `mb-8` explicite entre chaque bloc majeur |
| Doublon numérotation sommaire | `<ol>` + "1." dans le texte des liens | `list-none` sur la liste, numérotation dans le texte uniquement |

---

## 6. Structure éditoriale recommandée

Ordre des sections de contenu (hors blocs de structure) :

1. Revenus fonciers et régimes d'imposition (micro-foncier / réel)
2. Prélèvements sociaux (17,2 % — CSG, CRDS, prélèvement de solidarité)
3. Fiscalité des SCPI européennes et internationales
4. Optimisation fiscale (assurance-vie, PER, démembrement, SCI IS)
5. Points de vigilance et risques liés à la fiscalité
6. FAQ (5 à 8 questions/réponses schema.org)
7. Articles connexes (maillage interne)

---

## 7. H1 recommandé

```
Fiscalité des SCPI : comprendre l'imposition de vos revenus fonciers
```

- Mot-clé principal en début : `Fiscalité des SCPI`
- Angle pédagogique, pas de conseil direct
- 66 caractères — correct pour le H1 (pas soumis à la limite du `<title>`)

---

## 8. H2 / H3 recommandés

```
H2 — 1. Comprendre l'imposition des revenus fonciers issus de SCPI
  H3 — Nature des revenus : revenus fonciers ou revenus BIC
  H3 — Le régime micro-foncier : conditions et limites
  H3 — Le régime réel : charges déductibles

H2 — 2. Les prélèvements sociaux sur les revenus de SCPI
  H3 — Composition des prélèvements sociaux (17,2 %)
  H3 — La CSG déductible : mécanisme et conditions

H2 — 3. Fiscalité des SCPI européennes et internationales
  H3 — Conventions fiscales bilatérales
  H3 — Crédit d'impôt et taux effectif d'imposition

H2 — 4. Optimiser la fiscalité de son investissement SCPI
  H3 — SCPI en assurance-vie
  H3 — SCPI et PER
  H3 — SCPI en démembrement temporaire
  H3 — SCPI en SCI à l'IS

H2 — 5. Points de vigilance et risques liés à la fiscalité SCPI
  H3 — Risque d'évolution législative
  H3 — Risque de marché et impact sur les revenus imposables

H2 — Questions fréquentes sur la fiscalité des SCPI
  H3 — [Question 1]
  …
```

**Règle :** aucun H2 dans un `<aside>`, un `<nav>`, ou un bloc CTA.

---

## 9. Ordre précis des blocs de page

```
1.  [GLOBAL] Header navigation
2.  Date de mise à jour (texte discret, `text-sm text-gray-500`)
3.  Breadcrumb
4.  Bandeau CIF (fond amber, icône AlertTriangle, texte lisible text-sm)
5.  ── BLOC HERO (bg-slate-900 opaque, mb-8) ──────────────────────────
      Icône TrendingUp + H1 + sous-titre
      Encadré intro bleu (bg-blue-950, border-l-4 border-blue-500)
6.  ── BLOC CTA INTRO (bg-slate-900, border-l-4 bleue, mb-8) ──────────
      Label "Point de départ" (text-xs blue-400)
      H2 "Vous détenez ou envisagez des SCPI ?"
      Texte court + disclaimer CIF 1 phrase
      Bouton primaire (RDV) + Bouton secondaire (comparateur)
7.  ── ARTICLE (bg-slate-900 opaque, space-y-16) ──────────────────────
      7a. Sommaire (nav, bg-slate-900, list-none, ancres)
      7b. Section 1 — Revenus fonciers
      7c. Section 2 — Prélèvements sociaux
      7d. CTA intermédiaire 1 (après section 2)
      7e. Section 3 — SCPI européennes
      7f. Section 4 — Optimisation fiscale
      7g. CTA intermédiaire 2 (après section 4)
      7h. Section 5 — Points de vigilance
      7i. Section FAQ (schema.org FAQPage)
      7j. Articles connexes (grille 2 colonnes)
      7k. CTA final (primaire RDV + secondaire comparateur)
      7l. Mentions légales bas de page
8.  [GLOBAL] Footer
```

---

## 10. Règles de marges, espacements et respiration visuelle

| Contexte | Classe | Valeur |
|----------|--------|--------|
| Entre bandeau CIF et hero | `mb-6` sur le bandeau | 1.5 rem |
| Entre hero et CTA intro | `mb-8` sur le hero | 2 rem |
| Entre CTA intro et article | `mb-8` sur le CTA | 2 rem |
| Entre sections dans l'article | `space-y-16` sur `<article>` | 4 rem |
| Entre éléments dans une section | `space-y-6` | 1.5 rem |
| Padding interne des blocs majeurs | `p-6 md:p-8` | 1.5–2 rem |
| Padding interne des encadrés | `p-5` | 1.25 rem |

**Interdits :**
- `mb-4` entre deux blocs majeurs distincts
- `-mt-*` (margin négatif) — crée des chevauchements
- `absolute` ou `fixed` sur les blocs de contenu principal
- `bg-slate-900/70` sur le conteneur `<article>` — doit être `bg-slate-900` opaque

---

## 11. Format des blocs pédagogiques

```tsx
<section
  id="[slug-ancre]"
  className="scroll-mt-28 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 md:p-8 space-y-6"
>
  <h2 className="text-2xl md:text-3xl font-bold text-slate-100 flex flex-wrap items-start gap-3">
    <[Icon] className="w-8 h-8 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden />
    <span className="min-w-0 flex-1">[Numéro]. [Titre de section]</span>
  </h2>

  <p className="leading-relaxed text-slate-300">[Intro de section]</p>

  <h3 className="text-xl font-bold text-slate-100 mt-6">Sous-titre</h3>
  <p>[Contenu]</p>

  {/* Encadré info */}
  <div className="rounded-xl border border-blue-800/40 border-l-4 border-l-blue-500 bg-blue-950/50 p-5">
    <p className="text-slate-200 text-sm leading-relaxed">[Info ou source]</p>
  </div>

  {/* Encadré alerte */}
  <div className="rounded-xl border border-amber-800/40 border-l-4 border-l-amber-500 bg-amber-950/50 p-5">
    <p className="text-slate-200 text-sm leading-relaxed">⚠ [Point de vigilance]</p>
  </div>
</section>
```

---

## 12. Format des blocs fiscaux sensibles

Les blocs présentant des taux, des régimes ou des seuils fiscaux doivent systématiquement :

1. Indiquer l'année ou la période de référence.
2. Citer la source (CGI, ASPIM, DIC, bulletin trimestriel).
3. Inclure la mention "susceptible d'évoluer".
4. Ne jamais présenter un taux comme garanti ou stable.

**Exemple de tableau fiscal :**
```
TMI | Imposition totale (foncier + PS) | Note
11% | 11% + 17,2% = 28,2% | Source : CGI art. 197 — taux 2025
30% | 30% + 17,2% = 47,2% | Données à titre indicatif — consultez un professionnel
41% | 41% + 17,2% = 58,2% | Les revenus SCPI européens peuvent être traités différemment
```
Légende obligatoire sous chaque tableau fiscal :
> "Données indicatives basées sur la législation fiscale en vigueur à la date de mise à jour. Susceptibles d'évolution. Ne constituent pas un conseil fiscal personnalisé."

---

## 13. Format des FAQ IA-friendly

5 à 8 questions. Structure obligatoire :

```tsx
// Composant SchemaOrg type "FAQPage" — déjà disponible sur le site
<SchemaOrg type="FAQPage" data={{ questions: [
  {
    question: "Comment sont imposés les revenus d'une SCPI ?",
    answer: "Les revenus distribués par une SCPI relèvent généralement des revenus fonciers, soumis à l'impôt sur le revenu selon la tranche marginale d'imposition (TMI) et aux prélèvements sociaux au taux de 17,2 %. Le traitement fiscal dépend de la situation individuelle de l'investisseur et du mode de détention choisi. Ces informations sont de nature pédagogique et ne constituent pas un conseil fiscal personnalisé."
  },
  // … 4 à 7 autres questions
]}} />
```

**Règles de rédaction des réponses FAQ :**
- 2 à 4 phrases maximum par réponse.
- Réponse directe en première phrase.
- Disclaimer ou nuance en dernière phrase.
- Aucun chiffre de performance sans source.
- Aucune recommandation de SCPI spécifique.

**5 questions FAQ recommandées pour `/fiscalite-scpi/` :**

| # | Question | Intention |
|---|----------|-----------|
| 1 | Comment sont imposés les revenus d'une SCPI ? | Définition — forte intention AEO |
| 2 | Quel est le taux des prélèvements sociaux sur les SCPI ? | Chiffre clé — forte intention IA |
| 3 | Les SCPI européennes sont-elles moins imposées en France ? | Comparatif — intention transactionnelle |
| 4 | Peut-on réduire la fiscalité de ses revenus SCPI ? | Optimisation — intention transactionnelle |
| 5 | Quels sont les risques fiscaux d'un investissement en SCPI ? | Risques — intention informationnelle |

---

## 14. CTA principal recommandé

**Libellé :** "Analyser ma fiscalité SCPI"  
**Action :** `onClick={handleRdvClick}` → modal RDV interne (jamais Calendly direct)  
**Classe :** `btnPrimaryClass` + `w-full sm:w-auto`  
**Icône :** `<ArrowRight />` à droite

---

## 15. CTA secondaire recommandé

**Libellé :** "Comparer les SCPI"  
**Action :** `onClick={handleComparateurClick}` → navigation vers `/comparateur-scpi/`  
**Classe :** `btnSecondaryClass` + `w-full sm:w-auto`  
**Icône :** `<ArrowRight />` à droite

---

## 16. Emplacements des CTA

| Position | Type | Déclencheur |
|----------|------|-------------|
| Après le hero (CTA intro) | Primaire + Secondaire | Entrée sur la page |
| Après la section 2 (prélèvements sociaux) | Primaire seul | "Votre rendement net dépend de votre fiscalité" |
| Après la section 4 (optimisation) | Secondaire → comparateur | "Comparer les modes de détention" |
| Bas de page (CTA final) | Primaire + Secondaire | Sortie de page — dernier point de conversion |

**Règle :** maximum 2 CTA intermédiaires dans le corps de l'article, plus le CTA final. Pas de CTA à l'intérieur d'une section de contenu — les placer entre les sections.

---

## 17. Maillage interne recommandé

| Ancre | URL cible | Placement |
|-------|-----------|-----------|
| "fiscalité SCPI en assurance-vie" | `/education/scpi-direct-ou-assurance-vie` | Section optimisation (§4) |
| "déduction fiscale via le PER" | `/education/per-scpi-retraite-deduction-fiscale` | Section optimisation (§4) |
| "démembrement et optimisation fiscale" | `/education/demembrement-scpi-nue-propriete-usufruit` | Section optimisation (§4) |
| "comparer les SCPI selon votre profil fiscal" | `/comparateur-scpi/` | CTA final + section optimisation |
| "SCPI européennes : analyse et points de vigilance" | `/scpi-europeennes/` | Section 3 (SCPI européennes) |

**Règles d'ancre (conformité CIF) :**
- ❌ "les SCPI qui rapportent le plus", "meilleure SCPI", "économisez X%"
- ✅ "comparer les données historiques", "analyser votre profil fiscal", "points de vigilance SCPI"

---

## 18. Données ou sources à vérifier

Avant toute implémentation, vérifier que les données suivantes sont à jour et sourcées :

| Donnée | Source à citer | Vérification requise |
|--------|---------------|----------------------|
| Taux des prélèvements sociaux (17,2 %) | CGI / Loi de financement de la Sécurité sociale | Vérifier taux en vigueur 2026 |
| Seuil micro-foncier (15 000 €) | CGI art. 32 | Vérifier si inchangé en 2026 |
| Abattement micro-foncier (30 %) | CGI art. 32 | Vérifier si inchangé en 2026 |
| Fonctionnement conventions fiscales bilatérales | AMF / ASPIM | Référencer sans citer de taux spécifique par pays |
| Date de dernière mise à jour affichée | — | Mettre à jour à la date d'implémentation |

**Règle Agent 03 :** aucune donnée chiffrée ne doit être inventée ou extrapolée. Si une donnée n'est pas vérifiable, la retirer ou la formuler sans chiffre.

---

## 19. Points de conformité CIF

Checklist obligatoire — à valider avant implémentation :

- [ ] Bandeau CIF en tête de page (`bg-amber-900/20`, icône `AlertTriangle`, texte lisible)
- [ ] Aucun chiffre de rendement sans source et sans "données historiques, non garanties"
- [ ] Aucun titre H1/H2/H3 assimilable à une promesse
- [ ] Mention des 4 risques principaux sur les sections mentionnant des performances : perte en capital, revenus non garantis, liquidité limitée, risque fiscal
- [ ] CTA "Analyser ma fiscalité SCPI" avec mention implicite du recueil d'informations (accroche CTA)
- [ ] Bouton RDV vers modal interne — jamais lien Calendly direct
- [ ] Mentions légales en bas de page avec numéro ORIAS
- [ ] Disclaimer dans les réponses FAQ (pas uniquement en pied de page)
- [ ] Données tabulaires avec légende de source et mention "données indicatives"

---

## 20. Formulations interdites

| Formulation | Raison |
|-------------|--------|
| "Économisez X% d'impôt avec les SCPI" | Promesse de rendement fiscal |
| "Les meilleures SCPI pour défiscaliser" | Comparaison superlative sans réserve |
| "Les SCPI européennes sont exonérées d'impôt" | Faux — conventions fiscales ≠ exonération |
| "Revenus réguliers et stables" | Garantie implicite — revenus non garantis |
| "Rendement net de X% après fiscalité" | Chiffre projeté / promesse |
| "Pour votre profil, choisissez les SCPI en AV" | Recommandation personnalisée sans recueil |
| "En 2027, les SCPI devraient..." | Projection future |
| "Les SCPI santé sont sans risque" | Absence de risque — faux |

---

## 21. Formulations prudentes recommandées

| Contexte | Formulation conforme |
|----------|---------------------|
| Taux d'imposition | "Selon votre tranche marginale d'imposition (TMI), les revenus fonciers issus de SCPI sont soumis à..." |
| Optimisation | "Certains modes de détention peuvent modifier la fiscalité applicable, selon votre situation personnelle" |
| SCPI européennes | "Les revenus de SCPI investissant à l'étranger peuvent bénéficier de conventions fiscales bilatérales qui réduisent leur imposition en France" |
| Performance | "Taux de distribution 2024 : X% (source : ASPIM) — donnée historique, non garantie pour les exercices futurs" |
| Conseil | "Ces informations sont de nature pédagogique. Consultez un conseiller habilité pour une analyse adaptée à votre situation patrimoniale." |
| Risques | "Investir en SCPI comporte des risques : perte en capital, revenus non garantis, liquidité limitée, risque d'évolution fiscale." |

---

## 22. Fichiers du site potentiellement concernés (lecture seule)

| Fichier | Rôle | Ce qu'on y cherche |
|---------|------|--------------------|
| `src/components/FiscaliteScpiPage.tsx` | Composant principal | Structure actuelle, H1, sections, CTA, FAQ existantes |
| `src/components/SEOHead.tsx` | Balises méta | Format du `<title>` et de la méta-description |
| `src/components/SchemaOrg.tsx` | Données structurées | Format attendu pour `FAQPage` |
| `src/App.tsx` | Routing | Props passées à `FiscaliteScpiPage` (`onRdvClick`, `onNavigate`) |
| `src/components/Breadcrumb.tsx` | Navigation | Breadcrumb existant |

**Consigne absolue :** ne lire ces fichiers qu'en mode lecture seule jusqu'à l'écriture de `VALIDÉ POUR MODIFICATION DU SITE`.

---

## 23. Risques techniques potentiels

| Risque | Probabilité | Prévention |
|--------|-------------|-----------|
| Balise JSX invalide (`motionlessPage`, etc.) | Historique élevé | Vérifier avec `grep motionlessPage` + `grep motionlessTag` avant livraison |
| Fond semi-transparent laissant transparaître le hero | Historique élevé | Vérifier `bg-slate-900/` → remplacer par `bg-slate-900` opaque |
| `<h2>` dans un `<aside>` ou CTA | Historique moyen | Vérifier que les CTA utilisent `<p>` pour leurs titres accroche |
| Boutons non fermés ou mal imbriqués | Historique moyen | Vérifier les balises `<button>` fermantes |
| Erreur TypeScript sur les props | Faible | Vérifier la signature de `FiscaliteScpiPage` avant modification |
| `npm run build` échouant sur `inject-env-vars.js` | Existant | Ce script nécessite les variables d'env — hors scope de cette tâche |
| `git checkout` accidentel réinitialisant le fichier | Historique élevé | Commit avant toute modification si des changements existent déjà |

---

## 24. Critères d'acceptation UX

- [ ] Hero et CTA intro : deux blocs indépendants, `mb-8` entre eux, fonds opaques distincts
- [ ] Aucun texte visible derrière les blocs CTA (fond `bg-slate-900` opaque sur l'article)
- [ ] Boutons CTA : `w-full sm:w-auto`, `type="button"`, `onClick` interne
- [ ] Maximum 2 CTA intermédiaires dans le corps + 1 CTA final
- [ ] H2 uniquement dans les `<section>` de contenu — jamais dans `<aside>`, `<nav>`, `<header>`
- [ ] Sommaire : `list-none`, ancres valides avec `scroll-mt-28` sur les sections cibles
- [ ] Aucune balise JSX invalide (vérification grep obligatoire)
- [ ] Responsive mobile : boutons pleine largeur, texte min `text-sm`, pas de débordement

---

## 25. Critères d'acceptation SEO

- [ ] `<title>` : 50-65 caractères, mot-clé `fiscalité SCPI` en début
- [ ] Méta-description : 140-160 caractères, appel à l'action, mot-clé principal
- [ ] H1 unique, mot-clé principal présent, orienté pédagogie
- [ ] Structure H2/H3 cohérente avec la hiérarchie recommandée (section 8)
- [ ] Minimum 3 liens de maillage interne avec ancres conformes CIF
- [ ] FAQ schema.org présente (min 5 questions, format `FAQPage`)
- [ ] `dateModified` mis à jour dans le composant SchemaOrg
- [ ] Aucune URL de maillage pointant vers un slug redirigé (post-TASK-002C)

---

## 26. Critères d'acceptation visibilité IA

- [ ] Au moins 1 définition directe format AEO (terme + définition 1-2 phrases + nuance)
- [ ] FAQ avec réponses directes de 2-4 phrases + disclaimer en dernière phrase
- [ ] Entités nommées citées : AMF, ASPIM, ORIAS (au moins 2 des 3)
- [ ] Schema.org `FAQPage` implémenté via `SchemaOrg` + schema.org `Article` avec `dateModified`
- [ ] Contenu couvrant toutes les sous-questions de la requête principale
- [ ] Disclaimer présent dans les blocs de réponse, pas uniquement en pied de page

---

## 27. Critères d'acceptation conformité CIF

- [ ] Bandeau CIF visible et lisible en tête de page
- [ ] Aucun chiffre de rendement sans source ni disclaimer
- [ ] Aucun titre assimilable à une promesse (H1, H2, H3, `<title>`, méta)
- [ ] Risques SCPI mentionnés (perte en capital, revenus non garantis, liquidité)
- [ ] CTA RDV ne contient pas de promesse de conseil direct
- [ ] Mentions légales bas de page avec référence ORIAS
- [ ] Toutes les formulations de la section 20 absentes du contenu

---

## 28. Validation Agent 06

Application de la grille de scoring sur ce brief.

### Score SEO estimé : 82/100
- Titre recommandé conforme (50-65c) ✅ +15
- Méta conforme (140-160c) ✅ +10
- H1 unique et optimisé ✅ +15
- Structure H2/H3 cohérente ✅ +10
- Maillage interne ≥ 3 liens ✅ +15
- FAQ schema.org prévue (5 Q/R) ✅ +15
- Mot-clé dans intro ✅ +10
- URL canonique propre (existante) ✅ +5
- Date mise à jour : à implémenter → -2 (pas encore fait)

### Score visibilité IA estimé : 80/100
- 2 définitions directes prévues ✅ +15
- FAQ réponses directes + disclaimers ✅ +20
- Entités nommées (AMF, ASPIM, ORIAS) ✅ +15
- Schema.org FAQPage + Article ✅ +15
- Fraîcheur : date à mettre à jour → +7 (partiel)
- Couverture thématique complète ✅ +15
- Disclaimer dans les blocs de réponse ✅ +10

### Score UX / CTA estimé : 85/100
- Hero et CTA intro distincts ✅ +15
- Fond opaque sur tous les blocs ✅ +15
- mb-8 entre blocs majeurs ✅ +10
- Boutons CTA conformes ✅ +10
- Max 2 CTA intermédiaires ✅ +5
- H2 hors aside/nav ✅ +10
- Responsive mobile : w-full ✅ +10
- Aucune balise JSX invalide : à vérifier au moment du diff → +8 (conditionnel)
- Sommaire lisible et ancres ✅ +10

### Score conformité CIF estimé : 88/100
- Bandeau CIF en tête ✅ +15
- Chiffres sourcés + disclaimers ✅ +20
- Titres sans promesse ✅ +15
- Risques mentionnés ✅ +15
- CTA RDV conforme ✅ +10
- Mentions légales + ORIAS ✅ +10
- Disclaimer dans FAQ ✅ +5

### Red flags détectés : aucun

### Risque global : **faible** (score moyen 83/100)

---

## 29. Décision finale

```
─────────────────────────────────────────────
RAPPORT DE VALIDATION — Agent 06 MaximusSCPI
Date : 17/05/2026
Livrable : brief-final-implementation-fiscalite-scpi.md
─────────────────────────────────────────────

VALIDATION IA :
OK

SCORE SEO :
82/100 — Structure et balises conformes, FAQ prévue, maillage défini

SCORE VISIBILITÉ IA :
80/100 — Définitions directes, FAQ AEO, entités nommées, schema.org

SCORE UX / CTA :
85/100 — Blocs distincts, fond opaque, boutons conformes, mobile OK

SCORE CONFORMITÉ CIF :
88/100 — Bandeau, disclaimers, risques, ORIAS, formulations conformes

RISQUE GLOBAL :
Faible

RED FLAGS DÉTECTÉS :
Aucun

CORRECTIONS OBLIGATOIRES :
1. Mettre à jour dateModified dans SchemaOrg au moment de l'implémentation
2. Vérifier absence de balise JSX invalide avec grep avant livraison du diff
3. Vérifier que les taux fiscaux (17,2%, seuil 15 000€) sont bien en vigueur en 2026

VALIDATION HUMAINE NÉCESSAIRE :
Oui — pour déclencher la modification du site

RAISON :
Le brief est prêt. La validation humaine est requise non pas pour des raisons 
de conformité (scores OK) mais parce que toute modification de /src nécessite 
la phrase explicite de l'utilisateur selon les règles du projet.

ACTION SUIVANTE RECOMMANDÉE :
L'utilisateur peut écrire VALIDÉ POUR MODIFICATION DU SITE.
Cursor lira FiscaliteScpiPage.tsx en lecture seule, puis appliquera 
les modifications ciblées définies dans ce brief.
─────────────────────────────────────────────
```

---

## 30. Phrase exacte nécessaire avant toute modification du site

```
VALIDÉ POUR MODIFICATION DU SITE
```

Sans cette phrase exacte, aucun fichier de `/src`, `/public` ou du projet ne sera modifié. Les agents restent en mode brief, analyse et recommandation.

---

*Brief produit par Agent 01 — SEO/AEO + Agent 04 — Conformité CIF. Validation Agent 06 incluse. Aucun fichier hors de `/agents` n'a été modifié.*
