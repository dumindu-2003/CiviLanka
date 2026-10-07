import os
from typing import Optional, Tuple

import AppSettings


class FileHandler:
    """Saves / finds files inside the Uploads folder."""

    @staticmethod
    def DetectImage(data: bytes) -> Optional[Tuple[str, str]]:
        """Looks at the first bytes of the file (not the name the client sent). Returns (content_type, extension) or None."""
        if data[:3] == b"\xff\xd8\xff":
            return "image/jpeg", ".jpg"
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            return "image/png", ".png"
        if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            return "image/webp", ".webp"
        return None

    @staticmethod
    def PathOf(fileName: str) -> str:
        return os.path.join(AppSettings.UPLOAD_DIR, os.path.basename(fileName))      # basename: no folder tricks

    @staticmethod
    def Save(fileName: str, data: bytes) -> str:
        os.makedirs(AppSettings.UPLOAD_DIR, exist_ok=True)
        path = FileHandler.PathOf(fileName)
        with open(path, "wb") as writer:
            writer.write(data)
        return path