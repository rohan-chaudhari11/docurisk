package com.docurisk.backend;

import com.docurisk.backend.model.dto.DocumentDTO;
import com.docurisk.backend.model.dto.UploadResponseDTO;
import com.docurisk.backend.model.entity.DocumentEntity;
import com.docurisk.backend.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.test.context.TestPropertySource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Dedicated Real MySQL Integration Test Suite.
 * Only enabled when RUN_MYSQL_TESTS=true is set in the environment,
 * preventing build breaks when external MySQL is unconfigured.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-mysql.properties")
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_TESTS", matches = "true")
class DocuRiskMySQLIntegrationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private com.docurisk.backend.service.AiIntegrationService aiIntegrationService;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api";
    }

    @Test
    void testRealMySqlDocumentPersistenceAndRetrieval() {
        org.junit.jupiter.api.Assumptions.assumeTrue(
                aiIntegrationService.isAiServiceHealthy(),
                "Skipping live AI extraction test because FastAPI microservice is offline on port 8000."
        );
        String testDocName = "mysql-audit-contract-" + System.currentTimeMillis() + ".txt";
        String sampleText = "Section 14.3. Customer shall defend, indemnify, and hold harmless Provider without limitation as to aggregate damages.";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(sampleText.getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() {
                return testDocName;
            }
        };
        body.add("file", fileResource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 1. Upload & Process against live MySQL
        ResponseEntity<UploadResponseDTO> uploadRes = restTemplate.postForEntity(
                getBaseUrl() + "/documents/upload",
                requestEntity,
                UploadResponseDTO.class
        );

        assertEquals(HttpStatus.CREATED, uploadRes.getStatusCode());
        assertNotNull(uploadRes.getBody());
        DocumentDTO uploadedDoc = uploadRes.getBody().getDocument();
        assertNotNull(uploadedDoc);
        String docId = uploadedDoc.getId();

        // 2. Direct MySQL entity verification
        Optional<DocumentEntity> inDb = documentRepository.findById(docId);
        assertTrue(inDb.isPresent(), "Document must be persisted directly in MySQL");
        assertEquals(testDocName, inDb.get().getName());
        assertEquals("high", inDb.get().getOverallRiskLevel());
        assertNotNull(inDb.get().getSummary());

        // 3. API Retrieval verification
        ResponseEntity<DocumentDTO> getRes = restTemplate.getForEntity(
                getBaseUrl() + "/documents/" + docId,
                DocumentDTO.class
        );
        assertEquals(HttpStatus.OK, getRes.getStatusCode());
        assertNotNull(getRes.getBody());
        assertEquals(docId, getRes.getBody().getId());
        assertEquals(testDocName, getRes.getBody().getName());

        // 4. Persistence verification: verify findings exist in MySQL
        assertNotNull(getRes.getBody().getFindings());
        assertFalse(getRes.getBody().getFindings().isEmpty(), "Findings must be persisted in MySQL risk_findings table");
    }
}
