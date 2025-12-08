"""
User service for database operations.
Handles CRUD operations for User model.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.models.user import User


async def get_user_by_gitlab_id(
    db: AsyncSession,
    gitlab_user_id: str
) -> Optional[User]:
    """Get user by GitLab user ID."""
    result = await db.execute(
        select(User).where(User.gitlab_user_id == gitlab_user_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by internal ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    gitlab_user_id: str,
    access_token: str,
    refresh_token: Optional[str] = None,
    username: Optional[str] = None,
    email: Optional[str] = None,
) -> User:
    """Create a new user."""
    user = User(
        gitlab_user_id=gitlab_user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        username=username,
        email=email,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_tokens(
    db: AsyncSession,
    user_id: int,
    access_token: str,
    refresh_token: Optional[str] = None,
) -> Optional[User]:
    """Update user tokens."""
    user = await get_user_by_id(db, user_id)
    if user:
        user.access_token = access_token
        if refresh_token:
            user.refresh_token = refresh_token
        await db.commit()
        await db.refresh(user)
    return user


async def upsert_user(
    db: AsyncSession,
    gitlab_user_id: str,
    access_token: str,
    refresh_token: Optional[str] = None,
    username: Optional[str] = None,
    email: Optional[str] = None,
) -> User:
    """
    Create user if doesn't exist, otherwise update tokens.
    This is useful for OAuth flow where user might already exist.
    """
    user = await get_user_by_gitlab_id(db, gitlab_user_id)

    if user:
        # Update existing user
        user.access_token = access_token
        if refresh_token:
            user.refresh_token = refresh_token
        if username:
            user.username = username
        if email:
            user.email = email
        await db.commit()
        await db.refresh(user)
    else:
        # Create new user
        user = await create_user(
            db=db,
            gitlab_user_id=gitlab_user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            username=username,
            email=email,
        )

    return user
