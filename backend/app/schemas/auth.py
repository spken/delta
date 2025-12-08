"""
Pydantic schemas for authentication endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional


class TokenResponse(BaseModel):
    """Response when user successfully authenticates."""
    access_token: str
    token_type: str = "bearer"
    user_id: str


class UserProfile(BaseModel):
    """User profile information."""
    gitlab_user_id: str
    username: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True
