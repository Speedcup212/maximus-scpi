import React from 'react';
import { Shield, Zap, Award, BarChart3, TrendingUp, Users, Check, Star, Heart, Target, Lightbulb, Phone, Mail, Clock, Calendar, BadgeCheck, BookOpen, Headphones as HeadphonesIcon, FileCheck, Sparkles, Globe, Lock, Briefcase } from 'lucide-react';
import ResponsiveImage from './ResponsiveImage';

const WhyChooseUs: React.FC = () => {
  const mainFeatures = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Outils d'analyse avancés",
      description: "Comparez les 51 SCPI du marché avec nos tableaux interactifs, filtres intelligents et analyses détaillées. Simulez votre investissement en temps réel.",
      color: "from-blue-600 to-cyan-600",
      details: ["Comparateur en temps réel", "Filtres intelligents", "Simulateur IA", "Rapports détaillés"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "0% d'honoraires pour vous",
      description: "Notre expertise et accompagnement sont entièrement gratuits. Nous sommes rémunérés uniquement par les sociétés de gestion de SCPI, jamais par nos clients.",
      color: "from-green-600 to-emerald-600",
      details: ["Conseils gratuits", "Analyses gratuites", "Suivi gratuit", "Sans engagement"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "IA haute performance",
      description: "Algorithmes avancés d'intelligence artificielle pour construire un portefeuille SCPI optimisé selon votre profil, vos objectifs et votre tolérance au risque.",
      color: "from-orange-600 to-red-600",
      details: ["Algorithmes avancés", "Optimisation auto", "Rééquilibrage intelligent", "Prédictions fiables"]
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Expertise certifiée",
      description: "15 ans d'expérience d'Éric Bellaiche, conseiller en gestion de patrimoine certifié CNCEF et ORIAS pour sécuriser et maximiser vos investissements.",
      color: "from-cyan-600 to-blue-600",
      details: ["15 ans d'expérience", "Certifications officielles", "Formation continue", "Éthique professionnelle"]
    }
  ];

  const services = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Analyse de votre profil",
      description: "Questionnaire détaillé pour comprendre vos objectifs, votre situation et votre aversion au risque",
      process: "Durée : 5 minutes"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-orange-600" />,
      title: "Recommandations personnalisées",
      description: "Notre IA analyse 51 SCPI et vous propose le portefeuille optimal adapté à votre profil",
      process: "Instantané"
    },
    {
      icon: <FileCheck className="w-8 h-8 text-green-600" />,
      title: "Dossier d'investissement",
      description: "Constitution complète de votre dossier avec toute la documentation nécessaire",
      process: "Sous 48h"
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8 text-purple-600" />,
      title: "Accompagnement continu",
      description: "Suivi régulier de votre sélection et conseils d'optimisation tout au long de votre investissement",
      process: "À vie"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Transparence totale",
      description: "Aucun frais caché, toutes les données sont accessibles et expliquées clairement. Nous publions nos méthodes d'analyse.",
      commitment: "Notre engagement éthique"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Accompagnement humain",
      description: "Un suivi personnalisé à chaque étape de votre projet d'investissement par des conseillers expérimentés.",
      commitment: "Disponibles pour vous"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance optimisée",
      description: "Analyse continue du marché pour vous proposer les meilleures opportunités et optimiser votre rendement.",
      commitment: "Veille quotidienne"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Sécurité & Conformité",
      description: "Respect scrupuleux de la réglementation ACPR et protection totale de vos données personnelles.",
      commitment: "RGPD conforme"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Éducation financière",
      description: "Guides complets, webinaires et ressources pour vous former à l'investissement en SCPI.",
      commitment: "Formation gratuite"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Vision internationale",
      description: "Accès aux SCPI investies en France et en Europe pour une diversification géographique optimale.",
      commitment: "Portée mondiale"
    }
  ];

  const stats = [
    { number: "51", label: "SCPI analysées", sublabel: "Marché complet", icon: <BarChart3 className="w-6 h-6" /> },
    { number: "15 ans", label: "D'expérience", sublabel: "Expertise prouvée", icon: <Award className="w-6 h-6" /> },
    { number: "100%", label: "Gratuit", sublabel: "Pour l'investisseur", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "Disponibilité", sublabel: "Plateforme accessible", icon: <Clock className="w-6 h-6" /> },
    { number: "1000+", label: "Clients satisfaits", sublabel: "Nous font confiance", icon: <Users className="w-6 h-6" /> },
    { number: "4,5%", label: "Rendement moyen", sublabel: "Portefeuilles clients", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  const certifications = [
    {
      name: "ACPR",
      description: "Autorité de Contrôle Prudentiel et de Résolution",
      detail: "Supervision bancaire et financière"
    },
    {
      name: "CNCEF",
      description: "Chambre Nationale des Conseils Experts Financiers",
      number: "N° D016571",
      detail: "Conseiller en Investissements Financiers"
    },
    {
      name: "ORIAS",
      description: "Registre des Intermédiaires en Assurance, Banque et Finance",
      number: "N° 13001580",
      detail: "Courtier en assurances et produits financiers"
    }
  ];

  const expertiseAreas = [
    {
      title: "SCPI de Rendement",
      description: "Bureaux, commerces, santé, logistique",
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      title: "SCPI Fiscales",
      description: "Malraux, Déficit foncier, Monuments historiques",
      icon: <FileCheck className="w-6 h-6" />
    },
    {
      title: "Démembrement",
      description: "Optimisation fiscale avancée",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Crédit SCPI",
      description: "Financement et effet de levier",
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  const methodology = [
    {
      step: "1",
      title: "Analyse approfondie",
      description: "Nous analysons en détail les 51 SCPI du marché : rendement, qualité du patrimoine, taux d'occupation, équipe de gestion, stratégie, risques..."
    },
    {
      step: "2",
      title: "Notation propriétaire",
      description: "Chaque SCPI reçoit une note selon notre méthodologie exclusive basée sur 20 critères quantitatifs et qualitatifs."
    },
    {
      step: "3",
      title: "Diversification optimale",
      description: "Nous construisons des portefeuilles diversifiés par secteur, géographie et type d'actifs pour minimiser les risques."
    },
    {
      step: "4",
      title: "Suivi & ajustements",
      description: "Réévaluation trimestrielle des SCPI et recommandations d'ajustement si nécessaire pour maintenir la performance."
    }
  ];

  const timeline = [
    {
      year: "2009",
      title: "Début de carrière",
      description: "Éric Bellaiche débute comme conseiller en gestion de patrimoine"
    },
    {
      year: "2012",
      title: "Spécialisation SCPI",
      description: "Focus sur l'investissement immobilier professionnel et les SCPI"
    },
    {
      year: "2018",
      title: "Certifications",
      description: "Obtention des certifications CNCEF et ORIAS"
    },
    {
      year: "2023",
      title: "Création MaximusSCPI",
      description: "Lancement de la plateforme pour démocratiser l'accès aux SCPI"
    },
    {
      year: "2024",
      title: "Intégration IA",
      description: "Déploiement d'algorithmes d'IA pour l'optimisation de portefeuilles"
    }
  ];

  return (
    <section id="qui-sommes-nous" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Qui sommes-nous ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            MaximusSCPI est la plateforme de référence pour investir en SCPI
            avec confiance, transparence et performance
          </p>
        </div>

        {/* Expert Section */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-8 md:p-12 mb-16 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-semibold">Expert Certifié depuis 15 ans</span>
              </div>

              <h3 className="text-4xl md:text-5xl font-black mb-6">
                Éric Bellaiche
              </h3>

              <p className="text-2xl font-bold text-blue-100 mb-6">
                Conseiller en Gestion de Patrimoine et en Investissements Financiers
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <p className="text-lg text-white leading-relaxed italic">
                  "J'ai créé MaximusSCPI avec une mission claire : démocratiser l'investissement en SCPI
                  et le rendre accessible à tous. Mon objectif est de vous offrir les outils technologiques
                  et l'expertise humaine nécessaires pour bâtir un patrimoine immobilier performant,
                  diversifié et sécurisé, sans aucun frais pour vous."
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-black text-lg">{cert.name}</div>
                      {cert.number && (
                        <div className="text-sm bg-white/20 px-3 py-1 rounded-full">{cert.number}</div>
                      )}
                    </div>
                    <div className="text-sm text-blue-100 mb-1">{cert.description}</div>
                    <div className="text-xs text-blue-200">{cert.detail}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {expertiseAreas.map((area, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      {area.icon}
                      <span className="font-bold text-sm">{area.title}</span>
                    </div>
                    <p className="text-xs text-blue-100">{area.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative">
                  <img
                    src="/cercle Eric Bellaiche bleu.svg"
                    alt="Éric Bellaiche - Expert SCPI depuis 15 ans"
                    className="w-80 h-80 md:w-96 md:h-96 rounded-full object-cover shadow-2xl"
                    loading="eager"
                    width="384"
                    height="384"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white text-blue-600 rounded-2xl px-6 py-3 shadow-xl border-4 border-blue-600">
                    <div className="text-3xl font-black">15</div>
                    <div className="text-xs font-bold">Ans d'expertise</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Notre parcours
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-cyan-600 hidden md:block"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-blue-600 font-black text-2xl mb-2">{item.year}</div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12 mb-16 border border-gray-200 dark:border-gray-600">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            MaximusSCPI en chiffres
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-3 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Pourquoi choisir MaximusSCPI ?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                <div className="relative p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>

                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h4>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-xl p-8 md:p-12 mb-16 text-white">
          <h3 className="text-3xl font-bold text-center mb-12">
            Notre processus d'accompagnement
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    {service.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 text-center">{service.title}</h4>
                <p className="text-blue-100 leading-relaxed mb-4 text-center">{service.description}</p>
                <div className="text-center">
                  <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                    {service.process}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Notre méthodologie d'analyse
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodology.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center text-xl font-black mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-200 dark:border-gray-700">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Nos valeurs et engagements
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {value.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">{value.commitment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>

          <div className="relative">
            <Sparkles className="w-12 h-12 mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-black mb-4">
              Prêt à investir intelligemment en SCPI ?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Bénéficiez de notre expertise et de notre technologie pour construire
              le portefeuille SCPI optimal, 100% gratuitement
            </p>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold mb-1">Analyse en 2 minutes</div>
                <div className="text-sm text-blue-100">Questionnaire rapide et simple</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold mb-1">100% gratuit</div>
                <div className="text-sm text-blue-100">Aucun frais, aucune commission</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold mb-1">Expert dédié</div>
                <div className="text-sm text-blue-100">Éric Bellaiche et son équipe</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">contact@maximusscpi.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Prise de rendez-vous en ligne</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
