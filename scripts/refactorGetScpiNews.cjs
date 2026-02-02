// Script pour tester la nouvelle structure de getScpiNews
// Format attendu : [Icône] Mot-clé – phrase (10-25 mots)

const testCases = [
  {
    type: 'acquisition',
    icon: '🏢',
    keyword: 'Acquisition',
    text: 'Acquisition à Fossò (Italie, 3 346 m², 6,7M€) : site industriel entièrement rénové, livré clé en main et loué pour une durée ferme de 15 ans à TreZeta Group, acteur italien spécialisé dans la fabrication de semelles pour chaussures de luxe (locaux d\'activités et sites de production)',
    wordCount: 0
  }
];

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function formatNewsPoint(icon, keyword, text) {
  const words = countWords(text);
  if (words < 10) {
    // Trop court, reformuler
    return null;
  } else if (words > 25) {
    // Trop long, tronquer intelligemment
    const wordsArray = text.split(/\s+/);
    const truncated = wordsArray.slice(0, 25).join(' ');
    return `${icon} ${keyword} – ${truncated}`;
  } else {
    return `${icon} ${keyword} – ${text}`;
  }
}

testCases.forEach(tc => {
  tc.wordCount = countWords(tc.text);
  const formatted = formatNewsPoint(tc.icon, tc.keyword, tc.text);
  console.log(`Original: ${tc.wordCount} mots`);
  console.log(`Formatted: ${formatted}`);
  console.log('');
});
