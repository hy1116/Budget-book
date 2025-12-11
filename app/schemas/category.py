from pydantic import BaseModel, Field
from typing import Optional

class CategoryBase(BaseModel):
    """카테고리 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=50, description="카테고리명")
    description: Optional[str] = Field(None, max_length=200, description="카테고리설명")

class CategoryCreate(CategoryBase):
    """카테고리 생성 스키마"""
    pass # CategoryBase의 모든 필드 상속

class CategoryUpdate(BaseModel):
    """카테고리 수정 스키마"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class CategoryResponse(CategoryBase):
    """카테고리 응답 스키마"""
    id: int
    class Config:
        from_attribute = True
    