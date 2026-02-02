# Traitement en Continu des Bulletins Trimestriels SCPI

## Vue d'ensemble

Ce système permet de traiter automatiquement les bulletins trimestriels SCPI et de générer :
- Le JSON de mise à jour pour `scpi_complet.json`
- Le tag de complétude des données (🟢/🟠/🔴)
- La liste des indicateurs absents

## Règles absolues

✅ **Respectées automatiquement** :
- Aucune interprétation des données
- Aucune estimation de valeurs manquantes
- Donnée absente = `null`
- Chaque SCPI traitée indépendamment
- Aucune comparaison entre SCPI

## Format d'entrée

```typescript
interface BulletinData {
  nomScpi: string;           // Ex: "Comète"
  periode: string;           // Ex: "T3 2025" ou "2025-Q3"
  
  // Indicateurs (null si absent)
  endettement?: number | null;
  collecteNetteTrimestre?: number | null;
  nbCessionsTrimestre?: number | null;
  nombreLocataires?: number | null;
  walt?: number | null;
  walb?: number | null;
  tof?: number | null;
  tauxDistribution?: number | null;
  distribution?: number | null;
  capitalisation?: number | null;
  prixPart?: number | null;
  valeurReconstitution?: number | null;
  decoteSurcote?: number | null;
  
  // Répartitions (optionnel)
  repartitionSectorielle?: Record<string, number> | null;
  repartitionGeographique?: Record<string, number> | null;
  
  // Actualités (tableau de faits bruts)
  actualitesTrimestrielles?: string[] | null;
}
```

## Format de sortie

```json
{
  "scpi": "Comète",
  "periode": "T3 2025",
  "json_update": {
    "Période bulletin trimestriel": "T3 2025",
    "Endettement (%)": 0.1,
    "Collecte nette trimestre": 103800000,
    "Nombre de cessions trimestre": 0,
    "Nombre de locataires": 67,
    "WALT": 10.4,
    "WALB": 8.4,
    "Actualités trimestrielles": "Fait 1 | Fait 2 | Fait 3"
  },
  "completeness": {
    "score": 8,
    "niveau": "partielles",
    "indicateurs_presents": ["taux_de_distribution", "tof", "collecte_nette_trimestre", ...],
    "indicateurs_absents": ["walt", "walb"],
    "tag": "🟠 Données partielles (8/11)"
  },
  "indicateurs_absents": ["walt", "walb"]
}
```

## Utilisation

### Méthode 1 : Via TypeScript

```typescript
import { processAndOutput } from './scripts/processBulletinTrimestriel.ts';

const bulletinData = {
  nomScpi: "Comète",
  periode: "T3 2025",
  endettement: 0.1,
  collecteNetteTrimestre: 103800000,
  // ... autres données
};

// Générer le résultat (sans appliquer)
const result = processAndOutput(bulletinData, false);

// Appliquer la mise à jour au JSON
processAndOutput(bulletinData, true);
```

### Méthode 2 : Via fichier JSON

Créez un fichier `bulletin_data.json` :

```json
{
  "nomScpi": "Comète",
  "periode": "T3 2025",
  "endettement": 0.1,
  "collecteNetteTrimestre": 103800000,
  "nbCessionsTrimestre": 0,
  "nombreLocataires": 67,
  "walt": 10.4,
  "walb": 8.4,
  "actualitesTrimestrielles": [
    "Collecte nette de 103,8 M€ au T3 2025",
    "Aucune cession au trimestre",
    "Endettement à 0,1%"
  ]
}
```

Puis exécutez :

```bash
npx tsx scripts/processBulletinTrimestriel.ts < bulletin_data.json
```

## Indicateurs vérifiés (11 au total)

1. **Taux de distribution / distribution** - `tauxDistribution` ou `distribution`
2. **TOF** - `tof`
3. **Collecte nette trimestrielle** - `collecteNetteTrimestre`
4. **Capitalisation** - `capitalisation`
5. **Prix de part** - `prixPart`
6. **Valeur de reconstitution** - `valeurReconstitution`
7. **Décote / Surcote** - `decoteSurcote` (explicite) OU calculable si `prixPart` + `valeurReconstitution` présents
8. **WALT** - `walt`
9. **WALB** - `walb`
10. **Nombre de locataires** - `nombreLocataires`
11. **Endettement** - `endettement`

## Niveaux de complétude

- **🟢 Données complètes** : 10-11 indicateurs présents
- **🟠 Données partielles** : 7-9 indicateurs présents
- **🔴 Données limitées** : 6 ou moins indicateurs présents

## Exemple complet

```typescript
import { processAndOutput } from './scripts/processBulletinTrimestriel.ts';

// Données extraites du bulletin T3 2025 de Comète
const bulletinComete = {
  nomScpi: "Comète",
  periode: "T3 2025",
  endettement: 0.1,
  collecteNetteTrimestre: 103800000,
  nbCessionsTrimestre: 0,
  nombreLocataires: 67,
  walt: 10.4,
  walb: 8.4,
  actualitesTrimestrielles: [
    "Collecte nette de 103,8 M€ au T3 2025",
    "Aucune cession au trimestre",
    "Endettement à 0,1%",
    "WALT de 10,4 ans"
  ]
};

// Traiter et afficher le résultat
const result = processAndOutput(bulletinComete, false);

// Le résultat contient :
// - json_update : JSON prêt pour scpi_complet.json
// - completeness : Tag de complétude et score
// - indicateurs_absents : Liste des indicateurs manquants
```

## Notes importantes

