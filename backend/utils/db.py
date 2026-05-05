import os
import uuid
import time
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL") or os.getenv("MONGODB_URL")
DB_NAME = "task_manager"

# Initialize MongoDB client
# Note: In a production serverless environment, you might want to initialize this 
# outside the request handler to reuse the connection.
client = None

def get_db():
    global client
    if client is None:
        uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URL") or os.getenv("MONGODB_URL")
        if not uri:
            # We don't raise an error here so the app can at least start,
            # but DB operations will fail.
            print("CRITICAL: MONGODB_URI environment variable is not set.")
            return None
        client = AsyncIOMotorClient(uri)
    return client[DB_NAME]

def generate_id():
    # Keep the same ID generation logic for consistency
    random_part = uuid.uuid4().hex[:9]
    timestamp_part = hex(int(time.time() * 1000))[2:]
    return f"{random_part}{timestamp_part}"

# Helper to convert MongoDB document to frontend-friendly format
def format_doc(doc):
    if not doc:
        return None
    # If the document has _id, ensure it's a string
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# Legacy functions - these are now discouraged in favor of direct MongoDB queries
# but kept as stubs if needed for transition.
async def read_db_legacy():
    db = get_db()
    if db is None: return {"users": [], "projects": [], "tasks": []}
    
    users = await db.users.find().to_list(1000)
    projects = await db.projects.find().to_list(1000)
    tasks = await db.tasks.find().to_list(1000)
    
    return {
        "users": [format_doc(u) for u in users],
        "projects": [format_doc(p) for p in projects],
        "tasks": [format_doc(t) for t in tasks]
    }
