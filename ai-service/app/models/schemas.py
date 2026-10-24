from typing import Optional, List
from pydantic import BaseModel, Field

class PageContent(BaseModel):
    page_number: int
    text: str

class TextExtractionResponse(BaseModel):
    filename: str
    file_type: str
    total_pages: int
    total_words: int
    full_text: str
    pages: List[PageContent]

class RiskFindingItem(BaseModel):
    id: str
    title: str
    severity: str = Field(description="high, medium, or low")
    category: str
    clause_reference: str
    explanation: str
    evidence_snippet: str
    recommendation: str
    page_number: int = 1
    finding_source: str = Field(default="rule", description="rule, llm, or hybrid")
    is_evidence_verified: bool = Field(default=True, description="True if evidence passage is verified in document")
    evidence_status: str = Field(default="verified", description="verified, unverified, or rejected")

class LLMRiskCandidate(BaseModel):
    title: str
    severity: str = "medium"
    category: str = "Commercial Risk"
    clause_reference: str = "General Terms"
    explanation: str
    evidence_snippet: str
    recommendation: str

class LLMSummaryCandidate(BaseModel):
    executive_summary: str
    key_obligations: List[str] = []
    critical_dates: List[str] = []

class LLMProviderInfo(BaseModel):
    provider: str
    model: str
    is_configured: bool
    is_live: bool

class RiskCounts(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0

class SummaryResult(BaseModel):
    executive_summary: str
    key_obligations: List[str]
    critical_dates: List[str]
    compliance_score: int
    total_risks: int
    risk_counts: RiskCounts
    provider_info: Optional[LLMProviderInfo] = None
    truncation_warning: Optional[str] = None
    actual_provider: str = "rule"
    execution_status: str = "rule_only"
    status_message: Optional[str] = None
    model_name: Optional[str] = None
    summary_execution_status: Optional[str] = None
    risk_execution_status: Optional[str] = None

class DocumentAnalysisResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    overall_risk_level: str
    summary: SummaryResult
    findings: List[RiskFindingItem]

class TextAnalysisRequest(BaseModel):
    text: str
    filename: Optional[str] = "contract.txt"

class RedlineDiffRequest(BaseModel):
    comparison_id: Optional[str] = "comp-custom"
    title: Optional[str] = "Contract Comparison"
    base_text: str
    target_text: str
    base_label: Optional[str] = "Original Version"
    target_label: Optional[str] = "Modified Version"

class RiskImpact(BaseModel):
    severity: str
    description: str

class ClauseDiffItem(BaseModel):
    id: str
    clause_title: str
    section_title: Optional[str] = None
    diff_type: str = Field(description="modified, added, removed, or unchanged")
    severity: str = Field(description="high, medium, or low")
    old_text: Optional[str] = None
    new_text: Optional[str] = None
    old_clause: Optional[str] = None
    new_clause: Optional[str] = None
    risk_assessment: str
    risk_impact: Optional[RiskImpact] = None

class RedlineDiffResponse(BaseModel):
    comparison_id: str
    title: str
    base_version_label: str
    target_version_label: str
    total_changes: int
    diffs: List[ClauseDiffItem]

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    llm_provider: Optional[str] = None
    llm_configured: Optional[bool] = None
