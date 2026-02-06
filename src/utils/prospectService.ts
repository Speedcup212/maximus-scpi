export interface ProspectInsertResult<T = any> {
  data: T | null;
  error: Error | null;
}

export const createProspect = async (leadData: Record<string, any>) => {
  const { supabase } = await import('../supabaseClient');

  return supabase
    .from('prospects')
    .insert([leadData])
    .select();
};
