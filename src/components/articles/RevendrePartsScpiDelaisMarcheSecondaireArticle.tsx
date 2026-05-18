import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const RevendrePartsScpiDelaisMarcheSecondaireArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">Revendre ses parts de SCPI : délais, procédure et marché secondaire</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Revendre ses parts de SCPI : délais, procédure et marché secondaire
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
          <strong>Revendre ses parts de SCPI : comprendre l'écart prix d'achat / valeur de retrait.</strong> Sur les <strong>51 SCPI MaximusSCPI analysées</strong> : <strong>70,6% sont neutres</strong> (écart = frais de souscription 8-12%), <strong>25,5% perdent au-delà des frais</strong> (perte moyenne -14,20%), et <strong>3,9% gagnent</strong> (2 SCPI). <strong>Important :</strong> l'écart prix/valeur retrait reflète d'abord les <strong>frais de souscription</strong> (normaux dans 70% des cas). Les vraies pertes concernent 13 SCPI, dont 1 cas extrême : Edissimo -53%. Ce guide analyse les délais réels de revente et les stratégies de sortie.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>51 SCPI analysées : 70,6% neutres (écart = frais 8-12%), 25,5% perdantes, 3,9% gagnantes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Frais de souscription normaux : 8-12% expliquent la majorité des écarts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>13 SCPI avec pertes au-delà des frais : moyenne -14,20% (cas extrême : Edissimo -53%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>2 SCPI gagnantes : GMA Essentialis (+23,6%), Iroko Zen (+0,99%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Délais réels : 6-24 mois selon liquidité (pas 3 mois comme annoncé)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Stratégies pour limiter les pertes si vous devez vendre en urgence</span>
            </li>
          </ul>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="risques" />

      {/* Section principale */}
      
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Le marché secondaire des SCPI : la réalité des chiffres
        </h2>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            Important : Comprendre l'écart prix d'achat / valeur de retrait
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Quand vous achetez une part de SCPI à <strong>1000€</strong>, vous payez :<br/>
            • <strong>900€ investis</strong> dans l'immobilier<br/>
            • <strong>100€ de frais de souscription</strong> (8-12% selon les SCPI)<br/><br/>
            → C'est pourquoi la <strong>valeur de retrait est toujours inférieure au prix d'achat</strong> dans 70% des cas.
          </p>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le <strong>marché secondaire</strong> permet de revendre vos parts de SCPI. Sur les <strong>51 SCPI MaximusSCPI analysées</strong>, voici la réalité des écarts prix d'achat / valeur de retrait :
        </p>

        <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            Analyse complète : 51 SCPI MaximusSCPI (données 2024-2025)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
              <p className="text-3xl font-bold text-gray-600">70,6%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">SCPI neutres (36/51)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Écart = frais de souscription normaux (8-12%)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
              <p className="text-3xl font-bold text-red-600">25,5%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">SCPI perdantes (13/51)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Perte moyenne -14,20% (au-delà des frais)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
              <p className="text-3xl font-bold text-green-600">3,9%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">SCPI gagnantes (2/51)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Valeur retrait {'>'} prix achat</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 2 seules SCPI où vous gagnez à la revente</h3>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">1. GMA Essentialis - Gain +23,60%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 150€ → Revente 185€ | Gain: +35€/part | TDVM 0% | Cap 42,3 M€</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">⚠️ SCPI sans dividende (TDVM 0%)</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">2. Iroko Zen - Gain +0,99%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 202€ → Revente 204€ | Gain: +2€/part | TDVM 6,01% | Cap 1 100 M€</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">✅ SCPI performante avec dividendes</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 13 SCPI avec pertes au-delà des frais de souscription</h3>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 mb-6 border-l-4 border-orange-500">
          <h4 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Cas extrême : Edissimo -53,18%
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Achat 338€ → Valeur retrait 158€ = Perte -180€/part (-53,18%)</strong><br/>
            TDVM 4,45% | Capitalisation 1 639,5 M€
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-3 bg-white dark:bg-gray-800 rounded-lg p-3">
            ⚠️ <strong>Contexte important :</strong> Edissimo est le seul cas extrême parmi les 51 SCPI MaximusSCPI. Cette perte de -53% dépasse largement les frais de souscription normaux (8-12%) et reflète des difficultés spécifiques à cette SCPI. Ce cas ne représente pas la norme du marché.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
            Les 12 autres SCPI perdantes affichent des pertes de -8% à -19%, plus proches des frais de souscription :
          </p>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">2. Cristal Life - Perte -19,43%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 225€ → Revente 181€ | Perte: -44€/part | TDVM 5,2% | Cap 290,4 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">3. Efimmo 1 - Perte -15,20%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 225€ → Revente 191€ | Perte: -34€/part | TDVM 5,5% | Cap 3 749,9 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">4. Sofiprime - Perte -14,82%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 280€ → Revente 239€ | Perte: -41€/part | TDVM 0,54% | Cap 44,9 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">5. Patrimmo Croissance Impact - Perte -11,76%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 677€ → Revente 597€ | Perte: -80€/part | TDVM 0% | Cap 189,7 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">6. Kyaneos Pierre - Perte -11,00%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 224€ → Revente 199€ | Perte: -25€/part | TDVM 4,96% | Cap 384,78 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">7. Log In - Perte -10,00%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 250€ → Revente 225€ | Perte: -25€/part | TDVM 6,0% | Cap 192,1 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">8. NCap Education Santé - Perte -10,00%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 202€ → Revente 182€ | Perte: -20€/part | TDVM 4,85% | Cap 110 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">9. LF Avenir Santé - Perte -9,00%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 300€ → Revente 273€ | Perte: -27€/part | TDVM 5,2% | Cap 231,71 M€</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">10. NCap Régions - Perte -8,39%</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">Achat 670€ → Revente 614€ | Perte: -56€/part | TDVM 5,72% | Cap 972,8 M€</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir (51 SCPI MaximusSCPI analysées)</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>70,6% des SCPI sont neutres</strong> (36/51) : l'écart prix/valeur retrait = frais de souscription normaux 8-12%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>25,5% perdent au-delà des frais</strong> (13/51) : perte moyenne -14,20%</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>3,9% gagnent</strong> (2/51) : GMA Essentialis (+23,6%), Iroko Zen (+0,99%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>1 seul cas extrême : Edissimo -53%</strong> (ne représente pas la norme du marché)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Important :</strong> Les frais de souscription (8-12%) expliquent la majorité des écarts prix/valeur retrait</span>
            </li>
          </ul>
        </div>
      </section>
      

      <ArticleCtaBlock variant="middle" topic="risques" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Délais de revente : combien de temps pour vendre vos parts ?
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le délai de revente dépend de la <strong>liquidité de la SCPI</strong> (surcote/décote) et du <strong>mode de cession</strong> (marché secondaire ou retrait). Voici les délais réels constatés en 2025.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4">SCPI avec surcote : revente rapide</h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Délai moyen : 1 à 3 mois</strong></li>
              <li>• <strong>Marché secondaire actif</strong> : forte demande d'acheteurs</li>
              <li>• <strong>Prix de vente : supérieur au prix d'achat</strong></li>
              <li>• Exemples : Perial O2 (+7,46%), Immorente (+6,33%), Paref Hexa (+5,25%)</li>
              <li>• ✅ <strong>Liquidité excellente</strong></li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4">SCPI avec décote : revente lente</h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>• <strong>Délai moyen : 6 à 18 mois</strong></li>
              <li>• <strong>Marché secondaire inactif</strong> : peu d'acheteurs</li>
              <li>• <strong>Prix de vente : inférieur de 5 à 10%</strong></li>
              <li>• Exemples : GMA Essentialis (-9,86%), Épargne Foncière (-9,83%)</li>
              <li>• ❌ <strong>Liquidité difficile</strong></li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 2 modes de revente</h3>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
            <h4 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-3">1. Marché secondaire (recommandé)</h4>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Principe :</strong> vous vendez vos parts à un autre investisseur via la SCPI</li>
              <li>• <strong>Délai :</strong> 1 à 6 mois selon la liquidité</li>
              <li>• <strong>Prix :</strong> prix du marché (surcote ou décote)</li>
              <li>• <strong>Frais :</strong> 0 à 2% selon la SCPI</li>
              <li>• ✅ <strong>Avantage :</strong> revente la plus rapide si SCPI liquide</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <h4 className="text-xl font-bold text-orange-900 dark:text-orange-200 mb-3">2. Retrait direct (dernier recours)</h4>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Principe :</strong> la SCPI rachète vos parts directement</li>
              <li>• <strong>Délai :</strong> 6 à 24 mois (file d'attente)</li>
              <li>• <strong>Prix :</strong> valeur de retrait (souvent inférieure au prix de souscription)</li>
              <li>• <strong>Frais :</strong> 5 à 10% de frais de retrait</li>
              <li>• ⚠️ <strong>À éviter :</strong> délai très long, frais élevés</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conseils pour vendre rapidement</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Choisissez des SCPI liquides dès l'achat</strong> : Perial O2, Immorente, Paref Hexa (surcote +5 à +7%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Acceptez une décote volontaire</strong> : vendre à -2% permet de trouver un acheteur en 1 mois</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Évitez les SCPI à forte décote</strong> : GMA Essentialis (-9,86%), Épargne Foncière (-9,83%) = 12-18 mois de délai</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Privilégiez le marché secondaire</strong> : 3-6 mois vs 6-24 mois pour un retrait direct</span>
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
        <h2 className="text-3xl font-bold mb-4">Conclusion : Revendre ses parts de SCPI : délais, procédure et marché secondaire</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, revente scpi nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
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

export default RevendrePartsScpiDelaisMarcheSecondaireArticle;
