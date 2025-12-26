from typing import List
from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from app.core.database import CurrentUser, SessionDep
from app.models.transaction import Transaction, TransactionCreate, TransactionResponse, TransactionUpdate, TransactionPaginatedResponse, TransactionType, CategorySpending, MonthlyTrend
from app.models.category import Category

router = APIRouter(prefix="/transactions",tags=["transactions"])

@router.get("/", response_model=TransactionPaginatedResponse)
def get_transactions(current_user: CurrentUser, session: SessionDep, skip: int = 0, limit: int = 100):
    """전체 거래내역 조회"""
    # Get total count
    count_statement = select(func.count()).select_from(Transaction).where(Transaction.user_id == current_user.id)
    total = session.exec(count_statement).one()

    # Get paginated items
    statement = select(Transaction).where(Transaction.user_id == current_user.id).options(selectinload(Transaction.category)).order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit)
    transactions = session.exec(statement).all()

    return TransactionPaginatedResponse(items=transactions, total=total)

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(current_user: CurrentUser, session: SessionDep, transaction_id: int):
    """특정 거래내역 조회"""
    statement = select(Transaction).where(Transaction.id == transaction_id).options(selectinload(Transaction.category))
    db_transaction = session.exec(statement).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    if db_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db_transaction

@router.post("/", response_model=TransactionResponse)
def create_transaction(current_user: CurrentUser, session: SessionDep, transaction: TransactionCreate):
    """거래내역 생성"""
    transaction_data = transaction.model_dump()
    db_transaction = Transaction(**transaction_data, user_id=current_user.id)

    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(current_user: CurrentUser, session: SessionDep, transaction: TransactionUpdate, transaction_id: int):
    """거래내역 수정"""
    db_transaction = session.get(Transaction,transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")

    if db_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = transaction.model_dump(exclude_unset=True)
    db_transaction.sqlmodel_update(update_data)

    session.commit()
    session.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(current_user: CurrentUser, session: SessionDep, transaction_id: int):
    """거래내역 삭제"""
    db_transaction = session.get(Transaction,transaction_id)
    if not db_transaction:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")

    if db_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(db_transaction)
    session.commit()

@router.get("/statistics/category-spending", response_model=List[CategorySpending])
def get_category_spending(current_user: CurrentUser, session: SessionDep, limit: int = 10):
    """카테고리별 지출 통계 (지출만, 상위 N개)"""
    statement = (
        select(
            Transaction.category_id,
            Category.name.label("category_name"),
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("transaction_count")
        )
        .join(Category, Transaction.category_id == Category.id)
        .where(Transaction.user_id == current_user.id)
        .where(Transaction.transaction_type == TransactionType.EXPENSE)
        .group_by(Transaction.category_id, Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
    )

    results = session.exec(statement).all()

    return [
        CategorySpending(
            category_id=row[0],
            category_name=row[1],
            total_amount=row[2],
            transaction_count=row[3]
        )
        for row in results
    ]

@router.get("/statistics/monthly-trends", response_model=List[MonthlyTrend])
def get_monthly_trends(current_user: CurrentUser, session: SessionDep, months: int = 6):
    """월별 수입/지출 추이 (최근 N개월)"""
    # 모든 거래 조회
    statement = select(Transaction).where(Transaction.user_id == current_user.id)
    transactions = session.exec(statement).all()

    # 월별로 수입/지출 집계
    monthly_data = {}
    for transaction in transactions:
        year = transaction.transaction_date.year
        month = transaction.transaction_date.month
        key = (year, month)

        if key not in monthly_data:
            monthly_data[key] = {"income": 0, "expense": 0}

        if transaction.transaction_type == TransactionType.INCOME:
            monthly_data[key]["income"] += transaction.amount
        elif transaction.transaction_type == TransactionType.EXPENSE:
            monthly_data[key]["expense"] += transaction.amount

    # MonthlyTrend 객체 생성
    trends = []
    for (year, month), data in sorted(monthly_data.items(), reverse=True)[:months]:
        income = data["income"]
        expense = data["expense"]
        trends.append(MonthlyTrend(
            year=year,
            month=month,
            income=income,
            expense=expense,
            net=income - expense
        ))

    return list(reversed(trends))  # 오래된 순서로 정렬