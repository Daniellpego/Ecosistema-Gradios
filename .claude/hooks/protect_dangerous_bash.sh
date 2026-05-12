#!/usr/bin/env bash
# protect_dangerous_bash.sh — bloqueia comandos destrutivos comuns
#
# Hook: PreToolUse em Bash
# Bloqueia:
#   - git push --force / -f em main / master
#   - git reset --hard
#   - rm -rf em diretórios-chave
#   - npm publish (publicação acidental)
#   - drop database / drop schema
#   - supabase secrets unset (apaga secret de prod)

set -euo pipefail

INPUT=$(cat || echo '{}')

if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")
else
  COMMAND=$(echo "$INPUT" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || echo "")
fi

block() {
  echo "🛑 BLOQUEADO por .claude/hooks/protect_dangerous_bash.sh" >&2
  echo "" >&2
  echo "Comando: $COMMAND" >&2
  echo "Motivo:  $1" >&2
  echo "" >&2
  echo "Se for intencional, peça ao operador humano executar manualmente." >&2
  exit 2
}

# git push --force em main/master
if echo "$COMMAND" | grep -qE 'git[[:space:]]+push.*(-f|--force).*(main|master)'; then
  block "force push em branch protegida (main/master) — destrói histórico"
fi
if echo "$COMMAND" | grep -qE 'git[[:space:]]+push.*(main|master).*(-f|--force)'; then
  block "force push em branch protegida (main/master) — destrói histórico"
fi

# git reset --hard sem ref específica é OK; com origin/main não é
if echo "$COMMAND" | grep -qE 'git[[:space:]]+reset[[:space:]]+--hard[[:space:]]+origin/(main|master)'; then
  block "reset --hard origin/main — descarta commits locais não revisados"
fi

# rm -rf em diretórios sensíveis
if echo "$COMMAND" | grep -qE 'rm[[:space:]]+(-r[fF]?|-[fF]r|-rf|--recursive[[:space:]]+--force)[[:space:]].*(\.git|node_modules|apps|packages|supabase|\.github|/$|/\*$)'; then
  # node_modules é OK pra wipe
  if ! echo "$COMMAND" | grep -qE 'rm[[:space:]]+-rf[[:space:]]+(node_modules|\./node_modules|apps/[a-z]+/node_modules)[[:space:]]*$'; then
    block "rm -rf em diretório protegido"
  fi
fi

# npm publish (público) — esse repo é private:true mas previne acidente
if echo "$COMMAND" | grep -qE 'npm[[:space:]]+publish([[:space:]]|$)'; then
  block "npm publish — esse monorepo é interno, não publicar em npm registry"
fi

# DROP destrutivo em SQL
if echo "$COMMAND" | grep -qiE '(drop[[:space:]]+(database|schema|table)[[:space:]])'; then
  block "comando DROP detectado em SQL — destrutivo, requer aprovação humana"
fi

# supabase secrets unset (remove de prod)
if echo "$COMMAND" | grep -qE 'supabase[[:space:]]+secrets[[:space:]]+unset'; then
  block "remoção de secret em produção — confirme com humano"
fi

# git config user/email modification (evita commits com identidade errada)
if echo "$COMMAND" | grep -qE 'git[[:space:]]+config[[:space:]]+(--global[[:space:]]+)?user\.(name|email)'; then
  block "alteração de git user.name/email — convenção do time, não tocar"
fi

exit 0
