from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel

# Base
class Base(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))

class Message(SQLModel):
    message: str