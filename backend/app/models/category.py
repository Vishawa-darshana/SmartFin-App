from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument


class Category(BaseDocument):
    name: str
    type: Literal["INCOME", "EXPENSE"]
    is_default: bool = True
    color: Optional[str] = None
    icon: Optional[str] = None
    profile_id: str = "default_profile"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "categories"
        indexes = [
            IndexModel([("name", ASCENDING)], unique=True),
            IndexModel([("profile_id", ASCENDING)]),
        ]
