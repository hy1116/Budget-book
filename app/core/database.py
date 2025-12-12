from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, create_engine
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # 연결상태확인
    echo=True  # SQL 쿼리로그 출력
)

# 의존성 주입
def get_db():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]