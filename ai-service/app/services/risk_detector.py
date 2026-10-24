import re
import uuid
from typing import List, Tuple, Optional, Any
from app.models.schemas import RiskFindingItem, PageContent

RISK_PATTERNS = [
    {
        "id_prefix": "find-indemn",
        "category": "Legal Liability",
        "title": "Uncapped Third-Party Indemnification Obligation",
        "severity": "high",
        "keywords": [r"indemnif\w+", r"hold harmless", r"defend\b"],
        "trigger_phrases": [r"without limitation", r"uncapped", r"any and all claims", r"solely responsible"],
        "default_clause": "Section: Indemnification and Defense",
        "explanation": "The counterparty imposes broad indemnification duties without an aggregate financial liability cap or mutual carve-out for vendor errors, exposing the company to unrestricted liability.",
        "recommendation": "Insert a mutual liability cap equal to twelve (12) months of aggregate fees paid under this Agreement, and exclude claims arising from counterparty gross negligence or unauthorized modifications."
    },
    {
        "id_prefix": "find-term",
        "category": "Commercial Risk",
        "title": "Unilateral Termination for Convenience on Short Notice",
        "severity": "high",
        "keywords": [r"terminat\w+.*convenience", r"terminate.*sole discretion", r"right to terminate"],
        "trigger_phrases": [r"15 days", r"seven days", r"without cause", r"at its sole discretion", r"immediate effect"],
        "default_clause": "Section: Term and Early Termination",
        "explanation": "Permits one-sided early termination for convenience with minimal notice while retaining pre-paid fees, leaving project operations vulnerable to sudden operational disruption.",
        "recommendation": "Require minimum sixty (60) to ninety (90) days advance notice for convenience termination, make the right mutual, and require pro-rata refund of unamortized fees."
    },
    {
        "id_prefix": "find-ip",
        "category": "Intellectual Property",
        "title": "Counterparty Assignment of Custom Work Product",
        "severity": "high",
        "keywords": [r"intellectual property", r"work product", r"ownership", r"deliverables"],
        "trigger_phrases": [r"provider shall retain", r"vendor retains ownership", r"exclusive property of vendor", r"license only"],
        "default_clause": "Section: Proprietary Rights and Work Product",
        "explanation": "The counterparty claims exclusive ownership of custom work product or bespoke modules developed specifically for this engagement, creating vendor lock-in.",
        "recommendation": "Specify that Customer owns all custom deliverables and work product upon full payment, granting Vendor only a license to their pre-existing background IP."
    },
    {
        "id_prefix": "find-breach",
        "category": "Data Privacy",
        "title": "Ambiguous Security Incident Notification Interval",
        "severity": "medium",
        "keywords": [r"security incident", r"data breach", r"unauthorized access", r"personal data"],
        "trigger_phrases": [r"reasonable timing", r"undue delay", r"good faith efforts", r"as soon as practical"],
        "default_clause": "Section: Data Privacy and Incident Response",
        "explanation": "Security breach notifications rely on subjective language such as 'without undue delay' rather than strict 72-hour regulatory standards required by GDPR and CCPA.",
        "recommendation": "Replace ambiguous timing with an explicit commitment: 'within forty-eight (48) to seventy-two (72) hours of confirmed security incident discovery.'"
    },
    {
        "id_prefix": "find-audit",
        "category": "Compliance",
        "title": "Invasive Unannounced Audit and Inspection Rights",
        "severity": "medium",
        "keywords": [r"audit\w*", r"inspect\w*", r"verification\b"],
        "trigger_phrases": [r"at any time", r"without notice", r"remote telemetry", r"entire audit cost", r"customer shall pay"],
        "default_clause": "Section: Books, Records, and Audit Verification",
        "explanation": "Grants vendor invasive access to customer premises and network logs with minimal notice, shifting audit costs to customer for minor compliance variances.",
        "recommendation": "Limit audits to once annually during normal business hours with at least thirty (30) business days advance written notice."
    },
    {
        "id_prefix": "find-renewal",
        "category": "Financial",
        "title": "Automatic Renewal with Uncapped Price Increases",
        "severity": "low",
        "keywords": [r"renew\w*", r"evergreen", r"successive terms"],
        "trigger_phrases": [r"automatic\w* renew", r"ten percent", r"10%", r"unless written notice", r"prior to expiration"],
        "default_clause": "Section: Automatic Renewal and Price Adjustment",
        "explanation": "Agreement automatically renews for successive multi-year periods unless opt-out notice is given well in advance, accompanied by unrestricted annual fee increases.",
        "recommendation": "Cap annual price escalations to the Consumer Price Index (CPI) or 3% maximum, and set reasonable 30-day non-renewal notification windows."
    },
    {
        "id_prefix": "find-venue",
        "category": "Legal Liability",
        "title": "Disproportionate Dispute Forum & Jury Waiver",
        "severity": "medium",
        "keywords": [r"governing law", r"jurisdiction", r"venue", r"dispute resolution"],
        "trigger_phrases": [r"waive\w*.*jury", r"exclusive jurisdiction", r"arbitration", r"delaware", r"new york"],
        "default_clause": "Section: Governing Law and Venue",
        "explanation": "Designates exclusive jurisdiction in a remote or unfavorable state with full waiver of trial by jury, increasing legal defense and arbitration travel expenditures.",
        "recommendation": "Seek mutual or neutral venue jurisdiction and ensure equitable dispute escalation procedures prior to formal litigation."
    }
]

