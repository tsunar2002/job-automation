import json
import os
from dataclasses import dataclass, field


@dataclass
class Profile:
    first_name: str
    last_name: str
    email: str
    phone: str
    location: str
    linkedin_url: str
    github_url: str
    portfolio_url: str
    resume_abspath: str
    work_authorization: dict
    qa_overrides: dict = field(default_factory=dict)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


def load_profile(profile_path: str) -> Profile:
    with open(profile_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    resume_path = data.get("resume_path", "")
    if resume_path and not os.path.isabs(resume_path):
        # resume_path in profile.json is relative to backend/ (profile.json lives at backend/config/profile.json)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(profile_path)))
        resume_path = os.path.normpath(os.path.join(backend_dir, resume_path))

    return Profile(
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        email=data.get("email", ""),
        phone=data.get("phone", ""),
        location=data.get("location", ""),
        linkedin_url=data.get("linkedin_url", ""),
        github_url=data.get("github_url", ""),
        portfolio_url=data.get("portfolio_url", ""),
        resume_abspath=resume_path,
        work_authorization=data.get("work_authorization", {}),
        qa_overrides=data.get("qa_overrides", {}),
    )
