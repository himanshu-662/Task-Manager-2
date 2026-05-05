from fastapi import APIRouter, Depends, HTTPException, Body
from utils.db import get_db, generate_id, format_doc
from middleware.auth import verify_token
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_task(data: dict = Body(...), user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create tasks")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    try:
        new_task = {
            **data,
            "_id": generate_id(),
            "createdAt": datetime.utcnow().isoformat(),
            "status": data.get("status", "pending"),
            "qualityScore": None
        }
        await db.tasks.insert_one(new_task)
        return format_doc(new_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")

@router.get("/")
async def get_tasks(user: dict = Depends(verify_token)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    user_email = user.get("email")
    user_role = user.get("role")
    
    query = {}
    if user_role == "member":
        query["assignedTo"] = user_email
        
    tasks_cursor = db.tasks.find(query)
    tasks = await tasks_cursor.to_list(length=1000)
    
    populated_tasks = []
    for task in tasks:
        # Populate project info
        project_id = task.get('projectId')
        project = None
        if project_id:
            project = await db.projects.find_one({"_id": project_id})
        
        task_copy = format_doc(task)
        if project:
            task_copy['projectId'] = {"_id": project['_id'], "name": project['name']}
        populated_tasks.append(task_copy)
        
    return populated_tasks

@router.put("/{task_id}")
async def update_task(task_id: str, data: dict = Body(...), user: dict = Depends(verify_token)):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    task = await db.tasks.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    user_role = user.get("role")
    user_email = user.get("email")

    # Member restrictions
    if user_role == "member":
        if task.get("assignedTo") != user_email:
            raise HTTPException(status_code=403, detail="You can only update your own tasks")
        
        # Members can ONLY update status
        allowed_keys = {"status"}
        if not set(data.keys()).issubset(allowed_keys):
            raise HTTPException(status_code=403, detail="Members can only update task status")

    # Admin can update everything including qualityScore
    await db.tasks.update_one({"_id": task_id}, {"$set": data})
    
    updated_task = await db.tasks.find_one({"_id": task_id})
    return format_doc(updated_task)
