from fastapi import APIRouter, UploadFile, File
from app.services.extractor import extract_document_text
from app.services.risk_detector import detect_document_risks_hybrid
from app.services.summarizer import summarize_document_with_llm
from app.models.schemas import SummaryResult, TextAnalysisRequest, PageContent

router = APIRouter(prefix="/api/ai", tags=["Summarization"])

@router.post("/summarize", response_model=SummaryResult)
async def summarize_endpoint(file: UploadFile = File(...)):
    """
    Extracts and summarizes key obligations, critical dates, and executive overview from an uploaded document.
    """
    filename = file.filename or "contract"
    contents = await file.read()
    extraction = extract_document_text(filename, contents)
    findings, risk_warning = await detect_document_risks_hybrid(extraction.pages, filename)
    summary = await summarize_document_with_llm(filename, extraction.pages, findings)
    if risk_warning:
        summary.truncation_warning = risk_warning
    return summary

@router.post("/summarize/text", response_model=SummaryResult)
async def summarize_text_endpoint(payload: TextAnalysisRequest):
    """
    Summarizes raw contract text passed directly via JSON payload.
    """
    pages = [PageContent(page_number=1, text=payload.text)]
    findings, risk_warning = await detect_document_risks_hybrid(pages, payload.filename or "document.txt")
    summary = await summarize_document_with_llm(payload.filename or "document.txt", pages, findings)
    if risk_warning:
        summary.truncation_warning = risk_warning
    return summary
