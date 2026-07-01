import type {
  ExpertClientDossier,
  ExpertSimulationSnapshot,
} from '../types/expertDossier';

const STORAGE_KEY = 'maximus_expert_client_dossiers';

/* ── Accès localStorage ── */

function loadAll(): ExpertClientDossier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveAll(dossiers: ExpertClientDossier[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
}

/* ── API publique ── */

export function getExpertDossiers(): ExpertClientDossier[] {
  return loadAll();
}

export function getExpertDossierById(id: string): ExpertClientDossier | undefined {
  return loadAll().find((d) => d.id === id);
}

export function saveExpertDossier(dossier: ExpertClientDossier): void {
  const all = loadAll();
  const idx = all.findIndex((d) => d.id === dossier.id);
  if (idx >= 0) {
    all[idx] = dossier;
  } else {
    all.push(dossier);
  }
  saveAll(all);
}

export function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60) || 'dossier';
}

/* ── Sauvegarde d'une simulation ── */

export interface SaveSimulationParams {
  dossierName: string;
  companyType: string;
  title: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  summary: ExpertSimulationSnapshot['summary'];
}

export function saveSimulationToExpertDossier(params: SaveSimulationParams): ExpertClientDossier {
  const now = new Date().toISOString();
  const slug = createSlugFromName(params.dossierName);
  const id = `${slug}_${Date.now()}`;

  const snapshot: ExpertSimulationSnapshot = {
    id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    title: params.title,
    inputs: params.inputs,
    results: params.results,
    summary: params.summary,
  };

  const all = loadAll();
  let dossier = all.find((d) => d.name === params.dossierName);

  if (dossier) {
    dossier.simulations.push(snapshot);
    dossier.updatedAt = now;
    dossier.companyType = params.companyType;
  } else {
    dossier = {
      id,
      name: params.dossierName,
      companyType: params.companyType,
      createdAt: now,
      updatedAt: now,
      simulations: [snapshot],
    };
  }

  saveExpertDossier(dossier);
  return dossier;
}
