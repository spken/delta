"""
GitLab API service for fetching merge request data.
"""
from typing import Optional, Dict, List
import gitlab
from gitlab.exceptions import GitlabError

from app.core.config import settings


class GitLabService:
    """Service for interacting with GitLab API."""

    def __init__(self, access_token: str):
        """
        Initialize GitLab client with user's access token.

        Args:
            access_token: User's GitLab access token
        """
        self.access_token = access_token
        self.gitlab_url = settings.GITLAB_URL
        self.client = gitlab.Gitlab(self.gitlab_url, oauth_token=access_token)

    async def get_project(self, project_path: str):
        """
        Get GitLab project by path.

        Args:
            project_path: Full project path (e.g., "group/project")

        Returns:
            GitLab Project object

        Raises:
            GitlabError: If project not found or access denied
        """
        try:
            # The python-gitlab library is synchronous, but we wrap it for consistency
            project = self.client.projects.get(project_path)
            return project
        except GitlabError as e:
            print(f"[ERROR] Failed to get project {project_path}: {e}")
            raise

    async def get_merge_request(
        self, project_path: str, mr_iid: int
    ) -> Optional[Dict]:
        """
        Get merge request details with all necessary data.

        Args:
            project_path: Full project path
            mr_iid: Merge request internal ID

        Returns:
            Dictionary containing:
            {
                "iid": int,
                "title": str,
                "description": str,
                "state": str,  # "opened", "merged", "closed"
                "author": str,
                "source_branch": str,
                "target_branch": str,
                "sha": str,  # Latest commit SHA
                "updated_at": str,
                "web_url": str,
                "project_id": int
            }
            Returns None if MR not found.
        """
        try:
            project = await self.get_project(project_path)
            mr = project.mergerequests.get(mr_iid)

            return {
                "iid": mr.iid,
                "title": mr.title,
                "description": mr.description or "",
                "state": mr.state,
                "author": mr.author.get("name", "Unknown"),
                "source_branch": mr.source_branch,
                "target_branch": mr.target_branch,
                "sha": mr.sha,  # Latest commit SHA for cache invalidation
                "updated_at": mr.updated_at,
                "web_url": mr.web_url,
                "project_id": project.id,
            }
        except GitlabError as e:
            print(f"[ERROR] Failed to get MR {project_path}!{mr_iid}: {e}")
            return None

    async def get_merge_request_changes(
        self, project_path: str, mr_iid: int
    ) -> Optional[List[Dict]]:
        """
        Get merge request diffs/changes.

        Args:
            project_path: Full project path
            mr_iid: Merge request internal ID

        Returns:
            List of change dictionaries:
            [
                {
                    "old_path": str,
                    "new_path": str,
                    "diff": str,  # Unified diff format
                    "new_file": bool,
                    "renamed_file": bool,
                    "deleted_file": bool
                },
                ...
            ]
            Returns None if unable to fetch changes.
        """
        try:
            project = await self.get_project(project_path)
            mr = project.mergerequests.get(mr_iid)

            # Get changes (diffs)
            changes = mr.changes()

            if not changes or "changes" not in changes:
                return []

            result = []
            for change in changes["changes"]:
                result.append({
                    "old_path": change.get("old_path", ""),
                    "new_path": change.get("new_path", ""),
                    "diff": change.get("diff", ""),
                    "new_file": change.get("new_file", False),
                    "renamed_file": change.get("renamed_file", False),
                    "deleted_file": change.get("deleted_file", False),
                })

            return result
        except GitlabError as e:
            print(f"[ERROR] Failed to get changes for MR {project_path}!{mr_iid}: {e}")
            return None

    async def get_merge_request_notes(
        self, project_path: str, mr_iid: int, include_system: bool = False
    ) -> Optional[List[Dict]]:
        """
        Get merge request discussions/notes.

        Args:
            project_path: Full project path
            mr_iid: Merge request internal ID
            include_system: Include system notes (default: False)

        Returns:
            List of note dictionaries:
            [
                {
                    "author": str,
                    "body": str,
                    "created_at": str,
                    "system": bool
                },
                ...
            ]
            Returns None if unable to fetch notes.
        """
        try:
            project = await self.get_project(project_path)
            mr = project.mergerequests.get(mr_iid)

            # Get notes (comments)
            notes = mr.notes.list(all=True)

            result = []
            for note in notes:
                # Skip system notes if requested
                if not include_system and note.system:
                    continue

                result.append({
                    "author": note.author.get("name", "Unknown"),
                    "body": note.body,
                    "created_at": note.created_at,
                    "system": note.system,
                })

            return result
        except GitlabError as e:
            print(f"[ERROR] Failed to get notes for MR {project_path}!{mr_iid}: {e}")
            return None

    async def get_merge_request_commits(
        self, project_path: str, mr_iid: int
    ) -> Optional[List[Dict]]:
        """
        Get merge request commits.

        Args:
            project_path: Full project path
            mr_iid: Merge request internal ID

        Returns:
            List of commit dictionaries:
            [
                {
                    "id": str,  # SHA
                    "short_id": str,
                    "title": str,
                    "message": str,
                    "author_name": str,
                    "created_at": str
                },
                ...
            ]
            Returns None if unable to fetch commits.
        """
        try:
            project = await self.get_project(project_path)
            mr = project.mergerequests.get(mr_iid)

            # Get commits
            commits = mr.commits()

            result = []
            for commit in commits:
                result.append({
                    "id": commit["id"],
                    "short_id": commit["short_id"],
                    "title": commit["title"],
                    "message": commit["message"],
                    "author_name": commit["author_name"],
                    "created_at": commit["created_at"],
                })

            return result
        except GitlabError as e:
            print(f"[ERROR] Failed to get commits for MR {project_path}!{mr_iid}: {e}")
            return None

    async def get_full_merge_request_data(
        self, project_path: str, mr_iid: int
    ) -> Optional[Dict]:
        """
        Get complete merge request data including changes and discussions.

        This is the main method to use for analysis.

        Args:
            project_path: Full project path
            mr_iid: Merge request internal ID

        Returns:
            Dictionary containing:
            {
                "metadata": {...},  # From get_merge_request()
                "changes": [...],   # From get_merge_request_changes()
                "notes": [...],     # From get_merge_request_notes()
                "commits": [...]    # From get_merge_request_commits()
            }
            Returns None if unable to fetch data.
        """
        metadata = await self.get_merge_request(project_path, mr_iid)
        if not metadata:
            return None

        changes = await self.get_merge_request_changes(project_path, mr_iid)
        notes = await self.get_merge_request_notes(project_path, mr_iid)
        commits = await self.get_merge_request_commits(project_path, mr_iid)

        return {
            "metadata": metadata,
            "changes": changes or [],
            "notes": notes or [],
            "commits": commits or [],
        }


def create_gitlab_service(access_token: str) -> GitLabService:
    """
    Factory function to create GitLabService instance.

    Args:
        access_token: User's GitLab access token

    Returns:
        GitLabService instance
    """
    return GitLabService(access_token)
