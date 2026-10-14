import uuid
import hashlib
import os

def generate_uuid() -> str:
    return str(uuid.uuid4())

def compute_sha256(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def allowed_file(filename: str) -> bool:
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    ext = get_file_extension(filename)
    return ext in allowed_extensions

def get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()
