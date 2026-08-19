from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.src.db.client import get_supabase_client
from backend.src.db.models import JobPosting

VALID_STATUSES = {"QUEUED", "APPLIED", "FAILED", "INTERVIEW", "REJECTED"}

def insert_job(job: JobPosting) -> Optional[Dict[str, Any]]:
    """
    Inserts a new JobPosting into Supabase.
    Returns the created job record dictionary, or None if insertion fails (e.g. duplicate URL).
    """
    client = get_supabase_client()
    payload = job.model_dump(exclude_none=True, mode="json")
    
    # Do not supply client-side 'id' if empty/None so Supabase generates a UUID default
    if "id" in payload and not payload["id"]:
        del payload["id"]
        
    try:
        response = client.table("jobs").insert(payload).execute()
        if response.data and isinstance(response.data, list) and len(response.data) > 0:
            row = response.data[0]
            if isinstance(row, dict):
                return row
    except Exception as err:
        print(f"⚠️ insert_job failed for URL '{job.url}': {err}")
    
    return None


def get_job_by_url(url: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a single job record matching the application URL.
    Returns the job dictionary or None if not found.
    """
    client = get_supabase_client()
    response = client.table("jobs").select("*").eq("url", url).execute()
    if response.data and isinstance(response.data, list) and len(response.data) > 0:
        row = response.data[0]
        if isinstance(row, dict):
            return row
    return None


def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetches a single job record by its UUID primary key.
    """
    client = get_supabase_client()
    response = client.table("jobs").select("*").eq("id", job_id).execute()
    if response.data and isinstance(response.data, list) and len(response.data) > 0:
        row = response.data[0]
        if isinstance(row, dict):
            return row
    return None


def update_job(job_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates specified fields for a job record by job_id.
    """
    if not updates:
        return get_job_by_id(job_id)
        
    client = get_supabase_client()
    response = client.table("jobs").update(updates).eq("id", job_id).execute()
    if response.data and isinstance(response.data, list) and len(response.data) > 0:
        row = response.data[0]
        if isinstance(row, dict):
            return row
    return None


def update_job_status(job_id: str, status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Updates job status and optional notes.
    Automatically sets applied_at timestamp if status is updated to 'APPLIED'.
    """
    status_upper = status.upper()
    if status_upper not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{status}'. Must be one of: {VALID_STATUSES}")
        
    updates: Dict[str, Any] = {"status": status_upper}
    
    if notes is not None:
        updates["notes"] = notes
        
    if status_upper == "APPLIED":
        updates["applied_at"] = datetime.now(timezone.utc).isoformat()
        
    return update_job(job_id, updates)


def get_queued_jobs(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieves up to `limit` job records with status 'QUEUED', ordered by creation time.
    """
    client = get_supabase_client()
    response = (
        client.table("jobs")
        .select("*")
        .eq("status", "QUEUED")
        .order("created_at", desc=False)
        .limit(limit)
        .execute()
    )
    if response.data and isinstance(response.data, list):
        return [row for row in response.data if isinstance(row, dict)]
    return []


def get_job_stats() -> Dict[str, int]:
    """
    Returns counts of jobs grouped by status.
    """
    client = get_supabase_client()
    response = client.table("jobs").select("status").execute()
    stats: Dict[str, int] = {st: 0 for st in VALID_STATUSES}
    
    if response.data and isinstance(response.data, list):
        for row in response.data:
            if isinstance(row, dict) and "status" in row:
                st = str(row["status"]).upper()
                stats[st] = stats.get(st, 0) + 1
                
    return stats


def delete_job(job_id: str) -> bool:
    """
    Deletes a job record by UUID id.
    """
    client = get_supabase_client()
    response = client.table("jobs").delete().eq("id", job_id).execute()
    return bool(response.data and len(response.data) > 0)


def delete_job_by_url(url: str) -> bool:
    """
    Deletes a job record by URL. Useful for test cleanup.
    """
    client = get_supabase_client()
    response = client.table("jobs").delete().eq("url", url).execute()
    return bool(response.data and len(response.data) > 0)
