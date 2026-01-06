import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = new jsPDF();

// Page 1 - Couverture
doc.setFillColor(41, 128, 185);
doc.rect(0, 0, 210, 297, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(32);
doc.text('Guide Comparatif', 105, 100, { align: 'center' });
doc.setFontSize(24);
doc.text('SCPI 2024', 105, 120, { align: 'center' });
doc.setFontSize(16);
doc.text('Iroko Zen vs Novaxia Neo', 105, 150, { align: 'center' });
doc.text('Analyse détaillée et recommandations', 105, 170, { align: 'center' });

// Page 2 - Introduction
doc.addPage();
doc.setTextColor(0, 0, 0);
doc.setFontSize(22);
doc.text('Introduction', 20, 30);
doc.setFontSize(12);
const intro = [
  'Ce guide compare deux SCPI performantes :',
  '',
  'Iroko Zen - SCPI diversifiée européenne',
  '• Rendement 2023: 5.2%',
  '• Capitalisation: 850M€',
  '• Focus: Bureaux et commerces européens',
  '',
  'Novaxia Neo - SCPI de rendement',
  '• Rendement 2023: 5.8%',
  '• Capitalisation: 420M€',
  '• Focus: Recyclage urbain et rénovation',
  '',
  'Cette analyse vous aide à choisir selon votre profil.'
];
let y = 50;
intro.forEach(line => {
  doc.text(line, 20, y);
  y += 8;
});

// Page 3 - Comparaison
doc.addPage();
doc.setFontSize(22);
doc.text('Comparaison détaillée', 20, 30);
doc.setFontSize(12);
const comparison = [
  'Performance',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  'Iroko Zen: 5.2% (stable)',
  'Novaxia Neo: 5.8% (volatilité modérée)',
  '',
  'Diversification',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  'Iroko Zen: Excellente (multi-pays)',
  'Novaxia Neo: Spécialisée (reconversion)',
  '',
  'Liquidité',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  'Iroko Zen: Très bonne',
  'Novaxia Neo: Bonne',
];
y = 50;
comparison.forEach(line => {
  doc.text(line, 20, y);
  y += 8;
});

// Page 4 - Profils investisseurs
doc.addPage();
doc.setFontSize(22);
doc.text('Profils investisseurs', 20, 30);
doc.setFontSize(12);
doc.setFillColor(52, 152, 219);
doc.rect(15, 45, 180, 50, 'F');
doc.setTextColor(255, 255, 255);
doc.text('Iroko Zen recommandée pour:', 20, 55);
doc.setFontSize(11);
doc.text('• Investisseurs recherchant la stabilité', 25, 70);
doc.text('• Première acquisition en SCPI', 25, 78);
doc.text('• Diversification patrimoniale', 25, 86);

doc.setFillColor(46, 204, 113);
doc.rect(15, 110, 180, 50, 'F');
doc.setFontSize(12);
doc.text('Novaxia Neo recommandée pour:', 20, 120);
doc.setFontSize(11);
doc.text('• Investisseurs dynamiques', 25, 135);
doc.text('• Recherche de rendement élevé', 25, 143);
doc.text('• Sensibilité environnementale (ESG)', 25, 151);

// Page 5 - Recommandations
doc.addPage();
doc.setTextColor(0, 0, 0);
doc.setFontSize(22);
doc.text('Nos recommandations', 20, 30);
doc.setFontSize(12);
const recommendations = [
  'Stratégie d\'investissement conseillée:',
  '',
  '1. Profil Équilibré (70/30)',
  '   • 70% Iroko Zen (stabilité)',
  '   • 30% Novaxia Neo (rendement)',
  '',
  '2. Profil Prudent (100%)',
  '   • 100% Iroko Zen',
  '',
  '3. Profil Dynamique (50/50)',
  '   • 50% Iroko Zen',
  '   • 50% Novaxia Neo',
  '',
  'Montant minimum conseillé: 5 000€ par SCPI',
  'Horizon d\'investissement: Minimum 8 ans',
];
y = 50;
recommendations.forEach(line => {
  doc.text(line, 20, y);
  y += 8;
});

// Page 6 - Contact
doc.addPage();
doc.setFillColor(41, 128, 185);
doc.rect(0, 0, 210, 297, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(28);
doc.text('Besoin de conseils ?', 105, 100, { align: 'center' });
doc.setFontSize(16);
doc.text('Prenez rendez-vous avec nos experts', 105, 130, { align: 'center' });
doc.setFontSize(14);
doc.text('MaximusSCPI.com', 105, 160, { align: 'center' });
doc.text('Conseil personnalisé gratuit', 105, 180, { align: 'center' });

// Sauvegarder le PDF
const pdfBuffer = doc.output('arraybuffer');
const outputPath = path.join(__dirname, '..', 'public', 'PDF Magnet.pdf');
fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));

console.log('✅ PDF créé avec succès:', outputPath);
console.log('📄 Taille:', fs.statSync(outputPath).size, 'octets');
