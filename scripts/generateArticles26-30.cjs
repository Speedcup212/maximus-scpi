const fs = require('fs');
const path = require('path');

const articlesConfig = [
  {
    id: 26,
    component: 'ScpiOuOpciDifferencesAvantagesArticle',
    title: 'SCPI vs OPCI : différences, avantages et quel placement choisir en 2025',
    intro: 'SCPI et OPCI sont deux placements immobiliers collectifs, mais leurs différences sont importantes : liquidité, composition, risque, fiscalité.',
    sections: [
      {title: 'SCPI : rappel', items: ['100 % immobilier physique', 'Rendement 4,5–6,5 %', 'Liquidité moyenne', 'Horizon 8+ ans']},
      {title: 'OPCI : définition', items: ['60 % immobilier + 40 % actifs financiers', 'Rendement 3–5 %', 'Liquidité bonne (rachats fréquents)', 'Horizon 5+ ans']},
      {title: 'Tableau comparatif', table: [
        {critere: 'Composition', scpi: '100 % immo', opci: '60 % immo + 40 % finance'},
        {critere: 'Volatilité', scpi: 'Faible', opci: 'Moyenne'},
        {critere: 'Rendement', scpi: '4,5–6,5 %', opci: '3–5 %'},
        {critere: 'Liquidité', scpi: 'Moyenne', opci: 'Bonne'}
      ]},
      {title: 'Quel choix ?', items: ['SCPI : recherche rendement + stabilité', 'OPCI : recherche liquidité + diversification mixte']}
    ],
    conclusion: 'SCPI = pur immobilier. OPCI = hybride immo + finance. Pour un patrimoine stable, privilégiez SCPI.'
  },
  {
    id: 27,
    component: 'ScpiResidentiellesLogementLocatifScpiHabitationArticle',
    title: 'SCPI Résidentielles 2025 : logement locatif, habitation et opportunités',
    intro: 'Les SCPI résidentielles investissent dans des logements (appartements, résidences étudiantes, résidences seniors). Secteur en croissance en 2025.',
    sections: [
      {title: 'Types de SCPI résidentielles', items: ['Logement classique (Paris, Lyon, Bordeaux)', 'Résidences étudiantes', 'Résidences seniors / EHPAD', 'Coliving / Coworking']},
      {title: 'Performances 2023–2025', table: [
        {annee: '2023', rendement: '4,2 %'},
        {annee: '2024', rendement: '4,5 %'},
        {annee: '2025 (proj.)', rendement: '4,3–4,9 %'}
      ]},
      {title: 'Avantages', items: ['Demande locative forte (crise logement)', 'Baux renouvelés fréquemment', 'Indexation loyers solide']},
      {title: 'Risques', items: ['Rotation locataires élevée', 'Vacance ponctuelle', 'Gestion intensive']}
    ],
    conclusion: 'SCPI résidentielles = niche intéressante. Rendement légèrement inférieur aux bureaux/commerces mais demande structurelle forte.'
  },
  {
    id: 28,
    component: 'ScpiSanteSeniorsEhpadCliniquesInvestissementArticle',
    title: 'SCPI Santé 2025 : seniors, EHPAD, cliniques et opportunités sectorielles',
    intro: 'Le secteur santé explose : vieillissement population, médicalisation croissante, besoin infrastructures. SCPI santé = rendement + impact social.',
    sections: [
      {title: 'Types d\'actifs santé', items: ['EHPAD (maisons de retraite)', 'Cliniques privées', 'Centres médicaux', 'Laboratoires']},
      {title: 'Performances 2023–2025', table: [
        {annee: '2023', rendement: '5,1 %'},
        {annee: '2024', rendement: '5,4 %'},
        {annee: '2025 (proj.)', rendement: '5,2–5,7 %'}
      ]},
      {title: 'Top SCPI santé 2025', items: ['Primovie (Primonial) : 5,6 % / Pure santé', 'Pierre Sélection (Ufifrance Immo) : 5,3 % / Mixte santé', 'Pierval Santé (Euryale) : 5,8 % / EHPAD + cliniques']},
      {title: 'Risques', items: ['Dépendance réglementation (tarifs EHPAD)', 'Locataires spécialisés (faillites possibles)', 'Controverses secteur EHPAD (Orpea)']}
    ],
    conclusion: 'SCPI santé = thématique porteuse. Vieillissement + besoin infrastructure = demande structurelle. Attention qualité gestionnaire.'
  },
  {
    id: 29,
    component: 'ScpiTmi30PourcentArbitrageAvDirectArticle',
    title: 'TMI 30 % : SCPI en direct ou en assurance-vie ? Arbitrage fiscal 2025',
    intro: 'Vous êtes imposé à 30 % (TMI). SCPI direct ou SCPI en assurance-vie ? Chaque enveloppe a ses avantages fiscaux.',
    sections: [
      {title: 'SCPI direct TMI 30 %', items: ['Revenus fonciers imposés IR 30 % + PS 17,2 % = 47,2 % total', 'Abattement 30 % si micro-foncier (< 15 000 €)', 'Charges déductibles (intérêts emprunt, frais)']},
      {title: 'SCPI en assurance-vie TMI 30 %', items: ['Capitalisation : revenus non imposés sauf sortie', 'Sortie avant 8 ans : PFU 30 %', 'Sortie après 8 ans : PFU 24,7 % (abattement 4 600 € célibataire)']},
      {title: 'Tableau comparatif', table: [
        {critere: 'Fiscalité annuelle', direct: '47,2 %', av: '0 % (capitalisation)'},
        {critere: 'Sortie avant 8 ans', direct: 'N/A', av: '30 %'},
        {critere: 'Sortie après 8 ans', direct: 'N/A', av: '24,7 %'}
      ]},
      {title: 'Recommandation TMI 30 %', items: ['Horizon < 8 ans : SCPI direct', 'Horizon > 8 ans : assurance-vie', 'Mix 50/50 pour optimiser']}
    ],
    conclusion: 'TMI 30 % = zone intermédiaire. Assurance-vie avantageuse si horizon > 8 ans. Direct avantageux si besoin revenus immédiats.'
  },
  {
    id: 30,
    component: 'SuccessionScpiTransmissionDroitsHeritageArticle',
    title: 'Succession SCPI 2025 : transmission, droits, démembrement et stratégies',
    intro: 'Les SCPI sont un excellent outil de transmission patrimoniale. Démembrement, donation, assurance-vie : plusieurs stratégies existent.',
    sections: [
      {title: 'Droits de succession SCPI classique', items: ['Barème progressif standard : 5 à 45 %', 'Abattement enfant : 100 000 € tous les 15 ans', 'Conjoint et PACS : exonération totale']},
      {title: 'Démembrement SCPI : optimisation succession', items: ['Donation nue-propriété enfants (décote 30–50 %)', 'Parents conservent usufruit (revenus)', 'À décès parents : pleine propriété enfants sans droits']},
      {title: 'SCPI en assurance-vie', items: ['Hors succession (art. 990 I CGI)', 'Abattement 152 500 € par bénéficiaire', 'Avant 70 ans : fiscalité douce', 'Après 70 ans : abattement 30 500 € global']},
      {title: 'Stratégie optimale succession SCPI', items: ['Démembrement SCPI direct pour enfants', 'SCPI assurance-vie pour conjoint', 'Donation progressive (100 k€ tous les 15 ans)']}
    ],
    conclusion: 'Les SCPI sont un formidable outil patrimonial. Démembrement + assurance-vie = combinaison gagnante pour transmettre en optimisant fiscalité.'
  }
];

