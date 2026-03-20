# GRADIOS JARVIS — CLAUDE.md
# Master Prompt para Claude Code
# Daniel Pego / GRADIOS 2026
# github.com/Daniellpego/Ecosistema-BG-Tech-2026

---

## IDENTIDADE DO PROJETO

Voce esta refinando o **GRADIOS JARVIS** — um orquestrador multi-agent C-Level
que roda localmente com Qwen2.5:14b (RTX 4070Ti) e opcionalmente Claude via API.

**Stack atual:**
- Backend: FastAPI + Uvicorn (E:\gradios\gradios-jarvis\app.py) porta 8001
- Frontend: Next.js 15 App Router + Tailwind (E:\gradios\apps\gradios-ui)
- IA local: Ollama qwen2.5:14b
- DB: Supabase (jarvis_memory, jarvis_agents, jarvis_studies)
- Drive: E:\gradios

---

## MISSAO PRINCIPAL

Elevar o JARVIS a nivel de produto SaaS profissional. Zero gambiarras.
Codigo limpo, tipado, testavel, escalavel. Interface premium dark mode.

---

## PROBLEMAS PARA RESOLVER (em ordem de prioridade)

### 1. TAILWIND CSS NAO ESTA APLICANDO
O frontend esta sem estilos. Resolver imediatamente:
- Verificar se postcss.config.js e tailwind.config.js estao corretos
- Garantir que globals.css tem os directives corretos
- Verificar se next.config.js nao esta bloqueando CSS
- Rodar `npm run build` para verificar erros de compilacao

### 2. MELHORAR O VISUAL (apos Tailwind funcionando)
Transformar a UI atual em interface premium nivel Vercel/Linear:
- Dark mode profissional (zinc-950 background)
- Sidebar com agents com icones emoji reais
- Chat bubbles com markdown rendering (react-markdown)
- Streaming com cursor animado
- Loading states elegantes
- Responsive mobile-first
- Header com nome do agent ativo e status online

### 3. BACKEND — MELHORIAS CRITICAS

#### 3a. Corrigir supabase (instalar sem dependencias pesadas)
```
pip install supabase-py --no-deps
pip install httpx postgrest realtime storage3 gotrue
```

#### 3b. Adicionar memoria de conversas
- Carregar historico das ultimas 10 mensagens do Supabase por sessao
- Enviar historico como contexto para o Ollama
- Salvar cada mensagem com session_id, timestamp, agent

#### 3c. Endpoint de orquestracao inteligente
- Detectar automaticamente quais agents consultar baseado na mensagem
- Retornar respostas consolidadas de multiplos agents
- Timeout de 30s por agent para nao travar

#### 3d. Streaming robusto
- Tratar erros de conexao com Ollama
- Retry automatico (3x) se Ollama nao responder
- Mensagem de erro clara no frontend

### 4. CRIAR PAGINAS ADICIONAIS

#### /estudos — Biblioteca de estudos gerados
- Listar todos os estudos salvos no Supabase
- Filtrar por agent, status, tags
- Visualizar estudo completo com markdown
- Exportar como PDF

#### /dashboard — Metricas de uso
- Total de interacoes por agent (grafico de barras)
- Sessoes unicas por dia (grafico de linha)
- Agent mais usado
- Tempo medio de resposta

#### /config — Configuracoes
- Editar system prompt de cada agent
- Toggle agent ativo/inativo
- Selecionar modelo (qwen2.5:14b ou claude-opus)
- Configurar URL do Ollama

### 5. CRIAR COMPONENTES REUTILIZAVEIS

```
apps/gradios-ui/components/
  ChatMessage.tsx      — mensagem individual com markdown
  AgentCard.tsx        — card do agent na sidebar
  StreamingCursor.tsx  — cursor animado durante streaming
  StatusBadge.tsx      — badge online/offline
  MarkdownContent.tsx  — renderizador de markdown
  LoadingSpinner.tsx   — spinner de loading
```

### 6. AUTENTICACAO (Supabase Auth)
- Login com email/senha via Supabase
- Proteger todas as rotas
- Multi-tenant: cada usuario ve apenas seus dados
- Middleware Next.js para redirecionar nao autenticados

### 7. DOCKER COMPOSE COMPLETO
Atualizar docker-compose.yml para:
- Mapear volumes no drive E:
- Configurar GPU (RTX 4070Ti) para Ollama
- Redis para cache de sessoes
- Variavel OLLAMA_MODELS apontando para E:\gradios\ollama-models

