import re
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from backend.src.db.models import JobPosting
from backend.src.scrapper.base_scraper import BaseScraper
from backend.src.scrapper.normalizer import normalize_job

class GitHubJobsScraper(BaseScraper):
    source_name = "github"
    
    def __init__(self, repo_url: str = "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md"):
        self.repo_url = repo_url

    def fetch_raw_jobs(self) -> List[Dict[str, Any]]:
        print(f"Fetching GitHub jobs from {self.repo_url}...")
        try:
            response = self.safe_fetch(self.repo_url, base_delay=2.0)
            if not response:
                print(f"Failed to fetch GitHub jobs (Network/HTTP error).")
                return []
            content = response.text
        except Exception as e:
            print(f"Failed to fetch GitHub jobs: {e}")
            return []

        raw_jobs = []
        soup = BeautifulSoup(content, 'html.parser')
        
        # In this repo, they use HTML tables in the markdown
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            # Skip the header row (usually contains th)
            for row in rows:
                cols = row.find_all(['td', 'th'])
                if not cols or len(cols) < 4:
                    continue
                
                # Check if this is a header row
                if cols[0].name == 'th':
                    continue
                    
                company_col = cols[0]
                role_col = cols[1]
                location_col = cols[2]
                apply_col = cols[3]
                
                # Handle nested rows (like '↳' for same company)
                company_text = company_col.get_text(strip=True)
                if company_text == '↳' and raw_jobs:
                    # Inherit company from the last parsed job
                    company_name = raw_jobs[-1]["raw_company"]
                else:
                    company_name = company_text
                
                role_text = role_col.get_text(strip=True)
                location_text = location_col.get_text(strip=True)
                
                # Find all links in the application column
                links = apply_col.find_all('a')
                url = ""
                # They often have a direct apply link and a simplify link
                # We want the direct apply link if possible, or any valid link
                for link in links:
                    href = link.get('href', '')
                    if href and 'simplify.jobs/p/' not in href: # Try to get the original apply link first
                        url = href
                        break
                
                # If no original apply link, fallback to the first link we found
                if not url and links:
                    url = links[0].get('href', '')
                    
                apply_text = apply_col.get_text(strip=True).lower()
                
                # Skip closed roles
                if not url or "closed" in apply_text or "🔒" in apply_text:
                    continue

                raw_jobs.append({
                    "raw_title": role_text,
                    "raw_company": company_name,
                    "raw_location": location_text,
                    "raw_url": url,
                    "source": self.source_name,
                    "raw_description": None
                })
                
        print(f"Found {len(raw_jobs)} raw job listings in the Markdown file.")
        return raw_jobs

    def scrape(self) -> List[JobPosting]:
        raw_jobs = self.fetch_raw_jobs()
        normalized_jobs = []
        for rj in raw_jobs:
            try:
                job = normalize_job(rj)
                normalized_jobs.append(job)
            except Exception as e:
                print(f"Failed to normalize job {rj.get('raw_url')}: {e}")
        return normalized_jobs
