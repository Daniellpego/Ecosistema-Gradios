"""AIOX — Integracao Google Calendar via Service Account.

Usa Google Calendar API v3 com Service Account (sem OAuth interativo).
Credenciais via .env:
  GOOGLE_CALENDAR_ID — ID do calendario (email do calendario)
  GOOGLE_SERVICE_ACCOUNT_KEY — caminho para o JSON da service account

Uso:
    from aiox.integrations.google_calendar import criar_evento, listar_proximos_7_dias
"""

import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

_project_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_project_root / ".env")

CALENDAR_ID: str = os.getenv("GOOGLE_CALENDAR_ID", "primary")
SERVICE_ACCOUNT_KEY_PATH: str = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_KEY",
    str(_project_root / "credentials" / "google-service-account.json"),
)
SCOPES = ["https://www.googleapis.com/auth/calendar"]

logger = logging.getLogger("aiox.google_calendar")
logger.setLevel(logging.INFO)
if not logger.handlers:
    logger.addHandler(logging.StreamHandler())

# ─── JWT / Token ──────────────────────────────────────────────────

_cached_token: Optional[str] = None
_token_expires_at: float = 0


def _load_service_account() -> dict:
    """Carrega JSON da service account."""
    path = Path(SERVICE_ACCOUNT_KEY_PATH)
    if not path.exists():
        raise FileNotFoundError(
            f"Service account key nao encontrada: {path}. "
            f"Configure GOOGLE_SERVICE_ACCOUNT_KEY no .env"
        )
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _create_jwt(sa: dict) -> str:
    """Cria JWT assinado para Google API (RS256)."""
    import base64
    import hashlib
    import struct

    # Header
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "RS256", "typ": "JWT"}).encode()
    ).rstrip(b"=").decode()

    # Payload
    now = int(time.time())
    payload_data = {
        "iss": sa["client_email"],
        "scope": " ".join(SCOPES),
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
    }
    payload = base64.urlsafe_b64encode(
        json.dumps(payload_data).encode()
    ).rstrip(b"=").decode()

    # Sign
    signing_input = f"{header}.{payload}".encode()

    try:
        # Tenta usar cryptography (mais robusto)
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        private_key = serialization.load_pem_private_key(
            sa["private_key"].encode(), password=None
        )
        signature = private_key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
    except ImportError:
        # Fallback: usa jwt lib se disponivel
        try:
            import jwt as pyjwt
            token = pyjwt.encode(payload_data, sa["private_key"], algorithm="RS256",
                                 headers={"alg": "RS256", "typ": "JWT"})
            return token
        except ImportError:
            raise ImportError(
                "Instale 'cryptography' ou 'PyJWT': pip install cryptography"
            )

    sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
    return f"{header}.{payload}.{sig_b64}"


async def _get_access_token() -> str:
    """Obtem access token via JWT grant (cacheia por 50min)."""
    global _cached_token, _token_expires_at

    if _cached_token and time.time() < _token_expires_at:
        return _cached_token

    sa = _load_service_account()
    jwt_token = _create_jwt(sa)

    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": jwt_token,
            },
        )
        r.raise_for_status()
        data = r.json()

    _cached_token = data["access_token"]
    _token_expires_at = time.time() + 3000  # 50min (token dura 60min)
    logger.info("Google Calendar token obtido (expira em 50min)")
    return _cached_token


async def _gcal_headers() -> dict[str, str]:
    """Headers autenticados para Google Calendar API."""
    token = await _get_access_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


# ─── Funcoes publicas ──────────────────────────────────────────────

async def criar_evento(
    titulo: str,
    data: str,
    hora: str,
    duracao_minutos: int = 60,
    descricao: str = "",
    convidados: list[str] | None = None,
) -> dict:
    """Cria evento no Google Calendar.

    Args:
        titulo: Nome do evento
        data: Data no formato YYYY-MM-DD
        hora: Hora no formato HH:MM
        duracao_minutos: Duracao em minutos (default 60)
        descricao: Descricao do evento
        convidados: Lista de emails dos convidados

    Returns:
        dict com id, htmlLink, start, end do evento criado
    """
    start_dt = datetime.fromisoformat(f"{data}T{hora}:00")
    end_dt = start_dt + timedelta(minutes=duracao_minutos)

    # Timezone Brasil
    tz = "-03:00"
    start_str = start_dt.strftime(f"%Y-%m-%dT%H:%M:%S{tz}")
    end_str = end_dt.strftime(f"%Y-%m-%dT%H:%M:%S{tz}")

    event_body: dict = {
        "summary": titulo,
        "description": descricao,
        "start": {"dateTime": start_str, "timeZone": "America/Sao_Paulo"},
        "end": {"dateTime": end_str, "timeZone": "America/Sao_Paulo"},
    }

    if convidados:
        event_body["attendees"] = [{"email": e} for e in convidados]

    headers = await _gcal_headers()
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"https://www.googleapis.com/calendar/v3/calendars/{CALENDAR_ID}/events",
            headers=headers,
            json=event_body,
            params={"sendUpdates": "all"} if convidados else {},
        )
        r.raise_for_status()
        result = r.json()

    logger.info("Evento criado: %s — %s %s", titulo, data, hora)
    return {
        "id": result.get("id"),
        "htmlLink": result.get("htmlLink"),
        "summary": result.get("summary"),
        "start": result.get("start"),
        "end": result.get("end"),
    }


async def listar_proximos_7_dias() -> list[dict]:
    """Lista eventos dos proximos 7 dias.

    Returns:
        Lista de dicts com id, summary, start, end, attendees
    """
    now = datetime.now(timezone.utc)
    time_min = now.isoformat()
    time_max = (now + timedelta(days=7)).isoformat()

    headers = await _gcal_headers()
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"https://www.googleapis.com/calendar/v3/calendars/{CALENDAR_ID}/events",
            headers=headers,
            params={
                "timeMin": time_min,
                "timeMax": time_max,
                "singleEvents": "true",
                "orderBy": "startTime",
                "maxResults": "50",
            },
        )
        r.raise_for_status()
        data = r.json()

    events = []
    for item in data.get("items", []):
        events.append({
            "id": item.get("id"),
            "summary": item.get("summary", "Sem titulo"),
            "start": item.get("start", {}).get("dateTime", item.get("start", {}).get("date", "")),
            "end": item.get("end", {}).get("dateTime", item.get("end", {}).get("date", "")),
            "description": item.get("description", ""),
            "attendees": [
                a.get("email", "") for a in item.get("attendees", [])
            ],
            "htmlLink": item.get("htmlLink", ""),
        })

    logger.info("Listados %d eventos nos proximos 7 dias", len(events))
    return events
