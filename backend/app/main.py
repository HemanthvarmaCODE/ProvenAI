from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import time
from fastapi.requests import Request
from .core.config import settings
from .core.database import init_db
from .api.auth import router as auth_router
from .api.images import router as images_router
from .api.attacks import router as attacks_router
from .api.dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Image Provenance Verification Using Invisible Digital Watermarking",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(auth_router, prefix="/api", tags=["Auth"])
app.include_router(images_router, prefix="/api", tags=["Images"])
app.include_router(attacks_router, prefix="/api", tags=["Attacks"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])

# Serve uploaded and watermarked images as static files
for dir_name, dir_path in [("uploads", settings.UPLOAD_DIR), ("watermarked", settings.WATERMARKED_DIR), ("attacked", settings.ATTACKED_DIR)]:
    os.makedirs(dir_path, exist_ok=True)
    app.mount(f"/static/{dir_name}", StaticFiles(directory=dir_path), name=dir_name)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
