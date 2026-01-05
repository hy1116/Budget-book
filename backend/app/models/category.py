from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional
from datetime import datetime
from app.models.base import Base

# base schema (without id, created_at, updated_at for create/update schemas)
class CategoryBase(SQLModel):
    name: str = Field(min_length=1, max_length=50, unique=True, index=True)
    description: Optional[str] = Field(max_length=200)

# entity
class Category(CategoryBase, Base, table=True):
    __tablename__ = "categories"

    # Relationship
    transaction: List["Transaction"] = Relationship(back_populates="category")

# schema
class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class CategoryPaginatedResponse(SQLModel):
    items: list[CategoryResponse]
    total: int

