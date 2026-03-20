"""GRADIOS JARVIS API — Orquestrador Multi-Agent C-Level.

Supabase conectado via REST API (httpx) — zero dependencia de supabase-py.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncIterator
import httpx
import json
import os
import uuid
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ─── Configuracao ───────────────────────────────────────────────────
OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:14b")
ANTHROPIC_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

MAX_RETRIES: int = 3
OLLAMA_TIMEOUT: float = 120.0
AGENT_TIMEOUT: float = 30.0

# ─── Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jarvis")


# ─── Supabase REST Client (via httpx, sem SDK) ─────────────────────

class SupabaseREST:
    """Cliente leve para Supabase REST API via httpx."""

    def __init__(self, url: str, key: str) -> None:
        self.base_url = f"{url}/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self.enabled = bool(url and key)
        if self.enabled:
            logger.info("Supabase REST configurado: %s", url)
        else:
            logger.warning("Supabase REST desabilitado — SUPABASE_URL ou SUPABASE_KEY vazio")

    async def select(
        self,
        table: str,
        columns: str = "*",
        filters: dict[str, str] | None = None,
        order: str | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        """GET na tabela com filtros PostgREST."""
        if not self.enabled:
            return []
        params: dict[str, str] = {"select": columns}
        if filters:
            params.update(filters)
        if order:
            params["order"] = order
        if limit:
            params["limit"] = str(limit)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(
                    f"{self.base_url}/{table}",
                    headers=self.headers,
                    params=params,
                )
                r.raise_for_status()
                return r.json()
        except Exception as e:
            logger.warning("Supabase SELECT %s falhou: %s", table, e)
            return []

    async def insert(self, table: str, data: dict) -> dict | None:
        """POST para inserir registro."""
        if not self.enabled:
            return None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.post(
                    f"{self.base_url}/{table}",
                    headers=self.headers,
                    json=data,
                )
                r.raise_for_status()
                rows = r.json()
                return rows[0] if rows else None
        except Exception as e:
            logger.warning("Supabase INSERT %s falhou: %s", table, e)
            return None

    async def health_check(self) -> bool:
        """Testa conexao fazendo GET em jarvis_agents."""
        if not self.enabled:
            return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(
                    f"{self.base_url}/jarvis_agents",
                    headers=self.headers,
                    params={"select": "slug", "limit": "1"},
                )
                r.raise_for_status()
                return True
        except Exception:
            return False


sb = SupabaseREST(SUPABASE_URL, SUPABASE_KEY)


# ─── Agents (importados dos modulos) ─────────────────────────────────
from agents.copy import AGENT_CONFIG as _copy
from agents.dev import AGENT_CONFIG as _dev
from agents.fiscal import AGENT_CONFIG as _fiscal
from agents.ads import AGENT_CONFIG as _ads
from agents.brand import AGENT_CONFIG as _brand
from agents.manufatura import AGENT_CONFIG as _manufatura
from agents.cfo import AGENT_CONFIG as _cfo
from agents.crm import AGENT_CONFIG as _crm

AGENTS: dict[str, dict[str, str]] = {
    "copy": _copy,
    "dev": _dev,
    "fiscal": _fiscal,
    "ads": _ads,
    "brand": _brand,
    "manufatura": _manufatura,
    "cfo": _cfo,
    "crm": _crm,
}

# ─── Modelos Pydantic ───────────────────────────────────────────────

class JarvisRequest(BaseModel):
    """Requisicao para um agent."""
    message: str
    context: Optional[dict] = None
    stream: Optional[bool] = False
    use_claude: Optional[bool] = False
    session_id: Optional[str] = None


class JarvisResponse(BaseModel):
    """Resposta de um agent."""
    agent: str
    agent_name: str
    response: str
    timestamp: str
    session_id: str


class NovoLeadPayload(BaseModel):
    """Payload recebido do webhook Supabase quando quiz_leads recebe INSERT."""
    lead: dict


class DadosLead(BaseModel):
    """Dados do lead para gerar proposta (quando nao tem lead_id)."""
    nome: str
    empresa: str
    segmento: str = "Nao informado"
    dor_principal: str = "Nao informado"
    score: int = 0


class GerarPropostaPayload(BaseModel):
    """Payload para gerar proposta comercial."""
    lead_id: Optional[int] = None
    dados_lead: Optional[DadosLead] = None
    valor_estimado: float = 5000.0
    servicos: list[str] = []


# ─── App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="GRADIOS JARVIS API",
    version="2.1.0",
    description="Orquestrador Multi-Agent C-Level",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Funcoes de IA ──────────────────────────────────────────────────

async def call_ollama(
    system: str,
    messages: list[dict[str, str]],
    stream: bool = False,
) -> AsyncIterator[str]:
    """Chama o Ollama com retry automatico (3x)."""
    ollama_messages = [{"role": "system", "content": system}] + messages
    payload = {
        "model": OLLAMA_MODEL,
        "messages": ollama_messages,
        "stream": stream,
    }

    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
                if stream:
                    async with client.stream(
                        "POST", f"{OLLAMA_URL}/api/chat", json=payload
                    ) as r:
                        r.raise_for_status()
                        async for line in r.aiter_lines():
                            if line:
                                yield line
                    return
                else:
                    r = await client.post(
                        f"{OLLAMA_URL}/api/chat", json=payload
                    )
                    r.raise_for_status()
                    data = r.json()
                    yield data["message"]["content"]
                    return
        except Exception as e:
            last_error = e
            logger.warning(
                "Ollama tentativa %d/%d falhou: %s", attempt, MAX_RETRIES, e
            )
            if attempt < MAX_RETRIES:
                import asyncio
                await asyncio.sleep(1.0 * attempt)

    raise ConnectionError(
        f"Ollama indisponivel apos {MAX_RETRIES} tentativas: {last_error}"
    )


async def call_claude(system: str, messages: list[dict[str, str]]) -> str:
    """Chama a API Claude da Anthropic."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_KEY)
    r = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=system,
        messages=messages,
    )
    return r.content[0].text


