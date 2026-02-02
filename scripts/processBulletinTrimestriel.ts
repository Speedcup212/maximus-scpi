/**
 * Script de traitement en continu des bulletins trimestriels SCPI
 * 
 * Règles absolues :
 * - Aucune interprétation
 * - Aucune estimation
 * - Donnée absente = null
 * - Chaque SCPI traitée indépendamment
 * 
 * ⚠️ ERREURS CRITIQUES À ÉVITER :
 * 
 * 1. CONFUSION RÉPARTITION SECTORIELLE / GÉOGRAPHIQUE
 *    ❌ Ne JAMAIS mettre des zones géographiques dans repartitionSectorielle
 *    ❌ Ne JAMAIS mettre des secteurs dans repartitionGeographique
 *    ✅ Sectorielle = secteurs d'activité (Bureaux, Commerces, Logistique, etc.)
 *    ✅ Géographique = zones géographiques (Régions, Île-de-France, Pays, etc.)
 * 
 * 2. VÉRIFICATION DES TOTAUX
 *    ✅ Toujours vérifier que les répartitions totalisent ≈ 100%
 * 
 * 3. NOM EXACT DE LA SCPI
 *    ✅ Vérifier le nom exact dans scpi_complet.json (ex: "Coeur de Région" ≠ "Cœur de Régions")
 * 
 * 4. COHÉRENCE ENTRE FICHIERS
 *    ✅ Après mise à jour de scpi_complet.json, vérifier si scpiDataExtended.ts doit être mis à jour
 *    ✅ Les secteurs dans scpiDataExtended.ts doivent être les vrais secteurs, pas des zones géographiques
 * 
 * 5. PRIX DE SOUSCRIPTION ET PRIX DE PART
 *    ⚠️ Si le prix de la part augmente dans le bulletin, le prix de souscription DOIT être mis à jour
 *    ✅ Si prixPart dans le bulletin ≠ Prix de souscription dans scpi_complet.json
 *    ✅ ET que le bulletin mentionne explicitement un changement de prix
 *    ✅ ALORS mettre à jour Prix de souscription (€) avec la nouvelle valeur dans l'entrée principale ET trimestrielle
 *    ✅ Exemple: Bulletin indique "Prix d'une part: 204€" (était 202€) → Mettre à jour Prix de souscription à 204€
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkScpiDataCompleteness, getCompletenessDisplay } from '../src/utils/scpiDataCompleteness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCPI_DATA_PATH = path.join(__dirname, '../src/data/scpi_complet.json');

/**
 * Interface pour les données extraites d'un bulletin trimestriel
 */
interface BulletinData {
  nomScpi: string;
  periode: string; // Format: "T3 2025" ou "2025-Q3"
  
  // Indicateurs chiffrés (null si absent)
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
  
  // Répartitions (optionnel, si mises à jour)
  repartitionSectorielle?: Record<string, number> | null;
  repartitionGeographique?: Record<string, number> | null;
  
  // Actualités trimestrielles (factuelles uniquement)
  actualitesTrimestrielles?: string[] | null; // Tableau de faits bruts
}

/**
 * Interface pour le résultat de traitement
 */
interface ProcessingResult {
  scpi: string;
  periode: string;
  jsonUpdate: Record<string, any>; // JSON pour mise à jour de scpi_complet.json
  completeness: {
    score: number;
    niveau: 'completes' | 'partielles' | 'limitees';
    indicateurs_presents: string[];
    indicateurs_absents: string[];
    tag: string; // Emoji + label
  };
  indicateurs_absents: string[];
}

/**
 * Normalise la période au format attendu par le système
 */
function normalizePeriode(periode: string): string {
  // Format attendu: "T3 2025" pour l'affichage
  if (periode.match(/^\d{4}-Q\d$/)) {
    // Convertir "2025-Q3" en "T3 2025"
    const match = periode.match(/(\d{4})-Q(\d)/);
    if (match) {
      return `T${match[2]} ${match[1]}`;
    }
  }
  return periode;
}

/**
 * Convertit les données du bulletin en format JSON pour scpi_complet.json
 */
