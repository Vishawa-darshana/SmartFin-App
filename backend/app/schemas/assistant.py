from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"
    confirmed_action: Optional[Dict[str, Any]] = None

class ProposedTransaction(BaseModel):
    amount: float
    type: str # 'INCOME' or 'EXPENSE'
    category: str
    description: str
    date: str
    payment_method: Optional[str] = "Cash"
    notes: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    agent_used: Optional[str] = None
    proposed_transaction: Optional[ProposedTransaction] = None
    requires_confirmation: bool = False
    context_data: Optional[Dict[str, Any]] = None
    session_id: str
