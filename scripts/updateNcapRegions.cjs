const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour NCap Régions
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'NCap Régions') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour NCap Régions`);
    
    // Mettre à jour les valeurs principales
    entry['Capitalisation (M€)'] = 973;
    entry['Surcote/décote (%)'] = -1.2;
    entry['Valeur de reconstitution (€)'] = 678;
    entry['Valeur de retrait (€)'] = "613.80";
    entry['Valeur de réalisation (€)'] = 576.68;
    entry['Délai de jouissance (mois)'] = 6;
    
    // Mettre à jour les répartitions
    entry['Répartition Géographique'] = "Grandes agglomérations de province (65%), Ile-de-France (35%)";
    entry['Répartition Sectorielle'] = "Bureaux (45%), Activités (35%), Commerces (20%)";
    
    entry['Répartition Géographique JSON'] = {
      "Grandes agglomérations de province": 65,
      "Ile-de-France": 35
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Bureaux": 45,
      "Activités": 35,
      "Commerces": 20
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Acquisition d'un site d'activités à Blois, loué à un utilisateur industriel | Acquisition d'un commerce alimentaire loué à une enseigne nationale | Lancement d'un projet hôtelier à Nantes (en développement), exploité par un groupe hôtelier international avec bail long | Aucune cession significative réalisée au cours du trimestre | Collecte positive sur le trimestre | Une partie de la collecte a été investie, le solde restant en attente d'opportunités";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 0;
    entry['Nombre d\'acquisitions trimestre'] = 2;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour NCap Régions`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
