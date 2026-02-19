import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log("Received Calendly webhook:", JSON.stringify(webhookData, null, 2));

    if (webhookData.event !== "invitee.created") {
      return new Response(
        JSON.stringify({ ok: true, message: "Event type not processed", event: webhookData.event }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const event = webhookData.payload.event;
    const invitee = webhookData.payload.invitee;
    const tracking = webhookData.payload.tracking || {};
    const qna = webhookData.payload.questions_and_answers || [];

    const eventStartTime = new Date(event.start_time).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });

    const answersObj: Record<string, string> = {};
    for (const item of qna) {
      answersObj[item.question] = item.answer;
    }
    answersObj.event_name = event.name;
    answersObj.event_start = eventStartTime;

    const { error } = await supabase.from("contact_submissions").insert([
      {
        request_id: crypto.randomUUID(),
        channel: "contact",
        context_type: "calendly",
        context_slug: event.name,
        form_type: "lead_rdv",

        email: (invitee.email || "calendly@rdv.com").trim().toLowerCase(),
        nom: String(invitee.name || "Calendly").trim(),
        prenom: null,
        telephone: invitee.text_reminder_number
          ? String(invitee.text_reminder_number).trim()
          : null,

        answers: answersObj,

        utm_source: tracking.utm_source || null,
        utm_medium: tracking.utm_medium || null,
        utm_campaign: tracking.utm_campaign || null,
        referrer: null,
        page_url: "/calendly-webhook",

        status: "new",
      },
    ]);

    if (error) {
      console.error("Error inserting into contact_submissions:", error);
      throw error;
    }

    console.log("Calendly lead saved to contact_submissions");

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("Error processing webhook:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
