import React from 'react';
import { Building2, Shield, TrendingUp, AlertTriangle, CheckCircle2, Euro, Users, Target, User, Calendar, Clock, BarChart3, BookOpen, Scale, Lightbulb, Eye, Calculator } from 'lucide-react';
import ArticleCtaBlock from '../ArticleCtaBlock';

export const ScpiResidentiellesLogementLocatifScpiHabitationArticle: React.FC = () => {
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
            <li className="text-gray-900 dark:text-white font-semibold">SCPI résidentielles : investir dans le logement locatif via les SCPI</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full">
            Guide
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          SCPI résidentielles : investir dans le logement locatif via les SCPI
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
          <strong>Les SCPI résidentielles existent-elles vraiment en France ?</strong> La réponse est brutale : <strong>quasiment non</strong>. Sur les <strong>51 SCPI MaximusSCPI</strong>, seules <strong>3 SCPI investissent dans le résidentiel</strong> : <strong>Patrimmo Croissance Impact</strong> (Præmia, 100% logement, 189,7 M€, TDVM 0%), <strong>Novapierre Résidentiel</strong> (PAREF, 100% résidentiel, 347,9 M€, TDVM 0%) et <strong>Kyaneos Pierre</strong> (Kyaneos, 80% résidentiel, 384,78 M€, TDVM 4,96%). Seule <strong>Kyaneos Pierre distribue un rendement</strong> (4,96%). La raison de ces faibles performances ? Le rendement locatif résidentiel français (2,5-3%) est <strong>structurellement trop faible</strong> pour couvrir les frais de gestion SCPI (10-12%) et offrir un rendement compétitif. Ce guide analyse les 3 SCPI à composante résidentielle et explique pourquoi ce modèle ne fonctionne pas.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-900 dark:text-white font-bold mb-3 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Ce que vous allez découvrir :
          </p>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Pourquoi les SCPI 100% résidentielles n'existent quasiment pas en France</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>3 SCPI résidentielles sur 51 : Patrimmo (100%, 0%), Novapierre Résidentiel (100%, 0%), Kyaneos Pierre (80%, 4,96%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>L'équation économique impossible : rendement locatif 2,5% vs frais SCPI 10-12%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>2 SCPI diversifiées avec poche résidentielle : Cristal Life (12% résidentiel, TDVM 5,2%), Selectipierre 2 (5,6%)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">•</span>
              <span>Alternatives : immobilier locatif en direct, SCI familiale, LMNP</span>
            </li>
          </ul>
        </div>
      </section>

      <ArticleCtaBlock variant="top" topic="general" />

      {/* Section principale */}
      
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Pourquoi les SCPI résidentielles sont si rares en France
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le secteur résidentiel ne représente que <strong>3-4% de la capitalisation totale des SCPI françaises</strong>, contre 50% pour les bureaux et 25% pour les commerces. Cette faible représentation s'explique par <strong>l'écart de rendement structurel</strong> entre résidentiel et tertiaire.
        </p>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            L'équation économique du résidentiel français
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-red-900 dark:text-red-200 mb-3">Résidentiel France : rendement trop faible</h4>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Rendement locatif brut : 2,5-3,5%</strong> (Paris 2,8%, Lyon 3,2%)</li>
                <li>• <strong>Frais de gestion : 10-12%</strong> des loyers (copropriété, entretien)</li>
                <li>• <strong>Fiscalité défavorable :</strong> revenus fonciers IR+PS (28-62%)</li>
                <li>• <strong>TDVM net cible : 2-2,5%</strong> seulement après frais et fiscalité</li>
                <li>• ❌ <strong>Impossible de concurrencer</strong> les SCPI tertiaires (4,5-6%)</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-900 dark:text-green-200 mb-3">Résidentiel Allemagne : équilibre économique viable</h4>
              <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Rendement locatif brut : 4-5,5%</strong> (Berlin 4,5%, Munich 4%)</li>
                <li>• <strong>Frais de gestion : 6-8%</strong> des loyers (charges maîtrisées)</li>
                <li>• <strong>Fiscalité avantageuse :</strong> prélèvement à la source 25% (convention fiscale PS 0%)</li>
                <li>• <strong>TDVM net cible : 3,5-4,2%</strong> après frais et fiscalité</li>
                <li>• ✅ <strong>Rentabilité acceptable</strong> pour les investisseurs français</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Les 3 SCPI résidentielles du marché MaximusSCPI</h3>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Sur les <strong>51 SCPI MaximusSCPI, seulement 3 investissent dans le résidentiel</strong> (100% ou majoritaire). La réalité est brutale : <strong>2 sur 3 ne distribuent AUCUN dividende</strong> (TDVM 0%).
        </p>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-500">
            <h4 className="text-xl font-bold text-red-900 dark:text-red-200 mb-3">1️⃣ Patrimmo Croissance Impact (Præmia REIM) - 100% Logement, 0% de rendement</h4>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-600">0%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TDVM 2024</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-600">189,7 M€</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Capitalisation</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-red-600">92,4%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TOF 2024</p>
              </div>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>100% logement français</strong> : Paris 32,6%, Région parisienne 36,8%, Régions 27,8%</li>
              <li>• <strong>SCPI très récente :</strong> créée en 2025, en phase de constitution</li>
              <li>• <strong>Label ISR :</strong> Oui (investissement responsable)</li>
              <li>• <strong>Prix de souscription :</strong> 677 €/part (valeur retrait 597 €)</li>
              <li>• ❌ <strong>TDVM 0% :</strong> aucune distribution depuis la création</li>
              <li>• ⚠️ <strong>À éviter :</strong> SCPI en constitution, pas de track record, 0% de rendement</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-l-4 border-orange-500">
            <h4 className="text-xl font-bold text-orange-900 dark:text-orange-200 mb-3">2️⃣ Novapierre Résidentiel (PAREF GESTION) - 100% Résidentiel, 0% de rendement</h4>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-orange-600">0%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TDVM 2024</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-orange-600">347,9 M€</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Capitalisation</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-orange-600">90,7%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TOF 2024</p>
              </div>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>100% résidentiel français :</strong> Paris 77,8%, Région parisienne 19,9%, Nice 2,3%</li>
              <li>• <strong>Historique long :</strong> créée en 1996 (29 ans d'existence)</li>
              <li>• <strong>Prix de souscription :</strong> 1 664 €/part (valeur retrait 1 498 €, surcote +5,22%)</li>
              <li>• ❌ <strong>TDVM 0% :</strong> aucune distribution malgré 29 ans d'existence</li>
              <li>• ⚠️ <strong>À éviter :</strong> modèle économique non viable, rendement résidentiel trop faible</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-l-4 border-green-500">
            <h4 className="text-xl font-bold text-green-900 dark:text-green-200 mb-3">3️⃣ Kyaneos Pierre (Kyaneos AM) - 80% Résidentiel, seule SCPI viable</h4>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">4,96%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TDVM 2024</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">384,78 M€</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Capitalisation</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">90%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">TOF 2024</p>
              </div>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Allocation :</strong> 80% Résidentiel + 20% Tertiaire (France 100%)</li>
              <li>• <strong>Créée en 2018 :</strong> track record de 7 ans</li>
              <li>• <strong>Label ISR :</strong> Oui (investissement responsable)</li>
              <li>• <strong>Prix de souscription :</strong> 224 €/part (valeur retrait 199 €, décote -3,66%)</li>
              <li>• ✅ <strong>TDVM 4,96% :</strong> seule SCPI résidentielle qui distribue un rendement décent</li>
              <li>• <strong>Point fort :</strong> diversification 80/20 résidentiel/tertiaire équilibre le rendement</li>
              <li>• ℹ️ <strong>Explication :</strong> les 20% de tertiaire compensent la faiblesse du résidentiel (2,5-3%)</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mt-6 border-l-4 border-yellow-500">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Et les SCPI diversifiées avec poche résidentielle ?
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Sur les 51 SCPI MaximusSCPI, <strong>2 SCPI diversifiées intègrent une poche résidentielle minoritaire</strong> (5-12%) tout en distribuant un rendement correct :
          </p>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            <li>• <strong>Cristal Life (Inter Gestion) :</strong> 12% résidentiel + 42% commerce + 22% bureaux = TDVM 5,2% (capitalisation 290,4 M€)</li>
            <li>• <strong>Selectipierre 2 (Fiducial) :</strong> 5,6% habitation + 67,5% bureaux + 21,3% commerces = TDVM 4,08% (capitalisation 473,1 M€)</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Sur 51 SCPI MaximusSCPI, <strong>seulement 3 investissent dans le résidentiel</strong> : 2 avec TDVM 0%, 1 seule viable (Kyaneos Pierre, 4,96%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Les <strong>SCPI 100% résidentielles ne distribuent aucun dividende</strong> : Patrimmo (0%), Novapierre Résidentiel (0%)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>Kyaneos Pierre</strong> fonctionne grâce au mix 80% résidentiel + 20% tertiaire qui compense le faible rendement du résidentiel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Alternative : <strong>Cristal Life (12% résidentiel, TDVM 5,2%)</strong> ou <strong>Selectipierre 2 (5,6% habitation, TDVM 4,08%)</strong></span>
            </li>
          </ul>
        </div>
      </section>
      

      <ArticleCtaBlock variant="middle" topic="general" />

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          Faut-il intégrer du résidentiel dans son portefeuille SCPI ?
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Le résidentiel ne doit <strong>pas être le cœur de votre portefeuille SCPI</strong> car les rendements sont structurellement inférieurs au tertiaire (4% vs 5%). Cependant, il peut jouer un rôle de <strong>diversification défensive</strong> pour certains profils.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Arguments en faveur du résidentiel
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Résilience en crise</strong><br />
                  <span className="text-xs">Le logement résiste mieux que le tertiaire en récession (besoin fondamental). TO résidentiel 95%+ même en 2020-2021.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Décorrélation des cycles</strong><br />
                  <span className="text-xs">Le résidentiel évolue différemment du tertiaire (marchés locatifs distincts). Utile pour lisser la volatilité du portefeuille.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Exposition Allemagne attractive</strong><br />
                  <span className="text-xs">Primopierre et Iroko Zen offrent une diversification géographique (30-40 villes allemandes) impossible en direct.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Baux courts = loyers actualisés</strong><br />
                  <span className="text-xs">Les baux résidentiels (3 ans en Allemagne) permettent une indexation rapide en cas d'inflation (vs baux 3/6/9 tertiaire).</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Arguments contre le résidentiel
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Rendement inférieur de 1-2 points</strong><br />
                  <span className="text-xs">Iroko Zen 3,96% vs Épargne Foncière 5,09% (bureaux). Sur 20 ans, ce différentiel de 1% représente 20% de revenus en moins.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Croissance des loyers plus faible</strong><br />
                  <span className="text-xs">Résidentiel : +1-2%/an. Tertiaire : +2-3%/an. Sur longue période, l'écart de valorisation se creuse.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Concentration géographique Allemagne</strong><br />
                  <span className="text-xs">Les 2 SCPI pures (Iroko Zen, Primopierre) exposent à 100% sur l'Allemagne. Risque réglementaire et législatif allemand.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Offre limitée = choix restreint</strong><br />
                  <span className="text-xs">Seulement 2 vraies SCPI résidentielles pures. Impossible de diversifier sur 4-5 gestionnaires comme avec les SCPI tertiaires.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Allocation recommandée : quelle place pour le résidentiel ?</h3>
          <div className="space-y-4">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">🎯 Profil équilibré (capital 50k€+)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <strong>10-15% résidentiel maximum</strong> dans un portefeuille SCPI diversifié. Exemple allocation 100 000 € :
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• 40 000 € <strong>Bureaux tertiaires</strong> (Épargne Foncière, Efimmo 1) - Cœur de portefeuille</li>
                <li>• 25 000 € <strong>Commerces proximité</strong> (Épargne Pierre) - Rendement 5,3%</li>
                <li>• 15 000 € <strong>Logistique</strong> (Activimmo) - Croissance structurelle e-commerce</li>
                <li>• 10 000 € <strong>Résidentiel allemand</strong> (Primopierre) - Diversification défensive</li>
                <li>• 10 000 € <strong>Santé</strong> (LF Avenir Santé) - Niche spécialisée</li>
              </ul>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">🚀 Profil rendement (capital 30-50k€)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <strong>0% résidentiel recommandé.</strong> Privilégier les SCPI tertiaires à haut rendement. Exemple allocation 50 000 € :
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• 20 000 € <strong>Corum Eurion</strong> (6,06% TDVM, diversifiée européenne)</li>
                <li>• 15 000 € <strong>Épargne Pierre</strong> (5,28% TDVM, commerces proximité)</li>
                <li>• 15 000 € <strong>Activimmo</strong> (5,43% TDVM, logistique)</li>
              </ul>
              <p className="text-xs italic text-gray-600 dark:text-gray-400 mt-2">
                ➜ Rendement portfolio : 5,6% brut (vs 4,8% avec 20% résidentiel)
              </p>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">🛡️ Profil prudent/retraité (capital 100k€+)</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <strong>20-25% résidentiel acceptable</strong> pour privilégier la stabilité. Exemple allocation 150 000 € :
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• 40 000 € <strong>Bureaux core</strong> (Épargne Foncière, Immorente) - Stabilité revenus</li>
                <li>• 35 000 € <strong>Commerces proximité</strong> (Épargne Pierre, Ficommerce) - Résilience</li>
                <li>• 30 000 € <strong>Résidentiel allemand</strong> (Primopierre 15k + Iroko Zen 15k) - Décorrélation</li>
                <li>• 25 000 € <strong>Santé/éducation</strong> (LF Avenir Santé) - Défensif</li>
                <li>• 20 000 € <strong>Logistique</strong> (Activimmo) - Croissance modérée</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points clés à retenir</h3>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le résidentiel ne doit <strong>jamais être majoritaire</strong> dans un portefeuille SCPI (rendement inférieur de 1-2 points vs tertiaire)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>10-15% résidentiel maximum</strong> pour les profils équilibrés, 20-25% pour les profils très prudents, 0% pour les profils rendement</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Si résidentiel : privilégier <strong>Primopierre</strong> (track record 18 ans, 1,4 Md€) ou <strong>Corum Eurion</strong> (30% résidentiel + 70% tertiaire = meilleur compromis)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <span>Le résidentiel apporte <strong>décorrélation et résilience</strong> mais au prix d'un rendement plus faible. Arbitrage à faire selon votre profil de risque</span>
            </li>
          </ul>
        </div>
      </section>
      

      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-blue-600" />
          Mode d'emploi : comment investir dans les SCPI résidentielles
        </h2>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Privilégier Primopierre ou Corum Eurion</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Primopierre : le choix historique</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Pure player résidentiel allemand</strong> : 89% résidentiel, 1,4 Md€</li>
                  <li>• Track record 18 ans, TDVM stable 4,3-4,6%</li>
                  <li>• Société de gestion Primonial (leader français)</li>
                  <li>• ⚠️ Frais souscription 12% (les plus élevés)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Corum Eurion : le meilleur compromis</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>30% résidentiel + 70% tertiaire</strong> : diversifiée</li>
                  <li>• TDVM record 6,06% (meilleur du marché)</li>
                  <li>• Diversification sectorielle et géographique optimale</li>
                  <li>• ✅ Meilleur rapport rendement/risque</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Éviter Iroko Zen pour l'instant</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Iroko Zen (TDVM 3,96%) affiche le <strong>rendement le plus faible</strong> des SCPI résidentielles, avec un TO de 92,9% (vs 95,2% Primopierre). La capitalisation modeste (281 M€) limite la mutualisation des risques.
            </p>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Notre avis :</strong> Si vous cherchez du résidentiel allemand pur, <strong>Primopierre est supérieur</strong> sur tous les critères (track record, capitalisation, TO, diversification géographique). Iroko Zen n'offre pas d'avantage décisif justifiant son choix.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Enveloppe : direct ou assurance-vie ?</h3>
            <div className="space-y-4">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📊 TMI 11% : 100% direct recommandé</h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Primopierre direct : TDVM 4,44%, fiscalité PS 0% + IR 11% = <strong>3,95% net</strong></li>
                  <li>• Primopierre AV : TDVM 4,44%, fiscalité PS 17,2% = <strong>3,68% net</strong></li>
                  <li>• ✅ <strong>Le direct gagne de 0,27 point</strong> (économie 810 €/an pour 30k€)</li>
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📊 TMI 30% : assurance-vie recommandée</h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Primopierre direct : TDVM 4,44%, fiscalité PS 0% + IR 30% = <strong>3,11% net</strong></li>
                  <li>• Primopierre AV : TDVM 4,44%, fiscalité PS 17,2% = <strong>3,68% net</strong></li>
                  <li>• ✅ <strong>L'AV gagne de 0,57 point</strong> (économie 1 710 €/an pour 30k€) + liquidité 48-72h</li>
                </ul>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📊 TMI 41% : assurance-vie obligatoire</h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Primopierre direct : TDVM 4,44%, fiscalité PS 0% + IR 41% = <strong>2,62% net</strong></li>
                  <li>• Primopierre AV : TDVM 4,44%, fiscalité PS 17,2% = <strong>3,68% net</strong></li>
                  <li>• ✅ <strong>L'AV gagne de 1,06 point</strong> (économie 3 180 €/an pour 30k€) + avantages succession</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Horizon de placement : 12-15 ans minimum</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Les SCPI résidentielles allemandes nécessitent un <strong>horizon plus long que les SCPI tertiaires</strong> pour compenser le rendement plus faible et amortir les frais de souscription (10-12%).
            </p>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">💰 Simulation Primopierre 30 000 € en direct (TMI 11%)</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">10 ans</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Capital final : 41 500 €</li>
                    <li>• Revenus nets : 11 850 €</li>
                    <li>• Gain total : +23 350 € (+78%)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">15 ans</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Capital final : 49 800 €</li>
                    <li>• Revenus nets : 17 775 €</li>
                    <li>• Gain total : +37 575 € (+125%)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-green-900 dark:text-green-200">20 ans ✅</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Capital final : 59 700 €</li>
                    <li>• Revenus nets : 23 700 €</li>
                    <li>• Gain total : +53 400 € (+178%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Ne JAMAIS investir 100% en résidentiel</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Le résidentiel doit rester <strong>minoritaire (10-15% max)</strong> dans un portefeuille SCPI équilibré. Un portefeuille 100% résidentiel vous fait perdre 1-2 points de rendement annuel vs un mix tertiaire.
            </p>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">⚖️ Comparatif 30 000 € sur 20 ans</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold text-red-900 dark:text-red-200 mb-2">❌ 100% résidentiel (Primopierre)</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• TDVM moyen : 4,44%</li>
                    <li>• Gain total 20 ans : +53 400 €</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-green-900 dark:text-green-200 mb-2">✅ Mix équilibré tertiaire</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• TDVM moyen : 5,50%</li>
                    <li>• Gain total 20 ans : +69 600 €</li>
                    <li>• <strong>Surperformance : +16 200 € (+30%)</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
        <h2 className="text-3xl font-bold mb-4">Conclusion : SCPI résidentielles : investir dans le logement locatif via les SCPI</h2>
        <div className="space-y-4 text-lg text-blue-50">
          <p>
            En conclusion, scpi résidentielles nécessite une analyse approfondie de votre situation : TMI, horizon d'investissement, objectifs patrimoniaux et appétence au risque.
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

export default ScpiResidentiellesLogementLocatifScpiHabitationArticle;
