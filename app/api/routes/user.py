

from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.core.database import CurrentUser, SessionDep
from app.core.security import get_password_hash
from app.models.base import Message
from app.models.user import User, UserCreate, UserRegister, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup", response_model=UserResponse)
def register_user(user_in: UserRegister, session: SessionDep) -> Any:
    """회원가입"""
    statement = select(User).where(User.email == user_in.email)
    session_user = session.exec(statement).first()
    if session_user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system")
    user_create = UserCreate.model_validate(user_in)
    db_obj = User.model_validate(user_create, update={"hashed_password": get_password_hash(user_create.password)})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj
    
@router.get("/me",response_model=UserResponse)
def get_user_me(current_user: CurrentUser) -> Any:
    """나의 계정 조회"""
    return current_user

@router.delete("/me")
def delete_user_me(current_user: CurrentUser, session: SessionDep) -> Any:
    """나의 계정 삭제"""
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")
