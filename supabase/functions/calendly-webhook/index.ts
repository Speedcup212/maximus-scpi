import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, calendly-webhook-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyCalendlySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const signingKey = Deno.env.get("CALENDLY_WEBHOOK_SIGNING_KEY");
  if (!signingKey) return true;

  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.trim().split("=", 2))
      .filter(([key, value]) => Boolean(key && value)),
  );

  const timestamp = parts.t;
  const receivedSignature = parts.v1;
  if (!timestamp || !receivedSignature) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;

  const toleranceSeconds = 180;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > toleranceSeconds) return false;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = hex(
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      new TextEncoder().encode(`${timestamp}.${rawBody}`),
    ),
  );

  if (expected.length !== receivedSignature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }

  return mismatch === 0;
}

function toAnswers(items: unknown): Record<string, unknown> {
  if (!Array.isArray(items)) return {};

  const answers: Record<string, unknown> = {};
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const question = String(row.question ?? "").trim();
    if (!question) continue;
    answers[question] = row.answer ?? null;
  }
  return answers;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method_not_allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 },
    );
  }

  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("calendly-webhook-signature");

    if (!(await verifyCalendlySignature(rawBody, signatureHeader))) {
      return new Response(
        JSON.stringify({ ok: false, error: "invalid_signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const webhookData = JSON.parse(rawBody);
    const eventType = String(webhookData?.event ?? "");

    if (eventType !== "invitee.created" && eventType !== "invitee.canceled") {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, event: eventType }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const payload = webhookData?.payload && typeof webhookData.payload === "object"
      ? webhookData.payload
      : {};

    // Calendly v2 envoie l'objet Invitee directement dans payload.
    // Le fallback payload.invitee conserve la compatibilité avec l'ancien format.
    const invitee = payload?.invitee && typeof payload.invitee === "object"
      ? payload.invitee
      : payload;

    const email = String(invitee?.email ?? "").trim().toLowerCase();
    const name = String(invitee?.name ?? "").trim();
    const tracking = invitee?.tracking && typeof invitee.tracking === "object"
      ? invitee.tracking
      : (payload?.tracking ?? {});

    const inviteeUri = String(invitee?.uri ?? "").trim() || null;
    const eventUri = typeof invitee?.event === "string"
      ? invitee.event
      : (typeof payload?.event === "string" ? payload.event : null);

    const contextSlug = String(
      tracking?.utm_content || tracking?.utm_campaign || "calendly",
    )
      .replace(/^\/+|\/+$/g, "")
      .trim() || "calendly";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase service configuration");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (eventType === "invitee.canceled") {
      if (inviteeUri) {
        await supabase
          .from("contact_submissions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .contains("answers", { calendly_invitee_uri: inviteeUri });
      }

      return new Response(
        JSON.stringify({ ok: true, event: eventType }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "email_missing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (inviteeUri) {
      const { data: existing, error: existingError } = await supabase
        .from("contact_submissions")
        .select("id")
        .contains("answers", { calendly_invitee_uri: inviteeUri })
        .limit(1);

      if (existingError) throw existingError;
      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, duplicate: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
        );
      }
    }

    const qna = invitee?.questions_and_answers ?? payload?.questions_and_answers ?? [];
    const answers = {
      ...toAnswers(qna),
      calendly_invitee_uri: inviteeUri,
      calendly_event_uri: eventUri,
      calendly_created_at: webhookData?.created_at ?? null,
    };

    const row = {
      request_id: crypto.randomUUID(),
      channel: contextSlug === "calendly" ? "contact" : "scpi_page",
      context_type: "calendly",
      context_slug: contextSlug,
      form_type: "lead_rdv",

      email,
      nom: name || "Calendly",
      prenom: null,
      telephone: invitee?.text_reminder_number
        ? String(invitee.text_reminder_number).trim()
        : null,

      message: "Réservation Calendly",
      answers,

      utm_source: tracking?.utm_source || null,
      utm_medium: tracking?.utm_medium || null,
      utm_campaign: tracking?.utm_campaign || null,
      utm_content: tracking?.utm_content || null,
      utm_term: tracking?.utm_term || null,
      gclid: null,
      referrer: "calendly",
      page_url: contextSlug === "calendly" ? "/calendly" : `/${contextSlug}`,

      status: "new",
    };

    const { error: insertError } = await supabase
      .from("contact_submissions")
      .insert([row]);

    if (insertError) throw insertError;

    // Notification admin non bloquante : le lead reste enregistré même si l'e-mail échoue.
    supabase.functions
      .invoke("send-lead-notification", { body: row })
      .catch((error) => console.warn("Lead notification failed:", error));

    return new Response(
      JSON.stringify({ ok: true, request_id: row.request_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("calendly-webhook error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
