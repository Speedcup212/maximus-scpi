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

const cleanOAuthUrl = () => {
  const url = new URL(window.location.href);
  ['code', 'error', 'error_code', 'error_description'].forEach(key => url.searchParams.delete(key));
  url.hash = '';
  const nextUrl = `${url.pathname}${url.search}`;
  window.history.replaceState({}, document.title, nextUrl || '/app');
};

const recoverOAuthSession = async (): Promise<Session | null> => {
  const client = requireSupabase();

  const {
    data: { session: existingSession }
  } = await client.auth.getSession();

  if (existingSession) return existingSession;

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');

  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw error;
    cleanOAuthUrl();
    return data.session;
  }

  // Compatibilité avec un callback implicit éventuellement lancé avant
  // le déploiement du passage en PKCE.
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  if (accessToken && refreshToken) {
    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) throw error;
    cleanOAuthUrl();
    return data.session;
  }

  return null;
};

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(sessionUser(session));
      setLoading(false);
    });

    const bootstrapAuth = async () => {
      try {
        const session = await recoverOAuthSession();
        if (!mounted) return;
        setUser(sessionUser(session));
      } catch (error) {
        console.error('[Auth] OAuth callback/session recovery failed', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void bootstrapAuth();

    return () => {
      mounted = false;
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
