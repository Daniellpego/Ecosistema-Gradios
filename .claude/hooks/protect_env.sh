#!/usr/bin/env bash
# protect_env.sh — bloqueia edição/escrita em arquivos .env*
#
# Hook: PreToolUse em Edit/Write
# Input: JSON via stdin com tool_input.file_path
# Saída: exit 2 + stderr → Claude vê erro e tenta outra abordagem
#
# Princípio (Pilar #13 MAESTRIA): só hooks com `exit 2` são determinísticos.
# permissions e CLAUDE.md são advisórios — o agente pode contornar.

set -euo pipefail

# Lê JSON do stdin (pode ser vazio em alguns triggers, então tenta robustamente)
INPUT=$(cat || echo '{}')

# Extrai file_path do JSON (jq se disponível, senão grep+sed simples)
if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
else
  FILE_PATH=$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' || echo "")
fi

# Normaliza separadores Windows
FILE_PATH="${FILE_PATH//\\//}"

# Lista de padrões protegidos (regex compatível com bash)
PROTECTED_PATTERNS=(
  '\.env$'
  '\.env\.'
  '\.env\.local$'
  '\.env\..*\.local$'
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "🛑 BLOQUEADO por .claude/hooks/protect_env.sh" >&2
    echo "" >&2
    echo "Tentativa de editar arquivo de ambiente: $FILE_PATH" >&2
    echo "" >&2
    echo "Arquivos .env* contêm secrets (API keys, tokens, credenciais de DB)." >&2
    echo "Não devem ser editados pelo agente." >&2
    echo "" >&2
    echo "O que fazer:" >&2
    echo "  1. Se precisa adicionar uma variável, peça ao operador humano que edite." >&2
    echo "  2. Se está documentando, edite .env.example (não tem secret)." >&2
    echo "  3. Se quer ler, leia .env.example pra ver as chaves esperadas." >&2
    exit 2
  fi
done

# Passou — libera execução
exit 0
