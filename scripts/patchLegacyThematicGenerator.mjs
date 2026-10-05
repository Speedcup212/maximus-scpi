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

const neutralPointsBlock = [
  '// Lecture méthodologique neutre',
  '  const pointsHTML = `',
  '    <div class="society-two-col">',
  '      <div class="society-col">',
  '        <h3>✅ Données à comparer</h3>',
  '        <ul class="society-col-strong">',
  '          <li>Comparer les SCPI gérées sur leur taux de distribution, leur TOF, leurs frais et leur capitalisation.</li>',
  '          <li>Contrôler les secteurs, les zones géographiques, les locataires et la trajectoire des valeurs.</li>',
  '          <li>Vérifier la période de référence et la source de chaque donnée avant toute comparaison.</li>',
  '        </ul>',
  '      </div>',
  '      <div class="society-col">',
  '        <h3>⚠️ Points de vigilance</h3>',
  '        <ul class="society-col-warn">',
  '          <li>La distribution et le capital ne sont pas garantis.</li>',
  '          <li>La liquidité dépend des souscriptions, des retraits et du mécanisme propre à chaque SCPI.</li>',
  '          <li>La fiscalité dépend du mode de détention, de la nature des revenus et des pays concernés.</li>',
  '        </ul>',
  '      </div>',
  '    </div>`;',
  '',
  '  // SCPI cards (enriched)',
].join('\n');

source = source.replace(
  /\/\/ Points forts \/ vigilance[\s\S]*?\/\/ SCPI cards \(enriched\)/,
  neutralPointsBlock
);

const neutralFaqBlock = [
  '// FAQ neutre et durable',
  '  const neutralFaq = [',
  '    [`Quelles SCPI sont gérées par ${societyName} ?`, `Cette page recense les SCPI attribuées à ${societyName} dans le catalogue MaximusSCPI. Ouvrez chaque fiche pour vérifier les dernières données et leurs sources.`],',
  "    ['Comment comparer les SCPI de cette société de gestion ?', 'Comparez rendement, TOF, frais, capitalisation, valorisation, endettement, géographie, secteurs et liquidité sur la même période de référence.'],",
  "    ['Les données affichées constituent-elles une recommandation ?', 'Non. Elles ont une vocation informative et comparative. Une décision d’investissement doit intégrer la situation, les objectifs, les risques et le mode de détention.'],",
  '  ];',
  '  const faqHTML = `',
  '    <div class="society-faq">',
  '      ${neutralFaq.map(item => `',
  '      <details>',
  '        <summary>${item[0]}</summary>',
  '        <div class="society-faq-answer">${item[1]}</div>',
  '      </details>`).join(\'\\n      \')}',
  '    </div>`;',
  '',
  '  const faqSchemaJSON = `,',
  '  {',
  '    "@context": "https://schema.org",',
  '    "@type": "FAQPage",',
  '    "mainEntity": [',
  '      ${neutralFaq.map(item => `{',
  '        "@type": "Question",',
  '        "name": "${escapeJsonLd(item[0])}",',
  '        "acceptedAnswer": {',
  '          "@type": "Answer",',
  '          "text": "${escapeJsonLd(item[1])}"',
  '        }',
  '      }`).join(\',\\n      \')}',
  '    ]',
  '  }`;',
  '',
  '  // HTML complet',
].join('\n');

source = source.replace(
  /\/\/ FAQ\n  let faqHTML = '';[\s\S]*?\/\/ HTML complet/,
  neutralFaqBlock
);

source = source
  .replace(/,\s*"aggregateRating"\s*:\s*\{\s*"@type"\s*:\s*"AggregateRating",\s*"ratingValue"\s*:\s*"4\.8",\s*"reviewCount"\s*:\s*"127"\s*\}/g, '')
  .replace('<h1>SCPI ${societyName} — Analyse 2026</h1>', '<h1>SCPI ${societyName} — données et analyses</h1>')
  .replace('<p class="society-hero-subtitle">${content.specialite}</p>', '<p class="society-hero-subtitle">SCPI gérées, indicateurs observés et liens vers les données détaillées.</p>')
  .replace('<p>${content.presentation}</p>', '<p>Cette page regroupe les SCPI rattachées à ${societyName} dans le catalogue MaximusSCPI. Les chiffres doivent être rapprochés des dernières publications officielles de la société de gestion et de chaque SCPI.</p>')
  .replace(
    /<!-- 4\. AVIS CGP -->[\s\S]*?<!-- 5\. FAQ -->/,
    [
      '<!-- 4. MÉTHODOLOGIE -->',
      '    <section class="society-section">',
      '      <h2 class="accent-yellow">Méthode de lecture MaximusSCPI</h2>',
      '      <div class="society-avis">',
      '        <div class="society-avis-text">',
      "          <p>La société de gestion n'est pas classée sur une opinion commerciale. MaximusSCPI compare les SCPI à partir des données publiées, de leur fraîcheur, de leur trajectoire et des signaux de vigilance observables.</p>",
      '        </div>',
      '      </div>',
      '    </section>',
      '',
      '    <!-- 5. FAQ -->',
    ].join('\n')
  )
  .replace('<h3>Prêt à investir avec ${societyName} ?</h3>', '<h3>Comparer les SCPI gérées par ${societyName}</h3>')
  .replace('Sans engagement • Conseiller certifié ORIAS • Réponse sous 24h', 'Sans engagement • Analyse personnalisée sur rendez-vous');

if (source !== original) {
  fs.writeFileSync(file, source);
  console.log('[thematic-generator-patch] legacy manager output neutralized');
} else {
  console.log('[thematic-generator-patch] no changes needed');
}
