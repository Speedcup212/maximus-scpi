import React from 'react';
import { Shield, FileText, Lock, Eye, AlertCircle, CheckCircle } from 'lucide-react';

const ConditionsUtilisationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Informations réglementaires et conditions générales d'utilisation
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            En application des différentes législations auxquelles nos activités sont soumises, nous vous prions de
            trouver ci-après les informations réglementaires qui régiront l'ensemble de nos relations contractuelles.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mt-4">
            <p className="text-gray-700">
              <strong>Eric Bellaiche</strong> est susceptible de fournir des conseils en investissement de manière
              <strong> non indépendante</strong>. Dans le cadre d'une prestation de conseil fournie à titre non indépendant
              et conformément à la réglementation qui lui est applicable, Eric Bellaiche peut percevoir des rémunérations,
              commissions ou avantages monétaires ou non monétaires en rapport avec la fourniture de la prestation de conseil.
            </p>
          </div>
        </div>

        {/* Statuts légaux */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            Statuts légaux et autorités de tutelle
          </h2>

          <div className="space-y-6">
            {/* ORIAS */}
            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enregistrement ORIAS</h3>
              <p className="text-gray-700 mb-3">
                Eric Bellaiche est enregistré au Registre Unique des intermédiaires en assurance, banque et finance
                auprès de l'ORIAS sous le numéro d'immatriculation <strong>13001580</strong>.
              </p>
              <a
                href="https://www.orias.fr/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline font-medium"
              >
                Vérifier cette immatriculation sur www.orias.fr
              </a>
            </div>

            {/* Activités réglementées */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Activités réglementées :</h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Conseiller en Investissements Financiers (CIF)</h4>
                    <p className="text-sm text-gray-600">Membre de la CNCEF PATRIMOINE N° D016571</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Courtier d'assurance ou de réassurance (COA)</h4>
                    <p className="text-sm text-gray-600">Sous le contrôle de l'ACPR</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Mandataire IOBSP</h4>
                    <p className="text-sm text-gray-600">Intermédiaire en opérations de banque et services de paiement</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Agent commercial en Transaction Immobilière</h4>
                    <p className="text-sm text-gray-600">Sans maniement de fonds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Consultant en Gestion de Projets Immobiliers</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Informations légales
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Nom-Prénom :</strong> Bellaiche Eric</p>
              <p><strong>Dénomination sociale :</strong> Eric Bellaiche</p>
              <p><strong>Forme sociale :</strong> Entreprise individuelle</p>
              <p><strong>RCS :</strong> Grenoble</p>
            </div>
            <div className="space-y-2">
              <p><strong>SIREN :</strong> 441861135</p>
              <p><strong>Code APE (NAF) :</strong> 6619B</p>
              <p><strong>Téléphone :</strong> 06 52 56 56 54</p>
              <p><strong>Email :</strong> eric.bellaiche@gmail.com</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Adresse :</strong> 1020, route de Saint-Jean, M1, 38500 Coublevie
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Site internet :</strong>{' '}
              <a href="https://eric-bellaiche.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                https://eric-bellaiche.fr/
              </a>
            </p>
          </div>
        </div>

        {/* Responsabilité civile professionnelle */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Responsabilité civile professionnelle
          </h2>
          <p className="text-gray-700 mb-4">
            Eric Bellaiche dispose, conformément à la loi et aux codes de bonne conduite de la CNCEF, d'une
            couverture en Responsabilité Civile Professionnelle et d'une Garantie Financière suffisantes couvrant
            ses diverses activités.
          </p>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-700"><strong>Assureur :</strong> Matrisk Assurance</p>
            <p className="text-gray-700"><strong>Police :</strong> MRCSFGP202305FR00000000050302A00</p>
            <p className="text-gray-700"><strong>Adresse :</strong> 22, rue de la maison Rouge – 77185 Lognes</p>
          </div>
        </div>

        {/* RGPD */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-green-600" />
            Protection des données personnelles (RGPD)
          </h2>

          <p className="text-gray-700 mb-6">
            Dans le cadre de ses prestations, Eric Bellaiche est susceptible de procéder au traitement de données
            personnelles. En application du Règlement 2016/679 (RGPD) et de la loi n° 78-17 du 6 janvier 1978,
            nous nous engageons à :
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Ne collecter et traiter les données que pour des finalités convenues</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Préserver leur sécurité et intégrité</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">Ne communiquer ces informations qu'aux tiers nécessaires</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Vos droits :</h3>
            <p className="text-sm text-gray-700 mb-2">
              Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et de limitation
              du traitement de vos données personnelles.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Contact CNIL :</strong> 3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07
            </p>
          </div>
        </div>

        {/* Moyens de communication */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            Moyens de communication
          </h2>

          <p className="text-gray-700 mb-4">
            Les modes de communication utilisés entre Eric Bellaiche et le client sont :
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Réunions physiques</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Réunions à distance</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Envois de courriels</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Téléphone</p>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Avertissement important</h3>
              <p className="text-gray-700 text-sm">
                Tout investissement présente des risques de perte en capital. Les performances passées ne préjugent
                pas des performances futures. Il est recommandé de consulter un conseiller en gestion de patrimoine
                agréé avant tout investissement.
              </p>
            </div>
          </div>
        </div>

        {/* Documents téléchargeables */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Documents disponibles
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('/CGU.pdf', '_blank')}
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 transition-colors"
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-900">Conditions Générales d'Utilisation</span>
            </button>
            <button
              onClick={() => window.open('/mentions-legales-maximusscpi.pdf', '_blank')}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 transition-colors"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-900">Mentions Légales</span>
            </button>
            <button
              onClick={() => window.open('/politique-confidentialite.pdf', '_blank')}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 transition-colors"
            >
              <Lock className="w-6 h-6 text-green-600" />
              <span className="font-medium text-gray-900">Politique de Confidentialité</span>
            </button>
            <button
              onClick={() => window.open('/politique-durabilite.pdf', '_blank')}
              className="flex items-center gap-3 p-4 bg-teal-50 hover:bg-teal-100 rounded-lg border-2 border-teal-200 transition-colors"
            >
              <Shield className="w-6 h-6 text-teal-600" />
              <span className="font-medium text-gray-900">Politique de Durabilité</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionsUtilisationPage;
