import React from 'react';
import { supabase } from '../../lib/supabase';
import SupabaseNotConfigured from '../components/SupabaseNotConfigured';
import RequestAccessForm from '../components/RequestAccessForm';

type AppSignupProps = {
  onNavigate: (path: string) => void;
};

const AppSignup: React.FC<AppSignupProps> = ({ onNavigate }) => {

  if (!supabase) {
    return (
      <SupabaseNotConfigured
        title="Configuration requise pour créer un compte"
        showSetupLink
        showReload
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <RequestAccessForm />
        <div className="mt-6 text-center text-xs text-slate-400">
          <button onClick={() => onNavigate('/app/login')} className="mt-2 text-emerald-200">J’ai déjà un compte</button>
        </div>
      </div>
    </div>
  );
};

export default AppSignup;
