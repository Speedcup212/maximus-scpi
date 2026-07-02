import { supabase } from '../lib/supabase';
import type {
  ExpertClientDossier,
  ExpertSimulationSnapshot,
  ExpertSimulationSummary,
  ExpertHoldingSimulationInputs,
  ExpertHoldingSimulationResults,
  ExpertGeneratedReport,
} from '../types/expertDossier';
import type { HoldingISInputs, HoldingISResult } from './holdingSimulation';

/* ── Types bruts Supabase ── */

interface ExpertDossierRow {
  id: string;
  user_id: string;
  org_id?: string | null;
  client_name: string;
  company_type: string;
  siret?: string | null;
  manager_name?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ExpertSimulationRow {
  id: string;
  dossier_id: string;
  user_id: string;
  label: string;
  inputs: HoldingISInputs;
  results: HoldingISResult;
  pdf_generated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDossierPayload {
  clientName: string;
  companyType: string;
  siret?: string;
  managerName?: string;
  notes?: string;
}

export interface SaveSimulationPayload {
  dossierId: string;
  label: string;
  inputs: HoldingISInputs;
  results: HoldingISResult;
}

/* ── Auth ── */

async function requireUser() {
  if (!supabase) throw new Error('Supabase non configuré');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    window.location.href = '/expert-comptable/login';
    throw new Error('Non authentifié');
  }
  return data.user;
}

/* ── Helpers mapping ── */

function buildSummary(inputs: HoldingISInputs, results: HoldingISResult): ExpertSimulationSummary {
  return {
    companyType: inputs.companyType,
    treasuryAvailable: inputs.availableCash,
    totalCashEffort: results.effortEconomique,
    residualTreasury: inputs.availableCash - results.effortEconomique,
    usufruitAmount: inputs.usufruitInvestment,
    usufruitDuration: inputs.usufruitDuration,
    usufruitKey: inputs.usufruitKeyPercent,
    grossDistributionRate: inputs.grossYieldRate,
    yearOneNetCashFlow: results.annualNetCashFlowAfterFees,
    yearOneTaxImpact: results.annualISImpact,
    averageAnnualNetYield: results.netCompanyYieldAvgAnnual,
    cumulativeNetCashFlow: results.cumulativeNetCashFlowAfterFees,
    gainNetAfterUsufructExtinction: results.gainNetAfterUsufructExtinction,
    annualizedSimpleReturnAfterExtinction: results.annualizedSimpleReturnAfterExtinction,
    cashFlowAverageReturn: results.cashFlowAverageReturn,
    recoverableVatAmount: results.recoverableVatAmount,
    nonRecoverableVatAmount: results.nonRecoverableVatAmount,
  };
}

function mapSimulationRow(row: ExpertSimulationRow): ExpertSimulationSnapshot {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    label: row.label,
    inputs: row.inputs as unknown as ExpertHoldingSimulationInputs,
    results: row.results as unknown as ExpertHoldingSimulationResults,
    summary: buildSummary(row.inputs, row.results),
  };
}

function mapDossierRow(row: ExpertDossierRow, simulations: ExpertSimulationSnapshot[]): ExpertClientDossier {
  return {
    id: row.id,
    clientName: row.client_name,
    companyType: row.company_type,
    siret: row.siret || undefined,
    managerName: row.manager_name || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    simulations,
    notes: row.notes || undefined,
  };
}

/* ── CRUD Dossiers ── */

export async function getExpertDossiers(): Promise<ExpertClientDossier[]> {
  const user = await requireUser();

  const { data: dossiers, error } = await supabase!
    .from('expert_client_dossiers')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  if (!dossiers || dossiers.length === 0) return [];

  const dossierIds = (dossiers as ExpertDossierRow[]).map((d) => d.id);

  const { data: sims } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .in('dossier_id', dossierIds)
    .order('created_at', { ascending: true });

  const simsByDossier = new Map<string, ExpertSimulationSnapshot[]>();
  (sims || []).forEach((s: ExpertSimulationRow) => {
    const list = simsByDossier.get(s.dossier_id) || [];
    list.push(mapSimulationRow(s));
    simsByDossier.set(s.dossier_id, list);
  });

  return (dossiers as ExpertDossierRow[]).map((d) =>
    mapDossierRow(d, simsByDossier.get(d.id) || [])
  );
}

