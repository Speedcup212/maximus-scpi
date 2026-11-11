// RECOVERY-201 — Email 1 « Votre simulation SCPI » et inscription à la séquence Brevo.
//
// Déployée SANS vérification JWT (supabase functions deploy send-simulation-email --no-verify-jwt).
// La sécurité repose sur les contrôles serveur ci-dessous, pas sur l'appelant :
//   - la ligne est relue en base par request_id (le contenu envoyé par le navigateur est ignoré) ;
//   - form_type = lead_simulation_email, ligne de moins de 15 minutes, envoi unique ;
//   - au plus 3 envois par adresse sur 24 heures ;
//   - valeurs numériques bornées, aucun texte libre à part le prénom nettoyé (40 caractères).
// Secret obligatoire : BREVO_API_KEY.
// Facultatifs (priment sur les valeurs par défaut ci-dessous) : BREVO_SIM_TEMPLATE_ID, BREVO_SIM_LIST_ID, SIM_REPLY_TO.
// Aucune donnée personnelle n'est renvoyée dans la réponse ni écrite dans les journaux.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  MAX_SENDS_PER_24H,
  buildContactAttributes,
  buildEmailParams,
  cleanPrenom,
  isFresh,
  validateAnswers,
} from "./logic.ts";

const ALLOWED_ORIGINS = new Set([
  "https://maximusscpi.com",
  "https://www.maximusscpi.com",
  "http://localhost:5173",
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BREVO_API = "https://api.brevo.com/v3";

// Objets Brevo créés le 11/11/2026 pour RECOVERY-201 (modèle n° 6, liste n° 6).
const DEFAULT_TEMPLATE_ID = 6;
const DEFAULT_LIST_ID = 6;
const DEFAULT_REPLY_TO = "eric.bellaiche@maximusscpi.com";

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://www.maximusscpi.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" }, origin);
  }

  let requestId = "";
  try {
    const body = await req.json();
    requestId = String(body?.request_id ?? "");
  } catch {
    return json(400, { ok: false, error: "invalid_json" }, origin);
  }
  if (!UUID.test(requestId)) {
    return json(400, { ok: false, error: "invalid_request_id" }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("send-simulation-email: missing Supabase service configuration");
    return json(500, { ok: false, error: "server_not_configured" }, origin);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: lead, error: leadError } = await supabase
    .from("contact_submissions")
    .select("id, created_at, form_type, context_slug, email, prenom, answers, consentement_marketing, consentement_date, confirmation_sent_at")
    .eq("request_id", requestId)
    .maybeSingle();

  if (leadError) {
    console.error("send-simulation-email: lookup failed");
    return json(500, { ok: false, error: "lookup_failed" }, origin);
  }
  if (!lead || lead.form_type !== "lead_simulation_email" || lead.confirmation_sent_at) {
    return json(200, { ok: true, skipped: true }, origin);
  }
  if (!isFresh(String(lead.created_at))) {
    return json(200, { ok: true, skipped: true }, origin);
  }

  const recordError = async (code: string) => {
    await supabase.from("contact_submissions").update({ confirmation_error: code }).eq("id", lead.id);
  };

  const email = String(lead.email ?? "").trim().toLowerCase();
  if (!email) {
    await recordError("missing_email");
    return json(200, { ok: false, error: "missing_email" }, origin);
  }

  // Limite d'envois par adresse.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("form_type", "lead_simulation_email")
    .not("confirmation_sent_at", "is", null)
    .gte("created_at", since);

  if (countError) {
    await recordError("rate_check_failed");
    return json(500, { ok: false, error: "rate_check_failed" }, origin);
  }
  if ((count ?? 0) >= MAX_SENDS_PER_24H) {
    await recordError("rate_limited");
    return json(200, { ok: true, skipped: true }, origin);
  }

  const answers = validateAnswers(lead.answers);
  if (!answers) {
    await recordError("invalid_payload");
    return json(200, { ok: false, error: "invalid_payload" }, origin);
  }

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const templateId = Number(Deno.env.get("BREVO_SIM_TEMPLATE_ID") ?? DEFAULT_TEMPLATE_ID);
  const listId = Number(Deno.env.get("BREVO_SIM_LIST_ID") ?? DEFAULT_LIST_ID);
  const replyTo = Deno.env.get("SIM_REPLY_TO") ?? DEFAULT_REPLY_TO;
  const missing = [
    !brevoApiKey && "BREVO_API_KEY",
    !(templateId > 0) && "BREVO_SIM_TEMPLATE_ID",
    !(listId > 0) && "BREVO_SIM_LIST_ID",
    !replyTo && "SIM_REPLY_TO",
  ].filter(Boolean);
  if (missing.length > 0) {
    await recordError(`missing_secret:${missing.join(",")}`);
    console.error("send-simulation-email: missing secrets", missing.join(","));
    return json(500, { ok: false, error: "missing_secret" }, origin);
  }

  const prenom = cleanPrenom(lead.prenom);
  const source = String(lead.context_slug ?? "");
  const brevoHeaders = {
    accept: "application/json",
    "api-key": brevoApiKey as string,
    "content-type": "application/json",
  };

  // Email 1 : transactionnel, envoyé à tous (le service a été demandé).
  const sendResponse = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: brevoHeaders,
    body: JSON.stringify({
      to: [prenom ? { email, name: prenom } : { email }],
      templateId,
      replyTo: { email: replyTo },
      params: buildEmailParams(answers, prenom, source),
    }),
  }).catch(() => null);

  if (!sendResponse || !sendResponse.ok) {
    const code = `brevo_send_${sendResponse ? sendResponse.status : "network"}`;
    await recordError(code);
    console.error("send-simulation-email:", code);
    return json(502, { ok: false, error: "send_failed" }, origin);
  }

  // Séquence : uniquement avec la case cochée.
  let contactError: string | null = null;
  if (lead.consentement_marketing === true) {
    const contactResponse = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        email,
        attributes: buildContactAttributes(answers, prenom, source, lead.consentement_date ?? null),
        listIds: [listId],
        updateEnabled: true,
      }),
    }).catch(() => null);

    if (!contactResponse || !contactResponse.ok) {
      contactError = `brevo_contact_${contactResponse ? contactResponse.status : "network"}`;
      console.error("send-simulation-email:", contactError);
    }
  }

  await supabase
    .from("contact_submissions")
    .update({ confirmation_sent_at: new Date().toISOString(), confirmation_error: contactError })
    .eq("id", lead.id);

  return json(200, { ok: true }, origin);
});
