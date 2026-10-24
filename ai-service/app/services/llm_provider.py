import re
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
import httpx

from app.config import settings
from app.models.schemas import (
    PageContent,
    LLMRiskCandidate,
    LLMSummaryCandidate,
    LLMProviderInfo,
    RiskFindingItem
)

logger = logging.getLogger("docurisk.llm")

SYSTEM_PROMPT_SUMMARY = """You are a specialized legal AI assistant.
Analyze the provided legal agreement and produce a strictly valid JSON object with the following keys:
- "executive_summary": A professional synthesis of the agreement's scope, risk posture, and commercial covenants.
- "key_obligations": A JSON array of 3-5 critical affirmative or negative contractual obligations.
- "critical_dates": A JSON array of 3-5 critical milestones, effective dates, or notification windows.

Respond ONLY with valid JSON. Do not include markdown code fences or conversational text."""

SYSTEM_PROMPT_RISKS = """You are a senior contract risk analyst.
Identify legal, compliance, and commercial risks in the provided contract.
For every risk you discover, you MUST provide an exact, verbatim quotation from the document as "evidence_snippet". Do not fabricate or summarize the quote.

Produce a strictly valid JSON object with a single top-level key "risks" containing a list of objects, each with:
- "title": Concise risk title
- "severity": "high", "medium", or "low"
- "category": "Legal Liability", "Commercial Risk", "Intellectual Property", "Data Privacy", "Compliance", or "Financial"
- "clause_reference": e.g., "Section 14.3" or "Indemnification Clause"
- "explanation": Why this clause poses legal or operational exposure
- "evidence_snippet": Exact verbatim passage from the document containing the risk
- "recommendation": Concrete redline or negotiation counter-proposal

Respond ONLY with valid JSON."""

class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM providers (Rule-based, OpenAI, Ollama, Gemini, Mock).
    """
    provider_name: str = "base"
    is_live: bool = False

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the provider has all required credentials and endpoints configured."""
        pass

    @abstractmethod
    async def generate_summary(
        self,
        text: str,
        filename: str
    ) -> Tuple[Optional[LLMSummaryCandidate], Optional[str]]:
        """
        Generates executive summary, obligations, and dates.
        Returns: (candidate: Optional[LLMSummaryCandidate], warning: Optional[str])
        """
        pass

    @abstractmethod
    async def detect_risks(
        self,
        text: str,
        filename: str,
        pages: List[PageContent]
    ) -> Tuple[List[LLMRiskCandidate], Optional[str]]:
        """
        Detects candidate risks from document text.
        Returns: (risks: List[LLMRiskCandidate], warning: Optional[str])
        """
        pass

    def get_info(self) -> LLMProviderInfo:
        return LLMProviderInfo(
            provider=self.provider_name,
            model=getattr(self, "model_name", "rule-engine"),
            is_configured=self.is_configured(),
            is_live=self.is_live
        )


class RuleBasedFallbackProvider(BaseLLMProvider):
    """
    Baseline deterministic legal rule engine.
    Always available without external API credentials or network connectivity.
    """
    provider_name = "rule"
    is_live = False
    model_name = "rule-baseline-v1"

    def is_configured(self) -> bool:
        return True

    async def generate_summary(
        self,
        text: str,
        filename: str
    ) -> Tuple[Optional[LLMSummaryCandidate], Optional[str]]:
        # Summary synthesis handled by baseline summarizer.py
        return None, None

    async def detect_risks(
        self,
        text: str,
        filename: str,
        pages: List[PageContent]
    ) -> Tuple[List[LLMRiskCandidate], Optional[str]]:
        # Baseline detection handled by risk_detector.py
        return [], None


