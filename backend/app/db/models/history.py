from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..base import Base

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    action = Column(String(50), nullable=False)
    source = Column(String(15), nullable=False) # frontend | api

    city = Column(String(64))
    country = Column(String(64))

    timestamp = Column(DateTime, default=datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="histories")
