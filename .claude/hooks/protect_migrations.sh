#!/usr/bin/env bash
# protect_migrations.sh — bloqueia DELETE/RM de migrations + edit de migrations já aplicadas
#
# Hook: PreToolUse em Edit/Write/Bash
# Permite: criar novas migrations (Write em arquivo NOVO)
# Bloqueia: editar migrations existentes (001-016), deletar qualquer migration
#
# Princípio: migrations são imutáveis após aplicadas — alterações geram drift
# entre dev/staging/prod. Mudança = nova migration.

set -euo pipefail

INPUT=$(cat || echo '{}')

if command -v jq >/dev/null 2>&1; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")
else
  TOOL_NAME=$(echo "$INPUT" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"tool_name"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || echo "")
  FILE_PATH=$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || echo "")
  COMMAND=$(echo "$INPUT" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || echo "")
fi

FILE_PATH="${FILE_PATH//\\//}"

# Bash: bloquear rm/mv em supabase/migrations/
if [[ "$TOOL_NAME" == "Bash" ]]; then
  if echo "$COMMAND" | grep -qE '(rm|mv|rename|mklink)[[:space:]].*supabase/migrations'; then
    echo "🛑 BLOQUEADO por .claude/hooks/protect_migrations.sh" >&2
    echo "" >&2
    echo "Tentativa de remover/mover migration via Bash:" >&2
    echo "  $COMMAND" >&2
    echo "" >&2
    echo "Migrations são IMUTÁVEIS após aplicadas. Pra reverter, crie nova migration." >&2
    exit 2
  fi
  # Bloquear supabase db reset destrutivo
  if echo "$COMMAND" | grep -qE 'supabase[[:space:]]+db[[:space:]]+reset'; then
    echo "🛑 BLOQUEADO por .claude/hooks/protect_migrations.sh" >&2
    echo "" >&2
    echo "Tentativa de rodar 'supabase db reset' — comando destrutivo." >&2
    echo "Confirme com humano antes." >&2
    exit 2
  fi
  exit 0
fi

# Edit: bloquear edição de migrations 001-016 (aplicadas)
if [[ "$TOOL_NAME" == "Edit" ]]; then
  if echo "$FILE_PATH" | grep -qE 'supabase/migrations/0(0[1-9]|1[0-6])_'; then
    echo "🛑 BLOQUEADO por .claude/hooks/protect_migrations.sh" >&2
    echo "" >&2
    echo "Tentativa de editar migration aplicada: $FILE_PATH" >&2
    echo "" >&2
    echo "Migrations 001-016 já estão em produção e são imutáveis." >&2
    echo "Pra alterar schema/dados, crie uma nova migration (017+)." >&2
    exit 2
  fi
fi

exit 0
