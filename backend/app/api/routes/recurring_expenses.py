from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import date, datetime, timezone
from beanie import PydanticObjectId

from app.api.dependencies import get_current_profile_id
from app.schemas.recurring_expense import (
    RecurringExpenseCreate,
    RecurringExpenseUpdate,
    RecurringExpenseResponse,
)
from app.models.recurring_expense import RecurringExpense, RecurringPaymentInstance
from app.models.transaction import Transaction
from app.utils.date_helpers import calculate_next_payment_date

router = APIRouter()


def _parse_object_id(id_str: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recurring expense ID format")


def _to_response(item: RecurringExpense) -> RecurringExpenseResponse:
    today = date.today()
    resp = RecurringExpenseResponse.model_validate(item)
    resp.is_overdue = item.is_active and item.next_payment_date < today
    return resp


@router.get("", response_model=List[RecurringExpenseResponse])
async def list_recurring_expenses(
    active_only: bool = False,
    profile_id: str = Depends(get_current_profile_id),
):
    query_filter: dict = {"profile_id": profile_id}
    if active_only:
        query_filter["is_active"] = True

    items = await RecurringExpense.find(query_filter).sort("next_payment_date").to_list()
    return [_to_response(item) for item in items]


@router.post("", response_model=RecurringExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_expense(
    payload: RecurringExpenseCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    rec = RecurringExpense(
        profile_id=profile_id,
        name=payload.name,
        amount=payload.amount,
        category_name=payload.category_name,
        category_id=payload.category_id,
        frequency=payload.frequency,
        start_date=payload.start_date,
        next_payment_date=payload.next_payment_date,
        end_date=payload.end_date,
        notes=payload.notes,
        is_active=payload.is_active,
    )
    await rec.insert()
    return _to_response(rec)


@router.get("/{id}", response_model=RecurringExpenseResponse)
async def get_recurring_expense(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    rec = await RecurringExpense.find_one(RecurringExpense.id == oid, RecurringExpense.profile_id == profile_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    return _to_response(rec)


@router.put("/{id}", response_model=RecurringExpenseResponse)
async def update_recurring_expense(
    id: str,
    payload: RecurringExpenseUpdate,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    rec = await RecurringExpense.find_one(RecurringExpense.id == oid, RecurringExpense.profile_id == profile_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring expense not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rec, field, value)
    rec.updated_at = datetime.now(timezone.utc)

    await rec.save()
    return _to_response(rec)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_expense(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    rec = await RecurringExpense.find_one(RecurringExpense.id == oid, RecurringExpense.profile_id == profile_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring expense not found")
    await RecurringPaymentInstance.find(
        RecurringPaymentInstance.recurring_expense_id == str(rec.id)
    ).delete()
    await rec.delete()
    return None


@router.post("/{id}/mark-paid", response_model=RecurringExpenseResponse)
async def mark_paid(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    """
    Business Rule (Section 7):
    - Never auto-record. Only after user confirmation.
    - Create the corresponding actual expense transaction.
    - Prevent duplicate transactions for the same recurring payment period.
    - Advance next_payment_date.
    """
    oid = _parse_object_id(id)
    rec = await RecurringExpense.find_one(RecurringExpense.id == oid, RecurringExpense.profile_id == profile_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring expense not found")

    today = date.today()
    due_date = rec.next_payment_date
    rec_id_str = str(rec.id)

    # Check for existing paid instance on this due_date
    existing_instance = await RecurringPaymentInstance.find_one(
        {
            "recurring_expense_id": rec_id_str,
            "due_date": due_date.isoformat(),
            "status": "PAID",
        }
    )
    if existing_instance:
        raise HTTPException(
            status_code=400,
            detail="This recurring payment period has already been recorded as paid.",
        )

    # 1. Create the corresponding actual transaction
    tx = Transaction(
        profile_id=profile_id,
        amount=rec.amount,
        type="EXPENSE",
        category_name=rec.category_name,
        category_id=rec.category_id,
        description=f"Recurring: {rec.name}",
        date=today,
        payment_method="Auto/Recurring",
        notes=f"Paid on {today} for due date {due_date}",
        recurring_expense_id=rec_id_str,
    )
    await tx.insert()

    # 2. Record payment instance
    instance = RecurringPaymentInstance(
        recurring_expense_id=rec_id_str,
        due_date=due_date,
        amount=rec.amount,
        paid_date=today,
        transaction_id=str(tx.id),
        status="PAID",
    )
    await instance.insert()

    # 3. Advance to the next payment date
    next_date = calculate_next_payment_date(due_date, rec.frequency)
    rec.next_payment_date = next_date
    if rec.end_date and next_date > rec.end_date:
        rec.is_active = False
    rec.updated_at = datetime.now(timezone.utc)

    await rec.save()
    return _to_response(rec)
