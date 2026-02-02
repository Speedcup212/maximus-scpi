const fs = require('fs');
const path = require('path');

// Lire les données du bulletin
const bulletinDataPath = path.join(__dirname, 'processLogInT3_2025.json');
const bulletinData = JSON.parse(fs.readFileSync(bulletinDataPath, 'utf8'));

// Lire le fichier scpi_complet.json
const scpiDataPath = path.join(__dirname, '../src/data/scpi_complet.json');
const scpiData = JSON.parse(fs.readFileSync(scpiDataPath, 'utf8'));

// Trouver la SCPI Log In
const logIn = scpiData.find(s => s['Nom SCPI'] === 'Log In');

if (!logIn) {
  console.error('❌ SCPI "Log In" non trouvée');
  process.exit(1);
}

console.log('✅ SCPI Log In trouvée\n');

// Créer l'entrée trimestrielle ou la mettre à jour
let entryT3 = scpiData.find(s => 
  s['Nom SCPI'] === 'Log In' && 
  s['Période bulletin trimestriel'] === 'T3 2025'
);

if (!entryT3) {
  // Créer une nouvelle entrée trimestrielle basée sur l'entrée principale
  entryT3 = JSON.parse(JSON.stringify(logIn));
  entryT3['Période bulletin trimestriel'] = 'T3 2025';
  scpiData.push(entryT3);
  console.log('✅ Nouvelle entrée trimestrielle T3 2025 créée\n');
} else {
  console.log('✅ Entrée trimestrielle T3 2025 trouvée, mise à jour...\n');
}

// Mettre à jour les données
let updated = false;

if (bulletinData.endettement !== null && bulletinData.endettement !== undefined) {
  entryT3['Endettement (%)'] = bulletinData.endettement;
  console.log(`✅ Endettement: ${bulletinData.endettement}%`);
  updated = true;
}

if (bulletinData.collecteNetteTrimestre !== null && bulletinData.collecteNetteTrimestre !== undefined) {
  entryT3['Collecte nette trimestre'] = bulletinData.collecteNetteTrimestre;
  console.log(`✅ Collecte nette trimestre: ${(bulletinData.collecteNetteTrimestre / 1000000).toFixed(1)} M€`);
  updated = true;
}

if (bulletinData.nombreLocataires !== null && bulletinData.nombreLocataires !== undefined) {
  entryT3['Nombre de locataires'] = bulletinData.nombreLocataires;
  console.log(`✅ Nombre de locataires: ${bulletinData.nombreLocataires}`);
  updated = true;
}

if (bulletinData.walb !== null && bulletinData.walb !== undefined) {
  entryT3['WALB'] = bulletinData.walb;
  console.log(`✅ WALB: ${bulletinData.walb} ans`);
  updated = true;
}

if (bulletinData.tof !== null && bulletinData.tof !== undefined) {
  entryT3['TOF (%)'] = bulletinData.tof;
  console.log(`✅ TOF: ${bulletinData.tof}%`);
  updated = true;
}

if (bulletinData.capitalisation !== null && bulletinData.capitalisation !== undefined) {
  entryT3['Capitalisation (M€)'] = bulletinData.capitalisation / 1000000;
  console.log(`✅ Capitalisation: ${(bulletinData.capitalisation / 1000000).toFixed(1)} M€`);
  updated = true;
}

if (bulletinData.prixPart !== null && bulletinData.prixPart !== undefined) {
  entryT3['Prix de souscription (€)'] = bulletinData.prixPart;
  // Mettre à jour aussi l'entrée principale si le prix change
  if (logIn['Prix de souscription (€)'] !== bulletinData.prixPart) {
    logIn['Prix de souscription (€)'] = bulletinData.prixPart;
    console.log(`✅ Prix de souscription mis à jour dans l'entrée principale: ${bulletinData.prixPart}€`);
  }
  console.log(`✅ Prix de souscription: ${bulletinData.prixPart}€`);
  updated = true;
}

if (bulletinData.valeurReconstitution !== null && bulletinData.valeurReconstitution !== undefined) {
  entryT3['Valeur de reconstitution (€)'] = bulletinData.valeurReconstitution;
  console.log(`✅ Valeur de reconstitution: ${bulletinData.valeurReconstitution}€`);
  updated = true;
}

// Mettre à jour les répartitions sectorielles
if (bulletinData.repartitionSectorielle) {
  entryT3['Répartition Sectorielle JSON'] = bulletinData.repartitionSectorielle;
  // Générer le texte
  const sectText = Object.entries(bulletinData.repartitionSectorielle)
    .map(([k, v]) => `${k} (${v}%)`)
    .join(', ');
  entryT3['Répartition Sectorielle'] = sectText;
  console.log('✅ Répartition sectorielle mise à jour');
  updated = true;
}

// Mettre à jour les répartitions géographiques
if (bulletinData.repartitionGeographique) {
  entryT3['Répartition Géographique JSON'] = bulletinData.repartitionGeographique;
  // Générer le texte
  const geoText = Object.entries(bulletinData.repartitionGeographique)
    .map(([k, v]) => `${k} (${v}%)`)
    .join(', ');
  entryT3['Répartition Géographique'] = geoText;
  console.log('✅ Répartition géographique mise à jour');
  updated = true;
}

// Mettre à jour les actualités trimestrielles
if (bulletinData.actualitesTrimestrielles && bulletinData.actualitesTrimestrielles.length > 0) {
  const actualitesText = bulletinData.actualitesTrimestrielles.join(' | ');
  entryT3['Actualités trimestrielles'] = actualitesText;
  console.log('✅ Actualités trimestrielles mises à jour');
  updated = true;
}

// Mettre à jour le nombre d'immeubles si mentionné dans les actualités
const nbImmeublesMatch = bulletinData.actualitesTrimestrielles?.find(a => a.includes('actifs immobiliers'));
if (nbImmeublesMatch) {
  const match = nbImmeublesMatch.match(/(\d+)\s+actifs?/i);
  if (match) {
    entryT3['Nombre d\'immeubles'] = parseInt(match[1]);
    console.log(`✅ Nombre d'immeubles: ${match[1]}`);
    updated = true;
  }
}

if (updated) {
  // Sauvegarder
  fs.writeFileSync(scpiDataPath, JSON.stringify(scpiData, null, 2), 'utf8');
  console.log('\n✅ Fichier scpi_complet.json mis à jour');
} else {
  console.log('\n⚠️  Aucune mise à jour effectuée');
}
