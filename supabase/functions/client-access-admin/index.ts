import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1";

type Decision = "APPROVED" | "REJECTED";

type Payload =
  | { action: "list" }
  | { action: "decide"; request_id: string; decision: Decision; decision_note?: string | null };

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://maximusscpi.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function findUserByEmail(admin: any, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user: any) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 1000) break;
  }
  return null;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Session invalide." }, 401);

    const { data: profile, error: profileError } = await ctx.supabase
      .from("profiles")
      .select("role,status")
      .eq("user_id", userId)
      .single();

    if (profileError || profile?.role !== "admin" || profile?.status !== "active") {
      return json({ error: "Accès administrateur requis." }, 403);
    }

    let payload: Payload;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Corps JSON invalide." }, 400);
    }

    if (payload.action === "list") {
      const { data, error } = await ctx.supabase
        .from("access_requests")
        .select("id,created_at,requested_role,full_name,email,phone,message,status")
        .eq("status", "PENDING")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) return json({ error: error.message }, 500);
      return json({ data: data ?? [] });
    }

    if (payload.action !== "decide" || !payload.request_id || !payload.decision) {
      return json({ error: "Décision invalide." }, 400);
    }

    const { data: requestRow, error: requestError } = await ctx.supabase
      .from("access_requests")
      .select("*")
      .eq("id", payload.request_id)
      .single();

    if (requestError || !requestRow) return json({ error: "Demande introuvable." }, 404);
    if (requestRow.status !== "PENDING") return json({ error: "Demande déjà traitée." }, 409);

    const handledAt = new Date().toISOString();

    if (payload.decision === "REJECTED") {
      const { error } = await ctx.supabase
        .from("access_requests")
        .update({
          status: "REJECTED",
          handled_by: userId,
          handled_at: handledAt,
          decision_note: payload.decision_note || null,
        })
        .eq("id", payload.request_id);

      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, decision: "REJECTED" });
    }

    if (requestRow.requested_role !== "CLIENT") {
      return json({ error: "Les demandes partenaires restent gérées par l’Espace Pro." }, 400);
    }

    const email = String(requestRow.email || "").trim().toLowerCase();
    if (!email) return json({ error: "Email manquant." }, 400);

    let authUser = await findUserByEmail(ctx.supabaseAdmin, email);
    if (!authUser) {
      const { data: created, error: createError } = await ctx.supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: requestRow.full_name || null,
          source: "maximusscpi_access_request",
        },
      });
      if (createError || !created?.user) {
        return json({ error: createError?.message || "Création du compte impossible." }, 500);
      }
      authUser = created.user;
    }

    const { data: existingProfile } = await ctx.supabaseAdmin
      .from("profiles")
      .select("role,status")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (existingProfile?.role === "admin") {
      return json({ error: "Ce compte est administrateur et ne peut pas être converti en client." }, 409);
    }

    const { error: profileUpsertError } = await ctx.supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: authUser.id,
          full_name: requestRow.full_name || null,
          phone: requestRow.phone || null,
          role: "client",
          status: "active",
          org_id: null,
        },
        { onConflict: "user_id" },
      );

    if (profileUpsertError) return json({ error: profileUpsertError.message }, 500);

    const { error: updateError } = await ctx.supabase
      .from("access_requests")
      .update({
        status: "APPROVED",
        handled_by: userId,
        handled_at: handledAt,
        decision_note: payload.decision_note || null,
      })
      .eq("id", payload.request_id);

    if (updateError) return json({ error: updateError.message }, 500);

    await ctx.supabaseAdmin.from("audit_events").insert({
      user_id: userId,
      event_type: "client_access_approved",
      payload: {
        request_id: payload.request_id,
        client_user_id: authUser.id,
        client_email: email,
        activation: "google_oauth_same_email",
      },
    });

    return json({
      ok: true,
      decision: "APPROVED",
      activation: "GOOGLE",
      email,
      message: "Accès activé. Le client peut se connecter avec Google en utilisant cette adresse email.",
    });
  }),
};
