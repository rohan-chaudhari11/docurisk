import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.llm_provider import RuleBasedFallbackProvider

client = TestClient(app)

@pytest.fixture(autouse=True)
def ensure_deterministic_unit_tests(monkeypatch):
    """Guarantees unit tests run offline and deterministically without live Gemini calls."""
    from app.services import llm_provider
    monkeypatch.setattr(llm_provider, "get_llm_provider", lambda: RuleBasedFallbackProvider())

def test_health_endpoint():
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DocuRisk AI" in data["service"]

def test_analyze_text_with_uncapped_indemnity():
    sample_clause = (
        "Section 14.3. Customer shall defend, indemnify, and hold harmless Provider without limitation as to aggregate damages."
    )
    payload = {
        "text": sample_clause,
        "filename": "test-indemnity.txt"
    }
    response = client.post("/api/ai/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk_level"] == "high"
    assert len(data["findings"]) > 0
    # Check that evidence snippet and clause reference exist
    first_finding = data["findings"][0]
    assert "indemnif" in first_finding["title"].lower() or "indemnif" in first_finding["explanation"].lower()
    assert first_finding["evidence_snippet"] != ""

def test_diff_endpoint():
    payload = {
        "comparison_id": "comp-unit-test",
        "title": "Unit Test Comparison",
        "base_text": "Section 1. Liability shall be capped at twelve months fees.",
        "target_text": "Section 1. Liability shall be capped at $5,000 for Vendor.",
        "base_label": "v1.0",
        "target_label": "v2.0"
    }
    response = client.post("/api/ai/diff", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["comparison_id"] == "comp-unit-test"
    assert data["total_changes"] >= 1
    assert data["diffs"][0]["diff_type"] == "modified"

def test_analyze_empty_text():
    payload = {
        "text": "",
        "filename": "empty.txt"
    }
    response = client.post("/api/ai/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_risk_level"] == "low"
    assert len(data["findings"]) > 0
    assert "General Commercial Baseline" in data["findings"][0]["title"]

def test_diff_identical_text():
    same_text = "Section 1. Both parties agree to standard terms and conditions."
    payload = {
        "comparison_id": "comp-same",
        "title": "Identical Text",
        "base_text": same_text,
        "target_text": same_text
    }
    response = client.post("/api/ai/diff", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_changes"] == 0

def test_upload_file_analyze_endpoint():
    file_bytes = b"Section 18.2. Provider may terminate for convenience upon 15 days notice without cause."
    files = {"file": ("contract-term.txt", file_bytes, "text/plain")}
    response = client.post("/api/ai/analyze", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "contract-term.txt"
    assert data["file_type"] == "txt"
    assert len(data["findings"]) > 0
    assert any("terminat" in f["title"].lower() for f in data["findings"])
