---
name: ashby
description: Ashby ATS (ashbyhq.com / jobs.ashbyhq.com) job application form structure — selectors, field-mapping approach, and known quirks for extending backend/src/submitter/ashby.py
---

# Ashby application form structure

Scope note: the current implementation (`backend/src/submitter/`) is **autofill-only** — it fills fields, screenshots the result, and logs everything, but there is no submit-button handling or `--live` mode at all yet. Keep that in mind when reading the notes below; none of this has been exercised against an actual live submission.

## URL pattern
- Job posting: `https://jobs.ashbyhq.com/{orgSlug}/{jobId}`
- Application form: `https://jobs.ashbyhq.com/{orgSlug}/{jobId}/application`
- Ashby's own careers page embeds this same form via an iframe at `https://jobs.ashbyhq.com/{orgSlug}?embed=js` — prefer navigating directly to the `jobs.ashbyhq.com` URL rather than a company's custom careers page wrapper, since the wrapper adds an iframe boundary Selenium can't reach into without switching frames.

## Stable structural classes (consistent across every org/job)
- `.ashby-application-form-container` — the whole form; wait on this before doing anything else.
- `.ashby-application-form-section-container` — groups of related questions.
- `.ashby-application-form-field-entry` — wraps **each individual question**: its label and its input(s) together. This is the reliable anchor to iterate over; everything else (label text, input elements) is found relative to it.

## System fields (fixed name/id on every posting)
| Field | Selector | Notes |
|---|---|---|
| Full name | `input[name="_systemfield_name"]` | single text input, required |
| Email | `input[name="_systemfield_email"]` | type=email, required |
| Resume | `input#_systemfield_resume` | type=file, **no `name` attribute** — the file input itself is real and directly interactable (unlike the checkbox/radio quirk below); `send_keys(absolute_path)` works without needing the styled dropzone UI |

## Custom / org-specific fields — NEVER hardcode selectors
Every other question (LinkedIn, GitHub, work authorization, EEO, location, portfolio links, etc.) gets a **random UUID** as both `name` and `id`, generated per job posting. E.g. `74209321-7d4c-4217-9dcc-5545564ed66b` for a "LinkedIn URL" field on one posting — this UUID will be different on every other posting, even for the same org.

The only reliable way to handle these: iterate `.ashby-application-form-field-entry`, extract the label text (`label`, `legend`, or `[class*="_label_"]` inside the entry — first non-empty match wins), and keyword-match that label text against `profile.json`'s fields (see `field_mapper.py`'s `KEYWORD_RULES`) or the profile's `qa_overrides` dict for questions with no natural profile field.

## Input types observed, and their fill quirks
- **Text / email** — plain `.clear()` + `.send_keys()`.
- **File upload (resume)** — real `<input type=file>` exists but is often visually hidden behind a styled dropzone (`Upload File` button + "or drag and drop here"). `send_keys(abspath)` works directly on the real input — never try to click the dropzone.
- **Checkbox / toggle-styled boolean questions** (e.g. "Are you living in the country where this role is based...?") — Ashby renders these as a Yes/No toggle backed by a real `<input type=checkbox>` that is **not directly interactable** (`ElementNotInteractableException` on a plain `.click()`, since it's visually hidden behind the styled toggle). Fallback: `driver.execute_script("arguments[0].click();", element)`. See `form_filler._click()`.
- **Radio groups** — each option is a separate `<input type=radio>` sharing a group-UUID prefix in `name`/`id` (e.g. `{groupUUID}_{optionUUID}-labeled-radio-0`). Match the desired answer text against each option's own label (`label[for=optionId]`, falling back to the option's DOM-parent text), then click the matching one — same hidden-input JS-click fallback as checkboxes applies here too.
- **Autocomplete / combobox fields** (e.g. "Which city and country do you intend to work from?") — despite looking like a plain text input, typing into it triggers a location-suggestion dropdown (e.g. "San Francisco, California, United States"). Handled in `form_filler.py` by checking `role="combobox"` or `aria-autocomplete`, waiting briefly for suggestions, then sending `Keys.ARROW_DOWN` followed by `Keys.ENTER` to confirm the selected option.
- **Select (native `<select>`)** — not yet observed on a real Ashby form during this exploration, but `field_mapper`/`form_filler` handle it via `Select().select_by_visible_text()` on the assumption it behaves like a standard HTML select if encountered.

## Required-field detection
Ashby marks required questions with a red `*` next to the label (also frequently exposed as `aria-required="true"` or the HTML `required` attribute on the input itself) — check both, since not every required field consistently sets the DOM attribute.

## Cookie banner / overlays
Ashby's own careers page (`ashbyhq.com/careers`) shows a cookie-consent banner with "Accept All" / "Reject All Non-Essential" buttons before the form is usable; `jobs.ashbyhq.com/{org}/...` pages (the actual ATS-hosted form) did not show one during this exploration, but `ashby.dismiss_overlays()` runs a best-effort dismissal by button text before the field loop regardless, since other orgs' custom careers pages may embed their own banner.

## Verified reference posting
`https://jobs.ashbyhq.com/Ashby/0f538da6-1e06-43f0-86cb-de8007814284/application` — Ashby's own "Junior Design Engineer - Americas" listing, used to derive everything above and to verify the autofill implementation end-to-end. **Never run this module in any mode that would submit** — this is a real, live posting in Ashby's own hiring pipeline.
