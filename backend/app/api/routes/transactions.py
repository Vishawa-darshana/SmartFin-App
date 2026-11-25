from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date, datetime, timezone
from beanie import PydanticObjectId
import re

from app.api.dependencies import get_current_profile_id
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.models.transaction import Transaction

router = APIRouter()


def _parse_object_id(id_str: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transaction ID format")


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    limit: int = 100,
    profile_id: str = Depends(get_current_profile_id),
):
    query_filter: dict = {"profile_id": profile_id}
    if category:
        query_filter["category_name"] = category
    if type:
        query_filter["type"] = type.upper()
    if start_date or end_date:
        date_filter: dict = {}
        if start_date:
            date_filter["$gte"] = start_date.isoformat()
        if end_date:
            date_filter["$lte"] = end_date.isoformat()
        query_filter["date"] = date_filter
    if search:
        query_filter["description"] = {"$regex": re.escape(search), "$options": "i"}

    return (
        await Transaction.find(query_filter)
        .sort([("date", -1), ("_id", -1)])
        .limit(limit)
        .to_list()
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    tx = Transaction(
        profile_id=profile_id,
        amount=payload.amount,
        type=payload.type,
        category_name=payload.category_name,
        category_id=payload.category_id,
        description=payload.description,
        date=payload.date,
        payment_method=payload.payment_method,
        notes=payload.notes,
        recurring_expense_id=payload.recurring_expense_id,
    )
    await tx.insert()
    return tx


@router.get("/{id}", response_model=TransactionResponse)
async def get_transaction(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    tx = await Transaction.find_one(Transaction.id == oid, Transaction.profile_id == profile_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.put("/{id}", response_model=TransactionResponse)
async def update_transaction(
    id: str,
    payload: TransactionUpdate,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    tx = await Transaction.find_one(Transaction.id == oid, Transaction.profile_id == profile_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tx, field, value)
    tx.updated_at = datetime.now(timezone.utc)

    await tx.save()
    return tx


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    tx = await Transaction.find_one(Transaction.id == oid, Transaction.profile_id == profile_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await tx.delete()
    return None
