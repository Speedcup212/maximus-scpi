const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Paref Hexa
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Paref Hexa') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Paref Hexa`);
    
    // Mettre à jour les valeurs principales
    entry['Capitalisation (M€)'] = 245.6;
    entry['Surcote/décote (%)'] = 7.1;
    entry['Valeur de reconstitution (€)'] = 196.02;
    entry['Valeur de réalisation (€)'] = 159.56;
    entry['Endettement (%)'] = 26.6;
    entry['TOF (%)'] = 90.5;
    entry['Nombre d\'immeubles'] = 41;
    
    // Mettre à jour les répartitions
    entry['Répartition Géographique'] = "Métropoles régionales (56.0%), Ile-de-France hors Paris (26.7%), Paris (5.3%), Autres régions (12.0%)";
    entry['Répartition Sectorielle'] = "Bureaux (67.2%), Locaux d'activité (24.8%), Logistique et Messagerie (4.5%), Autres (3.5%)";
    
    entry['Répartition Géographique JSON'] = {
      "Métropoles régionales": 56.0,
      "Ile-de-France hors Paris": 26.7,
      "Paris": 5.3,
      "Autres régions": 12.0
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Bureaux": 67.2,
      "Locaux d'activité": 24.8,
      "Logistique et Messagerie": 4.5,
      "Autres": 3.5
    };
    
    // Ajouter les nouveaux champs
    entry['WALB'] = 2.93;
    entry['Nombre de baux'] = 76;
    entry['Surface gérée (m²)'] = 148481;
    entry['Nombre d\'associés'] = 3717;
    entry['Nombre de parts'] = 1169445;
    entry['Parts en attente de retrait'] = 11557;
    entry['Actualités trimestrielles'] = "Aucune acquisition n'a été réalisée au cours du trimestre | Cession à Vitry-sur-Seine (Val-de-Marne) : actif mixte bureaux / activité cédé pour 1,75 M€ (+2,5% par rapport à la dernière valeur d'expertise, +82% par rapport au prix d'acquisition, plus-value brute réalisée : 0,8 M€) | Distribution nette T3 2025 maintenue à 3,00 € par part | Poursuite du plan d'arbitrage engagé en 2024, visant à améliorer la liquidité et la performance | 1 prise d'effet : 70 m² – loyer annuel 9 000 € | 2 libérations : 1 193 m² – loyers annuels sortants 251 893 € | Lots vacants : 27 lots – 13 256 m²";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 1;
    entry['Loyers encaissés trimestre (M€)'] = 4.7;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Paref Hexa`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
