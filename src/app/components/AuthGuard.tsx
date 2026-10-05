import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../hooks/useProfile';
import type { Profile } from '../types';
import PendingAccess from './PendingAccess';
import SupabaseNotConfigured from './SupabaseNotConfigured';

type AuthGuardProps = {
  children: React.ReactNode;
  onRedirect: (path: string) => void;
  requireActive?: boolean;
  fallback?: React.ReactNode;
  onProfileLoaded?: (profile: Profile | null) => void;
};

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  onRedirect,
  requireActive = true,
  fallback,
  onProfileLoaded
}) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      onRedirect('/app/login');
    }
  }, [loading, user, onRedirect]);

  useEffect(() => {
    if (onProfileLoaded && !profileLoading) {
      onProfileLoaded(profile);
    }
  }, [onProfileLoaded, profile, profileLoading]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-300">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour accéder à l’espace privé"
        showSetupLink
        showReload
      />
    );
  }

  if (!user) {
    return fallback || null;
  }

  if (requireActive && !profile) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
        Accès restreint. Votre compte n’est pas encore activé.
      </div>
    );
  }

  if (requireActive && profile?.status === 'pending') {
    return <PendingAccess />;
  }

  if (requireActive && profile?.status === 'suspended') {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
        Votre accès est suspendu. Merci de contacter votre conseiller.
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
