from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db
from app.core.security import verify_password
from app.models.user import Token, User

router = APIRouter(prefix="/login", tags=["login"])

@router.post("/access-token")
def get_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm)) -> Token:
    statement = select(User).where(User.email == form_data.username)
    db_user = db.exec(statement).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")