function generateJsonUpdate(bulletinData: BulletinData): Record<string, any> {
  const update: Record<string, any> = {};
  
  // Période du bulletin
  if (bulletinData.periode) {
    update['Période bulletin trimestriel'] = normalizePeriode(bulletinData.periode);
  }
  
  // Indicateurs chiffrés
  if (bulletinData.endettement !== undefined) {
    update['Endettement (%)'] = bulletinData.endettement;
  }
  
  if (bulletinData.collecteNetteTrimestre !== undefined) {
    update['Collecte nette trimestre'] = bulletinData.collecteNetteTrimestre;
  }
  
  if (bulletinData.nbCessionsTrimestre !== undefined) {
    update['Nombre de cessions trimestre'] = bulletinData.nbCessionsTrimestre;
  }
  
  if (bulletinData.nombreLocataires !== undefined) {
    update['Nombre de locataires'] = bulletinData.nombreLocataires;
  }
  
  if (bulletinData.walt !== undefined) {
    update['WALT'] = bulletinData.walt;
  }
  
  if (bulletinData.walb !== undefined) {
    update['WALB'] = bulletinData.walb;
  }
  
  if (bulletinData.tof !== undefined) {
    update['TOF (%)'] = bulletinData.tof;
  }
  
  if (bulletinData.tauxDistribution !== undefined) {
    update['Taux de distribution (%)'] = bulletinData.tauxDistribution;
  }
  
  if (bulletinData.distribution !== undefined) {
    update['Distribution (€/part)'] = bulletinData.distribution;
  }
  
  if (bulletinData.capitalisation !== undefined) {
    update['Capitalisation (M€)'] = bulletinData.capitalisation;
  }
  
  if (bulletinData.prixPart !== undefined) {
    update['Prix de souscription (€)'] = bulletinData.prixPart;
    // ⚠️ RÈGLE IMPORTANTE : Si le prix de la part change, le prix de souscription doit être mis à jour
    // Cette mise à jour sera appliquée à l'entrée trimestrielle ET à l'entrée principale lors de l'application
  }
  
  if (bulletinData.valeurReconstitution !== undefined) {
    update['Valeur de reconstitution (€)'] = bulletinData.valeurReconstitution;
  }
  
  if (bulletinData.decoteSurcote !== undefined) {
    update['Surcote/décote (%)'] = bulletinData.decoteSurcote;
  }
  
  // Répartitions
  // ⚠️ VÉRIFICATION CRITIQUE : S'assurer que sectorielle = secteurs, géographique = zones
  if (bulletinData.repartitionSectorielle) {
    // Vérifier que ce sont bien des secteurs (Bureaux, Commerces, etc.) et non des zones géographiques
    const secteursValides = ['Bureaux', 'Commerces', 'Commerce', 'Logistique', 'Santé', 'Éducation', 
                             'Hôtellerie', 'Résidentiel', 'Alternatifs', 'Activités', 'Locaux d\'activités'];
    const premierSecteur = Object.keys(bulletinData.repartitionSectorielle)[0];
    const estSecteur = secteursValides.some(s => premierSecteur.includes(s) || premierSecteur.toLowerCase().includes(s.toLowerCase()));
    
    if (!estSecteur && (premierSecteur.includes('Région') || premierSecteur.includes('Île-de-France') || premierSecteur.includes('Paris'))) {
      console.warn(`⚠️ ATTENTION: La répartition sectorielle semble contenir des zones géographiques: ${premierSecteur}`);
      console.warn('   Vérifiez que vous n\'avez pas inversé sectorielle et géographique !');
    }
    
    update['Répartition Sectorielle JSON'] = bulletinData.repartitionSectorielle;
    
    // Générer le format texte automatiquement
    const secteursTexte = Object.entries(bulletinData.repartitionSectorielle)
      .sort((a, b) => b[1] - a[1])
      .map(([secteur, pct]) => `${secteur} (${pct.toFixed(2)}%)`)
      .join(', ');
    update['Répartition Sectorielle'] = secteursTexte;
  }
  
  if (bulletinData.repartitionGeographique) {
    // Vérifier que ce sont bien des zones géographiques et non des secteurs
    const zonesValides = ['Régions', 'Île-de-France', 'Paris', 'France', 'Espagne', 'Allemagne', 'Italie', 'Pays-Bas', 'Belgique'];
    const premiereZone = Object.keys(bulletinData.repartitionGeographique)[0];
    const estZone = zonesValides.some(z => premiereZone.includes(z) || premiereZone.toLowerCase().includes(z.toLowerCase()));
    
    if (!estZone && (premiereZone.includes('Bureau') || premiereZone.includes('Commerce') || premiereZone.includes('Logistique'))) {
      console.warn(`⚠️ ATTENTION: La répartition géographique semble contenir des secteurs: ${premiereZone}`);
      console.warn('   Vérifiez que vous n\'avez pas inversé sectorielle et géographique !');
    }
    
    update['Répartition Géographique JSON'] = bulletinData.repartitionGeographique;
    
    // Générer le format texte automatiquement
    const geographieTexte = Object.entries(bulletinData.repartitionGeographique)
      .sort((a, b) => b[1] - a[1])
      .map(([zone, pct]) => `${zone} (${pct.toFixed(1)}%)`)
      .join(', ');
    update['Répartition Géographique'] = geographieTexte;
  }
  
  // Actualités trimestrielles (séparées par " | ")
  if (bulletinData.actualitesTrimestrielles && bulletinData.actualitesTrimestrielles.length > 0) {
    update['Actualités trimestrielles'] = bulletinData.actualitesTrimestrielles.join(' | ');
  }
  
  return update;
}

