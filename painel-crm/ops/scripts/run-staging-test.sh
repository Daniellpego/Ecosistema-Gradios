#!/bin/bash
set -euo pipefail
# ──────────────────────────────────────────────────────────
# run-staging-test.sh — Launch the controlled OpenAI test
#
# Usage:
#   export OPENAI_API_KEY=sk-...
#   bash ops/scripts/run-staging-test.sh
#
# Prerequisites: backend + worker running, seed data loaded
# ──────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "═══════════════════════════════════════════════════"
echo "  CRM BG Tech — Staging Test Launcher"
echo "═══════════════════════════════════════════════════"

# ── Validate env ──
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "❌ OPENAI_API_KEY not set. Export it first:"
  echo "   export OPENAI_API_KEY=sk-..."
  exit 1
fi

API_BASE="${API_BASE:-http://localhost:3001/api}"
echo "API: $API_BASE"

# ── Step 1: Login to get JWT ──
echo ""
echo "🔑 Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"password123"}')

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -oP '"access_token"\s*:\s*"\K[^"]+' || true)

if [[ -z "$JWT_TOKEN" ]]; then
  echo "❌ Login failed. Response:"
  echo "$LOGIN_RESPONSE"
  echo ""
  echo "Make sure the backend is running and seed data is loaded."
  exit 1
fi

echo "✅ Authenticated (token: ${JWT_TOKEN:0:20}...)"

# ── Step 2: Quick health check ──
echo ""
echo "🏥 Checking backend health..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health" || echo "000")
if [[ "$HEALTH" != "200" ]]; then
  echo "⚠ Backend health check returned $HEALTH (non-critical, continuing...)"
else
  echo "✅ Backend healthy"
fi

# ── Step 3: Check Redis budget ──
echo ""
echo "💰 Checking budget..."
BUDGET=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/agents/budget")
echo "   $BUDGET"

# ── Step 4: Run the controlled test ──
echo ""
echo "🚀 Launching controlled test (8 calls, US\$10 budget cap)..."
echo ""

cd "$ROOT_DIR/packages/backend"
JWT_TOKEN="$JWT_TOKEN" \
API_BASE="$API_BASE" \
OPENAI_MODEL="${OPENAI_MODEL:-gpt-4o-mini}" \
  npx ts-node "$SCRIPT_DIR/controlled-openai-test.ts"

echo ""
echo "✅ Test complete. Check the report above."
echo ""
echo "📊 Final budget status:"
curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/agents/budget" | python3 -m json.tool 2>/dev/null || \
  curl -s -H "Authorization: Bearer $JWT_TOKEN" "$API_BASE/agents/budget"
