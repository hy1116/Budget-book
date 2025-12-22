

from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.core.database import CurrentUser, SessionDep, get_current_active_superuser
from app.core.security import get_password_hash, verify_password
from app.models.base import Message
from app.models.user import PasswordUpdate, User, UserCreate, UserRegister, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

# me
@router.get("/me",response_model=UserResponse)
def get_user_me(current_user: CurrentUser) -> Any:
    """나의 계정 조회"""
    return current_user

@router.patch("/me",response_model=UserResponse)
def update_user_me(session: SessionDep, user_in: UserUpdate, current_user: CurrentUser):
    """나의 계정 수정"""
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/me/password",response_model=Message)
def update_password_me(session: SessionDep, update_password: PasswordUpdate, current_user: CurrentUser):
    """나의 비밀번호 수정"""
    if verify_password(update_password.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if update_password.new_password == update_password.current_password:
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current one")
    
    current_user.hashed_password = get_password_hash(update_password.new_password)
    session.commit()
    return Message(message="Password updated successfully")

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

# etc
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

# user
@router.get("/", response_model=List[UserResponse], dependencies=[Depends(get_current_active_superuser)])
def get_user(session: SessionDep, skip: int=0, limit: int=100) -> Any:
    """사용자 리스트 조회"""
    return session.exec(select(User).offset(skip).limit(limit)).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(session: SessionDep, user_id:uuid.UUID, current_user: CurrentUser) -> Any:
    """사용자 조회"""
    db_user = session.get(User,user_id)
    if db_user.id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="not Authorized")
    return db_user

@router.patch("/{user_id}", response_model=UserResponse, dependencies=[Depends(get_current_active_superuser)])
def update_user(session: SessionDep, user_id: uuid.UUID, user_in: UserUpdate):
    """사용자 수정"""
    db_user = session.get(User, user_id)
    user_data = user_in.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID):
    """사용자 삭제"""
    db_user = session.get(User,user_id)
    session.delete(db_user)
    session.commit()
    return Message(message="User deleted successfully")
