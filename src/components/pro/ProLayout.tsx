import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ProLayoutProps {
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  currentPath: string;
  children: React.ReactNode;
}

export default function ProLayout({ onNavigate, onSignOut, currentPath, children }: ProLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user && currentPath !== '/pro/login') {
        onNavigate('/pro/login');
      } else if (user && currentPath === '/pro/login') {
        onNavigate('/pro/dashboard');
      }
      setReady(true);
    }
  }, [authLoading, user, currentPath, onNavigate]);

  if (authLoading || !ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Chargement de l'environnement sécurisé...
      </div>
    );
  }

  if (currentPath === '/pro/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* SIDEBAR INSTITUTIONNELLE */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex flex-col gap-3">
            <img
              src="/Maximus logo 250x50 4.svg"
              alt="MaximusSCPI Pro"
              className="h-9 object-contain"
            />
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Espace CGP</div>
          </div>

          {/* Liens de navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => onNavigate('/pro/dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                currentPath === '/pro/dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              📊 Catalogue SCPI
            </button>
            <button
              onClick={() => onNavigate('/pro/settings')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                currentPath === '/pro/settings' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              ⚙️ Mon Cabinet (ORIAS)
            </button>
          </nav>
        </div>

        {/* Bouton Déconnexion */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            onSignOut();
          }}
          className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition"
        >
          Déconnexion
        </button>
      </aside>

      {/* ZONE DE TRAVAIL PRINCIPALE */}
      <main className="flex-grow p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
