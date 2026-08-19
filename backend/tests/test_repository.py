import sys
from datetime import datetime
from backend.src.db.models import JobPosting
from backend.src.db import repository

TEST_URL = "https://example.com/jobs/test-repo-job-999"

def test_repository_lifecycle():
    print("🧪 Starting repository module integration test...")
    
    # 0. Ensure clean state before testing
    repository.delete_job_by_url(TEST_URL)

    # 1. Test insert_job
    dummy_job = JobPosting(
        title="Backend Engineering Intern",
        company="Antigravity Repositories Inc",
        location="San Francisco, CA",
        url=TEST_URL,
        source="github",
        status="QUEUED",
        notes="Repo test initial insertion"
    )
    
    print(f"📝 1. Inserting test job: '{dummy_job.title}'...")
    inserted_row = repository.insert_job(dummy_job)
    if not inserted_row:
        print("❌ FAILED: insert_job returned None.")
        sys.exit(1)
        
    job_id = inserted_row["id"]
    print(f"✅ 1. Job inserted successfully (ID: {job_id})")

    # 2. Test get_job_by_url
    print("🔍 2. Testing get_job_by_url...")
    fetched_by_url = repository.get_job_by_url(TEST_URL)
    if not fetched_by_url or fetched_by_url["id"] != job_id:
        print("❌ FAILED: get_job_by_url failed or returned mismatched ID.")
        sys.exit(1)
    print("✅ 2. get_job_by_url returned matching record.")

    # 3. Test get_job_by_id
    print("🔍 3. Testing get_job_by_id...")
    fetched_by_id = repository.get_job_by_id(job_id)
    if not fetched_by_id or fetched_by_id["url"] != TEST_URL:
        print("❌ FAILED: get_job_by_id failed.")
        sys.exit(1)
    print("✅ 3. get_job_by_id returned matching record.")

    # 4. Test duplicate insert (should return None)
    print("⚠️ 4. Testing duplicate insertion constraint...")
    duplicate_res = repository.insert_job(dummy_job)
    if duplicate_res is not None:
        print("❌ FAILED: Duplicate insertion should have returned None.")
        sys.exit(1)
    print("✅ 4. Duplicate insertion correctly rejected.")

    # 5. Test update_job
    print("✏️ 5. Testing update_job...")
    updated_row = repository.update_job(job_id, {"notes": "Updated notes via repository test"})
    if not updated_row or updated_row["notes"] != "Updated notes via repository test":
        print("❌ FAILED: update_job did not update notes.")
        sys.exit(1)
    print("✅ 5. update_job succeeded.")

    # 6. Test update_job_status (APPLIED)
    print("🔄 6. Testing update_job_status to APPLIED...")
    status_row = repository.update_job_status(job_id, "APPLIED", notes="Successfully submitted application")
    if not status_row or status_row["status"] != "APPLIED" or not status_row.get("applied_at"):
        print("❌ FAILED: update_job_status did not update status or set applied_at timestamp.")
        sys.exit(1)
    print(f"✅ 6. update_job_status succeeded (applied_at: {status_row['applied_at']}).")

    # 7. Test get_job_stats
    print("📊 7. Testing get_job_stats...")
    stats = repository.get_job_stats()
    if not isinstance(stats, dict) or stats.get("APPLIED", 0) < 1:
        print("❌ FAILED: get_job_stats failed.")
        sys.exit(1)
    print(f"✅ 7. get_job_stats returned: {stats}")

    # 8. Clean up — Test delete_job_by_url
    print("🧹 8. Cleaning up test record...")
    deleted = repository.delete_job_by_url(TEST_URL)
    if not deleted:
        print("❌ FAILED: delete_job_by_url failed.")
        sys.exit(1)
    print("✅ 8. Cleanup successful! All repository tests passed! 🎉")

if __name__ == "__main__":
    test_repository_lifecycle()
