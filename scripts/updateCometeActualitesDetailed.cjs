const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/scpi_complet.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const cometeIndex = data.findIndex(s => s['Nom SCPI'] === 'Comète');

if (cometeIndex === -1) {
  console.log('❌ Comète non trouvée');
  process.exit(1);
}

const comete = data[cometeIndex];
console.log(`✅ Comète trouvée: ${comete['Nom SCPI']}\n`);

// Actualités améliorées avec descriptions détaillées du bulletin
const actualites = [
  // Résumé général
  "Six nouvelles acquisitions représentant un montant total de 65,7 millions d'euros hors droits au cours du trimestre",
  
  // Acquisitions détaillées (par ordre d'importance/date)
  "Acquisition à Dun Laoghaire (Irlande, 5 032 m², 11,4M€) : ensemble de 11 cellules commerciales en pied d'immeuble, récentes et entièrement louées, situées au cœur de la station balnéaire prisée du sud de Dublin (commerce)",
  "Acquisition à Cardiff (Royaume-Uni, 2 388 m², 6,0M€) : 5 cellules commerciales bénéficiant d'une localisation ultra-prime dans l'une des rues commerçantes les plus actives du cœur de Cardiff, offrant le plus grand rooftop de la capitale du Pays de Galles (commerce)",
  "Acquisition à Aberdeen (Royaume-Uni, 5 608 m², 11,3M€) : actif logistique entièrement loué à un acteur majeur du secteur, bénéficiant d'un port d'importance nationale et base arrière de l'économie des activités off-shore (logistique)",
  "Acquisition à Brescia (Italie, 3 796 m², 5,4M€) : lot commercial indépendant occupé par une enseigne internationale de premier plan, l'un des sites les plus performants en termes de chiffres d'affaires de l'enseigne (commerce)",
  "Acquisition à Portlethen (Royaume-Uni, 6 652 m², 17,0M€) : immeuble de bureaux à proximité immédiate d'Aberdeen, capitale européenne du marché de l'énergie, combinant stabilité locative, forte rentabilité et potentiel de redéveloppement (bureaux)",
  "Acquisition à Veenendaal (Pays-Bas, 18 488 m², 14,6M€) : grand magasin dédié à l'aménagement de la maison, situé dans l'une des meilleures zones de chalandise du pays par la taille du bassin de consommation et le pouvoir d'achat (commerce)",
  
  // Événements structurants
  "Ouverture d'un nouveau pays : l'Irlande avec l'acquisition de 11 cellules commerciales à Dun Laoghaire (5 032 m²)",
  "Nouvelle région au Royaume-Uni : l'Écosse avec l'acquisition d'un actif logistique à Aberdeen (5 608 m²)",
  
  // Indicateurs de performance
  "Rentabilité moyenne des acquisitions de 9,12% AEM, témoignant d'une approche rigoureuse et sélective",
  "Collecte nette de 103,8M€ au cours du trimestre, témoignant de la confiance des investisseurs",
  
  // Gestion d'actifs
  "Début de la commercialisation des surfaces vacantes de l'ensemble immobilier de Getafe, proposées en priorité aux locataires déjà en place",
  "Travaux de rénovation des plateaux de bureaux à Assago se poursuivent conformément au calendrier prévu, visant la création de valeur",
  
  // Cessions
  "Aucune cession d'actif n'a été réalisée au cours du trimestre"
];

// Mettre à jour les actualités trimestrielles
comete['Actualités trimestrielles'] = actualites.join(' | ');

// Sauvegarder
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ ${actualites.length} actualités trimestrielles mises à jour avec descriptions détaillées\n`);

console.log('📊 Acquisitions détaillées:');
actualites.filter(a => a.includes('Acquisition à')).forEach((acq, i) => {
  console.log(`   ${i + 1}. ${acq.substring(0, 100)}...`);
});

console.log('\n✅ Fichier JSON mis à jour!');
