from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel

# Base
class Base(SQLModel):
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))