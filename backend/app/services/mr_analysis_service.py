"""
MR Analysis service with smart caching logic.
Coordinates GitLab data fetching, cache checking, and summary storage.
"""
from typing import Optional, Dict, Tuple, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.gitlab_service import GitLabService
from app.services import scan_service
from app.core.utils import parse_gitlab_mr_url, validate_gitlab_url
from app.core.config import settings


class MRAnalysisService:
    """Service for analyzing MRs with smart caching."""

    def __init__(self, gitlab_service: GitLabService, db: AsyncSession):
        """
        Initialize MR analysis service.

        Args:
            gitlab_service: GitLab API client
            db: Database session
        """
        self.gitlab_service = gitlab_service
        self.db = db

    async def parse_and_validate_url(self, url: str) -> Optional[Tuple[str, int]]:
        """
        Parse and validate GitLab MR URL.

        Args:
            url: GitLab MR URL

        Returns:
            Tuple of (project_path, mr_iid) if valid, None otherwise
        """
        # Parse URL
        parsed = parse_gitlab_mr_url(url)
        if not parsed:
            return None

        # Validate it's from the configured GitLab instance
        if not validate_gitlab_url(url, settings.GITLAB_URL):
            return None

        return parsed

    async def check_cache(
        self, project_id: int, mr_iid: int, current_sha: str
    ) -> Tuple[bool, Optional[Dict]]:
        """
        Check if cached scan is valid.

        Args:
            project_id: GitLab project ID
            mr_iid: Merge request IID
            current_sha: Current commit SHA from GitLab

        Returns:
            Tuple of (is_valid, cached_scan)
            - is_valid: True if cache is valid (SHA matches)
            - cached_scan: Cached scan data if exists, None otherwise
        """
        is_valid, scan = await scan_service.check_cache_validity(
            db=self.db,
            project_id=project_id,
            mr_iid=mr_iid,
            current_sha=current_sha,
        )

        if is_valid and scan:
            return (True, {
                "id": scan.id,
                "project_id": scan.project_id,
                "mr_iid": scan.mr_iid,
                "title": scan.title,
                "summary_markdown": scan.summary_markdown,
                "last_commit_sha": scan.last_commit_sha,
                "scanned_at": scan.scanned_at,
            })

        return (False, None)

    async def fetch_mr_metadata(
        self, project_path: str, mr_iid: int
    ) -> Optional[Dict]:
        """
        Fetch MR metadata from GitLab.

        Args:
            project_path: GitLab project path
            mr_iid: Merge request IID

        Returns:
            MR metadata dictionary or None if failed
        """
        metadata = await self.gitlab_service.get_merge_request(project_path, mr_iid)
        return metadata

    async def fetch_full_mr_data(
        self, project_path: str, mr_iid: int
    ) -> Optional[Dict]:
        """
        Fetch complete MR data including changes and discussions.

        This is used when cache is invalid and we need to generate a new summary.

        Args:
            project_path: GitLab project path
            mr_iid: Merge request IID

        Returns:
            Full MR data dictionary or None if failed
        """
        data = await self.gitlab_service.get_full_merge_request_data(
            project_path, mr_iid
        )
        return data

    async def should_skip_file(self, filepath: str) -> bool:
        """
        Determine if a file should be skipped during analysis.

        Skips lock files, binary files, and other non-useful files.

        Args:
            filepath: Path to file

        Returns:
            True if file should be skipped
        """
        skip_patterns = [
            # Lock files
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "poetry.lock",
            "Gemfile.lock",
            "Cargo.lock",
            # Build artifacts
            ".min.js",
            ".min.css",
            # Binary/compiled
            ".pyc",
            ".o",
            ".so",
            ".dll",
            ".exe",
            # Images
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".ico",
            # Fonts
            ".woff",
            ".woff2",
            ".ttf",
            ".eot",
        ]

        filepath_lower = filepath.lower()
        return any(pattern in filepath_lower for pattern in skip_patterns)

    async def filter_changes(self, changes: List[Dict]) -> List[Dict]:
        """
        Filter changes to exclude files that shouldn't be analyzed.

        Args:
            changes: List of change dictionaries

        Returns:
            Filtered list of changes
        """
        filtered = []
        for change in changes:
            filepath = change.get("new_path", change.get("old_path", ""))

            # Skip if file should be excluded
            if await self.should_skip_file(filepath):
                continue

            filtered.append(change)

        return filtered

    async def prepare_data_for_analysis(self, full_data: Dict) -> Dict:
        """
        Prepare MR data for AI analysis.

        Filters out unnecessary data and structures it optimally.

        Args:
            full_data: Full MR data from GitLab

        Returns:
            Prepared data dictionary:
            {
                "title": str,
                "description": str,
                "changes": [...],  # Filtered changes
                "notes": [...],    # User comments only
                "commits": [...],  # Commit messages
            }
        """
        metadata = full_data["metadata"]
        changes = full_data["changes"]

        # Filter changes to exclude lock files, etc.
        filtered_changes = await self.filter_changes(changes)

        # Only include user notes (not system notes)
        user_notes = [
            note for note in full_data["notes"]
            if not note.get("system", False)
        ]

        return {
            "title": metadata["title"],
            "description": metadata["description"],
            "author": metadata["author"],
            "state": metadata["state"],
            "changes": filtered_changes,
            "notes": user_notes,
            "commits": full_data["commits"],
        }


def create_mr_analysis_service(
    gitlab_service: GitLabService, db: AsyncSession
) -> MRAnalysisService:
    """
    Factory function to create MRAnalysisService.

    Args:
        gitlab_service: GitLab API client
        db: Database session

    Returns:
        MRAnalysisService instance
    """
    return MRAnalysisService(gitlab_service, db)