# ─── Memoria (Supabase REST) ─────────────────────────────────────

async def load_history(session_id: str, limit: int = 10) -> list[dict[str, str]]:
    """Carrega historico de conversa do Supabase via REST."""
    if not sb.enabled or not session_id:
        return []
    rows = await sb.select(
        "jarvis_memory",
        columns="user_message,agent_response",
        filters={"session_id": f"eq.{session_id}"},
        order="created_at.asc",
        limit=limit,
    )
    history: list[dict[str, str]] = []
    for row in rows:
        history.append({"role": "user", "content": row["user_message"]})
        history.append({"role": "assistant", "content": row["agent_response"]})
    return history


async def save_message(
    session_id: str,
    agent: str,
    user_message: str,
    agent_response: str,
) -> None:
    """Salva mensagem no Supabase via REST."""
    await sb.insert("jarvis_memory", {
        "session_id": session_id,
        "agent": agent,
        "user_message": user_message,
        "agent_response": agent_response,
    })


# ─── Contexto CRM (Supabase REST) ────────────────────────────────

async def get_leads_context(limit: int = 10) -> str:
    """Busca os leads mais recentes do Supabase para contexto do agent CRM."""
    if not sb.enabled:
        return "[Supabase nao conectado — sem dados de leads]"

    leads = await sb.select(
        "leads",
        columns="id,nome,empresa,whatsapp,segmento,dor_principal,faturamento,lead_temperature,score,created_at",
        order="created_at.desc",
        limit=limit,
    )
    if not leads:
        return "[Nenhum lead encontrado no CRM]"

    # Estatisticas
    total = len(leads)
    por_temperatura: dict[str, int] = {}
    for lead in leads:
        t = lead.get("lead_temperature") or "nao_classificado"
        por_temperatura[t] = por_temperatura.get(t, 0) + 1

    lines = [
        f"DADOS CRM ATUAIS ({total} leads mais recentes):",
        f"Por temperatura: {json.dumps(por_temperatura, ensure_ascii=False)}",
        "",
        "LEADS DETALHADOS:",
    ]
    for lead in leads:
        lines.append(
            f"- {lead.get('nome', 'N/A')} | {lead.get('empresa', 'N/A')} | "
            f"Temp: {lead.get('lead_temperature', 'N/A')} | "
            f"Score: {lead.get('score', 'N/A')} | "
            f"Segmento: {lead.get('segmento', 'N/A')} | "
            f"Dor: {lead.get('dor_principal', 'N/A')}"
        )

    return "\n".join(lines)


async def get_pipeline_summary() -> dict:
    """Retorna resumo do pipeline para o endpoint /jarvis/crm/leads."""
    if not sb.enabled:
        return {"error": "Supabase nao conectado"}

    leads = await sb.select(
        "leads",
        columns="id,nome,empresa,segmento,lead_temperature,score,faturamento,dor_principal,created_at",
        order="created_at.desc",
        limit=50,
    )

    opportunities = await sb.select(
        "crm_opportunities",
        columns="id,title,value,stage,expected_close_date,created_at",
        order="created_at.desc",
        limit=20,
    )

    return {
        "total_leads": len(leads),
        "total_opportunities": len(opportunities),
        "leads": leads,
        "opportunities": opportunities,
    }


# ─── Contexto CFO (Supabase REST) ────────────────────────────────

