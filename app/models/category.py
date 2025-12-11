
from sqlalchemy import Column, Integer, String, Enum
from app.models.base import Base

class Category(Base):
    """카테고리 모델"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(String(200), nullable=False)
