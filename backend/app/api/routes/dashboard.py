from fastapi import APIRouter, Depends
from typing import Optional

from app.api.dependencies import get_current_profile_id
from app.schemas.dashboard import FinancialSummary, DashboardChartsResponse
from app.services.dashboard_service import get_dashboard_summary, get_dashboard_charts

router = APIRouter()


@router.get("/summary", response_model=FinancialSummary)
async def get_summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    return await get_dashboard_summary(profile_id, month, year)


@router.get("/charts", response_model=DashboardChartsResponse)
async def get_charts(
    month: Optional[int] = None,
    year: Optional[int] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    return await get_dashboard_charts(profile_id, month, year)
