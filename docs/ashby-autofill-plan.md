# Ashby Autofill (Python + Selenium) — Implementation Plan

## Context

The `submitter` module under `backend/src/` is currently just a `.gitkeep` placeholder. The user's first concrete task for it is to prototype how automated job-application **autofilling** would work against **Ashby** (`ashbyhq.com`), mirroring the streamlined experience of tools like Jobright.

**Scope for this phase, confirmed with the user:** autofill only — fill the form, screenshot it, log it. No live-submit / `--live` mode, no submit-button handling, and no multi-ATS strategy abstraction yet (Ashby only, one concrete module, no `Protocol`/base-class seam until a second ATS is actually being built). The target job application URL is left as an editable placeholder constant rather than a required CLI argument, since the user will supply the real URL themselves before each run.

During planning, a stack conflict surfaced: `docs/ARCHITECTURE.md` and `GEMINI.md` both specify **Playwright** with Greenhouse/Lever/Workday as the target ATSs and never mention Ashby, while the repo's root `CLAUDE.md` (untracked, no git history) describes a **Selenium**-only, Ashby-only bot. Asked directly, the user confirmed: **Selenium, not Playwright**, and the module should live inside the existing `backend/src/submitter/` scaffold (not a separate standalone project). The user also asked to reconcile `docs/ARCHITECTURE.md` and `GEMINI.md` so all docs agree on Selenium + Ashby-first, rather than leaving the conflict in place.

