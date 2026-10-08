import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
          // Le callback OAuth est traité explicitement dans AuthContext afin
          // d'éviter les courses au démarrage observées sur Firefox.
          detectSessionInUrl: false,
          flowType: 'pkce'
        }
      })
    : null;

export const requireSupabase = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};
