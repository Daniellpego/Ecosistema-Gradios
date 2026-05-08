import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

/**
 * Hash PII data using SHA256 (Meta requirement)
 * Using Web Crypto API for Edge Runtime compatibility
 */
async function hashData(data: string | undefined): Promise<string | undefined> {
  if (!data) return undefined;
  const normalized = data.toLowerCase().trim();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Meta Conversions API - Server-side event tracking
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function POST(req: NextRequest) {
  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "META_PIXEL_ID or META_ACCESS_TOKEN not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      eventName,
      eventSourceUrl,
      userData,
      customData,
      eventId,
      testEventCode,
    } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: "eventName is required" },
        { status: 400 }
      );
    }

    // Build user data with hashed PII
    const hashedUserData: Record<string, unknown> = {
      client_ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      client_user_agent: req.headers.get("user-agent"),
    };

    if (userData?.email) hashedUserData.em = await hashData(userData.email);
    if (userData?.phone) hashedUserData.ph = await hashData(userData.phone);
    if (userData?.firstName) hashedUserData.fn = await hashData(userData.firstName);
    if (userData?.lastName) hashedUserData.ln = await hashData(userData.lastName);
    if (userData?.city) hashedUserData.ct = await hashData(userData.city);
    if (userData?.country) hashedUserData.country = await hashData(userData.country);

    // Build event payload
    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: eventSourceUrl || req.headers.get("referer") || "https://gradios.com.br",
      user_data: hashedUserData,
      custom_data: customData || {},
    };

    // Add event_id for deduplication (matches client-side pixel)
    if (eventId) {
      (eventData as Record<string, unknown>).event_id = eventId;
    }

    const payload = {
      data: [eventData],
      test_event_code: testEventCode || undefined,
    };

    // Send to Meta Conversions API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("Meta Conversions API error:", result);
      return NextResponse.json(
        { error: "Meta API error", details: result },
        { status: metaResponse.status }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Meta Conversions API exception:", error);
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}
