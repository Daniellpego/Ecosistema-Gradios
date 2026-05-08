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
  // Accumulate XOR differences including a length mismatch bit,
  // so an attacker cannot determine the secret length from timing.
  let diff = ab.length ^ bb.length;
  const maxLen = Math.max(ab.length, bb.length);
  for (let i = 0; i < maxLen; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

// Maximum length for any single email template variable.
const MAX_EMAIL_VAR_LEN = 500;

/**
 * Strip characters that could form HTML tags or entities from a string variable
 * before it is interpolated into an email template.
 *
 * We remove '<', '>', and '&' individually (character-class removal) rather
 * than trying to parse and strip tag pairs.  This approach:
 *   - Is not vulnerable to ReDoS (no backtracking — character class is O(n))
 *   - Cannot be bypassed by malformed / nested tags (e.g. <<script>>)
 *   - Is safe for plain-text email bodies where these chars have no valid use
 */
function sanitizeEmailVar(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  return value
    .replace(/[<>&]/g, "")                              // remove tag delimiters and entity prefix
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip non-printable control chars
    .trim()
    .slice(0, MAX_EMAIL_VAR_LEN);
}

/** Sanitize all string fields of an EmailVariables object. */
function sanitizeVars(vars: EmailVariables): EmailVariables {
  return {
    nome: sanitizeEmailVar(vars.nome),
    empresa: sanitizeEmailVar(vars.empresa),
    setor: sanitizeEmailVar(vars.setor),
    cargo: sanitizeEmailVar(vars.cargo),
    gargalo_principal: sanitizeEmailVar(vars.gargalo_principal),
    gargalo_2: sanitizeEmailVar(vars.gargalo_2),
    horas_semana: sanitizeEmailVar(vars.horas_semana),
    horas_mes: sanitizeEmailVar(vars.horas_mes),
    horas_mes_num: typeof vars.horas_mes_num === "number" ? vars.horas_mes_num : 0,
    pct_funcionario: sanitizeEmailVar(vars.pct_funcionario),
    roi_mensal: sanitizeEmailVar(vars.roi_mensal),
    roi_anual: sanitizeEmailVar(vars.roi_anual),
    tier: sanitizeEmailVar(vars.tier),
    score: typeof vars.score === "number" ? vars.score : 0,
    prioridade: sanitizeEmailVar(vars.prioridade),
    sistemas: sanitizeEmailVar(vars.sistemas),
    diagnostico_url: sanitizeEmailVar(vars.diagnostico_url),
    whatsapp_url: sanitizeEmailVar(vars.whatsapp_url),
  };
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

    const result = getRenderedEmail(emailIndex, tier, sanitizeVars(vars));

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