async def get_cfo_context() -> str:
    """Busca dados financeiros do mes atual do Supabase para contexto do agent CFO."""
    if not sb.enabled:
        return "[Supabase nao conectado — sem dados financeiros]"

    now = datetime.now(timezone.utc)
    mes_inicio = now.strftime("%Y-%m-01")
    mes_fim = now.strftime("%Y-%m-%dT23:59:59")

    receitas = await sb.select(
        "receitas",
        columns="valor_bruto,taxas,tipo,recorrente,status,cliente",
        filters={"and": f"(data.gte.{mes_inicio},data.lte.{mes_fim})"},
    )

    custos = await sb.select(
        "custos_fixos",
        columns="nome,valor_mensal,categoria,status",
        filters={"status": "eq.ativo"},
    )

    gastos = await sb.select(
        "gastos_variaveis",
        columns="descricao,valor,tipo,categoria,status",
        filters={"and": f"(data.gte.{mes_inicio},data.lte.{mes_fim})"},
    )

    caixa_rows = await sb.select(
        "caixa",
        columns="saldo,banco,data",
        order="data.desc",
        limit=1,
    )
    caixa = caixa_rows[0] if caixa_rows else None

    # Calculos
    receita_bruta = sum(float(r.get("valor_bruto", 0) or 0) for r in receitas if r.get("status") == "confirmado")
    mrr = sum(
        float(r.get("valor_bruto", 0) or 0)
        for r in receitas
        if r.get("recorrente") and r.get("status") == "confirmado"
    )

    total_custos_fixos = sum(float(c.get("valor_mensal", 0) or 0) for c in custos)
    total_gastos_var = sum(float(g.get("valor", 0) or 0) for g in gastos if g.get("status") == "confirmado")
    impostos_var = sum(
        float(g.get("valor", 0) or 0)
        for g in gastos
        if g.get("tipo") == "impostos" and g.get("status") == "confirmado"
    )

    gastos_var_sem_impostos = total_gastos_var - impostos_var
    margem_bruta = receita_bruta - gastos_var_sem_impostos
    resultado_operacional = margem_bruta - total_custos_fixos
    resultado_liquido = resultado_operacional - impostos_var
    burn_rate = total_custos_fixos + total_gastos_var
    saldo_caixa = float(caixa.get("saldo", 0)) if caixa else 0
    runway_meses = round(saldo_caixa / burn_rate, 1) if burn_rate > 0 else 0
    clientes_ativos = len(set(r.get("cliente", "") for r in receitas if r.get("status") == "confirmado"))

    pct = f"  ({(margem_bruta / receita_bruta * 100):.1f}%)" if receita_bruta else ""

    lines = [
        f"DADOS FINANCEIROS — {now.strftime('%B %Y').upper()}:",
        "",
        "DRE SIMPLIFICADA:",
        f"  Receita Bruta:           R$ {receita_bruta:>12,.2f}",
        f"  (-) Custos Variaveis:    R$ {gastos_var_sem_impostos:>12,.2f}",
        f"  (=) Margem Bruta:        R$ {margem_bruta:>12,.2f}{pct}",
        f"  (-) Custos Fixos:        R$ {total_custos_fixos:>12,.2f}",
        f"  (=) Resultado Operac.:   R$ {resultado_operacional:>12,.2f}",
        f"  (-) Impostos:            R$ {impostos_var:>12,.2f}",
        f"  (=) Resultado Liquido:   R$ {resultado_liquido:>12,.2f}",
        "",
        "KPIs:",
        f"  MRR: R$ {mrr:,.2f}",
        f"  Clientes ativos: {clientes_ativos}",
        f"  Saldo em caixa: R$ {saldo_caixa:,.2f} ({caixa.get('banco', 'N/A')})" if caixa else "  Saldo em caixa: N/A",
        f"  Burn Rate mensal: R$ {burn_rate:,.2f}",
        f"  Runway: {runway_meses} meses",
        "",
        f"CUSTOS FIXOS ({len(custos)} ativos):",
    ]
    for c in custos[:10]:
        lines.append(f"  - {c.get('nome', 'N/A')}: R$ {float(c.get('valor_mensal', 0)):,.2f} ({c.get('categoria', 'N/A')})")

    lines.append(f"\nRECEITAS DO MES ({len(receitas)} lancamentos):")
    for r in receitas[:10]:
        lines.append(
            f"  - {r.get('cliente', 'N/A')}: R$ {float(r.get('valor_bruto', 0)):,.2f} "
            f"({r.get('tipo', 'N/A')}) [{r.get('status', 'N/A')}]"
        )

    return "\n".join(lines)


