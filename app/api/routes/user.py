

from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.core.database import SessionDep
from app.core.security import get_password_hash
from app.models.user import User, UserCreate, UserRegister, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup", response_model=UserResponse)
def register_user(user_in: UserRegister, db: SessionDep) -> Any:
    """회원가입"""
    statement = select(User).where(User.email == user_in.email)
    db_user = db.exec(statement).first()
    if db_user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system")
    user_create = UserCreate.model_validate(user_in)
    db_obj = User.model_validate(user_create, update={"hashed_password": get_password_hash(user_create.password)})
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
    