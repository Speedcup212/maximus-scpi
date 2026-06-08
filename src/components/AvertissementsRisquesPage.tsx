import React from 'react';
import { AlertTriangle, XCircle, TrendingDown, Clock, DollarSign, FileText } from 'lucide-react';
import SchemaOrg, { generateBreadcrumbs } from './SchemaOrg';
import Breadcrumb from './Breadcrumb';

interface AvertissementsRisquesPageProps {
  onNavigate?: (path: string) => void;
}

const AvertissementsRisquesPage: React.FC<AvertissementsRisquesPageProps> = ({ onNavigate }) => {
  const breadcrumbs = generateBreadcrumbs('/avertissements-risques-scpi');
  const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <SchemaOrg type="BreadcrumbList" data={{ items: breadcrumbs }} />
      <SchemaOrg
        type="Article"
        data={{
          title: "Risques SCPI : Avertissements Officiels AMF | MaximusSCPI",
          description: "Capital non garanti. Liquidité limitée. Performances passées ≠ futures. Horizon 8-10 ans. Lire avant investir.",
          datePublished: "2025-01-15",
          dateModified: currentDate,
          url: "/avertissements-risques-scpi"
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          📅 Dernière mise à jour : {currentDate}
        </div>

        <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Avertissements et Risques SCPI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                À Lire Obligatoirement Avant d'Investir
              </p>
            </div>
          </div>

          <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-6 mb-8 border-l-4 border-red-600">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              ⚠️ AVERTISSEMENT AMF (Autorité des Marchés Financiers)
            </h2>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
              Les SCPI constituent des <strong>investissements immobiliers dont la liquidité est limitée</strong>. 
              Le <strong>capital investi n'est pas garanti</strong>. Les <strong>performances passées ne préjugent 
              pas des performances futures</strong>. Investissement recommandé sur un <strong>horizon minimum de 8 à 10 ans</strong>.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              Source : AMF - Recommandations investisseurs SCPI
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Les 6 Risques Principaux des SCPI</h2>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-l-4 border-red-600">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 1 : Liquidité Limitée (CRITIQUE)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      <strong>Délai de revente :</strong> 6 à 24 mois selon la SCPI et les conditions de marché.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Exemple réel (63 SCPI MaximusSCPI) :</strong>
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• 70,6% des SCPI : écart prix/valeur retrait = frais de souscription normaux (8-12%)</li>
                        <li>• 25,5% des SCPI : perte moyenne -14,20% au-delà des frais</li>
                        <li>• Cas extrême : Edissimo -53% (achat 338€, revente 158€)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Recommandation :</strong> Ne jamais investir en SCPI si vous pourriez avoir besoin de liquidités à court terme (moins de 8 ans).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-l-4 border-orange-600">
                <div className="flex items-start gap-4">
                  <XCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 2 : Capital Non Garanti
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Le prix de la part de SCPI peut <strong>baisser</strong> en cas de crise immobilière ou de dépréciation des actifs.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Exemple historique :</strong>
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Crise 2008-2009 : certaines SCPI ont perdu 10-15% de leur valeur</li>
                        <li>• COVID-2020 : SCPI commerces -5% à -10% (centres commerciaux)</li>
                        <li>• Télétravail 2020-2025 : SCPI bureaux Paris stabilité mais risque futur</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Recommandation :</strong> Diversifier entre plusieurs SCPI (3-5) et secteurs différents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border-l-4 border-yellow-600">
                <div className="flex items-start gap-4">
                  <TrendingDown className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 3 : Vacance Locative (Baisse Dividendes)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Si le <strong>Taux d'Occupation Financier (TOF)</strong> baisse, les dividendes diminuent.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Impact sur les dividendes :</strong>
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• TOF 95% : dividendes normaux (ex: 6% TDVM)</li>
                        <li>• TOF 85% : dividendes -10% (ex: 5,4% TDVM)</li>
                        <li>• TOF 75% : dividendes -20% (ex: 4,8% TDVM)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Secteurs à risque :</strong> Commerces (concurrence e-commerce), Bureaux (télétravail)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-l-4 border-purple-600">
                <div className="flex items-start gap-4">
                  <DollarSign className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 4 : Fiscalité (Revenus Fonciers IR)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Les dividendes SCPI sont imposés comme des <strong>revenus fonciers</strong> à votre TMI + 17,2% de prélèvements sociaux.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Taxation selon TMI :</strong>
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• TMI 11% : taxation totale 28,2% (rendement 6% → net 4,3%)</li>
                        <li>• TMI 30% : taxation totale 47,2% (rendement 6% → net 3,2%)</li>
                        <li>• TMI 41% : taxation totale 58,2% (rendement 6% → net 2,5%)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Optimisation :</strong> Assurance-Vie (PFU 30% après 8 ans) ou PER (déduction fiscale)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-l-4 border-blue-600">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 5 : Frais Élevés
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Les SCPI ont des <strong>frais de souscription</strong> (0-12%) et des <strong>frais de gestion</strong> (8-12% HT/an sur loyers).
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Impact sur 10 ans (exemple 50 000€) :</strong>
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• SCPI 12% frais souscription : -6 000€ immédiatement</li>
                        <li>• Frais gestion 10% HT/an : -15 000€ sur 10 ans</li>
                        <li>• Total frais : -21 000€ (42% du capital investi)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Recommandation :</strong> Privilégier SCPI 0% frais (Alderan, Iroko Zen, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border-l-4 border-gray-600">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-gray-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Risque 6 : Délai de Jouissance (3-6 Mois Sans Dividende)
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      Après l'achat de parts, vous ne percevez <strong>pas de dividende immédiatement</strong>. Délai moyen : 3 à 6 mois.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Exemple :</strong> Achat le 15 mars 2025 → Premier dividende juillet 2025 (4 mois sans revenu)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil Investisseur Adapté</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-4 flex items-center gap-2">
                  ✅ Profil ADAPTÉ aux SCPI
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Horizon placement <strong>8-10 ans minimum</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Diversification patrimoine (max <strong>20-30% en SCPI</strong>)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Revenus stables (crédit SCPI possible)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>TMI 11-41% (optimisation fiscale via AV ou PER)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <span>Acceptation risque modéré (volatilité dividendes)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                  ❌ Profil NON ADAPTÉ aux SCPI
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Besoin liquidité <strong>court terme</strong> (moins de 8 ans)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Aversion <strong>totale</strong> au risque (capital garanti exigé)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Capital garanti requis (préférer <strong>Livret A, fonds euros</strong>)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>100% patrimoine en SCPI (diversification insuffisante)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Incompréhension des risques immobiliers</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-6 border-l-4 border-red-600">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
              ⚠️ AVERTISSEMENT FINAL
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
              <strong>Avant d'investir en SCPI, vous devez :</strong>
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>1. Lire attentivement cette page d'avertissements</li>
              <li>2. Consulter notre <a href="/methodologie-donnees-scpi" className="text-red-600 hover:underline">méthodologie de données</a></li>
              <li>3. Vérifier votre profil investisseur (horizon, TMI, objectifs)</li>
              <li>4. Diversifier entre plusieurs SCPI (3-5 minimum)</li>
              <li>5. Ne jamais investir plus de 20-30% de votre patrimoine en SCPI</li>
            </ul>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-4">
              <strong>MaximusSCPI décline toute responsabilité</strong> en cas de perte en capital. Les SCPI sont des investissements risqués. Consultez un conseiller CIF avant toute décision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvertissementsRisquesPage;
