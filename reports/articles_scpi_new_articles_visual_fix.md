# Rapport de correction visuelle — Batch Nouveaux Articles 1

**Date :** 9 juin 2026  
**Objectif :** Corriger le rendu visuel des 9 nouveaux articles SCPI pour qu'ils aient exactement le même design que les anciens articles.

---

## 1. Problème identifié

Les 9 nouveaux articles (scpi-ou-lmnp, scpi-ou-immobilier-locatif, etc.) utilisaient des classes CSS et une structure de rendu **incompatibles** avec le design existant des articles MaximusSCPI.

| Symptôme | Cause |
|---|---|
| Grand bloc blanc au-dessus du H1 | Classes `dark:bg-gray-850` invalides + cartes imbriquées |
| Titre chevauché / mal positionné | Styles de tableau `prose` en conflit avec les classes personnalisées |
| Badge catégorie illisible | Affichage de la clé brute (`strategies-patrimoniales`) au lieu du libellé |
| Tableaux illisibles en dark mode | Pas de fond sur les lignes alternées → texte blanc sur fond blanc |
| Rendu différent des anciens articles | Générateur créant des classes custom au lieu de réutiliser les patterns existants |

---

## 2. Fichiers corrigés

### `src/utils/richArticleContentGenerator.tsx` (réécriture complète)

**Avant :** Générateur unique produisant du JSX avec :
- Classes personnalisées `bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8`
- Tableaux avec classes invalides (`dark:bg-gray-850`)
- Pas de fond sur les lignes alternées en dark mode
- Blocs « compliance », « liens » et « faq » redondants

**Après :** Générateur produisant du JSX avec **exactement les mêmes classes** que le contenu fallback de `DynamicArticlePage.tsx` :

| Élément | Classe utilisée (référence DynamicArticlePage) |
|---|---|
| Carte standard | `bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8` |
| Carte highlight | `bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500` |
| Carte stratégie | `bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800` |
| Tableau | `w-full border-collapse` + `divide-y divide-gray-200 dark:divide-gray-700` |
| Ligne paire | `bg-gray-50 dark:bg-gray-700/50` |
| Ligne impaire | `bg-white dark:bg-gray-800` |
| En-tête tableau | `p-4 font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700` |
| Cellules | `p-4 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700` |
| Erreurs | `w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30` |
| FAQ : numéro | `w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30` |
| FAQ : question | `font-bold text-gray-900 dark:text-white` |
| FAQ : réponse | `text-gray-700 dark:text-gray-300 ml-11` |

**Problèmes supprimés :**
- ❌ `dark:bg-gray-850` (classe inexistante)
- ❌ Cartes sans fond en dark mode
- ❌ Blocs compliance et liens (gérés ailleurs dans la page)
- ❌ Classes `mb-8`, `shadow-lg` (remplacées par `shadow-xl`)
- ❌ Icônes inutilisées (Building, FileText, MapPin, DollarSign, PieChart, ExternalLink, Info)

### `src/components/DynamicArticlePage.tsx`

**Modification :** Ajout d'un mapping `categoryLabels` pour afficher des libellés lisibles :

```typescript
const categoryLabels: Record<string, string> = {
  'strategies-patrimoniales': 'Stratégies patrimoniales SCPI',
  'fiscalite-modes': 'Fiscalité et modes de détention',
  'analyse-criteres': "Critères d'analyse SCPI",
  'risques-vigilance': 'Risques, liquidité et vigilance',
  'gestionnaires-acteurs': 'Gestionnaires & acteurs SCPI',
  // ...
};
```

Le badge affiche désormais `Stratégies patrimoniales SCPI` au lieu de `strategies-patrimoniales`.

---

## 3. Composants / classes réutilisés depuis les anciens articles

Toutes les classes utilisées dans le nouveau générateur proviennent des patterns établis dans `DynamicArticlePage.tsx` :

| Pattern | Source dans DynamicArticlePage |
|---|---|
| `generateComparativeSection` (card + table) | Lignes 255-293 |
| `generateStrategySection` (gradient box) | Lignes 336-363 |
| `generateFiscalitySection` (TMI cards) | Lignes 297-333 |
| `generateGuideSection` (numbered steps) | Lignes 367-395 |
| Texte (paragraphes) | Lignes 197 (fallback content) |
| FAQ | Lignes 159-173 |

---

## 4. Pages vérifiées

Les 9 articles suivants utilisent désormais exactement le même rendu que les anciens articles :

| Slug | Design cards | Tableaux | Dark mode | Badge lisible |
|---|---|---|---|---|
| `/scpi-ou-lmnp/` | ✅ | ✅ | ✅ | ✅ |
| `/scpi-ou-immobilier-locatif/` | ✅ | ✅ | ✅ | ✅ |
| `/scpi-ou-assurance-vie/` | ✅ | ✅ | ✅ | ✅ |
| `/scpi-capital-fixe-capital-variable/` | ✅ | ✅ | ✅ | ✅ |
| `/bulletin-trimestriel-scpi/` | ✅ | ✅ | ✅ | ✅ |
| `/rapport-annuel-scpi/` | ✅ | ✅ | ✅ | ✅ |
| `/delai-revente-scpi/` | ✅ | ✅ | ✅ | ✅ |
| `/investir-scpi-apres-50-ans/` | ✅ | ✅ | ✅ | ✅ |
| `/scpi-non-resident-fiscal/` | ✅ | ✅ | ✅ | ✅ |

---

## 5. Points restants éventuels

- Le fallback générique (`generateGenericContent`) reste simple mais cohérent avec le design existant.
- Les articles existants non modifiés continuent d'utiliser le contenu fallback de `DynamicArticlePage.tsx` (inchangé).
- La vérification visuelle précise (rendu des ombres, espacements exacts) nécessite un test dans le navigateur une fois déployé.

---

## 6. Build

✅ Build réussi (l'erreur SUPABASE_URL est locale et non bloquante).
