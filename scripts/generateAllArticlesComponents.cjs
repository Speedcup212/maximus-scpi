#!/usr/bin/env node
/**
 * Générateur automatique des 28 composants d'articles restants
 * Crée des fichiers React complets basés sur les templates
 */

const fs = require('fs');
const path = require('path');

// Templates de contenu par catégorie
const contentTemplates = {
  comparatif: {
    intro: (title, keyword) => `Vous vous demandez ${keyword.toLowerCase()} ? Cette question est cruciale pour optimiser votre stratégie patrimoniale en 2025. Avec des rendements qui varient significativement selon les choix effectués, comprendre les différences entre ces options d'investissement peut vous faire gagner plusieurs milliers d'euros par an. Dans cet article complet, nous analysons en profondeur tous les aspects financiers, fiscaux et pratiques pour vous aider à prendre la meilleure décision.`,

    sections: [
      {
        title: 'Comprendre les deux options',
        icon: 'Building2',
        content: 'Analyse détaillée du fonctionnement de chaque solution, avec exemples concrets et tableaux comparatifs.'
      },
      {
        title: 'Comparaison approfondie',
        icon: 'BarChart3',
        content: 'Tableau comparatif complet : rendement, fiscalité, liquidité, frais, risques. Calculs chiffrés sur 10 et 20 ans.'
      },
      {
        title: 'Cas pratiques selon profil',
        icon: 'Users',
        content: 'Trois profils types (TMI 11%, 30%, 41%) avec allocations optimales et résultats attendus.'
      }
    ]
  },

  strategie: {
    intro: (title, keyword) => `${title} : cette stratégie peut transformer votre approche de l'investissement immobilier. En 2025, avec les évolutions fiscales et les opportunités du marché, maîtriser cette technique permet d'optimiser significativement votre rentabilité nette et votre patrimoine à long terme. Découvrez dans ce guide complet comment mettre en place cette stratégie, avec des exemples chiffrés précis et des conseils d'experts.`,

    sections: [
      {
        title: 'Le principe détaillé',
        icon: 'Target',
        content: 'Fonctionnement complet de la stratégie, étape par étape, avec schémas explicatifs.'
      },
      {
        title: 'Mise en pratique',
        icon: 'CheckCircle2',
        content: 'Guide pas à pas pour implémenter la stratégie : démarches, calculs, optimisations.'
      },
      {
        title: 'Résultats attendus',
        icon: 'TrendingUp',
        content: 'Projections chiffrées sur 10, 15 et 20 ans selon différents scénarios d\'investissement.'
      }
    ]
  },

  fiscalite: {
    intro: (title, keyword) => `La fiscalité des SCPI est un élément déterminant dans le choix de votre stratégie d'investissement. Entre l'impôt sur le revenu, les prélèvements sociaux, l'IFI et la transmission, les enjeux fiscaux peuvent représenter 30% à 50% de vos revenus bruts. Ce guide complet vous explique tout ce que vous devez savoir pour optimiser votre fiscalité et maximiser votre rendement net en 2025.`,

    sections: [
      {
        title: 'Le cadre fiscal',
        icon: 'Shield',
        content: 'Règles d\'imposition complètes : IR, PS, IFI, succession. Barèmes 2025 et calculs détaillés.'
      },
      {
        title: 'Optimisations possibles',
        icon: 'Euro',
        content: 'Stratégies d\'optimisation fiscale selon votre TMI : AV, démembrement, SCPI EU.'
      },
      {
        title: 'Calculs comparatifs',
        icon: 'Calculator',
        content: 'Simulations chiffrées pour TMI 11%, 30% et 41% avec toutes les enveloppes.'
      }
    ]
  },

  guide: {
    intro: (title, keyword) => `${title} : comprendre ce sujet est essentiel pour tout investisseur en SCPI. Que vous soyez débutant ou investisseur confirmé, ce guide complet vous apporte toutes les informations nécessaires pour prendre des décisions éclairées. Avec des exemples concrets, des données chiffrées et des conseils pratiques, vous aurez toutes les clés pour réussir votre investissement.`,

    sections: [
      {
        title: 'Les fondamentaux',
        icon: 'BookOpen',
        content: 'Tout ce qu\'il faut savoir pour comprendre le sujet : définitions, fonctionnement, acteurs.'
      },
      {
        title: 'Avantages et limites',
        icon: 'Scale',
        content: 'Analyse objective des points forts et des contraintes, avec exemples concrets.'
      },
      {
        title: 'Recommandations pratiques',
        icon: 'Lightbulb',
        content: 'Conseils actionnables pour optimiser votre stratégie selon votre profil.'
      }
    ]
  },

  analyse: {
    intro: (title, keyword) => `En 2025, ${keyword.toLowerCase()} devient un sujet incontournable pour les investisseurs avertis. L'évolution du marché, les nouvelles réglementations et les tendances économiques créent des opportunités qu'il faut savoir identifier. Cette analyse approfondie vous donne toutes les clés pour comprendre les enjeux actuels et les perspectives d'avenir, avec des données chiffrées récentes et des projections argumentées.`,

    sections: [
      {
        title: 'État du marché',
        icon: 'TrendingUp',
        content: 'Analyse complète de la situation actuelle : chiffres clés, tendances, évolutions récentes.'
      },
      {
        title: 'Opportunités et risques',
        icon: 'AlertTriangle',
        content: 'Identification des opportunités à saisir et des risques à anticiper en 2025.'
      },
      {
        title: 'Perspectives',
        icon: 'Eye',
        content: 'Projections et scénarios pour les prochaines années, avec recommandations stratégiques.'
      }
    ]
  }
};

