import React from 'react';
import { Shield, Database, Eye, Lock } from 'lucide-react';

const PolitiqueConfidentialitePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Protection de vos données personnelles
          </p>
        </div>

        {/* Collecte des données */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-green-600" />
            Collecte des données
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Nous collectons uniquement les données nécessaires au fonctionnement du service :
              nom, email, téléphone pour les prises de rendez-vous.
            </p>
          </div>
        </div>

        {/* Utilisation des données */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-green-600" />
            Utilisation des données
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Vous contacter suite à une demande de rendez-vous</li>
              <li>Vous envoyer votre analyse SCPI personnalisée</li>
              <li>Améliorer nos services</li>
            </ul>
          </div>
        </div>

        {/* Conservation */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock className="w-6 h-6 text-green-600" />
            Conservation
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Vos données sont conservées pendant 3 ans maximum,
              conformément à la réglementation en vigueur.
            </p>
          </div>
        </div>

        {/* Vos droits */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Vos droits
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Vous disposez d'un droit d'accès, de rectification et de suppression
              de vos données personnelles. Contactez-nous à <a href="mailto:eric.bellaiche@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">eric.bellaiche@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialitePage;
