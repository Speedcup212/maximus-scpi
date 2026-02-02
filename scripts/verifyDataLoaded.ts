/**
 * Script pour vérifier que les données sont bien chargées depuis scpi_complet.json
 */

import { scpiData } from '../src/data/scpiData';

const transitionsEurope = scpiData.find(s => s.name.toLowerCase().includes('transitions europe'));

if (!transitionsEurope) {
  console.error('❌ Transitions Europe non trouvée dans scpiData');
  process.exit(1);
}

console.log('✅ Transitions Europe trouvée dans scpiData\n');
console.log('Données trimestrielles:');
console.log(`  - Période bulletin: ${transitionsEurope.periodeBulletinTrimestriel || '❌ Non trouvé'}`);
console.log(`  - Collecte nette trimestre: ${transitionsEurope.collecteNetteTrimestre ? `${(transitionsEurope.collecteNetteTrimestre / 1000000).toFixed(1)}M€` : '❌ Non trouvé'}`);
console.log(`  - Nombre de locataires: ${transitionsEurope.nombreLocataires || '❌ Non trouvé'}`);
console.log(`  - WALT: ${transitionsEurope.walt ? `${transitionsEurope.walt} ans` : '❌ Non trouvé'}`);
console.log(`  - WALB: ${transitionsEurope.walb ? `${transitionsEurope.walb} ans` : '❌ Non trouvé'}`);
console.log(`  - Actualités: ${transitionsEurope.actualitesTrimestrielles ? transitionsEurope.actualitesTrimestrielles.substring(0, 80) + '...' : '❌ Non trouvé'}`);

console.log('\nDonnées de base:');
console.log(`  - Capitalisation: ${(transitionsEurope.capitalization / 1000000).toFixed(0)}M€`);
console.log(`  - Prix: ${transitionsEurope.price}€`);
console.log(`  - TOF: ${transitionsEurope.tof}%`);
console.log(`  - Endettement: ${transitionsEurope.debt || 0}%`);
