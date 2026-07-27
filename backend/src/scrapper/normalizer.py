import urllib.parse
from typing import Optional, Dict, Any
from backend.src.db.models import JobPosting

TRACKING_PARAMS = {"utm_source", "utm_medium", "utm_campaign", "ref", "gh_src", "source"}

def clean_url(raw_url: str) -> str:
    """Removes tracking query parameters from the URL."""
    try:
        parsed_url = urllib.parse.urlparse(raw_url)
        query_params = urllib.parse.parse_qsl(parsed_url.query)
        cleaned_params = [(k, v) for k, v in query_params if k not in TRACKING_PARAMS]
        
        cleaned_query = urllib.parse.urlencode(cleaned_params)
        cleaned_url = urllib.parse.urlunparse((
            parsed_url.scheme,
            parsed_url.netloc,
            parsed_url.path,
            parsed_url.params,
            cleaned_query,
            parsed_url.fragment
        ))
        return cleaned_url
    except Exception:
        return raw_url

def sanitize_text(text: Optional[str]) -> Optional[str]:
    """Trims whitespace and normalizes line breaks."""
    if not text:
        return text
    text = str(text).strip()
    return " ".join(text.split())

def normalize_job(raw_job: Dict[str, Any]) -> JobPosting:
    """
    Converts a raw scraped job dictionary into a JobPosting model.
    """
    title = sanitize_text(raw_job.get("raw_title"))
    company = sanitize_text(raw_job.get("raw_company"))
    location = sanitize_text(raw_job.get("raw_location"))
    url = clean_url(raw_job.get("raw_url", ""))
    source = sanitize_text(raw_job.get("source", "unknown"))
    description = sanitize_text(raw_job.get("raw_description"))

    # Ensure title, company, url are not empty (required fields per model/schema)
    if not title:
        title = "Unknown Title"
    if not company:
        company = "Unknown Company"
    if not url:
        raise ValueError("URL is required for JobPosting")

    return JobPosting(
        title=title,
        company=company,
        location=location,
        url=url,
        source=source,
        notes=description,
        status="QUEUED"
    )
