from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original_filename = Column(String)
    file_path = Column(String)
    watermarked_path = Column(String)
    keys_path = Column(String)
    metadata_encrypted = Column(Text)
    sha256_hash = Column(String)
    image_uuid = Column(String, unique=True, index=True)
    owner_name = Column(String)
    ai_model = Column(String)
    prompt_id = Column(String)
    psnr = Column(Float)
    ssim = Column(Float)
    embedding_time = Column(Float)
    extraction_time = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    is_authentic = Column(Boolean)
    is_tampered = Column(Boolean)
    confidence_score = Column(Float)
    nc_score = Column(Float)
    ber_score = Column(Float)
    extracted_owner = Column(String)
    extracted_model = Column(String)
    extracted_prompt_id = Column(String)
    extracted_image_id = Column(String)
    extracted_timestamp = Column(String)
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

class AttackLog(Base):
    __tablename__ = "attack_logs"
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    attack_type = Column(String)
    attack_params = Column(String)
    nc_after = Column(Float)
    ber_after = Column(Float)
    psnr_after = Column(Float)
    ssim_after = Column(Float)
    watermark_survived = Column(Boolean)
    attacked_image_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
