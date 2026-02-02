const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Altixia Cadence 12
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Altixia Cadence 12') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Altixia Cadence 12`);
    
    // Mettre à jour les valeurs principales
    entry['Capitalisation (M€)'] = 188.26;
    entry['Valeur de reconstitution (€)'] = 200.54;
    entry['Valeur de réalisation (€)'] = 165.11;
    entry['Distribution (€/part)'] = "2.54";
    entry['Endettement (%)'] = 10.56;
    entry['TOF (%)'] = 92.6;
    entry['Nombre d\'immeubles'] = 32;
    entry['Délai de jouissance (mois)'] = 6;
    
    // Mettre à jour les répartitions
    entry['Répartition Géographique'] = "Régions (56%), Ile-de-France (22%), Paris (3%), Espagne (13%), Irlande (6%)";
    entry['Répartition Sectorielle'] = "Commerces (37%), Activités (30%), Bureaux (29%), Logistique (4%)";
    
    entry['Répartition Géographique JSON'] = {
      "Régions": 56,
      "Ile-de-France": 22,
      "Paris": 3,
      "Espagne": 13,
      "Irlande": 6
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Commerces": 37,
      "Activités": 30,
      "Bureaux": 29,
      "Logistique": 4
    };
    
    // Ajouter les nouveaux champs
    entry['WALT'] = 6.29;
    entry['WALB'] = 2.45;
    entry['Nombre de locataires'] = 94;
    entry['Surface gérée (m²)'] = 111238;
    entry['Surface louée (m²)'] = 102237;
    entry['Parts en attente de retrait'] = 734;
    entry['Actualités trimestrielles'] = "Acquisition à Madrid – Pozuelo de Alarcón (Espagne) : ensemble de bureaux certifié BREEAM, réhabilité en 2022, multilocataire (4), date : 01/07/2025, montant AEM : 7,2 M€, surface : 4 568 m², rendement potentiel : 8,09% | Cession à Rueil-Malmaison (92) : actif de commerce (bail « La Vie Claire ») cédé en juillet 2025, plus-value significative dégagée, complément de distribution attendu au T4 2025 | 100 % des capitaux collectés investis et générateurs de revenus | Ligne de financement court terme remboursée et redevenue disponible pour saisir de nouvelles opportunités | Entrée : Nice Horizon (06), bureaux 287 m², loyer 67 700 € | Sorties : Nice Horizon (06), bureaux 470 m², 124 728 € | Aix-les-Milles (13), bureaux 323 m², 29 070 € | Chamblyrama (60), commerces 138 m², 24 457 €";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 1;
    entry['Nombre d\'acquisitions trimestre'] = 1;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Altixia Cadence 12`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
