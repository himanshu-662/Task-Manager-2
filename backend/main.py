import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

import sys
# Ensure current directory is in path for imports to work on Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes import auth, project, task

app = FastAPI(redirect_slashes=False)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(project.router, prefix="/api/project", tags=["projects"])
app.include_router(task.router, prefix="/api/task", tags=["tasks"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "environment": "vercel" if os.getenv("VERCEL") else "local"}

from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "message": "An internal server error occurred"
        }
    )

# Static files and catch-all for SPA
BUILD_DIR = os.path.join(os.path.dirname(__file__), "../frontend/build")

if os.path.exists(BUILD_DIR):
    # Mount static files (assets, etc.)
    # Note: We don't mount the root as static because it interferes with the catch-all
    # Instead, we serve specific directories if they exist, or use a more specific mounting
    # However, usually just serving everything and having the catch-all works if ordered correctly.
    
    @app.get("/{rest_of_path:path}")
    async def serve_spa(request: Request, rest_of_path: str):
        # Check if the requested path is a file in the build directory
        file_path = os.path.join(BUILD_DIR, rest_of_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html (SPA routing)
        index_path = os.path.join(BUILD_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend build not found"}
else:
    @app.get("/")
    async def root():
        return {"message": "FastAPI backend is running. Frontend build folder not found."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    uvicorn.run(app, host="0.0.0.0", port=port)
