from datetime import datetime, timezone
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument, MoneyDecimal


class Budget(BaseDocument):
    profile_id: str = "default_profile"
    category_name: str
    monthly_limit: MoneyDecimal
    month: int
    year: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "budgets"
        indexes = [
            IndexModel(
                [
                    ("profile_id", ASCENDING),
                    ("category_name", ASCENDING),
                    ("month", ASCENDING),
                    ("year", ASCENDING),
                ],
                unique=True,
                name="uq_budget_profile_cat_month_year",
            ),
        ]
