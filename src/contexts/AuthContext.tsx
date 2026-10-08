import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, requireSupabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

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

const sessionUser = (session: Session | null): User | null =>
  session?.user
    ? {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at
      }
    : null;

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

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('[Auth] getSession failed', error);
      }

      setUser(sessionUser(session));
      setLoading(false);

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) return;
        setUser(sessionUser(nextSession));
        setLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    };

    void initialize();

    return () => {
      mounted = false;
      unsubscribe?.();
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
        emailRedirectTo: `${window.location.origin}/app`
      }
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app`
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
