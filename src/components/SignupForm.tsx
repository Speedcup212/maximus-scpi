import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const { signUp, signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await signUp(email, password);
      setMessage("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(`❌ Erreur : ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    
    try {
      await signInWithGoogle();
      // Si on arrive ici, la redirection vers Google a été initiée
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setGoogleError(errorMessage);
      console.error('❌ Erreur Google Auth:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-600">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un compte
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Rejoignez MaximusSCPI
        </p>
      </div>

      {/* Message de statut */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          {message.includes('✅') ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Message d'erreur Google */}
      {googleError && (
        <div className="mb-6 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{googleError}</span>
        </div>
      )}
      <form onSubmit={handleSignup} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
            placeholder="votre@email.com"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              placeholder="Votre mot de passe"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum 6 caractères
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
        >
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Mail className="w-5 h-5" />
          )}
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
        <span className="text-gray-500 dark:text-gray-400 text-sm">ou</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
      </div>

      {/* Bouton Google */}
      <button
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isGoogleLoading ? (
          <div className="animate-spin w-5 h-5 border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full" />
        ) : (
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="group-hover:text-gray-700 dark:group-hover:text-gray-50 transition-colors">
          {isGoogleLoading ? 'Redirection vers Google...' : 'Continuer avec Google'}
        </span>
      </button>
      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Compte gratuit
          </span>
        </div>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Accès illimité au comparateur SCPI</li>
          <li>• Simulateur IA personnalisé</li>
          <li>• Sauvegarde de vos simulations</li>
        </ul>
      </div>
    </div>
  );
};

export default SignupForm;