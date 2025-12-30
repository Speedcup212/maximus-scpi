import React from 'react';
import { Mail, MapPin, Phone, AlertCircle, FileText, Scale } from 'lucide-react';

const ReclamationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Réclamations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vous avez une réclamation à formuler ? Nous nous engageons à la traiter dans les meilleurs délais
          </p>
        </div>

        {/* Modalités de saisine */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Modalités de saisine
          </h2>

          <p className="text-gray-700 mb-6">
            Pour toute réclamation, vous devez vous adresser préalablement à Eric Bellaiche afin de trouver une solution amiable.
            La réclamation doit être effectuée sur support durable et adressée à :
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Email */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Par email</h3>
              </div>
              <a
                href="mailto:eric.bellaiche@gmail.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                eric.bellaiche@gmail.com
              </a>
            </div>

            {/* Courrier */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Par courrier</h3>
              </div>
              <p className="text-gray-700">
                1020, route de Saint-Jean, M1<br />
                38500 Coublevie
              </p>
            </div>
          </div>
        </div>

        {/* Traitement des réclamations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Traitement des réclamations
          </h2>

          <div className="space-y-4 mb-6">
            <p className="text-gray-700">
              Eric Bellaiche s'engage à traiter votre réclamation dans les délais suivants :
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Accusé de réception</h4>
                    <p className="text-gray-700">
                      <strong>Dix jours ouvrables maximum</strong> à compter de la date d'envoi de la réclamation,
                      sauf si la réponse elle-même est apportée au client dans ce délai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Réponse définitive</h4>
                    <p className="text-gray-700">
                      <strong>Deux mois maximum</strong> entre la date d'envoi de la réclamation et la date d'envoi
                      de la réponse au client, sauf survenance de circonstances particulières dûment justifiées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 italic">
            Conformément à l'article 325-23 du RGAMF et l'Instruction AMF n° 2012-07 du 13/07/2012
          </p>
        </div>

        {/* Médiation */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Scale className="w-6 h-6 text-purple-600" />
            Médiation de la consommation
          </h2>

          <p className="text-gray-700 mb-6">
            Si la réponse apportée à votre réclamation ne vous apparaît pas satisfaisante, vous pouvez saisir
            le médiateur de la consommation compétent suivant :
          </p>

          {/* Médiateur CIF */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Au titre de l'activité de Conseiller en Investissements Financiers
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">Le Médiateur</p>
              <p>Autorité des marchés financiers</p>
              <p>17, place de la Bourse</p>
              <p className="font-semibold">75082 PARIS CEDEX 02</p>
            </div>
          </div>

          {/* Médiateur autres activités */}
          <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Au titre des autres activités (immobilier, assurance, financement, gestion de projet)
            </h3>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">Le Médiateur</p>
              <p>CNPM - MÉDIATION DE LA CONSOMMATION</p>

              <div className="mt-4 space-y-2">
                <p className="font-medium">En cas de litige, vous pouvez déposer votre réclamation :</p>
                <div className="bg-white rounded-lg p-4 border border-indigo-300">
                  <p className="mb-2">
                    <span className="font-semibold">En ligne :</span>{' '}
                    <a
                      href="http://cnpm-mediation-consommation.eu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      cnpm-mediation-consommation.eu
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold">Par courrier :</span><br />
                    CNPM - MÉDIATION - CONSOMMATION<br />
                    27, Avenue de la Libération<br />
                    <span className="font-semibold">42400 SAINT CHAMOND</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Information importante</h3>
              <p className="text-gray-700 text-sm">
                Le recours à un médiateur de la consommation est gratuit et ne peut être exercé qu'après avoir
                préalablement saisi Eric Bellaiche par écrit et en cas d'absence de réponse satisfaisante dans
                un délai de deux mois.
              </p>
            </div>
          </div>
        </div>

        {/* Coordonnées de contact */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-600" />
            Coordonnées du conseiller
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Eric Bellaiche</strong></p>
            <p>Conseiller en Investissement Financier</p>
            <p>ORIAS : 13001580</p>
            <p>Téléphone : 06 52 56 56 54</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReclamationPage;
