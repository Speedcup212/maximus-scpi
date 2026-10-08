import React, { useMemo, useState } from 'react';
import { KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import { useProfile } from '../hooks/useProfile';

type AccountPageProps = {
  onNavigate: (path: string) => void;
};

const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password],
  );

  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError('Supabase indisponible.');
      return;
    }
    if (!passwordValid) {
      setError('Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword('');
    setConfirmation('');
    setMessage('Mot de passe enregistré. Vous pouvez désormais vous connecter avec Google ou votre adresse e-mail et votre mot de passe.');
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <AppLayout
      role={profile.role}
      title="Mon compte"
      onNavigate={onNavigate}
      onSignOut={signOut}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 text-emerald-300" />
            <div>
              <h2 className="font-semibold text-white">Compte MaximusSCPI</h2>
              <p className="text-xs text-slate-500">Identité de connexion</p>
            </div>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Nom</dt>
              <dd className="mt-1 text-slate-200">{profile.full_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-200">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">Statut</dt>
              <dd className="mt-1 text-emerald-200">{profile.status === 'active' ? 'Actif' : profile.status}</dd>
            </div>
          </dl>
          <div className="mt-6 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs leading-5 text-emerald-100">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Google reste le moyen de connexion recommandé. Vous pouvez également définir un mot de passe pour disposer d’une seconde méthode de connexion.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-emerald-300" />
            <div>
              <h2 className="font-semibold text-white">Définir ou changer le mot de passe</h2>
              <p className="text-xs text-slate-500">Aucun email de récupération nécessaire.</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              {message}
            </div>
          )}

          <form onSubmit={handlePassword} className="mt-6 space-y-4">
            <label className="block text-xs text-slate-400">
              Nouveau mot de passe
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                required
              />
            </label>
            <label className="block text-xs text-slate-400">
              Confirmer
              <input
                type="password"
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className={passwordChecks.length ? 'text-emerald-300' : 'text-slate-500'}>12 caractères</span>
              <span className={passwordChecks.upper ? 'text-emerald-300' : 'text-slate-500'}>1 majuscule</span>
              <span className={passwordChecks.lower ? 'text-emerald-300' : 'text-slate-500'}>1 minuscule</span>
              <span className={passwordChecks.number ? 'text-emerald-300' : 'text-slate-500'}>1 chiffre</span>
            </div>
            <button
              type="submit"
              disabled={saving || !passwordValid || password !== confirmation}
              className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
};

export default AccountPage;
