import React from 'react';
import { Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, FileText } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface MethodologieDonneesPageProps {
  onNavigate?: (path: string) => void;
}

const MethodologieDonneesPage: React.FC<MethodologieDonneesPageProps> = ({ onNavigate }) => {
  const breadcrumbs = generateBreadcrumbs('/methodologie-donnees-scpi');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const faqData = {
    questions: [
      {
        question: "D'où viennent les données SCPI de MaximusSCPI ?",
        answer: "Toutes nos données proviennent de sources officielles : AMF (Autorité des Marchés Financiers), ASPIM (Association SCPI), bulletins trimestriels des sociétés de gestion SCPI, et INSEE pour les données économiques."
      },
      {
        question: "À quelle fréquence les données sont-elles mises à jour ?",
        answer: "Les données SCPI sont actualisées trimestriellement (J+30 après publication des bulletins officiels). Les rendements (TDVM) sont mis à jour mensuellement. Les prix de part sont vérifiés hebdomadairement."
      },
      {
        question: "Comment calculez-vous le TDVM ?",
        answer: "Le TDVM (Taux de Distribution sur Valeur de Marché) est calculé selon la formule : TDVM = (Dividendes annuels / Prix de part) × 100. Exemple : SCPI avec 20,40€ de dividendes et prix de part 300€ = TDVM 6,8%."
      },
      {
        question: "Les données sont-elles vérifiées ?",
        answer: "Oui, toutes les données passent par un process de vérification en 4 étapes : récupération bulletins officiels, contrôle cohérence vs N-1, calculs (TDVM, TOF, TRI), et validation double par 2 personnes."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg type="FAQPage" data={faqData} />
      <SchemaOrg
        type="Article"
        data={{
          title: "Méthodologie Données SCPI : Sources AMF | MaximusSCPI",
          description: "Sources officielles AMF, ASPIM. Mise à jour trimestrielle. Process de vérification transparent. Méthodologie complète MaximusSCPI.",
          datePublished: "2025-01-15",
          dateModified: currentDate,
          url: "/methodologie-donnees-scpi"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📅 Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Database className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Méthodologie MaximusSCPI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                Sources, Vérification et Transparence des Données SCPI
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border-l-4 border-blue-600">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              <strong>MaximusSCPI s'engage à fournir des données SCPI exactes, vérifiables et actualisées.</strong> Cette page détaille nos sources officielles, notre fréquence de mise à jour, notre process de vérification, et les limites de notre analyse. <strong>Transparence totale.</strong>
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Sources Officielles Utilisées
            </h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 rounded-lg p-3 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      1. AMF (Autorité des Marchés Financiers)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      L'AMF est le <strong>régulateur officiel</strong> des SCPI en France. Nous utilisons leurs publications pour vérifier l'agrément des sociétés de gestion et la conformité réglementaire.
                    </p>
                    <a
                      href="https://www.amf-france.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      www.amf-france.org
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 rounded-lg p-3 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      2. ASPIM (Association SCPI)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      L'ASPIM regroupe les sociétés de gestion SCPI et publie des <strong>données de marché consolidées</strong> : capitalisations, collectes, taux d'occupation financier moyens.
                    </p>
                    <a
                      href="https://www.aspim.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      www.aspim.fr
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-600 rounded-lg p-3 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      3. Bulletins Trimestriels SCPI
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Chaque SCPI publie un <strong>bulletin trimestriel officiel</strong> : dividendes distribués, prix de part, TOF, capitalisation, patrimoine immobilier. <strong>Source principale</strong> de nos données.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Liens bulletins disponibles sur <a href="/sources-references" className="text-purple-600 hover:underline">notre page Sources</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-600 rounded-lg p-3 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      4. INSEE (Données Économiques)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      L'INSEE fournit les <strong>données macroéconomiques</strong> : inflation, taux d'intérêt, prix immobilier. Utilisées pour contextualiser les rendements SCPI.
                    </p>
                    <a
                      href="https://www.insee.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      www.insee.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <RefreshCw className="w-7 h-7 text-blue-600" />
              Fréquence de Mise à Jour
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-t-4 border-blue-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Données SCPI</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">Trimestrielle</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Actualisation J+30 après publication des bulletins officiels (fin mars, juin, septembre, décembre)
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-t-4 border-green-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Rendements (TDVM)</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">Mensuelle</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  TDVM recalculé chaque mois si modification prix de part ou dividendes annuels
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-t-4 border-purple-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Prix de Part</h3>
                <p className="text-3xl font-bold text-purple-600 mb-2">Hebdomadaire</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Vérification hebdomadaire des prix de souscription et valeur de retrait
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
              Process de Vérification des Données
            </h2>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                  Récupération des Bulletins Officiels
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-10">
                  Téléchargement manuel des bulletins trimestriels SCPI depuis les sites officiels des sociétés de gestion (format PDF). Archivage systématique pour traçabilité.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-green-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                  Contrôle de Cohérence (vs N-1)
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-10">
                  Comparaison automatique avec les données du trimestre précédent. Alerte si variation anormale (+/- 50% TDVM, TOF {'<'} 80%, capitalisation -20%).
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-purple-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                  Calculs (TDVM, TOF, TRI)
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-10">
                  Recalcul systématique des indicateurs selon formules officielles. Vérification croisée avec données publiées par la société de gestion.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border-l-4 border-orange-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                  Validation Double (2 Personnes)
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-10">
                  Chaque mise à jour est validée par 2 personnes : analyste données + Eric Bellaiche (directeur). Tolérance zéro sur les erreurs de saisie.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Database className="w-7 h-7 text-blue-600" />
              Calculs Réalisés par MaximusSCPI
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">TDVM (Taux de Distribution sur Valeur de Marché)</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">
                    TDVM = (Dividendes annuels / Prix de part) × 100
                  </code>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Exemple :</strong> SCPI Alderan
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>• Dividendes 2024 : 20,40 € / part</li>
                  <li>• Prix de part : 300 €</li>
                  <li>• TDVM = (20,40 / 300) × 100 = <strong>6,8%</strong></li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">TOF (Taux d'Occupation Financier)</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">
                    TOF = (Patrimoine occupé / Patrimoine total) × 100
                  </code>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Indique le % du patrimoine immobilier qui génère des loyers. TOF élevé (95%+) = bonne gestion locative.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">TRI (Taux de Rendement Interne)</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                  <code className="text-sm text-blue-600 dark:text-blue-400">
                    TRI = Rendement global sur 10 ans (dividendes + valorisation capital)
                  </code>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mesure la performance totale : rendement annuel (TDVM) + appréciation du prix de part. TRI {'>'} TDVM si valorisation positive.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-orange-600" />
              Limites et Biais Reconnus
            </h2>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 mb-6 border-l-4 border-orange-600">
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                <strong>MaximusSCPI reconnaît les limites suivantes de son analyse :</strong>
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Performances passées ≠ performances futures.</strong> Un TDVM de 6% en 2024 ne garantit pas 6% en 2025. Les rendements SCPI peuvent varier (vacance locative, crise immobilière).</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Données déclaratives.</strong> Nous utilisons les données publiées par les sociétés de gestion SCPI. Nous ne réalisons pas d'audit indépendant du patrimoine immobilier.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Décalage temporel.</strong> Les bulletins trimestriels sont publiés J+30. Nos données ont donc un décalage de 1 à 3 mois selon la date de consultation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Analyse quantitative.</strong> Notre comparateur se concentre sur les données chiffrées (rendement, TOF, frais). L'analyse qualitative (qualité gestionnaire, stratégie) est abordée mais non exhaustive.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">FAQ : Méthodologie Données SCPI</h2>

            <div className="space-y-4">
              {faqData.questions.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.question}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-600">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <strong>📚 Pour aller plus loin :</strong> Consultez notre <a href="/sources-references" className="text-blue-600 hover:underline">page Sources et Références</a> avec les liens directs vers AMF, ASPIM, et bulletins SCPI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologieDonneesPage;
