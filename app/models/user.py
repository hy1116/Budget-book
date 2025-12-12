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
    hashed_password: str = Field(max_length=255)

class UserRegister(SQLModel): # 가입요청
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, max_length=255)

class UserCreate(UserBase): # 사용자 생성
    password: str = Field(min_length=8, max_length=128)

class UserResponse(UserBase):
    pass

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    