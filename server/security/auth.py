"""
Security Module - Token Authentication
Created by Francis Okorie Iyeke-Kanu

Handles authentication via Bearer token for ARIA Sidecar API.
Token is generated on startup and must be entered in ARIA Frontend Settings.
"""

import uuid
from fastapi import HTTPException, Header, Depends
from typing import Optional

# Generate a random UUID4 token on module import (startup)
ARIA_ACCESS_TOKEN = str(uuid.uuid4())

# Print token to console so user can copy it
print("\n" + "="*60)
print("🔐 ARIA SIDECAR - ACCESS TOKEN")
print("="*60)
print(f"ARIA_ACCESS_TOKEN: {ARIA_ACCESS_TOKEN}")
print("\n⚠️  Copy this token and enter it in ARIA Settings to pair the UI.")
print("="*60 + "\n")


def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency to verify Bearer token in Authorization header.

    Usage:
        @app.post("/execute")
        async def execute_command(token: str = Depends(verify_token)):
            ...

    Raises:
        HTTPException(401): If token is missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization format. Expected 'Bearer <token>'"
        )

    token = authorization.replace("Bearer ", "").strip()

    if token != ARIA_ACCESS_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Invalid token. Please check your ARIA Settings."
        )

    return token


def get_token() -> str:
    """
    Get the current ARIA access token.
    Useful for displaying in health checks or debugging.
    """
    return ARIA_ACCESS_TOKEN
