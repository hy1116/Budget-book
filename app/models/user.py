import uuid
from sqlmodel import Field, SQLModel
from pydantic import EmailStr

from app.models.base import Base

class UserBase(Base):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    