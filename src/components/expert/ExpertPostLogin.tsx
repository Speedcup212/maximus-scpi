import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { getExpertPostLoginRedirect, getRedirectUrl } from '../../utils/expertAccess';

const ExpertPostLogin: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [message, setMessage] = useState('Analyse de votre compte...');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resolve = async () => {
      try {
        const action = await getExpertPostLoginRedirect();
        const url = getRedirectUrl(action);

        setMessage(getRedirectMessage(action));
        setStatus('redirecting');

        timeout = setTimeout(() => {
          window.location.href = url;
        }, 800);
      } catch {
        setStatus('error');
        setMessage('Impossible de déterminer votre accès. Veuillez réessayer.');
      }
    };

    resolve();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">Connexion en cours</h1>
          </>
        )}
        {status === 'redirecting' && (
          <>
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">Accès autorisé</h1>
          </>
        )}
        {status === 'error' && (
          <>
            <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">Erreur</h1>
          </>
        )}
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
};

function getRedirectMessage(action: string): string {
  switch (action) {
    case 'simulator':
      return 'Redirection vers le simulateur...';
    case 'verification':
      return 'Redirection vers la vérification du cabinet...';
    case 'access-refused':
      return 'Redirection...';
    case 'register':
      return 'Redirection vers la connexion...';
    default:
      return 'Redirection en cours...';
  }
}

export default ExpertPostLogin;
