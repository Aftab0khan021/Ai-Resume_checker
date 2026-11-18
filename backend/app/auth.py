# app/auth.py
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel

from app.db import get_db

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
# SECURITY: Never use the default key in production — set SECRET_KEY env var!
_default_key = secrets.token_urlsafe(32)  # random per process — forces env var in prod
SECRET_KEY = os.getenv("SECRET_KEY", _default_key)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password policy
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
MAX_USERNAME_LENGTH = 32
USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_.-]{3,32}$")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# ---------------------------------------------------------------------------
# Password utilities
# ---------------------------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time bcrypt verify (passlib handles timing safety)."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def validate_password_strength(password: str) -> str | None:
    """Return an error string if password is too weak, else None."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    if len(password) > MAX_PASSWORD_LENGTH:
        return f"Password must be at most {MAX_PASSWORD_LENGTH} characters."
    return None


def validate_username(username: str) -> str | None:
    """Return an error string if username is invalid, else None."""
    if not username or not USERNAME_PATTERN.match(username):
        return "Username must be 3-32 characters and contain only letters, numbers, _, . or -"
    return None


# ---------------------------------------------------------------------------
# JWT utilities
# ---------------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=15)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# Dependency: get current user from Bearer token
# ---------------------------------------------------------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Validates JWT and returns the matching user document from MongoDB.
    Raises HTTP 401 on any failure (never reveals which check failed).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user = await db.users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return user


async def get_optional_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False))) -> Optional[dict]:
    """Like get_current_user but returns None instead of raising on missing/invalid token."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
    except JWTError:
        return None

    db = get_db()
    if db is None:
        return None
    user = await db.users.find_one({"username": username})
    return user
