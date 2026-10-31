import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Fail-closed publisher for the 66 active SCPI. Crawlers stage documents only.
// This worker promotes issuer-origin, same-period, SHA-256-anchored and
// independently page-certified metrics. Missing or contradictory proof => hold.
const CORE = ["tof", "capitalisation", "prix_souscription"];
const UNIT_MAP: Record<string,string> = {tof:"%",top:"%",td:"%",endettement:"%",capitalisation:"M€",prix_souscription:"€",prix_retrait:"€",prix_reconstitution:"€",valeur_realisation:"€",distribution_par_part:"€/part",nombre_parts:"parts",parts_attente_retrait:"parts",nombre_associes:"associés",nombre_immeubles:"immeubles",nombre_locataires:"locataires",walt:"ans",walb:"ans"};

const SAFE_FIELDS = new Set([
  "tof", "top", "capitalisation", "prix_souscription", "prix_retrait",
  "endettement", "walt", "walb", "collecte_nette", "nombre_locataires",
  "nombre_immeubles", "nombre_associes", "nombre_parts",
  "parts_attente_retrait", "retraits_executes_trimestre",
  "distribution_par_part", "nb_cessions_trimestre",
]);
const SKIPPED_DATED_METRICS = new Set(["prix_reconstitution", "valeur_realisation", "td", "td_annee"]);
const PERIOD = /^20\d{2}-T[1-4]$/;
const SHA = /^[0-9a-f]{64}$/;
const positive = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const currentQuarter = () => {
  const d = new Date();
  return d.getUTCFullYear() * 10 + Math.floor(d.getUTCMonth() / 3) + 1;
};
const periodKey = (s: string) => PERIOD.test(s) ? Number(s.slice(0, 4)) * 10 + Number(s.at(-1)) : 0;
const sha256 = async (v: string) => {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

type Candidate = {
  id: string; scpi_slug: string; period: string;
  qa_status: string; pdf_sha256: string | null; source_url: string;
  extraction_confidence: number | null; extraction_json: any;
};

function gate(b: Candidate, allowedHosts: string[], certs: any[], current: any):
  { ok: boolean; reason: string; patch?: Record<string, unknown> } {
  if (b.qa_status !== "auto_verified") return {ok:false,reason:"NOT_FULLY_PARSED"};
  if (!PERIOD.test(b.period) || periodKey(b.period) > currentQuarter()) return {ok:false,reason:"INVALID_PERIOD"};
  if (!SHA.test(String(b.pdf_sha256 || ""))) return {ok:false,reason:"PDF_SHA_MISSING"};
  if (!b.source_url?.startsWith("https://")) return {ok:false,reason:"NON_HTTPS_SOURCE"};
  let host: string;
  try { host = new URL(b.source_url).hostname.toLowerCase(); } catch {return {ok:false,reason:"INVALID_SOURCE_URL"};}
  if (!allowedHosts.includes(host)) return {ok:false,reason:"NON_ISSUER_HOST"};
  if (periodKey(String(current?.source_period || "")) >= periodKey(b.period)) return {ok:false,reason:"NOT_NEWER"};
  if (!current?.scpi_slug || !current?.updated_at) return {ok:false,reason:"MISSING_CURRENT_SNAPSHOT"};
  if ((Number(b.extraction_confidence) || 0) < 0.95) return {ok:false,reason:"LOW_CONFIDENCE"};
  const ex = b.extraction_json || {};
  if (!ex.evidence_version || ex.evidence_stats?.source_kind !== "pdf") return {ok:false,reason:"NO_INDEPENDENT_PDF_PAGE_QA"};
  if (Number(ex.evidence_stats?.coverage || 0) < 1) return {ok:false,reason:"INCOMPLETE_FIELD_EVIDENCE"};
  const values = ex.metrics || {};
  if (!CORE.every((k) => positive(values[k]))) return {ok:false,reason:"MISSING_CORE_INDICATOR"};
  const fields = Object.entries(values).filter(([,v]) => typeof v === "number");
  if (fields.length < 8) return {ok:false,reason:"INSUFFICIENT_METRICS"};
  const proof = new Map<string, any>();
  for (const c of certs) {
    if (proof.has(c.metric)) return {ok:false,reason:"CONFLICTING_CERTIFICATION"};
    proof.set(c.metric, c);
  }
  for (const [metric, value] of fields) {
    if (metric === "td_annee") continue;
    if (metric === "tof" && /\\bTOF\\s+(?:financier\\s+)?ASPIM\\b/i.test(String(ex.evidence?.tof?.text || ""))) {
      return {ok:false,reason:"FORBIDDEN_ASPIM_TOF"};
    }
    const cert = proof.get(metric), ev = ex.evidence?.[metric];
    if (!cert || cert.bulletin_id !== b.id ||
        cert.verification_status !== "auto_verified_with_evidence" ||
        cert.verification_method !== "pdf_page_text_match" ||
        (UNIT_MAP[metric] && cert.unit !== UNIT_MAP[metric]) ||
        cert.source_url !== b.source_url ||
        !(Number(cert.source_page) > 0) ||
        ev?.method !== "pdf_page_text_match" || ev?.value_match !== true ||
        Number(ev?.page) !== Number(cert.source_page) ||
        !positive(Number(value)) ||
        Math.abs(Number(cert.value_numeric) - Number(value)) > 0.00001) {
      return {ok:false,reason:"UNCERTIFIED_FIELD:" + metric};
    }
  }
  // Do not overwrite dated valuations or last annual TD with a quarterly
  // value until issuer-specific reference dates have also been certified.
  const patch: Record<string, unknown> = {};
  const provenance: Record<string, unknown> = {};
  for (const [metric, val] of fields) {
    if (SKIPPED_DATED_METRICS.has(metric) || !SAFE_FIELDS.has(metric)) continue;
    patch[metric] = val;
    provenance[metric] = {
      source_period: b.period, source_url: b.source_url,
      source_sha256: b.pdf_sha256, source_page: proof.get(metric).source_page,
      verification_status: "auto_verified_with_evidence",
    };
  }
  // Two independent checks prevent a plausible-looking but contradictory
  // PDF from being promoted, even when every number matches some page.
  const cap = Number(patch.capitalisation), nParts = Number(patch.nombre_parts), part = Number(patch.prix_souscription);
  if (positive(nParts) && positive(part)) {
    const implied = (nParts * part) / 1e6;
    if (!implied || Math.abs(cap / implied - 1) > 0.08) return {ok:false,reason:"CAPITALISATION_PARTS_MISMATCH"};
  }
  // A TOF under 50% requires independent review; e.g. OCR may parse 0.07 instead of 87%.
  if (positive(patch.tof) && Number(patch.tof) < 50) return {ok:false,reason:"MATERIAL_TOF_QA_REQUIRED"};
  if (positive(patch.tof) && (Number(patch.tof) < 0 || Number(patch.tof) > 100))
    return {ok:false,reason:"TOF_OUT_OF_RANGE"};
  if (positive(patch.endettement) && (Number(patch.endettement) < 0 || Number(patch.endettement) > 80))
    return {ok:false,reason:"DEBT_OUT_OF_RANGE"};
  // Missing fields remain untouched; no N.D.->0 substitution.
  patch.metric_provenance = { ...(current.metric_provenance || {}), ...provenance };
  return {ok:true,reason:"PAGE_CERTIFIED",patch};
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return Response.json({error:"POST required"},{status:405});
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !key) return Response.json({error:"Missing service configuration"},{status:500});
  const db = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const token = req.headers.get("x-cron-token") || "";
  const {data:cfg,error:cfgErr} = await db.from("scpi_bulletin_runtime_config")
    .select("value").eq("key","cron_token_sha256").maybeSingle();
  if (cfgErr || !token || !cfg || (await sha256(token)) !== cfg.value)
    return Response.json({error:"unauthorized"},{status:401});
  let body: any = {};
  try { body = await req.json(); } catch {}
  const dryRun = body.dry_run !== false; // default: shadow mode; explicit activation only
  const limit = Math.max(1, Math.min(5,Number(body.limit) || 3));
  const {data:items,error} = await db.from("scpi_bulletins")
    .select("id,scpi_slug,period,qa_status,pdf_sha256,source_url,extraction_confidence,extraction_json")
    .eq("qa_status","auto_verified")
    .order("found_at",{ascending:false}).limit(350);
  if(error) return Response.json({error:error.message},{status:500});
  const targetSlug = typeof body.slug === "string" ? body.slug.trim() : "";
  const candidates = (items || []).filter((b: Candidate) =>
    PERIOD.test(b.period) && b.extraction_json?.evidence_version && (!targetSlug || b.scpi_slug === targetSlug)
  ) as Candidate[];
  const results: Array<Record<string,unknown>> = [];
  // Rotate through candidate slugs every run. Persistent rejects may not
  // monopolize the first entries and starve other certified bulletins.
  const offset = candidates.length ? (Math.floor(Date.now() / 1_800_000) * 20) % candidates.length : 0;
  const ordered = [...candidates.slice(offset), ...candidates.slice(0, offset)];
  let inspected = 0;
  let eligible = 0;
  for (const b of ordered) {
    if (inspected++ >= 20 || eligible >= limit) break;
    const [{data:active},{data:connector},{data:registry},{data:current},{data:certs}] = await Promise.all([
      db.from("scpi_trajectory_pilot").select("enabled").eq("scpi_slug",b.scpi_slug).maybeSingle(),
      db.from("scpi_source_connectors").select("enabled,allowed_hosts").eq("scpi_slug",b.scpi_slug).maybeSingle(),
      db.from("scpi_source_registry").select("automation_enabled").eq("scpi_slug",b.scpi_slug).maybeSingle(),
      db.from("scpi_indicators").select("*").eq("scpi_slug",b.scpi_slug).maybeSingle(),
      db.from("scpi_metric_certifications")
        .select("metric,value_numeric,unit,source_page,source_url,bulletin_id,verification_status,verification_method")
        .eq("scpi_slug",b.scpi_slug).eq("source_period",b.period).eq("bulletin_id",b.id).limit(100),
    ]);
    if (!active?.enabled || !connector?.enabled || !registry?.automation_enabled || !current) continue;
    if (periodKey(String(current.source_period||"")) >= periodKey(b.period)) continue;
    const decision = gate(b,(connector.allowed_hosts||[]).map((s:string)=>s.toLowerCase()),certs||[],current);
    if (!decision.ok) {
      results.push({scpi_slug:b.scpi_slug,period:b.period,status:"held",reason:decision.reason});
      continue;
    }
    if (dryRun) {
      eligible++;
      results.push({scpi_slug:b.scpi_slug,period:b.period,status:"eligible_shadow",fields:Object.keys(decision.patch||{})});
      continue;
    }
    // One PostgreSQL transaction: checked live-row update AND publish intent.
    // Any trigger, consistency or queue error rolls back the entire promotion.
    const {data:committed,error:commitError} = await db.rpc("scpi_commit_certified_promotion",{
      p_slug:b.scpi_slug,p_expected_period:current.source_period,
      p_expected_updated_at:current.updated_at,p_bulletin_id:b.id,
      p_period:b.period,p_patch:decision.patch,
      p_payload:{
        source:"scpi-certified-promote",bulletin_id:b.id,source_period:b.period,
        pdf_sha256:b.pdf_sha256,certification:"issuer_pdf_page_evidence_100pct",
        frontend_status:"pending_release_and_ui_parity",
      },
    });
    if (commitError || committed?.status !== "committed_pending_frontend") {
      results.push({scpi_slug:b.scpi_slug,period:b.period,status:"held",
        reason:commitError?.message || "ATOMIC_COMMIT_FAILED"});
      continue;
    }
    // Readback is an additional audit; the transaction itself owns atomicity.
    const {data:after,error:readError} = await db.from("scpi_indicators")
      .select("source_period,bulletin_id,tof,capitalisation,prix_souscription")
      .eq("scpi_slug",b.scpi_slug).maybeSingle();
    const readbackOk = !readError && after?.source_period === b.period &&
      after?.bulletin_id === b.id &&
      Number(after?.tof) === Number(committed.tof) &&
      Number(after?.capitalisation) === Number(committed.capitalisation);
    const status = readbackOk ? "promoted_db_pending_frontend" : "committed_readback_review";
    await db.from("scpi_ingestion_events").insert({
      scpi_slug:b.scpi_slug,step:"certified_promotion",
      status:readbackOk?"updated":"needs_review",
      source_period:b.period,bulletin_url:b.source_url,
      metrics_count:Object.keys(decision.patch||{}).length-1,
      message:status+"; publication front-end séparée",
      ended_at:new Date().toISOString(),
    });
    if (readbackOk) eligible++;
    results.push({scpi_slug:b.scpi_slug,period:b.period,status});
  }
  return Response.json({ok:true,mode:dryRun?"shadow":"promotion",scanned:candidates.length,inspected:Math.min(inspected,20),eligible,results});
});
