import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.extractor import extract_document_text
from app.services.risk_detector import detect_document_risks_hybrid
from app.services.summarizer import summarize_document_with_llm
from app.models.schemas import DocumentAnalysisResponse, TextAnalysisRequest, PageContent, SummaryResult
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["Analysis"])

def _reconcile_warnings_and_status(
    summary: SummaryResult,
    risk_warning: Optional[str],
    findings: Optional[list] = None,
    risk_execution_status: Optional[str] = None,
    risk_provider: Optional[str] = None
) -> None:
    # 1. Tracing summary execution status
    summary_status = summary.summary_execution_status or summary.execution_status

    # 2. Tracing risk execution status without relying solely on finding_source
    if risk_execution_status:
        risk_status = risk_execution_status
        risk_prov = risk_provider or ("rule" if risk_status in ("fallback", "rule_only") else (summary.actual_provider or "gemini"))
    else:
        # Fallback resolution when caller doesn't provide explicit risk_execution_status
        if risk_warning:
            risk_status = "fallback"
            risk_prov = "rule"
        elif summary_status == "rule_only":
            risk_status = "rule_only"
            risk_prov = "rule"
        elif summary_status == "completed":
            risk_status = "completed"
            risk_prov = summary.actual_provider or "gemini"
        else:
            # Backward-compatible heuristic only when caller provides no outcome
            has_llm_findings = False
            if findings:
                has_llm_findings = any(getattr(f, "finding_source", None) in ("llm", "hybrid") for f in findings)
            if has_llm_findings:
                risk_status = "completed"
                risk_prov = summary.provider_info.provider if summary.provider_info else "gemini"
            else:
                risk_status = "fallback"
                risk_prov = "rule"

    summary.summary_execution_status = summary_status
    summary.risk_execution_status = risk_status

    # Incorporate risk warning if present
    if risk_warning:
        if summary.truncation_warning:
            if risk_warning not in summary.truncation_warning:
                summary.truncation_warning = f"{summary.truncation_warning} | {risk_warning}"
        else:
            summary.truncation_warning = risk_warning

    # Identify configured AI provider label
    configured_ai_provider = None
    if summary.provider_info and summary.provider_info.provider != "rule":
        configured_ai_provider = summary.provider_info.provider
    elif summary.actual_provider and summary.actual_provider != "rule":
        configured_ai_provider = summary.actual_provider
    elif risk_prov and risk_prov != "rule":
        configured_ai_provider = risk_prov
    provider_title = (configured_ai_provider or "AI").capitalize()

    # 3. Reconcile overall execution status and actual provider
    if summary_status == "rule_only" and risk_status == "rule_only":
        summary.execution_status = "rule_only"
        summary.actual_provider = "rule"
    elif summary_status == "completed" and risk_status == "completed":
        summary.execution_status = "completed"
        summary.actual_provider = configured_ai_provider or "gemini"
    elif summary_status == "completed" and risk_status == "fallback":
        summary.execution_status = "partial"
        summary.actual_provider = configured_ai_provider or "gemini"
        summary.status_message = f"Executive summary completed via {provider_title}, but risk detection fell back: {risk_warning or 'Rule-based fallback active.'}"
    elif summary_status == "fallback" and risk_status == "completed":
        summary.execution_status = "partial"
        summary.actual_provider = configured_ai_provider or "gemini"
        if summary.provider_info and getattr(summary.provider_info, "model", None):
            summary.model_name = summary.provider_info.model
        summary.status_message = (
            f"Risk detection utilized {provider_title} model, but executive summary fell back to rule-based engine: {summary.status_message or 'Summary generation failed.'}"
        )
    elif summary_status == "fallback" and risk_status == "fallback":
        summary.execution_status = "fallback"
        summary.actual_provider = "rule"
        if risk_warning and (not summary.status_message or risk_warning not in summary.status_message):
            summary.status_message = f"{summary.status_message} | Risk detection: {risk_warning}" if summary.status_message else risk_warning

@router.post("/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document_endpoint(file: UploadFile = File(...)):
    """
    End-to-end pipeline: Extracts text, runs evidence-backed risk analysis, 
    and synthesizes an executive summary with compliance scoring.
    """
    filename = file.filename or "uploaded_contract"
    contents = await file.read()
    
    if len(contents) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.max_file_size_bytes / (1024*1024)} MB."
        )

    # 1. Text extraction
    extraction = extract_document_text(filename, contents)
    
    # 2. Risk detection (baseline rules + verified LLM candidates)
    risk_result = await detect_document_risks_hybrid(extraction.pages, filename)
    findings, risk_warning = risk_result
    
    # 3. Summarization & scoring (LLM with baseline fallback)
    summary = await summarize_document_with_llm(filename, extraction.pages, findings)
    _reconcile_warnings_and_status(
        summary,
        risk_warning,
        findings,
        risk_execution_status=getattr(risk_result, "execution_status", None),
        risk_provider=getattr(risk_result, "provider_name", None)
    )
    
    # 4. Overall risk level determination
    if summary.risk_counts.high > 0:
        overall_level = "high"
    elif summary.risk_counts.medium > 0:
        overall_level = "medium"
    else:
        overall_level = "low"

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"

    return DocumentAnalysisResponse(
        document_id=doc_id,
        filename=filename,
        file_type=extraction.file_type,
        file_size_bytes=len(contents),
        overall_risk_level=overall_level,
        summary=summary,
        findings=findings
    )

@router.post("/analyze/text", response_model=DocumentAnalysisResponse)
async def analyze_text_endpoint(payload: TextAnalysisRequest):
    """
    Runs full analysis pipeline directly on raw contract text passed as JSON.
    """
    filename = payload.filename or "contract.txt"
    pages = [PageContent(page_number=1, text=payload.text)]
    risk_result = await detect_document_risks_hybrid(pages, filename)
    findings, risk_warning = risk_result
    summary = await summarize_document_with_llm(filename, pages, findings)
    _reconcile_warnings_and_status(
        summary,
        risk_warning,
        findings,
        risk_execution_status=getattr(risk_result, "execution_status", None),
        risk_provider=getattr(risk_result, "provider_name", None)
    )
    
    if summary.risk_counts.high > 0:
        overall_level = "high"
    elif summary.risk_counts.medium > 0:
        overall_level = "medium"
    else:
        overall_level = "low"

    doc_id = f"doc-{uuid.uuid4().hex[:8]}"

    return DocumentAnalysisResponse(
        document_id=doc_id,
        filename=filename,
        file_type="txt",
        file_size_bytes=len(payload.text.encode("utf-8")),
        overall_risk_level=overall_level,
        summary=summary,
        findings=findings
    )
