import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { type Result, type Source, type SourcesFile, type PipelineDocumentType, ok, err } from "./types.js";

interface RawSource {
  scpi?: unknown;
  pageUrl?: unknown;
  document_type?: unknown;
  ra_year?: unknown;
  nom?: unknown;
  societe_gestion?: unknown;
}

const VALID_DOCUMENT_TYPES = new Set<string>(["bulletin_trimestriel", "rapport_annuel"]);

function isSourcesFile(raw: unknown): raw is { sources: RawSource[] } {
  if (typeof raw !== "object" || raw === null) return false;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj["sources"])) return false;
  for (const s of obj["sources"] as RawSource[]) {
    if (typeof s !== "object" || s === null) return false;
    if (typeof s["scpi"] !== "string" || s["scpi"].trim() === "") return false;
    if (typeof s["pageUrl"] !== "string" || s["pageUrl"].trim() === "") return false;
    if (s["document_type"] !== undefined && !VALID_DOCUMENT_TYPES.has(String(s["document_type"]))) return false;
    if (s["ra_year"] !== undefined && typeof s["ra_year"] !== "number") return false;
  }
  return true;
}

function toSource(raw: RawSource): Source {
  const scpi = (raw.scpi as string).trim();
  const pageUrl = (raw.pageUrl as string).trim();
  const document_type = (raw.document_type as PipelineDocumentType | undefined) ?? "bulletin_trimestriel";
  const ra_year = raw.ra_year as number | undefined;
  const id = document_type === "rapport_annuel" ? `${scpi}:ra` : scpi;
  const nom = typeof raw.nom === "string" && raw.nom.trim() !== "" ? raw.nom.trim() : undefined;
  const societe_gestion = typeof raw.societe_gestion === "string" && raw.societe_gestion.trim() !== "" ? raw.societe_gestion.trim() : undefined;
  return {
    scpi,
    pageUrl,
    id,
    document_type,
    ...(ra_year !== undefined ? { ra_year } : {}),
    ...(nom !== undefined ? { nom } : {}),
    ...(societe_gestion !== undefined ? { societe_gestion } : {}),
  };
}

export function loadSources(filePath: string): Result<SourcesFile> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    return err(`sources file not found: ${resolved}`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolved, "utf-8");
  } catch (e) {
    return err(`failed to read sources file: ${String(e)}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (e) {
    return err(`failed to parse YAML: ${String(e)}`);
  }

  if (!isSourcesFile(parsed)) {
    return err(
      "sources.yaml has invalid structure — expected { sources: [{ scpi, pageUrl }] }"
    );
  }

  if (parsed.sources.length === 0) {
    return err("sources.yaml contains no sources");
  }

  const sources: Source[] = parsed.sources.map(toSource);
  return ok({ sources });
}
