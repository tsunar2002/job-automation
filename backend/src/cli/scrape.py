import json
import argparse
from typing import List

def run_scraper(source: str):
    if source == "github":
        from backend.src.scrapper.github_jobs import GitHubJobsScraper
        scraper = GitHubJobsScraper()
        jobs = scraper.scrape()
        return jobs
    else:
        print(f"Unsupported source: {source}")
        return []

def main():
    parser = argparse.ArgumentParser(description="Job Discovery Scraper Engine")
    parser.add_argument("--source", type=str, required=True, help="Scraper source (e.g. github)")
    parser.add_argument("--dry-run", action="store_true", help="Save to local JSON file instead of Supabase")
    parser.add_argument("--sync", action="store_true", help="Sync with Supabase to mark missing jobs as CLOSED")
    
    args = parser.parse_args()
    
    print(f"Starting scraper for source: {args.source}")
    jobs = run_scraper(args.source)
    
    if not jobs:
        print("No jobs found or an error occurred.")
        return
        
    print(f"Successfully scraped and normalized {len(jobs)} jobs.")
    
    if args.dry_run:
        # Save to local JSON file
        output_file = "backend/scraped_jobs.json"
        
        # We need to convert JobPosting models to dicts
        jobs_dict_list = [job.model_dump(exclude_none=True, mode="json") for job in jobs]
        
        with open(output_file, "w") as f:
            json.dump(jobs_dict_list, f, indent=2)
        print(f"Dry run complete. Saved jobs to {output_file}.")
    else:
        # Import repository here to avoid loading Supabase in dry run if not needed
        from backend.src.db.repository import insert_job, get_queued_jobs_by_source, update_job_status
        
        success_count = 0
        duplicate_count = 0
        error_count = 0
        
        # Keep track of active URLs for sync
        active_urls = set()
        
        for job in jobs:
            active_urls.add(job.url)
            try:
                result = insert_job(job)
                if result:
                    success_count += 1
                else:
                    duplicate_count += 1
            except Exception as e:
                print(f"Error inserting job {job.url}: {e}")
                error_count += 1
                
        print("\n--- Scraper Run Summary ---")
        print(f"Total Scraped: {len(jobs)}")
        print(f"Successfully Inserted: {success_count}")
        print(f"Skipped Duplicates (Already in DB): {duplicate_count}")
        print(f"Errors: {error_count}")

        # Optional: Sync step to close stale jobs
        if args.sync:
            print(f"\n--- Syncing Stale Jobs for source: {args.source} ---")
            queued_jobs = get_queued_jobs_by_source(args.source)
            stale_count = 0
            for q_job in queued_jobs:
                if q_job.get("url") not in active_urls:
                    try:
                        update_job_status(q_job["id"], "CLOSED", notes="Closed or removed from source")
                        stale_count += 1
                    except Exception as e:
                        print(f"Error closing stale job {q_job.get('url')}: {e}")
            print(f"Closed {stale_count} stale jobs that are no longer active.")

if __name__ == "__main__":
    main()
