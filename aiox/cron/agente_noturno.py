"""AIOX Cron — Agente Noturno.

Roda todo dia as 07:00 (configuravel via Task Scheduler ou cron).
Consolida dados do dia anterior e envia resumo personalizado para cada socio.

Uso:
    python aiox/cron/agente_noturno.py              # execucao unica
    python aiox/cron/agente_noturno.py --loop        # roda diariamente as 07:00
    python aiox/cron/agente_noturno.py --test        # envia resumo de teste agora
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

# Carrega .env do projeto raiz
_project_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_project_root / ".env")

# ─── Configuracao ────────────────────────────────────────────────────
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:14b")

HORARIO_ENVIO: int = 7  # hora do dia (07:00)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [AIOX-NOTURNO] %(levelname)s: %(message)s",
)
logger = logging.getLogger("aiox.agente_noturno")


# ─── Perfis dos socios ──────────────────────────────────────────────

SOCIOS: list[dict[str, Any]] = [
    {
        "nome": "Daniel",
        "whatsapp": "554388372540",
        "foco": "projetos_tech",
        "descricao": "CTO — foco em projetos ativos, alertas tecnicos, status de deployments e bugs criticos",
    },
    {
        "nome": "Gustavo",
        "whatsapp": "",  # preencher quando disponivel
        "foco": "financeiro",
        "descricao": "CFO — foco em resumo financeiro, contas a pagar/receber, fluxo de caixa e margem",
    },
    {
        "nome": "Brian",
        "whatsapp": "",  # preencher quando disponivel
        "foco": "crm_leads",
        "descricao": "Comercial — foco em CRM, leads quentes, pipeline de vendas e conversoes",
    },
]


# ─── Supabase helpers ───────────────────────────────────────────────

def _headers() -> dict[str, str]:
    """Headers padrao para Supabase REST API."""
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


async def supabase_select(
    table: str,
    columns: str = "*",
    filters: dict[str, str] | None = None,
    order: str | None = None,
    limit: int | None = None,
) -> list[dict]:
    """GET na tabela Supabase via REST."""
    params: dict[str, str] = {"select": columns}
    if filters:
        params.update(filters)
    if order:
        params["order"] = order
    if limit:
        params["limit"] = str(limit)

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=_headers(),
            params=params,
        )
        r.raise_for_status()
        return r.json()


# ─── Ollama helper ──────────────────────────────────────────────────

async def call_ollama(system: str, prompt: str) -> str:
    """Chama Ollama para gerar texto."""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=180.0) as client:
        r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
        r.raise_for_status()
        return r.json()["message"]["content"]


# ─── Coleta de dados ────────────────────────────────────────────────

async def coletar_leads_dia() -> dict[str, Any]:
    """Coleta metricas de leads das ultimas 24h."""
    ontem = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

    try:
        novos = await supabase_select(
            "leads",
            columns="id,nome,empresa,lead_temperature,score,segmento",
            filters={"created_at": f"gt.{ontem}"},
            order="score.desc",
        )
    except Exception:
        novos = []

    try:
        todos = await supabase_select(
            "leads",
            columns="id,lead_temperature",
        )
    except Exception:
        todos = []

    quentes = [l for l in todos if l.get("lead_temperature") == "quente"]
    mornos = [l for l in todos if l.get("lead_temperature") == "morno"]

    return {
        "novos_24h": len(novos),
        "novos_detalhes": novos[:10],
        "total_leads": len(todos),
        "quentes": len(quentes),
        "mornos": len(mornos),
    }


async def coletar_interacoes_dia() -> dict[str, Any]:
    """Coleta metricas de interacoes com agents nas ultimas 24h."""
    ontem = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

    try:
        interacoes = await supabase_select(
            "jarvis_memory",
            columns="agent,created_at",
            filters={"created_at": f"gt.{ontem}"},
        )
    except Exception:
        interacoes = []

    # Conta por agent
    por_agent: dict[str, int] = {}
    for i in interacoes:
        agent = i.get("agent", "desconhecido")
        por_agent[agent] = por_agent.get(agent, 0) + 1

    return {
        "total_interacoes": len(interacoes),
        "por_agent": por_agent,
    }


async def coletar_estudos_dia() -> dict[str, Any]:
    """Coleta estudos gerados nas ultimas 24h."""
    ontem = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

    try:
        estudos = await supabase_select(
            "jarvis_studies",
            columns="id,title,agent,status,tags",
            filters={"created_at": f"gt.{ontem}"},
            order="created_at.desc",
        )
    except Exception:
        estudos = []

    return {
        "total_estudos": len(estudos),
        "estudos": estudos[:10],
    }


async def coletar_alertas_crm() -> dict[str, Any]:
    """Coleta alertas CRM pendentes."""
    dois_dias = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()

    try:
        leads_frios = await supabase_select(
            "leads",
            columns="id,nome,empresa,dias_sem_contato,lead_temperature,score",
            filters={"created_at": f"lt.{dois_dias}"},
            order="score.desc",
            limit=20,
        )
    except Exception:
        leads_frios = []

    return {
        "leads_sem_contato": len(leads_frios),
        "detalhes": leads_frios[:10],
    }


# ─── Geracao de resumos ─────────────────────────────────────────────

async def gerar_resumo_personalizado(
    socio: dict[str, Any],
    dados: dict[str, Any],
) -> str:
    """Gera resumo personalizado para cada socio usando IA."""
    hoje = datetime.now(timezone.utc).strftime("%d/%m/%Y")

    system = (
        f"Voce e o assistente executivo AIOX da GRADIOS. "
        f"Gere um briefing matinal CONCISO para {socio['nome']} ({socio['descricao']}). "
        f"Maximo 15 linhas. Use emojis com moderacao. Seja direto e acionavel."
    )

    # Monta contexto baseado no foco do socio
    contexto_partes: list[str] = []

    leads = dados.get("leads", {})
    interacoes = dados.get("interacoes", {})
    estudos = dados.get("estudos", {})
    alertas = dados.get("alertas", {})

    if socio["foco"] == "projetos_tech":
        contexto_partes.append(
            f"INTERACOES (24h): {interacoes.get('total_interacoes', 0)} total\n"
            f"Por agent: {interacoes.get('por_agent', {})}"
        )
        contexto_partes.append(
            f"ESTUDOS GERADOS (24h): {estudos.get('total_estudos', 0)}\n"
            f"Titulos: {[e.get('title', '') for e in estudos.get('estudos', [])]}"
        )
        contexto_partes.append(
            f"LEADS: {leads.get('novos_24h', 0)} novos | "
            f"{leads.get('total_leads', 0)} total | "
            f"{leads.get('quentes', 0)} quentes"
        )

    elif socio["foco"] == "financeiro":
        contexto_partes.append(
            f"LEADS PIPELINE: {leads.get('total_leads', 0)} total | "
            f"{leads.get('quentes', 0)} quentes (potencial de fechamento) | "
            f"{leads.get('mornos', 0)} mornos"
        )
        contexto_partes.append(
            f"NOVOS LEADS (24h): {leads.get('novos_24h', 0)}\n"
            f"Detalhes: {[(l.get('nome',''), l.get('empresa','')) for l in leads.get('novos_detalhes', [])]}"
        )
        contexto_partes.append(
            f"ATIVIDADE: {interacoes.get('total_interacoes', 0)} interacoes com IA nas ultimas 24h"
        )

    elif socio["foco"] == "crm_leads":
        contexto_partes.append(
            f"LEADS NOVOS (24h): {leads.get('novos_24h', 0)}\n"
            f"Detalhes: {[(l.get('nome',''), l.get('empresa',''), l.get('score',0)) for l in leads.get('novos_detalhes', [])]}"
        )
        contexto_partes.append(
            f"PIPELINE: {leads.get('total_leads', 0)} total | "
            f"{leads.get('quentes', 0)} quentes | {leads.get('mornos', 0)} mornos"
        )
        contexto_partes.append(
            f"ALERTAS CRM: {alertas.get('leads_sem_contato', 0)} leads sem contato recente\n"
            f"Detalhes: {[(l.get('nome',''), l.get('empresa','')) for l in alertas.get('detalhes', [])]}"
        )

    contexto = "\n\n".join(contexto_partes)

    prompt = (
        f"BRIEFING MATINAL — {hoje}\n\n"
        f"Dados consolidados:\n{contexto}\n\n"
        f"Gere o briefing para {socio['nome']}. "
        f"Inclua: resumo executivo, numeros chave, acoes recomendadas para hoje. "
        f"Comece com 'Bom dia, {socio['nome']}!' e termine com uma recomendacao acionavel."
    )

    return await call_ollama(system, prompt)


def _gerar_resumo_fallback(
    socio: dict[str, Any],
    dados: dict[str, Any],
) -> str:
    """Gera resumo basico sem IA (fallback)."""
    hoje = datetime.now(timezone.utc).strftime("%d/%m/%Y")
    leads = dados.get("leads", {})
    interacoes = dados.get("interacoes", {})
    alertas = dados.get("alertas", {})

    linhas: list[str] = [
        f"\U0001f4cb *BRIEFING AIOX — {hoje}*",
        f"Bom dia, {socio['nome']}!",
        "",
    ]

    if socio["foco"] == "projetos_tech":
        linhas.extend([
            f"\U0001f4ca *Atividade (24h)*",
            f"Interacoes IA: {interacoes.get('total_interacoes', 0)}",
            f"Agents ativos: {', '.join(interacoes.get('por_agent', {}).keys()) or 'nenhum'}",
            "",
            f"\U0001f465 *Leads*: {leads.get('novos_24h', 0)} novos | {leads.get('quentes', 0)} quentes",
        ])
    elif socio["foco"] == "financeiro":
        linhas.extend([
            f"\U0001f4b0 *Pipeline*",
            f"Total leads: {leads.get('total_leads', 0)}",
            f"Quentes: {leads.get('quentes', 0)} | Mornos: {leads.get('mornos', 0)}",
            f"Novos (24h): {leads.get('novos_24h', 0)}",
        ])
    elif socio["foco"] == "crm_leads":
        linhas.extend([
            f"\U0001f525 *CRM*",
            f"Novos leads (24h): {leads.get('novos_24h', 0)}",
            f"Quentes: {leads.get('quentes', 0)} | Pipeline: {leads.get('total_leads', 0)}",
            f"Sem contato: {alertas.get('leads_sem_contato', 0)} leads",
        ])

    return "\n".join(linhas)


# ─── Envio via WhatsApp ─────────────────────────────────────────────

async def enviar_briefing(socio: dict[str, Any], texto: str) -> bool:
    """Envia briefing para socio via WhatsApp."""
    numero = socio.get("whatsapp", "")
    if not numero:
        logger.warning("Socio %s sem numero WhatsApp configurado — pulando", socio["nome"])
        return False

    try:
        from aiox.notifications.whatsapp import enviar_mensagem
        await enviar_mensagem(numero, texto)
        logger.info("Briefing enviado para %s (%s)", socio["nome"], numero)
        return True
    except Exception as e:
        logger.error("Erro ao enviar briefing para %s: %s", socio["nome"], e)
        return False


# ─── Execucao principal ─────────────────────────────────────────────

async def executar() -> None:
    """Coleta dados, gera resumos e envia para cada socio."""
    logger.info("Iniciando agente noturno — consolidacao diaria...")

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("SUPABASE_URL ou SUPABASE_KEY nao configurados")
        return

    # Coleta todos os dados em paralelo
    leads_task = coletar_leads_dia()
    interacoes_task = coletar_interacoes_dia()
    estudos_task = coletar_estudos_dia()
    alertas_task = coletar_alertas_crm()

    leads, interacoes, estudos, alertas = await asyncio.gather(
        leads_task, interacoes_task, estudos_task, alertas_task,
        return_exceptions=True,
    )

    # Trata excecoes
    if isinstance(leads, Exception):
        logger.error("Erro ao coletar leads: %s", leads)
        leads = {}
    if isinstance(interacoes, Exception):
        logger.error("Erro ao coletar interacoes: %s", interacoes)
        interacoes = {}
    if isinstance(estudos, Exception):
        logger.error("Erro ao coletar estudos: %s", estudos)
        estudos = {}
    if isinstance(alertas, Exception):
        logger.error("Erro ao coletar alertas: %s", alertas)
        alertas = {}

    dados = {
        "leads": leads,
        "interacoes": interacoes,
        "estudos": estudos,
        "alertas": alertas,
    }

    logger.info(
        "Dados coletados — Leads: %s novos | Interacoes: %s | Estudos: %s | Alertas CRM: %s",
        leads.get("novos_24h", "?") if isinstance(leads, dict) else "erro",
        interacoes.get("total_interacoes", "?") if isinstance(interacoes, dict) else "erro",
        estudos.get("total_estudos", "?") if isinstance(estudos, dict) else "erro",
        alertas.get("leads_sem_contato", "?") if isinstance(alertas, dict) else "erro",
    )

    # Gera e envia briefing para cada socio
    enviados = 0
    for socio in SOCIOS:
        if not socio.get("whatsapp"):
            logger.info("Socio %s sem WhatsApp — gerando apenas log", socio["nome"])
            continue

        try:
            resumo = await gerar_resumo_personalizado(socio, dados)
            logger.info("Resumo gerado para %s (%d chars)", socio["nome"], len(resumo))
        except Exception as e:
            logger.error("Ollama falhou para %s: %s — usando fallback", socio["nome"], e)
            resumo = _gerar_resumo_fallback(socio, dados)

        if await enviar_briefing(socio, resumo):
            enviados += 1

    logger.info("Agente noturno concluido — %d briefings enviados", enviados)


async def loop() -> None:
    """Roda diariamente no horario configurado."""
    logger.info("Modo loop ativado — horario: %02d:00 diariamente", HORARIO_ENVIO)

    while True:
        agora = datetime.now()
        # Calcula proximo horario de envio
        proximo = agora.replace(hour=HORARIO_ENVIO, minute=0, second=0, microsecond=0)
        if proximo <= agora:
            proximo += timedelta(days=1)

        espera = (proximo - agora).total_seconds()
        logger.info(
            "Proximo envio: %s (em %.1f horas)",
            proximo.strftime("%d/%m %H:%M"),
            espera / 3600,
        )
        await asyncio.sleep(espera)

        await executar()


if __name__ == "__main__":
    if "--test" in sys.argv:
        # Modo teste: envia agora independente do horario
        logger.info("Modo TESTE — enviando agora")
        asyncio.run(executar())
    elif "--loop" in sys.argv:
        asyncio.run(loop())
    else:
        asyncio.run(executar())
