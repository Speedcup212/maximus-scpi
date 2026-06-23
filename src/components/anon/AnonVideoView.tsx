import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AnonVideoViewProps {
  videoUuid: string;
}

interface VideoData {
  scpiName: string;
  videoUrl: string;
  logoUrl: string;
}

export default function AnonVideoView({ videoUuid }: AnonVideoViewProps) {
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        // 1. Requête jointe shared_links ↔ scpi_catalog
        const { data: linkData, error: linkError } = await supabase
          .from('shared_links')
          .select(`
            id,
            scpi_id,
            view_count,
            scpi_catalog!inner (
              name,
              logo_url,
              video_url
            )
          `)
          .eq('id', videoUuid)
          .single();

        if (linkError || !linkData) {
          setError('Lien introuvable ou expiré.');
          setLoading(false);
          return;
        }

        const catalog = (linkData as any).scpi_catalog;
        setVideoData({
          scpiName: catalog.name,
          videoUrl: catalog.video_url,
          logoUrl: catalog.logo_url,
        });

        // 2. Incrémenter view_count via fonction sécurisée (fire-and-forget)
        supabase
          .rpc('increment_view_count', { link_id: videoUuid })
          .then(({ error: updateError }) => {
            if (updateError) console.warn('view_count increment failed:', updateError);
          });
      } catch (err) {
        console.error('Erreur récupération vidéo:', err);
        setError('Erreur lors du chargement du rapport.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoUuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 text-xs tracking-widest uppercase">
        Connexion sécurisée au rapport trimestriel...
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 text-sm">
        {error || 'Rapport indisponible.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 w-screen overflow-x-hidden select-none">

      {/* 1. EN-TÊTE ULTRA-NEUTRE : UNIQUEMENT LE LOGO DE LA SCPI */}
      <header className="flex justify-center pt-4 sm:pt-8">
        {videoData.logoUrl && (
          <img
            src={videoData.logoUrl}
            alt="Logo Officiel"
            className="h-10 object-contain opacity-90 grayscale hover:grayscale-0 transition duration-300"
          />
        )}
      </header>

      {/* 2. LE LECTEUR VIDÉO MONASTIQUE (CENTRE DE L'ÉCRAN) */}
      <main className="flex-grow flex items-center justify-center py-8">
        <div className="w-full max-w-4xl aspect-video bg-slate-950 rounded-lg overflow-hidden shadow-2xl border border-slate-900 relative group">
          <video
            src={videoData.videoUrl}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover"
            autoPlay
          />
        </div>
      </main>

      {/* 3. LE DISCLAIMER RÉGLEMENTAIRE (OBLIGATOIRE AMF / RC PRO) */}
      <footer className="max-w-2xl mx-auto text-center pb-4">
        <p className="text-[10px] text-slate-600 leading-relaxed font-light tracking-wide">
          Informations factuelles issues du bulletin trimestriel officiel de la SCPI. Ce contenu audiovisuel est mis à disposition à des fins purement pédagogiques et ne constitue en aucun cas un conseil en investissement, une sollicitation ou une recommandation d'achat ou de vente. L'investisseur est rappelé que les performances passées ne préjugent pas des performances futures et que l'investissement en SCPI comporte un risque de perte en capital et d'illiquidité.
        </p>
      </footer>
    </div>
  );
}
