import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, FileText, RefreshCw } from 'lucide-react';
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

const LABELS: Record<string, string> = {
  objectif: 'Objectif',
  objectifs: 'Objectifs',
  situation: 'Situation',
  synthese: 'Synthèse',
  recommendation: 'Recommandation',
  recommandation: 'Recommandation',
  recommandations: 'Recommandations',
  actions: 'Actions à venir',
  prochaines_etapes: 'Prochaines étapes',
  next_steps: 'Prochaines étapes',
  points_attention: 'Points d’attention',
  hypotheses: 'Hypothèses',
  commentaire: 'Commentaire',
  notes: 'Notes',
};

const titleForKey = (key: string) =>
  LABELS[key.toLowerCase()] ||
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const renderValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-500">Néant</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-200">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === 'object' && item !== null
              ? Object.values(item as Record<string, unknown>).map(String).join(' · ')
              : String(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, unknown>).map(([key, nested]) => (
          <div key={key} className="rounded-lg border border-white/5 bg-slate-950/40 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {titleForKey(key)}
            </div>
            <div className="mt-1 text-sm text-slate-200">{renderValue(nested)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{String(value)}</p>;
};

const ClientCaseDetail: React.FC<ClientCaseDetailProps> = ({ caseId, onNavigate }) => {
  const { signOut } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [pdfs, setPdfs] = useState<CasePdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setError('Service indisponible.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    const [caseResult, notesResult, pdfsResult] = await Promise.all([
      supabase.from('cases').select('*').eq('id', caseId).maybeSingle(),
      supabase
        .from('case_notes')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_pdfs')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false }),
    ]);

    if (caseResult.error) {
      setError('Impossible de charger ce dossier.');
      setLoading(false);
      return;
    }

    if (!caseResult.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (notesResult.error || pdfsResult.error) {
      setError('Le dossier existe mais certains éléments n’ont pas pu être chargés.');
    }

    setCaseData(caseResult.data as Case);
    setNotes((notesResult.data ?? []) as CaseNote[]);
    setPdfs((pdfsResult.data ?? []) as CasePdf[]);
    setLoading(false);
  }, [caseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedNoteEntries = useMemo(
    () =>
      notes.map(note => ({
        note,
        entries: Object.entries(note.content_json || {}).sort(([a], [b]) => {
          const priority = ['objectif', 'situation', 'synthese', 'recommandation', 'recommendation', 'actions', 'prochaines_etapes', 'next_steps'];
          const ai = priority.indexOf(a.toLowerCase());
          const bi = priority.indexOf(b.toLowerCase());
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        }),
      })),
    [notes],
  );

  const handleDownload = async (pdf: CasePdf) => {
    if (!supabase) return;

    setDownloadError(null);
    setDownloadingId(pdf.id);

    const { data, error: signedUrlError } = await supabase.storage
      .from('private-docs')
      .createSignedUrl(pdf.storage_path, 60 * 10);

    setDownloadingId(null);

    if (signedUrlError || !data?.signedUrl) {
      setDownloadError('Impossible d’ouvrir ce document. Réessaie dans quelques instants.');
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout role="client" title="Dossier" onNavigate={onNavigate} onSignOut={signOut}>
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : notFound ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
              <div className="font-medium text-amber-100">Dossier introuvable</div>
              <p className="mt-1 text-sm text-amber-200/80">
                Ce dossier n’existe pas ou n’est pas accessible avec ce compte.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/app/client/dossiers')}
                className="mt-4 rounded-xl border border-amber-300/20 px-3 py-2 text-xs font-medium text-amber-100"
              >
                Retour à mes dossiers
              </button>
            </div>
          </div>
        </div>
      ) : caseData ? (
        <div className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-amber-100 underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Réessayer
                </button>
              </div>
            </div>
          )}

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Mon dossier</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{caseData.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Créé le {new Date(caseData.created_at).toLocaleDateString('fr-FR')} · dernière mise à jour le{' '}
                  {new Date(caseData.updated_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <StatusBadge status={caseData.status} />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-300" />
                <h3 className="font-semibold text-white">Suivi et comptes rendus</h3>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Synthèse lisible des éléments ajoutés à ton dossier.
              </p>

              <div className="mt-5 space-y-5">
                {sortedNoteEntries.length === 0 ? (
                  <EmptyState
                    title="Aucun compte rendu"
                    description="Les synthèses et prochaines étapes apparaîtront ici lorsqu’elles seront ajoutées."
                  />
                ) : (
                  sortedNoteEntries.map(({ note, entries }) => (
                    <article key={note.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                          {note.note_type === 'compte_rendu'
                            ? 'Compte rendu'
                            : note.note_type === 'actions'
                              ? 'Actions'
                              : note.note_type === 'hypotheses'
                                ? 'Hypothèses'
                                : 'Note'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(note.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {entries.length === 0 ? (
                          <p className="text-sm text-slate-500">Aucun contenu.</p>
                        ) : (
                          entries.map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                {titleForKey(key)}
                              </h4>
                              <div className="mt-2">{renderValue(value)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-300" />
                <h3 className="font-semibold text-white">Documents</h3>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Les liens sont temporaires et générés à la demande.
              </p>

              {downloadError && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                  {downloadError}
                </div>
              )}

              <div className="mt-5 space-y-3">
                {pdfs.length === 0 ? (
                  <EmptyState
                    title="Aucun document"
                    description="Les documents du dossier apparaîtront ici dès leur mise à disposition."
                  />
                ) : (
                  pdfs.map(pdf => (
                    <div
                      key={pdf.id}
                      className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
                    >
                      <div className="font-medium text-white">{pdf.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Version {pdf.version} · {new Date(pdf.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <button
                        type="button"
                        disabled={downloadingId === pdf.id}
                        onClick={() => void handleDownload(pdf)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white hover:bg-white/5 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === pdf.id ? 'Ouverture…' : 'Ouvrir le PDF'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Impossible d’afficher le dossier.
        </div>
      )}
    </AppLayout>
  );
};

export default ClientCaseDetail;
