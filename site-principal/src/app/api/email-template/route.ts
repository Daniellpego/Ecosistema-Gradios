import { NextRequest } from "next/server";
import { getRenderedEmail, type EmailVariables } from "../../diagnostico/_lib/email-templates";

export const runtime = "edge";

/**
 * POST /api/email-template
 *
 * Called by n8n to get the rendered email for a specific step + tier.
 *
 * Body: { emailIndex: number, tier: string, vars: EmailVariables }
 * Returns: { subject: string, body: string }
 */
export async function POST(req: NextRequest) {
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
