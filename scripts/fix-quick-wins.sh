#!/usr/bin/env bash
# =============================================================================
# fix-quick-wins.sh
#
# Automatiza os P0s de Sprint 1 da auditoria (issues 3.1 a 3.4):
#   3.1 CFO + CTO: remover userScalable:false / maximumScale:1
#   3.2 CRM: reescrever layout.tsx com viewport + next/font
#   3.3 CRM: adicionar optimizePackageImports + images + PWA em next.config.ts
#   3.4 CTO: comprimir logo-gradios.png -> webp
#
# Fluxo:
#   1. Pre-flight (repo root, git clean, ferramentas)
#   2. Lighthouse BASELINE (antes das correcoes)
#   3. Aplicar patches
#   4. Lighthouse POS (depois das correcoes)
#   5. Gerar relatorio de deltas em ./reports/quick-wins-<timestamp>/
#
# Uso:
#   ./scripts/fix-quick-wins.sh --dry-run         # nao escreve nada, mostra diffs
#   ./scripts/fix-quick-wins.sh --apply           # aplica + lighthouse baseline/pos
#   ./scripts/fix-quick-wins.sh --apply --no-lh   # aplica sem lighthouse
#   ./scripts/fix-quick-wins.sh --lh-only         # so roda lighthouse baseline
#
# Idempotente: todos os patches detectam se ja foram aplicados.
# =============================================================================

set -euo pipefail

# ------------------------------- config --------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="${REPO_ROOT}/reports/quick-wins-${TS}"
APPS=(cfo crm cto site)
declare -A PORTS=( [cfo]=3101 [crm]=3102 [cto]=3103 [site]=3104 )
declare -A LH_ROUTES=( [cfo]=/login [crm]=/login [cto]=/login [site]=/ )

DRY_RUN=1   # default: seguro
RUN_LH=1
LH_ONLY=0
APPLY=0

# ------------------------------- args ----------------------------------------
for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=1; APPLY=0 ;;
    --apply)    DRY_RUN=0; APPLY=1 ;;
    --no-lh)    RUN_LH=0 ;;
    --lh-only)  LH_ONLY=1; DRY_RUN=0; APPLY=0 ;;
    -h|--help)
      sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "Flag desconhecida: $arg"; exit 2 ;;
  esac
done

# ------------------------------- helpers -------------------------------------
c_bold=$'\033[1m'; c_red=$'\033[31m'; c_green=$'\033[32m'
c_yellow=$'\033[33m'; c_cyan=$'\033[36m'; c_reset=$'\033[0m'

log()   { printf '%s[%s]%s %s\n' "$c_cyan" "$(date +%H:%M:%S)" "$c_reset" "$*"; }
ok()    { printf '%s OK%s   %s\n' "$c_green" "$c_reset" "$*"; }
warn()  { printf '%s WARN%s %s\n' "$c_yellow" "$c_reset" "$*"; }
err()   { printf '%s ERR%s  %s\n' "$c_red" "$c_reset" "$*" 1>&2; }
step()  { printf '\n%s==> %s%s\n' "$c_bold" "$*" "$c_reset"; }

run_or_plan() {
  if (( DRY_RUN )); then
    printf '  %s[dry-run]%s %s\n' "$c_yellow" "$c_reset" "$*"
  else
    eval "$@"
  fi
}

have() { command -v "$1" >/dev/null 2>&1; }

# ------------------------------- preflight -----------------------------------
preflight() {
  step "Preflight"
  cd "$REPO_ROOT"

  for app in "${APPS[@]}"; do
    [[ -d "apps/$app" ]] || { err "apps/$app nao existe"; exit 1; }
  done
  ok "repo root: $REPO_ROOT"

  if have git; then
    if ! git diff --quiet || ! git diff --cached --quiet; then
      warn "working tree tem mudancas nao commitadas (siga por sua conta e risco)"
    else
      ok "working tree limpa"
    fi
    ok "branch atual: $(git rev-parse --abbrev-ref HEAD)"
  fi

  # ferramentas obrigatorias so quando APPLY
  if (( APPLY )); then
    have node || { err "node nao encontrado"; exit 1; }
    have npm  || { err "npm nao encontrado"; exit 1; }
  fi
  if (( RUN_LH )); then
    have npx || warn "npx ausente — lighthouse via --no-lh"
  fi

  # cwebp opcional
  if ! have cwebp; then
    warn "cwebp ausente — tentaremos 'sharp' via node como fallback para a compressao"
  fi

  mkdir -p "$REPORT_DIR"
  ok "relatorio: $REPORT_DIR"
}

