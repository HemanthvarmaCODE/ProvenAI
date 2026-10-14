import bcrypt
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from .config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

class AES256GCMCipher:
    def __init__(self, key_hex: str):
        self.key = bytes.fromhex(key_hex)
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, plaintext: str, nonce: bytes = None) -> str:
        if nonce is None:
            import hashlib
            nonce = hashlib.sha256(plaintext.encode('utf-8')).digest()[:12]
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        return base64.b64encode(nonce + ciphertext).decode('utf-8')

    def decrypt(self, ciphertext_b64: str) -> str:
        data = base64.b64decode(ciphertext_b64)
        nonce = data[:12]
        ciphertext = data[12:]
        plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')

cipher = AES256GCMCipher(settings.AES_KEY_HEX)
