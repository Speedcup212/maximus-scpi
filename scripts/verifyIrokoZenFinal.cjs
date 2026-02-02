const fs = require('fs');
const path = require('path');

// Simuler la logique complète
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

// Fonction de fusion (copie de scpiData.ts)
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

const merged = mergeScpiEntries(scpiCompletJson);
const iroko = merged.find(s => s['Nom SCPI'] === 'Iroko Zen');

console.log('✅ Test de fusion et recherche:');
console.log('  Nombre d\'entrées après fusion:', merged.filter(s => s['Nom SCPI'] === 'Iroko Zen').length);
console.log('  Iroko Zen trouvé:', iroko ? '✅ OUI' : '❌ NON');

if (iroko) {
  console.log('\n✅ Données Iroko Zen après fusion:');
  console.log('  Période bulletin:', iroko['Période bulletin trimestriel'] || 'Aucune');
  console.log('  Actualités trimestrielles:', iroko['Actualités trimestrielles'] ? '✅ Présent' : '❌ Absent');
  
  if (iroko['Actualités trimestrielles']) {
    const actu = iroko['Actualités trimestrielles'];
    console.log('  Début:', actu.substring(0, 70) + '...');
    console.log('  Contient "Mise à jour BULLETIN":', actu.includes('Mise à jour BULLETIN TRIMESTRIEL'));
    
    // Simuler getScpiNews
    const actualites = actu.split(' | ');
    const first = actualites[0];
    const isBulletinUpdate = first.includes('BULLETIN TRIMESTRIEL') || 
                             first.includes('bulletin trimestriel') ||
                             first.includes('Mise à jour');
    console.log('  Première actualité détectée comme bulletin:', isBulletinUpdate ? '✅ OUI' : '❌ NON');
  }
}
