const fs = require('fs');
const path = require('path');

// Simuler getScpiNews avec les données réelles
const scpiCompletJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/scpi_complet.json'), 'utf8'));

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
      }
    }
  });
  return Object.values(merged);
}

const merged = mergeScpiEntries(scpiCompletJson);
const cometeRaw = merged.find(s => s['Nom SCPI'] === 'Comète');

if (!cometeRaw) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

const scpi = {
  name: cometeRaw['Nom SCPI'],
  actualitesTrimestrielles: cometeRaw['Actualités trimestrielles'] || undefined
};

console.log('✅ Test de détection des doublons de type\n');
console.log('='.repeat(80));

if (!scpi.actualitesTrimestrielles) {
  console.log('❌ Pas d\'actualités');
  process.exit(1);
}

// Simuler la fonction hasTypeInText
const hasTypeInText = (text) => {
  return /\(commerce|logistique|bureaux|santé|résidentiel|hôtellerie|activités\)\s*$/i.test(text.trim());
};

const actualites = scpi.actualitesTrimestrielles.split(' | ');
const filteredActualites = actualites.filter(actu => {
  const isBulletinUpdate = actu.includes('BULLETIN TRIMESTRIEL') || 
                           actu.includes('bulletin trimestriel') ||
                           actu.includes('Mise à jour BULLETIN') ||
                           actu.includes('MISE À JOUR BULLETIN');
  return !isBulletinUpdate;
});

console.log('Vérification des doublons de type:\n');

let doublonsTrouves = 0;
filteredActualites.forEach((actu, i) => {
  if (actu.toLowerCase().includes('acquisition')) {
    const hasType = hasTypeInText(actu);
    const typeCount = (actu.match(/\(commerce\)|\(logistique\)|\(bureaux\)|\(santé\)|\(résidentiel\)|\(hôtellerie\)|\(activités\)/gi) || []).length;
    
    if (typeCount > 1) {
      doublonsTrouves++;
      console.log(`❌ Doublon trouvé (${i + 1}):`);
      console.log(`   ${actu.substring(0, 120)}...`);
      console.log(`   Nombre de types détectés: ${typeCount}`);
    } else if (hasType && typeCount === 1) {
      console.log(`✅ OK (${i + 1}): Type présent une seule fois`);
      console.log(`   ${actu.substring(0, 100)}...`);
    }
  }
});

console.log('\n' + '='.repeat(80));
if (doublonsTrouves === 0) {
  console.log('✅ Aucun doublon détecté - la correction fonctionne !');
} else {
  console.log(`❌ ${doublonsTrouves} doublon(s) détecté(s)`);
}
