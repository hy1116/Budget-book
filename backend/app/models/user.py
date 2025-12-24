from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
import uuid
from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))

class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str = Field(max_length=255)

    # Relationship
    transactions: List["Transaction"] = Relationship(back_populates="user")

class UserRegister(SQLModel): # 가입요청
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)

class UserCreate(UserBase): # 사용자 생성
    password: str = Field(min_length=8, max_length=128)

class UserUpdate(SQLModel): # 사용자 수정
    full_name: str | None = Field(default=None, max_length=255)

class PasswordUpdate(SQLModel): # 비밀번호 변경
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

class UserPublic(UserBase):
    id: uuid.UUID

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(SQLModel):
    sub: str | None = None