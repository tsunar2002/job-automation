import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """Returns a singleton Supabase client instance."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                f"Missing SUPABASE_URL or SUPABASE_KEY in {env_path}. "
                "Please configure them in your backend/.env file."
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client
