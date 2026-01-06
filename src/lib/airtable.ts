import { supabase } from '../supabaseClient';

export async function addRDV(rdv: {
  scpi: string;
  nomComplet: string;
  email: string;
  telephone: string;
  montant: string;
  creneau: string;
  commentaire?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .insert([
        {
          scpi: [rdv.scpi],
          nom: rdv.nomComplet,
          email: rdv.email,
          telephone: rdv.telephone,
          montant: rdv.montant,
          creneau: rdv.creneau,
          commentaire: rdv.commentaire || "",
          source: 'API',
          type_lead: 'formulaire',
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Erreur addRDV:", error);
    throw error;
  }
}

export async function getRDV(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ Erreur getRDV:", error);
    throw error;
  }
}