# ------------------------------- lighthouse ----------------------------------
# $1 = app  $2 = label (baseline|post)
run_lighthouse_for_app() {
  local app="$1" label="$2" port="${PORTS[$1]}" route="${LH_ROUTES[$1]}"
  local out_json="$REPORT_DIR/lh-${app}-${label}.json"
  local out_html="$REPORT_DIR/lh-${app}-${label}.html"

  if (( RUN_LH == 0 )); then
    log "[$app] lighthouse desabilitado (--no-lh)"
    return 0
  fi

  log "[$app] lighthouse $label — instalando deps + build (pode demorar)"
  pushd "apps/$app" >/dev/null
  if (( DRY_RUN )); then
    run_or_plan "cd apps/$app && npm install --silent && npm run build"
    popd >/dev/null; return 0
  fi

  npm install --silent >/dev/null 2>&1 || { err "[$app] npm install falhou"; popd >/dev/null; return 1; }
  npm run build >"$REPORT_DIR/build-${app}-${label}.log" 2>&1 || {
    err "[$app] build falhou — veja build-${app}-${label}.log"
    popd >/dev/null; return 1
  }

  log "[$app] iniciando server em :$port"
  PORT="$port" npm run start >"$REPORT_DIR/server-${app}-${label}.log" 2>&1 &
  local server_pid=$!
  trap "kill $server_pid 2>/dev/null || true" EXIT

  # espera ate 30s
  local i=0
  until curl -fsS "http://localhost:$port$route" >/dev/null 2>&1; do
    i=$((i+1))
    if (( i > 30 )); then
      err "[$app] server nao respondeu em $port"
      kill "$server_pid" 2>/dev/null || true
      popd >/dev/null; return 1
    fi
    sleep 1
  done
  ok "[$app] server up"

  log "[$app] rodando lighthouse em $route"
  npx --yes lighthouse "http://localhost:$port$route" \
      --quiet \
      --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
      --only-categories=performance,accessibility,best-practices,seo \
      --form-factor=mobile \
      --output=json --output=html \
      --output-path="$REPORT_DIR/lh-${app}-${label}" \
      >/dev/null 2>&1 || warn "[$app] lighthouse retornou erro (ver $out_html)"

  kill "$server_pid" 2>/dev/null || true
  trap - EXIT
  popd >/dev/null

  [[ -f "$out_json" ]] && ok "[$app] $label salvo em $(basename "$out_json")"
}

run_lighthouse_all() { local label="$1"; for app in "${APPS[@]}"; do run_lighthouse_for_app "$app" "$label" || true; done; }

# ------------------------------- patches -------------------------------------

# 3.1 — remover maximumScale + userScalable em CFO e CTO
patch_zoom_lock() {
  step "Patch 3.1 — remover zoom-lock (CFO + CTO)"
  for app in cfo cto; do
    local f="apps/$app/src/app/layout.tsx"
    [[ -f "$f" ]] || { warn "$f nao encontrado"; continue; }

    if ! grep -qE 'maximumScale:\s*1' "$f" && ! grep -qE 'userScalable:\s*false' "$f"; then
      ok "[$app] ja limpo (idempotente)"
      continue
    fi

    log "[$app] $f"
    if (( DRY_RUN )); then
      grep -nE 'maximumScale:\s*1|userScalable:\s*false' "$f" \
        | sed 's/^/  [dry-run] remover: /'
      continue
    fi

    cp "$f" "$f.bak-${TS}"
    # remove linhas inteiras que declaram essas propriedades
    sed -i -E '/^[[:space:]]*maximumScale:[[:space:]]*1[,]?[[:space:]]*$/d' "$f"
    sed -i -E '/^[[:space:]]*userScalable:[[:space:]]*false[,]?[[:space:]]*$/d' "$f"
    ok "[$app] patch aplicado (backup: $(basename "$f.bak-${TS}"))"
  done
}

