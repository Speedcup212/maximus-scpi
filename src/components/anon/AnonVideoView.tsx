import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const FALLBACK_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

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
  const viewIncremented = useRef(false);

  const incrementView = () => {
    if (viewIncremented.current) return;
    viewIncremented.current = true;
    supabase
      .rpc('increment_view_count', { link_id: videoUuid })
      .then(({ error: updateError }) => {
        if (updateError) console.warn('view_count increment failed:', updateError);
      });
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
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
          console.error('AnonVideoView: lien introuvable ou expiré', {
            videoUuid,
            linkError: linkError ? { code: (linkError as any).code, message: linkError.message, details: (linkError as any).details } : null,
            linkData,
          });
          setError('Lien introuvable ou expiré.');
          setLoading(false);
          return;
        }

        const catalog = (linkData as any).scpi_catalog;
        const rawVideoUrl: string | null = catalog?.video_url;
        const finalVideoUrl = (rawVideoUrl && rawVideoUrl.trim() !== '') ? rawVideoUrl : FALLBACK_VIDEO_URL;

        setVideoData({
          scpiName: catalog?.name || 'SCPI',
          videoUrl: finalVideoUrl,
          logoUrl: catalog?.logo_url || '',
        });

        // Incrémenter view_count au montage (1 vue par chargement de page)
        incrementView();
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

  const isFallbackVideo = videoData.videoUrl === FALLBACK_VIDEO_URL;

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
        <div className="w-full max-w-4xl aspect-video bg-slate-950 rounded-lg overflow-hidden shadow-2xl border border-slate-900">
          <video src={videoData.videoUrl} controls playsInline className="w-full h-full rounded-lg" />
        </div>
      </main>

      {/* 3. LE DISCLAIMER RÉGLEMENTAIRE (OBLIGATOIRE AMF / RC PRO) */}
      <footer className="max-w-2xl mx-auto text-center pb-4 space-y-2">
        {isFallbackVideo && (
          <p className="text-[10px] text-amber-500/70 leading-relaxed font-light tracking-wide">
            Vidéo de démonstration — le rapport officiel de la SCPI sera disponible prochainement.
          </p>
        )}
        <p className="text-[10px] text-slate-600 leading-relaxed font-light tracking-wide">
          Informations factuelles issues du bulletin trimestriel officiel de la SCPI. Ce contenu audiovisuel est mis à disposition à des fins purement pédagogiques et ne constitue en aucun cas un conseil en investissement, une sollicitation ou une recommandation d'achat ou de vente. L'investisseur est rappelé que les performances passées ne préjugent pas des performances futures et que l'investissement en SCPI comporte un risque de perte en capital et d'illiquidité.
        </p>
      </footer>
    </div>
  );
}
