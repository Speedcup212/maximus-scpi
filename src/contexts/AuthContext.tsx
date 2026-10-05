import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, requireSupabase } from "../lib/supabase";

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
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    let settled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const applySession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!active) return;
      settled = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at
      } : null);
      setLoading(false);
    };

    const settleNullAfterGracePeriod = () => {
      if (settled || fallbackTimer) return;
      // Après un retour OAuth, Supabase peut émettre INITIAL_SESSION(null)
      // quelques millisecondes avant SIGNED_IN. Ne jamais rediriger vers /login
      // pendant cette fenêtre, sinon on crée une boucle OAuth visible.
      fallbackTimer = setTimeout(async () => {
        if (!active || settled) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!active || settled) return;
        applySession(session);
      }, 650);
    };

    // S'abonner AVANT le premier getSession : le retour OAuth peut être traité
    // pendant l'initialisation du client Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (session) {
        applySession(session);
        return;
      }

      if (event === 'SIGNED_OUT') {
        applySession(null);
        return;
      }

      // INITIAL_SESSION(null) n'est pas définitif lors d'un callback OAuth.
      if (event === 'INITIAL_SESSION') {
        settleNullAfterGracePeriod();
      }
    });

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || settled) return;
      if (session) {
        applySession(session);
      } else {
        settleNullAfterGracePeriod();
      }
    };

    bootstrap();

    return () => {
      active = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const client = requireSupabase();
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      if (error.message.includes('Provider not found') || error.message.includes('provider_not_found')) {
        throw new Error('Google OAuth non configuré. Vérifiez la configuration Supabase.');
      }
      if (error.message.includes('Invalid redirect') || error.message.includes('redirect_uri_mismatch')) {
        throw new Error(`URL de redirection invalide : ${redirectUrl}`);
      }
      if (error.message.includes('Invalid client') || error.message.includes('unauthorized_client')) {
        throw new Error('Client Google invalide. Vérifiez les identifiants OAuth.');
      }
      throw new Error(`Erreur Google OAuth : ${error.message}`);
    }
  };

  const signOut = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
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
