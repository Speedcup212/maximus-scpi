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

    if (!user) {
      onNavigate('/app/login');
      return;
    }

    if (!profile) return;

    // Lorsqu'un utilisateur est passé par /espace-client, AuthGuard mémorise
    // /app/client avant de l'envoyer vers la connexion. Le callback OAuth
    // revient volontairement sur /app (route déjà utilisée/acceptée), puis on
    // restaure ici uniquement une destination Client. Le contrôle de rôle
    // reste ensuite assuré par RoleGuard sur la page cible.
    try {
      const requestedPath = sessionStorage.getItem('maximusPostLoginPath');
      if (requestedPath?.startsWith('/app/client')) {
        sessionStorage.removeItem('maximusPostLoginPath');
        sessionStorage.removeItem('maximusLoginEmailHint');
        onNavigate(requestedPath);
        return;
      }
    } catch {
      // Si sessionStorage est indisponible, conserver le routage par rôle.
    }

    if (profile.role === 'partner') {
      onNavigate('/pro/dashboard');
    } else if (profile.role === 'admin') {
      onNavigate('/app/admin');
    } else {
      onNavigate('/app/client');
    }
  }, [loading, profileLoading, user, profile, onNavigate]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-sm text-slate-400 animate-pulse">Chargement…</div>
      </div>
    );
  }

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
      <div className="text-sm text-slate-400 animate-pulse">Ouverture de l’espace privé…</div>
    </div>
  );
};

export default AppEntry;
