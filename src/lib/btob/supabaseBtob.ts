import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { supabase, requireSupabase } from '../supabase';

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

export type PartnerLeadInsertResult = {
  data: unknown | null;
  error: PostgrestError | Error | null;
};

export const getSupabaseBtobClient = (): SupabaseClient => requireSupabase();

export const insertPartnerLead = async (payload: PartnerLeadInsert): Promise<PartnerLeadInsertResult> => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  return supabase.from('partner_leads').insert(payload);
};
