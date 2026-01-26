const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée pour Foncière des Praticiens
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Foncière des Praticiens') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour ${entry['Nom SCPI']} (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 179.407; // 179 407 073 € au 30/09/2025
    entry['Prix de souscription (€)'] = 1100;
    entry['Valeur de retrait (€)'] = "1012.00"; // Au 30/09/2025
    entry['Surcote/décote (%)'] = 8.70; // Calculé : (1100 - 1012) / 1012 * 100 = 8,70%
    entry['Valeur de reconstitution (€)'] = 1069.23; // Au 30/09/2025
    entry['Valeur de réalisation (€)'] = 938.88; // Au 30/09/2025
    entry['Taux de distribution (%)'] = 5.50; // 2024
    entry['Distribution (€/part)'] = "60.50"; // Annuel 2024
    entry['Endettement (%)'] = 22.15; // 7,66% emprunts + 14,49% VEFA au 30/09/2025
    entry['TOF (%)'] = 97.08; // Au 30/09/2025
    entry['Nombre d\'immeubles'] = 23;
    entry['Nombre d\'associés'] = 2768;
    entry['Nombre de parts'] = 153711;
    entry['Nombre de locataires'] = 79;
    entry['Surface gérée (m²)'] = 56584;
    entry['Loyers encaissés trimestre (M€)'] = 2.171; // 2 171 241 € T3 2025
    entry['Collecte nette trimestre (M€)'] = 3.7; // T3 2025 (mentionné 3,2 M€ dans le texte, 3,7 M€ dans l'essentiel)
    entry['Collecte brute trimestre (M€)'] = 3.7; // T3 2025 (3 359 parts × 1100 €)
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 15.46; // Dividende brut de fiscalité étrangère
    entry['Taux de distribution 2024 (%)'] = 5.50;
    entry['Performance globale annuelle 2024 (%)'] = 5.50;
    entry['WALB'] = 4.14; // Durée résiduelle moyenne des baux
    entry['Parts en attente de retrait'] = 0; // Selon le PDF
    entry['Dette bancaire (M€)'] = 13.7; // 7,66% de 179,407 M€ ≈ 13,7 M€
    entry['Taux moyen des emprunts (%)'] = undefined; // Non mentionné dans le PDF
    entry['Durée résiduelle moyenne des emprunts (ans)'] = undefined; // Non mentionné
    
    // Ajouter les valeurs nominales et prime d'émission
    entry['Valeur nominale (€)'] = 970;
    entry['Prime d\'émission (€)'] = 130;
    entry['Valeur nette comptable (€)'] = undefined; // Non mentionné
    
    // Mettre à jour les répartitions selon le PDF (en valeur vénale au 30/09/2025)
    // Répartition géographique : France 70%, Belgique 30% (selon le texte et les graphiques)
    entry['Répartition Géographique'] = "France (70%), Belgique (30%)";
    
    // Répartition sectorielle selon le PDF (en valeur vénale)
    entry['Répartition Sectorielle'] = "Lieux de soins, de traitement et de consultation (46%), Locaux d'accompagnement et rééducation (37%), Locaux supports au secteur de la santé (17%)";
    
    entry['Répartition Géographique JSON'] = {
      "France": 70,
      "Belgique": 30
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Lieux de soins, de traitement et de consultation": 46,
      "Locaux d'accompagnement et rééducation": 37,
      "Locaux supports au secteur de la santé": 17
    };
    
    // Actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Collecte nette de 3,7 M€ au T3 2025, traduisant la confiance renouvelée des épargnants. Inauguration d'une première Maison d'Accueil Spécialisée (MAS) à Philippeville en Belgique, acquise en VEFA pour 15,8 M€ HT HD. Cette structure accueillera 80 résidents en situation de handicap, avec un loyer annuel de 900 000 € HT HC et un bail de 25 ans fermes. Le projet illustre la volonté de la SCPI de diversifier géographiquement son patrimoine tout en restant fidèle à son ADN : investir dans des infrastructures de santé utiles, pérennes et à impact positif. Aucune part n'est en attente de retrait au 30/09/2025, toutes les demandes de retrait ayant pu être compensées par les nouvelles parts souscrites.";
    
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Date bulletin'] = "30/09/2025";
    
    // Mettre à jour les frais de souscription selon le PDF
    entry['Frais de souscription (TTC/%)'] = 9.6; // 105,60 € TTC sur 1100 € = 9,6%
    
    updatedCount++;
    console.log(`✅ Mise à jour terminée pour ${entry['Nom SCPI']}`);
  }
});

if (updatedCount === 0) {
  console.log('❌ Aucune entrée trouvée pour "Foncière des Praticiens"');
  process.exit(1);
}

// Sauvegarder le fichier mis à jour
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Fichier mis à jour avec succès ! ${updatedCount} entrée(s) modifiée(s).`);
