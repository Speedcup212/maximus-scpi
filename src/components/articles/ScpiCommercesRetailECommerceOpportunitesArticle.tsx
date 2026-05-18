import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiCommercesRetailECommerceOpportunitesArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI de commerces : comment le retail résiste au e-commerce</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI de commerces : comment le retail résiste au e-commerce
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
          SCPI de commerces : comment le retail résiste au e-commerce : comprendre ce sujet est essentiel pour tout investisseur en SCPI. Que vous soyez débutant ou investisseur confirmé, ce guide complet vous apporte toutes les informations nécessaires pour prendre des décisions éclairées. Avec des exemples concrets, des données chiffrées et des conseils pratiques, vous aurez toutes les clés pour réussir votre investissement.
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

      <ArticleCtaBlock variant="top" topic="general" />

      {/* Section principale */}

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Les SCPI de commerces en 2025 : un marché en mutation
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le secteur du commerce représente <strong>20-25% du patrimoine total des SCPI françaises</strong>, soit environ 15 milliards d'euros d'actifs immobiliers. Face à la montée du e-commerce, les SCPI spécialisées ont profondément adapté leur stratégie d'investissement pour privilégier les commerces de proximité, alimentaires et les retail parks en périphérie.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Le marché du retail immobilier en chiffres
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">5-5,3%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">TDVM moyen des SCPI commerces spécialisées en 2025</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">92-96%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taux d'occupation financier moyen du secteur</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">8,5 Mds€</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Capitalisation des 3 leaders du secteur</div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 3 grandes catégories de commerces en SCPI</h3>

        <div className="space-y-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1️⃣ Commerces de centre-ville et pieds d'immeuble</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Commerces de proximité situés en zones urbaines denses, souvent résistants au e-commerce grâce aux services de proximité (alimentaire, santé, restauration).
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">SCPI leaders :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Épargne Pierre</strong> (Atland Voisin) - 84% commerces, 2,7 Mds€, TDVM 5,28%</li>
                <li>• <strong>Ficommerce Proximité</strong> (Fiducial) - 84% commerces, 600 M€, TDVM 5,07%</li>
                <li>• <strong>Urban Coeur de Commerce</strong> (Urban Premium) - 100% commerces proximité, 73 M€, TDVM 5,1%</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-green-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2️⃣ Retail parks et moyennes surfaces de périphérie</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Zones commerciales en périphérie des villes regroupant moyennes surfaces spécialisées (bricolage, sport, équipement maison). Modèle click & collect adapté à l'omnicanal.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">SCPI leaders :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Altixia Commerces</strong> (Altixia REIM) - 58% retail parks, 108 M€, TDVM 5,12%</li>
                <li>• <strong>Immorente</strong> (Sofidy) - 38% commerces périphérie, 4,4 Mds€, TDVM 5,04%</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-orange-500">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3️⃣ Galeries et centres commerciaux</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Grands centres commerciaux régionaux. Secteur plus exposé au e-commerce mais avec repositionnement vers l'expérience client (loisirs, restauration).
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Présent dans les SCPI diversifiées :</p>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Immorente</strong> : 13,7% galeries commerciales sur 4,4 Mds€ de capitalisation</li>
                <li>• Poids en baisse dans les stratégies récentes (recul de 20% depuis 2019)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les SCPI commerces offrent des rendements de <strong>5-5,3%</strong> en moyenne, légèrement supérieurs aux SCPI bureaux (4,5%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le commerce de proximité alimentaire et services résiste très bien au e-commerce avec des TO supérieurs à 95%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les retail parks connaissent un regain d'intérêt grâce au modèle omnicanal et au click & collect</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Évitez les SCPI trop exposées aux grands centres commerciaux (galeries commerciales en recul structurel)</span>
            </li>
          </ul>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Retail vs E-commerce : pourquoi les SCPI commerces résistent
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Contrairement aux idées reçues, <strong>le commerce physique ne disparaît pas mais se transforme</strong>. Les SCPI spécialisées ont anticipé cette mutation en réorientant leurs investissements vers les segments les plus résilients.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Les atouts du commerce physique
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Commerce alimentaire de proximité</strong><br />
                  <span className="text-sm">Indispensable au quotidien, TO supérieur à 98%. Épargne Pierre : 84% commerces proximité, TDVM 5,28%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Services non délocalisables</strong><br />
                  <span className="text-sm">Santé, restauration, services à la personne (coiffeur, pressing). Urban Coeur de Commerce : 46% santé/services</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Modèle omnicanal (click & collect)</strong><br />
                  <span className="text-sm">Retail parks bénéficient du web-to-store. Altixia Commerces : 58% retail parks, TDVM 5,12%</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Expérience client impossible en ligne</strong><br />
                  <span className="text-sm">Essayage, conseil personnalisé, immédiateté (prêt-à-porter, bricolage, décoration)</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Les segments fragilisés par le e-commerce
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Grands centres commerciaux régionaux</strong><br />
                  <span className="text-sm">Galeries commerciales en déclin structurel, TO en baisse (85-88%). À éviter ou limiter à 15% max du portefeuille</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Électronique et multimédia</strong><br />
                  <span className="text-sm">Secteur très concurrencé par Amazon et pure players. Faible valeur ajoutée du point de vente physique</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Commerces de mode standardisée</strong><br />
                  <span className="text-sm">Prêt-à-porter bas de gamme, chaussures standards fortement impactés par Vinted et e-commerce</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Zones commerciales obsolètes</strong><br />
                  <span className="text-sm">Retail parks mal situés ou vieillissants sans rénovation. Risque de vacance locative élevé</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Comparatif rendement/risque : SCPI commerces vs autres secteurs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left">Secteur</th>
                  <th className="px-4 py-3 text-center">TDVM moyen</th>
                  <th className="px-4 py-3 text-center">TO moyen</th>
                  <th className="px-4 py-3 text-center">Risque e-commerce</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Commerces proximité</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">5,1-5,3%</td>
                  <td className="px-4 py-3 text-center">95-98%</td>
                  <td className="px-4 py-3 text-center"><span className="text-green-600 font-bold">Faible</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Retail parks</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">5,0-5,2%</td>
                  <td className="px-4 py-3 text-center">90-95%</td>
                  <td className="px-4 py-3 text-center"><span className="text-blue-600 font-bold">Modéré</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Bureaux tertiaires</td>
                  <td className="px-4 py-3 text-center">4,5-5,0%</td>
                  <td className="px-4 py-3 text-center">90-94%</td>
                  <td className="px-4 py-3 text-center"><span className="text-gray-600">N/A</span></td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold">Galeries commerciales</td>
                  <td className="px-4 py-3 text-center font-bold text-orange-600">4,0-4,5%</td>
                  <td className="px-4 py-3 text-center">85-88%</td>
                  <td className="px-4 py-3 text-center"><span className="text-red-600 font-bold">Élevé</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les commerces de proximité alimentaire et services sont <strong>structurellement résilients</strong> face au e-commerce</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le rendement des SCPI commerces spécialisées (5,1-5,3%) reste <strong>supérieur aux bureaux</strong> (4,5-5%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Privilégiez les SCPI <strong>80% commerces proximité minimum</strong> : Épargne Pierre, Ficommerce Proximité, Urban Coeur de Commerce</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Évitez les SCPI avec <strong>plus de 20% de galeries commerciales</strong> (risque de décote et baisse des revenus)</span>
            </li>
          </ul>
        </div>
      </section>
      

      <ArticleCtaBlock variant="middle" topic="general" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Comment sélectionner les meilleures SCPI commerces
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Face à l'évolution du retail, tous les commerces ne se valent pas. Voici les <strong>7 critères essentiels</strong> pour identifier les SCPI commerces les plus résilientes et performantes en 2025.
        </p>

        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Privilégier les commerces de proximité (80% minimum)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ SCPI recommandées</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Épargne Pierre</strong> : 84% commerces proximité, Cap 2,7 Mds€, TDVM 5,28%, TO 95,7%</li>
                  <li>• <strong>Ficommerce Proximité</strong> : 84% commerces, Cap 600 M€, TDVM 5,07%, TO 95,7%</li>
                  <li>• <strong>Urban Coeur de Commerce</strong> : 100% commerces proximité, Cap 73 M€, TDVM 5,1%, TO 92,3%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Pourquoi c'est important</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Les commerces alimentaires, santé et services de proximité affichent des <strong>TO supérieurs à 95%</strong> même en période de crise. Ils sont structurellement résilients au e-commerce car indispensables au quotidien.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Vérifier la qualité de l'emplacement géographique</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Zones à privilégier</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Paris et 12 métropoles régionales (Lyon, Bordeaux, Nantes, Toulouse)</li>
                  <li>• Centres-villes denses avec forte population résidente</li>
                  <li>• Retail parks bien desservis (autoroutes, transports)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">❌ Zones à éviter</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Zones commerciales isolées en périphérie lointaine</li>
                  <li>• Villes petites/moyennes en déclin démographique</li>
                  <li>• Galeries commerciales obsolètes sans projet de rénovation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Analyser la solidité des locataires</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Vérifiez que la SCPI s'appuie sur des <strong>enseignes solides et diversifiées</strong> : Carrefour, Monoprix, Système U (alimentaire), Pharmacies, Decathlon, Leroy Merlin (retail parks).
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">⚠️ Points de vigilance</h4>
                <ul className="text-sm space-y-1">
                  <li>• Évitez les SCPI trop dépendantes d'une seule enseigne (plus de 15% du patrimoine)</li>
                  <li>• Méfiez-vous des enseignes en difficulté financière (surendettement, fermetures de magasins)</li>
                  <li>• Privilégiez les baux longs (6-9 ans) avec indexation annuelle</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Limiter l'exposition aux galeries commerciales (15% max)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Les <strong>grands centres commerciaux sont en déclin structurel</strong> : taux d'occupation en baisse (85-88%), décote des valeurs vénales, revenus sous pression. Exemple : Immorente détient 13,7% de galeries sur 4,4 Mds€ mais compense avec 51,8% de commerces proximité.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 text-sm">
                  <strong>⛔ À éviter absolument :</strong> SCPI avec plus de 30% de galeries commerciales (risque de baisse durable des rendements)
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-sm">
                  <strong>✅ Allocation optimale :</strong> 80% proximité + 20% retail parks = exposition e-commerce limitée
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Vérifier le taux d'occupation financier (TO supérieur à 92%)</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Le TO mesure le pourcentage de surfaces louées générant des revenus. <strong>Seuil minimum acceptable : 92%</strong> pour les SCPI commerces en 2025.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📊 Benchmarks sectoriels 2025</h4>
                <ul className="text-sm space-y-2">
                  <li>• <strong>TO supérieur à 95% :</strong> Excellent (Épargne Pierre 95,7%, Ficommerce 95,7%)</li>
                  <li>• <strong>TO entre 92-95% :</strong> Bon (Altixia Commerces 90,8%, Urban Coeur 92,3%)</li>
                  <li>• <strong>TO inférieur à 90% :</strong> Vigilance accrue (risque de baisse des revenus)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Privilégier les SCPI Label ISR avec transparence ESG</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Le <strong>Label ISR garantit une gestion responsable</strong> et une meilleure résilience long terme. Les commerces bien gérés sur le plan environnemental (DPE A-C) et social attirent plus facilement les enseignes premium.
              </p>
              <ul className="text-sm space-y-2">
                <li>✓ Toutes les SCPI commerces leaders détiennent le Label ISR (Épargne Pierre, Ficommerce, Altixia Commerces)</li>
                <li>✓ Les bâtiments performants (DPE A-C) se louent 10-15% plus cher et conservent mieux leur valeur</li>
                <li>✓ Obligation SFDR Article 8 minimum (intégration critères ESG dans les décisions d'investissement)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Diversifier sur 3-4 SCPI commerces minimum</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                Ne mettez jamais tous vos œufs dans le même panier. Une <strong>allocation diversifiée réduit le risque spécifique</strong> lié à une société de gestion ou à un segment commercial.
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🎯 Exemple d'allocation optimale 60 000 €</h4>
                <ul className="text-sm space-y-2">
                  <li>• 30 000 € <strong>Épargne Pierre</strong> : socle commerces proximité, grande capitalisation</li>
                  <li>• 15 000 € <strong>Ficommerce Proximité</strong> : complémentaire, gestion Fiducial</li>
                  <li>• 10 000 € <strong>Altixia Commerces</strong> : exposition retail parks, société de gestion différente</li>
                  <li>• 5 000 € <strong>Urban Coeur de Commerce</strong> : pure player commerces proximité, taille humaine</li>
                </ul>
                <p className="text-sm mt-3 italic text-gray-600 dark:text-gray-400">
                  Résultat : diversification par gestionnaire, taille de fonds, géographie et typologie commerciale
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
              <span>Ciblez des <strong>SCPI 80% commerces proximité minimum</strong> pour limiter le risque e-commerce</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Exigez un <strong>TO supérieur à 92%</strong> et vérifiez la solidité des enseignes locataires</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Évitez les SCPI avec <strong>plus de 20% de galeries commerciales</strong> (secteur en déclin structurel)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Diversifiez sur <strong>3-4 SCPI commerces</strong> pour réduire le risque spécifique (gestionnaire, géographie, typologie)</span>
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
        <h2 className="text-3xl font-bold mb-4">Conclusion : SCPI de commerces : comment le retail résiste au e-commerce</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, scpi commerces nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
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

export default ScpiCommercesRetailECommerceOpportunitesArticle;
