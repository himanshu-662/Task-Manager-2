from fastapi import APIRouter, Depends, HTTPException, Body
from utils.db import get_db, generate_id, format_doc
from middleware.auth import verify_token
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_project(data: dict = Body(...), user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create projects")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    try:
        new_project = {
            **data,
            "_id": generate_id(),
            "createdAt": datetime.utcnow().isoformat(),
            "createdBy": user.get("email")
        }
        await db.projects.insert_one(new_project)
        return format_doc(new_project)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")

@router.get("/")
async def get_projects(user: dict = Depends(verify_token)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    projects_cursor = db.projects.find()
    projects = await projects_cursor.to_list(length=1000)
    return [format_doc(p) for p in projects]
