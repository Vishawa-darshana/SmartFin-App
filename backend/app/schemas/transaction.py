from pydantic import BaseModel, Field, BeforeValidator
from typing import Annotated, Optional, Literal
from datetime import date, datetime
from decimal import Decimal

StrObjectId = Annotated[str, BeforeValidator(str)]


class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    type: Literal["INCOME", "EXPENSE"]
    category_name: str
    category_id: Optional[str] = None
    description: str
    date: date
    payment_method: Optional[str] = "Cash"
    notes: Optional[str] = None
    recurring_expense_id: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    type: Optional[Literal["INCOME", "EXPENSE"]] = None
    category_name: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: StrObjectId
    profile_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
