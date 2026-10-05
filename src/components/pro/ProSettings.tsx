import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProSettings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [oriasNumber, setOriasNumber] = useState('');
  const [association, setAssociation] = useState('ANACOFI');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('cgp_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setCompanyName(data.company_name);
          setOriasNumber(data.orias_number);
          if (data.association) setAssociation(data.association);
        }
      } catch (err) {
        console.error("Erreur de chargement du profil :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Pas de session active");

      const { error } = await supabase
        .from('cgp_profiles')
        .update({
          company_name: companyName,
          orias_number: oriasNumber,
          association: association,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      alert("Erreur lors de la sauvegarde des informations.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Chargement des paramètres du cabinet...</div>;
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Configuration du Cabinet</h1>
        <p className="text-slate-400 text-sm mt-1">Gérez les informations réglementaires de votre structure de conseil.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-xl p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-6">

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-200 text-sm p-3 rounded-md">
              ✓ Informations réglementaires mises à jour avec succès.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nom commercial du cabinet
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ex: Durand Patrimoine"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Numéro ORIAS (8 chiffres)
              </label>
              <input
                type="text"
                required
                maxLength={8}
                pattern="\d{8}"
                value={oriasNumber}
                onChange={(e) => setOriasNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ex: 12345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Association Professionnelle de tutelle
            </label>
            <select
              value={association}
              onChange={(e) => setAssociation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="ANACOFI">ANACOFI (Association Nationale des Conseils Financiers)</option>
              <option value="CNCGP">CNCGP (Chambre Nationale des Conseils en Gestion de Patrimoine)</option>
              <option value="CNCIF">CNCIF (Chambre Nationale des Conseils en Investissements Financiers)</option>
              <option value="Compagnie_CIF">La Compagnie des CIF</option>
            </select>
            <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
              Cette information nous permet de valider la conformité de vos kits de communication vis-à-vis des exigences de votre chambre syndicale.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-6 rounded-md transition shadow-md disabled:opacity-50"
            >
              {updating ? "Enregistrement..." : "Sauvegarder les modifications"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
