const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée pour ESG Pierre Capital / ESG Pierre Capitale
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'ESG Pierre Capital' || entry['Nom SCPI'] === 'ESG Pierre Capitale') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour ${entry['Nom SCPI']} (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 116.91; // 116 910 056 € au 30/09/2025
    entry['Prix de souscription (€)'] = 188;
    entry['Valeur de retrait (€)'] = "169.20"; // Au 31/12/24
    entry['Surcote/décote (%)'] = 0.48; // Calculé : (188/187.11)-1)*100 = 0.48%
    entry['Valeur de reconstitution (€)'] = 187.11; // Au 30/06/25
    entry['Valeur de réalisation (€)'] = 152.49; // Au 30/06/25
    entry['Taux de distribution (%)'] = 5.22; // 2024
    entry['Distribution (€/part)'] = "7.32"; // Net 2025 prévisionnel
    entry['Endettement (%)'] = 28.0; // Au 30/09/2025
    entry['TOF (%)'] = 96.28; // Au 30/09/2025
    entry['TOP (%)'] = 96.78; // Taux d'Occupation Physique
    entry['Nombre d\'immeubles'] = 10;
    entry['Nombre d\'associés'] = 1091;
    entry['Nombre de parts'] = 621862;
    entry['Nombre de locataires'] = 15;
    entry['Surface gérée (m²)'] = 71253;
    entry['Loyers encaissés trimestre (M€)'] = 2.338; // T3 2025
    entry['Collecte nette trimestre (M€)'] = 0.428; // T3 2025 (427 512 €)
    entry['Collecte brute trimestre (M€)'] = 0.428; // T3 2025
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 2.58; // Net
    entry['Distribution trimestrielle T3 2025 brut (€/part)'] = 2.79; // Brut
    entry['Distribution annuelle 2025 (€/part)'] = 7.32; // Net prévisionnel
    entry['Taux de distribution 2024 (%)'] = 5.22;
    entry['Performance globale annuelle 2024 (%)'] = 5.22;
    entry['WALB'] = 4.06; // Durée moyenne des baux restant à courir
    entry['Parts en attente de retrait'] = 0; // Selon le PDF
    entry['Dette bancaire (M€)'] = 38.18;
    entry['Taux moyen des emprunts (%)'] = 2.74;
    entry['Durée résiduelle moyenne des emprunts (ans)'] = 0.50;
    
    // Mettre à jour les répartitions selon le PDF (en valeur d'expertise au 30/09/2025)
    entry['Répartition Géographique'] = "Paris (28,47%), Île-de-France (17,89%), Régions (4,48%), Allemagne (49,15%)";
    entry['Répartition Sectorielle'] = "Services (27,30%), Logistique (24,23%), Bureaux (19,60%), Hôtellerie (17,40%), Commerces (11,46%)";
    
    entry['Répartition Géographique JSON'] = {
      "Paris": 28.47,
      "Île-de-France": 17.89,
      "Régions": 4.48,
      "Allemagne": 49.15
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Services": 27.30,
      "Logistique": 24.23,
      "Bureaux": 19.60,
      "Hôtellerie": 17.40,
      "Commerces": 11.46
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Aucune acquisition réalisée au cours du trimestre | Aucune cession au trimestre | TOF à 96,28% et TOP à 96,78% au 30/09/2025, taux de vacance de 4%, franchise de loyer de 0% | Collecte nette T3 2025 : 0,43 M€ (427 512 €) | Distribution T3 2025 : 2,58€ net par part (2,79€ brut) versée le 21/10/2025 | Distribution annuelle prévisionnelle 2025 : 7,32€ net par part (7,91€ brut) | Taux de distribution 2024 : 5,22% | Performance Globale Annuelle 2024 : 5,22% | Durée moyenne des baux restant à courir (WALB) : 4,06 ans | Endettement à 28% (dette bancaire 38,18 M€), taux moyen des emprunts 2,74%, durée résiduelle moyenne des emprunts 0,50 an | Partenariat Reforest'Action : 1016 arbres plantés | Capitalisation en légère hausse à 116,91 M€ (+0,81% par rapport au T2 2025) | Nombre d'associés : 1 091 | Nombre de parts : 621 862 | Surface totale gérée : 71 253 m² | 10 immeubles, 15 locataires";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 0;
    entry['Nombre d\'acquisitions trimestre'] = 0;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour ESG Pierre Capital`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
