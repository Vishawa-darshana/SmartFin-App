from datetime import date, datetime, timezone
from typing import Literal, Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument, MoneyDecimal


class RecurringExpense(BaseDocument):
    profile_id: str = "default_profile"
    name: str
    amount: MoneyDecimal
    category_id: Optional[str] = None
    category_name: str
    frequency: Literal["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]
    start_date: date
    next_payment_date: date
    end_date: Optional[date] = None
    payment_status: str = "PENDING"
    is_active: bool = True
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "recurring_expenses"
        indexes = [
            IndexModel([("profile_id", ASCENDING), ("is_active", ASCENDING), ("next_payment_date", ASCENDING)]),
        ]


class RecurringPaymentInstance(BaseDocument):
    recurring_expense_id: str
    due_date: date
    amount: MoneyDecimal
    paid_date: Optional[date] = None
    transaction_id: Optional[str] = None
    status: Literal["PENDING", "PAID", "OVERDUE", "SKIPPED"] = "PENDING"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "recurring_payment_instances"
        indexes = [
            IndexModel(
                [("recurring_expense_id", ASCENDING), ("due_date", ASCENDING)],
                unique=True,
                name="uq_recurring_expense_due_date",
            ),
        ]
