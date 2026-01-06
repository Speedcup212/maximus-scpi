import React from 'react';
import { renderToString } from 'react-dom/server';
import { getTemplateBySlug } from './src/data/articleTemplatesConfig.ts';
import { generateRichArticleContent } from './src/utils/richArticleContentGenerator.tsx';

const template = getTemplateBySlug('scpi-en-direct-ou-assurance-vie');
if (template) {
  const richSections = generateRichArticleContent(template);
  console.log(`\n✅ Template trouvé: ${template.title}`);
  console.log(`📊 Sections générées: ${richSections.length}`);
  console.log(`🔍 useRichContent: ${richSections && richSections.length > 0}`);

  if (richSections.length > 0) {
    console.log(`\n📝 Test de rendu de la première section:`);
    try {
      const html = renderToString(richSections[0].content);
      console.log(`✅ Rendu réussi: ${html.substring(0, 100)}...`);
      console.log(`📏 Taille HTML: ${html.length} caractères`);
    } catch (e) {
      console.error(`❌ Erreur de rendu: ${e.message}`);
    }
  }
}
