from fastapi import APIRouter, Depends, Response
from typing import Optional
from datetime import datetime
from decimal import Decimal

from app.api.dependencies import get_current_profile_id
from app.schemas.report import MonthlyReportResponse
from app.services.dashboard_service import get_dashboard_summary, get_dashboard_charts

router = APIRouter()


@router.get("/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    now = datetime.now()
    m = month or now.month
    y = year or now.year

    summary = await get_dashboard_summary(profile_id, m, y)
    charts = await get_dashboard_charts(profile_id, m, y)

    net_savings = summary.total_income - summary.total_expenses
    savings_rate = (
        round(float((net_savings / summary.total_income) * 100), 2)
        if summary.total_income > 0
        else 0.0
    )

    return MonthlyReportResponse(
        month=m,
        year=y,
        total_income=summary.total_income,
        total_expenses=summary.total_expenses,
        net_savings=net_savings,
        savings_rate_percentage=savings_rate,
        category_breakdown=[c.model_dump() for c in charts.category_distribution],
        budget_adherence=[b.model_dump() for b in charts.budget_vs_actual],
        insights=[],
    )


@router.get("/financial-summary")
async def get_financial_summary(
    profile_id: str = Depends(get_current_profile_id),
):
    summary = await get_dashboard_summary(profile_id)
    return {
        "status": "ready",
        "profile_id": profile_id,
        "currency": summary.currency,
        "total_income": summary.total_income,
        "total_expenses": summary.total_expenses,
        "remaining_balance": summary.remaining_balance,
        "total_savings": summary.total_savings,
    }


@router.get("/export/pdf")
async def export_pdf_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    import io

    now = datetime.now()
    m = month or now.month
    y = year or now.year
    summary = await get_dashboard_summary(profile_id, m, y)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.drawString(100, 750, f"SmartFin AI - Financial Report ({m}/{y})")
    p.drawString(100, 730, "Generated deterministically from MongoDB Atlas records.")
    p.drawString(100, 700, f"Total Income: Rs. {summary.total_income:,.2f}")
    p.drawString(100, 680, f"Total Expenses: Rs. {summary.total_expenses:,.2f}")
    p.drawString(100, 660, f"Remaining Balance: Rs. {summary.remaining_balance:,.2f}")
    p.drawString(100, 640, f"Total Savings: Rs. {summary.total_savings:,.2f}")
    p.showPage()
    p.save()
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SmartFin_Report_{m}_{y}.pdf"},
    )
