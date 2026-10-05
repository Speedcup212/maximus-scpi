import React, { useMemo, useState } from 'react';
import { supabase, requireSupabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

type AppLoginProps = {
  onNavigate: (path: string) => void;
};

const AppLogin: React.FC<AppLoginProps> = ({ onNavigate }) => {
  const initialEmail = useMemo(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('email');
    if (fromQuery) return fromQuery;
    try {
      return sessionStorage.getItem('maximusLoginEmailHint') || '';
    } catch {
      return '';
    }
  }, []);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activated = new URLSearchParams(window.location.search).get('activated');
  const [resetSent, setResetSent] = useState(false);

  const peekPostLoginPath = () => {
    try {
      const next = sessionStorage.getItem('maximusPostLoginPath') || '/app';
      return next.startsWith('/app') ? next : '/app';
    } catch {
      return '/app';
    }
  };

  const getPostLoginPath = () => {
    const next = peekPostLoginPath();
    try {
      sessionStorage.removeItem('maximusPostLoginPath');
      sessionStorage.removeItem('maximusLoginEmailHint');
    } catch {
      // La navigation reste fonctionnelle si sessionStorage est indisponible.
    }
    return next;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(
        error.message === 'Invalid login credentials'
          ? 'Identifiants incorrects. Utilisez Google ou « Mot de passe oublié ? ».'
          : error.message
      );
    } else {
      onNavigate(getPostLoginPath());
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage(null);
    const client = requireSupabase();

    // Conserver la destination Client dans le même onglet, mais utiliser /app
    // comme callback OAuth unique. Cela évite de dépendre d'une URL de callback
    // spécifique à /app/client tout en laissant AppEntry restaurer la destination.
    try {
      const requested = peekPostLoginPath();
      if (requested.startsWith('/app/client')) {
        sessionStorage.setItem('maximusPostLoginPath', requested);
      }
    } catch {
      // Le flux reste utilisable même sans sessionStorage.
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
    if (error) {
      setMessage(error.message);
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    setMessage(null);
    const client = requireSupabase();

    try {
      const requested = peekPostLoginPath();
      if (requested.startsWith('/app/client')) {
        sessionStorage.setItem('maximusPostLoginPath', requested);
      }
    } catch {
      // Le flux reste utilisable même sans sessionStorage.
    }

    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` }
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Lien envoyé. Vérifiez votre email.');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    setMessage(null);
    setResetSent(false);
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app/set-password`
    });
    if (error) {
      setMessage(error.message);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour se connecter"
        showSetupLink
        showReload
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="mt-2 text-sm text-slate-300">Accédez à votre espace privé MaximusSCPI.</p>
        {activated && (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            Compte activé. Vous pouvez vous connecter.
          </div>
        )}
        {resetSent && (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            Lien de réinitialisation envoyé. Vérifiez votre email.
          </div>
        )}
        {message && <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">{message}</div>}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="mt-6 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 0 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
          </svg>
          {googleLoading ? 'Redirection vers Google...' : 'Continuer avec Google'}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-500">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <button
          onClick={handleMagicLink}
          disabled={loading || googleLoading}
          className="mt-3 w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200"
        >
          Recevoir un lien magique
        </button>
        <button
          onClick={handleResetPassword}
          disabled={loading || googleLoading}
          className="mt-3 w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200"
        >
          Mot de passe oublié ?
        </button>
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <button onClick={() => onNavigate('/app/request-access')} className="hover:text-emerald-200">Demander un accès</button>
          <button onClick={() => onNavigate('/')} className="hover:text-emerald-200">Retour site public</button>
        </div>
      </div>
    </div>
  );
};

export default AppLogin;
