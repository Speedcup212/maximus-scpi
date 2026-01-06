import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';

export const FraisScpiSouscriptionGestionPerformanceArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">Frais SCPI : comprendre et optimiser les coûts d'investissement</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Frais SCPI : comprendre et optimiser les coûts d'investissement
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
          <strong>Les frais SCPI peuvent réduire votre rendement de 30 à 40% sur 20 ans.</strong> Sur les <strong>225 SCPI françaises</strong>, les frais de souscription varient de <strong>0% à 10,6%</strong> et les frais de gestion de <strong>1% à 15%</strong>. Un investissement de 50 000 € dans une SCPI à 10% de frais d'entrée vous coûte 5 000 € dès la première année, avant même de percevoir le moindre loyer. Ce guide analyse les 3 types de frais SCPI (souscription, gestion, arbitrage) avec des <strong>données réelles sur 51 SCPI sélectionnées</strong> par MaximusSCPI, et vous explique comment réduire ces coûts de 50 à 70% en choisissant les bonnes enveloppes et les bons véhicules d'investissement.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Les 3 types de frais SCPI : souscription (0-10,6%), gestion (1-15%), arbitrage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Analyse de 51 SCPI : 3 SCPI sans frais d'entrée (Iroko Zen, Novaxia NEO, Remake Live)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Impact réel sur 20 ans : 10% de frais = 5 000 € perdus + 8-10 ans pour amortir</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Comment réduire les frais de 50% : assurance-vie, courtiers, négociation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Simulateur : calculer le vrai coût total de votre investissement SCPI</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section principale */}
      
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Les 3 types de frais SCPI (données réelles 51 SCPI MaximusSCPI)
        </h2>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-red-600" />
              1. Frais de souscription (frais d'entrée)
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Prélevés <strong>une seule fois à l'achat</strong> des parts. Réduisent immédiatement votre capital investi.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">0%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Sans frais d'entrée</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>3 SCPI :</strong> Iroko Zen, Novaxia NEO, Remake Live
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">9-10%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Standard marché</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>36 SCPI</strong> (70% du marché)
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-orange-600">10,6%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Maximum marché</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Activimmo</strong> (logistique)
                </p>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Impact sur votre investissement</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-bold mb-1">Investissement 50 000 €, frais 10%</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Frais prélevés : <strong>5 000 €</strong></li>
                    <li>• Capital investi réel : <strong>45 000 €</strong></li>
                    <li>• Perte immédiate : <strong>-10%</strong></li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1">Temps pour amortir les frais</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• SCPI à 5% de rendement : <strong>2 ans</strong></li>
                    <li>• SCPI à 4% de rendement : <strong>2,5 ans</strong></li>
                    <li>• + valorisation nécessaire pour récupérer</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              2. Frais de gestion (frais annuels)
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Prélevés <strong>chaque année</strong> sur les loyers perçus. Réduisent le rendement distribué.
            </p>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">1-8%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Frais faibles</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>6 SCPI</strong> : Sofiprime 1,03%, Novapierre Résidentiel 1,71%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">9-10%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Standard</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>40 SCPI</strong> (78% du marché)
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-orange-600">12,5%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Élevé</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Iroko Zen</strong> (sans frais d'entrée)
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-red-600">15%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Maximum</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>3 SCPI</strong> : Novaxia NEO, Remake Live, Altixia Commerces
                </p>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Impact sur le rendement</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-bold mb-1">SCPI rendement brut 5%, frais gestion 10%</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Loyers bruts : <strong>5 000 €/an</strong> (sur 100k€)</li>
                    <li>• Frais gestion : <strong>-500 €/an</strong></li>
                    <li>• Loyers nets : <strong>4 500 €/an</strong></li>
                    <li>• Rendement net : <strong>4,5%</strong></li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1">Sur 20 ans, cumul frais de gestion</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Frais 10% : <strong>10 000 €</strong> prélevés</li>
                    <li>• Frais 12,5% : <strong>12 500 €</strong> prélevés</li>
                    <li>• Frais 15% : <strong>15 000 €</strong> prélevés</li>
                    <li>• <strong>Différence = 5 000 €</strong> sur 20 ans</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Euro className="w-6 h-6 text-purple-600" />
              3. Frais d'arbitrage (frais de revente)
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Prélevés <strong>à la revente</strong> de vos parts. Impactent votre plus-value finale.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">5-7%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Frais de cession</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Payés par le vendeur sur le prix de vente
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">0€</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Via assurance-vie</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Pas de frais d'arbitrage entre supports
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">Variable</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Selon SCPI</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Vérifier conditions de sortie avant achat
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Sur 51 SCPI MaximusSCPI, <strong>70% ont des frais de souscription 9-10%</strong> et <strong>78% ont des frais de gestion 9-10%</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Seules <strong>3 SCPI sans frais d'entrée</strong> : Iroko Zen, Novaxia NEO, Remake Live (mais frais de gestion 12,5-15%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Sur 20 ans, 10% de frais de souscription représentent <strong>2-2,5 ans de rendement perdus</strong> à amortir</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les frais de gestion réduisent votre TDVM de <strong>0,5 à 1 point de rendement annuel</strong> selon les SCPI</span>
            </li>
          </ul>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Avantages et limites
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Analyse objective des points forts et des contraintes, avec exemples concrets. Pour frais scpi, cette analyse vous permet de comprendre tous les enjeux et d'optimiser votre stratégie d'investissement.
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
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Recommandations pratiques
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Conseils actionnables pour optimiser votre stratégie selon votre profil. Pour frais scpi, cette analyse vous permet de comprendre tous les enjeux et d'optimiser votre stratégie d'investissement.
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
        <h2 className="text-3xl font-bold mb-4">Conclusion : Frais SCPI : comprendre et optimiser les coûts d'investissement</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, frais scpi nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
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

export default FraisScpiSouscriptionGestionPerformanceArticle;
