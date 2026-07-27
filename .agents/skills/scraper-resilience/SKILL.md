---
name: scraper-resilience
description: Guidelines for HTTP request rate-limiting delays, anti-bot mitigation, exception handling, and mock testing, referencing pytest-coverage.
---

# Scraper Resilience & Rate Limiting Skill

> **Blueprint Reference**: Inspired by [pytest-coverage](https://github.com/github/awesome-copilot/tree/main/skills/pytest-coverage) and governance rules from the Awesome GitHub Copilot catalog.

## Purpose
Ensure web scraping tasks run safely without triggering IP bans, rate-limit blocks (HTTP 429), or application crashes.

---

## Instructions & Throttling Rules

### 1. Mandatory Request Delays & Jitter (Implemented)
- Strict adherence to [GEMINI.md](file:///Users/nishan/Developer/job-automation/GEMINI.md) is now baked into `backend/src/scrapper/base_scraper.py`.
- **FUTURE SCRAPERS**: Always use `self.safe_fetch(url)` which automatically applies a base delay plus a randomized jitter (`random.uniform(0.5, 2.0)`) to simulate human pacing. Do NOT use `httpx.get()` directly.

### 2. User-Agent Header Rotation (Implemented)
- Handled automatically by `BaseScraper.get_headers()`. 
- **FUTURE SCRAPERS**: It randomly rotates between 5 realistic modern browser signatures per request to evade WAF detection (e.g. Cloudflare). 

### 3. Exponential Backoff & HTTP 429 Handling (Implemented)
- `safe_fetch()` natively implements an exponential backoff loop for HTTP `429` (Too Many Requests) and `503` (Service Unavailable).
- It waits 5s ➔ 10s ➔ 20s before retrying (max 3 attempts).

### 4. Exception Scoping & Graceful Degradation (Implemented)
- Network blips (`httpx.RequestError` or `httpx.HTTPStatusError`) are caught gracefully inside `safe_fetch()` without crashing the main orchestrator loop.
- **FUTURE SCRAPERS**: If a single job fails to normalize (e.g. malformed markup), wrap it in a `try/except` in your adapter (as done in `github_jobs.py`) so the engine skips the broken job and continues.

### 5. Mock Unit Testing (`backend/tests/`)
Write `pytest` tests using `unittest.mock` or `responses` fixtures to test HTML parsing logic without sending actual HTTP requests during automated build runs. *(Note: Test suites are yet to be built).*
