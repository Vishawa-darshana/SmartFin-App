from pydantic import BaseModel
from decimal import Decimal
from typing import List, Dict, Any, Optional
from app.schemas.transaction import TransactionResponse
from app.schemas.recurring_expense import RecurringExpenseResponse

class FinancialSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    remaining_balance: Decimal
    total_savings: Decimal
    currency: str = "Rs."

class CategoryDistribution(BaseModel):
    category: str
    amount: Decimal
    percentage: float
    color: Optional[str] = None

class MonthlyTrendItem(BaseModel):
    month: str
    income: Decimal
    expenses: Decimal

class BudgetVsActualItem(BaseModel):
    category: str
    budget: Decimal
    actual: Decimal

class DashboardChartsResponse(BaseModel):
    income_vs_expenses: Dict[str, Decimal]
    category_distribution: List[CategoryDistribution]
    monthly_trends: List[MonthlyTrendItem]
    budget_vs_actual: List[BudgetVsActualItem]

class DashboardOverviewResponse(BaseModel):
    summary: FinancialSummary
    recent_transactions: List[TransactionResponse]
    upcoming_recurring: List[RecurringExpenseResponse]
    budget_alerts: List[str]
    ai_insights: List[str]
