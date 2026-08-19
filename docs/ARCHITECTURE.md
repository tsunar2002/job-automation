# 🚀 Job Automation Pipeline — Streamlined System Architecture & Collaboration Blueprint

This document defines the technical architecture, agentic design patterns, step-by-step roadmap, and peer collaboration model for building the automated job search, scraping, application submission, and tracking pipeline.

---

## 🏗️ 1. High-Level System Architecture

### Visual ASCII Box Diagram (Plain Text View)

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    4. CLI & USER CONFIGURATION (src/cli)                        │
│     [⌨️ Typer CLI Dashboard]                 [👤 Candidate Profile (profile.json)]│
└───────────┬───────────────────────────────────────────────────┬─────────────────┘
            │ (Trigger Discovery)                               │ (Inject Profile Data)
            ▼                                                   │
┌──────────────────────────────────────┐                        │
│      1. SCRAPING & DISCOVERY         │                        │
│ [🐙 GitHub Scraper] [🌐 Web Scraper] │                        │
└───────────────────┬──────────────────┘                        │
                    │                                           │
                    ▼                                           │
┌──────────────────────────────────────┐                        │
│   [📦 JobPosting Model (Pydantic)]   │                        │
└───────────────────┬──────────────────┘                        │
                    │ (Save New Jobs: status='QUEUED')          │
                    ▼                                           │
┌──────────────────────────────────────────────────────┐        │
│             2. STORAGE & DEDUPLICATION               │        │
│          [⚡ Supabase PostgreSQL Database]            │        │
└───────────────────┬──────────────────────────────────┘        │
                    │ (Fetch Queued Jobs)                       │
                    ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    3. APPLICATION ENGINE (src/submitter)                        │
│     [🤖 Selenium Form Engine] ──► [🔌 Adapters: Ashby (first) / Greenhouse / Lever / Workday] │
│                                                                                 │
│     (Autofills Application / Dry-Run & Updates Result back to Supabase)         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Interactive Mermaid Diagram (GitHub / Markdown Preview)

```mermaid
flowchart TD
    subgraph Discovery ["1. Scraping & Discovery (/src/scrapers)"]
        A["🐙 GitHub Jobs Scraper"]
        B["🌐 Web Board Scraper"]
    end

    subgraph Data ["Data Normalization"]
        D["📦 JobPosting Model (Pydantic)"]
    end

    subgraph Database ["2. Storage & Deduplication (/src/db)"]
        E[("⚡ Supabase PostgreSQL (jobs table)")]
    end

    subgraph Submitter ["3. Application Engine (/src/submitter)"]
        G["🤖 Selenium Form Engine"]
        H["🔌 Portal Adapters: Ashby (first) / Greenhouse / Lever / Workday"]
    end

    subgraph CLI ["4. CLI & User Configuration (/src/cli)"]
        I["⌨️ Typer CLI Dashboard"]
        P["👤 Candidate Profile (config/profile.json)"]
    end

    %% Data Flow
    A --> D
    B --> D
    D -->|"Save New Jobs (status='QUEUED')"| E
    E -->|"Fetch Queued Jobs"| G
    G --> H
    H -->|"Update Status ('APPLIED' / 'FAILED')"| E
    P -.-|"Inject Contact & Resume Data"| G

    %% Control Triggers
    I -->|"Trigger Discovery"| A
    I -->|"Trigger Submitter"| G
```

---

## 📦 2. Module Specifications & Directory Layout

