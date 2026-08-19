import sys
from datetime import datetime
from backend.src.db.client import get_supabase_client
from backend.src.db.models import JobPosting

def test_connection_insert_and_cleanup():
    print("🔌 Connecting to Supabase database...")
    client = get_supabase_client()
    
    # 1. Create a dummy test job posting model
    dummy_job = JobPosting(
        title="Test Software Engineer Intern",
        company="Antigravity Test Co",
        location="Remote",
        url="https://example.com/jobs/test-dummy-job-001",
        source="github",
        status="QUEUED",
        notes=f"Inserted via test_db_connection.py at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    
    print(f"📝 1. Inserting dummy job: '{dummy_job.title}'...")
    
    # 2. Insert/upsert into Supabase 'jobs' table
    job_payload = dummy_job.model_dump(exclude_none=True)
    insert_res = client.table("jobs").upsert(job_payload, on_conflict="url").execute()
    
    row = insert_res.data[0] if (insert_res.data and len(insert_res.data) > 0) else None
    if not isinstance(row, dict):
        print("❌ FAILED: Unable to insert dummy job into Supabase.")
        sys.exit(1)
        
    inserted_id = row.get("id")
    print(f"✅ 2. Dummy job inserted successfully (ID: {inserted_id}).")
    
    # 3. Clean up — Delete the dummy job row
    print("🧹 3. Cleaning up: Deleting dummy test row from Supabase...")
    delete_res = client.table("jobs").delete().eq("url", dummy_job.url).execute()
    
    if delete_res.data:
        print("✅ 4. SUCCESS! Dummy test row deleted. Your Supabase table is clean!")
        print("─" * 50)
    else:
        print("⚠️ Warning: Delete query completed, but no rows returned.")

if __name__ == "__main__":
    test_connection_insert_and_cleanup()
