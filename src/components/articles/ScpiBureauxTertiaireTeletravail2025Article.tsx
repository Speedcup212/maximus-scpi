import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';

export const ScpiBureauxTertiaireTeletravail2025Article: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI de bureaux en 2025 : quel impact du télétravail ?</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI de bureaux en 2025 : quel impact du télétravail ?
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
          SCPI de bureaux en 2025 : quel impact du télétravail ? : comprendre ce sujet est essentiel pour tout investisseur en SCPI. Que vous soyez débutant ou investisseur confirmé, ce guide complet vous apporte toutes les informations nécessaires pour prendre des décisions éclairées. Avec des exemples concrets, des données chiffrées et des conseils pratiques, vous aurez toutes les clés pour réussir votre investissement.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Tout ce qu'il faut savoir pour comprendre le sujet : définitions, fonctionnement, acteurs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Analyse objective des points forts et des contraintes, avec exemples concrets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Conseils actionnables pour optimiser votre stratégie selon votre profil.</span>
            </li>
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

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Le marché des SCPI de bureaux en 2025 : état des lieux post-télétravail
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Les SCPI de bureaux représentent <strong>près de 50% du patrimoine total des SCPI françaises</strong>, soit environ 35 milliards d'euros d'actifs immobiliers tertiaires. Après la révolution du télétravail post-COVID, le marché a profondément muté avec une polarisation entre bureaux premium bien situés et actifs secondaires déclassés.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Le marché des bureaux en chiffres 2025
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">4,5-5,5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">TDVM moyen des SCPI bureaux leaders (vs 5,1% commerces)</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">90-94%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux d'occupation moyen (bureaux premium supérieur à 95%)</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">15 Mds€</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Capitalisation des 5 plus grosses SCPI bureaux françaises</div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 3 segments de bureaux post-télétravail</h3>

        <div className="space-y-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1️⃣ Bureaux premium Paris et QCA (Quartier Central des Affaires)</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Immeubles récents ou rénovés BBC/HQE situés dans Paris centre et La Défense. <strong>Très prisés par les entreprises</strong> recherchant prestige et accessibilité (RER, métro). TO supérieur à 95%, loyers premium 400-800 euros/m²/an.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">SCPI leaders :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Édissimo</strong> (Amundi) - 88% bureaux, Paris 65% + IDF 30%, Cap 1,64 Mds€, TDVM 4,45%, TO 89,5%</li>
                <li>• <strong>Épargne Foncière</strong> (La Française) - 71% bureaux, Paris 22% + IDF 38%, Cap 5,2 Mds€, TDVM 4,52%, TO 89,2%</li>
                <li>• <strong>Perial Grand Paris</strong> (Perial) - 94% bureaux, 75% IDF dont La Défense, Cap 1,1 Md€, TDVM 5,1%, TO 89,4%</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2️⃣ Bureaux métropoles régionales et IDF périphérie</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Actifs tertiaires en métropoles françaises (Lyon, Bordeaux, Nantes) et banlieue parisienne. <strong>Bonne résilience avec loyers 150-350 euros/m²/an</strong>, attractifs pour PME et filiales de grands groupes. TO 90-94%.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">SCPI leaders :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Efimmo 1</strong> (Sofidy) - 78% bureaux, IDF 54% + Régions 36%, Cap 3,75 Mds€, TDVM 5,5%, TO 90,9%</li>
                <li>• <strong>Perial O2</strong> (Perial) - 85% bureaux, Régions 38% + IDF 37%, Cap 2,42 Mds€, TDVM 4,91%, TO 91,3%</li>
                <li>• <strong>Crédit Mutuel Pierre 1</strong> (La Française) - 80% bureaux, IDF 53% + Paris 27%, Cap 2,15 Mds€, TDVM 4,52%, TO 93,8%</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-orange-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3️⃣ Bureaux alternatifs et recyclage urbain</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Transformation d'immeubles obsolètes en actifs ESG premium (DPE A-B). <strong>Stratégie value-add à fort potentiel</strong> mais plus risquée. Travaux de restructuration, certifications environnementales.
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">SCPI spécialisées :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Novaxia NEO</strong> (Novaxia) - 93% bureaux rénovés, France 85%, Cap 427 M€, TDVM 6,01%, TO 97,7%</li>
                <li>• Rendement élevé mais profil risque supérieur (travaux, délais de relocation)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les SCPI bureaux représentent <strong>35 Mds€ d'actifs</strong>, soit 50% du marché français avec rendements 4,5-5,5%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le télétravail a créé une <strong>polarisation forte</strong> : bureaux premium Paris/métropoles (TO supérieur à 95%) vs actifs secondaires (TO 80-85%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les critères ESG sont devenus <strong>essentiels</strong> : DPE C minimum exigé, bâtiments A-B recherchés (surprime de loyer 15-20%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les 5 plus grosses SCPI bureaux <strong>capitalisent 15 Mds€</strong> : Épargne Foncière, Efimmo 1, Perial O2, Crédit Mutuel Pierre 1, Édissimo</span>
            </li>
          </ul>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Télétravail et bureaux : opportunité ou menace pour les SCPI ?
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le télétravail, généralisé depuis 2020, a fondamentalement transformé le marché des bureaux. Contrairement aux craintes initiales, <strong>l'impact n'est pas uniforme</strong> : les bureaux premium bénéficient d'une fuite vers la qualité tandis que les actifs secondaires sont déclassés.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Les bureaux gagnants post-télétravail
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Bureaux premium Paris QCA et métropoles</strong><br />
                  <span className="text-sm">Loyers en hausse 5-10% car entreprises cherchent prestige pour attirer talents. Édissimo : TO 89,5% malgré télétravail, TDVM 4,45%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Actifs ESG certifiés (DPE A-B)</strong><br />
                  <span className="text-sm">Surprime de loyer 15-20%, TO supérieur à 95%. Novaxia NEO spécialisé recyclage : TDVM 6,01%, TO 97,7%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Espaces flex et coworking intégrés</strong><br />
                  <span className="text-sm">Bureaux modulables adaptés au travail hybride. Demande forte des ETI et scale-ups</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Excellente accessibilité transports</strong><br />
                  <span className="text-sm">Proximité RER/métro essentielle (2-3 jours/semaine bureau). Perial Grand Paris 75% IDF bien desservie</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Les bureaux fragilisés par le télétravail
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Bureaux obsolètes DPE E-F-G</strong><br />
                  <span className="text-sm">Décret tertiaire 2030 : impossibles à louer sans rénovation lourde. TO en chute libre 70-80%, décote 30-40%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Zones tertiaires secondaires mal desservies</strong><br />
                  <span className="text-sm">Périphérie éloignée sans RER/métro. Entreprises ne trouvent plus de candidats, TO 75-85%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Immeubles de bureaux ancienne génération</strong><br />
                  <span className="text-sm">Plateaux profonds sans lumière naturelle, open-space années 1980-90. Ne correspondent plus aux attentes qualité de vie</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Monolocalisation excessive</strong><br />
                  <span className="text-sm">SCPI trop concentrées sur une ville secondaire ou une zone tertiaire spécifique (risque locataire unique)</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Performance comparée SCPI bureaux : impact télétravail 2019-2025</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left">Typologie bureaux</th>
                  <th className="px-4 py-3 text-center">TO 2019</th>
                  <th className="px-4 py-3 text-center">TO 2025</th>
                  <th className="px-4 py-3 text-center">Évolution TDVM</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Paris QCA + Premium</td>
                  <td className="px-4 py-3 text-center">96%</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">95-98%</td>
                  <td className="px-4 py-3 text-center"><span className="text-green-600 font-bold">Stable/Hausse</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Métropoles régionales</td>
                  <td className="px-4 py-3 text-center">94%</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">90-94%</td>
                  <td className="px-4 py-3 text-center"><span className="text-blue-600 font-bold">Légère baisse</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">IDF périphérie bien desservie</td>
                  <td className="px-4 py-3 text-center">92%</td>
                  <td className="px-4 py-3 text-center">88-92%</td>
                  <td className="px-4 py-3 text-center"><span className="text-orange-600">Baisse modérée</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Bureaux secondaires DPE D-E-F</td>
                  <td className="px-4 py-3 text-center">88%</td>
                  <td className="px-4 py-3 text-center font-bold text-red-600">70-80%</td>
                  <td className="px-4 py-3 text-center"><span className="text-red-600 font-bold">Forte baisse</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 italic">
            Source : Données moyennes observées sur les principales SCPI bureaux françaises 2019-2025
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le télétravail crée une <strong>fuite vers la qualité</strong> : bureaux premium Paris/métropoles maintiennent TO supérieur à 95%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les critères ESG sont <strong>décisifs</strong> : DPE C minimum en 2025, A-B recommandé (surprime 15-20%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Évitez les SCPI avec <strong>plus de 20% de bureaux DPE D-E-F</strong> (risque de déclassement et baisse revenus)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Privilégiez les <strong>grandes capitalisations diversifiées</strong> : Épargne Foncière 5,2 Mds€, Efimmo 1 3,75 Mds€, Perial O2 2,42 Mds€</span>
            </li>
          </ul>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Comment sélectionner les meilleures SCPI de bureaux en 2025
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Face aux mutations du marché post-télétravail, tous les bureaux ne se valent plus. Voici les <strong>5 critères décisifs</strong> pour identifier les SCPI bureaux les plus performantes et résilientes.
        </p>

        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Exiger un patrimoine 70% minimum Paris + Métropoles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ SCPI recommandées</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Épargne Foncière</strong> : 71% bureaux, Paris 22% + IDF 38%, Cap 5,2 Mds€, TDVM 4,52%, TO 89,2%</li>
                  <li>• <strong>Édissimo</strong> : 88% bureaux, Paris 65% + IDF 30%, Cap 1,64 Mds€, TDVM 4,45%, TO 89,5%</li>
                  <li>• <strong>Efimmo 1</strong> : 78% bureaux, IDF 54% + Régions 36%, Cap 3,75 Mds€, TDVM 5,5%, TO 90,9%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Pourquoi c'est essentiel</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Les bureaux premium Paris et grandes métropoles (Lyon, Bordeaux, Nantes) maintiennent des <strong>TO supérieurs à 90%</strong> et des loyers stables/en hausse. Évitez les SCPI trop exposées aux villes secondaires.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Vérifier la performance énergétique (DPE A-B-C minimum)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Le <strong>décret tertiaire impose DPE C minimum d'ici 2030</strong>. Les bureaux DPE D-E-F deviennent impossibles à louer et perdent 30-40% de valeur. Exigez transparence sur la répartition DPE du patrimoine.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎯 Critères à privilégier</h4>
                <ul className="text-sm space-y-2">
                  <li>• <strong>80% minimum DPE A-B-C</strong> dans le patrimoine de la SCPI</li>
                  <li>• Programme actif de rénovation énergétique pour les actifs D-E</li>
                  <li>• Certification HQE, BREEAM ou équivalent pour les immeubles récents</li>
                  <li>• Exemple : <strong>Novaxia NEO</strong> spécialisé recyclage urbain ESG : TDVM 6,01%, TO 97,7%</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Privilégier les grandes capitalisations (plus de 1 Mds€)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Les <strong>grandes SCPI disposent d'un patrimoine diversifié</strong> (100-400 immeubles) réduisant le risque locataire et géographique. Meilleure liquidité et gestion professionnelle.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🏢 Top 5 SCPI bureaux par capitalisation</h4>
                <ol className="text-sm space-y-2">
                  <li>1. <strong>Épargne Foncière</strong> (La Française) - 5,2 Mds€, 456 immeubles, TDVM 4,52%</li>
                  <li>2. <strong>Efimmo 1</strong> (Sofidy) - 3,75 Mds€, 252 immeubles, TDVM 5,5%</li>
                  <li>3. <strong>Perial O2</strong> (Perial) - 2,42 Mds€, 198 immeubles, TDVM 4,91%</li>
                  <li>4. <strong>Crédit Mutuel Pierre 1</strong> (La Française) - 2,15 Mds€, 132 immeubles, TDVM 4,52%</li>
                  <li>5. <strong>Édissimo</strong> (Amundi) - 1,64 Mds€, 186 immeubles, TDVM 4,45%</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Analyser le taux d'occupation financier (TO supérieur à 88%)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Le TO mesure la part des surfaces générant des revenus. <strong>Seuil minimum : 88% pour les SCPI bureaux en 2025</strong> (vs 92% commerces). Un TO inférieur à 85% signale des difficultés de relocation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-sm">
                  <strong>✅ TO Excellent :</strong> Supérieur à 92% (Crédit Mutuel Pierre 1 : 93,8%, Perial O2 : 91,3%)
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3 text-sm">
                  <strong>⚠️ TO Vigilance :</strong> Inférieur à 88% (Édissimo 89,5%, mais patrimoine premium compense)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Diversifier entre SCPI bureaux et autres secteurs (50/50)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Ne concentrez jamais 100% de votre allocation SCPI sur les bureaux. Le télétravail reste un <strong>risque structurel moyen terme</strong>. Équilibrez avec commerces proximité, santé ou logistique.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎯 Exemple allocation diversifiée 100 000 €</h4>
                <ul className="text-sm space-y-2">
                  <li>• 30 000 € <strong>Épargne Foncière</strong> : socle bureaux premium Paris/IDF, grande cap</li>
                  <li>• 20 000 € <strong>Efimmo 1</strong> : bureaux métropoles régionales, rendement 5,5%</li>
                  <li>• 25 000 € <strong>Épargne Pierre</strong> : commerces proximité 84%, TDVM 5,28%</li>
                  <li>• 15 000 € <strong>LF Avenir Santé</strong> : santé 100%, résilient télétravail, TDVM 5,2%</li>
                  <li>• 10 000 € <strong>Activimmo</strong> : logistique 51%, croissance e-commerce, TDVM 5,5%</li>
                </ul>
                <p className="text-sm mt-3 italic text-gray-600 dark:text-gray-400">
                  Résultat : 50% bureaux + 50% autres secteurs = diversification sectorielle optimale
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Ciblez des <strong>SCPI 70% Paris/Métropoles minimum</strong> pour limiter l'impact télétravail sur actifs secondaires</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Exigez <strong>80% DPE A-B-C minimum</strong> : critère décisif pour maintenir loyers et valeurs vénales</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Privilégiez les <strong>capitalisations supérieures à 1 Mds€</strong> : Épargne Foncière 5,2 Mds€, Efimmo 1 3,75 Mds€, Perial O2 2,42 Mds€</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Diversifiez <strong>50% bureaux maximum</strong> : équilibrez avec commerces proximité, santé, logistique</span>
            </li>
          </ul>
        </div>
      </section>
      

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
        <h2 className="text-3xl font-bold mb-4">Conclusion : SCPI de bureaux en 2025 : quel impact du télétravail ?</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, scpi bureaux nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
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

export default ScpiBureauxTertiaireTeletravail2025Article;
