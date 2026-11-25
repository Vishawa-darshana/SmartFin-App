from datetime import date, datetime, timezone
from typing import Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument, MoneyDecimal


class SavingsContribution(BaseDocument):
    goal_id: str
    amount: MoneyDecimal
    contribution_date: date
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "savings_contributions"
        indexes = [
            IndexModel([("goal_id", ASCENDING)]),
        ]
