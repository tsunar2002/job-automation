from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class JobPosting(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = None
    url: str
    source: str = "github"
    status: str = "QUEUED"  # QUEUED, APPLIED, FAILED, INTERVIEW, REJECTED
    match_score: Optional[float] = None
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

class ApplicationResult(BaseModel):
    job_id: str
    status: str  # APPLIED, FAILED
    notes: Optional[str] = None
    screenshot_path: Optional[str] = None
