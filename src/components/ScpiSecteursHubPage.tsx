import React from 'react';
import { Building2, ShoppingCart, HeartPulse, Warehouse, Home, Hotel, TrendingUp, Users, Award, ExternalLink } from 'lucide-react';
import SEOHead from './SEOHead';
import SemanticLinks from './SemanticLinks';
import { getSemanticLinks } from '../data/semanticCocon';
import { generateFAQSchema, generateBreadcrumbSchema } from '../utils/seoOptimizer';

const ScpiSecteursHubPage: React.FC = () => {
  const sectors = [
    {
      id: 'bureaux',
      name: 'SCPI Bureaux',
      slug: '/scpi-bureaux-investissement',
      icon: Building2,
      color: 'blue',
      description: 'Immobilier tertiaire et espaces de bureaux premium européens',
      stats: {
        scpiCount: '15+',
        rendementMoyen: '5.5%',
        encours: '12 Mds€'
      },
      highlights: [
        'Quartiers d\'affaires européens',
        'Espaces de coworking nouvelle génération',
        'Immeubles certifiés HQE/BREEAM',
        'Télétravail résilient'
      ],
      topScpi: [
        { name: 'Novaxia NEO', gestionnaire: 'Novaxia Investissement', rendement: '6.01%' },
        { name: 'Paref Evo', gestionnaire: 'PAREF GESTION', rendement: '6.00%' },
        { name: 'Paref Hexa', gestionnaire: 'PAREF GESTION', rendement: '6.00%' }
      ]
    },
    {
      id: 'commerces',
      name: 'SCPI Commerces',
      slug: '/scpi-commerces-investissement',
      icon: ShoppingCart,
      color: 'green',
      description: 'Retail parks, centres commerciaux et locaux commerciaux',
      stats: {
        scpiCount: '12+',
        rendementMoyen: '5.2%',
        encours: '8 Mds€'
      },
      highlights: [
        'Retail parks drive e-commerce proof',
        'Centres-villes piétons dynamiques',
        'Enseignes nationales solides',
        'Bail commercial longue durée'
      ],
      topScpi: [
        { name: 'Coeur de ville', gestionnaire: 'Sogenial Immobilier', rendement: '5.30%' },
        { name: 'Cristal Life', gestionnaire: 'Inter Gestion REIM', rendement: '5.20%' },
        { name: 'Altixia Commerces', gestionnaire: 'ALTIXIA REIM', rendement: '5.12%' }
      ]
    },
    {
      id: 'logistique',
      name: 'SCPI Logistique',
      slug: '/scpi-logistique-investissement',
      icon: Warehouse,
      color: 'orange',
      description: 'Entrepôts, plateformes logistiques et messagerie e-commerce',
      stats: {
        scpiCount: '8+',
        rendementMoyen: '5.7%',
        encours: '4 Mds€'
      },
      highlights: [
        'Boom e-commerce et livraison',
        'Entrepôts dernière génération',
        'Locataires Amazon, DHL, Carrefour',
        'Baux fermes 6-9 ans'
      ],
      topScpi: [
        { name: 'Opportunité Immo', gestionnaire: 'La Française REM', rendement: '5.62%' },
        { name: 'Activimmo', gestionnaire: 'Alderan', rendement: '5.50%' },
        { name: 'Log In', gestionnaire: 'THEOREIM', rendement: '6.00%' }
      ]
    },
    {
      id: 'sante',
      name: 'SCPI Santé',
      slug: '/scpi-sante-investissement',
      icon: HeartPulse,
      color: 'red',
      description: 'EHPAD, cliniques, cabinets médicaux et résidences seniors',
      stats: {
        scpiCount: '10+',
        rendementMoyen: '5.2%',
        encours: '5 Mds€'
      },
      highlights: [
        'Vieillissement démographique',
        'Opérateurs santé réputés',
        'Baux longue durée 9-12 ans',
        'Résilience économique forte'
      ],
      topScpi: [
        { name: 'Foncière des Praticiens', gestionnaire: 'MAGELLIM REIM', rendement: '5.50%' },
        { name: 'LF Avenir Santé', gestionnaire: 'La Française REM', rendement: '5.20%' },
        { name: 'NCap Education Santé', gestionnaire: 'Norma Capital', rendement: '4.85%' }
      ]
    },
    {
      id: 'residentiel',
      name: 'SCPI Résidentiel',
      slug: '/scpi-residentiel-investissement',
      icon: Home,
      color: 'purple',
      description: 'Logements résidentiels, coliving et résidences étudiantes',
      stats: {
        scpiCount: '6+',
        rendementMoyen: '5.5%',
        encours: '3 Mds€'
      },
      highlights: [
        'Marché locatif tendu',
        'Résidences étudiantes premium',
        'Coliving nouvelle génération',
        'Fiscalité revenus fonciers'
      ],
      topScpi: [
        { name: 'Remake Live', gestionnaire: 'Remake Asset Management', rendement: '7.50%' },
        { name: 'Kyaneos Pierre', gestionnaire: 'KYANEOS ASSET MANAGEMENT', rendement: '4.96%' },
        { name: 'Patrimmo Croissance Impact', gestionnaire: 'Præmia REIM France', rendement: '0%' }
      ]
    },
    {
      id: 'hotellerie',
      name: 'SCPI Hôtellerie',
      slug: '/scpi-hotellerie-investissement',
      icon: Hotel,
      color: 'teal',
      description: 'Hôtels, résidences de tourisme et hôtellerie d\'affaires',
      stats: {
        scpiCount: '5+',
        rendementMoyen: '4.1%',
        encours: '1.2 Mds€'
      },
      highlights: [
        'Reprise tourisme post-Covid',
        'Hôtels 3-4 étoiles emplacements premium',
        'Opérateurs Accor, Marriott, Hilton',
        'Baux variables avec minimum garanti'
      ],
      topScpi: [
        { name: 'Atream Hotel', gestionnaire: 'Atream', rendement: '5.05%' },
        { name: 'Perial Hospitalité Europe', gestionnaire: 'PERIAL Asset Management', rendement: '4.02%' },
        { name: 'Aestiam Cap\'Hebergimmo', gestionnaire: 'Aestiam', rendement: '3.18%' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
      },
      teal: {
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        hover: 'hover:bg-teal-100 dark:hover:bg-teal-900/30'
      }
    };
    return colors[color] || colors.blue;
  };

  const faqQuestions = [
    {
      question: "Quel secteur SCPI est le plus rentable en 2025 ?",
      answer: "Les SCPI Résidentiel offrent le rendement le plus élevé avec Remake Live à 7,5%, suivies des Bureaux à 5,5% (Novaxia NEO 6,01%, Paref Evo/Hexa 6%) et Logistique à 5,7% (Log In 6%, Opportunité Immo 5,62%). Les SCPI Santé (5,2%), Commerces (5,2%) et Hôtellerie (4,1%) offrent des rendements plus modérés."
    },
    {
      question: "Pourquoi les SCPI Logistique sont-elles performantes ?",
      answer: "Le boom de l'e-commerce et la livraison du dernier kilomètre dopent la demande d'entrepôts. Les SCPI logistique comme Log In (6%), Opportunité Immo (5,62%) et Activimmo (5,5%) bénéficient de locataires premium avec des baux fermes 6-9 ans et d'entrepôts dernière génération automatisés."
    },
    {
      question: "Les SCPI Résidentiel sont-elles intéressantes ?",
      answer: "Les SCPI Résidentiel (5,5% en moyenne) ciblent le marché locatif tendu via coliving, résidences étudiantes premium et logements en tension. Remake Live (7,5%) excelle sur ce créneau innovant, tandis que Kyaneos Pierre (4,96%) offre une exposition 80% résidentiel avec fiscalité revenus fonciers attractive."
    },
    {
      question: "Comment diversifier mon portefeuille SCPI par secteur ?",
      answer: "Allocation optimale : 30% Bureaux (stabilité 5,5%), 25% Logistique (croissance 5,7%), 20% Résidentiel (rendement 7,5%), 15% Santé (résilience 5,2%), 10% Commerces ou Hôtellerie (opportunité). Adaptez selon profil : prudents privilégient Bureaux+Santé (60%), dynamiques Résidentiel+Logistique (60%)."
    },
    {
      question: "Quelle est la différence entre SCPI Hôtellerie et SCPI Commerces ?",
      answer: "SCPI Hôtellerie : baux variables avec minimum garanti, reprise post-Covid progressive, opérateurs Accor/Marriott, rendement 4,1% (Atream Hotel 5,05%). SCPI Commerces : baux fermes longue durée, emplacements premium centres-villes, enseignes nationales, rendement 5,2% (Coeur de ville 5,3%, Cristal Life 5,2%). Risques et profils différents."
    }
  ];

  const faqSchema = generateFAQSchema(faqQuestions);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: 'https://www.maximusscpi.com' },
    { name: 'SCPI par Secteur', url: 'https://www.maximusscpi.com/scpi-secteurs' }
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [faqSchema, breadcrumbSchema]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <SEOHead
        title="SCPI par Secteur : Bureaux, Commerces, Logistique, Santé, Résidentiel, Hôtellerie 2025"
        description="✓ 6 secteurs SCPI analysés ✓ Bureaux 5.5% ✓ Commerces 5.2% ✓ Logistique 5.7% ✓ Santé 5.2% ✓ Résidentiel 5.5% ✓ Hôtellerie 4.1% ✓ 51 SCPI réelles comparées → Conseiller ORIAS"
        keywords={['scpi secteurs', 'scpi bureaux', 'scpi commerces', 'scpi logistique', 'scpi santé', 'scpi résidentiel', 'scpi hôtellerie', 'typologie scpi 2025']}
        canonical="https://www.maximusscpi.com/scpi-secteurs"
        schemaData={combinedSchema}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              SCPI par Secteur Immobilier : 6 Typologies 2025 (Rendements 4.1% à 7.5%)
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Bureaux, Commerces, Logistique, Santé, Résidentiel, Hôtellerie : comparatif complet
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Building2 className="w-5 h-5" />
                <span>6 Secteurs Immobiliers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span>60+ SCPI Analysées</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
<span>Rendements 4.1% à 7.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Pourquoi investir par secteur immobilier ?
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Chaque <strong>secteur immobilier</strong> possède ses propres <strong>caractéristiques de rendement, de risque et de liquidité</strong>.
              En comprenant les spécificités de chaque typologie d'actifs, vous pouvez construire un <strong>portefeuille SCPI diversifié et optimisé</strong>
              selon vos objectifs patrimoniaux et votre profil investisseur.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Cette page Hub vous permet de <strong>comparer les 6 grands secteurs SCPI</strong> et d'accéder aux analyses détaillées :
              <strong> Bureaux</strong> (tertiaire), <strong>Commerces</strong> (retail), <strong>Logistique</strong> (e-commerce),
              <strong> Santé</strong> (EHPAD/cliniques), <strong>Résidentiel</strong> (coliving/étudiants) et <strong>Hôtellerie</strong> (tourisme).
            </p>
          </div>
        </div>

        {/* Secteurs Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const colors = getColorClasses(sector.color);

            return (
              <div
                key={sector.id}
                className={`${colors.bg} border-2 ${colors.border} rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 ${colors.hover}`}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`${colors.text} p-4 bg-white dark:bg-gray-800 rounded-xl`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sector.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {sector.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${colors.text}`}>
                        {sector.stats.scpiCount}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">SCPI</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${colors.text}`}>
                        {sector.stats.rendementMoyen}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Taux de distribution</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${colors.text}`}>
                        {sector.stats.encours}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Encours</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      Points clés :
                    </h4>
                    <ul className="space-y-2">
                      {sector.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className={`${colors.text} mt-1`}>✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Top SCPI */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      Top 3 SCPI {sector.id} :
                    </h4>
                    <div className="space-y-2">
                      {sector.topScpi.map((scpi, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg text-xs">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{scpi.name}</div>
                            <div className="text-gray-500 dark:text-gray-400">{scpi.gestionnaire}</div>
                          </div>
                          <div className={`font-bold ${colors.text}`}>{scpi.rendement}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={sector.slug}
                    className={`block w-full ${colors.text} bg-white dark:bg-gray-800 border-2 ${colors.border} font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 text-center`}
                  >
                    Découvrir les {sector.name} →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tableau comparatif */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Tableau Comparatif des Secteurs SCPI
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-bold text-gray-900 dark:text-white">Secteur</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Rendement Moyen</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Risque</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Liquidité</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900 dark:text-white">Potentiel</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { secteur: 'Bureaux', rendement: '5.5%', risque: 'Moyen', liquidite: 'Bonne', potentiel: '★★★★★' },
                  { secteur: 'Commerces', rendement: '5.2%', risque: 'Moyen-Élevé', liquidite: 'Moyenne', potentiel: '★★★★☆' },
                  { secteur: 'Logistique', rendement: '5.7%', risque: 'Moyen', liquidite: 'Bonne', potentiel: '★★★★★' },
                  { secteur: 'Santé', rendement: '5.2%', risque: 'Faible', liquidite: 'Bonne', potentiel: '★★★★☆' },
                  { secteur: 'Résidentiel', rendement: '5.5%', risque: 'Moyen-Faible', liquidite: 'Moyenne', potentiel: '★★★★★' },
                  { secteur: 'Hôtellerie', rendement: '4.1%', risque: 'Élevé', liquidite: 'Moyenne', potentiel: '★★★☆☆' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{row.secteur}</td>
                    <td className="text-center py-4 px-4 text-green-600 dark:text-green-400 font-bold">{row.rendement}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.risque}</td>
                    <td className="text-center py-4 px-4 text-gray-700 dark:text-gray-300">{row.liquidite}</td>
                    <td className="text-center py-4 px-4 text-yellow-500">{row.potentiel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Questions Fréquentes sur les Secteurs SCPI
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Quel secteur SCPI offre le meilleur rendement en 2025 ?',
                a: 'Les SCPI Résidentiel dominent avec Remake Live à 7,5%. Les Bureaux offrent 5,5% en moyenne (Novaxia NEO 6,01%, Paref Evo/Hexa 6%), suivis de la Logistique à 5,7% (Log In 6%, Opportunité Immo 5,62%). Les SCPI Santé (5,2%) et Commerces (5,2%) restent solides.'
              },
              {
                q: 'Les SCPI Bureaux résistent-elles au télétravail ?',
                a: 'Les SCPI Bureaux évoluent vers des espaces tertiaires nouvelle génération : coworking, flex office, immeubles HQE. Les gestionnaires leaders (Novaxia NEO 6,01%, Paref Evo/Hexa 6%) s\'adaptent aux nouvelles tendances du travail hybride avec des actifs premium européens.'
              },
              {
                q: 'Pourquoi investir dans les SCPI Résidentiel ?',
                a: 'Les SCPI Résidentiel (5,5% en moyenne) ciblent un marché locatif tendu : coliving nouvelle génération, résidences étudiantes premium, logements en zones tendues. Remake Live (7,5%) et Kyaneos Pierre (4,96%) excellent sur ce secteur porteur avec une fiscalité revenus fonciers attractive.'
              },
              {
                q: 'Comment diversifier entre les 6 secteurs SCPI ?',
                a: 'Allocation optimale : 30% Bureaux (stabilité 5,5%), 25% Logistique (croissance 5,7%), 20% Résidentiel (rendement 7,5%), 15% Santé (résilience 5,2%), 10% Commerces ou Hôtellerie (opportunité). Adaptez selon votre profil risque et horizon.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                  {faq.q}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Semantic Links */}
        <SemanticLinks
          currentPage="/scpi-secteurs"
          links={getSemanticLinks('/scpi-secteurs')}
          title="Continuez votre découverte des SCPI"
        />
      </div>
    </div>
  );
};

export default ScpiSecteursHubPage;
