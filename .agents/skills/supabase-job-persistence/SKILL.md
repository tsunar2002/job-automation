---
name: supabase-job-persistence
description: Handles Supabase database initialization, strict URL deduplication checks, and row insertion for scraped job postings, referencing postgresql-code-review.
---

# Supabase Job Persistence & Deduplication Skill

> **Blueprint Reference**: Inspired by [postgresql-code-review](https://github.com/github/awesome-copilot/tree/main/skills/postgresql-code-review) and [sql-optimization](https://github.com/github/awesome-copilot/tree/main/skills/sql-optimization) from the Awesome GitHub Copilot catalog.

## Purpose
Manage Supabase PostgreSQL database connections, enforce strict URL deduplication, and persist clean `JobPosting` records into the `jobs` table as mandated by project requirements.

---

## Database Table Specification (`jobs`)

Ensure your Supabase table schema follows this exact layout:

```sql
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'QUEUED',
    match_score NUMERIC,
    applied_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for high-performance deduplication lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_url ON jobs (url);
```

---

## Instructions for Supabase Client Wrapper (`backend/src/db/`)

### 1. Security & Credentials (Implemented)
- Handled in `backend/src/db/client.py`. It explicitly loads from the `backend/.env` file.

### 2. Strict Deduplication Query & Insertion (Implemented)
- Handled natively by `repository.insert_job()`. 
- Since `url` is a `UNIQUE` constraint in the Supabase schema, `insert_job` simply attempts the insert and catches the exception/error if the URL already exists, cleanly skipping the duplicate.

### 3. Stale Job Synchronization & Closed Status (Implemented)
- The pipeline now proactively closes jobs that have been removed from source lists.
- **FUTURE SCRAPERS**: When building a new CLI integration (in `scrape.py`), utilize `repository.get_queued_jobs_by_source()` to find existing QUEUED jobs, and `repository.update_job_status(job_id, "CLOSED")` for any job whose URL is no longer present in the fresh scrape list.
- Valid statuses are: `QUEUED`, `APPLIED`, `FAILED`, `INTERVIEW`, `REJECTED`, `CLOSED`.
