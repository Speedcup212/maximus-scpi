import React from 'react';
import { ShieldX, ArrowLeft, UserPlus, LogOut } from 'lucide-react';

interface ExpertAccessRefusedProps {
  onNavigate: (section: string) => void;
}

const ExpertAccessRefused: React.FC<ExpertAccessRefusedProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-5">
            <ShieldX className="w-7 h-7 text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-white mb-3">Accès Expert-Comptable réservé</h1>

          <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed">
            Votre compte est rattaché à l'espace CGP/CIF. L'espace Expert-Comptable est réservé aux
            cabinets d'expertise comptable disposant d'un SIRET vérifié et d'une déclaration
            d'inscription à l'Ordre.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={() => window.location.href = '/pro/dashboard'}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'espace CGP
            </button>
            <button
              onClick={() => window.location.href = '/expert-comptable/login'}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Utiliser un autre compte
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 w-full max-w-sm">
            <p className="text-xs text-slate-500 mb-3">
              Vous êtes un cabinet d'expertise comptable ?
            </p>
            <button
              onClick={() => window.location.href = '/expert-comptable/register'}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Créer un compte Expert-Comptable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertAccessRefused;
