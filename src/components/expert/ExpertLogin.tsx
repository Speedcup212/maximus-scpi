import { useState } from 'react';
import { Eye, EyeOff, Building2 } from 'lucide-react';

interface ExpertLoginProps {
  onNavigateHome?: () => void;
}

export default function ExpertLogin({ onNavigateHome }: ExpertLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authentification Expert-Comptable (à venir)
    console.log('Expert login attempt:', email);
  };

  const handleGoogleLogin = () => {
    // Google auth Expert-Comptable (à venir)
    console.log('Expert Google login attempt');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/Maximus logo 250x50 4.svg"
            alt="MaximusSCPI Expert-Comptable"
            className="h-10 mx-auto object-contain mb-2"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-600/30 mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
              Cabinet d'expertise comptable
            </span>
          </div>
          <div className="text-xl font-bold tracking-wide text-white">Espace Expert-Comptable</div>
          <p className="text-slate-400 text-sm mt-2">
            Simulateurs société, trésorerie IS et usufruit temporaire SCPI.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="vous@cabinet-expertise.fr"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
          >
            Se connecter
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500">ou</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-medium rounded-lg transition flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="text-xs text-slate-500 text-center">
            Accès réservé aux cabinets d'expertise comptable.
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400 space-y-2">
          <div>
            Pas encore inscrit ?{' '}
            <button
              onClick={() => window.location.href = '/expert-comptable/signup'}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Créer mon compte Expert-Comptable
            </button>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Vous êtes CGP / CIF ?{' '}
              <button
                onClick={() => window.location.href = '/pro/login'}
                className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                Accéder à l'espace CGP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