/**
 * Traite un bulletin trimestriel et génère le résultat complet
 */
export function processBulletinTrimestriel(bulletinData: BulletinData): ProcessingResult {
  // Générer le JSON de mise à jour
  const jsonUpdate = generateJsonUpdate(bulletinData);
  
  // Trouver la SCPI dans les données existantes
  const scpiCompletData = JSON.parse(fs.readFileSync(SCPI_DATA_PATH, 'utf8'));
  const scpiEntry = scpiCompletData.find((s: any) => 
    s['Nom SCPI']?.toLowerCase().includes(bulletinData.nomScpi.toLowerCase()) ||
    bulletinData.nomScpi.toLowerCase().includes(s['Nom SCPI']?.toLowerCase() || '')
  );
  
  if (!scpiEntry) {
    throw new Error(`SCPI "${bulletinData.nomScpi}" non trouvée dans scpi_complet.json`);
  }
  
  // Créer un objet Scpi temporaire pour la vérification de complétude
  // Utiliser le type any pour éviter les problèmes d'import
  const scpiForCompleteness: any = {
    id: 0,
    name: scpiEntry['Nom SCPI'],
    sector: 'diversifie',
    geography: 'france',
    yield: bulletinData.tauxDistribution ?? scpiEntry['Taux de distribution (%)'] ?? 0,
    capitalization: bulletinData.capitalisation ?? scpiEntry['Capitalisation (M€)'] ?? 0,
    tof: bulletinData.tof ?? scpiEntry['TOF (%)'] ?? 0,
    price: bulletinData.prixPart ?? scpiEntry['Prix de souscription (€)'] ?? 0,
    discount: bulletinData.decoteSurcote ?? scpiEntry['Surcote/décote (%)'] ?? 0,
    fees: 0,
    isr: false,
    european: false,
    company: '',
    creation: 0,
    minInvest: 0,
    debt: bulletinData.endettement ?? scpiEntry['Endettement (%)'] ?? undefined,
    valeurReconstitution: bulletinData.valeurReconstitution ?? scpiEntry['Valeur de reconstitution (€)'] ?? undefined,
    distribution: bulletinData.distribution ?? scpiEntry['Distribution (€/part)'] ?? undefined,
    nombreLocataires: bulletinData.nombreLocataires ?? scpiEntry['Nombre de locataires'] ?? undefined,
    walt: bulletinData.walt ?? scpiEntry['WALT'] ?? undefined,
    walb: bulletinData.walb ?? scpiEntry['WALB'] ?? undefined,
    collecteNetteTrimestre: bulletinData.collecteNetteTrimestre ?? scpiEntry['Collecte nette trimestre'] ?? undefined,
    periodeBulletinTrimestriel: normalizePeriode(bulletinData.periode),
  };
  
  // Vérifier la complétude
  const completenessResult = checkScpiDataCompleteness(scpiForCompleteness);
  const completenessDisplay = getCompletenessDisplay(completenessResult.donnees_completes_niveau);
  
  return {
    scpi: bulletinData.nomScpi,
    periode: normalizePeriode(bulletinData.periode),
    jsonUpdate,
    completeness: {
      score: completenessResult.donnees_completes_score,
      niveau: completenessResult.donnees_completes_niveau,
      indicateurs_presents: completenessResult.indicateurs_presents,
      indicateurs_absents: completenessResult.indicateurs_absents,
      tag: `${completenessDisplay.emoji} ${completenessDisplay.label} (${completenessResult.donnees_completes_score}/11)`,
    },
    indicateurs_absents: completenessResult.indicateurs_absents,
  };
}