# 3.2 — CRM layout.tsx full rewrite
patch_crm_layout() {
  step "Patch 3.2 — CRM layout.tsx (viewport + next/font Poppins)"
  local f="apps/crm/src/app/layout.tsx"
  [[ -f "$f" ]] || { err "$f nao existe"; return 1; }

  if grep -q 'export const viewport' "$f" && grep -q "next/font/google" "$f"; then
    ok "CRM layout.tsx ja tem viewport + next/font (idempotente)"
    return 0
  fi

  log "$f"
  if (( DRY_RUN )); then
    echo "  [dry-run] reescrever arquivo inteiro (ver heredoc no script)"
    return 0
  fi

  cp "$f" "$f.bak-${TS}"
  cat > "$f" <<'EOF'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Gradios — CRM',
  description: 'Painel comercial e gestão de leads — Gradios',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A1628',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="font-sans">
        <QueryProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
EOF
  ok "CRM layout.tsx reescrito (backup: $(basename "$f.bak-${TS}"))"

  # tailwind.config.ts: garantir font-sans -> var(--font-poppins)
  local tw="apps/crm/tailwind.config.ts"
  if [[ -f "$tw" ]] && ! grep -q 'var(--font-poppins)' "$tw"; then
    warn "$tw nao referencia var(--font-poppins) — ajuste manual recomendado:"
    echo "    theme: { extend: { fontFamily: { sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'] } } }"
  fi
}

# 3.3 — CRM next.config.ts: adicionar images + optimizePackageImports + PWA
patch_crm_next_config() {
  step "Patch 3.3 — CRM next.config.ts (images + optimizePackageImports + PWA)"
  local f="apps/crm/next.config.ts"
  [[ -f "$f" ]] || { err "$f nao existe"; return 1; }

  if grep -q 'optimizePackageImports' "$f" && grep -q 'withPWA' "$f"; then
    ok "CRM next.config.ts ja aplicado (idempotente)"
    return 0
  fi

  log "$f"
  if (( DRY_RUN )); then
    echo "  [dry-run] reescrever para base identica ao CTO"
    return 0
  fi

  cp "$f" "$f.bak-${TS}"
  cat > "$f" <<'EOF'
import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: { disableDevLogs: true },
})

// Security headers compartilhados. CSP e definido dinamicamente em middleware.ts
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  headers: async () => [
    { source: '/(.*)', headers: SECURITY_HEADERS },
    {
      source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
}

export default withPWA(nextConfig)
EOF
  ok "CRM next.config.ts reescrito (backup: $(basename "$f.bak-${TS}"))"

  # garantir @ducanh2912/next-pwa como dep
  local pkg="apps/crm/package.json"
  if [[ -f "$pkg" ]] && ! grep -q '@ducanh2912/next-pwa' "$pkg"; then
    warn "adicionando @ducanh2912/next-pwa ao CRM"
    (cd apps/crm && npm install --save @ducanh2912/next-pwa >/dev/null 2>&1) \
      && ok "dep instalada" \
      || warn "falha ao instalar — rode: cd apps/crm && npm i @ducanh2912/next-pwa"
  fi
}

