# 🚀 Guide du Comparateur SCPI Fintech

## 📍 URL d'Accès

```
https://votre-domaine.com/comparateur-fintech
```

## ✨ Fonctionnalités Principales

### 1. Interface Dark Mode Fintech
- Thème sombre élégant (`slate-900`, `slate-800`)
- Accents verts (`emerald-500/600`)
- Design premium et moderne

### 2. Cartes SCPI Enrichies
Chaque carte affiche :
- **Nom & Gestionnaire**
- **Catégorie** (Santé, Logistique, Diversifiée, etc.)
- **Rendement** (Hero metric en grand)
- **Prix de la part**
- **Investissement minimum**
- **TOF** (Taux d'occupation financier)
- **Capitalisation**
- **Stratégie** (en mode étendu)

**Actions disponibles :**
- **"Sélectionner"** : Ajoute la SCPI au panier
- **"Analyser"** : Ouvre les détails (placeholder pour l'instant)

### 3. Système de Sélection Intelligent

#### Desktop (lg+)
- **Sidebar à droite** affichant :
  - Liste des SCPI sélectionnées
  - Rendement moyen
  - Investissement minimum total
  - Bouton "Visualiser mes résultats"

#### Mobile
- **Barre sticky en bas** :
  - Apparaît uniquement si au moins 1 SCPI sélectionnée
  - Bouton "Voir ma sélection (X)"
  - Ouvre le modal de simulation

### 4. Modal de Simulation (Dashboard Complet)

#### Module A : Paramètres Globaux
```tsx
Montant Total à Investir : __________ €
[Boutons rapides: 10K€ | 25K€ | 50K€ | 100K€]
```

#### Module B : Allocation Avancée avec Sliders
- **Slider interactif** pour chaque SCPI (0-100%)
- Affichage du montant en euros en temps réel
- **Validation** : La somme doit être égale à 100%
- Bouton **"Répartir équitablement"** pour reset

**Calculs Automatiques :**
- Rendement pondéré selon les poids
- Revenus projetés basés sur l'allocation réelle

#### Module C : KPIs (Indicateurs Clés)

**1. Rendement Moyen Pondéré**
```
Formule : Σ(Rendement_i × Poids_i) / Σ(Poids_i)
```

**2. Revenus Mensuels Estimés**
```
Formule : (Montant Total × Rendement Pondéré) / 12
```

**3. Gain Total sur 10 ans**
```
Formule : Revenus Annuels × 10
```

#### Module D : Visualisations avec Recharts

**1. Graphique de Projection (AreaChart)**
- Capital initial (ligne bleue)
- Valeur projetée (ligne verte)
- Projection sur 15 ans
- Tooltip interactif avec détails

**2. Répartition Sectorielle (Donut Chart)**
- Agrégation pondérée des secteurs de toutes les SCPI
- Bureaux, Commerce, Santé, Logistique, Résidentiel, etc.

**3. Répartition Géographique (Donut Chart)**
- Agrégation pondérée des zones géographiques
- France, Allemagne, Europe, etc.

## 🎯 Parcours Utilisateur Complet

### Étape 1 : Sélection
```
/comparateur-fintech
↓
Visualise 8 SCPI en cartes (Dark mode)
↓
Clique "Sélectionner" sur 3 SCPI
↓
Les cartes prennent une bordure verte
```

### Étape 2 : Visualisation
```
Desktop: Sidebar s'affiche avec les 3 SCPI
Mobile: Footer sticky apparaît "Voir ma sélection (3)"
↓
Clique sur "Visualiser mes résultats"
```

### Étape 3 : Simulation
```
Modal plein écran s'ouvre
↓
Saisit le montant : 50 000€
↓
Ajuste les poids avec les sliders :
  - Comète : 40% = 20 000€
  - Iroko Zen : 30% = 15 000€
  - Remake Live : 30% = 15 000€
↓
Observe les KPIs se mettre à jour en temps réel :
  - Rendement pondéré : 9.15%
  - Revenus mensuels : 381€
  - Gain 10 ans : 45 750€
↓
Analyse les graphiques :
  - Projection de croissance
  - Répartition sectorielle
  - Répartition géographique
```

## 📊 Données SCPI Disponibles

| SCPI | Rendement | Prix | Catégorie |
|------|-----------|------|-----------|
| **Comète** | 11.18% | 1000€ | Santé |
| **Pier Capital** | 9.20% | 1000€ | Logistique |
| **Remake Live** | 8.75% | 1000€ | Résidentiel |
| **Epsilon 360°** | 7.85% | 200€ | Diversifiée |
| **Novapierre Résidentiel** | 7.50% | 1000€ | Résidentiel |
| **Iroko Zen** | 7.21% | 203.79€ | Diversifiée |
| **Primovie** | 6.85% | 1020€ | Bureaux |
| **Corum XL** | 6.50% | 1035€ | Européenne |

## 🎨 Design System

### Couleurs
```css
Background: bg-slate-900
Cards: bg-slate-800
Borders: border-slate-700
Text: text-white, text-slate-400
Primary: bg-emerald-600
Hover: hover:bg-emerald-700
Shadows: shadow-emerald-500/20
```

### Typographie
- Headers: `text-2xl font-bold`
- Body: `text-sm text-slate-400`
- Metrics: `text-5xl font-bold text-emerald-400`

## 🔧 Architecture Technique

### Contexts
```tsx
AllocationContext
├── totalInvestment
├── weights (Record<scpiId, weight>)
├── setWeight(scpiId, weight)
├── distributeEqually(scpis)
├── getWeightedYield(scpis)
├── getMonthlyRevenue(scpis)
├── getTenYearProjection(scpis)
└── getAllocationDetails(scpis)
```

### Components Structure
```
src/
├── data/
│   └── scpiDataExtended.ts (8 SCPI avec sectors & geography)
├── contexts/
│   └── AllocationContext.tsx
├── components/
│   ├── fintech/
│   │   ├── FintechComparator.tsx (Main wrapper)
│   │   ├── SCPICardDark.tsx (Dark mode card)
│   │   ├── SelectionSidebar.tsx (Desktop sidebar)
│   │   └── MobileSelectionBar.tsx (Mobile sticky bar)
│   └── simulation/
│       ├── SimulationModal.tsx (Main modal)
│       ├── AllocationSliders.tsx (Weight management)
│       ├── KPICards.tsx (3 KPI cards)
│       ├── ProjectionChart.tsx (AreaChart 15 years)
│       └── AllocationCharts.tsx (2 Donut charts)
```

## 🚀 Prochaines Étapes Suggérées

### 1. Connecter "Analyser"
```tsx
const handleAnalyze = (scpi: SCPIExtended) => {
  // Naviguer vers la fiche détaillée
  window.location.href = `/scpi/${scpi.slug}`;
};
```

### 2. Persister la sélection
```tsx
// Option A: LocalStorage
localStorage.setItem('selectedScpis', JSON.stringify(selectedScpis));

// Option B: Supabase (si authentifié)
await supabase.from('user_selections').insert({
  user_id: userId,
  scpi_ids: selectedScpis.map(s => s.id),
  weights: weights
});
```

### 3. Export PDF du portefeuille
```tsx
import jsPDF from 'jspdf';

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text('Mon Portefeuille SCPI', 10, 10);
  // Ajouter les détails...
  doc.save('portefeuille-scpi.pdf');
};
```

### 4. Partage du portefeuille
```tsx
const sharePortfolio = () => {
  const url = `${window.location.origin}/comparateur-fintech?portfolio=${btoa(JSON.stringify(selectedScpis))}`;
  navigator.clipboard.writeText(url);
};
```

## 🎯 Points Forts

✅ **Mobile-First** : Fonctionne parfaitement sur mobile et desktop
✅ **Allocation Pondérée** : Calculs mathématiquement exacts
✅ **Temps Réel** : Tous les calculs se mettent à jour instantanément
✅ **Dark Mode** : Design fintech premium
✅ **Visualisations** : Recharts pour des graphiques interactifs
✅ **Responsive** : Layout adaptatif avec sidebar/footer

## 🧪 Test Rapide

```bash
# Lancer le dev server
npm run dev

# Ouvrir dans le navigateur
http://localhost:5173/comparateur-fintech

# Actions à tester :
1. Sélectionner 3 SCPI
2. Cliquer "Visualiser"
3. Changer le montant à 100 000€
4. Ajuster les sliders
5. Observer les KPIs et graphiques
```

## 📝 Notes Importantes

- Les calculs sont basés sur des rendements historiques
- La projection est linéaire (sans capitalisation)
- Les données sont mockées mais réalistes
- L'allocation doit totaliser 100% pour être valide

---

**Créé avec ❤️ pour MaximusSCPI**