/**
 * Applique la mise à jour au fichier scpi_complet.json
 * 
 * ⚠️ RÈGLE IMPORTANTE : Si le prix de la part change, le prix de souscription est automatiquement
 * mis à jour dans l'entrée principale ET dans l'entrée trimestrielle.
 */
export function applyUpdateToJson(nomScpi: string, jsonUpdate: Record<string, any>): void {
  const scpiCompletData = JSON.parse(fs.readFileSync(SCPI_DATA_PATH, 'utf8'));
  
  // Trouver toutes les entrées pour cette SCPI
  const scpiEntries = scpiCompletData.filter((s: any) => 
    s['Nom SCPI']?.toLowerCase().includes(nomScpi.toLowerCase()) ||
    nomScpi.toLowerCase().includes(s['Nom SCPI']?.toLowerCase() || '')
  );
  
  if (scpiEntries.length === 0) {
    throw new Error(`SCPI "${nomScpi}" non trouvée dans scpi_complet.json`);
  }
  
  // ⚠️ RÈGLE IMPORTANTE : Si le prix de la part change, mettre à jour le prix de souscription dans l'entrée principale
  if (jsonUpdate['Prix de souscription (€)'] !== undefined) {
    const nouveauPrix = jsonUpdate['Prix de souscription (€)'];
    
    // Trouver l'entrée principale (sans période bulletin trimestriel)
    const entreePrincipale = scpiEntries.find((e: any) => !e['Période bulletin trimestriel']);
    
    if (entreePrincipale) {
      const ancienPrix = entreePrincipale['Prix de souscription (€)'];
      if (ancienPrix !== nouveauPrix) {
        console.log(`⚠️ Prix de la part changé : ${ancienPrix}€ → ${nouveauPrix}€`);
        console.log(`   Mise à jour automatique du prix de souscription dans l'entrée principale...`);
        entreePrincipale['Prix de souscription (€)'] = nouveauPrix;
        // Mettre à jour aussi la valeur de retrait si elle était égale à l'ancien prix
        if (entreePrincipale['Valeur de retrait (€)'] === ancienPrix) {
          entreePrincipale['Valeur de retrait (€)'] = nouveauPrix;
        }
        // Recalculer la décote/surcote si nécessaire
        if (entreePrincipale['Valeur de reconstitution (€)'] && entreePrincipale['Surcote/décote (%)'] !== null && entreePrincipale['Surcote/décote (%)'] !== undefined) {
          const decoteSurcote = ((nouveauPrix - entreePrincipale['Valeur de reconstitution (€)']) / entreePrincipale['Valeur de reconstitution (€)']) * 100;
          entreePrincipale['Surcote/décote (%)'] = decoteSurcote;
        }
      }
    }
  }
  
  // Mettre à jour toutes les entrées trouvées (y compris l'entrée trimestrielle)
  scpiEntries.forEach((entry: any) => {
    Object.assign(entry, jsonUpdate);
  });
  
  // Sauvegarder
  fs.writeFileSync(SCPI_DATA_PATH, JSON.stringify(scpiCompletData, null, 2), 'utf8');
  console.log(`✅ Mise à jour appliquée pour ${nomScpi}`);
}

/**
 * Fonction principale pour traiter un bulletin et générer la sortie complète
 */
export function processAndOutput(bulletinData: BulletinData, applyUpdate: boolean = false): ProcessingResult {
  const result = processBulletinTrimestriel(bulletinData);
  
  // Afficher le résultat au format JSON strict
  const output = {
    scpi: result.scpi,
    periode: result.periode,
    json_update: result.jsonUpdate,
    completeness: result.completeness,
    indicateurs_absents: result.indicateurs_absents,
  };
  
  console.log(JSON.stringify(output, null, 2));
  
  // Appliquer la mise à jour si demandé
  if (applyUpdate) {
    applyUpdateToJson(bulletinData.nomScpi, result.jsonUpdate);
  }
  
  return result;
}

// Export pour utilisation en ligne de commande
if (import.meta.url === `file://${process.argv[1]}`) {
  // Mode CLI - lire depuis stdin ou fichier
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  let input = '';
  rl.on('line', (line) => {
    input += line + '\n';
  });
  
  rl.on('close', () => {
    try {
      const bulletinData = JSON.parse(input);
      const applyUpdate = process.argv.includes('--apply');
      processAndOutput(bulletinData, applyUpdate);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error.message);
      process.exit(1);
    }
  });
}
