---
name: job-board-scraper
description: Procedures for discovering and scraping tech job listings from GitHub repositories and web job boards into raw data models, referencing patterns from playwright-explore-website.
---

# Job Board Scraper Skill

> **Blueprint Reference**: Inspired by [playwright-explore-website](https://github.com/github/awesome-copilot/tree/main/skills/playwright-explore-website) and web scraping patterns from the Awesome GitHub Copilot catalog.

## Purpose
Guide the creation of modular, resilient scraper source adapters in `backend/src/scrapper/` to harvest job listings from GitHub repositories (e.g. `SimplifyJobs`, `pittcsc`) and web job portals.

---

## Instructions & Best Practices

### 1. Adapter Architecture (Implemented)
- We have established a foundational abstract class `BaseScraper` in `backend/src/scrapper/base_scraper.py`.
- **FUTURE SCRAPERS**: Any new scraper MUST inherit from `BaseScraper` and implement the `fetch_raw_jobs()` and `scrape()` methods exactly as done in `backend/src/scrapper/github_jobs.py`.

### 2. GitHub Markdown Scraper Strategy (Implemented)
- See `backend/src/scrapper/github_jobs.py` for the reference implementation. 
- We use `httpx` to fetch the raw README and `BeautifulSoup4` to parse the embedded HTML `<table>` rows accurately. 

### 3. Dynamic Web Scraping (Playwright / BeautifulSoup)
For future complex dynamic job boards:
1. Try `httpx` and `BeautifulSoup4` for static HTML pages first.
2. Fallback to `Playwright` (`async_api` or `sync_api`) when pages require client-side JavaScript rendering.
3. Locate job cards using resilient CSS selectors (`article`, `[data-testid="job-card"]`, `.job-item`) rather than fragile auto-generated class names.

### 4. Required Output Fields
Every scraper adapter must extract the following raw dictionary key-values to pass to the normalizer:
```python
{
    "raw_title": str,
    "raw_company": str,
    "raw_location": Optional[str],
    "raw_url": str,
    "source": str,
    "raw_description": Optional[str]
}
```