# 3.4 — CTO logo-gradios.png (1.4MB) -> webp
patch_cto_logo() {
  step "Patch 3.4 — CTO logo-gradios.png -> webp"
  local png="apps/cto/public/logo-gradios.png"
  local webp="apps/cto/public/logo-gradios.webp"

  if [[ ! -f "$png" ]]; then
    if [[ -f "$webp" ]]; then ok "ja convertido (idempotente)"; return 0; fi
    err "$png nao encontrado"; return 1
  fi

  local size_before; size_before=$(wc -c < "$png")
  log "original: $(numfmt --to=iec-i --suffix=B $size_before 2>/dev/null || echo "${size_before} bytes") — $png"

  if (( DRY_RUN )); then
    echo "  [dry-run] cwebp -q 85 $png -o $webp"
    echo "  [dry-run] grep -r 'logo-gradios.png' apps/cto/src  # referencias a atualizar manualmente"
    return 0
  fi

  if have cwebp; then
    cwebp -quiet -q 85 "$png" -o "$webp" || { err "cwebp falhou"; return 1; }
  else
    # fallback: sharp via node (instala local se preciso)
    log "usando sharp como fallback"
    (cd "$REPO_ROOT" && npx --yes -p sharp@latest node -e "
      const s=require('sharp');
      s('$png').webp({ quality: 85 }).toFile('$webp').then(()=>console.log('ok')).catch(e=>{console.error(e);process.exit(1)});
    ") || { err "sharp fallback falhou — instale cwebp (apt-get install webp) e reexecute"; return 1; }
  fi

  local size_after; size_after=$(wc -c < "$webp")
  local pct=$(( 100 - (size_after * 100 / size_before) ))
  ok "webp: $(numfmt --to=iec-i --suffix=B $size_after 2>/dev/null || echo "${size_after} bytes") (−${pct}%)"

  # reportar referencias a trocar manualmente (NAO auto-edita para evitar surpresa)
  local refs
  refs=$(grep -rEIn 'logo-gradios\.png' apps/cto/src 2>/dev/null || true)
  if [[ -n "$refs" ]]; then
    warn "referencias ao PNG ainda no codigo — atualize manualmente para /logo-gradios.webp:"
    echo "$refs" | sed 's/^/    /'
  else
    ok "nenhuma referencia encontrada em apps/cto/src — voce pode remover o PNG:"
    echo "    rm $png"
  fi
}

apply_patches() {
  patch_zoom_lock
  patch_crm_layout
  patch_crm_next_config
  patch_cto_logo
}

# ------------------------------- relatorio -----------------------------------
build_report() {
  step "Relatorio de deltas"
  local report_md="$REPORT_DIR/REPORT.md"
  {
    echo "# Quick Wins — $(date -Iseconds)"
    echo ""
    echo "| App | Metrica | Baseline | Pos | Delta |"
    echo "|---|---|---:|---:|---:|"
    for app in "${APPS[@]}"; do
      local b="$REPORT_DIR/lh-${app}-baseline.json"
      local p="$REPORT_DIR/lh-${app}-post.json"
      if [[ ! -f "$b" || ! -f "$p" ]]; then
        echo "| $app | (sem dados) | — | — | — |"
        continue
      fi
      for cat in performance accessibility best-practices seo; do
        local vb vp delta
        vb=$(node -pe "Math.round((require('./$b').categories['$cat'].score||0)*100)" 2>/dev/null || echo "-")
        vp=$(node -pe "Math.round((require('./$p').categories['$cat'].score||0)*100)" 2>/dev/null || echo "-")
        if [[ "$vb" =~ ^[0-9]+$ && "$vp" =~ ^[0-9]+$ ]]; then
          delta=$((vp - vb))
          [[ $delta -ge 0 ]] && delta="+$delta"
        else delta="—"; fi
        echo "| $app | $cat | $vb | $vp | $delta |"
      done
    done
    echo ""
    echo "## Notas"
    echo "- Scores são **medidos** via Lighthouse (categoria: performance, accessibility, best-practices, seo)."
    echo "- Form factor: mobile, throttling default do Lighthouse."
    echo "- Métricas detalhadas (LCP, CLS, INP) estão nos HTMLs individuais deste diretório."
  } > "$report_md"

  ok "relatorio escrito em $report_md"
  echo ""
  cat "$report_md"
}

# ------------------------------- main ----------------------------------------
main() {
  printf '%s== Ecosistema-Gradios — fix-quick-wins ==%s\n' "$c_bold" "$c_reset"
  printf 'modo: '
  if (( LH_ONLY )); then echo "lh-only";
  elif (( DRY_RUN )); then echo "${c_yellow}dry-run${c_reset} (nenhum arquivo sera modificado)";
  else echo "${c_red}APPLY${c_reset}"; fi
  echo "relatorio: $REPORT_DIR"

  preflight

  if (( LH_ONLY )); then
    run_lighthouse_all "baseline"
    build_report
    exit 0
  fi

  if (( APPLY && RUN_LH )); then
    run_lighthouse_all "baseline"
  fi

  apply_patches

  if (( APPLY && RUN_LH )); then
    run_lighthouse_all "post"
    build_report
  elif (( DRY_RUN )); then
    warn "dry-run: re-execute com --apply para aplicar os patches e rodar lighthouse"
  fi

  ok "done."
}

main "$@"
