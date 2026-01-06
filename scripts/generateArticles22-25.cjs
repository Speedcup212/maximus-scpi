const fs = require('fs');
const path = require('path');

const articlesConfig = [
  {
    id: 22,
    component: 'ScpiEuropeennesAvantagesPs0RendementArticle',
    title: 'SCPI Européennes : avantages fiscaux, rendement et diversification en 2025',
    date: '21 janvier 2025',
    readTime: '19 min',
    intro: 'Les SCPI européennes investissent dans des immeubles situés hors de France : Allemagne, Pays-Bas, Espagne, Belgique, Irlande. Elles offrent des rendements bruts de 5,2 % à 6,5 % et bénéficient d\'une fiscalité différente.',
    sections: [
      {title: 'Pourquoi investir dans une SCPI européenne ?', items: ['Diversification géographique réelle', 'Marchés immobiliers différents (Allemagne = stabilité, Espagne = croissance)', 'Fiscalité : prélèvement à la source (PS) au lieu de l\'IR français', 'Rendements attractifs']},
      {title: 'Fiscalité des SCPI européennes', items: ['Prélèvement à la source (PS) dans le pays d\'origine', 'Crédit d\'impôt en France pour éviter double imposition', 'TMI 30 % = intérêt fiscal faible', 'TMI 41-45 % = gain fiscal potentiel']},
      {title: 'Top SCPI européennes 2025', items: ['Eurovalys (Primonial) : 5,8 % / Allemagne + Pays-Bas', 'Novapierre Allemagne 2 (Paref) : 5,5 % / 100 % Allemagne', 'Fair Invest (Euryale) : 6,2 % / Espagne + Portugal', 'Rivoli Avenir Patrimoine (Sofidy) : 5,1 % / Europe Nord']},
      {title: 'Risques spécifiques', items: ['Risque de change (€ → £ par ex.)', 'Contexte réglementaire différent', 'Liquidité parfois inférieure']}
    ],
    conclusion: 'Les SCPI européennes sont un excellent outil de diversification. Elles offrent des rendements légèrement supérieurs aux SCPI françaises et une fiscalité parfois avantageuse pour les TMI élevés.'
  },
  {
    id: 23,
    component: 'ScpiFiscalesMalrauxDeficitFoncier2025Article',
    title: 'SCPI Fiscales : Malraux, Déficit Foncier, Pinel en 2025',
    date: '21 janvier 2025',
    readTime: '20 min',
    intro: 'Les SCPI fiscales permettent de réduire votre impôt tout en investissant dans l\'immobilier. Malraux, Déficit Foncier, Pinel SCPI : chacune a ses règles, ses avantages et ses pièges.',
    sections: [
      {title: 'SCPI Malraux : réduction d\'impôt jusqu\'à 30 %', items: ['Investissement immeubles classés monuments historiques', 'Réduction IR : 22 % ou 30 % selon zone', 'Engagement 15 ans minimum', 'Ticket d\'entrée : 15 000 € à 30 000 €']},
      {title: 'SCPI Déficit Foncier : déduction jusqu\'à 10 700 €/an', items: ['Travaux > loyers = déficit déductible', 'Max 10 700 €/an + report excédent 10 ans', 'Pas de réduction IR directe mais économie fiscale indirecte', 'Idéal TMI 30-41-45 %']},
      {title: 'SCPI Pinel : fin du dispositif en 2024', items: ['Dispositif Pinel SCPI arrêté en 2024', 'Remplacé par Loc\'Avantages (peu utilisé)', 'SCPI Pinel existantes continuent engagement initial']},
      {title: 'Tableau comparatif Malraux vs Déficit Foncier', table: [
        {critere: 'Réduction IR', malraux: '22-30 % capital', deficitFoncier: 'Déduction revenus fonciers'},
        {critere: 'Engagement', malraux: '15 ans', deficitFoncier: '3 ans'},
        {critere: 'Ticket entrée', malraux: '15 000 € min', deficitFoncier: '5 000 € min'},
        {critere: 'Rendement net', malraux: '2-3 % après fiscalité', deficitFoncier: '3-4 %'}
      ]}
    ],
    conclusion: 'SCPI fiscales = outil puissant pour TMI 30 % et plus. Malraux = max réduction IR mais engagement lourd. Déficit Foncier = souplesse + déduction progressive.'
  },
  {
    id: 24,
    component: 'ScpiLogistiqueEntrepotsECommerce2025Article',
    title: 'SCPI Logistique 2025 : entrepôts, e-commerce et opportunités sectorielles',
    date: '21 janvier 2025',
    readTime: '17 min',
    intro: 'La logistique est le secteur immobilier qui a le plus explosé entre 2020 et 2025. L\'e-commerce, Amazon, les plateformes de livraison ont créé une demande massive d\'entrepôts modernes.',
    sections: [
      {title: 'Pourquoi la logistique performe ?', items: ['E-commerce : +58 % depuis 2019', 'Besoin entrepôts XXL (50 000 m²+)', 'Baux longs (9–12 ans)', 'Locataires solides : Amazon, DHL, Carrefour Supply']},
      {title: 'Performances SCPI logistique 2022–2025', table: [
        {annee: '2022', rendement: '5,8 %'},
        {annee: '2023', rendement: '6,1 %'},
        {annee: '2024', rendement: '5,9–6,4 %'},
        {annee: '2025 (proj.)', rendement: '5,7–6,2 %'}
      ]},
      {title: 'Top SCPI logistique 2025', items: ['Log In (Atream) : 6,1 % / Pure logistique France+EU', 'Activimmo (Alderan) : 5,9 % / Mixte logistique+bureaux', 'Immorente 2 (Sofidy) : 5,4 % / Diversifié avec poche logistique']},
      {title: 'Risques spécifiques', items: ['Saturation du marché logistique Île-de-France', 'Obsolescence rapide (bâtiments non conformes normes carbone)', 'Dépendance Amazon (certaines SCPI 40 % loués à Amazon)']}
    ],
    conclusion: 'Les SCPI logistique offrent rendement + croissance. Attention à la diversification locataires et à la qualité du patrimoine (normes environnementales).'
  },
  {
    id: 25,
    component: 'ScpiOuEtfImmobilierReitComparatifArticle',
    title: 'SCPI vs ETF Immobilier (REIT) : comparatif 2025, rendement et fiscalité',
    date: '21 janvier 2025',
    readTime: '18 min',
    intro: 'SCPI ou ETF immobilier (REIT) ? Les deux permettent d\'investir dans l\'immobilier sans acheter de bien. Mais les différences sont massives.',
    sections: [
      {title: 'SCPI : caractéristiques', items: ['Placement immobilier physique direct', 'Rendement : 4,5–6,5 % distribué trimestriellement', 'Liquidité : moyenne (marché secondaire)', 'Fiscalité : revenus fonciers (IR)']},
      {title: 'ETF REIT : caractéristiques', items: ['Placement financier (actions foncières cotées)', 'Rendement : 3–5 % dividendes', 'Liquidité : immédiate (Bourse)', 'Fiscalité : flat tax 30 % ou IR']},
      {title: 'Tableau comparatif SCPI vs ETF REIT', table: [
        {critere: 'Nature', scpi: 'Immobilier direct', etf: 'Actions foncières'},
        {critere: 'Volatilité', scpi: 'Faible', etf: 'Élevée (±20 %/an)'},
        {critere: 'Rendement', scpi: '4,5–6,5 %', etf: '3–5 %'},
        {critere: 'Liquidité', scpi: 'Moyenne', etf: 'Immédiate'},
        {critere: 'Horizon', scpi: '8+ ans', etf: '5+ ans'},
        {critere: 'Frais', scpi: '8–12 % souscription', etf: '0,2–0,5 %/an'}
      ]},
      {title: 'Quel choix selon profil ?', items: ['SCPI : profil patrimonial, recherche revenus réguliers, acceptation horizon long', 'ETF REIT : profil dynamique, recherche liquidité, acceptation volatilité']}
    ],
    conclusion: 'SCPI = stabilité + rendement élevé. ETF REIT = liquidité + souplesse. Pour un patrimoine immobilier stable, privilégiez les SCPI. Pour une allocation tactique court terme, les ETF.'
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
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-800 dark:text-gray-200">${item}</p>
          </div>`;
      });
    }

    if (section.table) {
      sectionsHTML += `
        <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600">`;

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
import { User, Calendar, Clock, TrendingUp } from 'lucide-react';

export const ${config.component}: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600">Éducation</a></li>
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
            <span>${config.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>${config.readTime} de lecture</span>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">${config.intro}</p>
      </section>

      ${sectionsHTML}

      <section className="bg-gradient-to-r from-blue-600 to-cyan-700 dark:from-blue-800 dark:to-cyan-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        <p className="text-lg text-blue-50 leading-relaxed mb-6">${config.conclusion}</p>
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">Besoin d'aide ?</h3>
          <a href="/comparateur-scpi" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
            Comparer les SCPI
          </a>
        </div>
        <p className="text-sm text-blue-100 mt-6 italic border-t border-white/20 pt-4">Éric Bellaiche, CGP-CIF</p>
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

console.log('\n✅ Articles 22-25 générés !');
