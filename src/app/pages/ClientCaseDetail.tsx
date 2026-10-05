import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case, CaseNote, CasePdf } from '../types';

type ClientCaseDetailProps = {
  caseId: string;
  onNavigate: (path: string) => void;
};

const ClientCaseDetail: React.FC<ClientCaseDetailProps> = ({ caseId, onNavigate }) => {
  const { signOut } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [pdfs, setPdfs] = useState<CasePdf[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: caseRow } = await supabase.from('cases').select('*').eq('id', caseId).single();
      const { data: notesRows } = await supabase.from('case_notes').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
      const { data: pdfRows } = await supabase.from('case_pdfs').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
      if (caseRow) setCaseData(caseRow as Case);
      if (notesRows) setNotes(notesRows as CaseNote[]);
      if (pdfRows) setPdfs(pdfRows as CasePdf[]);
    };
    load();
  }, [caseId]);

  const handleDownload = async (storagePath: string) => {
    const { data } = await supabase.storage.from('private-docs').createSignedUrl(storagePath, 60 * 10);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <AppLayout role="client" title="Dossier" onNavigate={onNavigate} onSignOut={signOut}>
      {!caseData && <div className="text-slate-300">Chargement...</div>}
      {caseData && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{caseData.title}</h2>
                <p className="text-xs text-slate-400">Créé le {new Date(caseData.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <StatusBadge status={caseData.status} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Comptes rendus</h3>
              <div className="mt-4 space-y-3">
                {notes.length === 0 && (
                  <EmptyState title="Aucun compte rendu" description="Votre conseiller ajoutera un compte rendu après le prochain rendez-vous." />
                )}
                {notes.map(note => (
                  <div key={note.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                    <div className="text-slate-400">{new Date(note.created_at).toLocaleDateString('fr-FR')}</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(note.content_json, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">PDFs</h3>
              <div className="mt-4 space-y-3">
                {pdfs.length === 0 && (
                  <EmptyState title="Aucun PDF" description="Les comptes rendus PDF apparaîtront ici dès leur génération." />
                )}
                {pdfs.map(pdf => (
                  <div key={pdf.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                    <div>
                      <div className="font-semibold">{pdf.title}</div>
                      <div className="text-slate-400">Version {pdf.version}</div>
                    </div>
                    <button
                      onClick={() => handleDownload(pdf.storage_path)}
                      className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white"
                    >
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ClientCaseDetail;
