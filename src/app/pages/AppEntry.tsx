import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';
import PendingAccess from '../components/PendingAccess';

type AppEntryProps = {
  onNavigate: (path: string) => void;
};

const AppEntry: React.FC<AppEntryProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) return;
    if (profile.role === 'partner') {
      onNavigate('/app/partner');
    } else if (profile.role === 'admin') {
      onNavigate('/app/admin');
    } else {
      onNavigate('/app/client');
    }
  }, [loading, profileLoading, user, profile, onNavigate]);

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour l’espace privé"
        showSetupLink
        showReload
      />
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
          Accès restreint. Votre compte n’a pas encore été invité.
        </div>
      </div>
    );
  }

  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <PendingAccess />
        </div>
      </div>
    );
  }

  if (profile?.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Votre accès est suspendu. Merci de contacter votre conseiller.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Espace privé</p>
        <h1 className="mt-3 text-3xl font-semibold">Accès réservé aux clients et partenaires</h1>
        <p className="mt-3 text-sm text-slate-300">
          Suivez vos dossiers, recevez vos comptes rendus et accédez à vos documents en toute sécurité.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => onNavigate('/app/login')}
            className="rounded-lg bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-100"
          >
            Se connecter
          </button>
          <button
            onClick={() => onNavigate('/app/request-access')}
            className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white"
          >
            Demander un accès
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppEntry;
