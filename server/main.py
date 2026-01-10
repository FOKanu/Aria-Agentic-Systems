"""
ARIA Sidecar - Local Agent Runtime Server
Created by Francis Okorie Iyeke-Kanu

This FastAPI server provides secure access to terminal commands and file system
operations, bridging the browser sandbox gap for ARIA agents.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import terminal, filesystem

# Initialize FastAPI app
app = FastAPI(
    title="ARIA Sidecar",
    description="Local Agent Runtime for ARIA Command Center",
    version="0.1.0"
)

# Configure CORS - Only allow localhost:5173 (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",   # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(terminal.router)
app.include_router(filesystem.router)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return JSONResponse({
        "status": "ok",
        "version": "0.1.0",
        "service": "ARIA Sidecar"
    })


@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse({
        "message": "ARIA Sidecar is running",
        "version": "0.1.0",
        "endpoints": {
            "health": "/health"
        }
    })


if __name__ == "__main__":
    # Bind to 127.0.0.1 ONLY (never 0.0.0.0 for security)
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True  # Auto-reload on code changes (dev mode)
    )
