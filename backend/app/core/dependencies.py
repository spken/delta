"""
FastAPI dependencies for authentication and database.
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_user_id_from_token
from app.services import user_service
from app.models.user import User


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token in cookie.

    This dependency is used to protect routes that require authentication.

    Args:
        access_token: JWT token from cookie
        db: Database session

    Returns:
        User object if authenticated

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        raise credentials_exception

    # Extract user ID from token
    gitlab_user_id = get_user_id_from_token(access_token)
    if gitlab_user_id is None:
        raise credentials_exception

    # Get user from database
    user = await user_service.get_user_by_gitlab_id(db, gitlab_user_id)
    if user is None:
        raise credentials_exception

    return user


async def get_current_user_optional(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.

    This is useful for endpoints that work differently for authenticated users
    but don't require authentication.

    Args:
        access_token: JWT token from cookie
        db: Database session

    Returns:
        User object if authenticated, None otherwise
    """
    if access_token is None:
        return None

    gitlab_user_id = get_user_id_from_token(access_token)
    if gitlab_user_id is None:
        return None

    user = await user_service.get_user_by_gitlab_id(db, gitlab_user_id)
    return user
