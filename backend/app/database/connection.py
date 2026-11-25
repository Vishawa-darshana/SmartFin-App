from typing import Optional
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from beanie import init_beanie
import certifi

from app.config.settings import get_settings

settings = get_settings()

_client: Optional[AsyncMongoClient] = None


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
    from app.models import DOCUMENT_MODELS

    db = get_database()
    await init_beanie(database=db, document_models=DOCUMENT_MODELS)


async def close_db() -> None:
    """Close MongoDB client connection cleanly on shutdown."""
    global _client
    if _client is not None:
        await _client.close()
        _client = None
