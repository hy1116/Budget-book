from sqlalchemy import Column, DateTime, Integer
from app.core.database import Base as SQLAlchemyBase
from datetime import datetime, timezone

class Base(SQLAlchemyBase):
    """공통 부모 클래스"""
    __abstract__ = True # 이 클래스는 테이블을 만들지 않음
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=lambda: datetime.now(timezone.utc))