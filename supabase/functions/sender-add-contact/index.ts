import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BREVO_API_KEY = "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";
const BREVO_LIST_ID = 5; // Liste marketing_automation : Campagne_pub_ads_google

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, firstname, lastname, group_id, fields } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Préparer les attributs Brevo
    const attributes: Record<string, string> = {
      PRENOM: firstname || "",
      NOM: lastname || "",
      SOURCE: fields?.source || "Guide Comparatif PDF",
    };

    // Ajouter la date de téléchargement si disponible
    if (fields?.date_telechargement) {
      attributes.DATE_TELECHARGEMENT = fields.date_telechargement;
    }

    console.log(`Adding contact to Brevo list #${BREVO_LIST_ID}:`, email);

    // Appel API Brevo pour créer/mettre à jour le contact
    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: attributes,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true, // Met à jour le contact s'il existe déjà
      }),
    });

    const responseData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("Brevo API error:", responseData);
      
      // Si le contact existe déjà, on le met à jour avec la bonne liste
      if (responseData.code === "duplicate_parameter") {
        // Tenter de mettre à jour le contact existant
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: "PUT",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            attributes: attributes,
            listIds: [BREVO_LIST_ID],
          }),
        });

        if (updateResponse.ok) {
          console.log(`Contact updated in Brevo list #${BREVO_LIST_ID}:`, email);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Contact updated and added to list #5",
              email: email 
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Brevo API error", details: responseData }),
        {
          status: brevoResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Contact added to Brevo list #${BREVO_LIST_ID}:`, email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Contact added to Brevo list #${BREVO_LIST_ID}`,
        email: email,
        brevoId: responseData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in sender-add-contact:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});