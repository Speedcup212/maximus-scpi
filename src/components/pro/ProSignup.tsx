import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ProSignupProps {
  onNavigate: (path: string) => void;
}

export default function ProSignup({ onNavigate }: ProSignupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cabinetName, setCabinetName] = useState('');
  const [oriasNumber, setOriasNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation basique
    if (!oriasNumber || !/^\d{8}$/.test(oriasNumber)) {
      setError('Le numéro ORIAS doit contenir exactement 8 chiffres.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);

    try {
      // Étape A : Vérification ORIAS via Netlify Function
      const oriasResponse = await fetch('/.netlify/functions/verify-orias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oriasNumber }),
      });

      const oriasData = await oriasResponse.json();

      if (!oriasData.valid) {
        setError('Numéro ORIAS introuvable ou radié. Inscription refusée.');
        setLoading(false);
        return;
      }

      // Extraire les données enrichies
      const cgpAssociation: string | null = oriasData.association || null;
      const isCif: boolean = oriasData.isCif === true;
      const isApproved = oriasData.valid === true && isCif;

      // Étape B : Création du compte Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            cabinet_name: cabinetName,
            orias_number: oriasNumber,
            role: 'cgp',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? 'Un compte avec cet email existe déjà.'
          : signUpError.message);
        setLoading(false);
        return;
      }

      if (!signUpData.user) {
        setError('Erreur lors de la création du compte. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      // Étape C : Insertion dans la table profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        first_name: firstName,
        last_name: lastName,
        cabinet_name: cabinetName,
        orias_number: oriasNumber,
        email,
        role: 'cgp',
        cgp_association: cgpAssociation,
        is_approved: isApproved,
      }, { onConflict: 'id' });

      if (profileError) {
        console.error('Erreur profil:', profileError);
        // Le compte auth est créé, on ne bloque pas l'utilisateur
      }

      // Succès
      setSuccess('Votre compte a été créé et validé avec succès. Vous pouvez maintenant vous connecter.');
      setLoading(false);

      // Redirection après 3 secondes
      setTimeout(() => {
        onNavigate('/pro/login');
      }, 3000);
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/Maximus logo 250x50 4.svg"
            alt="MaximusSCPI Pro"
            className="h-10 mx-auto object-contain"
          />
          <div className="text-xl font-bold tracking-wide text-white mt-3">Espace Pro</div>
          <p className="text-slate-400 text-sm mt-2">Création de compte CGP</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                placeholder="Éric"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                placeholder="Dupont"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nom du Cabinet</label>
            <input
              type="text"
              value={cabinetName}
              onChange={e => setCabinetName(e.target.value)}
              required
              placeholder="Dupont Patrimoine"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Numéro ORIAS</label>
            <input
              type="text"
              value={oriasNumber}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                setOriasNumber(val);
              }}
              required
              maxLength={8}
              placeholder="24001234"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-mono tracking-widest"
            />
            <p className="text-xs text-slate-500 mt-1">8 chiffres — votre numéro d'immatriculation ORIAS</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="8 caractères minimum"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Vérification ORIAS en cours...' : success ? 'Compte créé !' : 'Soumettre ma demande d’accès'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Inscription réservée aux CGP et professionnels agréés ORIAS
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Déjà un compte ?{' '}
          <button
            onClick={() => onNavigate('/pro/login')}
            className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
