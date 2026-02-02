const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver toutes les entrées pour Activimmo
let updatedCount = 0;
data.forEach((entry, index) => {
  if (entry['Nom SCPI'] === 'Activimmo') {
    console.log(`📊 Mise à jour de l'entrée ${index + 1} pour Activimmo (T3 2025)`);
    
    // Mettre à jour les valeurs principales selon le PDF T3 2025
    entry['Capitalisation (M€)'] = 1400; // 1,4 Md€
    entry['Prix de souscription (€)'] = 610;
    entry['Valeur de retrait (€)'] = "545.34";
    entry['TOF (%)'] = 92.8; // Au 30/09/2025
    entry['Endettement (%)'] = 1.46; // Au 30/09/2025
    entry['Nombre d\'immeubles'] = 186;
    entry['Nombre d\'associés'] = 28934;
    entry['Nombre de parts'] = 2274353;
    entry['WALT'] = 6.5; // Durée résiduelle moyenne des baux
    entry['WALB'] = 3.6; // Durée résiduelle moyenne jusqu'aux prochaines échéances
    entry['Nombre de locataires'] = 372;
    entry['Nombre de baux'] = 465;
    entry['Surface gérée (m²)'] = 1393076;
    entry['Loyers annuels en place (M€)'] = 77.3;
    entry['Loyers encaissés trimestre (M€)'] = 21.0; // T3 2025 hors taxes
    entry['Collecte nette trimestre (M€)'] = 22.0; // T3 2025
    entry['Distribution trimestrielle T3 2025 (€/part)'] = 8.20; // Brut (dont 7,62€ dividende + 0,58€ plus-value)
    entry['Distribution dividende T3 2025 (€/part)'] = 7.62;
    entry['Distribution plus-value T3 2025 (€/part)'] = 0.58;
    
    // Mettre à jour les répartitions selon le PDF (au 30/09/2025)
    entry['Répartition Géographique'] = "France (78.2%), Espagne (13.8%), Portugal (4.2%), Italie (1.5%), Allemagne (1.0%), Autres (0.3%)";
    entry['Répartition Sectorielle'] = "Entrepôts logistiques (51.0%), Locaux d'activités (31.0%), Logistique urbaine (10.0%), Transport (7.0%), Autres (1.0%)";
    
    entry['Répartition Géographique JSON'] = {
      "France": 78.2,
      "Espagne": 13.8,
      "Portugal": 4.2,
      "Italie": 1.5,
      "Allemagne": 1.0,
      "Autres": 0.3
    };
    
    entry['Répartition Sectorielle JSON'] = {
      "Entrepôts logistiques": 51.0,
      "Locaux d'activités": 31.0,
      "Logistique urbaine": 10.0,
      "Transport": 7.0,
      "Autres": 1.0
    };
    
    // Ajouter les actualités trimestrielles T3 2025
    entry['Actualités trimestrielles'] = "Acquisition d'un entrepôt logistique à Oliveira do Bairro (Portugal) : date d'acquisition 04/08/2025, prix d'acquisition 9,3 M€ (hors droits), surface 18 531 m², rendement AEM 7,7%, bail 12 ans (8 ans fermes), potentiel d'extension du bâtiment, premier actif au Portugal | Cession de l'actif de Fretin (59, France) : date de cession 08/09/2025, prix de cession 10,0 M€ (hors droits), plus-value importante cristallisée, distribution exceptionnelle de plus-value de 0,58€ brut par part versée le 17/09/2025 | Livraison en juillet d'un entrepôt neuf d'environ 31 000 m² à Durtal (49), en cours de commercialisation avec prospect identifié pour 12 000 m² au T4 2025 ou début 2026 | TOF à 92,8% (en retrait de 0,5 point par rapport au trimestre précédent), expliqué par la révision des valeurs locatives de marché et l'impact temporaire du délai de mise en location de Durtal | Collecte nette T3 2025 : 22,0 M€ | Déploiement progressif de Gestion Technique du Bâtiment (GTB) sur plusieurs sites pour optimiser la performance énergétique | 11 actifs en travaux pour un montant de 6,3 M€ | Pipeline : 2 offres envoyées pour 42,8 M€, 16,0 M€ de collecte à investir";
    entry['Période bulletin trimestriel'] = "T3 2025";
    entry['Nombre de cessions trimestre'] = 1;
    entry['Nombre d\'acquisitions trimestre'] = 1;
    
    updatedCount++;
  }
});

console.log(`\n✅ ${updatedCount} entrée(s) mise(s) à jour pour Activimmo`);

// Sauvegarder le fichier
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('💾 Fichier sauvegardé avec succès');
