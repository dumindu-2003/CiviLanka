import os
from uuid import uuid4

from fastapi import Depends, File, UploadFile

from Controllers.ApplicationControllerBase import BuildApplicationRouter
from Interfaces.INic import INic
from Models.Response import Response
from Static.FileHandler import FileHandler
from Static.Security import CurrentOfficer, GetCurrentOfficer

router = BuildApplicationRouter("/api/nic", "Nic", INic, False)

MAX_DOCUMENT_BYTES = 5 * 1024 * 1024


def _document_kind(data: bytes):
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg", ".jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png", ".png"
    if data[:4] == b"%PDF":
        return "application/pdf", ".pdf"
    return None


@router.post("/UploadDocument", response_model=Response)
def UploadDocument(file: UploadFile = File(...), officer: CurrentOfficer = Depends(GetCurrentOfficer)):
    """Saves one NIC form file. Create and Update write the nic_application_document row."""
    del officer
    data = file.file.read(MAX_DOCUMENT_BYTES + 1)
    if not data:
        return Response(StatusCode=400, Result="No file was uploaded.")
    if len(data) > MAX_DOCUMENT_BYTES:
        return Response(StatusCode=400, Result="The file must be 5MB or smaller.")
    kind = _document_kind(data)
    if kind is None:
        return Response(StatusCode=400, Result="Use a PDF, JPG, or PNG file.")
    content_type, extension = kind
    stored_file_name = f"nic-{uuid4().hex}{extension}"
    try:
        FileHandler.Save(stored_file_name, data)
    except OSError:
        return Response(StatusCode=500, Result="The file could not be saved.")
    original = os.path.basename((file.filename or "document").replace("\\", "/"))[:260]
    return Response(StatusCode=200, ResultSet={
        "original_file_name": original,
        "content_type": content_type,
        "file_size_bytes": len(data),
        "stored_file_name": stored_file_name,
    })
