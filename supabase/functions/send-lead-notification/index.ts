import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const email = payload.email;
    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "email missing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "eric.bellaiche@gmail.com";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const fullName = `${payload.prenom ?? ""} ${payload.nom ?? ""}`.trim() || "Non renseigné";
    const subject = `Nouveau lead — ${payload.form_type ?? "web"} (${payload.context_slug ?? "n/a"})`;
    const text = [
      `Date: ${new Date().toISOString()}`,
      `Email: ${email}`,
      `Nom: ${fullName}`,
      `Téléphone: ${payload.telephone ?? ""}`,
      `Page: ${payload.page_url ?? ""}`,
      `Form: ${payload.form_type ?? ""}`,
      `Channel: ${payload.channel ?? ""}`,
      `Context: ${payload.context_slug ?? ""}`,
      `UTM: ${payload.utm_source ?? ""} / ${payload.utm_medium ?? ""} / ${payload.utm_campaign ?? ""}`,
      `gclid: ${payload.gclid ?? ""}`,
      `Message: ${payload.message ?? ""}`,
      `Answers: ${JSON.stringify(payload.answers ?? {})}`,
      `request_id: ${payload.request_id ?? ""}`,
    ].join("\n");

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MaximusSCPI <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject,
        text,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Resend API error:", errText);
      throw new Error(`Resend error: ${errText}`);
    }

    const result = await r.json();
    console.log("Email sent:", result.id, "to:", ADMIN_EMAIL);

    return new Response(
      JSON.stringify({ ok: true, emailId: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-lead-notification error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
