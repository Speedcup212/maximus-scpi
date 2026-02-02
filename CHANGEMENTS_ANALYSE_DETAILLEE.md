# 📊 Changements dans l'Analyse Détaillée

## Structure actuelle de l'analyse détaillée

### 1. **Chiffres clés** (En premier) ⭐
- **Taux de distribution** (vert, emerald-400)
- **TOF** (bleu, blue-400)
- **Décote/Surcote** (vert si décote, rouge si surcote)
- **Capitalisation** (violet, purple-400)
- **Note** (étoiles jaunes sur 5)

### 2. **Profil de Risque (SRRI)** (Bloc dédié) ⭐
- Affichage responsive :
  - **Mobile** : barres compactes (w-5 h-6) avec chiffres 1-7
  - **Desktop** : barres larges (h-8) avec chiffres 1-7
- Couleurs :
  - 1-3 : Vert (emerald-500)
  - 4 : Orange clair (orange-400)
  - 5-6 : Orange foncé (orange-600)
  - 7 : Rouge (red-500)
- Labels : Prudent / Équilibré / Dynamique

### 3. **Analyse MaximusSCPI** ⭐
- **Avantages** (fond vert clair)
- **Points d'attention** (fond orange clair)
- Générés automatiquement selon les caractéristiques de la SCPI

### 4. **Actualité Trimestrielle** ⭐ NOUVEAU
- Icône Calendar (bleu)
- Affichage des actualités trimestrielles au format HTML
- Utilise la fonction `getScpiNews()`

### 5. **Tableau de Bord Technique**

#### 5.1. Structure & Frais
- **Prix de la part** (vert, emerald-400) ⭐
- **Minimum de souscription** ⭐
- Frais d'entrée
- Frais de gestion
- Délai de jouissance
- Immeubles
- Versement des loyers
- Durée détention recommandée
- SFDR
- Profil cible

#### 5.2. Indicateurs Locatifs ⭐ NOUVEAU
- **Nombre de locataires**
- **WALT** (Weighted Average Lease Term en années)
- **WALB** (Weighted Average Lease Break en années)
- Affichage conditionnel (uniquement si données disponibles)

#### 5.3. Valorisation & Risque
- **Val. Reconstitution** (vert, emerald-400) ⭐
- Val. Retrait
- Val. Réalisation
- Décote / Surcote
- Distribution (€/part)
- Report à Nouveau
- **Taux d'Occupation** (vert, emerald-400) ⭐

### 6. **Répartitions**

#### 6.1. Répartition Sectorielle ⭐
- **Tri décroissant** (du plus grand % au plus petit)
- Graphique camembert
- Liste triée en dessous

#### 6.2. Répartition Géographique ⭐
- **Tri décroissant** (du plus grand % au plus petit)
- Graphique camembert
- Liste triée en dessous

## 🎨 Améliorations visuelles

### Couleurs mises en valeur
- ✅ **Prix de la part** : Vert (emerald-400)
- ✅ **Taux d'Occupation** : Vert (emerald-400)
- ✅ **Val. Reconstitution** : Vert (emerald-400)

### Responsive
- ✅ Profil de risque adaptatif (compact sur mobile, large sur desktop)
- ✅ Grilles responsive (2 colonnes mobile, 5-6 colonnes desktop)

## 📝 Notes importantes

- Toutes les sections sont conditionnelles (s'affichent uniquement si données disponibles)
- Les répartitions sont automatiquement triées par ordre décroissant
- La note sur 5 étoiles est calculée automatiquement selon les critères :
  - Capitalisation ≥ 50M€
  - TOF ≥ 90%
  - Décote présente
  - Rendement ≥ 5.5% (France) ou ≥ 6% (Europe)
  - Endettement ≤ 30%
  → Si tous remplis : **5/5 automatique**

## 🔧 Scripts disponibles

- `scripts/extractScpiQuarterlyData.ts` : Extraction des données locatives depuis PDFs/textes
  - Nombre de locataires
  - WALT
  - WALB
