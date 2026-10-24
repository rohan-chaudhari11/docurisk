import unittest
from app.models.schemas import PageContent
from app.services.risk_detector import detect_risks_in_document
from app.services.summarizer import summarize_document
from app.services.diff_engine import compare_documents

class TestAiServices(unittest.TestCase):

    def test_risk_detection_uncapped_indemnity(self):
        text = "Section 14.3. Customer shall defend, indemnify, and hold harmless Provider without limitation as to aggregate damages."
        pages = [PageContent(page_number=1, text=text)]
        findings = detect_risks_in_document(pages, "msa.pdf")
        self.assertGreater(len(findings), 0)
        self.assertEqual(findings[0].severity, "high")
        self.assertIn("indemnif", findings[0].title.lower())
        self.assertTrue(findings[0].is_evidence_verified)
        self.assertEqual(findings[0].evidence_status, "verified")
        self.assertIn("without limitation", findings[0].evidence_snippet)

    def test_unlimited_indemnity_clause_overall_risk_classification(self):
        # Focused regression test for the exact clause from DocuRiskMySQLIntegrationTests
        clause = "Section 14.3. Customer shall defend, indemnify, and hold harmless Provider without limitation as to aggregate damages."
        pages = [PageContent(page_number=1, text=clause)]
        findings = detect_risks_in_document(pages, "indemnity_contract.txt")
        self.assertTrue(any(f.severity.lower() == "high" and "indemn" in f.title.lower() for f in findings))
        summary = summarize_document("indemnity_contract.txt", pages, findings)
        self.assertGreater(summary.risk_counts.high, 0)
        overall_risk = "high" if summary.risk_counts.high > 0 else ("medium" if summary.risk_counts.medium > 0 else "low")
        self.assertEqual(overall_risk, "high")

    def test_summarization_scoring(self):
        text = "Section 18.2. Provider may terminate for convenience upon 15 days notice without cause."
        pages = [PageContent(page_number=1, text=text)]
        findings = detect_risks_in_document(pages, "sample.docx")
        summary = summarize_document("sample.docx", pages, findings)
        self.assertGreater(summary.compliance_score, 0)
        self.assertLessEqual(summary.compliance_score, 100)
        self.assertGreater(len(summary.key_obligations), 0)
        self.assertGreater(len(summary.critical_dates), 0)

    def test_clause_redline_diff(self):
        base = "Section 1. Liability cap shall be equal to twelve months fees paid."
        target = "Section 1. Liability cap shall be $10,000 for Provider, uncapped for Customer."
        diff_res = compare_documents("comp-test", "Test Comparison", base, target)
        self.assertEqual(diff_res.comparison_id, "comp-test")
        self.assertGreaterEqual(diff_res.total_changes, 1)
        self.assertEqual(diff_res.diffs[0].diff_type, "modified")

if __name__ == "__main__":
    unittest.main()
