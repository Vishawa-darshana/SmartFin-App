from datetime import date, datetime, timezone
from typing import Literal, Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING, DESCENDING
from .base_document import BaseDocument, MoneyDecimal


class Transaction(BaseDocument):
    profile_id: str = "default_profile"
    amount: MoneyDecimal
    type: Literal["INCOME", "EXPENSE"]
    category_id: Optional[str] = None
    category_name: str
    description: str
    date: date
    payment_method: Optional[str] = "Cash"
    notes: Optional[str] = None
    recurring_expense_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "transactions"
        indexes = [
            IndexModel([("profile_id", ASCENDING), ("date", DESCENDING)]),
            IndexModel([("profile_id", ASCENDING), ("type", ASCENDING), ("category_name", ASCENDING)]),
        ]
