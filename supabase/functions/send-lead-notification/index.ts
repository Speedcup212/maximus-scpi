import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { buildLeadAlert, type LeadRow } from "./logic.ts";

// RECOVERY-204 — reprend la version 12 déployée (anti-relais, anti-doublon,
// expéditeur leads@maximusscpi.com) et remplace le contenu brut par une
// alerte lisible construite depuis la ligne enregistrée en base, avec
// « Répondre » adressé directement au prospect.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_EMAIL = "leads@maximusscpi.com";
const FROM_NAME = "MaximusSCPI";
const LEAD_COLUMNS = [
  "request_id", "created_at", "email", "prenom", "nom", "telephone", "form_type", "channel",
  "context_slug", "page_url", "utm_source", "utm_medium", "utm_campaign", "gclid", "message",
  "answers", "consentement_marketing", "consentement_date", "notified_at",
].join(",");

function serviceConfig() {
  return {
    supabaseUrl: Deno.env.get("SUPABASE_URL"),
    serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function loadLead(requestId: string): Promise<(LeadRow & { notified_at?: string | null }) | null> {
  const { supabaseUrl, serviceRoleKey } = serviceConfig();
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service credentials unavailable");

  const response = await fetch(
    `${supabaseUrl}/rest/v1/contact_submissions?request_id=eq.${encodeURIComponent(requestId)}&select=${LEAD_COLUMNS}&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!response.ok) throw new Error(`Lead lookup failed (${response.status})`);
  const rows = await response.json();
  return rows?.[0] ?? null;
}

async function markNotification(requestId: string | undefined, ok: boolean, error?: string) {
  if (!requestId) return;
  const { supabaseUrl, serviceRoleKey } = serviceConfig();
  if (!supabaseUrl || !serviceRoleKey) return;

  const body = ok
    ? { notified_at: new Date().toISOString(), notified_error: null }
    : { notified_error: (error || "Unknown notification error").slice(0, 2000) };

  const response = await fetch(
    `${supabaseUrl}/rest/v1/contact_submissions?request_id=eq.${encodeURIComponent(requestId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) console.error("Could not persist notification status:", response.status, await response.text());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  let requestId: string | undefined;
  try {
    const payload = await req.json();
    requestId = typeof payload?.request_id === "string" ? payload.request_id : undefined;
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";

    if (!requestId || !email) {
      return new Response(JSON.stringify({ ok: false, error: "request_id and email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Public invocation is allowed for the website, but the function only sends
    // mail for a lead that was actually persisted first. This prevents using
    // the endpoint as an arbitrary email relay.
    const storedLead = await loadLead(requestId);
    if (!storedLead || String(storedLead.email || "").trim().toLowerCase() !== email) {
      return new Response(JSON.stringify({ ok: false, error: "lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: browser retries must not generate duplicate admin emails.
    if (storedLead.notified_at) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "eric.bellaiche@gmail.com";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    // Contenu construit depuis la base (source de vérité), jamais depuis le
    // navigateur.
    const alert = buildLeadAlert(storedLead);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        ...(alert.replyTo ? { reply_to: alert.replyTo } : {}),
        subject: alert.subject,
        text: alert.text,
        html: alert.html,
      }),
    });

    const raw = await r.text();
    if (!r.ok) {
      const error = `Resend error: ${raw}`;
      await markNotification(requestId, false, error);
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(raw);
    await markNotification(requestId, true);
    return new Response(JSON.stringify({ ok: true, emailId: result?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const error = String(e);
    await markNotification(requestId, false, error);
    console.error("send-lead-notification error:", e);
    return new Response(JSON.stringify({ ok: false, error }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
