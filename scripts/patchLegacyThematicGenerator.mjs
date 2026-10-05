import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.cwd(), 'scripts/generateOptimizedThematicPages.js');
if (!fs.existsSync(file)) {
  console.log('[thematic-generator-patch] generator absent — skip');
  process.exit(0);
}

let source = fs.readFileSync(file, 'utf8');
const original = source;

source = source
  .replace(
    "const title = `SCPI ${societyName} — Analyse 2026`;",
    "const title = `SCPI ${societyName} — données, SCPI gérées et analyses`;"
  )
  .replace(
    "const metaDescription = `${societyName} : ${content.specialite}. Découvrez l'analyse complète de ses SCPI, rendements, avis CGP et fiscalité.`;",
    "const metaDescription = `${societyName} : SCPI gérées, taux de distribution observés, capitalisation, TOF, frais, géographie et liens vers les fiches détaillées MaximusSCPI.`;"
  )
  .replace(/TD moyen 2024/g, 'TD moyen observé')
  .replace(/Rendement 2024/g, 'Rendement observé')
  .replace(
    '${scpi.description ? `<p class="scpi-detail-desc">${scpi.description}</p>` : \'\'}',
    ''
  );

source = source.replace(
  /\/\/ Points forts \/ vigilance[\s\S]*?\/\/ SCPI cards \(enriched\)/,
  `// Lecture méthodologique neutre\n  const pointsHTML = \`\n    <div class="society-two-col">\n      <div class="society-col">\n        <h3>✅ Données à comparer</h3>\n        <ul class="society-col-strong">\n          <li>Comparer les SCPI gérées sur leur taux de distribution, leur TOF, leurs frais et leur capitalisation.</li>\n          <li>Contrôler les secteurs, les zones géographiques, les locataires et la trajectoire des valeurs.</li>\n          <li>Vérifier la période de référence et la source de chaque donnée avant toute comparaison.</li>\n        </ul>\n      </div>\n      <div class="society-col">\n        <h3>⚠️ Points de vigilance</h3>\n        <ul class="society-col-warn">\n          <li>La distribution et le capital ne sont pas garantis.</li>\n          <li>La liquidité dépend des souscriptions, des retraits et du mécanisme propre à chaque SCPI.</li>\n          <li>La fiscalité dépend du mode de détention, de la nature des revenus et des pays concernés.</li>\n        </ul>\n      </div>\n    </div>\`;\n\n  // SCPI cards (enriched)`
);

source = source.replace(
  /\/\/ FAQ\n  let faqHTML = '';[\s\S]*?\/\/ HTML complet/,
  `// FAQ neutre et durable\n  const neutralFaq = [\n    [\`Quelles SCPI sont gérées par \\${societyName} ?\`, \`Cette page recense les SCPI attribuées à \\${societyName} dans le catalogue MaximusSCPI. Ouvrez chaque fiche pour vérifier les dernières données et leurs sources.\`],\n    ['Comment comparer les SCPI de cette société de gestion ?', 'Comparez rendement, TOF, frais, capitalisation, valorisation, endettement, géographie, secteurs et liquidité sur la même période de référence.'],\n    ['Les données affichées constituent-elles une recommandation ?', 'Non. Elles ont une vocation informative et comparative. Une décision d’investissement doit intégrer la situation, les objectifs, les risques et le mode de détention.'],\n  ];\n  const faqHTML = \`\n    <div class="society-faq">\n      \\${neutralFaq.map(item => \`\n      <details>\n        <summary>\\${item[0]}</summary>\n        <div class="society-faq-answer">\\${item[1]}</div>\n      </details>\`).join('\\n      ')}\n    </div>\`;\n\n  const faqSchemaJSON = \`,\n  {\n    "@context": "https://schema.org",\n    "@type": "FAQPage",\n    "mainEntity": [\n      \\${neutralFaq.map(item => \`{\n        "@type": "Question",\n        "name": "\\${escapeJsonLd(item[0])}",\n        "acceptedAnswer": {\n          "@type": "Answer",\n          "text": "\\${escapeJsonLd(item[1])}"\n        }\n      }\`).join(',\\n      ')}\n    ]\n  }\`;\n\n  // HTML complet`
);

source = source
  .replace(/,\s*"aggregateRating"\s*:\s*\{\s*"@type"\s*:\s*"AggregateRating",\s*"ratingValue"\s*:\s*"4\.8",\s*"reviewCount"\s*:\s*"127"\s*\}/g, '')
  .replace('<h1>SCPI ${societyName} — Analyse 2026</h1>', '<h1>SCPI ${societyName} — données et analyses</h1>')
  .replace('<p class="society-hero-subtitle">${content.specialite}</p>', '<p class="society-hero-subtitle">SCPI gérées, indicateurs observés et liens vers les données détaillées.</p>')
  .replace('<p>${content.presentation}</p>', '<p>Cette page regroupe les SCPI rattachées à ${societyName} dans le catalogue MaximusSCPI. Les chiffres doivent être rapprochés des dernières publications officielles de la société de gestion et de chaque SCPI.</p>')
  .replace(
    /<!-- 4\. AVIS CGP -->[\s\S]*?<!-- 5\. FAQ -->/,
    `<!-- 4. MÉTHODOLOGIE -->\n    <section class="society-section">\n      <h2 class="accent-yellow">Méthode de lecture MaximusSCPI</h2>\n      <div class="society-avis">\n        <div class="society-avis-text">\n          <p>La société de gestion n'est pas classée sur une opinion commerciale. MaximusSCPI compare les SCPI à partir des données publiées, de leur fraîcheur, de leur trajectoire et des signaux de vigilance observables.</p>\n        </div>\n      </div>\n    </section>\n\n    <!-- 5. FAQ -->`
  )
  .replace('<h3>Prêt à investir avec ${societyName} ?</h3>', '<h3>Comparer les SCPI gérées par ${societyName}</h3>')
  .replace('Sans engagement • Conseiller certifié ORIAS • Réponse sous 24h', 'Sans engagement • Analyse personnalisée sur rendez-vous');

if (source !== original) {
  fs.writeFileSync(file, source);
  console.log('[thematic-generator-patch] legacy manager output neutralized');
} else {
  console.log('[thematic-generator-patch] no changes needed');
}
