"""
Ashby autofill entry point (dry-run only — this phase never clicks submit).

Usage:
    1. Edit APPLICATION_URL below to a real Ashby job application URL.
    2. cp backend/config/profile.json.example backend/config/profile.json and fill it in.
    3. python -m backend.src.submitter.main [--headful]
"""
import argparse
import datetime as dt
import json
import os
import sys

from . import browser, form_filler
from .logging_utils import build_logger
from .profile import load_profile

# Edit this before running — the URL of the specific Ashby job's application page,
# e.g. https://jobs.ashbyhq.com/{orgSlug}/{jobId}/application
APPLICATION_URL = "https://jobs.ashbyhq.com/revel/014c6445-bf8c-4213-ad97-faa83d129199/application?embed=true&utm_source=Simplify&ref=Simplify"

MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(MODULE_DIR))
PROFILE_PATH = os.path.join(BACKEND_DIR, "config", "profile.json")
RUNS_DIR = os.path.join(MODULE_DIR, "runs")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Autofill an Ashby job application form. Dry-run only: fills fields, "
        "screenshots the result, and logs everything, but never clicks submit."
    )
    parser.add_argument(
        "--headful",
        action="store_true",
        help="Show the browser window (default is headless).",
    )
    return parser.parse_args()


def _job_id_from_url(url: str) -> str:
    parts = [p for p in url.rstrip("/").split("/") if p]
    if parts and parts[-1] == "application" and len(parts) >= 2:
        return parts[-2]
    return parts[-1] if parts else "unknown-job"


def main() -> int:
    args = parse_args()

    if not APPLICATION_URL or APPLICATION_URL.startswith("<PASTE_"):
        print(
            "Set APPLICATION_URL at the top of backend/src/submitter/main.py to a real "
            "Ashby job application URL before running.",
            file=sys.stderr,
        )
        return 2

    if not os.path.exists(PROFILE_PATH):
        print(
            f"Missing {PROFILE_PATH}. Copy backend/config/profile.json.example to "
            "backend/config/profile.json and fill it in first.",
            file=sys.stderr,
        )
        return 2

    profile = load_profile(PROFILE_PATH)

    timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    job_id = _job_id_from_url(APPLICATION_URL)
    run_dir = os.path.join(RUNS_DIR, f"{timestamp}__{job_id}")
    os.makedirs(run_dir, exist_ok=True)

    logger = build_logger(os.path.join(run_dir, "run.log"))

    driver = browser.build_driver(headless=not args.headful)
    try:
        logger.info("Navigating to %s", APPLICATION_URL)
        driver.get(APPLICATION_URL)

        result = form_filler.fill_form(driver, profile, logger)

        screenshot_path = os.path.join(run_dir, "form_filled.png")
        driver.save_screenshot(screenshot_path)

        run_log_path = os.path.join(run_dir, "run_log.json")
        with open(run_log_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "url": APPLICATION_URL,
                    "final_url": driver.current_url,
                    "manual_review": result.manual_review,
                    "fields": result.field_results,
                },
                f,
                indent=2,
            )

        logger.info(
            "Run complete. manual_review=%s. Artifacts written to %s",
            result.manual_review,
            run_dir,
        )
        return 1 if result.manual_review else 0
    finally:
        input('Press enter to close the browser...')
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
