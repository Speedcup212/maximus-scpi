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

  useEffect(() => {
    if (!loading && profile && !roles.includes(profile.role)) {
      onRedirect('/app');
    }
  }, [loading, profile, roles, onRedirect]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-300">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile || !roles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
