"""
Analysis routes for MR summarization.
Complete implementation with GitLab + OpenAI + Cache integration.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, MRHeader
from app.services.gitlab_service import create_gitlab_service
from app.services.mr_analysis_service import create_mr_analysis_service
from app.services.openai_service import get_openai_service
from app.services import scan_service

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_mr(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes a GitLab MR and returns AI-generated summary.

    Flow:
    1. Parse and validate MR URL
    2. Fetch MR metadata from GitLab (get SHA)
    3. Check cache validity (compare SHAs)
    4. If cache HIT: Return cached summary (instant!)
    5. If cache MISS:
       - Fetch full MR data from GitLab
       - Filter changes (remove lock files)
       - Generate AI summary
       - Store in database
       - Return new summary

    Requires authentication (user must be logged in).
    """
    print(f"\n[INFO] Analyzing MR: {request.url}")

    # Step 1: Create services
    gitlab_service = create_gitlab_service(current_user.access_token)
    analysis_service = create_mr_analysis_service(gitlab_service, db)
    openai_service = get_openai_service()

    # Step 2: Parse and validate URL
    print("[INFO] Parsing URL...")
    parsed = await analysis_service.parse_and_validate_url(request.url)
    if not parsed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GitLab MR URL. Please provide a valid URL from the configured GitLab instance."
        )

    project_path, mr_iid = parsed
    print(f"[INFO] Project: {project_path}, MR: !{mr_iid}")

    # Step 3: Fetch MR metadata (to get SHA and basic info)
    print("[INFO] Fetching MR metadata...")
    metadata = await analysis_service.fetch_mr_metadata(project_path, mr_iid)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found or you don't have access to it."
        )

    current_sha = metadata["sha"]
    project_id = metadata["project_id"]
    print(f"[INFO] Current SHA: {current_sha}")

    # Step 4: Check cache validity
    print("[INFO] Checking cache...")
    is_valid, cached_scan = await analysis_service.check_cache(
        project_id, mr_iid, current_sha
    )

    if is_valid and cached_scan:
        # Cache HIT - return cached result
        print("[INFO] Cache HIT! Returning cached summary")
        return AnalyzeResponse(
            mr_header=MRHeader(
                title=cached_scan["title"],
                author=metadata["author"],
                status=metadata["state"],
                url=request.url,
            ),
            summary_markdown=cached_scan["summary_markdown"],
            cached=True,
            scanned_at=cached_scan["scanned_at"],
        )

    # Cache MISS - generate new summary
    print("[INFO] Cache MISS! Generating new summary...")

    # Step 5: Fetch full MR data
    print("[INFO] Fetching complete MR data...")
    full_data = await analysis_service.fetch_full_mr_data(project_path, mr_iid)
    if not full_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch merge request data from GitLab."
        )

    # Step 6: Prepare data for analysis (filter changes, etc.)
    print("[INFO] Preparing data for AI analysis...")
    prepared_data = await analysis_service.prepare_data_for_analysis(full_data)

    # Step 7: Generate AI summary
    print("[INFO] Generating AI summary...")
    summary = await openai_service.generate_summary(
        title=prepared_data["title"],
        description=prepared_data["description"],
        changes=prepared_data["changes"],
        notes=prepared_data["notes"],
        commits=prepared_data["commits"],
    )

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate summary. Please try again."
        )

    print("[INFO] Summary generated successfully!")

    # Step 8: Store in database
    print("[INFO] Storing summary in database...")
    scan = await scan_service.upsert_scan(
        db=db,
        project_id=project_id,
        mr_iid=mr_iid,
        mr_url=request.url,
        title=metadata["title"],
        last_commit_sha=current_sha,
        summary_markdown=summary,
    )

    print(f"[INFO] Analysis complete! Scan ID: {scan.id}")

    # Step 9: Return result
    return AnalyzeResponse(
        mr_header=MRHeader(
            title=metadata["title"],
            author=metadata["author"],
            status=metadata["state"],
            url=request.url,
        ),
        summary_markdown=summary,
        cached=False,
        scanned_at=scan.scanned_at,
    )
