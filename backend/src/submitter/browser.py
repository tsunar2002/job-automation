from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


def build_driver(headless: bool = True) -> webdriver.Chrome:
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1200")
    options.add_argument("--disable-gpu")
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)
