"""
Authentication routes for GitLab OAuth flow.
"""
from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.services.oauth_service import oauth_service
from app.services import user_service
from app.schemas.auth import TokenResponse, UserProfile
from app.models.user import User

router = APIRouter()

# In-memory state storage (use Redis in production)
_oauth_states = {}


@router.get("/login")
async def login():
    """
    Initiates GitLab OAuth flow.
    Redirects user to GitLab authorization page.

    Flow:
    1. Generate authorization URL with state parameter
    2. Store state for CSRF validation
    3. Redirect user to GitLab
    """
    auth_url, state = oauth_service.generate_authorization_url()

    # Store state for validation in callback
    _oauth_states[state] = True

    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def callback(
    code: str,
    state: str,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """
    Handles GitLab OAuth callback.
    Exchanges code for access token and creates user session.

    Flow:
    1. Validate state parameter (CSRF protection)
    2. Exchange authorization code for access token
    3. Get user info from GitLab
    4. Create or update user in database
    5. Create JWT session token
    6. Set HTTP-only cookie
    7. Redirect to frontend
    """
    # Validate state (CSRF protection)
    if state not in _oauth_states:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    # Remove used state
    _oauth_states.pop(state, None)

    # Exchange code for token
    token_data = await oauth_service.exchange_code_for_token(code)
    if not token_data:
        raise HTTPException(
            status_code=400,
            detail="Failed to exchange authorization code for token"
        )

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    # Get user info from GitLab
    user_info = await oauth_service.get_user_info(access_token)
    if not user_info:
        raise HTTPException(
            status_code=400,
            detail="Failed to get user information from GitLab"
        )

    # Create or update user in database
    gitlab_user_id = str(user_info["id"])
    username = user_info.get("username")
    email = user_info.get("email")

    user = await user_service.upsert_user(
        db=db,
        gitlab_user_id=gitlab_user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        username=username,
        email=email,
    )

    # Create JWT session token
    session_token = create_access_token(data={"sub": gitlab_user_id})

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=session_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )

    # Redirect to frontend analysis page
    frontend_url = "http://localhost:5173/analysis"
    return RedirectResponse(url=frontend_url)


@router.get("/me", response_model=UserProfile)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Returns current authenticated user profile.

    Requires authentication (JWT token in cookie).
    """
    return UserProfile(
        gitlab_user_id=current_user.gitlab_user_id,
        username=current_user.username,
        email=current_user.email,
    )


@router.post("/logout")
async def logout(response: Response):
    """
    Logs out current user by clearing the session cookie.
    """
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}


@router.get("/status")
async def auth_status(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Check authentication status without requiring authentication.

    Returns:
        {
            "authenticated": bool,
            "user": UserProfile | null
        }
    """
    from app.core.dependencies import get_current_user_optional

    user = await get_current_user_optional(access_token, db)

    if user:
        return {
            "authenticated": True,
            "user": UserProfile(
                gitlab_user_id=user.gitlab_user_id,
                username=user.username,
                email=user.email,
            )
        }
    else:
        return {
            "authenticated": False,
            "user": None
        }
