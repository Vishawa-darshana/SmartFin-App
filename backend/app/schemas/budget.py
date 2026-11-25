from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional
from datetime import datetime
from decimal import Decimal

StrObjectId = Annotated[str, BeforeValidator(str)]


class BudgetBase(BaseModel):
    category_name: str
    monthly_limit: Decimal = Field(..., gt=0, decimal_places=2)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    category_name: Optional[str] = None


class BudgetResponse(BudgetBase):
    id: StrObjectId
    profile_id: str
    spent_amount: Optional[Decimal] = Decimal("0.00")
    remaining_amount: Optional[Decimal] = Decimal("0.00")
    percentage_used: Optional[float] = 0.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
