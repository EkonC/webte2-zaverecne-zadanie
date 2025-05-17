from typing import Literal
from fastapi import Request
from sqlalchemy.orm import Session

from app.db.models.history import History
from app.db.models.user import User

import httpx

import logging
log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

GEO_ENDPOINT = "https://ipapi.co/{ip}/json/"

async def _ip_to_location(ip: str) -> tuple[str | None, str | None]:
    log.debug("Geo lookup for IP %s", ip)
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.get(GEO_ENDPOINT.format(ip=ip))
            if r.status_code == 200:
                data = r.json()
                return data.get("city"), data.get("country_name")
            else:
                log.warning("Geo API %s returned %s – body: %s",
                            GEO_ENDPOINT, r.status_code, r.text[:200])
    except Exception:
        pass
    return None, None

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