class OpenAICompatibleProvider(BaseLLMProvider):
    """
    REST provider for OpenAI, Gemini OpenAI-compatible API, Ollama, vLLM, or LM Studio.
    Guarantees that no real API requests are dispatched without configured credentials.
    """
    is_live = True

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        provider_name: str = "openai",
        timeout_seconds: float = 20.0,
        max_chars: int = 32000
    ):
        self.provider_name = provider_name
        self.api_key = api_key if api_key is not None else settings.llm_api_key
        self.model_name = model or settings.llm_model
        self.timeout_seconds = timeout_seconds or settings.llm_timeout_seconds
        self.max_chars = max_chars or settings.llm_max_chars

        # Resolve base URL
        if base_url:
            self.base_url = base_url.rstrip("/")
        elif settings.llm_base_url:
            self.base_url = settings.llm_base_url.rstrip("/")
        elif self.provider_name == "gemini":
            self.base_url = "https://generativelanguage.googleapis.com/v1beta/openai"
        elif self.provider_name == "ollama":
            self.base_url = "http://localhost:11434/v1"
        else:
            self.base_url = "https://api.openai.com/v1"

    def is_local_endpoint(self) -> bool:
        return "localhost" in self.base_url or "127.0.0.1" in self.base_url

    def is_configured(self) -> bool:
        # Local endpoints (Ollama/vLLM) can run without API keys
        if self.is_local_endpoint():
            return True
        # Remote cloud APIs MUST have a non-empty API key
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    def _truncate_text_if_oversized(self, text: str) -> Tuple[str, Optional[str]]:
        if len(text) > self.max_chars:
            warning = (
                f"Document text ({len(text)} chars) exceeds maximum LLM context limit of {self.max_chars} chars. "
                "Document was truncated for LLM analysis; complementary rule-based scanning audited the full text."
            )
            return text[:self.max_chars], warning
        return text, None

    async def _post_chat_completion(self, system_prompt: str, user_prompt: str) -> Tuple[Optional[str], Optional[str]]:
        if not self.is_configured():
            logger.info("LLM provider %s is not configured with credentials. Skipping live API call.", self.provider_name)
            return None, f"LLM provider '{self.provider_name}' requires credentials that are not configured."

        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": settings.llm_temperature,
            "max_tokens": settings.llm_max_tokens,
            "response_format": {"type": "json_object"}
        }

        url = f"{self.base_url}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 429:
                    logger.warning("LLM API rate limit exceeded (HTTP 429). Falling back to rule-based engine.")
                    return None, "LLM rate limit reached (HTTP 429); utilized rule-based legal engine."

                if response.status_code in [401, 403]:
                    logger.error("LLM API authentication failed (HTTP %s). Check configured credentials.", response.status_code)
                    return None, f"LLM authentication failed (HTTP {response.status_code}); utilized rule-based engine."

                if not response.is_success:
                    logger.error("LLM API request failed with status %s: %s", response.status_code, response.text[:200])
                    return None, f"LLM API returned HTTP {response.status_code}; utilized rule-based engine."

                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return content, None

        except httpx.TimeoutException:
            logger.warning("LLM API request timed out after %s seconds. Falling back to rule-based engine.", self.timeout_seconds)
            return None, f"LLM request timed out after {self.timeout_seconds}s; utilized rule-based engine."
        except Exception as e:
            logger.error("LLM API network error: %s", str(e))
            return None, f"LLM connection error ({type(e).__name__}); utilized rule-based engine."

    def _extract_json_payload(self, text: str) -> Optional[Dict[str, Any]]:
        """Parses model response into a dictionary, extracting JSON from markdown fences if necessary."""
        if not text:
            return None
        # Try direct parse
        try:
            return json.loads(text)
        except Exception:
            pass

        # Try extracting JSON object using regex
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
        return None

    async def generate_summary(
        self,
        text: str,
        filename: str
    ) -> Tuple[Optional[LLMSummaryCandidate], Optional[str]]:
        truncated_text, trunc_warning = self._truncate_text_if_oversized(text)
        user_prompt = f"Document Filename: {filename}\n\nDocument Text:\n{truncated_text}"

        content, err_warning = await self._post_chat_completion(SYSTEM_PROMPT_SUMMARY, user_prompt)
        combined_warning = " | ".join(filter(None, [trunc_warning, err_warning])) or None

        if not content:
            return None, combined_warning

        parsed = self._extract_json_payload(content)
        if not parsed or not isinstance(parsed, dict) or "executive_summary" not in parsed:
            logger.warning("Malformed LLM summary JSON output. Falling back to rule synthesis.")
            return None, "Malformed LLM response format; recovered via baseline summarizer."

        try:
            candidate = LLMSummaryCandidate(
                executive_summary=str(parsed.get("executive_summary", "")),
                key_obligations=[str(o) for o in parsed.get("key_obligations", []) if o],
                critical_dates=[str(d) for d in parsed.get("critical_dates", []) if d]
            )
            return candidate, combined_warning
        except Exception as parse_err:
            logger.warning("Error validating LLM summary schema: %s", parse_err)
            return None, combined_warning

    async def detect_risks(
        self,
        text: str,
        filename: str,
        pages: List[PageContent]
    ) -> Tuple[List[LLMRiskCandidate], Optional[str]]:
        truncated_text, trunc_warning = self._truncate_text_if_oversized(text)
        user_prompt = f"Document Filename: {filename}\n\nDocument Text:\n{truncated_text}"

        content, err_warning = await self._post_chat_completion(SYSTEM_PROMPT_RISKS, user_prompt)
        combined_warning = " | ".join(filter(None, [trunc_warning, err_warning])) or None

        if not content:
            return [], combined_warning

        parsed = self._extract_json_payload(content)
        if not parsed or not isinstance(parsed, dict):
            logger.warning("Malformed LLM risks JSON output. Utilizing baseline rule findings.")
            return [], "Malformed LLM risk schema; recovered via baseline rule detector."

        raw_risks = parsed.get("risks", [])
        if not isinstance(raw_risks, list):
            return [], combined_warning

        candidates: List[LLMRiskCandidate] = []
        for r in raw_risks:
            if not isinstance(r, dict):
                continue
            title = r.get("title")
            snippet = r.get("evidence_snippet")
            explanation = r.get("explanation")
            if not title or not snippet or not explanation:
                continue

            candidates.append(LLMRiskCandidate(
                title=str(title),
                severity=str(r.get("severity", "medium")).lower(),
                category=str(r.get("category", "Commercial Risk")),
                clause_reference=str(r.get("clause_reference", "General Terms")),
                explanation=str(explanation),
                evidence_snippet=str(snippet),
                recommendation=str(r.get("recommendation", "Review and negotiate mutual protections."))
            ))

        return candidates, combined_warning


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic mock provider for automated unit testing.
    NOTE: All tests using this provider test schema parsing, evidence verification,
    and fallback handling. They are NEVER labeled as live LLM calls.
    """
    provider_name = "mock"
    is_live = False
    model_name = "mock-gpt-test-model"

    def __init__(
        self,
        should_fail_with_429: bool = False,
        should_fail_with_timeout: bool = False,
        should_return_malformed: bool = False,
        custom_risks: Optional[List[Dict[str, Any]]] = None,
        custom_summary: Optional[Dict[str, Any]] = None
    ):
        self.should_fail_with_429 = should_fail_with_429
        self.should_fail_with_timeout = should_fail_with_timeout
        self.should_return_malformed = should_return_malformed
        self.custom_risks = custom_risks
        self.custom_summary = custom_summary

    def is_configured(self) -> bool:
        return True

    async def generate_summary(
        self,
        text: str,
        filename: str
    ) -> Tuple[Optional[LLMSummaryCandidate], Optional[str]]:
        if self.should_fail_with_429:
            return None, "LLM rate limit reached (HTTP 429); utilized rule-based legal engine."

        if self.should_fail_with_timeout:
            return None, "LLM request timed out after 20.0s; utilized rule-based engine."

        if self.should_return_malformed:
            return None, "Malformed LLM response format; recovered via baseline summarizer."

        if self.custom_summary:
            return LLMSummaryCandidate(**self.custom_summary), None

        # Standard mocked summary
        return LLMSummaryCandidate(
            executive_summary=(
                f"Mocked LLM Analysis for '{filename}': The agreement sets forth commercial terms "
                "with identified exposure points requiring legal revision."
            ),
            key_obligations=[
                "Maintain security controls and adhere to industry encryption standards.",
                "Provide written notification within 48 hours of any operational disruption."
            ],
            critical_dates=[
                "Initial Term: 24 months from mutual execution date",
                "Non-Renewal Notice: 60 days written notice"
            ]
        ), None

    async def detect_risks(
        self,
        text: str,
        filename: str,
        pages: List[PageContent]
    ) -> Tuple[List[LLMRiskCandidate], Optional[str]]:
        if self.should_fail_with_429:
            return [], "LLM rate limit reached (HTTP 429); utilized rule-based legal engine."

        if self.should_fail_with_timeout:
            return [], "LLM request timed out after 20.0s; utilized rule-based engine."

        if self.should_return_malformed:
            return [], "Malformed LLM risk schema; recovered via baseline rule detector."

        if self.custom_risks:
            return [LLMRiskCandidate(**r) for r in self.custom_risks], None

        # Return a candidate whose snippet exists in text, and one that does not exist (for verification testing)
        first_page_text = pages[0].text if pages else text
        valid_passage = first_page_text[:120].strip() if len(first_page_text) > 40 else "Standard terms applicable."

        return [
            LLMRiskCandidate(
                title="Mocked LLM Detected Liability Exposure",
                severity="high",
                category="Legal Liability",
                clause_reference="Section 14",
                explanation="Model identifies one-sided indemnification obligation without financial ceiling.",
                evidence_snippet=valid_passage,
                recommendation="Negotiate an aggregate liability cap equal to 12 months fees."
            ),
            LLMRiskCandidate(
                title="Mocked LLM Hallucinated Finding with False Evidence",
                severity="medium",
                category="Data Privacy",
                clause_reference="Section 99",
                explanation="This finding contains a fabricated passage not found in the actual source document.",
                evidence_snippet="THE MOON IS MADE OF GREEN CHEESE AND SHALL BE DELIVERED UNCONDITIONALLY",
                recommendation="Reject or flag as unverified evidence."
            )
        ], None


def get_llm_provider(override_provider: Optional[str] = None) -> BaseLLMProvider:
    """
    Factory to instantiate the appropriate provider according to environment configuration.
    """
    provider_type = (override_provider or settings.llm_provider or "rule").lower().strip()

    if provider_type == "mock":
        return MockLLMProvider()

    if provider_type in ["openai", "gemini", "ollama", "local"]:
        is_configured_provider = (
            override_provider is None or 
            override_provider.lower().strip() == (settings.llm_provider or "").lower().strip()
        )
        key_to_use = settings.llm_api_key if is_configured_provider else ""
        base_url_to_use = settings.llm_base_url if is_configured_provider else None
        model_to_use = settings.llm_model if is_configured_provider else None

        provider = OpenAICompatibleProvider(
            provider_name=provider_type,
            api_key=key_to_use,
            base_url=base_url_to_use,
            model=model_to_use,
            timeout_seconds=settings.llm_timeout_seconds,
            max_chars=settings.llm_max_chars
        )
        if provider.is_configured():
            return provider
        else:
            logger.info("Provider '%s' is not configured with valid credentials; falling back to rule engine.", provider_type)
            return RuleBasedFallbackProvider()

    # Default is the rule-based baseline
    return RuleBasedFallbackProvider()
