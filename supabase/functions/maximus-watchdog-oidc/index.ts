import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";
import postgres from "npm:postgres@3.4.7";

// This endpoint accepts GitHub Actions OIDC ONLY. No Supabase user JWT,
// no public health access, no mutations, no arbitrary SQL or commands.
const issuer = "https://token.actions.githubusercontent.com";
const jwks = createRemoteJWKSet(new URL(issuer + "/.well-known/jwks"));
const audience = "maximus-watchdog-ygvsddcpohsnaowofuwc";
const repo = "Speedcup212/maximus-scpi";
const workflowRef = repo + "/.github/workflows/maximus-watchdog.yml@refs/heads/main";
const connection = Deno.env.get("SUPABASE_DB_URL");
if (!connection) throw new Error("Database connection unavailable");
const sql = postgres(connection, {
  max: 1, prepare: false, ssl: "require", connect_timeout: 10, idle_timeout: 15
});

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });

  try {
    const { payload } = await jwtVerify(authorization.slice(7), jwks, {
      issuer, audience, algorithms: ["RS256"], clockTolerance: "30s"
    });
    if (
      payload.repository !== repo ||
      String(payload.repository_id) !== "1125202916" ||
      payload.ref !== "refs/heads/main" ||
      payload.workflow_ref !== workflowRef ||
      !["schedule", "workflow_dispatch", "push"].includes(String(payload.event_name))
    ) return new Response("Forbidden", { status: 403 });

    const rows = await sql`
      select observed_at, runner_state, pending_tasks, blocked_issues, strict_pass, strict_fail
      from maximus_agents.watchdog_observations
      order by observed_at desc limit 1
    `;
    const incidents = await sql`
      select incident_code from maximus_agents.watchdog_incidents where active=true
      order by incident_code
    `;
    if (rows.length !== 1) return Response.json({ error: "watchdog_not_initialized" }, { status: 503 });

    return Response.json({
      observed_at: rows[0].observed_at,
      runner_state: rows[0].runner_state,
      pending_tasks: rows[0].pending_tasks,
      blocked_issues: rows[0].blocked_issues,
      strict_pass: rows[0].strict_pass,
      strict_fail: rows[0].strict_fail,
      active_incidents: incidents.map((v: { incident_code: string }) => v.incident_code)
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Error &&
        (err.name === "JWTExpired" || err.name === "JWTClaimValidationFailed" ||
         err.name === "JWSSignatureVerificationFailed" || err.name === "JWTInvalid" ||
         err.name === "JOSEAlgNotAllowed" || err.name === "JWKSNoMatchingKey")) {
      return new Response("Unauthorized", { status: 401 });
    }
    // Do not expose SQL errors, JWTs or the Supabase connection string.
    console.error("watchdog bridge failure", err instanceof Error ? err.name : "unknown");
    return Response.json({ error: "watchdog_unavailable" }, { status: 503 });
  }
});
