import time
import random
import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from backend.src.db.models import JobPosting

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15"
]

class BaseScraper(ABC):
    """
    Abstract base class for all job scrapers.
    Enforces minimum request delays, jitter, rotating UAs, and exponential backoff.
    """
    source_name: str = "unknown"

    def get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        }

    def safe_fetch(self, url: str, base_delay: float = 2.0) -> Optional[httpx.Response]:
        """
        Fetches a URL with a randomized jitter delay and rotating headers.
        Implements exponential backoff (5s, 10s, 20s) for 429 and 503 errors.
        """
        jitter = random.uniform(0.5, 2.0)
        time.sleep(base_delay + jitter)
        
        backoff_delays = [5.0, 10.0, 20.0]
        
        for attempt in range(len(backoff_delays) + 1):
            try:
                response = httpx.get(url, headers=self.get_headers(), timeout=15.0)
                
                if response.status_code in [429, 503]:
                    if attempt < len(backoff_delays):
                        wait_time = backoff_delays[attempt]
                        print(f"⚠️ Received {response.status_code} for {url}. Backing off for {wait_time}s (Attempt {attempt+1})")
                        time.sleep(wait_time)
                        continue
                    else:
                        print(f"❌ Max retries reached for {url} due to {response.status_code}.")
                        return None
                        
                response.raise_for_status()
                return response
                
            except httpx.RequestError as e:
                print(f"❌ Network error while fetching {url}: {e}")
                return None
            except httpx.HTTPStatusError as e:
                print(f"❌ HTTP error while fetching {url}: {e.response.status_code}")
                return None
                
        return None

    @abstractmethod
    def fetch_raw_jobs(self) -> List[Dict[str, Any]]:
        """
        Extracts raw job data from the source.
        """
        pass

    @abstractmethod
    def scrape(self) -> List[JobPosting]:
        """
        Coordinates the scraping and normalization process.
        Returns a list of normalized JobPosting objects.
        """
        pass
