"""
History routes for viewing past scans.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analyze import HistoryResponse, ScanHistoryItem
from app.services import scan_service

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    search: str = Query(None, description="Search query for MR title or URL"),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns list of previously scanned MRs.

    Features:
    - Pagination support (limit/offset)
    - Search by MR title or URL
    - Ordered by scanned_at (most recent first)
    - Shows all scans (global history)

    Requires authentication (user must be logged in).

    Query Parameters:
    - search: Optional search term (searches in title and URL)
    - limit: Number of results to return (1-100, default: 50)
    - offset: Number of results to skip (default: 0)

    Returns:
    - scans: List of scan history items
    - total: Total number of scans matching search criteria
    """
    print(f"\n[INFO] Fetching history (search='{search}', limit={limit}, offset={offset})")

    # Get scans from database
    scans, total = await scan_service.get_all_scans(
        db=db,
        search=search,
        limit=limit,
        offset=offset
    )

    # Convert to response format
    history_items = [
        ScanHistoryItem(
            id=scan.id,
            project_id=scan.project_id,
            mr_iid=scan.mr_iid,
            mr_url=scan.mr_url,
            title=scan.title,
            scanned_at=scan.scanned_at,
            is_up_to_date=True,  # TODO: Could check current SHA vs cached SHA
        )
        for scan in scans
    ]

    print(f"[INFO] Found {total} total scans, returning {len(history_items)}")

    return HistoryResponse(
        scans=history_items,
        total=total
    )


@router.get("/history/{scan_id}")
async def get_scan_details(
    scan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information for a specific scan.

    Returns the complete scan data including the summary.

    Requires authentication.
    """
    print(f"\n[INFO] Fetching scan details for ID: {scan_id}")

    scan = await scan_service.get_scan_by_id(db, scan_id)

    if not scan:
        raise HTTPException(
            status_code=404,
            detail=f"Scan with ID {scan_id} not found"
        )

    return {
        "id": scan.id,
        "project_id": scan.project_id,
        "mr_iid": scan.mr_iid,
        "mr_url": scan.mr_url,
        "title": scan.title,
        "summary_markdown": scan.summary_markdown,
        "last_commit_sha": scan.last_commit_sha,
        "scanned_at": scan.scanned_at,
    }
