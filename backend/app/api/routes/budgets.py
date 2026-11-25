from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timezone
from beanie import PydanticObjectId

from app.api.dependencies import get_current_profile_id
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.models.budget import Budget
from app.services.dashboard_service import _sum_transactions

router = APIRouter()


def _parse_object_id(id_str: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid budget ID format")


@router.get("", response_model=List[BudgetResponse])
async def list_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    now = datetime.now()
    m = month or now.month
    y = year or now.year

    budgets = await Budget.find(
        Budget.profile_id == profile_id,
        Budget.month == m,
        Budget.year == y,
    ).to_list()

    results = []
    for b in budgets:
        spent_dec = await _sum_transactions(profile_id, "EXPENSE", m, y, category_name=b.category_name)
        rem = b.monthly_limit - spent_dec
        pct = float((spent_dec / b.monthly_limit) * 100) if b.monthly_limit > 0 else 0.0

        results.append(
            BudgetResponse(
                id=str(b.id),
                profile_id=b.profile_id,
                category_name=b.category_name,
                monthly_limit=b.monthly_limit,
                month=b.month,
                year=b.year,
                spent_amount=spent_dec,
                remaining_amount=rem,
                percentage_used=round(pct, 2),
                created_at=b.created_at,
                updated_at=b.updated_at,
            )
        )
    return results


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    payload: BudgetCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    existing = await Budget.find_one(
        Budget.profile_id == profile_id,
        Budget.category_name == payload.category_name,
        Budget.month == payload.month,
        Budget.year == payload.year,
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category in the specified month/year",
        )

    budget = Budget(
        profile_id=profile_id,
        category_name=payload.category_name,
        monthly_limit=payload.monthly_limit,
        month=payload.month,
        year=payload.year,
    )
    await budget.insert()

    spent_dec = await _sum_transactions(
        profile_id, "EXPENSE", payload.month, payload.year, category_name=payload.category_name
    )
    rem = budget.monthly_limit - spent_dec
    pct = float((spent_dec / budget.monthly_limit) * 100) if budget.monthly_limit > 0 else 0.0

    return BudgetResponse(
        id=str(budget.id),
        profile_id=budget.profile_id,
        category_name=budget.category_name,
        monthly_limit=budget.monthly_limit,
        month=budget.month,
        year=budget.year,
        spent_amount=spent_dec,
        remaining_amount=rem,
        percentage_used=round(pct, 2),
        created_at=budget.created_at,
        updated_at=budget.updated_at,
    )


@router.put("/{id}", response_model=BudgetResponse)
async def update_budget(
    id: str,
    payload: BudgetUpdate,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    budget = await Budget.find_one(Budget.id == oid, Budget.profile_id == profile_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if payload.monthly_limit is not None:
        budget.monthly_limit = payload.monthly_limit
    if payload.category_name is not None:
        budget.category_name = payload.category_name
    budget.updated_at = datetime.now(timezone.utc)

    await budget.save()

    spent_dec = await _sum_transactions(
        profile_id, "EXPENSE", budget.month, budget.year, category_name=budget.category_name
    )
    rem = budget.monthly_limit - spent_dec
    pct = float((spent_dec / budget.monthly_limit) * 100) if budget.monthly_limit > 0 else 0.0

    return BudgetResponse(
        id=str(budget.id),
        profile_id=budget.profile_id,
        category_name=budget.category_name,
        monthly_limit=budget.monthly_limit,
        month=budget.month,
        year=budget.year,
        spent_amount=spent_dec,
        remaining_amount=rem,
        percentage_used=round(pct, 2),
        created_at=budget.created_at,
        updated_at=budget.updated_at,
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    budget = await Budget.find_one(Budget.id == oid, Budget.profile_id == profile_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await budget.delete()
    return None
