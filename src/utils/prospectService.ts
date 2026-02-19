export interface ProspectInsertResult<T = any> {
  data: T | null;
  error: Error | null;
}

export const createProspect = async (leadData: Record<string, any>) => {
  const { supabase } = await import('../supabaseClient');
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const {
    commentaire,
    montant,
    creneau,
    request_id,
    metadata: existingMetadata,
    ...baseLead
  } = leadData;

  const metadata = {
    ...(existingMetadata || {}),
    ...(commentaire !== undefined ? { commentaire } : {}),
    ...(montant !== undefined ? { montant } : {}),
    ...(creneau !== undefined ? { creneau } : {}),
    ...(request_id ? { request_id } : {}),
  };

  return supabase
    .from('prospects')
    .insert([{
      ...baseLead,
      metadata
    }])
    .select();
};
