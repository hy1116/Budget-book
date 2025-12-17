
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel
from app.models.base import Base

class TransactionBase(Base):
    amount: int
    description: Optional[str]
    transaction_date: datetime
    transaction_type: str
    category_id: int
    payment_method: Optional[str] = None

class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"

    user_id: int = Field(foreign_key="user.id")

    user: "User" = Relationship(back_populates="transactions")
    category: "Category" = Relationship(back_populates="transactions")

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(SQLModel):
    amount: Optional[int]
    description: Optional[str]
    transaction_date: datetime
    transaction_type: str
    category_id: int
    payment_method: Optional[str] = None

class TransactionResponse(TransactionBase):
    pass