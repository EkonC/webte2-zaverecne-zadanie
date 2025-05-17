from datetime import datetime
from pydantic import BaseModel, ConfigDict

class HistoryRead(BaseModel):
    id: int
    user_email: str
    action: str
    source: str
    city: str | None
    country: str | None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)