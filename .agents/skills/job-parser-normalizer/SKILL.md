---
name: job-parser-normalizer
description: Standardizes and cleans raw scraped job attributes into a unified JobPosting data model, referencing patterns from technical-job-search.
---

# Job Parser & Normalizer Skill

> **Blueprint Reference**: Inspired by [technical-job-search](https://github.com/github/awesome-copilot/tree/main/skills/technical-job-search) from the Awesome GitHub Copilot catalog.

## Purpose
Ensure all scraped job data is thoroughly sanitized, URL tracking parameters are stripped, and fields are mapped to a uniform `JobPosting` data model before database persistence.

---

## Instructions & Data Model Standards

### 1. Unified `JobPosting` Schema (Implemented)
- The schema is implemented using Pydantic in `backend/src/db/models.py`.
- **FUTURE SCRAPERS**: Always output a validated `JobPosting` instance. Do NOT pass raw dictionaries directly to the database.

### 2. URL Cleaning & Tracking Removal (Implemented)
- Tracking query parameters (`utm_source`, `ref`, etc.) ruin database deduplication. 
- We have implemented `clean_url(raw_url)` inside `backend/src/scrapper/normalizer.py`.
- **FUTURE SCRAPERS**: Always pass scraped URLs through the `clean_url` function to ensure canonical application links.

### 3. Text & Title Sanitization (Implemented)
- Trimming whitespace and normalizing line breaks is handled by `sanitize_text()` in `backend/src/scrapper/normalizer.py`.
- The main entrypoint for normalizing any raw scraped job is `normalize_job(raw_job_dict)` inside the normalizer module.

### 4. Tag & Skill Extraction (Optional Pre-filtering)
- Extract tech stack keywords from the title/description (e.g., `['Python', 'React', 'PostgreSQL']`).
- Flag remote status (`is_remote: bool`).
*(Note: Tag extraction is a future enhancement not yet active in the current implementation).*