async def get_cfo_summary() -> dict:
    """Retorna resumo financeiro estruturado para o endpoint /jarvis/cfo/resumo."""
    if not sb.enabled:
        return {"error": "Supabase nao conectado"}

    now = datetime.now(timezone.utc)
    mes_inicio = now.strftime("%Y-%m-01")
    mes_fim = now.strftime("%Y-%m-%dT23:59:59")

    receitas = await sb.select(
        "receitas",
        columns="valor_bruto,taxas,tipo,recorrente,status,cliente",
        filters={"and": f"(data.gte.{mes_inicio},data.lte.{mes_fim})"},
    )
    custos = await sb.select(
        "custos_fixos",
        columns="nome,valor_mensal,categoria",
        filters={"status": "eq.ativo"},
    )
    gastos = await sb.select(
        "gastos_variaveis",
        columns="descricao,valor,tipo,categoria,status",
        filters={"and": f"(data.gte.{mes_inicio},data.lte.{mes_fim})"},
    )
    caixa_rows = await sb.select(
        "caixa", columns="saldo,banco,data", order="data.desc", limit=1,
    )

    receita_bruta = sum(float(r.get("valor_bruto", 0) or 0) for r in receitas if r.get("status") == "confirmado")
    mrr = sum(float(r.get("valor_bruto", 0) or 0) for r in receitas if r.get("recorrente") and r.get("status") == "confirmado")
    total_custos_fixos = sum(float(c.get("valor_mensal", 0) or 0) for c in custos)
    total_gastos_var = sum(float(g.get("valor", 0) or 0) for g in gastos if g.get("status") == "confirmado")
    impostos = sum(float(g.get("valor", 0) or 0) for g in gastos if g.get("tipo") == "impostos" and g.get("status") == "confirmado")
    saldo = float(caixa_rows[0].get("saldo", 0)) if caixa_rows else 0
    burn = total_custos_fixos + total_gastos_var

    return {
        "periodo": now.strftime("%Y-%m"),
        "receita_bruta": receita_bruta,
        "mrr": mrr,
        "custos_fixos": total_custos_fixos,
        "gastos_variaveis": total_gastos_var,
        "impostos": impostos,
        "resultado_liquido": receita_bruta - (total_gastos_var - impostos) - total_custos_fixos - impostos,
        "saldo_caixa": saldo,
        "burn_rate": burn,
        "runway_meses": round(saldo / burn, 1) if burn > 0 else 0,
        "clientes_ativos": len(set(r.get("cliente", "") for r in receitas if r.get("status") == "confirmado")),
    }


# ─── Endpoints basicos ──────────────────────────────────────────────

@app.get("/")
async def root() -> dict:
    """Status da API."""
    return {
        "status": "GRADIOS JARVIS ONLINE",
        "agents": list(AGENTS.keys()),
        "model": OLLAMA_MODEL,
    }


@app.get("/agents")
async def list_agents() -> dict:
    """Lista todos os agents com nome e titulo."""
    return {
        k: {"name": v["name"], "title": v["title"]}
        for k, v in AGENTS.items()
    }


# ─── Streaming ──────────────────────────────────────────────────────

@app.post("/jarvis/{agent}/stream")
async def stream_agent(agent: str, req: JarvisRequest) -> StreamingResponse:
    """Chama um agent com streaming via SSE."""
    if agent not in AGENTS:
        raise HTTPException(404, "Agent nao existe")

    cfg = AGENTS[agent]
    system = cfg["system"]
    if req.context:
        system += f"\n\nCONTEXTO:\n{json.dumps(req.context, ensure_ascii=False, indent=2)}"

    session_id = req.session_id or str(uuid.uuid4())
    history = await load_history(session_id)
    messages = history + [{"role": "user", "content": req.message}]

    async def gen() -> AsyncIterator[str]:
        yield f'data: {json.dumps({"type": "start", "session_id": session_id})}\n\n'
        full_response = ""
        try:
            async for line in call_ollama(system, messages, stream=True):
                try:
                    d = json.loads(line)
                    token = d.get("message", {}).get("content", "")
                    if token:
                        full_response += token
                        yield f'data: {json.dumps({"token": token, "type": "token"})}\n\n'
                    if d.get("done"):
                        yield f'data: {json.dumps({"type": "done"})}\n\n'
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            logger.error("Erro no streaming %s: %s", agent, e)
            yield f'data: {json.dumps({"type": "error", "message": str(e)})}\n\n'

        await save_message(session_id, agent, req.message, full_response)

    return StreamingResponse(gen(), media_type="text/event-stream")


# ─── Orquestracao ───────────────────────────────────────────────────

