const fs = require('fs');
const path = require('path');

// Configuration des 13 articles avec leur contenu complet
const articlesConfig = [
  {
    id: 18,
    slug: 'risques-scpi-vacance-locative-liquidite',
    title: 'Risques des SCPI en 2025 : analyse complète et stratégies pour investir sereinement',
    component: 'RisquesScpiVacanceLocativeLiquiditeArticle',
    date: '21 janvier 2025',
    readTime: '16 min',
    intro: 'Les SCPI ne sont pas un produit sans risque. Vacance locative, liquidité, gestion défaillante, inflation mal maîtrisée : en 2025, certains épargnants découvrent des baisses de distribution ou des reventes difficiles.',
    sections: [
      {
        title: 'Les 5 risques SCPI en 2025',
        content: [
          { subtitle: '1. Risque de vacance locative', text: 'TOF en baisse = revenus en baisse. Si une SCPI affiche un TOF de 88 %, cela signifie que 12 % du patrimoine ne rapporte rien.' },
          { subtitle: '2. Risque de liquidité', text: 'Une SCPI à capital fixe peut afficher un délai de retrait de 18 à 24 mois. Les SCPI à capital variable gèlent parfois les rachats si trop de demandes arrivent en même temps.' },
          { subtitle: '3. Risque locataire', text: 'Si votre SCPI détient 40 % de bureaux tertiaires loués à des start-ups fragiles, un défaut peut peser lourd.' },
          { subtitle: '4. Risque de dévalorisation', text: 'Les prix de l\'immobilier baissent depuis 2022–2023. Une SCPI bureaux Île-de-France peut voir sa valeur de retrait baisser de 8 à 12 %.' },
          { subtitle: '5. Risque de gestion', text: 'Un gestionnaire peu réactif, qui ne remplace pas les locataires défaillants, fait chuter les performances.' }
        ]
      },
      {
        title: 'Comment limiter ces risques : stratégie CGP-CIF',
        content: [
          { subtitle: 'TOF > 92 %', text: 'Visez des SCPI avec un taux d\'occupation > 92 %. Cela prouve une gestion dynamique et des actifs recherchés.' },
          { subtitle: 'Diversification sectorielle', text: 'Ne misez jamais 100 % sur un seul secteur. Répartissez : 40 % commerces, 30 % bureaux, 20 % santé, 10 % logistique.' },
          { subtitle: 'Délai de détention > 8 ans', text: 'Les SCPI sont des placements long terme. La liquidité doit être un bonus, pas un critère primaire.' },
          { subtitle: 'Gestion reconnue', text: 'Choisissez des sociétés de gestion expérimentées : Perial, Sofidy, Primonial REIM, Paref Gestion.' },
          { subtitle: 'Part Europe > 20 %', text: 'Une exposition européenne (Allemagne, Pays-Bas, Espagne) dilue le risque France.' }
        ]
      }
    ],
    conclusion: 'Les SCPI comportent des risques réels mais maîtrisables. Un investisseur informé, qui diversifie, vérifie le TOF, choisit des gestionnaires solides et accepte l\'horizon long terme, obtient un excellent couple rendement/risque.'
  },
  {
    id: 19,
    slug: 'sci-scpi-societe-civile-immobiliere-parts',
    title: 'SCI vs SCPI : différences juridiques, fiscales et patrimoniales en 2025',
    component: 'SciScpiSocieteCivileImmobilierePartsArticle',
    date: '21 janvier 2025',
    readTime: '18 min',
    intro: 'SCI ou SCPI ? Les deux acronymes se ressemblent mais désignent des outils très différents. L\'un est une société que vous créez, l\'autre est un placement que vous achetez.',
    sections: [
      {
        title: 'SCI : définition complète',
        content: [
          { subtitle: 'Statut juridique', text: 'Société Civile Immobilière = structure juridique pour détenir de l\'immobilier à plusieurs (famille, associés).' },
          { subtitle: 'Gestion', text: 'Vous gérez TOUT : achat du bien, recherche locataire, travaux, fiscalité, comptabilité.' },
          { subtitle: 'Capital minimum', text: '1 € symbolique mais en réalité vous apportez le bien immobilier.' },
          { subtitle: 'Fiscalité', text: 'IR (transparence fiscale) ou IS (impôt société 25 %).' }
        ]
      },
      {
        title: 'SCPI : définition complète',
        content: [
          { subtitle: 'Statut juridique', text: 'Société Civile de Placement Immobilier = copropriété immobilière gérée par un professionnel agréé AMF.' },
          { subtitle: 'Gestion', text: 'Totalement déléguée. Vous achetez des parts, vous recevez des loyers trimestriels. Point.' },
          { subtitle: 'Capital minimum', text: 'À partir de 200 € par part (certaines SCPI = 1 000 € la part).' },
          { subtitle: 'Fiscalité', text: 'Revenus fonciers (IR) ou revenus de capitaux mobiliers si SCPI européenne.' }
        ]
      },
      {
        title: 'Tableau comparatif SCI vs SCPI',
        table: [
          { critere: 'Gestion', sci: 'Active (vous gérez)', scpi: 'Passive (déléguée)' },
          { critere: 'Capital de départ', sci: '50 000 € min (apport bien)', scpi: '200 € à 1 000 €' },
          { critere: 'Diversification', sci: 'Non (1 bien)', scpi: 'Oui (50 à 200 biens)' },
          { critere: 'Liquidité', sci: 'Faible (vendre = lourd)', scpi: 'Moyenne (marché secondaire)' },
          { critere: 'Fiscalité transmission', sci: 'Donation démembrée possible', scpi: 'Oui aussi' },
          { critere: 'Travaux', sci: 'À votre charge', scpi: 'Société de gestion' },
          { critere: 'Risque locataire', sci: 'Concentré sur 1 ou 2 locataires', scpi: 'Dilué sur 500+ locataires' }
        ]
      }
    ],
    conclusion: 'SCI = contrôle maximal, gestion active, optimisation familiale. SCPI = gestion passive, diversification immédiate, ticket d\'entrée faible. Pour 90 % des épargnants, la SCPI est plus adaptée. La SCI devient intéressante si vous avez déjà un bien à apporter ou si vous souhaitez un outil patrimonial familial complexe.'
  },
  {
    id: 20,
    slug: 'scpi-bureaux-tertiaire-teletravail-2025',
    title: 'SCPI Bureaux en 2025 : impact du télétravail et opportunités tertiaires',
    component: 'ScpiBureauxTertiaireTeletravail2025Article',
    date: '21 janvier 2025',
    readTime: '17 min',
    intro: 'Le télétravail a explosé depuis 2020. En 2025, 40 % des salariés français télétravaillent au moins 2 jours/semaine. Résultat : les entreprises renégocient leurs surfaces de bureaux.',
    sections: [
      {
        title: 'Le marché bureaux en 2025 : état des lieux',
        content: [
          { subtitle: 'Tendance macro', text: 'Baisse des surfaces louées de 12 à 18 % (2020–2024) dans les zones tertiaires classiques.' },
          { subtitle: 'Zones impactées', text: 'La Défense (Paris), Lyon Part-Dieu, tours anciennes.' },
          { subtitle: 'Zones résilientes', text: 'Bureaux prime parisiens (Neuilly, Levallois, 8e arrondissement), immeubles récents (normes BBC, label HQE).' },
          { subtitle: 'Taux de vacance', text: '2023–2024 : TOF bureaux entre 87 % et 93 % selon qualité patrimoine.' }
        ]
      },
      {
        title: 'SCPI bureaux : performances 2022–2025',
        table: [
          { annee: '2022', rendement: '4,1 %' },
          { annee: '2023', rendement: '4,3 %' },
          { annee: '2024', rendement: '4,2 à 4,8 %' },
          { annee: '2025 (proj.)', rendement: '4,2 à 5,1 %' }
        ]
      },
      {
        title: 'Comment sélectionner une SCPI bureaux en 2025',
        content: [
          { subtitle: 'TOF > 90 %', text: 'Preuve de gestion dynamique malgré le contexte difficile.' },
          { subtitle: 'Patrimoine récent', text: 'Immeubles < 15 ans ou rénovés BBC/HQE.' },
          { subtitle: 'Diversification géographique', text: 'France + Europe (Berlin, Amsterdam, Madrid).' },
          { subtitle: 'Locataires solides', text: 'Grands groupes, administrations publiques.' },
          { subtitle: 'Baux longs', text: 'Durée résiduelle > 6 ans.' }
        ]
      }
    ],
    conclusion: 'Les SCPI bureaux ne sont pas mortes. Le télétravail a créé une crise transitoire (2020–2023), mais les actifs de qualité (immeubles modernes, bien placés, loués à des entreprises solides) affichent des TOF corrects et des rendements autour de 4,5 à 5,1 %.'
  }
];

