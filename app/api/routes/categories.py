from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import SessionDep, get_db
from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: SessionDep, skip: int = 0, limit: int = 100):
    """전체 카테고리 조회"""
    statement = select(Category).offset(skip).limit(limit)
    categories = db.exec(statement).all()
    return categories

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: SessionDep):
    """특정 카테고리 조회"""
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return category

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate, db: SessionDep):
    """카테고리 생성"""
    db_category = Category.model_validate(category)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: SessionDep):
    """카테고리 수정"""
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")

    update_data = category.model_dump(exclude_unset=True)
    db_category.sqlmodel_update(update_data)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: SessionDep):
    """카테고리 삭제"""
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")

    db.delete(db_category)
    db.commit()
