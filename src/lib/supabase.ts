import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

if (isDev && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Supabase features disabled.');
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // Le retour OAuth est consommé explicitement avant le montage React.
          // L'implicit flow évite toute dépendance au code_verifier après un aller-retour Google.
          detectSessionInUrl: false,
          flowType: 'implicit'
        }
      })
    : null;

export const requireSupabase = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

const cleanAuthCallbackUrl = () => {
  const url = new URL(window.location.href);
  ['code', 'error', 'error_code', 'error_description'].forEach(key => url.searchParams.delete(key));
  url.hash = '';
  const clean = `${url.pathname}${url.search}`;
  window.history.replaceState({}, document.title, clean || '/app');
};

export type AuthBootstrapResult = {
  callbackDetected: boolean;
  session: Session | null;
  error: string | null;
};

/**
 * Consomme le callback OAuth AVANT le montage du routeur React.
 *
 * - implicit flow : access_token + refresh_token sont renvoyés dans le hash
 * - compatibilité : un ancien callback PKCE (?code=...) encore en vol reste accepté
 *
 * L'objectif est d'éviter qu'AppEntry rende un état "déconnecté" pendant que
 * Supabase initialise encore la session.
 */
export const bootstrapSupabaseAuthFromUrl = async (): Promise<AuthBootstrapResult> => {
  const client = requireSupabase();
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  const callbackError = url.searchParams.get('error_description') || hash.get('error_description');
  const callbackDetected = Boolean(code || accessToken || refreshToken || callbackError);

  try {
    if (callbackError) {
      throw new Error(callbackError);
    }

    if (accessToken && refreshToken) {
      const { data, error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (error) throw error;
      cleanAuthCallbackUrl();
      return { callbackDetected: true, session: data.session, error: null };
    }

    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (error) throw error;
      cleanAuthCallbackUrl();
      return { callbackDetected: true, session: data.session, error: null };
    }

    const {
      data: { session },
      error
    } = await client.auth.getSession();

    if (error) throw error;
    return { callbackDetected, session, error: null };
  } catch (error) {
    if (callbackDetected) {
      cleanAuthCallbackUrl();
    }

    const message = error instanceof Error ? error.message : 'Échec de récupération de la session.';
    console.error('[Supabase] Auth bootstrap failed', error);
    return { callbackDetected, session: null, error: message };
  }
};
