from abc import ABC, abstractmethod
from typing import BinaryIO, Tuple


class FileStorage(ABC):
    """Abstract file storage interface allowing local or S3 backends."""

    @abstractmethod
    def save_file(self, file_obj: BinaryIO, original_filename: str) -> Tuple[str, str, int, str]:
        """
        Saves a file.
        Returns: (stored_path, secure_filename, file_size, sha256_hash)
        """
        pass

    @abstractmethod
    def get_file_bytes(self, stored_path: str) -> bytes:
        """Retrieves raw bytes of a stored file."""
        pass

    @abstractmethod
    def delete_file(self, stored_path: str) -> bool:
        """Deletes a stored file."""
        pass
