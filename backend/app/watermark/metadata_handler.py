import json
import uuid
import hashlib
from datetime import datetime, timezone
from ..core.security import cipher
from .watermark_generator import generate_qr_watermark
import numpy as np

class MetadataHandler:
    @staticmethod
    def create_metadata(owner_name: str, user_id: int, ai_model: str, prompt_id: str, image_data_bytes: bytes) -> dict:
        return {
            "owner_name": owner_name,
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ai_model": ai_model,
            "prompt_id": prompt_id,
            "image_uuid": str(uuid.uuid4()),
            "sha256_hash": hashlib.sha256(image_data_bytes).hexdigest(),
            "random_uuid": str(uuid.uuid4())
        }

    @staticmethod
    def encrypt_metadata(metadata_dict: dict) -> str:
        json_str = json.dumps(metadata_dict)
        return cipher.encrypt(json_str)

    @staticmethod
    def decrypt_metadata(encrypted: str) -> dict:
        json_str = cipher.decrypt(encrypted)
        return json.loads(json_str)

    @staticmethod
    def metadata_to_qr(data, size: int = 128) -> np.ndarray:
        if isinstance(data, str):
            encrypted = data
        else:
            encrypted = MetadataHandler.encrypt_metadata(data)
        return generate_qr_watermark(encrypted, size)