from app.services.evidence_verifier import verify_passage_evidence
from app.config import settings

def detect_rule_based_risks(pages: List[PageContent], filename: str) -> List[RiskFindingItem]:
    """
    Analyzes document pages using the deterministic baseline legal rule engine.
    Extracts verified text evidence passages from actual document pages.
    """
    full_text = " ".join([p.text for p in pages])
    findings: List[RiskFindingItem] = []
    
    finding_counter = 1
    
    for pattern in RISK_PATTERNS:
        # Check if primary keywords exist
        keyword_matched = any(re.search(kw, full_text, re.IGNORECASE) for kw in pattern["keywords"])
        if not keyword_matched:
            continue
            
        # Check if trigger phrase or risk pattern matches
        matched_trigger = None
        matched_page = 1
        matched_snippet = ""
        
        for p in pages:
            for trigger in pattern["trigger_phrases"]:
                match = re.search(trigger, p.text, re.IGNORECASE)
                if match:
                    matched_trigger = match.group(0)
                    matched_page = p.page_number
                    # Extract surrounding context, bounded by paragraph or section headers
                    text_before = p.text[:match.start()]
                    text_after = p.text[match.end():]
                    # Find start boundary (newline or previous section/clause header)
                    start_boundary = max(text_before.rfind("\n"), text_before.rfind(". "))
                    start = start_boundary + 1 if start_boundary != -1 else max(0, match.start() - 80)
                    # Find end boundary (newline or subsequent section/clause header)
                    next_sec = re.search(r"\n|\b(?:Section|Clause|Article)\b", text_after, re.IGNORECASE)
                    end = match.end() + next_sec.start() if next_sec else min(len(p.text), match.end() + 100)
                    matched_snippet = p.text[start:end].replace("\n", " ").strip()
                    break
            if matched_trigger:
                break
                
        # If both keyword and trigger pattern found, record high-confidence evidence finding
        if matched_trigger:
            finding_id = f"{pattern['id_prefix']}-{finding_counter}"
            finding_counter += 1
            
            # Detect section reference if available
            section_match = re.search(r"(?:Section|Clause|Article)\s+[\d\.]+", matched_snippet, re.IGNORECASE)
            clause_ref = section_match.group(0) if section_match else pattern["default_clause"]
            
            findings.append(RiskFindingItem(
                id=finding_id,
                title=pattern["title"],
                severity=pattern["severity"],
                category=pattern["category"],
                clause_reference=clause_ref,
                explanation=pattern["explanation"],
                evidence_snippet=matched_snippet or f"Discovered in document text: '{matched_trigger}' under {clause_ref}",
                recommendation=pattern["recommendation"],
                page_number=matched_page,
                finding_source="rule",
                is_evidence_verified=True,
                evidence_status="verified"
            ))

    # If document has sparse text or is a short sample, synthesize contextual findings
    if not findings:
        findings.append(RiskFindingItem(
            id="find-std-1",
            title="General Commercial Baseline Review Required",
            severity="low",
            category="Compliance",
            clause_reference="General Terms",
            explanation=f"Text extraction completed for {filename}. Standard risk triggers were below statutory thresholds, but formal corporate review is advised.",
            evidence_snippet=full_text[:200] if full_text else "Document ingested without explicit high-severity triggers.",
            recommendation="Confirm mutual confidentiality and warranty baselines prior to final execution.",
            page_number=1,
            finding_source="rule",
            is_evidence_verified=True,
            evidence_status="verified"
        ))

    return findings

