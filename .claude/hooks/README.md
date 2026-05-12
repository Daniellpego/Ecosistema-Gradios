# Hooks do Claude Code — Gradios

> **Princípio:** só hooks que retornam **`exit 2`** são determinísticos. `permissions` em `settings.json` e diretivas em `CLAUDE.md` são **advisórios** — o agente pode contornar. Hooks shell que retornam `exit 2` são a única defesa que o Claude não consegue burlar.

## Hooks instalados

| Hook | Trigger | O que bloqueia |
|---|---|---|
| [`protect_env.sh`](protect_env.sh) | `PreToolUse` em `Edit`/`Write` | Edição de `.env`, `.env.local`, `.env.*.local` |
| [`protect_migrations.sh`](protect_migrations.sh) | `PreToolUse` em `Edit`/`Bash` | Edição de migrations 001-016 (já aplicadas); `rm`/`mv` em `supabase/migrations/`; `supabase db reset` |
| [`protect_dangerous_bash.sh`](protect_dangerous_bash.sh) | `PreToolUse` em `Bash` | `git push --force` em main/master; `git reset --hard origin/main`; `rm -rf` em dirs protegidos (`.git`, `apps/`, `packages/`, `supabase/`, `.github/`); `npm publish`; `DROP DATABASE/SCHEMA/TABLE` em SQL; `supabase secrets unset`; alteração de `git user.name/email` |

## Como funciona

1. Claude vai usar `Edit`, `Write` ou `Bash`
2. Antes de executar, o Claude Code dispara `PreToolUse` → roda o hook correspondente passando JSON via stdin
3. Hook lê `tool_input.file_path` ou `tool_input.command`
4. Se identifica violação → escreve em **stderr** + retorna **`exit 2`** → Claude vê o erro e tenta abordagem diferente
5. Se OK → `exit 0` → Claude segue normal

## Adicionar novo hook

1. Criar `nome.sh` aqui em `.claude/hooks/`
2. `chmod +x nome.sh` (em Linux/Mac)
3. Adicionar entrada em `.claude/settings.json` em `hooks.PreToolUse`
4. Sempre seguir o padrão:
   - Ler JSON do stdin
   - Extrair campo relevante
   - Se violação → `echo "🛑 ..." >&2 && exit 2`
   - Se OK → `exit 0`

## Cross-platform

Hooks estão em bash. Em Windows, rodam via **Git Bash** (vem com Git for Windows) ou WSL. Claude Code resolve o shell automaticamente.

## Testar localmente

```bash
# Simular um PreToolUse de Edit em .env
echo '{"tool_name":"Edit","tool_input":{"file_path":".env"}}' | bash .claude/hooks/protect_env.sh
echo "Exit code: $?"
# Esperado: mensagem 🛑 + exit code 2

# Simular Edit em arquivo normal
echo '{"tool_name":"Edit","tool_input":{"file_path":"apps/cfo/src/lib/format.ts"}}' | bash .claude/hooks/protect_env.sh
echo "Exit code: $?"
# Esperado: sem mensagem + exit code 0
```

## Referência

- [Anthropic — Claude Code Hooks Docs](https://docs.claude.com/en/docs/claude-code/hooks)
- Tópico interno: `E:\Cursos Claude\10 - Cybersecurity com Claude Code\` (síntese NotebookLM dos 3 vídeos de cybersec)
- Pilar #13 da MAESTRIA: "Só hooks com `exit 2` são determinísticos"
