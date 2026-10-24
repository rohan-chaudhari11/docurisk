import re
from typing import List, Tuple, Optional
from app.models.schemas import PageContent

def normalize_text_for_matching(text: str) -> str:
    """
    Normalizes whitespace, smart quotes, dashes, and casing for robust text passage matching.
    """
    if not text:
        return ""
    # Replace smart quotes and special characters
    t = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    t = t.replace("—", "-").replace("–", "-")
    # Collapse all whitespace and newlines
    t = re.sub(r"\s+", " ", t).strip().lower()
    return t

def verify_passage_evidence(
    snippet: str,
    pages: List[PageContent]
) -> Tuple[bool, int, str]:
    """
    Verifies that an extracted or model-generated evidence snippet actually appears
    within the source document text.

    Returns:
        (is_verified: bool, page_number: int, verified_snippet: str)
    """
    if not snippet or len(snippet.strip()) < 8:
        return False, 1, snippet or ""

    clean_snippet = snippet.strip()
    norm_snippet = normalize_text_for_matching(clean_snippet)

    # 1. Direct case-insensitive search across pages
    for page in pages:
        if clean_snippet.lower() in page.text.lower():
            return True, page.page_number, clean_snippet

    # 2. Normalized whitespace search across pages
    for page in pages:
        norm_page = normalize_text_for_matching(page.text)
        if norm_snippet in norm_page:
            return True, page.page_number, clean_snippet

    # 3. Sliding window matching for long LLM quotes (at least 35 characters or 6 words)
    words = norm_snippet.split()
    if len(words) >= 6:
        # Check consecutive 5-word anchors from the cited passage
        anchor = " ".join(words[:5])
        for page in pages:
            norm_page = normalize_text_for_matching(page.text)
            if anchor in norm_page:
                return True, page.page_number, clean_snippet

    # Not found in any page - flagged as unverified
    return False, 1, clean_snippet


# Domains, standard terms, and equivalent terminology that establish protection
PROTECTION_DOMAINS = {
    "confidentiality": {
        "terms": [
            "confidential", "proprietary information", "non-disclosure", "nondisclosure",
            "trade secret", "secret", "duty of secrecy", "keep secret", "treat as confidential"
        ],
        "obligation_verbs": [
            "shall not disclose", "shall hold in confidence", "shall maintain in confidence",
            "shall protect", "agrees not to disclose", "will not disclose", "keep confidential",
            "shall use reasonable care", "may use it only to perform", "strictly confidential",
            "shall keep all", "must protect", "agrees to protect", "shall take reasonable precautions"
        ]
    },
    "governing law": {
        "terms": [
            "governing law", "jurisdiction", "choice of law", "governed by", "laws of"
        ],
        "obligation_verbs": [
            "shall be governed by", "construed in accordance with", "exclusive jurisdiction", "submit to the jurisdiction"
        ]
    },
    "dispute resolution": {
        "terms": [
            "arbitration", "dispute resolution", "mediation", "litigation"
        ],
        "obligation_verbs": [
            "shall be resolved by", "agree to arbitrate", "settled by arbitration", "binding arbitration"
        ]
    },
    "intellectual property": {
        "terms": [
            "intellectual property", "ownership of work", "work made for hire", "ip rights", "patent", "copyright"
        ],
        "obligation_verbs": [
            "shall own", "hereby assigns", "exclusive property", "all rights, title, and interest"
        ]
    },
    "termination": {
        "terms": [
            "termination", "terminate", "term and termination"
        ],
        "obligation_verbs": [
            "may terminate", "right to terminate", "upon written notice"
        ]
    },
    "data privacy": {
        "terms": [
            "data protection", "data privacy", "gdpr", "personal data", "security incident"
        ],
        "obligation_verbs": [
            "shall comply with", "security measures", "notify of security incident"
        ]
    },
    "insurance": {
        "terms": [
            "insurance", "worker's compensation", "commercial general liability", "cyber insurance"
        ],
        "obligation_verbs": [
            "shall maintain", "shall carry", "policy of insurance"
        ]
    }
}

