import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export type PartnerLeadInsert = {
  cabinet_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  page_url?: string;
};

export const getSupabaseBtobClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
};

export const insertPartnerLead = async (payload: PartnerLeadInsert) => {
  const supabase = getSupabaseBtobClient();
  return supabase.from('partner_leads').insert(payload);
};
