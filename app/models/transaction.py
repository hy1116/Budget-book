
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
import uuid

from sqlmodel import Field, Relationship, SQLModel
from app.models.base import Base

#Enum
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"

# Base Schema
class TransactionBase(Base):
    amount: int
    description: Optional[str] = None
    transaction_date: datetime
    transaction_type: TransactionType
    category_id: int
    payment_method: Optional[PaymentMethod] = None

# Entiry
class Transaction(TransactionBase, table=True):
    __tablename__ = "transactions"

    user_id: uuid.UUID = Field(foreign_key="users.id")
    category_id: int = Field(foreign_key="categories.id")
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))

    # Relationship
    user: "User" = Relationship(back_populates="transactions")
    category: "Category" = Relationship(back_populates="transaction")

# Schema
class TransactionCreate(TransactionBase):
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(microsecond=0))

class TransactionUpdate(SQLModel):
    amount: Optional[int] = None
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None
    transaction_type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    payment_method: Optional[PaymentMethod] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: uuid.UUID