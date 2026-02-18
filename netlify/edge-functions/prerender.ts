import type { Context } from "https://edge.netlify.com";

const BOT_AGENTS = [
  "googlebot",
  "google-inspectiontool",
  "chrome-lighthouse",
  "bingbot",
  "yandex",
  "duckduckbot",
  "baiduspider",
  "slurp",
  "sogou",
  "exabot",
  "facebot",
  "facebookexternalhit",
  "ia_archiver",
  "linkedinbot",
  "twitterbot",
  "rogerbot",
  "embedly",
  "showyoubot",
  "outbrain",
  "pinterest",
  "quora link preview",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "whatsapp",
  "applebot",
  "screaming frog",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "petalbot",
  "dotbot",
];

const ASSET_EXT =
  /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|map|json|xml|txt|pdf|mp4|webm|avif)$/i;

const SKIP_PATHS = ["/app/", "/.netlify/", "/api/"];

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some((bot) => lower.includes(bot));
}

export default async function handler(
  request: Request,
  context: Context,
): Promise<Response> {
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== "GET") {
    return context.next();
  }

  // Skip assets
  if (ASSET_EXT.test(url.pathname)) {
    return context.next();
  }

  // Skip private/API paths
  if (SKIP_PATHS.some((p) => url.pathname.startsWith(p))) {
    return context.next();
  }

  const ua = request.headers.get("user-agent") || "";

  // Anti-loop: if Prerender.io is fetching us, don't re-proxy
  if (
    ua.toLowerCase().includes("prerender") ||
    request.headers.get("x-prerendered") === "1"
  ) {
    return context.next();
  }

  // Only proxy for bots
  if (!isBot(ua)) {
    return context.next();
  }

  // Must accept HTML
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return context.next();
  }

  const token = Deno.env.get("PRERENDER_TOKEN");
  if (!token) {
    console.warn("[prerender] PRERENDER_TOKEN not set, passing through");
    return context.next();
  }

  const targetUrl = url.href;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  try {
    const prerenderResp = await fetch(prerenderUrl, {
      headers: {
        "X-Prerender-Token": token,
        "User-Agent": ua,
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!prerenderResp.ok) {
      console.warn(
        `[prerender] ${prerenderResp.status} for ${url.pathname}, falling back`,
      );
      return context.next();
    }

    const body = await prerenderResp.text();

    return new Response(body, {
      status: prerenderResp.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Prerendered": "1",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error(`[prerender] Error for ${url.pathname}:`, err);
    return context.next();
  }
}
