"""AIOX Scheduler — Orquestrador de crons autonomos.

Roda em background e dispara os crons nos horarios configurados.
Nao depende de Task Scheduler do Windows.

Uso:
    python aiox/scheduler.py           # inicia o scheduler
    python aiox/scheduler.py --once    # roda todos os crons uma vez e sai

Log: aiox/logs/scheduler.log
"""

import asyncio
import logging
import sys
from datetime import datetime, timedelta
from logging.handlers import RotatingFileHandler
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────────────
_project_root = Path(__file__).resolve().parent.parent
_log_dir = Path(__file__).resolve().parent / "logs"
_log_dir.mkdir(exist_ok=True)

# ─── Logging (arquivo + console) ────────────────────────────────────
logger = logging.getLogger("aiox.scheduler")
logger.setLevel(logging.INFO)

file_handler = RotatingFileHandler(
    _log_dir / "scheduler.log",
    maxBytes=5 * 1024 * 1024,  # 5MB
    backupCount=3,
    encoding="utf-8",
)
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s [SCHEDULER] %(levelname)s: %(message)s"
))

console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(
    "%(asctime)s [SCHEDULER] %(levelname)s: %(message)s"
))

logger.addHandler(file_handler)
logger.addHandler(console_handler)


# ─── Cron registry ──────────────────────────────────────────────────

async def _run_crm_monitor() -> None:
    """Executa crm_monitor.py."""
    from aiox.cron.crm_monitor import executar as crm_executar
    await crm_executar()


async def _run_agente_noturno() -> None:
    """Executa agente_noturno.py."""
    from aiox.cron.agente_noturno import executar as noturno_executar
    await noturno_executar()


CRONS = [
    {
        "nome": "crm_monitor",
        "funcao": _run_crm_monitor,
        "intervalo_segundos": 3600,  # 1 hora
        "horario_fixo": None,
    },
    {
        "nome": "agente_noturno",
        "funcao": _run_agente_noturno,
        "intervalo_segundos": None,
        "horario_fixo": 7,  # 07:00
    },
]


# ─── Runners ────────────────────────────────────────────────────────

async def run_intervalo(cron: dict) -> None:
    """Roda cron a cada N segundos."""
    nome = cron["nome"]
    intervalo = cron["intervalo_segundos"]
    funcao = cron["funcao"]

    logger.info("[%s] Iniciado — intervalo: %ds (%.1fh)", nome, intervalo, intervalo / 3600)

    while True:
        try:
            logger.info("[%s] Executando...", nome)
            await funcao()
            logger.info("[%s] Concluido", nome)
        except Exception as e:
            logger.error("[%s] Erro: %s", nome, e, exc_info=True)

        await asyncio.sleep(intervalo)


async def run_horario_fixo(cron: dict) -> None:
    """Roda cron uma vez por dia no horario fixo."""
    nome = cron["nome"]
    hora = cron["horario_fixo"]
    funcao = cron["funcao"]

    logger.info("[%s] Iniciado — horario fixo: %02d:00", nome, hora)

    while True:
        agora = datetime.now()
        proximo = agora.replace(hour=hora, minute=0, second=0, microsecond=0)
        if proximo <= agora:
            proximo += timedelta(days=1)

        espera = (proximo - agora).total_seconds()
        logger.info(
            "[%s] Proximo: %s (em %.1fh)",
            nome, proximo.strftime("%d/%m %H:%M"), espera / 3600,
        )
        await asyncio.sleep(espera)

        try:
            logger.info("[%s] Executando...", nome)
            await funcao()
            logger.info("[%s] Concluido", nome)
        except Exception as e:
            logger.error("[%s] Erro: %s", nome, e, exc_info=True)

        # Espera 60s para nao disparar duas vezes no mesmo minuto
        await asyncio.sleep(60)


async def run_once() -> None:
    """Roda todos os crons uma unica vez."""
    logger.info("Modo --once: executando todos os crons")
    for cron in CRONS:
        nome = cron["nome"]
        try:
            logger.info("[%s] Executando...", nome)
            await cron["funcao"]()
            logger.info("[%s] Concluido", nome)
        except Exception as e:
            logger.error("[%s] Erro: %s", nome, e, exc_info=True)
    logger.info("Todos os crons executados")


async def main() -> None:
    """Inicia todos os crons em paralelo."""
    logger.info("=" * 50)
    logger.info("AIOX Scheduler iniciado — %d crons registrados", len(CRONS))
    logger.info("Log: %s", _log_dir / "scheduler.log")
    logger.info("=" * 50)

    tasks: list[asyncio.Task] = []
    for cron in CRONS:
        if cron["intervalo_segundos"]:
            tasks.append(asyncio.create_task(run_intervalo(cron)))
        elif cron["horario_fixo"] is not None:
            tasks.append(asyncio.create_task(run_horario_fixo(cron)))

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    if "--once" in sys.argv:
        asyncio.run(run_once())
    else:
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            logger.info("Scheduler encerrado pelo usuario")
