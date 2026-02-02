const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Efimmo 1
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Efimmo 1') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Efimmo 1 (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 1745; // 1 745 M€ au 30/09/2025
    entry['Prix de souscription (€)'] = 212; // Depuis le 4 décembre 2023
    entry['Valeur de retrait (€)'] = "190.80";
    entry['Surcote/décote (%)'] = 4.6; // Calculé : (212/202.65)-1)*100 = +4.6%
    entry['Valeur de reconstitution (€)'] = 202.65; // Au 30/06/2025
    entry['Valeur de réalisation (€)'] = 168.78; // Au 30/06/2025
    entry['Taux de distribution (%)'] = 5.07; // 2024
    entry['Distribution (€/part)'] = "10.33"; // 2024 (9,12€ ordinaire + 1,21€ exceptionnel)
    entry['Endettement (%)'] = 20.2; // Dette / valeur du patrimoine au 30/09/2025
    entry['TOF (%)'] = 87.67; // Au T3 2025
    entry['Nombre d\'immeubles'] = 250;
    entry['Nombre d\'associés'] = 21483;
    entry['Nombre de parts'] = 8231105;
    entry['Loyers encaissés trimestre (M€)'] = 27.0; // T3 2025
    entry['Loyers annuels facturés (M€)'] = 101.0; // Selon le PDF
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 2.10;
    entry['Distribution annuelle prévisionnelle 2025 (€/part)'] = 9.15;
    entry['Taux de distribution prévisionnel 2025 (%)'] = 4.50;
    entry['Collecte brute trimestre (M€)'] = 0.18656; // 186 560 €
    entry['Montant retiré trimestre (M€)'] = 3.904; // 3 904 002 €
    entry['Collecte nette trimestre (M€)'] = -3.72; // Négative
    entry['Parts en attente de retrait'] = 430886;
    entry['Valeur du patrimoine (M€)'] = 1696; // 1 696 M€
    entry['Dette bancaire (M€)'] = 342; // 342 M€
    entry['Taux moyen des emprunts (%)'] = 2.28;
    entry['Maturité moyenne de la dette (ans)'] = 3.92; // 3 ans et 11 mois
    entry['Nombre d\'unités locatives'] = 1447;
    entry['Vacance répartie sur (unités locatives)'] = 211;
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Aucune acquisition réalisée au cours du trimestre | Arbitrages du trimestre : 0,6 M€ portant sur 3 surfaces de bureaux et 1 surface d'activité (total 1 487 m²), générant une moins-value nette de fiscalité de 1,1 M€ | Arbitrages depuis début 2025 : 12,7 M€ de prix de vente total, 11,1 M€ de valeur d'expertise au 31/12/2024, prix de vente supérieur de +15,4% par rapport aux valeurs d'expertise, 14 actifs vendus, plus-value distribuable de 0,28€ par part versée en septembre 2025 | Gestion locative : relocation de l'intégralité (4 000 m²) de l'actif de bureaux Les Salorges à Nantes, programme de travaux permettant une réévaluation du loyer de +20% par rapport au locataire sortant, 52 063 m² reloués ou renouvelés au total depuis début 2025 représentant un loyer annuel de 7,7 M€, relocations et renouvellements négociés avec une baisse des loyers annuels de -10,1% mais sécurisant des flux locatifs sur durées fermes | Principaux renouvellements T3 : Combs-la-ville (77) - renouvellement et extension 18 720 m² activités (bail 5 ans, +1%), Montigny-le-Bretonneux (78) - renouvellement 3 215 m² bureaux (bail 6 ans, -28%), Bordeaux (33) - relocation 4 185 m² bureaux (montant stable), Aix-en-Provence (13) - renouvellement 1 140 m² bureaux (-20%) | Principales libérations T3 : 459 m² bureaux Montigny-le-Bretonneux (122 K€), 492 m² bureaux Vélizy-Villacoublay (120 K€), 1 188 m² espaces fitness Évreux (99 K€) | TOF à 87,67% au T3 2025, vacance répartie sur 211 unités locatives | Projets de cessions engagés au 30/09/2025 : 15,0 M€ | Projets d'investissement engagés au 30/09/2025 : 1,3 M€ sous forme de participations dans des sociétés immobilières";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 4; // 3 surfaces bureaux + 1 surface activité
    entry['Nombre d\'acquisitions trimestre'] = 0;
    entry['Montant cessions trimestre (M€)'] = 0.6;
    entry['Montant cessions depuis début 2025 (M€)'] = 12.7;
    entry['Plus-value distribuable T3 2025 (€/part)'] = 0.28;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Efimmo 1`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
