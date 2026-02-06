export interface ProspectInsertResult<T = any> {
  data: T | null;
  error: Error | null;
}

export const createProspect = async (leadData: Record<string, any>) => {
  const { supabase } = await import('../supabaseClient');

  const {
    commentaire,
    montant,
    creneau,
    metadata: existingMetadata,
    ...baseLead
  } = leadData;

  const metadata = {
    ...(existingMetadata || {}),
    ...(commentaire !== undefined ? { commentaire } : {}),
    ...(montant !== undefined ? { montant } : {}),
    ...(creneau !== undefined ? { creneau } : {})
  };

  return supabase
    .from('prospects')
    .insert([{
      ...baseLead,
      metadata
    }])
    .select();
};
