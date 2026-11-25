from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.api.dependencies import get_current_profile_id
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    type: Optional[str] = None,
    profile_id: str = Depends(get_current_profile_id),
):
    query_filter: dict = {"profile_id": profile_id}
    if type:
        query_filter["type"] = type.upper()
    return await Category.find(query_filter).sort("name").to_list()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    profile_id: str = Depends(get_current_profile_id),
):
    name_clean = payload.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")

    existing = await Category.find_one({"name": {"$regex": f"^{name_clean}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    cat = Category(
        name=name_clean,
        type=payload.type.upper() if payload.type.upper() in ("INCOME", "EXPENSE") else "EXPENSE",
        icon=payload.icon,
        color=payload.color,
        profile_id=profile_id,
        is_default=False,
    )
    await cat.insert()
    return cat
