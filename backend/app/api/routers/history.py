import csv
import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, aliased

from app.api.dependencies import get_db, get_admin_user
from app.db.models.user import User
from app.schemas.history import HistoryRead
from app.db.models.history import History

router = APIRouter(prefix="/history", tags=["history"])


@router.get(
    "/",
    response_model=list[HistoryRead],
    dependencies=[Depends(get_admin_user)],
)
def full_history(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """
    Vracia globálnu históriu aplikácie zoradenú podľa času.

    **limit** – max. počet riadkov na stránku (1-1000)\n
    **offset** – pre stránkovanie
    """
    u = aliased(User)

    rows = (
        db.query(
            History.id,
            u.email.label("user_email"),
            History.action,
            History.source,
            History.city,
            History.country,
            History.timestamp,
        )
        .join(u, History.user_id == u.id)
        .order_by(History.timestamp.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return rows

@router.get(
    "/export",
    response_class=StreamingResponse,
    dependencies=[Depends(get_admin_user)],
    summary="Stiahnuť celú históriu ako CSV",
)
def export_history_csv(db: Session = Depends(get_db)):
    """
    Vráti CSV s hlavičkou:
    `id,user_email,action,source,city,country,timestamp`
    """
    u = aliased(User)
    query = (
        db.query(
            History.id,
            u.email,
            History.action,
            History.source,
            History.city,
            History.country,
            History.timestamp,
        )
        .join(u, History.user_id == u.id)
        .order_by(History.timestamp.desc())
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["id", "user_email", "action", "source", "city", "country", "timestamp"]
    )
    for row in query:
        writer.writerow(row)

    buffer.seek(0)
    filename = f"history_{datetime.now(timezone.utc):%Y%m%d_%H%M%S}.csv"
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.delete(
    "/delete",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_admin_user)],
    summary="Vymazať všetky záznamy histórie",
)
def delete_history(db: Session = Depends(get_db)):
    deleted = db.query(History).delete()
    db.commit()
    if deleted == 0:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return Response(status_code=status.HTTP_204_NO_CONTENT)