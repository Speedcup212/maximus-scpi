import React, { useEffect, useState } from 'react';
import { supabase, requireSupabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';

type AppOnboardingProps = {
  onNavigate: (path: string) => void;
};

const AppOnboarding: React.FC<AppOnboardingProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      onNavigate('/app/login');
    }
  }, [user, onNavigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!acceptTerms || !acceptDisclaimer) {
      setMessage('Merci d’accepter les conditions et le disclaimer.');
      return;
    }

    if (!user) return;

    setSaving(true);
    const activationSecret = import.meta.env.VITE_CLIENT_ACTIVATION_CODE;
    const shouldActivate = activationSecret && activationCode && activationCode === activationSecret;
    const status = shouldActivate ? 'active' : 'pending';

    const client = requireSupabase();
    const { error } = await client.from('profiles').upsert({
      user_id: user.id,
      full_name: fullName,
      phone,
      role: profile?.role ?? 'client',
      status,
      org_id: profile?.org_id ?? null
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    await client.from('audit_events').insert({
      user_id: user.id,
      event_type: 'onboarding_completed',
      payload: { accepted_terms: true, accepted_disclaimer: true }
    });

    if (status === 'active') {
      onNavigate('/app/client');
    } else {
      setMessage('Votre demande est enregistrée. Activation en cours.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-300">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour l’onboarding"
        showSetupLink
        showReload
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Finaliser votre accès</h1>
        <p className="mt-2 text-sm text-slate-300">
          Merci de compléter vos informations. L’outil est informatif et ne constitue pas un conseil personnalisé.
        </p>
        {message && <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">{message}</div>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-400">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={event => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Code d’activation (optionnel)</label>
            <input
              type="text"
              value={activationCode}
              onChange={event => setActivationCode(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={acceptTerms} onChange={event => setAcceptTerms(event.target.checked)} />
            J’accepte les CGU et la politique de confidentialité.
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={acceptDisclaimer} onChange={event => setAcceptDisclaimer(event.target.checked)} />
            Je comprends que l’outil est informatif et ne constitue pas un conseil.
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Valider'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppOnboarding;
