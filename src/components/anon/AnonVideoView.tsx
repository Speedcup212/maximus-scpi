import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AnonVideoView({ videoUuid }: { videoUuid: string }) {
  const [loading, setLoading] = useState(true);
  const [scpiName, setScpiName] = useState('');

  useEffect(() => {
    async function fetchVideoData() {
      try {
        const { data, error } = await supabase
          .from('shared_links')
          .select('*, scpi_catalog(name)')
          .eq('id', videoUuid)
          .single();

        if (error) {
          console.error('Erreur Supabase:', error);
        }

        if (data) {
          if (data.scpi_catalog) {
            setScpiName(data.scpi_catalog.name);
          }

          // Incrémenter immédiatement le compteur de vues dans Supabase
          await supabase
            .from('shared_links')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', videoUuid);
        }
      } catch (err) {
        console.error('Erreur Supabase :', err);
      } finally {
        setLoading(false);
      }
    }

    if (videoUuid) {
      fetchVideoData();
    }
  }, [videoUuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Chargement de votre rapport sécurisé...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">

        {/* En-tête anonyme sans marque Maximus */}
        <div className="text-center space-y-1 border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Analyse Immobilière Trimestrielle : <span className="text-emerald-400">{scpiName || 'Votre SCPI'}</span>
          </h1>
          <p className="text-xs text-slate-500">Espace de visionnage privé et hautement confidentiel</p>
        </div>

        {/* Lecteur Vidéo avec URL Google Cloud stable en dur */}
        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-inner border border-slate-800/50">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Rapport Trimestriel SCPI"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        {/* Clause de non-responsabilité réglementaire pour les CGP */}
        <p className="text-[10px] text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
          Informations factuelles issues du bulletin trimestriel officiel de la SCPI. Ce contenu audiovisuel est mis à disposition à des fins purement pédagogiques et ne constitue en aucun cas un conseil en investissement, une sollicitation ou une recommandation d'achat ou de vente. L'investisseur est rappelé que les performances passées ne préjugent pas des performances futures et que l'investissement en SCPI comporte un risque de perte en capital et d'illiquidité.
        </p>
      </div>
    </div>
  );
}
