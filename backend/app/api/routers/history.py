from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.security import get_current_active_user
from app.schemas.history import HistoryRead
from app.db.models.history import History

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/", response_model=list[HistoryRead])
def my_history(
    db: Session = Depends(get_db),
    user = Depends(get_current_active_user),
    limit: int = 100,
):
    return (
        db.query(History)
          .filter(History.user_id == user.id)
          .order_by(History.timestamp.desc())
          .limit(limit)
          .all()
    )