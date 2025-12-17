from sqlmodel import Field, SQLModel
from typing import Optional
from app.models.base import Base

# base schema
class CategoryBase(Base):    
    name: str = Field(min_length=1, max_length=50, unique=True, index=True)
    description: str = Field(max_length=200)

# entity
class Category(CategoryBase, table=True):
    __tablename__ = "categories"

# schema
class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class CategoryResponse(CategoryBase):
    pass

