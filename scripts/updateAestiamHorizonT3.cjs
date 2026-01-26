const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver l'entrée pour Aestiam Placement Pierre et la renommer en Aestiam Horizon
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Aestiam Placement Pierre') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} : changement de nom vers "Aestiam Horizon" et données T3 2025`);
    
    // CHANGEMENT DE NOM
    entry['Nom SCPI'] = 'Aestiam Horizon';
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 380.274; // 380 274 300 € au 30/09/2025
    entry['Prix de souscription (€)'] = 350;
    entry['Valeur de retrait (€)'] = "315.00"; // Au 30/09/2025
    entry['Surcote/décote (%)'] = 11.11; // Calculé : (350 - 315) / 315 * 100 = 11,11%
    entry['Valeur de reconstitution (€)'] = 346.02; // Au 30/06/2025 (376 M€ / 1 086 498 parts)
    entry['Valeur de réalisation (€)'] = 285.66; // Au 30/06/2025 (310 M€ / 1 086 498 parts)
    entry['Taux de distribution (%)'] = 5.40; // 2024
    entry['Distribution (€/part)'] = "17.69"; // 2024
    entry['Endettement (%)'] = 12.0; // Ratio dettes et autres engagements (emprunts bancaires + VEFA)
    entry['TOF (%)'] = 86.50; // TOF ASPIM au 30/09/2025
    entry['Nombre d\'immeubles'] = 149; // Nombre d'actifs
    entry['Nombre d\'associés'] = 8557;
    entry['Nombre de parts'] = 1086498;
    entry['Nombre de locataires'] = undefined; // Non mentionné, mais 235 baux
    entry['Nombre de baux'] = 235;
    entry['Surface gérée (m²)'] = 160865;
    entry['Loyers encaissés trimestre (M€)'] = 5.797; // 5 797 291 € T3 2025
    entry['Collecte nette trimestre (M€)'] = undefined; // Non mentionné directement
    entry['Collecte brute trimestre (M€)'] = undefined; // Non mentionné directement
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 4.05; // Dividende brut T3 2025
    entry['Distribution annuelle 2025 (€/part)'] = undefined; // Prévision : 17,50 € - 17,90 €
    entry['Taux de distribution 2024 (%)'] = 5.40;
    entry['Performance globale annuelle 2024 (%)'] = 5.40;
    entry['WALB'] = 2.93; // Durée résiduelle moyenne des baux jusqu'aux prochaines échéances
    entry['WALT'] = 4.58; // Durée résiduelle moyenne des baux jusqu'à échéance des baux
    entry['TRI 20 ans (%)'] = 9.78; // Taux de Rendement Interne à 20 ans
    entry['Parts en attente de retrait'] = 38761; // Au 30/09/2025
    entry['Dette bancaire (M€)'] = undefined; // Non détaillé séparément
    entry['Taux moyen des emprunts (%)'] = undefined; // Non mentionné
    entry['Durée résiduelle moyenne des emprunts (ans)'] = undefined; // Non mentionné
    
    // Mettre à jour les répartitions selon le PDF (au 30/09/2025)
    // Répartition sectorielle : Bureaux 76%, Commerces 16%, Hôtels 2%, Enseignement 4% (arrondi)
    entry['Répartition Sectorielle'] = "Bureaux (76%), Commerces (16%), Hôtels (2%), Enseignement (4%), Locaux d'activités (2%)";
    
    // Répartition géographique : Paris 20%, Région Parisienne 30%, Régions 39%, Etranger 11%
    entry['Répartition Géographique'] = "Paris (20%), Région Parisienne (30%), Régions (39%), Etranger (11%)";
    
    entry['Répartition Sectorielle JSON'] = {
      "Bureaux": 76,
      "Commerces": 16,
      "Hôtels": 2,
      "Enseignement": 4,
      "Locaux d'activités": 2
    };
    
    entry['Répartition Géographique JSON'] = {
      "Paris": 20,
      "Région Parisienne": 30,
      "Régions": 39,
      "Etranger": 11
    };
    
    // Actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Aucune acquisition ce trimestre. 2 relocations réalisées pour un loyer total de 219 K€. 11 libérations pour un loyer total de 616 K€. 1 cession d'actif : bureaux à Meylan (2,44 M€), acquis le 28/12/1989. Le marché du bureau en France reste très polarisé, avec des petites surfaces dynamiques tandis que les grandes peinent à convaincre. La SCPI est spécialisée dans les bureaux à taille humaine (valeur moyenne des immeubles : 2,4 M€), majoritairement situés à Paris intra-muros, dans le Croissant Ouest et dans les métropoles régionales. Aucun actif n'est situé à La Défense et l'exposition est très faible (2%) dans les secteurs difficiles de la Première Couronne Nord, Sud et Est. Distribution trimestrielle stable à 4,05 € par part. Distribution brute prévisionnelle 2025 maintenue entre 17,50 € et 17,90 € par part.";
    
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Date bulletin'] = "30/09/2025";
    
    // Mettre à jour les frais de souscription selon le PDF
    entry['Frais de souscription (TTC/%)'] = 12.0; // 12% TTC (10% HT)
    
    updatedCount++;
    console.log(`✅ Mise à jour terminée : ${entry['Nom SCPI']}`);
  }
});

if (updatedCount === 0) {
  console.log('❌ Aucune entrée trouvée pour "Aestiam Placement Pierre"');
  process.exit(1);
}

// Sauvegarder le fichier mis à jour
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\n✅ Fichier mis à jour avec succès ! ${updatedCount} entrée(s) modifiée(s).`);
