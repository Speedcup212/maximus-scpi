const fs = require('fs');
const path = require('path');

// Simuler la fonction mergeScpiEntries
function mergeScpiEntries(entries) {
  const merged = {};
  
  entries.forEach((entry) => {
    const nom = entry['Nom SCPI'];
    if (!nom) return;
    
    if (!merged[nom]) {
      merged[nom] = { ...entry };
    } else {
      const existing = merged[nom];
      
      if (entry['Période bulletin trimestriel'] && !existing['Période bulletin trimestriel']) {
        if (entry['Actualités trimestrielles']) {
          existing['Actualités trimestrielles'] = entry['Actualités trimestrielles'];
        }
        if (entry['Période bulletin trimestriel']) {
          existing['Période bulletin trimestriel'] = entry['Période bulletin trimestriel'];
        }
        if (entry['Nombre de locataires'] !== undefined) {
          existing['Nombre de locataires'] = entry['Nombre de locataires'];
        }
        if (entry['WALT'] !== undefined) {
          existing['WALT'] = entry['WALT'];
        }
        if (entry['WALB'] !== undefined) {
          existing['WALB'] = entry['WALB'];
        }
        if (entry['Collecte nette trimestre'] !== undefined) {
          existing['Collecte nette trimestre'] = entry['Collecte nette trimestre'];
        }
        if (entry['TOP (%)'] !== undefined) {
          existing['TOP (%)'] = entry['TOP (%)'];
        }
      } else if (!entry['Période bulletin trimestriel'] && existing['Période bulletin trimestriel']) {
        const temp = { ...existing };
        Object.assign(existing, entry);
        if (temp['Actualités trimestrielles']) {
          existing['Actualités trimestrielles'] = temp['Actualités trimestrielles'];
        }
        if (temp['Période bulletin trimestriel']) {
          existing['Période bulletin trimestriel'] = temp['Période bulletin trimestriel'];
        }
      }
    }
  });
  
  return Object.values(merged);
}

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const irokoEntries = data.filter(s => s['Nom SCPI'] === 'Iroko Zen');
console.log('Avant fusion - Nombre d\'entrées Iroko Zen:', irokoEntries.length);

const merged = mergeScpiEntries(data);
const irokoMerged = merged.find(s => s['Nom SCPI'] === 'Iroko Zen');

if (irokoMerged) {
  console.log('\n✅ Après fusion:');
  console.log('  Période bulletin:', irokoMerged['Période bulletin trimestriel'] || 'Aucune');
  console.log('  Actualités trimestrielles:', irokoMerged['Actualités trimestrielles'] ? '✅ Présent' : '❌ Absent');
  if (irokoMerged['Actualités trimestrielles']) {
    const actu = irokoMerged['Actualités trimestrielles'];
    console.log('  Début:', actu.substring(0, 80) + '...');
    console.log('  Contient "Mise à jour BULLETIN":', actu.includes('Mise à jour BULLETIN TRIMESTRIEL'));
  }
} else {
  console.log('❌ Iroko Zen non trouvé après fusion');
}
