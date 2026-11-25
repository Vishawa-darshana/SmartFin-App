from fastapi import APIRouter, Depends
from typing import List

from app.api.dependencies import get_current_profile_id
from app.schemas.assistant import ChatRequest, ChatResponse, ChatMessage
from app.models.conversation import Conversation

router = APIRouter()


@router.get("/conversations", response_model=List[ChatMessage])
async def get_conversations(
    session_id: str = "default_session",
    limit: int = 50,
    profile_id: str = Depends(get_current_profile_id),
):
    messages = (
        await Conversation.find(
            Conversation.profile_id == profile_id,
            Conversation.session_id == session_id,
        )
        .sort("created_at")
        .limit(limit)
        .to_list()
    )
    return [
        ChatMessage(
            role=m.role,
            content=m.content,
            metadata=m.metadata,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    profile_id: str = Depends(get_current_profile_id),
):
    session = request.session_id or "default_session"

    # Record user message in MongoDB
    user_msg = Conversation(
        profile_id=profile_id,
        session_id=session,
        role="user",
        content=request.message,
    )
    await user_msg.insert()

    # In Phase 3, this invokes the LangGraph coordinator workflow.
    reply_text = (
        "Hello! I am SmartFin AI Assistant. You can ask me to track expenses, "
        "check budgets, view upcoming bills, or analyze your spending."
    )

    asst_msg = Conversation(
        profile_id=profile_id,
        session_id=session,
        role="assistant",
        content=reply_text,
    )
    await asst_msg.insert()

    return ChatResponse(
        reply=reply_text,
        intent="general_greeting",
        agent_used="coordinator_agent",
        requires_confirmation=False,
        session_id=session,
    )