# Backward-compatible synchronous alias
detect_risks_in_document = detect_rule_based_risks

class RiskDetectionResult(tuple):
    """
    A 2-tuple (findings, warning) with additional metadata attributes for provider outcome.
    Inheriting from tuple ensures full backward compatibility with unpacking:
    `findings, warning = await detect_document_risks_hybrid(...)`.
    """
    def __new__(
        cls,
        findings: List[RiskFindingItem],
        warning: Optional[str],
        execution_status: str = "completed",
        provider_name: str = "rule"
    ):
        obj = super().__new__(cls, (findings, warning))
        obj.findings = findings
        obj.warning = warning
        obj.execution_status = execution_status
        obj.provider_name = provider_name
        return obj

async def detect_document_risks_hybrid(
    pages: List[PageContent],
    filename: str,
    provider: Optional[Any] = None
) -> Tuple[List[RiskFindingItem], Optional[str]]:
    """
    Executes complementary risk detection:
    1. Runs baseline rule engine to guarantee verified coverage.
    2. Runs configured LLM provider to detect semantic nuances and custom risks.
    3. Verifies every LLM evidence passage against source text; rejects or flags unverified citations.
    4. Merges findings into categorized, source-attributed results (rule, llm, hybrid).
    """
    from app.services.llm_provider import get_llm_provider

    rule_findings = detect_rule_based_risks(pages, filename)
    active_provider = provider or get_llm_provider()

    if active_provider.provider_name == "rule" or not active_provider.is_configured():
        return RiskDetectionResult(rule_findings, None, execution_status="rule_only", provider_name="rule")

    full_text = " ".join([p.text for p in pages])
    candidates, provider_warning = await active_provider.detect_risks(full_text, filename, pages)

    is_fallback = bool(provider_warning and (
        not candidates or
        any(k in provider_warning.lower() for k in [
            "rate limit", "timed out", "http", "connection error", "malformed",
            "recovered via", "utilized rule", "failed", "error", "requires credentials"
        ])
    ))

    if is_fallback:
        risk_exec_status = "fallback"
        risk_provider_name = "rule"
    else:
        risk_exec_status = "completed"
        risk_provider_name = active_provider.provider_name

    from app.services.evidence_verifier import verify_absence_claim

    merged_findings: List[RiskFindingItem] = list(rule_findings)
    llm_counter = 1

    GENERIC_CLAUSES = {"", "general terms", "n/a", "entire agreement", "general", "miscellaneous"}

    for cand in candidates:
        cand_cat = (cand.category or "").strip().lower()
        cand_clause = (cand.clause_reference or "").strip().lower()
        cand_title = (cand.title or "").strip().lower()
        cand_snippet = (cand.evidence_snippet or "").strip()

        # Check if this finding claims a missing protection / omitted clause
        is_missing_claim = (
            cand_cat == "missing protection"
            or "missing" in cand_title
            or "omitted" in cand_title
            or "absence" in cand_title
            or "clause omitted" in cand_snippet.lower()
            or "not specified" in cand_snippet.lower()
        )

        if is_missing_claim:
            # Use explicit absence-check mechanism across the document text
            is_verified, status, absence_note = verify_absence_claim(
                cand.title, cand.explanation, cand.evidence_snippet, pages
            )
            page_num = 1
            clean_snippet = f"Absence Audit: {absence_note}"
            if not is_verified and settings.reject_unverified_evidence:
                # Discard claim if absence could not be confirmed
                continue
        else:
            # Require verifiable source passage in the document
            is_verified, page_num, clean_snippet = verify_passage_evidence(cand.evidence_snippet, pages)
            if not is_verified and settings.reject_unverified_evidence:
                # Reject candidate with hallucinated / unverified evidence
                continue
            status = "verified" if is_verified else "unverified"

        # Check if candidate overlaps with an existing finding (genuine duplicate check)
        matched_rule = False
        for rf in merged_findings:
            rf_clause = (rf.clause_reference or "").strip().lower()
            rf_snippet = (rf.evidence_snippet or "").strip().lower()
            clean_snippet_lower = clean_snippet.lower()

            # Rule 1: Specific clause reference match (excluding blank/generic clauses)
            # Normalize trailing punctuation (e.g. "section 14.3." vs "section 14.3")
            norm_cand_clause = re.sub(r"[\.:\s]+$", "", cand_clause)
            norm_rf_clause = re.sub(r"[\.:\s]+$", "", rf_clause)
            same_specific_clause = (
                norm_cand_clause == norm_rf_clause
                and norm_cand_clause not in GENERIC_CLAUSES
                and norm_rf_clause not in GENERIC_CLAUSES
            )

            # Rule 2: Substantial, specific evidence overlap on the core cited passage
            # (Candidate snippet must match the rule finding's core quote or share substantial clause text)
            evidence_overlap = False
            if len(clean_snippet_lower) >= 25 and len(rf_snippet) >= 25:
                # If the candidate's cited passage specifically focuses on the same risk statement
                cand_core_words = [w for w in clean_snippet_lower.split() if len(w) > 3]
                rf_core_words = [w for w in rf_snippet.split() if len(w) > 3]
                if cand_core_words and rf_core_words:
                    overlap_ratio = len(set(cand_core_words).intersection(set(rf_core_words))) / max(1, len(set(cand_core_words)))
                    if overlap_ratio >= 0.75:
                        evidence_overlap = True

            # Genuine duplicate requires:
            # EITHER: Core evidence quotation overlap (>= 75% of candidate words match the cited risk)
            # OR: Same specific clause reference AND matching category/topic alignment
            same_category = cand_cat == rf.category.strip().lower()
            if evidence_overlap or (same_specific_clause and same_category):
                rf.finding_source = "hybrid"
                matched_rule = True
                break


        if not matched_rule:
            finding_id = f"find-llm-{llm_counter}"
            llm_counter += 1

            if is_missing_claim:
                title = cand.title if is_verified else f"[Unverified Absence] {cand.title}"
            else:
                title = cand.title if is_verified else f"[Unverified Evidence] {cand.title}"

            merged_findings.append(RiskFindingItem(
                id=finding_id,
                title=title,
                severity=cand.severity,
                category=cand.category,
                clause_reference=cand.clause_reference,
                explanation=cand.explanation,
                evidence_snippet=clean_snippet,
                recommendation=cand.recommendation,
                page_number=page_num,
                finding_source="llm",
                is_evidence_verified=is_verified,
                evidence_status=status
            ))

    return RiskDetectionResult(merged_findings, provider_warning, execution_status=risk_exec_status, provider_name=risk_provider_name)

