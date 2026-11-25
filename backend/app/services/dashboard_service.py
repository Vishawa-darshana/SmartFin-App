import calendar
from decimal import Decimal
from typing import List, Optional, Tuple
from datetime import datetime
from bson import Decimal128

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal
from app.schemas.dashboard import (
    FinancialSummary,
    CategoryDistribution,
    MonthlyTrendItem,
    BudgetVsActualItem,
    DashboardChartsResponse,
)


def _to_decimal(val) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal128):
        return val.to_decimal()
    return Decimal(str(val))


def _month_date_bounds(month: int, year: int) -> Tuple[str, str]:
    last_day = calendar.monthrange(year, month)[1]
    return f"{year:04d}-{month:02d}-01", f"{year:04d}-{month:02d}-{last_day:02d}"


async def _sum_transactions(
    profile_id: str,
    tx_type: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    category_name: Optional[str] = None,
) -> Decimal:
    match_filter: dict = {"profile_id": profile_id, "type": tx_type}
    if month and year:
        start_str, end_str = _month_date_bounds(month, year)
        match_filter["date"] = {"$gte": start_str, "$lte": end_str}
    if category_name:
        match_filter["category_name"] = category_name

    pipeline = [
        {"$match": match_filter},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    collection = Transaction.get_pymongo_collection()
    cursor = await collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    if not result:
        return Decimal("0.00")
    return _to_decimal(result[0].get("total"))


async def get_dashboard_summary(
    profile_id: str, month: Optional[int] = None, year: Optional[int] = None
) -> FinancialSummary:
    total_income = await _sum_transactions(profile_id, "INCOME", month, year)
    total_expenses = await _sum_transactions(profile_id, "EXPENSE", month, year)

    # Total savings in active goals
    goals_col = SavingsGoal.get_pymongo_collection()
    savings_cursor = await goals_col.aggregate(
        [
            {"$match": {"profile_id": profile_id}},
            {"$group": {"_id": None, "total": {"$sum": "$current_amount"}}},
        ]
    )
    savings_res = await savings_cursor.to_list(length=1)
    total_savings = _to_decimal(savings_res[0].get("total")) if savings_res else Decimal("0.00")

    remaining = total_income - total_expenses

    return FinancialSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        remaining_balance=remaining,
        total_savings=total_savings,
        currency="Rs.",
    )


async def get_dashboard_charts(
    profile_id: str, month: Optional[int] = None, year: Optional[int] = None
) -> DashboardChartsResponse:
    now = datetime.now()
    m = month or now.month
    y = year or now.year
    start_str, end_str = _month_date_bounds(m, y)

    # 1. Income vs Expenses
    summary = await get_dashboard_summary(profile_id, m, y)
    inc_vs_exp = {
        "income": summary.total_income,
        "expenses": summary.total_expenses,
    }

    # 2. Category distribution
    tx_col = Transaction.get_pymongo_collection()
    cat_cursor = await tx_col.aggregate(
        [
            {
                "$match": {
                    "profile_id": profile_id,
                    "type": "EXPENSE",
                    "date": {"$gte": start_str, "$lte": end_str},
                }
            },
            {"$group": {"_id": "$category_name", "cat_total": {"$sum": "$amount"}}},
            {"$sort": {"cat_total": -1}},
        ]
    )
    cat_rows = await cat_cursor.to_list(length=50)

    category_dist: List[CategoryDistribution] = []
    tot_exp_float = float(summary.total_expenses)
    for row in cat_rows:
        amt_dec = _to_decimal(row.get("cat_total"))
        pct = (float(amt_dec) / tot_exp_float * 100) if tot_exp_float > 0 else 0.0
        category_dist.append(
            CategoryDistribution(
                category=row["_id"] or "Other",
                amount=amt_dec,
                percentage=round(pct, 1),
            )
        )

    # 3. Monthly Trends (Last 6 months)
    monthly_trends: List[MonthlyTrendItem] = []
    for i in range(5, -1, -1):
        target_month = m - i
        target_year = y
        while target_month <= 0:
            target_month += 12
            target_year -= 1

        month_label = f"{target_year}-{target_month:02d}"
        m_inc = await _sum_transactions(profile_id, "INCOME", target_month, target_year)
        m_exp = await _sum_transactions(profile_id, "EXPENSE", target_month, target_year)
        monthly_trends.append(
            MonthlyTrendItem(
                month=month_label,
                income=m_inc,
                expenses=m_exp,
            )
        )

    # 4. Budget vs Actual for the selected month
    budgets = await Budget.find(
        Budget.profile_id == profile_id,
        Budget.month == m,
        Budget.year == y,
    ).to_list()

    b_vs_a: List[BudgetVsActualItem] = []
    for b in budgets:
        spent = await _sum_transactions(profile_id, "EXPENSE", m, y, category_name=b.category_name)
        b_vs_a.append(
            BudgetVsActualItem(
                category=b.category_name,
                budget=b.monthly_limit,
                actual=spent,
            )
        )

    return DashboardChartsResponse(
        income_vs_expenses=inc_vs_exp,
        category_distribution=category_dist,
        monthly_trends=monthly_trends,
        budget_vs_actual=b_vs_a,
    )
