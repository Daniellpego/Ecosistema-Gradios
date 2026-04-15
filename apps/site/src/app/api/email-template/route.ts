import { NextRequest } from "next/server";
import { getRenderedEmail, type EmailVariables } from "../../diagnostico/_lib/email-templates";

export const runtime = "edge";

/**
 * Timing-safe string comparison for secrets.
 * Uses TextEncoder + a XOR fold so an attacker cannot infer the secret
 * length or value from response timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Pad shorter buffer so lengths match (prevents length-based timing leak)
  const maxLen = Math.max(ab.length, bb.length);
  const padded = new Uint8Array(maxLen);
  let diff = ab.length ^ bb.length; // non-zero means lengths differ
  for (let i = 0; i < maxLen; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  padded; // suppress unused warning
  return diff === 0;
}

/**
 * POST /api/email-template
 *
 * Called by n8n to get the rendered email for a specific step + tier.
 * Requires the `x-webhook-secret` header to match EMAIL_TEMPLATE_SECRET.
 *
 * Body: { emailIndex: number, tier: string, vars: EmailVariables }
 * Returns: { subject: string, body: string }
 */
export async function POST(req: NextRequest) {
  // ── Authentication — shared secret with n8n ─────────────────
  const expectedSecret = process.env.EMAIL_TEMPLATE_SECRET;
  if (!expectedSecret) {
    // Fail-closed: if the env var is not configured, reject all requests
    return new Response(JSON.stringify({ error: "Endpoint not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const providedSecret = req.headers.get("x-webhook-secret") ?? "";
  if (!timingSafeEqual(providedSecret, expectedSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  // ── End authentication ───────────────────────────────────────

  try {
    const { emailIndex, tier, vars } = (await req.json()) as {
      emailIndex: number;
      tier: string;
      vars: EmailVariables;
    };

    const result = getRenderedEmail(emailIndex, tier, vars);

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Invalid emailIndex" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