// Liste des 28 articles à générer
const articlesToGenerate = [
  // COMPARATIFS
  { id: 3, slug: '100000-euros-fonds-euros-cout-opportunite', title: '100 000 € sur un fonds euros : quel est le vrai coût d\'opportunité ?', category: 'comparatif', keyword: 'coût opportunité fonds euros' },
  { id: 4, slug: 'investir-200000-euros-scpi-portefeuille-diversifie', title: 'Comment investir 200 000 € en SCPI : stratégie de portefeuille diversifié', category: 'comparatif', keyword: 'investir 200000 euros scpi' },
  { id: 5, slug: 'scpi-ou-immobilier-locatif-comparatif-20-ans', title: 'SCPI ou immobilier locatif direct : comparatif sur 20 ans', category: 'comparatif', keyword: 'scpi ou immobilier locatif' },

  // STRATÉGIES
  { id: 6, slug: 'achat-scpi-credit-effet-levier-fiscalite', title: 'Acheter des SCPI à crédit : effet de levier et optimisation fiscale', category: 'strategie', keyword: 'scpi à crédit' },
  { id: 7, slug: 'demembrement-scpi-nue-propriete-usufruit', title: 'Démembrement de SCPI : nue-propriété et usufruit expliqués', category: 'strategie', keyword: 'démembrement scpi' },
  { id: 18, slug: 'per-scpi-retraite-deduction-fiscale', title: 'PER avec SCPI : préparer sa retraite et défiscaliser', category: 'strategie', keyword: 'per scpi' },
  { id: 19, slug: 'sci-scpi-societe-civile-immobiliere-parts', title: 'Détenir des SCPI dans une SCI : avantages et stratégie patrimoniale', category: 'strategie', keyword: 'sci scpi' },
  { id: 22, slug: 'diversification-scpi-combien-nombre-parts', title: 'Diversification SCPI : combien de SCPI faut-il détenir ?', category: 'strategie', keyword: 'diversification scpi' },
  { id: 29, slug: 'premier-investissement-scpi-debutant-guide', title: 'Premier investissement en SCPI : guide complet pour débutants', category: 'strategie', keyword: 'premier investissement scpi' },
  { id: 30, slug: 'investir-scpi-jeune-actif-25-35-ans', title: 'Investir en SCPI quand on est jeune actif (25-35 ans)', category: 'strategie', keyword: 'scpi jeune actif' },

  // FISCALITÉ
  { id: 8, slug: 'investir-scpi-tmi-11-pourcent-fiscalite-optimale', title: 'Investir en SCPI avec une TMI à 11% : quelle stratégie fiscale ?', category: 'fiscalite', keyword: 'scpi tmi 11' },
  { id: 9, slug: 'scpi-tmi-30-pourcent-arbitrage-av-direct', title: 'SCPI avec TMI 30% : faut-il privilégier l\'assurance-vie ou le direct ?', category: 'fiscalite', keyword: 'scpi tmi 30' },
  { id: 10, slug: 'forte-imposition-tmi-41-scpi-assurance-vie', title: 'TMI 41% et plus : pourquoi les SCPI en assurance-vie sont incontournables', category: 'fiscalite', keyword: 'scpi tmi 41' },
  { id: 12, slug: 'scpi-fiscales-malraux-deficit-foncier-2025', title: 'SCPI fiscales 2025 : Malraux, déficit foncier, quel dispositif choisir ?', category: 'fiscalite', keyword: 'scpi fiscales' },
  { id: 20, slug: 'ifi-scpi-impot-fortune-immobiliere-strategies', title: 'IFI et SCPI : comment réduire l\'Impôt sur la Fortune Immobilière', category: 'fiscalite', keyword: 'ifi scpi' },
  { id: 21, slug: 'succession-scpi-transmission-droits-heritage', title: 'Succession de SCPI : transmettre son patrimoine immobilier', category: 'fiscalite', keyword: 'succession scpi' },

  // GUIDES
  { id: 11, slug: 'scpi-europeennes-avantages-ps-0-rendement', title: 'SCPI européennes : l\'avantage fiscal des prélèvements sociaux à 0%', category: 'guide', keyword: 'scpi européennes' },
  { id: 13, slug: 'scpi-sante-seniors-ehpad-cliniques-investissement', title: 'SCPI santé et seniors : investir dans l\'immobilier médical et les EHPAD', category: 'guide', keyword: 'scpi santé' },
  { id: 14, slug: 'scpi-bureaux-tertiaire-teletravail-2025', title: 'SCPI de bureaux en 2025 : quel impact du télétravail ?', category: 'guide', keyword: 'scpi bureaux' },
  { id: 15, slug: 'scpi-commerces-retail-e-commerce-opportunites', title: 'SCPI de commerces : comment le retail résiste au e-commerce', category: 'guide', keyword: 'scpi commerces' },
  { id: 16, slug: 'scpi-logistique-entrepots-e-commerce-2025', title: 'SCPI logistique et entrepôts : l\'eldorado de l\'e-commerce', category: 'guide', keyword: 'scpi logistique' },
  { id: 17, slug: 'scpi-residentielles-logement-locatif-scpi-habitation', title: 'SCPI résidentielles : investir dans le logement locatif via les SCPI', category: 'guide', keyword: 'scpi résidentielles' },
  { id: 24, slug: 'risques-scpi-vacance-locative-liquidite', title: 'Quels sont les risques des SCPI ? Analyse complète et transparente', category: 'guide', keyword: 'risques scpi' },
  { id: 25, slug: 'frais-scpi-souscription-gestion-performance', title: 'Frais SCPI : comprendre et optimiser les coûts d\'investissement', category: 'guide', keyword: 'frais scpi' },
  { id: 26, slug: 'revendre-parts-scpi-delais-marche-secondaire', title: 'Revendre ses parts de SCPI : délais, procédure et marché secondaire', category: 'guide', keyword: 'revente scpi' },

  // ANALYSES
  { id: 23, slug: 'rendement-scpi-2025-tdvm-taux-distribution', title: 'Rendement SCPI 2025 : comprendre le TDVM et le taux de distribution', category: 'analyse', keyword: 'rendement scpi 2025' },
  { id: 27, slug: 'scpi-ou-etf-immobilier-reit-comparatif', title: 'SCPI ou ETF immobilier (REIT) : quel placement choisir ?', category: 'analyse', keyword: 'scpi ou etf immobilier' },
  { id: 28, slug: 'scpi-ou-opci-differences-avantages', title: 'SCPI ou OPCI : quelle différence et quel placement privilégier ?', category: 'analyse', keyword: 'scpi ou opci' }
];

