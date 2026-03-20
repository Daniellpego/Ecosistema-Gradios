"""AIOX Cron — Monitor CRM autonomo.

Roda a cada 1 hora via scheduler ou Task Scheduler do Windows.
Busca leads sem contato ha mais de 2 dias e gera alertas.

Uso:
    python aiox/cron/crm_monitor.py          # execucao unica
    python aiox/cron/crm_monitor.py --loop    # roda a cada 1h continuamente
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

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

INTERVALO_HORAS: int = 1
DIAS_SEM_CONTATO: int = 2

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [AIOX-CRM] %(levelname)s: %(message)s",
)
logger = logging.getLogger("aiox.crm_monitor")


# ─── Supabase helpers ────────────────────────────────────────────────

def _headers() -> dict[str, str]:
    """Headers padrao para Supabase REST API."""
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
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

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=_headers(),
            params=params,
        )
        r.raise_for_status()
        return r.json()


async def supabase_insert(table: str, data: dict) -> dict | None:
    """POST para inserir registro no Supabase."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=_headers(),
            json=data,
        )
        r.raise_for_status()
        rows = r.json()
        return rows[0] if rows else None


# ─── Ollama helper ───────────────────────────────────────────────────

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
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(f"{OLLAMA_URL}/api/chat", json=payload)
        r.raise_for_status()
        return r.json()["message"]["content"]


# ─── Logica principal ────────────────────────────────────────────────

