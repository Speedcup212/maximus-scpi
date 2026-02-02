const fs = require('fs');
const path = require('path');

// Simuler la structure Scpi
const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const comete = data.find(s => s['Nom SCPI'] === 'Comète');

if (!comete) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

// Simuler la structure Scpi pour getScpiNews
const scpi = {
  name: comete['Nom SCPI'],
  actualitesTrimestrielles: comete['Actualités trimestrielles'],
  periodeBulletinTrimestriel: comete['Période bulletin trimestriel']
};

console.log('✅ Test de getScpiNews pour Comète\n');
console.log('Actualités brutes:');
console.log('='.repeat(80));
console.log(scpi.actualitesTrimestrielles?.substring(0, 300) + '...\n');

// Simuler la logique de getScpiNews
if (!scpi.actualitesTrimestrielles) {
  console.log('❌ Pas d\'actualités trimestrielles');
  process.exit(1);
}

const actualites = scpi.actualitesTrimestrielles.split(' | ');
console.log(`Nombre d'actualités brutes: ${actualites.length}\n`);

// Filtrer les mentions de bulletin trimestriel
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

console.log(`Nombre d'actualités après filtrage: ${filteredActualites.length}\n`);

// Chercher les acquisitions
const acquisitions = filteredActualites.filter(actu => 
  actu.includes('acquisition') || actu.includes('Acquisition')
);

console.log(`Acquisitions trouvées: ${acquisitions.length}`);
acquisitions.forEach((acq, i) => {
  console.log(`  ${i + 1}. ${acq.substring(0, 80)}...`);
});

console.log('\n✅ Les actualités sont bien présentes et devraient être affichées');
