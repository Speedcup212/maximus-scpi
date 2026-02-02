const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour NCap Régions
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'NCap Régions') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour NCap Régions (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF
    entry['Capitalisation (M€)'] = 973; // L'utilisateur a spécifié 973 M€
    entry['Prix de souscription (€)'] = 682; // Nouveau prix depuis septembre 2025
    entry['Surcote/décote (%)'] = -2.78; // Calculé : (682/701.49)-1)*100
    entry['Valeur de reconstitution (€)'] = 701.49; // Au 30/06/2025
    entry['Valeur de retrait (€)'] = "613.80"; // Selon l'utilisateur
    entry['Valeur de réalisation (€)'] = 576.68; // Selon l'utilisateur
    entry['Endettement (%)'] = 25.9; // Selon l'utilisateur (le PDF montre 17,13% mais c'est le ratio dettes et autres engagements)
    entry['TOF (%)'] = 92.7; // Selon l'utilisateur (le PDF montre 91,8% mais peut-être une mise à jour)
    entry['Nombre d\'immeubles'] = 175; // Selon le PDF
    
    // Mettre à jour les répartitions selon le PDF (valeur vénale)
    entry['Répartition Géographique'] = "Grandes agglomérations de province (65%), Ile-de-France (35%)";
    entry['Répartition Sectorielle'] = "Bureaux (54%), Commerce (32%), Activités (14%), Hôtellerie (<0,5%)";
    
    entry['Répartition Géographique JSON'] = {
      "Grandes agglomérations de province": 65,
      "Ile-de-France": 35
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Bureaux": 54,
      "Commerce": 32,
      "Activités": 14,
      "Hôtellerie": 0.5
    };
    
    // Ajouter les actualités trimestrielles T3 2025 détaillées du PDF
    entry['Actualités trimestrielles'] = "Acquisition d'un site d'activités à Blois (41) : actif industriel dans la zone des Onze Arpents, date d'acquisition 23/07/2025, prix d'acquisition AEM 8,6 M€, surface 12 330 m², locataire Enerflux | Acquisition d'un commerce alimentaire à Asnières-sur-Seine (92) : actif commercial en première couronne parisienne, date d'acquisition 04/09/2025, prix d'acquisition AEM 4,3 M€, surface 1 346 m², locataire Lidl | Lancement d'un projet hôtelier à Nantes (44) : hôtel 4 étoiles en VEFA, date d'acquisition 30/09/2025, prix d'acquisition AEM 23,1 M€, surface 4 784 m², 127 chambres, locataire Voco (InterContinental Hotels Group), bail ferme de 12 ans, livraison prévue au 4ème trimestre 2028, certifié BREEAM Very Good | Aucune cession significative réalisée au cours du trimestre | Collecte positive sur le trimestre | Une partie de la collecte a été investie, le solde restant en attente d'opportunités | Nouveaux baux : 6 nouveaux baux signés (Cabriès, Lyon, La Wantzenau, Escalquens, Saint-Herblain) | Taux de recouvrement : 97%";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 0;
    entry['Nombre d\'acquisitions trimestre'] = 2;
    entry['WALT'] = 5; // Selon le PDF
    entry['Nombre de locataires'] = 429; // Selon le PDF
    entry['Surface gérée (m²)'] = 478953; // Selon le PDF
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 9.50;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour NCap Régions`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