### 8. TESTES
- Testes de endpoint com pytest para o FastAPI
- Testes de componente com Jest/Testing Library
- Script de health check que testa todos os agents

---

## REGRAS DE CODIGO

### Python (Backend)
- Type hints em tudo
- Async/await em todas as chamadas IO
- Tratamento de excecao especifico (nao bare except)
- Comentarios em portugues BR
- Docstrings em todas as funcoes publicas
- Usar dataclasses ou Pydantic para todos os modelos
- Logs estruturados com logging module

### TypeScript (Frontend)
- Tipos expliciitos em tudo — zero `any`
- Componentes funcionais com React.FC ou tipagem explicita de props
- Custom hooks para logica reutilizavel (useChat, useAgent, useStream)
- Constantes em UPPER_CASE em arquivo separado (lib/constants.ts)
- Fetch com tratamento de erro e timeout
- Loading e error states em todos os componentes async

### Git
- Commit a cada feature completa
- Mensagens em portugues: "feat: adiciona streaming robusto"
- Nunca commitar .env

---

## ESTRUTURA FINAL ESPERADA

```
E:\gradios\
  gradios-jarvis\
    app.py                  — FastAPI principal
    agents\                 — um arquivo por agent (modular)
      copy.py
      dev.py
      fiscal.py
      ads.py
      brand.py
      manufatura.py
      cfo.py
      crm.py
    supabase\
      agents.sql            — schema completo
    requirements.txt
    .env
    venv\

  apps\gradios-ui\
    app\
      page.tsx              — chat principal
      estudos\page.tsx      — biblioteca de estudos
      dashboard\page.tsx    — metricas
      config\page.tsx       — configuracoes
      layout.tsx
      globals.css
    components\
      ChatMessage.tsx
      AgentCard.tsx
      MarkdownContent.tsx
      StatusBadge.tsx
    lib\
      constants.ts          — AGENTS, JARVIS_URL, etc
      api.ts                — fetch helpers tipados
      hooks\
        useChat.ts
        useStream.ts
    public\
    package.json
    tailwind.config.js
    tsconfig.json

  docker-compose.yml
  start.bat
  stop.bat
  README.md
```

---

## SEQUENCIA DE EXECUCAO RECOMENDADA

1. `cd E:\gradios\apps\gradios-ui` — corrigir Tailwind primeiro
2. Verificar e corrigir todos os arquivos de config
3. `npm run dev` — confirmar que UI carrega com estilos
4. Melhorar componentes visuais
5. `cd E:\gradios\gradios-jarvis` — melhorar backend
6. Adicionar supabase e memoria
7. Criar paginas adicionais
8. Criar docker-compose final
9. Testar end-to-end todos os 8 agents
10. Commit final no GitHub

---

## TESTE DE VALIDACAO FINAL

Ao terminar, o JARVIS deve:
- [ ] Abrir em http://localhost:3000 com visual dark premium
- [ ] Sidebar com todos os 8 agents clicaveis
- [ ] Streaming funcionando (texto aparece token por token)
- [ ] Historico de conversa persistido no Supabase
- [ ] http://localhost:8001/health retornando ollama: true
- [ ] http://localhost:8001/agents listando todos os 8 agents
- [ ] Pagina /dashboard com graficos reais
- [ ] Pagina /estudos listando estudos salvos
- [ ] Zero erros no console do browser
- [ ] Zero erros no terminal do FastAPI

---

## CONTEXTO TECNICO DO HARDWARE

- CPU: nao especificado
- GPU: NVIDIA RTX 4070Ti (12GB VRAM) — usar para Ollama
- Drive projeto: E:\gradios
- Drive sistema: C:
- OS: Windows 10/11
- Ollama models: E:\gradios\ollama-models
- Modelo ativo: qwen2.5:14b

---

## COMANDOS UTEIS

```bash
# Subir API
cd E:\gradios\gradios-jarvis
venv\Scripts\uvicorn app:app --host 0.0.0.0 --port 8001 --reload

# Subir UI
cd E:\gradios\apps\gradios-ui
npm run dev

# Testar agent
curl -X POST http://localhost:8001/jarvis/manufatura -H "Content-Type: application/json" -d "{\"message\": \"calcule roi automacao fabrica 50 maquinas\"}"

# Ver logs Ollama
ollama list
ollama ps

# Health check completo
curl http://localhost:8001/health
```

---

## FRASE GUIA

> "Nao entregue rascunho. Entregue produto."
> Cada componente deve parecer que foi feito por um time senior da Vercel.
> Se nao ficou bom, refaz. Se ficou bom, documenta.
