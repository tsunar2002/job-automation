# Ashby Job Application Automation

## Project Overview
An automated job application bot built with Python and Selenium. The primary goal is to streamline and automate submitting applications to job postings hosted on the Ashby ATS platform (`ashbyhq.com`).

## Setup & Execution
- **Environment setup:** `python -m venv venv && source venv/bin/activate`
- **Install dependencies:** `pip install -r requirements.txt`
- **Run main script:** `python main.py`

## Architecture & Code Conventions
- **Language/Libraries:** Python 3.10+, Selenium, `webdriver-manager` for dynamic driver handling.
- **Selector Strategy:** Prefer `By.CSS_SELECTOR` or explicit XPath matching Ashby's standard form field attributes (`name`, `id`, `aria-*`).
- **Wait Strategy:** Always use explicit waits (`WebDriverWait` with `expected_conditions`) rather than implicit sleeps (`time.sleep`) to handle dynamic React/DOM re-renders.
- **Error Handling:** Wrap form inputs in try-except blocks to catch missing or non-standard dynamic fields gracefully without halting execution.

## Planned Milestones
1. Parse job application details and local resume/profile configs.
2. Automate form field population on standard Ashby form layouts.
3. Implement dry-run mode (fills out form without clicking the final submit button).