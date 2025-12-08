"""
GitLab OAuth 2.0 service for authentication flow.
"""
import secrets
from typing import Optional, Dict
from urllib.parse import urlencode
import httpx

from app.core.config import settings


class GitLabOAuthService:
    """Service for handling GitLab OAuth 2.0 flow."""

    def __init__(self):
        self.gitlab_url = settings.GITLAB_URL
        self.client_id = settings.GITLAB_CLIENT_ID
        self.client_secret = settings.GITLAB_CLIENT_SECRET
        self.redirect_uri = settings.GITLAB_REDIRECT_URI

    def generate_authorization_url(self) -> tuple[str, str]:
        """
        Generate GitLab OAuth authorization URL.

        Returns:
            Tuple of (authorization_url, state)
            - authorization_url: URL to redirect user to
            - state: Random state parameter for CSRF protection
        """
        state = secrets.token_urlsafe(32)

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "state": state,
            "scope": "api read_user read_repository",
        }

        auth_url = f"{self.gitlab_url}/oauth/authorize?{urlencode(params)}"
        return (auth_url, state)

    async def exchange_code_for_token(self, code: str) -> Optional[Dict]:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from GitLab callback

        Returns:
            Dictionary with token information:
            {
                "access_token": str,
                "refresh_token": str,
                "token_type": str,
                "expires_in": int
            }
            Returns None if exchange fails.
        """
        token_url = f"{self.gitlab_url}/oauth/token"

        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(token_url, data=data)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"[ERROR] Token exchange failed: {e}")
                return None

    async def get_user_info(self, access_token: str) -> Optional[Dict]:
        """
        Get user information from GitLab using access token.

        Args:
            access_token: GitLab access token

        Returns:
            Dictionary with user information:
            {
                "id": int,
                "username": str,
                "email": str,
                "name": str
            }
            Returns None if request fails.
        """
        user_url = f"{self.gitlab_url}/api/v4/user"

        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(user_url, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"[ERROR] Failed to get user info: {e}")
                return None

    async def refresh_access_token(self, refresh_token: str) -> Optional[Dict]:
        """
        Refresh access token using refresh token.

        Args:
            refresh_token: GitLab refresh token

        Returns:
            Dictionary with new token information
            Returns None if refresh fails.
        """
        token_url = f"{self.gitlab_url}/oauth/token"

        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(token_url, data=data)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"[ERROR] Token refresh failed: {e}")
                return None


# Singleton instance
oauth_service = GitLabOAuthService()
