/**
 * Ajoute toutes les actualités trimestrielles de Comète depuis le bulletin T3 2025
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Trouver Comète
const cometeIndex = data.findIndex(s => s['Nom SCPI'] === 'Comète');

if (cometeIndex === -1) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

const comete = data[cometeIndex];
console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}\n`);

// Toutes les actualités extraites du bulletin T3 2025
const actualites = [
  "Six nouvelles acquisitions représentant un montant total de 65,7 millions d'euros hors droits au cours du trimestre",
  "Ouverture d'un nouveau pays : l'Irlande avec l'acquisition de 11 cellules commerciales à Dun Laoghaire (5 032 m²)",
  "Nouvelle région au Royaume-Uni : l'Écosse avec l'acquisition d'un actif logistique à Aberdeen (5 608 m²)",
  "Acquisition à Cardiff (Royaume-Uni) : 5 cellules commerciales de 2 388 m² dans l'une des rues commerçantes les plus actives",
  "Acquisition à Portlethen (Royaume-Uni) : immeuble de bureaux de 6 652 m² à proximité d'Aberdeen",
  "Acquisition à Brescia (Italie) : lot commercial de 3 796 m² occupé par une enseigne internationale",
  "Acquisition à Veenendaal (Pays-Bas) : grand magasin de 18 488 m² dédié à l'aménagement de la maison",
  "Aucune cession d'actif n'a été réalisée au cours du trimestre, confirmant la stratégie de détention long terme",
  "Collecte nette de 103,8M€ au cours du trimestre, témoignant de la confiance des investisseurs",
  "Rentabilité moyenne des acquisitions de 9,12% AEM, témoignant d'une approche rigoureuse et sélective",
  "Début de la commercialisation des surfaces vacantes de l'ensemble immobilier de Getafe, proposées en priorité aux locataires déjà en place",
  "Travaux de rénovation des plateaux de bureaux à Assago se poursuivent conformément au calendrier prévu, visant la création de valeur"
];

// Obtenir les actualités actuelles
let currentActualites = comete['Actualités trimestrielles'] || '';
const actualitesArray = currentActualites ? currentActualites.split(' | ') : [];

// Créer un Set pour éviter les doublons (normalisé en minuscules)
const seenActualites = new Set(actualitesArray.map(a => a.toLowerCase().trim()));

// Ajouter les nouvelles actualités qui n'existent pas déjà
const newActualites = [...actualitesArray];
let addedCount = 0;

actualites.forEach(actu => {
  const normalized = actu.toLowerCase().trim();
  if (!seenActualites.has(normalized)) {
    newActualites.push(actu);
    seenActualites.add(normalized);
    addedCount++;
    console.log(`   ✅ Ajout: ${actu.substring(0, 80)}...`);
  }
});

// Mettre à jour les actualités trimestrielles
comete['Actualités trimestrielles'] = newActualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ ${addedCount} nouvelles actualités ajoutées (${newActualites.length} au total)`);
console.log('✅ Fichier JSON mis à jour!');
