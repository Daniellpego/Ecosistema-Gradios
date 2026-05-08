/**
 * Global Edge Middleware — Upstash Redis rate limiting
 *
 * Applies per-IP sliding-window rate limits to every public API route.
 * Runs before route handlers, so a single check covers all Edge instances.
 *
 * Limits (per IP, per 60-second sliding window):
 *   /api/diagnostico      →  5 req / min  (Anthropic call — expensive)
 *   /api/meta-conversion  → 20 req / min  (Meta CAPI — cheaper, but billed)
 *   /api/email-template   → 10 req / min  (already secret-gated; extra layer)
 *   all other /api/*      → 30 req / min  (generic guard)
 *
 * Graceful degradation: if UPSTASH_REDIS_REST_URL / TOKEN are not set,
 * the middleware lets all requests through (no crash in local dev).
 *
 * Required env vars (Vercel dashboard + local .env.local):
 *   UPSTASH_REDIS_REST_URL   — from Upstash console → REST API → Endpoint
 *   UPSTASH_REDIS_REST_TOKEN — from Upstash console → REST API → Token
 */

import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const config = {
  matcher: ["/api/:path*"],
};

// ── Rate limit configurations per path prefix ───────────────────────────────
// Each entry: [prefix, maxRequests, windowSeconds]
const ROUTE_LIMITS: [string, number, number][] = [
  ["/api/diagnostico",     5,  60],
  ["/api/meta-conversion", 20, 60],
  ["/api/email-template",  10, 60],
];
// Default for any /api/* not matched above
const DEFAULT_LIMIT: [number, number] = [30, 60];

// ── Lazily initialise Redis + Ratelimit instances ───────────────────────────
// We create one Ratelimit per unique (max, window) pair.

type RatelimitInstance = {
  ratelimit: Ratelimit;
  prefix: string;
};

let instances: RatelimitInstance[] | null = null;
let defaultInstance: Ratelimit | null = null;
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getInstances(): {
  byPath: RatelimitInstance[];
  fallback: Ratelimit;
} | null {
  const r = getRedis();
  if (!r) return null;

  if (!instances || !defaultInstance) {
    instances = ROUTE_LIMITS.map(([prefix, max, window]) => ({
      prefix,
      ratelimit: new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(max, `${window} s`),
        // Prefix key: "rl:<path-slug>:<ip>"
        prefix: `rl:${prefix.replace(/\//g, ":")}`,
      }),
    }));

    const [dMax, dWindow] = DEFAULT_LIMIT;
    defaultInstance = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(dMax, `${dWindow} s`),
      prefix: "rl:api:default",
    });
  }

  return { byPath: instances, fallback: defaultInstance };
}

// ── Helper: resolve client IP from Vercel/CDN headers ──────────────────────
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Middleware entry point ──────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const rl = getInstances();

  // No Upstash credentials → pass through (local dev / misconfigured env)
  if (!rl) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // Find the most specific matching limit config
  const matched = rl.byPath.find(({ prefix }) => pathname.startsWith(prefix));
  const limiter = matched ? matched.ratelimit : rl.fallback;

  let result: Awaited<ReturnType<Ratelimit["limit"]>>;
  try {
    result = await limiter.limit(ip);
  } catch {
    // Redis unreachable → fail open (don't block real users due to infra issue)
    return NextResponse.next();
  }

  if (!result.success) {
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    return new NextResponse(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.max(1, resetInSeconds)),
        },
      }
    );
  }

  // Pass through — attach remaining-quota headers so clients can self-throttle
  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", String(result.reset));
  return res;
}
