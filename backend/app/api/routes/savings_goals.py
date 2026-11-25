from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import date, datetime, timezone
from decimal import Decimal
from beanie import PydanticObjectId

from app.api.dependencies import get_current_profile_id
from app.schemas.savings import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalResponse,
    ContributionCreate,
    ContributionResponse,
)
from app.models.savings_goal import SavingsGoal
from app.models.savings_contribution import SavingsContribution

router = APIRouter()


def _parse_object_id(id_str: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid savings goal ID format")


async def enrich_savings_goal(goal: SavingsGoal) -> SavingsGoalResponse:
    target = goal.target_amount
    current = goal.current_amount
    remaining = max(Decimal("0.00"), target - current)
    pct = float((current / target) * 100) if target > 0 else 0.0

    required_monthly = None
    if goal.target_date and goal.target_date > date.today() and remaining > 0:
        today = date.today()
        months = max(1, (goal.target_date.year - today.year) * 12 + (goal.target_date.month - today.month))
        required_monthly = round(remaining / Decimal(months), 2)

    contributions = (
        await SavingsContribution.find(SavingsContribution.goal_id == str(goal.id))
        .sort("-contribution_date")
        .to_list()
    )

    return SavingsGoalResponse(
        id=str(goal.id),
        profile_id=goal.profile_id,
        title=goal.title,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        remaining_amount=remaining,
        progress_percentage=round(pct, 2),
        required_monthly_savings=required_monthly,
        target_date=goal.target_date,
        is_completed=goal.is_completed,
        notes=goal.notes,
        contributions=[ContributionResponse.model_validate(c) for c in contributions],
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


@router.get("", response_model=List[SavingsGoalResponse])
async def list_savings_goals(
    profile_id: str = Depends(get_current_profile_id),
):
    goals = (
        await SavingsGoal.find(SavingsGoal.profile_id == profile_id)
        .sort("-created_at")
        .to_list()
    )
    return [await enrich_savings_goal(g) for g in goals]


@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_savings_goal(
    payload: SavingsGoalCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    goal = SavingsGoal(
        profile_id=profile_id,
        title=payload.title,
        target_amount=payload.target_amount,
        current_amount=payload.current_amount or Decimal("0.00"),
        target_date=payload.target_date,
        notes=payload.notes,
    )
    await goal.insert()
    return await enrich_savings_goal(goal)


@router.get("/{id}", response_model=SavingsGoalResponse)
async def get_savings_goal(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    goal = await SavingsGoal.find_one(SavingsGoal.id == oid, SavingsGoal.profile_id == profile_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return await enrich_savings_goal(goal)


@router.put("/{id}", response_model=SavingsGoalResponse)
async def update_savings_goal(
    id: str,
    payload: SavingsGoalUpdate,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    goal = await SavingsGoal.find_one(SavingsGoal.id == oid, SavingsGoal.profile_id == profile_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    goal.updated_at = datetime.now(timezone.utc)

    await goal.save()
    return await enrich_savings_goal(goal)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_savings_goal(
    id: str,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    goal = await SavingsGoal.find_one(SavingsGoal.id == oid, SavingsGoal.profile_id == profile_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    await SavingsContribution.find(SavingsContribution.goal_id == str(goal.id)).delete()
    await goal.delete()
    return None


@router.post("/{id}/contributions", response_model=SavingsGoalResponse)
async def add_contribution(
    id: str,
    payload: ContributionCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    oid = _parse_object_id(id)
    goal = await SavingsGoal.find_one(SavingsGoal.id == oid, SavingsGoal.profile_id == profile_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    contribution = SavingsContribution(
        goal_id=str(goal.id),
        amount=payload.amount,
        contribution_date=payload.contribution_date or date.today(),
        notes=payload.notes,
    )
    await contribution.insert()

    # Deterministically update the goal's current_amount
    goal.current_amount += payload.amount
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True
    goal.updated_at = datetime.now(timezone.utc)

    await goal.save()
    return await enrich_savings_goal(goal)
