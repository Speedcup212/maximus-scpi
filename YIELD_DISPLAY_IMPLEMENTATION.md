# Implémentation de l'affichage différencié du taux de distribution

## Règles MaximusSCPI implémentées

### 1. SCPI investies majoritairement en France
- ✅ Affiche le **taux de distribution BRUT**
- ✅ Mention légale : "Taux brut avant fiscalité – la fiscalité dépend de la situation personnelle de l'investisseur."

### 2. SCPI investies majoritairement en Europe (hors France)
- ✅ Affiche par défaut le **taux de distribution NET**
- ✅ Affiche en second niveau le **taux brut**
- ✅ Mention légale : "Le net correspond au revenu réellement perçu. La fiscalité étrangère est prélevée à la source. Les revenus ne supportent pas les prélèvements sociaux français."
- ✅ Si taux net non communiqué : affiche le brut avec label "Taux net non communiqué – rendement réel potentiellement inférieur."

### 3. Règle d'affichage prioritaire
- ✅ France → Brut
- ✅ Europe → Net (si disponible)

### 4. Règle de comparaison
- ✅ Comparaison France ↔ France : brut
- ✅ Comparaison Europe ↔ Europe : net
- ✅ Comparaison France ↔ Europe : Avertissement pédagogique affiché

### 5. Cas de données incomplètes
- ✅ Si le taux net européen n'est pas communiqué : affiche le brut avec label d'avertissement

## Fichiers créés/modifiés

### Nouveaux fichiers
1. **`src/utils/yieldDisplay.ts`**
   - Fonction `isEuropeanScpi()` : détermine si une SCPI est européenne
   - Fonction `extractNetYield()` : extrait le taux net depuis les actualités trimestrielles
   - Fonction `getYieldDisplayInfo()` : génère les informations d'affichage selon les règles
   - Fonction `getComparisonWarning()` : génère l'avertissement pour comparaisons mixtes
   - Fonction `needsComparisonWarning()` : vérifie si un avertissement est nécessaire

2. **`src/components/YieldDisplay.tsx`**
   - Composant réutilisable pour l'affichage du taux de distribution
   - Variants : 'card', 'detail', 'table', 'compact'

3. **`src/components/ComparisonWarning.tsx`**
   - Composant d'avertissement pour les comparaisons France ↔ Europe

### Fichiers modifiés
1. **`src/components/fintech/AnalysisDetailModal.tsx`**
   - Utilise `getYieldDisplayInfo()` pour afficher le taux selon les règles
   - Affiche le taux net en priorité pour les SCPI européennes
   - Affiche les mentions légales appropriées

2. **`src/components/fintech/SCPICardDark.tsx`**
   - Utilise `getYieldDisplayInfo()` pour l'affichage dans les cartes
   - Affiche le taux net/brut selon les règles

3. **`src/components/ScpiDetailPage.tsx`**
   - Utilise `getYieldDisplayInfo()` pour l'affichage dans la page de détail
   - Affiche les mentions légales

4. **`src/components/fintech/SCPITableRow.tsx`**
   - Utilise `getYieldDisplayInfo()` pour l'affichage dans les tableaux
   - Affiche le taux net en priorité pour les SCPI européennes

5. **`src/components/fintech/FintechComparator.tsx`**
   - Ajoute `ComparisonWarning` pour les comparaisons mixtes

6. **`src/components/ComparisonTable.tsx`**
   - Utilise `getYieldDisplayInfo()` pour l'affichage
   - Ajoute `ComparisonWarning` pour les comparaisons mixtes
   - Calcule le rendement moyen en tenant compte des règles

## Détection du taux net

La fonction `extractNetYield()` détecte les formats suivants dans les actualités trimestrielles :
- "X,XX% brut / Y,YY% net"
- "Taux de distribution 2024: X,XX% brut / Y,YY% net"
- "X,XX% net de fiscalité étrangère"
- "net: X,XX%"

## Détermination France vs Europe

La fonction `isEuropeanScpi()` détermine si une SCPI est européenne en vérifiant :
1. La propriété `geography === 'europe'` ou `'international'`
2. La propriété `european === true`
3. La répartition géographique : si < 50% en France → européenne

## Exemple : LOG-IN

- **Géographie** : Européenne (37.3% France < 50%)
- **Taux brut** : 6.30%
- **Taux net** : 5.20% (détecté depuis les actualités)
- **Affichage** : 
  - Principal : 5.20% (Net)
  - Secondaire : 6.30% (Brut)
  - Mention : "Le net correspond au revenu réellement perçu..."

## Prochaines étapes

1. ✅ Implémentation de base terminée
2. ⏳ Tests dans l'interface
3. ⏳ Vérification de tous les composants d'affichage
4. ⏳ Ajout du taux net dans les données structurées si nécessaire
