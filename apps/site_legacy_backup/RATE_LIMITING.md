# Rate Limiting — Monitoring & Operations

## Architecture

Global sliding-window rate limits are enforced in `src/middleware.ts` using
**Upstash Redis** (`@upstash/ratelimit`).  Redis keys follow the pattern:

```
rl:<path-slug>:<ip>   — per-path counters
rl:api:default:<ip>   — fallback counter for all other /api/* routes
```

Limits (per IP, per 60-second window):

| Route                 | Limit |
|-----------------------|-------|
| `/api/diagnostico`    | 5 req |
| `/api/meta-conversion`| 20 req |
| `/api/email-template` | 10 req |
| all other `/api/*`    | 30 req |

---

## Testing abuse locally (curl loop)

```bash
# Send 6 requests in a row — the 6th should return 429
for i in $(seq 1 6); do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST https://gradios.co/api/diagnostico \
    -H "Content-Type: application/json" \
    -d '{"lead":{"nome":"Test","empresa":"ACME"},"score":50,"answers":{}}')
  echo "req $i → HTTP $status"
done
```

Expected output:
```
req 1 → HTTP 200
req 2 → HTTP 200
req 3 → HTTP 200
req 4 → HTTP 200
req 5 → HTTP 200
req 6 → HTTP 429
```

The response for rate-limited requests includes:
```
Retry-After: <seconds until window resets>
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <unix ms timestamp>
```

---

## Monitoring top abusers — Upstash Redis CLI

### 1. List all active rate-limit keys (any endpoint)
```
KEYS rl:*
```

### 2. Top 10 IPs by request count on /api/diagnostico in current window
```
# Pattern: rl:api:diagnostico:<ip>
# Each key holds a sorted set of timestamps.
# In Upstash Console → CLI:
SCAN 0 MATCH "rl:api:diagnostico:*" COUNT 1000
```

### 3. Check current count for a specific IP
```
# Replace <ip> with the IP address to inspect
ZCARD "rl:api:diagnostico:<ip>"
```

### 4. Manually block an IP for 1 hour (emergency)
```
# Sets the key with count=9999 and 1-hour TTL — every request will 429
SET "rl:api:diagnostico:<ip>" 9999 EX 3600
```

---

## Monitoring via Upstash Console

1. Go to https://console.upstash.com → your database → **Data Browser**
2. Filter by prefix `rl:` to see all active rate-limit windows
3. Sort by size to find the heaviest users

## Recommended Upstash alerts (Console → Alerts)

| Metric                | Threshold | Action          |
|-----------------------|-----------|-----------------|
| Daily commands        | > 50 000  | Slack/email alert |
| Bandwidth (MB/day)    | > 100 MB  | Review traffic  |
| Key count             | > 100 000 | Investigate bots |

---

## Anthropic budget monitoring

Upstash tracks Redis usage; Anthropic API spend is separate.

### n8n workflow (automated — every 6 hours)

Import `n8n-workflows/anthropic-budget-alert.json` into your n8n instance.

**Required n8n environment variables:**

| Variable | Value |
|---|---|
| `ANTHROPIC_ADMIN_API_KEY` | Admin API key (separate from the inference key) |
| `ANTHROPIC_MONTHLY_BUDGET_USD` | e.g. `50` |
| `ANTHROPIC_ALERT_THRESHOLD_PCT` | e.g. `80` |
| `SLACK_WEBHOOK_URL` | Incoming webhook URL from Slack App |

**How to get the Admin API key:**  
Anthropic Console → Settings → API Keys → Create Admin Key  
*(Admin keys can read billing/usage; do **not** use them for inference)*

**How the workflow works:**
1. Runs every 6 h via Schedule Trigger
2. Calls `GET /v1/organizations/costs?granularity=month` (Anthropic Billing API)
3. Computes `spent / budget` percentage
4. If ≥ threshold → posts a Slack rich-message with a link to the console

### Manual check (curl)

```bash
curl -s "https://api.anthropic.com/v1/organizations/costs?granularity=month&start_date=$(date +%Y-%m-01)" \
  -H "x-api-key: $ANTHROPIC_ADMIN_API_KEY" \
  -H "anthropic-version: 2023-06-01" | jq '.data[].cost_usd | add'
```

### Console spend limit (hard cutoff)

Set both a **Soft Limit** (email when you hit 80%) and a **Hard Limit**  
(cuts the API key at 100%) in:

```
Anthropic Console → Settings → Billing → Usage limits
```

---

## Honeypot — bot vs human test

### Human (passes)
```bash
# Real user: website field empty → HTTP 200
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://gradios.co/api/diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "lead":{"nome":"João Silva","empresa":"ACME"},
    "score":72,
    "answers":{},
    "website":""
  }'
# → 200
```

### Bot (rejected — 400)
```bash
# Bot that fills the hidden field → HTTP 400
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://gradios.co/api/diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "lead":{"nome":"bot","empresa":"bot"},
    "score":50,
    "answers":{},
    "website":"https://evil.com"
  }'
# → 400
```

---

## Security headers — CFO / CRM / CTO

All three dashboard apps now ship the following headers on every response
(added to `next.config.ts` in each app):

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' *.supabase.co; frame-ancestors 'none'; …` |

Verify with:
```bash
curl -s -I https://<dashboard-domain>/ | grep -Ei "x-frame|x-content|referrer|permissions|content-security"
```
