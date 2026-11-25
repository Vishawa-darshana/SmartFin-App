from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from decimal import Decimal

class MonthlyReportResponse(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expenses: Decimal
    net_savings: Decimal
    savings_rate_percentage: float
    category_breakdown: List[Dict[str, Any]]
    budget_adherence: List[Dict[str, Any]]
    insights: List[str]
