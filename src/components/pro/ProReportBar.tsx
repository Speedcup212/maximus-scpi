import { useState } from 'react';
import { useProReport } from '../../contexts/ProReportContext';
import { X, FileText, Loader2, CheckCircle } from 'lucide-react';

export default function ProReportBar() {
  const { report, scpiCount, hasSimulation, removeScpi, generateReport, clearReport } = useProReport();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!report || scpiCount === 0) return null;

  const handleGenerate = async () => {
    if (!hasSimulation) return;
    setLoading(true);
    try {
      const result = await generateReport();
      if (result) {
        setFeedback('Rapport généré avec succès !');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback('Erreur lors de la génération.');
        setTimeout(() => setFeedback(null), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          {/* Mobile compact */}
          <div className="sm:hidden flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={18} className="text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-200 truncate">
                {scpiCount} SCPI
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!hasSimulation || loading}
              className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                hasSimulation
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
              title={!hasSimulation ? "Ajoutez d'abord une simulation" : 'Générer le rapport'}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Générer
            </button>
          </div>

          {/* Desktop complet */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 bg-emerald-900/50 rounded-lg px-3 py-1.5">
                <FileText size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-100">Rapport en cours</span>
              </div>

              {/* Chips des SCPI sélectionnées */}
              <div className="flex items-center gap-2 flex-wrap">
                {report.selectedScpi.map((scpi) => (
                  <button
                    key={scpi.scpiId}
                    onClick={() => removeScpi(scpi.scpiId)}
                    className="flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-700/30 rounded-full px-3 py-1 text-xs text-emerald-200 hover:bg-red-950/40 hover:text-red-300 hover:border-red-700/30 transition group"
                    title="Cliquez pour retirer"
                  >
                    <span className="truncate max-w-[120px]">{scpi.scpiName}</span>
                    <X size={12} className="text-emerald-500 group-hover:text-red-400 transition" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Feedback */}
              {feedback && (
                <span className="text-xs text-emerald-300 flex items-center gap-1">
                  <CheckCircle size={14} />
                  {feedback}
                </span>
              )}

              {/* Bouton générer */}
              <button
                onClick={handleGenerate}
                disabled={!hasSimulation || loading}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition shadow-lg ${
                  hasSimulation
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
                title={!hasSimulation ? "Ajoutez d'abord une simulation dans l'onglet Simulateur" : 'Générer le rapport client'}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    Générer le rapport
                    <span className="text-emerald-200">→</span>
                  </>
                )}
              </button>

              {/* Réinitialiser */}
              <button
                onClick={clearReport}
                className="text-xs text-slate-400 hover:text-red-400 transition p-1"
                title="Vider le rapport"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaceur pour éviter que le contenu soit caché derrière la barre */}
      <div className="h-14 sm:h-16" />
    </>
  );
}
