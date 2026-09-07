import os
import uuid
import hashlib
from typing import BinaryIO, Tuple
from pathlib import Path
from app.storage.base import FileStorage
from app.core.config import settings
from app.core.errors import FileValidationException


class LocalFileStorage(FileStorage):
    """Local filesystem storage with path traversal protection and secure hashing."""

    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str, int, str]:
        # Extract and validate extension
        ext = Path(original_filename).suffix.lower()
        allowed_extensions = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".webp"]
        if ext not in allowed_extensions:
            raise FileValidationException(
                f"Unsupported file extension '{ext}'. Permitted formats: .pdf, .docx, .doc, .png, .jpg, .jpeg, .webp."
            )

        # Generate non-guessable, secure unique filename
        secure_filename = f"{uuid.uuid4()}{ext}"
        target_path = (self.base_dir / secure_filename).resolve()

        # Path traversal guard
        if not str(target_path).startswith(str(self.base_dir)):
            raise FileValidationException("Invalid file destination path traversal detected.")

        hasher = hashlib.sha256()
        file_size = 0

        # Reset pointer if possible
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)

        with open(target_path, "wb") as out_f:
            while chunk := file_obj.read(64 * 1024):
                file_size += len(chunk)
                if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
                    out_f.close()
                    target_path.unlink(missing_ok=True)
                    raise FileValidationException(
                        f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024):.1f} MB."
                    )
                hasher.update(chunk)
                out_f.write(chunk)

        sha256_hash = hasher.hexdigest()
        return str(target_path), secure_filename, file_size, sha256_hash

    def get_file_bytes(self, stored_path: str) -> bytes:
        target_path = Path(stored_path).resolve()
        if not str(target_path).startswith(str(self.base_dir)) or not target_path.exists():
            raise FileValidationException("Stored file could not be found or path is invalid.")
        with open(target_path, "rb") as f:
            return f.read()

    def delete_file(self, stored_path: str) -> bool:
        try:
            target_path = Path(stored_path).resolve()
            if target_path.exists() and str(target_path).startswith(str(self.base_dir)):
                target_path.unlink()
                return True
            return False
        except Exception:
            return False
