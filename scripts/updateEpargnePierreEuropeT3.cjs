const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée pour Épargne Pierre Europe
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Épargne Pierre Europe') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Épargne Pierre Europe (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 479; // 479 M€ au 30/09/2025
    entry['Prix de souscription (€)'] = 200;
    entry['Valeur de retrait (€)'] = "180.00";
    entry['Surcote/décote (%)'] = 0; // Prix 200€ vs valeur de reconstitution (à calculer)
    entry['Valeur de reconstitution (€)'] = 206.51; // Au 31/12/2024
    entry['Valeur de réalisation (€)'] = 176.30; // Au 31/12/2024
    entry['Taux de distribution (%)'] = 5.50; // Taux de distribution brut de fiscalité étrangère 2025
    entry['Distribution (€/part)'] = "13.50"; // 2024 (à confirmer)
    entry['Endettement (%)'] = 0; // Aucune dette
    entry['TOF (%)'] = 100.0; // Au 30/09/2025
    entry['Nombre d\'immeubles'] = 16; // Au 31/12/2024, probablement plus maintenant
    entry['Nombre d\'associés'] = 13615;
    entry['Nombre de parts'] = 2396520;
    entry['Nombre de baux'] = 23; // Au 31/12/2024
    entry['Loyers encaissés trimestre (M€)'] = 5.380; // T3 2025
    entry['Collecte nette trimestre (M€)'] = 71.2; // T3 2025
    entry['Collecte brute trimestre (M€)'] = 71.2; // T3 2025
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 2.46; // Net
    entry['Distribution trimestrielle T3 2025 brut (€/part)'] = 3.00; // Brut
    entry['Taux de distribution brut 2024 (%)'] = 6.75;
    entry['Taux de distribution net 2024 (%)'] = 5.63;
    entry['Performance globale annuelle 2024 (%)'] = 6.75;
    entry['TRI 10 ans (%)'] = 5.50; // Taux de rendement interne cible
    entry['Parts en attente de retrait'] = 0; // Selon le PDF
    
    // Mettre à jour les répartitions selon le PDF (en valeur vénale au 30/09/2025)
    entry['Répartition Géographique'] = "Irlande (33,97%), Allemagne (30,47%), Espagne (24,04%), Pays-Bas (11,52%)";
    entry['Répartition Sectorielle'] = "Hôtellerie (35,56%), Bureaux (27,34%), Commerces (19,22%), Activités/Entrepôts (11,52%), Santé (6,36%)";
    
    entry['Répartition Géographique JSON'] = {
      "Irlande": 33.97,
      "Allemagne": 30.47,
      "Espagne": 24.04,
      "Pays-Bas": 11.52
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Hôtellerie": 35.56,
      "Bureaux": 27.34,
      "Commerces": 19.22,
      "Activités/Entrepôts": 11.52,
      "Santé": 6.36
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "4 acquisitions finalisées pour 127,5 M€ au cours du trimestre : Dublin (Irlande) - Retail Park Nutgrove Avenue, 4 273 m², 12,8 M€, multilocataires (HOMESTORE, DEALZ, PET WORLD, PAT MCDONNEL PAINTS), bail 5,6 ans | Galway (Irlande) - Locaux d'activités Parkmore West Business Park, 5 751 m², 7,8 M€, locataire CELESTICA, bail 5 ans | Dublin (Irlande) - Retail Park Arena Center Tallaght, 6 025 m², 15,6 M€, locataire WOODIE'S DIY, bail 7 ans | Medebach (Allemagne) - Center Parcs Park Hochsauerland, 62 880 m², 91,3 M€ (80% quote-part), locataire CENTER PARCS, bail 9 ans, 450 clés | Aucune cession au trimestre | TOF à 100% au 30/09/2025 | Collecte nette T3 2025 : 71,2 M€ | Distribution T3 2025 : 2,46€ net par part (3,00€ brut) versée le 23/10/2025 | Réduction de la part bureaux à 27,34% (contre 43,20% au 30 juin) | Augmentation de la part hôtellerie à 35,56% (contre 14,51% au 30 juin) | Exposition croissante à l'Allemagne : 30,47% du patrimoine (contre 6,48% au 30 juin) | Renforcement de l'exposition en Irlande : 33,97% du patrimoine | Taux de distribution brut de fiscalité étrangère 2025 : 5,50% (objectif) | Performance Globale Annuelle 2024 : 6,75% | Actualisation des valeurs d'expertise au 30/06/2025 : restent globalement en ligne avec celles publiées au 31/12/2024";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 0;
    entry['Nombre d\'acquisitions trimestre'] = 4;
    entry['Montant acquisitions trimestre (M€)'] = 127.5;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Épargne Pierre Europe`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
