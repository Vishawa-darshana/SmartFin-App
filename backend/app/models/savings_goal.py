from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument, MoneyDecimal


class SavingsGoal(BaseDocument):
    profile_id: str = "default_profile"
    title: str
    target_amount: MoneyDecimal
    current_amount: MoneyDecimal = Decimal("0.00")
    target_date: Optional[date] = None
    is_completed: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "savings_goals"
        indexes = [
            IndexModel([("profile_id", ASCENDING)]),
        ]
