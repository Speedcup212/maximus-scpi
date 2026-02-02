const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Opportunité Immo
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Opportunité Immo') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Opportunité Immo (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 313.02; // 313 015 444 € ≈ 313.02 M€
    entry['Prix de souscription (€)'] = 203;
    entry['Valeur de retrait (€)'] = "184.73";
    entry['Surcote/décote (%)'] = -5.8; // Calculé : (203/215.40)-1)*100 = -5.75% ≈ -5.8%
    entry['Valeur de reconstitution (€)'] = 215.40; // Au 30/06/2025
    entry['Valeur de réalisation (€)'] = 175.34; // Au 30/06/2025
    entry['Taux de distribution (%)'] = 5.62; // 2024
    entry['Distribution (€/part)'] = "11.37"; // 2024
    entry['Endettement (%)'] = 14.45; // Réel au 30/09/2025 (autorisation statutaire : 30%)
    entry['TOF (%)'] = 95.3; // Au 30/09/2025
    entry['Nombre d\'immeubles'] = 46; // 38 en direct + 8 via SCI
    
    // Mettre à jour les répartitions selon le PDF (valeur vénale)
    entry['Répartition Géographique'] = "Île-de-France (47.82%), Régions (39.93%), Espagne (5.82%), Allemagne (4.50%), Royaume-Uni (1.93%)";
    entry['Répartition Sectorielle'] = "Logistique et locaux d'activités (89.41%), Bureaux (10.59%)";
    
    entry['Répartition Géographique JSON'] = {
      "Île-de-France": 47.82,
      "Régions": 39.93,
      "Espagne": 5.82,
      "Allemagne": 4.50,
      "Royaume-Uni": 1.93
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Logistique et locaux d'activités": 89.41,
      "Bureaux": 10.59
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Aucune acquisition réalisée au cours du trimestre | Aucune cession réalisée au cours du trimestre | Activité locative : solde commercial positif avec résorption de 1 042 m² de locaux vacants | Principaux mouvements locatifs : Technoparc de Lamirault à Collégien (77) - arrivée de 4 nouveaux locataires sur 2 900 m², site totalement loué (11 600 m² sur 7 bâtiments) | Corbas (69) : principal locataire a signé un nouveau bail avec extension de 700 m² | Bobigny (93) : locataire unique se maintient pour 10 années supplémentaires | Taux d'occupation physique : 95,3% (vs 94,8% au trimestre précédent) | Taux d'occupation financier : 95,3% (vs 94,9% au 2e trimestre) | Baisse des mesures d'accompagnement allouées ce trimestre | Distribution T3 2025 maintenue à 2,85 € par part (même niveau que T1 et T2) | Collecte brute T3 2025 : 2,0 M€ | Parts en attente de retrait : 19 860 parts (3,7 M€)";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 0;
    entry['Nombre d\'acquisitions trimestre'] = 0;
    entry['WALB'] = 3.3; // Durée résiduelle moyenne des baux
    entry['Nombre de locataires'] = 70;
    entry['Surface gérée (m²)'] = 223872;
    entry['Loyers encaissés trimestre (M€)'] = 4.2;
    entry['Collecte brute trimestre (M€)'] = 2.0;
    entry['Parts en attente de retrait'] = 19860;
    entry['Montant parts en attente de retrait (M€)'] = 3.7;
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 2.85;
    entry['Nombre d\'associés'] = 5974;
    entry['Nombre de parts'] = 1541948;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Opportunité Immo`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
