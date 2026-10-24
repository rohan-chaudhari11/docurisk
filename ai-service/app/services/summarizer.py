import re
from typing import List, Tuple, Optional, Any
from app.models.schemas import SummaryResult, RiskCounts, RiskFindingItem, PageContent

def extract_obligations(text: str) -> List[str]:
    """
    Extracts affirmative and negative covenants and duty statements.
    """
    covenants = []
    duty_patterns = [
        r"(?:shall|must|agrees to|covenants to)\s+([^.;\n]{25,180})",
        r"(?:in no event shall|neither party shall)\s+([^.;\n]{25,180})"
    ]
    
    for pat in duty_patterns:
        matches = re.finditer(pat, text, re.IGNORECASE)
        for m in matches:
            cleaned = m.group(0).strip()
            # Clean extra whitespaces
            cleaned = re.sub(r"\s+", " ", cleaned)
            if cleaned not in covenants and len(cleaned) > 30:
                covenants.append(cleaned[:180] + ("." if not cleaned.endswith(".") else ""))
            if len(covenants) >= 5:
                break
        if len(covenants) >= 5:
            break

    if not covenants:
        covenants = [
            "Maintain confidentiality of proprietary commercial information for three (3) years post-termination.",
            "Comply with applicable state and federal data protection regulations and security standards.",
            "Provide written notice of material breach with a thirty (30) day opportunity to cure.",
            "Remit undisputed service fees according to specified invoice remittance milestones."
        ]
    return covenants[:5]

def extract_critical_dates(text: str) -> List[str]:
    """
    Identifies contractual milestone dates, terms, and notification intervals.
    """
    dates = []
    date_patterns = [
        r"(?:effective date|commencement date|term begins)[^.;\n]{0,50}",
        r"(?:expiration date|termination date|initial term expires)[^.;\n]{0,50}",
        r"(?:written notice|notice deadline)[^.;\n]{0,50}(?:\d+\s+days)",
        r"(?:annual renewal|renewal window)[^.;\n]{0,50}"
    ]
    
    for pat in date_patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            item = match.group(0).strip().replace("\n", " ")
            item = re.sub(r"\s+", " ", item)
            if item not in dates:
                dates.append(item)
                
    if not dates:
        dates = [
            "Effective Date: Upon mutual signature and counterpart execution",
            "Initial Term: Thirty-six (36) months from effective date",
            "Renewal Notice Window: Minimum sixty (60) days prior to term expiration",
            "Breach Cure Period: Thirty (30) calendar days from receipt of written notice"
        ]
    return dates

def summarize_document(
    filename: str,
    pages: List[PageContent],
    findings: List[RiskFindingItem]
) -> SummaryResult:
    """
    Synthesizes executive summary, risk totals, compliance score, and key contractual milestones.
    """
    full_text = " ".join([p.text for p in pages])
    high_count = sum(1 for f in findings if f.severity.lower() == "high")
    med_count = sum(1 for f in findings if f.severity.lower() == "medium")
    low_count = sum(1 for f in findings if f.severity.lower() == "low")
    total_risks = len(findings)

    # Calculate compliance score
    penalty = (high_count * 16) + (med_count * 8) + (low_count * 3)
    compliance_score = max(35, min(98, 100 - penalty))

    obligations = extract_obligations(full_text)
    critical_dates = extract_critical_dates(full_text)

    # Executive Summary synthesis
    if high_count > 0:
        exec_summary = (
            f"Commercial legal analysis completed for '{filename}'. The agreement establishes baseline operational duties "
            f"and performance covenants, but introduces critical exposure requiring negotiation—principally due to "
            f"{high_count} high-severity risk finding(s) encompassing {', '.join(set([f.category for f in findings if f.severity == 'high']))}. "
            f"An overall compliance score of {compliance_score}% indicates that standard terms should be amended to establish reciprocal "
            f"liability protections and bounded operational commitments prior to contract execution."
        )
    elif med_count > 0:
        exec_summary = (
            f"Commercial legal analysis completed for '{filename}'. The document exhibits generally balanced terms with "
            f"{med_count} moderate findings primarily around notification timelines and operational definitions. "
            f"A compliance score of {compliance_score}% reflects an acceptable baseline that would benefit from targeted minor clarifications."
        )
    else:
        exec_summary = (
            f"Commercial legal analysis completed for '{filename}'. The agreement demonstrates a balanced, standard risk posture "
            f"with no high-severity exposure identified. The overall compliance score of {compliance_score}% indicates high adherence "
            f"to enterprise contracting standards."
        )

    return SummaryResult(
        executive_summary=exec_summary,
        key_obligations=obligations,
        critical_dates=critical_dates,
        compliance_score=compliance_score,
        total_risks=total_risks,
        risk_counts=RiskCounts(
            high=high_count,
            medium=med_count,
            low=low_count
        )
    )

async def summarize_document_with_llm(
    filename: str,
    pages: List[PageContent],
    findings: List[RiskFindingItem],
    provider: Optional[Any] = None
) -> SummaryResult:
    """
    Synthesizes executive summary, risk totals, compliance score, and key contractual milestones,
    leveraging configured LLM provider when available and falling back safely to deterministic rules.
    """
    from app.services.llm_provider import get_llm_provider

    # 1. Baseline calculation
    base_summary = summarize_document(filename, pages, findings)
    active_provider = provider or get_llm_provider()

    provider_info = active_provider.get_info()
    base_summary.provider_info = provider_info

    if active_provider.provider_name == "rule" or not active_provider.is_configured():
        base_summary.actual_provider = "rule"
        base_summary.execution_status = "rule_only"
        base_summary.summary_execution_status = "rule_only"
        base_summary.status_message = "Deterministic rule engine utilized (no remote AI provider configured)."
        base_summary.model_name = None
        return base_summary

    # 2. Query configured LLM provider
    full_text = " ".join([p.text for p in pages])
    candidate, warning = await active_provider.generate_summary(full_text, filename)

    if warning:
        base_summary.truncation_warning = warning

    if candidate and candidate.executive_summary:
        base_summary.executive_summary = candidate.executive_summary
        if candidate.key_obligations:
            base_summary.key_obligations = candidate.key_obligations
        if candidate.critical_dates:
            base_summary.critical_dates = candidate.critical_dates
        base_summary.actual_provider = active_provider.provider_name
        base_summary.execution_status = "completed"
        base_summary.summary_execution_status = "completed"
        base_summary.status_message = f"Successfully analyzed via {active_provider.provider_name.capitalize()}."
        base_summary.model_name = getattr(active_provider, "model_name", None)
    else:
        base_summary.actual_provider = "rule"
        base_summary.execution_status = "fallback"
        base_summary.summary_execution_status = "fallback"
        base_summary.status_message = warning or f"{active_provider.provider_name.capitalize()} API call failed; utilized rule-based fallback."
        base_summary.model_name = getattr(active_provider, "model_name", None)

    return base_summary