async def buscar_leads_sem_contato() -> list[dict]:
    """Busca leads criados ha mais de DIAS_SEM_CONTATO dias sem interacao recente."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=DIAS_SEM_CONTATO)).isoformat()

    leads = await supabase_select(
        "leads",
        columns="id,nome,empresa,whatsapp,segmento,dor_principal,score,lead_temperature,created_at",
        filters={"created_at": f"lt.{cutoff}"},
        order="created_at.asc",
        limit=50,
    )

    if not leads:
        return []

    # Busca ultima interacao de cada lead na jarvis_memory
    leads_abandonados: list[dict] = []
    for lead in leads:
        nome = lead.get("nome", "")
        if not nome:
            continue

        # Verifica se tem interacao recente
        interacoes = await supabase_select(
            "jarvis_memory",
            columns="created_at",
            filters={
                "user_message": f"like.*{nome}*",
                "created_at": f"gt.{cutoff}",
            },
            limit=1,
        )

        if not interacoes:
            # Calcula dias sem contato
            created = datetime.fromisoformat(
                lead["created_at"].replace("Z", "+00:00")
            )
            dias = (datetime.now(timezone.utc) - created).days
            lead["dias_sem_contato"] = dias
            leads_abandonados.append(lead)

    return leads_abandonados


async def gerar_alerta(leads: list[dict]) -> str:
    """Usa IA para gerar alerta estruturado dos leads abandonados."""
    leads_texto = "\n".join(
        f"- {l['nome']} | {l.get('empresa', 'N/A')} | "
        f"Score: {l.get('score', 0)} | Temp: {l.get('lead_temperature', 'N/A')} | "
        f"Segmento: {l.get('segmento', 'N/A')} | "
        f"Dor: {l.get('dor_principal', 'N/A')} | "
        f"Dias sem contato: {l.get('dias_sem_contato', '?')}"
        for l in leads
    )

    system = (
        "Voce e o monitor CRM autonomo da GRADIOS. "
        "Sua funcao e gerar alertas acionaveis sobre leads que estao esfriando. "
        "Seja direto, objetivo e priorize por potencial de fechamento."
    )

    prompt = (
        f"ALERTA CRM — {len(leads)} leads sem contato ha mais de {DIAS_SEM_CONTATO} dias:\n\n"
        f"{leads_texto}\n\n"
        "Para cada lead, gere:\n"
        "1. PRIORIDADE (alta/media/baixa) baseada no score e temperatura\n"
        "2. PROXIMA ACAO especifica (nao generica)\n"
        "3. SCRIPT WHATSAPP curto (1-2 frases) para retomar contato\n\n"
        "Ordene por prioridade. Formato limpo e direto."
    )

    return await call_ollama(system, prompt)


async def salvar_alerta(alerta: str, total_leads: int) -> dict | None:
    """Salva alerta em jarvis_studies com tag alerta-crm."""
    now = datetime.now(timezone.utc)
    return await supabase_insert("jarvis_studies", {
        "title": f"Alerta CRM — {total_leads} leads sem contato — {now.strftime('%d/%m/%Y %H:%M')}",
        "agent": "crm",
        "content": alerta,
        "summary": f"{total_leads} leads sem contato ha mais de {DIAS_SEM_CONTATO} dias",
        "tags": ["alerta-crm", "auto-generated", "aiox-cron"],
        "status": "completo",
    })


def _extrair_acao(lead: dict, alerta_completo: str) -> str:
    """Extrai acao recomendada do alerta gerado pela IA para um lead especifico."""
    nome = lead.get("nome", "")
    if nome and nome in alerta_completo:
        # Tenta encontrar a linha de acao apos mencao do lead
        linhas = alerta_completo.split("\n")
        for i, linha in enumerate(linhas):
            if nome in linha:
                # Procura proxima linha com acao
                for prox in linhas[i + 1 : i + 5]:
                    prox_lower = prox.lower().strip()
                    if "acao" in prox_lower or "proxim" in prox_lower:
                        return prox.strip().lstrip("- ").lstrip("0123456789.").strip()
                break

    # Fallback baseado em temperatura do lead
    temp = lead.get("lead_temperature", "morno")
    acoes = {
        "quente": "Ligar imediatamente — lead em risco de esfriar",
        "morno": "Enviar mensagem de follow-up personalizada",
        "frio": "Reengajar com conteudo relevante do segmento",
    }
    return acoes.get(temp, "Retomar contato via WhatsApp")


async def executar() -> None:
    """Execucao principal do monitor CRM."""
    logger.info("Iniciando varredura CRM...")

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("SUPABASE_URL ou SUPABASE_KEY nao configurados no .env")
        return

    try:
        leads = await buscar_leads_sem_contato()
    except Exception as e:
        logger.error("Erro ao buscar leads: %s", e)
        return

    if not leads:
        logger.info("Nenhum lead sem contato encontrado. Tudo em dia.")
        return

    logger.info("Encontrados %d leads sem contato ha mais de %d dias", len(leads), DIAS_SEM_CONTATO)

    # Log resumo
    for lead in leads:
        logger.info(
            "  -> %s (%s) — %d dias sem contato — score %s",
            lead.get("nome", "?"),
            lead.get("empresa", "?"),
            lead.get("dias_sem_contato", 0),
            lead.get("score", "?"),
        )

    try:
        alerta = await gerar_alerta(leads)
        logger.info("Alerta gerado com sucesso (%d caracteres)", len(alerta))
    except Exception as e:
        logger.error("Erro ao gerar alerta via Ollama: %s", e)
        # Salva alerta basico sem IA
        alerta = "ALERTA CRM (sem IA — Ollama indisponivel)\n\n"
        for lead in leads:
            alerta += (
                f"- {lead.get('nome', '?')} ({lead.get('empresa', '?')}) — "
                f"{lead.get('dias_sem_contato', '?')} dias sem contato — "
                f"Score: {lead.get('score', '?')}\n"
            )

    try:
        saved = await salvar_alerta(alerta, len(leads))
        if saved:
            logger.info("Alerta salvo em jarvis_studies (id: %s)", saved.get("id"))
        else:
            logger.warning("Alerta gerado mas nao foi salvo no Supabase")
    except Exception as e:
        logger.error("Erro ao salvar alerta: %s", e)

    # Envia alertas individuais via WhatsApp para cada lead
    try:
        from aiox.notifications.whatsapp import (
            enviar_alerta,
            enviar_alerta_lead,
            verificar_conexao,
        )

        if await verificar_conexao():
            # Envia alerta individual por lead
            for lead in leads:
                await enviar_alerta_lead(
                    nome=lead.get("nome", "Desconhecido"),
                    empresa=lead.get("empresa", "N/A"),
                    dias_sem_contato=lead.get("dias_sem_contato", 0),
                    acao_recomendada=_extrair_acao(lead, alerta),
                    destinatario="daniel",
                )

            logger.info("Alertas WhatsApp enviados para %d leads", len(leads))
        else:
            logger.warning("WhatsApp desconectado — alertas nao enviados")
    except Exception as e:
        logger.error("Erro ao enviar alertas WhatsApp: %s", e)

    logger.info("Varredura CRM concluida.")


async def loop() -> None:
    """Executa o monitor a cada INTERVALO_HORAS."""
    logger.info("Modo loop ativado — intervalo: %dh", INTERVALO_HORAS)
    while True:
        await executar()
        logger.info("Proxima execucao em %dh...", INTERVALO_HORAS)
        await asyncio.sleep(INTERVALO_HORAS * 3600)


if __name__ == "__main__":
    if "--loop" in sys.argv:
        asyncio.run(loop())
    else:
        asyncio.run(executar())
