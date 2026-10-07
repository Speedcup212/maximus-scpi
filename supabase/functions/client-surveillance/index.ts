import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@1";

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

const SELECT = [
  "scpi_slug",
  "latest_period",
  "tof",
  "niveau_tof",
  "trajectoire_tof",
  "delta_4obs",
  "niveau_liquidite",
  "trajectoire_liquidite",
  "liquidity_basis",
  "liquidity_pressure_pct",
  "retrait_attente_pct",
  "liquidity_regime_changed",
  "liquidity_signal_certification",
  "endettement",
  "endettement_delta_last",
  "prix_souscription",
  "prix_reconstitution",
  "prix_souscription_delta_last",
  "tof_gate",
  "tof_signal_eligible",
  "liquidity_gate",
  "liquidity_signal_eligible",
  "reconstitution_gate",
  "debt_gate",
  "market_signal_gate",
  "data_gate",
].join(",");

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    const userId = ctx.userClaims?.sub;
    if (!userId) return json({ error: "Session invalide." }, 401);

    const { data: positions, error: positionsError } = await ctx.supabase
      .from("client_scpi_positions")
      .select("scpi_slug")
      .eq("user_id", userId);

    if (positionsError) return json({ error: positionsError.message }, 500);

    const slugs = Array.from(
      new Set((positions ?? []).map((row: any) => row.scpi_slug).filter(Boolean)),
    );

    if (slugs.length === 0) return json({ data: [] });

    const { data, error } = await ctx.supabaseAdmin
      .from("scpi_trajectory_pilot_dashboard")
      .select(SELECT)
      .in("scpi_slug", slugs);

    if (error) {
      console.error("[client-surveillance] dashboard query failed", error);
      return json({ error: "Données de surveillance indisponibles." }, 500);
    }

    return json({ data: data ?? [] });
  }),
};
