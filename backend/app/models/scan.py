"""
Scan model for storing MR analysis history and cache.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.core.database import Base


class Scan(Base):
    """Scan table for MR analysis cache and history."""

    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, nullable=False, index=True)
    mr_iid = Column(Integer, nullable=False, index=True)
    mr_url = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    last_commit_sha = Column(String(255), nullable=False, index=True)
    summary_markdown = Column(Text, nullable=False)
    scanned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Scan {self.project_id}!{self.mr_iid}>"