@app.post("/jarvis/orchestrate")
async def orchestrate(req: JarvisRequest) -> dict:
    """Endpoint de orquestracao inteligente — detecta e consulta agents relevantes."""
    import asyncio

    message_lower = req.message.lower()

    keyword_map: dict[str, list[str]] = {
        "manufatura": ["fabrica", "producao", "maquina", "automacao", "industria", "roi industrial", "oee", "setup"],
        "fiscal": ["imposto", "icms", "cfop", "ncm", "tributar", "fiscal", "cbs", "ibs", "pis", "cofins", "nota fiscal"],
        "copy": ["copy", "texto", "headline", "cta", "persuasao", "landing page", "email marketing", "conversao"],
        "dev": ["codigo", "next.js", "react", "api", "supabase", "typescript", "deploy", "bug", "frontend", "backend"],
        "ads": ["campanha", "meta ads", "google ads", "roas", "cpc", "ctr", "anuncio", "trafego", "midia paga"],
        "brand": ["marca", "branding", "logo", "identidade", "tipografia", "paleta", "design", "visual"],
        "cfo": ["financeiro", "dre", "ebitda", "valuation", "kpi", "orcamento", "fluxo de caixa", "dashboard"],
        "crm": ["cliente", "pipeline", "vendas", "lead", "proposta", "forecast", "crm", "comercial"],
    }

    relevant_agents: list[str] = []
    for agent_slug, keywords in keyword_map.items():
        if any(kw in message_lower for kw in keywords):
            relevant_agents.append(agent_slug)

    if not relevant_agents:
        relevant_agents = ["dev"]

    session_id = req.session_id or str(uuid.uuid4())
    messages = [{"role": "user", "content": req.message}]

    async def query_agent(slug: str) -> dict:
        cfg = AGENTS[slug]
        try:
            response_text = ""
            async with asyncio.timeout(AGENT_TIMEOUT):
                async for chunk in call_ollama(cfg["system"], messages):
                    response_text += chunk
            return {"agent": slug, "name": cfg["name"], "title": cfg["title"], "response": response_text}
        except TimeoutError:
            return {"agent": slug, "name": cfg["name"], "title": cfg["title"], "response": f"[Timeout: {slug} nao respondeu em {AGENT_TIMEOUT}s]"}
        except Exception as e:
            return {"agent": slug, "name": cfg["name"], "title": cfg["title"], "response": f"[Erro: {e}]"}

    results = await asyncio.gather(*[query_agent(slug) for slug in relevant_agents])

    return {
        "session_id": session_id,
        "agents_consulted": relevant_agents,
        "responses": results,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Endpoints CRM integrado ──────────────────────────────────────

@app.get("/jarvis/crm/leads")
async def crm_leads_analysis() -> dict:
    """Retorna analise dos leads atuais com IA."""
    pipeline = await get_pipeline_summary()
    if "error" in pipeline:
        raise HTTPException(503, pipeline["error"])

    context = await get_leads_context()
    system = AGENTS["crm"]["system"] + f"\n\n{context}"
    messages = [{"role": "user", "content": (
        "Analise o pipeline atual de leads. Para cada lead quente ou com valor alto, "
        "sugira uma estrategia de abordagem especifica. Destaque oportunidades urgentes "
        "e leads que precisam de follow-up imediato. Seja direto e acionavel."
    )}]

    try:
        response_text = ""
        async for chunk in call_ollama(system, messages):
            response_text += chunk
    except Exception as e:
        raise HTTPException(502, f"Erro ao gerar analise: {e}")

    return {
        "pipeline": pipeline,
        "analise_ia": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Webhook: Novo lead do quiz → analise CRM automatica ──────────

def classificar_lead(score: int) -> dict:
    """Classifica lead por score do quiz em tier A/B/C/D."""
    if score >= 75:
        return {"tier": "A", "label": "Quente", "prioridade": "imediata", "sla_horas": 2}
    if score >= 55:
        return {"tier": "B", "label": "Morno-quente", "prioridade": "alta", "sla_horas": 6}
    if score >= 40:
        return {"tier": "C", "label": "Morno", "prioridade": "media", "sla_horas": 24}
    return {"tier": "D", "label": "Frio", "prioridade": "baixa", "sla_horas": 72}


@app.post("/jarvis/crm/novo-lead")
async def crm_novo_lead(payload: NovoLeadPayload) -> dict:
    """Recebe novo lead do quiz e gera analise CRM automatica.

    Chamado pelo webhook/trigger do Supabase quando INSERT em quiz_leads.
    Gera: script de abordagem, classificacao, proxima acao.
    Salva em jarvis_studies e jarvis_memory.
    """
    lead = payload.lead
    nome = lead.get("nome", "Lead desconhecido")
    empresa = lead.get("empresa", "Empresa nao informada")
    email = lead.get("email", "")
    score = int(lead.get("score", 0) or 0)
    segmento = lead.get("setor") or lead.get("segmento", "Nao informado")
    dor = lead.get("dor_principal") or lead.get("gargalos", "Nao informado")
    urgencia = lead.get("urgencia", "Nao informado")
    cargo = lead.get("cargo", "Nao informado")
    tamanho = lead.get("tamanho", "Nao informado")
    whatsapp = lead.get("whatsapp", "")

    # Classificacao
    tier = classificar_lead(score)

    # Contexto para o agent CRM
    lead_context = (
        f"NOVO LEAD DO QUIZ — ANALISE URGENTE\n\n"
        f"DADOS DO LEAD:\n"
        f"- Nome: {nome}\n"
        f"- Empresa: {empresa}\n"
        f"- Email: {email}\n"
        f"- WhatsApp: {whatsapp or 'nao informado'}\n"
        f"- Cargo: {cargo}\n"
        f"- Tamanho empresa: {tamanho}\n"
        f"- Segmento: {segmento}\n"
        f"- Dor principal: {dor}\n"
        f"- Urgencia: {urgencia}\n"
        f"- Score quiz: {score}/100\n"
        f"- Classificacao: Tier {tier['tier']} ({tier['label']})\n"
        f"- SLA contato: {tier['sla_horas']} horas\n"
    )

    system = AGENTS["crm"]["system"] + f"\n\n{lead_context}"
    messages = [{"role": "user", "content": (
        f"Novo lead acabou de entrar pelo quiz: {nome} da {empresa}, "
        f"score {score}/100 (Tier {tier['tier']}), segmento {segmento}.\n\n"
        "Gere EXATAMENTE nesta estrutura:\n\n"
        "1. CLASSIFICACAO E DIAGNOSTICO\n"
        "   - Tier e justificativa\n"
        "   - Potencial estimado de projeto\n"
        "   - Probabilidade de fechamento\n\n"
        "2. SCRIPT WHATSAPP (pronto para copiar e enviar)\n"
        "   - Primeira mensagem personalizada\n"
        "   - Segunda mensagem caso nao responda em 24h\n\n"
        "3. SCRIPT EMAIL (pronto para enviar)\n"
        "   - Subject line\n"
        "   - Corpo do email\n\n"
        "4. PROXIMA ACAO\n"
        "   - O que fazer agora\n"
        "   - Follow-up em quantos dias\n"
        "   - Quem deve abordar (Daniel/Gustavo)\n\n"
        "Use os dados reais do lead. Nada generico."
    )}]

    # Session ID unico para esse lead
    session_id = str(uuid.uuid4())

    try:
        response_text = ""
        async for chunk in call_ollama(system, messages):
            response_text += chunk
    except Exception as e:
        logger.error("Erro ao analisar novo lead %s: %s", nome, e)
        raise HTTPException(502, f"Erro ao gerar analise: {e}")

    # Salva em jarvis_studies
    await sb.insert("jarvis_studies", {
        "title": f"Analise novo lead: {nome} ({empresa}) — Tier {tier['tier']}",
        "agent": "crm",
        "content": response_text,
        "summary": f"Score {score}/100 | Tier {tier['tier']} | {segmento} | SLA {tier['sla_horas']}h",
        "tags": [f"tier-{tier['tier'].lower()}", segmento.lower(), "quiz-lead", "auto-generated"],
        "status": "completo",
    })

    # Salva em jarvis_memory para historico
    await save_message(
        session_id=session_id,
        agent="crm",
        user_message=f"[WEBHOOK] Novo lead do quiz: {nome} ({empresa}), score {score}, {segmento}",
        agent_response=response_text,
    )

    logger.info(
        "Novo lead analisado: %s (%s) — Tier %s — Score %d",
        nome, empresa, tier["tier"], score,
    )

    return {
        "status": "ok",
        "lead": {
            "nome": nome,
            "empresa": empresa,
            "email": email,
            "score": score,
            "segmento": segmento,
        },
        "classificacao": tier,
        "analise_ia": response_text,
        "session_id": session_id,
        "saved_to": ["jarvis_studies", "jarvis_memory"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Gerar proposta comercial com 1 clique ────────────────────────

@app.post("/jarvis/crm/gerar-proposta")
async def crm_gerar_proposta(payload: GerarPropostaPayload) -> dict:
    """Gera proposta comercial completa em markdown usando agents Copy + CRM.

    Busca dados do lead no Supabase (se lead_id informado) ou usa dados_lead.
    Salva proposta na tabela crm_proposals com status draft.
    """
    import time
    t0 = time.perf_counter()

    # ── 1. Resolver dados do lead ──────────────────────────────────
    nome = ""
    empresa = ""
    segmento = ""
    dor = ""
    lead_score = 0

    if payload.lead_id and sb.enabled:
        # Busca lead real no Supabase
        rows = await sb.select(
            "leads",
            columns="id,nome,empresa,segmento,dor_principal,score,whatsapp",
            filters={"id": f"eq.{payload.lead_id}"},
            limit=1,
        )
        if rows:
            lead = rows[0]
            nome = lead.get("nome", "")
            empresa = lead.get("empresa", "")
            segmento = lead.get("segmento", "")
            dor = lead.get("dor_principal", "")
            lead_score = int(lead.get("score", 0) or 0)

    # Fallback para dados_lead do payload
    if not nome and payload.dados_lead:
        nome = payload.dados_lead.nome
        empresa = payload.dados_lead.empresa
        segmento = payload.dados_lead.segmento
        dor = payload.dados_lead.dor_principal
        lead_score = payload.dados_lead.score

    if not nome or not empresa:
        raise HTTPException(400, "Informe lead_id ou dados_lead com nome e empresa")

    # ── 2. Calcular opcoes de valor ────────────────────────────────
    valor_base = payload.valor_estimado
    valor_essencial = round(valor_base * 0.65, 2)
    valor_completo = round(valor_base, 2)
    valor_premium = round(valor_base * 1.45, 2)

    servicos_texto = ", ".join(payload.servicos) if payload.servicos else "automacao de processos"

    # ── 3. Montar prompt para agent Copy ───────────────────────────
    system = AGENTS["copy"]["system"] + (
        "\n\nMISSAO ESPECIFICA: Gerar proposta comercial completa em markdown.\n"
        "Voce esta criando uma proposta real que sera enviada ao cliente.\n"
        "Tom: profissional, direto, confiante. Sem exageros. Com numeros reais.\n"
        "A GRADIOS entrega resultado em 2 semanas, sem contrato longo."
    )

    prompt = (
        f"Gere uma proposta comercial COMPLETA em markdown para:\n\n"
        f"LEAD:\n"
        f"- Nome: {nome}\n"
        f"- Empresa: {empresa}\n"
        f"- Segmento: {segmento}\n"
        f"- Dor principal: {dor}\n"
        f"- Score quiz: {lead_score}/100\n"
        f"- Servicos solicitados: {servicos_texto}\n\n"
        f"VALORES PRE-CALCULADOS:\n"
        f"- Opcao Essencial: R$ {valor_essencial:,.2f}\n"
        f"- Opcao Completa: R$ {valor_completo:,.2f} (recomendada)\n"
        f"- Opcao Premium: R$ {valor_premium:,.2f}\n\n"
        f"ESTRUTURA OBRIGATORIA (em markdown):\n\n"
        f"# Proposta Comercial — {empresa}\n\n"
        f"## O Problema\n"
        f"(2-3 paragrafos baseados na dor real do lead: '{dor}'. "
        f"Especifico para o segmento {segmento}. Cite numeros e consequencias reais.)\n\n"
        f"## Nossa Solucao\n"
        f"(O que a GRADIOS vai entregar: {servicos_texto}. "
        f"Explique como resolve cada dor mencionada. Seja concreto.)\n\n"
        f"## Como Vamos Trabalhar\n"
        f"**Fase 1 (Semana 1-2):** Diagnostico e configuracao\n"
        f"**Fase 2 (Semana 3-4):** Implementacao e testes\n"
        f"**Fase 3 (Semana 5-6):** Ajustes, entrega final e treinamento\n"
        f"(Detalhe cada fase com entregas especificas para {empresa})\n\n"
        f"## Investimento\n\n"
        f"| Opcao | Escopo | Valor |\n"
        f"|-------|--------|-------|\n"
        f"| Essencial | Escopo basico — resolve a dor principal | R$ {valor_essencial:,.2f} |\n"
        f"| **Completa** | **Escopo recomendado — resolve dor + integracao** | **R$ {valor_completo:,.2f}** |\n"
        f"| Premium | Escopo completo + suporte 3 meses + treinamento | R$ {valor_premium:,.2f} |\n\n"
        f"(Explique brevemente o que cada opcao inclui e exclui)\n\n"
        f"## Por que a GRADIOS\n"
        f"(3 diferenciais concretos. Sem cliche. Provas sociais reais.)\n\n"
        f"## Proximo Passo\n"
        f"(CTA direto com urgencia natural. Sugira agendar uma call de 30 min.)\n\n"
        f"---\n"
        f"*Proposta gerada por JARVIS — Gradios {datetime.now().strftime('%d/%m/%Y')}*\n\n"
        f"IMPORTANTE: Retorne APENAS o markdown da proposta, sem explicacoes extras."
    )

    messages = [{"role": "user", "content": prompt}]

    # ── 4. Gerar proposta via Ollama ───────────────────────────────
    try:
        response_text = ""
        async for chunk in call_ollama(system, messages):
            response_text += chunk
    except Exception as e:
        logger.error("Erro ao gerar proposta para %s: %s", empresa, e)
        raise HTTPException(502, f"Erro ao gerar proposta: {e}")

    tempo_ms = int((time.perf_counter() - t0) * 1000)

    # ── 5. Salvar na tabela crm_proposals ──────────────────────────
    proposta_data = {
        "title": f"Proposta {empresa} — {servicos_texto[:50]}",
        "value": valor_completo,
        "status": "Rascunho",
        "content": response_text,
        "gerada_por": "jarvis",
        "agent_usado": "copy",
        "session_id": str(uuid.uuid4()),
        "versao": 1,
    }

    # Vincula ao opportunity se existir
    if payload.lead_id:
        proposta_data["lead_id"] = payload.lead_id

    saved = await sb.insert("crm_proposals", proposta_data)
    proposta_id = saved.get("id") if saved else None

    # Tambem salva como estudo em jarvis_studies
    await sb.insert("jarvis_studies", {
        "title": f"Proposta comercial: {empresa} — R$ {valor_completo:,.2f}",
        "agent": "copy",
        "content": response_text,
        "summary": f"{servicos_texto} | Essencial R${valor_essencial:,.0f} | Completa R${valor_completo:,.0f} | Premium R${valor_premium:,.0f}",
        "tags": ["proposta", segmento.lower(), "auto-generated"],
        "status": "completo",
    })

    logger.info(
        "Proposta gerada: %s (%s) — R$ %s — %dms",
        empresa, segmento, f"{valor_completo:,.2f}", tempo_ms,
    )

    return {
        "status": "ok",
        "proposta_id": proposta_id,
        "proposta_markdown": response_text,
        "lead": {
            "nome": nome,
            "empresa": empresa,
            "segmento": segmento,
            "score": lead_score,
        },
        "valor_opcoes": {
            "essencial": valor_essencial,
            "completo": valor_completo,
            "premium": valor_premium,
        },
        "tempo_geracao_ms": tempo_ms,
        "saved_to": ["crm_proposals", "jarvis_studies"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Endpoints CFO integrado ──────────────────────────────────────

@app.get("/jarvis/cfo/resumo")
async def cfo_resumo_analysis() -> dict:
    """Retorna analise financeira do mes com IA."""
    summary = await get_cfo_summary()
    if "error" in summary:
        raise HTTPException(503, summary["error"])

    context = await get_cfo_context()
    system = AGENTS["cfo"]["system"] + f"\n\n{context}"
    messages = [{"role": "user", "content": (
        "Analise os dados financeiros do mes atual. Identifique: "
        "1) Se a empresa esta saudavel financeiramente, "
        "2) Riscos ou alertas (burn rate vs caixa, margem apertada), "
        "3) Oportunidades de otimizacao de custos, "
        "4) Projecao para os proximos 3 meses baseada na tendencia atual. "
        "Use numeros reais dos dados. Seja direto como um CFO de McKinsey."
    )}]

    try:
        response_text = ""
        async for chunk in call_ollama(system, messages):
            response_text += chunk
    except Exception as e:
        raise HTTPException(502, f"Erro ao gerar analise: {e}")

    return {
        "resumo": summary,
        "analise_ia": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Agent call (com contexto automatico CRM/CFO) ─────────────────

@app.post("/jarvis/{agent}", response_model=JarvisResponse)
async def call_agent(agent: str, req: JarvisRequest) -> JarvisResponse:
    """Chama um agent. CRM e CFO recebem contexto real do Supabase automaticamente."""
    if agent == "crm" and sb.enabled:
        crm_context = await get_leads_context()
        if req.context is None:
            req.context = {}
        req.context["crm_pipeline"] = crm_context
    elif agent == "cfo" and sb.enabled:
        cfo_context = await get_cfo_context()
        if req.context is None:
            req.context = {}
        req.context["financeiro_atual"] = cfo_context

    if agent not in AGENTS:
        raise HTTPException(404, f"Agent nao encontrado. Disponiveis: {list(AGENTS.keys())}")

    cfg = AGENTS[agent]
    system = cfg["system"]
    if req.context:
        system += f"\n\nCONTEXTO:\n{json.dumps(req.context, ensure_ascii=False, indent=2)}"

    session_id = req.session_id or str(uuid.uuid4())
    history = await load_history(session_id)
    messages = history + [{"role": "user", "content": req.message}]

    try:
        if req.use_claude and ANTHROPIC_KEY:
            response_text = await call_claude(system, messages)
        else:
            response_text = ""
            async for chunk in call_ollama(system, messages):
                response_text += chunk
    except ConnectionError as e:
        raise HTTPException(502, f"Modelo indisponivel: {e}")
    except Exception as e:
        logger.error("Erro no agent %s: %s", agent, e, exc_info=True)
        raise HTTPException(502, f"Erro interno: {type(e).__name__}")

    await save_message(session_id, agent, req.message, response_text)

    return JarvisResponse(
        agent=agent,
        agent_name=cfg["name"],
        response=response_text,
        timestamp=datetime.now(timezone.utc).isoformat(),
        session_id=session_id,
    )


# ─── Health check ──────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    """Health check completo do sistema."""
    # Ollama
    ollama_ok = False
    models: list[str] = []
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            models = [m["name"] for m in r.json().get("models", [])]
        ollama_ok = True
    except Exception as e:
        logger.warning("Health check Ollama falhou: %s", e)

    # Supabase (GET /jarvis_agents via REST)
    supabase_ok = await sb.health_check()

    return {
        "status": "ok",
        "ollama": ollama_ok,
        "models": models,
        "supabase": supabase_ok,
        "claude": bool(ANTHROPIC_KEY),
        "agents": list(AGENTS.keys()),
        "version": "2.1.0",
    }
