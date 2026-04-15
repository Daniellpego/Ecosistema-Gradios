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
# Pattern: rl::api:diagnostico:<ip>
# Each key holds a sorted set of timestamps.
# In Upstash Console → CLI:
SCAN 0 MATCH "rl::api:diagnostico:*" COUNT 1000
```

### 3. Check current count for a specific IP
```
# Replace <ip> with the IP address to inspect
ZCARD "rl::api:diagnostico:<ip>"
```

### 4. Manually block an IP for 1 hour (emergency)
```
# Sets the key with count=9999 and 1-hour TTL — every request will 429
SET "rl::api:diagnostico:<ip>" 9999 EX 3600
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
Monitor Anthropic usage at:

```
https://console.anthropic.com/settings/billing → Usage
```

Set a spend limit at **Anthropic Console → Billing → Usage limits**:
- Soft limit at 80% → email notification
- Hard limit to cut off the API key at 100%

There is no native webhook from Anthropic today.  
For automated alerts, run a scheduled n8n workflow (daily/hourly):

```
GET https://api.anthropic.com/v1/usage
  Authorization: Bearer $ANTHROPIC_API_KEY
```

Compare `total_cost` against your monthly budget and post to Slack/Discord
if over threshold.
