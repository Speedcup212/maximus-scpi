import React, { useState } from 'react';
import { supabase, requireSupabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

type AppLoginProps = {
  onNavigate: (path: string) => void;
};

const AppLogin: React.FC<AppLoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activated = new URLSearchParams(window.location.search).get('activated');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      onNavigate('/app');
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage('Veuillez saisir votre email.');
      return;
    }
    setLoading(true);
    setMessage(null);
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/app` } });
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
        <p className="mt-2 text-sm text-slate-300">Accédez à votre espace privé.</p>
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
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
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
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="mt-3 w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200"
        >
          Recevoir un lien magique
        </button>
        <button
          onClick={handleResetPassword}
          disabled={loading}
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
