# 🕷️ Job Discovery & Scraper System Architecture (Jobright.ai Style)

This document defines the complete technical architecture, scraper source adapters, normalization pipeline, deduplication strategy, and 24/7 scheduling model for the Job Discovery Engine.

---

## 🏗️ 1. Ingestion Pipeline & Data Flow

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                🌐 DISCOVERY SOURCES                                    │
│ [🐙 GitHub Markdown Repos]   [🟢 Greenhouse ATS API]   [🔵 Lever ATS API]   [🕸️ Web Boards] │
└───────────────────────────┬────────────────────────────────────────────────────────────┘
                            │ Raw Payloads (Markdown / JSON / HTML)
                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        📦 DATA NORMALIZATION & PIPELINE                                │
│                     [Pydantic JobPosting Model Standardizer]                            │
└───────────────────────────┬────────────────────────────────────────────────────────────┘
                            │ Standardized JobPosting Objects
                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ⚡ DEDUPLICATION & SUPABASE REPOSITORY                          │
│               repository.get_job_by_url(url)  ➔  repository.insert_job(job)           │
└───────────────────────────┬────────────────────────────────────────────────────────────┘
                            │ Saves unique jobs (status = 'QUEUED')
                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        📊 SHARED SUPABASE DATABASE ('jobs' table)                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 2. Modular Source Adapters (`backend/src/scrapper/`)

Following Jobright's multi-source architecture, scrapers are implemented as modular source adapters inheriting from an abstract `BaseScraper` class:

### A. Abstract Base Class (`backend/src/scrapper/base_scraper.py`)
- Defines standard interface: `scrape() -> List[JobPosting]`.
- Enforces rotating User-Agents, randomized jitter delays, and exponential backoff for HTTP 429/503 errors to prevent IP blocking.

### B. GitHub Jobs Scraper (`backend/src/scrapper/github_jobs.py`)
- Downloads raw markdown files (`README.md`) from curated tech job repositories (e.g. Simplify / Pitt CSC New Grad & Internship repos).
- Uses BeautifulSoup to parse nested HTML tables and extracts Company Name, Role Title, Location, and canonical Application URL.

### C. Greenhouse ATS Adapter (`backend/src/scrapper/greenhouse.py`)
- Queries Greenhouse's public JSON API directly for target company tokens:
  ```text
  GET https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true
  ```
- Parses structured JSON payloads without needing HTML web scraping.

### D. Lever ATS Adapter (`backend/src/scrapper/lever.py`)
- Queries Lever's public JSON API endpoint:
  ```text
  GET https://api.lever.co/v0/postings/{company}?mode=json
  ```
- Extracts clean job listings for tech companies using Lever.

---

## 🧹 3. Data Normalization & Deduplication Protocol

1. **Normalization (`JobPosting` Pydantic Model)**:
   All raw payloads are converted into standard `JobPosting` instances:
   - `title`: Standardized job title (e.g., *"Software Engineer Intern"*).
   - `company`: Company name.
   - `location`: Cleaned location string (e.g., *"San Francisco, CA"* or *"Remote"*).
   - `url`: Direct application link.
   - `source`: Source identifier (`"github"`, `"greenhouse"`, `"lever"`).
   - `status`: Default `"QUEUED"`.

2. **Strict Deduplication & Active Synchronization**:
   Before writing to the database:
   - Call `repository.get_job_by_url(url)`.
   - If the job already exists, skip insertion to avoid duplicates.
   - If new, call `repository.insert_job(job)` to write the record to Supabase.
   - **Active Sync**: After scraping, compare all currently `QUEUED` jobs in the DB against the fresh list of URLs. Any jobs missing from the new scrape are updated to `CLOSED` via `repository.update_job_status()`.

---

## ⏰ 4. 24/7 Automated Scheduling Strategy

To run the scrapers automatically every few hours (like Jobright.ai) without needing a manual command:

### Option 1: GitHub Actions Scheduled Workflow (Cloud - Recommended)
- File: `.github/workflows/scrape_jobs.yml`
- Schedule: Runs every 2 hours via cron (`cron: '0 */2 * * *'`).
- Executes `python -m backend.src.cli scrape` on GitHub's cloud infrastructure and updates Supabase automatically.

### Option 2: Local Background Scheduler (CLI / APScheduler)
- Runs a lightweight background loop using `schedule` or `APScheduler` in Python:
  ```python
  import schedule, time
  from backend.src.scrapers.github_jobs import GitHubJobsScraper

  def run_all_scrapers():
      print("⏰ Running scheduled job discovery scrapers...")
      GitHubJobsScraper().run()

  schedule.every(2).hours.do(run_all_scrapers)

  while True:
      schedule.run_pending()
      time.sleep(60)
  ```