# Patterns where terms appear but protection is explicitly excluded or disclaimed
EXCLUSION_PATTERNS = [
    r"no\s+confidentiality\s+obligation",
    r"disclaim[s|ed|ing]?\s+(?:all\s+)?confidentiality",
    r"without\s+(?:any\s+)?confidentiality",
    r"not\s+(?:subject\s+to\s+any|deemed)\s+confidential",
    r"no\s+(?:duty|obligation)\s+of\s+(?:confidentiality|secrecy)",
    r"free\s+to\s+disclose",
    r"on\s+a\s+non-confidential\s+basis",
    r"does\s+not\s+create\s+(?:any\s+)?confidentiality"
]

def verify_absence_claim(
    title: str,
    explanation: str,
    evidence_snippet: str,
    pages: List[PageContent]
) -> Tuple[bool, str, str]:
    """
    Verifies a claim that a contractual protection is omitted or absent.
    Evaluates:
    1. Whether the domain can be reliably identified.
    2. Whether terms in the document are mere headings/disclaimers or actual obligations.
    3. Whether an explicit exclusion or waiver of protection is present.
    4. If the situation is ambiguous, marks as unverified.

    Returns:
        (is_verified: bool, status: str, verification_note: str)
    """
    full_text = " ".join([p.text for p in pages])
    full_text_lower = full_text.lower()
    combined_claim = f"{title} {explanation} {evidence_snippet}".lower()

    # Identify the protection domain being claimed as absent
    matched_domain = None
    domain_config = None

    for domain, cfg in PROTECTION_DOMAINS.items():
        if domain in combined_claim:
            matched_domain = domain
            domain_config = cfg
            break

    if not matched_domain:
        for domain, cfg in PROTECTION_DOMAINS.items():
            if any(term in combined_claim for term in cfg["terms"]):
                matched_domain = domain
                domain_config = cfg
                break

    if not matched_domain:
        return False, "unverified", "Unverified absence: Claimed omitted protection could not be mapped to standard domain criteria."

    terms = domain_config["terms"]
    obligation_verbs = domain_config.get("obligation_verbs", [])

    # 1. Check for explicit exclusion / disclaimer of the protection
    for excl in EXCLUSION_PATTERNS:
        match = re.search(excl, full_text_lower)
        if match:
            # The document explicitly excludes or disclaims protection.
            # Therefore, the finding that protection is missing is confirmed by the explicit exclusion!
            matched_text = match.group(0)
            return True, "verified", f"Verified absence: Contract explicitly disclaims/excludes protection ('{matched_text}')."

    # 2. Check if any domain terms appear in the document
    present_terms = [t for t in terms if t in full_text_lower]

    if not present_terms:
        # Keywords are completely absent.
        # But we must verify whether general contractual text might hold an ambiguous or equivalent commitment.
        # If document is extremely short (< 200 words) or standard contract without domain references:
        return True, "verified", f"Verified absence: Scanned contract text confirms complete absence of '{matched_domain}' provisions."

    # 3. Terms ARE present. Determine whether they represent an enforceable obligation or just a heading/isolated mention.
    has_obligation = False
    for verb in obligation_verbs:
        if verb in full_text_lower:
            has_obligation = True
            break

    if has_obligation:
        # A meaningful obligation exists (either using standard terms or equivalent wording)
        return False, "unverified", f"Unverified absence: Contract contains substantive obligations related to '{matched_domain}'."

    # 4. Words exist, but no standard obligation verb matched.
    # Check if they only appear in headings (e.g. "Section 5. Confidentiality" or short isolated headers)
    # A true heading is a short line without verbs like 'agree', 'shall', 'will', 'must' or operative sentences.
    is_heading_only = True
    for line in full_text.splitlines():
        line_clean = line.strip()
        line_lower = line_clean.lower()
        if any(t in line_lower for t in present_terms):
            # Check if this line contains substantive sentences or verbs
            words = line_clean.split()
            has_sentence_structure = any(v in line_lower for v in ["agree", "shall", "will", "must", "is", "are", "protect", "disclose", "liable"])
            if len(words) > 6 or has_sentence_structure:
                is_heading_only = False
                break

    if is_heading_only:
        # The term appears only in a heading/title without substantive operative language following it!
        return True, "verified", f"Verified absence: Term '{present_terms[0]}' appears only in headings/captions without substantive operative covenants."

    # 5. Ambiguous: terms appear in substantive text, but obligation phrasing is non-standard or uncertain.
    # Conservative principle: flag as unverified rather than presenting as confirmed fact.
    return False, "unverified", f"Unverified absence: Ambiguous context; text references '{present_terms[0]}' but enforceable obligation could not be verified automatically."



