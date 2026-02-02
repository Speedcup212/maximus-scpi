const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète exactement (chercher par index 11 ou par nom exact)
let comete = null;
let cometeIndex = -1;

// Chercher par index (on sait que c'est à l'index 11 d'après le script précédent)
if (data[11] && data[11]['Nom SCPI'] && data[11]['Nom SCPI'].includes('Com')) {
  comete = data[11];
  cometeIndex = 11;
} else {
  // Chercher par nom
  for (let i = 0; i < data.length; i++) {
    const nom = data[i]['Nom SCPI'];
    if (nom && (nom === 'Comète' || nom.charCodeAt(2) === 232)) { // 'è' en UTF-8
      comete = data[i];
      cometeIndex = i;
      break;
    }
  }
}

if (comete && cometeIndex >= 0) {
  console.log(`✅ Comète trouvée à l'index ${cometeIndex}:`, comete['Nom SCPI']);
  
  // Vérifier et ajouter les données si elles ne sont pas présentes
  if (comete['Nombre de locataires'] !== 67) {
    comete['Nombre de locataires'] = 67;
    console.log('   ✅ Nombre de locataires ajouté: 67');
  } else {
    console.log('   ✓ Nombre de locataires déjà présent: 67');
  }
  
  if (comete['WALT'] !== 10.4) {
    comete['WALT'] = 10.4;
    console.log('   ✅ WALT ajouté: 10.4');
  } else {
    console.log('   ✓ WALT déjà présent: 10.4');
  }
  
  if (comete['WALB'] !== 8.4) {
    comete['WALB'] = 8.4;
    console.log('   ✅ WALB ajouté: 8.4');
  } else {
    console.log('   ✓ WALB déjà présent: 8.4');
  }
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('\n✅ Fichier sauvegardé!');
} else {
  console.log('❌ Comète non trouvée');
  console.log('Recherche dans les 20 premières SCPI:');
  data.slice(0, 20).forEach((s, i) => {
    if (s['Nom SCPI'] && s['Nom SCPI'].toLowerCase().includes('com')) {
      console.log(`   Index ${i}: ${s['Nom SCPI']}`);
    }
  });
}
