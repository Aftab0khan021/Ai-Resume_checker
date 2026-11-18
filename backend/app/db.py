# app/db.py
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

logger = logging.getLogger("resume-matcher.db")

MONGO_URL: Optional[str] = os.getenv("MONGO_URL")
DB_NAME: str = os.getenv("DB_NAME", "ai_resume_checker")

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        if not MONGO_URL:
            raise RuntimeError("MONGO_URL environment variable is not set")
        # Use TLS only for Atlas SRV-style URLs
        use_tls = MONGO_URL.startswith("mongodb+srv://")
        _client = AsyncIOMotorClient(
            MONGO_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=1,
            tls=use_tls,
            retryWrites=True,
        )
        logger.info("MongoDB client created.")
    return _client


def get_db() -> Optional[AsyncIOMotorDatabase]:
    global _db
    if _db is None:
        try:
            _db = get_client()[DB_NAME]
        except RuntimeError:
            return None
    return _db


async def ensure_indexes() -> None:
    """Create DB indexes for performance & uniqueness. Call once at startup."""
    db = get_db()
    if db is None:
        return
    try:
        # Unique index on username
        await db.users.create_index("username", unique=True)
        # Index on email (non-unique, may be missing)
        await db.users.create_index("email", sparse=True)
        # For fast user-scoped history queries
        await db.analysis_results.create_index([("user_id", 1), ("created_at", -1)])
        # For single-result lookup
        await db.analysis_results.create_index("id", unique=True)
        logger.info("DB indexes ensured.")
    except Exception as e:
        logger.warning(f"Index creation warning (non-fatal): {e}")