To ground the design in reality rather than guesswork, a live Ashby application form was inspected directly (Ashby's own careers page, itself Ashby-hosted: `https://jobs.ashbyhq.com/Ashby/0f538da6-1e06-43f0-86cb-de8007814284/application`). Findings that drive this plan:

- **URL pattern**: `https://jobs.ashbyhq.com/{orgSlug}/{jobId}`, application form at `.../application`.
- **Stable structural classes** (same across every org/posting): `.ashby-application-form-container`, `.ashby-application-form-section-container`, `.ashby-application-form-field-entry` (wraps each individual question: label + input together).
- **System fields have fixed selectors everywhere**: `input[name="_systemfield_name"]`, `input[name="_systemfield_email"]`, `input#_systemfield_resume` (type=file).
- **Custom/org-specific fields (LinkedIn, GitHub, work authorization, EEO, etc.) have random UUID `name`/`id` per posting** — unusable as fixed selectors. The only reliable way to identify them is iterating `.ashby-application-form-field-entry`, reading each entry's label text, and keyword-matching that text against a mapping table.
- Observed field types requiring distinct fill logic: text, email, file upload (hidden real `<input type=file>` behind a styled dropzone), checkbox, radio group. Not every custom question maps to an existing `profile.json` field (e.g. "Which city and country do you intend to work from?").

## Implementation

### 1. Dependencies & environment
- New `backend/requirements.txt`: `selenium>=4.20`, `webdriver-manager>=4.0`. Nothing else needed yet (no Supabase/pydantic — db/cli aren't being wired up in this phase).
- `backend/.venv` for the virtualenv (already covered by `.gitignore`'s `.venv/` pattern).
- Chrome must be installed locally; `webdriver-manager` auto-resolves the matching chromedriver.

### 2. Module layout — `backend/src/submitter/`
```
backend/src/submitter/
├── __init__.py
├── main.py                # entry point; APPLICATION_URL placeholder constant at top; --headful is the only flag
├── browser.py              # Selenium driver lifecycle via webdriver-manager; headless by default
├── profile.py              # load_profile(path) -> Profile; resolves resume_path to an absolute path
├── ashby.py                 # Ashby-specific selectors/constants + label-extraction helper (single concrete module — no strategy/base abstraction yet, since there's only one ATS target right now; when a second ATS is actually built, this can be split into a strategies/ package)
├── field_mapper.py          # label -> value resolution: system field / keyword rule / qa_override / unmapped
├── form_filler.py           # the loop: perception / mapping / action(autofill only) / self-correction
├── logging_utils.py         # structured run logger -> console + JSON run log
└── runs/                    # gitignored: per-run screenshot + JSON log
```

`main.py` has an editable placeholder near the top:
```python
APPLICATION_URL = "<PASTE_ASHBY_JOB_APPLICATION_URL_HERE>"
```
The user edits this constant directly before each run rather than passing a URL via CLI flag. `--headful` remains an optional argparse flag for debugging (headless is the default).

`form_filler.py` implements the loop Selenium-native, autofill-only (no submit step at all):
1. **Perception** — `WebDriverWait` for `.ashby-application-form-container`, then `find_elements` for every `.ashby-application-form-field-entry`.
2. **Reasoning & mapping** — per entry, extract label text via `ashby.py`'s helper, resolve via `field_mapper.resolve()`.
3. **Action (autofill only)** — per-input-type fill, each wrapped in its own `try/except` so one bad field never aborts the run: text/email → `send_keys`; file → `send_keys(abspath)` directly on the real `<input type=file>` (never click the styled dropzone); checkbox → click only if not already in the desired state; radio → click the option whose label matches; select → `Select().select_by_visible_text()`. **The submit button is never located or clicked — that's out of scope for this phase.**
4. **Self-correction** — unmapped-but-required fields get logged as `UNMAPPED_REQUIRED_FIELD` and set the run's `manual_review` flag, but the loop continues. A one-time overlay/cookie-banner dismissal check runs before the field loop.

### 3. profile.json → field mapping
System fields map 1:1 by fixed selector. Custom fields resolve in this order per entry:
1. `qa_overrides` keyword match (new optional key in profile.json) — for questions with no natural profile field, e.g. `"which city and country": "Remote — Dhaka, Bangladesh"`.
2. Built-in keyword-rule table in `field_mapper.py` (`linkedin` → `linkedin_url`, `github` → `github_url`, `sponsorship`/`authorized to work` → `work_authorization.*`, etc.).
3. If still unmatched and the DOM marks the field required → log `UNMAPPED_REQUIRED_FIELD` with label text, set `manual_review = True`, continue. If unmatched and not required → log at INFO, skip silently.

Add `qa_overrides` (empty object by default) to `backend/config/profile.json.example`.

### 4. Autofill-only behavior (no live-submit mode in this phase)
- Every run: fill every mappable field → one full-page screenshot → JSON run log. Headless is the default; `--headful` for visual debugging only.
- **The submit button is never located, never clicked, period** — there is no `--live` flag and no submit-handling code at all this phase. Exit code 0 if fully mapped, non-zero if any required field went unmapped (`manual_review`).
- Run artifacts land in `backend/src/submitter/runs/<UTC-timestamp>__<job-id>/` (`form_filled.png`, `run_log.json`). Add `backend/src/submitter/runs/` to `.gitignore` — it will contain real PII in screenshots/logs.
- Live submission (`--live`, actually clicking submit) is explicitly deferred to a later phase, once autofill accuracy has been validated by hand against real postings.

### 5. New skill: `backend/.agents/skills/ashby/SKILL.md`
Per GEMINI.md's own "Skill Offloading" convention (ATS-specific procedural detail belongs in `.agents/skills/<name>/`, not inline in the main docs), capture: the URL pattern, the three stable structural classes, the system-field selector table, the custom-field UUID caveat + label-matching approach, per-input-type handling notes (including the hidden-file-input gotcha), and an explicit reminder that this phase is autofill-only — no submit logic exists yet.

### 6. Doc reconciliation
Update `docs/ARCHITECTURE.md` and `GEMINI.md` so every mention of "Playwright" becomes "Selenium" (diagrams at lines ~37/63/64, directory layout ~111/113-117, agentic loop step 1 at ~130, roadmap Phase 3 at ~163-165) and Ashby is named as the first supported/implemented ATS ahead of Greenhouse/Lever/Workday (still planned). Note that this phase implements autofill only (no submit step); soften ARCHITECTURE.md's self-correction step (~148) to say unmapped fields log `MANUAL_REVIEW_REQUIRED` locally (Supabase integration isn't built yet). No change needed to root `CLAUDE.md` — once these two docs match it, the conflict disappears on its own.

### 7. Copy this plan into `docs/`
Write the finalized plan to `docs/ashby-autofill-plan.md` for the user's own review/reference (separate from the ephemeral `~/.claude/plans/` file), as the first action once implementation starts.

## Verification
1. `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
2. `cp backend/config/profile.json.example backend/config/profile.json`, fill in real name/email/resume path, add a `qa_overrides` entry for "which city and country".
3. Edit `APPLICATION_URL` in `main.py` to a real Ashby job application URL (e.g. `https://jobs.ashbyhq.com/Ashby/0f538da6-1e06-43f0-86cb-de8007814284/application`, Ashby's own careers page, verified reachable during planning).
4. Run headful first for visual confirmation: `python -m backend.src.submitter.main --headful`.
5. Confirm: clean exit; `runs/<...>/run_log.json` shows each field's matched source (`system`/`profile-keyword`/`qa_override`/`unmapped`) and the overall `manual_review` flag; screenshot shows name/email/resume filename/LinkedIn/GitHub/checkbox/radio fields filled correctly.
6. Confirm non-submission: browser URL after the run still ends in `/application` — proof no submit action ever ran (there is no code path that could do so).
7. Re-run headless to confirm parity.

### Critical files
- `backend/src/submitter/form_filler.py`
- `backend/src/submitter/ashby.py`
- `backend/src/submitter/field_mapper.py`
- `backend/config/profile.json.example`
- `docs/ARCHITECTURE.md`
- `GEMINI.md`