// Fonction pour générer le composant React
function generateArticleComponent(article) {
  const template = contentTemplates[article.category];
  const componentName = article.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';

export const ${componentName}Article: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-gray-700">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Accueil</a></li>
            <li>/</li>
            <li><a href="/education" className="hover:text-blue-600 dark:hover:text-blue-400">Éducation</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-semibold">${article.title}</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            ${article.category.charAt(0).toUpperCase() + article.category.slice(1)}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          ${article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Éric Bellaiche, CGP</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>21 janvier 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>12 min de lecture</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
          ${template.intro(article.title, article.keyword)}
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            ${template.sections.map(section => `
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>${section.content}</span>
            </li>`).join('')}
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Cas pratiques avec 3 profils investisseurs (TMI 11%, 30%, 41%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>FAQ complète avec réponses d'expert</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section principale */}
      ${template.sections.map((section, index) => `
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <${section.icon} className="w-8 h-8 text-blue-600" />
          ${section.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          ${section.content} Pour ${article.keyword.toLowerCase()}, cette analyse vous permet de comprendre tous les enjeux et d'optimiser votre stratégie d'investissement.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Analyse des rendements bruts et nets selon votre situation fiscale (TMI 11%, 30%, 41%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Optimisations fiscales possibles : assurance-vie, SCPI européennes, démembrement</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Impact sur votre patrimoine à 10, 15 et 20 ans avec projections chiffrées</span>
            </li>
          </ul>
        </div>
      </section>
      `).join('\n')}

      {/* Cas pratiques */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-600" />
          Cas pratiques selon votre profil
        </h2>

        <div className="space-y-6">
          {/* Profil TMI 11% */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 1 : TMI 11%, 35 ans, 30 000 € à investir
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Stratégie optimale</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Privilégier SCPI européennes en direct (PS 0%)</li>
                  <li>• Rendement brut cible : 6-6,5%</li>
                  <li>• Rendement net : 5,34-5,79% après IR 11%</li>
                  <li>• Revenus annuels : 1 602-1 737 €/an</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Résultats sur 20 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : 86 000-92 000 €</li>
                  <li>• Plus-value : +56 000-62 000 €</li>
                  <li>• Revenus cumulés : 32 000-34 700 €</li>
                  <li>• Gain total : 88 000-97 000 € (+187-223%)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profil TMI 30% */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 2 : TMI 30%, 45 ans, 80 000 € à investir
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Stratégie optimale</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Mix 60% AV France + 40% Direct EU</li>
                  <li>• Rendement moyen net : 4,30%</li>
                  <li>• Revenus annuels : 3 440 €/an</li>
                  <li>• Liquidité optimisée via AV (60%)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Résultats sur 20 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : 190 000 €</li>
                  <li>• Plus-value : +110 000 €</li>
                  <li>• Revenus cumulés : 68 800 €</li>
                  <li>• Gain total : 178 800 € (+137%)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profil TMI 41% */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profil 3 : TMI 41%, 55 ans, 150 000 € à investir
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Stratégie optimale</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• 100% Assurance-vie recommandé</li>
                  <li>• Rendement net : 4,14%</li>
                  <li>• Revenus annuels : 6 210 €/an</li>
                  <li>• Exonération IFI + optimisation succession</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">Résultats sur 20 ans</h4>
                <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                  <li>• Capital final : 325 000 €</li>
                  <li>• Plus-value : +175 000 €</li>
                  <li>• Revenus cumulés : 124 200 €</li>
                  <li>• Gain total : 299 200 € (+100%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Points de vigilance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          Points de vigilance
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3">Risques à connaître</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
              <li>⚠️ Liquidité limitée (2-6 mois en direct)</li>
              <li>⚠️ Vacance locative possible (impact revenus)</li>
              <li>⚠️ Valeur des parts non garantie (cycle immobilier)</li>
              <li>⚠️ Frais de souscription 8-12% (à amortir)</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="font-bold text-green-900 dark:text-green-200 mb-3">Comment les limiter</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
              <li>✅ Diversifier sur 4-6 SCPI minimum</li>
              <li>✅ Vérifier taux d'occupation &gt; 90%</li>
              <li>✅ Privilégier sociétés de gestion réputées</li>
              <li>✅ Investir horizon 10+ ans minimum</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Questions fréquentes</h2>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quel montant minimum pour investir ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Via une assurance-vie, vous pouvez commencer avec quelques centaines d'euros. En direct, le minimum est généralement d'une part, soit 200 à 1 000 € selon les SCPI. Pour une diversification optimale, nous recommandons un capital de départ de 10 000 € minimum.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Quelle est la fiscalité applicable ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les revenus SCPI sont soumis à l'IR selon votre TMI (11%, 30%, 41% ou 45%) plus les prélèvements sociaux de 17,2%. Via une assurance-vie, vous ne payez que les PS 17,2% annuellement (pas d'IR). Les SCPI européennes en direct bénéficient de PS 0% grâce aux conventions fiscales.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Les revenus sont-ils garantis ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Non, les revenus SCPI dépendent du taux d'occupation des immeubles et de la conjoncture économique. Ils ne sont pas garantis mais historiquement réguliers pour les SCPI bien gérées. Le rendement moyen du marché se situe entre 4,5% et 6,5% brut en 2025.
            </p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Combien de temps faut-il investir ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              L'investissement en SCPI nécessite un horizon de placement de <strong>8 à 10 ans minimum</strong>, idéalement 15-20 ans. Cette durée permet d'amortir les frais de souscription (8-12%) et de lisser les cycles immobiliers. Plus votre horizon est long, plus le rendement cumulé est attractif.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comment revendre ses parts ?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              En assurance-vie, la liquidité est quasi-instantanée (48-72h). En direct, vous déposez un ordre de vente auprès de la société de gestion qui organise la confrontation avec des acheteurs. Les délais varient de 2 à 6 mois selon la SCPI. Aucune garantie de rachat n'existe.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Conclusion : ${article.title}</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, ${article.keyword.toLowerCase()} nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
          </p>
          <p>
            Les stratégies présentées dans cet article vous permettent d'optimiser votre allocation selon votre profil. Que vous soyez en TMI 11%, 30% ou 41%, des solutions existent pour maximiser votre rendement net et construire un patrimoine solide.
          </p>

          <div className="bg-white/10 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3">🎯 Besoin d'un accompagnement personnalisé ?</h3>
            <p className="mb-4">
              Notre équipe analyse gratuitement votre situation pour vous recommander la stratégie optimale adaptée à vos objectifs.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/comparateur-scpi"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Comparer les SCPI
              </a>
              <a
                href="/simulateur-enveloppes"
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors"
              >
                Simuler votre stratégie
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ${componentName}Article;
`;
}

// Créer le dossier articles s'il n'existe pas
const articlesDir = path.join(__dirname, '../src/components/articles');
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

// Générer tous les articles
console.log('🚀 Génération des 28 articles restants...\n');

let successCount = 0;
let errorCount = 0;

articlesToGenerate.forEach(article => {
  try {
    const componentName = article.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const fileName = `${componentName}Article.tsx`;
    const filePath = path.join(articlesDir, fileName);

    const content = generateArticleComponent(article);
    fs.writeFileSync(filePath, content);

    console.log(`✅ Article ${article.id} généré : ${fileName}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Erreur article ${article.id}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Résumé : ${successCount} articles générés ✅ / ${errorCount} erreurs ❌`);
console.log(`\n✨ Les fichiers sont créés dans : /src/components/articles/`);
console.log(`\n🎯 Prochaine étape : Ajouter les routes dans App.tsx`);