⚠️ **Ne jamais** :
- Inventer des données
- Interpréter les chiffres
- Comparer entre SCPI
- Extrapoler depuis des graphiques seuls
- Mettre des valeurs par défaut

✅ **Toujours** :
- Utiliser uniquement les données explicitement publiées
- Mettre `null` pour les données absentes
- Traiter chaque SCPI indépendamment
- Vérifier la cohérence avant d'appliquer

## ⚠️ Erreurs critiques à éviter

### 1. Confusion répartition sectorielle / géographique

❌ **ERREUR** : Mettre des zones géographiques dans la répartition sectorielle
```json
// ❌ MAUVAIS
"repartitionSectorielle": {
  "Régions": 86.0,
  "Île-de-France": 14.0
}
```

✅ **CORRECT** : La répartition sectorielle doit contenir des secteurs d'activité
```json
// ✅ BON
"repartitionSectorielle": {
  "Bureaux": 51.08,
  "Commerces": 29.62,
  "Logistique et locaux d'activités": 17.47,
  "Santé et éducation": 1.77,
  "Alternatifs": 0.06
}
```

❌ **ERREUR** : Mettre des secteurs dans la répartition géographique
```json
// ❌ MAUVAIS
"repartitionGeographique": {
  "Bureaux": 51.08,
  "Commerces": 29.62
}
```

✅ **CORRECT** : La répartition géographique doit contenir des zones géographiques
```json
// ✅ BON
"repartitionGeographique": {
  "Régions": 86.0,
  "Île-de-France": 14.0
}
```

### 2. Vérification des totaux

✅ **Toujours vérifier** que les répartitions totalisent 100% (à ±0.01% près pour arrondis) :
```javascript
const totalSectoriel = Object.values(repartitionSectorielle).reduce((a, b) => a + b, 0);
// Doit être ≈ 100.00
const totalGeographique = Object.values(repartitionGeographique).reduce((a, b) => a + b, 0);
// Doit être ≈ 100.00
```

### 3. Nom exact de la SCPI

⚠️ **Vérifier le nom exact** dans `scpi_complet.json` avant traitement :
- "Coeur de Région" (sans "s" à Région) ≠ "Cœur de Régions" (avec "s")
- Utiliser la correspondance exacte ou la recherche insensible à la casse
- En cas de doute, chercher dans `scpi_complet.json` avec `grep` ou recherche dans le fichier

### 4. Cohérence des données entre fichiers

✅ **Après mise à jour de `scpi_complet.json`**, vérifier si `scpiDataExtended.ts` doit être mis à jour :
- Si les répartitions sectorielles/géographiques changent dans `scpi_complet.json`
- Mettre à jour manuellement `scpiDataExtended.ts` pour éviter les incohérences dans l'UI
- Les secteurs dans `scpiDataExtended.ts` doivent correspondre aux secteurs réels (Bureaux, Commerces, etc.), pas aux zones géographiques

### 5. Format des répartitions

✅ **Format texte** : Générer automatiquement depuis le JSON
```typescript
// Exemple de génération du format texte
const secteursTexte = Object.entries(repartitionSectorielle)
  .sort((a, b) => b[1] - a[1]) // Trier par pourcentage décroissant
  .map(([secteur, pct]) => `${secteur} (${pct.toFixed(2)}%)`)
  .join(', ');
// Résultat: "Bureaux (51,08%), Commerces (29,62%), ..."
```

### 6. Vérification avant application

✅ **Checklist avant d'appliquer** :
- [ ] Nom de la SCPI correspond exactement
- [ ] Répartition sectorielle = secteurs (Bureaux, Commerces, Logistique, etc.)
- [ ] Répartition géographique = zones (Régions, Île-de-France, Pays, etc.)
- [ ] Totaux ≈ 100% pour les deux répartitions
- [ ] Aucune donnée inventée (toutes explicites dans le bulletin)
- [ ] `null` pour toutes les données absentes
- [ ] Actualités = faits bruts uniquement, pas d'interprétation
- [ ] **Prix de souscription** : Si le prix de la part a changé dans le bulletin, vérifier que le prix de souscription sera mis à jour dans l'entrée principale ET trimestrielle

### 7. Prix de souscription et prix de part

⚠️ **RÈGLE IMPORTANTE** : Si le prix de la part augmente dans le bulletin, le prix de souscription doit être mis à jour en conséquence.

✅ **Exemple** :
- Bulletin indique : "Prix d'une part : 204€" (au lieu de 202€ précédemment)
- Le bulletin mentionne : "Le prix de part est passé de 202€ à 204€ le 1er août 2025"
- **Action requise** : Mettre à jour `Prix de souscription (€)` à 204€ dans l'entrée principale ET dans l'entrée trimestrielle

✅ **Vérification** :
- Si `prixPart` dans le bulletin est différent de `Prix de souscription (€)` dans `scpi_complet.json`
- ET que le bulletin mentionne explicitement un changement de prix
- ALORS mettre à jour `Prix de souscription (€)` avec la nouvelle valeur

### 8. Exemple d'erreur corrigée (Cœur de Région T3 2025)

**Problème identifié** :
- Dans `scpiDataExtended.ts`, la répartition sectorielle contenait "Régions" et "Île-de-France" (données géographiques)
- Incohérence avec `scpi_complet.json` qui contenait les bons secteurs

**Correction appliquée** :
- Mise à jour de `scpiDataExtended.ts` avec les vrais secteurs : Bureaux, Commerces, Logistique, etc.
- Mise à jour de la géographie : Régions 86%, Île-de-France 14%
- Cohérence rétablie entre les deux fichiers
