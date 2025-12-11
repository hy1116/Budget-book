from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.service.category_service import CategoryService

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse], summary="카테고리 목록 조회")
def get_categoryies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """전체 카테고리 조회"""
    categorys = CategoryService.get_all(db, skip=skip, limit=limit)
    return categorys

@router.get("/{category_id}", response_model=CategoryResponse, summary="특정 카테고리 조회")
def get_category(category_id: int, db: Session = Depends(get_db)):
    """특정 카테고리 조회"""
    category = CategoryService.get_by_id(db,category_id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"category with id {category_id} not found"
        )
    return category

@router.post("/", response_model=CategoryResponse, summary="카테고리 생성")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """카테고리 생성"""
    return CategoryService.create(db, category)

@router.put("/{category_id}", response_model=CategoryResponse, summary="카테고리 수정")
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """카테고리 수정"""
    updated_category = CategoryService.update(db,category_id=category_id,category=category)
    if not updated_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"category with id {category_id} not found"
        )
    return updated_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="카테고리 삭제")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """카테고리 삭제"""
    success =  CategoryService.delete(db,category_id=category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"category with id {category_id} not found"
        )
