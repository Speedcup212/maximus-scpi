import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthError } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      } : null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        created_at: session.user.created_at
      } : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    console.log('🔍 Démarrage Google OAuth...');
    console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🌐 Current URL:', window.location.origin);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('🔄 Redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          hd: undefined // Permettre tous les domaines Google
        }
      }
    });
    
    console.log('📊 Google Auth Response:', { data, error });
    
    if (error) {
      console.error('❌ Erreur Google OAuth:', error);
      
      // Messages d'erreur spécifiques
      if (error.message.includes('Provider not found') || error.message.includes('provider_not_found')) {
        throw new Error('🔧 Google OAuth non configuré. Vérifiez la configuration dans Supabase → Authentication → Providers.');
      } else if (error.message.includes('Invalid redirect') || error.message.includes('redirect_uri_mismatch')) {
        throw new Error(`🔗 URL de redirection invalide. Ajoutez "${redirectUrl}" dans Google Console et Supabase.`);
      } else if (error.message.includes('Invalid client') || error.message.includes('unauthorized_client')) {
        throw new Error('🔑 Client Google invalide. Vérifiez vos clés Client ID/Secret dans Supabase.');
      } else if (error.message.includes('popup_blocked')) {
        throw new Error('🚫 Popup bloqué. Autorisez les popups pour ce site ou réessayez.');
      } else {
        throw new Error(`🔴 Erreur Google OAuth: ${error.message}`);
      }
    }
    
    console.log('✅ Google OAuth initié avec succès - Redirection en cours...');
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};