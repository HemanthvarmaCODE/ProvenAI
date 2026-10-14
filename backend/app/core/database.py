import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.WATERMARKED_DIR, exist_ok=True)
    os.makedirs(settings.KEYS_DIR, exist_ok=True)
    os.makedirs(settings.ATTACKED_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
