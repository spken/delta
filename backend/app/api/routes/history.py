"""
History routes for viewing past scans.
Will be fully implemented in Milestone 6.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.analyze import HistoryResponse

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    search: str = Query(None, description="Search query for MR title"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns list of previously scanned MRs.

    Features:
    - Pagination support
    - Search by title
    - Ordered by scanned_at (most recent first)
    """
    # TODO: Implement in Milestone 6
    raise HTTPException(status_code=501, detail="Not implemented yet")
