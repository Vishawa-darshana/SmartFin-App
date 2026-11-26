import asyncio
from typing import Optional
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from beanie import init_beanie
import certifi

from app.config.settings import get_settings

settings = get_settings()

_client: Optional[AsyncMongoClient] = None
_initialized_loop_id: Optional[int] = None
_init_lock: Optional[asyncio.Lock] = None


def get_client() -> AsyncMongoClient:
    global _client
    if _client is None:
        kwargs = {}
        if settings.MONGODB_URI.startswith("mongodb+srv://"):
            kwargs["tlsCAFile"] = certifi.where()
        _client = AsyncMongoClient(settings.MONGODB_URI, **kwargs)
    return _client


def get_database() -> AsyncDatabase:
    return get_client()[settings.MONGODB_DB_NAME]


async def init_db() -> None:
    """Initialize MongoDB Atlas connection and register all 9 Beanie document models."""
    global _client, _initialized_loop_id, _init_lock
    from app.models import DOCUMENT_MODELS

    current_loop_id = id(asyncio.get_running_loop())
    if _initialized_loop_id == current_loop_id and _client is not None:
        return

    if _init_lock is None or _initialized_loop_id != current_loop_id:
        _init_lock = asyncio.Lock()

    async with _init_lock:
        if _initialized_loop_id == current_loop_id and _client is not None:
            return
        # If event loop changed (e.g., serverless invocation), recreate client on current loop
        _client = None
        db = get_database()
        await init_beanie(database=db, document_models=DOCUMENT_MODELS)
        _initialized_loop_id = current_loop_id


async def ensure_db_ready(profile_id: str = "default_profile") -> None:
    """Ensure Beanie is initialized on the active event loop (works on both Uvicorn & Vercel Serverless)."""
    global _initialized_loop_id
    current_loop_id = id(asyncio.get_running_loop())
    if _initialized_loop_id != current_loop_id or _client is None:
        await init_db()
        from app.database.seed import seed_default_categories
        await seed_default_categories(profile_id)


async def close_db() -> None:
    """Close MongoDB client connection cleanly on shutdown."""
    global _client, _initialized_loop_id
    if _client is not None:
        try:
            await _client.close()
        except Exception:
            pass
        _client = None
        _initialized_loop_id = None
