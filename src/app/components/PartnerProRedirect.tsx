import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

type PartnerProRedirectProps = {
  onRedirect: (path: string) => void;
};

const PartnerProRedirect: React.FC<PartnerProRedirectProps> = ({ onRedirect }) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user || !profile) return;

    if (profile.role === 'partner' && profile.status === 'active') {
      onRedirect('/pro/dashboard');
    }
    // If not a partner or not active, don't redirect — fall through to partner dashboard
  }, [loading, profileLoading, user, profile, onRedirect]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return null;
};

export default PartnerProRedirect;
