from __future__ import annotations
from typing import Literal, Tuple
from fastapi import Request
from sqlalchemy.orm import Session
from functools import lru_cache
import ipaddress
import httpx
import logging

from app.db.models.history import History
from app.db.models.user import User

log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

GEO_ENDPOINT = "https://ipapi.co/{ip}/json/"

PRIVATE_NETS = (
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
)

def _is_public(ip: str) -> bool:
    try:
        ip_obj = ipaddress.ip_address(ip)
        return not any(ip_obj in net for net in PRIVATE_NETS)
    except ValueError:
        return False


def _get_client_ip(request: Request) -> str | None:
    for header in ("x-forwarded-for", "x-real-ip"):
        if header in request.headers:
            for ip in request.headers[header].split(","):
                ip = ip.strip()
                if _is_public(ip):
                    return ip
    host = request.client.host if request.client else ""
    return host if _is_public(host) else None


@lru_cache(maxsize=1024)
def _cached_geo(ip: str) -> Tuple[str | None, str | None]:
    try:
        r = httpx.get(GEO_ENDPOINT.format(ip=ip), timeout=3.0)
        if r.status_code == 200:
            data = r.json()
            return data.get("city"), data.get("country_name")
        log.warning("Geo API %s → %s – %s", GEO_ENDPOINT, r.status_code, r.text[:120])
    except Exception as exc:  # pragma: no cover
        log.debug("Geo lookup failed: %s", exc)
    return None, None

async def _ip_to_location(ip: str | None) -> tuple[str | None, str | None]:
    if not ip:
        return None, None
    return _cached_geo(ip)

async def log_action(
        db: Session,
        user: User,
        action: str,
        request: Request,
        source: Literal["frontend", "api"],
) -> None:
    ip = request.client.host if request.client else ""
    city, country = await _ip_to_location(ip)

    entry = History(
        user_id=user.id,
        action=action,
        source=source,
        city=city,
        country=country,
    )
    db.add(entry)
    db.commit()