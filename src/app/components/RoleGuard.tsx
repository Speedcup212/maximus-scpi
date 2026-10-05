import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import type { ProfileRole } from '../types';

type RoleGuardProps = {
  roles: ProfileRole[];
  onRedirect: (path: string) => void;
  children: React.ReactNode;
};

const RoleGuard: React.FC<RoleGuardProps> = ({ roles, onRedirect, children }) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);

  const canAccess = Boolean(
    profile && (
      roles.includes(profile.role) ||
      (profile.role === 'admin' && roles.length === 1 && roles[0] === 'client')
    )
  );

  useEffect(() => {
    if (!loading && profile && !canAccess) {
      onRedirect('/app');
    }
  }, [loading, profile, canAccess, onRedirect]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-300">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile || !canAccess) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
