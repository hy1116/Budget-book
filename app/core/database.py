from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # 연결상태확인
    echo=True # SQL 쿼리로그 출력
)

# 세션 로컬 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성 (모든 모델의 부모클래스)
Base = declarative_base()

# 의존성 주입
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close