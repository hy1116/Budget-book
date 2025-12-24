from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from fastapi.responses import HTMLResponse
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings
from app.core.database import SessionDep, get_current_active_superuser, get_db
from app.core.security import verify_password
from app.models.base import Message
from app.models.user import NewPassword, Token, User
from app.utils import generate_password_reset_token, generate_reset_password_email, send_email, verify_password_reset_token

router = APIRouter(prefix="/login", tags=["login"])

@router.post("/access-token")
def get_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm)) -> Token:
    statement = select(User).where(User.email == form_data.username)
    db_user = db.exec(statement).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(access_token=security.create_access_token(db_user.id, access_token_expires))

@router.post("/password-recovery/{email}")
def password_recovery(session: SessionDep, email: str):
    """비밀번호 찾기"""
    statement = select(User).where(User.email == email)
    db_user = session.exec(statement).first()

    if not db_user:
        HTTPException(status_code=404, detail="User not found")
    
    # 1. 토큰발급
    password_reset_token = generate_password_reset_token(email)
    # 2. 메일폼생성
    email_data = generate_reset_password_email(email_to=db_user.email,email=email,token=password_reset_token)
    # 3. 메일발송
    send_email(email_to=db_user.email, subject=email_data.subject, html_content=email_data.html_content)
    
    return Message(message="Password recovery email sent")

@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword):
    """비밀번호 초기화"""
    email = verify_password_reset_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    statement = select(User).where(User.email == email)
    db_user = session.exec(statement).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid User")
    
    db_user.hashed_password = security.get_password_hash(body.new_password)
    session.commit()

    return Message(message="Password updated successfully")

@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Password Recovery
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject:": email_data.subject}
    )