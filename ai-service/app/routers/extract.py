from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.extractor import extract_document_text
from app.models.schemas import TextExtractionResponse
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["Extraction"])

@router.post("/extract", response_model=TextExtractionResponse)
async def extract_text_endpoint(file: UploadFile = File(...)):
    """
    Extracts text and page structure from PDF, DOCX, or TXT documents.
    """
    filename = file.filename or "uploaded_document"
    contents = await file.read()
    
    if len(contents) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.max_file_size_bytes / (1024*1024)} MB."
        )

    return extract_document_text(filename, contents)
