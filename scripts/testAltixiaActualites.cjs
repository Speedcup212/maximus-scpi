const fs = require('fs');
const path = require('path');

// Simuler la fonction getScpiNews pour tester
const actualites = "Acquisition d'un ensemble de bureaux à Pozuelo de Alarcón (Madrid, Espagne), actif multilocataire certifié BREEAM, avec un rendement immobilier à l'acquisition supérieur à 8 % | Cession d'un actif de commerce à Rueil-Malmaison, générant une plus-value, avec complément de distribution évoqué dans le bulletin | Capitaux collectés intégralement investis au cours du trimestre | Mouvements locatifs enregistrés sur plusieurs actifs (entrées et sorties), détaillés dans le bulletin trimestriel";

console.log('🔍 Test de parsing des actualités Altixia Cadence 12\n');
console.log('Texte:', actualites);
console.log('\n---\n');

// Filtrer les mentions de bulletin trimestriel
const filteredActualites = actualites.split(' | ').filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

console.log('Après filtrage:', filteredActualites);
console.log('\n---\n');

const fullText = filteredActualites.join(' | ');
console.log('FullText:', fullText);
console.log('\n---\n');

// Tester le pattern pour "Acquisition d'un..."
const acqPattern = /(?:^|\|)\s*Acquisition\s+d'[^à]*à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)\s*\(([^)]+)\)[^|]*/gi;
const acqMatches = Array.from(fullText.matchAll(acqPattern));
console.log('Acquisitions trouvées:', acqMatches.length);
acqMatches.forEach((match, i) => {
  console.log(`  ${i+1}. Ville: "${match[1]}", Pays: "${match[2]}"`);
});

// Tester le pattern pour "Cession d'un..."
const cesPattern = /(?:^|\|)\s*Cession\s+d'[^à]*à\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']+?)(?:[,|]|$)/gi;
const cesMatches = Array.from(fullText.matchAll(cesPattern));
console.log('\nCessions trouvées:', cesMatches.length);
cesMatches.forEach((match, i) => {
  console.log(`  ${i+1}. Ville: "${match[1]}"`);
});

// Tester "Capitaux collectés"
const capPattern = /capitaux\s+collectés\s+intégralement\s+investis/i;
console.log('\nCapitaux collectés:', capPattern.test(fullText) ? 'TROUVÉ' : 'NON TROUVÉ');

// Tester "Mouvements locatifs"
const movPattern = /mouvements\s+locatifs/i;
console.log('Mouvements locatifs:', movPattern.test(fullText) ? 'TROUVÉ' : 'NON TROUVÉ');