```text
job-automation/
├── .env.example
├── .gitignore
├── GEMINI.md
├── README.md
├── docs/
│   └── ARCHITECTURE.md         # Full technical architecture & roadmap
├── config/
│   ├── profile.json            # User contact, education, experience, URLs (git-ignored)
│   └── profile.json.example    # Public sample profile format
├── src/
│   ├── db/                     # Module 1: Supabase client & database handlers
│   │   ├── client.py           # Supabase singleton instance
│   │   ├── models.py           # Pydantic schemas (JobPosting, ApplicationResult)
│   │   └── repository.py       # DB CRUD functions (upsert_job, update_status)
│   ├── scrapers/               # Module 2: Job discovery source adapters
│   │   ├── base.py             # Abstract BaseScraper class
│   │   ├── github_jobs.py      # Scrapes markdown job lists from GitHub repos
│   │   └── web_board.py        # Generic web scraper
│   ├── submitter/              # Module 3: Browser automation engine
│   │   ├── browser.py          # Selenium (webdriver-manager) browser manager (headless/headful)
│   │   ├── form_filler.py      # Field mapper & input interaction engine
│   │   ├── ashby.py            # Ashby ATS — first supported/implemented, autofill-only
│   │   └── strategies/         # Site-specific portal strategies (planned, once a 2nd ATS is built)
│   │       ├── base_strategy.py
│   │       ├── greenhouse.py
│   │       ├── lever.py
│   │       └── workday.py
│   └── cli/                    # Module 4: Command Line Interface
│       └── main.py             # Typer CLI commands (scrape, apply, status)
└── tests/                      # Unit & integration tests
```

---

## 🤖 3. Agentic Workflow Design

The core submission loop relies on a 4-step agentic loop:

1. **Perception**:
   - Selenium (Chrome via `webdriver-manager`) launches the job application link.
   - Scans the page DOM to extract visible input fields (`<input>`, `<select>`, `<textarea>`, file upload inputs). For Ashby specifically, this means waiting for `.ashby-application-form-container` and iterating `.ashby-application-form-field-entry` elements — see `.agents/skills/ashby/SKILL.md`.

2. **Reasoning & Field Mapping**:
   - Matches form input labels to keys in `profile.json`:
     - `"First Name"` ➔ `profile.first_name`
     - `"Email Address"` ➔ `profile.email`
     - `"Attach Resume"` ➔ `profile.resume_path`
   - If an unknown field is encountered (e.g. *"Are you authorized to work in the US?"*), checks `profile.json`'s `qa_overrides` table by label keyword; if still unmatched, logs it for manual review rather than guessing, without halting the rest of the run.

3. **Action & Execution**:
   - Types values into inputs with human-like delays.
   - Uploads PDF resume file.
   - **Current phase (Ashby, autofill-only): fills every mappable field, takes a verification screenshot, and logs form state — there is no submit step and no `--live` mode implemented yet.** The `--dry-run`/`--live` split described here is the target end-state for the full pipeline, once submit handling is built for a given ATS.

4. **Self-Correction & Error Recovery**:
   - If a modal or cookie banner pops up blocking the screen, detects overlay elements and clicks "Accept/Close".
   - If required fields are missing, this is logged locally as `MANUAL_REVIEW_REQUIRED` in the current autofill-only phase; will map to Supabase `FAILED`/`notes` once `src/db/` is wired up.

---

## 🗓️ 4. Phased Implementation Roadmap

- [ ] **Phase 1: DB & Profile Setup**
  - Create Supabase `jobs` table.
  - Implement `src/db/repository.py` for upserting and updating status.
  - Create `config/profile.json.example`.

- [ ] **Phase 2: Discovery Scraper Engine**
  - Build `src/scrapers/github_jobs.py` to parse tech job markdown repos.
  - Implement URL deduplication against Supabase and set initial status to `QUEUED`.

- [x] **Phase 3a: Selenium Autofill — Ashby (implemented)**
  - Built `src/submitter/browser.py`, `ashby.py`, `field_mapper.py`, `form_filler.py`.
  - Autofill-only: form filling and screenshot/JSON logging verified against a real Ashby posting. No submit step yet.

- [ ] **Phase 3b: Live Submission & Additional ATS Portals**
  - Add submit-button handling + `--live` mode (currently out of scope).
  - Add Greenhouse/Lever/Workday adapters once a second ATS is prioritized.

- [ ] **Phase 4: CLI & End-to-End Testing**
  - Wire CLI commands in `src/cli/main.py`.
  - Conduct full integration run (`scrape` ➔ `apply --dry-run` ➔ `status`).
