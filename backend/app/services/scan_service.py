"""
Scan service for database operations.
Handles CRUD operations for Scan model and cache logic.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from typing import Optional, List
from datetime import datetime

from app.models.scan import Scan


async def get_scan_by_mr(
    db: AsyncSession,
    project_id: int,
    mr_iid: int
) -> Optional[Scan]:
    """Get scan by project ID and MR IID."""
    result = await db.execute(
        select(Scan).where(
            Scan.project_id == project_id,
            Scan.mr_iid == mr_iid
        )
    )
    return result.scalar_one_or_none()


async def get_scan_by_id(db: AsyncSession, scan_id: int) -> Optional[Scan]:
    """Get scan by ID."""
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    return result.scalar_one_or_none()


async def create_scan(
    db: AsyncSession,
    project_id: int,
    mr_iid: int,
    mr_url: str,
    title: str,
    last_commit_sha: str,
    summary_markdown: str,
) -> Scan:
    """Create a new scan record."""
    scan = Scan(
        project_id=project_id,
        mr_iid=mr_iid,
        mr_url=mr_url,
        title=title,
        last_commit_sha=last_commit_sha,
        summary_markdown=summary_markdown,
        scanned_at=datetime.utcnow(),
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return scan


async def update_scan(
    db: AsyncSession,
    scan_id: int,
    last_commit_sha: str,
    summary_markdown: str,
    title: Optional[str] = None,
) -> Optional[Scan]:
    """
    Update an existing scan with new SHA and summary.
    This is called when cache is invalidated.
    """
    scan = await get_scan_by_id(db, scan_id)
    if scan:
        scan.last_commit_sha = last_commit_sha
        scan.summary_markdown = summary_markdown
        scan.scanned_at = datetime.utcnow()
        if title:
            scan.title = title
        await db.commit()
        await db.refresh(scan)
    return scan


async def upsert_scan(
    db: AsyncSession,
    project_id: int,
    mr_iid: int,
    mr_url: str,
    title: str,
    last_commit_sha: str,
    summary_markdown: str,
) -> Scan:
    """
    Create scan if doesn't exist, otherwise update.
    This is the main function used by the analysis endpoint.
    """
    scan = await get_scan_by_mr(db, project_id, mr_iid)

    if scan:
        # Update existing scan
        scan.last_commit_sha = last_commit_sha
        scan.summary_markdown = summary_markdown
        scan.title = title
        scan.mr_url = mr_url
        scan.scanned_at = datetime.utcnow()
        await db.commit()
        await db.refresh(scan)
    else:
        # Create new scan
        scan = await create_scan(
            db=db,
            project_id=project_id,
            mr_iid=mr_iid,
            mr_url=mr_url,
            title=title,
            last_commit_sha=last_commit_sha,
            summary_markdown=summary_markdown,
        )

    return scan


async def check_cache_validity(
    db: AsyncSession,
    project_id: int,
    mr_iid: int,
    current_sha: str
) -> tuple[bool, Optional[Scan]]:
    """
    Check if cached scan is valid by comparing SHAs.

    Returns:
        (is_valid, scan): Tuple of validity flag and scan object (if exists)
    """
    scan = await get_scan_by_mr(db, project_id, mr_iid)

    if not scan:
        return (False, None)

    # Cache is valid if SHA matches
    is_valid = scan.last_commit_sha == current_sha
    return (is_valid, scan)


async def get_all_scans(
    db: AsyncSession,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> tuple[List[Scan], int]:
    """
    Get all scans with optional search and pagination.

    Returns:
        (scans, total_count): List of scans and total count
    """
    # Base query
    query = select(Scan)

    # Add search filter if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Scan.title.ilike(search_pattern),
                Scan.mr_url.ilike(search_pattern)
            )
        )

    # Get total count
    count_result = await db.execute(
        select(Scan).where(query.whereclause) if query.whereclause is not None else select(Scan)
    )
    total = len(count_result.all())

    # Apply ordering and pagination
    query = query.order_by(desc(Scan.scanned_at)).limit(limit).offset(offset)

    # Execute query
    result = await db.execute(query)
    scans = result.scalars().all()

    return (list(scans), total)
