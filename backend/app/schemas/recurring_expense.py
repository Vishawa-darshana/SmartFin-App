from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, Literal
from datetime import date, datetime
from decimal import Decimal

StrObjectId = Annotated[str, BeforeValidator(str)]
FrequencyType = Literal["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]


class RecurringExpenseBase(BaseModel):
    name: str
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    category_name: str
    category_id: Optional[str] = None
    frequency: FrequencyType
    start_date: date
    next_payment_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool = True


class RecurringExpenseCreate(RecurringExpenseBase):
    pass


class RecurringExpenseUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    category_name: Optional[str] = None
    category_id: Optional[str] = None
    frequency: Optional[FrequencyType] = None
    next_payment_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class RecurringInstanceResponse(BaseModel):
    id: StrObjectId
    recurring_expense_id: str
    due_date: date
    amount: Decimal
    paid_date: Optional[date] = None
    transaction_id: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class RecurringExpenseResponse(RecurringExpenseBase):
    id: StrObjectId
    profile_id: str
    payment_status: str
    is_overdue: Optional[bool] = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