export async function getExpertDossierById(
  dossierId: string
): Promise<ExpertClientDossier | null> {
  const user = await requireUser();

  const { data: dossier, error } = await supabase!
    .from('expert_client_dossiers')
    .select('*')
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!dossier) return null;

  const { data: sims } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: true });

  const simulations = (sims || []).map((s: ExpertSimulationRow) => mapSimulationRow(s));

  return mapDossierRow(dossier as ExpertDossierRow, simulations);
}

export async function createExpertDossier(
  payload: CreateDossierPayload
): Promise<ExpertClientDossier> {
  const user = await requireUser();
  const now = new Date().toISOString();

  const { data, error } = await supabase!
    .from('expert_client_dossiers')
    .insert({
      user_id: user.id,
      client_name: payload.clientName,
      company_type: payload.companyType,
      siret: payload.siret || null,
      manager_name: payload.managerName || null,
      notes: payload.notes || null,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapDossierRow(data as ExpertDossierRow, []);
}

export async function findOrCreateDossier(
  clientName: string,
  companyType: string
): Promise<ExpertClientDossier> {
  const user = await requireUser();

  // Chercher un dossier existant pour ce user avec le même nom
  const { data: existing } = await supabase!
    .from('expert_client_dossiers')
    .select('*')
    .eq('user_id', user.id)
    .eq('client_name', clientName)
    .maybeSingle();

  if (existing) {
    const { data: sims } = await supabase!
      .from('expert_holding_simulations')
      .select('*')
      .eq('dossier_id', (existing as ExpertDossierRow).id)
      .order('created_at', { ascending: true });
    const simulations = (sims || []).map((s: ExpertSimulationRow) => mapSimulationRow(s));
    return mapDossierRow(existing as ExpertDossierRow, simulations);
  }

  return createExpertDossier({ clientName, companyType });
}

export async function updateExpertDossier(
  dossierId: string,
  payload: Partial<CreateDossierPayload & { status?: string }>
): Promise<ExpertClientDossier> {
  const user = await requireUser();
  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = { updated_at: now };
  if (payload.clientName !== undefined) updatePayload.client_name = payload.clientName;
  if (payload.companyType !== undefined) updatePayload.company_type = payload.companyType;
  if (payload.siret !== undefined) updatePayload.siret = payload.siret;
  if (payload.managerName !== undefined) updatePayload.manager_name = payload.managerName;
  if (payload.notes !== undefined) updatePayload.notes = payload.notes;
  if (payload.status !== undefined) updatePayload.status = payload.status;

  const { data, error } = await supabase!
    .from('expert_client_dossiers')
    .update(updatePayload)
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new Error('Accès non autorisé à ce dossier.');
    throw error;
  }

  return mapDossierRow(data as ExpertDossierRow, []);
}

export async function deleteExpertDossier(dossierId: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase!
    .from('expert_client_dossiers')
    .delete()
    .eq('id', dossierId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function duplicateExpertDossier(
  dossierId: string
): Promise<ExpertClientDossier> {
  const user = await requireUser();

  // Récupérer le dossier source
  const { data: src, error: srcErr } = await supabase!
    .from('expert_client_dossiers')
    .select('*')
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (srcErr || !src) throw new Error('Dossier source introuvable.');
  const srcRow = src as ExpertDossierRow;

  const now = new Date().toISOString();

  // Créer la copie
  const { data: copy, error: copyErr } = await supabase!
    .from('expert_client_dossiers')
    .insert({
      user_id: user.id,
      client_name: `${srcRow.client_name} (copie)`,
      company_type: srcRow.company_type,
      siret: srcRow.siret,
      manager_name: srcRow.manager_name,
      notes: srcRow.notes ? `${srcRow.notes}\n\n[Copié depuis le dossier "${srcRow.client_name}"]` : null,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (copyErr) throw copyErr;

  // Copier les simulations
  const { data: srcSims } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: true });

  if (srcSims && srcSims.length > 0) {
    const simCopies = (srcSims as ExpertSimulationRow[]).map((s) => ({
      dossier_id: (copy as ExpertDossierRow).id,
      user_id: user.id,
      label: s.label,
      inputs: s.inputs,
      results: s.results,
      created_at: now,
      updated_at: now,
    }));

    await supabase!.from('expert_holding_simulations').insert(simCopies);
  }

  // Récupérer les simulations copiées
  const { data: newSims } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .eq('dossier_id', (copy as ExpertDossierRow).id)
    .order('created_at', { ascending: true });

  const simulations = (newSims || []).map((s: ExpertSimulationRow) => mapSimulationRow(s));

  return mapDossierRow(copy as ExpertDossierRow, simulations);
}

/* ── Simulations ── */

export async function getExpertDossierSimulations(
  dossierId: string
): Promise<ExpertSimulationSnapshot[]> {
  const user = await requireUser();

  const { data, error } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .eq('dossier_id', dossierId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((s: ExpertSimulationRow) => mapSimulationRow(s));
}

export async function saveExpertHoldingSimulation(
  payload: SaveSimulationPayload
): Promise<ExpertSimulationSnapshot> {
  const user = await requireUser();
  const now = new Date().toISOString();

  // Vérifier que le dossier appartient bien au user
  const { data: dossier, error: dossierErr } = await supabase!
    .from('expert_client_dossiers')
    .select('id')
    .eq('id', payload.dossierId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (dossierErr || !dossier) {
    throw new Error('Accès non autorisé à ce dossier.');
  }

  const { data, error } = await supabase!
    .from('expert_holding_simulations')
    .insert({
      dossier_id: payload.dossierId,
      user_id: user.id,
      label: payload.label,
      inputs: payload.inputs as unknown as Record<string, unknown>,
      results: payload.results as unknown as Record<string, unknown>,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw error;

  // Mettre à jour le updated_at du dossier parent
  await supabase!
    .from('expert_client_dossiers')
    .update({ updated_at: now })
    .eq('id', payload.dossierId);

  return mapSimulationRow(data as ExpertSimulationRow);
}

export async function getExpertSimulationById(
  simulationId: string
): Promise<ExpertSimulationSnapshot | null> {
  const { data, error } = await supabase!
    .from('expert_holding_simulations')
    .select('*')
    .eq('id', simulationId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSimulationRow(data as ExpertSimulationRow);
}

export async function deleteExpertHoldingSimulation(
  simulationId: string
): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase!
    .from('expert_holding_simulations')
    .delete()
    .eq('id', simulationId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/* ── Rapports PDF / Storage ── */

export async function uploadExpertReport(
  dossierId: string,
  simulationId: string,
  pdfBlob: Blob,
  fileName: string,
): Promise<string> {
  const user = await requireUser();
  const storagePath = `${user.id}/${dossierId}/${simulationId}/${fileName}`;

  const { error: uploadErr } = await supabase!.storage
    .from('expert-reports')
    .upload(storagePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadErr) {
    console.error('[uploadExpertReport] Storage upload error:', uploadErr);
    throw new Error('Upload Supabase impossible.');
  }

  // Insert nouvelle ligne (permet plusieurs versions datées)
  const now = new Date().toISOString();
  const { error: insertErr } = await supabase!
    .from('expert_generated_reports')
    .insert({
      dossier_id: dossierId,
      simulation_id: simulationId,
      user_id: user.id,
      report_type: 'holding_is',
      file_name: fileName,
      storage_path: storagePath,
      generated_at: now,
    });

  if (insertErr) {
    console.error('[uploadExpertReport] DB insert error:', insertErr);
    throw new Error('Rapport généré mais non enregistré.');
  }

  return storagePath;
}

export async function getExpertReportSignedUrl(
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase!.storage
    .from('expert-reports')
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

export async function getExpertReportsByDossier(
  dossierId: string,
): Promise<ExpertGeneratedReport[]> {
  const user = await requireUser();

  const { data, error } = await supabase!
    .from('expert_generated_reports')
    .select('*')
    .eq('dossier_id', dossierId)
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((r: ExpertReportRow) => ({
    id: r.id,
    dossierId: r.dossier_id,
    simulationId: r.simulation_id,
    userId: r.user_id,
    reportType: r.report_type,
    fileName: r.file_name,
    storagePath: r.storage_path,
    generatedAt: r.generated_at,
  }));
}

export async function deleteExpertReport(reportId: string): Promise<void> {
  const user = await requireUser();

  const { data: report, error: fetchErr } = await supabase!
    .from('expert_generated_reports')
    .select('storage_path')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr || !report) throw new Error('Rapport introuvable.');

  const row = report as ExpertReportRow;

  // Delete from storage
  await supabase!.storage
    .from('expert-reports')
    .remove([row.storage_path]);

  // Delete from DB
  const { error: delErr } = await supabase!
    .from('expert_generated_reports')
    .delete()
    .eq('id', reportId);

  if (delErr) throw delErr;
}

interface ExpertReportRow {
  id: string;
  dossier_id: string;
  simulation_id?: string;
  user_id: string;
  report_type: string;
  file_name: string;
  storage_path: string;
  generated_at: string;
}
