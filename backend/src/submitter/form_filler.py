"""
Autofill-only loop for Ashby application forms: perception -> field mapping ->
action -> self-correction. There is no submit step in this phase — the submit
button is never located or clicked.
"""
import time
from dataclasses import dataclass, field

from selenium.common.exceptions import ElementNotInteractableException, NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait

from . import ashby, field_mapper

FORM_LOAD_TIMEOUT_SECONDS = 20


@dataclass
class FillResult:
    field_results: list = field(default_factory=list)
    manual_review: bool = False


def fill_form(driver, profile, logger) -> FillResult:
    wait = WebDriverWait(driver, FORM_LOAD_TIMEOUT_SECONDS)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ashby.FORM_CONTAINER_SELECTOR)))
    ashby.dismiss_overlays(driver)

    entries = driver.find_elements(By.CSS_SELECTOR, ashby.FIELD_ENTRY_SELECTOR)
    result = FillResult()

    for entry in entries:
        label = ashby.get_label_text(entry)
        inputs = ashby.get_inputs(entry)
        if not inputs:
            continue

        try:
            _fill_entry(driver, entry, inputs, label, profile, logger, result)
        except Exception as exc:  # noqa: BLE001 - one bad field must never abort the run
            logger.warning("Failed to fill field %r: %s", label, exc)
            result.field_results.append(_record(label, "error", False, error=str(exc)))
            result.manual_review = True

    return result


def _fill_entry(driver, entry, inputs, label, profile, logger, result: FillResult) -> None:
    system_key = ashby.system_field_key(inputs)

    if system_key == "name":
        _fill_text(inputs[0], profile.full_name)
        result.field_results.append(_record(label, "system", True))
        return

    if system_key == "email":
        _fill_text(inputs[0], profile.email)
        result.field_results.append(_record(label, "system", True))
        return

    if system_key == "resume":
        if profile.resume_abspath:
            _fill_file(inputs[0], profile.resume_abspath)
            result.field_results.append(_record(label, "system", True))
        else:
            logger.warning("No resume_path configured in profile.json; leaving resume field empty.")
            result.field_results.append(_record(label, "system", False, error="no resume_path in profile"))
            result.manual_review = True
        return

    resolution = field_mapper.resolve(label, profile)
    if resolution is None:
        required = ashby.is_required(entry, inputs)
        result.field_results.append(_record(label, "unmapped", False, required=required))
        if required:
            result.manual_review = True
            logger.warning("UNMAPPED_REQUIRED_FIELD: %s", label)
        else:
            logger.info("Skipping optional unmapped field: %s", label)
        return

    filled = _fill_value(driver, inputs, resolution.value)
    if filled:
        result.field_results.append(_record(label, resolution.source, True))
    else:
        required = ashby.is_required(entry, inputs)
        result.field_results.append(_record(label, resolution.source, False, required=required))
        if required:
            result.manual_review = True
            logger.warning("Matched field but could not fill it (no option matched value): %s", label)


def _fill_text(input_el, value: str) -> None:
    input_el.clear()
    input_el.send_keys(value)


def _fill_file(input_el, abspath: str) -> None:
    input_el.send_keys(abspath)


def _fill_value(driver, inputs, value) -> bool:
    typed_inputs = [(inp, (inp.get_attribute("type") or "").lower(), inp.tag_name.lower()) for inp in inputs]

    radios = [inp for inp, input_type, _tag in typed_inputs if input_type == "radio"]
    if radios:
        target = str(value).strip().lower()
        for inp in radios:
            option_label = _option_label(driver, inp).strip().lower()
            if option_label and target in option_label:
                if not inp.is_selected():
                    _click(driver, inp)
                return True
        return False

    for inp, input_type, tag in typed_inputs:
        if tag == "select":
            Select(inp).select_by_visible_text(str(value))
            return True
        if tag == "textarea" or input_type in ("text", "email", "tel", "url", ""):
            inp.clear()
            inp.send_keys(str(value))
            role = (inp.get_attribute("role") or "").lower()
            aria_autocomplete = (inp.get_attribute("aria-autocomplete") or "").lower()
            if role == "combobox" or aria_autocomplete:
                time.sleep(0.5)
                inp.send_keys(Keys.ARROW_DOWN)
                inp.send_keys(Keys.ENTER)
            return True
        if input_type == "checkbox":
            desired = bool(value)
            if inp.is_selected() != desired:
                _click(driver, inp)
            return True

    return False


def _click(driver, element) -> None:
    """Click, falling back to a JS click for elements Ashby keeps visually hidden
    behind a custom-styled toggle (real checkbox/radio underneath isn't directly
    interactable, but is still the source of truth for form submission)."""
    try:
        element.click()
    except ElementNotInteractableException:
        driver.execute_script("arguments[0].click();", element)


def _option_label(driver, input_el) -> str:
    input_id = input_el.get_attribute("id")
    if input_id:
        try:
            label_el = driver.find_element(By.CSS_SELECTOR, f'label[for="{input_id}"]')
            text = label_el.text.strip()
            if text:
                return text
        except NoSuchElementException:
            pass
    try:
        parent = input_el.find_element(By.XPATH, "./..")
        return parent.text.strip()
    except NoSuchElementException:
        return ""


def _record(label, source, filled, required=False, error=None) -> dict:
    record = {"label": label, "source": source, "filled": filled, "required": required}
    if error:
        record["error"] = error
    return record
