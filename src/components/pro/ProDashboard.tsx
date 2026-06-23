import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProDashboard() {
  const [scpiList, setScpiList] = useState<any[]>([]);
  const [selectedScpi, setSelectedScpi] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'technique' | 'vulgarisation' | 'macro'>('technique');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLink, setLoadingLink] = useState(false);
  const [copiedText, setCopiedText] = useState<'link' | 'script' | null>(null);

  // 1. Charger le catalogue des SCPI depuis Supabase au montage
  useEffect(() => {
    const fetchCatalog = async () => {
      const { data, error } = await supabase
        .from('scpi_catalog')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setScpiList(data);
      }
      setLoadingList(false);
    };
    fetchCatalog();
  }, []);

  // 2. Générer le lien et l'insérer dans 'shared_links'
  const handleGenerateLink = async () => {
    if (!selectedScpi) return;
    setLoadingLink(true);
    setGeneratedLink(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      const { data, error } = await supabase
        .from('shared_links')
        .insert([
          {
            scpi_id: selectedScpi.id,
            cgp_id: session.user.id,
            script_type: activeTab
          }
        ])
        .select('id')
        .single();

      if (error) throw error;

      // URL finale basée sur le domaine neutre acté
      setGeneratedLink(`https://infofonds.fr/v/${data.id}`);
    } catch (err) {
      console.error("Erreur de génération :", err);
      alert("Impossible de générer le lien de partage.");
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopy = (text: string, type: 'link' | 'script') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (loadingList) {
    return <div className="text-slate-400 text-sm">Chargement du catalogue financier...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Catalogue des analyses trimestrielles</h1>
        <p className="text-slate-400 text-sm mt-1">Sélectionnez une SCPI pour récupérer votre kit de communication client (T1 2026).</p>
      </div>

      {/* GRILLE DYNAMIQUE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scpiList.map((scpi) => (
          <div
            key={scpi.id}
            onClick={() => {
              setSelectedScpi(scpi);
              setGeneratedLink(null);
            }}
            className={`bg-slate-900 border p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-44 ${
              selectedScpi?.id === scpi.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                {scpi.category}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-2">{scpi.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
              <div>
                <p className="text-xs text-slate-500">Rendement</p>
                <p className="text-base font-semibold text-emerald-400">{scpi.rendement}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">T.O.F</p>
                <p className="text-base font-semibold text-slate-200">{scpi.tof}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIGURATEUR DE KIT */}
      {selectedScpi && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-100">
              Kit de relance : <span className="text-indigo-400">{selectedScpi.name}</span>
            </h2>
            <span className="text-xs text-slate-500">Données certifiées T1 2026</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                1. Message d'accompagnement
              </label>

              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['technique', 'vulgarisation', 'macro'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setGeneratedLink(null); }}
                    className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md capitalize transition ${
                      activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeTab === 'technique' && selectedScpi.script_technique}
                  {activeTab === 'vulgarisation' && selectedScpi.script_vulgarisation}
                  {activeTab === 'macro' && selectedScpi.script_macro}
                </p>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleCopy(selectedScpi[`script_${activeTab}`], 'script')}
                    className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-700 font-medium transition"
                  >
                    {copiedText === 'script' ? '✓ Copié !' : 'Copier le message'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  2. Générer le rapport vidéo anonyme
                </label>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Le livrable intègre le logo officiel de la SCPI et l'animation des métriques. Aucun marquage MaximusSCPI ne sera visible.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
                {!generatedLink ? (
                  <button
                    onClick={handleGenerateLink}
                    disabled={loadingLink}
                    className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 px-4 rounded-md hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {loadingLink ? 'Création de la clé unique...' : 'Générer le lien client neutre'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-emerald-400">Prêt à l'envoi (Variante {activeTab}) :</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 flex-grow focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(generatedLink, 'link')}
                        className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded hover:bg-indigo-500 font-semibold transition shrink-0"
                      >
                        {copiedText === 'link' ? '✓' : 'Copier le lien'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
