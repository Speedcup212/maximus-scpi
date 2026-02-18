import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import type { Case, CaseNote, CasePdf, CaseStatus } from '../types';

type PartnerCaseDetailProps = {
  caseId: string;
  onNavigate: (path: string) => void;
};

const PartnerCaseDetail: React.FC<PartnerCaseDetailProps> = ({ caseId, onNavigate }) => {
  const { signOut } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [pdfs, setPdfs] = useState<CasePdf[]>([]);
  const [noteType, setNoteType] = useState<CaseNote['note_type']>('compte_rendu');
  const [noteContent, setNoteContent] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const refresh = async () => {
    const { data: caseRow } = await supabase.from('cases').select('*').eq('id', caseId).single();
    const { data: notesRows } = await supabase.from('case_notes').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
    const { data: pdfRows } = await supabase.from('case_pdfs').select('*').eq('case_id', caseId).order('created_at', { ascending: false });
    if (caseRow) setCaseData(caseRow as Case);
    if (notesRows) setNotes(notesRows as CaseNote[]);
    if (pdfRows) setPdfs(pdfRows as CasePdf[]);
  };

  useEffect(() => {
    refresh();
  }, [caseId]);

  const handleStatusChange = async (status: CaseStatus) => {
    if (!caseData) return;
    setStatusUpdating(true);
    await supabase.from('cases').update({ status }).eq('id', caseData.id);
    await refresh();
    setStatusUpdating(false);
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await supabase.from('case_notes').insert({
      case_id: caseId,
      note_type: noteType,
      content_json: { text: noteContent }
    });
    setNoteContent('');
    await refresh();
  };

  const handleGeneratePdf = async () => {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session?.session?.access_token;
    if (!accessToken) return;
    const response = await fetch('/.netlify/functions/generate-case-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ case_id: caseId })
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload?.signedUrl) {
        window.open(payload.signedUrl, '_blank');
      }
      await refresh();
    }
  };

  const handleDownload = async (storagePath: string) => {
    const { data } = await supabase.storage.from('private-docs').createSignedUrl(storagePath, 60 * 10);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <AppLayout role="partner" title="Dossier client" onNavigate={onNavigate} onSignOut={signOut}>
      {!caseData && <div className="text-slate-300">Chargement...</div>}
      {caseData && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{caseData.title}</h2>
                <p className="text-xs text-slate-400">Client: {caseData.client_user_id}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={caseData.status} />
                <select
                  value={caseData.status}
                  onChange={event => handleStatusChange(event.target.value as CaseStatus)}
                  disabled={statusUpdating}
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  <option value="new">Nouveau</option>
                  <option value="in_progress">En cours</option>
                  <option value="sent">Envoyé</option>
                  <option value="closed">Clos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Comptes rendus</h3>
              <div className="mt-4 space-y-3">
                {notes.length === 0 && <EmptyState title="Aucun compte rendu" description="Ajoutez le premier compte rendu." />}
                {notes.map(note => (
                  <div key={note.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                    <div className="text-slate-400">{new Date(note.created_at).toLocaleDateString('fr-FR')}</div>
                    <div className="mt-2 whitespace-pre-wrap">{JSON.stringify(note.content_json, null, 2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <select
                  value={noteType}
                  onChange={event => setNoteType(event.target.value as CaseNote['note_type'])}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  <option value="compte_rendu">Compte rendu</option>
                  <option value="hypotheses">Hypothèses</option>
                  <option value="actions">Actions</option>
                  <option value="misc">Divers</option>
                </select>
                <textarea
                  value={noteContent}
                  onChange={event => setNoteContent(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                  rows={4}
                  placeholder="Résumé, hypothèses, points de vigilance..."
                />
                <button
                  onClick={handleAddNote}
                  className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100"
                >
                  Ajouter une note
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">PDFs</h3>
                <button
                  onClick={handleGeneratePdf}
                  className="rounded-lg border border-emerald-400/40 px-3 py-2 text-xs text-emerald-200"
                >
                  Générer un PDF
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {pdfs.length === 0 && <EmptyState title="Aucun PDF" description="Générez un PDF pour le client." />}
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

export default PartnerCaseDetail;
