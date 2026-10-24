import io
import os
from typing import List, Tuple
from app.models.schemas import PageContent, TextExtractionResponse

def extract_text_from_pdf(file_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extracts text page-by-page from a PDF byte stream using pypdf.
    """
    pages_output = []
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_output.append((idx + 1, text.strip()))
    except Exception as e:
        # Fallback if pypdf fails or is partially corrupted
        decoded = file_bytes.decode("latin-1", errors="ignore")
        pages_output.append((1, f"[PDF Text Extraction Fallback]: {decoded[:4000]}"))
    
    if not pages_output:
        pages_output.append((1, ""))
    return pages_output

def extract_text_from_docx(file_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extracts text paragraph-by-paragraph from a Word DOCX byte stream using python-docx.
    """
    pages_output = []
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = "\n\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        # Since docx does not strictly paginate, estimate ~500 words per page
        words = full_text.split()
        chunk_size = 500
        if not words:
            pages_output.append((1, ""))
        else:
            for page_num, i in enumerate(range(0, len(words), chunk_size), start=1):
                chunk = " ".join(words[i:i + chunk_size])
                pages_output.append((page_num, chunk))
    except Exception as e:
        decoded = file_bytes.decode("utf-8", errors="ignore")
        pages_output.append((1, decoded))
    return pages_output

def extract_document_text(filename: str, file_bytes: bytes) -> TextExtractionResponse:
    """
    Universal dispatcher that inspects file extension and routes to appropriate extractor.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        raw_pages = extract_text_from_pdf(file_bytes)
        file_type = "pdf"
    elif ext == ".docx":
        raw_pages = extract_text_from_docx(file_bytes)
        file_type = "docx"
    else:
        text = file_bytes.decode("utf-8", errors="ignore")
        raw_pages = [(1, text)]
        file_type = "txt"

    pages = [PageContent(page_number=p[0], text=p[1]) for p in raw_pages]
    full_text = "\n\n".join([p.text for p in pages if p.text])
    words = full_text.split()

    return TextExtractionResponse(
        filename=filename,
        file_type=file_type,
        total_pages=len(pages),
        total_words=len(words),
        full_text=full_text,
        pages=pages
    )
