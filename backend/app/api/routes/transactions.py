from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from app.core.database import CurrentUser, SessionDep
from app.models.transaction import Transaction, TransactionCreate, TransactionResponse, TransactionUpdate, TransactionPaginatedResponse, TransactionType, PaymentMethod, CategorySpending, MonthlyTrend
from app.models.category import Category

router = APIRouter(prefix="/transactions",tags=["transactions"])

@router.get("/", response_model=TransactionPaginatedResponse)
def get_transactions(
    current_user: CurrentUser,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
    # 필터 파라미터
    transaction_type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    payment_method: Optional[PaymentMethod] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[int] = None,
    max_amount: Optional[int] = None,
    search_query: Optional[str] = None,
    # 정렬 파라미터
    sort_by: str = "date",
    sort_order: str = "desc",
):
    """전체 거래내역 조회 (필터링 및 정렬 지원)"""

    # WHERE 조건 동적 구성
    filters = [Transaction.user_id == current_user.id]

    if transaction_type:
        filters.append(Transaction.transaction_type == transaction_type)

    if category_id:
        filters.append(Transaction.category_id == category_id)

    if payment_method:
        filters.append(Transaction.payment_method == payment_method)

    if start_date:
        filters.append(Transaction.transaction_date >= start_date)

    if end_date:
        # 하루의 마지막까지 포함
        end_datetime = end_date.replace(hour=23, minute=59, second=59)
        filters.append(Transaction.transaction_date <= end_datetime)

    if min_amount is not None and min_amount > 0:
        filters.append(Transaction.amount >= min_amount)

    if max_amount is not None and max_amount > 0:
        filters.append(Transaction.amount <= max_amount)

    if search_query and search_query.strip():
        # LIKE 검색 (대소문자 무시)
        filters.append(Transaction.description.ilike(f"%{search_query.strip()}%"))

    # Get total count
    count_statement = select(func.count()).select_from(Transaction).where(*filters)
    total = session.exec(count_statement).one()

    # 정렬 기준 결정
    if sort_by == "amount":
        order_column = Transaction.amount.desc() if sort_order == "desc" else Transaction.amount.asc()
    else:  # date (기본값)
        order_column = Transaction.transaction_date.desc() if sort_order == "desc" else Transaction.transaction_date.asc()

    # Get paginated items
    statement = (
        select(Transaction)
        .where(*filters)
        .options(selectinload(Transaction.category))
        .order_by(order_column)
        .offset(skip)
        .limit(limit)
    )
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