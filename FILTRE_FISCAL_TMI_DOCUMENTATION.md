# Documentation - Filtre Fiscal TMI (Tranche Marginale d'Imposition)

## Vue d'ensemble

Cette fonctionnalité majeure d'aide à la décision permet aux utilisateurs de sélectionner leur Tranche Marginale d'Imposition (TMI) pour recevoir des recommandations fiscalement optimisées de SCPI.

## Fonctionnalités

### 1. Bouton "Ma Fiscalité"

**Emplacement :** À côté du bouton "Filtres" dans la barre de navigation du comparateur

**États :**
- **Non sélectionné :** Style "outline" avec fond léger et icône calculatrice
- **Sélectionné :** Style actif avec badge affichant le TMI sélectionné (ex: "41%")

**Comportement :**
- Desktop : Bouton complet avec texte "Ma Fiscalité" + badge TMI
- Mobile : Bouton rond avec icône calculatrice + indicateur visuel quand actif

### 2. Modale de Sélection TMI

**Tranches disponibles :**
- 0% (Non imposable) - Revenus < 11 295€
- 11% - Revenus de 11 295€ à 28 798€
- 30% - Revenus de 28 798€ à 82 342€
- 41% - Revenus de 82 342€ à 177 106€
- 45% - Revenus > 177 106€

**Features :**
- Design moderne avec icônes et animations
- Message informatif expliquant l'importance de la TMI
- Badge "Fiscalité élevée" pour TMI ≥ 30%
- Option de réinitialisation

### 3. Logique de Filtrage Intelligente

#### Identification des SCPI Européennes
Une SCPI est considérée "Européenne" si moins de 50% de son patrimoine est situé en France.

#### Calcul du Rendement Net Estimé

**Pour les SCPI Françaises :**
```
Rendement Net = Rendement Brut × (1 - (TMI + 17.2%))
```
- TMI : Tranche marginale d'imposition (en décimal)
- 17.2% : Prélèvements sociaux

**Pour les SCPI Européennes :**
```
Rendement Net = Rendement Brut × 0.85
```
- Impact fiscal moyen réduit grâce aux conventions internationales

#### Tri et Priorisation (TMI ≥ 30%)

Quand l'utilisateur sélectionne une TMI de 30% ou plus :
1. Les SCPI Européennes sont automatiquement remontées en tête de liste
2. Le tri secondaire s'applique ensuite (rendement ou prix)
3. Les SCPI Françaises apparaissent après

### 4. Affichage sur les Cartes SCPI

#### Badge "Optimisé TMI"
Pour TMI ≥ 30% sur les SCPI Européennes :
- Badge doré avec icône sparkles
- Texte : "Optimisé TMI 30%+" (ou la TMI sélectionnée)
- Couleur : amber-500 pour la visibilité

#### Rendement Net
Affiché sous le rendement brut dans la section hero :
- Label : "Rendement Net Estimé (TMI XX%)"
- Taille de police : 2xl pour la lisibilité
- Indication "Fiscalité européenne favorable" pour les SCPI Européennes

### 5. Vue Tableau

Dans la vue liste/tableau :
- Badge "TMI XX%+" dans la colonne Catégorie
- Rendement net affiché sous le rendement brut
- Format compact : "Net: X.XX%"

## Architecture Technique

### Nouveaux Fichiers

1. **`src/components/fintech/TaxOptimizationModal.tsx`**
   - Modale de sélection de la TMI
   - Export du type `TMIValue`

2. **`src/utils/taxOptimization.ts`**
   - Fonctions utilitaires pour les calculs fiscaux
   - `isEuropeanSCPI()` : Détermine si une SCPI est européenne
   - `calculateNetYield()` : Calcule le rendement net
   - `shouldOptimizeForTax()` : Vérifie si TMI ≥ 30%
   - `getTaxOptimizationScore()` : Score d'optimisation fiscale
   - `sortSCPIByTaxOptimization()` : Tri intelligent basé sur la TMI

