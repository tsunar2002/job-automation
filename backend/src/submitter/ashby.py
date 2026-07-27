"""
Ashby-specific DOM knowledge (jobs.ashbyhq.com). Single concrete module for now —
there's only one ATS target in this phase, so no strategy/base-class abstraction
yet. See backend/.agents/skills/ashby/SKILL.md for the full write-up of how this
was derived from a live Ashby form.
"""
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By

FORM_CONTAINER_SELECTOR = ".ashby-application-form-container"
FIELD_ENTRY_SELECTOR = ".ashby-application-form-field-entry"

# System fields carry fixed name/id attributes on every Ashby posting.
SYSTEM_FIELD_NAME_ATTR = {
    "_systemfield_name": "name",
    "_systemfield_email": "email",
}
SYSTEM_FIELD_ID_ATTR = {
    "_systemfield_resume": "resume",
}

COOKIE_BANNER_BUTTON_TEXTS = [
    "Reject All Non-Essential",
    "Reject all",
    "Reject All",
    "Accept All",
    "Accept all",
    "Close",
    "Dismiss",
]


def system_field_key(inputs) -> str | None:
    for inp in inputs:
        name = inp.get_attribute("name") or ""
        if name in SYSTEM_FIELD_NAME_ATTR:
            return SYSTEM_FIELD_NAME_ATTR[name]
        input_id = inp.get_attribute("id") or ""
        if input_id in SYSTEM_FIELD_ID_ATTR:
            return SYSTEM_FIELD_ID_ATTR[input_id]
    return None


def get_label_text(entry) -> str:
    for selector in ("label", "legend", '[class*="_label_"]'):
        try:
            el = entry.find_element(By.CSS_SELECTOR, selector)
            text = el.text.strip()
            if text:
                return text.split("\n")[0]
        except NoSuchElementException:
            continue
    return ""


def get_inputs(entry):
    return entry.find_elements(By.CSS_SELECTOR, "input, select, textarea")


def is_required(entry, inputs) -> bool:
    for inp in inputs:
        if inp.get_attribute("required"):
            return True
        if (inp.get_attribute("aria-required") or "").lower() == "true":
            return True
    try:
        entry.find_element(By.XPATH, './/*[contains(normalize-space(text()), "*")]')
        return True
    except NoSuchElementException:
        return False


def dismiss_overlays(driver) -> None:
    """Best-effort cookie-banner/overlay dismissal. Never fatal — a missing banner is the common case."""
    for text in COOKIE_BANNER_BUTTON_TEXTS:
        try:
            btn = driver.find_element(By.XPATH, f'//button[contains(., "{text}")]')
            if btn.is_displayed():
                btn.click()
                return
        except NoSuchElementException:
            continue
        except Exception:
            continue
