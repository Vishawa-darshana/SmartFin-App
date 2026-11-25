from pydantic import BaseModel, BeforeValidator
from typing import Annotated, Optional
from datetime import datetime

StrObjectId = Annotated[str, BeforeValidator(str)]


class CategoryBase(BaseModel):
    name: str
    type: str  # 'INCOME' | 'EXPENSE'
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: StrObjectId
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
