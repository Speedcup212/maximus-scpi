import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clipboard, Trash2, Eye, FileText, Loader2 } from 'lucide-react';

type ProReportRow = {
  id: string;
  cabinet_name: string;
  report_data: any;
  created_at: string;
  expires_at: string;
  view_count: number;
};

export default function ProRapports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ProReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pro_reports')
        .select('id, cabinet_name, report_data, created_at, expires_at, view_count')
        .eq('cgp_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement rapports:', error);
        return;
      }
      setReports((data || []) as ProReportRow[]);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/pro/report/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce rapport ? Cette action est irréversible.')) return;
    try {
      await supabase.from('pro_reports').delete().eq('id', id);
      fetchReports();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const getScpiNames = (reportData: any): string => {
    try {
      const scpis = reportData?.selectedScpi;
      if (Array.isArray(scpis)) {
        return scpis.map((s: any) => s.scpiName).join(', ');
      }
      return '-';
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 size={20} className="animate-spin mx-auto text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">Chargement des rapports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Mes rapports</h1>
        <p className="text-slate-400 text-sm mt-1">
          Consultez et gérez les rapports générés pour vos clients.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <FileText size={32} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-300 mb-1">Aucun rapport généré</h3>
          <p className="text-sm text-slate-500">
            Utilisez le comparateur pour construire un rapport,
            puis générez-le via la barre en bas de l'écran.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">SCPI sélectionnées</th>
                  <th className="py-3 px-4 text-center">Vues</th>
                  <th className="py-3 px-4 text-center">Expire le</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(report.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 truncate max-w-[250px] block">
                        {getScpiNames(report.report_data)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        report.view_count > 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-950 text-slate-500'
                      }`}>
                        <Eye size={12} />
                        {report.view_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {new Date(report.expires_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(report.id)}
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition font-medium px-2 py-1 rounded hover:bg-emerald-950/40"
                        >
                          {copiedId === report.id ? (
                            <>✓ Copié</>
                          ) : (
                            <>
                              <Clipboard size={12} />
                              Copier le lien
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
