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
@router.put("/{project_id}")
async def update_project(project_id: str, data: dict = Body(...), user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update projects")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    project = await db.projects.find_one({"_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await db.projects.update_one({"_id": project_id}, {"$set": data})
    
    updated_project = await db.projects.find_one({"_id": project_id})
    return format_doc(updated_project)
@router.delete("/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete projects")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    # Delete the project
    result = await db.projects.delete_one({"_id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Cascading delete tasks associated with this project
    await db.tasks.delete_many({"projectId": project_id})
    
    return {"message": "Project and associated tasks deleted successfully"}
