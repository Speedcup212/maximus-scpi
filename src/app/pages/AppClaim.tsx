import React from 'react';
import { ShieldCheck } from 'lucide-react';

type AppClaimProps = {
  onNavigate: (path: string) => void;
};

const AppClaim: React.FC<AppClaimProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-300" />
          <h1 className="text-2xl font-semibold">Accès MaximusSCPI</h1>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Le processus d’activation par code provisoire n’est plus utilisé. Une fois votre demande validée,
          connectez-vous avec Google en utilisant exactement l’adresse email approuvée par MaximusSCPI.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/app/login')}
          className="mt-6 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          Aller à la connexion
        </button>
      </div>
    </div>
  );
};

export default AppClaim;
