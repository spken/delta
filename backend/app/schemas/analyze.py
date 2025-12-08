"""
Pydantic schemas for analysis endpoints.
"""
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional


class AnalyzeRequest(BaseModel):
    """Request to analyze a GitLab MR."""
    url: str = Field(..., description="GitLab MR URL")


class MRHeader(BaseModel):
    """MR metadata for display."""
    title: str
    author: str
    status: str  # Open, Merged, Closed
    url: str


class AnalyzeResponse(BaseModel):
    """Response from analysis endpoint."""
    mr_header: MRHeader
    summary_markdown: str
    cached: bool = Field(..., description="Whether result was from cache")
    scanned_at: datetime


class ScanHistoryItem(BaseModel):
    """Single item in scan history."""
    id: int
    project_id: int
    mr_iid: int
    mr_url: str
    title: str
    scanned_at: datetime
    is_up_to_date: bool = Field(True, description="Whether scan is still current")

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    """Response from history endpoint."""
    scans: list[ScanHistoryItem]
    total: int