// Template de génération article complet
function generateFullArticle(config) {
  let sections = '';

  config.sections.forEach((section, idx) => {
    sections += `
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          ${section.title}
        </h2>

        <div className="space-y-6">`;

    if (section.content) {
      section.content.forEach((item) => {
        sections += `
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">${item.subtitle}</h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">${item.text}</p>
          </div>`;
      });
    }

    if (section.table) {
      sections += `
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600">`;

      const headers = Object.keys(section.table[0]);
      headers.forEach(header => {
        sections += `<th className="p-4 text-left font-bold border border-gray-200 dark:border-gray-600">${header}</th>`;
      });

      sections += `</tr></thead><tbody>`;

      section.table.forEach((row, rowIdx) => {
        const bgClass = rowIdx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/30';
        sections += `<tr class="${bgClass}">`;
        headers.forEach(header => {
          sections += `<td className="p-4 border border-gray-200 dark:border-gray-600">${row[header]}</td>`;
        });
        sections += `</tr>`;
      });

      sections += `</tbody></table></div>`;
    }

    sections += `</div></section>`;
  });

  return `import React from 'react';
import { TrendingUp, User, Calendar, Clock, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

export const ${config.component}: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600 dark:hover:text-blue-400">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">Article ${config.id}</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide expert CGP
          </span>
        </div>

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

      {/* Introduction */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
          ${config.intro}
        </p>
      </section>

      ${sections}

      {/* Conclusion */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-700 dark:from-blue-800 dark:to-cyan-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        <p className="text-lg text-blue-50 leading-relaxed mb-6">
          ${config.conclusion}
        </p>

        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3">Besoin d'aide pour sélectionner ?</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="/comparateur-scpi"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Comparer les SCPI
            </a>
          </div>
        </div>

        <p className="text-sm text-blue-100 mt-6 italic border-t border-white/20 pt-4">
          Éric Bellaiche, CGP-CIF
        </p>
      </section>
    </div>
  );
};

export default ${config.component};
`;
}

// Génération des 3 premiers articles
const articlesDir = path.join(__dirname, '../src/components/articles');

articlesConfig.slice(0, 3).forEach(config => {
  const content = generateFullArticle(config);
  const filePath = path.join(articlesDir, `${config.component}.tsx`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Article ${config.id} généré : ${config.component}`);
});

console.log('\n✅ Articles 18-20 générés avec succès !');
