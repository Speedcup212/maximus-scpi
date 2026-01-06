import React from 'react';
import { Target, Users, Award, TrendingUp, Shield, Lightbulb, Heart, Zap, Sparkles, Brain, UserCircle } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Intelligence Artificielle × Expertise Humaine
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
            Qui sommes-nous ?
          </h1>
        </div>

        {/* Main Message - Redesigned */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 md:p-10">
                <div className="space-y-5 text-base md:text-lg text-gray-700 dark:text-gray-300 leading-[1.7]">
                  <p className="text-gray-600 dark:text-gray-400">
                    Pendant trop longtemps, l'investissement en SCPI est resté une <span className="font-semibold text-gray-900 dark:text-white">chasse gardée</span>. Opaque, complexe, inaccessible. Des centaines de produits à comparer, des milliers de données à décrypter, et ce sentiment permanent pour l'investisseur d'être seul face à des choix qui engagent son avenir financier.
                  </p>

                  <div className="py-2">
                    <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white text-center">
                      Chez MaximusSCPI, nous avons décidé de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">changer les règles du jeu</span>.
                    </p>
                  </div>

                  <p>
                    Nous avons créé la <span className="font-semibold text-gray-900 dark:text-white">première plateforme</span> qui fusionne la puissance de l'intelligence artificielle avec l'expertise humaine de <span className="font-semibold text-emerald-600 dark:text-emerald-400">15 années d'expérience</span>.
                  </p>

                  <p>
                    Notre comparateur intelligent analyse en temps réel <span className="font-semibold text-emerald-600 dark:text-emerald-400">51 SCPI</span> sélectionnées selon <span className="font-semibold text-emerald-600 dark:text-emerald-400">35 critères</span> pour vous offrir une clarté absolue.
                  </p>

                  <p>
                    Mais là où l'algorithme s'arrête, <span className="font-semibold text-gray-900 dark:text-white">l'humain prend le relais</span>. Notre fondateur <span className="font-semibold text-teal-600 dark:text-teal-400">Éric Bellaiche</span> et son équipe transforment ces données en stratégie personnalisée, <span className="font-bold text-teal-600 dark:text-teal-400">VOTRE stratégie</span>.
                  </p>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 mt-6 border-l-4 border-emerald-600 dark:border-emerald-400">
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      Nous ne vendons pas des parts de SCPI. <br className="hidden sm:inline"/>
                      Nous vous donnons les clés de votre indépendance financière.
                    </p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    Nous rendons l'excellence accessible, pour que chaque investissement soit une décision éclairée, sereine et performante.
                  </p>

                  <div className="pt-2 text-center">
                    <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      Bienvenue dans la nouvelle ère de l'investissement immobilier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eric Bellaiche Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Photo Section */}
              <div className="relative bg-white dark:bg-gray-800 p-8 md:p-12 flex items-center justify-center">
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-8">
                    <img
                      src="/Eric grande image verticale.svg"
                      alt="Eric Bellaiche - Conseiller en Gestion de Patrimoine"
                      className="w-full h-auto"
                      width={500}
                      height={700}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 self-start">
                  <UserCircle className="w-4 h-4" />
                  Fondateur
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                  Éric Bellaiche
                </h2>

                <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-8">
                  Expert en investissement SCPI & Gestion de patrimoine
                </p>

                <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>
                    Expert reconnu en investissement financier et en SCPI, Éric cumule <span className="font-bold text-gray-900 dark:text-white">plus de 15 ans d'expérience</span> dans le conseil en gestion de patrimoine.
                  </p>

                  <p>
                    Il a accompagné <span className="font-bold text-blue-600">des centaines d'investisseurs</span> dans la construction et la valorisation de leur patrimoine immobilier.
                  </p>

                  <p>
                    Détenteur de plusieurs certifications reconnues en finance et en gestion de patrimoine, Éric a développé une <span className="font-bold text-gray-900 dark:text-white">méthodologie d'analyse exclusive</span> alliant expertise humaine et intelligence artificielle.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mt-6 border border-blue-200 dark:border-blue-800">
                    <p className="font-bold text-gray-900 dark:text-white flex items-start gap-2">
                      <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Sa mission : rendre l'investissement en SCPI plus accessible, transparent et performant pour tous les épargnants français.</span>
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Auteur du livre « Boostez vos réseaux d'affaires: avec l'échelle de Clubinaire », fondateur et ancien président d'un club d'affaires réunissant plus de 40 dirigeants dans l'agglomération de Grenoble.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Approach */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Notre Approche Unique
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Le meilleur des deux mondes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Intelligence Artificielle
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Algorithmes d'IA avancés analysant <span className="font-bold text-blue-600">35 critères</span> quantitatifs et qualitatifs sur <span className="font-bold text-blue-600">51 SCPI</span> sélectionnées. Notre technologie identifie les meilleures opportunités et construit des portefeuilles optimisés selon votre profil.
                </p>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Expertise Humaine
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Notre équipe d'experts en gestion de patrimoine apporte <span className="font-bold text-indigo-600">15 ans d'expérience</span> et son conseil personnalisé. Nous combinons le meilleur de la technologie avec l'intelligence humaine pour vous accompagner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Nos Valeurs
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Transparence
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Information claire et accessible
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Excellence
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyse rigoureuse et expertise
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Innovation
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Technologie au service de la performance
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Accessibilité
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Service gratuit pour tous
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-10 md:p-16 text-center text-white">
              <Zap className="w-12 h-12 mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl md:text-4xl font-black mb-4">
                Rejoignez des milliers d'investisseurs qui nous font confiance
              </h3>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                MaximusSCPI vous accompagne dans la construction d'un patrimoine immobilier diversifié et performant. Commencez dès aujourd'hui votre parcours d'investissement en SCPI.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                  <div className="text-3xl font-black">51</div>
                  <div className="text-sm text-blue-100">SCPI analysées</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                  <div className="text-3xl font-black">35</div>
                  <div className="text-sm text-blue-100">Critères d'analyse</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                  <div className="text-3xl font-black">15+</div>
                  <div className="text-sm text-blue-100">Années d'expertise</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;
