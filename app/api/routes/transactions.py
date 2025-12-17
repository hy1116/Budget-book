from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.core.database import SessionDep
from models.transaction import Transaction, TransactionCreate, TransactionResponse, TransactionUpdate

router = APIRouter(prefix="/transactions",tags=["transactions"])

@router.get("/", response_model=TransactionResponse)
def get_transactions(session: SessionDep, skip: int = 0, limit: int = 100):
    """전체 거래내역 조회"""
    statement = select(Transaction).offset(skip).limit(limit)
    transactions = session.exec(statement).all()
    return transactions

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(session: SessionDep, transaction_id: int):
    """특정 거래내역 조회"""
    db_transaction = session.get(Transaction, transaction_id)
    return db_transaction

@router.post("/", response_model=TransactionResponse)
def create_transaction(session: SessionDep, transaction: TransactionCreate):
    """거래내역 생성"""
    db_transaction = Transaction.model_validate(transaction)
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(session: SessionDep, transaction: TransactionUpdate, transaction_id: int):
    """거래내역 수정"""
    db_transaction = session.get(Transaction,transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    
    update_data = transaction.model_dump(exclude_unset=True)
    db_transaction.sqlmodel_update(update_data)

    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(session: SessionDep, transaction_id: int):
    """거래내역 삭제"""
    db_transaction = session.get(Transaction,transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    
    session.delete(db_transaction)
    session.commit()