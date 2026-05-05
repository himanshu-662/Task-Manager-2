import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Body, Depends
from middleware.auth import verify_token
from utils.db import get_db, generate_id, format_doc
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_key_123")

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "member"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

@router.post("/signup")
async def signup(user_data: UserSignup):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hashing with bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), salt).decode('utf-8')
    
    new_user = {
        "_id": generate_id(),
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "role": user_data.role,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    token = create_access_token({
        "id": new_user["_id"], 
        "role": new_user["role"],
        "email": new_user["email"]
    })
    
    return {
        "message": "User created",
        "token": token,
        "user": {
            "id": new_user["_id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "role": new_user["role"]
        }
    }

@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verification with bcrypt
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if credentials.role and user['role'] != credentials.role:
        raise HTTPException(status_code=403, detail="Access denied: Role mismatch")
    
    token = create_access_token({
        "id": user["_id"], 
        "role": user["role"],
        "email": user["email"]
    })
    
    return {
        "token": token,
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.get("/users")
async def list_users(user: dict = Depends(verify_token)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
        
    users_cursor = db.users.find()
    users = await users_cursor.to_list(length=1000)
    return [{"name": u["name"], "email": u["email"], "role": u["role"]} for u in users]
