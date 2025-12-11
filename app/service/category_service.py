from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from typing import List, Optional

class CategoryService:

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        return db.query(Category).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Optional[Category]:
        return db.query(Category).filter(Category.id == category_id).first()

    @staticmethod
    def create(db: Session, category: CategoryCreate) -> Category:
        db_category = Category(**category.model_dump())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    @staticmethod
    def update(db: Session, category_id: int, category: CategoryUpdate) -> Optional[Category]:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if db_category:
            update_data = category.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_category, key, value)
            db.commit()
            db.refresh(db_category)
        return db_category

    @staticmethod
    def delete(db: Session, category_id : int) -> bool:
        db_category = db.query(Category).filter(Category.id==category_id).first()
        if not db_category: 
            return False
        
        db.delete(db_category)
        db.commit()
        return True