### Fichiers Modifiés

1. **`src/components/fintech/FintechComparator.tsx`**
   - Ajout du state `userTmi`
   - Intégration du bouton "Ma Fiscalité"
   - Application du tri fiscal via `sortSCPIByTaxOptimization()`
   - Transmission de la TMI aux composants enfants

2. **`src/components/fintech/SCPICardDark.tsx`**
   - Prop `userTmi` optionnelle
   - Calcul et affichage du rendement net
   - Badge d'optimisation fiscale
   - Message informatif pour SCPI européennes

3. **`src/components/fintech/SCPITableRow.tsx`**
   - Prop `userTmi` optionnelle
   - Affichage compact du rendement net
   - Badge TMI dans la colonne catégorie

4. **`src/components/fintech/index.ts`**
   - Export de `TaxOptimizationModal`

## Formules de Calcul

### Exemple Pratique

**Cas 1 : SCPI Française - TMI 41%**
- Rendement brut : 5.5%
- Calcul : 5.5 × (1 - (0.41 + 0.172)) = 5.5 × 0.418 = 2.30%
- **Rendement net estimé : 2.30%**

**Cas 2 : SCPI Européenne - TMI 41%**
- Rendement brut : 5.5%
- Calcul : 5.5 × 0.85 = 4.68%
- **Rendement net estimé : 4.68%**

**Différence : +2.38 points** en faveur des SCPI Européennes !

## UX/UI

### Parcours Utilisateur

1. L'utilisateur clique sur "Ma Fiscalité"
2. Une modale s'ouvre avec les 5 options de TMI
3. L'utilisateur sélectionne sa TMI (ex: 41%)
4. La modale se ferme automatiquement
5. Le bouton devient vert avec badge "41%"
6. La liste se réorganise : SCPI Européennes en tête
7. Les cartes affichent le rendement net et le badge d'optimisation
8. L'utilisateur peut facilement comparer les rendements réels après impôts

### Points Clés UX

- **Instantané** : Pas de rechargement, tout se met à jour en temps réel
- **Visuel** : Badge doré distinctif pour les SCPI optimisées
- **Informatif** : Affichage du rendement net directement sur la carte
- **Réversible** : Bouton "Réinitialiser" pour revenir à la vue sans TMI
- **Responsive** : Adaptation parfaite mobile/desktop

## Impact Business

### Valeur Ajoutée

1. **Aide à la décision fiscale** : Les utilisateurs peuvent immédiatement voir l'impact fiscal sur leurs investissements
2. **Mise en avant des SCPI Européennes** : Pour les hauts revenus (TMI ≥ 30%), valorise les produits à fiscalité douce
3. **Transparence** : Montre le rendement réel après impôts
4. **Différenciation** : Fonctionnalité unique sur le marché des comparateurs SCPI

### Segments Cibles

- **TMI 0-11%** : Affichage informatif du rendement net
- **TMI 30%** : Début de l'optimisation fiscale
- **TMI 41-45%** : Forte recommandation des SCPI Européennes (gain fiscal majeur)

## Maintenance

### Variables à ajuster si nécessaire

**Dans `taxOptimization.ts` :**
- Seuil de % France pour déterminer une SCPI européenne (actuellement 50%)
- Coefficient fiscal européen (actuellement 0.85)
- Taux de prélèvements sociaux (actuellement 17.2%)

**Dans `TaxOptimizationModal.tsx` :**
- Tranches de revenus associées aux TMI
- Labels et descriptions des options

## Tests Recommandés

1. ✅ Sélection de chaque TMI et vérification du tri
2. ✅ Calcul des rendements nets pour divers scénarios
3. ✅ Affichage correct des badges sur cartes et tableau
4. ✅ Responsive mobile/desktop
5. ✅ Réinitialisation de la TMI

## Version

- **Date de création :** 19 décembre 2025
- **Version :** 1.0.0
- **Status :** ✅ Production Ready
