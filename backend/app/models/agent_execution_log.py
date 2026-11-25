from datetime import datetime, timezone
from typing import Any, Dict, Optional
from pydantic import Field
from pymongo import IndexModel, ASCENDING
from .base_document import BaseDocument


class AgentExecutionLog(BaseDocument):
    session_id: Optional[str] = None
    agent_name: str
    intent: Optional[str] = None
    input_state: Optional[Dict[str, Any]] = None
    output_state: Optional[Dict[str, Any]] = None
    execution_time_ms: Optional[int] = None
    status: str = "SUCCESS"
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings(BaseDocument.Settings):
        name = "agent_execution_logs"
        indexes = [
            IndexModel([("session_id", ASCENDING), ("agent_name", ASCENDING)]),
        ]
