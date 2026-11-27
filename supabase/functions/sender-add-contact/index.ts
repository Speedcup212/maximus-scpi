import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BREVO_LIST_ID = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const { email, firstname, lastname, fields } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const attributes: Record<string, string> = {
      PRENOM: firstname || "",
      NOM: lastname || "",
      SOURCE: fields?.source || "Guide Comparatif PDF",
    };

    if (fields?.date_telechargement) {
      attributes.DATE_TELECHARGEMENT = fields.date_telechargement;
    }

    console.log(`Adding contact to Brevo list #${BREVO_LIST_ID}:`, email);

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("Brevo API error:", responseData);

      if (responseData.code === "duplicate_parameter") {
        const updateResponse = await fetch(
          `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
          {
            method: "PUT",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "api-key": brevoApiKey,
            },
            body: JSON.stringify({ attributes, listIds: [BREVO_LIST_ID] }),
          },
        );

        if (updateResponse.ok) {
          console.log(`Contact updated in Brevo list #${BREVO_LIST_ID}:`, email);
          return new Response(
            JSON.stringify({ ok: true, message: "Contact updated" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }

      return new Response(
        JSON.stringify({ ok: false, error: "Brevo API error", details: responseData }),
        { status: brevoResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Contact added to Brevo list #${BREVO_LIST_ID}:`, email);

    return new Response(
      JSON.stringify({ ok: true, brevoId: responseData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Error in sender-add-contact:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
