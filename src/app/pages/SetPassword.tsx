import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

const isStrongPassword = (value: string) => value.length >= 10 && /[A-Z]/.test(value) && /\d/.test(value);

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const bootstrap = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } else if (url.hash) {
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }

        let session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          await wait(250);
          session = (await supabase.auth.getSession()).data.session;
        }
        if (!session) {
          await wait(250);
          session = (await supabase.auth.getSession()).data.session;
        }

        if (!session) {
          setMessage('Lien invalide ou expiré.');
          return;
        }
        setSessionReady(true);
      } catch (error: any) {
        setMessage(error?.message || 'Impossible de valider le lien.');
      }
    };

    bootstrap();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!isStrongPassword(password)) {
      setMessage('Mot de passe trop faible (min 10, 1 majuscule, 1 chiffre).');
      return;
    }
    if (password !== confirm) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { error } = await supabase!.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Mot de passe mis à jour. Vous pouvez vous connecter.');
    }
    setLoading(false);
  };

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour activer l’accès"
        showSetupLink
        showReload
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Créer votre mot de passe</h1>
        <p className="mt-2 text-sm text-slate-300">Min 10 caractères, 1 majuscule, 1 chiffre.</p>
        {message && (
          <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
            {message}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-400">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
              disabled={!sessionReady}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={event => setConfirm(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
              disabled={!sessionReady}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            {loading ? 'Enregistrement...' : 'Définir mon mot de passe'}
          </button>
        </form>
        <div className="mt-6 text-xs text-slate-400">
          <button onClick={() => (window.location.href = '/app/login')} className="hover:text-emerald-200">
            Aller à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
