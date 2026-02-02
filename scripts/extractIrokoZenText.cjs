const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractText() {
  try {
    const pdfPath = 'c:/Users/ericb/Desktop/Bulletin_trimestriel_Iroko_Zen_T3_2025.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;
    
    // Sauvegarder le texte dans un fichier pour analyse
    fs.writeFileSync('scripts/iroko_zen_t3_2025_text.txt', text, 'utf8');
    console.log('✅ Texte extrait et sauvegardé dans scripts/iroko_zen_t3_2025_text.txt');
    console.log('\nPremiers 3000 caractères:');
    console.log(text.substring(0, 3000));
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Installez pdf-parse avec: npm install pdf-parse');
    }
  }
}

extractText();
