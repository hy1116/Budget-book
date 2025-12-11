from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from app.core.database import get_db
from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryPublic

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryPublic])
def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    statement = select(Category).offset(skip).limit(limit)
    categories = db.exec(statement).all()
    return categories

@router.get("/{category_id}", response_model=CategoryPublic)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return category

@router.post("/", response_model=CategoryPublic, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category.model_validate(category)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryPublic)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")

    update_data = category.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")

    db.delete(db_category)
    db.commit()
