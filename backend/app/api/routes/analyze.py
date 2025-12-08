"""
Analysis routes for MR summarization.
Will be fully implemented in Milestone 6.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_mr(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes a GitLab MR and returns AI-generated summary.

    Process:
    1. Parse MR URL to extract project ID and MR IID
    2. Check cache (compare SHA)
    3. If cache miss: Fetch MR data from GitLab
    4. Generate summary using Azure OpenAI
    5. Store in database
    6. Return result
    """
    # TODO: Implement in Milestone 6
    raise HTTPException(status_code=501, detail="Not implemented yet")
