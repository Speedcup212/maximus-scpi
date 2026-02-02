const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Perial Opportunités Europe
const perialIndex = data.findIndex(s => 
  s['Nom SCPI'] === 'Perial Opportunités Europe'
);

if (perialIndex === -1) {
  console.log('❌ Perial Opportunités Europe non trouvée');
  process.exit(1);
}

const perial = data[perialIndex];
console.log(`✅ Perial Opportunités Europe trouvée: ${perial['Nom SCPI']}\n`);

// Afficher les prix actuels
console.log('📊 Prix actuels:');
console.log(`   Prix de souscription: ${perial['Prix de souscription (€)']}€`);
console.log(`   Valeur de retrait: ${perial['Valeur de retrait (€)']}€`);
console.log(`   Valeur de reconstitution: ${perial['Valeur de reconstitution (€)'] || 'N/A'}`);
console.log(`   Valeur de réalisation: ${perial['Valeur de réalisation (€)']}€\n`);

// Demander les nouveaux prix (pour l'instant, je vais juste ajouter la mention dans les actualités)
// L'utilisateur devra préciser les nouveaux montants

// Récupérer les actualités existantes
const actualitesExistantes = perial['Actualités trimestrielles'] || '';
const actualitesArray = actualitesExistantes ? actualitesExistantes.split(' | ') : [];

// Filtrer pour retirer les anciennes mentions de changement de prix si elles existent
const actualitesFiltrees = actualitesArray.filter(actu => {
  const actuLower = actu.toLowerCase();
  return !actuLower.includes('à compter du') && 
         !actuLower.includes('prix de souscription sera porté') &&
         !actuLower.includes('nouveau prix') &&
         !actuLower.includes('changement de prix');
});

// Ajouter la mention du changement de prix avec la date (format sera ajouté automatiquement par getScpiNews)
// Format attendu: phrase de 10-25 mots avec date précise
// L'icône ⏳ et le mot-clé "Événement à venir" seront ajoutés automatiquement par getScpiNews
const nouvelleActualite = "À compter du 01/01/2026, modification du prix de souscription et des valeurs de retrait et de réalisation";

// Ajouter en première position (ou après les acquisitions si présentes)
const acquisitionsIndex = actualitesFiltrees.findIndex(a => 
  a.toLowerCase().includes('acquisition')
);

if (acquisitionsIndex !== -1) {
  // Insérer après les acquisitions
  actualitesFiltrees.splice(acquisitionsIndex + 1, 0, nouvelleActualite);
} else {
  // Ajouter en première position
  actualitesFiltrees.unshift(nouvelleActualite);
}

// Mettre à jour les actualités trimestrielles
perial['Actualités trimestrielles'] = actualitesFiltrees.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Actualité ajoutée: "${nouvelleActualite}"\n`);
console.log('📝 Note: Pour mettre à jour les prix réels, modifiez manuellement:');
console.log('   - Prix de souscription (€)');
console.log('   - Valeur de retrait (€)');
console.log('   - Valeur de reconstitution (€) si applicable');
console.log('\n✅ Fichier JSON mis à jour!');
