package com.docurisk.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(AiIntegrationService.class);

    private final RestClient restClient;

    @Autowired
    public AiIntegrationService(RestClient aiRestClient) {
        this.restClient = aiRestClient;
    }

    /**
     * Checks if the Python FastAPI AI microservice is reachable and healthy.
     */
    public boolean isAiServiceHealthy() {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/api/ai/health")
                    .retrieve()
                    .body(Map.class);
            return response != null && "healthy".equalsIgnoreCase(String.valueOf(response.get("status")));
        } catch (Exception e) {
            log.warn("AI Service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Forwards an uploaded file to the Python FastAPI AI service for end-to-end analysis.
     */
    public Map<String, Object> analyzeDocumentFile(String filename, byte[] fileBytes) {
        try {
            org.springframework.http.HttpHeaders fileHeaders = new org.springframework.http.HttpHeaders();
            fileHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            fileHeaders.setContentDisposition(
                    org.springframework.http.ContentDisposition.formData().name("file").filename(filename).build()
            );
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
            org.springframework.http.HttpEntity<ByteArrayResource> filePart =
                    new org.springframework.http.HttpEntity<>(fileResource, fileHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", filePart);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/api/ai/analyze")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return response;
        } catch (Exception e) {
            log.error("Failed to call AI Service analyze endpoint: {}", e.getMessage());
            return null;
        }
    }
}
