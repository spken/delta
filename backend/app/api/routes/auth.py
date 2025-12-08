"""
Authentication routes for GitLab OAuth flow.
Will be implemented in Milestone 3.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

router = APIRouter()


@router.get("/login")
async def login():
    """
    Initiates GitLab OAuth flow.
    Redirects user to GitLab authorization page.
    """
    # TODO: Implement in Milestone 3
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/callback")
async def callback(code: str, state: str):
    """
    Handles GitLab OAuth callback.
    Exchanges code for access token and creates user session.
    """
    # TODO: Implement in Milestone 3
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me")
async def get_current_user():
    """
    Returns current authenticated user profile.
    """
    # TODO: Implement in Milestone 3
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/logout")
async def logout():
    """
    Logs out current user.
    """
    # TODO: Implement in Milestone 3
    return {"message": "Logged out successfully"}
