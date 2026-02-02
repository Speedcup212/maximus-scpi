const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Épargne Pierre (pas Europe)
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Épargne Pierre') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Épargne Pierre (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 2795; // 2 795 M€ au 30/09/2025
    entry['Prix de souscription (€)'] = 208;
    entry['Valeur de retrait (€)'] = "187.20";
    entry['Surcote/décote (%)'] = -0.31; // Calculé : (208/208.64)-1)*100 = -0.31%
    entry['Valeur de reconstitution (€)'] = 208.64; // Au 31/12/2024
    entry['Valeur de réalisation (€)'] = 170.10; // Au 31/12/2024
    entry['Taux de distribution (%)'] = 5.28; // 2024
    entry['Distribution (€/part)'] = "10.98"; // 2025 prévisionnel
    entry['Endettement (%)'] = 11.0; // ~11% selon le PDF
    entry['TOF (%)'] = 94.30; // Au 30/09/2025
    entry['Nombre d\'immeubles'] = 410;
    entry['Nombre d\'associés'] = 52337;
    entry['Nombre de parts'] = 13440297;
    entry['Nombre de baux'] = 1030;
    entry['Loyers encaissés trimestre (M€)'] = 40.235; // T3 2025
    entry['Collecte nette trimestre (M€)'] = 15.0; // T3 2025
    entry['Collecte brute trimestre (M€)'] = 25.0; // T3 2025
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 2.64;
    entry['Distribution annuelle 2025 (€/part)'] = 10.98;
    entry['Taux de distribution 2024 (%)'] = 5.28;
    entry['Performance globale annuelle 2024 (%)'] = 5.28;
    entry['TRI 10 ans (%)'] = 5.45;
    entry['Parts en attente de retrait'] = 0; // Selon le PDF
    
    // Mettre à jour les répartitions selon le PDF (en valeur vénale au 30/09/2025)
    entry['Répartition Géographique'] = "Paris (27.57%), Île-de-France (15.43%), Sud-Ouest (17.39%), Nord-Ouest (12.92%), Nord (12.65%), Sud-Est (14.04%), Nord-Est (11.15%)";
    entry['Répartition Sectorielle'] = "Bureaux (48.15%), Commerces (29.35%), Activités/Entrepôts (8.41%), Tourisme/Hôtel (8.70%), Santé/Education (5.23%), Résidentiel/Alternatif (0.16%)";
    
    entry['Répartition Géographique JSON'] = {
      "Paris": 27.57,
      "Île-de-France": 15.43,
      "Sud-Ouest": 17.39,
      "Nord-Ouest": 12.92,
      "Nord": 12.65,
      "Sud-Est": 14.04,
      "Nord-Est": 11.15
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Bureaux": 48.15,
      "Commerces": 29.35,
      "Activités/Entrepôts": 8.41,
      "Tourisme/Hôtel": 8.70,
      "Santé/Education": 5.23,
      "Résidentiel/Alternatif": 0.16
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Aucune acquisition réalisée au cours du trimestre | Cessions du trimestre : 2 actifs cédés pour 3,185 M€ (Villers-Semeuse (88) - Centre commercial Villiers II Le Pré des Terres, Retail Park 1 074 m², 1,7 M€ | Besançon (25) - 2F Avenue des Montboucons, bureaux 739 m², 1,485 M€) | Gestion locative : 11 entrées de locataires (dont ADP GSI France à Villeneuve d'Ascq, CALTEA à Versailles, FRANCE TERRE D'ASILE à Bobigny, ATS CULLIGAN à Versailles, NOVACOR à Chatou) et 15 sorties de locataires (dont HESNAULT à Guyancourt, PRÊT A MANGER à Versailles, TOTO TISSUS à Cormontreuil, MINISTERE DE L'EDUCATION à Aix-en-Provence, ASSYSTEM à Tours) | TOF à 94,30% au 30/09/2025, avec 93,47% de locaux occupés, 0,83% sous franchise ou mis à disposition, 5,70% vacants | Collecte nette T3 2025 : 15 M€ | Distribution T3 2025 : 2,64€ par part versée le 23/10/2025 | Distribution annuelle prévisionnelle 2025 : 10,98€ par part | Acquisition prévue au T4 2025 : renforcement de l'exposition sur l'hôtellerie avec une acquisition d'un volume supérieur à 30 M€ | Immeuble Unity à Nancy primé par l'association professionnelle BBCA lors des Grands Prix du salon de l'immobilier Bas Carbone 2025, dans la catégorie « coup de cœur du jury » | Réinvestissement automatique des revenus mis en place | Actualisation des valeurs d'expertise au 30/06/2025 : léger retrait de -0,8% principalement dû à la hausse des droits d'enregistrement";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 2;
    entry['Nombre d\'acquisitions trimestre'] = 0;
    entry['Montant cessions trimestre (M€)'] = 3.185;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Épargne Pierre`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
