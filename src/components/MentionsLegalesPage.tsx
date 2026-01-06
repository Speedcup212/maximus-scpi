import React from 'react';
import { FileText, User, Shield, Server } from 'lucide-react';

const MentionsLegalesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mentions légales
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Informations légales du site MaximusSCPI
          </p>
        </div>

        {/* Éditeur du site */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Éditeur du site
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              <strong>MaximusSCPI</strong><br />
              Représenté par Eric Bellaiche<br />
              Conseiller en Gestion de Patrimoine Certifié<br />
              CIF n°D016571
            </p>
          </div>
        </div>

        {/* Hébergement */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-600" />
            Hébergement
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Site hébergé par Netlify<br />
              2325 3rd Street, Suite 296<br />
              San Francisco, CA 94107, USA
            </p>
          </div>
        </div>

        {/* Responsabilité */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Responsabilité
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Les informations présentes sur ce site sont fournies à titre indicatif.
              Elles ne constituent pas un conseil en investissement personnalisé.
              Tout investissement présente des risques de perte en capital.
            </p>
          </div>
        </div>

        {/* Propriété intellectuelle */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            Propriété intellectuelle
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Le contenu de ce site (textes, images, graphiques) est protégé par le droit d'auteur.
              Toute reproduction sans autorisation est interdite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
