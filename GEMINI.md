# Job Automation Pipeline - Agent Guidelines & Project Specs

## 🎯 Project Overview
An automated job search, scraping, application submission, and tracking pipeline. The system discovers tech jobs from GitHub repositories, job boards, and web searches, parses job requirements, auto-fills and submits job applications via browser automation, and tracks application statuses in Supabase.

---

## 🏗️ Core Architecture & Component Standards

### 1. Database & Tracking System (Supabase)
- Use **Supabase (PostgreSQL)** for persistent job tracking and application logs.
- Connection credentials (`SUPABASE_URL`, `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`) must be loaded strictly from `.env`.
- Database Table: `jobs`
  - `id` (uuid, primary key)
  - `title` (text, required)
  - `company` (text, required)
  - `location` (text)
  - `url` (text, unique constraint)
  - `source` (text) — e.g. `'github'`, `'linkedin'`, `'indeed'`
  - `status` (text, default `'DISCOVERED'`) — status enum: `DISCOVERED`, `QUEUED`, `APPLIED`, `FAILED`, `INTERVIEW`, `REJECTED`
  - `match_score` (numeric) — fit score based on resume/skills matching
  - `applied_at` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz, default `now()`)
- **Strict Deduplication**: Before scraping or applying, always query Supabase by `url` to prevent duplicate submissions.

### 2. Job Scraping & Discovery (`/scraper`)
- Modular source adapters (e.g. `github_jobs`, `web_scrapers`).
- Implement rate limiting, request throttling, and robust HTTP error handling.
- Standardize raw scrapings into a unified `JobPosting` data model before writing to Supabase.

### 3. Application Submission Engine (`/submitter`)
- Use automated browser tools (Playwright / Selenium) for navigating to application URLs and filling forms.
- Dynamic field mapping from `profile.json` (Name, Contact, Resume URL, GitHub/LinkedIn links, custom cover letter).
- **Dry-Run Mode (`--dry-run`)**: Support dry-run execution to fill out forms and log actions without clicking the final submit button.

---

## 🔒 Safety, Privacy & Data Security

- **Credentials & API Keys**: Never hardcode API keys, database passwords, or personal credentials. Keep them in `.env`.
- **Sensitive Data**: Keep `profile.json`, `.env`, and resume assets ignored in `.gitignore`.
- **Human Checkpoints**: Provide confirmation logs before performing irreversible web actions.

---

## 📂 Project Structure

```text
job-automation/
├── .env
├── GEMINI.md
├── README.md
├── config/
│   └── profile.json        # User profile & resume data (git-ignored)
├── src/
│   ├── db/                 # Supabase client & DB operations
│   ├── scrapers/           # Job discovery modules (GitHub, Web)
│   ├── submitter/          # Browser automation & form filling
│   └── utils/              # Helper utilities & logging
└── tests/                  # Mock tests & scraper validation
```

---

## 🛠️ CLI & Development Commands

- **Initialize Database**: Setup Supabase tables & indexes.
- **Run Discovery Scraper**: `python -m src.cli scrape --source github`
- **Run Auto-Apply (Dry Run)**: `python -m src.cli apply --dry-run`
- **Run Auto-Apply (Live Submission)**: `python -m src.cli apply --live`
- **View Application Status Summary**: `python -m src.cli status`

---

## 🛑 Continuous Learning & Constraints Protocol

- **Self-Updating Rules**: The AI agent working on this repository should proactively update this section when new core architectural constraints, rate limits, or site-specific gotchas are discovered during development.
- **Throttling & Rate Limits**: Always enforce minimum 2-second delays between external HTTP requests and web scraping tasks to avoid IP blocks.
- **Browser Automation Modes**: Playwright scripts must run in `--dry-run` and headless mode by default, unless `--headful` is explicitly passed for debugging.
- **Skill Offloading**: Detailed, multi-step procedures for specific job boards (e.g. Workday, Greenhouse, Lever) should be placed as modular skills under `.agents/skills/<skill-name>/` rather than cluttering this file.

