package com.docurisk.backend;

import com.docurisk.backend.model.dto.DashboardStatsDTO;
import com.docurisk.backend.model.dto.DocumentDTO;
import com.docurisk.backend.model.dto.VersionComparisonDTO;
import com.docurisk.backend.model.entity.*;
import com.docurisk.backend.repository.*;
import com.docurisk.backend.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class DocuRiskBackendApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private RiskFindingRepository riskFindingRepository;

    @Autowired
    private DocumentComparisonRepository comparisonRepository;

    @Autowired
    private ClauseDiffRepository clauseDiffRepository;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private com.docurisk.backend.service.AiIntegrationService aiIntegrationService;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api";
    }

    @BeforeEach
    void setUpTestData() {
        clauseDiffRepository.deleteAll();
        comparisonRepository.deleteAll();
        riskFindingRepository.deleteAll();
        documentRepository.deleteAll();

        // Seed 1 test document
        DocumentEntity doc = new DocumentEntity();
        doc.setId("doc-test-1");
        doc.setName("Test Master Services Agreement.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(1024000L);
        doc.setStatus("analyzed");
        doc.setOverallRiskLevel("high");
        doc.setComplianceScore(72);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Executive summary for test agreement with indemnification exposure.");
        summary.setComplianceScore(72);
        summary.setHighRiskCount(1);
        summary.setMediumRiskCount(1);
        summary.setLowRiskCount(0);
        summary.setTotalRisks(2);
        doc.setSummary(summary);

        doc.getObligations().add(new KeyObligationEntity(doc, "Maintain $5M commercial general liability insurance.", 1));
        doc.getCriticalDates().add(new CriticalDateEntity(doc, "Effective Date", "Jan 1, 2025", 1));

        RiskFindingEntity finding = new RiskFindingEntity();
        finding.setId("find-test-1");
        finding.setDocument(doc);
        finding.setTitle("Uncapped Indemnification Obligation");
        finding.setSeverity("high");
        finding.setCategory("Legal Liability");
        finding.setClauseReference("Section 14.3");
        finding.setExplanation("Customer indemnifies vendor without financial cap.");
        finding.setEvidenceSnippet("Customer shall defend and hold harmless Provider without limitation.");
        finding.setRecommendation("Add a 12-month fee cap.");
        finding.setPageNumber(2);
        doc.getFindings().add(finding);

        documentRepository.save(doc);

        // Seed 1 test comparison
        DocumentComparisonEntity comp = new DocumentComparisonEntity();
        comp.setId("comp-test-1");
        comp.setTitle("MSA Version 1 vs Version 2");
        comp.setBaseVersionLabel("v1.0");
        comp.setTargetVersionLabel("v2.0");

        ClauseDiffEntity diff = new ClauseDiffEntity();
        diff.setId("diff-test-1");
        diff.setComparison(comp);
        diff.setClauseTitle("Section 11.2 - Limitation of Liability");
        diff.setDiffType("modified");
        diff.setSeverity("high");
        diff.setOldText("Mutual 12 months fee cap.");
        diff.setNewText("Vendor cap is $50,000; customer liability uncapped.");
        diff.setRiskAssessment("Shifts liability disproportionately to customer.");
        diff.setSortOrder(1);
        comp.getDiffs().add(diff);

        comparisonRepository.save(comp);
    }

    @Test
    void testHealthEndpoint() {
        ResponseEntity<Map> response = restTemplate.getForEntity(getBaseUrl() + "/health", Map.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("UP", response.getBody().get("status"));
        assertTrue(response.getBody().containsKey("service"));
    }

    @Test
    void testGetDocumentsEndpoint() {
        ResponseEntity<List<DocumentDTO>> response = restTemplate.exchange(
                getBaseUrl() + "/documents",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<DocumentDTO>>() {}
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        DocumentDTO doc = response.getBody().get(0);
        assertEquals("doc-test-1", doc.getId());
        assertEquals("high", doc.getOverallRiskLevel());
        assertNotNull(doc.getSummary());
        assertEquals(72, doc.getSummary().getComplianceScore());
    }

    @Test
    void testGetDocumentByIdEndpoint() {
        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/doc-test-1",
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Master Services Agreement.pdf", response.getBody().getName());
        assertEquals(1, response.getBody().getFindings().size());
        assertEquals("Uncapped Indemnification Obligation", response.getBody().getFindings().get(0).getTitle());
    }

    @Test
    void testDashboardStatsEndpoint() {
        ResponseEntity<DashboardStatsDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/stats",
                DashboardStatsDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        DashboardStatsDTO stats = response.getBody();
        assertEquals(1, stats.getTotalDocuments());
        assertEquals(1, stats.getHighRiskCount());
        assertEquals(72, stats.getAvgComplianceScore());
        assertNotNull(stats.getRiskDistribution());
    }

    @Test
    void testGetComparisonsEndpoint() {
        ResponseEntity<List<VersionComparisonDTO>> response = restTemplate.exchange(
                getBaseUrl() + "/comparisons",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<VersionComparisonDTO>>() {}
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        VersionComparisonDTO comp = response.getBody().get(0);
        assertEquals("comp-test-1", comp.getId());
        assertEquals(1, comp.getDiffs().size());
        assertEquals("Section 11.2 - Limitation of Liability", comp.getDiffs().get(0).getClauseTitle());
        // Verify frontend alias getters
        assertEquals("Section 11.2 - Limitation of Liability", comp.getDiffs().get(0).getSectionTitle());
        assertNotNull(comp.getDiffs().get(0).getRiskImpact());
    }

    @Test
    void testUploadDocumentLiveIntegration() {
        org.junit.jupiter.api.Assumptions.assumeTrue(
                aiIntegrationService.isAiServiceHealthy(),
                "Skipping live AI integration upload test: local AI service is not reachable on port 8000."
        );
        org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
        org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(
                ("Section 14.3. Customer shall defend, indemnify, and hold harmless Provider without limitation as to aggregate damages.\n" +
                 "Section 18.2. Provider may terminate for convenience upon 15 days notice without cause.").getBytes(java.nio.charset.StandardCharsets.UTF_8)
        ) {
            @Override
            public String getFilename() {
                return "e2e-test-contract.txt";
            }
        };
        body.add("file", fileResource);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity =
                new org.springframework.http.HttpEntity<>(body, headers);

        ResponseEntity<com.docurisk.backend.model.dto.UploadResponseDTO> response = restTemplate.postForEntity(
                getBaseUrl() + "/documents/upload",
                requestEntity,
                com.docurisk.backend.model.dto.UploadResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        com.docurisk.backend.model.dto.DocumentDTO doc = response.getBody().getDocument();
        assertNotNull(doc);
        assertEquals("analyzed", doc.getStatus());
        assertEquals("high", doc.getOverallRiskLevel());
        assertNotNull(doc.getSummary());
        assertTrue(doc.getSummary().getComplianceScore() > 0);
        assertNotNull(doc.getFindings());
        assertFalse(doc.getFindings().isEmpty(), "Findings should be populated and persisted");

        // Verify retrieval of report via GET /api/documents/{id}
        ResponseEntity<DocumentDTO> getResponse = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + doc.getId(),
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertNotNull(getResponse.getBody());
        assertEquals(doc.getId(), getResponse.getBody().getId());
        assertEquals("e2e-test-contract.txt", getResponse.getBody().getName());
        assertEquals("analyzed", getResponse.getBody().getStatus());
    }

    @Test
    void testUploadEmptyFileRejection() {
        org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
        org.springframework.core.io.ByteArrayResource emptyResource = new org.springframework.core.io.ByteArrayResource(new byte[0]) {
            @Override
            public String getFilename() {
                return "empty_file.pdf";
            }
        };
        body.add("file", emptyResource);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity =
                new org.springframework.http.HttpEntity<>(body, headers);

        ResponseEntity<com.docurisk.backend.model.dto.UploadResponseDTO> response = restTemplate.postForEntity(
                getBaseUrl() + "/documents/upload",
                requestEntity,
                com.docurisk.backend.model.dto.UploadResponseDTO.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().toLowerCase().contains("empty"));
    }

    @Test
    void testUploadUnsupportedExtensionRejection() {
        org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
        org.springframework.core.io.ByteArrayResource scriptResource = new org.springframework.core.io.ByteArrayResource("malicious script".getBytes()) {
            @Override
            public String getFilename() {
                return "malicious_script.exe";
            }
        };
        body.add("file", scriptResource);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity =
                new org.springframework.http.HttpEntity<>(body, headers);

        ResponseEntity<com.docurisk.backend.model.dto.UploadResponseDTO> response = restTemplate.postForEntity(
                getBaseUrl() + "/documents/upload",
                requestEntity,
                com.docurisk.backend.model.dto.UploadResponseDTO.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().toLowerCase().contains("unsupported"));
    }

    @Test
    void testGetComparisonById() {
        ResponseEntity<VersionComparisonDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/comparisons/comp-test-1",
                VersionComparisonDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("comp-test-1", response.getBody().getId());
        assertEquals("v1.0", response.getBody().getBaseVersionLabel());
        assertEquals("v2.0", response.getBody().getTargetVersionLabel());
        assertEquals(1, response.getBody().getDiffs().size());
        assertEquals("modified", response.getBody().getDiffs().get(0).getDiffType());
    }

    @Test
    void testLegacyDocumentReturnsUnknownProviderStatus() {
        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/doc-test-1",
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSummary());
        assertEquals("legacy", response.getBody().getSummary().getExecutionStatus());
        assertEquals("Provider status unknown — legacy analysis", response.getBody().getSummary().getStatusMessage());
    }

    @Test
    void testProviderMetadataPersistenceAndRetrieval() {
        String docId = "doc-prov-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Gemini Analyzed Contract.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(50000L);
        doc.setStatus("analyzed");
        doc.setOverallRiskLevel("medium");
        doc.setComplianceScore(85);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Executive summary generated by Gemini.");
        summary.setComplianceScore(85);
        summary.setHighRiskCount(0);
        summary.setMediumRiskCount(1);
        summary.setLowRiskCount(1);
        summary.setTotalRisks(2);
        summary.setActualProvider("gemini");
        summary.setExecutionStatus("completed");
        summary.setStatusMessage("Successfully analyzed via Gemini.");
        summary.setModelName("gemini-2.5-flash");
        doc.setSummary(summary);

        RiskFindingEntity finding = new RiskFindingEntity();
        finding.setId("find-prov-1");
        finding.setDocument(doc);
        finding.setTitle("Termination for Convenience Disparity");
        finding.setSeverity("medium");
        finding.setCategory("Termination");
        finding.setClauseReference("Section 9.1");
        finding.setExplanation("Provider has 30 days notice; client has no convenience termination.");
        finding.setEvidenceSnippet("Provider may terminate for convenience upon thirty (30) days written notice.");
        finding.setRecommendation("Add mutual termination rights.");
        finding.setPageNumber(1);
        finding.setFindingSource("llm");
        finding.setIsEvidenceVerified(true);
        finding.setEvidenceStatus("verified");
        doc.getFindings().add(finding);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSummary());
        assertEquals("gemini", response.getBody().getSummary().getActualProvider());
        assertEquals("completed", response.getBody().getSummary().getExecutionStatus());
        assertEquals("gemini-2.5-flash", response.getBody().getSummary().getModelName());
        assertEquals("Successfully analyzed via Gemini.", response.getBody().getSummary().getStatusMessage());

        assertNotNull(response.getBody().getFindings());
        assertEquals(1, response.getBody().getFindings().size());
        assertEquals("llm", response.getBody().getFindings().get(0).getFindingSource());
        assertEquals(Boolean.TRUE, response.getBody().getFindings().get(0).getIsEvidenceVerified());
        assertEquals("verified", response.getBody().getFindings().get(0).getEvidenceStatus());
    }

    @Test
    void testFallbackProviderMetadataPersistenceAndRetrieval() {
        String docId = "doc-fallback-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Fallback Contract.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(40000L);
        doc.setStatus("analyzed");
        doc.setOverallRiskLevel("high");
        doc.setComplianceScore(65);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Baseline rule summary used after rate limit.");
        summary.setComplianceScore(65);
        summary.setHighRiskCount(1);
        summary.setMediumRiskCount(0);
        summary.setLowRiskCount(0);
        summary.setTotalRisks(1);
        summary.setActualProvider("rule");
        summary.setExecutionStatus("fallback");
        summary.setStatusMessage("LLM rate limit reached (HTTP 429); utilized rule-based legal engine.");
        summary.setModelName("gemini-2.5-flash");
        doc.setSummary(summary);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSummary());
        assertEquals("rule", response.getBody().getSummary().getActualProvider());
        assertEquals("fallback", response.getBody().getSummary().getExecutionStatus());
        assertTrue(response.getBody().getSummary().getStatusMessage().contains("HTTP 429"));
        assertEquals("gemini-2.5-flash", response.getBody().getSummary().getModelName());
    }

    @Test
    void testRuleOnlyProviderMetadataPersistenceAndRetrieval() {
        String docId = "doc-rule-only-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Rule Only Contract.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(30000L);
        doc.setStatus("analyzed");
        doc.setOverallRiskLevel("medium");
        doc.setComplianceScore(80);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Deterministic rule baseline summary.");
        summary.setComplianceScore(80);
        summary.setHighRiskCount(0);
        summary.setMediumRiskCount(1);
        summary.setLowRiskCount(0);
        summary.setTotalRisks(1);
        summary.setActualProvider("rule");
        summary.setExecutionStatus("rule_only");
        summary.setStatusMessage("Deterministic rule engine utilized (no remote AI provider configured).");
        summary.setModelName(null);
        doc.setSummary(summary);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSummary());
        assertEquals("rule", response.getBody().getSummary().getActualProvider());
        assertEquals("rule_only", response.getBody().getSummary().getExecutionStatus());
        assertNull(response.getBody().getSummary().getModelName());
        assertTrue(response.getBody().getSummary().getStatusMessage().contains("no remote AI provider configured"));
    }

    @Test
    void testPartialProviderMetadataPersistenceAndRetrieval() {
        String docId = "doc-partial-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Partial Hybrid Contract.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(45000L);
        doc.setStatus("analyzed");
        doc.setOverallRiskLevel("high");
        doc.setComplianceScore(70);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Hybrid summary with AI obligations and rule baseline.");
        summary.setComplianceScore(70);
        summary.setHighRiskCount(1);
        summary.setMediumRiskCount(0);
        summary.setLowRiskCount(0);
        summary.setTotalRisks(1);
        summary.setActualProvider("gemini");
        summary.setExecutionStatus("partial");
        summary.setStatusMessage("Executive summary completed via Gemini, but risk detection fell back: Timeout.");
        summary.setModelName("gemini-3.8-flash");
        doc.setSummary(summary);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSummary());
        assertEquals("gemini", response.getBody().getSummary().getActualProvider());
        assertEquals("partial", response.getBody().getSummary().getExecutionStatus());
        assertEquals("gemini-3.8-flash", response.getBody().getSummary().getModelName());
        assertTrue(response.getBody().getSummary().getStatusMessage().contains("risk detection fell back"));
    }

    @Test
    void testFailedHistoricalDocumentWithNullProviderMetadata() {
        String docId = "doc-hist-failed-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Historical Failed Agreement.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(12000L);
        doc.setStatus("failed"); // Backend document processing status
        doc.setOverallRiskLevel("medium");
        doc.setComplianceScore(0);
        doc.setUploadedAt(LocalDateTime.now().minusDays(10));

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Historical ingestion failure summary.");
        summary.setComplianceScore(0);
        summary.setTotalRisks(0);
        summary.setHighRiskCount(0);
        summary.setMediumRiskCount(0);
        summary.setLowRiskCount(0);
        // Null provider metadata (pre-dates provider tracking)
        summary.setActualProvider(null);
        summary.setExecutionStatus(null);
        summary.setStatusMessage(null);
        summary.setModelName(null);
        doc.setSummary(summary);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        // 1. Backend document processing status is preserved as "failed"
        assertEquals("failed", response.getBody().getStatus());

        // 2. Provider execution status is labeled "legacy" (not confirmed provider failure)
        assertNotNull(response.getBody().getSummary());
        assertEquals("legacy", response.getBody().getSummary().getExecutionStatus());
        assertNull(response.getBody().getSummary().getActualProvider());
        assertNotNull(response.getBody().getSummary().getStatusMessage());
        assertTrue(response.getBody().getSummary().getStatusMessage().contains("Provider status unknown"));
    }

    @Test
    void testConfirmedNewProviderFailure() {
        String docId = "doc-new-failed-test";
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setName("Confirmed Provider Failure Contract.pdf");
        doc.setFileType("pdf");
        doc.setFileSizeBytes(15000L);
        doc.setStatus("failed");
        doc.setOverallRiskLevel("medium");
        doc.setComplianceScore(0);
        doc.setUploadedAt(LocalDateTime.now());

        AnalysisSummaryEntity summary = new AnalysisSummaryEntity();
        summary.setExecutiveSummary("Document metadata recorded, but text extraction or risk analysis failed because the AI service is offline or unreachable.");
        summary.setComplianceScore(0);
        summary.setTotalRisks(0);
        summary.setHighRiskCount(0);
        summary.setMediumRiskCount(0);
        summary.setLowRiskCount(0);
        summary.setActualProvider("none");
        summary.setExecutionStatus("failed"); // Confirmed new provider failure
        summary.setStatusMessage("AI service unreachable or returned HTTP error.");
        summary.setModelName(null);
        doc.setSummary(summary);

        documentRepository.save(doc);

        ResponseEntity<DocumentDTO> response = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        // 1. Both document status and provider status reflect confirmed failure
        assertEquals("failed", response.getBody().getStatus());
        assertNotNull(response.getBody().getSummary());
        assertEquals("failed", response.getBody().getSummary().getExecutionStatus());
        assertEquals("none", response.getBody().getSummary().getActualProvider());
        assertEquals("AI service unreachable or returned HTTP error.", response.getBody().getSummary().getStatusMessage());
    }
}