function generateArticle(config) {
  let sectionsHTML = '';

  config.sections.forEach(section => {
    sectionsHTML += `
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">${section.title}</h2>
        <div className="space-y-4">`;

    if (section.items) {
      section.items.forEach(item => {
        sectionsHTML += `
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">${item}</p>
          </div>`;
      });
    }

    if (section.table) {
      sectionsHTML += `
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">`;

      const headers = Object.keys(section.table[0]);
      headers.forEach(h => {
        sectionsHTML += `<th className="p-4 text-left font-bold border border-gray-200 dark:border-gray-600">${h}</th>`;
      });

      sectionsHTML += `</tr></thead><tbody>`;

      section.table.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/30';
        sectionsHTML += `<tr className="${bg}">`;
        headers.forEach(h => {
          sectionsHTML += `<td className="p-4 border border-gray-200 dark:border-gray-600">${row[h]}</td>`;
        });
        sectionsHTML += `</tr>`;
      });

      sectionsHTML += `</tbody></table></div>`;
    }

    sectionsHTML += `</div></section>`;
  });

  return `import React from 'react';
import { User, Calendar, Clock, TrendingUp, Shield } from 'lucide-react';

export const ${config.component}: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-green-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-green-600">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-green-600">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">Article ${config.id}</li>
          </ol>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          ${config.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Éric Bellaiche, CGP-CIF</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>21 janvier 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>16 min de lecture</span>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">${config.intro}</p>
      </section>

      ${sectionsHTML}

      <section className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        <p className="text-lg text-green-50 leading-relaxed mb-6">${config.conclusion}</p>
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">Besoin de conseils personnalisés ?</h3>
          <a href="/comparateur-scpi" className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors">
            Comparer les SCPI
          </a>
        </div>
        <p className="text-sm text-green-100 mt-6 italic border-t border-white/20 pt-4">Éric Bellaiche, CGP-CIF</p>
      </section>
    </div>
  );
};

export default ${config.component};`;
}

const articlesDir = path.join(__dirname, '../src/components/articles');

articlesConfig.forEach(config => {
  const content = generateArticle(config);
  const filePath = path.join(articlesDir, `${config.component}.tsx`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Article ${config.id} généré`);
});

console.log('\n✅ Articles 26-30 générés !');
