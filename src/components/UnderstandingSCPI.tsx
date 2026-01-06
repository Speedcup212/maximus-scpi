import React, { useState } from 'react';
import {
  Building2, TrendingUp, Euro, Users, FileText, CheckCircle, ChevronDown, ChevronUp,
  Clock, Shield, Calculator, Briefcase, Home, Store, Cross, Warehouse,
  BadgeCheck, AlertCircle, LineChart, PiggyBank, Receipt, Scale
} from 'lucide-react';

const UnderstandingSCPI: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <Euro className="w-6 h-6" />,
      title: "Revenus réguliers",
      description: "Percevez des loyers mensuels ou trimestriels issus d'un parc immobilier professionnel diversifié",
      detail: "Distribution moyenne de 4 à 6% par an"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestion déléguée",
      description: "Aucune gestion locative, tout est pris en charge par la société de gestion",
      detail: "Zéro contrainte administrative"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Diversification",
      description: "Investissez dans des centaines d'immeubles sans gérer de bien en direct",
      detail: "Réduction des risques locatifs"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Accessibilité",
      description: "Investissement possible dès quelques centaines d'euros",
      detail: "À partir de 200€"
    }
  ];

  const howItWorks = [
    {
      number: "1",
      title: "Vous investissez",
      description: "Achetez des parts de SCPI selon votre budget et vos objectifs",
      details: ["Montant minimum : 200€ à 1000€", "Possibilité de crédit bancaire", "Investissement progressif possible"]
    },
    {
      number: "2",
      title: "La SCPI achète",
      description: "Elle acquiert et gère des immeubles professionnels (bureaux, commerces, santé...)",
      details: ["Sélection rigoureuse des actifs", "Négociation des baux", "Gestion locative complète"]
    },
    {
      number: "3",
      title: "Vous percevez",
      description: "Recevez des loyers mensuels ou trimestriels proportionnels à vos parts",
      details: ["Versements mensuels ou trimestriels", "Imposés comme revenus fonciers", "Potentiel de revalorisation"]
    }
  ];

  const investmentMethods = [
    {
      icon: <Calculator className="w-8 h-8" />,
      method: "Comptant",
      description: "Achat direct de parts avec vos fonds propres",
      pros: ["Pas d'intérêts à payer", "Rendement immédiat", "Gestion simple"],
      ideal: "Pour les épargnants disposant de liquidités"
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      method: "À crédit",
      description: "Financement bancaire pour optimiser l'effet de levier",
      pros: ["Déduction des intérêts", "Effet de levier", "Préservation de la trésorerie"],
      ideal: "Pour les investisseurs souhaitant maximiser leur patrimoine"
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      method: "Démembrement",
      description: "Séparation de la nue-propriété et de l'usufruit",
      pros: ["Optimisation fiscale", "Prix d'achat réduit", "Récupération de la pleine propriété"],
      ideal: "Pour optimiser la fiscalité et préparer la transmission"
    },
    {
      icon: <Scale className="w-8 h-8" />,
      method: "Assurance-vie",
      description: "Investissement via un contrat d'assurance-vie",
      pros: ["Fiscalité avantageuse après 8 ans", "Transmission optimisée", "Liquidité supérieure"],
      ideal: "Pour les investisseurs privilégiant la fiscalité"
    }
  ];

  const assetTypes = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      type: "Bureaux",
      percentage: "45%",
      description: "Immeubles de bureaux en zones premium",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Store className="w-6 h-6" />,
      type: "Commerces",
      percentage: "25%",
      description: "Murs de boutiques et centres commerciaux",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <Cross className="w-6 h-6" />,
      type: "Santé",
      percentage: "15%",
      description: "Établissements médicaux et EHPAD",
      color: "from-red-600 to-orange-600"
    },
    {
      icon: <Warehouse className="w-6 h-6" />,
      type: "Logistique",
      percentage: "10%",
      description: "Entrepôts et plateformes logistiques",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <Home className="w-6 h-6" />,
      type: "Résidentiel",
      percentage: "5%",
      description: "Résidences étudiantes et seniors",
      color: "from-orange-600 to-yellow-600"
    }
  ];

  const faqs = [
    {
      question: "Qu'est-ce qu'une SCPI exactement ?",
      answer: "Une SCPI (Société Civile de Placement Immobilier) est un placement collectif qui permet d'investir dans l'immobilier professionnel sans les contraintes de la gestion locative. En achetant des parts, vous devenez co-propriétaire d'un patrimoine immobilier diversifié géré par des professionnels. C'est l'équivalent d'un fonds d'investissement, mais dédié à l'immobilier d'entreprise."
    },
    {
      question: "Quels sont les rendements moyens des SCPI ?",
      answer: "Les SCPI de rendement offrent en moyenne entre 4% et 6% de rendement annuel brut. Ce taux varie selon le type de SCPI (bureaux, commerces, santé...) et sa stratégie d'investissement. Par exemple, les SCPI de bureaux en Île-de-France ont historiquement délivré des rendements autour de 4,5%, tandis que certaines SCPI diversifiées peuvent atteindre 5,5% à 6%. Les performances passées ne présagent pas des performances futures."
    },
    {
      question: "Mon capital est-il garanti dans une SCPI ?",
      answer: "Non, comme tout investissement immobilier, les SCPI comportent des risques. La valeur des parts peut fluctuer à la hausse comme à la baisse selon l'évolution du marché immobilier. Les revenus peuvent également varier en fonction du taux d'occupation des biens et de la conjoncture économique. C'est pourquoi nous recommandons de diversifier votre investissement sur plusieurs SCPI et de considérer cet investissement sur le long terme (8-10 ans minimum) pour lisser les variations du marché."
    },
    {
      question: "Combien faut-il investir au minimum dans une SCPI ?",
      answer: "L'investissement minimum varie selon les SCPI, généralement entre 200€ et 1000€ par part. Le prix moyen d'une part de SCPI se situe autour de 200€ à 1000€. Avec MaximusSCPI, nous vous aidons à construire un portefeuille diversifié adapté à votre budget, même avec un capital de départ de 5000€ à 10000€. Il est possible d'investir progressivement pour étaler votre investissement dans le temps."
    },
    {
      question: "Quelle est la fiscalité applicable aux revenus de SCPI ?",
      answer: "Les revenus des SCPI sont imposés dans la catégorie des revenus fonciers et soumis aux prélèvements sociaux (17,2%). Vous avez deux options : le régime micro-foncier (abattement de 30% si revenus < 15000€) ou le régime réel (déduction des charges réelles). Pour optimiser la fiscalité, plusieurs solutions existent : investir via une assurance-vie, opter pour le démembrement temporaire, ou utiliser le crédit (intérêts déductibles). MaximusSCPI vous conseille sur la meilleure stratégie selon votre situation."
    },
    {
      question: "Quelle est la durée de placement recommandée ?",
      answer: "La durée de placement recommandée pour une SCPI est de 8 à 10 ans minimum. Cette durée permet de lisser les fluctuations du marché immobilier et de bénéficier pleinement du potentiel de revalorisation des parts. Sur le long terme, l'immobilier professionnel a historiquement démontré sa capacité à préserver le capital et générer des revenus réguliers. Une sortie anticipée peut entraîner des frais et une moins-value si le marché est défavorable."
    },
    {
      question: "Comment revendre mes parts de SCPI ?",
      answer: "Pour les SCPI à capital variable, vous pouvez revendre vos parts à la société de gestion au prix de retrait (généralement le prix de souscription moins des frais). Pour les SCPI à capital fixe, la revente s'effectue sur le marché secondaire, via un bulletin de cession. Le délai de revente peut varier de quelques semaines à plusieurs mois selon la liquidité de la SCPI. Certaines SCPI proposent un service de contrepartie pour faciliter les transactions."
    },
    {
      question: "Quels sont les frais associés aux SCPI ?",
      answer: "Les SCPI comportent plusieurs types de frais : les frais de souscription (0% à 10% HT en moyenne), les frais de gestion annuels (environ 10% à 15% HT des loyers collectés), et d'éventuels frais de cession lors de la revente (généralement 5%). Ces frais sont déjà intégrés dans le calcul du rendement net. Chez MaximusSCPI, nous vous orientons vers les SCPI offrant le meilleur rapport rendement/frais et notre accompagnement est totalement gratuit pour vous."
    },
    {
      question: "Peut-on investir en SCPI avec un crédit immobilier ?",
      answer: "Oui, il est tout à fait possible d'investir en SCPI à crédit. Cette solution présente plusieurs avantages : effet de levier sur votre investissement, déductibilité des intérêts d'emprunt de vos revenus fonciers, et préservation de votre épargne. Les banques financent généralement jusqu'à 100% de l'investissement. Le crédit permet d'amplifier les rendements mais augmente aussi les risques. MaximusSCPI vous aide à simuler différents scénarios pour trouver la solution optimale."
    },
    {
      question: "Les SCPI sont-elles adaptées à la préparation de la retraite ?",
      answer: "Oui, les SCPI sont particulièrement adaptées à la préparation de la retraite. Elles offrent des revenus complémentaires réguliers et prévisibles, essentiels pour maintenir son niveau de vie. La revalorisation progressive des parts protège contre l'inflation. Pour optimiser votre stratégie retraite, nous recommandons de commencer tôt (10-15 ans avant la retraite), de diversifier sur plusieurs SCPI, et d'envisager le démembrement temporaire pour réduire la fiscalité pendant la phase d'acquisition."
    }
  ];

  const scpiTypes = [
    {
      type: "SCPI de rendement",
      icon: <Euro className="w-10 h-10" />,
      description: "Génèrent des revenus réguliers via des loyers d'immeubles professionnels",
      example: "Bureaux, commerces, logistique, santé",
      return: "4% à 6% par an",
      risk: "Modéré",
      duration: "8-10 ans minimum"
    },
    {
      type: "SCPI fiscales",
      icon: <Receipt className="w-10 h-10" />,
      description: "Offrent des avantages fiscaux grâce aux dispositifs Malraux, Déficit foncier, Monuments historiques",
      example: "Immobilier ancien réhabilité et patrimonial",
      return: "Réduction d'impôts + revenus",
      risk: "Modéré à élevé",
      duration: "9 à 15 ans (engagement fiscal)"
    },
    {
      type: "SCPI de plus-value",
      icon: <TrendingUp className="w-10 h-10" />,
      description: "Visent la valorisation du capital à long terme via l'immobilier en développement",
      example: "Immobilier en restructuration, marchés émergents",
      return: "Valorisation du capital",
      risk: "Élevé",
      duration: "10-15 ans minimum"
    }
  ];

  const advantages = [
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Diversification géographique",
      description: "Investissez dans toute la France et en Europe"
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Mutualisation des risques",
      description: "Des centaines de locataires répartis sur de nombreux biens"
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Expertise professionnelle",
      description: "Gestion par des équipes spécialisées en immobilier d'entreprise"
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Transparence totale",
      description: "Rapports trimestriels et valorisation régulière du patrimoine"
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Protection contre l'inflation",
      description: "Indexation des loyers et revalorisation progressive des parts"
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-green-600" />,
      title: "Transmission facilitée",
      description: "Parts facilement transmissibles aux héritiers"
    }
  ];

  const risks = [
    {
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      title: "Risque de marché",
      description: "La valeur des parts peut fluctuer selon les conditions du marché immobilier"
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      title: "Liquidité limitée",
      description: "Revente des parts possible mais délai variable selon les SCPI"
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      title: "Vacance locative",
      description: "Les revenus peuvent diminuer si le taux d'occupation baisse"
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      title: "Frais d'entrée",
      description: "Frais de souscription importants (8% à 12% en moyenne)"
    }
  ];

  const keyNumbers = [
    { number: "225", label: "SCPI en France", sublabel: "Actives sur le marché" },
    { number: "90 Mds€", label: "Actifs gérés", sublabel: "Patrimoine total" },
    { number: "8000-10000", label: "Immeubles", sublabel: "Détenus par les SCPI" },
    { number: "4,5%", label: "Rendement moyen", sublabel: "Sur 10 ans" }
  ];

  return (
    <section id="comprendre-scpi" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Comprendre les SCPI
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Guide complet pour investir dans l'immobilier professionnel simplement,
            sans les contraintes de gestion locative
          </p>
        </div>

        {/* Key Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {keyNumbers.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* What is SCPI */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                L'immobilier professionnel accessible à tous
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Une SCPI mutualise l'épargne de milliers d'investisseurs pour constituer
                et gérer un patrimoine immobilier professionnel diversifié. Vous achetez des parts et
                percevez des revenus proportionnels sans vous occuper de la gestion.
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-900 dark:text-blue-300 font-semibold flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>225 SCPI gèrent 90 milliards d'euros d'actifs en France</span>
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-green-900 dark:text-green-300 font-semibold flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>Entre 8000 et 10000 immeubles détenus par les +225 SCPI</span>
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-purple-900 dark:text-purple-300 font-semibold flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>Rendement moyen de 4,5% sur les 10 dernières années</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {benefit.description}
                    </p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {benefit.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Comment ça fonctionne ?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 h-full hover:shadow-2xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg">
                    {step.number}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronDown className="w-8 h-8 text-blue-600 rotate-[-90deg]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asset Types */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200 dark:border-gray-700">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Les types d'actifs immobiliers
          </h3>
          <div className="grid md:grid-cols-5 gap-6">
            {assetTypes.map((asset, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br ${asset.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {asset.icon}
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  {asset.percentage}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  {asset.type}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {asset.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Methods */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Les différentes façons d'investir
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {investmentMethods.map((method, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {method.method}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {method.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {method.pros.map((pro, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold">
                    <span className="font-black">Idéal pour :</span> {method.ideal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Types of SCPI */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl p-8 md:p-12 mb-12 text-white">
          <h3 className="text-3xl font-bold text-center mb-10">
            Les 3 grandes catégories de SCPI
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {scpiTypes.map((type, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex justify-center mb-4">
                  {type.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-center">{type.type}</h4>
                <p className="mb-4 text-emerald-50 leading-relaxed">{type.description}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-emerald-100"><span className="font-bold">Exemple :</span> {type.example}</p>
                  <p className="text-emerald-100"><span className="font-bold">Rendement :</span> {type.return}</p>
                  <p className="text-emerald-100"><span className="font-bold">Risque :</span> {type.risk}</p>
                  <p className="text-emerald-100"><span className="font-bold">Durée :</span> {type.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200 dark:border-gray-700">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Les avantages des SCPI
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0">{advantage.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {advantage.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-orange-200 dark:border-gray-600">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Les risques à connaître
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {risks.map((risk, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">{risk.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      {risk.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {risk.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-orange-100 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-300 dark:border-orange-800">
            <p className="text-orange-900 dark:text-orange-300 font-semibold flex items-start gap-3">
              <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
              <span>
                MaximusSCPI vous aide à sélectionner les SCPI les plus performantes et les mieux gérées pour minimiser ces risques et optimiser votre investissement.
              </span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-black mb-4">
            Prêt à investir en SCPI ?
          </h3>
          <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
            MaximusSCPI analyse les 51 SCPI du marché pour vous proposer le portefeuille optimal
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-left bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <LineChart className="w-5 h-5" />
              <span className="font-bold text-sm">Analyse gratuite en 2 min</span>
            </div>
            <div className="flex items-center gap-2 text-left bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <Shield className="w-5 h-5" />
              <span className="font-bold text-sm">0% de frais pour vous</span>
            </div>
            <div className="flex items-center gap-2 text-left bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-sm">Accompagnement expert</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default UnderstandingSCPI;
