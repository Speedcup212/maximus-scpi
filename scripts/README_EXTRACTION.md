# Extraction de données SCPI depuis bulletins trimestriels

## Installation

```bash
npm install pdf-parse @types/pdf-parse
```

## Utilisation

### Mise à jour automatique depuis un bulletin PDF (RECOMMANDÉ)

```bash
node scripts/updateScpiFromBulletinAuto.cjs "BTI-T3-2025-Comete-1.pdf" "Comète"
```

Ce script :
- ✅ Extrait automatiquement toutes les données du PDF
- ✅ Met à jour l'endettement si trouvé dans le bulletin
- ✅ Met à jour la collecte nette, nombre de cessions, etc.
- ✅ Met à jour le fichier JSON automatiquement

### Extraction manuelle (pour vérification)

#### Depuis un fichier PDF

```bash
npx tsx scripts/extractScpiQuarterlyData.ts bulletin-comete-2025-q4.pdf
```

#### Depuis un fichier texte

```bash
npx tsx scripts/extractScpiQuarterlyData.ts texte.txt "Comète"
```

#### Avec nom de SCPI explicite

```bash
npx tsx scripts/extractScpiQuarterlyData.ts bulletin.pdf "Iroko Zen"
```

## Format de sortie

Le script retourne un JSON au format strict :

```json
{
  "scpi": "Comète",
  "periode": "2025-Q4",
  "nombre_locataires": 150,
  "walt": 6.0,
  "walb": 4.5,
  "sources": {
    "nombre_locataires": "Nombre de locataires: 150",
    "walt": "WALT: 6 ans",
    "walb": "WALB: 4.5 ans"
  }
}
```

## Règles d'extraction

- ✅ **Strict** : Aucune donnée inventée
- ✅ **Sourcé** : Chaque donnée extraite a une source textuelle
- ✅ **Null si absent** : Si une donnée n'est pas explicitement écrite → `null`
- ✅ **Conversion automatique** : Mois → Années pour WALT/WALB (ex: 72 mois = 6 ans)

## Patterns recherchés

### Nombre de locataires
- "Nombre de locataires: 150"
- "Locataires: 150"
- "150 locataires"
- "Total locataires: 150"

### WALT
- "WALT: 6 ans"
- "WALT de 6 ans"
- "WALT 72 mois" (converti en 6 ans)
- Doit être explicitement nommé "WALT"

### WALB
- "WALB: 4.5 ans"
- "WALB de 4.5 ans"
- "WALB 54 mois" (converti en 4.5 ans)
- Doit être explicitement nommé "WALB"

## Mise à jour des répartitions sectorielles et géographiques

Les répartitions sont souvent présentées sous forme d'images dans les bulletins trimestriels. Pour les mettre à jour :

### Méthode 1 : Script direct (pour Comète T3 2025)

```bash
node scripts/updateCometeRepartitions.cjs
```

### Méthode 2 : Via fichier JSON

1. Créer un fichier JSON avec les répartitions extraites manuellement depuis l'image :

```json
{
  "secteurs": {
    "Commerce": 26,
    "Bureau": 21,
    "Mixte": 17,
    "Hôtellerie": 14,
    "Logistique": 10,
    "Loisir": 9,
    "Éducation": 3
  },
  "geographie": {
    "Royaume-Uni": 43,
    "Espagne": 23,
    "Pays-Bas": 16,
    "Italie": 12,
    "Irlande": 6,
    "Belgique": 3
  }
}
```

2. Exécuter le script :

```bash
node scripts/updateRepartitionsFromBulletin.cjs "Comète" repartitions-comete-t3-2025.json
```

**Note** : Les répartitions doivent être triées par pourcentage décroissant dans l'affichage (géré automatiquement par le script).

## Intégration dans le code

```typescript
import { extractScpiDataFromPdf, extractScpiDataFromText } from './scripts/extractScpiQuarterlyData';

// Depuis un PDF
const result = await extractScpiDataFromPdf('bulletin.pdf', 'Comète');

// Depuis du texte
const result = extractScpiDataFromText(textContent, 'Comète');

// Utiliser les données
if (result.nombre_locataires) {
  scpi.nombreLocataires = result.nombre_locataires;
}
if (result.walt) {
  scpi.walt = result.walt;
}
if (result.walb) {
  scpi.walb = result.walb;
}
```
