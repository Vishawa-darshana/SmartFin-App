from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, List
from datetime import date, datetime
from decimal import Decimal

StrObjectId = Annotated[str, BeforeValidator(str)]


class ContributionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    contribution_date: Optional[date] = None
    notes: Optional[str] = None


class ContributionCreate(ContributionBase):
    pass


class ContributionResponse(ContributionBase):
    id: StrObjectId
    goal_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class SavingsGoalBase(BaseModel):
    title: str
    target_amount: Decimal = Field(..., gt=0, decimal_places=2)
    target_date: Optional[date] = None
    notes: Optional[str] = None


class SavingsGoalCreate(SavingsGoalBase):
    current_amount: Optional[Decimal] = Decimal("0.00")


class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    current_amount: Optional[Decimal] = None
    target_date: Optional[date] = None
    is_completed: Optional[bool] = None
    notes: Optional[str] = None


class SavingsGoalResponse(SavingsGoalBase):
    id: StrObjectId
    profile_id: str
    current_amount: Decimal
    remaining_amount: Optional[Decimal] = Decimal("0.00")
    progress_percentage: Optional[float] = 0.0
    required_monthly_savings: Optional[Decimal] = None
    is_completed: bool
    contributions: Optional[List[ContributionResponse]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
