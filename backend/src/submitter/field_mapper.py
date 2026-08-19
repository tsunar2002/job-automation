"""
Resolves a custom (non-system) Ashby question's label text to a value from
profile.json. System fields (name/email/resume) are handled separately in
form_filler.py via ashby.system_field_key() since their selectors are fixed.
"""
import re
from dataclasses import dataclass
from typing import Optional

KEYWORD_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"linkedin", re.I), "linkedin_url"),
    (re.compile(r"github", re.I), "github_url"),
    (re.compile(r"portfolio|personal site|personal website", re.I), "portfolio_url"),
    (re.compile(r"phone", re.I), "phone"),
    (re.compile(r"(current(ly)?\s+)?(location|city|based)", re.I), "location"),
]

SPONSORSHIP_PATTERN = re.compile(r"now or in the future.*sponsorship|require.*sponsorship", re.I)
WORK_AUTH_PATTERN = re.compile(r"authorized to work|eligible to work|legally (authorized|permitted) to work", re.I)


@dataclass
class Resolution:
    value: object
    source: str  # "profile-keyword" | "qa_override"


def resolve(label: str, profile) -> Optional[Resolution]:
    normalized = (label or "").strip().lower()
    if not normalized:
        return None

    for keyword, override_value in profile.qa_overrides.items():
        if keyword.lower() in normalized:
            return Resolution(override_value, "qa_override")

    if SPONSORSHIP_PATTERN.search(normalized):
        value = profile.work_authorization.get("requires_sponsorship")
        if value is not None:
            return Resolution(bool(value), "profile-keyword")

    if WORK_AUTH_PATTERN.search(normalized):
        requires_sponsorship = profile.work_authorization.get("requires_sponsorship")
        us_citizen_or_pr = profile.work_authorization.get("us_citizen_or_permanent_resident")
        if requires_sponsorship is not None:
            return Resolution(not bool(requires_sponsorship), "profile-keyword")
        if us_citizen_or_pr is not None:
            return Resolution(bool(us_citizen_or_pr), "profile-keyword")

    for pattern, profile_attr in KEYWORD_RULES:
        if pattern.search(normalized):
            value = getattr(profile, profile_attr, None)
            if value:
                return Resolution(value, "profile-keyword")

    return None
