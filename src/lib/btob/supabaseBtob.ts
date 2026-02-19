import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { requireSupabase } from '../supabase';
import { submitLead } from '../../utils/leadSubmitter';

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
  try {
    const result = await submitLead({
      channel: 'partner',
      form_type: 'lead_partner',
      context_slug: payload.source ?? undefined,
      identity: {
        nom: payload.cabinet_name,
        prenom: payload.contact_name,
        email: payload.email,
        telephone: payload.phone,
      },
    });

    if (!result.ok) {
      return { data: null, error: new Error(result.error || 'Submission failed') };
    }

    return { data: { request_id: result.request_id }, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
};
