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
from agents.pm import AGENT_CONFIG as _pm
from agents.cs import AGENT_CONFIG as _cs
from agents.design import AGENT_CONFIG as _design
from agents.rh import AGENT_CONFIG as _rh

AGENTS: dict[str, dict[str, str]] = {
    "copy": _copy,
    "dev": _dev,
    "fiscal": _fiscal,
    "ads": _ads,
    "brand": _brand,
    "manufatura": _manufatura,
    "cfo": _cfo,
    "crm": _crm,
    "pm": _pm,
    "cs": _cs,
    "design": _design,
    "rh": _rh,
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


# ─── Projetos (Supabase REST) ──────────────────────────────────────

class ProjetoPayload(BaseModel):
    """Payload para criar/atualizar projeto."""
    nome: str
    cliente: str
    valor: float = 0.0
    prazo: str = ""
    responsavel: str = "Daniel"
    descricao: str = ""
    status: str = "backlog"
    progresso: int = 0


class ProjetoStatusPatch(BaseModel):
    """Payload para atualizar status do projeto."""
    projeto_id: str
    status: str


@app.post("/jarvis/projetos")
async def criar_projeto(payload: ProjetoPayload) -> dict:
    """Cria um novo projeto no Supabase."""
    data = payload.model_dump()
    result = await sb.insert("projetos", data)
    if not result:
        raise HTTPException(500, "Erro ao criar projeto no Supabase")
    return {"status": "ok", "projeto": result}


@app.patch("/jarvis/projetos/status")
async def atualizar_status_projeto(payload: ProjetoStatusPatch) -> dict:
    """Atualiza o status de um projeto (drag-drop no Kanban)."""
    if not sb.enabled:
        raise HTTPException(503, "Supabase nao conectado")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.patch(
                f"{sb.base_url}/projetos",
                headers=sb.headers,
                params={"id": f"eq.{payload.projeto_id}"},
                json={"status": payload.status},
            )
            r.raise_for_status()
            return {"status": "ok"}
    except Exception as e:
        logger.error("Erro ao atualizar status projeto: %s", e)
        raise HTTPException(500, str(e))


@app.get("/jarvis/projetos")
async def listar_projetos() -> list[dict]:
    """Lista todos os projetos."""
    return await sb.select("projetos", order="created_at.desc", limit=100)


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
        "pm": ["projeto", "cronograma", "prazo", "entrega", "sprint", "milestone", "atraso", "wbs", "gantt", "backlog"],
        "cs": ["satisfacao", "nps", "churn", "retencao", "onboarding", "health score", "customer success", "feedback", "reclamacao"],
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


# ─── Proposta em PDF ──────────────────────────────────────────────


class PropostaPDFPayload(BaseModel):
    """Payload para gerar proposta em PDF."""
    lead_id: Optional[int] = None
    dados_lead: Optional[DadosLead] = None
    valor_estimado: float = 5000.0
    servicos: list[str] = []
    observacoes: str = ""


@app.post("/jarvis/crm/proposta-pdf")
async def crm_proposta_pdf(payload: PropostaPDFPayload) -> dict:
    """Gera proposta comercial em PDF profissional usando reportlab.

    1. Gera conteudo via agent Copy (reutiliza logica de gerar-proposta)
    2. Renderiza PDF com layout premium
    3. Salva em E:/gradios/propostas/
    4. Retorna caminho do arquivo
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

    if not nome and payload.dados_lead:
        nome = payload.dados_lead.nome
        empresa = payload.dados_lead.empresa
        segmento = payload.dados_lead.segmento
        dor = payload.dados_lead.dor_principal
        lead_score = payload.dados_lead.score

    if not nome or not empresa:
        raise HTTPException(400, "Informe lead_id ou dados_lead com nome e empresa")

    # ── 2. Gerar conteudo via IA ──────────────────────────────────
    valor_base = payload.valor_estimado
    valor_essencial = round(valor_base * 0.65, 2)
    valor_completo = round(valor_base, 2)
    valor_premium = round(valor_base * 1.45, 2)
    servicos_texto = ", ".join(payload.servicos) if payload.servicos else "automacao de processos"

    system = AGENTS["copy"]["system"] + (
        "\n\nMISSAO: Gerar texto para proposta comercial PDF. "
        "Tom profissional, direto, confiante. Sem markdown — texto puro. "
        "Separe secoes com \\n\\n e titulos em MAIUSCULA."
    )
    prompt = (
        f"Gere o conteudo de uma proposta comercial para:\n"
        f"- Lead: {nome} | Empresa: {empresa} | Segmento: {segmento}\n"
        f"- Dor: {dor} | Score: {lead_score}/100\n"
        f"- Servicos: {servicos_texto}\n"
        f"- Valores: Essencial R${valor_essencial:,.2f} | "
        f"Completa R${valor_completo:,.2f} | Premium R${valor_premium:,.2f}\n\n"
        f"Secoes obrigatorias (texto puro, sem markdown):\n"
        f"1. O PROBLEMA (2-3 paragrafos sobre a dor real)\n"
        f"2. NOSSA SOLUCAO (o que a GRADIOS entrega)\n"
        f"3. METODOLOGIA (fases de trabalho com prazos)\n"
        f"4. INVESTIMENTO (3 opcoes com escopo de cada)\n"
        f"5. POR QUE A GRADIOS (3 diferenciais)\n"
        f"6. PROXIMO PASSO (CTA direto)\n\n"
        f"Retorne APENAS o texto, sem explicacoes."
    )

    try:
        response_text = ""
        async for chunk in call_ollama(system, [{"role": "user", "content": prompt}]):
            response_text += chunk
    except Exception as e:
        logger.error("Erro ao gerar conteudo proposta PDF: %s", e)
        raise HTTPException(502, f"Erro ao gerar conteudo: {e}")

    # ── 3. Gerar PDF com reportlab ────────────────────────────────
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    import pathlib
    import re

    propostas_dir = pathlib.Path("E:/gradios/propostas")
    propostas_dir.mkdir(parents=True, exist_ok=True)

    # Nome do arquivo unico
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    empresa_slug = re.sub(r"[^a-zA-Z0-9]", "_", empresa.lower())[:30]
    filename = f"proposta_{empresa_slug}_{timestamp_str}.pdf"
    filepath = propostas_dir / filename

    # Cores GRADIOS
    cor_primaria = HexColor("#1a1a2e")
    cor_acento = HexColor("#6366f1")
    cor_texto = HexColor("#1f2937")
    cor_cinza = HexColor("#6b7280")
    cor_fundo_tabela = HexColor("#f3f4f6")

    styles = getSampleStyleSheet()

    style_titulo = ParagraphStyle(
        "TituloProposta",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=cor_primaria,
        spaceAfter=8,
        fontName="Helvetica-Bold",
    )
    style_subtitulo = ParagraphStyle(
        "SubtituloProposta",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=cor_acento,
        spaceBefore=20,
        spaceAfter=10,
        fontName="Helvetica-Bold",
    )
    style_corpo = ParagraphStyle(
        "CorpoProposta",
        parent=styles["Normal"],
        fontSize=10.5,
        textColor=cor_texto,
        leading=15,
        spaceAfter=8,
        fontName="Helvetica",
    )
    style_meta = ParagraphStyle(
        "MetaProposta",
        parent=styles["Normal"],
        fontSize=9,
        textColor=cor_cinza,
        fontName="Helvetica",
    )
    style_center = ParagraphStyle(
        "CenterProposta",
        parent=styles["Normal"],
        fontSize=10.5,
        textColor=cor_texto,
        alignment=TA_CENTER,
        fontName="Helvetica",
    )

    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=A4,
        topMargin=2.5 * cm,
        bottomMargin=2 * cm,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
    )

    elements = []

    # ── Capa ──
    elements.append(Spacer(1, 4 * cm))
    elements.append(Paragraph("GRADIOS", ParagraphStyle(
        "Logo", parent=style_titulo, fontSize=36, textColor=cor_acento,
        alignment=TA_CENTER,
    )))
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph(
        "O cerebro da sua operacao",
        ParagraphStyle("Tagline", parent=style_meta, alignment=TA_CENTER, fontSize=12),
    ))
    elements.append(Spacer(1, 3 * cm))
    elements.append(Paragraph("PROPOSTA COMERCIAL", ParagraphStyle(
        "TituloCapa", parent=style_titulo, alignment=TA_CENTER, fontSize=28,
    )))
    elements.append(Spacer(1, 1 * cm))
    elements.append(Paragraph(empresa.upper(), ParagraphStyle(
        "EmpresaCapa", parent=style_subtitulo, alignment=TA_CENTER, fontSize=18,
    )))
    elements.append(Spacer(1, 3 * cm))

    # Metadados da capa
    data_hoje = datetime.now().strftime("%d/%m/%Y")
    meta_lines = [
        f"Preparado para: {nome}",
        f"Empresa: {empresa}",
        f"Segmento: {segmento}",
        f"Data: {data_hoje}",
        f"Validade: 15 dias",
    ]
    for line in meta_lines:
        elements.append(Paragraph(line, ParagraphStyle(
            "MetaCapa", parent=style_meta, alignment=TA_CENTER, fontSize=11,
            spaceAfter=4,
        )))

    elements.append(PageBreak())

    # ── Conteudo gerado pela IA ──
    # Parseia o texto em secoes
    secoes = re.split(r'\n\s*\n', response_text.strip())
    for secao in secoes:
        secao = secao.strip()
        if not secao:
            continue

        lines = secao.split('\n')
        first_line = lines[0].strip()

        # Detecta se e titulo (tudo maiuscula ou comeca com numero.)
        is_title = (
            first_line.isupper()
            or re.match(r'^\d+[\.\)]\s*[A-Z]', first_line)
            or first_line.startswith('#')
        )

        if is_title:
            titulo_limpo = re.sub(r'^[\d\.\)#\s]+', '', first_line).strip()
            elements.append(Paragraph(titulo_limpo, style_subtitulo))
            corpo = '\n'.join(lines[1:]).strip()
        else:
            corpo = secao

        if corpo:
            # Substitui markdown basico
            corpo = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', corpo)
            corpo = re.sub(r'\*(.+?)\*', r'<i>\1</i>', corpo)
            # Quebra paragrafos
            paragrafos = corpo.split('\n')
            for p in paragrafos:
                p = p.strip()
                if p.startswith('- ') or p.startswith('• '):
                    elements.append(Paragraph(
                        f"  •  {p[2:]}",
                        ParagraphStyle("Bullet", parent=style_corpo, leftIndent=15),
                    ))
                elif p:
                    elements.append(Paragraph(p, style_corpo))

    # ── Tabela de investimento ──
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph("INVESTIMENTO", style_subtitulo))

    table_data = [
        ["Opcao", "Escopo", "Valor"],
        ["Essencial", "Resolve a dor principal", f"R$ {valor_essencial:,.2f}"],
        ["Completa *", "Dor + integracoes + suporte", f"R$ {valor_completo:,.2f}"],
        ["Premium", "Completo + 3 meses suporte + treinamento", f"R$ {valor_premium:,.2f}"],
    ]
    # Converte para Paragraphs para wrapping
    table_paras = []
    for i, row in enumerate(table_data):
        prow = []
        for j, cell in enumerate(row):
            if i == 0:
                prow.append(Paragraph(f"<b>{cell}</b>", ParagraphStyle(
                    "TH", parent=style_corpo, textColor=HexColor("#ffffff"), fontSize=10,
                )))
            elif i == 2:
                prow.append(Paragraph(f"<b>{cell}</b>", style_corpo))
            else:
                prow.append(Paragraph(cell, style_corpo))
        table_paras.append(prow)

    t = Table(table_paras, colWidths=[3 * cm, 9 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), cor_acento),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("BACKGROUND", (0, 2), (-1, 2), HexColor("#eef2ff")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), cor_fundo_tabela]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#d1d5db")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(t)
    elements.append(Paragraph("* Opcao recomendada", ParagraphStyle(
        "Nota", parent=style_meta, fontSize=8, spaceBefore=4,
    )))

    # ── Pagina: POR QUE A GRADIOS ──
    elements.append(PageBreak())
    elements.append(Paragraph("POR QUE A GRADIOS", style_subtitulo))
    elements.append(Spacer(1, 0.5 * cm))

    diferenciais = [
        ("Resultado em 2 semanas",
         "Enquanto consultorias tradicionais levam meses para entregar, "
         "a GRADIOS entrega valor tangivel nas primeiras 2 semanas. "
         "Diagnostico rapido, implementacao agil, resultados imediatos."),
        ("IA integrada na operacao",
         "Nao vendemos ferramentas — integramos inteligencia artificial "
         "diretamente nos processos do cliente. 12 agentes especializados "
         "trabalhando 24/7 para otimizar cada area do negocio."),
        ("Sem contrato longo, sem surpresas",
         "Proposta transparente, escopo definido, prazo real. "
         "Pagamento por entrega, nao por hora. "
         "Se nao entregar resultado, nao cobra."),
    ]
    for titulo_dif, desc_dif in diferenciais:
        elements.append(Paragraph(f"<b>{titulo_dif}</b>", ParagraphStyle(
            "DifTitulo", parent=style_corpo, fontSize=12,
            spaceBefore=12, spaceAfter=4, fontName="Helvetica-Bold",
            textColor=cor_acento,
        )))
        elements.append(Paragraph(desc_dif, style_corpo))

    # ── Pagina: CASES E RESULTADOS ──
    elements.append(PageBreak())
    elements.append(Paragraph("CASES E RESULTADOS", style_subtitulo))
    elements.append(Spacer(1, 0.5 * cm))

    cases = [
        ("Industria Metalurgica", "+35% OEE",
         "Automacao de controle de producao com IoT e dashboard em tempo real. "
         "Reducao de setup de 45min para 12min."),
        ("Rede de Varejo", "-60% retrabalho",
         "Integracao ERP + e-commerce + logistica. "
         "Eliminacao de digitacao manual em 3 sistemas distintos."),
        ("Escritorio Juridico", "8h/semana economizadas",
         "Automacao de peticoes e acompanhamento processual. "
         "IA gerando minutas com 95% de aproveitamento."),
    ]
    for case_nome, case_metric, case_desc in cases:
        elements.append(Paragraph(
            f"<b>{case_nome}</b>  —  <b>{case_metric}</b>",
            ParagraphStyle("CaseTitulo", parent=style_corpo, fontSize=11,
                          spaceBefore=12, spaceAfter=4, fontName="Helvetica-Bold"),
        ))
        elements.append(Paragraph(case_desc, style_corpo))

    # ── Pagina: CTA FINAL + QR CODE ──
    elements.append(PageBreak())
    elements.append(Spacer(1, 3 * cm))
    elements.append(Paragraph("VAMOS COMECAR?", ParagraphStyle(
        "CTATitulo", parent=style_titulo, alignment=TA_CENTER, fontSize=28,
        textColor=cor_acento,
    )))
    elements.append(Spacer(1, 1 * cm))
    elements.append(Paragraph(
        f"<b>{nome}</b>, estamos prontos para transformar a operacao da "
        f"<b>{empresa}</b>. O proximo passo e uma conversa de 30 minutos "
        f"para alinhar escopo e cronograma.",
        ParagraphStyle("CTACorpo", parent=style_corpo, alignment=TA_CENTER,
                       fontSize=12, leading=18),
    ))
    elements.append(Spacer(1, 1.5 * cm))

    # QR Code (texto com URL do WhatsApp)
    whatsapp_url = "https://wa.me/5543988372540?text=Oi%20GRADIOS%2C%20quero%20agendar%20uma%20conversa"
    elements.append(Paragraph(
        f'Fale conosco agora: <a href="{whatsapp_url}" color="#6366f1">'
        f"(43) 98837-2540 (WhatsApp)</a>",
        ParagraphStyle("CTAWA", parent=style_corpo, alignment=TA_CENTER,
                       fontSize=13, fontName="Helvetica-Bold", textColor=cor_acento),
    ))
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph(
        "contato@gradios.co  |  gradios.co",
        ParagraphStyle("CTAContato", parent=style_meta, alignment=TA_CENTER, fontSize=11),
    ))

    # ── Rodape / contato ──
    elements.append(Spacer(1, 3 * cm))
    elements.append(Paragraph("─" * 50, style_center))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(Paragraph(
        f"Proposta gerada por JARVIS — {data_hoje}",
        ParagraphStyle("Rodape", parent=style_meta, alignment=TA_CENTER, spaceAfter=2),
    ))

    doc.build(elements)

    tempo_ms = int((time.perf_counter() - t0) * 1000)

    # ── 4. Salvar historico no Supabase ──
    await sb.insert("propostas", {
        "cliente": empresa,
        "lead_nome": nome,
        "valor": valor_completo,
        "status": "gerada",
        "filename": filename,
        "servicos": servicos_texto,
        "segmento": segmento,
    })

    logger.info(
        "Proposta PDF gerada: %s — %s — %dms",
        filename, empresa, tempo_ms,
    )

    return {
        "status": "ok",
        "arquivo": str(filepath),
        "filename": filename,
        "lead": {
            "nome": nome,
            "empresa": empresa,
            "segmento": segmento,
            "score": lead_score,
        },
        "valores": {
            "essencial": valor_essencial,
            "completo": valor_completo,
            "premium": valor_premium,
        },
        "tempo_geracao_ms": tempo_ms,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/jarvis/crm/propostas")
async def listar_propostas() -> list[dict]:
    """Lista todas as propostas geradas, ordenadas por data."""
    return await sb.select(
        "propostas",
        columns="id,cliente,lead_nome,valor,status,filename,servicos,segmento,created_at",
        order="created_at.desc",
        limit=50,
    )


# ─── Agenda / Google Calendar ──────────────────────────────────────

class CriarReuniaoPayload(BaseModel):
    """Payload para agendar reuniao com lead."""
    lead_nome: str
    empresa: str
    data: str  # YYYY-MM-DD
    hora: str  # HH:MM
    duracao_minutos: int = 60
    descricao: str = ""
    email_lead: Optional[str] = None
    whatsapp_lead: Optional[str] = None


@app.post("/jarvis/agenda/criar-reuniao")
async def criar_reuniao(payload: CriarReuniaoPayload) -> dict:
    """Agenda reuniao no Google Calendar, notifica via WhatsApp e salva estudo."""
    import sys
    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

    titulo = f"Reuniao GRADIOS — {payload.lead_nome} ({payload.empresa})"
    descricao = (
        f"Lead: {payload.lead_nome}\n"
        f"Empresa: {payload.empresa}\n"
        f"{payload.descricao}"
    )
    convidados = [payload.email_lead] if payload.email_lead else None

    # 1. Criar evento no Google Calendar
    evento: dict = {}
    gcal_ok = False
    try:
        from aiox.integrations.google_calendar import criar_evento
        evento = await criar_evento(
            titulo=titulo,
            data=payload.data,
            hora=payload.hora,
            duracao_minutos=payload.duracao_minutos,
            descricao=descricao,
            convidados=convidados,
        )
        gcal_ok = True
        logger.info("Reuniao agendada: %s — %s %s", titulo, payload.data, payload.hora)
    except FileNotFoundError as e:
        logger.warning("Google Calendar nao configurado: %s", e)
        evento = {"warning": "Google Calendar nao configurado — reuniao salva localmente"}
    except Exception as e:
        logger.error("Erro ao criar evento Google Calendar: %s", e)
        evento = {"error": str(e)}

    # 2. Enviar confirmacao WhatsApp
    whatsapp_ok = False
    if payload.whatsapp_lead:
        try:
            evo_url = os.getenv("EVOLUTION_URL", "http://localhost:8080")
            evo_instance = os.getenv("EVOLUTION_INSTANCE", "gradios")
            evo_key = os.getenv("EVOLUTION_APIKEY", "")
            if evo_key:
                msg = (
                    f"Ola {payload.lead_nome}! 👋\n\n"
                    f"Confirmando nossa reuniao:\n"
                    f"📅 Data: {payload.data}\n"
                    f"🕐 Hora: {payload.hora}\n"
                    f"⏱️ Duracao: {payload.duracao_minutos} minutos\n\n"
                    f"Qualquer duvida, estamos a disposicao.\n"
                    f"— Equipe GRADIOS"
                )
                async with httpx.AsyncClient(timeout=10.0) as client:
                    r = await client.post(
                        f"{evo_url}/message/sendText/{evo_instance}",
                        headers={"apikey": evo_key, "Content-Type": "application/json"},
                        json={"number": payload.whatsapp_lead, "text": msg},
                    )
                    r.raise_for_status()
                    whatsapp_ok = True
        except Exception as e:
            logger.warning("WhatsApp confirmacao falhou: %s", e)

    # 3. Salvar em jarvis_studies
    await sb.insert("jarvis_studies", {
        "title": titulo,
        "agent": "crm",
        "content": json.dumps({
            "tipo": "reuniao_agendada",
            "lead": payload.lead_nome,
            "empresa": payload.empresa,
            "data": payload.data,
            "hora": payload.hora,
            "duracao": payload.duracao_minutos,
            "google_calendar": gcal_ok,
            "whatsapp_enviado": whatsapp_ok,
            "evento": evento,
        }, ensure_ascii=False),
        "summary": f"Reuniao agendada: {payload.lead_nome} ({payload.empresa}) — {payload.data} {payload.hora}",
        "tags": ["reuniao", "agenda"],
        "status": "ativo",
    })

    return {
        "status": "ok",
        "reuniao": {
            "titulo": titulo,
            "data": payload.data,
            "hora": payload.hora,
            "duracao": payload.duracao_minutos,
        },
        "google_calendar": evento,
        "whatsapp_enviado": whatsapp_ok,
    }


@app.get("/jarvis/agenda/proximos")
async def agenda_proximos() -> dict:
    """Lista eventos dos proximos 7 dias do Google Calendar."""
    import sys
    sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

    try:
        from aiox.integrations.google_calendar import listar_proximos_7_dias
        eventos = await listar_proximos_7_dias()
        return {"status": "ok", "eventos": eventos, "total": len(eventos)}
    except FileNotFoundError:
        # Google Calendar nao configurado — busca do Supabase
        reunioes = await sb.select(
            "jarvis_studies",
            columns="id,title,summary,content,created_at",
            filters={"tags": "cs.{reuniao}"},
            order="created_at.desc",
            limit=20,
        )
        return {
            "status": "fallback",
            "message": "Google Calendar nao configurado — mostrando reunioes salvas",
            "eventos": reunioes,
            "total": len(reunioes),
        }
    except Exception as e:
        logger.error("Erro ao listar agenda: %s", e)
        return {"status": "error", "message": str(e), "eventos": [], "total": 0}


# ─── Onboarding cliente novo ──────────────────────────────────────

class OnboardingPayload(BaseModel):
    """Payload para iniciar onboarding de cliente novo."""
    cliente_nome: str
    empresa: str
    servico: str
    valor: float
    data_inicio: str  # YYYY-MM-DD


@app.post("/jarvis/crm/onboarding")
async def crm_onboarding(payload: OnboardingPayload) -> dict:
    """Gera plano de onboarding completo via CS Agent.

    1. CS Agent cria checklist 30-60-90
    2. Salva em jarvis_studies
    3. Envia resumo WhatsApp para Daniel
    """
    # 1. Gerar plano via CS Agent
    cs_system = AGENTS["cs"]["system"]
    prompt = (
        f"Gere um plano de onboarding COMPLETO para novo cliente:\n\n"
        f"CLIENTE: {payload.cliente_nome}\n"
        f"EMPRESA: {payload.empresa}\n"
        f"SERVICO CONTRATADO: {payload.servico}\n"
        f"VALOR: R$ {payload.valor:,.2f}\n"
        f"INICIO: {payload.data_inicio}\n\n"
        f"Inclua obrigatoriamente:\n"
        f"1. CHECKLIST SEMANA 1 — integracao, acessos, kickoff\n"
        f"2. CHECKLIST SEMANA 2 — primeiras entregas, validacoes\n"
        f"3. CHECKLIST SEMANAS 3-4 — entrega principal, ajustes\n"
        f"4. CRONOGRAMA DE CHECKPOINTS — datas especificas de acompanhamento\n"
        f"5. TEMPLATE DO PRIMEIRO EMAIL — email de boas-vindas pronto para enviar\n"
        f"6. METRICAS DE SUCESSO — como medir se o onboarding foi bem-sucedido\n\n"
        f"Formato: texto estruturado com bullets. Seja especifico, nao generico."
    )

    try:
        response_text = ""
        async for chunk in call_ollama(cs_system, [{"role": "user", "content": prompt}]):
            response_text += chunk
    except Exception as e:
        logger.error("Erro ao gerar onboarding via CS Agent: %s", e)
        raise HTTPException(502, f"Erro ao gerar plano: {e}")

    # 2. Salvar em jarvis_studies
    titulo = f"Onboarding — {payload.cliente_nome} ({payload.empresa})"
    await sb.insert("jarvis_studies", {
        "title": titulo,
        "agent": "cs",
        "content": response_text,
        "summary": (
            f"Plano de onboarding para {payload.empresa}. "
            f"Servico: {payload.servico}. Valor: R${payload.valor:,.2f}. "
            f"Inicio: {payload.data_inicio}."
        ),
        "tags": ["onboarding", "cs", "cliente-novo"],
        "status": "ativo",
    })

    # 3. Enviar resumo para Daniel via WhatsApp
    try:
        evo_url = os.getenv("EVOLUTION_URL", "http://localhost:8080")
        evo_instance = os.getenv("EVOLUTION_INSTANCE", "gradios")
        evo_key = os.getenv("EVOLUTION_APIKEY", "")
        daniel_wa = os.getenv("DANIEL_WHATSAPP", "5543988372540")
        if evo_key:
            resumo = (
                f"🆕 *NOVO CLIENTE — ONBOARDING INICIADO*\n\n"
                f"Cliente: {payload.cliente_nome}\n"
                f"Empresa: {payload.empresa}\n"
                f"Servico: {payload.servico}\n"
                f"Valor: R$ {payload.valor:,.2f}\n"
                f"Inicio: {payload.data_inicio}\n\n"
                f"Plano completo gerado pelo CS Agent.\n"
                f"Confira em: AIOX > Estudos > tag: onboarding"
            )
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{evo_url}/message/sendText/{evo_instance}",
                    headers={"apikey": evo_key, "Content-Type": "application/json"},
                    json={"number": daniel_wa, "text": resumo},
                )
    except Exception as e:
        logger.warning("WhatsApp onboarding falhou: %s", e)

    return {
        "status": "ok",
        "titulo": titulo,
        "plano": response_text,
        "tags": ["onboarding", "cs", "cliente-novo"],
    }


# ─── Health check ──────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    """Health check completo do sistema — todos os servicos."""
    import time as _time

    results: dict[str, dict] = {}

    # Ollama
    ollama_ok = False
    models: list[str] = []
    ollama_ms = 0
    try:
        t0 = _time.perf_counter()
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            models = [m["name"] for m in r.json().get("models", [])]
        ollama_ok = True
        ollama_ms = int((_time.perf_counter() - t0) * 1000)
    except Exception as e:
        logger.warning("Health check Ollama falhou: %s", e)
    results["ollama"] = {"ok": ollama_ok, "models": models, "latency_ms": ollama_ms}

    # Supabase
    sb_ok = False
    sb_ms = 0
    try:
        t0 = _time.perf_counter()
        sb_ok = await sb.health_check()
        sb_ms = int((_time.perf_counter() - t0) * 1000)
    except Exception:
        pass
    results["supabase"] = {"ok": sb_ok, "latency_ms": sb_ms}

    # WhatsApp (Evolution API)
    evo_ok = False
    evo_ms = 0
    try:
        t0 = _time.perf_counter()
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get("http://localhost:8080/")
            evo_ok = r.status_code < 500
        evo_ms = int((_time.perf_counter() - t0) * 1000)
    except Exception:
        pass
    results["whatsapp"] = {"ok": evo_ok, "latency_ms": evo_ms}

    # N8N
    n8n_ok = False
    n8n_ms = 0
    try:
        t0 = _time.perf_counter()
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get("http://localhost:5678/healthz")
            n8n_ok = r.status_code < 500
        n8n_ms = int((_time.perf_counter() - t0) * 1000)
    except Exception:
        pass
    results["n8n"] = {"ok": n8n_ok, "latency_ms": n8n_ms}

    # Cloudflare Tunnel
    tunnel_ok = False
    try:
        import subprocess
        proc = subprocess.run(
            ["cloudflared", "tunnel", "info", "gradios-jarvis"],
            capture_output=True, text=True, timeout=5,
        )
        tunnel_ok = proc.returncode == 0
    except Exception:
        pass
    results["cloudflare"] = {"ok": tunnel_ok}

    # Claude API
    claude_ok = bool(ANTHROPIC_KEY)
    results["claude"] = {"ok": claude_ok}

    all_ok = all(r["ok"] for r in results.values())

    return {
        "status": "ok" if all_ok else "degraded",
        "ollama": ollama_ok,
        "models": models,
        "supabase": sb_ok,
        "claude": claude_ok,
        "agents": list(AGENTS.keys()),
        "agents_count": len(AGENTS),
        "version": "3.0.0",
        "services": results,
    }
