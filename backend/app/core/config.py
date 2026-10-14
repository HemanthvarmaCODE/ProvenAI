import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProvenAI"
    SECRET_KEY: str = "provenai-super-secret-jwt-key-change-in-production-2026-secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    AES_KEY_HEX: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    DATABASE_URL: str = "sqlite:///./storage/provenai.db"
    
    STORAGE_DIR: str = "./storage"
    UPLOAD_DIR: str = f"{STORAGE_DIR}/uploads"
    WATERMARKED_DIR: str = f"{STORAGE_DIR}/watermarked"
    KEYS_DIR: str = f"{STORAGE_DIR}/keys"
    ATTACKED_DIR: str = f"{STORAGE_DIR}/attacked"
    
    CORS_ORIGINS: list[str] = ["*"]
    
    WATERMARK_ALPHA: float = 2.0
    ARNOLD_ITERATIONS: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
