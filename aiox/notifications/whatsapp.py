"""AIOX Notifications — Envio de mensagens via Evolution API (WhatsApp).

Usa a Evolution API conectada na instancia gradios-whatsapp para
enviar mensagens de texto e alertas formatados.

Uso:
    from aiox.notifications.whatsapp import enviar_mensagem, enviar_alerta

    await enviar_mensagem("554388372540", "Ola, teste!")
    await enviar_alerta(alerta_dict, destinatario="daniel")
"""

import logging
from typing import Any

import httpx

# ─── Configuracao Evolution API ─────────────────────────────────────
EVOLUTION_URL: str = "http://localhost:8080"
EVOLUTION_KEY: str = "gradios-evolution-key"
INSTANCE: str = "gradios-whatsapp"

# ─── Destinatarios conhecidos ────────────────────────────────────────
DESTINATARIOS: dict[str, str] = {
    "daniel": "554388372540",
    "gustavo": "",   # preencher quando disponivel
    "brian": "",     # preencher quando disponivel
}

logger = logging.getLogger("aiox.whatsapp")


# ─── Funcoes de envio ───────────────────────────────────────────────

async def enviar_mensagem(numero: str, texto: str) -> dict[str, Any]:
    """Envia mensagem de texto via Evolution API.

    Args:
        numero: Numero com DDI+DDD sem espacos (ex: '554388372540')
        texto: Texto da mensagem

    Returns:
        Resposta da API como dict

    Raises:
        httpx.HTTPStatusError: Se a API retornar erro
    """
    url = f"{EVOLUTION_URL}/message/sendText/{INSTANCE}"
    headers = {
        "apikey": EVOLUTION_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "number": numero,
        "text": texto,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        data: dict[str, Any] = r.json()
        logger.info("Mensagem enviada para %s (%d chars)", numero, len(texto))
        return data


async def enviar_para(destinatario: str, texto: str) -> dict[str, Any]:
    """Envia mensagem para destinatario pelo nome.

    Args:
        destinatario: Nome do destinatario (daniel, gustavo, brian)
        texto: Texto da mensagem

    Returns:
        Resposta da API

    Raises:
        ValueError: Se destinatario nao encontrado ou numero vazio
    """
    numero = DESTINATARIOS.get(destinatario.lower())
    if not numero:
        raise ValueError(
            f"Destinatario '{destinatario}' nao encontrado ou sem numero. "
            f"Disponiveis: {list(DESTINATARIOS.keys())}"
        )
    return await enviar_mensagem(numero, texto)


async def enviar_alerta(alerta: str, destinatario: str = "daniel") -> dict[str, Any]:
    """Envia alerta CRM formatado via WhatsApp.

    Args:
        alerta: Texto do alerta (pode ser longo, sera truncado se necessario)
        destinatario: Nome do destinatario

    Returns:
        Resposta da API
    """
    # WhatsApp tem limite de ~65k chars, mas truncamos em 4000 para legibilidade
    if len(alerta) > 4000:
        alerta = alerta[:3950] + "\n\n... (truncado)"

    return await enviar_para(destinatario, alerta)


async def enviar_alerta_lead(
    nome: str,
    empresa: str,
    dias_sem_contato: int,
    acao_recomendada: str,
    destinatario: str = "daniel",
) -> dict[str, Any]:
    """Envia alerta formatado de lead sem contato.

    Args:
        nome: Nome do lead
        empresa: Empresa do lead
        dias_sem_contato: Dias desde ultimo contato
        acao_recomendada: Acao sugerida pela IA
        destinatario: Quem recebe o alerta
    """
    texto = (
        f"\U0001f6a8 *ALERTA CRM*\n"
        f"Lead: {nome}\n"
        f"Empresa: {empresa}\n"
        f"Dias sem contato: {dias_sem_contato}\n"
        f"Acao recomendada: {acao_recomendada}"
    )
    return await enviar_para(destinatario, texto)


async def verificar_conexao() -> bool:
    """Verifica se a instancia WhatsApp esta conectada."""
    url = f"{EVOLUTION_URL}/instance/fetchInstances"
    headers = {"apikey": EVOLUTION_KEY}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, headers=headers)
            r.raise_for_status()
            instances = r.json()
            for inst in instances:
                if inst.get("name") == INSTANCE:
                    status = inst.get("connectionStatus", "close")
                    logger.info("WhatsApp %s: %s", INSTANCE, status)
                    return status == "open"
    except Exception as e:
        logger.error("Erro ao verificar conexao WhatsApp: %s", e)

    return False
