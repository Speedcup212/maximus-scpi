/**
 * Ajoute les actualités trimestrielles de Comète depuis le bulletin T3 2025
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète (index 11)
const comete = data[11];

if (comete && comete['Nom SCPI'] && comete['Nom SCPI'].includes('Com')) {
  console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}\n`);
  
  // Actualités extraites du bulletin T3 2025
  const actualites = [
    "Six nouvelles acquisitions représentant un montant total de 65,7 millions d'euros hors droits au cours du trimestre",
    "Ouverture d'un nouveau pays : l'Irlande avec l'acquisition de 11 cellules commerciales à Dun Laoghaire (5 032 m²)",
    "Nouvelle région au Royaume-Uni : l'Écosse avec l'acquisition d'un actif logistique à Aberdeen (5 608 m²)",
    "Acquisition à Cardiff (Royaume-Uni) : 5 cellules commerciales de 2 388 m² dans l'une des rues commerçantes les plus actives",
    "Acquisition à Portlethen (Royaume-Uni) : immeuble de bureaux de 6 652 m² à proximité d'Aberdeen",
    "Acquisition à Brescia (Italie) : lot commercial de 3 796 m² occupé par une enseigne internationale",
    "Acquisition à Veenendaal (Pays-Bas) : grand magasin de 18 488 m² dédié à l'aménagement de la maison",
    "Début de la commercialisation des surfaces vacantes de l'ensemble immobilier de Getafe, proposées en priorité aux locataires déjà en place",
    "Travaux de rénovation des plateaux de bureaux à Assago se poursuivent conformément au calendrier prévu, visant la création de valeur",
    "Collecte nette de 103,8M€ au cours du trimestre, témoignant de la confiance des investisseurs",
    "Aucune cession d'actif n'a été réalisée au cours du trimestre, confirmant la stratégie de détention long terme",
    "Rentabilité moyenne des acquisitions de 9,12% AEM, témoignant d'une approche rigoureuse et sélective"
  ];
  
  // Ajouter les actualités au JSON (format texte avec séparateur)
  comete['Actualités trimestrielles'] = actualites.join(' | ');
  
  // Sauvegarder
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log('✅ Actualités trimestrielles ajoutées:\n');
  actualites.forEach((actu, index) => {
    console.log(`${index + 1}. ${actu}`);
  });
  console.log(`\n✅ ${actualites.length} actualités ajoutées au fichier JSON!`);
} else {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}
