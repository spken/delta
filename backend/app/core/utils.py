"""
Utility functions for URL parsing and data processing.
"""
import re
from typing import Optional, Tuple
from urllib.parse import urlparse


def parse_gitlab_mr_url(url: str) -> Optional[Tuple[str, int]]:
    """
    Parse GitLab MR URL to extract project path and MR IID.

    Supports various GitLab URL formats:
    - https://gitlab.com/group/project/-/merge_requests/123
    - https://gitlab.com/group/subgroup/project/-/merge_requests/123
    - https://gitlab.example.com/namespace/project/-/merge_requests/456

    Args:
        url: GitLab MR URL

    Returns:
        Tuple of (project_path, mr_iid) if valid, None otherwise
        - project_path: Full project path (e.g., "group/project")
        - mr_iid: Merge request internal ID (integer)

    Examples:
        >>> parse_gitlab_mr_url("https://gitlab.com/foo/bar/-/merge_requests/42")
        ("foo/bar", 42)

        >>> parse_gitlab_mr_url("https://gitlab.com/group/sub/proj/-/merge_requests/99")
        ("group/sub/proj", 99)
    """
    # Pattern to match GitLab MR URLs
    # Captures: project path and MR IID
    pattern = r"^https?://[^/]+/(.+?)/-/merge_requests/(\d+)"

    match = re.match(pattern, url)
    if not match:
        return None

    project_path = match.group(1)
    mr_iid = int(match.group(2))

    return (project_path, mr_iid)


def validate_gitlab_url(url: str, expected_gitlab_url: str) -> bool:
    """
    Validate that URL belongs to the expected GitLab instance.

    Args:
        url: URL to validate
        expected_gitlab_url: Expected GitLab base URL (from settings)

    Returns:
        True if URL belongs to expected instance, False otherwise

    Examples:
        >>> validate_gitlab_url(
        ...     "https://gitlab.com/foo/bar/-/merge_requests/1",
        ...     "https://gitlab.com"
        ... )
        True

        >>> validate_gitlab_url(
        ...     "https://other.com/foo/bar/-/merge_requests/1",
        ...     "https://gitlab.com"
        ... )
        False
    """
    try:
        url_parsed = urlparse(url)
        expected_parsed = urlparse(expected_gitlab_url)

        # Compare scheme and netloc (host)
        return (
            url_parsed.scheme == expected_parsed.scheme
            and url_parsed.netloc == expected_parsed.netloc
        )
    except Exception:
        return False


def truncate_text(text: str, max_length: int = 1000) -> str:
    """
    Truncate text to maximum length with ellipsis.

    Args:
        text: Text to truncate
        max_length: Maximum length (default: 1000)

    Returns:
        Truncated text with "..." if longer than max_length

    Examples:
        >>> truncate_text("Hello World", 5)
        "Hello..."

        >>> truncate_text("Short", 10)
        "Short"
    """
    if len(text) <= max_length:
        return text

    return text[:max_length] + "..."


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe processing.

    Removes or replaces characters that might cause issues.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename

    Examples:
        >>> sanitize_filename("my file.txt")
        "my_file.txt"

        >>> sanitize_filename("../../../etc/passwd")
        "etc_passwd"
    """
    # Remove directory traversal attempts
    filename = filename.replace("..", "")
    filename = filename.replace("/", "_")
    filename = filename.replace("\\", "_")

    # Replace spaces with underscores
    filename = filename.replace(" ", "_")

    return filename
