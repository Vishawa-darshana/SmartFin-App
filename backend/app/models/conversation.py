from datetime import datetime, timezone
from typing import Any, Dict, Literal, Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument


class Conversation(BaseDocument):
    profile_id: str = "default_profile"
    session_id: str = "default_session"
    role: Literal["user", "assistant", "system"]
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "conversations"
        indexes = [
            IndexModel([("profile_id", ASCENDING), ("session_id", ASCENDING), ("created_at", ASCENDING)]),
        ]
