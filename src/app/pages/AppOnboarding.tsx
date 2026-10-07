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
    if (!user) onNavigate('/app/login');
  }, [user, onNavigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!acceptTerms || !acceptDisclaimer) {
      setMessage('Merci d’accepter les conditions et le disclaimer.');
      return;
    }

    if (!user || !profile || profile.status !== 'active') {
      setMessage('Ton accès doit être validé avant de finaliser le profil.');
      return;
    }

    setSaving(true);
    const client = requireSupabase();

    // Ne jamais permettre au navigateur de modifier son rôle ou son statut.
    const { error } = await client
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null
      })
      .eq('user_id', user.id);

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

    onNavigate(profile.role === 'admin' ? '/app/admin' : profile.role === 'partner' ? '/pro/dashboard' : '/app/client');
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

  if (!profile || profile.status !== 'active') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Accès restreint. Ton compte doit d’abord être validé par MaximusSCPI.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold">Finaliser ton accès</h1>
        <p className="mt-2 text-sm text-slate-300">
          Complète tes informations. Ton rôle et ton statut d’accès sont gérés uniquement par MaximusSCPI.
        </p>

        {message && (
          <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
            {message}
          </div>
        )}

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
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppOnboarding;
